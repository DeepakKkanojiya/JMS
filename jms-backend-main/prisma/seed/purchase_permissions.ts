import { prisma } from '../../src/database';

export async function seedPurchasePermissions() {
  console.log('[SEED] Seeding Purchase Order Permissions Catalog...');

  const purchasePermissions = [
    { module: 'purchase', action: 'create', permissionKey: 'purchase.create', description: 'Create draft purchase order' },
    { module: 'purchase', action: 'read', permissionKey: 'purchase.read', description: 'View purchase orders, line items, and order history' },
    { module: 'purchase', action: 'update', permissionKey: 'purchase.update', description: 'Update draft purchase order' },
    { module: 'purchase', action: 'submit', permissionKey: 'purchase.submit', description: 'Submit draft purchase order for managerial approval' },
    { module: 'purchase', action: 'approve', permissionKey: 'purchase.approve', description: 'Approve submitted purchase order' },
    { module: 'purchase', action: 'cancel', permissionKey: 'purchase.cancel', description: 'Cancel purchase order with cancellation reason' },
    { module: 'purchase', action: 'receive', permissionKey: 'purchase.receive', description: 'Receive physical stock against purchase orders' },
    { module: 'purchase', action: 'receipt.read', permissionKey: 'purchase.receipt.read', description: 'View purchase receipts' },
    { module: 'purchase_bill', action: 'create', permissionKey: 'purchase_bill.create', description: 'Create draft purchase bill' },
    { module: 'purchase_bill', action: 'read', permissionKey: 'purchase_bill.read', description: 'View purchase bills and bill summaries' },
    { module: 'purchase_bill', action: 'update', permissionKey: 'purchase_bill.update', description: 'Update draft purchase bill' },
    { module: 'purchase_bill', action: 'submit', permissionKey: 'purchase_bill.submit', description: 'Submit draft purchase bill' },
    { module: 'purchase_bill', action: 'approve', permissionKey: 'purchase_bill.approve', description: 'Approve submitted purchase bill' },
    { module: 'purchase_bill', action: 'cancel', permissionKey: 'purchase_bill.cancel', description: 'Cancel purchase bill' },
    { module: 'vendor_payment', action: 'create', permissionKey: 'vendor_payment.create', description: 'Create vendor payment against purchase bill' },
    { module: 'vendor_payment', action: 'read', permissionKey: 'vendor_payment.read', description: 'View vendor payments, payment summaries, and payable ledgers' },
    { module: 'vendor_payment', action: 'reverse', permissionKey: 'vendor_payment.reverse', description: 'Reverse completed vendor payment' },
    { module: 'purchase_return', action: 'create', permissionKey: 'purchase_return.create', description: 'Create draft purchase return' },
    { module: 'purchase_return', action: 'read', permissionKey: 'purchase_return.read', description: 'View purchase returns and debit notes' },
    { module: 'purchase_return', action: 'update', permissionKey: 'purchase_return.update', description: 'Update draft purchase return' },
    { module: 'purchase_return', action: 'submit', permissionKey: 'purchase_return.submit', description: 'Submit draft purchase return' },
    { module: 'purchase_return', action: 'approve', permissionKey: 'purchase_return.approve', description: 'Approve submitted purchase return' },
    { module: 'purchase_return', action: 'process', permissionKey: 'purchase_return.process', description: 'Process approved purchase return, remove inventory, issue debit note' },
    { module: 'purchase_return', action: 'cancel', permissionKey: 'purchase_return.cancel', description: 'Cancel purchase return' },
    { module: 'debit_note', action: 'read', permissionKey: 'debit_note.read', description: 'View vendor debit notes' },
    { module: 'job_work', action: 'create', permissionKey: 'job_work.create', description: 'Create draft job work order' },
    { module: 'job_work', action: 'read', permissionKey: 'job_work.read', description: 'View job work orders and Karigar ledger' },
    { module: 'job_work', action: 'update', permissionKey: 'job_work.update', description: 'Update draft job work order' },
    { module: 'job_work', action: 'submit', permissionKey: 'job_work.submit', description: 'Submit draft job work order' },
    { module: 'job_work', action: 'assign', permissionKey: 'job_work.assign', description: 'Assign job work order to Karigar' },
    { module: 'job_work', action: 'issue', permissionKey: 'job_work.issue', description: 'Issue raw material or stock to Karigar' },
    { module: 'job_work', action: 'receive', permissionKey: 'job_work.receive', description: 'Receive finished goods or returned material from Karigar' },
    { module: 'job_work', action: 'cancel', permissionKey: 'job_work.cancel', description: 'Cancel job work order' },
    { module: 'stock_audit', action: 'create', permissionKey: 'stock_audit.create', description: 'Create Stock Audit session' },
    { module: 'stock_audit', action: 'read', permissionKey: 'stock_audit.read', description: 'View Stock Audit sessions and discrepancy reports' },
    { module: 'stock_audit', action: 'scan', permissionKey: 'stock_audit.scan', description: 'Scan physical items during stocktake' },
    { module: 'stock_audit', action: 'submit', permissionKey: 'stock_audit.submit', description: 'Submit completed Stock Audit session' },
    { module: 'stock_audit', action: 'reconcile', permissionKey: 'stock_audit.reconcile', description: 'Reconcile Stock Audit discrepancies and adjust inventory' },
    { module: 'stock_audit', action: 'cancel', permissionKey: 'stock_audit.cancel', description: 'Cancel Stock Audit session' },
  ];

  const permissionMap = new Map<string, string>();
  for (const perm of purchasePermissions) {
    const createdPerm = await prisma.permission.upsert({
      where: { permissionKey: perm.permissionKey },
      update: { description: perm.description, module: perm.module, action: perm.action },
      create: perm,
    });
    permissionMap.set(perm.permissionKey, createdPerm.id);
  }

  const allRoles = await prisma.role.findMany();
  const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));

  const assignPermissionsToRole = async (roleName: string, permissionKeys: string[]) => {
    const roleId = roleMap.get(roleName);
    if (!roleId) return;

    for (const key of permissionKeys) {
      const permId = permissionMap.get(key);
      if (!permId) continue;

      const existing = await prisma.rolePermission.findFirst({
        where: { roleId, permissionId: permId },
      });
      if (!existing) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId: permId },
        });
      }
    }
  };

  const allPurchaseKeys = purchasePermissions.map((p) => p.permissionKey);

  // 1. OWNER, SUPER_ADMIN & ADMIN: Full purchase procurement permissions
  await assignPermissionsToRole('OWNER', allPurchaseKeys);
  await assignPermissionsToRole('SUPER_ADMIN', allPurchaseKeys);
  await assignPermissionsToRole('ADMIN', allPurchaseKeys);

  // 2. BRANCH_MANAGER: Store showroom procurement & approval & receiving
  await assignPermissionsToRole('BRANCH_MANAGER', allPurchaseKeys);

  // 3. ACCOUNTANT: Purchase order creation, review, and submission, read receipts, and purchase bills
  const accountantKeys = [
    'purchase.create',
    'purchase.read',
    'purchase.update',
    'purchase.submit',
    'purchase.receipt.read',
    'purchase_bill.create',
    'purchase_bill.read',
    'purchase_bill.update',
    'purchase_bill.submit',
    'purchase_bill.approve',
    'purchase_bill.cancel',
    'vendor_payment.create',
    'vendor_payment.read',
    'vendor_payment.reverse',
    'purchase_return.create',
    'purchase_return.read',
    'purchase_return.update',
    'purchase_return.submit',
    'purchase_return.approve',
    'purchase_return.process',
    'purchase_return.cancel',
    'debit_note.read',
    'job_work.create',
    'job_work.read',
    'job_work.update',
    'job_work.submit',
    'job_work.assign',
    'job_work.issue',
    'job_work.receive',
    'job_work.cancel',
    'stock_audit.create',
    'stock_audit.read',
    'stock_audit.scan',
    'stock_audit.submit',
    'stock_audit.reconcile',
    'stock_audit.cancel',
  ];
  await assignPermissionsToRole('ACCOUNTANT', accountantKeys);

  // 4. KARIGAR SUPERVISOR: Full job work operations
  const karigarKeys = [
    'job_work.create',
    'job_work.read',
    'job_work.update',
    'job_work.submit',
    'job_work.assign',
    'job_work.issue',
    'job_work.receive',
    'job_work.cancel',
    'purchase.read',
    'purchase.receipt.read',
  ];
  await assignPermissionsToRole('KARIGAR_SUPERVISOR', karigarKeys);

  // 5. STAFF & SALESPERSON: View purchase orders, bills, payments, returns, job work & scan audit items
  const staffKeys = [
    'purchase.read',
    'purchase.receipt.read',
    'purchase_bill.read',
    'vendor_payment.read',
    'purchase_return.read',
    'debit_note.read',
    'job_work.read',
    'stock_audit.read',
    'stock_audit.scan',
  ];
  await assignPermissionsToRole('STAFF', staffKeys);
  await assignPermissionsToRole('SALESPERSON', staffKeys);
  await assignPermissionsToRole('CASHIER', staffKeys);

  console.log('[PASS] Purchase Order Permissions Catalog Seeded & Role Matrix Assigned.');
}
