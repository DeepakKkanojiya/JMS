import assert from 'assert';
import { connectDB, disconnectDB, prisma } from '../src/database';
import {
  companyRepository,
  branchRepository,
  employeeRepository,
  customerRepository,
  customerAddressRepository,
  customerDocumentRepository,
  vendorRepository,
  productCategoryRepository,
  productSubCategoryRepository,
  productRepository,
} from '../src/repositories';

async function runPhase2DatabaseTests() {
  console.log('[TEST] Starting Phase 2 Database Architecture Test Suite...');

  await connectDB();

  try {
    const ts = Date.now().toString().slice(-6);

    // 1. Verify Seed Data Integrity
    console.log('[TEST] 1. Verifying Seed Data Integrity...');
    const seedCompany = await companyRepository.findByGstNumber('07AAAAA0000A1Z5');
    assert.ok(seedCompany, 'Seed Company must exist');
    assert.strictEqual(seedCompany.name, 'Jewellery ERP Enterprise');

    const seedBranches = await branchRepository.findByCompanyId(seedCompany.id);
    assert.ok(seedBranches.length >= 2, 'At least 2 seed branches must exist');

    const seedCategories = await productCategoryRepository.findAll();
    assert.ok(seedCategories.data.length >= 4, 'Seed product categories (Gold, Silver, Diamond, Platinum) must exist');

    const goldCat = await productCategoryRepository.findByCode('CAT-GOLD');
    assert.ok(goldCat, 'Gold category must exist');

    const goldSubCats = await productSubCategoryRepository.findByCategoryId(goldCat.id);
    assert.ok(goldSubCats.length >= 5, 'Gold sub-categories must exist');
    console.log('[PASS] Seed data integrity verified.');

    // 2. Relationship Creation & Hierarchy Flow
    console.log('[TEST] 2. Testing Relationship Creation & Hierarchy Flow...');
    const gstNo = `07TST${ts}Z1`;
    const panNo = `TST${ts}P`;
    const branchCode = `BR-TST-${ts}`;
    const empCode = `EMP-TST-${ts}`;
    const custCode = `CST-TST-${ts}`;
    const mobileEmp = `98${ts}001`;
    const mobileCust = `98${ts}002`;
    const mobileVend = `98${ts}003`;
    const vendorCode = `VND-TST-${ts}`;
    const catCode = `CAT-TST-${ts}`;
    const subCatCode = `SUBCAT-TST-${ts}`;
    const skuCode = `SKU-TST-${ts}`;

    // Create Company -> Branch
    const testCompany = await companyRepository.create({
      name: `Test Retail Jewels ${ts}`,
      gstNumber: gstNo,
      panNumber: panNo,
    });
    assert.ok(testCompany.id, 'Company PK UUID generated');

    const testBranch = await branchRepository.create({
      companyId: testCompany.id,
      branchCode: branchCode,
      name: `Test Branch ${ts}`,
    });
    assert.strictEqual(testBranch.companyId, testCompany.id);

    // Create Employee linked to test Branch
    const testEmployee = await employeeRepository.create({
      branchId: testBranch.id,
      employeeCode: empCode,
      firstName: 'Aarav',
      lastName: 'Sharma',
      mobile: mobileEmp,
      email: `aarav.${ts}@jewelleryerp.com`,
    });
    assert.strictEqual(testEmployee.branchId, testBranch.id);

    // Create Customer -> Address -> Document
    const testCustomer = await customerRepository.create({
      branchId: testBranch.id,
      customerCode: custCode,
      firstName: 'Priya',
      lastName: 'Verma',
      mobile: mobileCust,
    });
    assert.ok(testCustomer.id);

    const testAddr = await customerAddressRepository.create({
      customerId: testCustomer.id,
      addressLine1: '123 Test Street',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
    });
    assert.strictEqual(testAddr.customerId, testCustomer.id);

    const testDoc = await customerDocumentRepository.create({
      customerId: testCustomer.id,
      documentType: 'PAN',
      documentNumber: `PAN${ts}`,
      fileUrl: 'https://test.storage.com/pan.pdf',
    });
    assert.strictEqual(testDoc.customerId, testCustomer.id);

    // Create Vendor
    const testVendor = await vendorRepository.create({
      branchId: testBranch.id,
      vendorCode: vendorCode,
      companyName: `Test Gold Refinery ${ts}`,
      mobile: mobileVend,
      gstNumber: `07VND${ts}Z2`,
    });
    assert.strictEqual(testVendor.branchId, testBranch.id);

    // Create Category -> SubCategory -> Product
    const testCat = await productCategoryRepository.create({
      name: `Test Gemstones ${ts}`,
      code: catCode,
    });
    assert.ok(testCat.id);

    const testSubCat = await productSubCategoryRepository.create({
      categoryId: testCat.id,
      name: `Ruby ${ts}`,
      code: subCatCode,
    });
    assert.strictEqual(testSubCat.categoryId, testCat.id);

    const testProduct = await productRepository.create({
      subCategoryId: testSubCat.id,
      sku: skuCode,
      name: `Burmese Ruby 3 Carat ${ts}`,
      grossWeight: 3.0,
      netWeight: 3.0,
    });
    assert.strictEqual(testProduct.subCategoryId, testSubCat.id);
    console.log('[PASS] Relationship creation and hierarchy verified.');

    // 3. Unique Constraints Verification
    console.log('[TEST] 3. Testing Unique Constraints...');
    // Company GST Number Duplicate
    await assert.rejects(
      async () => {
        await companyRepository.create({
          name: 'Duplicate GST Corp',
          gstNumber: gstNo,
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );

    // Company PAN Number Duplicate
    await assert.rejects(
      async () => {
        await companyRepository.create({
          name: 'Duplicate PAN Corp',
          panNumber: panNo,
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );

    // Branch Code Duplicate
    await assert.rejects(
      async () => {
        await branchRepository.create({
          companyId: testCompany.id,
          branchCode: branchCode,
          name: 'Dup Branch',
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );

    // Employee Code & Mobile Duplicate
    await assert.rejects(
      async () => {
        await employeeRepository.create({
          branchId: testBranch.id,
          employeeCode: empCode,
          firstName: 'Dup',
          mobile: '9988776655',
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );

    await assert.rejects(
      async () => {
        await employeeRepository.create({
          branchId: testBranch.id,
          employeeCode: `EMP-DUP-${ts}`,
          firstName: 'Dup Mobile',
          mobile: mobileEmp,
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );

    // Customer Code & Mobile Duplicate
    await assert.rejects(
      async () => {
        await customerRepository.create({
          branchId: testBranch.id,
          customerCode: custCode,
          firstName: 'Dup Code',
          mobile: '9911223344',
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );

    // Product SKU Duplicate
    await assert.rejects(
      async () => {
        await productRepository.create({
          subCategoryId: testSubCat.id,
          sku: skuCode,
          name: 'Dup SKU Product',
        });
      },
      (err: any) => err.code === 'P2002' || (err.message && err.message.includes('Unique constraint'))
    );
    console.log('[PASS] Unique constraints verified successfully.');

    // 4. Cascade & Restrict Behaviors Verification
    console.log('[TEST] 4. Testing Cascade & Restrict Deletion Rules...');
    const isRestrictError = (err: any) =>
      Boolean(
        err &&
          (err.code === 'P2003' ||
            err.code === 'P2014' ||
            (typeof err.message === 'string' &&
              (err.message.includes('RESTRICT') ||
                err.message.includes('foreign key') ||
                err.message.includes('Foreign key') ||
                err.message.includes('violates'))))
      );

    // Restrict Rule: Cannot delete Company with active Branch
    await assert.rejects(async () => {
      await companyRepository.delete(testCompany.id);
    }, isRestrictError);

    // Restrict Rule: Cannot delete Branch with active Employee / Customer / Vendor
    await assert.rejects(async () => {
      await branchRepository.delete(testBranch.id);
    }, isRestrictError);

    // Restrict Rule: Cannot delete ProductCategory with active ProductSubCategory
    await assert.rejects(async () => {
      await productCategoryRepository.delete(testCat.id);
    }, isRestrictError);

    // Restrict Rule: Cannot delete ProductSubCategory with active Product
    await assert.rejects(async () => {
      await productSubCategoryRepository.delete(testSubCat.id);
    }, isRestrictError);

    // Cascade Rule: Deleting Customer automatically cascades to CustomerAddress & CustomerDocument
    const custIdToDelete = testCustomer.id;
    await customerRepository.delete(custIdToDelete);

    const deletedAddr = await customerAddressRepository.findById(testAddr.id);
    assert.strictEqual(deletedAddr, null, 'Customer address must be cascaded on customer deletion');

    const deletedDoc = await customerDocumentRepository.findById(testDoc.id);
    assert.strictEqual(deletedDoc, null, 'Customer document must be cascaded on customer deletion');
    console.log('[PASS] Cascade & Restrict deletion rules verified.');

    // 5. Cleanup Test Records
    console.log('[TEST] 5. Cleaning up temporary test records...');
    await productRepository.delete(testProduct.id);
    await productSubCategoryRepository.delete(testSubCat.id);
    await productCategoryRepository.delete(testCat.id);
    await employeeRepository.delete(testEmployee.id);
    await vendorRepository.delete(testVendor.id);
    await branchRepository.delete(testBranch.id);
    await companyRepository.delete(testCompany.id);
    console.log('[PASS] Cleanup complete.');

    console.log('\n[SUCCESS] Phase 2 Database Architecture Test Suite passed with 100% success!');
  } finally {
    await disconnectDB();
  }
}

runPhase2DatabaseTests().catch((err) => {
  console.error('[ERROR] Phase 2 Database test suite failed:', err);
  process.exit(1);
});
