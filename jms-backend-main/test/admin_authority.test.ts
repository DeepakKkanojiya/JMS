import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { connectDB, disconnectDB, prisma } from '../src/database';

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

async function runAdminAuthorityTests() {
  console.log('[TEST] Starting ADMIN Login & Authority-Based RBAC Test Suite...');

  await connectDB();

  const server = app.listen(5099);
  const host = 'localhost';
  const port = 5099;

  let adminToken = '';
  let adminRoleId = '';
  let companyCreatePermissionId = '';

  try {
    // 1. Authenticate as ADMIN via /api/v1/auth/login
    console.log('[TEST] 1. Login as ADMIN (admin@erp.com)...');
    const loginRes = await makeJsonRequest(
      { hostname: host, port, path: '/api/v1/auth/login', method: 'POST' },
      { email: 'admin@erp.com', password: 'Admin@123' }
    );
    assert.strictEqual(loginRes.statusCode, 200, 'ADMIN login should succeed with 200 OK');
    assert.strictEqual(loginRes.body.success, true);
    assert.strictEqual(loginRes.body.data.user.role, 'ADMIN');
    assert.ok(Array.isArray(loginRes.body.data.user.permissions), 'Login user object must contain permissions array');
    adminToken = loginRes.body.data.accessToken;
    adminRoleId = loginRes.body.data.user.roleId;
    console.log('[PASS] ADMIN login successful. Token & permissions returned.');

    // 2. Test Alias Route: POST /api/v1/login
    console.log('[TEST] 2. Login via route alias /api/v1/login...');
    const aliasLoginRes = await makeJsonRequest(
      { hostname: host, port, path: '/api/v1/login', method: 'POST' },
      { email: 'admin@erp.com', password: 'Admin@123' }
    );
    assert.strictEqual(aliasLoginRes.statusCode, 200, 'Alias route /api/v1/login should return 200 OK');
    console.log('[PASS] Route alias /api/v1/login verified.');

    // 3. Fetch Current User Profile via GET /api/v1/auth/me
    console.log('[TEST] 3. Fetch ADMIN profile via /api/v1/auth/me...');
    const meRes = await makeJsonRequest({
      hostname: host,
      port,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(meRes.statusCode, 200);
    assert.strictEqual(meRes.body.data.role, 'ADMIN');
    assert.ok(Array.isArray(meRes.body.data.permissions), 'Profile must return permissions array');
    assert.ok(meRes.body.data.permissions.includes('product.read'), 'Permissions must include product.read');
    console.log('[PASS] Current user profile /me verified with dynamic permissions payload.');

    // 4. Test Alias Route: GET /api/v1/me
    console.log('[TEST] 4. Fetch profile via route alias /api/v1/me...');
    const aliasMeRes = await makeJsonRequest({
      hostname: host,
      port,
      path: '/api/v1/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(aliasMeRes.statusCode, 200);
    console.log('[PASS] Route alias /api/v1/me verified.');

    // 5. Test Phase 1 Endpoint Access (Users)
    console.log('[TEST] 5. Verify ADMIN token access to Phase 1 endpoint (/api/v1/users)...');
    const phase1Res = await makeJsonRequest({
      hostname: host,
      port,
      path: '/api/v1/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(phase1Res.statusCode, 200);
    console.log('[PASS] Phase 1 endpoint accessible to ADMIN.');

    // 6. Test Phase 2 Endpoint Access (Products)
    console.log('[TEST] 6. Verify ADMIN token access to Phase 2 endpoint (/api/v1/products)...');
    const phase2Res = await makeJsonRequest({
      hostname: host,
      port,
      path: '/api/v1/products',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(phase2Res.statusCode, 200);
    console.log('[PASS] Phase 2 endpoint accessible to ADMIN.');

    // 7. Test Phase 3 Endpoint Access (Inventory Items)
    console.log('[TEST] 7. Verify ADMIN token access to Phase 3 endpoint (/api/v1/inventory-items)...');
    const phase3Res = await makeJsonRequest({
      hostname: host,
      port,
      path: '/api/v1/inventory-items',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(phase3Res.statusCode, 200);
    console.log('[PASS] Phase 3 endpoint accessible to ADMIN.');

    // 8. Empirical Verification of Dynamic Permission Revocation (403 Forbidden)
    console.log('[TEST] 8. Test Dynamic Permission Revocation & 403 Forbidden Enforcement...');
    const perm = await prisma.permission.findFirst({ where: { permissionKey: 'company.create' } });
    assert.ok(perm, 'company.create permission must exist in catalog');
    companyCreatePermissionId = perm.id;

    // Temporarily delete company.create from ADMIN rolePermissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: adminRoleId, permissionId: companyCreatePermissionId },
    });
    console.log('[INFO] Temporarily revoked company.create from ADMIN role.');

    // Calling POST /api/v1/companies should now return 403 Forbidden
    const revokedAccessRes = await makeJsonRequest(
      {
        hostname: host,
        port,
        path: '/api/v1/companies',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      {
        code: 'TEST-COMP-REVOKED',
        name: 'Test Company Revoked',
        legalName: 'Test Company Revoked Ltd',
      }
    );
    assert.strictEqual(revokedAccessRes.statusCode, 403, 'Revoking permission must cause 403 Forbidden');
    console.log('[PASS] Permission revocation enforced! Endpoint returned 403 Forbidden.');

    // Verify /me profile no longer includes company.create
    const meAfterRevoke = await makeJsonRequest({
      hostname: host,
      port,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(meAfterRevoke.body.data.permissions.includes('company.create'), false);
    console.log('[PASS] Profile /me dynamically reflected permission revocation.');

    // Restore permission company.create to ADMIN
    await prisma.rolePermission.create({
      data: { roleId: adminRoleId, permissionId: companyCreatePermissionId },
    });
    console.log('[INFO] Restored company.create permission to ADMIN role.');

    console.log('[SUCCESS] All ADMIN Authority & Dynamic RBAC tests passed with 100% success!');
  } finally {
    // Ensure permission is restored even if assertion fails
    if (adminRoleId && companyCreatePermissionId) {
      try {
        const existingRp = await prisma.rolePermission.findFirst({
          where: { roleId: adminRoleId, permissionId: companyCreatePermissionId },
        });
        if (!existingRp) {
          await prisma.rolePermission.create({
            data: { roleId: adminRoleId, permissionId: companyCreatePermissionId },
          });
        }
      } catch (e) {
        // Ignored
      }
    }
    server.close();
    await disconnectDB();
  }
}

runAdminAuthorityTests().catch((err) => {
  console.error('[ERROR] Admin Authority test suite failed:', err);
  process.exit(1);
});
