import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database';

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
          // Keep raw string if not JSON
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

async function runRbacTests() {
  console.log('[TEST] Starting Authorization (RBAC) Test Suite...');

  await connectDB();

  const server = app.listen(5098);
  const host = 'localhost';
  const port = 5098;

  let adminToken = '';
  let staffToken = '';
  let userToken = '';

  try {
    // 1. Login as Admin
    console.log('[TEST] 1. Authenticating Admin User...');
    const adminLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(adminLogin.statusCode, 200);
    adminToken = adminLogin.body.data.accessToken;

    // 2. Login as Staff
    console.log('[TEST] 2. Authenticating Staff User...');
    const staffLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'staff@jewelleryerp.com', password: 'Staff@123456' }
    );
    assert.strictEqual(staffLogin.statusCode, 200);
    staffToken = staffLogin.body.data.accessToken;

    // 3. Login as User
    console.log('[TEST] 3. Authenticating Standard User...');
    const userLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'user@jewelleryerp.com', password: 'User@123456' }
    );
    assert.strictEqual(userLogin.statusCode, 200);
    userToken = userLogin.body.data.accessToken;

    // 4. Admin Access Test (GET /users) -> Should pass (200)
    console.log('[TEST] 4. Testing Admin access to /users endpoint...');
    const adminUsersRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminUsersRes.statusCode, 200);
    assert.strictEqual(adminUsersRes.body.success, true);
    console.log('[PASS] Admin access granted to /users with 200 OK.');

    // 5. Staff Access Test to Admin endpoint (GET /users) -> Should fail (403)
    console.log('[TEST] 5. Testing Staff access to Admin /users endpoint (expect 403 Forbidden)...');
    const staffUsersRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.strictEqual(staffUsersRes.statusCode, 403);
    assert.strictEqual(staffUsersRes.body.success, false);
    assert.ok(staffUsersRes.body.message);
    console.log('[PASS] Staff access to /users rejected with 403 Forbidden.');

    // 6. User Access Test to Admin endpoint (GET /users) -> Should fail (403)
    console.log('[TEST] 6. Testing User access to Admin /users endpoint (expect 403 Forbidden)...');
    const userUsersRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(userUsersRes.statusCode, 403);
    assert.strictEqual(userUsersRes.body.success, false);
    console.log('[PASS] User access to /users rejected with 403 Forbidden.');

    // 7. Staff Access Test to Staff endpoint (GET /customers) -> Should pass (200)
    console.log('[TEST] 7. Testing Staff access to /customers endpoint...');
    const staffCustomersRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/customers',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(staffCustomersRes.statusCode, 200);
    assert.strictEqual(staffCustomersRes.body.success, true);
    console.log('[PASS] Staff access granted to /customers with 200 OK.');

    // 8. User Access Test to Staff endpoint (GET /customers) -> Should fail (403)
    console.log('[TEST] 8. Testing User access to Staff /customers endpoint (expect 403 Forbidden)...');
    const userCustomersRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/customers',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(userCustomersRes.statusCode, 403);
    assert.strictEqual(userCustomersRes.body.success, false);
    console.log('[PASS] User access to /customers rejected with 403 Forbidden.');

    // 9. User Access Test to User endpoint (GET /profile) -> Should pass (200)
    console.log('[TEST] 9. Testing User access to /profile endpoint...');
    const userProfileRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(userProfileRes.statusCode, 200);
    assert.strictEqual(userProfileRes.body.success, true);
    console.log('[PASS] User access granted to /profile with 200 OK.');

    // 10. Missing Token Test -> Should fail (401)
    console.log('[TEST] 10. Testing missing token (expect 401 Unauthorized)...');
    const noTokenRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
    });
    assert.strictEqual(noTokenRes.statusCode, 401);
    assert.strictEqual(noTokenRes.body.success, false);
    assert.strictEqual(noTokenRes.body.message, 'Unauthorized');
    console.log('[PASS] Missing token rejected with 401 Unauthorized.');

    // 11. Invalid Token Test -> Should fail (401)
    console.log('[TEST] 11. Testing invalid token (expect 401 Unauthorized)...');
    const invalidTokenRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_jwt_token_payload' },
    });
    assert.strictEqual(invalidTokenRes.statusCode, 401);
    assert.strictEqual(invalidTokenRes.body.success, false);
    assert.strictEqual(invalidTokenRes.body.message, 'Token expired or invalid');
    console.log('[PASS] Invalid token rejected with 401 Unauthorized.');

    console.log('[SUCCESS] All Role-Based Access Control (RBAC) tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runRbacTests().catch((err) => {
  console.error('[ERROR] RBAC test suite failed:', err);
  process.exit(1);
});
