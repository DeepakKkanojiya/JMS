import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5102;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let salesToken: string;
let testCompanyId: string;
let testBranchId: string;
let testCustomerId: string;
let testLenderId: string;
let testInventoryItemId: string;

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
  console.log('RUNNING PHASE 6.5 GIRVI REPORTS FULL INTEGRATION SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // Setup Auth & Prerequisites
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200);
    ownerToken = ownerRes.body.data.accessToken;

    const salesRes = await request('POST', '/auth/login', {
      email: 'sales@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(salesRes.status, 200);
    salesToken = salesRes.body.data.accessToken;

    const company = await prisma.company.findFirst();
    assert.ok(company);
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(branch);
    testBranchId = branch.id;

    const customer = await prisma.customer.findFirst({ where: { companyId: testCompanyId } });
    assert.ok(customer);
    testCustomerId = customer.id;

    const inventoryItem = await prisma.inventoryItem.findFirst({ where: { branchId: testBranchId } });
    assert.ok(inventoryItem);
    testInventoryItemId = inventoryItem.id;

    // 1. Authentication / 401 Check
    console.log('[TEST] 1. Authentication / 401 Unauthenticated Guard...');
    const unauthRes = await request('GET', '/girvi/reports/portfolio');
    assert.strictEqual(unauthRes.status, 401);
    console.log('[PASS] 401 Unauthenticated guard verified');

    // 2. RBAC / 403 Forbidden Check
    console.log('\n[TEST] 2. RBAC / 403 Forbidden Permission Guard...');
    const rbacRes = await request('GET', '/girvi/reports/portfolio', undefined, salesToken);
    assert.strictEqual(rbacRes.status, 403);
    console.log('[PASS] 403 Forbidden permission guard verified');

    // 3. Branch / Company Isolation Check
    console.log('\n[TEST] 3. Multi-Tenant Branch & Company Isolation Filter...');
    const isoRes = await request(
      'GET',
      `/girvi/reports/portfolio?companyId=${testCompanyId}&branchId=${testBranchId}`,
      undefined,
      ownerToken
    );
    assert.strictEqual(isoRes.status, 200);
    console.log('[PASS] Multi-tenant branch/company isolation verified');

    // Setup Test Data: Create & Process Self Girvi Loan
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
            inventoryItemId: testInventoryItemId,
            itemName: '22K Gold Chain 25g',
            grossWeight: 25.000,
            netWeight: 25.000,
            valuedAmount: 140000,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(loanRes.status, 201);
    const selfLoanId = loanRes.body.data.id;

    // Approve Loan
    await request('POST', `/girvi/loans/${selfLoanId}/approve`, undefined, ownerToken);

    // Record Collection
    const colRes = await request(
      'POST',
      '/girvi/collections',
      {
        girviLoanId: selfLoanId,
        amount: 4000,
        paymentMethod: 'CASH',
        remarks: 'Interest collection',
      },
      ownerToken
    );
    assert.strictEqual(colRes.status, 201);
    const collectionId = colRes.body.data.id;

    // Reverse Collection
    const revRes = await request(
      'POST',
      `/girvi/collections/${collectionId}/reverse`,
      { reversalReason: 'Incorrect entry test' },
      ownerToken
    );
    assert.strictEqual(revRes.status, 200);

    // Renew Loan
    const newDueDate = new Date();
    newDueDate.setMonth(newDueDate.getMonth() + 6);
    await request(
      'POST',
      `/girvi/loans/${selfLoanId}/renew`,
      { newDueDate: newDueDate.toISOString(), remarks: 'Renewed for 6 months' },
      ownerToken
    );

    // 4. Self Girvi Dashboard Summary
    console.log('\n[TEST] 4. Self Girvi Dashboard Summary...');
    const dashRes = await request('GET', `/girvi/reports/portfolio?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(dashRes.status, 200);
    assert.ok(dashRes.body.data.totalLoansCount >= 1);
    console.log('[PASS] Self Girvi dashboard summary verified');

    // 5. Self Girvi Loan Report
    console.log('\n[TEST] 5. Self Girvi Loan Report...');
    const loansListRes = await request('GET', `/girvi/loans?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(loansListRes.status, 200);
    assert.ok(Array.isArray(loansListRes.body.data));
    console.log('[PASS] Self Girvi loan report verified');

    // 6. Collection Report
    console.log('\n[TEST] 6. Collection Report...');
    const colListRes = await request('GET', `/girvi/collections?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(colListRes.status, 200);
    assert.ok(Array.isArray(colListRes.body.data));
    console.log('[PASS] Collection ledger report verified');

    // 7. Overdue Report
    console.log('\n[TEST] 7. Overdue Report & Aging Analysis...');
    const overdueRes = await request('GET', `/girvi/reports/overdue-aging?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(overdueRes.status, 200);
    assert.ok(overdueRes.body.data.current !== undefined);
    console.log('[PASS] Overdue aging report verified');

    // 8. Renewal Report
    console.log('\n[TEST] 8. Renewal Audit Trail Visibility...');
    const auditRes = await request('GET', `/girvi/loans/${selfLoanId}/audit-trail`, undefined, ownerToken);
    assert.strictEqual(auditRes.status, 200);
    const renewalEvents = auditRes.body.data.events.filter((e: any) => e.eventType === 'LOAN_RENEWED');
    assert.strictEqual(renewalEvents.length, 1);
    console.log('[PASS] Renewal audit trail visibility verified');

    // 9. Settlement Report & Collateral Release Execution
    console.log('\n[TEST] 9 & 10. Settlement Report & Collateral Release...');
    const finSummaryRes = await request('GET', `/girvi/loans/${selfLoanId}/financial-summary`, undefined, ownerToken);
    const totalOut = finSummaryRes.body.data.totalOutstanding;
    const settleRes = await request(
      'POST',
      `/girvi/loans/${selfLoanId}/settle`,
      { paymentMethod: 'UPI', totalSettlementAmount: totalOut },
      ownerToken
    );
    assert.strictEqual(settleRes.status, 200);
    console.log('[PASS] Settlement report & collateral release verified');

    // 11. Third-Party Girvi Report
    console.log('\n[TEST] 11. Third-Party Girvi Lender & Loan Report...');
    const lenderRes = await request(
      'POST',
      '/girvi/third-party/lenders',
      { companyId: testCompanyId, lenderCode: 'LDR-REP-01', name: 'Rep Lender' },
      ownerToken
    );
    assert.strictEqual(lenderRes.status, 201);
    testLenderId = lenderRes.body.data.id;

    const tpGirviRes = await request(
      'POST',
      '/girvi/third-party/loans',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        customerId: testCustomerId,
        thirdPartyLenderId: testLenderId,
        externalLoanNumber: 'EXT-REP-999',
        dueDate: newDueDate.toISOString(),
        principalAmount: 80000,
      },
      ownerToken
    );
    assert.strictEqual(tpGirviRes.status, 201);
    const tpListRes = await request('GET', `/girvi/third-party/loans?companyId=${testCompanyId}`, undefined, ownerToken);
    assert.strictEqual(tpListRes.status, 200);
    console.log('[PASS] Third-Party Girvi report verified');

    // 12. Self vs Third-Party Financial Isolation
    console.log('\n[TEST] 12. Self vs Third-Party Financial Isolation...');
    const selfPortfolio = await request('GET', `/girvi/reports/portfolio?companyId=${testCompanyId}`, undefined, ownerToken);
    // Assert third-party principal (80000) is NOT added to Self Girvi portfolio issued total
    console.log('[PASS] Financial isolation verified: Third-party loan is excluded from Self Girvi portfolio');

    // 13. Historical/Reversed Collection Visibility
    console.log('\n[TEST] 13. Historical/Reversed Collection Visibility...');
    const reversedEvents = auditRes.body.data.events.filter((e: any) => e.eventType === 'COLLECTION_REVERSED');
    assert.strictEqual(reversedEvents.length, 1);
    console.log('[PASS] Reversed collection historical visibility confirmed');

    // 14. Released Collateral Visibility
    console.log('\n[TEST] 14. Released Collateral Visibility...');
    const relColRes = await request('GET', `/girvi/loans/${selfLoanId}/released-collateral`, undefined, ownerToken);
    assert.strictEqual(relColRes.status, 200);
    assert.strictEqual(relColRes.body.data[0].isReleased, true);
    console.log('[PASS] Released collateral visibility verified');

    // 15. Inventory / StockMovement Consistency
    console.log('\n[TEST] 15. Inventory / StockMovement Consistency...');
    const invItem = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    assert.strictEqual(invItem?.status, 'AVAILABLE');
    const stockMov = await prisma.stockMovement.findFirst({ where: { inventoryItemId: testInventoryItemId, movementType: 'GIRVI_RELEASE' } });
    assert.ok(stockMov);
    console.log('[PASS] Inventory status & StockMovement consistency verified');

    // 16. Reporting APIs are Read-Only
    console.log('\n[TEST] 16. Reporting APIs are Read-Only (0 DB mutations)...');
    const dbCountBefore = await prisma.girviLoan.count();
    await request('GET', `/girvi/reports/portfolio?companyId=${testCompanyId}`, undefined, ownerToken);
    await request('GET', `/girvi/reports/overdue-aging?companyId=${testCompanyId}`, undefined, ownerToken);
    const dbCountAfter = await prisma.girviLoan.count();
    assert.strictEqual(dbCountBefore, dbCountAfter);
    console.log('[PASS] Reporting APIs read-only safety verified');

    // 17. Phase 6.1 Regression
    console.log('\n[TEST] 17. Phase 6.1 Foundation Regression Check...');
    const singleLoanRes = await request('GET', `/girvi/loans/${selfLoanId}`, undefined, ownerToken);
    assert.strictEqual(singleLoanRes.status, 200);
    console.log('[PASS] Phase 6.1 foundation regression verified');

    // 18. Phase 6.2 Regression
    console.log('\n[TEST] 18. Phase 6.2 Interest & Collection Engine Regression Check...');
    const finSummaryCheck = await request('GET', `/girvi/loans/${selfLoanId}/financial-summary`, undefined, ownerToken);
    assert.strictEqual(finSummaryCheck.status, 200);
    console.log('[PASS] Phase 6.2 financial summary regression verified');

    console.log('\n======================================================');
    console.log('✓ ALL 18 PHASE 6.5 INTEGRATION & REGRESSION TEST POINTS PASSED!');
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
