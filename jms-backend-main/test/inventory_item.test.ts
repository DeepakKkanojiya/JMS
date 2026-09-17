import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let cashierToken: string;
let testProductId: string;
let testBranchId: string;
let createdItemId: string;

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
        } catch (e) {
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

async function runInventoryItemTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 3.2 INVENTORY ITEM MANAGEMENT API TESTS');
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

    // Fetch Product & Branch for testing
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(product, 'Test product should exist');
    assert.ok(branch, 'Test branch should exist');
    testProductId = product.id;
    testBranchId = branch.id;
    console.log('✓ Test tokens and master entities retrieved.');

    // 2. TEST: Unauthorized & Forbidden Requests
    console.log('\n[TEST 1] Testing Auth & RBAC Security Guards...');
    const noTokenRes = await request('GET', '/inventory-items');
    assert.strictEqual(noTokenRes.status, 401, 'Missing token should return 401 Unauthorized');
    console.log('✓ Missing token rejected with 401 Unauthorized.');

    // 3. TEST: CREATE INVENTORY ITEM
    console.log('\n[TEST 2] Testing Inventory Item Creation (POST /inventory-items)...');

    // 3a. Invalid Product ID
    const badProductRes = await request(
      'POST',
      '/inventory-items',
      {
        productId: '00000000-0000-0000-0000-000000000000',
        branchId: testBranchId,
        itemCode: 'INV-TEST-999',
        grossWeight: 10.0,
        netWeight: 10.0,
        purity: '22K',
      },
      ownerToken
    );
    assert.strictEqual(badProductRes.status, 404, 'Non-existent product should return 404');
    console.log('✓ Non-existent product rejected with 404 Not Found.');

    // 3b. Weight Validation Failure (grossWeight < netWeight)
    const badWeightRes = await request(
      'POST',
      '/inventory-items',
      {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: 'INV-TEST-BAD-WT',
        grossWeight: 5.0,
        netWeight: 8.0, // Invalid!
        purity: '22K',
      },
      ownerToken
    );
    assert.strictEqual(badWeightRes.status, 400, 'grossWeight < netWeight should return 400');
    console.log('✓ Invalid gross < net weight rejected with 400 Bad Request.');

    // 3c. Valid Creation
    const testItemCode = `INV-API-${Date.now()}`;
    const validCreateRes = await request(
      'POST',
      '/inventory-items',
      {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: testItemCode,
        grossWeight: 12.5,
        netWeight: 12.0,
        stoneWeight: 0.5,
        purity: '22K',
        status: 'AVAILABLE',
        barcode: `BC-${testItemCode}`,
        qrCode: `QR-${testItemCode}`,
        rfidEpc: null,
      },
      ownerToken
    );
    assert.strictEqual(validCreateRes.status, 201, 'Valid item creation should return 201 Created');
    assert.ok(validCreateRes.body.data.id);
    assert.strictEqual(validCreateRes.body.data.itemCode, testItemCode);
    assert.ok(validCreateRes.body.data.inventoryTag);
    createdItemId = validCreateRes.body.data.id;
    console.log(`✓ Inventory item '${testItemCode}' created successfully (201 Created).`);

    // 3d. Duplicate Item Code
    const dupRes = await request(
      'POST',
      '/inventory-items',
      {
        productId: testProductId,
        branchId: testBranchId,
        itemCode: testItemCode, // Duplicate!
        grossWeight: 10.0,
        netWeight: 10.0,
        purity: '22K',
      },
      ownerToken
    );
    assert.strictEqual(dupRes.status, 409, 'Duplicate item code should return 409 Conflict');
    console.log('✓ Duplicate item code rejected with 409 Conflict.');

    // 4. TEST: GET LIST & PAGINATION
    console.log('\n[TEST 3] Testing Inventory Item List & Pagination (GET /inventory-items)...');
    const listRes = await request('GET', '/inventory-items?page=1&limit=5', undefined, ownerToken);
    assert.strictEqual(listRes.status, 200, 'List query should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.pagination);
    assert.strictEqual(listRes.body.pagination.page, 1);
    assert.strictEqual(listRes.body.pagination.limit, 5);
    console.log(`✓ Retrieved ${listRes.body.data.length} item(s) on page 1.`);

    // 5. TEST: SEARCH & FILTERS
    console.log('\n[TEST 4] Testing Search & Filters...');
    const searchRes = await request('GET', `/inventory-items?search=${testItemCode}`, undefined, ownerToken);
    assert.strictEqual(searchRes.status, 200, 'Search should return 200 OK');
    assert.strictEqual(searchRes.body.data.length, 1);
    assert.strictEqual(searchRes.body.data[0].id, createdItemId);
    console.log('✓ Item code search matched expected item.');

    const filterRes = await request('GET', `/inventory-items?status=AVAILABLE&purity=22K`, undefined, ownerToken);
    assert.strictEqual(filterRes.status, 200, 'Filter by status & purity should return 200 OK');
    assert.ok(filterRes.body.data.length >= 1);
    console.log('✓ Filter by status & purity succeeded.');

    // 6. TEST: GET DETAILS BY ID
    console.log('\n[TEST 5] Testing Get Inventory Item By ID...');
    const getRes = await request('GET', `/inventory-items/${createdItemId}`, undefined, ownerToken);
    assert.strictEqual(getRes.status, 200, 'Get by ID should return 200 OK');
    assert.strictEqual(getRes.body.data.id, createdItemId);
    assert.ok(getRes.body.data.product);
    assert.ok(getRes.body.data.branch);
    assert.ok(getRes.body.data.inventoryTag);
    console.log('✓ Inventory item details and relations returned successfully.');

    // 7. TEST: GET ITEM HISTORY
    console.log('\n[TEST 6] Testing Inventory Item Audit History...');
    const historyRes = await request('GET', `/inventory-items/${createdItemId}/history`, undefined, ownerToken);
    assert.strictEqual(historyRes.status, 200, 'History query should return 200 OK');
    assert.ok(Array.isArray(historyRes.body.data.movements));
    assert.ok(historyRes.body.data.movements.length >= 1);
    assert.strictEqual(historyRes.body.data.movements[0].movementType, 'STOCK_IN');
    console.log(`✓ Item history returned ${historyRes.body.data.movements.length} movement(s).`);

    // 8. TEST: UPDATE INVENTORY ITEM (Weight calibration auto-adjustment)
    console.log('\n[TEST 7] Testing Inventory Item Update & Auto Adjustment...');
    const updateRes = await request(
      'PUT',
      `/inventory-items/${createdItemId}`,
      {
        grossWeight: 12.8,
        netWeight: 12.2,
        stoneWeight: 0.6,
        adjustmentReason: 'intake audit weight re-calibration',
      },
      ownerToken
    );
    assert.strictEqual(updateRes.status, 200, 'Update item should return 200 OK');
    assert.strictEqual(Number(updateRes.body.data.grossWeight), 12.8);
    console.log('✓ Item updated and weight re-calibrated.');

    // Verify StockAdjustment was generated
    const updatedHistory = await request('GET', `/inventory-items/${createdItemId}/history`, undefined, ownerToken);
    assert.ok(updatedHistory.body.data.adjustments.length >= 1);
    assert.strictEqual(updatedHistory.body.data.adjustments[0].reason, 'intake audit weight re-calibration');
    console.log('✓ StockAdjustment audit record generated automatically.');

    // 9. TEST: DELETE RESTRICTION (Audit protection)
    console.log('\n[TEST 8] Testing Audit History Deletion Protection...');
    const deleteRes = await request('DELETE', `/inventory-items/${createdItemId}`, undefined, ownerToken);
    assert.strictEqual(deleteRes.status, 409, 'Deleting item with movement/adjustment history must return 409 Conflict');
    console.log('✓ Cascade deletion blocked with 409 Conflict as required for audit history protection.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 3.2 INVENTORY ITEM API TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 3.2 INVENTORY ITEM API TESTS FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runInventoryItemTests();
