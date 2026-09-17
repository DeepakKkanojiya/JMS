import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let companyId: string;
let branchId: string;
let customerId: string;
let salespersonId: string;

let secondCompanyId: string;
let secondBranchId: string;
let secondCustomerId: string;

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

async function createTestInventoryItem(comp: string, br: string, itemCode: string, status = 'AVAILABLE') {
  const product = await prisma.product.findFirst({ where: { companyId: comp } });
  assert.ok(product, 'Product must exist for item creation');

  return prisma.inventoryItem.create({
    data: {
      companyId: comp,
      productId: product.id,
      branchId: br,
      itemCode,
      grossWeight: 15.0,
      netWeight: 14.2,
      fineWeight: 13.0,
      purity: '22K',
      status,
      tags: {
        create: {
          barcode: `BC-${itemCode}`,
          isActive: true,
        },
      },
    },
    include: {
      product: true,
      branch: true,
      tags: true,
    },
  });
}

async function runTests() {
  try {
    console.log('\n======================================================');
    console.log('STARTING SPRINT 7.3 APPROVAL DEPOSIT & PAYMENT TESTS');
    console.log('======================================================\n');

    await connectDB();
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });

    // Authenticate OWNER
    const loginRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(loginRes.status, 200, 'Owner login should succeed');
    ownerToken = loginRes.body.data.accessToken;
    console.log('[PASS] Owner authenticated successfully');

    // Fetch master records
    const company = await prisma.company.findFirst();
    assert.ok(company, 'Test company must exist');
    companyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId } });
    assert.ok(branch, 'Test branch must exist');
    branchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId } });
    assert.ok(customer, 'Test customer must exist');
    customerId = customer.id;

    const employee = await prisma.employee.findFirst({ where: { companyId } });
    if (employee) salespersonId = employee.id;

    // Create Second Company for tenant isolation
    let secondCompany = await prisma.company.findFirst({ where: { companyCode: 'COMP-DEP-2' } });
    if (!secondCompany) {
      secondCompany = await prisma.company.create({
        data: { companyCode: 'COMP-DEP-2', name: 'Deposit Isolation Co 2' },
      });
    }
    secondCompanyId = secondCompany.id;

    let secondBranch = await prisma.branch.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondBranch) {
      secondBranch = await prisma.branch.create({
        data: { companyId: secondCompanyId, branchCode: 'DEP-BR-2', name: 'Deposit Branch 2' },
      });
    }
    secondBranchId = secondBranch.id;

    let secondCustomer = await prisma.customer.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondCustomer) {
      secondCustomer = await prisma.customer.create({
        data: {
          companyId: secondCompanyId,
          branchId: secondBranchId,
          customerCode: 'DEP-CUST-2',
          firstName: 'Dep',
          lastName: 'Iso',
          mobile: '9911223344',
        },
      });
    }
    secondCustomerId = secondCustomer.id;

    // 1. Unauthenticated Check
    console.log('\n[TEST] 1. Rejecting unauthenticated deposit creation (401)...');
    const unauthRes = await request('POST', '/approvals/00000000-0000-0000-0000-000000000000/deposits', {
      paymentMethod: 'CASH',
      amount: 1000,
    });
    assert.strictEqual(unauthRes.status, 401);
    console.log('[PASS] Unauthenticated deposit request rejected with 401');

    // 2. Create Approval with Required Deposit & Issue It
    console.log('\n[TEST] 2. Creating approval slip with required deposit amount of ₹50,000...');
    const item1 = await createTestInventoryItem(companyId, branchId, `DEP-ITEM-${Date.now()}-1`);
    const appRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        requiredDepositAmount: 50000,
        items: [{ inventoryItemId: item1.id, quantity: 1, unitPrice: 150000 }],
      },
      ownerToken
    );
    assert.strictEqual(appRes.status, 201);
    const approvalId = appRes.body.data.id;
    assert.strictEqual(Number(appRes.body.data.requiredDepositAmount), 50000);

    // Reject deposit on DRAFT status
    console.log('\n[TEST] 3. Rejecting deposit recording on DRAFT approval slip...');
    const draftDepRes = await request(
      'POST',
      `/approvals/${approvalId}/deposits`,
      { paymentMethod: 'CASH', amount: 10000 },
      ownerToken
    );
    assert.strictEqual(draftDepRes.status, 400);
    console.log('[PASS] Deposit on DRAFT approval correctly rejected with 400');

    // Issue Approval
    const issueRes = await request('POST', `/approvals/${approvalId}/issue`, {}, ownerToken);
    assert.strictEqual(issueRes.status, 200);

    // 4. Create Partial CASH Deposit Payment
    console.log('\n[TEST] 4. Recording CASH deposit of ₹20,000...');
    const cashDepRes = await request(
      'POST',
      `/approvals/${approvalId}/deposits`,
      { paymentMethod: 'CASH', amount: 20000, remarks: 'Cash security deposit' },
      ownerToken
    );
    assert.strictEqual(cashDepRes.status, 201);
    assert.strictEqual(cashDepRes.body.data.paymentMethod, 'CASH');
    assert.strictEqual(Number(cashDepRes.body.data.amount), 20000);
    assert.strictEqual(cashDepRes.body.summary.completedDeposit, 20000);
    assert.strictEqual(cashDepRes.body.summary.outstandingDeposit, 30000);
    assert.strictEqual(cashDepRes.body.summary.depositStatus, 'PARTIALLY_PAID');
    const deposit1Id = cashDepRes.body.data.id;
    console.log('[PASS] CASH deposit of ₹20,000 recorded; status is PARTIALLY_PAID');

    // 5. Create UPI Deposit Payment
    console.log('\n[TEST] 5. Recording UPI deposit of ₹15,000...');
    const upiDepRes = await request(
      'POST',
      `/approvals/${approvalId}/deposits`,
      { paymentMethod: 'UPI', amount: 15000, transactionReference: 'UPI-REF-998811' },
      ownerToken
    );
    assert.strictEqual(upiDepRes.status, 201);
    assert.strictEqual(upiDepRes.body.summary.completedDeposit, 35000);
    assert.strictEqual(upiDepRes.body.summary.outstandingDeposit, 15000);
    console.log('[PASS] UPI deposit recorded; completed = ₹35,000, outstanding = ₹15,000');

    // 6. Test Deposit Summary API
    console.log('\n[TEST] 6. Verifying GET deposit-summary API...');
    const summaryRes = await request('GET', `/approvals/${approvalId}/deposit-summary`, undefined, ownerToken);
    assert.strictEqual(summaryRes.status, 200);
    assert.strictEqual(summaryRes.body.data.requiredDeposit, 50000);
    assert.strictEqual(summaryRes.body.data.completedDeposit, 35000);
    assert.strictEqual(summaryRes.body.data.outstandingDeposit, 15000);
    assert.strictEqual(summaryRes.body.data.depositStatus, 'PARTIALLY_PAID');
    console.log('[PASS] Deposit summary API returned accurate financial values');

    // 7. Complete Remaining Balance via CARD Deposit Payment (₹15,000)
    console.log('\n[TEST] 7. Recording CARD deposit of ₹15,000 to fully pay deposit...');
    const cardDepRes = await request(
      'POST',
      `/approvals/${approvalId}/deposits`,
      { paymentMethod: 'CARD', amount: 15000, transactionReference: 'CARD-TXN-4455' },
      ownerToken
    );
    assert.strictEqual(cardDepRes.status, 201);
    assert.strictEqual(cardDepRes.body.summary.completedDeposit, 50000);
    assert.strictEqual(cardDepRes.body.summary.outstandingDeposit, 0);
    assert.strictEqual(cardDepRes.body.summary.depositStatus, 'FULLY_PAID');
    console.log('[PASS] Deposit fully paid; status transitioned to FULLY_PAID');

    // 8. Overpayment Rejection
    console.log('\n[TEST] 8. Rejecting deposit payment exceeding outstanding balance (409 Conflict)...');
    const excessDepRes = await request(
      'POST',
      `/approvals/${approvalId}/deposits`,
      { paymentMethod: 'CASH', amount: 5000 },
      ownerToken
    );
    assert.strictEqual(excessDepRes.status, 409);
    console.log('[PASS] Excess deposit correctly rejected with 409 Conflict');

    // 9. Reverse Completed Payment (Deposit 1: CASH ₹20,000)
    console.log('\n[TEST] 9. Reversing completed deposit payment...');
    // Reversal without reason fails (400)
    const noReasonRes = await request('POST', `/approval-deposits/${deposit1Id}/reverse`, { reversalReason: '' }, ownerToken);
    assert.strictEqual(noReasonRes.status, 400);

    // Valid reversal
    const revRes = await request(
      'POST',
      `/approval-deposits/${deposit1Id}/reverse`,
      { reversalReason: 'Customer requested partial refund of cash deposit' },
      ownerToken
    );
    assert.strictEqual(revRes.status, 200);
    assert.strictEqual(revRes.body.data.status, 'REVERSED');
    assert.strictEqual(revRes.body.data.reversalReason, 'Customer requested partial refund of cash deposit');

    // Reject duplicate reversal
    const dupRevRes = await request(
      'POST',
      `/approval-deposits/${deposit1Id}/reverse`,
      { reversalReason: 'Second reversal attempt' },
      ownerToken
    );
    assert.strictEqual(dupRevRes.status, 400);
    console.log('[PASS] Deposit reversal succeeded, and duplicate reversal was rejected');

    // 10. Re-verify Summary after Reversal
    console.log('\n[TEST] 10. Verifying deposit summary update after reversal...');
    const postRevSummaryRes = await request('GET', `/approvals/${approvalId}/deposit-summary`, undefined, ownerToken);
    assert.strictEqual(postRevSummaryRes.status, 200);
    assert.strictEqual(postRevSummaryRes.body.data.completedDeposit, 30000);
    assert.strictEqual(postRevSummaryRes.body.data.reversedDeposit, 20000);
    assert.strictEqual(postRevSummaryRes.body.data.outstandingDeposit, 20000);
    assert.strictEqual(postRevSummaryRes.body.data.depositStatus, 'PARTIALLY_PAID');
    console.log('[PASS] Summary updated after reversal: completed = ₹30,000, reversed = ₹20,000, outstanding = ₹20,000');

    // 11. Concurrency Overpayment Protection (Parallel Requests)
    console.log('\n[TEST] 11. Verifying parallel concurrency overpayment protection...');
    // Current outstanding is ₹20,000. Fire two simultaneous requests for ₹20,000.
    const [resConc1, resConc2] = await Promise.all([
      request('POST', `/approvals/${approvalId}/deposits`, { paymentMethod: 'BANK_TRANSFER', amount: 20000 }, ownerToken),
      request('POST', `/approvals/${approvalId}/deposits`, { paymentMethod: 'CHEQUE', amount: 20000 }, ownerToken),
    ]);

    const concStatuses = [resConc1.status, resConc2.status].sort();
    assert.strictEqual(concStatuses[0], 201, 'Exactly one concurrent deposit request must succeed with 201');
    assert.strictEqual(concStatuses[1], 409, 'Losing concurrent request must be rejected with 409 Conflict');

    const finalSummaryRes = await request('GET', `/approvals/${approvalId}/deposit-summary`, undefined, ownerToken);
    assert.strictEqual(finalSummaryRes.body.data.completedDeposit, 50000);
    assert.strictEqual(finalSummaryRes.body.data.outstandingDeposit, 0);
    console.log('[PASS] Concurrency overpayment protection verified: 1 succeeded (201), 1 rejected (409), total completed = ₹50,000');

    // 12. Global Deposit Ledger & Pagination API
    console.log('\n[TEST] 12. Verifying GET /approval-deposits global ledger API...');
    const ledgerRes = await request('GET', '/approval-deposits?page=1&limit=10', undefined, ownerToken);
    assert.strictEqual(ledgerRes.status, 200);
    assert.ok(Array.isArray(ledgerRes.body.data));
    assert.ok(ledgerRes.body.data.length >= 4);
    console.log('[PASS] Global deposit ledger API returned paginated records');

    console.log('\n======================================================');
    console.log('✓ ALL SPRINT 7.3 APPROVAL DEPOSIT & PAYMENT TESTS PASSED!');
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
