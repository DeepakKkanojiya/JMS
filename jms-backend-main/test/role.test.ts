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

async function runRoleTests() {
  console.log('[TEST] Starting Role Management Subsystem Test Suite...');

  await connectDB();

  const server = app.listen(5097);
  const host = 'localhost';
  const port = 5097;

  let ownerToken = '';
  let createdRoleId = '';
  let samplePermissionId = '';

  try {
    // 1. Authenticate as Owner
    console.log('[TEST] 1. Login as Owner...');
    const ownerLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(ownerLogin.statusCode, 200);
    ownerToken = ownerLogin.body.data.accessToken;

    // 2. Fetch all permissions catalog
    console.log('[TEST] 2. Get Permissions catalog (GET /api/v1/permissions)...');
    const permCatalog = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/permissions',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(permCatalog.statusCode, 200);
    assert.ok(permCatalog.body.data.length > 0);
    samplePermissionId = permCatalog.body.data[0].id;
    console.log('[PASS] Permissions catalog retrieved successfully.');

    // 3. Owner creates custom Role
    console.log('[TEST] 3. Create Custom Role (POST /api/v1/roles)...');
    const createRoleRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/roles',
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      {
        name: 'STORE_AUDITOR',
        displayName: 'Store Auditor',
        description: 'Audits inventory and ledger reports',
      }
    );
    assert.strictEqual(createRoleRes.statusCode, 201);
    assert.strictEqual(createRoleRes.body.data.name, 'STORE_AUDITOR');
    createdRoleId = createRoleRes.body.data.id;
    console.log('[PASS] Custom role created.');

    // 4. Get Roles List
    console.log('[TEST] 4. Get Roles List (GET /api/v1/roles)...');
    const rolesListRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/roles',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(rolesListRes.statusCode, 200);
    assert.ok(rolesListRes.body.data.length >= 8);
    console.log('[PASS] Roles list retrieved.');

    // 5. Get Role Details
    console.log('[TEST] 5. Get Role Details (GET /api/v1/roles/:id)...');
    const roleDetailRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/roles/${createdRoleId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(roleDetailRes.statusCode, 200);
    assert.strictEqual(roleDetailRes.body.data.name, 'STORE_AUDITOR');
    console.log('[PASS] Role details retrieved.');

    // 6. Assign Permissions to Role
    console.log('[TEST] 6. Assign Permissions (PUT /api/v1/roles/:id/permissions)...');
    const assignRes = await makeRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/roles/${createdRoleId}/permissions`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      {
        permissionIds: [samplePermissionId],
      }
    );
    assert.strictEqual(assignRes.statusCode, 200);
    assert.strictEqual(assignRes.body.success, true);
    console.log('[PASS] Permissions assigned to role.');

    // 7. View Role Permissions
    console.log('[TEST] 7. View Role Permissions (GET /api/v1/roles/:id/permissions)...');
    const viewPermRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/roles/${createdRoleId}/permissions`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(viewPermRes.statusCode, 200);
    assert.strictEqual(viewPermRes.body.data.length, 1);
    console.log('[PASS] Role permissions viewed.');

    // 8. Negative Delete - Cannot Delete OWNER Role
    console.log('[TEST] 8. Negative Delete - Cannot Delete OWNER Role...');
    const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } });
    assert.ok(ownerRole);
    const delOwnerRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/roles/${ownerRole!.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(delOwnerRes.statusCode, 400);
    assert.strictEqual(delOwnerRes.body.message, 'Cannot Delete OWNER Role');
    console.log('[PASS] Owner role protection enforced.');

    // 9. Delete Custom Unassigned Role
    console.log('[TEST] 9. Delete Custom Role (DELETE /api/v1/roles/:id)...');
    const delRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/roles/${createdRoleId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(delRes.statusCode, 200);
    console.log('[PASS] Custom role deleted.');

    console.log('[SUCCESS] All Role Management tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runRoleTests().catch((err) => {
  console.error('[ERROR] Role test suite failed:', err);
  process.exit(1);
});
