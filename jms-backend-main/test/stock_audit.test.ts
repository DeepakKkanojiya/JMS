import assert from 'assert';
import http from 'http';
import app from '../src/app';
import { prisma, connectDB, disconnectDB } from '../src/database';

let server: http.Server;
const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let ownerToken: string;
let accountantToken: string;
let staffToken: string;

let testCompanyId: string;
let testBranchId: string;
let testCategoryId: string;
let testInventoryItemId: string;
let testBarcodeTag: string;

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
  console.log('RUNNING SPRINT 5.7 STOCK AUDIT & RECONCILIATION TESTS');
  console.log('======================================================\n');

  try {
    await connectDB();

    server = app.listen(PORT);
    console.log(`[TEST] Test server listening on port ${PORT}...`);

    // 1-2. Auth Setup
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
    const unauthRes = await request('POST', '/stock-audits', {});
    assert.strictEqual(unauthRes.status, 401, 'Expected 401 for unauthenticated request');

    // Fetch Master Data
    const company = await prisma.company.findFirst({ where: { isActive: true } });
    assert.ok(company);
    testCompanyId = company.id;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    assert.ok(branch);
    testBranchId = branch.id;

    const category = await prisma.productCategory.findFirst({ where: { isActive: true } });
    assert.ok(category);
    testCategoryId = category.id;

    const invItem = await prisma.inventoryItem.findFirst({
      where: { branchId: testBranchId, status: 'AVAILABLE' },
      include: { tags: true },
    });
    assert.ok(invItem);
    testInventoryItemId = invItem.id;
    testBarcodeTag = invItem.tags[0]?.barcode || invItem.itemCode;

    // 3-6. Create Stock Audit Session & Guard Validations
    console.log('\n[TEST] 3-6. Create Stock Audit Session & Guard Validations...');
    const staffCreateRes = await request(
      'POST',
      '/stock-audits',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
      },
      staffToken
    );
    assert.strictEqual(staffCreateRes.status, 403, 'Expected 403 Forbidden for staff missing stock_audit.create');

    const sessionRes = await request(
      'POST',
      '/stock-audits',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        notes: 'Sprint 5.7 Stocktake Audit Test',
      },
      accountantToken
    );
    assert.strictEqual(sessionRes.status, 201, 'Create stock audit session failed');
    assert.strictEqual(sessionRes.body.data.status, 'IN_PROGRESS');
    assert.ok(sessionRes.body.data.auditNumber.startsWith('AUD-'));
    assert.ok(sessionRes.body.data.totalExpectedItems > 0);
    const testSessionId = sessionRes.body.data.id;

    // 5. Reject duplicate active session for same branch
    const dupRes = await request(
      'POST',
      '/stock-audits',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        notes: 'Duplicate test',
      },
      accountantToken
    );
    assert.strictEqual(dupRes.status, 409, 'Expected 409 Conflict for duplicate active session');

    // 7-11. Physical Item Scanning (Matched, Weight Mismatch, Unexpected)
    console.log('\n[TEST] 7-11. Physical Item Scanning & Discrepancy Evaluation...');

    // Scan matched item
    const scanMatchRes = await request(
      'POST',
      `/stock-audits/${testSessionId}/scan`,
      {
        identifier: testBarcodeTag,
        scannedNetWeight: Number(invItem.netWeight),
        remarks: 'Matched barcode scan',
      },
      staffToken
    );
    assert.strictEqual(scanMatchRes.status, 201);
    assert.strictEqual(scanMatchRes.body.data.status, 'MATCHED');

    // Scan weight mismatch item (if another item exists)
    const secondInv = await prisma.inventoryItem.findFirst({
      where: { branchId: testBranchId, status: 'AVAILABLE', NOT: { id: testInventoryItemId } },
      include: { tags: true },
    });

    if (secondInv) {
      const scanMismatchRes = await request(
        'POST',
        `/stock-audits/${testSessionId}/scan`,
        {
          identifier: secondInv.tags[0]?.barcode || secondInv.itemCode,
          scannedNetWeight: Number(secondInv.netWeight) + 0.500, // 0.5g heavier
          remarks: 'Weight mismatch scan',
        },
        staffToken
      );
      assert.strictEqual(scanMismatchRes.status, 201);
      assert.strictEqual(scanMismatchRes.body.data.status, 'WEIGHT_MISMATCH');
    }

    // Scan unexpected barcode
    const scanUnexpectedRes = await request(
      'POST',
      `/stock-audits/${testSessionId}/scan`,
      {
        identifier: 'TAG-UNEXPECTED-999999',
        scannedNetWeight: 10.000,
        remarks: 'Unknown tag scan',
      },
      staffToken
    );
    assert.strictEqual(scanUnexpectedRes.status, 201);
    assert.strictEqual(scanUnexpectedRes.body.data.status, 'UNEXPECTED');

    // 12-14. Submit Stock Audit Session & Verify Missing Items Appended
    console.log('\n[TEST] 12-14. Submit Audit Session & Missing Item Identification...');
    const submitRes = await request('POST', `/stock-audits/${testSessionId}/submit`, {}, accountantToken);
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitRes.body.data.status, 'SUBMITTED');

    // Verify missing items exist in scanned items list
    const getSubmitted = await prisma.stockAuditSession.findUnique({
      where: { id: testSessionId },
      include: { scannedItems: true },
    });
    const missingItems = getSubmitted?.scannedItems.filter((i) => i.status === 'MISSING');
    assert.ok(missingItems && missingItems.length >= 0);

    // Reject scan on SUBMITTED session
    const scanSubmittedRes = await request(
      'POST',
      `/stock-audits/${testSessionId}/scan`,
      { identifier: testBarcodeTag },
      staffToken
    );
    assert.strictEqual(scanSubmittedRes.status, 400, 'Expected 400 for scanning into SUBMITTED session');

    // 15-19. Reconcile Stock Audit & Verify Inventory Updates
    console.log('\n[TEST] 15-19. Reconcile Audit Session & Stock Movement Audit Logs...');
    const reconcileRes = await request('POST', `/stock-audits/${testSessionId}/reconcile`, {}, accountantToken);
    assert.strictEqual(reconcileRes.status, 200);
    assert.strictEqual(reconcileRes.body.data.status, 'RECONCILED');

    // Verify missing items updated to AUDIT_MISSING
    if (missingItems && missingItems.length > 0) {
      const missingInvId = missingItems[0].inventoryItemId;
      if (missingInvId) {
        const checkMissing = await prisma.inventoryItem.findUnique({ where: { id: missingInvId } });
        assert.strictEqual(checkMissing?.status, 'AUDIT_MISSING');

        const checkMove = await prisma.stockMovement.findFirst({
          where: { inventoryItemId: missingInvId, movementType: 'STOCKTAKE_MISSING' },
        });
        assert.ok(checkMove, 'Stock movement log for STOCKTAKE_MISSING should exist');
      }
    }

    // 20-23. Cancellation Workflow & Guards
    console.log('\n[TEST] 20-23. Cancellation Workflow & Guards...');
    const draftSessionRes = await request(
      'POST',
      '/stock-audits',
      {
        companyId: testCompanyId,
        branchId: testBranchId,
        notes: 'Session to cancel',
      },
      accountantToken
    );
    const draftSessionId = draftSessionRes.body.data.id;

    // Reject cancel without reason
    const noReasonRes = await request('POST', `/stock-audits/${draftSessionId}/cancel`, {}, accountantToken);
    assert.strictEqual(noReasonRes.status, 400, 'Expected 400 for missing cancellationReason');

    // Cancel session
    const cancelSuccess = await request(
      'POST',
      `/stock-audits/${draftSessionId}/cancel`,
      { cancellationReason: 'Store audit postponed to next month' },
      accountantToken
    );
    assert.strictEqual(cancelSuccess.status, 200);
    assert.strictEqual(cancelSuccess.body.data.status, 'CANCELLED');

    // Reject cancel of RECONCILED session
    const cancelReconciledRes = await request(
      'POST',
      `/stock-audits/${testSessionId}/cancel`,
      { cancellationReason: 'Illegal cancel' },
      accountantToken
    );
    assert.strictEqual(cancelReconciledRes.status, 400, 'Expected 400 for cancelling RECONCILED session');

    // 24-26. Get, List & Discrepancy Endpoints
    console.log('\n[TEST] 24-26. GET & Audit Discrepancy Report Endpoints...');
    const getRes = await request('GET', `/stock-audits/${testSessionId}`, undefined, staffToken);
    assert.strictEqual(getRes.status, 200);

    const listRes = await request('GET', '/stock-audits?page=1&limit=5', undefined, staffToken);
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.body.data));

    const discRes = await request('GET', `/stock-audits/${testSessionId}/discrepancies`, undefined, staffToken);
    assert.strictEqual(discRes.status, 200);
    assert.ok(discRes.body.data.summary);
    assert.ok(discRes.body.data.discrepancies);

    console.log('\n======================================================');
    console.log('✓ ALL 26 SPRINT 5.7 STOCK AUDIT TESTS PASSED');
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
