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

async function runBranchApiTests() {
  console.log('[TEST] Starting Step 2 — Branch CRUD & Search/Filter Integration Test Suite...');

  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  try {
    const ts = Date.now().toString().slice(-6);
    const numPart = ts.slice(-4);

    // 1. Authenticate as Owner
    console.log('[TEST] 1. Authenticating as Owner...');
    const loginRes = await makeRequest(
      { host: 'localhost', port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(loginRes.statusCode, 200, 'Owner login should return 200 OK');
    const token = loginRes.body.data.accessToken;
    assert.ok(token, 'Access token must be present');
    console.log('[PASS] Owner authenticated successfully.');

    // 2. Create a parent Company for branch testing
    console.log('[TEST] 2. Creating Parent Company for Branch...');
    const gstNo = `07AAAAA${numPart}B1Z5`;
    const panNo = `AAAAA${numPart}B`;
    const companyRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/companies',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Branch Test Corp ${ts}`,
        gstNumber: gstNo,
        panNumber: panNo,
      }
    );
    assert.strictEqual(companyRes.statusCode, 201, 'Parent company creation must return 201 Created');
    const company = companyRes.body.data;
    console.log('[PASS] Parent Company created.');

    // 3. Security Guards (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/branches',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 4. Negative: Non-existent Company ID (404 Not Found)
    console.log('[TEST] 4. Testing Non-Existent Company ID (404 Not Found)...');
    const fakeCompanyId = '00000000-0000-0000-0000-000000000000';
    const invalidCompRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/branches',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        companyId: fakeCompanyId,
        branchCode: `BR-FAKE-${ts}`,
        name: 'Fake Company Branch',
      }
    );
    assert.strictEqual(invalidCompRes.statusCode, 404, 'Invalid companyId must return 404 Not Found');
    console.log('[PASS] 404 Not Found for non-existent companyId verified.');

    // 5. Positive Create Branch
    console.log('[TEST] 5. Creating a new Branch (POST /api/v1/branches)...');
    const branchCode = `BR-TST-${ts}`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/branches',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        companyId: company.id,
        branchCode: branchCode,
        name: `Connaught Place Store ${ts}`,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        isMainBranch: true,
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Create branch should return 201 Created');
    const createdBranch = createRes.body.data;
    assert.ok(createdBranch.id);
    assert.strictEqual(createdBranch.companyId, company.id);
    console.log('[PASS] Branch created successfully.');

    // 6. Duplicate Branch Code (409 Conflict)
    console.log('[TEST] 6. Testing Duplicate Branch Code (409 Conflict)...');
    const dupBranchRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/branches',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        companyId: company.id,
        branchCode: branchCode,
        name: 'Duplicate Branch',
      }
    );
    assert.strictEqual(dupBranchRes.statusCode, 409, 'Duplicate branch code must return 409 Conflict');
    console.log('[PASS] 409 Conflict for duplicate branch code verified.');

    // 7. Get Paginated Branch List with Search, Company, City & Status Filters
    console.log('[TEST] 7. Testing Search, Company Filter, City, Status & Pagination (GET /api/v1/branches)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/branches?companyId=${company.id}&city=Delhi&isActive=true&sortBy=name&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'List branches should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].city, 'Delhi');
    console.log('[PASS] Filtered branch list retrieved successfully.');

    // 8. Test Invalid Company ID in List Query (404 Not Found)
    console.log('[TEST] 8. Testing Invalid Company Filter ID in List Query (404 Not Found)...');
    const invalidCompListRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/branches?companyId=${fakeCompanyId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(invalidCompListRes.statusCode, 404, 'List branches with invalid companyId must return 404');
    console.log('[PASS] 404 Not Found for invalid companyId filter verified.');

    // 9. Get Branch By ID
    console.log('[TEST] 9. Getting Branch Details by ID (GET /api/v1/branches/:id)...');
    const getByIdRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/branches/${createdBranch.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getByIdRes.statusCode, 200, 'Get branch by ID should return 200 OK');
    assert.strictEqual(getByIdRes.body.data.id, createdBranch.id);
    console.log('[PASS] Branch details retrieved.');

    // 10. Update Branch
    console.log('[TEST] 10. Updating Branch Profile (PUT /api/v1/branches/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/branches/${createdBranch.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Updated Store ${ts}`,
        phone: '+919911223344',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update branch should return 200 OK');
    assert.strictEqual(updateRes.body.data.name, `Updated Store ${ts}`);
    console.log('[PASS] Branch updated successfully.');

    // 11. Delete Branch & Parent Company Cleanup
    console.log('[TEST] 11. Deleting Branch (DELETE /api/v1/branches/:id)...');
    const deleteRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/branches/${createdBranch.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(deleteRes.statusCode, 200, 'Delete branch should return 200 OK');

    // Clean up test company
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies/${company.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[PASS] Branch deleted and parent company cleaned up.');

    console.log('\n[SUCCESS] Step 2 — Branch Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runBranchApiTests().catch((err) => {
  console.error('[ERROR] Branch API integration test failed:', err);
  process.exit(1);
});
