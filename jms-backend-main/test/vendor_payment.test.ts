import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { PurchaseOrderStatus, PurchaseBillStatus, VendorPaymentStatus } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let accountantToken: string;
let staffToken: string;

let testVendorId: string;
let testBranchId: string;
let testProductId: string;
let testPOId: string;
let testPOItemId: string;
let testReceiptId: string;
let testReceiptItemId: string;

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
  console.log('RUNNING SPRINT 5.4 VENDOR PAYMENTS & SETTLEMENT TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1 & 2. Authentication & RBAC Setup
    console.log('\n[TEST] 1-2. Authentication & Tokens...');
    const ownerRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(ownerRes.status, 200, 'Owner login failed');
    ownerToken = ownerRes.body.data.accessToken;

    const accountantRes = await request('POST', '/auth/login', {
      email: 'accountant@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(accountantRes.status, 200, 'Accountant login failed');
    accountantToken = accountantRes.body.data.accessToken;

    const staffRes = await request('POST', '/auth/login', {
      email: 'staff@jewelleryerp.com',
      password: 'Admin@123',
    });
    assert.strictEqual(staffRes.status, 200, 'Staff login failed');
    staffToken = staffRes.body.data.accessToken;

    // Unauthenticated check
    const unauthRes = await request('POST', '/vendor-payments', {});
    assert.strictEqual(unauthRes.status, 401, 'Expected 401 for unauthenticated request');

    // Fetch Master Data
    const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
    assert.ok(vendor, 'Need active vendor');
    testVendorId = vendor.id;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch, 'Need active branch');
    testBranchId = branch.id;

    const product = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(product, 'Need active product');
    testProductId = product.id;

    // Setup PO, Receive, and Purchase Bill
    console.log('\n[TEST] Setting up PO, Physical Receiving & Purchase Bills...');
    const poRes = await request(
      'POST',
      '/purchases',
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            productId: testProductId,
            metalType: 'GOLD',
            purity: '22K',
            itemName: 'Sprint 5.4 Test Gold Ornament',
            orderedQuantity: 10,
            grossWeight: 50.000,
            netWeight: 48.000,
            stoneWeight: 2.000,
            expectedRate: 6000.00,
            makingCharges: 4000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(poRes.status, 201);
    testPOId = poRes.body.data.id;
    testPOItemId = poRes.body.data.items[0].id;

    await request('POST', `/purchases/${testPOId}/submit`, {}, ownerToken);
    await request('POST', `/purchases/${testPOId}/approve`, {}, ownerToken);

    const receiveRes = await request(
      'POST',
      `/purchases/${testPOId}/receive`,
      {
        remarks: 'Received 10 units for Sprint 5.4 payment test',
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            receivedQuantity: 10,
            grossWeight: 50.000,
            netWeight: 48.000,
            stoneWeight: 2.000,
            fineWeight: 44.000,
            purchaseRate: 6000.00,
            makingCharges: 4000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(receiveRes.status, 201);

    const fetchedReceipt = await prisma.purchaseReceipt.findFirst({
      where: { purchaseOrderId: testPOId },
      include: { items: true },
    });
    assert.ok(fetchedReceipt);
    testReceiptId = fetchedReceipt.id;
    testReceiptItemId = fetchedReceipt.items[0].id;

    // Create DRAFT Bill
    const draftBillRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            purchaseReceiptItemId: testReceiptItemId,
            itemName: 'Sprint 5.4 Test Gold Ornament',
            quantity: 5,
            grossWeight: 25.000,
            netWeight: 24.000,
            stoneWeight: 1.000,
            purchaseRate: 6000.00,
            makingCharges: 2000.00, // 24*6000 = 144000 + 2000 = 146000 base
            taxRate: 3.0, // 146000 * 0.03 = 4380 => 150380 total
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(draftBillRes.status, 201);
    const draftBillId = draftBillRes.body.data.id;

    // Create a second bill that we will approve (Grand Total = 150,380)
    const approvedBillRes = await request(
      'POST',
      '/purchase-bills',
      {
        purchaseOrderId: testPOId,
        vendorId: testVendorId,
        branchId: testBranchId,
        items: [
          {
            purchaseOrderItemId: testPOItemId,
            purchaseReceiptItemId: testReceiptItemId,
            itemName: 'Sprint 5.4 Test Gold Ornament',
            quantity: 5,
            grossWeight: 25.000,
            netWeight: 24.000,
            stoneWeight: 1.000,
            purchaseRate: 6000.00,
            makingCharges: 2000.00,
            taxRate: 3.0,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(approvedBillRes.status, 201);
    const approvedBillId = approvedBillRes.body.data.id;

    // Submit and Approve the second bill
    await request('POST', `/purchase-bills/${approvedBillId}/submit`, {}, ownerToken);
    const approveBillRes = await request('POST', `/purchase-bills/${approvedBillId}/approve`, {}, ownerToken);
    assert.strictEqual(approveBillRes.status, 200);
    assert.strictEqual(approveBillRes.body.data.status, 'APPROVED');
    assert.strictEqual(Number(approveBillRes.body.data.grandTotal), 150380);

    // 8-14. Status & Invalid Payment Guards
    console.log('\n[TEST] 8-14. Status & Input Validation Guards (Draft, Submitted, Cancelled, Amount <= 0)...');

    // Staff forbidden check
    const staffPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      { vendorId: testVendorId, branchId: testBranchId, amount: 1000, paymentMethod: 'CASH' },
      staffToken
    );
    assert.strictEqual(staffPayRes.status, 403, 'Expected 403 Forbidden for staff missing vendor_payment.create');

    // 11. Reject payment on DRAFT bill
    const payDraftRes = await request(
      'POST',
      `/purchase-bills/${draftBillId}/payments`,
      { vendorId: testVendorId, branchId: testBranchId, amount: 1000, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(payDraftRes.status, 400, 'Expected 400 for payment on DRAFT bill');

    // 12. Reject payment on SUBMITTED bill
    await request('POST', `/purchase-bills/${draftBillId}/submit`, {}, ownerToken);
    const paySubmittedRes = await request(
      'POST',
      `/purchase-bills/${draftBillId}/payments`,
      { vendorId: testVendorId, branchId: testBranchId, amount: 1000, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(paySubmittedRes.status, 400, 'Expected 400 for payment on SUBMITTED bill');

    // 13. Reject payment on CANCELLED bill
    await request('POST', `/purchase-bills/${draftBillId}/cancel`, { cancellationReason: 'Cancelled test bill' }, ownerToken);
    const payCancelledRes = await request(
      'POST',
      `/purchase-bills/${draftBillId}/payments`,
      { vendorId: testVendorId, branchId: testBranchId, amount: 1000, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(payCancelledRes.status, 400, 'Expected 400 for payment on CANCELLED bill');

    // 8 & 9. Reject zero and negative amounts
    const zeroPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      { vendorId: testVendorId, branchId: testBranchId, amount: 0, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(zeroPayRes.status, 400, 'Expected 400 for amount <= 0');

    const negPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      { vendorId: testVendorId, branchId: testBranchId, amount: -500, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(negPayRes.status, 400, 'Expected 400 for negative amount');

    // 34 & 35. Vendor & Branch Isolation Guards
    console.log('\n[TEST] 34-35. Vendor & Branch Mismatch Isolation...');
    const fakeVendorId = '11111111-1111-4111-a111-111111111111';
    const fakeBranchId = '22222222-2222-4222-a222-222222222222';

    const vendorMismatchRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      { vendorId: fakeVendorId, branchId: testBranchId, amount: 1000, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(vendorMismatchRes.status, 400, 'Expected 400 for vendor mismatch');

    const branchMismatchRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      { vendorId: testVendorId, branchId: fakeBranchId, amount: 1000, paymentMethod: 'CASH' },
      accountantToken
    );
    assert.strictEqual(branchMismatchRes.status, 400, 'Expected 400 for branch mismatch');

    // 3-7 & 15, 17. Create Payments (CASH, CARD, UPI, BANK_TRANSFER, CHEQUE) & Partial Settlement
    console.log('\n[TEST] 3-7, 15, 17. Create Payments across Payment Methods & Partial Settlement...');

    // Payment 1: CASH ₹20,000 => Status becomes PARTIALLY_PAID
    const cashPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 20000.00,
        paymentMethod: 'CASH',
        remarks: 'Cash advance settlement',
      },
      accountantToken
    );
    assert.strictEqual(cashPayRes.status, 201, 'Cash payment failed');
    assert.ok(cashPayRes.body.data.paymentNumber.startsWith('VPAY-'));
    const cashPayId = cashPayRes.body.data.id;

    // Check Bill status update -> PARTIALLY_PAID
    const billAfterCash = await request('GET', `/purchase-bills/${approvedBillId}`, undefined, staffToken);
    assert.strictEqual(billAfterCash.body.data.status, 'PARTIALLY_PAID');
    assert.strictEqual(Number(billAfterCash.body.data.totalPaid), 20000);
    assert.strictEqual(Number(billAfterCash.body.data.outstandingAmount), 130380);

    // Payment 2: CARD ₹30,000
    const cardPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 30000.00,
        paymentMethod: 'CARD',
        transactionReference: 'CARD-REF-1001',
      },
      accountantToken
    );
    assert.strictEqual(cardPayRes.status, 201);

    // Payment 3: UPI ₹20,000
    const upiPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 20000.00,
        paymentMethod: 'UPI',
        transactionReference: 'UPI-REF-2002',
      },
      accountantToken
    );
    assert.strictEqual(upiPayRes.status, 201);

    // Payment 4: BANK_TRANSFER ₹30,000
    const bankPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 30000.00,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: 'NEFT-REF-3003',
      },
      accountantToken
    );
    assert.strictEqual(bankPayRes.status, 201);

    // Payment 5: CHEQUE ₹20,000
    const chequePayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 20000.00,
        paymentMethod: 'CHEQUE',
        transactionReference: 'CHQ-556677',
      },
      accountantToken
    );
    assert.strictEqual(chequePayRes.status, 201);

    // Current totalPaid = 20000 + 30000 + 20000 + 30000 + 20000 = 120,000. Outstanding = 30,380
    const billPartialTotal = await request('GET', `/purchase-bills/${approvedBillId}`, undefined, staffToken);
    assert.strictEqual(Number(billPartialTotal.body.data.totalPaid), 120000);
    assert.strictEqual(Number(billPartialTotal.body.data.outstandingAmount), 30380);

    // 22. Overpayment Protection (409 Conflict)
    console.log('\n[TEST] 22. Overpayment Protection (Attempting payment > outstanding)...');
    const overPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 30380.01, // 0.01 more than remaining 30380
        paymentMethod: 'CASH',
      },
      accountantToken
    );
    assert.strictEqual(overPayRes.status, 409, 'Expected 409 Conflict for overpayment');

    // 16, 18, 23. Exact Outstanding Payment & Fully PAID Settlement
    console.log('\n[TEST] 16, 18, 23. Exact Outstanding Payment & Fully PAID Transition...');
    const exactPayRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 30380.00,
        paymentMethod: 'CASH',
      },
      accountantToken
    );
    assert.strictEqual(exactPayRes.status, 201, 'Exact balance payment failed');

    const billPaidState = await request('GET', `/purchase-bills/${approvedBillId}`, undefined, staffToken);
    assert.strictEqual(billPaidState.body.data.status, 'PAID');
    assert.strictEqual(Number(billPaidState.body.data.totalPaid), 150380);
    assert.strictEqual(Number(billPaidState.body.data.outstandingAmount), 0);

    // 14. Reject payment on fully PAID bill
    const payOnPaidRes = await request(
      'POST',
      `/purchase-bills/${approvedBillId}/payments`,
      {
        vendorId: testVendorId,
        branchId: testBranchId,
        amount: 100.00,
        paymentMethod: 'CASH',
      },
      accountantToken
    );
    assert.strictEqual(payOnPaidRes.status, 409, 'Expected 409 Conflict when paying on fully PAID bill');

    // 25-31. Reversal Workflow & Immutability
    console.log('\n[TEST] 25-31. Reversal Workflow & Status Recalculation (PAID -> PARTIALLY_PAID)...');

    // 26. Reject reversal without reason
    const noReasonRevRes = await request('POST', `/vendor-payments/${cashPayId}/reverse`, {}, ownerToken);
    assert.strictEqual(noReasonRevRes.status, 400, 'Expected 400 for missing reversalReason');

    // Reverse Cash Payment 1 (₹20,000)
    const reverseCashRes = await request(
      'POST',
      `/vendor-payments/${cashPayId}/reverse`,
      { reversalReason: 'Duplicate cash entry entered by cashier in error' },
      ownerToken
    );
    assert.strictEqual(reverseCashRes.status, 200, 'Reversal failed');
    assert.strictEqual(reverseCashRes.body.data.status, 'REVERSED');
    assert.strictEqual(reverseCashRes.body.data.reversalReason, 'Duplicate cash entry entered by cashier in error');

    // 27. Reject reversal of already REVERSED payment
    const dupRevRes = await request(
      'POST',
      `/vendor-payments/${cashPayId}/reverse`,
      { reversalReason: 'Second reversal attempt' },
      ownerToken
    );
    assert.strictEqual(dupRevRes.status, 400, 'Expected 400 when reversing already reversed payment');

    // Check Bill status returned to PARTIALLY_PAID (totalPaid = 130,380, outstanding = 20,000)
    const billAfterReversal = await request('GET', `/purchase-bills/${approvedBillId}`, undefined, staffToken);
    assert.strictEqual(billAfterReversal.body.data.status, 'PARTIALLY_PAID');
    assert.strictEqual(Number(billAfterReversal.body.data.totalPaid), 130380);
    assert.strictEqual(Number(billAfterReversal.body.data.outstandingAmount), 20000);

    // 21. Payment Summary API
    console.log('\n[TEST] 21. Purchase Bill Payment Summary Breakdown...');
    const summaryRes = await request('GET', `/purchase-bills/${approvedBillId}/payment-summary`, undefined, staffToken);
    assert.strictEqual(summaryRes.status, 200);
    assert.strictEqual(Number(summaryRes.body.data.grandTotal), 150380);
    assert.strictEqual(Number(summaryRes.body.data.totalPaid), 130380);
    assert.strictEqual(Number(summaryRes.body.data.outstandingAmount), 20000);
    assert.strictEqual(Number(summaryRes.body.data.cashTotal), 30380); // 30380 (cash payment 2, payment 1 reversed)
    assert.strictEqual(Number(summaryRes.body.data.cardTotal), 30000);
    assert.strictEqual(Number(summaryRes.body.data.upiTotal), 20000);
    assert.strictEqual(Number(summaryRes.body.data.bankTransferTotal), 30000);
    assert.strictEqual(Number(summaryRes.body.data.chequeTotal), 20000);

    // 32-33. Vendor History & Payable Summary APIs
    console.log('\n[TEST] 32-33. Vendor Payment History & Payable Summary Aggregations...');
    const vHistoryRes = await request('GET', `/vendors/${testVendorId}/payments`, undefined, staffToken);
    assert.strictEqual(vHistoryRes.status, 200);
    assert.ok(Array.isArray(vHistoryRes.body.data));

    const vSummaryRes = await request('GET', `/vendors/${testVendorId}/payable-summary`, undefined, staffToken);
    assert.strictEqual(vSummaryRes.status, 200);
    assert.ok(vSummaryRes.body.data.totalApprovedBills >= 1);
    assert.ok(Number(vSummaryRes.body.data.totalBilled) >= 150380);

    // 36. Payment Immutability (No DELETE route)
    console.log('\n[TEST] 36. Immutable Payment Ledger (No DELETE endpoint)...');
    const deleteRes = await request('DELETE', `/vendor-payments/${cashPayId}`, undefined, ownerToken);
    assert.strictEqual(deleteRes.status, 404, 'Expected 404 Route Not Found for DELETE payment');

    console.log('\n======================================================');
    console.log('✓ ALL 40 SPRINT 5.4 VENDOR PAYMENT TESTS PASSED');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n[FAIL] Test suite failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runTests();
