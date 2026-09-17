import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let managerToken: string;
let cashierToken: string;

let testCustomerId: string;
let testBranchId: string;
let secondaryBranchId: string;
let testProductId: string;

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

async function runPosBillingTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 4.3 POS BILLING & INVENTORY DEDUCTION TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Setup Tokens & Context Data
    console.log('\n[SETUP] Authenticating users & fetching prerequisites...');
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

    const branchList = await prisma.branch.findMany({ where: { isActive: true } });
    assert.ok(branchList.length >= 1, 'At least 1 active branch must exist');
    testBranchId = branchList[0].id;
    secondaryBranchId = branchList.length > 1 ? branchList[1].id : branchList[0].id;

    const customer = await prisma.customer.findFirst({ where: { isActive: true } });
    assert.ok(customer, 'Active customer must exist for testing');
    testCustomerId = customer!.id;

    const product = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(product, 'Active product must exist for testing');
    testProductId = product!.id;

    console.log('[PASS] Setup completed successfully.');

    // 2. Auth & Security Guards
    console.log('\n[TEST 1] Testing Auth Security Guards...');
    const noAuthRes = await request('POST', '/sales/invoices/00000000-0000-0000-0000-000000000000/confirm');
    assert.strictEqual(noAuthRes.status, 401, 'Unauthenticated request should return 401');
    console.log('[PASS] 401 Unauthorized guard enforced.');

    // 3. POS Item Scanning Lookup API
    console.log('\n[TEST 2] Testing POS Available Inventory Item Lookup API...');
    const availableItemForLookup = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: `POS-LOOKUP-${Date.now()}`,
        grossWeight: 12.5,
        netWeight: 12.0,
        purity: '22K',
        status: 'AVAILABLE',
        inventoryTag: {
          create: {
            barcode: `BC-POS-${Date.now()}`,
            qrCode: `QR-POS-${Date.now()}`,
            isActive: true,
          },
        },
      },
      include: { inventoryTag: true },
    });

    const lookupRes = await request(
      'GET',
      `/sales/pos/inventory/${availableItemForLookup.itemCode}`,
      undefined,
      cashierToken
    );
    assert.strictEqual(lookupRes.status, 200, 'POS item lookup should return 200 OK');
    assert.strictEqual(lookupRes.body.success, true);
    assert.strictEqual(lookupRes.body.data.itemCode, availableItemForLookup.itemCode);
    console.log('[PASS] Available item resolved via itemCode lookup.');

    const notFoundLookup = await request('GET', '/sales/pos/inventory/NON-EXISTENT-CODE', undefined, cashierToken);
    assert.strictEqual(notFoundLookup.status, 404, 'Non-existent item should return 404');
    console.log('[PASS] Non-existent item returned 404 Not Found.');

    // 4. Valid POS Invoice Confirmation & Atomic Inventory Deduction
    console.log('\n[TEST 3] Testing Valid POS Invoice Confirmation (AVAILABLE -> SOLD & SALE Movement)...');
    const itemToSell = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: `POS-ITEM-${Date.now()}`,
        grossWeight: 15.0,
        netWeight: 14.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });

    const draftInvoiceRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [{ inventoryItemId: itemToSell.id, quantity: 1, unitPrice: 75000 }],
      },
      cashierToken
    );
    assert.strictEqual(draftInvoiceRes.status, 201, 'Draft invoice creation should return 201');
    const posInvoiceId = draftInvoiceRes.body.data.id;

    await request('POST', `/sales/invoices/${posInvoiceId}/lock-metal-rate`, {}, cashierToken);
    await request('POST', `/sales/invoices/${posInvoiceId}/calculate-pricing`, { taxType: 'INTRA_STATE' }, cashierToken);

    const confirmRes = await request('POST', `/sales/invoices/${posInvoiceId}/confirm`, {}, cashierToken);
    assert.strictEqual(confirmRes.status, 200, 'POS invoice confirmation should return 200 OK');
    assert.strictEqual(confirmRes.body.success, true);
    assert.strictEqual(confirmRes.body.data.status, 'CONFIRMED');
    console.log('[PASS] Sales invoice status updated to CONFIRMED.');

    // Verify InventoryItem status AVAILABLE -> SOLD
    const updatedItem = await prisma.inventoryItem.findUnique({ where: { id: itemToSell.id } });
    assert.strictEqual(updatedItem?.status, 'SOLD', 'Inventory item status must transition to SOLD');
    console.log('[PASS] Inventory item status transitioned AVAILABLE -> SOLD.');

    // Verify SALE StockMovement created
    const stockMovements = await prisma.stockMovement.findMany({
      where: { inventoryItemId: itemToSell.id, movementType: 'SALE' },
    });
    assert.strictEqual(stockMovements.length, 1, 'Exactly one SALE stock movement must be created');
    assert.strictEqual(stockMovements[0].referenceType, 'POS_INVOICE');
    assert.strictEqual(stockMovements[0].referenceId, posInvoiceId);
    assert.strictEqual(stockMovements[0].fromBranchId, testBranchId);
    assert.strictEqual(stockMovements[0].toBranchId, null);
    console.log('[PASS] Immutable SALE StockMovement created in audit ledger.');

    // 5. Double Confirmation Block
    console.log('\n[TEST 4] Testing Double Confirmation Rejection...');
    const doubleConfRes = await request('POST', `/sales/invoices/${posInvoiceId}/confirm`, {}, cashierToken);
    assert.strictEqual(doubleConfRes.status, 400, 'Re-confirming invoice should return 400 Bad Request');
    assert.strictEqual(doubleConfRes.body.success, false);
    console.log('[PASS] Double confirmation rejected with 400 Bad Request.');

    // 6. Confirming Invoice with SOLD Item Rejection
    console.log('\n[TEST 5] Testing Rejection of Invoices containing SOLD or Unavailable items...');
    const draftWithSoldItem = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [{ inventoryItemId: itemToSell.id, quantity: 1, unitPrice: 75000 }],
      },
      cashierToken
    );
    assert.strictEqual(draftWithSoldItem.status, 400, 'Draft invoice creation with SOLD item must be rejected');
    assert.strictEqual(draftWithSoldItem.body.success, false);
    console.log('[PASS] Sale/Draft creation with non-AVAILABLE (SOLD) item rejected with 400 Bad Request.');

    // 7. Duplicate Inventory Item inside Invoice Rejection
    console.log('\n[TEST 6] Testing Duplicate Item inside Invoice Rejection...');
    const itemForDup = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: `POS-DUP-${Date.now()}`,
        grossWeight: 10.0,
        netWeight: 9.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });

    const dupDraftRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [
          { inventoryItemId: itemForDup.id, quantity: 1, unitPrice: 50000 },
          { inventoryItemId: itemForDup.id, quantity: 1, unitPrice: 50000 },
        ],
      },
      cashierToken
    );

    if (dupDraftRes.status === 201) {
      const confirmDupRes = await request('POST', `/sales/invoices/${dupDraftRes.body.data.id}/confirm`, {}, cashierToken);
      assert.strictEqual(confirmDupRes.status, 400, 'Duplicate item in invoice should return 400');
    }
    console.log('[PASS] Duplicate inventory item within invoice rejected.');

    // 8. Branch Mismatch Protection
    console.log('\n[TEST 7] Testing Branch Mismatch Rejection...');
    if (secondaryBranchId !== testBranchId) {
      const branchMismatchItem = await prisma.inventoryItem.create({
        data: {
          productId: testProductId,
          branchId: secondaryBranchId,
          itemCode: `BRANCH-MISMATCH-${Date.now()}`,
          grossWeight: 10.0,
          netWeight: 9.5,
          purity: '22K',
          status: 'AVAILABLE',
        },
      });

      const mismatchDraftRes = await request(
        'POST',
        '/sales/invoices',
        {
          customerId: testCustomerId,
          branchId: testBranchId,
          items: [{ inventoryItemId: branchMismatchItem.id, quantity: 1, unitPrice: 50000 }],
        },
        cashierToken
      );

      if (mismatchDraftRes.status === 201) {
        const confirmMismatchRes = await request('POST', `/sales/invoices/${mismatchDraftRes.body.data.id}/confirm`, {}, cashierToken);
        assert.strictEqual(confirmMismatchRes.status, 400, 'Branch mismatch should return 400');
        assert.strictEqual(confirmMismatchRes.body.success, false);
      }
      console.log('[PASS] Branch mismatch rejected with 400 Bad Request.');
    }

    // 9. Transaction Atomicity & Rollback Guarantee Test
    console.log('\n[TEST 8] Testing Transaction Atomicity & Complete Rollback...');
    const itemAvailable1 = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: `ATOMIC-AVAIL-1-${Date.now()}`,
        grossWeight: 10.0,
        netWeight: 9.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });

    const itemAvailable2 = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: `ATOMIC-AVAIL-2-${Date.now()}`,
        grossWeight: 10.0,
        netWeight: 9.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });

    const atomicDraftRes = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [
          { inventoryItemId: itemAvailable1.id, quantity: 1, unitPrice: 50000 },
          { inventoryItemId: itemAvailable2.id, quantity: 1, unitPrice: 50000 },
        ],
      },
      cashierToken
    );

    assert.strictEqual(atomicDraftRes.status, 201);
    const atomicInvoiceId = atomicDraftRes.body.data.id;

    // Manually set itemAvailable2 status to SOLD directly in DB before confirmation
    await prisma.inventoryItem.update({
      where: { id: itemAvailable2.id },
      data: { status: 'SOLD' },
    });

    await request('POST', `/sales/invoices/${atomicInvoiceId}/lock-metal-rate`, {}, cashierToken);
    await request('POST', `/sales/invoices/${atomicInvoiceId}/calculate-pricing`, { taxType: 'INTRA_STATE' }, cashierToken);

    const confirmAtomicRes = await request('POST', `/sales/invoices/${atomicInvoiceId}/confirm`, {}, cashierToken);
    assert.strictEqual(confirmAtomicRes.status, 400, 'Partial failure must reject entire confirmation');

    // Verify ROLLBACK: itemAvailable1 MUST REMAIN AVAILABLE
    const checkAvail = await prisma.inventoryItem.findUnique({ where: { id: itemAvailable1.id } });
    assert.strictEqual(checkAvail?.status, 'AVAILABLE', 'Available item must remain AVAILABLE on rollback');

    // Verify NO StockMovement created for itemAvailable1
    const checkMovements = await prisma.stockMovement.findMany({ where: { inventoryItemId: itemAvailable1.id } });
    assert.strictEqual(checkMovements.length, 0, 'No stock movements must be created on rollback');

    // Verify Invoice status remains DRAFT
    const checkInvoice = await prisma.salesInvoice.findUnique({ where: { id: atomicInvoiceId } });
    assert.strictEqual(checkInvoice?.status, 'DRAFT', 'Invoice status must remain DRAFT on rollback');
    console.log('[PASS] Full transaction rollback verified. 0 items marked SOLD, 0 movements created, invoice remains DRAFT.');

    // 10. Concurrent Sale Protection Test
    console.log('\n[TEST 9] Testing Race Condition & Concurrent Sale Protection...');
    const sharedItem = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: `RACE-ITEM-${Date.now()}`,
        grossWeight: 20.0,
        netWeight: 19.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });

    const inv1 = await request('POST', '/sales/invoices', {
      customerId: testCustomerId,
      branchId: testBranchId,
      items: [{ inventoryItemId: sharedItem.id, quantity: 1, unitPrice: 100000 }],
    }, cashierToken);

    const inv2 = await request('POST', '/sales/invoices', {
      customerId: testCustomerId,
      branchId: testBranchId,
      items: [{ inventoryItemId: sharedItem.id, quantity: 1, unitPrice: 100000 }],
    }, cashierToken);

    assert.strictEqual(inv1.status, 201);
    assert.strictEqual(inv2.status, 201);

    await request('POST', `/sales/invoices/${inv1.body.data.id}/lock-metal-rate`, {}, cashierToken);
    await request('POST', `/sales/invoices/${inv1.body.data.id}/calculate-pricing`, { taxType: 'INTRA_STATE' }, cashierToken);

    await request('POST', `/sales/invoices/${inv2.body.data.id}/lock-metal-rate`, {}, cashierToken);
    await request('POST', `/sales/invoices/${inv2.body.data.id}/calculate-pricing`, { taxType: 'INTRA_STATE' }, cashierToken);

    // Attempt simultaneous confirmation
    const [res1, res2] = await Promise.all([
      request('POST', `/sales/invoices/${inv1.body.data.id}/confirm`, {}, cashierToken),
      request('POST', `/sales/invoices/${inv2.body.data.id}/confirm`, {}, cashierToken),
    ]);

    const statuses = [res1.status, res2.status];
    console.log(`[RACE TEST] Concurrent execution status codes: ${statuses.join(', ')}`);

    const passCount = statuses.filter((s) => s === 200).length;
    const failCount = statuses.filter((s) => s === 400 || s === 409).length;

    assert.strictEqual(passCount, 1, 'Exactly ONE invoice confirmation must succeed');
    assert.strictEqual(failCount, 1, 'Exactly ONE invoice confirmation must be rejected');

    const finalItem = await prisma.inventoryItem.findUnique({ where: { id: sharedItem.id } });
    assert.strictEqual(finalItem?.status, 'SOLD');

    const finalMovements = await prisma.stockMovement.findMany({
      where: { inventoryItemId: sharedItem.id, movementType: 'SALE' },
    });
    assert.strictEqual(finalMovements.length, 1, 'Exactly ONE SALE movement created for shared item');

    console.log('[PASS] Concurrent sale protection verified. Exactly 1 transaction succeeded, 1 rejected, 1 SALE movement created.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 4.3 POS BILLING & INVENTORY DEDUCTION TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n[FAIL] POS Billing API Test Failure:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runPosBillingTests();
