import { prisma } from '../../src/database';

export async function seedGirviPermissions() {
  console.log('[SEED] Seeding Girvi Pawning Subsystem Permissions Catalog...');

  const girviPermissions = [
    { module: 'girvi', action: 'create', permissionKey: 'girvi.create', description: 'Create Self Girvi collateral loans' },
    { module: 'girvi', action: 'read', permissionKey: 'girvi.read', description: 'View Girvi loans, loan details, and pledged collateral' },
    { module: 'girvi', action: 'update', permissionKey: 'girvi.update', description: 'Update active or draft Girvi loans and add collateral items' },
    { module: 'girvi', action: 'approve', permissionKey: 'girvi.approve', description: 'Approve draft Girvi loans' },
    { module: 'girvi', action: 'cancel', permissionKey: 'girvi.cancel', description: 'Cancel active or draft Girvi loans with reason' },
    { module: 'girvi', action: 'interest.read', permissionKey: 'girvi.interest.read', description: 'View real-time Girvi loan interest accruals & financial summary' },
    { module: 'girvi', action: 'collection.create', permissionKey: 'girvi.collection.create', description: 'Record Girvi interest & principal payment collections' },
    { module: 'girvi', action: 'collection.read', permissionKey: 'girvi.collection.read', description: 'View Girvi collection ledger & payment history' },
    { module: 'girvi', action: 'collection.reverse', permissionKey: 'girvi.collection.reverse', description: 'Reverse Girvi collection with mandatory reason' },
    { module: 'girvi', action: 'renew', permissionKey: 'girvi.renew', description: 'Renew Girvi loan & extend due date with audit logging' },
    { module: 'girvi', action: 'settlement.create', permissionKey: 'girvi.settlement.create', description: 'Settle Girvi loan balance and trigger collateral jewellery release' },
    { module: 'girvi', action: 'settlement.read', permissionKey: 'girvi.settlement.read', description: 'View Girvi loan settlement ledger and financial closure details' },
    { module: 'girvi', action: 'release', permissionKey: 'girvi.release', description: 'Access and view released Girvi pledged collateral items' },
    { module: 'girvi', action: 'report.read', permissionKey: 'girvi.report.read', description: 'Access Girvi financial portfolio reports and audit trails' },
    // Phase 6.4: Third-Party Girvi Permissions

    { module: 'third_party_girvi', action: 'create', permissionKey: 'third_party_girvi.create', description: 'Create third-party lenders and third-party Girvi records' },
    { module: 'third_party_girvi', action: 'read', permissionKey: 'third_party_girvi.read', description: 'View third-party lenders and third-party Girvi records' },
    { module: 'third_party_girvi', action: 'update', permissionKey: 'third_party_girvi.update', description: 'Update draft third-party Girvi records and collaterals' },
    { module: 'third_party_girvi', action: 'approve', permissionKey: 'third_party_girvi.approve', description: 'Approve and activate third-party Girvi records' },
    { module: 'third_party_girvi', action: 'close', permissionKey: 'third_party_girvi.close', description: 'Close third-party Girvi records and release collateral' },
    { module: 'third_party_girvi', action: 'cancel', permissionKey: 'third_party_girvi.cancel', description: 'Cancel draft or active third-party Girvi records' },
    { module: 'third_party_girvi', action: 'release', permissionKey: 'third_party_girvi.release', description: 'Release specific third-party Girvi collateral items' },
  ];

  const permissionMap = new Map<string, string>();
  for (const perm of girviPermissions) {
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

  const allGirviKeys = girviPermissions.map((p) => p.permissionKey);

  await assignPermissionsToRole('OWNER', allGirviKeys);
  await assignPermissionsToRole('SUPER_ADMIN', allGirviKeys);
  await assignPermissionsToRole('ADMIN', allGirviKeys);
  await assignPermissionsToRole('BRANCH_MANAGER', allGirviKeys);
  await assignPermissionsToRole('ACCOUNTANT', [
    'girvi.create',
    'girvi.read',
    'girvi.update',
    'girvi.interest.read',
    'girvi.collection.create',
    'girvi.collection.read',
    'girvi.collection.reverse',
    'girvi.renew',
    'girvi.settlement.create',
    'girvi.settlement.read',
    'girvi.release',
    'girvi.report.read',
    'third_party_girvi.create',

    'third_party_girvi.read',
    'third_party_girvi.update',
    'third_party_girvi.approve',
    'third_party_girvi.close',
    'third_party_girvi.cancel',
    'third_party_girvi.release',
  ]);
  await assignPermissionsToRole('SALES_EXECUTIVE', [
    'girvi.read',
    'girvi.interest.read',
    'girvi.collection.read',
    'girvi.release',
    'third_party_girvi.read',
    'third_party_girvi.release',
  ]);

  console.log('✓ Girvi & Third-Party Girvi Permissions Seeding Complete');
}
