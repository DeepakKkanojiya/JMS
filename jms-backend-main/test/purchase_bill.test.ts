import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { PurchaseOrderStatus, PurchaseBillStatus } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let managerToken: string;
let accountantToken: string;
let staffToken: string; // Only read permission

let testVendorId: string;
let testBranchId: string;
let testProductId: string;
let testPOId: string;
let testPOItemId: string;
let testReceiptId: string;
let testReceiptItemId: string;
let testInventoryItemId: string;
let testBillId: string;

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
  console.log('RUNNING SPRINT 5.3 PURCHASE BILLING & COSTING TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Authentication Setup
    console.log('\n[TEST] 1. Authentication & Token Acquisition...');
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

    // Fetch Master Data
    const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
    assert.ok(vendor, 'Need active vendor');
    testVendorId = vendor.id;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch, 'Need active branch');
    testBranchId = branch.id;

    const product = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(product, 'Need active product');
    testProductId = product.id;

    // Setup PO and Receive Stock (5 units)
    console.log('\n[TEST] Setting up PO and Physical Receiving intake (5 units)...');
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
            itemName: 'Sprint 5.3 Test Gold Necklace',
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

    // Receive 5 units against PO
    const receiveRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        remarks: 'Received 5 units for Sprint 5.3 billing test',
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 5,
            grossWeight: 20.000,
            netWeight: 19.000,
            stoneWeight: 1.000,
            fineWeight: 17.417,
            purchaseRate: 6000.00,
            makingCharges: 2000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(receiveRes.status, 201, 'PO receiving failed');
    testReceiptId = receiveRes.body.data.receipt.id;

    const fetchedReceipt = await prisma.purchaseReceipt.findUnique({
      where: { id: testReceiptId },
      include: { items: { include: { inventoryItems: true } } },
    });
    assert.ok(fetchedReceipt);
    testReceiptItemId = fetchedReceipt.items[0].id;
    testInventoryItemId = fetchedReceipt.items[0].inventoryItems[0].id;

    // 2. RBAC Permissions Validation
    console.log('\n[TEST] 2. RBAC & Unauthorized Access Validation...');
    const unauthRes = await request('POST', '/purchase-bills', {});
    assert.strictEqual(unauthRes.status, 401, 'Expected 401 Unauthorized for missing token');

    const forbiddenRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [{ itemName: 'Test Item', quantity: 1, purchaseRate: 1000 }],
      },
      staffToken
    );
    assert.strictEqual(forbiddenRes.status, 403, 'Expected 403 Forbidden for staff missing purchase_bill.create');

    // 3. Validation Rules (Invalid PO, Vendor, Branch, Quantity)
    console.log('\n[TEST] 4-7. Input Validation & Entity Matching (Invalid PO, Vendor, Branch, Quantity)...');
    const fakeUuid = '00000000-0000-4000-a000-000000000000';

    const invalidPORes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: fakeUuid,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [{ itemName: 'Test Item', quantity: 1, purchaseRate: 1000 }],
      },
      ownerToken
    );
    assert.strictEqual(invalidPORes.status, 404, 'Expected 404 for invalid PO');

    const fakeVendorId = '11111111-1111-4111-a111-111111111111';
    const invalidVendorRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: fakeVendorId,
        branchId: testBranchId,
        items: [{ itemName: 'Test Item', quantity: 1, purchaseRate: 1000 }],
      },
      ownerToken
    );
    assert.strictEqual(invalidVendorRes.status, 400, 'Expected 400 for vendor mismatch');

    const fakeBranchId = '22222222-2222-4222-a222-222222222222';
    const invalidBranchRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: fakeBranchId,
        items: [{ itemName: 'Test Item', quantity: 1, purchaseRate: 1000 }],
      },
      ownerToken
    );
    assert.strictEqual(invalidBranchRes.status, 400, 'Expected 400 for branch mismatch');

    const invalidQtyRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [{ itemName: 'Test Item', quantity: 0, purchaseRate: 1000 }],
      },
      ownerToken
    );
    assert.strictEqual(invalidQtyRes.status, 400, 'Expected 400 for quantity <= 0');

    // 8-9. Over-Billing Protection
    console.log('\n[TEST] 8-9. Over-Billing Protection (Billing > Received)...');
    const overBillRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            itemName: 'Sprint 5.3 Test Gold Necklace',
            quantity: 6, // Received is 5
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
    assert.strictEqual(overBillRes.status, 409, 'Expected 409 Conflict for billing > received quantity');

    // 3 & 10-14. Create Partial DRAFT Bill (2 units) & Verify Calculations
    console.log('\n[TEST] 3, 10-14. Create Partial DRAFT Bill (2 units) & Decimal/Tax Calculations...');
    // Net Weight = 19.000, Rate = 6000 => Metal Value = 114,000.00
    // Making Charges = 2000.00 => Taxable Amount = 116,000.00
    // Tax (3%) = 3,480.00 => Line Total = 119,480.00
    const createBillRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        discountAmount: 480.00,
        notes: 'Partial bill 1 for 2 units',
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            purchaseReceiptItemId: testReceiptItemId,
            inventoryItemId: testInventoryItemId,
            itemName: 'Sprint 5.3 Test Gold Necklace',
            quantity: 2,
            grossWeight: 20.000,
            netWeight: 19.000,
            stoneWeight: 1.000,
            purchaseRate: 6000.00,
            makingCharges: 2000.00,
            discountAmount: 0.00,
            taxRate: 3.0,
          },
        ],
      },
      accountantToken
    );
    assert.strictEqual(createBillRes.status, 201, 'Bill creation failed');
    assert.strictEqual(createBillRes.body.data.status, 'DRAFT');
    testBillId = createBillRes.body.data.id;
    assert.strictEqual(Number(createBillRes.body.data.subtotal), 116000);
    assert.strictEqual(Number(createBillRes.body.data.taxAmount), 3480);
    // Grand Total = 116000 + 3480 - 480 = 119000
    assert.strictEqual(Number(createBillRes.body.data.grandTotal), 119000);
    assert.strictEqual(Number(createBillRes.body.data.totalPaid), 0);
    assert.strictEqual(Number(createBillRes.body.data.outstandingAmount), 119000);

    // 29. Duplicate Physical Inventory Protection
    console.log('\n[TEST] 29. Duplicate Physical Inventory Protection...');
    const dupInvRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            inventoryItemId: testInventoryItemId, // Already referenced in active draft bill
            itemName: 'Sprint 5.3 Test Gold Necklace',
            quantity: 1,
            grossWeight: 10.000,
            netWeight: 9.000,
            purchaseRate: 6000.00,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(dupInvRes.status, 409, 'Expected 409 Conflict for duplicate inventory item');

    // 10. Create Second Partial Bill (3 units - remaining)
    console.log('\n[TEST] 10. Create Second Partial Bill (Remaining 3 units)...');
    const bill2Res = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            itemName: 'Sprint 5.3 Test Gold Necklace',
            quantity: 3,
            grossWeight: 30.000,
            netWeight: 28.500,
            stoneWeight: 1.500,
            purchaseRate: 6000.00,
            makingCharges: 3000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(bill2Res.status, 201, 'Second partial bill creation failed');
    const bill2Id = bill2Res.body.data.id;

    // Now remaining billable quantity is 0 (2 + 3 = 5 received)
    const exceedPartialRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            itemName: 'Sprint 5.3 Test Gold Necklace',
            quantity: 1,
            grossWeight: 10.000,
            netWeight: 9.500,
            purchaseRate: 6000.00,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(exceedPartialRes.status, 409, 'Expected 409 Conflict when exceeding cumulative received quantity');

    // Cancel second bill to free up remaining 3 units for further tests
    await request('POST', `/purchase-bills/${bill2Id}/cancel`, { cancellationReason: 'Test cleanup' }, ownerToken);

    // 15. Draft Update
    console.log('\n[TEST] 15. Update DRAFT Bill...');
    const updateBillRes = await request(
      'PUT',
      `/purchase-bills/${testBillId}`,
      {
        notes: 'Updated DRAFT Purchase Bill notes',
        discountAmount: 0.00,
      },
      accountantToken
    );
    assert.strictEqual(updateBillRes.status, 200, 'Update draft bill failed');
    assert.strictEqual(Number(updateBillRes.body.data.grandTotal), 119480);

    // 16. Submit State Transition (DRAFT -> SUBMITTED)
    console.log('\n[TEST] 16. Submit Bill (DRAFT -> SUBMITTED)...');
    const submitRes = await request('POST', `/purchase-bills/${testBillId}/submit`, {}, accountantToken);
    assert.strictEqual(submitRes.status, 200, 'Submit bill failed');
    assert.strictEqual(submitRes.body.data.status, 'SUBMITTED');

    // 18. Invalid State Transition (Cannot update SUBMITTED bill)
    console.log('\n[TEST] 18. Invalid State Transitions (Updating SUBMITTED bill)...');
    const invalidUpdateRes = await request('PUT', `/purchase-bills/${testBillId}`, { notes: 'Attempt update' }, ownerToken);
    assert.strictEqual(invalidUpdateRes.status, 400, 'Expected 400 for updating non-DRAFT bill');

    // 17. Approve State Transition (SUBMITTED -> APPROVED)
    console.log('\n[TEST] 17. Approve Bill (SUBMITTED -> APPROVED)...');
    const approveRes = await request('POST', `/purchase-bills/${testBillId}/approve`, {}, ownerToken);
    assert.strictEqual(approveRes.status, 200, 'Approve bill failed');
    assert.strictEqual(approveRes.body.data.status, 'APPROVED');

    // 20. Approved Bill Immutability & Cancellation Prevention
    console.log('\n[TEST] 20. Approved Bill Immutability & Cancellation Prevention...');
    const cancelApprovedRes = await request('POST', `/purchase-bills/${testBillId}/cancel`, { cancellationReason: 'Illegal cancel' }, ownerToken);
    assert.strictEqual(cancelApprovedRes.status, 400, 'Expected 400 when attempting to cancel APPROVED bill');

    // 19. Cancel Workflow (on a new draft bill)
    console.log('\n[TEST] 19. Cancel DRAFT Bill Workflow with Reason...');
    const draftToCancelRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            itemName: 'Sprint 5.3 Test Gold Necklace',
            quantity: 1,
            grossWeight: 10.000,
            netWeight: 9.500,
            purchaseRate: 6000.00,
          },
        ],
      },
      ownerToken
    );
    const cancelDraftId = draftToCancelRes.body.data.id;

    const noReasonCancelRes = await request('POST', `/purchase-bills/${cancelDraftId}/cancel`, {}, ownerToken);
    assert.strictEqual(noReasonCancelRes.status, 400, 'Expected 400 for missing cancellationReason');

    const cancelSuccessRes = await request(
      'POST',
      `/purchase-bills/${cancelDraftId}/cancel`,
      { cancellationReason: 'Duplicate bill created in error' },
      ownerToken
    );
    assert.strictEqual(cancelSuccessRes.status, 200, 'Cancel bill failed');
    assert.strictEqual(cancelSuccessRes.body.data.status, 'CANCELLED');

    // 21-26. Filtering, Pagination, Search & Summary API Endpoints
    console.log('\n[TEST] 21-26. List Filtering, Pagination, Search & Financial Summary...');

    const getByIdRes = await request('GET', `/purchase-bills/${testBillId}`, undefined, staffToken);
    assert.strictEqual(getByIdRes.status, 200);

    const listRes = await request('GET', '/purchase-bills?page=1&limit=5', undefined, staffToken);
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.pagination);

    const vendorFilterRes = await request('GET', `/purchase-bills?vendorId=${testVendorId}`, undefined, staffToken);
    assert.strictEqual(vendorFilterRes.status, 200);

    const branchFilterRes = await request('GET', `/purchase-bills?branchId=${testBranchId}`, undefined, staffToken);
    assert.strictEqual(branchFilterRes.status, 200);

    const poFilterRes = await request('GET', `/purchase-bills?purchaseOrderId=${testPOId}`, undefined, staffToken);
    assert.strictEqual(poFilterRes.status, 200);

    const poBillsRes = await request('GET', `/purchases/${testPOId}/bills`, undefined, staffToken);
    assert.strictEqual(poBillsRes.status, 200);

    const vendorBillsRes = await request('GET', `/vendors/${testVendorId}/purchase-bills`, undefined, staffToken);
    assert.strictEqual(vendorBillsRes.status, 200);

    const summaryRes = await request('GET', `/purchase-bills/${testBillId}/summary`, undefined, staffToken);
    assert.strictEqual(summaryRes.status, 200);
    assert.strictEqual(Number(summaryRes.body.data.grandTotal), 119480);
    assert.strictEqual(Number(summaryRes.body.data.totalPaid), 0);
    assert.strictEqual(Number(summaryRes.body.data.outstandingAmount), 119480);

    console.log('\n======================================================');
    console.log('✓ ALL 29 SPRINT 5.3 PURCHASE BILLING TESTS PASSED');
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
