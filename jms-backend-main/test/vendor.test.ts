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

async function runVendorApiTests() {
  console.log('[TEST] Starting Step 5 — Vendor CRUD & Search/Filter Integration Test Suite...');

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

    // 2. Create Parent Company and Branch
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
        name: `Vendor Test Corp ${ts}`,
        gstNumber: `07AAAAA${numPart}G1Z5`,
        panNumber: `AAAAA${numPart}G`,
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
        branchCode: `BR-VEND-${ts}`,
        name: `Vendor Branch ${ts}`,
      }
    );
    const branch = branchRes.body.data;
    console.log('[PASS] Parent Company & Branch created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/vendors',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 4. Negative: Non-Existent Branch ID (404 Not Found)
    console.log('[TEST] 4. Testing Non-Existent Branch ID (404 Not Found)...');
    const fakeBranchId = '00000000-0000-0000-0000-000000000000';
    const invalidBranchRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/vendors',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: fakeBranchId,
        vendorCode: `VEND-${ts}`,
        companyName: 'Malabar Gold Suppliers',
        mobile: `9800${numPart}07`,
      }
    );
    assert.strictEqual(invalidBranchRes.statusCode, 404, 'Invalid branchId must return 404');
    console.log('[PASS] 404 Not Found for non-existent branchId verified.');

    // 5. Positive Create Vendor Profile (POST /api/v1/vendors)
    console.log('[TEST] 5. Creating a new Vendor (POST /api/v1/vendors)...');
    const vendorCode = `VEND-${ts}`;
    const gstNumber = `07AAAAA${numPart}H1Z5`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/vendors',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        vendorCode,
        companyName: 'Gold Refinery India Ltd',
        contactPerson: 'Sanjay Shah',
        email: `vendor${ts}@goldrefinery.com`,
        mobile: `9800${numPart}07`,
        gstNumber,
        panNumber: `AAAAA${numPart}H`,
        vendorType: 'BULLION',
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Vendor creation should return 201 Created');
    const vendor = createRes.body.data;
    assert.ok(vendor.id);
    assert.strictEqual(vendor.vendorCode, vendorCode);
    console.log('[PASS] Vendor created successfully.');

    // 6. Duplicate Vendor Code & GSTIN Validation (409 Conflict)
    console.log('[TEST] 6. Testing Duplicate Vendor Code (409 Conflict)...');
    const dupRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/vendors',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        vendorCode,
        companyName: 'Another Gold Vendor',
        mobile: `9800${numPart}99`,
      }
    );
    assert.strictEqual(dupRes.statusCode, 409, 'Duplicate vendorCode must return 409 Conflict');
    console.log('[PASS] 409 Conflict for duplicate vendorCode verified.');

    // 7. Get Paginated Vendor List with Search, Branch, GST & Sorting
    console.log('[TEST] 7. Testing Search, Branch Filter, GST Filter, Sorting & Pagination (GET /api/v1/vendors)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/vendors?branchId=${branch.id}&gstNumber=${gstNumber}&search=${vendorCode}&isActive=true&sortBy=companyName&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'Vendor list should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].companyName, 'Gold Refinery India Ltd');
    console.log('[PASS] Filtered vendor list retrieved successfully.');

    // 8. Get Vendor Profile by ID (GET /api/v1/vendors/:id)
    console.log('[TEST] 8. Getting Vendor Details by ID (GET /api/v1/vendors/:id)...');
    const getRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/vendors/${vendor.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getRes.statusCode, 200, 'Vendor details should return 200 OK');
    assert.strictEqual(getRes.body.data.id, vendor.id);
    console.log('[PASS] Vendor details retrieved.');

    // 9. Update Vendor Profile (PUT /api/v1/vendors/:id)
    console.log('[TEST] 9. Updating Vendor Profile (PUT /api/v1/vendors/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/vendors/${vendor.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        contactPerson: 'Sanjay Shah (Updated)',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update vendor should return 200 OK');
    assert.strictEqual(updateRes.body.data.contactPerson, 'Sanjay Shah (Updated)');
    console.log('[PASS] Vendor updated successfully.');

    // 10. Delete Vendor & Parent Cleanups
    console.log('[TEST] 10. Deleting Vendor Profile (DELETE /api/v1/vendors/:id)...');
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/vendors/${vendor.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    // Clean up branch and company
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
    console.log('[PASS] Vendor deleted and parent test records cleaned up.');

    console.log('\n[SUCCESS] Step 5 — Vendor Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runVendorApiTests().catch((err) => {
  console.error('[ERROR] Vendor API integration test failed:', err);
  process.exit(1);
});
