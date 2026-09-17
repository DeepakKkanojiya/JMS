import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let testProductId: string;
let testBranchId1: string;
let testBranchId2: string;
let testItemId: string;
let createdMovementId: string;

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

async function runStockMovementTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 3.3 STOCK MOVEMENTS & AUDIT TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Authenticate Owner User
    console.log('\n[SETUP] Authenticating test user token...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login should return 200 OK');
    ownerToken = ownerRes.body.data.accessToken;

    // Fetch Product & 2 Branches for testing
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    const branches = await prisma.branch.findMany({ where: { isActive: true }, take: 2 });
    assert.ok(product, 'Test product should exist');
    assert.ok(branches.length >= 1, 'At least 1 test branch should exist');

    testProductId = product.id;
    testBranchId1 = branches[0].id;
    testBranchId2 = branches.length > 1 ? branches[1].id : branches[0].id;

    // Create a dedicated test inventory item
    const itemCode = `INV-MVT-${Date.now()}`;
    const itemRes = await request(
      'POST',
      '/inventory-items',
      {
        productId: testProductId,
        branchId: testBranchId1,
        itemCode: itemCode,
        grossWeight: 10.0,
        netWeight: 9.5,
        stoneWeight: 0.5,
        purity: '22K',
        status: 'AVAILABLE',
      },
      ownerToken
    );
    assert.strictEqual(itemRes.status, 201, 'Inventory item creation should return 201 Created');
    testItemId = itemRes.body.data.id;
    console.log(`✓ Setup complete. Test Inventory Item '${itemCode}' created (ID: ${testItemId}).`);

    // 2. TEST: Auth Guard (Missing Token)
    console.log('\n[TEST 1] Testing Auth Security Guard...');
    const noTokenRes = await request('GET', '/stock-movements');
    assert.strictEqual(noTokenRes.status, 401, 'Missing token should return 401 Unauthorized');
    console.log('✓ Missing token rejected with 401 Unauthorized.');

    // 3. TEST: CREATE STOCK MOVEMENTS
    console.log('\n[TEST 2] Testing Stock Movement Creation (POST /stock-movements)...');

    // 3a. Invalid Inventory Item ID (404)
    const badItemRes = await request(
      'POST',
      '/stock-movements',
      {
        inventoryItemId: '00000000-0000-0000-0000-000000000000',
        movementType: 'STOCK_IN',
      },
      ownerToken
    );
    assert.strictEqual(badItemRes.status, 404, 'Non-existent item should return 404 Not Found');
    console.log('✓ Non-existent item rejected with 404 Not Found.');

    // 3b. Invalid Branch ID (404)
    const badBranchRes = await request(
      'POST',
      '/stock-movements',
      {
        inventoryItemId: testItemId,
        fromBranchId: '00000000-0000-0000-0000-000000000000',
        movementType: 'STOCK_IN',
      },
      ownerToken
    );
    assert.strictEqual(badBranchRes.status, 404, 'Non-existent branch should return 404 Not Found');
    console.log('✓ Non-existent branch rejected with 404 Not Found.');

    // 3c. Invalid Movement Type (400)
    const badTypeRes = await request(
      'POST',
      '/stock-movements',
      {
        inventoryItemId: testItemId,
        movementType: 'INVALID_MOVEMENT_TYPE',
      },
      ownerToken
    );
    assert.strictEqual(badTypeRes.status, 400, 'Invalid movement type should return 400 Bad Request');
    console.log('✓ Invalid movement type rejected with 400 Bad Request.');

    // 3d. TRANSFER with Same Source and Destination Branch (400)
    const sameBranchTransferRes = await request(
      'POST',
      '/stock-movements',
      {
        inventoryItemId: testItemId,
        fromBranchId: testBranchId1,
        toBranchId: testBranchId1, // Same branch!
        movementType: 'TRANSFER',
      },
      ownerToken
    );
    assert.strictEqual(sameBranchTransferRes.status, 400, 'Same source & destination branch should return 400 Bad Request');
    console.log('✓ Same source and destination transfer rejected with 400 Bad Request.');

    // 3e. Valid STOCK_IN Movement
    const stockInRes = await request(
      'POST',
      '/stock-movements',
      {
        inventoryItemId: testItemId,
        fromBranchId: testBranchId1,
        movementType: 'STOCK_IN',
        referenceType: 'MANUAL_INVENTORY',
        referenceId: 'REF-INTAKE-001',
        remarks: 'Manual showroom stock intake',
      },
      ownerToken
    );
    assert.strictEqual(stockInRes.status, 201, 'Valid STOCK_IN should return 201 Created');
    assert.ok(stockInRes.body.data.id);
    assert.strictEqual(stockInRes.body.data.movementType, 'STOCK_IN');
    assert.ok(stockInRes.body.data.performedBy);
    createdMovementId = stockInRes.body.data.id;
    console.log(`✓ STOCK_IN movement recorded successfully (ID: ${createdMovementId}).`);

    // 3f. Valid TRANSFER Movement Foundation
    if (testBranchId1 !== testBranchId2) {
      const transferRes = await request(
        'POST',
        '/stock-movements',
        {
          inventoryItemId: testItemId,
          fromBranchId: testBranchId1,
          toBranchId: testBranchId2,
          movementType: 'TRANSFER',
          remarks: 'Showroom transfer foundation',
        },
        ownerToken
      );
      assert.strictEqual(transferRes.status, 201, 'Valid TRANSFER should return 201 Created');
      assert.strictEqual(transferRes.body.data.inventoryItem.branchId, testBranchId2);
      console.log('✓ TRANSFER movement recorded and item branch updated atomically in transaction.');
    }

    // 4. TEST: GET LIST & PAGINATION
    console.log('\n[TEST 3] Testing Stock Movement List & Pagination (GET /stock-movements)...');
    const listRes = await request('GET', '/stock-movements?page=1&limit=5', undefined, ownerToken);
    assert.strictEqual(listRes.status, 200, 'List query should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.pagination);
    assert.strictEqual(listRes.body.pagination.page, 1);
    assert.strictEqual(listRes.body.pagination.limit, 5);
    console.log(`✓ Retrieved ${listRes.body.data.length} movement(s) on page 1.`);

    // 5. TEST: SEARCH & FILTERS
    console.log('\n[TEST 4] Testing Search & Filters...');
    const searchRes = await request('GET', `/stock-movements?inventoryItemId=${testItemId}`, undefined, ownerToken);
    assert.strictEqual(searchRes.status, 200, 'Item filter should return 200 OK');
    assert.ok(searchRes.body.data.length >= 1);
    console.log(`✓ Filter by inventoryItemId returned ${searchRes.body.data.length} record(s).`);

    const filterTypeRes = await request('GET', `/stock-movements?movementType=STOCK_IN`, undefined, ownerToken);
    assert.strictEqual(filterTypeRes.status, 200, 'Movement type filter should return 200 OK');
    assert.ok(filterTypeRes.body.data.length >= 1);
    console.log('✓ Filter by movementType=STOCK_IN succeeded.');

    // 6. TEST: GET MOVEMENT BY ID
    console.log('\n[TEST 5] Testing Get Stock Movement By ID...');
    const getRes = await request('GET', `/stock-movements/${createdMovementId}`, undefined, ownerToken);
    assert.strictEqual(getRes.status, 200, 'Get by ID should return 200 OK');
    assert.strictEqual(getRes.body.data.id, createdMovementId);
    assert.ok(getRes.body.data.inventoryItem);
    assert.ok(getRes.body.data.performedByUser);
    console.log('✓ Stock movement details and performedByUser details returned successfully.');

    // 7. TEST: IMMUTABILITY PROTECTION (NO PUT / DELETE ROUTES)
    console.log('\n[TEST 6] Testing Ledger Immutability (Rejecting PUT / DELETE)...');
    const putRes = await request('PUT', `/stock-movements/${createdMovementId}`, { remarks: 'Hacked' }, ownerToken);
    assert.strictEqual(putRes.status, 404, 'PUT /stock-movements/:id must return 404 Route Not Found (Immutable)');
    console.log('✓ PUT request rejected with 404 Route Not Found (Immutable Ledger).');

    const deleteRes = await request('DELETE', `/stock-movements/${createdMovementId}`, undefined, ownerToken);
    assert.strictEqual(deleteRes.status, 404, 'DELETE /stock-movements/:id must return 404 Route Not Found (Immutable)');
    console.log('✓ DELETE request rejected with 404 Route Not Found (Immutable Ledger).');

    // 8. TEST: REGRESSION FOR SPRINT 3.2 ITEM HISTORY CONTRACT
    console.log('\n[TEST 7] Testing Sprint 3.2 Inventory Item History Contract Regression...');
    const historyRes = await request('GET', `/inventory-items/${testItemId}/history`, undefined, ownerToken);
    assert.strictEqual(historyRes.status, 200, 'Sprint 3.2 item history contract must return 200 OK');
    assert.ok(Array.isArray(historyRes.body.data.movements));
    assert.ok(historyRes.body.data.movements.length >= 1);
    console.log(`✓ Sprint 3.2 history contract returned ${historyRes.body.data.movements.length} movement(s).`);

    console.log('\n==================================================');
    console.log('ALL SPRINT 3.3 STOCK MOVEMENT TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 3.3 STOCK MOVEMENT TESTS FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runStockMovementTests();
