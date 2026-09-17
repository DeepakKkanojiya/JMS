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
          // keep raw string
        }
        resolve({ statusCode: res.statusCode || 500, headers: res.headers, body: parsedBody });
      });
    });

    req.on('error', reject);
    if (bodyData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runMasterApiTests() {
  console.log('[TEST] Starting Step 9 — Common Master APIs Integration Test Suite...');

  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  try {
    // 1. Authenticate as Owner
    console.log('[TEST] 1. Authenticating as Owner...');
    const loginRes = await makeRequest(
      { host: 'localhost', port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(loginRes.statusCode, 200, 'Owner login should return 200 OK');
    const token = loginRes.body.data.accessToken;
    assert.ok(token);
    console.log('[PASS] Owner authenticated.');

    // 2. Unauthenticated Guard
    console.log('[TEST] 2. Testing 401 Guard on Common Masters...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/masters/dropdowns',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated dropdown request must return 401');
    console.log('[PASS] 401 Unauthorized guard verified.');

    // 3. GET /api/v1/masters/dropdowns
    console.log('[TEST] 3. Testing GET /api/v1/masters/dropdowns...');
    const dropdownsRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/masters/dropdowns',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(dropdownsRes.statusCode, 200, 'Dropdowns endpoint should return 200 OK');
    assert.ok(dropdownsRes.body.data.companies, 'Companies dropdown array must exist');
    assert.ok(dropdownsRes.body.data.branches, 'Branches dropdown array must exist');
    assert.ok(dropdownsRes.body.data.categories, 'Categories dropdown array must exist');
    assert.ok(dropdownsRes.body.data.roles, 'Roles dropdown array must exist');
    console.log('[PASS] Dropdowns response structure verified.');

    // 4. GET /api/v1/masters/statuses
    console.log('[TEST] 4. Testing GET /api/v1/masters/statuses...');
    const statusesRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/masters/statuses',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(statusesRes.statusCode, 200, 'Statuses endpoint should return 200 OK');
    assert.ok(Array.isArray(statusesRes.body.data.masterEntityStatus));
    assert.ok(Array.isArray(statusesRes.body.data.metalTypes));
    console.log('[PASS] Statuses response structure verified.');

    // 5. GET /api/v1/masters/branches
    console.log('[TEST] 5. Testing GET /api/v1/masters/branches...');
    const branchesRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/masters/branches',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(branchesRes.statusCode, 200, 'Branches endpoint should return 200 OK');
    assert.ok(Array.isArray(branchesRes.body.data));
    console.log('[PASS] Branches master list verified.');

    // 6. GET /api/v1/masters/roles
    console.log('[TEST] 6. Testing GET /api/v1/masters/roles...');
    const rolesRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/masters/roles',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(rolesRes.statusCode, 200, 'Roles endpoint should return 200 OK');
    assert.ok(Array.isArray(rolesRes.body.data));
    console.log('[PASS] Roles master list verified.');

    // 7. GET /api/v1/masters/categories
    console.log('[TEST] 7. Testing GET /api/v1/masters/categories...');
    const categoriesRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/masters/categories',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(categoriesRes.statusCode, 200, 'Categories endpoint should return 200 OK');
    assert.ok(Array.isArray(categoriesRes.body.data));
    console.log('[PASS] Categories master list verified.');

    console.log('\n[SUCCESS] Step 9 — Common Master APIs Integration Test Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runMasterApiTests().catch((err) => {
  console.error('[ERROR] Master API integration test failed:', err);
  process.exit(1);
});
