import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { seedRoles } from '../prisma/seed/roles';
import { seedUsers } from '../prisma/seed/users';

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

async function runSeedTests() {
  console.log('[TEST] Starting Sprint 0.11 Automated Seed System Test Suite...');

  await connectDB();

  const server = app.listen(5094);
  const host = 'localhost';
  const port = 5094;

  try {
    // 1. First Seed Run
    console.log('[TEST] 1. Executing initial database seed...');
    await seedRoles();
    await seedUsers();
    console.log('[PASS] Initial seed execution completed.');

    // 2. Idempotency Check (Second Seed Run)
    console.log('[TEST] 2. Executing second database seed to test idempotency...');
    await seedRoles();
    await seedUsers();
    console.log('[PASS] Second seed execution succeeded cleanly without duplicate key errors.');

    // 3. Database Role Rows Verification
    console.log('[TEST] 3. Verifying roles table contents...');
    const roles = await prisma.role.findMany();
    const roleNames = roles.map((r) => r.name);
    assert.ok(roleNames.includes('OWNER'), 'OWNER role missing');
    assert.ok(roleNames.includes('ADMIN'), 'ADMIN role missing');
    assert.ok(roleNames.includes('STAFF'), 'STAFF role missing');
    assert.ok(roleNames.includes('USER'), 'USER role missing');
    console.log('[PASS] Roles OWNER, ADMIN, STAFF, USER verified in database.');

    // 4. Database User Rows & Password Hashing Verification
    console.log('[TEST] 4. Verifying seeded user accounts and bcrypt hashing...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@erp.com' } });
    const staffUser = await prisma.user.findUnique({ where: { email: 'staff@erp.com' } });
    const regularUser = await prisma.user.findUnique({ where: { email: 'user@erp.com' } });

    assert.ok(adminUser, 'admin@erp.com should exist');
    assert.ok(staffUser, 'staff@erp.com should exist');
    assert.ok(regularUser, 'user@erp.com should exist');

    assert.notStrictEqual(adminUser.passwordHash, 'Admin@123');
    assert.ok(adminUser.passwordHash.startsWith('$2'), 'Password should be bcrypt hashed');
    console.log('[PASS] User accounts and bcrypt password hashes verified.');

    // 5. Postman HTTP Login Endpoint Verification
    console.log('[TEST] 5. Verifying HTTP Login for seeded accounts...');
    
    // Admin Login
    const adminLoginRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'admin@erp.com', password: 'Admin@123' }
    );
    assert.strictEqual(adminLoginRes.statusCode, 200);
    assert.ok(adminLoginRes.body.data.accessToken);

    // Staff Login
    const staffLoginRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'staff@erp.com', password: 'Staff@123' }
    );
    assert.strictEqual(staffLoginRes.statusCode, 200);
    assert.ok(staffLoginRes.body.data.accessToken);

    // User Login
    const userLoginRes = await makeRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'user@erp.com', password: 'User@123' }
    );
    assert.strictEqual(userLoginRes.statusCode, 200);
    assert.ok(userLoginRes.body.data.accessToken);

    console.log('[PASS] HTTP Login verified for Admin, Staff, and User seed accounts.');
    console.log('[SUCCESS] All Automated Seed System tests passed with 100% success!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runSeedTests().catch((err) => {
  console.error('[ERROR] Automated Seed System test suite failed:', err);
  process.exit(1);
});
