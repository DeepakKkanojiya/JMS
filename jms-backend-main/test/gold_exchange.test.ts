import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { ExchangeStatus, MetalType, Prisma } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string = '';
let staffToken: string = '';
let companyId: string = '';
let branchId: string = '';
let customerId: string = '';
let productId: string = '';

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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, body: data });
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

async function createDraftInvoice(grandTotal: number = 150000) {
  const invCount = await prisma.salesInvoice.count();
  const invoiceNumber = `INV-TEST-EXC-${Date.now()}-${invCount + 1}`;

  const invItem = await prisma.inventoryItem.create({
    data: {
      branchId,
      productId,
      itemCode: `ITM-EXC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      grossWeight: new Prisma.Decimal(20.0),
      netWeight: new Prisma.Decimal(18.0),
      purity: '22K',
      status: 'AVAILABLE',
    },
  });

  return prisma.salesInvoice.create({
    data: {
      invoiceNumber,
      branchId,
      customerId,
      status: 'DRAFT',
      invoiceDate: new Date(),
      subtotal: new Prisma.Decimal(grandTotal),
      grandTotal: new Prisma.Decimal(grandTotal),
      outstandingAmount: new Prisma.Decimal(grandTotal),
      metalRateLocked: true,
      pricingCalculated: true,
      items: {
        create: [
          {
            inventoryItemId: invItem.id,
            quantity: 1,
            unitPrice: new Prisma.Decimal(grandTotal),
            metalValue: new Prisma.Decimal(108000.0),
            makingChargeAmount: new Prisma.Decimal(10000.0),
            taxableAmount: new Prisma.Decimal(118000.0),
            taxAmount: new Prisma.Decimal(3540.0),
            lineTotal: new Prisma.Decimal(grandTotal),
          },
        ],
      },
    },
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SPRINT 4.6 GOLD EXCHANGE INTEGRATION TESTS');
  console.log('==================================================\n');

  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // 1. Authenticate Owner & User/Staff
      const ownerLogin = await request('POST', '/auth/login', {
        email: 'owner@jewelleryerp.com',
        password: 'Admin@123',
      });
      assert.strictEqual(ownerLogin.status, 200, 'Owner login failed');
      ownerToken = ownerLogin.body.data.accessToken;

      const staffLogin = await request('POST', '/auth/login', {
        email: 'user@erp.com',
        password: 'User@123',
      });
      assert.strictEqual(staffLogin.status, 200, 'Staff login failed');
      staffToken = staffLogin.body.data.accessToken;

      // 2. Resolve Master Setup
      const branch = await prisma.branch.findFirst();
      assert.ok(branch, 'Branch missing');
      branchId = branch.id;
      companyId = branch.companyId;

      const customer = await prisma.customer.findFirst();
      assert.ok(customer, 'Customer missing');
      customerId = customer.id;

      let prod = await prisma.product.findFirst();
      if (!prod) {
        const subCat = await prisma.productSubCategory.findFirst();
        assert.ok(subCat, 'Sub-category missing');
        prod = await prisma.product.create({
          data: {
            sku: `PROD-EXC-${Date.now()}`,
            name: 'Test Ring Product',
            subCategoryId: subCat.id,
            metalType: 'GOLD',
            purity: '22K',
          },
        });
      }
      productId = prod.id;

      // Ensure active metal rate exists and is set to 6000.0/g for GOLD 22K
      const existingRate = await prisma.metalRate.findFirst({
        where: { companyId, metalType: 'GOLD', purity: '22K', isActive: true },
      });
      if (!existingRate) {
        await prisma.metalRate.create({
          data: {
            companyId,
            metalType: 'GOLD',
            purity: '22K',
            ratePerGram: new Prisma.Decimal(6000.0),
            effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
            isActive: true,
          },
        });
      } else {
        await prisma.metalRate.updateMany({
          where: { companyId, metalType: 'GOLD', purity: '22K', isActive: true },
          data: { ratePerGram: new Prisma.Decimal(6000.0) },
        });
      }

      // TEST 1: Unauthenticated request rejected
      console.log('[TEST 1] Unauthenticated request rejected (401)');
      const unauthRes = await request('GET', '/gold-exchanges');
      assert.strictEqual(unauthRes.status, 401);
      console.log('[PASS] Unauthenticated request rejected with 401.');

      // TEST 2: RBAC Guard
      console.log('\n[TEST 2] Permission guard: Reject request without permission (403)');
      const invRbac = await createDraftInvoice();
      const rbacRes = await request(
        'POST',
        `/sales/invoices/${invRbac.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 10.0 }] },
        staffToken
      );
      assert.strictEqual(rbacRes.status, 403);
      console.log('[PASS] Permission guard verified with 403.');

      // TEST 3: Validation - Gross Weight <= 0
      console.log('\n[TEST 3] Validation: Reject gross weight <= 0 (400)');
      const invVal1 = await createDraftInvoice();
      const val1Res = await request(
        'POST',
        `/sales/invoices/${invVal1.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 0 }] },
        ownerToken
      );
      assert.strictEqual(val1Res.status, 400);
      console.log('[PASS] Gross weight <= 0 rejected with 400.');

      // TEST 4: Validation - Stone Weight > Gross Weight
      console.log('\n[TEST 4] Validation: Reject stone weight > gross weight (400)');
      const invVal2 = await createDraftInvoice();
      const val2Res = await request(
        'POST',
        `/sales/invoices/${invVal2.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 10.0, stoneWeight: 15.0 }] },
        ownerToken
      );
      assert.strictEqual(val2Res.status, 400);
      console.log('[PASS] Stone weight > gross weight rejected with 400.');

      // TEST 5: Status Guard - Non-DRAFT Invoice
      console.log('\n[TEST 5] Status Guard: Reject exchange on CONFIRMED invoice (400)');
      const invConf = await createDraftInvoice();
      await prisma.salesInvoice.update({
        where: { id: invConf.id },
        data: { status: 'CONFIRMED' },
      });
      const confRes = await request(
        'POST',
        `/sales/invoices/${invConf.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 10.0 }] },
        ownerToken
      );
      assert.strictEqual(confRes.status, 400);
      console.log('[PASS] Exchange creation on CONFIRMED invoice rejected with 400.');

      // TEST 6: Create Exchange with Multiple Items
      console.log('\n[TEST 6] Create Gold Exchange with multiple line items (201)');
      const invCreate = await createDraftInvoice();
      const createRes = await request(
        'POST',
        `/sales/invoices/${invCreate.id}/gold-exchanges`,
        {
          remarks: 'Customer 2-item old gold exchange',
          items: [
            { metalType: 'GOLD', purity: '22K', grossWeight: 20.0, stoneWeight: 2.0, deductionPercent: 5.0 },
            { metalType: 'GOLD', purity: '22K', grossWeight: 10.0, stoneWeight: 0.0, deductionPercent: 2.0 },
          ],
        },
        ownerToken
      );
      assert.strictEqual(createRes.status, 201);
      assert.strictEqual(createRes.body.data.status, 'REQUESTED');
      assert.strictEqual(createRes.body.data.items.length, 2);
      assert.strictEqual(parseFloat(createRes.body.data.items[0].netWeight), 18);
      assert.strictEqual(parseFloat(createRes.body.data.items[1].netWeight), 10);
      console.log('[PASS] Gold exchange created with 2 items successfully.');

      // TEST 7: Value Exchange & Rate Snapshot
      console.log('\n[TEST 7] Value Gold Exchange (REQUESTED -> VALUED) and snapshot rate');
      const exchangeId = createRes.body.data.id;
      const valueRes = await request('POST', `/gold-exchanges/${exchangeId}/value`, {}, ownerToken);
      assert.strictEqual(valueRes.status, 200);
      assert.strictEqual(valueRes.body.data.status, 'VALUED');
      // Item 1: 18 * 6000 = 108,000; 5% ded = 5,400; value = 102,600
      // Item 2: 10 * 6000 = 60,000; 2% ded = 1,200; value = 58,800
      // Total Gross = 30.000; Net = 28.000; Total Metal Val = 168,000; Total Ded = 6,600; Total Exc = 161,400
      assert.strictEqual(parseFloat(valueRes.body.data.totalNetWeight), 28);
      assert.strictEqual(parseFloat(valueRes.body.data.totalMetalValue), 168000);
      assert.strictEqual(parseFloat(valueRes.body.data.totalDeductionAmount), 6600);
      assert.strictEqual(parseFloat(valueRes.body.data.totalExchangeValue), 161400);
      console.log('[PASS] Gold exchange valued and metal rate snapshot applied.');

      // TEST 8: State Guard - REQUESTED -> APPLIED direct transition fail
      console.log('\n[TEST 8] State Guard: Direct REQUESTED -> APPLIED transition fail (400)');
      const invDirect = await createDraftInvoice();
      const directExc = await request(
        'POST',
        `/sales/invoices/${invDirect.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 10.0 }] },
        ownerToken
      );
      const directApplyRes = await request('POST', `/gold-exchanges/${directExc.body.data.id}/apply`, {}, ownerToken);
      assert.strictEqual(directApplyRes.status, 400);
      console.log('[PASS] Direct REQUESTED -> APPLIED rejected with 400.');

      // TEST 9: Apply Exchange to Invoice & Settlement Calculation
      console.log('\n[TEST 9] Apply VALUED exchange to DRAFT invoice (VALUED -> APPLIED)');
      const invApply = await createDraftInvoice(200000);
      const excApplyReq = await request(
        'POST',
        `/sales/invoices/${invApply.id}/gold-exchanges`,
        {
          items: [
            { metalType: 'GOLD', purity: '22K', grossWeight: 20.0, stoneWeight: 2.0, deductionPercent: 5.0 }, // net 18 * 6000 = 108k; value = 102.6k
          ],
        },
        ownerToken
      );
      const excApplyId = excApplyReq.body.data.id;
      await request('POST', `/gold-exchanges/${excApplyId}/value`, {}, ownerToken);

      const applyRes = await request('POST', `/gold-exchanges/${excApplyId}/apply`, {}, ownerToken);
      assert.strictEqual(applyRes.status, 200);
      assert.strictEqual(applyRes.body.data.exchange.status, 'APPLIED');
      assert.strictEqual(parseFloat(applyRes.body.data.invoiceSettlement.grandTotal), 200000);
      assert.strictEqual(parseFloat(applyRes.body.data.invoiceSettlement.exchangeCredit), 102600);
      assert.strictEqual(parseFloat(applyRes.body.data.invoiceSettlement.netPayable), 97400);
      assert.strictEqual(parseFloat(applyRes.body.data.invoiceSettlement.outstandingAmount), 97400);

      const invDbCheck = await prisma.salesInvoice.findUnique({ where: { id: invApply.id } });
      assert.strictEqual(parseFloat(invDbCheck?.exchangeCredit.toString() || '0'), 102600);
      assert.strictEqual(parseFloat(invDbCheck?.outstandingAmount.toString() || '0'), 97400);
      console.log('[PASS] Exchange credit applied to sales invoice successfully.');

      // TEST 10: Duplicate Apply Protection
      console.log('\n[TEST 10] Concurrency Protection: Reject duplicate apply (409 Conflict)');
      const excDup = await request(
        'POST',
        `/sales/invoices/${invApply.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 5.0 }] },
        ownerToken
      );
      const excDupId = excDup.body.data.id;
      await request('POST', `/gold-exchanges/${excDupId}/value`, {}, ownerToken);

      const dupApplyRes = await request('POST', `/gold-exchanges/${excDupId}/apply`, {}, ownerToken);
      assert.strictEqual(dupApplyRes.status, 409);
      console.log('[PASS] Duplicate apply attempt rejected with 409 Conflict.');

      // TEST 11: Cancellation Lifecycle
      console.log('\n[TEST 11] Cancel REQUESTED exchange (REQUESTED -> CANCELLED)');
      const invCancel = await createDraftInvoice();
      const excCancelReq = await request(
        'POST',
        `/sales/invoices/${invCancel.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 10.0 }] },
        ownerToken
      );
      const excCancelId = excCancelReq.body.data.id;
      const cancelRes = await request('POST', `/gold-exchanges/${excCancelId}/cancel`, {}, ownerToken);
      assert.strictEqual(cancelRes.status, 200);
      assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
      console.log('[PASS] Gold exchange cancelled successfully.');

      // TEST 12: Rate Snapshot Preservation
      console.log('\n[TEST 12] Rate Snapshot Preservation: Master rate update does not affect valued exchange');
      const invSnap = await createDraftInvoice();
      const excSnapReq = await request(
        'POST',
        `/sales/invoices/${invSnap.id}/gold-exchanges`,
        { items: [{ metalType: 'GOLD', purity: '22K', grossWeight: 10.0 }] },
        ownerToken
      );
      const excSnapId = excSnapReq.body.data.id;
      await request('POST', `/gold-exchanges/${excSnapId}/value`, {}, ownerToken);

      // Mutate master metal rate to 6500/g
      await prisma.metalRate.updateMany({
        where: { companyId, metalType: 'GOLD', purity: '22K', isActive: true },
        data: { ratePerGram: new Prisma.Decimal(6500.0) },
      });

      const snapGetRes = await request('GET', `/gold-exchanges/${excSnapId}`, null, ownerToken);
      assert.strictEqual(parseFloat(snapGetRes.body.data.items[0].ratePerGram), 6000);
      assert.strictEqual(parseFloat(snapGetRes.body.data.totalExchangeValue), 60000);

      // Restore metal rate
      await prisma.metalRate.updateMany({
        where: { companyId, metalType: 'GOLD', purity: '22K', isActive: true },
        data: { ratePerGram: new Prisma.Decimal(6000.0) },
      });
      console.log('[PASS] Rate snapshot preserved cleanly.');

      // TEST 13: Payment Settlement Integration
      console.log('\n[TEST 13] Sprint 4.5 Payment settlement integration on invoice with exchange credit');
      await prisma.salesInvoice.update({
        where: { id: invApply.id },
        data: { status: 'CONFIRMED' },
      });

      const payRes = await request(
        'POST',
        '/sales/payments',
        {
          salesInvoiceId: invApply.id,
          paymentMethod: 'UPI',
          amount: 97400,
          transactionReference: 'UPI-EXC-FULL-01',
        },
        ownerToken
      );

      assert.strictEqual(payRes.status, 201);
      assert.strictEqual(payRes.body.data.invoiceSettlement.outstandingAmount, '0.00');
      assert.strictEqual(payRes.body.data.invoiceSettlement.paymentStatus, 'PAID');
      console.log('[PASS] Payment settlement completed on invoice with exchange credit.');

      // TEST 14: Search, Filter, Pagination
      console.log('\n[TEST 14] Search, filter, and pagination APIs');
      const listRes = await request('GET', '/gold-exchanges?page=1&limit=5&sortBy=createdAt&sortOrder=desc', null, ownerToken);
      assert.strictEqual(listRes.status, 200);
      assert.strictEqual(listRes.body.success, true);
      assert.ok(Array.isArray(listRes.body.data));
      assert.strictEqual(listRes.body.pagination.page, 1);
      console.log('[PASS] Gold exchanges query API verified.');

      console.log('\n==================================================');
      console.log('ALL SPRINT 4.6 GOLD EXCHANGE TESTS PASSED 100%');
      console.log('==================================================\n');

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('\n[FAIL] Test Assertion Error:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
