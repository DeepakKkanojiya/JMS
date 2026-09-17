import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { PurchaseOrderStatus } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let managerToken: string;
let accountantToken: string;
let staffToken: string; // Has only purchase.read and purchase.receipt.read

let testVendorId: string;
let testBranchId: string;
let testProductId: string;
let testPOId: string;
let testPOItemId: string;
let testReceiptId: string;

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
  console.log('RUNNING SPRINT 5.2 PURCHASE RECEIVING & INTAKE TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Authenticate users
    console.log('\n[TEST] Authenticating Users...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login failed');
    ownerToken = ownerRes.body.data.accessToken;

    const managerRes = await request('POST', '/auth/login', {
      email: 'manager@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(managerRes.status, 200, 'Manager login failed');
    managerToken = managerRes.body.data.accessToken;

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

    // 2. Fetch master data IDs
    console.log('\n[TEST] Fetching Master Data IDs...');
    const vendor = await prisma.vendor.findFirst();
    assert.ok(vendor, 'Need at least one vendor seeded');
    testVendorId = vendor.id;

    const branch = await prisma.branch.findFirst();
    assert.ok(branch, 'Need at least one branch seeded');
    testBranchId = branch.id;

    const product = await prisma.product.findFirst();
    assert.ok(product, 'Need at least one product seeded');
    testProductId = product.id;

    // 3. Create, Submit and Approve a Purchase Order to test receiving
    console.log('\n[TEST] Creating an APPROVED Purchase Order...');
    const poCreateRes = await request(
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
            itemName: 'Sprint 5.2 Test Gold Bangle',
            orderedQuantity: 2,
            grossWeight: 15.000,
            netWeight: 14.500,
            stoneWeight: 0.500,
            expectedRate: 6000.00,
            makingCharges: 1000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(poCreateRes.status, 201, 'PO creation failed');
    testPOId = poCreateRes.body.data.id;
    testPOItemId = poCreateRes.body.data.items[0].id;

    // Submit PO
    const poSubmitRes = await request('POST', `/purchases/${testPOId}/submit`, {}, ownerToken);
    assert.strictEqual(poSubmitRes.status, 200, 'PO submission failed');

    // Approve PO
    const poApproveRes = await request('POST', `/purchases/${testPOId}/approve`, {}, ownerToken);
    assert.strictEqual(poApproveRes.status, 200, 'PO approval failed');

    // 4. Test Receiving Permissions
    console.log('\n[TEST] Verifying permissions for receiving...');
    // Accountant tries to receive PO (should fail, only owner, admin, branch_manager have purchase.receive)
    const receiveAccountantRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 1,
            grossWeight: 15.000,
            netWeight: 14.500,
            stoneWeight: 0.500,
            purchaseRate: 6000.00,
            makingCharges: 1000.00,
            taxRate: 3.0,
          },
        ],
      },
      accountantToken
    );
    assert.strictEqual(receiveAccountantRes.status, 403, 'Accountant should be forbidden from receiving');

    // 5. Test validation rules (e.g. netWeight > grossWeight)
    console.log('\n[TEST] Verifying weight validations during receive...');
    const receiveValRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 1,
            grossWeight: 10.000,
            netWeight: 12.000, // Invalid: netWeight > grossWeight
            stoneWeight: 0.000,
            purchaseRate: 6000.00,
            makingCharges: 1000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(receiveValRes.status, 400, 'Should reject receipt when netWeight > grossWeight');

    // 6. Test successful Partial Receiving (1 of 2 ordered items)
    console.log('\n[TEST] Executing partial receive (1 of 2 ordered items)...');
    const partialReceiveRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        remarks: 'Partial intake test',
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 1,
            grossWeight: 15.000,
            netWeight: 14.500,
            stoneWeight: 0.500,
            purchaseRate: 6000.00,
            makingCharges: 1000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(partialReceiveRes.status, 201, 'Partial receive failed');
    assert.strictEqual(partialReceiveRes.body.data.purchaseOrderStatus, 'RECEIVING', 'PO status should be RECEIVING');
    testReceiptId = partialReceiveRes.body.data.receipt.id;

    // Verify inventory item was created
    const createdInvItems = await prisma.inventoryItem.findMany({
      where: { purchaseReceiptItemId: partialReceiveRes.body.data.receipt.items?.[0]?.id },
      include: { tags: true, stockMovements: true },
    });
    // Wait, let's look up by the receipt ID we just got since we created 1 item
    const dbReceipt = await prisma.purchaseReceipt.findUnique({
      where: { id: testReceiptId },
      include: { items: { include: { inventoryItems: { include: { tags: true, stockMovements: true } } } } },
    });
    assert.ok(dbReceipt, 'Receipt not found in database');
    assert.strictEqual(dbReceipt.items.length, 1, 'Should have 1 receipt item');
    assert.strictEqual(dbReceipt.items[0].inventoryItems.length, 1, 'Should have created 1 inventory item');

    const invItem = dbReceipt.items[0].inventoryItems[0];
    assert.strictEqual(invItem.status, 'AVAILABLE', 'Inventory status should be AVAILABLE');
    assert.ok(invItem.itemCode, 'Inventory itemCode should be generated');
    assert.ok(invItem.tags.length > 0, 'InventoryTag should be created');
    assert.ok(invItem.tags[0].barcode, 'Barcode should be generated');

    // Check StockMovement created
    const sm = await prisma.stockMovement.findFirst({
      where: { inventoryItemId: invItem.id },
    });
    assert.ok(sm, 'Stock movement not created');
    assert.strictEqual(sm.movementType, 'STOCK_IN', 'Movement type should be STOCK_IN');
    assert.strictEqual(sm.referenceType, 'PURCHASE_ORDER', 'Reference type should be PURCHASE_ORDER');
    assert.strictEqual(sm.referenceId, testPOId, 'Reference ID should match PO ID');

    // 7. Test Concurrency/Over-receiving protection
    console.log('\n[TEST] Verifying concurrency protection (cannot exceed remaining quantity)...');
    const overReceiveRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 2, // Only 1 remaining, this should fail!
            grossWeight: 15.000,
            netWeight: 14.500,
            stoneWeight: 0.500,
            purchaseRate: 6000.00,
            makingCharges: 1000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(overReceiveRes.status, 400, 'Should reject receive request exceeding remaining quantity');

    // 8. Complete the receiving (remaining 1 item)
    console.log('\n[TEST] Complete receiving (remaining 1 item)...');
    const completeReceiveRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        remarks: 'Completing PO intake',
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 1,
            grossWeight: 15.000,
            netWeight: 14.500,
            stoneWeight: 0.500,
            purchaseRate: 6000.00,
            makingCharges: 1000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(completeReceiveRes.status, 201, 'Complete receive failed');
    assert.strictEqual(completeReceiveRes.body.data.purchaseOrderStatus, 'COMPLETED', 'PO status should be COMPLETED');

    // 9. Fetch Receipts List by PO
    console.log('\n[TEST] Listing receipts by Purchase Order...');
    const listReceiptsByPORes = await request('GET', `/purchases/${testPOId}/receipts`, undefined, ownerToken);
    assert.strictEqual(listReceiptsByPORes.status, 200);
    assert.strictEqual(listReceiptsByPORes.body.data.length, 2, 'Should have 2 receipts for this PO');

    // 10. Fetch Single Receipt by PO & Receipt ID
    console.log('\n[TEST] Fetching single receipt detail by PO & Receipt ID...');
    const getReceiptByPORes = await request('GET', `/purchases/${testPOId}/receipts/${testReceiptId}`, undefined, ownerToken);
    assert.strictEqual(getReceiptByPORes.status, 200);
    assert.strictEqual(getReceiptByPORes.body.data.id, testReceiptId);

    // 11. Fetch Global Receipts List
    console.log('\n[TEST] Listing all purchase receipts globally...');
    const listGlobalReceiptsRes = await request('GET', `/purchase-receipts`, undefined, ownerToken);
    assert.strictEqual(listGlobalReceiptsRes.status, 200);
    assert.ok(listGlobalReceiptsRes.body.data.length > 0);

    // 12. Fetch Single Receipt Detail globally
    console.log('\n[TEST] Fetching single receipt detail by global endpoint...');
    const getGlobalReceiptRes = await request('GET', `/purchase-receipts/${testReceiptId}`, undefined, ownerToken);
    assert.strictEqual(getGlobalReceiptRes.status, 200);
    assert.strictEqual(getGlobalReceiptRes.body.data.id, testReceiptId);

    // 13. Read permissions test
    console.log('\n[TEST] Verifying read permissions for staff...');
    const listGlobalReceiptsStaffRes = await request('GET', `/purchase-receipts`, undefined, staffToken);
    assert.strictEqual(listGlobalReceiptsStaffRes.status, 200, 'Staff should be allowed to read receipts');

    console.log('\n✓ ALL SPRINT 5.2 PURCHASE RECEIVING & INTAKE TESTS PASSED SUCCESSFULLY.');
  } catch (error) {
    console.error('\n[FAIL] Test execution failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

if (require.main === module) {
  runTests();
}
