import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string = '';
let staffToken: string = '';
let testCompanyId: string = '';
let createdTaxId: string = '';

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, body: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTaxRateTests() {
  console.log('\n==================================================');
  console.log('STARTING SPRINT 4.4 TAX RATE SUBSYSTEM TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });

    const loginRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    ownerToken = loginRes.body.data.accessToken;

    const staffLogin = await request('POST', '/auth/login', {
      email: 'cashier@jewelleryerp.com',
      password: 'Admin@123',
    });
    staffToken = staffLogin.body.data.accessToken;

    const company = await prisma.company.findFirst({ where: { isActive: true } });
    assert.ok(company, 'Active company must exist for test');
    testCompanyId = company.id;

    // 1. Security Guard Test
    console.log('[TEST 1] Security: Unauthenticated access rejection (401)');
    const res1 = await request('GET', '/tax-rates');
    assert.strictEqual(res1.status, 401);
    console.log('[PASS] Unauthenticated access rejected with 401.');

    // 2. RBAC Guard Test
    console.log('[TEST 2] RBAC: CASHIER role creation rejection (403)');
    const res2 = await request(
      'POST',
      '/tax-rates',
      {
        companyId: testCompanyId,
        taxName: 'GST',
        taxCode: 'GST_5',
        rate: 5.0,
        effectiveFrom: '2026-01-01T00:00:00.000Z',
      },
      staffToken
    );
    assert.strictEqual(res2.status, 403);
    console.log('[PASS] CASHIER role creation rejected with 403.');

    // 3. Validation Guard Test
    console.log('[TEST 3] Validation: Negative rate rejection (400)');
    const res3 = await request(
      'POST',
      '/tax-rates',
      {
        companyId: testCompanyId,
        taxName: 'GST',
        taxCode: 'GST_NEG',
        rate: -3.0,
        effectiveFrom: '2026-01-01T00:00:00.000Z',
      },
      ownerToken
    );
    assert.strictEqual(res3.status, 400);
    console.log('[PASS] Negative rate rejected with 400.');

    // 4. Create Tax Rate Test
    console.log('[TEST 4] Create: OWNER creates Tax Rate (201)');
    const taxCodeTag = `GST_TEST_${Date.now()}`;
    const res4 = await request(
      'POST',
      '/tax-rates',
      {
        companyId: testCompanyId,
        taxName: 'GST Test 5%',
        taxCode: taxCodeTag,
        rate: 5.0,
        effectiveFrom: '2026-06-01T00:00:00.000Z',
      },
      ownerToken
    );
    assert.strictEqual(res4.status, 201);
    assert.strictEqual(res4.body.success, true);
    assert.strictEqual(res4.body.data.taxCode, taxCodeTag);
    createdTaxId = res4.body.data.id;
    console.log('[PASS] Tax rate created with ID:', createdTaxId);

    // 5. Overlap Guard Test
    console.log('[TEST 5] Overlap: Overlapping tax rate rejection (409)');
    const res5 = await request(
      'POST',
      '/tax-rates',
      {
        companyId: testCompanyId,
        taxName: 'GST Duplicate',
        taxCode: taxCodeTag,
        rate: 5.0,
        effectiveFrom: '2026-06-15T00:00:00.000Z',
      },
      ownerToken
    );
    assert.strictEqual(res5.status, 409);
    assert.strictEqual(res5.body.success, false);
    console.log('[PASS] Overlapping tax rate rejected with 409 Conflict.');

    // 6. Resolution Query Test
    console.log('[TEST 6] Resolution: Fetch current active tax rate (200)');
    const res6 = await request(
      'GET',
      `/tax-rates/current?companyId=${testCompanyId}&taxCode=${taxCodeTag}`,
      undefined,
      ownerToken
    );
    assert.strictEqual(res6.status, 200);
    assert.strictEqual(res6.body.success, true);
    assert.strictEqual(res6.body.data.taxCode, taxCodeTag);
    console.log('[PASS] Current active tax rate resolved successfully.');

    // 7. Update Tax Rate Test
    console.log('[TEST 7] Update: Update tax rate value (200)');
    const res7 = await request(
      'PUT',
      `/tax-rates/${createdTaxId}`,
      { rate: 5.5 },
      ownerToken
    );
    assert.strictEqual(res7.status, 200);
    assert.strictEqual(res7.body.success, true);
    console.log('[PASS] Tax rate updated.');

    // 8. Soft Deactivation Test
    console.log('[TEST 8] Deactivate: Soft-deactivate tax rate (200)');
    const res8 = await request(
      'POST',
      `/tax-rates/${createdTaxId}/deactivate`,
      {},
      ownerToken
    );
    assert.strictEqual(res8.status, 200);
    assert.strictEqual(res8.body.success, true);
    console.log('[PASS] Tax rate deactivated successfully.');

    // 9. DELETE Method Safety Test
    console.log('[TEST 9] Safety: DELETE endpoint is NOT supported (404/405)');
    const res9 = await request('DELETE', `/tax-rates/${createdTaxId}`, undefined, ownerToken);
    assert.ok([404, 405].includes(res9.status));
    console.log('[PASS] DELETE endpoint rejected as expected.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 4.4 TAX RATE TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n[FAIL] Tax Rate API Test Failure:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runTaxRateTests();
