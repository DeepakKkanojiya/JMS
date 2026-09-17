import assert from 'assert';
import fs from 'fs';
import path from 'path';

async function runPostmanTests() {
  console.log('[TEST] Starting Sprint 2.5 Postman Collection & Environment Verification...');

  const collectionPath = path.resolve(process.cwd(), 'postman/IAM.postman_collection.json');
  const localEnvPath = path.resolve(process.cwd(), 'postman/Local.postman_environment.json');
  const railwayEnvPath = path.resolve(process.cwd(), 'postman/Railway.postman_environment.json');
  const readmePath = path.resolve(process.cwd(), 'postman/README.md');

  // 1. Verify file existence
  console.log('[TEST] 1. Verifying file existence...');
  assert.ok(fs.existsSync(collectionPath), 'IAM.postman_collection.json should exist');
  assert.ok(fs.existsSync(localEnvPath), 'Local.postman_environment.json should exist');
  assert.ok(fs.existsSync(railwayEnvPath), 'Railway.postman_environment.json should exist');
  assert.ok(fs.existsSync(readmePath), 'README.md should exist');
  console.log('[PASS] Postman collection, environment, and README files exist.');

  // 2. Verify Local Environment JSON format and variables
  console.log('[TEST] 2. Verifying Postman environment variables...');
  const localData = JSON.parse(fs.readFileSync(localEnvPath, 'utf8'));
  assert.ok(localData.name.includes('Local'));
  const varKeys = localData.values.map((v: any) => v.key);
  assert.ok(varKeys.includes('baseUrl'), 'baseUrl variable missing');
  assert.ok(varKeys.includes('accessToken'), 'accessToken variable missing');
  assert.ok(varKeys.includes('refreshToken'), 'refreshToken variable missing');
  assert.ok(varKeys.includes('companyId'), 'companyId variable missing');
  assert.ok(varKeys.includes('branchId'), 'branchId variable missing');
  assert.ok(varKeys.includes('employeeId'), 'employeeId variable missing');
  assert.ok(varKeys.includes('customerId'), 'customerId variable missing');
  assert.ok(varKeys.includes('vendorId'), 'vendorId variable missing');
  assert.ok(varKeys.includes('productCategoryId'), 'productCategoryId variable missing');
  assert.ok(varKeys.includes('productSubCategoryId'), 'productSubCategoryId variable missing');
  assert.ok(varKeys.includes('productId'), 'productId variable missing');
  assert.ok(varKeys.includes('inventoryItemId'), 'inventoryItemId variable missing');
  assert.ok(varKeys.includes('stockMovementId'), 'stockMovementId variable missing');
  console.log('[PASS] Postman environment variables validated successfully.');

  // 3. Verify Collection JSON structure & Phase 2/3 folders
  console.log('[TEST] 3. Verifying Collection JSON structure & folder names...');
  const colData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  assert.ok(colData.info.name.includes('Jewellery ERP'));
  const folderNames = colData.item.map((item: any) => item.name);

  assert.ok(folderNames.includes('1. Authentication & Session'), '1. Authentication & Session folder missing');
  assert.ok(folderNames.includes('2. Role Management'), '2. Role Management folder missing');
  assert.ok(folderNames.includes('3. User Management'), '3. User Management folder missing');
  assert.ok(folderNames.includes('4. Permissions Catalog'), '4. Permissions Catalog folder missing');
  assert.ok(folderNames.includes('5. Companies & Organizations'), '5. Companies & Organizations folder missing');
  assert.ok(folderNames.includes('6. Store Branches & Showrooms'), '6. Store Branches & Showrooms folder missing');
  assert.ok(folderNames.includes('7. Employees & Staff'), '7. Employees & Staff folder missing');
  assert.ok(folderNames.includes('8. Customers (CRM)'), '8. Customers (CRM) folder missing');
  assert.ok(folderNames.includes('9. Customer Addresses'), '9. Customer Addresses folder missing');
  assert.ok(folderNames.includes('10. Customer KYC Documents'), '10. Customer KYC Documents folder missing');
  assert.ok(folderNames.includes('11. Vendors & Suppliers'), '11. Vendors & Suppliers folder missing');
  assert.ok(folderNames.includes('12. Product Categories'), '12. Product Categories folder missing');
  assert.ok(folderNames.includes('13. Product Sub-Categories'), '13. Product Sub-Categories folder missing');
  assert.ok(folderNames.includes('14. Product Master (Inventory)'), '14. Product Master (Inventory) folder missing');
  assert.ok(folderNames.includes('15. Search & Advanced Filters'), '15. Search & Advanced Filters folder missing');
  assert.ok(folderNames.includes('16. Dropdown Options & Enums'), '16. Dropdown Options & Enums folder missing');
  assert.ok(folderNames.includes('17. Inventory Item Management'), '17. Inventory Item Management folder missing');
  assert.ok(folderNames.includes('18. Stock Movements & Audit'), '18. Stock Movements & Audit folder missing');
  assert.ok(folderNames.includes('19. Inventory Tags / Barcode & QR'), '19. Inventory Tags / Barcode & QR folder missing');
  assert.ok(folderNames.includes('20. Inventory Transfers / Branch Transfer'), '20. Inventory Transfers / Branch Transfer folder missing');
  console.log('[PASS] Collection folder structure verified successfully.');

  console.log('[SUCCESS] All Postman Workspace tests passed with 100% success!');
}

runPostmanTests().catch((err) => {
  console.error('[ERROR] Postman Workspace test suite failed:', err);
  process.exit(1);
});
