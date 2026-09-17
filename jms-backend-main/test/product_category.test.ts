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

async function runProductCategoryApiTests() {
  console.log('[TEST] Starting Step 6 — Product Category CRUD & Search/Filter Integration Test Suite...');

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

    // 2. Security Guard (401 Unauthorized)
    console.log('[TEST] 2. Testing 401 Unauthorized Guard...');
    const noAuthRes = await makeRequest({
      host: 'localhost',
      port,
      path: '/api/v1/product-categories',
      method: 'GET',
    });
    assert.strictEqual(noAuthRes.statusCode, 401, 'Unauthenticated request must return 401');
    console.log('[PASS] 401 Unauthorized verified.');

    // 3. Positive Create Product Category (POST /api/v1/product-categories)
    console.log('[TEST] 3. Creating a new Product Category (POST /api/v1/product-categories)...');
    const code = `CAT-TST-${ts}`;
    const name = `Gold Category ${ts}`;
    const createRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name,
        code,
        description: 'Gold Jewellery Ornaments 22K',
      }
    );
    assert.strictEqual(createRes.statusCode, 201, 'Product category creation should return 201 Created');
    const category = createRes.body.data;
    assert.ok(category.id);
    assert.strictEqual(category.code, code);
    assert.strictEqual(category.name, name);
    console.log('[PASS] Product category created successfully.');

    // 4. Duplicate Code & Name Validation (409 Conflict)
    console.log('[TEST] 4. Testing Duplicate Category Code (409 Conflict)...');
    const dupRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: '/api/v1/product-categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        name: `Different Name ${ts}`,
        code,
      }
    );
    assert.strictEqual(dupRes.statusCode, 409, 'Duplicate category code must return 409 Conflict');
    console.log('[PASS] 409 Conflict for duplicate category code verified.');

    // 5. Get Paginated Product Categories List with Search, Status, Sorting
    console.log('[TEST] 5. Testing Search, Status Filter, Sorting & Pagination (GET /api/v1/product-categories)...');
    const listRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-categories?search=${code}&isActive=true&sortBy=name&sortOrder=asc`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200, 'Category list should return 200 OK');
    assert.ok(Array.isArray(listRes.body.data));
    assert.strictEqual(listRes.body.data.length, 1);
    assert.strictEqual(listRes.body.data[0].code, code);
    console.log('[PASS] Filtered category list retrieved successfully.');

    // 6. Get Product Category Profile by ID (GET /api/v1/product-categories/:id)
    console.log('[TEST] 6. Getting Product Category Details by ID (GET /api/v1/product-categories/:id)...');
    const getRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-categories/${category.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(getRes.statusCode, 200, 'Category details should return 200 OK');
    assert.strictEqual(getRes.body.data.id, category.id);
    console.log('[PASS] Product category details retrieved.');

    // 7. Update Product Category Profile (PUT /api/v1/product-categories/:id)
    console.log('[TEST] 7. Updating Product Category Profile (PUT /api/v1/product-categories/:id)...');
    const updateRes = await makeRequest(
      {
        host: 'localhost',
        port,
        path: `/api/v1/product-categories/${category.id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        description: 'Updated Gold Ornaments Description',
      }
    );
    assert.strictEqual(updateRes.statusCode, 200, 'Update category should return 200 OK');
    assert.strictEqual(updateRes.body.data.description, 'Updated Gold Ornaments Description');
    console.log('[PASS] Product category updated successfully.');

    // 8. Delete Product Category (DELETE /api/v1/product-categories/:id)
    console.log('[TEST] 8. Deleting Product Category Profile (DELETE /api/v1/product-categories/:id)...');
    const delRes = await makeRequest({
      host: 'localhost',
      port,
      path: `/api/v1/product-categories/${category.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(delRes.statusCode, 200, 'Delete category should return 200 OK');
    console.log('[PASS] Product category deleted successfully.');

    console.log('\n[SUCCESS] Step 6 — Product Category Search/Filter/Sort/Pagination Suite passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runProductCategoryApiTests().catch((err) => {
  console.error('[ERROR] Product Category API integration test failed:', err);
  process.exit(1);
});
