import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database';

function makeRequest(
  options: http.RequestOptions,
  bodyData?: object
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = bodyData !== undefined ? JSON.stringify(bodyData) : '';
    const reqHeaders: Record<string, string> = {};

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        if (value !== undefined) {
          reqHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      }
    }

    if (bodyData !== undefined) {
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

async function runErrorTests() {
  console.log('[TEST] Starting Sprint 0.7 Global Error Handling Test Suite...');

  await connectDB();

  const server = app.listen(5097);
  const host = 'localhost';
  const port = 5097;

  let adminToken = '';
  let userToken = '';

  try {
    // Authenticate Admin and User for role authorization testing
    const adminLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(adminLogin.statusCode, 200);
    adminToken = adminLogin.body.data.accessToken;

    const userLogin = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'user@erp.com', password: 'User@123' }
    );
    assert.strictEqual(userLogin.statusCode, 200);
    userToken = userLogin.body.data.accessToken;

    // 1. Validation Error (400 Bad Request)
    console.log('[TEST] 1. Validation Error (400 Bad Request)...');
    const valRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { password: 'Password@123' }
    );
    assert.strictEqual(valRes.statusCode, 400);
    assert.strictEqual(valRes.body.success, false);
    assert.strictEqual(valRes.body.statusCode, 400);
    assert.strictEqual(valRes.body.message, 'Validation failed');
    assert.ok(Array.isArray(valRes.body.errors));
    assert.ok(valRes.body.timestamp);
    assert.strictEqual(valRes.body.path, '/api/v1/auth/login');
    console.log('[PASS] Validation error returns standard 400 response.');

    // 2. Unauthorized Error (401 Unauthorized)
    console.log('[TEST] 2. Unauthorized Error (401 Unauthorized)...');
    const unauthRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
    });
    assert.strictEqual(unauthRes.statusCode, 401);
    assert.strictEqual(unauthRes.body.success, false);
    assert.strictEqual(unauthRes.body.statusCode, 401);
    assert.strictEqual(unauthRes.body.message, 'Unauthorized');
    assert.ok(unauthRes.body.timestamp);
    assert.strictEqual(unauthRes.body.path, '/api/v1/users');
    console.log('[PASS] Missing token returns standard 401 response.');

    // 3. Forbidden Error (403 Forbidden)
    console.log('[TEST] 3. Forbidden Error (403 Forbidden)...');
    const forbiddenRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(forbiddenRes.statusCode, 403);
    assert.strictEqual(forbiddenRes.body.success, false);
    assert.strictEqual(forbiddenRes.body.statusCode, 403);
    assert.ok(forbiddenRes.body.message);
    assert.ok(forbiddenRes.body.timestamp);
    assert.strictEqual(forbiddenRes.body.path, '/api/v1/users');
    console.log('[PASS] Insufficient role permissions return standard 403 response.');

    // 4. Route Not Found Error (404 Not Found)
    console.log('[TEST] 4. Route Not Found Error (404 Not Found)...');
    const notFoundRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/xyz',
      method: 'GET',
    });
    assert.strictEqual(notFoundRes.statusCode, 404);
    assert.strictEqual(notFoundRes.body.success, false);
    assert.strictEqual(notFoundRes.body.statusCode, 404);
    assert.strictEqual(notFoundRes.body.message, 'Route not found');
    assert.ok(notFoundRes.body.timestamp);
    assert.strictEqual(notFoundRes.body.path, '/api/xyz');
    console.log('[PASS] Unknown route returns standard 404 response.');

    // 5. Conflict Error (409 Conflict)
    console.log('[TEST] 5. Conflict Error (409 Conflict)...');
    const conflictRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/users',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      {
        firstName: 'Owner',
        email: 'owner@jewelleryerp.com',
        password: 'Password@123',
        roleId: '00000000-0000-0000-0000-000000000000',
      }
    );
    assert.strictEqual(conflictRes.statusCode, 409);
    assert.strictEqual(conflictRes.body.success, false);
    assert.strictEqual(conflictRes.body.statusCode, 409);
    assert.strictEqual(conflictRes.body.message, 'Email already exists');
    assert.ok(conflictRes.body.timestamp);
    console.log('[PASS] Duplicate resource creation returns standard 409 response.');

    // 6. Database Error (500 Database Error)
    console.log('[TEST] 6. Database Error (500 Internal Server Error)...');
    const dbErrRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/test/db-error',
      method: 'GET',
    });
    assert.strictEqual(dbErrRes.statusCode, 500);
    assert.strictEqual(dbErrRes.body.success, false);
    assert.strictEqual(dbErrRes.body.statusCode, 500);
    assert.strictEqual(dbErrRes.body.message, 'Database unavailable');
    assert.ok(dbErrRes.body.timestamp);
    console.log('[PASS] Database error returns standard 500 response.');

    // 7. Internal Server Error (500 Internal Error)
    console.log('[TEST] 7. Internal Server Error (500 Internal Error)...');
    const internalErrRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/test/internal-error',
      method: 'GET',
    });
    assert.strictEqual(internalErrRes.statusCode, 500);
    assert.strictEqual(internalErrRes.body.success, false);
    assert.strictEqual(internalErrRes.body.statusCode, 500);
    assert.strictEqual(internalErrRes.body.message, 'Simulated uncaught exception');
    assert.ok(internalErrRes.body.timestamp);
    console.log('[PASS] Uncaught exception returns standard 500 response.');

    console.log('[SUCCESS] All Global Error Handling tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runErrorTests().catch((err) => {
  console.error('[ERROR] Global Error Handling test suite failed:', err);
  process.exit(1);
});
