import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let managerToken: string;
let accountantToken: string;
let noPermToken: string;
let testVendorId: string;
let testBranchId: string;
let testProductId: string;
let createdPurchaseOrderId: string;
let createdPurchaseOrderNumber: string;

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

async function runPurchaseOrderTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 5.1 PURCHASE FOUNDATION API TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Authenticate users to obtain tokens
    console.log('\n[TEST 1] Authenticating Owner, Manager, Accountant, and Staff User...');
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

    // Staff has only purchase.read, no purchase.create/update/submit/approve/cancel
    const staffRes = await request('POST', '/auth/login', {
      email: 'staff@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(staffRes.status, 200, 'Staff login failed');
    noPermToken = staffRes.body.data.accessToken;
    console.log('[PASS] Authentication & Tokens retrieved.');

    // 2. Fetch seed Master Data (Vendor, Branch, Product)
    console.log('\n[TEST 2] Fetching Seed Vendor, Branch, and Product...');
    const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
    assert.ok(vendor, 'Seed vendor not found');
    testVendorId = vendor.id;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch, 'Seed branch not found');
    testBranchId = branch.id;

    const product = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(product, 'Seed product not found');
    testProductId = product.id;
    console.log(`[PASS] Using Vendor: ${vendor.companyName}, Branch: ${branch.name}, Product: ${product.name}`);

    // 3. Security & RBAC: Attempt creating PO without auth
    console.log('\n[TEST 3] Security: Reject unauthenticated PO creation...');
    const unauthRes = await request('POST', '/purchases', {
      vendorId: testVendorId,
      branchId: testBranchId,
      items: [
        {
          metalType: 'GOLD',
          purity: '22K',
          itemName: 'Test Bangle',
          grossWeight: 50,
          netWeight: 48,
          expectedRate: 6500,
        },
      ],
    });
    assert.strictEqual(unauthRes.status, 401, 'Expected 401 Unauthorized for missing token');
    console.log('[PASS] Unauthenticated request rejected with 401.');

    // 4. Security & RBAC: Attempt creating PO without create permission
    console.log('\n[TEST 4] Security: Reject PO creation for user without purchase.create...');
    const forbiddenRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            metalType: 'GOLD',
            purity: '22K',
            itemName: 'Test Bangle',
            grossWeight: 50,
            netWeight: 48,
            expectedRate: 6500,
          },
        ],
      },
      noPermToken
    );
    assert.strictEqual(forbiddenRes.status, 403, 'Expected 403 Forbidden for missing permission');
    console.log('[PASS] Forbidden request rejected with 403.');

    // 5. Validation: Reject invalid weights (netWeight > grossWeight)
    console.log('\n[TEST 5] Validation: Reject line item where netWeight > grossWeight...');
    const invalidWeightRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            metalType: 'GOLD',
            purity: '22K',
            itemName: 'Invalid Weight Item',
            grossWeight: 40,
            netWeight: 50, // Invalid: > 40
            expectedRate: 6500,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(invalidWeightRes.status, 400, 'Expected 400 Bad Request for invalid weights');
    console.log('[PASS] Invalid weight rejected with 400.');

    // 6. Validation: Reject empty line items
    console.log('\n[TEST 6] Validation: Reject PO with empty items array...');
    const emptyItemsRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [],
      },
      ownerToken
    );
    assert.strictEqual(emptyItemsRes.status, 400, 'Expected 400 for empty line items');
    console.log('[PASS] Empty line items rejected with 400.');

    // 7. Validation: Reject non-existent vendor / branch
    console.log('\n[TEST 7] Validation: Reject non-existent vendor ID...');
    const invalidVendorRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: '00000000-0000-0000-0000-000000000000',
        branchId: testBranchId,
        items: [
          {
            metalType: 'GOLD',
            purity: '22K',
            itemName: 'Test Item',
            grossWeight: 20,
            netWeight: 19.5,
            expectedRate: 6500,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(invalidVendorRes.status, 404, 'Expected 404 for non-existent vendor');
    console.log('[PASS] Non-existent vendor rejected with 404.');

    // 8. Positive: Create Valid DRAFT Purchase Order with Server-Side Calculations
    console.log('\n[TEST 8] Creation: Create valid DRAFT Purchase Order with 2 line items...');
    // Item 1: netWeight 48.5g * rate 6800 + makingCharges 2000 = 329,800 + 2000 = 331,800. taxRate 3% = 9,954. Item Total = 341,754
    // Item 2: netWeight 20.0g * rate 6800 + makingCharges 1000 = 136,000 + 1000 = 137,000. taxRate 3% = 4,110. Item Total = 141,110
    // Expected Subtotal = 331,800 + 137,000 = 468,800.00
    // Expected Tax = 9,954 + 4,110 = 14,064.00
    // Expected Grand Total = 482,864.00
    const createRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        notes: 'Sprint 5.1 Test PO Draft Creation',
        termsConditions: '30 Days credit upon purity verification',
        items: [
          {
            productId: testProductId,
            metalType: 'GOLD',
            purity: '22K',
            itemName: '22K Gold Bangle Set',
            description: 'Handcrafted floral filigree',
            orderedQuantity: 2,
            grossWeight: 50.0,
            netWeight: 48.5,
            stoneWeight: 1.5,
            expectedRate: 6800.0,
            makingCharges: 2000.0,
            taxRate: 3.0,
          },
          {
            metalType: 'GOLD',
            purity: '22K',
            itemName: '22K Gold Ring',
            grossWeight: 20.0,
            netWeight: 20.0,
            stoneWeight: 0.0,
            expectedRate: 6800.0,
            makingCharges: 1000.0,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );

    assert.strictEqual(createRes.status, 201, `Create PO failed: ${JSON.stringify(createRes.body)}`);
    assert.strictEqual(createRes.body.success, true);
    assert.ok(createRes.body.data.id, 'PO ID missing');
    assert.strictEqual(createRes.body.data.status, 'DRAFT');
    assert.ok(createRes.body.data.purchaseOrderNumber.startsWith('PO-'), 'PO Number format invalid');
    assert.strictEqual(Number(createRes.body.data.subtotal), 468800.0);
    assert.strictEqual(Number(createRes.body.data.taxAmount), 14064.0);
    assert.strictEqual(Number(createRes.body.data.grandTotal), 482864.0);
    assert.strictEqual(createRes.body.data.items.length, 2);

    createdPurchaseOrderId = createRes.body.data.id;
    createdPurchaseOrderNumber = createRes.body.data.purchaseOrderNumber;
    console.log(`[PASS] PO created in DRAFT: ${createdPurchaseOrderNumber} (Grand Total: ${createRes.body.data.grandTotal})`);

    // 9. Retrieval: Get Purchase Order by ID
    console.log('\n[TEST 9] Retrieval: Get Purchase Order details by ID...');
    const getRes = await request('GET', `/purchases/${createdPurchaseOrderId}`, undefined, managerToken);
    assert.strictEqual(getRes.status, 200, 'Get PO by ID failed');
    assert.strictEqual(getRes.body.data.id, createdPurchaseOrderId);
    assert.strictEqual(getRes.body.data.vendorId, testVendorId);
    assert.strictEqual(getRes.body.data.branchId, testBranchId);
    assert.strictEqual(getRes.body.data.items.length, 2);
    console.log('[PASS] PO details retrieved successfully.');

    // 10. List & Filters: Query PO list with vendor, branch, and status filters
    console.log('\n[TEST 10] Listing: List POs with search and status filter...');
    const listRes = await request(
      'GET',
      `/purchases?status=DRAFT&vendorId=${testVendorId}&limit=5`,
      undefined,
      accountantToken
    );
    assert.strictEqual(listRes.status, 200, 'List POs failed');
    assert.strictEqual(listRes.body.success, true);
    assert.ok(Array.isArray(listRes.body.data), 'Data should be array');
    assert.ok(listRes.body.pagination, 'Pagination should be present');
    assert.ok(
      listRes.body.data.some((po: any) => po.id === createdPurchaseOrderId),
      'Created PO should be in list'
    );
    console.log(`[PASS] PO listing verified (Total: ${listRes.body.pagination.total}).`);

    // 11. Update: Update DRAFT Purchase Order (modify items & recalculate totals)
    console.log('\n[TEST 11] Update: Update draft PO items and recalculate totals...');
    // Single item: netWeight 50.0g * rate 7000 + makingCharges 3000 = 350,000 + 3000 = 353,000. taxRate 3% = 10,590. Grand Total = 363,590.00
    const updateRes = await request(
      'PUT',
      `/purchases/${createdPurchaseOrderId}`,
      {
        notes: 'Updated PO notes for Sprint 5.1',
        items: [
          {
            metalType: 'GOLD',
            purity: '22K',
            itemName: 'Updated 22K Royal Necklace',
            orderedQuantity: 1,
            grossWeight: 52.0,
            netWeight: 50.0,
            stoneWeight: 2.0,
            expectedRate: 7000.0,
            makingCharges: 3000.0,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(updateRes.status, 200, `Update PO failed: ${JSON.stringify(updateRes.body)}`);
    assert.strictEqual(Number(updateRes.body.data.subtotal), 353000.0);
    assert.strictEqual(Number(updateRes.body.data.taxAmount), 10590.0);
    assert.strictEqual(Number(updateRes.body.data.grandTotal), 363590.0);
    assert.strictEqual(updateRes.body.data.items.length, 1);
    assert.strictEqual(updateRes.body.data.items[0].itemName, 'Updated 22K Royal Necklace');
    console.log(`[PASS] Draft PO updated & totals recalculated (New Grand Total: ${updateRes.body.data.grandTotal}).`);

    // 12. Invalid Transition: Cannot approve a DRAFT PO directly
    console.log('\n[TEST 12] State Machine: Reject approving a DRAFT PO directly...');
    const directApproveRes = await request(
      'POST',
      `/purchases/${createdPurchaseOrderId}/approve`,
      {},
      ownerToken
    );
    assert.strictEqual(directApproveRes.status, 400, 'Expected 400 when approving DRAFT PO directly');
    console.log('[PASS] Direct approval of DRAFT rejected with 400.');

    // 13. Lifecycle: Submit DRAFT Purchase Order (DRAFT -> SUBMITTED)
    console.log('\n[TEST 13] Lifecycle: Submit DRAFT Purchase Order (DRAFT -> SUBMITTED)...');
    const submitRes = await request(
      'POST',
      `/purchases/${createdPurchaseOrderId}/submit`,
      {},
      accountantToken
    );
    assert.strictEqual(submitRes.status, 200, `Submit PO failed: ${JSON.stringify(submitRes.body)}`);
    assert.strictEqual(submitRes.body.data.status, 'SUBMITTED');
    assert.ok(submitRes.body.data.submittedAt, 'submittedAt should be set');
    console.log('[PASS] PO transitioned to SUBMITTED status.');

    // 14. Locking: Cannot edit a SUBMITTED Purchase Order
    console.log('\n[TEST 14] Locking: Verify submitted PO cannot be updated...');
    const updateSubmittedRes = await request(
      'PUT',
      `/purchases/${createdPurchaseOrderId}`,
      { notes: 'Attempting edit on submitted PO' },
      ownerToken
    );
    assert.strictEqual(updateSubmittedRes.status, 400, 'Expected 400 when updating submitted PO');
    console.log('[PASS] Edit on submitted PO locked with 400.');

    // 15. Invalid Transition: Cannot re-submit a SUBMITTED PO
    console.log('\n[TEST 15] State Machine: Cannot re-submit already SUBMITTED PO...');
    const reSubmitRes = await request(
      'POST',
      `/purchases/${createdPurchaseOrderId}/submit`,
      {},
      ownerToken
    );
    assert.strictEqual(reSubmitRes.status, 400, 'Expected 400 for re-submission');
    console.log('[PASS] Re-submission rejected with 400.');

    // 16. Lifecycle: Approve SUBMITTED Purchase Order (SUBMITTED -> APPROVED)
    console.log('\n[TEST 16] Lifecycle: Approve SUBMITTED Purchase Order (SUBMITTED -> APPROVED)...');
    const approveRes = await request(
      'POST',
      `/purchases/${createdPurchaseOrderId}/approve`,
      {},
      managerToken
    );
    assert.strictEqual(approveRes.status, 200, `Approve PO failed: ${JSON.stringify(approveRes.body)}`);
    assert.strictEqual(approveRes.body.data.status, 'APPROVED');
    assert.ok(approveRes.body.data.approvedAt, 'approvedAt should be set');
    console.log('[PASS] PO transitioned to APPROVED status.');

    // 17. Locking: Cannot edit an APPROVED Purchase Order
    console.log('\n[TEST 17] Locking: Verify approved PO cannot be updated...');
    const updateApprovedRes = await request(
      'PUT',
      `/purchases/${createdPurchaseOrderId}`,
      { notes: 'Attempting edit on approved PO' },
      ownerToken
    );
    assert.strictEqual(updateApprovedRes.status, 400, 'Expected 400 when updating approved PO');
    console.log('[PASS] Edit on approved PO locked with 400.');

    // 18. Cancellation: Cancel APPROVED Purchase Order with reason
    console.log('\n[TEST 18] Cancellation: Cancel APPROVED PO with cancellation reason...');
    const cancelRes = await request(
      'POST',
      `/purchases/${createdPurchaseOrderId}/cancel`,
      { cancellationReason: 'Vendor price disagreement during review' },
      ownerToken
    );
    assert.strictEqual(cancelRes.status, 200, `Cancel PO failed: ${JSON.stringify(cancelRes.body)}`);
    assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
    assert.strictEqual(cancelRes.body.data.cancellationReason, 'Vendor price disagreement during review');
    assert.ok(cancelRes.body.data.cancelledAt, 'cancelledAt should be set');
    console.log('[PASS] PO cancelled successfully with audit metadata.');

    // 19. State Machine: Cannot cancel an already CANCELLED PO
    console.log('\n[TEST 19] State Machine: Reject cancelling already cancelled PO...');
    const reCancelRes = await request(
      'POST',
      `/purchases/${createdPurchaseOrderId}/cancel`,
      { cancellationReason: 'Trying to cancel again' },
      ownerToken
    );
    assert.strictEqual(reCancelRes.status, 400, 'Expected 400 when re-cancelling');
    console.log('[PASS] Re-cancellation rejected with 400.');

    // 20. Cancellation Validation: Empty cancellation reason rejected
    console.log('\n[TEST 20] Cancellation Validation: Reject empty cancellation reason...');
    // Create a new draft PO to test cancellation validation
    const po2Res = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            metalType: 'SILVER',
            purity: '999',
            itemName: 'Silver Bars 100g',
            grossWeight: 100,
            netWeight: 100,
            expectedRate: 90,
            taxRate: 3,
          },
        ],
      },
      ownerToken
    );
    const po2Id = po2Res.body.data.id;

    const emptyReasonRes = await request(
      'POST',
      `/purchases/${po2Id}/cancel`,
      { cancellationReason: '   ' },
      ownerToken
    );
    assert.strictEqual(emptyReasonRes.status, 400, 'Expected 400 for empty cancellation reason');
    console.log('[PASS] Empty cancellation reason rejected with 400.');

    // 21. Cancel Draft PO with reason
    console.log('\n[TEST 21] Cancellation: Cancel DRAFT PO directly...');
    const cancelDraftRes = await request(
      'POST',
      `/purchases/${po2Id}/cancel`,
      { cancellationReason: 'Draft order created by mistake' },
      ownerToken
    );
    assert.strictEqual(cancelDraftRes.status, 200, 'Cancel draft PO failed');
    assert.strictEqual(cancelDraftRes.body.data.status, 'CANCELLED');
    console.log('[PASS] Draft PO cancelled successfully.');

    // 22. Sequential Numbering Verification
    console.log('\n[TEST 22] Numbering: Verify sequential unique PO numbering...');
    const po3Res = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            metalType: 'PLATINUM',
            purity: '950',
            itemName: 'Platinum Ring',
            grossWeight: 10,
            netWeight: 9.8,
            expectedRate: 3500,
          },
        ],
      },
      ownerToken
    );
    const po4Res = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            metalType: 'GOLD',
            purity: '18K',
            itemName: '18K Diamond Studs',
            grossWeight: 8,
            netWeight: 7.2,
            expectedRate: 5500,
          },
        ],
      },
      ownerToken
    );

    const num3 = po3Res.body.data.purchaseOrderNumber;
    const num4 = po4Res.body.data.purchaseOrderNumber;
    assert.notStrictEqual(num3, num4, 'PO numbers must be distinct');
    assert.ok(num3.startsWith('PO-'), 'PO 3 format valid');
    assert.ok(num4.startsWith('PO-'), 'PO 4 format valid');
    console.log(`[PASS] Generated sequence numbers: ${num3}, ${num4}`);

    console.log('\n==================================================');
    console.log('✅ ALL SPRINT 5.1 PURCHASE ORDER TESTS PASSED (22/22)');
    console.log('==================================================\n');
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runPurchaseOrderTests().catch((err) => {
  console.error('[ERROR] Sprint 5.1 Purchase Order test suite failed:', err);
  process.exit(1);
});
