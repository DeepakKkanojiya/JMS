import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';
import { MetalType, MakingChargeType } from '../src/generated/prisma';

let server: http.Server;
const PORT = 5096;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string = '';
let testCompanyId: string = '';
let testBranchId: string = '';
let testCustomerId: string = '';
let testInventoryItemId: string = '';
let testInvoiceId: string = '';

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

async function runPricingTests() {
  console.log('\n==================================================');
  console.log('STARTING SPRINT 4.4 JEWELLERY PRICING & GST ENGINE TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();

    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });

    const loginRes = await request('POST', '/auth/login', {
      email: 'owner@jewelleryerp.com',
      password: 'Admin@123',
    });
    ownerToken = loginRes.body.data.accessToken;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch, 'Active branch must exist');
    testBranchId = branch.id;
    testCompanyId = branch.companyId;

    const customer = await prisma.customer.findFirst({ where: { isActive: true } });
    assert.ok(customer, 'Customer must exist');
    testCustomerId = customer.id;

    const subCategory = await prisma.productSubCategory.findFirst();

    const product = await prisma.product.create({
      data: {
        subCategoryId: subCategory!.id,
        name: '22K Pricing Test Necklace',
        sku: `PRC-NCK-${Date.now()}`,
        metalType: MetalType.GOLD,
        purity: '22K_PRICING',
      },
    });

    const invItem = await prisma.inventoryItem.create({
      data: {
        branchId: testBranchId,
        productId: product.id,
        itemCode: `PRC-ITEM-${Date.now()}`,
        grossWeight: 10.500,
        netWeight: 10.000,
        purity: '22K_PRICING',
        status: 'AVAILABLE',
      },
    });
    testInventoryItemId = invItem.id;

    await prisma.metalRate.updateMany({
      where: { companyId: testCompanyId, metalType: MetalType.GOLD, purity: '22K_PRICING', isActive: true },
      data: { isActive: false, effectiveTo: new Date() },
    });

    await prisma.metalRate.create({
      data: {
        companyId: testCompanyId,
        metalType: MetalType.GOLD,
        purity: '22K_PRICING',
        ratePerGram: 7000.00,
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
        isActive: true,
      },
    });

    await prisma.makingCharge.updateMany({
      where: { companyId: testCompanyId, metalType: MetalType.GOLD, purity: '22K_PRICING', isActive: true },
      data: { isActive: false, effectiveTo: new Date() },
    });

    await prisma.makingCharge.create({
      data: {
        companyId: testCompanyId,
        metalType: MetalType.GOLD,
        purity: '22K_PRICING',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 500.00,
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
        isActive: true,
      },
    });

    // 1. Create DRAFT Invoice Test
    console.log('[TEST 1] Create: Create DRAFT Sales Invoice (201)');
    const res1 = await request(
      'POST',
      '/sales/invoices',
      {
        customerId: testCustomerId,
        branchId: testBranchId,
        items: [
          {
            inventoryItemId: testInventoryItemId,
            quantity: 1,
            unitPrice: 70000.00,
          },
        ],
      },
      ownerToken
    );
    assert.strictEqual(res1.status, 201);
    assert.strictEqual(res1.body.success, true);
    testInvoiceId = res1.body.data.id;
    console.log('[PASS] Invoice created with ID:', testInvoiceId);

    // 2. Calculation Rejection Guard Test
    console.log('[TEST 2] Calculation Guard: Reject pricing calculation if rate is NOT locked (400)');
    const res2 = await request(
      'POST',
      `/sales/invoices/${testInvoiceId}/calculate-pricing`,
      { taxType: 'INTRA_STATE', wastagePercent: 2.0 },
      ownerToken
    );
    assert.strictEqual(res2.status, 400);
    assert.ok(res2.body.message.includes('Metal rate must be locked'));
    console.log('[PASS] Pricing calculation rejected when rate not locked.');

    // 3. Confirmation Guard Test
    console.log('[TEST 3] Confirmation Guard: Reject confirmation if pricing has NOT been calculated (400)');
    await request('POST', `/sales/invoices/${testInvoiceId}/lock-metal-rate`, {}, ownerToken);
    const res3 = await request('POST', `/sales/invoices/${testInvoiceId}/confirm`, {}, ownerToken);
    assert.strictEqual(res3.status, 400);
    assert.ok(res3.body.message.includes('Invoice pricing must be calculated'));
    console.log('[PASS] Confirmation rejected when pricing not calculated.');

    // 4. Calculate INTRA_STATE Pricing Test
    console.log('[TEST 4] Pricing Engine: Calculate & Persist INTRA_STATE pricing breakdown (200)');
    const res4 = await request(
      'POST',
      `/sales/invoices/${testInvoiceId}/calculate-pricing`,
      { taxType: 'INTRA_STATE', wastagePercent: 2.0 },
      ownerToken
    );
    assert.strictEqual(res4.status, 200);
    assert.strictEqual(res4.body.success, true);

    const data = res4.body.data;
    assert.strictEqual(data.metalValue, '70000.00');
    assert.strictEqual(data.wastageValue, '1400.00');
    assert.strictEqual(data.makingCharges, '5000.00');
    assert.strictEqual(data.taxableAmount, '76400.00');
    assert.strictEqual(data.cgstAmount, '1146.00');
    assert.strictEqual(data.sgstAmount, '1146.00');
    assert.strictEqual(data.igstAmount, '0.00');
    assert.strictEqual(data.taxAmount, '2292.00');
    assert.strictEqual(data.grandTotal, '78692.00');
    assert.strictEqual(data.pricingCalculated, true);
    console.log('[PASS] INTRA_STATE pricing breakdown calculated & persisted correctly.');

    // 5. Pricing Snapshot Query Test
    console.log('[TEST 5] Snapshot Query: Fetch stored invoice pricing breakdown (200)');
    const res5 = await request('GET', `/sales/invoices/${testInvoiceId}/pricing`, undefined, ownerToken);
    assert.strictEqual(res5.status, 200);
    assert.strictEqual(res5.body.success, true);
    assert.strictEqual(res5.body.data.grandTotal, '78692.00');
    console.log('[PASS] Stored pricing breakdown snapshot retrieved successfully.');

    // 6. POS Confirmation Integration Test
    console.log('[TEST 6] POS Confirmation: Confirm invoice with calculated pricing snapshot (200)');
    const res6 = await request('POST', `/sales/invoices/${testInvoiceId}/confirm`, {}, ownerToken);
    assert.strictEqual(res6.status, 200);
    assert.strictEqual(res6.body.success, true);
    assert.strictEqual(res6.body.data.status, 'CONFIRMED');

    const soldItem = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    assert.strictEqual(soldItem?.status, 'SOLD');
    console.log('[PASS] Invoice confirmed & item status transitioned AVAILABLE -> SOLD.');

    // 7. Snapshot Immutability Test
    console.log('[TEST 7] Immutability: Master charge update does NOT alter confirmed invoice snapshot');
    await prisma.makingCharge.updateMany({
      where: { companyId: testCompanyId, metalType: MetalType.GOLD, purity: '22K_PRICING' },
      data: { rate: 1000.00 },
    });

    const res7 = await request('GET', `/sales/invoices/${testInvoiceId}/pricing`, undefined, ownerToken);
    assert.strictEqual(res7.status, 200);
    assert.strictEqual(res7.body.data.makingCharges, '5000.00'); // Unchanged!
    assert.strictEqual(res7.body.data.grandTotal, '78692.00'); // Unchanged!
    console.log('[PASS] Snapshot immutability verified.');

    // 8. Recalculation Protection Test
    console.log('[TEST 8] Protection: Reject pricing calculation on CONFIRMED invoice (400)');
    const res8 = await request(
      'POST',
      `/sales/invoices/${testInvoiceId}/calculate-pricing`,
      { taxType: 'INTRA_STATE' },
      ownerToken
    );
    assert.strictEqual(res8.status, 400);
    assert.ok(res8.body.message.includes('Pricing calculation is only allowed for DRAFT invoices'));
    console.log('[PASS] Recalculation on CONFIRMED invoice rejected.');

    console.log('\n==================================================');
    console.log('ALL SPRINT 4.4 JEWELLERY PRICING ENGINE TESTS PASSED 100%');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n[FAIL] Jewellery Pricing API Test Failure:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }
}

runPricingTests();
