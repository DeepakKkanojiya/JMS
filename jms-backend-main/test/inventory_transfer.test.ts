import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let testProductId: string;
let branch1Id: string;
let branch2Id: string;
let testItemId1: string;
let testItemId2: string;
let transfer1Id: string;
let transfer2Id: string;

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

async function runInventoryTransferTests() {
  console.log('==================================================');
  console.log('RUNNING SPRINT 3.5 BRANCH STOCK TRANSFER TESTS');
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

    // Fetch Product & 2 distinct Branches
    const product = await prisma.product.findFirst({ where: { isActive: true } });
    const branches = await prisma.branch.findMany({ where: { isActive: true }, take: 2 });
    assert.ok(product, 'Test product should exist');
    assert.ok(branches.length >= 2, 'At least 2 active branches are required for transfer test');

    testProductId = product.id;
    branch1Id = branches[0].id;
    branch2Id = branches[1].id;

    // Create 2 test inventory items at branch 1
    const itemCode1 = `INV-TRF1-${Date.now()}`;
    const itemCode2 = `INV-TRF2-${Date.now()}`;

    const item1 = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: branch1Id,
        itemCode: itemCode1,
        grossWeight: 25.0,
        netWeight: 24.0,
        stoneWeight: 1.0,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });
    testItemId1 = item1.id;

    const item2 = await prisma.inventoryItem.create({
      data: {
        productId: testProductId,
        branchId: branch1Id,
        itemCode: itemCode2,
        grossWeight: 30.0,
        netWeight: 29.0,
        stoneWeight: 1.0,
        purity: '22K',
        status: 'AVAILABLE',
      },
    });
    testItemId2 = item2.id;

    console.log(`✓ Setup complete. Created 2 test items at branch '${branches[0].name}': '${itemCode1}' and '${itemCode2}'.`);

    // 2. TEST: Auth Security Guard
    console.log('\n[TEST 1] Testing Auth Security Guard...');
    const noTokenRes = await request('GET', '/inventory-transfers');
    assert.strictEqual(noTokenRes.status, 401, 'Missing token should return 401 Unauthorized');
    console.log('✓ Missing token rejected with 401 Unauthorized.');

    // 3. TEST: CREATE TRANSFER REQUEST
    console.log('\n[TEST 2] Testing Transfer Creation...');

    // 3a. Same source & destination branch (400)
    const sameBranchRes = await request(
      'POST',
      '/inventory-transfers',
      {
        inventoryItemId: testItemId1,
        fromBranchId: branch1Id,
        toBranchId: branch1Id,
      },
      ownerToken
    );
    assert.strictEqual(sameBranchRes.status, 400, 'Same source & destination branch should return 400');
    console.log('✓ Same source and destination branch rejected with 400 Bad Request.');

    // 3b. Create valid Transfer 1 for Item 1 (REQUESTED)
    const createRes1 = await request(
      'POST',
      '/inventory-transfers',
      {
        inventoryItemId: testItemId1,
        fromBranchId: branch1Id,
        toBranchId: branch2Id,
        remarks: 'Transferring Item 1 to Showroom 2',
      },
      ownerToken
    );
    assert.strictEqual(createRes1.status, 201, 'Transfer creation should return 201 Created');
    assert.strictEqual(createRes1.body.data.status, 'REQUESTED');
    assert.ok(createRes1.body.data.transferCode);
    transfer1Id = createRes1.body.data.id;
    console.log(`✓ Transfer 1 created successfully: '${createRes1.body.data.transferCode}' (${transfer1Id}).`);

    // 3c. Duplicate Active Transfer Request for same item (409 Conflict)
    const dupTransferRes = await request(
      'POST',
      '/inventory-transfers',
      {
        inventoryItemId: testItemId1,
        toBranchId: branch2Id,
      },
      ownerToken
    );
    assert.strictEqual(dupTransferRes.status, 409, 'Duplicate active transfer should return 409 Conflict');
    console.log('✓ Duplicate active transfer on same item rejected with 409 Conflict.');

    // 3d. Create valid Transfer 2 for Item 2 (for Rejection test)
    const createRes2 = await request(
      'POST',
      '/inventory-transfers',
      {
        inventoryItemId: testItemId2,
        fromBranchId: branch1Id,
        toBranchId: branch2Id,
        remarks: 'Transferring Item 2 to Showroom 2',
      },
      ownerToken
    );
    assert.strictEqual(createRes2.status, 201);
    transfer2Id = createRes2.body.data.id;
    console.log(`✓ Transfer 2 created for rejection test: '${createRes2.body.data.transferCode}' (${transfer2Id}).`);

    // 4. TEST: REJECT TRANSFER
    console.log('\n[TEST 3] Testing Transfer Rejection...');
    const rejectRes = await request(
      'POST',
      `/inventory-transfers/${transfer2Id}/reject`,
      { rejectionReason: 'Showroom 2 has full display inventory' },
      ownerToken
    );
    assert.strictEqual(rejectRes.status, 200, 'Rejection should return 200 OK');
    assert.strictEqual(rejectRes.body.data.status, 'REJECTED');
    assert.strictEqual(rejectRes.body.data.rejectionReason, 'Showroom 2 has full display inventory');
    console.log('✓ Transfer 2 rejected successfully.');

    // Attempting to dispatch a rejected transfer should return 400 Bad Request
    const badDispatchRes = await request(
      'POST',
      `/inventory-transfers/${transfer2Id}/dispatch`,
      undefined,
      ownerToken
    );
    assert.strictEqual(badDispatchRes.status, 400, 'Dispatching rejected transfer should return 400');
    console.log('✓ Dispatching rejected transfer rejected with 400 Bad Request.');

    // 5. TEST: APPROVE TRANSFER 1
    console.log('\n[TEST 4] Testing Transfer Approval...');
    const approveRes = await request(
      'POST',
      `/inventory-transfers/${transfer1Id}/approve`,
      undefined,
      ownerToken
    );
    assert.strictEqual(approveRes.status, 200, 'Approval should return 200 OK');
    assert.strictEqual(approveRes.body.data.status, 'APPROVED');
    console.log('✓ Transfer 1 approved successfully (status: APPROVED).');

    // 6. TEST: DISPATCH TRANSFER 1
    console.log('\n[TEST 5] Testing Transfer Dispatch...');
    const dispatchRes = await request(
      'POST',
      `/inventory-transfers/${transfer1Id}/dispatch`,
      undefined,
      ownerToken
    );
    assert.strictEqual(dispatchRes.status, 200, 'Dispatch should return 200 OK');
    assert.strictEqual(dispatchRes.body.data.status, 'DISPATCHED');
    console.log('✓ Transfer 1 dispatched successfully (status: DISPATCHED).');

    // Verify Item 1 status updated to IN_TRANSIT
    const item1AfterDispatch = await prisma.inventoryItem.findUnique({ where: { id: testItemId1 } });
    assert.strictEqual(item1AfterDispatch?.status, 'IN_TRANSIT');
    assert.strictEqual(item1AfterDispatch?.branchId, branch1Id, 'Item should remain at source branch during in-transit');
    console.log('✓ Item status updated to IN_TRANSIT and remains at source branch until received.');

    // Verify StockMovement record created automatically for TRANSFER
    const movements = await prisma.stockMovement.findMany({
      where: { referenceId: transfer1Id },
    });
    assert.strictEqual(movements.length, 1, 'Exactly 1 StockMovement record should be logged on dispatch');
    assert.strictEqual(movements[0].movementType, 'TRANSFER');
    assert.strictEqual(movements[0].fromBranchId, branch1Id);
    assert.strictEqual(movements[0].toBranchId, branch2Id);
    console.log('✓ StockMovement audit record logged automatically on dispatch.');

    // 7. TEST: RECEIVE TRANSFER 1
    console.log('\n[TEST 6] Testing Transfer Receiving...');
    const receiveRes = await request(
      'POST',
      `/inventory-transfers/${transfer1Id}/receive`,
      undefined,
      ownerToken
    );
    assert.strictEqual(receiveRes.status, 200, 'Receiving should return 200 OK');
    assert.strictEqual(receiveRes.body.data.status, 'RECEIVED');
    console.log('✓ Transfer 1 received successfully (status: RECEIVED).');

    // Verify Item 1 branchId updated to destination branch2 and status restored to AVAILABLE
    const item1AfterReceive = await prisma.inventoryItem.findUnique({ where: { id: testItemId1 } });
    assert.strictEqual(item1AfterReceive?.branchId, branch2Id, 'Item branchId should be updated to destination branch');
    assert.strictEqual(item1AfterReceive?.status, 'AVAILABLE', 'Item status should be restored to AVAILABLE');
    console.log('✓ Item branchId updated to destination branch and status restored to AVAILABLE.');

    // 8. TEST: LIST & SEARCH TRANSFERS
    console.log('\n[TEST 7] Testing Transfer Listing & Search...');
    const listRes = await request('GET', '/inventory-transfers?page=1&limit=10', undefined, ownerToken);
    assert.strictEqual(listRes.status, 200, 'List transfers should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.pagination);
    console.log(`✓ Retrieved ${listRes.body.data.length} transfer record(s) on page 1.`);

    // Get Transfer By ID
    const getByIdRes = await request('GET', `/inventory-transfers/${transfer1Id}`, undefined, ownerToken);
    assert.strictEqual(getByIdRes.status, 200, 'Get transfer by ID should return 200 OK');
    assert.strictEqual(getByIdRes.body.data.id, transfer1Id);
    assert.ok(getByIdRes.body.data.inventoryItem);
    assert.ok(getByIdRes.body.data.fromBranch);
    assert.ok(getByIdRes.body.data.toBranch);
    console.log('✓ Get transfer by ID returned populated item, branches, and audit user relations.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 3.5 BRANCH TRANSFER TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 3.5 BRANCH TRANSFER TESTS FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runInventoryTransferTests();
