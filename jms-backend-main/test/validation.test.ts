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

async function runValidationTests() {
  console.log('[TEST] Starting Sprint 0.6 Request Validation Test Suite...');

  await connectDB();

  const server = app.listen(5098);
  const host = 'localhost';
  const port = 5098;

  let adminToken = '';
  let userId = '';

  try {
    // Obtain valid token for authenticated validation tests
    const loginRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(loginRes.statusCode, 200);
    adminToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;

    // 1. Postman Test: Missing Email on Login
    console.log('[TEST] 1. Login with Missing Email...');
    const missingEmailRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { password: 'Admin@123456' }
    );
    assert.strictEqual(missingEmailRes.statusCode, 400);
    assert.strictEqual(missingEmailRes.body.success, false);
    assert.strictEqual(missingEmailRes.body.message, 'Validation failed');
    assert.ok(missingEmailRes.body.errors.some((e: any) => e.field === 'email'));
    console.log('[PASS] Missing email rejected with 400 Bad Request and standard error payload.');

    // 2. Postman Test: Missing Password on Login
    console.log('[TEST] 2. Login with Missing Password...');
    const missingPasswordRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'admin@jewelleryerp.com' }
    );
    assert.strictEqual(missingPasswordRes.statusCode, 400);
    assert.strictEqual(missingPasswordRes.body.success, false);
    assert.ok(missingPasswordRes.body.errors.some((e: any) => e.field === 'password'));
    console.log('[PASS] Missing password rejected with 400 Bad Request.');

    // 3. Postman Test: Invalid Email Format on Login
    console.log('[TEST] 3. Login with Invalid Email Format...');
    const invalidEmailRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'invalid-email-string', password: 'Admin@123456' }
    );
    assert.strictEqual(invalidEmailRes.statusCode, 400);
    assert.strictEqual(invalidEmailRes.body.success, false);
    assert.ok(invalidEmailRes.body.errors.some((e: any) => e.field === 'email'));
    console.log('[PASS] Invalid email format rejected with 400 Bad Request.');

    // 4. Postman Test: Empty JSON Body {}
    console.log('[TEST] 4. Login with Empty Body {}...');
    const emptyBodyRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      {}
    );
    assert.strictEqual(emptyBodyRes.statusCode, 400);
    assert.strictEqual(emptyBodyRes.body.success, false);
    assert.ok(emptyBodyRes.body.errors.length >= 2);
    console.log('[PASS] Empty body rejected with 400 Bad Request.');

    // 5. Postman Test: Invalid URL Parameter (GET /api/users/abc)
    console.log('[TEST] 5. Get User with Invalid UUID Parameter (/api/users/abc)...');
    const invalidIdRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users/abc',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(invalidIdRes.statusCode, 400);
    assert.strictEqual(invalidIdRes.body.success, false);
    assert.ok(invalidIdRes.body.errors.some((e: any) => e.field === 'id'));
    console.log('[PASS] Invalid ID parameter rejected with 400 Bad Request.');

    // 6. Postman Test: Invalid Pagination Query (GET /api/users?page=-1)
    console.log('[TEST] 6. Get Users with Invalid Pagination (page=-1)...');
    const invalidPageRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users?page=-1',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(invalidPageRes.statusCode, 400);
    assert.strictEqual(invalidPageRes.body.success, false);
    assert.ok(invalidPageRes.body.errors.some((e: any) => e.field === 'page'));
    console.log('[PASS] Invalid page parameter rejected with 400 Bad Request.');

    // 7. Postman Test: Invalid Limit Query (GET /api/users?limit=200 > max 100)
    console.log('[TEST] 7. Get Users with Invalid Limit (limit=200 > max 100)...');
    const invalidLimitRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users?limit=200',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(invalidLimitRes.statusCode, 400);
    assert.strictEqual(invalidLimitRes.body.success, false);
    assert.ok(invalidLimitRes.body.errors.some((e: any) => e.field === 'limit'));
    console.log('[PASS] Limit > 100 rejected with 400 Bad Request.');

    // 8. Document Creation Validation without Required Body
    console.log('[TEST] 8. Customer Document Creation without Required Body...');
    const missingDocRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/customers/00000000-0000-0000-0000-000000000000/documents',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      {}
    );
    assert.strictEqual(missingDocRes.statusCode, 400);
    assert.strictEqual(missingDocRes.body.success, false);
    assert.ok(missingDocRes.body.errors.length >= 1);
    console.log('[PASS] Missing document body rejected with 400 Bad Request.');

    // 9. Positive Test: Valid URL Parameter (GET /api/users/<valid-uuid>)
    console.log('[TEST] 9. Valid User ID parameter...');
    const validIdRes = await makeRequest({
      hostname: host,
      port,
      path: `/api/v1/users/${userId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(validIdRes.statusCode, 200);
    assert.strictEqual(validIdRes.body.success, true);
    assert.strictEqual(validIdRes.body.data.id, userId);
    console.log('[PASS] Valid UUID parameter passed validation successfully.');

    // 10. Positive Test: Valid Pagination Query (GET /api/users?page=1&limit=10)
    console.log('[TEST] 10. Valid Pagination query...');
    const validPageRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/users?page=1&limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(validPageRes.statusCode, 200);
    assert.strictEqual(validPageRes.body.success, true);
    assert.strictEqual(validPageRes.body.pagination.page, 1);
    assert.strictEqual(validPageRes.body.pagination.limit, 10);
    console.log('[PASS] Valid pagination query passed validation successfully.');

    console.log('[SUCCESS] All Request Validation tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runValidationTests().catch((err) => {
  console.error('[ERROR] Request Validation test suite failed:', err);
  process.exit(1);
});
