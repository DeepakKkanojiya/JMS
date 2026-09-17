import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5097;
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
  console.log('RUNNING PHASE 6.1 SELF GIRVI FOUNDATION TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Authentication
    console.log('\n[TEST] 1. Authentication & Role Tokens...');
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

    // Fetch prerequisite test entities from seed data
    const company = await prisma.company.findFirst();
    assert.ok(company, 'Seed company must exist');
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(branch, 'Seed branch must exist');
    testBranchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(customer, 'Seed customer must exist');
    testCustomerId = customer.id;

    const invItem = await prisma.inventoryItem.findFirst({ where: { companyId: testCompanyId } });
    if (invItem) {
      testInventoryItemId = invItem.id;
    }

    console.log(`[TEST] Prerequisites loaded: Company=${testCompanyId}, Branch=${testBranchId}, Customer=${testCustomerId}`);

    // 2. Unauthenticated request check
    console.log('\n[TEST] 2. Security Check (Unauthenticated request should fail with 401)...');
    const unauthRes = await request('GET', '/girvi/loans');
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request should return 401');

    // 3. Create Self Girvi Loan
    console.log('\n[TEST] 3. Create Self Girvi Loan with Collaterals...');
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 6);

    const createPayload = {
      companyId: testCompanyId,
      branchId: testBranchId,
      customerId: testCustomerId,
      dueDate: dueDate.toISOString(),
      principalAmount: 75000,
      valuationAmount: 95000,
      interestRate: 2.0,
      interestPeriod: 'MONTHLY',
      notes: '6-Month Gold Ornament Loan',
      collaterals: [
        {
          inventoryItemId: testInventoryItemId || undefined,
          itemName: '22K Gold Bangle Set',
          metalType: 'GOLD',
          purity: '22K',
          grossWeight: 25.500,
          stoneWeight: 0.500,
          netWeight: 25.000,
          valuedAmount: 95000,
          barcode: 'GIRVI-BC-001',
          rfidEpc: 'GIRVI-RFID-001',
          remarks: 'Good condition antique finish',
        },
      ],
    };

    const createRes = await request('POST', '/girvi/loans', createPayload, ownerToken);
    assert.strictEqual(createRes.status, 201, `Create Girvi loan failed: ${JSON.stringify(createRes.body)}`);
    assert.ok(createRes.body.data.id, 'Created loan must have ID');
    assert.ok(createRes.body.data.loanNumber.startsWith('GL-'), 'Loan number must follow GL- format');
    const girviLoanId = createRes.body.data.id;
    const loanNumber = createRes.body.data.loanNumber;
    console.log(`[PASS] Girvi Loan created: ID=${girviLoanId}, LoanNumber=${loanNumber}`);

    // 4. Get Girvi Loan Details
    console.log('\n[TEST] 4. Fetch Girvi Loan details by ID...');
    const getRes = await request('GET', `/girvi/loans/${girviLoanId}`, undefined, ownerToken);
    assert.strictEqual(getRes.status, 200, 'Failed to fetch Girvi loan details');
    assert.strictEqual(getRes.body.data.loanNumber, loanNumber);
    assert.strictEqual(getRes.body.data.collaterals.length, 1);
    console.log('[PASS] Girvi loan details & collateral verified');

    // 5. List Girvi Loans with filters
    console.log('\n[TEST] 5. List Girvi Loans with pagination...');
    const listRes = await request('GET', `/girvi/loans?branchId=${testBranchId}&status=ACTIVE`, undefined, ownerToken);
    assert.strictEqual(listRes.status, 200, 'Failed to list Girvi loans');
    assert.ok(Array.isArray(listRes.body.data), 'Data must be an array');
    assert.ok(listRes.body.pagination, 'Pagination metadata must be present');
    console.log(`[PASS] List retrieved ${listRes.body.data.length} loans`);

    // 6. Update Girvi Loan Details
    console.log('\n[TEST] 6. Update Girvi Loan details...');
    const updateRes = await request(
      'PUT',
      `/girvi/loans/${girviLoanId}`,
      {
        notes: 'Updated: 6-Month Gold Ornament Loan - Verified by Owner',
        valuationAmount: 100000,
      },
      ownerToken
    );
    assert.strictEqual(updateRes.status, 200, 'Failed to update Girvi loan');
    assert.strictEqual(updateRes.body.data.notes, 'Updated: 6-Month Gold Ornament Loan - Verified by Owner');
    console.log('[PASS] Girvi loan updated successfully');

    // 7. Add Additional Collateral
    console.log('\n[TEST] 7. Add Additional Collateral to Loan...');
    const addColRes = await request(
      'POST',
      `/girvi/loans/${girviLoanId}/collaterals`,
      {
        itemName: 'Silver Coin 50g',
        metalType: 'SILVER',
        purity: '999',
        grossWeight: 50.000,
        netWeight: 50.000,
        valuedAmount: 4500,
        remarks: 'Pledged as secondary collateral',
      },
      ownerToken
    );
    assert.strictEqual(addColRes.status, 201, 'Failed to add collateral');
    assert.strictEqual(addColRes.body.data.itemName, 'Silver Coin 50g');
    console.log('[PASS] Additional collateral added');

    // 8. Cancel Girvi Loan
    console.log('\n[TEST] 8. Cancel Girvi Loan with reason...');
    const cancelRes = await request(
      'POST',
      `/girvi/loans/${girviLoanId}/cancel`,
      {
        cancellationReason: 'Customer decided to payoff prior to loan start',
      },
      ownerToken
    );
    assert.strictEqual(cancelRes.status, 200, 'Failed to cancel Girvi loan');
    assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
    console.log('[PASS] Girvi loan cancelled successfully');

    console.log('\n======================================================');
    console.log('✓ ALL SPRINT 6.1 SELF GIRVI FOUNDATION TESTS PASSED!');
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
