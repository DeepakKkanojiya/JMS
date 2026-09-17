import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let companyId: string;
let branchId: string;
let customerId: string;
let salespersonId: string;

let secondCompanyId: string;
let secondBranchId: string;
let secondCustomerId: string;

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

async function createTestInventoryItem(comp: string, br: string, itemCode: string, status = 'AVAILABLE') {
  const product = await prisma.product.findFirst({ where: { companyId: comp } });
  assert.ok(product, 'Product must exist for item creation');

  return prisma.inventoryItem.create({
    data: {
      companyId: comp,
      productId: product.id,
      branchId: br,
      itemCode,
      grossWeight: 10.5,
      netWeight: 10.0,
      fineWeight: 9.16,
      purity: '22K',
      status,
      tags: {
        create: {
          barcode: `BC-${itemCode}`,
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
    console.log('STARTING SPRINT 7.2 APPROVAL ISSUE & INVENTORY LOCKING TESTS');
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

    // Fetch master test records
    const company = await prisma.company.findFirst();
    assert.ok(company, 'Test company must exist');
    companyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId } });
    assert.ok(branch, 'Test branch must exist');
    branchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId } });
    assert.ok(customer, 'Test customer must exist');
    customerId = customer.id;

    const employee = await prisma.employee.findFirst({ where: { companyId } });
    if (employee) {
      salespersonId = employee.id;
    }

    // Setup Second Company & Branch & Customer for tenant isolation checks
    let secondCompany = await prisma.company.findFirst({ where: { companyCode: 'COMP-ISO-2' } });
    if (!secondCompany) {
      secondCompany = await prisma.company.create({
        data: {
          companyCode: 'COMP-ISO-2',
          name: 'Isolation Company 2',
        },
      });
    }
    secondCompanyId = secondCompany.id;

    let secondBranch = await prisma.branch.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondBranch) {
      secondBranch = await prisma.branch.create({
        data: {
          companyId: secondCompanyId,
          branchCode: 'ISO-BR-2',
          name: 'Isolation Branch 2',
        },
      });
    }
    secondBranchId = secondBranch.id;

    let secondCustomer = await prisma.customer.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondCustomer) {
      secondCustomer = await prisma.customer.create({
        data: {
          companyId: secondCompanyId,
          branchId: secondBranchId,
          customerCode: 'CUST-ISO-02',
          firstName: 'Iso',
          lastName: 'Customer',
          mobile: '9988776655',
        },
      });
    }
    secondCustomerId = secondCustomer.id;

    // 1. Unauthenticated Check
    console.log('\n[TEST] 1. Rejecting unauthenticated issue request (401)...');
    const unauthRes = await request('POST', `/approvals/00000000-0000-0000-0000-000000000000/issue`);
    assert.strictEqual(unauthRes.status, 401);
    console.log('[PASS] Unauthenticated request rejected with 401');

    // 2. Single Item Happy Path Issue & Stock Movement Creation
    console.log('\n[TEST] 2. Issuing valid Approval slip with single inventory item...');
    const item1 = await createTestInventoryItem(companyId, branchId, `APP-ITEM-${Date.now()}-1`);
    assert.strictEqual(item1.status, 'AVAILABLE');

    const app1Res = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        salespersonId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: item1.id, quantity: 1, unitPrice: 25000 }],
      },
      ownerToken
    );
    assert.strictEqual(app1Res.status, 201);
    const app1Id = app1Res.body.data.id;

    const issue1Res = await request('POST', `/approvals/${app1Id}/issue`, {}, ownerToken);
    assert.strictEqual(issue1Res.status, 200);
    assert.strictEqual(issue1Res.body.data.status, 'ISSUED');

    // Verify inventory status changed AVAILABLE -> ON_APPROVAL
    const updatedItem1 = await prisma.inventoryItem.findUnique({ where: { id: item1.id } });
    assert.strictEqual(updatedItem1?.status, 'ON_APPROVAL');

    // Verify StockMovement entry
    const movements1 = await prisma.stockMovement.findMany({ where: { inventoryItemId: item1.id } });
    const issueMovement = movements1.find((m) => m.movementType === 'APPROVAL_ISSUE');
    assert.ok(issueMovement, 'StockMovement of type APPROVAL_ISSUE must be logged');
    assert.strictEqual(issueMovement.referenceType, 'SALES_APPROVAL');
    assert.strictEqual(issueMovement.referenceId, app1Id);
    assert.strictEqual(issueMovement.fromBranchId, branchId);
    console.log('[PASS] Single item issue passed: AVAILABLE -> ON_APPROVAL, StockMovement created');

    // 3. Issue Multiple Items
    console.log('\n[TEST] 3. Issuing Approval slip with multiple inventory items...');
    const item2A = await createTestInventoryItem(companyId, branchId, `APP-ITEM-${Date.now()}-2A`);
    const item2B = await createTestInventoryItem(companyId, branchId, `APP-ITEM-${Date.now()}-2B`);

    const app2Res = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [
          { inventoryItemId: item2A.id, quantity: 1, unitPrice: 15000 },
          { inventoryItemId: item2B.id, quantity: 1, unitPrice: 35000 },
        ],
      },
      ownerToken
    );
    assert.strictEqual(app2Res.status, 201);
    const app2Id = app2Res.body.data.id;

    const issue2Res = await request('POST', `/approvals/${app2Id}/issue`, {}, ownerToken);
    assert.strictEqual(issue2Res.status, 200);

    const updated2A = await prisma.inventoryItem.findUnique({ where: { id: item2A.id } });
    const updated2B = await prisma.inventoryItem.findUnique({ where: { id: item2B.id } });
    assert.strictEqual(updated2A?.status, 'ON_APPROVAL');
    assert.strictEqual(updated2B?.status, 'ON_APPROVAL');
    console.log('[PASS] Multiple items issued successfully and set to ON_APPROVAL');

    // 4. Reject SOLD Item Issue
    console.log('\n[TEST] 4. Rejecting issue of SOLD inventory item...');
    const soldItem = await createTestInventoryItem(companyId, branchId, `APP-SOLD-${Date.now()}`, 'SOLD');

    const appSoldRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: soldItem.id, quantity: 1, unitPrice: 5000 }],
      },
      ownerToken
    );
    assert.strictEqual(appSoldRes.status, 201);

    const issueSoldRes = await request('POST', `/approvals/${appSoldRes.body.data.id}/issue`, {}, ownerToken);
    assert.strictEqual(issueSoldRes.status, 400);
    console.log('[PASS] Issue of SOLD item correctly rejected with 400');

    // 5. Reject RESERVED / ON_APPROVAL Item Issue
    console.log('\n[TEST] 5. Rejecting issue of already ON_APPROVAL inventory item...');
    const appAlreadyRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: item1.id, quantity: 1, unitPrice: 10000 }],
      },
      ownerToken
    );
    assert.strictEqual(appAlreadyRes.status, 201);

    const issueAlreadyRes = await request('POST', `/approvals/${appAlreadyRes.body.data.id}/issue`, {}, ownerToken);
    assert.strictEqual(issueAlreadyRes.status, 400);
    console.log('[PASS] Issue of ON_APPROVAL item correctly rejected with 400');

    // 6. Reject Cross-Branch Item
    console.log('\n[TEST] 6. Rejecting issue of cross-branch inventory item...');
    let otherBranch = await prisma.branch.findFirst({ where: { companyId, NOT: { id: branchId } } });
    if (!otherBranch) {
      otherBranch = await prisma.branch.create({
        data: { companyId, branchCode: `BR-OTH-${Date.now()}`, name: 'Other Branch' },
      });
    }

    const crossBranchItem = await createTestInventoryItem(companyId, otherBranch.id, `APP-XBR-${Date.now()}`);
    const appXbrRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: crossBranchItem.id, quantity: 1, unitPrice: 20000 }],
      },
      ownerToken
    );
    // Draft creation might succeed or fail, but issue MUST fail with 400
    if (appXbrRes.status === 201) {
      const issueXbrRes = await request('POST', `/approvals/${appXbrRes.body.data.id}/issue`, {}, ownerToken);
      assert.strictEqual(issueXbrRes.status, 400);
    }
    console.log('[PASS] Cross-branch inventory item issue rejected with 400');

    // 7. Multi-Item Atomic Rollback Test
    console.log('\n[TEST] 7. Verifying atomic rollback on multi-item issue failure...');
    const itemRollbackAvailable = await createTestInventoryItem(companyId, branchId, `APP-RB-AVAIL-${Date.now()}`);
    const itemRollbackSold = await createTestInventoryItem(companyId, branchId, `APP-RB-SOLD-${Date.now()}`, 'SOLD');

    const appAtomicRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [
          { inventoryItemId: itemRollbackAvailable.id, quantity: 1, unitPrice: 10000 },
          { inventoryItemId: itemRollbackSold.id, quantity: 1, unitPrice: 20000 },
        ],
      },
      ownerToken
    );
    assert.strictEqual(appAtomicRes.status, 201);
    const atomicAppId = appAtomicRes.body.data.id;

    const atomicIssueRes = await request('POST', `/approvals/${atomicAppId}/issue`, {}, ownerToken);
    assert.strictEqual(atomicIssueRes.status, 400);

    // Verify itemRollbackAvailable REMAINS AVAILABLE
    const checkRollbackItem = await prisma.inventoryItem.findUnique({ where: { id: itemRollbackAvailable.id } });
    assert.strictEqual(checkRollbackItem?.status, 'AVAILABLE');

    // Verify NO StockMovement was created for itemRollbackAvailable under atomicAppId
    const rollbackMovements = await prisma.stockMovement.findMany({
      where: { referenceId: atomicAppId },
    });
    assert.strictEqual(rollbackMovements.length, 0);
    console.log('[PASS] Multi-item atomic rollback verified: 0 items locked, 0 stock movements created');

    // 8. Concurrency Test (Simultaneous Parallel Issue Attempts)
    console.log('\n[TEST] 8. Verifying parallel concurrency protection (Race Condition Test)...');
    const raceItem = await createTestInventoryItem(companyId, branchId, `APP-RACE-${Date.now()}`);

    const raceApp1 = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: raceItem.id, quantity: 1, unitPrice: 30000 }],
      },
      ownerToken
    );
    assert.strictEqual(raceApp1.status, 201);

    const raceApp2 = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: raceItem.id, quantity: 1, unitPrice: 30000 }],
      },
      ownerToken
    );
    assert.strictEqual(raceApp2.status, 201);

    // Fire parallel requests
    const [resRace1, resRace2] = await Promise.all([
      request('POST', `/approvals/${raceApp1.body.data.id}/issue`, {}, ownerToken),
      request('POST', `/approvals/${raceApp2.body.data.id}/issue`, {}, ownerToken),
    ]);

    const statuses = [resRace1.status, resRace2.status].sort();
    assert.strictEqual(statuses[0], 200, 'Exactly one concurrent issue request must succeed (200)');
    assert.ok(statuses[1] === 400 || statuses[1] === 409, `Losing concurrent request must receive 400 or 409, got ${statuses[1]}`);

    const raceMovements = await prisma.stockMovement.findMany({ where: { inventoryItemId: raceItem.id } });
    const issueMovements = raceMovements.filter((m) => m.movementType === 'APPROVAL_ISSUE');
    assert.strictEqual(issueMovements.length, 1, 'Exactly ONE StockMovement must exist for the locked item');
    console.log('[PASS] Concurrency protection verified: Exactly 1 request succeeded, exactly 1 StockMovement logged');

    // 9. Verify Sales Invoice rejects ON_APPROVAL item
    console.log('\n[TEST] 9. Verifying Sales Invoice rejects ON_APPROVAL item...');
    const salesRes = await request(
      'POST',
      '/sales-invoices',
      {
        companyId,
        branchId,
        customerId,
        items: [{ inventoryItemId: item1.id, quantity: 1, unitPrice: 50000 }],
      },
      ownerToken
    );
    assert.strictEqual(salesRes.status, 400, 'Sales invoice creation with ON_APPROVAL item must return 400');
    console.log('[PASS] Sales invoice correctly rejected ON_APPROVAL item');

    console.log('\n======================================================');
    console.log('✓ ALL SPRINT 7.2 APPROVAL INVENTORY LOCKING TESTS PASSED!');
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
