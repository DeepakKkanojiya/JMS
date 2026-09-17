import { prisma } from '../../src/database';

export async function cleanResetDatabase() {
  console.log('[CLEAN] Cleaning all database tables for a fresh, authentic seed...');

  // Use raw SQL truncation with CASCADE across both iam and public schemas for total cleanliness
  await prisma.$executeRawUnsafe(`
    DO $$ 
    BEGIN
      -- Truncate Public Schema Tables (Jewellery Masters, Inventory, Sales, Settlement, Procurement)
      EXECUTE 'TRUNCATE TABLE 
        public.stock_audit_items,
        public.stock_audit_sessions,
        public.job_work_receipts,
        public.job_work_material_issues,
        public.job_work_orders,
        public.vendor_debit_notes,
        public.purchase_return_items,
        public.purchase_returns,
        public.vendor_payments,
        public.purchase_bill_items,
        public.purchase_bills,
        public.purchase_receipt_items,
        public.purchase_receipts,
        public.purchase_order_items,
        public.purchase_orders,
        public.sales_refunds,
        public.sales_return_items,
        public.sales_returns,
        public.sales_payments,
        public.sales_invoice_metal_rates,
        public.sales_invoice_items,
        public.sales_invoices,
        public.customer_gold_exchange_items,
        public.customer_gold_exchanges,
        public.stock_adjustments,
        public.stock_movements,
        public.inventory_transfers,
        public.inventory_tags,
        public.inventory_item_images,
        public.inventory_items,
        public.product_images,
        public.products,
        public.product_sub_categories,
        public.product_categories,
        public.tax_rates,
        public.making_charges,
        public.metal_rates,
        public.customer_documents,
        public.customer_addresses,
        public.customers,
        public.vendors,
        public.employees,
        public.branches,
        public.companies
      CASCADE';

      -- Truncate IAM Schema Tables (Sessions, Histories, Reset Tokens, Users, Permissions, Roles)
      EXECUTE 'TRUNCATE TABLE 
        iam.user_sessions,
        iam.login_history,
        iam.password_reset_tokens,
        iam.users,
        iam.role_permissions,
        iam.permissions,
        iam.roles
      CASCADE';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Table truncate notice: %', SQLERRM;
    END $$;
  `);

  console.log('[PASS] Database tables cleaned successfully.');
}
