import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let companyId: string;
let branchId: string;
let customerId: string;
let salespersonId: string;

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

async function createTestInventoryItem(comp: string, br: string, itemCode: string) {
  const product = await prisma.product.findFirst({ where: { companyId: comp } });
  assert.ok(product, 'Product must exist for item creation');

  return prisma.inventoryItem.create({
    data: {
      companyId: comp,
      productId: product.id,
      branchId: br,
      itemCode,
      grossWeight: 25.0,
      netWeight: 24.0,
      fineWeight: 22.0,
      purity: '22K',
      status: 'AVAILABLE',
      tags: {
        create: {
          barcode: `BC-${itemCode}`,
          rfidEpc: `RFID-${itemCode}`,
          isActive: true,
        },
      },
    },
    include: {
      product: true,
      branch: true,
      tags: true,
    },
  });
}

async function runTests() {
  try {
    console.log('\n======================================================');
    console.log('STARTING SPRINT 7.5 APPROVAL REPORTS & AUDIT TESTS');
    console.log('======================================================\n');

    await connectDB();
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });

    // Login as OWNER
    const loginRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(loginRes.status, 200, 'Owner login should succeed');
    ownerToken = loginRes.body.data.accessToken;
    console.log('[PASS] Owner authenticated successfully');

    // Fetch master records
    const company = await prisma.company.findFirst();
    assert.ok(company, 'Test company must exist');
    companyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId } });
    assert.ok(branch, 'Test branch must exist');
    branchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId } });
    assert.ok(customer, 'Test customer must exist');
    customerId = customer.id;

    // 1. Unauthenticated Checks
    console.log('\n[TEST] 1. Testing 401 unauthenticated requests on report APIs...');
    const unauthSum = await request('GET', '/approvals/reports/summary');
    assert.strictEqual(unauthSum.status, 401);

    const unauthReg = await request('GET', '/approvals/reports/register');
    assert.strictEqual(unauthReg.status, 401);
    console.log('[PASS] Unauthenticated report requests rejected with 401');

    // Setup Test Approval Slips for Reports
    console.log('\n[TEST] Setting up test approval slips for reporting...');
    
    // Approval 1: Issued + Deposit paid (Active)
    const item1 = await createTestInventoryItem(companyId, branchId, `REP-ITEM-1-${Date.now()}`);
    const app1Res = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        requiredDepositAmount: 15000,
        items: [{ inventoryItemId: item1.id, quantity: 1, unitPrice: 60000 }],
      },
      ownerToken
    );
    assert.strictEqual(app1Res.status, 201);
    const app1Id = app1Res.body.data.id;
    await request('POST', `/approvals/${app1Id}/issue`, {}, ownerToken);
    await request('POST', `/approvals/${app1Id}/deposits`, { paymentMethod: 'UPI', amount: 15000 }, ownerToken);

    // Approval 2: Returned
    const item2 = await createTestInventoryItem(companyId, branchId, `REP-ITEM-2-${Date.now()}`);
    const app2Res = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        items: [{ inventoryItemId: item2.id, quantity: 1, unitPrice: 75000 }],
      },
      ownerToken
    );
    const app2Id = app2Res.body.data.id;
    await request('POST', `/approvals/${app2Id}/issue`, {}, ownerToken);
    await request('POST', `/approvals/${app2Id}/return`, { returnReason: 'Design mismatch' }, ownerToken);

    // Approval 3: Purchased
    const item3 = await createTestInventoryItem(companyId, branchId, `REP-ITEM-3-${Date.now()}`);
    const app3Res = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        requiredDepositAmount: 30000,
        items: [{ inventoryItemId: item3.id, quantity: 1, unitPrice: 90000 }],
      },
      ownerToken
    );
    const app3Id = app3Res.body.data.id;
    await request('POST', `/approvals/${app3Id}/issue`, {}, ownerToken);
    await request('POST', `/approvals/${app3Id}/deposits`, { paymentMethod: 'CASH', amount: 30000 }, ownerToken);
    await request('POST', `/approvals/${app3Id}/purchase`, { notes: 'Purchased for wedding' }, ownerToken);

    // Approval 4: Overdue Active Approval
    const item4 = await createTestInventoryItem(companyId, branchId, `REP-ITEM-4-${Date.now()}`);
    const app4Res = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        requiredDepositAmount: 10000,
        items: [{ inventoryItemId: item4.id, quantity: 1, unitPrice: 50000 }],
      },
      ownerToken
    );
    const app4Id = app4Res.body.data.id;
    await request('POST', `/approvals/${app4Id}/issue`, {}, ownerToken);
    // Backdate dueDate in DB to simulate overdue state
    await prisma.approval.update({
      where: { id: app4Id },
      data: { dueDate: new Date(Date.now() - 10 * 86400000) },
    });

    console.log('[PASS] Reporting test environment prepared');

    // 2. SUMMARY METRICS REPORT
    console.log('\n[TEST] 2. Verifying GET /approvals/reports/summary...');
    const sumRes = await request('GET', '/approvals/reports/summary', undefined, ownerToken);
    assert.strictEqual(sumRes.status, 200);
    assert.ok(sumRes.body.data.totalApprovals >= 4);
    assert.ok(sumRes.body.data.issuedCount >= 2);
    assert.ok(sumRes.body.data.returnedCount >= 1);
    assert.ok(sumRes.body.data.purchasedCount >= 1);
    assert.ok(sumRes.body.data.totalDepositsCollected >= 45000);
    console.log('[PASS] Summary metrics report verified');

    // 3. APPROVAL REGISTER REPORT
    console.log('\n[TEST] 3. Verifying GET /approvals/reports/register (filters & pagination)...');
    const regRes = await request('GET', '/approvals/reports/register?page=1&limit=10', undefined, ownerToken);
    assert.strictEqual(regRes.status, 200);
    assert.ok(Array.isArray(regRes.body.data));
    assert.ok(regRes.body.data.length > 0);
    assert.ok(regRes.body.pagination);

    // Filter by overdue
    const ovRes = await request('GET', '/approvals/reports/register?isOverdue=true', undefined, ownerToken);
    assert.strictEqual(ovRes.status, 200);
    assert.ok(ovRes.body.data.some((a: any) => a.id === app4Id));
    console.log('[PASS] Approval register report verified with filters');

    // 4. INVENTORY ON APPROVAL REPORT
    console.log('\n[TEST] 4. Verifying GET /approvals/reports/inventory (ON_APPROVAL physical items)...');
    const invRes = await request('GET', '/approvals/reports/inventory', undefined, ownerToken);
    assert.strictEqual(invRes.status, 200);
    assert.ok(Array.isArray(invRes.body.data));
    assert.ok(invRes.body.summary);

    const onAppItem = invRes.body.data.find((i: any) => i.inventoryItemId === item1.id);
    assert.ok(onAppItem, 'ON_APPROVAL item must be present in inventory report');
    assert.strictEqual(onAppItem.barcode, `BC-${item1.itemCode}`);
    console.log('[PASS] Inventory on approval report verified');

    // 5. DEPOSIT / PAYMENT REPORT
    console.log('\n[TEST] 5. Verifying GET /approvals/reports/deposits...');
    const depRes = await request('GET', '/approvals/reports/deposits', undefined, ownerToken);
    assert.strictEqual(depRes.status, 200);
    assert.ok(depRes.body.summary);
    assert.ok(Array.isArray(depRes.body.data));
    assert.ok(depRes.body.summary.totalCompletedDeposits >= 45000);
    console.log('[PASS] Deposit report verified');

    // 6. RETURN VS PURCHASE REPORT
    console.log('\n[TEST] 6. Verifying GET /approvals/reports/returns-purchases...');
    const retPurRes = await request('GET', '/approvals/reports/returns-purchases', undefined, ownerToken);
    assert.strictEqual(retPurRes.status, 200);
    assert.ok(retPurRes.body.data.returnedCount >= 1);
    assert.ok(retPurRes.body.data.purchasedCount >= 1);
    assert.ok(retPurRes.body.data.conversionRatePercent >= 0);
    console.log('[PASS] Return vs Purchase conversion report verified');

    // 7. CUSTOMER APPROVAL HISTORY REPORT
    console.log('\n[TEST] 7. Verifying GET /approvals/reports/customer/:customerId...');
    const custRes = await request('GET', `/approvals/reports/customer/${customerId}`, undefined, ownerToken);
    assert.strictEqual(custRes.status, 200);
    assert.strictEqual(custRes.body.data.customerId, customerId);
    assert.ok(custRes.body.data.totalApprovalsCount >= 4);
    console.log('[PASS] Customer approval history report verified');

    // 8. APPROVAL AGEING / OVERDUE REPORT
    console.log('\n[TEST] 8. Verifying GET /approvals/reports/ageing...');
    const ageRes = await request('GET', '/approvals/reports/ageing', undefined, ownerToken);
    assert.strictEqual(ageRes.status, 200);
    assert.ok(Array.isArray(ageRes.body.data));
    assert.strictEqual(ageRes.body.data.length, 5); // 5 Ageing buckets

    const bucket1_7 = ageRes.body.data.find((b: any) => b.bucket === 'OVERDUE_8_30_DAYS');
    assert.ok(bucket1_7, 'OVERDUE_8_30_DAYS bucket must exist');
    console.log('[PASS] Approval ageing report verified with 5 buckets');

    // 9. 360° APPROVAL AUDIT TRAIL
    console.log('\n[TEST] 9. Verifying GET /approvals/:id/audit-trail...');
    const auditRes = await request('GET', `/approvals/${app3Id}/audit-trail`, undefined, ownerToken);
    assert.strictEqual(auditRes.status, 200);
    assert.strictEqual(auditRes.body.data.approvalId, app3Id);
    assert.ok(Array.isArray(auditRes.body.data.timeline));

    const events = auditRes.body.data.timeline.map((e: any) => e.eventType);
    assert.ok(events.includes('CREATED'));
    assert.ok(events.includes('ISSUED'));
    assert.ok(events.includes('INVENTORY_LOCKED'));
    assert.ok(events.includes('DEPOSIT_RECEIVED'));
    assert.ok(events.includes('PURCHASE_CONFIRMED'));
    assert.ok(events.includes('INVENTORY_SOLD'));
    console.log('[PASS] 360° Approval audit trail timeline verified');

    // 10. READ-ONLY VERIFICATION (Ensure reports perform ZERO database mutations)
    console.log('\n[TEST] 10. Verifying read-only safety (reports perform NO database mutations)...');
    const appCountBefore = await prisma.approval.count();
    const invCountBefore = await prisma.inventoryItem.count();
    const depCountBefore = await prisma.approvalDeposit.count();

    await request('GET', '/approvals/reports/summary', undefined, ownerToken);
    await request('GET', '/approvals/reports/register', undefined, ownerToken);
    await request('GET', '/approvals/reports/inventory', undefined, ownerToken);
    await request('GET', '/approvals/reports/deposits', undefined, ownerToken);
    await request('GET', '/approvals/reports/returns-purchases', undefined, ownerToken);
    await request('GET', `/approvals/reports/customer/${customerId}`, undefined, ownerToken);
    await request('GET', '/approvals/reports/ageing', undefined, ownerToken);
    await request('GET', `/approvals/${app3Id}/audit-trail`, undefined, ownerToken);

    const appCountAfter = await prisma.approval.count();
    const invCountAfter = await prisma.inventoryItem.count();
    const depCountAfter = await prisma.approvalDeposit.count();

    assert.strictEqual(appCountBefore, appCountAfter);
    assert.strictEqual(invCountBefore, invCountAfter);
    assert.strictEqual(depCountBefore, depCountAfter);
    console.log('[PASS] Read-only safety verified: 0 database mutations performed by report endpoints');

    console.log('\n======================================================');
    console.log('✓ ALL SPRINT 7.5 APPROVAL REPORT & AUDIT TESTS PASSED!');
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
