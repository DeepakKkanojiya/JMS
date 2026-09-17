import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB, prisma } from '../src/database';

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

async function runAuthTests() {
  console.log('[TEST] Starting Sprint 1.3 Authentication Module Test Suite...');

  await connectDB();

  const server = app.listen(5099);
  const host = 'localhost';
  const port = 5099;

  let ownerAccessToken = '';
  let ownerRefreshToken = '';
  let ownerUserId = '';

  try {
    // 1. Positive Login Test - Owner
    console.log('[TEST] 1. Positive Login Test (Owner: owner@jewelleryerp.com)...');
    const ownerLoginRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/login',
        method: 'POST',
      },
      {
        email: 'owner@jewelleryerp.com',
        password: 'Admin@123',
      }
    );

    assert.strictEqual(ownerLoginRes.statusCode, 200);
    assert.strictEqual(ownerLoginRes.body.success, true);
    assert.ok(ownerLoginRes.body.data.accessToken);
    assert.ok(ownerLoginRes.body.data.refreshToken);
    assert.strictEqual(ownerLoginRes.body.data.user.email, 'owner@jewelleryerp.com');
    assert.strictEqual(ownerLoginRes.body.data.user.role, 'OWNER');

    ownerAccessToken = ownerLoginRes.body.data.accessToken;
    ownerRefreshToken = ownerLoginRes.body.data.refreshToken;
    ownerUserId = ownerLoginRes.body.data.user.id;
    console.log('[PASS] Owner login successful. Access & Refresh tokens generated.');

    // 2. Positive Login Test - Manager
    console.log('[TEST] 2. Positive Login Test (Manager: manager@jewelleryerp.com)...');
    const managerLoginRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/login',
        method: 'POST',
      },
      {
        email: 'manager@jewelleryerp.com',
        password: 'Admin@123',
      }
    );

    assert.strictEqual(managerLoginRes.statusCode, 200);
    assert.strictEqual(managerLoginRes.body.success, true);
    assert.strictEqual(managerLoginRes.body.data.user.role, 'BRANCH_MANAGER');
    console.log('[PASS] Manager login successful.');

    // 3. Positive Login Test - Cashier
    console.log('[TEST] 3. Positive Login Test (Cashier: cashier@jewelleryerp.com)...');
    const cashierLoginRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/login',
        method: 'POST',
      },
      {
        email: 'cashier@jewelleryerp.com',
        password: 'Admin@123',
      }
    );

    assert.strictEqual(cashierLoginRes.statusCode, 200);
    assert.strictEqual(cashierLoginRes.body.success, true);
    assert.strictEqual(cashierLoginRes.body.data.user.role, 'CASHIER');
    console.log('[PASS] Cashier login successful.');

    // 4. Negative Login Test - Wrong Password
    console.log('[TEST] 4. Negative Login Test (wrong password)...');
    const wrongPasswordRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/login',
        method: 'POST',
      },
      {
        email: 'owner@jewelleryerp.com',
        password: 'WrongPassword123',
      }
    );

    assert.strictEqual(wrongPasswordRes.statusCode, 401);
    assert.strictEqual(wrongPasswordRes.body.success, false);
    assert.strictEqual(wrongPasswordRes.body.message, 'Invalid email or password');
    console.log('[PASS] Wrong password rejected with 401.');

    // 5. Negative Login Test - Unknown Email
    console.log('[TEST] 5. Negative Login Test (unknown email)...');
    const unknownEmailRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/login',
        method: 'POST',
      },
      {
        email: 'nonexistent@jewelleryerp.com',
        password: 'Admin@123',
      }
    );

    assert.strictEqual(unknownEmailRes.statusCode, 401);
    assert.strictEqual(unknownEmailRes.body.success, false);
    assert.strictEqual(unknownEmailRes.body.message, 'Invalid email or password');
    console.log('[PASS] Unknown email rejected with 401.');

    // 6. Profile Test (/auth/me) with Bearer token
    console.log('[TEST] 6. Get Current User Profile (/auth/me)...');
    const meRes = await makeRequest({
      hostname: host,
      port,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ownerAccessToken}`,
      },
    });

    assert.strictEqual(meRes.statusCode, 200);
    assert.strictEqual(meRes.body.success, true);
    assert.strictEqual(meRes.body.data.id, ownerUserId);
    assert.strictEqual(meRes.body.data.email, 'owner@jewelleryerp.com');
    console.log('[PASS] User profile retrieved successfully.');

    // 7. Refresh Access Token Test
    console.log('[TEST] 7. Refresh Access Token (/auth/refresh)...');
    const refreshRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/refresh',
        method: 'POST',
      },
      {
        refreshToken: ownerRefreshToken,
      }
    );

    assert.strictEqual(refreshRes.statusCode, 200);
    assert.strictEqual(refreshRes.body.success, true);
    assert.ok(refreshRes.body.data.accessToken);
    console.log('[PASS] New access token issued via refresh token.');

    // 8. Logout Test
    console.log('[TEST] 8. Logout User (/auth/logout)...');
    const logoutRes = await makeRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/auth/logout',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ownerAccessToken}`,
        },
      },
      {
        refreshToken: ownerRefreshToken,
      }
    );

    assert.strictEqual(logoutRes.statusCode, 200);
    assert.strictEqual(logoutRes.body.success, true);
    assert.strictEqual(logoutRes.body.message, 'Logout successful');
    console.log('[PASS] User session revoked successfully.');

    // 9. Verify Session Deletion in iam.user_sessions
    console.log('[TEST] 9. Verify Session Deletion in iam.user_sessions...');
    const sessionRecord = await prisma.userSession.findUnique({
      where: { refreshToken: ownerRefreshToken },
    });
    assert.strictEqual(sessionRecord, null);
    console.log('[PASS] Refresh token session removed from iam.user_sessions.');

    // 10. Verify Login History in iam.login_history
    console.log('[TEST] 10. Verify Login History in iam.login_history...');
    const historyEntries = await prisma.loginHistory.findMany({
      where: { userId: ownerUserId },
    });
    assert.ok(historyEntries.length >= 1);
    assert.strictEqual(historyEntries[0].status, 'SUCCESS');
    console.log('[PASS] Login history audit record confirmed in iam.login_history.');

    console.log('[SUCCESS] All Sprint 1.3 Authentication tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runAuthTests().catch((err) => {
  console.error('[ERROR] Auth test suite failed:', err);
  process.exit(1);
});
