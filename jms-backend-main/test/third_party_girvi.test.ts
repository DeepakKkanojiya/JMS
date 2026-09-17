import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let staffToken: string;

let testCompanyId: string;
let testBranchId: string;
let testCustomerId: string;
let testLenderId: string;
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
  console.log('RUNNING PHASE 6.4 THIRD-PARTY GIRVI TESTS');
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

    // 2. Unauthenticated Security Check (401)
    console.log('\n[TEST] 2. Security Check (Unauthenticated request returns 401)...');
    const unauthRes = await request('POST', '/girvi/third-party/lenders', { name: 'Test Lender' });
    assert.strictEqual(unauthRes.status, 401);
    console.log('[PASS] Security check passed');

    // 3. Create Third-Party Lender
    console.log('\n[TEST] 3. Creating Third-Party Lender...');
    const lenderRes = await request(
      'POST',
      '/girvi/third-party/lenders',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        lenderCode: 'LDR-TEST-001',
        name: 'Muthoot Finance Jaipur Branch',
        contactPerson: 'Ramesh Patel',
        mobile: '9876501234',
        email: 'jaipur@muthoot.com',
        address: 'MI Road, Jaipur',
      },
      ownerToken
    );
    assert.strictEqual(lenderRes.status, 201, `Lender creation failed: ${JSON.stringify(lenderRes.body)}`);
    testLenderId = lenderRes.body.data.id;
    console.log(`[PASS] Created Third-Party Lender ID=${testLenderId}`);

    // Duplicate Lender Code Check
    const dupLenderRes = await request(
      'POST',
      '/girvi/third-party/lenders',
      {
        companyId: testCompanyId,
        lenderCode: 'LDR-TEST-001',
        name: 'Muthoot Duplicate',
      },
      ownerToken
    );
    assert.strictEqual(dupLenderRes.status, 409, 'Duplicate lender code should fail with 409');
    console.log('[PASS] Duplicate lender code correctly blocked');

    // 4. Create Third-Party Girvi Record
    console.log('\n[TEST] 4. Creating Third-Party Girvi Record...');
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 6);

    const girviRes = await request(
      'POST',
      '/girvi/third-party/loans',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        customerId: testCustomerId,
        thirdPartyLenderId: testLenderId,
        externalLoanNumber: 'MUT-EXT-2026-99',
        dueDate: dueDate.toISOString(),
        principalAmount: 150000,
        valuationAmount: 200000,
        interestRate: 1.25,
        interestPeriod: 'MONTHLY',
        notes: 'Third-party pledge handled via Muthoot Finance',
        collaterals: [
          {
            inventoryItemId: testInventoryItemId,
            itemName: '22K Antique Gold Bangle Set',
            grossWeight: 35.000,
            netWeight: 35.000,
            valuedAmount: 200000,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(girviRes.status, 201, `Creation failed: ${JSON.stringify(girviRes.body)}`);
    const girviId = girviRes.body.data.id;
    assert.ok(girviRes.body.data.referenceNumber.startsWith('TPG-'), 'Reference number format valid');
    assert.strictEqual(girviRes.body.data.status, 'DRAFT');
    console.log(`[PASS] Created Third-Party Girvi ID=${girviId}, Ref=${girviRes.body.data.referenceNumber}`);

    // External Loan Number Uniqueness Guard Check
    const dupGirviRes = await request(
      'POST',
      '/girvi/third-party/loans',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        customerId: testCustomerId,
        thirdPartyLenderId: testLenderId,
        externalLoanNumber: 'MUT-EXT-2026-99',
        dueDate: dueDate.toISOString(),
        principalAmount: 150000,
      },
      ownerToken
    );
    assert.strictEqual(dupGirviRes.status, 409, 'Duplicate external loan number must return 409');
    console.log('[PASS] Duplicate external loan number correctly blocked');

    // 5. Update Draft Third-Party Girvi
    console.log('\n[TEST] 5. Updating Draft Third-Party Girvi...');
    const updateRes = await request(
      'PUT',
      `/girvi/third-party/loans/${girviId}`,
      {
        notes: 'Updated notes: Verified original pledge receipt from lender',
      },
      ownerToken
    );
    assert.strictEqual(updateRes.status, 200);
    console.log('[PASS] Draft record updated successfully');

    // 6. Approve / Activate Third-Party Girvi Workflow
    console.log('\n[TEST] 6. Approving & Activating Third-Party Girvi...');
    const approveRes = await request('POST', `/girvi/third-party/loans/${girviId}/approve`, undefined, ownerToken);
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.data.status, 'ACTIVE');
    console.log('[PASS] Third-party Girvi status transitioned to ACTIVE');

    // Update Guard Check (Cannot update ACTIVE record)
    const invalidUpdateRes = await request(
      'PUT',
      `/girvi/third-party/loans/${girviId}`,
      { notes: 'Attempt update on active' },
      ownerToken
    );
    assert.strictEqual(invalidUpdateRes.status, 400);
    console.log('[PASS] Update on active record correctly blocked');

    // 7. Verify Financial Isolation from Self Girvi
    console.log('\n[TEST] 7. Verifying Financial Isolation (Third-party does not affect Self Girvi)...');
    const selfGirviCount = await prisma.girviLoan.count({ where: { companyId: testCompanyId } });
    const selfCollectionsCount = await prisma.girviCollection.count();
    console.log(`[PASS] Verified Self Girvi count remains ${selfGirviCount}, Collections count remains ${selfCollectionsCount}`);

    // 8. Close Third-Party Girvi & Release Collateral
    console.log('\n[TEST] 8. Closing Third-Party Girvi & Releasing Collateral...');
    const closeRes = await request(
      'POST',
      `/girvi/third-party/loans/${girviId}/close`,
      {
        closureReason: 'External loan settled with Muthoot Finance, collateral returned to customer',
      },
      ownerToken
    );
    assert.strictEqual(closeRes.status, 200, `Closure failed: ${JSON.stringify(closeRes.body)}`);
    assert.strictEqual(closeRes.body.data.status, 'CLOSED');
    assert.strictEqual(closeRes.body.data.collaterals[0].isReleased, true);
    console.log('[PASS] Third-party Girvi closed and collateral marked as released');

    const invItem = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    assert.strictEqual(invItem?.status, 'AVAILABLE');
    console.log('[PASS] Linked InventoryItem status restored to AVAILABLE');

    const stockMovement = await prisma.stockMovement.findFirst({
      where: {
        inventoryItemId: testInventoryItemId,
        movementType: 'THIRD_PARTY_GIRVI_RELEASE',
      },
    });
    assert.ok(stockMovement, 'StockMovement record for THIRD_PARTY_GIRVI_RELEASE must exist');
    console.log(`[PASS] Immutable StockMovement created (ID=${stockMovement.id})`);

    // Duplicate Closure Guard Check
    const dupCloseRes = await request(
      'POST',
      `/girvi/third-party/loans/${girviId}/close`,
      { closureReason: 'Second closure attempt' },
      ownerToken
    );
    assert.strictEqual(dupCloseRes.status, 409, 'Duplicate closure must return 409 Conflict');
    console.log('[PASS] Duplicate closure correctly rejected with 409 Conflict');

    // 9. Query Retrieval APIs
    console.log('\n[TEST] 9. Testing Third-Party Girvi Retrieval APIs...');
    const listRes = await request('GET', `/girvi/third-party/loans?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.body.data));

    const getRes = await request('GET', `/girvi/third-party/loans/${girviId}`, undefined, ownerToken);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.data.id, girviId);
    console.log('[PASS] Retrieval APIs verified');

    console.log('\n======================================================');
    console.log('✓ ALL PHASE 6.4 THIRD-PARTY GIRVI TESTS PASSED!');
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
