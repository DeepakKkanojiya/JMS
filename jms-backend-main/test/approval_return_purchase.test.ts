import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5099;
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
      grossWeight: 20.0,
      netWeight: 19.1,
      fineWeight: 17.5,
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
    console.log('STARTING SPRINT 7.4 RETURN & PURCHASE CONFIRMATION TESTS');
    console.log('======================================================\n');

    await connectDB();
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });

    // Login as OWNER
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
    let secondCompany = await prisma.company.findFirst({ where: { companyCode: 'COMP-RET-2' } });
    if (!secondCompany) {
      secondCompany = await prisma.company.create({
        data: { companyCode: 'COMP-RET-2', name: 'Return Isolation Co 2' },
      });
    }
    secondCompanyId = secondCompany.id;

    let secondBranch = await prisma.branch.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondBranch) {
      secondBranch = await prisma.branch.create({
        data: { companyId: secondCompanyId, branchCode: 'RET-BR-2', name: 'Return Branch 2' },
      });
    }
    secondBranchId = secondBranch.id;

    let secondCustomer = await prisma.customer.findFirst({ where: { companyId: secondCompanyId } });
    if (!secondCustomer) {
      secondCustomer = await prisma.customer.create({
        data: {
          companyId: secondCompanyId,
          branchId: secondBranchId,
          customerCode: 'RET-CUST-2',
          firstName: 'Ret',
          lastName: 'Iso',
          mobile: '9900112233',
        },
      });
    }
    secondCustomerId = secondCustomer.id;

    // 1. Unauthenticated Checks
    console.log('\n[TEST] 1. Rejecting unauthenticated return & purchase requests (401)...');
    const unauthRet = await request('POST', '/approvals/00000000-0000-0000-0000-000000000000/return');
    assert.strictEqual(unauthRet.status, 401);

    const unauthPur = await request('POST', '/approvals/00000000-0000-0000-0000-000000000000/purchase');
    assert.strictEqual(unauthPur.status, 401);
    console.log('[PASS] Unauthenticated requests rejected with 401');

    // 2. RETURN WORKFLOW HAPPY PATH
    console.log('\n[TEST] 2. Testing RETURN workflow (ON_APPROVAL -> AVAILABLE)...');
    const itemRet = await createTestInventoryItem(companyId, branchId, `RET-ITEM-${Date.now()}`);
    const appRetRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        requiredDepositAmount: 20000,
        items: [{ inventoryItemId: itemRet.id, quantity: 1, unitPrice: 80000 }],
      },
      ownerToken
    );
    assert.strictEqual(appRetRes.status, 201);
    const appRetId = appRetRes.body.data.id;

    // Issue Approval
    await request('POST', `/approvals/${appRetId}/issue`, {}, ownerToken);

    // Record Deposit
    await request('POST', `/approvals/${appRetId}/deposits`, { paymentMethod: 'CASH', amount: 20000 }, ownerToken);

    // Verify item is ON_APPROVAL
    const checkItemBeforeRet = await prisma.inventoryItem.findUnique({ where: { id: itemRet.id } });
    assert.strictEqual(checkItemBeforeRet?.status, 'ON_APPROVAL');

    // Execute RETURN
    const retExecRes = await request('POST', `/approvals/${appRetId}/return`, { returnReason: 'Customer selected another piece' }, ownerToken);
    assert.strictEqual(retExecRes.status, 200);
    assert.strictEqual(retExecRes.body.data.status, 'RETURNED');

    // Verify Inventory Item status changed to AVAILABLE
    const checkItemAfterRet = await prisma.inventoryItem.findUnique({ where: { id: itemRet.id } });
    assert.strictEqual(checkItemAfterRet?.status, 'AVAILABLE');

    // Verify StockMovement logged: APPROVAL_RETURN
    const movementsRet = await prisma.stockMovement.findMany({ where: { inventoryItemId: itemRet.id } });
    const retMovement = movementsRet.find((m) => m.movementType === 'APPROVAL_RETURN');
    assert.ok(retMovement, 'APPROVAL_RETURN StockMovement must be logged');
    assert.strictEqual(retMovement.referenceType, 'SALES_APPROVAL');
    assert.strictEqual(retMovement.referenceId, appRetId);

    // Verify original deposit history preserved
    assert.strictEqual(retExecRes.body.depositSummary.completedDeposit, 20000);
    console.log('[PASS] RETURN workflow verified: ON_APPROVAL -> AVAILABLE, APPROVAL_RETURN movement logged, status = RETURNED');

    // 3. Reject Duplicate RETURN / Invalid State RETURN
    console.log('\n[TEST] 3. Rejecting duplicate RETURN attempt...');
    const dupRetRes = await request('POST', `/approvals/${appRetId}/return`, {}, ownerToken);
    assert.strictEqual(dupRetRes.status, 400);
    console.log('[PASS] Duplicate RETURN rejected with 400');

    // 4. PURCHASE WORKFLOW HAPPY PATH
    console.log('\n[TEST] 4. Testing PURCHASE workflow (ON_APPROVAL -> SOLD + SalesInvoice + Deposit Application)...');
    const itemPur = await createTestInventoryItem(companyId, branchId, `PUR-ITEM-${Date.now()}`);
    const appPurRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        requiredDepositAmount: 40000,
        items: [{ inventoryItemId: itemPur.id, quantity: 1, unitPrice: 100000 }],
      },
      ownerToken
    );
    assert.strictEqual(appPurRes.status, 201);
    const appPurId = appPurRes.body.data.id;

    // Issue Approval
    await request('POST', `/approvals/${appPurId}/issue`, {}, ownerToken);

    // Record Security Deposit ₹40,000
    await request('POST', `/approvals/${appPurId}/deposits`, { paymentMethod: 'UPI', amount: 40000, transactionReference: 'UPI-PUR-123' }, ownerToken);

    // Execute PURCHASE Conversion
    const purExecRes = await request('POST', `/approvals/${appPurId}/purchase`, { discountAmount: 0, notes: 'Customer confirmed purchase' }, ownerToken);
    assert.strictEqual(purExecRes.status, 200);
    assert.strictEqual(purExecRes.body.data.status, 'PURCHASED');

    // Verify Inventory Item status changed to SOLD
    const checkItemAfterPur = await prisma.inventoryItem.findUnique({ where: { id: itemPur.id } });
    assert.strictEqual(checkItemAfterPur?.status, 'SOLD');

    // Verify SalesInvoice created in CONFIRMED status
    const invoice = purExecRes.body.salesInvoice;
    assert.ok(invoice, 'SalesInvoice must be created');
    assert.strictEqual(invoice.status, 'CONFIRMED');
    assert.strictEqual(Number(invoice.subtotal), 100000);
    assert.strictEqual(Number(purExecRes.body.depositApplied), 40000);
    assert.strictEqual(Number(purExecRes.body.remainingBalance), Number(invoice.grandTotal) - 40000);

    // Verify StockMovement logged: SALE
    const movementsPur = await prisma.stockMovement.findMany({ where: { inventoryItemId: itemPur.id } });
    const saleMovement = movementsPur.find((m) => m.movementType === 'SALE');
    assert.ok(saleMovement, 'SALE StockMovement must be logged');
    assert.strictEqual(saleMovement.referenceType, 'SALES_INVOICE');
    assert.strictEqual(saleMovement.referenceId, invoice.id);

    // Verify SalesPayment linked to SalesInvoice
    const invoicePayments = await prisma.salesPayment.findMany({ where: { salesInvoiceId: invoice.id } });
    assert.strictEqual(invoicePayments.length, 1);
    assert.strictEqual(Number(invoicePayments[0].amount), 40000);
    console.log('[PASS] PURCHASE workflow verified: ON_APPROVAL -> SOLD, SalesInvoice created, deposit applied, SALE movement logged');

    // 5. Reject Duplicate PURCHASE / Invalid State PURCHASE
    console.log('\n[TEST] 5. Rejecting duplicate PURCHASE attempt...');
    const dupPurRes = await request('POST', `/approvals/${appPurId}/purchase`, {}, ownerToken);
    assert.strictEqual(dupPurRes.status, 400);

    const retOnPurchasedRes = await request('POST', `/approvals/${appPurId}/return`, {}, ownerToken);
    assert.strictEqual(retOnPurchasedRes.status, 400);
    console.log('[PASS] Duplicate PURCHASE and RETURN on PURCHASED approval correctly rejected');

    // 6. CONCURRENCY TEST (Simultaneous RETURN vs PURCHASE Race Condition)
    console.log('\n[TEST] 6. Verifying parallel RETURN vs PURCHASE concurrency protection (Race Condition Test)...');
    const itemRace = await createTestInventoryItem(companyId, branchId, `RACE-ITEM-${Date.now()}`);
    const appRaceRes = await request(
      'POST',
      '/approvals',
      {
        companyId,
        branchId,
        customerId,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [{ inventoryItemId: itemRace.id, quantity: 1, unitPrice: 50000 }],
      },
      ownerToken
    );
    assert.strictEqual(appRaceRes.status, 201);
    const appRaceId = appRaceRes.body.data.id;

    // Issue Approval
    await request('POST', `/approvals/${appRaceId}/issue`, {}, ownerToken);

    // Fire parallel RETURN and PURCHASE
    const [resRaceRet, resRacePur] = await Promise.all([
      request('POST', `/approvals/${appRaceId}/return`, { returnReason: 'Concurrent return' }, ownerToken),
      request('POST', `/approvals/${appRaceId}/purchase`, { notes: 'Concurrent purchase' }, ownerToken),
    ]);

    const raceStatuses = [resRaceRet.status, resRacePur.status].sort();
    assert.strictEqual(raceStatuses[0], 200, 'Exactly one concurrent request must succeed with 200');
    assert.ok(raceStatuses[1] === 400 || raceStatuses[1] === 409, `Losing concurrent request must receive 400 or 409, got ${raceStatuses[1]}`);

    // Verify final item status is either AVAILABLE or SOLD (not corrupted)
    const checkRaceItem = await prisma.inventoryItem.findUnique({ where: { id: itemRace.id } });
    assert.ok(checkRaceItem?.status === 'AVAILABLE' || checkRaceItem?.status === 'SOLD');
    console.log(`[PASS] Concurrency protection verified: 1 request succeeded (200), 1 rejected (${raceStatuses[1]}), item status = ${checkRaceItem?.status}`);

    console.log('\n======================================================');
    console.log('✓ ALL SPRINT 7.4 RETURN & PURCHASE CONFIRMATION TESTS PASSED!');
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
