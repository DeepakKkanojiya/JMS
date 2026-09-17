import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { PaymentMethod, PaymentStatus, MetalType } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string = '';
let companyId: string = '';
let branchId: string = '';
let customerId: string = '';
let inventoryItemId1: string = '';
let inventoryItemId2: string = '';

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

async function runSalesPaymentTests() {
  console.log('\n==================================================');
  console.log('STARTING SPRINT 4.5 PAYMENT PROCESSING & SALES SETTLEMENT TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });

    // 1. Login
    console.log('[SETUP] Logging in as Owner...');
    const loginRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(loginRes.status, 200, 'Owner login failed');
    ownerToken = loginRes.body.data.accessToken;

    // 2. Fetch seed company, branch, customer
    const branchRes = await request('GET', '/branches', null, ownerToken);
    branchId = branchRes.body.data[0].id;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    companyId = branch!.companyId;

    const custRes = await request('GET', '/customers', null, ownerToken);
    customerId = custRes.body.data[0].id;

    // 3. Create active metal rate & tax rate
    const pastDate = new Date('2026-01-01T00:00:00.000Z');
    const futureDate = new Date('2030-01-01T00:00:00.000Z');

    const metalCode = `GOLD_PAY_${Date.now()}`;
    await prisma.metalRate.create({
      data: {
        companyId,
        metalType: MetalType.GOLD,
        purity: metalCode,
        ratePerGram: 6000.00,
        effectiveFrom: pastDate,
        effectiveTo: futureDate,
        isActive: true,
      },
    });

    await prisma.taxRate.create({
      data: {
        companyId,
        taxName: 'GST 3%',
        taxCode: `GST_PAY_${Date.now()}`,
        rate: 3.0,
        effectiveFrom: pastDate,
        effectiveTo: futureDate,
        isActive: true,
      },
    });

    // Helper function to create fresh available inventory items per test case
    async function createTestItem(weight: number = 10.000) {
      const subCat = await prisma.productSubCategory.findFirst();
      const prod = await prisma.product.create({
        data: {
          subCategoryId: subCat!.id,
          name: `Payment Test Necklace ${Date.now()}_${Math.random()}`,
          sku: `PAY-NCK-${Date.now()}_${Math.random()}`,
          metalType: MetalType.GOLD,
          purity: metalCode,
        },
      });

      return prisma.inventoryItem.create({
        data: {
          branchId,
          productId: prod.id,
          itemCode: `PAY-CODE-${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          purity: metalCode,
          grossWeight: weight,
          netWeight: weight,
          status: 'AVAILABLE',
        },
      });
    }

    // ==================================================
    // TEST CASES
    // ==================================================

    console.log('[TEST 1] Authentication Guard: Reject payment creation without token (401)');
    const t1 = await request('POST', '/sales/payments', {
      salesInvoiceId: '00000000-0000-0000-0000-000000000000',
      paymentMethod: 'CASH',
      amount: 1000,
    });
    assert.strictEqual(t1.status, 401);
    assert.strictEqual(t1.body.success, false);
    console.log('[PASS] Unauthenticated payment creation rejected with 401.');

    console.log('\n[TEST 2] Validation Guard: Reject zero or negative payment amounts (400)');
    const t2 = await request('POST', '/sales/payments', {
      salesInvoiceId: '00000000-0000-0000-0000-000000000000',
      paymentMethod: 'CASH',
      amount: 0,
    }, ownerToken);
    assert.strictEqual(t2.status, 400);
    assert.strictEqual(t2.body.success, false);
    console.log('[PASS] Zero payment amount rejected with 400.');

    console.log('\n[TEST 3] Status Guard: Reject payment on DRAFT sales invoice (400)');
    const item3 = await createTestItem(10.0);
    const draftRes = await request('POST', '/sales/invoices', {
      customerId,
      branchId,
      items: [{ inventoryItemId: item3.id, unitPrice: 60000.00 }],
    }, ownerToken);
    assert.strictEqual(draftRes.status, 201);
    const draftInvoiceId = draftRes.body.data.id;

    const t3 = await request('POST', '/sales/payments', {
      salesInvoiceId: draftInvoiceId,
      paymentMethod: 'CASH',
      amount: 1000.00,
    }, ownerToken);
    assert.strictEqual(t3.status, 400);
    assert.strictEqual(t3.body.success, false);
    assert.ok(t3.body.message.includes('CONFIRMED'));
    console.log('[PASS] Payment on DRAFT invoice rejected with 400 Bad Request.');

    console.log('\n[TEST 4] Full Payment Lifecycle: Split Payments (Cash + UPI + Card) & Status Transitions');
    const item4 = await createTestItem(10.0);
    const invRes = await request('POST', '/sales/invoices', {
      customerId,
      branchId,
      items: [{ inventoryItemId: item4.id, unitPrice: 60000.00 }],
    }, ownerToken);
    assert.strictEqual(invRes.status, 201);
    const invoiceId = invRes.body.data.id;

    await request('POST', `/sales/invoices/${invoiceId}/lock-metal-rate`, {}, ownerToken);
    const priceRes = await request('POST', `/sales/invoices/${invoiceId}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    assert.strictEqual(priceRes.status, 200);
    const grandTotal = Number(priceRes.body.data.grandTotal);
    assert.ok(grandTotal > 0, 'Grand total must be positive');

    const confirmRes = await request('POST', `/sales/invoices/${invoiceId}/confirm`, {}, ownerToken);
    assert.strictEqual(confirmRes.status, 200);
    assert.strictEqual(confirmRes.body.data.paymentStatus, 'UNPAID');

    // Payment 1: Partial CASH payment ₹10,000
    const cashRes = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId,
      paymentMethod: 'CASH',
      amount: 10000.00,
      remarks: 'First partial cash payment',
    }, ownerToken);
    assert.strictEqual(cashRes.status, 201);
    assert.strictEqual(cashRes.body.data.status, 'COMPLETED');
    assert.strictEqual(cashRes.body.data.invoiceSettlement.paymentStatus, 'PARTIALLY_PAID');
    assert.strictEqual(cashRes.body.data.invoiceSettlement.totalPaid, '10000.00');

    // Payment 2: Partial UPI payment ₹20,000
    const upiRes = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId,
      paymentMethod: 'UPI',
      amount: 20000.00,
      transactionReference: 'UPI-REF-12345',
      remarks: 'Second partial UPI payment',
    }, ownerToken);
    assert.strictEqual(upiRes.status, 201);
    assert.strictEqual(upiRes.body.data.invoiceSettlement.paymentStatus, 'PARTIALLY_PAID');
    assert.strictEqual(upiRes.body.data.invoiceSettlement.totalPaid, '30000.00');

    // Payment 3: Final CARD payment to settle remaining balance exactly
    const remainingBalance = grandTotal - 30000.00;
    const cardRes = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId,
      paymentMethod: 'CARD',
      amount: remainingBalance,
      transactionReference: 'CARD-REF-999',
      remarks: 'Final settlement card payment',
    }, ownerToken);
    assert.strictEqual(cardRes.status, 201);
    assert.strictEqual(cardRes.body.data.invoiceSettlement.paymentStatus, 'PAID');
    assert.strictEqual(cardRes.body.data.invoiceSettlement.outstandingAmount, '0.00');
    console.log(`[PASS] Invoice ${invoiceId} settled from UNPAID -> PARTIALLY_PAID -> PAID with split payments.`);

    console.log('\n[TEST 5] Overpayment Guard: Reject payment exceeding outstanding balance (409 Conflict)');
    const item5 = await createTestItem(5.0);
    const invRes2 = await request('POST', '/sales/invoices', {
      customerId,
      branchId,
      items: [{ inventoryItemId: item5.id, unitPrice: 30000.00 }],
    }, ownerToken);
    const invoiceId2 = invRes2.body.data.id;
    await request('POST', `/sales/invoices/${invoiceId2}/lock-metal-rate`, {}, ownerToken);
    await request('POST', `/sales/invoices/${invoiceId2}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    await request('POST', `/sales/invoices/${invoiceId2}/confirm`, {}, ownerToken);

    const invoiceDB = await prisma.salesInvoice.findUnique({ where: { id: invoiceId2 } });
    const totalAmount = Number(invoiceDB!.grandTotal);

    const fullPay = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId2,
      paymentMethod: 'CHEQUE',
      amount: totalAmount,
    }, ownerToken);
    assert.strictEqual(fullPay.status, 201);

    const overPayRes = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId2,
      paymentMethod: 'CASH',
      amount: 1000.00,
    }, ownerToken);

    assert.strictEqual(overPayRes.status, 409);
    assert.strictEqual(overPayRes.body.success, false);
    assert.ok(overPayRes.body.message.includes('exceeds remaining outstanding amount'));
    console.log('[PASS] Overpayment attempt rejected with 409 Conflict.');

    console.log('\n[TEST 6] Payment Reversal & Status Recalculation (PAID -> PARTIALLY_PAID)');
    const item6 = await createTestItem(10.0);
    const invRes3 = await request('POST', '/sales/invoices', {
      customerId,
      branchId,
      items: [{ inventoryItemId: item6.id, unitPrice: 60000.00 }],
    }, ownerToken);
    const invoiceId3 = invRes3.body.data.id;
    await request('POST', `/sales/invoices/${invoiceId3}/lock-metal-rate`, {}, ownerToken);
    const priceRes3 = await request('POST', `/sales/invoices/${invoiceId3}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    await request('POST', `/sales/invoices/${invoiceId3}/confirm`, {}, ownerToken);
    const grandTotal3 = Number(priceRes3.body.data.grandTotal);

    const p1 = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId3,
      paymentMethod: 'BANK_TRANSFER',
      amount: 20000.00,
    }, ownerToken);
    assert.strictEqual(p1.status, 201);

    const remaining3 = grandTotal3 - 20000.00;
    const p2 = await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId3,
      paymentMethod: 'CHEQUE',
      amount: remaining3,
    }, ownerToken);
    assert.strictEqual(p2.status, 201);
    const chequePaymentId = p2.body.data.id;

    let invCheck3 = await prisma.salesInvoice.findUnique({ where: { id: invoiceId3 } });
    assert.strictEqual(invCheck3?.paymentStatus, 'PAID');

    const reverseRes = await request('POST', `/sales/payments/${chequePaymentId}/reverse`, {
      reversalReason: 'Cheque bounced due to insufficient funds',
    }, ownerToken);

    assert.strictEqual(reverseRes.status, 200);
    assert.strictEqual(reverseRes.body.data.status, 'REVERSED');
    assert.strictEqual(reverseRes.body.data.reversalReason, 'Cheque bounced due to insufficient funds');
    assert.strictEqual(reverseRes.body.data.invoiceSettlement.paymentStatus, 'PARTIALLY_PAID');
    assert.strictEqual(reverseRes.body.data.invoiceSettlement.totalPaid, '20000.00');

    const paymentInDB = await prisma.salesPayment.findUnique({ where: { id: chequePaymentId } });
    assert.ok(paymentInDB, 'Reversed payment must be preserved in DB for audit');
    assert.strictEqual(paymentInDB.status, PaymentStatus.REVERSED);
    console.log('[PASS] Payment reversal executed cleanly and invoice status recalculated to PARTIALLY_PAID.');

    console.log('\n[TEST 7] Invoice Payment History & Summary APIs');
    const item7 = await createTestItem(10.0);
    const invRes4 = await request('POST', '/sales/invoices', {
      customerId,
      branchId,
      items: [{ inventoryItemId: item7.id, unitPrice: 60000.00 }],
    }, ownerToken);
    const invoiceId4 = invRes4.body.data.id;
    await request('POST', `/sales/invoices/${invoiceId4}/lock-metal-rate`, {}, ownerToken);
    await request('POST', `/sales/invoices/${invoiceId4}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    await request('POST', `/sales/invoices/${invoiceId4}/confirm`, {}, ownerToken);

    await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId4,
      paymentMethod: 'CASH',
      amount: 15000.00,
    }, ownerToken);

    await request('POST', '/sales/payments', {
      salesInvoiceId: invoiceId4,
      paymentMethod: 'UPI',
      amount: 10000.00,
    }, ownerToken);

    const historyRes = await request('GET', `/sales/invoices/${invoiceId4}/payments`, null, ownerToken);
    assert.strictEqual(historyRes.status, 200);
    assert.strictEqual(historyRes.body.data.length, 2);

    const summaryRes = await request('GET', `/sales/invoices/${invoiceId4}/payment-summary`, null, ownerToken);
    assert.strictEqual(summaryRes.status, 200);
    assert.strictEqual(summaryRes.body.data.payments.cash, '15000.00');
    assert.strictEqual(summaryRes.body.data.payments.upi, '10000.00');
    assert.strictEqual(summaryRes.body.data.totalPaid, '25000.00');
    console.log('[PASS] Invoice payment history and summary APIs verified.');

    console.log('\n[TEST 8] Race Condition & Concurrent Payment Protection');
    const item8 = await createTestItem(5.0);
    const invRes5 = await request('POST', '/sales/invoices', {
      customerId,
      branchId,
      items: [{ inventoryItemId: item8.id, unitPrice: 30000.00 }],
    }, ownerToken);
    const invoiceId5 = invRes5.body.data.id;
    await request('POST', `/sales/invoices/${invoiceId5}/lock-metal-rate`, {}, ownerToken);
    const priceRes5 = await request('POST', `/sales/invoices/${invoiceId5}/calculate-pricing`, { taxType: 'INTRA_STATE' }, ownerToken);
    await request('POST', `/sales/invoices/${invoiceId5}/confirm`, {}, ownerToken);
    const grandTotal5 = Number(priceRes5.body.data.grandTotal);

    const [r1, r2] = await Promise.all([
      request('POST', '/sales/payments', { salesInvoiceId: invoiceId5, paymentMethod: 'CASH', amount: grandTotal5 }, ownerToken),
      request('POST', '/sales/payments', { salesInvoiceId: invoiceId5, paymentMethod: 'UPI', amount: grandTotal5 }, ownerToken),
    ]);

    const statuses = [r1.status, r2.status].sort();
    console.log(`[RACE TEST] Concurrent payment status codes: ${statuses.join(', ')}`);
    assert.deepStrictEqual(statuses, [201, 409], 'Exactly 1 concurrent payment must succeed and 1 fail with 409');

    const invCheck5 = await prisma.salesInvoice.findUnique({ where: { id: invoiceId5 } });
    assert.strictEqual(invCheck5?.paymentStatus, 'PAID');
    assert.strictEqual(Number(invCheck5?.totalPaid), grandTotal5);
    assert.strictEqual(Number(invCheck5?.outstandingAmount), 0);
    console.log('[PASS] Concurrent payment protection verified. Zero overpayments allowed.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 4.5 PAYMENT PROCESSING TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n[TEST FAILURE]', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    await disconnectDB();
  }
}

runSalesPaymentTests();
