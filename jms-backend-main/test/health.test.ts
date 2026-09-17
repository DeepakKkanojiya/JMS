import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database';
import { healthService } from '../src/modules/health/health.service';

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
    req.end();
  });
}

async function runHealthTests() {
  console.log('[TEST] Starting Sprint 0.13 Production Health Check Subsystem Test Suite...');

  await connectDB();

  const server = app.listen(5092);
  const host = 'localhost';
  const port = 5092;

  try {
    // 1. GET /health Check (200 OK & Healthy Output)
    console.log('[TEST] 1. Accessing GET /health...');
    const healthRes = await makeRequest({
      hostname: host,
      port,
      path: '/health',
      method: 'GET',
    });
    assert.strictEqual(healthRes.statusCode, 200);
    const body = healthRes.body;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.status, 'UP');
    assert.strictEqual(body.database.status, 'UP');
    assert.strictEqual(body.version, '1.0.0');
    assert.ok(typeof body.uptime === 'number');
    assert.ok(body.timestamp);
    console.log('[PASS] Full health check returned 200 OK with UP status.');

    // 2. GET /health/ready Readiness Check (200 OK)
    console.log('[TEST] 2. Accessing GET /health/ready...');
    const readyRes = await makeRequest({
      hostname: host,
      port,
      path: '/health/ready',
      method: 'GET',
    });
    assert.strictEqual(readyRes.statusCode, 200);
    assert.strictEqual(readyRes.body.ready, true);
    console.log('[PASS] Readiness probe returned 200 OK with ready: true.');

    // 3. GET /health/live Liveness Check (200 OK)
    console.log('[TEST] 3. Accessing GET /health/live...');
    const liveRes = await makeRequest({
      hostname: host,
      port,
      path: '/health/live',
      method: 'GET',
    });
    assert.strictEqual(liveRes.statusCode, 200);
    assert.strictEqual(liveRes.body.status, 'UP');
    console.log('[PASS] Liveness probe returned 200 OK with status: UP.');

    // 4. Non-GET Method Rejection (405 Method Not Allowed)
    console.log('[TEST] 4. Testing HTTP 405 Method Not Allowed on POST /health...');
    const postHealthRes = await makeRequest({
      hostname: host,
      port,
      path: '/health',
      method: 'POST',
    });
    assert.strictEqual(postHealthRes.statusCode, 405);
    assert.strictEqual(postHealthRes.body.success, false);
    console.log('[PASS] POST /health rejected with 405 Method Not Allowed.');

    // 5. Simulated Unhealthy Response Service Unavailable (503)
    console.log('[TEST] 5. Testing 503 Service Unavailable when Database is DOWN...');
    // Temporarily mock getHealth to return DOWN
    const originalGetHealth = healthService.getHealth.bind(healthService);
    healthService.getHealth = async () => ({
      success: false,
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: 100,
      version: '1.0.0',
      environment: 'development',
      database: { status: 'DOWN', error: 'Database connection failed' },
    });

    const unhealthRes = await makeRequest({
      hostname: host,
      port,
      path: '/health',
      method: 'GET',
    });
    assert.strictEqual(unhealthRes.statusCode, 503);
    assert.strictEqual(unhealthRes.body.status, 'DOWN');
    assert.strictEqual(unhealthRes.body.database.status, 'DOWN');

    // Restore original getHealth
    healthService.getHealth = originalGetHealth;
    console.log('[PASS] Unhealthy status returns 503 Service Unavailable.');

    console.log('[SUCCESS] All Production Health Check tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runHealthTests().catch((err) => {
  console.error('[ERROR] Production Health Check test suite failed:', err);
  process.exit(1);
});
