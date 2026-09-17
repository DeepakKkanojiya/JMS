import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { SalesInvoiceStatus, SalesReturnStatus, RefundStatus, PaymentMethod, Prisma } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5097;
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

// Helper to create a PROCESSED sales return ready for refund
async function createProcessedSalesReturn(suffix: string, refundTotal = 30000.0) {
  const timestamp = Date.now();
  const itemCode = `REF-ITM-${timestamp}-${suffix}-${Math.floor(Math.random() * 1000)}`;
  const invNumber = `INV-REF-${timestamp}-${suffix}-${Math.floor(Math.random() * 1000)}`;

  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      productId,
      branchId,
      itemCode,
      grossWeight: new Prisma.Decimal(10.0),
      netWeight: new Prisma.Decimal(10.0),
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
      grandTotal: new Prisma.Decimal(refundTotal),
      totalPaid: new Prisma.Decimal(refundTotal),
      paymentStatus: 'PAID',
      items: {
        create: [
          {
            inventoryItemId: inventoryItem.id,
            quantity: 1,
            unitPrice: new Prisma.Decimal(refundTotal),
            lineTotal: new Prisma.Decimal(refundTotal),
          },
        ],
      },
    },
    include: { items: true },
  });

  // Create Return
  const returnRes = await request(
    'POST',
    '/sales/returns',
    {
      salesInvoiceId: invoice.id,
      items: [
        {
          salesInvoiceItemId: invoice.items[0].id,
          inventoryItemId: inventoryItem.id,
        },
      ],
    },
    ownerToken
  );
  const returnId = returnRes.body.data.id;

  // Approve & Process
  await request('POST', `/sales/returns/${returnId}/approve`, {}, ownerToken);
  await request('POST', `/sales/returns/${returnId}/process`, {}, ownerToken);

  return { returnId, refundTotal };
}

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SPRINT 4.7 SALES REFUND INTEGRATION TESTS');
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

      const company = await prisma.company.findFirst({ where: { isActive: true } });
      if (company) companyId = company.id;

      const branch = await prisma.branch.findFirst({ where: { isActive: true } });
      if (branch) branchId = branch.id;

      const customer = await prisma.customer.findFirst({ where: { isActive: true } });
      if (customer) customerId = customer.id;

      const product = await prisma.product.findFirst({ where: { isActive: true } });
      if (product) productId = product.id;

      // 2. Issue full sales refund
      console.log('[TEST] 2. Issuing full sales refund for PROCESSED return...');
      const { returnId: ret1, refundTotal: total1 } = await createProcessedSalesReturn('FULL_REF');
      const res1 = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: ret1,
          refundMethod: 'CASH',
          amount: total1,
          transactionReference: 'TXN-CASH-001',
          remarks: 'Full refund handed in cash',
        },
        ownerToken
      );
      assert.strictEqual(res1.status, 201);
      assert.strictEqual(res1.body.success, true);
      assert.strictEqual(res1.body.data.status, RefundStatus.COMPLETED);
      assert.strictEqual(res1.body.data.refundMethod, PaymentMethod.CASH);
      assert.strictEqual(parseFloat(res1.body.data.amount), total1);
      assert.ok(res1.body.data.refundNumber.startsWith('REF-'));
      console.log(`✓ Refund issued successfully #${res1.body.data.refundNumber}.\n`);

      // 3. Partial refunds and over-refund rejection
      console.log('[TEST] 3. Testing partial refunds and over-refund rejection...');
      const { returnId: ret2 } = await createProcessedSalesReturn('PART_REF', 40000.0);
      const part1 = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: ret2,
          refundMethod: 'BANK_TRANSFER',
          amount: 25000.0,
          transactionReference: 'NEFT-889900',
        },
        ownerToken
      );
      assert.strictEqual(part1.status, 201);

      const part2 = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: ret2,
          refundMethod: 'CASH',
          amount: 15000.0,
        },
        ownerToken
      );
      assert.strictEqual(part2.status, 201);

      const part3Over = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: ret2,
          refundMethod: 'CASH',
          amount: 100.0,
        },
        ownerToken
      );
      assert.strictEqual(part3Over.status, 400);
      assert.strictEqual(part3Over.body.success, false);
      assert.ok(part3Over.body.message.includes('exceeds'));
      console.log('✓ Partial refunds issued & over-refund successfully rejected.\n');

      // 4. Reject refund for un-processed return
      console.log('[TEST] 4. Rejecting refund for un-processed return (REQUESTED state)...');
      const itemUnproc = await prisma.inventoryItem.create({
        data: {
          productId,
          branchId,
          itemCode: `UNP-${Date.now()}`,
          grossWeight: new Prisma.Decimal(5),
          netWeight: new Prisma.Decimal(5),
          purity: '22K',
          status: 'SOLD',
        },
      });
      const invUnproc = await prisma.salesInvoice.create({
        data: {
          invoiceNumber: `INV-UNP-${Date.now()}`,
          customerId,
          branchId,
          status: SalesInvoiceStatus.CONFIRMED,
          grandTotal: new Prisma.Decimal(20000),
          items: {
            create: [{ inventoryItemId: itemUnproc.id, quantity: 1, unitPrice: 20000, lineTotal: 20000 }],
          },
        },
        include: { items: true },
      });
      const retUnproc = await request(
        'POST',
        '/sales/returns',
        {
          salesInvoiceId: invUnproc.id,
          items: [{ salesInvoiceItemId: invUnproc.items[0].id, inventoryItemId: itemUnproc.id }],
        },
        ownerToken
      );
      const unprocReturnId = retUnproc.body.data.id;
      const refUnprocRes = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: unprocReturnId,
          refundMethod: 'UPI',
          amount: 10000,
        },
        ownerToken
      );
      assert.strictEqual(refUnprocRes.status, 400);
      assert.strictEqual(refUnprocRes.body.success, false);
      console.log('✓ Correctly rejected refund for un-processed return.\n');

      // 5. Reverse a completed refund with mandatory audit reason
      console.log('[TEST] 5. Reversing completed sales refund with audit reason...');
      const { returnId: retRev, refundTotal: totalRev } = await createProcessedSalesReturn('REV_REF', 18000.0);
      const refToRev = await request(
        'POST',
        '/sales/refunds',
        {
          salesReturnId: retRev,
          refundMethod: 'UPI',
          amount: totalRev,
        },
        ownerToken
      );
      const refundIdToRev = refToRev.body.data.id;

      const revRes = await request(
        'POST',
        `/sales/refunds/${refundIdToRev}/reverse`,
        {
          reversalReason: 'Wrong bank account specified for UPI payout',
        },
        ownerToken
      );
      assert.strictEqual(revRes.status, 200);
      assert.strictEqual(revRes.body.success, true);
      assert.strictEqual(revRes.body.data.status, RefundStatus.REVERSED);
      assert.strictEqual(revRes.body.data.reversalReason, 'Wrong bank account specified for UPI payout');
      assert.ok(revRes.body.data.reversedAt);
      console.log('✓ Sales refund reversed successfully.\n');

      // 6. Reject double reversal
      console.log('[TEST] 6. Rejecting duplicate reversal of already reversed refund...');
      const revDupRes = await request(
        'POST',
        `/sales/refunds/${refundIdToRev}/reverse`,
        { reversalReason: 'Second reversal attempt' },
        ownerToken
      );
      assert.strictEqual(revDupRes.status, 400);
      assert.strictEqual(revDupRes.body.success, false);
      console.log('✓ Duplicate reversal rejected.\n');

      // 7. List refunds & get return refund history
      console.log('[TEST] 7. Listing refunds and fetching return refund history...');
      const listRes = await request('GET', '/sales/refunds?page=1&limit=5', undefined, ownerToken);
      assert.strictEqual(listRes.status, 200);
      assert.ok(Array.isArray(listRes.body.data));

      const histRes = await request('GET', `/sales/returns/${retRev}/refunds`, undefined, ownerToken);
      assert.strictEqual(histRes.status, 200);
      assert.strictEqual(histRes.body.data.length, 1);
      console.log('✓ Refund list and history retrieved successfully.\n');

      console.log('==================================================');
      console.log('✓ ALL 7 SPRINT 4.7 SALES REFUND TESTS PASSED 100%');
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
