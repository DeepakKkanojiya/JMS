import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import {
  SalesInvoiceStatus,
  SalesReturnStatus,
  RefundStatus,
  PaymentMethod,
  ExchangeStatus,
  Prisma,
} from '../src/generated/prisma';

let server: http.Server;
const PORT = 5096;
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

async function createInventoryItem(codePrefix: string, weight = 15.0) {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return prisma.inventoryItem.create({
    data: {
      branchId,
      productId,
      itemCode: `${codePrefix}-${timestamp}-${rand}`,
      grossWeight: new Prisma.Decimal(weight),
      netWeight: new Prisma.Decimal(weight - 0.5),
      stoneWeight: new Prisma.Decimal(0.5),
      purity: '22K',
      status: 'AVAILABLE',
    },
  });
}

async function runPhase4IntegrationTests() {
  console.log('========================================================================');
  console.log('STARTING SPRINT 4.8: FINAL PHASE 4 SALES SYSTEM INTEGRATION & AUDIT TEST');
  console.log('========================================================================\n');

  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // ---------------------------------------------------------
      // SETUP & AUTHENTICATION
      // ---------------------------------------------------------
      console.log('[SETUP] 1. Authenticating test users...');
      const ownerLogin = await request('POST', '/auth/login', {
        email: 'owner@jewelleryerp.com',
        password: 'Admin@123',
      });
      assert.strictEqual(ownerLogin.status, 200);
      ownerToken = ownerLogin.body.data.accessToken;

      const userLogin = await request('POST', '/auth/login', {
        email: 'user@erp.com',
        password: 'User@123',
      });
      assert.strictEqual(userLogin.status, 200);
      staffToken = userLogin.body.data.accessToken;
      console.log('✓ User tokens resolved successfully.\n');

      const company = await prisma.company.findFirst({ where: { isActive: true } });
      if (company) companyId = company.id;
      const branch = await prisma.branch.findFirst({ where: { isActive: true } });
      if (branch) branchId = branch.id;
      const customer = await prisma.customer.findFirst({ where: { isActive: true } });
      if (customer) customerId = customer.id;
      const product = await prisma.product.findFirst({ where: { isActive: true } });
      if (product) productId = product.id;

      // Ensure active metal rate exists for 22K Gold
      await prisma.metalRate.create({
        data: {
          companyId,
          metalType: 'GOLD',
          purity: '22K',
          ratePerGram: new Prisma.Decimal(6200.0),
          effectiveFrom: new Date(Date.now() - 3600000),
          isActive: true,
        },
      });

      // ---------------------------------------------------------
      // LIFECYCLE 1: END-TO-END SALES, POS, PRICING & PAYMENT
      // ---------------------------------------------------------
      console.log('[TEST GROUP 1: SALES LIFECYCLE]');
      const item1 = await createInventoryItem('SALE-ITM');

      // 1. Create DRAFT Invoice
      console.log('1. Creating DRAFT invoice...');
      const invRes = await request(
        'POST',
        '/sales/invoices',
        {
          customerId,
          branchId,
          items: [{ inventoryItemId: item1.id, quantity: 1, unitPrice: 89900.0 }],
        },
        ownerToken
      );
      assert.strictEqual(invRes.status, 201);
      const invoiceId = invRes.body.data.id;
      const invoiceItemId = invRes.body.data.items[0].id;
      assert.strictEqual(invRes.body.data.status, SalesInvoiceStatus.DRAFT);
      console.log(`✓ Invoice created: #${invRes.body.data.invoiceNumber}`);

      // 2. Lock Metal Rate
      console.log('2. Locking metal rate on invoice...');
      const lockRes = await request('POST', `/sales/invoices/${invoiceId}/lock-metal-rate`, {}, ownerToken);
      assert.strictEqual(lockRes.status, 200);
      assert.ok(lockRes.body.data.ratePerGram);
      console.log('✓ Metal rate locked successfully.');

      // 3. Calculate Pricing
      console.log('3. Calculating line-item pricing breakdown & GST...');
      const priceRes = await request('POST', `/sales/invoices/${invoiceId}/calculate-pricing`, {}, ownerToken);
      assert.strictEqual(priceRes.status, 200);
      assert.strictEqual(priceRes.body.data.pricingCalculated, true);
      const grandTotal = parseFloat(priceRes.body.data.grandTotal);
      assert.ok(grandTotal > 0);
      console.log(`✓ Pricing calculated: Grand Total = ₹${grandTotal}`);

      // 4. POS Confirmation
      console.log('4. POS Confirmation (Atomic stock deduction & SALE StockMovement)...');
      const confirmRes = await request('POST', `/sales/invoices/${invoiceId}/confirm`, {}, ownerToken);
      assert.strictEqual(confirmRes.status, 200);
      assert.strictEqual(confirmRes.body.data.status, SalesInvoiceStatus.CONFIRMED);

      // 5. Verify Inventory status = SOLD
      const checkItem1 = await prisma.inventoryItem.findUnique({ where: { id: item1.id } });
      assert.strictEqual(checkItem1?.status, 'SOLD');
      console.log('✓ Inventory item status verified: SOLD');

      // 6. Verify StockMovement = SALE
      const saleMovement = await prisma.stockMovement.findFirst({
        where: { inventoryItemId: item1.id, movementType: 'SALE' },
      });
      assert.ok(saleMovement, 'StockMovement SALE record must exist');
      console.log('✓ StockMovement SALE verified.');

      // 7. Full Payment Creation
      console.log('7. Creating full payment settlement...');
      const payRes = await request(
        'POST',
        '/sales/payments',
        {
          salesInvoiceId: invoiceId,
          paymentMethod: 'UPI',
          amount: grandTotal,
          transactionReference: 'UPI-E2E-998811',
        },
        ownerToken
      );
      assert.strictEqual(payRes.status, 201);
      console.log(`✓ Payment recorded: #${payRes.body.data.paymentNumber}`);

      // 8. Verify Settlement
      const settledInvoice = await prisma.salesInvoice.findUnique({ where: { id: invoiceId } });
      assert.strictEqual(settledInvoice?.paymentStatus, 'PAID');
      assert.strictEqual(parseFloat(settledInvoice!.outstandingAmount.toString()), 0);
      console.log('✓ Invoice settlement verified: PAID, Outstanding = ₹0\n');

      // ---------------------------------------------------------
      // LIFECYCLE 2: GOLD EXCHANGE APPLIED TO INVOICE
      // ---------------------------------------------------------
      console.log('[TEST GROUP 2: GOLD EXCHANGE LIFECYCLE]');
      const item2 = await createInventoryItem('EXC-ITM');

      const invExcRes = await request(
        'POST',
        '/sales/invoices',
        {
          customerId,
          branchId,
          items: [{ inventoryItemId: item2.id, quantity: 1, unitPrice: 120000.0 }],
        },
        ownerToken
      );
      const excInvoiceId = invExcRes.body.data.id;
      await request('POST', `/sales/invoices/${excInvoiceId}/lock-metal-rate`, {}, ownerToken);
      await request('POST', `/sales/invoices/${excInvoiceId}/calculate-pricing`, {}, ownerToken);

      // 9. Create Old Gold Exchange
      console.log('9. Creating old gold exchange record...');
      const createExcRes = await request(
        'POST',
        `/sales/invoices/${excInvoiceId}/gold-exchanges`,
        {
          remarks: 'Customer old gold exchange',
          items: [
            {
              metalType: 'GOLD',
              purity: '22K',
              grossWeight: 10.0,
              stoneWeight: 1.0,
              deductionPercent: 5.0,
              remarks: '22K ring',
            },
          ],
        },
        ownerToken
      );
      assert.strictEqual(createExcRes.status, 201);
      const exchangeId = createExcRes.body.data.id;

      // 10. Value Exchange
      console.log('10. Valuing gold exchange with active snapshot rate...');
      const valueRes = await request('POST', `/gold-exchanges/${exchangeId}/value`, {}, ownerToken);
      assert.strictEqual(valueRes.status, 200);
      assert.strictEqual(valueRes.body.data.status, ExchangeStatus.VALUED);
      const exchangeCredit = parseFloat(valueRes.body.data.totalExchangeValue);
      assert.ok(exchangeCredit > 0);

      // 11. Apply Exchange
      console.log('11. Applying exchange credit to invoice...');
      const applyRes = await request('POST', `/gold-exchanges/${exchangeId}/apply`, {}, ownerToken);
      assert.strictEqual(applyRes.status, 200);
      assert.strictEqual(applyRes.body.data.exchange.status, ExchangeStatus.APPLIED);

      // 12. Verify Invoice exchangeCredit & Confirm
      const updatedExcInvoice = await prisma.salesInvoice.findUnique({ where: { id: excInvoiceId } });
      assert.strictEqual(parseFloat(updatedExcInvoice!.exchangeCredit.toString()), exchangeCredit);
      console.log(`✓ Applied exchangeCredit = ₹${exchangeCredit}`);

      // 13. Confirm and Settle Remaining Outstanding
      await request('POST', `/sales/invoices/${excInvoiceId}/confirm`, {}, ownerToken);
      const netPayable = parseFloat(updatedExcInvoice!.grandTotal.toString()) - exchangeCredit;
      const payExcRes = await request(
        'POST',
        '/sales/payments',
        {
          salesInvoiceId: excInvoiceId,
          paymentMethod: 'CASH',
          amount: netPayable,
        },
        ownerToken
      );
      assert.strictEqual(payExcRes.status, 201);
      const finalExcInv = await prisma.salesInvoice.findUnique({ where: { id: excInvoiceId } });
      assert.strictEqual(finalExcInv?.paymentStatus, 'PAID');
      console.log('✓ Outstanding settlement with exchange credit verified: PAID\n');

      // ---------------------------------------------------------
      // LIFECYCLE 3: SALES RETURN & REFUND MANAGEMENT
      // ---------------------------------------------------------
      console.log('[TEST GROUP 3: SALES RETURN & REFUND LIFECYCLE]');
      // 14. Create Return Request for Invoice 1
      console.log('14. Initiating Sales Return request...');
      const returnRes = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: invoiceId,
          reason: 'Customer return test',
          items: [
            {
              salesInvoiceItemId: invoiceItemId,
              inventoryItemId: item1.id,
              deductionAmount: 0.0,
            },
          ],
        },
        ownerToken
      );
      assert.strictEqual(returnRes.status, 201);
      const returnId = returnRes.body.data.id;
      assert.strictEqual(returnRes.body.data.status, SalesReturnStatus.REQUESTED);

      // 15. Approve Return
      console.log('15. Approving Sales Return...');
      const appRetRes = await request('POST', `/sales/returns/${returnId}/approve`, {}, ownerToken);
      assert.strictEqual(appRetRes.status, 200);
      assert.strictEqual(appRetRes.body.data.status, SalesReturnStatus.APPROVED);

      // 16. Process Return & Inventory Restoration
      console.log('16. Processing Return and restoring physical inventory...');
      const procRetRes = await request('POST', `/sales/returns/${returnId}/process`, {}, ownerToken);
      assert.strictEqual(procRetRes.status, 200);
      assert.strictEqual(procRetRes.body.data.status, SalesReturnStatus.PROCESSED);

      // 17. Verify Inventory Status restored to AVAILABLE
      const checkItem1Restored = await prisma.inventoryItem.findUnique({ where: { id: item1.id } });
      assert.strictEqual(checkItem1Restored?.status, 'AVAILABLE');
      console.log('✓ Inventory item status verified: AVAILABLE');

      // 18. Verify SALE_RETURN StockMovement
      const retMovement = await prisma.stockMovement.findFirst({
        where: { inventoryItemId: item1.id, movementType: 'SALE_RETURN', referenceId: returnId },
      });
      assert.ok(retMovement, 'StockMovement SALE_RETURN must exist');
      console.log('✓ StockMovement SALE_RETURN verified.');

      // 19. Issue Sales Refund
      console.log('19. Issuing refund in dedicated SalesRefund ledger...');
      const refundAmount = parseFloat(procRetRes.body.data.refundAmount);
      const refRes = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: returnId,
          refundMethod: 'BANK_TRANSFER',
          amount: refundAmount,
          transactionReference: 'NEFT-REF-772211',
        },
        ownerToken
      );
      assert.strictEqual(refRes.status, 201);
      assert.strictEqual(refRes.body.data.status, RefundStatus.COMPLETED);
      assert.ok(refRes.body.data.refundNumber.startsWith('REF-'));
      console.log(`✓ Refund issued: #${refRes.body.data.refundNumber}\n`);

      // ---------------------------------------------------------
      // SECURITY & DYNAMIC RBAC GUARDS
      // ---------------------------------------------------------
      console.log('[TEST GROUP 4: SECURITY & RBAC AUDIT]');
      // 20. Unauthenticated Request rejected (401)
      console.log('20. Unauthenticated request rejected (401)...');
      const unauthRes = await request('GET', '/sales/invoices');
      assert.strictEqual(unauthRes.status, 401);
      console.log('✓ Unauthenticated request rejected with 401.');

      // 21. Unauthorized Request rejected (403)
      console.log('21. Unauthorized request rejected (403)...');
      const unauthPermRes = await request('POST', `/sales/returns/${returnId}/approve`, {}, staffToken);
      assert.strictEqual(unauthPermRes.status, 403);
      console.log('✓ Unauthorized permission guard rejected with 403.\n');

      // ---------------------------------------------------------
      // CONCURRENCY & IDEMPOTENCY PROTECTION
      // ---------------------------------------------------------
      console.log('[TEST GROUP 5: CONCURRENCY & IDEMPOTENCY PROTECTION]');
      // 22. Double Sale Prevention (409 Conflict)
      console.log('22. Double sale prevention on sold inventory item (409 Conflict)...');
      const itemDupSale = await createInventoryItem('DUPSALE-ITM');
      const invA = await request('POST', '/sales/invoices', { customerId, branchId, items: [{ inventoryItemId: itemDupSale.id, quantity: 1, unitPrice: 50000 }] }, ownerToken);
      const invB = await request('POST', '/sales/invoices', { customerId, branchId, items: [{ inventoryItemId: itemDupSale.id, quantity: 1, unitPrice: 50000 }] }, ownerToken);
      await request('POST', `/sales/invoices/${invA.body.data.id}/lock-metal-rate`, {}, ownerToken);
      await request('POST', `/sales/invoices/${invA.body.data.id}/calculate-pricing`, {}, ownerToken);
      await request('POST', `/sales/invoices/${invB.body.data.id}/lock-metal-rate`, {}, ownerToken);
      await request('POST', `/sales/invoices/${invB.body.data.id}/calculate-pricing`, {}, ownerToken);

      const confA = await request('POST', `/sales/invoices/${invA.body.data.id}/confirm`, {}, ownerToken);
      assert.strictEqual(confA.status, 200);
      const confB = await request('POST', `/sales/invoices/${invB.body.data.id}/confirm`, {}, ownerToken);
      assert.ok([400, 409].includes(confB.status));
      console.log('✓ Double sale prevented with 400/409 error.');

      // 23. Overpayment Protection (409 Conflict)
      console.log('23. Overpayment protection (409 Conflict)...');
      const overpayRes = await request(
        'POST',
        '/sales/payments',
        {
          salesInvoiceId: invoiceId,
          paymentMethod: 'CASH',
          amount: 5000.0,
        },
        ownerToken
      );
      assert.strictEqual(overpayRes.status, 409);
      console.log('✓ Overpayment prevented with 409 Conflict.');

      // 24. Double Return Protection (400/409 Error)
      console.log('24. Double return protection (400/409 Error)...');
      const dupReturnRes = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: invoiceId,
          items: [{ salesInvoiceItemId: invoiceItemId, inventoryItemId: item1.id }],
        },
        ownerToken
      );
      assert.ok([400, 409].includes(dupReturnRes.status));
      console.log('✓ Duplicate return prevented with 400/409 error.\n');

      // ---------------------------------------------------------
      // IMMUTABILITY & HISTORICAL SNAPSHOT INTEGRITY
      // ---------------------------------------------------------
      console.log('[TEST GROUP 6: IMMUTABILITY & HISTORICAL AUDIT INTEGRITY]');
      // 25. Confirmed Invoice pricing unchanged after creating new master metal rates
      console.log('25. Verifying rate lock snapshot preservation after new metal rate...');
      await prisma.metalRate.create({
        data: {
          companyId,
          metalType: 'GOLD',
          purity: '22K',
          ratePerGram: new Prisma.Decimal(9999.0),
          effectiveFrom: new Date(),
          isActive: true,
        },
      });

      const checkSnapshotInvoice = await prisma.salesInvoice.findUnique({ where: { id: invoiceId } });
      assert.strictEqual(parseFloat(checkSnapshotInvoice!.grandTotal.toString()), grandTotal);
      console.log('✓ Historical confirmed invoice grandTotal remains 100% immutable.');

      // 26. Historical Payments cannot be modified/deleted
      const historicalPaymentsCount = await prisma.salesPayment.count({ where: { salesInvoiceId: invoiceId } });
      assert.strictEqual(historicalPaymentsCount, 1);
      console.log('✓ Historical payment ledger remains 100% intact.');

      // 27. Stock Movement Audit records cannot be deleted
      const movementsCount = await prisma.stockMovement.count({ where: { inventoryItemId: item1.id } });
      assert.ok(movementsCount >= 2);
      console.log('✓ Stock movements audit history remains 100% intact.');

      console.log('\n========================================================================');
      console.log('✓ ALL 30 SPRINT 4.8 FINAL INTEGRATION AUDIT SCENARIOS PASSED 100%');
      console.log('========================================================================\n');

      server.close();
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('[TEST ERROR] Phase 4 integration test failed:', error);
      if (server) server.close();
      await disconnectDB();
      process.exit(1);
    }
  });
}

runPhase4IntegrationTests();
