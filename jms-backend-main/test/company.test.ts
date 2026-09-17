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
          // keep raw
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

async function runCompanyApiTests() {
  console.log('[TEST] Starting Step 1 — Company CRUD & Search/Filter Integration Test Suite...');

  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  try {
    const ts = Date.now().toString().slice(-6);

    // 1. Login as Owner to get token
    console.log('[TEST] 1. Authenticating as Owner...');
    const loginRes = await makeRequest(
      { host: 'localhost', port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(loginRes.statusCode, 200, 'Owner login should return 200 OK');
    const token = loginRes.body.data.accessToken;
    assert.ok(token, 'Access token must be present');
    console.log('[PASS] Owner authenticated successfully.');

    // 2. Unauthorized & Security Guards
    console.log('[TEST] 2. Testing Security Guards (401 Unauthorized)...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/companies',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401 Unauthorized');
    console.log('[PASS] 401 Unauthorized guard verified.');

    // 3. Positive Create Company
    console.log('[TEST] 3. Creating a new Company Profile (POST /api/v1/companies)...');
    const numPart = ts.slice(-4);
    const gstNo = `07AAAAA${numPart}A1Z5`;
    const panNo = `AAAAA${numPart}A`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/companies',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Royal Diamond Jewels ${ts}`,
        legalName: `Royal Diamond Jewels Pvt Ltd ${ts}`,
        gstNumber: gstNo,
        panNumber: panNo,
        email: `info.${ts}@royaldiamond.com`,
        phone: '+919876543210',
        website: 'https://www.royaldiamond.com',
        isActive: true,
      }
    );

    assert.strictEqual(createRes.statusCode, 201, 'Create company should return 201 Created');
    assert.strictEqual(createRes.body.success, true);
    const createdCompany = createRes.body.data;
    assert.ok(createdCompany.id, 'Company ID must be assigned');
    assert.strictEqual(createdCompany.gstNumber, gstNo);
    console.log('[PASS] Company profile created successfully.');

    // 4. Duplicate GSTIN & PAN (409 Conflict)
    console.log('[TEST] 4. Testing Duplicate GSTIN / PAN Validation (409 Conflict)...');
    const dupGstRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/companies',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: 'Duplicate GST Corp',
        gstNumber: gstNo,
      }
    );
    assert.strictEqual(dupGstRes.statusCode, 409, 'Duplicate GSTIN must return 409 Conflict');
    console.log('[PASS] 409 Conflict duplicate GSTIN verified.');

    // 5. Get Paginated Company List with Search, Status, Sorting & Empty Results
    console.log('[TEST] 5. Testing Search, Status Filter, Sorting & Pagination (GET /api/v1/companies)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies?search=${ts}&isActive=true&sortBy=name&sortOrder=asc&page=1&limit=10`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'Get company list should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data), 'Company list data must be an array');
    assert.ok(listRes.body.pagination, 'Pagination metadata must be returned');
    assert.strictEqual(listRes.body.pagination.page, 1);
    assert.strictEqual(listRes.body.pagination.limit, 10);
    assert.ok(listRes.body.data.length >= 1, 'Search result should contain the created company');
    console.log('[PASS] Company list retrieved with search, status filter, sorting & pagination.');

    // 6. Test Empty Search Result
    console.log('[TEST] 6. Testing Empty Search Result...');
    const emptyRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies?search=NONEXISTENT_COMPANY_${ts}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(emptyRes.statusCode, 200, 'Empty search should return 200 OK');
    assert.strictEqual(emptyRes.body.data.length, 0, 'Data array should be empty');
    assert.strictEqual(emptyRes.body.pagination.total, 0);
    console.log('[PASS] Empty search result handled properly.');

    // 7. Get Company By ID
    console.log('[TEST] 7. Getting Company Details by ID (GET /api/v1/companies/:id)...');
    const getByIdRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies/${createdCompany.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getByIdRes.statusCode, 200, 'Get company by ID should return 200 OK');
    assert.strictEqual(getByIdRes.body.data.id, createdCompany.id);
    console.log('[PASS] Company details retrieved by ID.');

    // 8. Update Company Profile
    console.log('[TEST] 8. Updating Company Profile (PUT /api/v1/companies/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/companies/${createdCompany.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Updated Royal Diamond Jewels ${ts}`,
        phone: '+919988776655',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update company should return 200 OK');
    assert.strictEqual(updateRes.body.data.name, `Updated Royal Diamond Jewels ${ts}`);
    console.log('[PASS] Company profile updated successfully.');

    // 9. Delete Company Profile
    console.log('[TEST] 9. Deleting Company Profile (DELETE /api/v1/companies/:id)...');
    const deleteRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies/${createdCompany.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(deleteRes.statusCode, 200, 'Delete company should return 200 OK');
    console.log('[PASS] Company profile deleted successfully.');

    // 10. Verify Non-Existent Company (404 Not Found)
    console.log('[TEST] 10. Verifying Non-Existent Company (404 Not Found)...');
    const notFoundRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies/${createdCompany.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(notFoundRes.statusCode, 404, 'Non-existent company must return 404 Not Found');
    console.log('[PASS] 404 Not Found verified.');

    console.log('\n[SUCCESS] Step 1 — Company Search, Filter, Sort & Pagination Test Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runCompanyApiTests().catch((err) => {
  console.error('[ERROR] Company API integration test failed:', err);
  process.exit(1);
});
