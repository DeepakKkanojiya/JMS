import assert from 'assert';
import http from 'http';
import app from '../src/app';

function makeRequest(
  options: http.RequestOptions
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsedBody = data;
        try {
          parsedBody = JSON.parse(data);
        } catch {
          // Keep raw string if not JSON
        }
        resolve({
          statusCode: res.statusCode || 500,
          headers: res.headers,
          body: parsedBody,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function runSwaggerTests() {
  console.log('[TEST] Starting Sprint 0.9 OpenAPI / Swagger Test Suite...');

  const server = app.listen(5095);
  const host = 'localhost';
  const port = 5095;

  try {
    // 1. Test Swagger UI HTML Endpoint (/docs)
    console.log('[TEST] 1. Accessing Swagger UI HTML page (/docs)...');
    const docsRes = await makeRequest({
      hostname: host,
      port,
      path: '/docs/',
      method: 'GET',
    });
    assert.strictEqual(docsRes.statusCode, 200);
    assert.ok(typeof docsRes.body === 'string' && docsRes.body.includes('swagger-ui'));
    console.log('[PASS] Swagger UI HTML page rendered successfully on /docs/.');

    // 2. Test Swagger UI HTML Alternative Endpoint (/api-docs)
    console.log('[TEST] 2. Accessing Swagger UI HTML page (/api-docs)...');
    const apiDocsRes = await makeRequest({
      hostname: host,
      port,
      path: '/api-docs/',
      method: 'GET',
    });
    assert.strictEqual(apiDocsRes.statusCode, 200);
    assert.ok(typeof apiDocsRes.body === 'string' && apiDocsRes.body.includes('swagger-ui'));
    console.log('[PASS] Swagger UI HTML page rendered successfully on /api-docs/.');

    // 3. Test OpenAPI JSON Specification Endpoint (/docs/json)
    console.log('[TEST] 3. Accessing OpenAPI JSON specification (/docs/json)...');
    const specRes = await makeRequest({
      hostname: host,
      port,
      path: '/docs/json',
      method: 'GET',
    });
    assert.strictEqual(specRes.statusCode, 200);
    const spec = specRes.body;
    assert.strictEqual(spec.openapi, '3.0.0');
    assert.strictEqual(spec.info.title, 'Jewellery ERP API');
    assert.strictEqual(spec.info.version, '1.0.0');
    console.log('[PASS] OpenAPI 3.0 specification JSON served with correct info title and version.');

    // 4. Verify Bearer JWT Security Scheme
    console.log('[TEST] 4. Verifying bearerAuth security scheme definition...');
    assert.ok(spec.components?.securitySchemes?.bearerAuth);
    assert.strictEqual(spec.components.securitySchemes.bearerAuth.type, 'http');
    assert.strictEqual(spec.components.securitySchemes.bearerAuth.scheme, 'bearer');
    assert.strictEqual(spec.components.securitySchemes.bearerAuth.bearerFormat, 'JWT');
    console.log('[PASS] bearerAuth JWT security scheme configured properly.');

    // 5. Verify Documented API Paths
    console.log('[TEST] 5. Verifying documented API routes...');
    const paths = spec.paths;
    assert.ok(paths['/auth/login'], 'POST /auth/login should be documented');
    assert.ok(paths['/auth/refresh'], 'POST /auth/refresh should be documented');
    assert.ok(paths['/auth/logout'], 'POST /auth/logout should be documented');
    assert.ok(paths['/auth/me'], 'GET /auth/me should be documented');
    assert.ok(paths['/users'], 'GET & POST /users should be documented');
    assert.ok(paths['/users/{id}'], 'GET /users/{id} should be documented');
    assert.ok(paths['/customers'], 'GET /customers should be documented');
    assert.ok(paths['/customer/upload'], 'POST /customer/upload should be documented');
    assert.ok(paths['/inventory'], 'GET /inventory should be documented');
    assert.ok(paths['/health'], 'GET /health should be documented');
    console.log('[PASS] All active endpoints documented in OpenAPI spec.');

    // 6. Verify Error Response Component Schemas
    console.log('[TEST] 6. Verifying error response component schemas (400, 401, 403, 404, 409, 500)...');
    const schemas = spec.components?.schemas;
    assert.ok(schemas.StandardErrorPayload, 'StandardErrorPayload (400) schema should exist');
    assert.ok(schemas.UnauthorizedErrorPayload, 'UnauthorizedErrorPayload (401) schema should exist');
    assert.ok(schemas.ForbiddenErrorPayload, 'ForbiddenErrorPayload (403) schema should exist');
    assert.ok(schemas.NotFoundErrorPayload, 'NotFoundErrorPayload (404) schema should exist');
    assert.ok(schemas.ConflictErrorPayload, 'ConflictErrorPayload (409) schema should exist');
    assert.ok(schemas.InternalErrorPayload, 'InternalErrorPayload (500) schema should exist');
    console.log('[PASS] Reusable error response schemas configured successfully.');

    console.log('[SUCCESS] All OpenAPI / Swagger documentation tests passed with 100% success!');
  } finally {
    server.close();
  }
}

runSwaggerTests().catch((err) => {
  console.error('[ERROR] OpenAPI / Swagger test suite failed:', err);
  process.exit(1);
});
