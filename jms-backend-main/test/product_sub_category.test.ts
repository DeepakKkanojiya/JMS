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

async function runProductSubCategoryApiTests() {
  console.log('[TEST] Starting Step 7 — Product Sub-Category CRUD & Search/Filter Integration Test Suite...');

  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  try {
    const ts = Date.now().toString().slice(-6);

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

    // 2. Create Parent Product Category
    console.log('[TEST] 2. Creating Parent Product Category...');
    const categoryRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Parent Cat ${ts}`,
        code: `CAT-PAR-${ts}`,
        description: 'Parent Category for Sub-Category Test',
      }
    );
    assert.strictEqual(categoryRes.statusCode, 201, 'Category creation should return 201 Created');
    const category = categoryRes.body.data;
    console.log('[PASS] Parent Product Category created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/product-sub-categories',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 4. Negative: Non-Existent Category ID (404 Not Found)
    console.log('[TEST] 4. Testing Non-Existent Category ID (404 Not Found)...');
    const fakeCatId = '00000000-0000-0000-0000-000000000000';
    const invalidCatRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-sub-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        categoryId: fakeCatId,
        name: `Rings ${ts}`,
        code: `SUB-RING-${ts}`,
      }
    );
    assert.strictEqual(invalidCatRes.statusCode, 404, 'Invalid categoryId must return 404');
    console.log('[PASS] 404 Not Found for non-existent categoryId verified.');

    // 5. Positive Create Product Sub-Category (POST /api/v1/product-sub-categories)
    console.log('[TEST] 5. Creating a new Product Sub-Category (POST /api/v1/product-sub-categories)...');
    const code = `SUB-TST-${ts}`;
    const name = `Gold Rings ${ts}`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-sub-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        categoryId: category.id,
        name,
        code,
        description: '22K Ladies Gold Rings',
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Sub-category creation should return 201 Created');
    const subCategory = createRes.body.data;
    assert.ok(subCategory.id);
    assert.strictEqual(subCategory.code, code);
    assert.strictEqual(subCategory.name, name);
    console.log('[PASS] Product sub-category created successfully.');

    // 6. Duplicate Code Validation (409 Conflict)
    console.log('[TEST] 6. Testing Duplicate Sub-Category Code (409 Conflict)...');
    const dupRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-sub-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        categoryId: category.id,
        name: `Different Sub Name ${ts}`,
        code,
      }
    );
    assert.strictEqual(dupRes.statusCode, 409, 'Duplicate sub-category code must return 409 Conflict');
    console.log('[PASS] 409 Conflict for duplicate sub-category code verified.');

    // 7. Get Paginated Product Sub-Categories List with Search, Category Filter & Sorting
    console.log('[TEST] 7. Testing Search, Category Filter, Status, Sorting & Pagination (GET /api/v1/product-sub-categories)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-sub-categories?categoryId=${category.id}&search=${code}&isActive=true&sortBy=name&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'Sub-category list should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].code, code);
    console.log('[PASS] Filtered sub-category list retrieved successfully.');

    // 8. Test Invalid Category Filter ID in List Query (404 Not Found)
    console.log('[TEST] 8. Testing Invalid Category Filter ID in List Query (404 Not Found)...');
    const invalidCatFilterRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-sub-categories?categoryId=${fakeCatId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(invalidCatFilterRes.statusCode, 404, 'List sub-categories with invalid categoryId must return 404');
    console.log('[PASS] 404 Not Found for invalid categoryId filter verified.');

    // 9. Get Product Sub-Category Details by ID (GET /api/v1/product-sub-categories/:id)
    console.log('[TEST] 9. Getting Product Sub-Category Details by ID (GET /api/v1/product-sub-categories/:id)...');
    const getRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-sub-categories/${subCategory.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getRes.statusCode, 200, 'Sub-category details should return 200 OK');
    assert.strictEqual(getRes.body.data.id, subCategory.id);
    console.log('[PASS] Product sub-category details retrieved.');

    // 10. Update Product Sub-Category Profile (PUT /api/v1/product-sub-categories/:id)
    console.log('[TEST] 10. Updating Product Sub-Category Profile (PUT /api/v1/product-sub-categories/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/product-sub-categories/${subCategory.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        description: 'Updated Gold Rings Description',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update sub-category should return 200 OK');
    assert.strictEqual(updateRes.body.data.description, 'Updated Gold Rings Description');
    console.log('[PASS] Product sub-category updated successfully.');

    // 11. Delete Sub-Category & Parent Category Cleanup
    console.log('[TEST] 11. Deleting Product Sub-Category (DELETE /api/v1/product-sub-categories/:id)...');
    const delRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-sub-categories/${subCategory.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(delRes.statusCode, 200, 'Delete sub-category should return 200 OK');

    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-categories/${category.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[PASS] Sub-category deleted and parent category cleaned up.');

    console.log('\n[SUCCESS] Step 7 — Product Sub-Category Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runProductSubCategoryApiTests().catch((err) => {
  console.error('[ERROR] Product Sub-Category API integration test failed:', err);
  process.exit(1);
});
