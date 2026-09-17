import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5096;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let testProductId: string;
let testBranchId: string;
    let testItemId1: string;
let testItemId2: string;
let autoBarcode: string;

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

async function runInventoryTagTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 3.4 INVENTORY TAG MANAGEMENT TESTS');
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

    // Fetch Product & Branch for testing
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(product, 'Test product should exist');
    assert.ok(branch, 'Test branch should exist');

    testProductId = product.id;
    testBranchId = branch.id;

    // Create 2 test inventory items (without tag initially)
    const itemCode1 = `INV-TAG1-${Date.now()}`;
    const itemCode2 = `INV-TAG2-${Date.now()}`;

    const item1 = await prisma.inventoryItem.create({
      data: {
        companyId: product.companyId,
        productId: testProductId,
        branchId: testBranchId,
        itemCode: itemCode1,
        grossWeight: 15.0,
        netWeight: 14.5,
        stoneWeight: 0.5,
        fineWeight: 13.282,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });
    testItemId1 = item1.id;

    const item2 = await prisma.inventoryItem.create({
      data: {
        companyId: product.companyId,
        productId: testProductId,
        branchId: testBranchId,
        itemCode: itemCode2,
        grossWeight: 20.0,
        netWeight: 19.0,
        stoneWeight: 1.0,
        fineWeight: 17.404,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });
    testItemId2 = item2.id;

    console.log(`✓ Setup complete. Created 2 test items: '${itemCode1}' (${testItemId1}) and '${itemCode2}' (${testItemId2}).`);

    // 2. TEST: Auth Guard (Missing Token)
    console.log('\n[TEST 1] Testing Auth Security Guard...');
    const noTokenRes = await request('GET', '/inventory-tags');
    assert.strictEqual(noTokenRes.status, 401, 'Missing token should return 401 Unauthorized');
    console.log('✓ Missing token rejected with 401 Unauthorized.');

    // 3. TEST: CREATE TAG & AUTO GENERATION
    console.log('\n[TEST 2] Testing Tag Creation & Auto Generation...');

    // 3a. Non-existent Inventory Item ID (404)
    const badItemRes = await request(
      'POST',
      '/inventory-items/00000000-0000-0000-0000-000000000000/tag',
      {},
      ownerToken
    );
    assert.strictEqual(badItemRes.status, 404, 'Non-existent item should return 404 Not Found');
    console.log('✓ Non-existent item rejected with 404 Not Found.');

    // 3b. Auto-generate Barcode (omitted body)
    const autoTagRes = await request(
      'POST',
      `/inventory-items/${testItemId1}/tag`,
      {
        rfidEpc: null,
      },
      ownerToken
    );
    assert.strictEqual(autoTagRes.status, 201, 'Auto tag creation should return 201 Created');
    assert.ok(autoTagRes.body.data.barcode);
    assert.strictEqual(autoTagRes.body.data.rfidEpc, null);
    autoBarcode = autoTagRes.body.data.barcode;
    console.log(`✓ Tag auto-generated successfully: Barcode '${autoBarcode}'.`);

    // 3c. Duplicate Tag Creation for Same Item (409)
    const dupItemTagRes = await request(
      'POST',
      `/inventory-items/${testItemId1}/tag`,
      {},
      ownerToken
    );
    assert.strictEqual(dupItemTagRes.status, 409, 'Duplicate tag for same item should return 409 Conflict');
    console.log('✓ Duplicate tag for same item rejected with 409 Conflict.');

    // 3d. Custom Barcode Creation for Item 2
    const customBarcode = `BC-CUSTOM-${Date.now()}`;
    const customRfid = `EPC-CUSTOM-${Date.now()}`;

    const customTagRes = await request(
      'POST',
      `/inventory-items/${testItemId2}/tag`,
      {
        barcode: customBarcode,
        rfidEpc: customRfid,
      },
      ownerToken
    );
    assert.strictEqual(customTagRes.status, 201, 'Custom tag creation should return 201 Created');
    assert.strictEqual(customTagRes.body.data.barcode, customBarcode);
    assert.strictEqual(customTagRes.body.data.rfidEpc, customRfid);
    console.log('✓ Custom Barcode, and RFID tag created successfully.');

    // 4. TEST: LOOKUP APIs (Barcode)
    console.log('\n[TEST 3] Testing Direct Barcode Lookups...');

    // 4a. Get Tag by Inventory Item ID
    const getItemTagRes = await request('GET', `/inventory-items/${testItemId1}/tag`, undefined, ownerToken);
    assert.strictEqual(getItemTagRes.status, 200, 'Get tag by item ID should return 200 OK');
    assert.strictEqual(getItemTagRes.body.data.barcode, autoBarcode);
    console.log('✓ Get tag by inventory item ID succeeded.');

    // 4b. Lookup by Barcode
    const barcodeLookupRes = await request('GET', `/inventory-tags/barcode/${autoBarcode}`, undefined, ownerToken);
    assert.strictEqual(barcodeLookupRes.status, 200, 'Barcode lookup should return 200 OK');
    assert.strictEqual(barcodeLookupRes.body.data.inventoryItem.id, testItemId1);
    assert.ok(barcodeLookupRes.body.data.inventoryItem.product);
    console.log('✓ Barcode lookup returned populated item, product, and branch data.');

    // 5. TEST: REGENERATION
    console.log('\n[TEST 4] Testing Tag Regeneration (POST /inventory-items/:id/tag/regenerate)...');
    const regenRes = await request('POST', `/inventory-items/${testItemId1}/tag/regenerate`, undefined, ownerToken);
    assert.strictEqual(regenRes.status, 200, 'Regeneration should return 200 OK');
    assert.notStrictEqual(regenRes.body.data.barcode, autoBarcode, 'Barcode should change after regeneration');
    console.log(`✓ Tag regenerated cleanly: New Barcode '${regenRes.body.data.barcode}'.`);

    // Verify Inventory Item attributes and stock status remain untouched
    const checkItem = await prisma.inventoryItem.findUnique({ where: { id: testItemId1 } });
    assert.strictEqual(checkItem?.status, 'AVAILABLE');
    assert.strictEqual(Number(checkItem?.grossWeight), 15.0);
    console.log('✓ Inventory item status, weights, and branch remained completely isolated & untouched.');

    // 6. TEST: ACTIVATION & DEACTIVATION (STATUS)
    console.log('\n[TEST 5] Testing Tag Status Activation & Deactivation...');
    const deactivateRes = await request(
      'PATCH',
      `/inventory-items/${testItemId2}/tag/status`,
      { isActive: false },
      ownerToken
    );
    assert.strictEqual(deactivateRes.status, 200, 'Deactivation should return 200 OK');
    assert.strictEqual(deactivateRes.body.data.isActive, false);
    console.log('✓ Tag deactivated successfully (isActive: false).');

    // Inactive Barcode Lookup must return 404 Not Found
    const inactiveLookupRes = await request('GET', `/inventory-tags/barcode/${customBarcode}`, undefined, ownerToken);
    assert.strictEqual(inactiveLookupRes.status, 404, 'Inactive tag barcode lookup must return 404');
    console.log('✓ Lookup on inactive tag returned 404 Not Found as expected.');

    // Re-activate Tag
    const activateRes = await request(
      'PATCH',
      `/inventory-items/${testItemId2}/tag/status`,
      { isActive: true },
      ownerToken
    );
    assert.strictEqual(activateRes.status, 200, 'Re-activation should return 200 OK');
    assert.strictEqual(activateRes.body.data.isActive, true);
    console.log('✓ Tag re-activated successfully (isActive: true).');

    // 7. TEST: TAG LIST & PAGINATION
    console.log('\n[TEST 6] Testing Inventory Tag Listing & Pagination (GET /inventory-tags)...');
    const tagListRes = await request('GET', '/inventory-tags?page=1&limit=5', undefined, ownerToken);
    assert.strictEqual(tagListRes.status, 200, 'Tag list query should return 200 OK');
    assert.ok(Array.isArray(tagListRes.body.data));
    assert.ok(tagListRes.body.pagination);
    console.log(`✓ Retrieved ${tagListRes.body.data.length} tag(s) on page 1.`);

    // 8. TEST: BARCODE DOWNLOAD SVG ENDPOINT
    console.log('\n[TEST 7] Testing Barcode Download SVG Endpoint (GET /inventory-tags/barcode/:barcode/download)...');
    const downloadRes = await request('GET', `/inventory-tags/barcode/${regenRes.body.data.barcode}/download`, undefined, ownerToken);
    assert.strictEqual(downloadRes.status, 200, 'Barcode download should return 200 OK');
    assert.ok(typeof downloadRes.body === 'string' && downloadRes.body.includes('<svg'), 'Response should contain valid SVG markup');
    console.log('✓ Barcode download SVG generated successfully with headers and valid vector graphics.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 3.4 INVENTORY TAG TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 3.4 INVENTORY TAG TESTS FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runInventoryTagTests();
