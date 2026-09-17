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

async function runProductImageTests() {
  console.log('[TEST] Starting Product Image Management Test Suite...');

  await connectDB();

  const server = app.listen(5092);
  const host = 'localhost';
  const port = 5092;

  let ownerToken = '';
  let productId = '';
  let createdImage1Id = '';
  let createdImage2Id = '';
  let image1Path = '';

  try {
    // 1. Authenticate as Owner
    console.log('[TEST] 1. Login as Owner...');
    const ownerLogin = await makeJsonRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'owner@jewelleryerp.com', password: 'Admin@123' }
    );
    assert.strictEqual(ownerLogin.statusCode, 200);
    ownerToken = ownerLogin.body.data.accessToken;

    // 2. Fetch sample Product
    const product = await prisma.product.findFirst();
    assert.ok(product, 'Sample product must exist in database');
    productId = product.id;

    // 3. Test missing authentication (401)
    console.log('[TEST] 2. Missing Authentication Check (expect 401)...');
    const noAuthRes = await makeMultipartRequest(
      { hostname: host, port, path: `/api/v1/products/${productId}/images`, method: 'POST' },
      {},
      { name: 'image', filename: 'test.jpg', mimeType: 'image/jpeg', content: Buffer.from('fake-image-data') }
    );
    assert.strictEqual(noAuthRes.statusCode, 401);
    console.log('[PASS] Missing token rejected with 401 Unauthorized.');

    // 4. Upload 1st Product Image (JPEG)
    console.log('[TEST] 3. Upload Valid Product Image (JPEG)...');
    const dummyJpeg = Buffer.from('\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00');
    const upload1Res = await makeMultipartRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/products/${productId}/images`,
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      { altText: 'Front View Gold Necklace', sortOrder: '1' },
      { name: 'image', filename: 'necklace.jpg', mimeType: 'image/jpeg', content: dummyJpeg }
    );
    assert.strictEqual(upload1Res.statusCode, 201);
    assert.strictEqual(upload1Res.body.success, true);
    assert.ok(upload1Res.body.data.id);
    assert.strictEqual(upload1Res.body.data.isPrimary, true); // First image automatically primary
    createdImage1Id = upload1Res.body.data.id;
    image1Path = path.resolve(process.cwd(), 'uploads', path.basename(upload1Res.body.data.imageUrl));
    console.log('[PASS] Product image 1 uploaded successfully.');

    // 5. Upload 2nd Product Image (PNG, set primary)
    console.log('[TEST] 4. Upload 2nd Product Image (PNG, isPrimary=true)...');
    const dummyPng = Buffer.from('\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89');
    const upload2Res = await makeMultipartRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/products/${productId}/images`,
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      { altText: 'Back View Gold Necklace', isPrimary: 'true', sortOrder: '2' },
      { name: 'image', filename: 'necklace_back.png', mimeType: 'image/png', content: dummyPng }
    );
    assert.strictEqual(upload2Res.statusCode, 201);
    assert.strictEqual(upload2Res.body.data.isPrimary, true);
    createdImage2Id = upload2Res.body.data.id;
    console.log('[PASS] Product image 2 uploaded and set as primary.');

    // Verify 1st image was unset from primary
    const img1After = await prisma.productImage.findUnique({ where: { id: createdImage1Id } });
    assert.strictEqual(img1After?.isPrimary, false);
    console.log('[PASS] Previous primary image automatically unset.');

    // 6. Test Unsupported MIME Type Rejection
    console.log('[TEST] 5. Unsupported MIME Type Rejection (expect 400)...');
    const badMimeRes = await makeMultipartRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/products/${productId}/images`,
        method: 'POST',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      {},
      { name: 'image', filename: 'document.pdf', mimeType: 'application/pdf', content: Buffer.from('pdf-content') }
    );
    assert.strictEqual(badMimeRes.statusCode, 400);
    console.log('[PASS] Unsupported MIME type rejected with 400.');

    // 7. Get Images List
    console.log('[TEST] 6. Get Product Images List...');
    const listRes = await makeJsonRequest({
      hostname: host,
      port,
      path: `/api/v1/products/${productId}/images`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(listRes.statusCode, 200);
    assert.ok(listRes.body.data.length >= 2);
    assert.strictEqual(listRes.body.data[0].id, createdImage2Id); // Primary image first
    console.log('[PASS] Product images list retrieved and correctly ordered.');

    // 8. Update Image Metadata
    console.log('[TEST] 7. Update Image Metadata (PUT /api/v1/products/:id/images/:imageId)...');
    const updateRes = await makeJsonRequest(
      {
        hostname: host,
        port,
        path: `/api/v1/products/${productId}/images/${createdImage1Id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${ownerToken}` },
      },
      { altText: 'Updated Front View', isPrimary: true }
    );
    assert.strictEqual(updateRes.statusCode, 200);
    assert.strictEqual(updateRes.body.data.isPrimary, true);
    assert.strictEqual(updateRes.body.data.altText, 'Updated Front View');
    console.log('[PASS] Product image metadata updated.');

    // 9. Delete Primary Image and verify automatic promotion
    console.log('[TEST] 8. Delete Image & Verify Storage Cleanup & Primary Promotion...');
    const deleteRes = await makeJsonRequest({
      hostname: host,
      port,
      path: `/api/v1/products/${productId}/images/${createdImage1Id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert.strictEqual(deleteRes.statusCode, 200);
    assert.strictEqual(fs.existsSync(image1Path), false); // Physical file cleaned up
    console.log('[PASS] Image deleted and physical storage cleaned up.');

    // Verify Image 2 promoted to primary
    const img2After = await prisma.productImage.findUnique({ where: { id: createdImage2Id } });
    assert.strictEqual(img2After?.isPrimary, true);
    console.log('[PASS] Remaining image automatically promoted to primary.');

    console.log('[SUCCESS] All Product Image tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runProductImageTests().catch((err) => {
  console.error('[ERROR] Product Image test suite failed:', err);
  process.exit(1);
});
