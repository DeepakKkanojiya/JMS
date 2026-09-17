import { prisma } from '../../src/database';

export async function seedMasterPermissions() {
  console.log('[SEED] Seeding Master Permissions Catalog...');

  const masterPermissions = [
    // IAM - Users
    { module: 'user', action: 'create', permissionKey: 'user.create', description: 'Create system user account' },
    { module: 'user', action: 'read', permissionKey: 'user.read', description: 'View user accounts and profiles' },
    { module: 'user', action: 'update', permissionKey: 'user.update', description: 'Update user account details' },
    { module: 'user', action: 'delete', permissionKey: 'user.delete', description: 'Delete user account' },

    // IAM - Roles
    { module: 'role', action: 'create', permissionKey: 'role.create', description: 'Create system security role' },
    { module: 'role', action: 'read', permissionKey: 'role.read', description: 'View role definitions' },
    { module: 'role', action: 'update', permissionKey: 'role.update', description: 'Update role definitions and permissions' },
    { module: 'role', action: 'delete', permissionKey: 'role.delete', description: 'Delete system security role' },
    { module: 'role', action: 'assign_permission', permissionKey: 'role.assign_permission', description: 'Assign or revoke role permissions' },

    // IAM - Permissions
    { module: 'permission', action: 'create', permissionKey: 'permission.create', description: 'Create security permission' },
    { module: 'permission', action: 'read', permissionKey: 'permission.read', description: 'View security permissions catalog' },
    { module: 'permission', action: 'update', permissionKey: 'permission.update', description: 'Update permission details' },
    { module: 'permission', action: 'delete', permissionKey: 'permission.delete', description: 'Delete security permission' },

    // Company
    { module: 'company', action: 'create', permissionKey: 'company.create', description: 'Create enterprise company profile' },
    { module: 'company', action: 'read', permissionKey: 'company.read', description: 'View company details and listings' },
    { module: 'company', action: 'update', permissionKey: 'company.update', description: 'Update company profile' },
    { module: 'company', action: 'delete', permissionKey: 'company.delete', description: 'Delete company profile' },

    // Branch
    { module: 'branch', action: 'create', permissionKey: 'branch.create', description: 'Create company branch showroom' },
    { module: 'branch', action: 'read', permissionKey: 'branch.read', description: 'View branch details and listings' },
    { module: 'branch', action: 'update', permissionKey: 'branch.update', description: 'Update branch showroom profile' },
    { module: 'branch', action: 'delete', permissionKey: 'branch.delete', description: 'Delete branch showroom' },

    // Employee
    { module: 'employee', action: 'create', permissionKey: 'employee.create', description: 'Create staff employee record' },
    { module: 'employee', action: 'read', permissionKey: 'employee.read', description: 'View employee profiles' },
    { module: 'employee', action: 'update', permissionKey: 'employee.update', description: 'Update employee details' },
    { module: 'employee', action: 'delete', permissionKey: 'employee.delete', description: 'Delete employee record' },

    // Customer
    { module: 'customer', action: 'create', permissionKey: 'customer.create', description: 'Create customer profile' },
    { module: 'customer', action: 'read', permissionKey: 'customer.read', description: 'View customer details and search' },
    { module: 'customer', action: 'update', permissionKey: 'customer.update', description: 'Update customer profile' },
    { module: 'customer', action: 'delete', permissionKey: 'customer.delete', description: 'Delete customer profile' },

    // Vendor
    { module: 'vendor', action: 'create', permissionKey: 'vendor.create', description: 'Create supplier vendor record' },
    { module: 'vendor', action: 'read', permissionKey: 'vendor.read', description: 'View vendor details and listings' },
    { module: 'vendor', action: 'update', permissionKey: 'vendor.update', description: 'Update vendor details' },
    { module: 'vendor', action: 'delete', permissionKey: 'vendor.delete', description: 'Delete vendor record' },

    // Product Category
    { module: 'product_category', action: 'create', permissionKey: 'product_category.create', description: 'Create product category' },
    { module: 'product_category', action: 'read', permissionKey: 'product_category.read', description: 'View product category catalog' },
    { module: 'product_category', action: 'update', permissionKey: 'product_category.update', description: 'Update product category' },
    { module: 'product_category', action: 'delete', permissionKey: 'product_category.delete', description: 'Delete product category' },

    // Product Sub-Category
    { module: 'product_sub_category', action: 'create', permissionKey: 'product_sub_category.create', description: 'Create product sub-category' },
    { module: 'product_sub_category', action: 'read', permissionKey: 'product_sub_category.read', description: 'View product sub-categories' },
    { module: 'product_sub_category', action: 'update', permissionKey: 'product_sub_category.update', description: 'Update product sub-category' },
    { module: 'product_sub_category', action: 'delete', permissionKey: 'product_sub_category.delete', description: 'Delete product sub-category' },

    // Product
    { module: 'product', action: 'create', permissionKey: 'product.create', description: 'Create jewellery product master' },
    { module: 'product', action: 'read', permissionKey: 'product.read', description: 'View product catalog and details' },
    { module: 'product', action: 'update', permissionKey: 'product.update', description: 'Update product details' },
    { module: 'product', action: 'delete', permissionKey: 'product.delete', description: 'Delete product master' },

    // Inventory Item
    { module: 'inventory', action: 'create', permissionKey: 'inventory_item.create', description: 'Create physical inventory item and tag' },
    { module: 'inventory', action: 'read', permissionKey: 'inventory_item.read', description: 'View physical inventory items and history' },
    { module: 'inventory', action: 'update', permissionKey: 'inventory_item.update', description: 'Update physical inventory item attributes' },
    { module: 'inventory', action: 'delete', permissionKey: 'inventory_item.delete', description: 'Delete physical inventory item' },

    // Stock Movement
    { module: 'stock_movement', action: 'create', permissionKey: 'stock_movement.create', description: 'Create physical stock movement record' },
    { module: 'stock_movement', action: 'read', permissionKey: 'stock_movement.read', description: 'View stock movement ledger and history' },

    // Inventory Tag
    { module: 'inventory_tag', action: 'create', permissionKey: 'inventory_tag.create', description: 'Create or generate inventory tag' },
    { module: 'inventory_tag', action: 'read', permissionKey: 'inventory_tag.read', description: 'View inventory tag and perform barcode/QR lookup' },
    { module: 'inventory_tag', action: 'update', permissionKey: 'inventory_tag.update', description: 'Update, regenerate, or activate/deactivate inventory tag' },

    // Inventory Transfer
    { module: 'inventory_transfer', action: 'create', permissionKey: 'inventory_transfer.create', description: 'Create branch stock transfer request' },
    { module: 'inventory_transfer', action: 'read', permissionKey: 'inventory_transfer.read', description: 'View branch transfer requests and history' },
    { module: 'inventory_transfer', action: 'approve', permissionKey: 'inventory_transfer.approve', description: 'Approve pending transfer request' },
    { module: 'inventory_transfer', action: 'reject', permissionKey: 'inventory_transfer.reject', description: 'Reject pending transfer request' },
    { module: 'inventory_transfer', action: 'dispatch', permissionKey: 'inventory_transfer.dispatch', description: 'Dispatch approved transfer request' },
    { module: 'inventory_transfer', action: 'receive', permissionKey: 'inventory_transfer.receive', description: 'Receive dispatched transfer request' },

    // Product Images
    { module: 'product_image', action: 'create', permissionKey: 'product_image.create', description: 'Upload product master image' },
    { module: 'product_image', action: 'read', permissionKey: 'product_image.read', description: 'View product master images' },
    { module: 'product_image', action: 'update', permissionKey: 'product_image.update', description: 'Update product master image metadata' },
    { module: 'product_image', action: 'delete', permissionKey: 'product_image.delete', description: 'Delete product master image' },

    // Inventory Item Images
    { module: 'inventory_item_image', action: 'create', permissionKey: 'inventory_item_image.create', description: 'Upload physical inventory item photograph' },
    { module: 'inventory_item_image', action: 'read', permissionKey: 'inventory_item_image.read', description: 'View physical inventory item photographs' },
    { module: 'inventory_item_image', action: 'update', permissionKey: 'inventory_item_image.update', description: 'Update physical inventory item photograph metadata' },
    { module: 'inventory_item_image', action: 'delete', permissionKey: 'inventory_item_image.delete', description: 'Delete physical inventory item photograph' },
  ];

  // Upsert all permissions
  const permissionMap = new Map<string, string>();
  for (const perm of masterPermissions) {
    const createdPerm = await prisma.permission.upsert({
      where: { permissionKey: perm.permissionKey },
      update: { description: perm.description, module: perm.module, action: perm.action },
      create: perm,
    });
    permissionMap.set(perm.permissionKey, createdPerm.id);
  }

  // Fetch all existing roles
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

  const allMasterKeys = masterPermissions.map((p) => p.permissionKey);

  // 1. OWNER, SUPER_ADMIN & ADMIN: All Master Permissions
  await assignPermissionsToRole('OWNER', allMasterKeys);
  await assignPermissionsToRole('SUPER_ADMIN', allMasterKeys);
  await assignPermissionsToRole('ADMIN', allMasterKeys);

  // 2. BRANCH_MANAGER: Operational and showroom management
  const managerKeys = allMasterKeys.filter(
    (k) => !k.startsWith('role.') && !k.startsWith('permission.') && !k.startsWith('company.delete')
  );
  await assignPermissionsToRole('BRANCH_MANAGER', managerKeys);

  // 3. INVENTORY_MANAGER: Vault & physical stock control
  const inventoryManagerKeys = [
    'product.read',
    'product.create',
    'product.update',
    'product_category.read',
    'product_sub_category.read',
    'product_image.create',
    'product_image.read',
    'product_image.update',
    'product_image.delete',
    'inventory_item.create',
    'inventory_item.read',
    'inventory_item.update',
    'inventory_item.delete',
    'inventory_tag.create',
    'inventory_tag.read',
    'inventory_tag.update',
    'stock_movement.create',
    'stock_movement.read',
    'inventory_transfer.create',
    'inventory_transfer.read',
    'inventory_transfer.dispatch',
    'inventory_transfer.receive',
    'inventory_item_image.create',
    'inventory_item_image.read',
    'inventory_item_image.update',
    'inventory_item_image.delete',
    'vendor.read',
    'branch.read',
    'company.read',
  ];
  await assignPermissionsToRole('INVENTORY_MANAGER', inventoryManagerKeys);

  // 4. CASHIER & STAFF: Billing counter & catalog search
  const cashierStaffKeys = [
    'customer.read',
    'customer.create',
    'customer.update',
    'product.read',
    'product_category.read',
    'product_sub_category.read',
    'inventory_item.read',
    'inventory_tag.read',
    'product_image.read',
    'inventory_item_image.read',
    'branch.read',
    'company.read',
    'employee.read',
  ];
  await assignPermissionsToRole('CASHIER', cashierStaffKeys);
  await assignPermissionsToRole('STAFF', cashierStaffKeys);

  // 5. SALESPERSON: Sales floor & customer quote
  const salespersonKeys = [
    'customer.read',
    'customer.create',
    'product.read',
    'product_category.read',
    'product_sub_category.read',
    'inventory_item.read',
    'inventory_tag.read',
    'product_image.read',
    'branch.read',
    'employee.read',
  ];
  await assignPermissionsToRole('SALESPERSON', salespersonKeys);

  // 6. ACCOUNTANT: Tax, customer, vendor ledgers
  const accountantKeys = [
    'customer.read',
    'vendor.read',
    'branch.read',
    'company.read',
    'product.read',
    'inventory_item.read',
    'stock_movement.read',
  ];
  await assignPermissionsToRole('ACCOUNTANT', accountantKeys);

  // 7. KARIGAR_SUPERVISOR: Workshop & stock intake
  const karigarKeys = [
    'product.read',
    'inventory_item.read',
    'stock_movement.create',
    'stock_movement.read',
    'branch.read',
  ];
  await assignPermissionsToRole('KARIGAR_SUPERVISOR', karigarKeys);

  console.log('[PASS] Master Permissions Catalog Seeded & Role Matrix Assigned.');
}
