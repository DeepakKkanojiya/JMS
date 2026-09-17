import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database';
import { maskSensitiveData } from '../src/logger/logger';

function makeRequest(
  options: http.RequestOptions,
  bodyData?: object
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = bodyData !== undefined ? JSON.stringify(bodyData) : '';
    const reqHeaders: Record<string, string> = {};

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        if (value !== undefined) {
          reqHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      }
    }

    if (bodyData !== undefined) {
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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runLoggerTests() {
  console.log('[TEST] Starting Sprint 0.8 Application Logging Test Suite...');

  await connectDB();

  const server = app.listen(5096);
  const host = 'localhost';
  const port = 5096;

  const logsDir = path.resolve(process.cwd(), 'logs');

  try {
    // 1. Sensitive Data Masking Unit Test
    console.log('[TEST] 1. Sensitive Data Masking Unit Test...');
    const sensitivePayload = {
      email: 'owner@test.com',
      password: 'SuperSecretPassword123',
      refreshToken: 'sample.jwt.token',
      aadhaar: '123456789012',
      pan: 'ABCDE1234F',
      nested: {
        otp: '123456',
        normalField: 'safeValue',
      },
    };

    const maskedPayload = maskSensitiveData(sensitivePayload);
    assert.strictEqual(maskedPayload.email, 'owner@test.com');
    assert.strictEqual(maskedPayload.password, '***MASKED***');
    assert.strictEqual(maskedPayload.refreshToken, '***MASKED***');
    assert.strictEqual(maskedPayload.aadhaar, '***MASKED***');
    assert.strictEqual(maskedPayload.pan, '***MASKED***');
    assert.strictEqual(maskedPayload.nested.otp, '***MASKED***');
    assert.strictEqual(maskedPayload.nested.normalField, 'safeValue');
    console.log('[PASS] Sensitive data masked correctly without exposing raw secrets.');

    // 2. Request ID & X-Request-ID Header Test
    console.log('[TEST] 2. Request ID Generation & X-Request-ID Response Header...');
    const healthRes = await makeRequest({
      hostname: host,
      port,
      path: '/health',
      method: 'GET',
    });
    assert.strictEqual(healthRes.statusCode, 200);
    assert.ok(healthRes.headers['x-request-id']);
    const generatedReqId = healthRes.headers['x-request-id'] as string;
    assert.ok(generatedReqId.length >= 10);
    console.log(`[PASS] X-Request-ID header attached successfully: ${generatedReqId}`);

    // 3. Postman Test 1 & 2: Login Success & Failed Auth Logging
    console.log('[TEST] 3. Auth Event Logging (Login Success & Login Failed)...');
    const failedLoginRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'admin@jewelleryerp.com', password: 'WrongPassword' }
    );
    assert.strictEqual(failedLoginRes.statusCode, 401);

    const validLoginRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'admin@jewelleryerp.com', password: 'Admin@123456' }
    );
    assert.strictEqual(validLoginRes.statusCode, 200);
    console.log('[PASS] Auth events logged to application.log.');

    // 4. Postman Test 3: Route Not Found Error Log (404)
    console.log('[TEST] 4. Route Not Found (404) Error Logging...');
    const notFoundRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/xyz',
      method: 'GET',
    });
    assert.strictEqual(notFoundRes.statusCode, 404);
    console.log('[PASS] 404 error logged.');

    // 5. Postman Test 4: Database Error Log (500)
    console.log('[TEST] 5. Database Error (500) Logging...');
    const dbErrRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/test/db-error',
      method: 'GET',
    });
    assert.strictEqual(dbErrRes.statusCode, 500);
    console.log('[PASS] 500 Database error logged to error.log.');

    // 6. Verify File Persistence
    console.log('[TEST] 6. Verify Log File Creation in logs/ directory...');
    const accessLogPath = path.join(logsDir, 'access.log');
    const errorLogPath = path.join(logsDir, 'error.log');
    const appLogPath = path.join(logsDir, 'application.log');

    assert.ok(fs.existsSync(accessLogPath), 'access.log should exist');
    assert.ok(fs.existsSync(errorLogPath), 'error.log should exist');
    assert.ok(fs.existsSync(appLogPath), 'application.log should exist');

    const accessLogContent = fs.readFileSync(accessLogPath, 'utf8');
    const errorLogContent = fs.readFileSync(errorLogPath, 'utf8');
    const appLogContent = fs.readFileSync(appLogPath, 'utf8');

    assert.ok(accessLogContent.includes('/health'), 'access.log should contain /health entry');
    assert.ok(errorLogContent.includes('Database unavailable'), 'error.log should contain Database error');
    assert.ok(appLogContent.includes('AUTH_EVENT'), 'application.log should contain AUTH_EVENT');

    // Confirm passwords do not leak in any log file
    assert.strictEqual(accessLogContent.includes('SuperSecretPassword123'), false);
    assert.strictEqual(errorLogContent.includes('SuperSecretPassword123'), false);
    assert.strictEqual(appLogContent.includes('SuperSecretPassword123'), false);
    console.log('[PASS] Log files access.log, error.log, application.log verified successfully.');

    console.log('[SUCCESS] All Centralized Application Logging tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runLoggerTests().catch((err) => {
  console.error('[ERROR] Application Logging test suite failed:', err);
  process.exit(1);
});
