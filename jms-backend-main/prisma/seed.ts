import { disconnectDB } from '../src/database';
import { cleanResetDatabase } from './seed/clean_reset';
import { seedRoles } from './seed/roles';
import { seedUsers } from './seed/users';
import { seedMasterData } from './seed/master_data';
import { seedMasterPermissions } from './seed/master_permissions';
import { seedInventory } from './seed/inventory';
import { seedSalesPermissions } from './seed/sales_permissions';
import { seedMetalRates } from './seed/metal_rates';
import { seedPricing } from './seed/pricing';
import { seedPayments } from './seed/payments';
import { seedGoldExchanges } from './seed/gold_exchange';
import { seedSalesReturns } from './seed/sales_returns';
import { seedSalesRefunds } from './seed/sales_refunds';
import { seedPurchasePermissions } from './seed/purchase_permissions';
import { seedPurchaseBills } from './seed/purchase_bills';
import { seedVendorPayments } from './seed/vendor_payments';
import { seedPurchaseReturns } from './seed/purchase_returns';
import { seedJobWork } from './seed/job_work';
import { seedStockAudit } from './seed/stock_audit';
import { seedGirviPermissions } from './seed/girvi_permissions';
import { seedApprovalPermissions } from './seed/approval_permissions';


async function main() {
  console.log('Cleaning all old tables...');
  await cleanResetDatabase();
  console.log('✓ Clean Reset Complete\n');

  console.log('Seeding Standard Store Staff Roles...');
  await seedRoles();
  console.log('✓ Roles Seeding Complete');

  console.log('\nSeeding User Accounts...');
  await seedUsers();
  console.log('✓ Users Seeding Complete');

  console.log('\nSeeding Master Data Entities (Companies, Branches, Products with Images, Customers, Vendors)...');
  await seedMasterData();
  console.log('✓ Master Data Seeding Complete');

  console.log('\nSeeding Master Permissions Catalog & Matrix...');
  await seedMasterPermissions();
  console.log('✓ Master Permissions Seeding Complete');

  console.log('\nSeeding Inventory Items with Barcodes & Images...');
  await seedInventory();
  console.log('✓ Inventory Seeding Complete');

  console.log('\nSeeding Sales Permissions Catalog & Matrix...');
  await seedSalesPermissions();
  console.log('✓ Sales Permissions Seeding Complete');

  console.log('\nSeeding Purchase Order Permissions Catalog & Matrix...');
  await seedPurchasePermissions();
  console.log('✓ Purchase Permissions Seeding Complete');

  console.log('\nSeeding Girvi Pawning Subsystem Permissions Catalog & Matrix...');
  await seedGirviPermissions();
  console.log('✓ Girvi Permissions Seeding Complete');

  console.log('\nSeeding Sell on Approval Subsystem Permissions Catalog & Matrix...');
  await seedApprovalPermissions();
  console.log('✓ Approval Permissions Seeding Complete');


  console.log('\nSeeding Purchase Bills...');
  await seedPurchaseBills();
  console.log('✓ Purchase Bills Seeding Complete');

  console.log('\nSeeding Vendor Payments...');
  await seedVendorPayments();
  console.log('✓ Vendor Payments Seeding Complete');

  console.log('\nSeeding Purchase Returns & Vendor Debit Notes...');
  await seedPurchaseReturns();
  console.log('✓ Purchase Returns Seeding Complete');

  console.log('\nSeeding Karigar Job Work Orders & Material Issues...');
  await seedJobWork();
  console.log('✓ Job Work Seeding Complete');

  console.log('\nSeeding Stock Audit Sessions & Audit Scanned Items...');
  await seedStockAudit();
  console.log('✓ Stock Audit Seeding Complete');

  console.log('\nSeeding Daily Metal Rates...');
  await seedMetalRates();
  console.log('✓ Metal Rates Seeding Complete');

  console.log('\nSeeding Pricing Making Charges & Tax Rates (GST 3%)...');
  await seedPricing();
  console.log('✓ Pricing Seeding Complete');

  console.log('\nSeeding Payments...');
  await seedPayments();
  console.log('✓ Payments Seeding Complete');

  console.log('\nSeeding Gold Exchanges...');
  await seedGoldExchanges();
  console.log('✓ Gold Exchanges Seeding Complete');

  console.log('\nSeeding Sales Returns...');
  await seedSalesReturns();
  console.log('✓ Sales Returns Seeding Complete');

  console.log('\nSeeding Sales Refunds...');
  await seedSalesRefunds();
  console.log('✓ Sales Refunds Seeding Complete');

  console.log('\n✓ Database Seeding & Clean Setup Completed Successfully');
}

main()
  .catch((e) => {
    console.error('[ERROR] Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
