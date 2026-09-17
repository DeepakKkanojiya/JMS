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
let inventoryItemId: string;

let secondCompanyId: string;
let secondBranchId: string;

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
  try {
    console.log('\n======================================================');
    console.log('STARTING SPRINT 7.1 APPROVAL FOUNDATION TESTS');
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

    // Fetch test Company, Branch, Customer, Employee, InventoryItem
    const company = await prisma.company.findFirst();
    assert.ok(company, 'Test company should exist');
    companyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId } });
    assert.ok(branch, 'Test branch should exist');
    branchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId } });
    assert.ok(customer, 'Test customer should exist');
    customerId = customer.id;

    const employee = await prisma.employee.findFirst({ where: { companyId } });
    if (employee) {
      salespersonId = employee.id;
    }

    const product = await prisma.product.findFirst({ where: { companyId } });
    assert.ok(product, 'Test product should exist');

    const freshItem = await prisma.inventoryItem.create({
      data: {
        companyId,
        productId: product.id,
        branchId,
        itemCode: `TEST-APP-${Date.now()}`,
        grossWeight: 12.0,
        netWeight: 11.5,
        fineWeight: 10.53,
        purity: '22K',
        status: 'AVAILABLE',
        tags: { create: { barcode: `BC-TEST-APP-${Date.now()}`, isActive: true } },
      },
    });
    inventoryItemId = freshItem.id;

    // Create Second Company & Branch for cross-tenant testing
    let secondCompany = await prisma.company.findFirst({ where: { companyCode: 'TEST-COMP-2' } });
    if (!secondCompany) {
      secondCompany = await prisma.company.create({
        data: {
          companyCode: 'TEST-COMP-2',
          name: 'Test Company 2 Ltd',
        },
      });
    }
    secondCompanyId = secondCompany.id;

    let secondBranch = await prisma.branch.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondBranch) {
      secondBranch = await prisma.branch.create({
        data: {
          companyId: secondCompanyId,
          branchCode: 'TST-BR-2',
          name: 'Test Branch 2',
        },
      });
    }
    secondBranchId = secondBranch.id;

    let createdApprovalId: string;
    let createdApprovalNumber: string;

    // 1. Create Approval
    console.log('\n[TEST] 1. Creating valid Sell on Approval slip with items...');
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const createRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        salespersonId,
        dueDate,
        notes: 'Approval slip for wedding jewellery selection',
        items: [
          {
            inventoryItemId,
            quantity: 1,
            unitPrice: 50000.0,
            notes: '22K Gold Bangle',
          },
        ],
      },
      ownerToken
    );

    assert.strictEqual(createRes.status, 201, `Create approval status should be 201, got ${createRes.status}`);
    assert.strictEqual(createRes.body.success, true);
    assert.ok(createRes.body.data.id);
    assert.ok(createRes.body.data.approvalNumber.startsWith('APP-'));
    assert.strictEqual(createRes.body.data.status, 'DRAFT');
    assert.strictEqual(createRes.body.data.items.length, 1);
    assert.strictEqual(Number(createRes.body.data.totalAmount), 50000);

    createdApprovalId = createRes.body.data.id;
    createdApprovalNumber = createRes.body.data.approvalNumber;
    console.log(`[PASS] Created approval #${createdApprovalNumber} (ID: ${createdApprovalId})`);

    // 2. Get Approval by ID
    console.log('\n[TEST] 2. Getting Approval slip details by ID...');
    const getRes = await request('GET', `/approvals/${createdApprovalId}`, undefined, ownerToken);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.success, true);
    assert.strictEqual(getRes.body.data.id, createdApprovalId);
    assert.strictEqual(getRes.body.data.approvalNumber, createdApprovalNumber);
    assert.ok(getRes.body.data.customer);
    assert.ok(getRes.body.data.branch);
    assert.strictEqual(getRes.body.data.items.length, 1);
    console.log('[PASS] Approval details verified by ID');

    // 3. List Approvals
    console.log('\n[TEST] 3. Listing Sell on Approval slips with search & pagination...');
    const listRes = await request('GET', `/approvals?search=${createdApprovalNumber}&page=1&limit=10`, undefined, ownerToken);
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.body.success, true);
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.data.length >= 1);
    assert.ok(listRes.body.pagination);
    assert.strictEqual(listRes.body.pagination.page, 1);
    console.log('[PASS] Approval list & pagination verified');

    // 4. Update DRAFT Approval
    console.log('\n[TEST] 4. Updating DRAFT Approval slip...');
    const updatedDueDate = new Date(Date.now() + 14 * 86400000).toISOString();
    const updateRes = await request(
      'PUT',
      `/approvals/${createdApprovalId}`,
      {
        dueDate: updatedDueDate,
        notes: 'Updated approval slip notes',
      },
      ownerToken
    );
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.success, true);
    assert.strictEqual(updateRes.body.data.notes, 'Updated approval slip notes');
    console.log('[PASS] DRAFT approval updated successfully');

    // 5. Issue DRAFT Approval
    console.log('\n[TEST] 5. Issuing DRAFT Approval slip...');
    const issueRes = await request('POST', `/approvals/${createdApprovalId}/issue`, {}, ownerToken);
    assert.strictEqual(issueRes.status, 200);
    assert.strictEqual(issueRes.body.success, true);
    assert.strictEqual(issueRes.body.data.status, 'ISSUED');
    console.log('[PASS] Approval issued successfully');

    // 6. Reject update on ISSUED Approval
    console.log('\n[TEST] 6. Rejecting update on ISSUED Approval slip...');
    const invalidUpdateRes = await request(
      'PUT',
      `/approvals/${createdApprovalId}`,
      { notes: 'Attempting invalid update on ISSUED approval' },
      ownerToken
    );
    assert.strictEqual(invalidUpdateRes.status, 400);
    console.log('[PASS] Update on ISSUED approval correctly rejected with 400');

    // 7. Reject invalid customer ID
    console.log('\n[TEST] 7. Rejecting creation with non-existent customer ID...');
    const invalidCustomerRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId: '00000000-0000-0000-0000-000000000000',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        items: [{ inventoryItemId, quantity: 1 }],
      },
      ownerToken
    );
    assert.strictEqual(invalidCustomerRes.status, 400);
    console.log('[PASS] Non-existent customer correctly rejected');

    // 8. Reject invalid due date
    console.log('\n[TEST] 8. Rejecting creation with due date earlier than issue date...');
    const pastDueDate = new Date(Date.now() - 7 * 86400000).toISOString();
    const invalidDateRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: pastDueDate,
        items: [{ inventoryItemId, quantity: 1 }],
      },
      ownerToken
    );
    assert.strictEqual(invalidDateRes.status, 400);
    console.log('[PASS] Invalid due date correctly rejected');

    // 9. Reject empty items list
    console.log('\n[TEST] 9. Rejecting creation with empty items list...');
    const emptyItemsRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        items: [],
      },
      ownerToken
    );
    assert.strictEqual(emptyItemsRes.status, 400);
    console.log('[PASS] Empty items list correctly rejected');

    // 10. Reject request without auth token
    console.log('\n[TEST] 10. Rejecting request without authorization token...');
    const unauthRes = await request('GET', '/approvals');
    assert.strictEqual(unauthRes.status, 401);
    console.log('[PASS] Unauthorized request correctly rejected with 401');

    // 11. Create & Cancel DRAFT Approval
    console.log('\n[TEST] 11. Creating and cancelling a DRAFT approval slip...');
    const draftRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        items: [{ inventoryItemId, quantity: 1, unitPrice: 1000 }],
      },
      ownerToken
    );
    assert.strictEqual(draftRes.status, 201);
    const draftId = draftRes.body.data.id;

    const cancelRes = await request('POST', `/approvals/${draftId}/cancel`, {}, ownerToken);
    assert.strictEqual(cancelRes.status, 200);
    assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
    console.log('[PASS] Draft approval cancelled successfully');

    console.log('\n======================================================');
    console.log('✓ ALL SPRINT 7.1 APPROVAL FOUNDATION TESTS PASSED!');
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
