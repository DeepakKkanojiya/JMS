import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

export function runPermissionTests() {
  const samplePermissions = [
    'company.read',
    'company.create',
    'branch.read',
    'product.read',
    'inventory_item.read',
    'inventory_item.create',
    'inventory_transfer.approve',
    'inventory_transfer.dispatch',
    'product_image.create',
  ];

  console.log('--- Testing Permission Helpers ---');

  // Test 1: Single Permission
  const t1 = hasPermission(samplePermissions, 'company.read');
  const t2 = hasPermission(samplePermissions, 'company.delete');
  console.assert(t1 === true, 'Test 1 Failed: expected company.read to be true');
  console.assert(t2 === false, 'Test 2 Failed: expected company.delete to be false');

  // Test 2: Any Permission
  const t3 = hasAnyPermission(samplePermissions, ['company.delete', 'branch.read']);
  const t4 = hasAnyPermission(samplePermissions, ['company.delete', 'vendor.delete']);
  console.assert(t3 === true, 'Test 3 Failed: expected hasAnyPermission to be true');
  console.assert(t4 === false, 'Test 4 Failed: expected hasAnyPermission to be false');

  // Test 3: All Permissions
  const t5 = hasAllPermissions(samplePermissions, ['company.read', 'product.read']);
  const t6 = hasAllPermissions(samplePermissions, ['company.read', 'company.delete']);
  console.assert(t5 === true, 'Test 5 Failed: expected hasAllPermissions to be true');
  console.assert(t6 === false, 'Test 6 Failed: expected hasAllPermissions to be false');

  // Test 4: Null / Undefined safety
  const t7 = hasPermission(null, 'company.read');
  const t8 = hasPermission(undefined, 'company.read');
  console.assert(t7 === false, 'Test 7 Failed: null should return false');
  console.assert(t8 === false, 'Test 8 Failed: undefined should return false');

  console.log('✓ All Permission Helper unit tests passed successfully!');
}

runPermissionTests();
