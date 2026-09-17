import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { connectDB, disconnectDB, prisma } from '../src/database';

function makeMultipartRequest(
  options: http.RequestOptions,
  fields: Record<string, string>,
  fileField?: { name: string; filename: string; mimeType: string; content: Buffer }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const reqHeaders: Record<string, string> = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    };

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        if (value !== undefined) {
          reqHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      }
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
          // Keep raw string
        }
        resolve({
          statusCode: res.statusCode || 500,
          headers: res.headers,
          body: parsedBody,
        });
      });
    });

    req.on('error', (err) => reject(err));

    for (const [key, val] of Object.entries(fields)) {
      req.write(`--${boundary}\r\n`);
      req.write(`Content-Disposition: form-data; name="${key}"\r\n\r\n`);
      req.write(`${val}\r\n`);
    }

    if (fileField) {
      req.write(`--${boundary}\r\n`);
      req.write(`Content-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\n`);
      req.write(`Content-Type: ${fileField.mimeType}\r\n\r\n`);
      req.write(fileField.content);
      req.write('\r\n');
    }

    req.write(`--${boundary}--\r\n`);
    req.end();
  });
}

function makeJsonRequest(
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
          // Keep raw string
        }
        resolve({
          statusCode: res.statusCode || 500,
          headers: res.headers,
          body: parsedBody,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runInventoryItemImageTests() {
  console.log('[TEST] Starting Inventory Item Image Management Test Suite...');

  await connectDB();

  const server = app.listen(5093);
  const host = 'localhost';
  const port = 5093;

  let ownerToken = '';
  let inventoryItemId = '';
  let createdImageId = '';
  let imagePath = '';

  try {
    // 1. Authenticate as Owner
    console.log('[TEST] 1. Login as Owner...');
    const ownerLogin = await makeJsonRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(ownerLogin.statusCode, 200);
    ownerToken = ownerLogin.body.data.accessToken;

    // 2. Fetch sample InventoryItem
    const item = await prisma.inventoryItem.findFirst();
    assert.ok(item, 'Sample inventory item must exist in database');
    inventoryItemId = item.id;

    // 3. Upload Physical Item Photograph (WEBP)
    console.log('[TEST] 2. Upload Valid Physical Item Photograph (WEBP)...');
    const dummyWebp = Buffer.from('RIFF\x20\x00\x00\x00WEBPVP8 \x14\x00\x00\x00\x30\x01\x00\x9d\x01\x2a\x01\x00\x01\x00\x02\x00\x34\x25\xa4\x00');
    const uploadRes = await makeMultipartRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/inventory-items/${inventoryItemId}/images`,
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      { altText: 'Physical Item Photograph #001', sortOrder: '1' },
      { name: 'image', filename: 'item_photo.webp', mimeType: 'image/webp', content: dummyWebp }
    );
    assert.strictEqual(uploadRes.statusCode, 201);
    assert.strictEqual(uploadRes.body.success, true);
    assert.ok(uploadRes.body.data.id);
    assert.strictEqual(uploadRes.body.data.isPrimary, true);
    createdImageId = uploadRes.body.data.id;
    imagePath = path.resolve(process.cwd(), 'uploads', path.basename(uploadRes.body.data.imageUrl));
    console.log('[PASS] Inventory item photograph uploaded successfully.');

    // Verify Inventory Item attributes were NOT modified (Safety Requirement)
    const itemAfter = await prisma.inventoryItem.findUnique({ where: { id: inventoryItemId } });
    assert.strictEqual(itemAfter?.status, item.status);
    assert.strictEqual(Number(itemAfter?.grossWeight), Number(item.grossWeight));
    console.log('[PASS] Inventory item physical attributes untouched (Inventory Safety Enforced).');

    // 4. Get Inventory Item Images List
    console.log('[TEST] 3. Get Inventory Item Images List...');
    const listRes = await makeJsonRequest({
      hostname: host,
      port,
      path: `/api/v1/inventory-items/${inventoryItemId}/images`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(listRes.statusCode, 200);
    assert.ok(listRes.body.data.length >= 1);
    console.log('[PASS] Inventory item images list retrieved successfully.');

    // 5. Update Inventory Item Image Metadata
    console.log('[TEST] 4. Update Inventory Item Image Metadata...');
    const updateRes = await makeJsonRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/inventory-items/${inventoryItemId}/images/${createdImageId}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      { altText: 'High Resolution Physical Photo', sortOrder: 5 }
    );
    assert.strictEqual(updateRes.statusCode, 200);
    assert.strictEqual(updateRes.body.data.altText, 'High Resolution Physical Photo');
    assert.strictEqual(updateRes.body.data.sortOrder, 5);
    console.log('[PASS] Inventory item image metadata updated.');

    // 6. Delete Inventory Item Image
    console.log('[TEST] 5. Delete Inventory Item Image & Verify Cleanup...');
    const deleteRes = await makeJsonRequest({
      hostname: host,
      port,
      path: `/api/v1/inventory-items/${inventoryItemId}/images/${createdImageId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(deleteRes.statusCode, 200);
    assert.strictEqual(fs.existsSync(imagePath), false);
    console.log('[PASS] Inventory item image deleted and file cleaned up.');

    console.log('[SUCCESS] All Inventory Item Image tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runInventoryItemImageTests().catch((err) => {
  console.error('[ERROR] Inventory Item Image test suite failed:', err);
  process.exit(1);
});
