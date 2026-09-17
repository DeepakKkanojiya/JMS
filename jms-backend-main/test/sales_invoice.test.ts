import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let cashierToken: string;
let noPermToken: string;
let testCustomerId: string;
let testBranchId: string;
let testSalespersonId: string | null = null;
let testInventoryItemId: string;
let createdInvoiceId: string;
let createdInvoiceNumber: string;

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

async function runSalesInvoiceTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 4.1 SALES TRANSACTION FOUNDATION API TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Authenticate Owner & Cashier Users
    console.log('\n[SETUP] Authenticating test tokens...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login should return 200 OK');
    ownerToken = ownerRes.body.data.accessToken;

    const cashierRes = await request('POST', '/auth/login', {
      email: 'cashier@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(cashierRes.status, 200, 'Cashier login should return 200 OK');
    cashierToken = cashierRes.body.data.accessToken;

    // Fetch prerequisite entities
    const customer = await prisma.customer.findFirst({ where: { isActive: true } });
    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { branchId: branch?.id, status: 'AVAILABLE' },
    });
    const employee = await prisma.employee.findFirst({
      where: { branchId: branch?.id, isActive: true },
    });

    assert.ok(customer, 'Test customer should exist');
    assert.ok(branch, 'Test branch should exist');
    assert.ok(inventoryItem, 'Test inventory item should exist in AVAILABLE status');

    testCustomerId = customer.id;
    testBranchId = branch.id;
    testInventoryItemId = inventoryItem.id;
    if (employee) {
      testSalespersonId = employee.id;
    }

    console.log('✓ Prerequisites retrieved: Customer, Branch, InventoryItem.');

    // 2. TEST: AUTHENTICATION & PERMISSIONS
    console.log('\n[TEST 1] Testing Auth Guards...');
    const noTokenRes = await request('GET', '/sales/invoices');
    assert.strictEqual(noTokenRes.status, 401, 'Unauthenticated request must return 401');
    console.log('✓ Unauthenticated request rejected with 401 Unauthorized.');

    // 3. TEST: CREATE SALES INVOICE (NEGATIVES)
    console.log('\n[TEST 2] Testing Draft Invoice Creation Validation & Error Cases...');

    // 3a. Missing required fields
    const missingFieldsRes = await request('POST', '/sales/invoices', {}, ownerToken);
    assert.strictEqual(missingFieldsRes.status, 400, 'Missing fields should return 400');
    console.log('✓ Missing required fields rejected with 400 Bad Request.');

    // 3b. Invalid customer UUID / 404
    const badCustomerRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: '00000000-0000-0000-0000-000000000000',
        branchId: testBranchId,
        items: [{ inventoryItemId: testInventoryItemId, unitPrice: 50000 }],
      },
      ownerToken
    );
    assert.strictEqual(badCustomerRes.status, 404, 'Non-existent customer should return 404');
    console.log('✓ Non-existent customer rejected with 404 Not Found.');

    // 3c. Invalid branch UUID / 404
    const badBranchRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: '00000000-0000-0000-0000-000000000000',
        items: [{ inventoryItemId: testInventoryItemId, unitPrice: 50000 }],
      },
      ownerToken
    );
    assert.strictEqual(badBranchRes.status, 404, 'Non-existent branch should return 404');
    console.log('✓ Non-existent branch rejected with 404 Not Found.');

    // 3d. Invalid inventory item / 404
    const badItemRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [{ inventoryItemId: '00000000-0000-0000-0000-000000000000', unitPrice: 50000 }],
      },
      ownerToken
    );
    assert.strictEqual(badItemRes.status, 404, 'Non-existent inventory item should return 404');
    console.log('✓ Non-existent inventory item rejected with 404 Not Found.');

    // 3e. Negative numeric price
    const negativePriceRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [{ inventoryItemId: testInventoryItemId, unitPrice: -500 }],
      },
      ownerToken
    );
    assert.strictEqual(negativePriceRes.status, 400, 'Negative unit price should return 400');
    console.log('✓ Negative unit price rejected with 400 Bad Request.');

    // 3f. Malformed UUID
    const malformedUuidRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: 'not-a-valid-uuid',
        branchId: testBranchId,
        items: [{ inventoryItemId: testInventoryItemId, unitPrice: 50000 }],
      },
      ownerToken
    );
    assert.strictEqual(malformedUuidRes.status, 400, 'Malformed UUID should return 400');
    console.log('✓ Malformed UUID rejected with 400 Bad Request.');

    // 4. TEST: VALID DRAFT INVOICE CREATION
    console.log('\n[TEST 3] Testing Valid Draft Invoice Creation (POST /sales/invoices)...');
    const validCreateRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        salespersonId: testSalespersonId,
        notes: 'Sprint 4.1 test draft invoice',
        items: [
          {
            inventoryItemId: testInventoryItemId,
            quantity: 1,
            unitPrice: 75000.0,
            discountAmount: 2000.0,
            taxAmount: 2190.0,
          },
        ],
      },
      ownerToken
    );

    assert.strictEqual(validCreateRes.status, 201, 'Valid creation should return 201 Created');
    assert.ok(validCreateRes.body.data.id);
    assert.ok(validCreateRes.body.data.invoiceNumber.startsWith('INV-'));
    assert.strictEqual(validCreateRes.body.data.status, 'DRAFT');
    assert.strictEqual(Number(validCreateRes.body.data.subtotal), 75000.0);
    assert.strictEqual(Number(validCreateRes.body.data.discountAmount), 2000.0);
    assert.strictEqual(Number(validCreateRes.body.data.taxAmount), 2190.0);
    assert.strictEqual(Number(validCreateRes.body.data.grandTotal), 75190.0);

    createdInvoiceId = validCreateRes.body.data.id;
    createdInvoiceNumber = validCreateRes.body.data.invoiceNumber;
    console.log(
      `✓ Draft invoice '${createdInvoiceNumber}' created successfully with status DRAFT.`
    );

    // Verify InventoryItem status is STILL AVAILABLE (Sprint 4.1 rule)
    const itemCheck = await prisma.inventoryItem.findUnique({
      where: { id: testInventoryItemId },
    });
    assert.strictEqual(
      itemCheck?.status,
      'AVAILABLE',
      'Inventory item status MUST remain AVAILABLE in Sprint 4.1'
    );
    console.log('✓ Confirmed inventory item status remains AVAILABLE.');

    // 5. TEST: GET INVOICE BY ID & ITEMS
    console.log('\n[TEST 4] Testing Get Invoice Details & Line Items...');
    const getRes = await request('GET', `/sales/invoices/${createdInvoiceId}`, undefined, ownerToken);
    assert.strictEqual(getRes.status, 200, 'Get by ID should return 200 OK');
    assert.strictEqual(getRes.body.data.id, createdInvoiceId);
    assert.strictEqual(getRes.body.data.invoiceNumber, createdInvoiceNumber);
    assert.ok(getRes.body.data.customer);
    assert.ok(getRes.body.data.branch);

    const getItemsRes = await request(
      'GET',
      `/sales/invoices/${createdInvoiceId}/items`,
      undefined,
      ownerToken
    );
    assert.strictEqual(getItemsRes.status, 200, 'Get invoice items should return 200 OK');
    assert.strictEqual(getItemsRes.body.data.length, 1);
    assert.strictEqual(getItemsRes.body.data[0].inventoryItemId, testInventoryItemId);
    console.log('✓ Invoice details and line items fetched successfully.');

    // 6. TEST: LIST, SEARCH, & PAGINATION
    console.log('\n[TEST 5] Testing List, Search & Pagination...');
    const listRes = await request(
      'GET',
      '/sales/invoices?page=1&limit=5&status=DRAFT',
      undefined,
      ownerToken
    );
    assert.strictEqual(listRes.status, 200, 'List query should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.pagination);
    assert.strictEqual(listRes.body.pagination.page, 1);

    const searchRes = await request(
      'GET',
      `/sales/invoices?search=${createdInvoiceNumber}`,
      undefined,
      ownerToken
    );
    assert.strictEqual(searchRes.status, 200, 'Search should return 200 OK');
    assert.strictEqual(searchRes.body.data.length, 1);
    assert.strictEqual(searchRes.body.data[0].id, createdInvoiceId);
    console.log('✓ Pagination, status filter, and invoice number search succeeded.');

    // 7. TEST: UPDATE DRAFT INVOICE
    console.log('\n[TEST 6] Testing Update Draft Invoice...');
    const updateRes = await request(
      'PUT',
      `/sales/invoices/${createdInvoiceId}`,
      {
        notes: 'Updated draft notes',
        items: [
          {
            inventoryItemId: testInventoryItemId,
            quantity: 1,
            unitPrice: 80000.0,
            discountAmount: 5000.0,
            taxAmount: 2250.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(updateRes.status, 200, 'Update draft should return 200 OK');
    assert.strictEqual(updateRes.body.data.notes, 'Updated draft notes');
    assert.strictEqual(Number(updateRes.body.data.subtotal), 80000.0);
    assert.strictEqual(Number(updateRes.body.data.grandTotal), 77250.0);
    console.log('✓ Draft invoice updated successfully.');

    // 8. TEST: CONFIRM SALES INVOICE (DRAFT -> CONFIRMED)
    console.log('\n[TEST 7] Testing Confirm Invoice (DRAFT -> CONFIRMED)...');
    await request('POST', `/sales/invoices/${createdInvoiceId}/lock-metal-rate`, {}, ownerToken);
    await request('POST', `/sales/invoices/${createdInvoiceId}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    const confirmRes = await request(
      'POST',
      `/sales/invoices/${createdInvoiceId}/confirm`,
      undefined,
      ownerToken
    );
    assert.strictEqual(confirmRes.status, 200, 'Confirm draft should return 200 OK');
    assert.strictEqual(confirmRes.body.data.status, 'CONFIRMED');
    console.log('✓ Invoice status transitioned to CONFIRMED.');

    // Re-verify InventoryItem status is SOLD (Sprint 4.3 POS rule)
    const itemCheckAfterConfirm = await prisma.inventoryItem.findUnique({
      where: { id: testInventoryItemId },
    });
    assert.strictEqual(
      itemCheckAfterConfirm?.status,
      'SOLD',
      'Inventory item status MUST transition to SOLD on POS confirmation in Sprint 4.3'
    );
    console.log('✓ Inventory item status transitioned to SOLD after POS invoice confirmation.');

    // 9. TEST: IMMUTABILITY OF CONFIRMED INVOICE
    console.log('\n[TEST 8] Testing Immutability of Confirmed Invoice...');
    const updateConfirmedRes = await request(
      'PUT',
      `/sales/invoices/${createdInvoiceId}`,
      {
        notes: 'Attempting to modify confirmed invoice',
      },
      ownerToken
    );
    assert.strictEqual(
      updateConfirmedRes.status,
      400,
      'Updating a CONFIRMED invoice must return 400 Bad Request'
    );
    console.log('✓ Editing CONFIRMED invoice blocked with 400 Bad Request.');

    // 10. TEST: PREVENT DOUBLE CONFIRMATION
    console.log('\n[TEST 9] Testing Double Confirmation Block...');
    const reConfirmRes = await request(
      'POST',
      `/sales/invoices/${createdInvoiceId}/confirm`,
      undefined,
      ownerToken
    );
    assert.strictEqual(reConfirmRes.status, 400, 'Re-confirming invoice must return 400 Bad Request');
    console.log('✓ Double confirmation blocked with 400 Bad Request.');

    // 11. TEST: CANCEL CONFIRMED INVOICE (CONFIRMED -> CANCELLED)
    console.log('\n[TEST 10] Testing Cancel Invoice (CONFIRMED -> CANCELLED)...');
    const cancelRes = await request(
      'POST',
      `/sales/invoices/${createdInvoiceId}/cancel`,
      undefined,
      ownerToken
    );
    assert.strictEqual(cancelRes.status, 200, 'Cancelling confirmed invoice should return 200 OK');
    assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
    console.log('✓ Invoice status transitioned to CANCELLED.');

    // 12. TEST: PREVENT EDITING & RE-CONFIRMING CANCELLED INVOICE
    console.log('\n[TEST 11] Testing State Machine Restrictions on Cancelled Invoice...');
    const updateCancelledRes = await request(
      'PUT',
      `/sales/invoices/${createdInvoiceId}`,
      { notes: 'Attempting to modify cancelled invoice' },
      ownerToken
    );
    assert.strictEqual(updateCancelledRes.status, 400, 'Updating CANCELLED invoice must return 400');

    const confirmCancelledRes = await request(
      'POST',
      `/sales/invoices/${createdInvoiceId}/confirm`,
      undefined,
      ownerToken
    );
    assert.strictEqual(confirmCancelledRes.status, 400, 'Confirming CANCELLED invoice must return 400');

    const reCancelRes = await request(
      'POST',
      `/sales/invoices/${createdInvoiceId}/cancel`,
      undefined,
      ownerToken
    );
    assert.strictEqual(reCancelRes.status, 400, 'Re-cancelling CANCELLED invoice must return 400');
    console.log('✓ Illegal state transitions on CANCELLED invoice blocked.');

    // 13. TEST: ENSURE CANCELLED INVOICE PRESERVED IN DB
    console.log('\n[TEST 12] Testing Historical Preservation of Cancelled Invoice...');
    const preservedInvoice = await prisma.salesInvoice.findUnique({
      where: { id: createdInvoiceId },
    });
    assert.ok(preservedInvoice, 'Cancelled invoice MUST remain in database');
    assert.strictEqual(preservedInvoice?.status, 'CANCELLED');
    console.log('✓ Cancelled invoice remains fully traceable in database.');

    // 14. TEST: CANCEL DRAFT INVOICE (DRAFT -> CANCELLED)
    console.log('\n[TEST 13] Testing Direct Cancellation of DRAFT Invoice...');
    const itemForCancelTest = await prisma.inventoryItem.create({
      data: {
        productId: inventoryItem.productId,
        branchId: testBranchId,
        itemCode: `INV-CANCEL-TEST-${Date.now()}`,
        grossWeight: 10.0,
        netWeight: 9.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });

    const draft2Res = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [{ inventoryItemId: itemForCancelTest.id, unitPrice: 10000 }],
      },
      ownerToken
    );
    assert.strictEqual(draft2Res.status, 201);
    const draft2Id = draft2Res.body.data.id;

    const cancelDraftRes = await request(
      'POST',
      `/sales/invoices/${draft2Id}/cancel`,
      undefined,
      ownerToken
    );
    assert.strictEqual(cancelDraftRes.status, 200);
    assert.strictEqual(cancelDraftRes.body.data.status, 'CANCELLED');
    console.log('✓ Direct transition DRAFT -> CANCELLED verified.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 4.1 SALES INVOICE API TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 4.1 SALES INVOICE API TESTS FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runSalesInvoiceTests();
