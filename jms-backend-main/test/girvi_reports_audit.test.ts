import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5100;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let testCompanyId: string;
let testBranchId: string;
let testCustomerId: string;

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
          resolve({ status: res.statusCode || 500, body: data as any });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('RUNNING PHASE 6.5 GIRVI REPORTS, ANALYTICS & AUDIT TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1. Auth Setup
    console.log('\n[TEST] 1. Auth Setup & Token Retrieval...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login failed');
    ownerToken = ownerRes.body.data.accessToken;

    const company = await prisma.company.findFirst();
    assert.ok(company);
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(branch);
    testBranchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(customer);
    testCustomerId = customer.id;

    // 2. Create and Approve Loan
    console.log('\n[TEST] 2. Creating Girvi Loan with Full Lifecycle Events...');
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    const loanRes = await request(
      'POST',
      '/girvi/loans',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        customerId: testCustomerId,
        loanDate: pastDate.toISOString(),
        dueDate: pastDate.toISOString(),
        principalAmount: 100000,
        valuationAmount: 140000,
        interestRate: 2.0,
        interestPeriod: 'MONTHLY',
        collaterals: [
          {
            itemName: '24K Gold Bar 20g',
            grossWeight: 20.000,
            netWeight: 20.000,
            valuedAmount: 140000,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(loanRes.status, 201);
    const loanId = loanRes.body.data.id;

    // Record Collection
    const colRes = await request(
      'POST',
      '/girvi/collections',
      {
        girviLoanId: loanId,
        amount: 2000,
        paymentMethod: 'CASH',
        remarks: 'Part interest payment',
      },
      ownerToken
    );
    assert.strictEqual(colRes.status, 201);

    // Renew Loan
    const newDueDate = new Date();
    newDueDate.setMonth(newDueDate.getMonth() + 6);
    const renewRes = await request(
      'POST',
      `/girvi/loans/${loanId}/renew`,
      {
        newDueDate: newDueDate.toISOString(),
        remarks: 'Renewed for 6 months',
      },
      ownerToken
    );
    assert.strictEqual(renewRes.status, 200);

    // 3. Fetch 360-Degree Audit Trail
    console.log('\n[TEST] 3. Fetching Chronological Loan Audit Trail...');
    const auditRes = await request('GET', `/girvi/loans/${loanId}/audit-trail?sortOrder=asc`, undefined, ownerToken);
    assert.strictEqual(auditRes.status, 200);
    const auditData = auditRes.body.data;
    assert.strictEqual(auditData.loanId, loanId);
    assert.ok(auditData.totalEvents >= 3, 'Audit trail must contain creation, collection, and renewal events');
    console.log(`[PASS] Audit Trail Verified: Total Events = ${auditData.totalEvents}`);
    auditData.events.forEach((ev: any, idx: number) => {
      console.log(`       Event ${idx + 1}: ${ev.eventType} - ${ev.description}`);
    });

    // 4. Fetch Portfolio Summary Report
    console.log('\n[TEST] 4. Fetching Portfolio Financial Summary Report...');
    const portRes = await request('GET', `/girvi/reports/portfolio?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(portRes.status, 200);
    const portData = portRes.body.data;
    assert.ok(portData.totalLoansCount >= 1);
    console.log(`[PASS] Portfolio Summary Verified: Active Loans=${portData.activeLoansCount}, Portfolio Outstanding=₹${portData.totalPortfolioOutstanding}`);

    // 5. Fetch Overdue Aging Analysis Report
    console.log('\n[TEST] 5. Fetching Overdue Aging Analysis Report...');
    const agingRes = await request('GET', `/girvi/reports/overdue-aging?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(agingRes.status, 200);
    const agingData = agingRes.body.data;
    assert.ok(agingData.current !== undefined);
    assert.ok(agingData.days1To30 !== undefined);
    assert.ok(agingData.days90Plus !== undefined);
    console.log(`[PASS] Overdue Aging Report Verified`);

    console.log('\n======================================================');
    console.log('✓ ALL PHASE 6.5 GIRVI REPORTS & AUDIT TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[FAIL] Test execution failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runTests();
