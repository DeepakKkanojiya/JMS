import { prisma } from '../../src/database';

export async function seedSalesPermissions() {
  console.log('[SEED] Seeding Sales & Metal Rate Permissions Catalog...');

  const salesPermissions = [
    // Sales Invoice
    { module: 'sales', action: 'create', permissionKey: 'sales_invoice.create', description: 'Create draft sales invoice' },
    { module: 'sales', action: 'read', permissionKey: 'sales_invoice.read', description: 'View sales invoices, invoice line items, and directories' },
    { module: 'sales', action: 'update', permissionKey: 'sales_invoice.update', description: 'Update draft sales invoice' },
    { module: 'sales', action: 'confirm', permissionKey: 'sales_invoice.confirm', description: 'Confirm draft sales invoice' },
    { module: 'sales', action: 'cancel', permissionKey: 'sales_invoice.cancel', description: 'Cancel draft or confirmed sales invoice' },

    // Metal Rate Engine Permissions
    { module: 'metal_rate', action: 'create', permissionKey: 'metal_rate.create', description: 'Create company daily metal rates' },
    { module: 'metal_rate', action: 'read', permissionKey: 'metal_rate.read', description: 'View metal rates, history, and calculate metal values' },
    { module: 'metal_rate', action: 'update', permissionKey: 'metal_rate.update', description: 'Update, deactivate, or sync live metal rates' },

    // Making Charge Permissions
    { module: 'making_charge', action: 'create', permissionKey: 'making_charge.create', description: 'Create making charge configurations' },
    { module: 'making_charge', action: 'read', permissionKey: 'making_charge.read', description: 'View making charge configurations and history' },
    { module: 'making_charge', action: 'update', permissionKey: 'making_charge.update', description: 'Update or deactivate making charge configurations' },

    // Tax Rate Permissions
    { module: 'tax_rate', action: 'create', permissionKey: 'tax_rate.create', description: 'Create tax rate configurations' },
    { module: 'tax_rate', action: 'read', permissionKey: 'tax_rate.read', description: 'View tax rate configurations and history' },
    { module: 'tax_rate', action: 'update', permissionKey: 'tax_rate.update', description: 'Update tax rate configurations' },

    // Sales Payment & Settlement Permissions
    { module: 'sales_payment', action: 'create', permissionKey: 'sales_payment.create', description: 'Record payments for confirmed sales invoices' },
    { module: 'sales_payment', action: 'read', permissionKey: 'sales_payment.read', description: 'View sales payments, invoice payment history, and payment summaries' },
    { module: 'sales_payment', action: 'reverse', permissionKey: 'sales_payment.reverse', description: 'Reverse completed sales payments with audit reason' },

    // Gold Exchange Permissions
    { module: 'gold_exchange', action: 'create', permissionKey: 'gold_exchange.create', description: 'Create customer gold exchange requests for draft sales invoices' },
    { module: 'gold_exchange', action: 'read', permissionKey: 'gold_exchange.read', description: 'View customer gold exchange records and history' },
    { module: 'gold_exchange', action: 'update', permissionKey: 'gold_exchange.update', description: 'Update customer gold exchange items in draft state' },
    { module: 'gold_exchange', action: 'value', permissionKey: 'gold_exchange.value', description: 'Calculate valuation and snapshot metal rates for gold exchanges' },
    { module: 'gold_exchange', action: 'apply', permissionKey: 'gold_exchange.apply', description: 'Apply valued exchange credit to draft sales invoices' },
    { module: 'gold_exchange', action: 'cancel', permissionKey: 'gold_exchange.cancel', description: 'Cancel customer gold exchange requests' },

    // Sales Return Permissions
    { module: 'sales_return', action: 'create', permissionKey: 'sales_return.create', description: 'Create customer sales return requests for confirmed invoices' },
    { module: 'sales_return', action: 'read', permissionKey: 'sales_return.read', description: 'View sales return records, item breakdowns, and return history' },
    { module: 'sales_return', action: 'update', permissionKey: 'sales_return.update', description: 'Update customer sales return requests in requested state' },
    { module: 'sales_return', action: 'approve', permissionKey: 'sales_return.approve', description: 'Approve requested sales return requests' },
    { module: 'sales_return', action: 'process', permissionKey: 'sales_return.process', description: 'Process approved sales returns, restoring items to inventory' },
    { module: 'sales_return', action: 'cancel', permissionKey: 'sales_return.cancel', description: 'Cancel customer sales return requests' },

    // Sales Refund Permissions
    { module: 'sales_refund', action: 'create', permissionKey: 'sales_refund.create', description: 'Create and issue refund records for processed sales returns' },
    { module: 'sales_refund', action: 'read', permissionKey: 'sales_refund.read', description: 'View sales refund ledgers, return refund histories, and details' },
    { module: 'sales_refund', action: 'reverse', permissionKey: 'sales_refund.reverse', description: 'Reverse sales refunds with mandatory audit reason' },
  ];

  const permissionMap = new Map<string, string>();
  for (const perm of salesPermissions) {
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

  const allSalesKeys = salesPermissions.map((p) => p.permissionKey);

  // 1. OWNER, SUPER_ADMIN & ADMIN: All sales, rates, pricing, payment, returns, refund permissions
  await assignPermissionsToRole('OWNER', allSalesKeys);
  await assignPermissionsToRole('SUPER_ADMIN', allSalesKeys);
  await assignPermissionsToRole('ADMIN', allSalesKeys);

  // 2. BRANCH_MANAGER: Showroom sales, rates, returns approval, pos, refunds
  await assignPermissionsToRole('BRANCH_MANAGER', allSalesKeys);

  // 3. CASHIER & STAFF: Billing counter POS, rate locking, customer invoice creation, payments, gold exchange intake
  const cashierStaffKeys = [
    'sales_invoice.create',
    'sales_invoice.read',
    'sales_invoice.update',
    'sales_invoice.confirm',
    'metal_rate.read',
    'making_charge.read',
    'tax_rate.read',
    'sales_payment.create',
    'sales_payment.read',
    'gold_exchange.create',
    'gold_exchange.read',
    'gold_exchange.update',
    'gold_exchange.value',
    'gold_exchange.apply',
    'sales_return.create',
    'sales_return.read',
  ];
  await assignPermissionsToRole('CASHIER', cashierStaffKeys);
  await assignPermissionsToRole('STAFF', cashierStaffKeys);

  // 4. SALESPERSON: Quotations, draft invoice creation, rates viewing
  const salespersonKeys = [
    'sales_invoice.create',
    'sales_invoice.read',
    'sales_invoice.update',
    'metal_rate.read',
    'making_charge.read',
    'tax_rate.read',
  ];
  await assignPermissionsToRole('SALESPERSON', salespersonKeys);

  // 5. ACCOUNTANT: Payments, ledger monitoring, refunds, metal rates & tax rates auditing
  const accountantKeys = [
    'sales_invoice.read',
    'sales_payment.create',
    'sales_payment.read',
    'sales_payment.reverse',
    'sales_refund.create',
    'sales_refund.read',
    'sales_refund.reverse',
    'sales_return.read',
    'metal_rate.read',
    'tax_rate.read',
    'making_charge.read',
    'gold_exchange.read',
  ];
  await assignPermissionsToRole('ACCOUNTANT', accountantKeys);

  // 6. KARIGAR_SUPERVISOR: Gold exchange evaluation & repair/custom gold work
  const karigarKeys = [
    'gold_exchange.create',
    'gold_exchange.read',
    'gold_exchange.update',
    'gold_exchange.value',
    'metal_rate.read',
  ];
  await assignPermissionsToRole('KARIGAR_SUPERVISOR', karigarKeys);

  console.log('[PASS] Sales & Metal Rate Permissions Catalog Seeded & Role Matrix Assigned.');
}
