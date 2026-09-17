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

async function runCustomerDocumentApiTests() {
  console.log('[TEST] Starting Step 6 — Customer Document CRUD API Integration Test Suite...');

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
        name: `Doc Test Corp ${ts}`,
        gstNumber: `07AAAAA${numPart}F1Z5`,
        panNumber: `AAAAA${numPart}F`,
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
        branchCode: `BR-DOC-${ts}`,
        name: `Doc Branch ${ts}`,
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
        customerCode: `CUST-DOC-${ts}`,
        firstName: 'Vikas',
        lastName: 'Mehta',
        mobile: `9800${numPart}06`,
      }
    );
    const customer = customerRes.body.data;
    console.log('[PASS] Parent Company, Branch & Customer created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/documents`,
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
        path: `/api/v1/customers/${fakeCustId}/documents`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
      }
    );
    assert.strictEqual(invalidCustRes.statusCode, 404, 'Invalid customerId must return 404');
    console.log('[PASS] 404 Not Found for non-existent customerId verified.');

    // 5. Positive Create Customer Document (AADHAR)
    console.log('[TEST] 5. Adding First Customer KYC Document (AADHAR)...');
    const doc1Res = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${customer.id}/documents`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        documentType: 'AADHAR',
        documentNumber: '998877665544',
        fileUrl: 'https://storage.jewelleryerp.com/kyc/aadhar.pdf',
      }
    );
    assert.strictEqual(doc1Res.statusCode, 201, 'Add document should return 201 Created');
    const doc1 = doc1Res.body.data;
    assert.ok(doc1.id);
    assert.strictEqual(doc1.documentType, 'AADHAR');
    console.log('[PASS] AADHAR document created successfully.');

    // 6. Positive Create Second Document (PAN)
    console.log('[TEST] 6. Adding Second Customer KYC Document (PAN)...');
    const doc2Res = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${customer.id}/documents`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        documentType: 'PAN',
        documentNumber: 'ABCDE5678G',
      }
    );
    assert.strictEqual(doc2Res.statusCode, 201, 'Add second document should return 201 Created');
    const doc2 = doc2Res.body.data;
    assert.ok(doc2.id);
    assert.strictEqual(doc2.documentType, 'PAN');
    console.log('[PASS] PAN document created successfully.');

    // 7. Get Customer Documents List
    console.log('[TEST] 7. Getting Customer Documents List (GET /api/v1/customers/:customerId/documents)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/documents`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'List documents should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 2);
    console.log('[PASS] Documents list retrieved.');

    // 8. Update Document Profile
    console.log('[TEST] 8. Updating Document Profile (PUT /api/v1/customers/:customerId/documents/:documentId)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/customers/${customer.id}/documents/${doc1.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        documentNumber: '112233445566',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update document should return 200 OK');
    assert.strictEqual(updateRes.body.data.documentNumber, '112233445566');
    console.log('[PASS] Document updated successfully.');

    // 9. Delete Documents & Parent Cleanups
    console.log('[TEST] 9. Deleting Customer Documents (DELETE /api/v1/customers/:customerId/documents/:documentId)...');
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/documents/${doc1.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/customers/${customer.id}/documents/${doc2.id}`,
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
    console.log('[PASS] Documents deleted and parent test records cleaned up.');

    console.log('\n[SUCCESS] Step 6 — Customer Document CRUD API Integration Test Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runCustomerDocumentApiTests().catch((err) => {
  console.error('[ERROR] Customer Document API integration test failed:', err);
  process.exit(1);
});
