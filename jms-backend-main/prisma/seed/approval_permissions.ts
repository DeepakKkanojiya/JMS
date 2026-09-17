import { prisma } from '../../src/database';

export async function seedApprovalPermissions() {
  console.log('[SEED] Seeding Sell on Approval Subsystem Permissions Catalog...');

  const approvalPermissions = [
    { module: 'approval', action: 'create', permissionKey: 'approval.create', description: 'Create Sell on Approval slips' },
    { module: 'approval', action: 'read', permissionKey: 'approval.read', description: 'View Sell on Approval slips and items' },
    { module: 'approval', action: 'update', permissionKey: 'approval.update', description: 'Update draft Sell on Approval slips' },
    { module: 'approval', action: 'issue', permissionKey: 'approval.issue', description: 'Issue Sell on Approval slips to customer' },
    { module: 'approval', action: 'cancel', permissionKey: 'approval.cancel', description: 'Cancel draft Sell on Approval slips' },

    // Phase 7.3 Deposit Permissions
    { module: 'approval', action: 'deposit.create', permissionKey: 'approval.deposit.create', description: 'Record Sell on Approval security deposits' },
    { module: 'approval', action: 'deposit.read', permissionKey: 'approval.deposit.read', description: 'View Sell on Approval deposit ledgers and financial summaries' },
    { module: 'approval', action: 'deposit.reverse', permissionKey: 'approval.deposit.reverse', description: 'Reverse Sell on Approval deposit payments with mandatory reason' },

    // Phase 7.4 Return & Purchase Permissions
    { module: 'approval', action: 'return', permissionKey: 'approval.return', description: 'Process customer jewellery return for approval slip (ON_APPROVAL -> AVAILABLE)' },
    { module: 'approval', action: 'purchase', permissionKey: 'approval.purchase', description: 'Convert approval slip to completed purchase invoice (ON_APPROVAL -> SOLD)' },

    // Phase 7.5 Report Permissions
    { module: 'approval', action: 'report.read', permissionKey: 'approval.report.read', description: 'View Sell on Approval reports, metrics, registers, and 360 audit trails' },
  ];

  const permissionMap = new Map<string, string>();
  for (const perm of approvalPermissions) {
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

  const allKeys = approvalPermissions.map((p) => p.permissionKey);

  await assignPermissionsToRole('OWNER', allKeys);
  await assignPermissionsToRole('SUPER_ADMIN', allKeys);
  await assignPermissionsToRole('ADMIN', allKeys);
  await assignPermissionsToRole('BRANCH_MANAGER', allKeys);
  await assignPermissionsToRole('ACCOUNTANT', allKeys);
  await assignPermissionsToRole('SALES_EXECUTIVE', [
    'approval.create',
    'approval.read',
    'approval.update',
    'approval.issue',
    'approval.deposit.create',
    'approval.deposit.read',
    'approval.return',
    'approval.purchase',
    'approval.report.read',
  ]);

  console.log('✓ Sell on Approval Reports & Audit Permissions Seeding Complete');
}
