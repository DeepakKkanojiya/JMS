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

async function runUserTests() {
  console.log('[TEST] Starting User Management Subsystem Test Suite...');

  await connectDB();

  const server = app.listen(5098);
  const host = 'localhost';
  const port = 5098;

  let ownerToken = '';
  let cashierToken = '';
  let cashierRoleId = '';
  let createdUserId = '';

  try {
    // 1. Authenticate as Owner
    console.log('[TEST] 1. Login as Owner...');
    const ownerLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(ownerLogin.statusCode, 200);
    ownerToken = ownerLogin.body.data.accessToken;

    // Fetch Cashier Role ID
    const cashierRole = await prisma.role.findUnique({ where: { name: 'CASHIER' } });
    assert.ok(cashierRole);
    cashierRoleId = cashierRole!.id;

    // 2. Authenticate as Cashier
    console.log('[TEST] 2. Login as Cashier...');
    const cashierLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'cashier@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(cashierLogin.statusCode, 200);
    cashierToken = cashierLogin.body.data.accessToken;

    // 3. Owner creates a new Sales Executive user
    console.log('[TEST] 3. Owner creates new User (POST /api/v1/users)...');
    const createUserRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/users',
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      {
        roleId: cashierRoleId,
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.test@jewelleryerp.com',
        mobile: '9876543210',
        password: 'Admin@123',
      }
    );
    assert.strictEqual(createUserRes.statusCode, 201);
    assert.strictEqual(createUserRes.body.success, true);
    assert.ok(createUserRes.body.data.id);
    createdUserId = createUserRes.body.data.id;
    console.log('[PASS] User created successfully.');

    // 4. Test Cashier permission check (Cashier lacks user.create permission)
    console.log('[TEST] 4. Cashier attempts to create User (expect 403)...');
    const cashierCreateRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/users',
        method: 'POST',
        headers: { Authorization: `Bearer ${cashierToken}` },
      },
      {
        roleId: cashierRoleId,
        firstName: 'Unauthorized',
        email: 'unauth@jewelleryerp.com',
        password: 'Admin@123',
      }
    );
    assert.strictEqual(cashierCreateRes.statusCode, 403);
    assert.strictEqual(cashierCreateRes.body.message, 'You do not have permission to perform this action.');
    console.log('[PASS] Cashier restricted with 403 Forbidden.');

    // 5. Get User List with pagination & search
    console.log('[TEST] 5. Get User List with search (GET /api/v1/users?search=rahul)...');
    const listRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users?search=rahul',
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(listRes.statusCode, 200);
    assert.strictEqual(listRes.body.success, true);
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].email, 'rahul.test@jewelleryerp.com');
    console.log('[PASS] User search and list successful.');

    // 6. Get User Details by ID
    console.log('[TEST] 6. Get User Details (GET /api/v1/users/:id)...');
    const detailRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/users/${createdUserId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(detailRes.statusCode, 200);
    assert.strictEqual(detailRes.body.data.email, 'rahul.test@jewelleryerp.com');
    console.log('[PASS] User details retrieved.');

    // 7. Deactivate User
    console.log('[TEST] 7. Deactivate User (PATCH /api/v1/users/:id/deactivate)...');
    const deactRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/users/${createdUserId}/deactivate`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(deactRes.statusCode, 200);
    assert.strictEqual(deactRes.body.data.status, 'INACTIVE');
    console.log('[PASS] User deactivated.');

    // 8. Activate User
    console.log('[TEST] 8. Activate User (PATCH /api/v1/users/:id/activate)...');
    const actRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/users/${createdUserId}/activate`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(actRes.statusCode, 200);
    assert.strictEqual(actRes.body.data.status, 'ACTIVE');
    console.log('[PASS] User activated.');

    // 9. Reset Password for User
    console.log('[TEST] 9. Reset User Password (PATCH /api/v1/users/:id/reset-password)...');
    const resetRes = await makeRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/users/${createdUserId}/reset-password`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      { newPassword: 'NewAdminPassword@123' }
    );
    assert.strictEqual(resetRes.statusCode, 200);
    assert.strictEqual(resetRes.body.message, 'Password reset successfully');
    console.log('[PASS] Admin password reset successful.');

    // 10. Delete User
    console.log('[TEST] 10. Delete User (DELETE /api/v1/users/:id)...');
    const delRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/users/${createdUserId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(delRes.statusCode, 200);
    console.log('[PASS] User deleted successfully.');

    console.log('[SUCCESS] All User Management tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runUserTests().catch((err) => {
  console.error('[ERROR] User test suite failed:', err);
  process.exit(1);
});
