import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let staffToken: string;

let testCompanyId: string;
let testBranchId: string;
let testCustomerId: string;
let testInventoryItemId: string;

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, body: data as any });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('RUNNING PHASE 6.3 GIRVI SETTLEMENT & JEWELLERY RELEASE TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Auth Setup
    console.log('\n[TEST] 1. Auth Setup & Token Retrieval...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login failed');
    ownerToken = ownerRes.body.data.accessToken;

    const staffRes = await request('POST', '/auth/login', {
      email: 'staff@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(staffRes.status, 200, 'Staff login failed');
    staffToken = staffRes.body.data.accessToken;

    const company = await prisma.company.findFirst();
    assert.ok(company, 'Seed company must exist');
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(branch, 'Seed branch must exist');
    testBranchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(customer, 'Seed customer must exist');
    testCustomerId = customer.id;

    const inventoryItem = await prisma.inventoryItem.findFirst({ where: { branchId: testBranchId } });
    assert.ok(inventoryItem, 'Seed inventory item must exist');
    testInventoryItemId = inventoryItem.id;

    // Mark inventory item status as PLEDGED for testing
    await prisma.inventoryItem.update({
      where: { id: testInventoryItemId },
      data: { status: 'PLEDGED' as any },
    });

    // 2. Unauthenticated Security Check (401)
    console.log('\n[TEST] 2. Security Check (Unauthenticated request should fail with 401)...');
    const unauthRes = await request('POST', '/girvi/loans/some-id/settle', { paymentMethod: 'CASH' });
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] Security check passed');

    // 3. Create Active Girvi Loan with Pledged Inventory Item
    console.log('\n[TEST] 3. Creating Girvi Loan with Pledged Inventory Item...');
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 3);

    const loanRes = await request(
      'POST',
      '/girvi/loans',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        customerId: testCustomerId,
        dueDate: dueDate.toISOString(),
        principalAmount: 50000,
        valuationAmount: 70000,
        interestRate: 2.0,
        interestPeriod: 'MONTHLY',
        notes: 'Settlement Test Loan with Linked Inventory Item',
        collaterals: [
          {
            inventoryItemId: testInventoryItemId,
            itemName: '22K Gold Bangle Set',
            grossWeight: 12.000,
            netWeight: 12.000,
            valuedAmount: 70000,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(loanRes.status, 201, `Loan creation failed: ${JSON.stringify(loanRes.body)}`);
    const loanId = loanRes.body.data.id;
    console.log(`[PASS] Created Girvi Loan ID=${loanId}`);

    // Set loan date to 30 days ago to generate accrued interest
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await prisma.girviLoan.update({
      where: { id: loanId },
      data: { loanDate: thirtyDaysAgo },
    });

    // 4. Check Financial Summary Before Settlement
    console.log('\n[TEST] 4. Fetching Financial Summary Before Settlement...');
    const summaryRes = await request('GET', `/girvi/loans/${loanId}/financial-summary`, undefined, ownerToken);
    assert.strictEqual(summaryRes.status, 200);
    const summary = summaryRes.body.data;
    assert.strictEqual(summary.principalOutstanding, 50000);
    assert.strictEqual(summary.accruedInterest, 1000); // 30 days at 2.0%/month on 50,000 = 1,000
    assert.strictEqual(summary.totalOutstanding, 51000);
    console.log(`[PASS] Financial Summary Verified: Total Outstanding = ₹${summary.totalOutstanding}`);

    // 5. Test Invalid Settlement Amount Validation Guard
    console.log('\n[TEST] 5. Testing Settlement Amount Mismatch Guard...');
    const mismatchRes = await request(
      'POST',
      `/girvi/loans/${loanId}/settle`,
      {
        paymentMethod: 'CASH',
        totalSettlementAmount: 40000, // Incorrect amount
      },
      ownerToken
    );
    assert.strictEqual(mismatchRes.status, 400, 'Settlement amount mismatch should return 400');
    console.log('[PASS] Incorrect settlement amount correctly blocked with 400 Bad Request');

    // 6. Execute Atomic Full Settlement & Jewellery Release
    console.log('\n[TEST] 6. Executing Full Settlement & Jewellery Release...');
    const settleRes = await request(
      'POST',
      `/girvi/loans/${loanId}/settle`,
      {
        paymentMethod: 'UPI',
        transactionReference: 'SETTLE-UPI-998877',
        remarks: 'Full settlement paid by customer in store',
      },
      ownerToken
    );
    assert.strictEqual(settleRes.status, 200, `Settlement failed: ${JSON.stringify(settleRes.body)}`);
    const settlement = settleRes.body.data;
    assert.ok(settlement.settlementNumber.startsWith('SETTLE-'), 'Settlement number format valid');
    assert.strictEqual(Number(settlement.totalSettlementAmount), 51000, 'Total settlement amount mismatch');

    assert.strictEqual(settlement.girviLoan.status, 'CLOSED', 'Loan status must transition to CLOSED');
    console.log(`[PASS] Loan Settled Successfully: Settlement Number = ${settlement.settlementNumber}`);

    // 7. Verify Collateral Release & Inventory Status Update
    console.log('\n[TEST] 7. Verifying Collateral Release & Stock Movement...');
    const releasedColRes = await request('GET', `/girvi/loans/${loanId}/released-collateral`, undefined, ownerToken);
    assert.strictEqual(releasedColRes.status, 200);
    assert.strictEqual(releasedColRes.body.data.length, 1);
    assert.strictEqual(releasedColRes.body.data[0].isReleased, true);
    console.log('[PASS] Collateral marked as released');

    const updatedInvItem = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    assert.strictEqual(updatedInvItem?.status, 'AVAILABLE', 'Inventory item status must be restored to AVAILABLE');
    console.log('[PASS] Linked InventoryItem status restored to AVAILABLE');

    const stockMovement = await prisma.stockMovement.findFirst({
      where: {
        inventoryItemId: testInventoryItemId,
        movementType: 'GIRVI_RELEASE',
      },
    });
    assert.ok(stockMovement, 'StockMovement record for GIRVI_RELEASE must exist');
    assert.strictEqual(stockMovement.referenceType, 'GIRVI_SETTLEMENT');
    console.log(`[PASS] Immutable StockMovement created with type GIRVI_RELEASE (ID=${stockMovement.id})`);

    // 8. Test Double Settlement Concurrency Protection Guard
    console.log('\n[TEST] 8. Testing Double Settlement Protection Guard...');
    const dupSettleRes = await request(
      'POST',
      `/girvi/loans/${loanId}/settle`,
      {
        paymentMethod: 'CASH',
      },
      ownerToken
    );
    assert.strictEqual(dupSettleRes.status, 409, 'Duplicate settlement attempt on closed loan must return 409 Conflict');
    console.log('[PASS] Duplicate settlement correctly rejected with 409 Conflict');

    // 9. Query Settlement Retrieval APIs
    console.log('\n[TEST] 9. Testing Settlement Retrieval APIs...');
    const listSettleRes = await request('GET', '/girvi/settlements', undefined, ownerToken);
    assert.strictEqual(listSettleRes.status, 200);
    assert.ok(Array.isArray(listSettleRes.body.data));

    const loanSettleRes = await request('GET', `/girvi/loans/${loanId}/settlement`, undefined, ownerToken);
    assert.strictEqual(loanSettleRes.status, 200);
    assert.strictEqual(loanSettleRes.body.data.id, settlement.id);
    console.log('[PASS] Settlement retrieval APIs verified');

    console.log('\n======================================================');
    console.log('✓ ALL PHASE 6.3 GIRVI SETTLEMENT & RELEASE TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[FAIL] Test execution failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runTests();
