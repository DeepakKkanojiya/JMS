import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let accountantToken: string;
let staffToken: string;

let testVendorId: string;
let testBranchId: string;
let testProductId: string;
let testPOId: string;
let testPOItemId: string;
let testReceiptId: string;
let testReceiptItemId: string;
let testBillId: string;
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
  console.log('RUNNING SPRINT 5.5 PURCHASE RETURNS & DEBIT NOTES TESTS');
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

    const accountantRes = await request('POST', '/auth/login', {
      email: 'accountant@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(accountantRes.status, 200, 'Accountant login failed');
    accountantToken = accountantRes.body.data.accessToken;

    const staffRes = await request('POST', '/auth/login', {
      email: 'staff@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(staffRes.status, 200, 'Staff login failed');
    staffToken = staffRes.body.data.accessToken;

    // Unauthenticated check
    const unauthRes = await request('POST', '/purchase-returns', {});
    assert.strictEqual(unauthRes.status, 401, 'Expected 401 for unauthenticated request');

    // Fetch Master Data
    const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
    assert.ok(vendor);
    testVendorId = vendor.id;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch);
    testBranchId = branch.id;

    const product = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(product);
    testProductId = product.id;

    // Create PO, Physical Receiving, and Approved Purchase Bill
    console.log('\n[TEST] Setting up Purchase Order, Physical Receiving & Bill...');
    const poRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            productId: testProductId,
            metalType: 'GOLD',
            purity: '22K',
            itemName: 'Sprint 5.5 Defective Necklace',
            orderedQuantity: 5,
            grossWeight: 20.000,
            netWeight: 19.000,
            stoneWeight: 1.000,
            expectedRate: 6000.00,
            makingCharges: 2000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(poRes.status, 201);
    testPOId = poRes.body.data.id;
    testPOItemId = poRes.body.data.items[0].id;

    await request('POST', `/purchases/${testPOId}/submit`, {}, ownerToken);
    await request('POST', `/purchases/${testPOId}/approve`, {}, ownerToken);

    const receiveRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        remarks: 'Received 5 units for return test',
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 5,
            grossWeight: 20.000,
            netWeight: 19.000,
            stoneWeight: 1.000,
            fineWeight: 17.500,
            purchaseRate: 6000.00,
            makingCharges: 2000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(receiveRes.status, 201);

    const fetchedReceipt = await prisma.purchaseReceipt.findFirst({
      where: { purchaseOrderId: testPOId },
      include: { items: true },
    });
    assert.ok(fetchedReceipt);
    testReceiptId = fetchedReceipt.id;
    testReceiptItemId = fetchedReceipt.items[0].id;

    const invItem = await prisma.inventoryItem.findFirst({
      where: { purchaseReceiptItem: { purchaseReceiptId: testReceiptId } },
    });
    assert.ok(invItem, 'Need created inventory item for intake test');
    testInventoryItemId = invItem.id;

    const billRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            purchaseReceiptItemId: testReceiptItemId,
            inventoryItemId: testInventoryItemId,
            itemName: 'Sprint 5.5 Defective Necklace',
            quantity: 5,
            grossWeight: 20.000,
            netWeight: 19.000,
            stoneWeight: 1.000,
            purchaseRate: 6000.00,
            makingCharges: 2000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(billRes.status, 201);
    testBillId = billRes.body.data.id;

    await request('POST', `/purchase-bills/${testBillId}/submit`, {}, ownerToken);
    await request('POST', `/purchase-bills/${testBillId}/approve`, {}, ownerToken);

    // 3-8. Create Draft Return & Validations
    console.log('\n[TEST] 3-8. Create Draft Purchase Return & Validation Guards...');
    const staffCreateRes = await request(
      'POST',
      '/purchase-returns',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [{ itemName: 'Test', quantity: 1, grossWeight: 10, netWeight: 9.5, purchaseRate: 6000 }],
      },
      staffToken
    );
    assert.strictEqual(staffCreateRes.status, 403, 'Expected 403 Forbidden for staff missing purchase_return.create');

    const emptyItemsRes = await request(
      'POST',
      '/purchase-returns',
      { vendorId: testVendorId, branchId: testBranchId, items: [] },
      accountantToken
    );
    assert.strictEqual(emptyItemsRes.status, 400, 'Expected 400 for empty return items');

    const draftReturnRes = await request(
      'POST',
      '/purchase-returns',
      {
        purchaseBillId: testBillId,
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        reason: 'DEFECTIVE_CLASP',
        notes: 'Clasp is broken on received necklace',
        items: [
          {
            inventoryItemId: testInventoryItemId,
            itemName: 'Sprint 5.5 Defective Necklace',
            quantity: 1,
            grossWeight: 20.000,
            netWeight: 19.000,
            stoneWeight: 1.000,
            purchaseRate: 6000.00,
            makingCharges: 2000.00,
            taxRate: 3.0,
          },
        ],
      },
      accountantToken
    );
    assert.strictEqual(draftReturnRes.status, 201, 'Create draft purchase return failed');
    assert.strictEqual(draftReturnRes.body.data.status, 'DRAFT');
    assert.ok(draftReturnRes.body.data.returnNumber.startsWith('PR-'));
    const testReturnId = draftReturnRes.body.data.id;

    // 9. Update Draft Return
    console.log('\n[TEST] 9. Update DRAFT Purchase Return...');
    const updateReturnRes = await request(
      'PUT',
      `/purchase-returns/${testReturnId}`,
      { notes: 'Updated notes: Vendor agreed to accept return' },
      accountantToken
    );
    assert.strictEqual(updateReturnRes.status, 200);
    assert.strictEqual(updateReturnRes.body.data.notes, 'Updated notes: Vendor agreed to accept return');

    // 10 & 11. Submit State Transition (DRAFT -> SUBMITTED)
    console.log('\n[TEST] 10-11. Submit Purchase Return & Reject Update on SUBMITTED...');
    const submitRes = await request('POST', `/purchase-returns/${testReturnId}/submit`, {}, accountantToken);
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitRes.body.data.status, 'SUBMITTED');

    const invalidUpdateRes = await request('PUT', `/purchase-returns/${testReturnId}`, { notes: 'Illegal update' }, ownerToken);
    assert.strictEqual(invalidUpdateRes.status, 400, 'Expected 400 for updating SUBMITTED return');

    // 12 & 13. Approve State Transition (SUBMITTED -> APPROVED)
    console.log('\n[TEST] 12-13. Approve Purchase Return...');
    const approveRes = await request('POST', `/purchase-returns/${testReturnId}/approve`, {}, ownerToken);
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.data.status, 'APPROVED');

    // 14-20. Process Return, Inventory Intake Removal, StockMovement & Debit Note Generation
    console.log('\n[TEST] 14-20. Process Approved Return (Inventory Intake Removal, StockMovement, Debit Note)...');
    const processRes = await request('POST', `/purchase-returns/${testReturnId}/process`, {}, ownerToken);
    assert.strictEqual(processRes.status, 200, 'Process return failed');
    assert.strictEqual(processRes.body.data.status, 'PROCESSED');
    assert.ok(processRes.body.debitNote);
    assert.ok(processRes.body.debitNote.debitNoteNumber.startsWith('DN-'));
    assert.strictEqual(Number(processRes.body.debitNote.amount), 119480);
    const testDebitNoteId = processRes.body.debitNote.id;

    // Verify Inventory Item Status => RETURNED_TO_VENDOR
    const checkInvItem = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    assert.strictEqual(checkInvItem?.status, 'RETURNED_TO_VENDOR', 'Inventory status should be RETURNED_TO_VENDOR');

    // Verify Stock Movement Record Created
    const checkStockMove = await prisma.stockMovement.findFirst({
      where: { referenceId: testReturnId, movementType: 'PURCHASE_RETURN' },
    });
    assert.ok(checkStockMove, 'Stock movement log for PURCHASE_RETURN should exist');

    // 20. Reject processing if inventory item is already RETURNED_TO_VENDOR
    console.log('\n[TEST] 20. Reject processing on non-AVAILABLE inventory item...');
    // Create another return for the same inventory item
    const ret2Res = await request(
      'POST',
      '/purchase-returns',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            inventoryItemId: testInventoryItemId, // Already RETURNED_TO_VENDOR
            itemName: 'Sprint 5.5 Defective Necklace',
            quantity: 1,
            grossWeight: 20.000,
            netWeight: 19.000,
            purchaseRate: 6000.00,
          },
        ],
      },
      ownerToken
    );
    const ret2Id = ret2Res.body.data.id;
    await request('POST', `/purchase-returns/${ret2Id}/submit`, {}, ownerToken);
    await request('POST', `/purchase-returns/${ret2Id}/approve`, {}, ownerToken);
    const processDupRes = await request('POST', `/purchase-returns/${ret2Id}/process`, {}, ownerToken);
    assert.strictEqual(processDupRes.status, 409, 'Expected 409 Conflict for non-AVAILABLE inventory item');

    // 21-25. Cancellation Workflow & Guards
    console.log('\n[TEST] 21-25. Cancellation Workflow & Guards...');
    const cancelDraftRes = await request(
      'POST',
      '/purchase-returns',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [{ itemName: 'Item to cancel', quantity: 1, grossWeight: 10, netWeight: 9.5, purchaseRate: 6000 }],
      },
      ownerToken
    );
    const draftCancelId = cancelDraftRes.body.data.id;

    // 23. Reject cancel without reason
    const noReasonCancelRes = await request('POST', `/purchase-returns/${draftCancelId}/cancel`, {}, ownerToken);
    assert.strictEqual(noReasonCancelRes.status, 400, 'Expected 400 for missing cancellationReason');

    // 21. Cancel draft return
    const cancelSuccessRes = await request(
      'POST',
      `/purchase-returns/${draftCancelId}/cancel`,
      { cancellationReason: 'Created by mistake' },
      ownerToken
    );
    assert.strictEqual(cancelSuccessRes.status, 200);
    assert.strictEqual(cancelSuccessRes.body.data.status, 'CANCELLED');

    // 25. Reject cancellation on PROCESSED return
    const cancelProcessedRes = await request(
      'POST',
      `/purchase-returns/${testReturnId}/cancel`,
      { cancellationReason: 'Illegal cancel on processed' },
      ownerToken
    );
    assert.strictEqual(cancelProcessedRes.status, 400, 'Expected 400 for cancelling PROCESSED return');

    // 26-31. Get & List Endpoints for Purchase Returns and Vendor Debit Notes
    console.log('\n[TEST] 26-31. GET & List Endpoints for Returns and Vendor Debit Notes...');

    const getReturnRes = await request('GET', `/purchase-returns/${testReturnId}`, undefined, staffToken);
    assert.strictEqual(getReturnRes.status, 200);

    const listReturnsRes = await request('GET', '/purchase-returns?page=1&limit=5', undefined, staffToken);
    assert.strictEqual(listReturnsRes.status, 200);
    assert.ok(Array.isArray(listReturnsRes.body.data));

    const filterReturnsRes = await request('GET', `/purchase-returns?vendorId=${testVendorId}`, undefined, staffToken);
    assert.strictEqual(filterReturnsRes.status, 200);

    const getDNRes = await request('GET', `/vendor-debit-notes/${testDebitNoteId}`, undefined, staffToken);
    assert.strictEqual(getDNRes.status, 200);

    const listDNRes = await request('GET', '/vendor-debit-notes?page=1&limit=5', undefined, staffToken);
    assert.strictEqual(listDNRes.status, 200);
    assert.ok(Array.isArray(listDNRes.body.data));

    const vendorDNRes = await request('GET', `/vendors/${testVendorId}/debit-notes`, undefined, staffToken);
    assert.strictEqual(vendorDNRes.status, 200);

    console.log('\n======================================================');
    console.log('✓ ALL 30 SPRINT 5.5 PURCHASE RETURN TESTS PASSED');
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
