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

async function runCustomerAddressApiTests() {
  console.log('[TEST] Starting Step 5 — Customer Address CRUD API Integration Test Suite...');

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

    // 2. Create Parent Company, Branch, and Customer
    console.log('[TEST] 2. Creating Parent Company, Branch & Customer...');
    const companyRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/companies',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Address Test Corp ${ts}`,
        gstNumber: `07AAAAA${numPart}E1Z5`,
        panNumber: `AAAAA${numPart}E`,
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
        branchCode: `BR-ADDR-${ts}`,
        name: `Address Branch ${ts}`,
      }
    );
    const branch = branchRes.body.data;

    const customerRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/customers',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        customerCode: `CUST-ADDR-${ts}`,
        firstName: 'Suresh',
        lastName: 'Gupta',
        mobile: `9800${numPart}05`,
      }
    );
    const customer = customerRes.body.data;
    console.log('[PASS] Parent Company, Branch & Customer created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/addresses`,
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 4. Negative: Non-Existent Customer ID (404 Not Found)
    console.log('[TEST] 4. Testing Non-Existent Customer ID (404 Not Found)...');
    const fakeCustId = '00000000-0000-0000-0000-000000000000';
    const invalidCustRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${fakeCustId}/addresses`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        addressType: 'HOME',
        addressLine1: 'Fake Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      }
    );
    assert.strictEqual(invalidCustRes.statusCode, 404, 'Invalid customerId must return 404');
    console.log('[PASS] 404 Not Found for non-existent customerId verified.');

    // 5. Positive Create First Address (Default: true)
    console.log('[TEST] 5. Adding First Customer Address (Default: true)...');
    const addr1Res = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${customer.id}/addresses`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        addressType: 'HOME',
        addressLine1: '123 Park Street',
        addressLine2: 'Sector 5',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        isDefault: true,
      }
    );
    assert.strictEqual(addr1Res.statusCode, 201, 'Add address should return 201 Created');
    const addr1 = addr1Res.body.data;
    assert.ok(addr1.id);
    assert.strictEqual(addr1.isDefault, true);
    console.log('[PASS] First address created as default.');

    // 6. Positive Create Second Address (Default: true) & Verify First Unset
    console.log('[TEST] 6. Adding Second Customer Address (Default: true) and verifying Default Unsetting...');
    const addr2Res = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${customer.id}/addresses`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        addressType: 'WORK',
        addressLine1: '456 Business Tower',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        isDefault: true,
      }
    );
    assert.strictEqual(addr2Res.statusCode, 201, 'Add second address should return 201 Created');
    const addr2 = addr2Res.body.data;
    assert.strictEqual(addr2.isDefault, true);

    // Verify first address is no longer default
    const checkAddr1Res = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/addresses/${addr1.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(checkAddr1Res.body.data.isDefault, false, 'Previous default address must be unset to false');
    console.log('[PASS] Second address created and previous default address properly unset.');

    // 7. Get Customer Addresses List
    console.log('[TEST] 7. Getting Customer Addresses List (GET /api/v1/customers/:customerId/addresses)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/addresses`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'List addresses should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 2);
    console.log('[PASS] Addresses list retrieved.');

    // 8. Update Address Profile
    console.log('[TEST] 8. Updating Address Profile (PUT /api/v1/customers/:customerId/addresses/:addressId)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${customer.id}/addresses/${addr1.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        addressLine2: 'Near Central Park',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update address should return 200 OK');
    assert.strictEqual(updateRes.body.data.addressLine2, 'Near Central Park');
    console.log('[PASS] Address updated successfully.');

    // 9. Delete Addresses & Parent Cleanups
    console.log('[TEST] 9. Deleting Customer Addresses (DELETE /api/v1/customers/:customerId/addresses/:addressId)...');
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/addresses/${addr1.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/addresses/${addr2.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    // Clean up test customer, branch, and company
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
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
    console.log('[PASS] Addresses deleted and parent test records cleaned up.');

    console.log('\n[SUCCESS] Step 5 — Customer Address CRUD API Integration Test Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runCustomerAddressApiTests().catch((err) => {
  console.error('[ERROR] Customer Address API integration test failed:', err);
  process.exit(1);
});
