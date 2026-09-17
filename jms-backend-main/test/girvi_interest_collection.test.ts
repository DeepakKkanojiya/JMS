import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5096;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let staffToken: string;

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
  console.log('RUNNING PHASE 6.2 GIRVI INTEREST, COLLECTION & RENEWAL TESTS');
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

    const staffRes = await request('POST', '/auth/login', {
      email: 'staff@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(staffRes.status, 200, 'Staff login failed');
    staffToken = staffRes.body.data.accessToken;

    const company = await prisma.company.findFirst();
    assert.ok(company, 'Seed company must exist');
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(branch, 'Seed branch must exist');
    testBranchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(customer, 'Seed customer must exist');
    testCustomerId = customer.id;

    // 2. Create Active Girvi Loan for Testing
    console.log('\n[TEST] 2. Creating Girvi Loan for Interest & Collection Tests...');
    const loanStartDate = new Date();
    loanStartDate.setDate(loanStartDate.getDate() - 60); // 60 days ago

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 10); // Overdue by 10 days

    const loanRes = await request(
      'POST',
      '/girvi/loans',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        customerId: testCustomerId,
        dueDate: dueDate.toISOString(),
        principalAmount: 100000,
        valuationAmount: 140000,
        interestRate: 1.5, // 1.5% per month
        interestPeriod: 'MONTHLY',
        notes: 'Integration Test Loan for Interest & Collection',
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
    assert.strictEqual(loanRes.status, 201, `Loan creation failed: ${JSON.stringify(loanRes.body)}`);
    const loanId = loanRes.body.data.id;
    console.log(`[PASS] Created Test Loan ID=${loanId}`);

    // Update loanDate to 60 days ago directly for accurate test accrual calculation
    await prisma.girviLoan.update({
      where: { id: loanId },
      data: { loanDate: loanStartDate },
    });

    // 3. Test Financial Summary & Interest Accrual Calculation
    console.log('\n[TEST] 3. Testing Interest Engine & Financial Summary...');
    const summaryRes = await request('GET', `/girvi/loans/${loanId}/financial-summary`, undefined, ownerToken);
    assert.strictEqual(summaryRes.status, 200, 'Financial summary failed');
    const summary = summaryRes.body.data;

    assert.strictEqual(summary.principalOutstanding, 100000, 'Principal outstanding mismatch');
    assert.ok(summary.accruedInterest >= 3000, `Accrued interest should be ~3000 for 60 days at 1.5%/month, got ${summary.accruedInterest}`);
    assert.strictEqual(summary.isOverdue, true, 'Loan should be marked overdue');
    assert.ok(summary.overdueDays >= 10, 'Overdue days mismatch');
    console.log(`[PASS] Financial Summary Verified: Accrued Interest = ₹${summary.accruedInterest}, Overdue Days = ${summary.overdueDays}`);

    // 4. Record Interest Payment Collection (CASH)
    console.log('\n[TEST] 4. Record Interest Payment Collection (CASH)...');
    const col1Res = await request(
      'POST',
      '/girvi/collections',
      {
        girviLoanId: loanId,
        paymentMethod: 'CASH',
        amount: 2000,
        remarks: 'Part interest payment in cash',
      },
      ownerToken
    );
    assert.strictEqual(col1Res.status, 201, `Collection failed: ${JSON.stringify(col1Res.body)}`);
    const col1Id = col1Res.body.data.id;
    assert.strictEqual(col1Res.body.data.interestAmount, '2000', 'Allocation should go to interest first');
    assert.strictEqual(col1Res.body.data.principalAmount, '0', 'Principal component should be 0');
    console.log(`[PASS] Collection 1 created: ID=${col1Id}, Interest=₹2000`);

    // 5. Record Split Interest & Principal Collection (UPI)
    console.log('\n[TEST] 5. Record Split Payment Collection (UPI)...');
    const col2Res = await request(
      'POST',
      '/girvi/collections',
      {
        girviLoanId: loanId,
        paymentMethod: 'UPI',
        amount: 15000,
        transactionReference: 'UPI-TEST-12345',
        remarks: 'Interest clear + principal reduction',
      },
      ownerToken
    );
    assert.strictEqual(col2Res.status, 201, `Collection 2 failed: ${JSON.stringify(col2Res.body)}`);
    const col2Id = col2Res.body.data.id;
    console.log(`[PASS] Collection 2 created: ID=${col2Id}, Total=₹15000`);

    // 6. Check Updated Financial Summary
    console.log('\n[TEST] 6. Verifying Updated Balances after Collections...');
    const summary2Res = await request('GET', `/girvi/loans/${loanId}/financial-summary`, undefined, ownerToken);
    assert.strictEqual(summary2Res.status, 200);
    const summary2 = summary2Res.body.data;
    assert.ok(summary2.collectedInterest >= 2000, 'Collected interest mismatch');
    assert.ok(summary2.collectedPrincipal > 0, 'Collected principal should be > 0');
    assert.ok(summary2.principalOutstanding < 100000, 'Principal outstanding should decrease');
    console.log(`[PASS] Principal Outstanding reduced to ₹${summary2.principalOutstanding}`);

    // 7. Test Over-Collection Protection Guard
    console.log('\n[TEST] 7. Testing Over-Collection Protection Guard...');
    const overColRes = await request(
      'POST',
      '/girvi/collections',
      {
        girviLoanId: loanId,
        paymentMethod: 'CASH',
        amount: 500000, // Excessive amount
      },
      ownerToken
    );
    assert.strictEqual(overColRes.status, 409, 'Over-collection attempt should fail with 409 Conflict');
    console.log('[PASS] Over-collection guard successfully blocked excessive payment');

    // 8. Test Collection Reversal
    console.log('\n[TEST] 8. Reverse Collection with Mandatory Reason...');
    const revRes = await request(
      'POST',
      `/girvi/collections/${col1Id}/reverse`,
      {
        reversalReason: 'Duplicate cash entry made during test execution',
      },
      ownerToken
    );
    assert.strictEqual(revRes.status, 200, `Reversal failed: ${JSON.stringify(revRes.body)}`);
    assert.strictEqual(revRes.body.data.status, 'REVERSED');
    console.log('[PASS] Collection reversed successfully');

    // Duplicate Reversal Guard Check
    const dupRevRes = await request(
      'POST',
      `/girvi/collections/${col1Id}/reverse`,
      {
        reversalReason: 'Second reversal attempt',
      },
      ownerToken
    );
    assert.strictEqual(dupRevRes.status, 400, 'Duplicate reversal should fail with 400');
    console.log('[PASS] Duplicate reversal correctly prevented');

    // 9. Test Girvi Loan Renewal Workflow
    console.log('\n[TEST] 9. Test Girvi Loan Renewal & Due Date Extension...');
    const newDueDate = new Date();
    newDueDate.setMonth(newDueDate.getMonth() + 6);

    const renewRes = await request(
      'POST',
      `/girvi/loans/${loanId}/renew`,
      {
        newDueDate: newDueDate.toISOString(),
        remarks: 'Renewed after interest settlement',
      },
      ownerToken
    );
    assert.strictEqual(renewRes.status, 200, `Renewal failed: ${JSON.stringify(renewRes.body)}`);
    assert.strictEqual(renewRes.body.data.status, 'RENEWED', 'Status should transition to RENEWED');
    assert.ok(renewRes.body.data.renewals.length >= 1, 'Renewal audit record must be created');
    console.log(`[PASS] Loan renewed successfully. New Due Date: ${renewRes.body.data.dueDate}`);

    // Invalid Renewal Test (New Due Date earlier than current)
    const invalidRenewRes = await request(
      'POST',
      `/girvi/loans/${loanId}/renew`,
      {
        newDueDate: new Date(2020, 1, 1).toISOString(),
      },
      ownerToken
    );
    assert.strictEqual(invalidRenewRes.status, 400, 'Invalid renewal due date should return 400');
    console.log('[PASS] Invalid renewal due date correctly blocked');

    // 10. List Overdue & Due-Soon Loans
    console.log('\n[TEST] 10. Query Overdue Loans List...');
    const overdueRes = await request('GET', `/girvi/overdue-loans?branchId=${testBranchId}`, undefined, ownerToken);
    assert.strictEqual(overdueRes.status, 200, 'Overdue loans query failed');
    assert.ok(Array.isArray(overdueRes.body.data), 'Data must be an array');
    console.log(`[PASS] Overdue loans query returned ${overdueRes.body.data.length} loans`);

    console.log('\n======================================================');
    console.log('✓ ALL PHASE 6.2 GIRVI INTEREST & COLLECTION TESTS PASSED!');
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
