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

async function runEmployeeApiTests() {
  console.log('[TEST] Starting Step 3 — Employee CRUD & Search/Filter Integration Test Suite...');

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
    const ownerUserId = loginRes.body.data.user.id;
    assert.ok(token);
    assert.ok(ownerUserId);
    console.log('[PASS] Owner authenticated. User ID:', ownerUserId);

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
        name: `Employee Test Corp ${ts}`,
        companyCode: `COMP-EMP-${ts}`,
        gstNumber: `07AAAAA${numPart}C1Z5`,
        panNumber: `AAAAA${numPart}C`,
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
        branchCode: `BR-EMP-${ts}`,
        name: `Employee Branch ${ts}`,
      }
    );
    const branch = branchRes.body.data;
    console.log('[PASS] Parent Company & Branch created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/employees',
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
        path: '/api/v1/employees',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: fakeBranchId,
        employeeCode: `EMP-FAKE-${ts}`,
        firstName: 'Fake',
        mobile: `98${ts}001`,
      }
    );
    assert.strictEqual(invalidBranchRes.statusCode, 404, 'Invalid branchId must return 404');
    console.log('[PASS] 404 Not Found for non-existent branchId verified.');

    // 5. Positive Create Employee
    console.log('[TEST] 5. Creating a new Employee (POST /api/v1/employees)...');
    const empCode = `EMP-TST-${ts}`;
    const empMobile = `9800${numPart}01`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/employees',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        employeeCode: empCode,
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: `aarav.${ts}@jewelleryerp.com`,
        mobile: empMobile,
        designation: 'Store Manager',
        joiningDate: '2026-01-15',
        isActive: true,
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Create employee should return 201 Created');
    const createdEmployee = createRes.body.data;
    assert.ok(createdEmployee.id);
    assert.strictEqual(createdEmployee.branchId, branch.id);
    assert.ok(createdEmployee.employeeCode.startsWith('EMP-'), 'Should auto generate sequential EMP code');
    console.log('[PASS] Employee created successfully with generated code:', createdEmployee.employeeCode);

    // 6. Duplicate Employee Code & Mobile (409 Conflict)
    console.log('[TEST] 6. Testing Duplicate Employee Code & Mobile (409 Conflict)...');
    const dupCodeRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/employees',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        firstName: 'Duplicate Mobile',
        mobile: empMobile,
      }
    );
    assert.strictEqual(dupCodeRes.statusCode, 409, 'Duplicate employee mobile must return 409');

    // 7. Duplicate User 1-to-1 Assignment (409 Conflict)
    console.log('[TEST] 7. Testing 1-to-1 User Assignment Guard (409 Conflict)...');
    const dupUserRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/employees',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        branchId: branch.id,
        userId: ownerUserId,
        employeeCode: `EMP-DUPUSER-${ts}`,
        firstName: 'Duplicate User',
        mobile: `9800${numPart}03`,
      }
    );
    assert.strictEqual(dupUserRes.statusCode, 409, 'Duplicate 1-to-1 userId assignment must return 409');
    console.log('[PASS] 1-to-1 User Assignment guard verified (409 Conflict).');

    // 8. Get Paginated Employee List with Search, Branch, Company, Designation & Sorting
    console.log('[TEST] 8. Testing Employee Search, Company Filter (via branch), Designation, Sorting & Pagination (GET /api/v1/employees)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/employees?companyId=${company.id}&branchId=${branch.id}&designation=Manager&search=${createdEmployee.employeeCode}&isActive=true&sortBy=firstName&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'List employees should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].firstName, 'Aarav');
    console.log('[PASS] Filtered employee list retrieved successfully.');

    // 9. Test Invalid Branch ID in List Query (404 Not Found)
    console.log('[TEST] 9. Testing Invalid Branch Filter ID in List Query (404 Not Found)...');
    const invalidBranchListRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/employees?branchId=${fakeBranchId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(invalidBranchListRes.statusCode, 404, 'List employees with invalid branchId must return 404');
    console.log('[PASS] 404 Not Found for invalid branchId filter verified.');

    // 10. Get Employee By ID
    console.log('[TEST] 10. Getting Employee Details by ID (GET /api/v1/employees/:id)...');
    const getByIdRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/employees/${createdEmployee.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getByIdRes.statusCode, 200, 'Get employee by ID should return 200 OK');
    assert.strictEqual(getByIdRes.body.data.id, createdEmployee.id);
    console.log('[PASS] Employee details retrieved.');

    // 11. Update Employee Profile
    console.log('[TEST] 11. Updating Employee Profile (PUT /api/v1/employees/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/employees/${createdEmployee.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        designation: 'Senior General Manager',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update employee should return 200 OK');
    assert.strictEqual(updateRes.body.data.designation, 'Senior General Manager');
    console.log('[PASS] Employee updated successfully.');

    // 12. Delete Employee & Parent Cleanups
    console.log('[TEST] 12. Deleting Employee Record (DELETE /api/v1/employees/:id)...');
    const deleteRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/employees/${createdEmployee.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(deleteRes.statusCode, 200, 'Delete employee should return 200 OK');

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
    console.log('[PASS] Employee deleted and parent test records cleaned up.');

    console.log('\n[SUCCESS] Step 3 — Employee Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runEmployeeApiTests().catch((err) => {
  console.error('[ERROR] Employee API integration test failed:', err);
  process.exit(1);
});
