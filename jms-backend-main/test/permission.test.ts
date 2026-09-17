import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB, prisma } from '../src/database';

function makeRequest(
  options: http.RequestOptions,
  bodyData?: object
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = bodyData ? JSON.stringify(bodyData) : '';
    const reqHeaders: Record<string, string> = {};

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        if (value !== undefined) {
          reqHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      }
    }

    if (bodyData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const reqOptions: http.RequestOptions = {
      ...options,
      headers: reqHeaders,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsedBody = data;
        try {
          parsedBody = JSON.parse(data);
        } catch {
          // Keep raw string
        }
        resolve({
          statusCode: res.statusCode || 500,
          headers: res.headers,
          body: parsedBody,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runPermissionTests() {
  console.log('[TEST] Starting Permission Management Subsystem Test Suite...');

  await connectDB();

  const server = app.listen(5096);
  const host = 'localhost';
  const port = 5096;

  let ownerToken = '';
  let createdPermissionId = '';

  try {
    // 1. Login as Owner
    console.log('[TEST] 1. Login as Owner...');
    const ownerLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(ownerLogin.statusCode, 200);
    ownerToken = ownerLogin.body.data.accessToken;

    // 2. Create Permission
    console.log('[TEST] 2. Create Custom Permission (POST /api/v1/permissions)...');
    const createPermRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/permissions',
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      {
        module: 'approval',
        action: 'create',
        permissionKey: 'approval.create',
        description: 'Create purchase or order approval request',
      }
    );
    assert.strictEqual(createPermRes.statusCode, 201);
    assert.strictEqual(createPermRes.body.data.permissionKey, 'approval.create');
    createdPermissionId = createPermRes.body.data.id;
    console.log('[PASS] Permission created successfully.');

    // 3. Get Permissions List with Module filter
    console.log('[TEST] 3. Get Permissions List with Filter (GET /api/v1/permissions?module=approval)...');
    const listRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/permissions?module=approval',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(listRes.statusCode, 200);
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].permissionKey, 'approval.create');
    console.log('[PASS] Filtered permissions list retrieved.');

    // 4. Get Permissions By Module
    console.log('[TEST] 4. Get Permissions By Module (GET /api/v1/permissions/modules/customer)...');
    const modRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/permissions/modules/customer',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(modRes.statusCode, 200);
    assert.ok(modRes.body.data.includes('customer.create'));
    assert.ok(modRes.body.data.includes('customer.read'));
    console.log('[PASS] Module permissions retrieved.');

    // 5. Get Permission Details
    console.log('[TEST] 5. Get Permission Details (GET /api/v1/permissions/:id)...');
    const detailRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/permissions/${createdPermissionId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(detailRes.statusCode, 200);
    assert.strictEqual(detailRes.body.data.permissionKey, 'approval.create');
    console.log('[PASS] Permission details retrieved.');

    // 6. Delete Unassigned Permission
    console.log('[TEST] 6. Delete Unassigned Permission (DELETE /api/v1/permissions/:id)...');
    const delRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/permissions/${createdPermissionId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(delRes.statusCode, 200);
    console.log('[PASS] Unassigned permission deleted.');

    // 7. Negative Delete - Cannot Delete Permission Assigned To Role
    console.log('[TEST] 7. Negative Delete - Cannot Delete Assigned Permission...');
    const customerReadPerm = await prisma.permission.findUnique({ where: { permissionKey: 'customer.read' } });
    assert.ok(customerReadPerm);
    const delAssignedRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/permissions/${customerReadPerm!.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(delAssignedRes.statusCode, 400);
    assert.strictEqual(delAssignedRes.body.message, 'Cannot Delete Permission Assigned To Any Role');
    console.log('[PASS] Deletion of assigned permission rejected.');

    console.log('[SUCCESS] All Permission Management tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runPermissionTests().catch((err) => {
  console.error('[ERROR] Permission test suite failed:', err);
  process.exit(1);
});
