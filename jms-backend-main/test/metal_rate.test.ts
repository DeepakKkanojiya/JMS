import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let managerToken: string;
let cashierToken: string;
let testCompanyId: string;
let testBranchId: string;
let testCustomerId: string;

let createdRateId: string;
let draftInvoiceId: string;
let confirmedInvoiceId: string;

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

async function runMetalRateTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 4.2 METAL RATE ENGINE & RATE LOCKING TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Setup Tokens & Context Data
    console.log('\n[SETUP] Authenticating users...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login should return 200');
    ownerToken = ownerRes.body.data.accessToken;

    const mgrRes = await request('POST', '/auth/login', {
      email: 'manager@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(mgrRes.status, 200, 'Manager login should return 200');
    managerToken = mgrRes.body.data.accessToken;

    const cashierRes = await request('POST', '/auth/login', {
      email: 'cashier@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(cashierRes.status, 200, 'Cashier login should return 200');
    cashierToken = cashierRes.body.data.accessToken;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch, 'Active branch must exist for testing');
    testBranchId = branch.id;
    testCompanyId = branch.companyId;

    const customer = await prisma.customer.findFirst({ where: { isActive: true } });
    assert.ok(customer, 'Active customer must exist for testing');
    testCustomerId = customer!.id;

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { branchId: testBranchId, status: 'AVAILABLE' },
    });
    assert.ok(inventoryItem, 'Available inventory item must exist for testing');

    // Create draft invoice for rate locking
    const draftInvRes = await request('POST', '/sales/invoices', {
      customerId: testCustomerId,
      branchId: testBranchId,
      items: [{ inventoryItemId: inventoryItem.id, quantity: 1, unitPrice: 50000 }],
    }, ownerToken);
    assert.strictEqual(draftInvRes.status, 201, 'Draft invoice creation should return 201');
    draftInvoiceId = draftInvRes.body.data.id;

    // Create confirmed invoice for testing lock rejection
    const confInvRes = await request('POST', '/sales/invoices', {
      customerId: testCustomerId,
      branchId: testBranchId,
      items: [{ inventoryItemId: inventoryItem.id, quantity: 1, unitPrice: 50000 }],
    }, ownerToken);
    assert.strictEqual(confInvRes.status, 201, 'Confirmed invoice creation should return 201');
    confirmedInvoiceId = confInvRes.body.data.id;

    await request('POST', `/sales/invoices/${confirmedInvoiceId}/lock-metal-rate`, {}, ownerToken);
    await request('POST', `/sales/invoices/${confirmedInvoiceId}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    await request('POST', `/sales/invoices/${confirmedInvoiceId}/confirm`, {}, ownerToken);

    console.log('[PASS] Setup completed successfully.');

    // 2. Auth & Security Guards
    console.log('\n[TEST 1] Testing Auth Security Guards & Admin-Only Live Rates...');
    const noAuthRes = await request('GET', '/metal-rates');
    assert.strictEqual(noAuthRes.status, 401, 'Unauthenticated request should return 401');
    assert.strictEqual(noAuthRes.body.success, false);
    console.log('[PASS] 401 Unauthorized guard enforced.');

    // 2b. Live Market Rate Access Restrictions (Admin Only)
    const cashierLiveRes = await request('GET', '/metal-rates/live', undefined, cashierToken);
    assert.strictEqual(cashierLiveRes.status, 403, 'Cashier accessing live market rates should return 403 Forbidden');
    console.log('[PASS] Cashier live market price access rejected with 403 Forbidden.');

    const adminLiveRes = await request('GET', '/metal-rates/live', undefined, ownerToken);
    assert.strictEqual(adminLiveRes.status, 200, 'Admin accessing live market rates should return 200 OK');
    assert.strictEqual(adminLiveRes.body.success, true);
    assert.ok(Array.isArray(adminLiveRes.body.data.rates), 'Live rate object must include rates array');
    console.log('[PASS] Admin live market price access granted with 200 OK.');

    // 3. Create Rate & Validations
    console.log('\n[TEST 2] Testing Metal Rate Creation & Input Validation...');
    const zeroRateRes = await request('POST', '/metal-rates', {
      companyId: testCompanyId,
      metalType: 'GOLD',
      purity: '22K',
      ratePerGram: 0,
      effectiveFrom: new Date().toISOString(),
    }, ownerToken);
    assert.strictEqual(zeroRateRes.status, 400, 'Zero rate should return 400 Bad Request');
    console.log('[PASS] Zero rate rejected with 400 Bad Request.');

    const badMetalRes = await request('POST', '/metal-rates', {
      companyId: testCompanyId,
      metalType: 'BRONZE',
      purity: '22K',
      ratePerGram: 5000,
      effectiveFrom: new Date().toISOString(),
    }, ownerToken);
    assert.strictEqual(badMetalRes.status, 400, 'Invalid metalType enum should return 400');
    console.log('[PASS] Invalid metalType enum rejected with 400 Bad Request.');

    // Deactivate pre-existing active GOLD 22K rate to allow clean test rate creation
    await prisma.metalRate.updateMany({
      where: { companyId: testCompanyId, metalType: 'GOLD', purity: '22K', isActive: true },
      data: { isActive: false, effectiveTo: new Date() },
    });

    const validRateRes = await request('POST', '/metal-rates', {
      companyId: testCompanyId,
      metalType: 'GOLD',
      purity: '22K',
      ratePerGram: 6850.0,
      effectiveFrom: new Date(Date.now() - 3600000).toISOString(),
    }, managerToken);
    assert.strictEqual(validRateRes.status, 201, 'Valid rate creation should return 201 Created');
    assert.strictEqual(validRateRes.body.success, true);
    assert.strictEqual(validRateRes.body.data.metalType, 'GOLD');
    assert.strictEqual(validRateRes.body.data.purity, '22K');
    createdRateId = validRateRes.body.data.id;
    console.log('[PASS] Valid GOLD 22K rate created with 201 Created.');

    // 4. Overlap Protection Rules
    console.log('\n[TEST 3] Testing Overlap Protection Rules...');
    const overlapRes = await request('POST', '/metal-rates', {
      companyId: testCompanyId,
      metalType: 'GOLD',
      purity: '22K',
      ratePerGram: 6900.0,
      effectiveFrom: new Date().toISOString(),
    }, ownerToken);
    assert.strictEqual(overlapRes.status, 409, 'Overlapping active rate should return 409 Conflict');
    assert.strictEqual(overlapRes.body.success, false);
    console.log('[PASS] Active rate overlap rejected with 409 Conflict.');

    // 5. Current Rate Resolution
    console.log('\n[TEST 4] Testing Current Rate Resolution Engine...');
    const currentRateRes = await request(
      'GET',
      `/metal-rates/current?companyId=${testCompanyId}&metalType=GOLD&purity=22K`,
      undefined,
      cashierToken
    );
    assert.strictEqual(currentRateRes.status, 200, 'Current rate lookup should return 200 OK');
    assert.strictEqual(currentRateRes.body.success, true);
    assert.strictEqual(currentRateRes.body.data.metalType, 'GOLD');
    assert.strictEqual(currentRateRes.body.data.purity, '22K');
    console.log('[PASS] Current GOLD 22K rate resolved successfully.');

    const notFoundRateRes = await request(
      'GET',
      `/metal-rates/current?companyId=${testCompanyId}&metalType=PLATINUM&purity=UNKNOWN`,
      undefined,
      cashierToken
    );
    assert.strictEqual(notFoundRateRes.status, 404, 'Non-existent current rate should return 404');
    console.log('[PASS] Non-existent rate returned 404 Not Found.');

    // 6. Metal Value Calculation Engine
    console.log('\n[TEST 5] Testing Metal Value Calculation Engine...');
    const calcRes = await request('POST', '/metal-rates/calculate', {
      companyId: testCompanyId,
      metalType: 'GOLD',
      purity: '22K',
      netWeight: 10.25,
    }, cashierToken);
    assert.strictEqual(calcRes.status, 200, 'Calculation should return 200 OK');
    assert.strictEqual(calcRes.body.success, true);
    assert.strictEqual(calcRes.body.data.netWeight, 10.25);
    const expectedValue = Number((10.25 * calcRes.body.data.ratePerGram).toFixed(2));
    assert.strictEqual(calcRes.body.data.metalValue, expectedValue);
    console.log('[PASS] Metal value calculation (netWeight * ratePerGram) verified with 100% precision.');

    // 7. Rate Listing & History
    console.log('\n[TEST 6] Testing Rate Listing & History APIs...');
    const listRes = await request('GET', '/metal-rates?page=1&limit=10', undefined, ownerToken);
    assert.strictEqual(listRes.status, 200, 'List metal rates should return 200 OK');
    assert.strictEqual(listRes.body.success, true);
    assert.ok(Array.isArray(listRes.body.data), 'Data must be an array');
    assert.ok(listRes.body.pagination, 'Pagination metadata must be present');
    console.log('[PASS] Rate listing & pagination verified.');

    // 8. Soft Deactivation
    console.log('\n[TEST 7] Testing Soft Deactivation (Historical Record Preservation)...');
    const deactRes = await request('POST', `/metal-rates/${createdRateId}/deactivate`, {}, managerToken);
    assert.strictEqual(deactRes.status, 200, 'Deactivation should return 200 OK');
    assert.strictEqual(deactRes.body.data.isActive, false);

    const dbRate = await prisma.metalRate.findUnique({ where: { id: createdRateId } });
    assert.ok(dbRate, 'Historical rate record must remain in database');
    assert.strictEqual(dbRate!.isActive, false, 'isActive flag must be set to false');
    console.log('[PASS] Rate soft-deactivated and historical record preserved in DB.');

    // Re-create active rate for locking tests
    const activeRateForLock = await request('POST', '/metal-rates', {
      companyId: testCompanyId,
      metalType: 'GOLD',
      purity: '22K',
      ratePerGram: 6850.0,
      effectiveFrom: new Date().toISOString(),
    }, ownerToken);
    assert.strictEqual(activeRateForLock.status, 201);

    // 9. Sales Invoice Rate Locking Foundation
    console.log('\n[TEST 8] Testing Sales Invoice Rate Locking Foundation...');
    const lockRes = await request('POST', `/sales/invoices/${draftInvoiceId}/lock-metal-rate`, {}, ownerToken);
    assert.strictEqual(lockRes.status, 200, 'Rate lock on DRAFT invoice should return 200 OK');
    assert.strictEqual(lockRes.body.success, true);
    assert.strictEqual(lockRes.body.data.salesInvoiceId, draftInvoiceId);
    assert.ok(lockRes.body.data.ratePerGram, 'Locked ratePerGram must be present');
    console.log('[PASS] Metal rate snapshot locked on DRAFT sales invoice.');

    // Duplicate lock attempt
    const doubleLockRes = await request('POST', `/sales/invoices/${draftInvoiceId}/lock-metal-rate`, {}, ownerToken);
    assert.strictEqual(doubleLockRes.status, 409, 'Duplicate rate lock should return 409 Conflict');
    assert.strictEqual(doubleLockRes.body.success, false);
    console.log('[PASS] Re-locking already locked invoice rejected with 409 Conflict.');

    // Lock on confirmed invoice
    const confLockRes = await request('POST', `/sales/invoices/${confirmedInvoiceId}/lock-metal-rate`, {}, ownerToken);
    assert.strictEqual(confLockRes.status, 400, 'Rate lock on CONFIRMED invoice should return 400');
    assert.strictEqual(confLockRes.body.success, false);
    console.log('[PASS] Rate lock on CONFIRMED invoice rejected with 400 Bad Request.');

    // Retrieve locked rate
    const getLockedRes = await request('GET', `/sales/invoices/${draftInvoiceId}/metal-rate`, undefined, cashierToken);
    assert.strictEqual(getLockedRes.status, 200, 'Retrieve locked rate should return 200 OK');
    assert.strictEqual(getLockedRes.body.data.salesInvoiceId, draftInvoiceId);
    console.log('[PASS] Locked rate snapshot retrieved successfully.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 4.2 METAL RATE API TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n[FAIL] Metal Rate API Test Failure:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runMetalRateTests();
