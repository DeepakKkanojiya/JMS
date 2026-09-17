import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let karigarSupervisorToken: string;
let staffToken: string;

let testCompanyId: string;
let testBranchId: string;
let testVendorId: string;
let testProductId: string;
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
  console.log('RUNNING SPRINT 5.6 KARIGAR JOB WORK TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1-2. Auth Setup
    console.log('\n[TEST] 1-2. Authentication & Tokens...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login failed');
    ownerToken = ownerRes.body.data.accessToken;

    const karigarRes = await request('POST', '/auth/login', {
      email: 'karigar@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(karigarRes.status, 200, 'Karigar Supervisor login failed');
    karigarSupervisorToken = karigarRes.body.data.accessToken;

    const staffRes = await request('POST', '/auth/login', {
      email: 'staff@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(staffRes.status, 200, 'Staff login failed');
    staffToken = staffRes.body.data.accessToken;

    // Unauthenticated check
    const unauthRes = await request('POST', '/job-work/orders', {});
    assert.strictEqual(unauthRes.status, 401, 'Expected 401 for unauthenticated request');

    // Fetch Master Data
    const company = await prisma.company.findFirst({ where: { isActive: true } });
    assert.ok(company);
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch);
    testBranchId = branch.id;

    const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
    assert.ok(vendor);
    testVendorId = vendor.id;

    const product = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(product);
    testProductId = product.id;

    const invItem = await prisma.inventoryItem.findFirst({ where: { status: 'AVAILABLE' } });
    assert.ok(invItem);
    testInventoryItemId = invItem.id;

    // 3-5. Create Draft Order & Guard Validations
    console.log('\n[TEST] 3-5. Create Draft Job Work Order & Guard Validations...');
    const staffCreateRes = await request(
      'POST',
      '/job-work/orders',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        vendorId: testVendorId,
        targetItemName: 'Handcrafted Gold Chain',
      },
      staffToken
    );
    assert.strictEqual(staffCreateRes.status, 403, 'Expected 403 Forbidden for staff missing job_work.create');

    const draftOrderRes = await request(
      'POST',
      '/job-work/orders',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        vendorId: testVendorId,
        targetItemName: '22K Handmade Antique Necklace',
        metalType: 'GOLD',
        purity: '22K',
        agreedWastagePercent: 1.5,
        agreedMakingChargePerGram: 400.00,
        notes: 'Sprint 5.6 custom order test',
      },
      karigarSupervisorToken
    );
    assert.strictEqual(draftOrderRes.status, 201, 'Create draft job work order failed');
    assert.strictEqual(draftOrderRes.body.data.status, 'DRAFT');
    assert.ok(draftOrderRes.body.data.orderNumber.startsWith('JW-'));
    const testOrderId = draftOrderRes.body.data.id;

    // 6. Update Draft Order
    console.log('\n[TEST] 6. Update DRAFT Job Work Order...');
    const updateRes = await request(
      'PUT',
      `/job-work/orders/${testOrderId}`,
      { notes: 'Updated notes: Urgent priority for Karigar' },
      karigarSupervisorToken
    );
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.notes, 'Updated notes: Urgent priority for Karigar');

    // 7 & 8. Submit and Assign State Transitions
    console.log('\n[TEST] 7-8. Submit & Assign Job Work Order...');
    const submitRes = await request('POST', `/job-work/orders/${testOrderId}/submit`, {}, karigarSupervisorToken);
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitRes.body.data.status, 'SUBMITTED');

    const assignRes = await request('POST', `/job-work/orders/${testOrderId}/assign`, {}, karigarSupervisorToken);
    assert.strictEqual(assignRes.status, 200);
    assert.strictEqual(assignRes.body.data.status, 'ASSIGNED');

    // 9. Reject Update on ASSIGNED order
    const invalidUpdateRes = await request('PUT', `/job-work/orders/${testOrderId}`, { notes: 'Illegal' }, karigarSupervisorToken);
    assert.strictEqual(invalidUpdateRes.status, 400, 'Expected 400 for updating ASSIGNED order');

    // 10-14. Issue Raw Metal & Inventory Stock to Karigar
    console.log('\n[TEST] 10-14. Issue Material to Karigar & Stock Movement Audit...');
    const issueRawRes = await request(
      'POST',
      `/job-work/orders/${testOrderId}/issue-material`,
      {
        itemType: 'RAW_METAL',
        description: '24K Gold Fine Bullion Issue',
        grossWeight: 50.000,
        netWeight: 50.000,
        purity: '999',
        fineWeight: 49.950,
      },
      karigarSupervisorToken
    );
    assert.strictEqual(issueRawRes.status, 201, 'Issue raw metal failed');

    const issueStockRes = await request(
      'POST',
      `/job-work/orders/${testOrderId}/issue-material`,
      {
        itemType: 'INVENTORY_ITEM',
        inventoryItemId: testInventoryItemId,
        description: 'Existing Gold Bangle for Alteration',
        grossWeight: 15.000,
        netWeight: 14.500,
        purity: '22K',
        fineWeight: 13.290,
      },
      karigarSupervisorToken
    );
    assert.strictEqual(issueStockRes.status, 201, 'Issue inventory stock failed');

    // Verify Inventory Item Status => ISSUED_TO_KARIGAR
    const checkInv = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    assert.strictEqual(checkInv?.status, 'ISSUED_TO_KARIGAR');

    // Verify Stock Movement Log
    const checkMove = await prisma.stockMovement.findFirst({
      where: { inventoryItemId: testInventoryItemId, movementType: 'ISSUED_TO_KARIGAR' },
    });
    assert.ok(checkMove, 'Stock movement log for ISSUED_TO_KARIGAR should exist');

    // 14. Reject issuing non-AVAILABLE item
    const dupIssueRes = await request(
      'POST',
      `/job-work/orders/${testOrderId}/issue-material`,
      {
        itemType: 'INVENTORY_ITEM',
        inventoryItemId: testInventoryItemId, // Already ISSUED_TO_KARIGAR
        description: 'Duplicate issue test',
        grossWeight: 15.000,
        netWeight: 14.500,
        purity: '22K',
        fineWeight: 13.290,
      },
      karigarSupervisorToken
    );
    assert.strictEqual(dupIssueRes.status, 409, 'Expected 409 Conflict for non-AVAILABLE item');

    // 15-19. Receive Finished Goods & Material Intake
    console.log('\n[TEST] 15-19. Receive Finished Goods from Karigar & Finished Intake...');
    const receiveRes = await request(
      'POST',
      `/job-work/orders/${testOrderId}/receive`,
      {
        itemName: 'Finished 22K Antique Necklace',
        grossWeight: 63.500,
        stoneWeight: 1.500,
        netWeight: 62.000,
        purity: '22K',
        fineWeight: 56.830,
        actualWastageWeight: 0.950,
        makingCharges: 24800.00,
        remarks: 'Crafting completed successfully',
        createInventoryItem: true,
        productId: testProductId,
      },
      karigarSupervisorToken
    );
    assert.strictEqual(receiveRes.status, 201, 'Receive job work failed');

    // Verify Order Status => COMPLETED
    const checkOrder = await prisma.jobWorkOrder.findUnique({ where: { id: testOrderId } });
    assert.strictEqual(checkOrder?.status, 'COMPLETED');
    assert.strictEqual(Number(checkOrder?.totalMakingCharges), 24800);

    // Verify Finished InventoryItem Tag Created
    const checkFinishedInv = await prisma.inventoryItem.findFirst({
      where: { itemCode: { startsWith: 'ITM-JW-' } },
      include: { tags: true },
    });
    assert.ok(checkFinishedInv, 'Finished product inventory item should be created');
    assert.strictEqual(checkFinishedInv.status, 'AVAILABLE');

    // 20-23. Cancellation Workflow & Guards
    console.log('\n[TEST] 20-23. Cancellation Workflow & Guards...');
    const cancelDraftRes = await request(
      'POST',
      '/job-work/orders',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        vendorId: testVendorId,
        targetItemName: 'Order to cancel',
      },
      karigarSupervisorToken
    );
    const draftId = cancelDraftRes.body.data.id;

    // Reject cancel without reason
    const noReasonRes = await request('POST', `/job-work/orders/${draftId}/cancel`, {}, karigarSupervisorToken);
    assert.strictEqual(noReasonRes.status, 400, 'Expected 400 for missing cancellationReason');

    // Cancel draft order
    const cancelSuccess = await request(
      'POST',
      `/job-work/orders/${draftId}/cancel`,
      { cancellationReason: 'Customer changed requirements' },
      karigarSupervisorToken
    );
    assert.strictEqual(cancelSuccess.status, 200);
    assert.strictEqual(cancelSuccess.body.data.status, 'CANCELLED');

    // Reject cancellation after materials issued
    const cancelIssuedRes = await request(
      'POST',
      `/job-work/orders/${testOrderId}/cancel`,
      { cancellationReason: 'Illegal cancel after completion' },
      karigarSupervisorToken
    );
    assert.strictEqual(cancelIssuedRes.status, 400, 'Expected 400 for cancelling order with issued materials');

    // 24-27. Get, List & Summary Endpoints
    console.log('\n[TEST] 24-27. GET & Karigar Ledger Summary Endpoints...');
    const getRes = await request('GET', `/job-work/orders/${testOrderId}`, undefined, staffToken);
    assert.strictEqual(getRes.status, 200);

    const listRes = await request('GET', '/job-work/orders?page=1&limit=5', undefined, staffToken);
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.body.data));

    const summaryRes = await request('GET', `/karigars/${testVendorId}/job-work-summary`, undefined, staffToken);
    assert.strictEqual(summaryRes.status, 200);
    assert.ok(summaryRes.body.data.totalOrders > 0);
    assert.ok(summaryRes.body.data.completedOrderCount > 0);

    console.log('\n======================================================');
    console.log('✓ ALL 27 SPRINT 5.6 KARIGAR JOB WORK TESTS PASSED');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n[FAIL] Test suite failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runTests();
