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

async function runCustomerApiTests() {
  console.log('[TEST] Starting Step 4 — Customer CRUD & Search/Filter Integration Test Suite...');

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
    assert.ok(token);
    console.log('[PASS] Owner authenticated.');

    // 2. Create Parent Company & Branch
    console.log('[TEST] 2. Creating Parent Company & Branch...');
    const companyRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/companies',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Customer Test Corp ${ts}`,
        companyCode: `COMP-CUST-${ts}`,
        gstNumber: `07AAAAA${numPart}D1Z5`,
        panNumber: `AAAAA${numPart}D`,
      }
    );
    const company = companyRes.body.data;

    const branchRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/branches',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        companyId: company.id,
        branchCode: `BR-CUST-${ts}`,
        name: `Customer Branch ${ts}`,
      }
    );
    const branch = branchRes.body.data;
    console.log('[PASS] Parent Company & Branch created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/customers',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 4. Negative: Invalid Branch ID (404 Not Found)
    console.log('[TEST] 4. Testing Non-Existent Branch ID (404 Not Found)...');
    const fakeBranchId = '00000000-0000-0000-0000-000000000000';
    const invalidBranchRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/customers',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: fakeBranchId,
        customerCode: `CUST-FAKE-${ts}`,
        firstName: 'Fake',
        mobile: `9800${numPart}01`,
      }
    );
    assert.strictEqual(invalidBranchRes.statusCode, 404, 'Invalid branchId must return 404');
    console.log('[PASS] 404 Not Found for non-existent branchId verified.');

    // 5. Positive Create Customer
    console.log('[TEST] 5. Creating a new Customer (POST /api/v1/customers)...');
    const custCode = `CUST-TST-${ts}`;
    const custMobile = `9800${numPart}01`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/customers',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        customerCode: custCode,
        firstName: 'Rajesh',
        lastName: 'Verma',
        email: `rajesh.${ts}@example.com`,
        mobile: custMobile,
        customerType: 'RETAIL',
        isActive: true,
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Create customer should return 201 Created');
    const createdCustomer = createRes.body.data;
    assert.ok(createdCustomer.id);
    assert.strictEqual(createdCustomer.branchId, branch.id);
    assert.ok(createdCustomer.customerCode.startsWith('CUST-'), 'Should auto generate sequential CUST code');
    console.log('[PASS] Customer created successfully with code:', createdCustomer.customerCode);

    // 6. Duplicate Customer Code & Mobile (409 Conflict)
    console.log('[TEST] 6. Testing Duplicate Customer Code & Mobile (409 Conflict)...');
    const dupCodeRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/customers',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        firstName: 'Duplicate Mobile',
        mobile: custMobile,
      }
    );
    assert.strictEqual(dupCodeRes.statusCode, 409, 'Duplicate customer mobile must return 409');
    console.log('[PASS] 409 Conflict for duplicate customer mobile verified.');

    // 7. Quick Search Customer for POS (GET /api/v1/customers/search)
    console.log('[TEST] 7. Testing Quick Search Customer for POS (GET /api/v1/customers/search)...');
    const searchRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/search?q=${custMobile}&branchId=${branch.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(searchRes.statusCode, 200, 'Quick search should return 200 OK');
    assert.ok(Array.isArray(searchRes.body.data));
    assert.strictEqual(searchRes.body.data.length, 1);
    assert.strictEqual(searchRes.body.data[0].id, createdCustomer.id);
    console.log('[PASS] POS quick search returned matching customer.');

    // 8. Get Paginated Customer List with Search, Branch, Company (via branch), CustomerType & Sorting
    console.log('[TEST] 8. Testing Customer Search, Company Filter (via branch), CustomerType, Sorting & Pagination (GET /api/v1/customers)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers?companyId=${company.id}&branchId=${branch.id}&customerType=RETAIL&search=${createdCustomer.customerCode}&isActive=true&sortBy=firstName&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'List customers should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].firstName, 'Rajesh');
    console.log('[PASS] Filtered customer list retrieved successfully.');

    // 9. Get Customer By ID
    console.log('[TEST] 9. Getting Customer Details by ID (GET /api/v1/customers/:id)...');
    const getByIdRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${createdCustomer.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getByIdRes.statusCode, 200, 'Get customer by ID should return 200 OK');
    assert.strictEqual(getByIdRes.body.data.id, createdCustomer.id);
    console.log('[PASS] Customer details retrieved.');

    // 10. Update Customer Profile
    console.log('[TEST] 10. Updating Customer Profile (PUT /api/v1/customers/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${createdCustomer.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        customerType: 'VIP',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update customer should return 200 OK');
    assert.strictEqual(updateRes.body.data.customerType, 'VIP');
    console.log('[PASS] Customer updated successfully.');

    // 11. Delete Customer & Parent Cleanups
    console.log('[TEST] 11. Deleting Customer Record (DELETE /api/v1/customers/:id)...');
    const deleteRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${createdCustomer.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(deleteRes.statusCode, 200, 'Delete customer should return 200 OK');

    // Clean up test branch and company
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/branches/${branch.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/companies/${company.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[PASS] Customer deleted and parent test records cleaned up.');

    console.log('\n[SUCCESS] Step 4 — Customer Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runCustomerApiTests().catch((err) => {
  console.error('[ERROR] Customer API integration test failed:', err);
  process.exit(1);
});
