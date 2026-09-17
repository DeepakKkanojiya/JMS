import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { SalesInvoiceStatus, SalesReturnStatus, Prisma } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string = '';
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

// Helper to create a confirmed invoice with a sold inventory item
async function createConfirmedInvoiceWithItem(itemCodeSuffix: string) {
  const timestamp = Date.now();
  const itemCode = `RET-ITM-${timestamp}-${itemCodeSuffix}-${Math.floor(Math.random() * 1000)}`;
  const invNumber = `INV-RET-${timestamp}-${itemCodeSuffix}-${Math.floor(Math.random() * 1000)}`;

  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      productId,
      branchId,
      itemCode,
      grossWeight: new Prisma.Decimal(12.5),
      netWeight: new Prisma.Decimal(12.0),
      stoneWeight: new Prisma.Decimal(0.5),
      purity: '22K',
      status: 'SOLD',
    },
  });

  const invoice = await prisma.salesInvoice.create({
    data: {
      invoiceNumber: invNumber,
      customerId,
      branchId,
      status: SalesInvoiceStatus.CONFIRMED,
      subtotal: new Prisma.Decimal(50000.0),
      taxableAmount: new Prisma.Decimal(50000.0),
      taxAmount: new Prisma.Decimal(1500.0),
      grandTotal: new Prisma.Decimal(51500.0),
      totalPaid: new Prisma.Decimal(51500.0),
      outstandingAmount: new Prisma.Decimal(0.0),
      paymentStatus: 'PAID',
      exchangeCredit: new Prisma.Decimal(0.0),
      items: {
        create: [
          {
            inventoryItemId: inventoryItem.id,
            quantity: 1,
            unitPrice: new Prisma.Decimal(50000.0),
            taxableAmount: new Prisma.Decimal(50000.0),
            taxAmount: new Prisma.Decimal(1500.0),
            lineTotal: new Prisma.Decimal(51500.0),
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  return { invoice, inventoryItem, invoiceItem: invoice.items[0] };
}

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SPRINT 4.7 SALES RETURN INTEGRATION TESTS');
  console.log('==================================================\n');

  await connectDB();

  server = app.listen(PORT, async () => {
    try {
      // 1. Authenticate Owner
      console.log('[TEST] 1. Authenticating test user (OWNER)...');
      const ownerLogin = await request('POST', '/auth/login', {
        email: 'owner@jewelleryerp.com',
        password: 'Admin@123',
      });
      assert.strictEqual(ownerLogin.status, 200);
      ownerToken = ownerLogin.body.data.accessToken;
      console.log('✓ Authenticated successfully.\n');

      // Resolve Master Entities
      const company = await prisma.company.findFirst({ where: { isActive: true } });
      if (company) companyId = company.id;

      const branch = await prisma.branch.findFirst({ where: { isActive: true } });
      if (branch) branchId = branch.id;

      const customer = await prisma.customer.findFirst({ where: { isActive: true } });
      if (customer) customerId = customer.id;

      const product = await prisma.product.findFirst({ where: { isActive: true } });
      if (product) productId = product.id;

      // 2. Create valid sales return in REQUESTED status
      console.log('[TEST] 2. Creating valid sales return in REQUESTED status...');
      const { invoice, inventoryItem, invoiceItem } = await createConfirmedInvoiceWithItem('TEST1');
      const res1 = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: invoice.id,
          reason: 'Size not fitting',
          remarks: 'Customer requested return within 7 days',
          items: [
            {
              salesInvoiceItemId: invoiceItem.id,
              inventoryItemId: inventoryItem.id,
              deductionAmount: 500.0,
              reason: 'Slight polishing fee deducted',
            },
          ],
        },
        ownerToken
      );
      assert.strictEqual(res1.status, 201, `Failed with ${JSON.stringify(res1.body)}`);
      assert.strictEqual(res1.body.success, true);
      assert.strictEqual(res1.body.data.status, SalesReturnStatus.REQUESTED);
      assert.strictEqual(res1.body.data.items.length, 1);
      assert.strictEqual(parseFloat(res1.body.data.deductionAmount), 500.0);
      assert.strictEqual(parseFloat(res1.body.data.refundAmount), 51000.0);
      assert.ok(res1.body.data.returnNumber.startsWith('RET-'));
      console.log(`✓ Return created successfully #${res1.body.data.returnNumber}.\n`);

      // 3. Reject sales return creation for DRAFT invoice
      console.log('[TEST] 3. Rejecting sales return creation for DRAFT invoice...');
      const draftInvoice = await prisma.salesInvoice.create({
        data: {
          invoiceNumber: `INV-DRAFT-${Date.now()}`,
          customerId,
          branchId,
          status: SalesInvoiceStatus.DRAFT,
        },
      });
      const resDraft = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: draftInvoice.id,
          items: [
            {
              salesInvoiceItemId: '00000000-0000-0000-0000-000000000000',
              inventoryItemId: '00000000-0000-0000-0000-000000000000',
            },
          ],
        },
        ownerToken
      );
      assert.strictEqual(resDraft.status, 400);
      assert.strictEqual(resDraft.body.success, false);
      console.log('✓ Correctly rejected DRAFT invoice return.\n');

      // 4. Reject sales return for invoice with gold exchange credit
      console.log('[TEST] 4. Rejecting sales return for invoice with applied gold exchange credit...');
      const invoiceWithExchange = await prisma.salesInvoice.create({
        data: {
          invoiceNumber: `INV-EXC-${Date.now()}`,
          customerId,
          branchId,
          status: SalesInvoiceStatus.CONFIRMED,
          exchangeCredit: new Prisma.Decimal(10000.0),
        },
      });
      const resExc = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: invoiceWithExchange.id,
          items: [
            {
              salesInvoiceItemId: '00000000-0000-0000-0000-000000000000',
              inventoryItemId: '00000000-0000-0000-0000-000000000000',
            },
          ],
        },
        ownerToken
      );
      assert.strictEqual(resExc.status, 400);
      assert.strictEqual(resExc.body.success, false);
      assert.ok(resExc.body.message.includes('gold exchange'));
      console.log('✓ Correctly protected gold exchange audit history.\n');

      // 5. Reject duplicate return for the same physical inventory item
      console.log('[TEST] 5. Rejecting duplicate return for same inventory item (409 Conflict)...');
      const { invoice: dupInvoice, inventoryItem: dupItem, invoiceItem: dupInvItem } = await createConfirmedInvoiceWithItem('DUPTEST');
      const dup1 = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: dupInvoice.id,
          items: [{ salesInvoiceItemId: dupInvItem.id, inventoryItemId: dupItem.id }],
        },
        ownerToken
      );
      assert.strictEqual(dup1.status, 201);
      const dup2 = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: dupInvoice.id,
          items: [{ salesInvoiceItemId: dupInvItem.id, inventoryItemId: dupItem.id }],
        },
        ownerToken
      );
      assert.strictEqual(dup2.status, 409);
      assert.strictEqual(dup2.body.success, false);
      console.log('✓ Correctly prevented duplicate item return.\n');

      // 6. Approve a REQUESTED sales return
      console.log('[TEST] 6. Approving REQUESTED sales return...');
      const { invoice: appInvoice, inventoryItem: appItem, invoiceItem: appInvItem } = await createConfirmedInvoiceWithItem('APPROVE1');
      const appCreate = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: appInvoice.id,
          items: [{ salesInvoiceItemId: appInvItem.id, inventoryItemId: appItem.id }],
        },
        ownerToken
      );
      const returnIdToApprove = appCreate.body.data.id;
      const approveRes = await request(
        'POST',
        `/sales/returns/${returnIdToApprove}/approve`,
        { remarks: 'Approved by store manager' },
        ownerToken
      );
      assert.strictEqual(approveRes.status, 200);
      assert.strictEqual(approveRes.body.success, true);
      assert.strictEqual(approveRes.body.data.status, SalesReturnStatus.APPROVED);
      assert.ok(approveRes.body.data.approvedAt);
      console.log('✓ Sales return approved successfully.\n');

      // 7. Process APPROVED return, update inventory to AVAILABLE, and create StockMovement
      console.log('[TEST] 7. Processing APPROVED return and verifying inventory restoration + StockMovement...');
      const processRes = await request(
        'POST',
        `/sales/returns/${returnIdToApprove}/process`,
        { remarks: 'Item placed back into vault' },
        ownerToken
      );
      assert.strictEqual(processRes.status, 200);
      assert.strictEqual(processRes.body.success, true);
      assert.strictEqual(processRes.body.data.status, SalesReturnStatus.PROCESSED);
      assert.ok(processRes.body.data.processedAt);

      const checkItem = await prisma.inventoryItem.findUnique({ where: { id: appItem.id } });
      assert.strictEqual(checkItem?.status, 'AVAILABLE');

      const movement = await prisma.stockMovement.findFirst({
        where: {
          inventoryItemId: appItem.id,
          movementType: 'SALE_RETURN',
          referenceId: returnIdToApprove,
        },
      });
      assert.ok(movement, 'Stock movement SALE_RETURN should exist');
      assert.strictEqual(movement.toBranchId, branchId);
      console.log('✓ Inventory item restored to AVAILABLE & StockMovement SALE_RETURN recorded.\n');

      // 8. Reject invalid state transition (processing REQUESTED directly)
      console.log('[TEST] 8. Rejecting invalid state transition (REQUESTED -> PROCESSED)...');
      const { invoice: invTransInvoice, inventoryItem: invTransItem, invoiceItem: invTransInvItem } = await createConfirmedInvoiceWithItem('INVTRANS');
      const invTransCreate = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: invTransInvoice.id,
          items: [{ salesInvoiceItemId: invTransInvItem.id, inventoryItemId: invTransItem.id }],
        },
        ownerToken
      );
      const invalidTransId = invTransCreate.body.data.id;
      const invalidProcRes = await request('POST', `/sales/returns/${invalidTransId}/process`, {}, ownerToken);
      assert.strictEqual(invalidProcRes.status, 400);
      assert.strictEqual(invalidProcRes.body.success, false);
      console.log('✓ Correctly rejected invalid transition.\n');

      // 9. Cancel a REQUESTED sales return
      console.log('[TEST] 9. Cancelling a REQUESTED sales return...');
      const cancelRes = await request(
        'POST',
        `/sales/returns/${invalidTransId}/cancel`,
        { cancellationReason: 'Customer changed mind' },
        ownerToken
      );
      assert.strictEqual(cancelRes.status, 200);
      assert.strictEqual(cancelRes.body.data.status, SalesReturnStatus.CANCELLED);
      assert.strictEqual(cancelRes.body.data.cancellationReason, 'Customer changed mind');
      console.log('✓ Sales return cancelled successfully.\n');

      // 10. Reject cancelling a PROCESSED return
      console.log('[TEST] 10. Rejecting cancellation of a PROCESSED return...');
      const cancelProcessedRes = await request(
        'POST',
        `/sales/returns/${returnIdToApprove}/cancel`,
        { cancellationReason: 'Should fail' },
        ownerToken
      );
      assert.strictEqual(cancelProcessedRes.status, 400);
      assert.strictEqual(cancelProcessedRes.body.success, false);
      console.log('✓ Correctly protected PROCESSED return immutability.\n');

      // 11. List sales returns and get audit history
      console.log('[TEST] 11. Listing sales returns and fetching audit history...');
      const listRes = await request('GET', '/sales/returns?page=1&limit=5', undefined, ownerToken);
      assert.strictEqual(listRes.status, 200);
      assert.ok(Array.isArray(listRes.body.data));

      const histRes = await request('GET', `/sales/returns/${returnIdToApprove}/history`, undefined, ownerToken);
      assert.strictEqual(histRes.status, 200);
      assert.strictEqual(histRes.body.data.currentStatus, SalesReturnStatus.PROCESSED);
      assert.ok(histRes.body.data.history.length >= 3);
      console.log('✓ List and audit history retrieved successfully.\n');

      // 12. Get returns by invoice ID
      console.log('[TEST] 12. Getting returns for specific invoice...');
      const invoiceReturnsRes = await request('GET', `/sales/invoices/${appInvoice.id}/returns`, undefined, ownerToken);
      assert.strictEqual(invoiceReturnsRes.status, 200);
      assert.strictEqual(invoiceReturnsRes.body.data.length, 1);
      console.log('✓ Invoices returns retrieved successfully.\n');

      console.log('==================================================');
      console.log('✓ ALL 12 SPRINT 4.7 SALES RETURN TESTS PASSED 100%');
      console.log('==================================================\n');

      server.close();
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('[TEST ERROR] Test failed with error:', error);
      if (server) server.close();
      await disconnectDB();
      process.exit(1);
    }
  });
}

runTests();
