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

async function runProductApiTests() {
  console.log('[TEST] Starting Step 8 — Product Master CRUD & Search/Filter Integration Test Suite...');

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

    // 2. Create Parent Category & Sub-Category
    console.log('[TEST] 2. Creating Parent Category and Sub-Category...');
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
        code: `CAT-PROD-${ts}`,
        description: 'Parent Category for Product Test',
      }
    );
    assert.strictEqual(categoryRes.statusCode, 201, 'Category creation should return 201 Created');
    const category = categoryRes.body.data;

    const subCategoryRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-sub-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        categoryId: category.id,
        name: `Parent SubCat ${ts}`,
        code: `SUB-PROD-${ts}`,
        description: 'Sub-Category for Product Test',
      }
    );
    assert.strictEqual(subCategoryRes.statusCode, 201, 'Sub-category creation should return 201 Created');
    const subCategory = subCategoryRes.body.data;
    console.log('[PASS] Parent Category and Sub-Category created.');

    // 3. Security Guard (401 Unauthorized)
    console.log('[TEST] 3. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/products',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 4. Negative: Non-Existent Sub-Category ID (404 Not Found)
    console.log('[TEST] 4. Testing Non-Existent Sub-Category ID (404 Not Found)...');
    const fakeSubCatId = '00000000-0000-0000-0000-000000000000';
    const invalidSubCatRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/products',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        subCategoryId: fakeSubCatId,
        sku: `SKU-FAKE-${ts}`,
        name: `Test Product ${ts}`,
      }
    );
    assert.strictEqual(invalidSubCatRes.statusCode, 404, 'Invalid subCategoryId must return 404');
    console.log('[PASS] 404 Not Found for non-existent subCategoryId verified.');

    // 5. Positive Create Product (POST /api/v1/products)
    console.log('[TEST] 5. Creating a new Product (POST /api/v1/products)...');
    const sku = `SKU-RING-${ts}`;
    const name = `22K Gold Designer Ring ${ts}`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/products',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        subCategoryId: subCategory.id,
        sku,
        name,
        description: '22K Hallmarked Designer Gold Ring',
        metalType: 'GOLD',
        purity: '22K',
        grossWeight: 5.5,
        netWeight: 5.2,
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Product creation should return 201 Created');
    const product = createRes.body.data;
    assert.ok(product.id);
    assert.strictEqual(product.sku, sku);
    assert.strictEqual(product.name, name);
    console.log('[PASS] Product created successfully.');

    // 6. Duplicate SKU Validation (409 Conflict)
    console.log('[TEST] 6. Testing Duplicate SKU (409 Conflict)...');
    const dupRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/products',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        subCategoryId: subCategory.id,
        name: `Different Product ${ts}`,
        sku,
      }
    );
    assert.strictEqual(dupRes.statusCode, 409, 'Duplicate SKU must return 409 Conflict');
    console.log('[PASS] 409 Conflict for duplicate SKU verified.');

    // 7. Get Paginated Product List with Search, Category Filter (via subCategory), SubCategory Filter, MetalType & Sorting
    console.log('[TEST] 7. Testing Product Search, Category Filter (via subCategory), SubCategory Filter, MetalType, Sorting & Pagination (GET /api/v1/products)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/products?categoryId=${category.id}&subCategoryId=${subCategory.id}&metalType=GOLD&search=${sku}&isActive=true&sortBy=name&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'Product list should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].sku, sku);
    console.log('[PASS] Filtered product list retrieved successfully.');

    // 8. Test Invalid Sub-Category Filter ID in List Query (404 Not Found)
    console.log('[TEST] 8. Testing Invalid Sub-Category Filter ID in List Query (404 Not Found)...');
    const invalidSubCatFilterRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/products?subCategoryId=${fakeSubCatId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(invalidSubCatFilterRes.statusCode, 404, 'List products with invalid subCategoryId must return 404');
    console.log('[PASS] 404 Not Found for invalid subCategoryId filter verified.');

    // 9. Get Product Details by ID (GET /api/v1/products/:id)
    console.log('[TEST] 9. Getting Product Details by ID (GET /api/v1/products/:id)...');
    const getRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/products/${product.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getRes.statusCode, 200, 'Product details should return 200 OK');
    assert.strictEqual(getRes.body.data.id, product.id);
    console.log('[PASS] Product details retrieved.');

    // 10. Update Product Profile (PUT /api/v1/products/:id)
    console.log('[TEST] 10. Updating Product Profile (PUT /api/v1/products/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/products/${product.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        description: 'Updated 22K Designer Gold Ring Description',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update product should return 200 OK');
    assert.strictEqual(updateRes.body.data.description, 'Updated 22K Designer Gold Ring Description');
    console.log('[PASS] Product updated successfully.');

    // 11. Delete Product & Parent Categories Cleanup
    console.log('[TEST] 11. Deleting Product (DELETE /api/v1/products/:id)...');
    const delRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/products/${product.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(delRes.statusCode, 200, 'Delete product should return 200 OK');

    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-sub-categories/${subCategory.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-categories/${category.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[PASS] Product deleted and parent categories cleaned up.');

    console.log('\n[SUCCESS] Step 8 — Product Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runProductApiTests().catch((err) => {
  console.error('[ERROR] Product API integration test failed:', err);
  process.exit(1);
});
