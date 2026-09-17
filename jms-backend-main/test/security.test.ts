import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database';
import { securityConfig } from '../src/config/security';

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

async function runSecurityTests() {
  console.log('[TEST] Starting Sprint 0.12 Application Security Test Suite...');

  await connectDB();

  const server = app.listen(5093);
  const host = 'localhost';
  const port = 5093;

  try {
    // 1. HTTP Security Headers Verification
    console.log('[TEST] 1. Verifying HTTP Security Headers...');
    const resHeaders = await makeRequest({
      hostname: host,
      port,
      path: '/health',
      method: 'GET',
    });
    assert.strictEqual(resHeaders.statusCode, 200);
    assert.strictEqual(resHeaders.headers['x-frame-options'], 'DENY');
    assert.strictEqual(resHeaders.headers['x-content-type-options'], 'nosniff');
    assert.ok(resHeaders.headers['strict-transport-security']);
    console.log('[PASS] Security headers (X-Frame-Options, X-Content-Type-Options, HSTS) present.');

    // 2. Input Sanitization (Stripping HTML & script injections)
    console.log('[TEST] 2. Input Sanitization (Stripping script & HTML tags)...');
    const sanitizeRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      {
        email: '  owner@jewelleryerp.com <script>alert("xss")</script> ',
        password: 'Admin@123',
      }
    );
    // Should sanitize email to admin@jewelleryerp.com and succeed login!
    assert.strictEqual(sanitizeRes.statusCode, 200);
    console.log('[PASS] HTML tags & script tags stripped, whitespace trimmed successfully.');

    // 3. Rate Limiter Triggering (429 Too Many Requests)
    console.log('[TEST] 3. Rate Limiter Triggering (429 Too Many Requests)...');
    let hit429 = false;
    for (let i = 0; i < 15; i++) {
      const res = await makeRequest(
        { hostname: host, port, path: '/api/v1/auth/login', method: 'POST', headers: { 'x-test-rate-limit': 'true' } },
        { email: 'admin@jewelleryerp.com', password: 'WrongPassword' }
      );
      if (res.statusCode === 429) {
        hit429 = true;
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.statusCode, 429);
        break;
      }
    }
    assert.strictEqual(hit429, true, 'Rate limiter should return 429 after threshold');
    console.log('[PASS] Rate limiter triggered 429 Too Many Requests successfully.');

    // 4. File Upload Extension Rules Verification
    console.log('[TEST] 4. File Upload Rules Verification...');
    const blockedExts = securityConfig.uploads.blockedExtensions;
    assert.ok(blockedExts.includes('.exe'));
    assert.ok(blockedExts.includes('.sh'));
    assert.ok(blockedExts.includes('.bat'));
    assert.strictEqual(securityConfig.uploads.maxFileSizeBytes, 5 * 1024 * 1024);
    console.log('[PASS] File upload security rules verified.');

    console.log('[SUCCESS] All Application Security tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runSecurityTests().catch((err) => {
  console.error('[ERROR] Application Security test suite failed:', err);
  process.exit(1);
});
