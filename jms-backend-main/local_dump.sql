--
-- PostgreSQL database dump
--

\restrict MkOwj8cE2FtK4cDk1IK1pRKcoH3g0fMdcyrgHxKVC7OPbIkOZ4Yw4zCU1GrGnme

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.vendors DROP CONSTRAINT IF EXISTS vendors_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendors DROP CONSTRAINT IF EXISTS vendors_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_payments DROP CONSTRAINT IF EXISTS vendor_payments_vendor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_payments DROP CONSTRAINT IF EXISTS vendor_payments_purchase_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_payments DROP CONSTRAINT IF EXISTS vendor_payments_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_debit_notes DROP CONSTRAINT IF EXISTS vendor_debit_notes_vendor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_debit_notes DROP CONSTRAINT IF EXISTS vendor_debit_notes_purchase_return_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_debit_notes DROP CONSTRAINT IF EXISTS vendor_debit_notes_purchase_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vendor_debit_notes DROP CONSTRAINT IF EXISTS vendor_debit_notes_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_lenders DROP CONSTRAINT IF EXISTS third_party_lenders_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_lenders DROP CONSTRAINT IF EXISTS third_party_lenders_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvis DROP CONSTRAINT IF EXISTS third_party_girvis_third_party_lender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvis DROP CONSTRAINT IF EXISTS third_party_girvis_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvis DROP CONSTRAINT IF EXISTS third_party_girvis_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvis DROP CONSTRAINT IF EXISTS third_party_girvis_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvi_collaterals DROP CONSTRAINT IF EXISTS third_party_girvi_collaterals_third_party_girvi_id_fkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvi_collaterals DROP CONSTRAINT IF EXISTS third_party_girvi_collaterals_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tax_rates DROP CONSTRAINT IF EXISTS tax_rates_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_to_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_from_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_sessions DROP CONSTRAINT IF EXISTS stock_audit_sessions_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_sessions DROP CONSTRAINT IF EXISTS stock_audit_sessions_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_sessions DROP CONSTRAINT IF EXISTS stock_audit_sessions_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_items DROP CONSTRAINT IF EXISTS stock_audit_items_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_items DROP CONSTRAINT IF EXISTS stock_audit_items_audit_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_adjustments DROP CONSTRAINT IF EXISTS stock_adjustments_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_adjustments DROP CONSTRAINT IF EXISTS stock_adjustments_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_returns DROP CONSTRAINT IF EXISTS sales_returns_sales_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_returns DROP CONSTRAINT IF EXISTS sales_returns_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_returns DROP CONSTRAINT IF EXISTS sales_returns_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_return_items DROP CONSTRAINT IF EXISTS sales_return_items_sales_return_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_return_items DROP CONSTRAINT IF EXISTS sales_return_items_sales_invoice_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_return_items DROP CONSTRAINT IF EXISTS sales_return_items_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_refunds DROP CONSTRAINT IF EXISTS sales_refunds_sales_return_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_payments DROP CONSTRAINT IF EXISTS sales_payments_sales_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_updated_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_salesperson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_created_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoice_metal_rates DROP CONSTRAINT IF EXISTS sales_invoice_metal_rates_sales_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoice_metal_rates DROP CONSTRAINT IF EXISTS sales_invoice_metal_rates_metal_rate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoice_items DROP CONSTRAINT IF EXISTS sales_invoice_items_sales_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoice_items DROP CONSTRAINT IF EXISTS sales_invoice_items_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_returns DROP CONSTRAINT IF EXISTS purchase_returns_vendor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_returns DROP CONSTRAINT IF EXISTS purchase_returns_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_returns DROP CONSTRAINT IF EXISTS purchase_returns_purchase_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_returns DROP CONSTRAINT IF EXISTS purchase_returns_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_return_items DROP CONSTRAINT IF EXISTS purchase_return_items_purchase_return_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_return_items DROP CONSTRAINT IF EXISTS purchase_return_items_purchase_bill_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_return_items DROP CONSTRAINT IF EXISTS purchase_return_items_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_receipts DROP CONSTRAINT IF EXISTS purchase_receipts_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_receipt_items DROP CONSTRAINT IF EXISTS purchase_receipt_items_purchase_receipt_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_receipt_items DROP CONSTRAINT IF EXISTS purchase_receipt_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_vendor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_vendor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_purchase_receipt_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_purchase_order_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_purchase_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_sub_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_sub_categories DROP CONSTRAINT IF EXISTS product_sub_categories_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_sub_categories DROP CONSTRAINT IF EXISTS product_sub_categories_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.metal_rates DROP CONSTRAINT IF EXISTS metal_rates_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.making_charges DROP CONSTRAINT IF EXISTS making_charges_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_receipts DROP CONSTRAINT IF EXISTS job_work_receipts_job_work_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_receipts DROP CONSTRAINT IF EXISTS job_work_receipts_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_orders DROP CONSTRAINT IF EXISTS job_work_orders_vendor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_orders DROP CONSTRAINT IF EXISTS job_work_orders_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_orders DROP CONSTRAINT IF EXISTS job_work_orders_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_material_issues DROP CONSTRAINT IF EXISTS job_work_material_issues_job_work_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_work_material_issues DROP CONSTRAINT IF EXISTS job_work_material_issues_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_to_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_requested_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_rejected_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_received_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_from_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_dispatched_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_tags DROP CONSTRAINT IF EXISTS inventory_tags_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_purchase_receipt_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_item_images DROP CONSTRAINT IF EXISTS inventory_item_images_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_settlements DROP CONSTRAINT IF EXISTS girvi_settlements_girvi_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_renewals DROP CONSTRAINT IF EXISTS girvi_renewals_girvi_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_loans DROP CONSTRAINT IF EXISTS girvi_loans_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_loans DROP CONSTRAINT IF EXISTS girvi_loans_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_loans DROP CONSTRAINT IF EXISTS girvi_loans_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_collections DROP CONSTRAINT IF EXISTS girvi_collections_girvi_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_collaterals DROP CONSTRAINT IF EXISTS girvi_collaterals_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.girvi_collaterals DROP CONSTRAINT IF EXISTS girvi_collaterals_girvi_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.financial_years DROP CONSTRAINT IF EXISTS financial_years_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_branch_assignments DROP CONSTRAINT IF EXISTS employee_branch_assignments_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_branch_assignments DROP CONSTRAINT IF EXISTS employee_branch_assignments_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.document_series DROP CONSTRAINT IF EXISTS document_series_financial_year_id_fkey;
ALTER TABLE IF EXISTS ONLY public.document_series DROP CONSTRAINT IF EXISTS document_series_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.document_series DROP CONSTRAINT IF EXISTS document_series_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchanges DROP CONSTRAINT IF EXISTS customer_gold_exchanges_sales_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchanges DROP CONSTRAINT IF EXISTS customer_gold_exchanges_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchanges DROP CONSTRAINT IF EXISTS customer_gold_exchanges_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchange_items DROP CONSTRAINT IF EXISTS customer_gold_exchange_items_metal_rate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchange_items DROP CONSTRAINT IF EXISTS customer_gold_exchange_items_exchange_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_documents DROP CONSTRAINT IF EXISTS customer_documents_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approvals DROP CONSTRAINT IF EXISTS approvals_salesperson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approvals DROP CONSTRAINT IF EXISTS approvals_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approvals DROP CONSTRAINT IF EXISTS approvals_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approvals DROP CONSTRAINT IF EXISTS approvals_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_items DROP CONSTRAINT IF EXISTS approval_items_inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_items DROP CONSTRAINT IF EXISTS approval_items_approval_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_deposits DROP CONSTRAINT IF EXISTS approval_deposits_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_deposits DROP CONSTRAINT IF EXISTS approval_deposits_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_deposits DROP CONSTRAINT IF EXISTS approval_deposits_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_deposits DROP CONSTRAINT IF EXISTS approval_deposits_approval_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.users DROP CONSTRAINT IF EXISTS users_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY iam.login_history DROP CONSTRAINT IF EXISTS login_history_user_id_fkey;
DROP INDEX IF EXISTS public.vendors_gst_number_key;
DROP INDEX IF EXISTS public.vendors_company_id_vendor_code_key;
DROP INDEX IF EXISTS public.vendor_payments_vendor_id_idx;
DROP INDEX IF EXISTS public.vendor_payments_transaction_reference_idx;
DROP INDEX IF EXISTS public.vendor_payments_status_idx;
DROP INDEX IF EXISTS public.vendor_payments_purchase_bill_id_idx;
DROP INDEX IF EXISTS public.vendor_payments_payment_number_key;
DROP INDEX IF EXISTS public.vendor_payments_payment_method_idx;
DROP INDEX IF EXISTS public.vendor_payments_payment_date_idx;
DROP INDEX IF EXISTS public.vendor_payments_branch_id_idx;
DROP INDEX IF EXISTS public.vendor_debit_notes_vendor_id_idx;
DROP INDEX IF EXISTS public.vendor_debit_notes_status_idx;
DROP INDEX IF EXISTS public.vendor_debit_notes_purchase_return_id_key;
DROP INDEX IF EXISTS public.vendor_debit_notes_purchase_return_id_idx;
DROP INDEX IF EXISTS public.vendor_debit_notes_purchase_bill_id_idx;
DROP INDEX IF EXISTS public.vendor_debit_notes_debit_note_number_key;
DROP INDEX IF EXISTS public.vendor_debit_notes_debit_note_number_idx;
DROP INDEX IF EXISTS public.vendor_debit_notes_branch_id_idx;
DROP INDEX IF EXISTS public.third_party_lenders_company_id_lender_code_key;
DROP INDEX IF EXISTS public.third_party_lenders_company_id_idx;
DROP INDEX IF EXISTS public.third_party_lenders_branch_id_idx;
DROP INDEX IF EXISTS public.third_party_girvis_third_party_lender_id_idx;
DROP INDEX IF EXISTS public.third_party_girvis_status_idx;
DROP INDEX IF EXISTS public.third_party_girvis_reference_number_key;
DROP INDEX IF EXISTS public.third_party_girvis_reference_number_idx;
DROP INDEX IF EXISTS public.third_party_girvis_customer_id_idx;
DROP INDEX IF EXISTS public.third_party_girvis_company_id_third_party_lender_id_externa_key;
DROP INDEX IF EXISTS public.third_party_girvis_company_id_idx;
DROP INDEX IF EXISTS public.third_party_girvis_branch_id_idx;
DROP INDEX IF EXISTS public.third_party_girvi_collaterals_third_party_girvi_id_idx;
DROP INDEX IF EXISTS public.third_party_girvi_collaterals_inventory_item_id_idx;
DROP INDEX IF EXISTS public.tax_rates_tax_code_idx;
DROP INDEX IF EXISTS public.tax_rates_is_active_idx;
DROP INDEX IF EXISTS public.tax_rates_effective_from_effective_to_idx;
DROP INDEX IF EXISTS public.tax_rates_company_id_idx;
DROP INDEX IF EXISTS public.stock_movements_to_branch_id_idx;
DROP INDEX IF EXISTS public.stock_movements_movement_type_idx;
DROP INDEX IF EXISTS public.stock_movements_inventory_item_id_idx;
DROP INDEX IF EXISTS public.stock_movements_from_branch_id_idx;
DROP INDEX IF EXISTS public.stock_movements_created_at_idx;
DROP INDEX IF EXISTS public.stock_audit_sessions_status_idx;
DROP INDEX IF EXISTS public.stock_audit_sessions_start_date_idx;
DROP INDEX IF EXISTS public.stock_audit_sessions_company_id_idx;
DROP INDEX IF EXISTS public.stock_audit_sessions_category_id_idx;
DROP INDEX IF EXISTS public.stock_audit_sessions_branch_id_idx;
DROP INDEX IF EXISTS public.stock_audit_sessions_audit_number_key;
DROP INDEX IF EXISTS public.stock_audit_sessions_audit_number_idx;
DROP INDEX IF EXISTS public.stock_audit_items_status_idx;
DROP INDEX IF EXISTS public.stock_audit_items_rfid_epc_idx;
DROP INDEX IF EXISTS public.stock_audit_items_inventory_item_id_idx;
DROP INDEX IF EXISTS public.stock_audit_items_barcode_idx;
DROP INDEX IF EXISTS public.stock_audit_items_audit_session_id_idx;
DROP INDEX IF EXISTS public.stock_adjustments_inventory_item_id_idx;
DROP INDEX IF EXISTS public.stock_adjustments_created_at_idx;
DROP INDEX IF EXISTS public.stock_adjustments_branch_id_idx;
DROP INDEX IF EXISTS public.sales_returns_status_idx;
DROP INDEX IF EXISTS public.sales_returns_sales_invoice_id_idx;
DROP INDEX IF EXISTS public.sales_returns_return_number_key;
DROP INDEX IF EXISTS public.sales_returns_customer_id_idx;
DROP INDEX IF EXISTS public.sales_returns_created_at_idx;
DROP INDEX IF EXISTS public.sales_returns_branch_id_idx;
DROP INDEX IF EXISTS public.sales_return_items_sales_return_id_idx;
DROP INDEX IF EXISTS public.sales_return_items_sales_invoice_item_id_idx;
DROP INDEX IF EXISTS public.sales_return_items_inventory_item_id_idx;
DROP INDEX IF EXISTS public.sales_refunds_status_idx;
DROP INDEX IF EXISTS public.sales_refunds_sales_return_id_idx;
DROP INDEX IF EXISTS public.sales_refunds_refund_number_key;
DROP INDEX IF EXISTS public.sales_refunds_refund_method_idx;
DROP INDEX IF EXISTS public.sales_refunds_created_at_idx;
DROP INDEX IF EXISTS public.sales_payments_transaction_reference_idx;
DROP INDEX IF EXISTS public.sales_payments_status_idx;
DROP INDEX IF EXISTS public.sales_payments_sales_invoice_id_idx;
DROP INDEX IF EXISTS public.sales_payments_payment_number_key;
DROP INDEX IF EXISTS public.sales_payments_payment_method_idx;
DROP INDEX IF EXISTS public.sales_payments_payment_date_idx;
DROP INDEX IF EXISTS public.sales_invoices_status_idx;
DROP INDEX IF EXISTS public.sales_invoices_invoice_number_key;
DROP INDEX IF EXISTS public.sales_invoices_invoice_date_idx;
DROP INDEX IF EXISTS public.sales_invoices_customer_id_idx;
DROP INDEX IF EXISTS public.sales_invoices_branch_id_idx;
DROP INDEX IF EXISTS public.sales_invoice_metal_rates_sales_invoice_id_key;
DROP INDEX IF EXISTS public.sales_invoice_metal_rates_sales_invoice_id_idx;
DROP INDEX IF EXISTS public.sales_invoice_metal_rates_metal_rate_id_idx;
DROP INDEX IF EXISTS public.sales_invoice_items_sales_invoice_id_idx;
DROP INDEX IF EXISTS public.sales_invoice_items_inventory_item_id_idx;
DROP INDEX IF EXISTS public.purchase_returns_vendor_id_idx;
DROP INDEX IF EXISTS public.purchase_returns_status_idx;
DROP INDEX IF EXISTS public.purchase_returns_return_number_key;
DROP INDEX IF EXISTS public.purchase_returns_return_number_idx;
DROP INDEX IF EXISTS public.purchase_returns_return_date_idx;
DROP INDEX IF EXISTS public.purchase_returns_purchase_order_id_idx;
DROP INDEX IF EXISTS public.purchase_returns_purchase_bill_id_idx;
DROP INDEX IF EXISTS public.purchase_returns_branch_id_idx;
DROP INDEX IF EXISTS public.purchase_return_items_purchase_return_id_idx;
DROP INDEX IF EXISTS public.purchase_return_items_purchase_bill_item_id_idx;
DROP INDEX IF EXISTS public.purchase_return_items_inventory_item_id_idx;
DROP INDEX IF EXISTS public.purchase_receipts_purchase_receipt_number_key;
DROP INDEX IF EXISTS public.purchase_orders_vendor_id_idx;
DROP INDEX IF EXISTS public.purchase_orders_status_idx;
DROP INDEX IF EXISTS public.purchase_orders_purchase_order_number_key;
DROP INDEX IF EXISTS public.purchase_orders_purchase_order_number_idx;
DROP INDEX IF EXISTS public.purchase_orders_order_date_idx;
DROP INDEX IF EXISTS public.purchase_orders_branch_id_idx;
DROP INDEX IF EXISTS public.purchase_order_items_purchase_order_id_idx;
DROP INDEX IF EXISTS public.purchase_order_items_product_id_idx;
DROP INDEX IF EXISTS public.purchase_order_items_metal_type_purity_idx;
DROP INDEX IF EXISTS public.purchase_bills_vendor_id_idx;
DROP INDEX IF EXISTS public.purchase_bills_status_idx;
DROP INDEX IF EXISTS public.purchase_bills_purchase_order_id_idx;
DROP INDEX IF EXISTS public.purchase_bills_branch_id_idx;
DROP INDEX IF EXISTS public.purchase_bills_bill_number_key;
DROP INDEX IF EXISTS public.purchase_bills_bill_number_idx;
DROP INDEX IF EXISTS public.purchase_bills_bill_date_idx;
DROP INDEX IF EXISTS public.purchase_bill_items_purchase_receipt_item_id_idx;
DROP INDEX IF EXISTS public.purchase_bill_items_purchase_order_item_id_idx;
DROP INDEX IF EXISTS public.purchase_bill_items_purchase_bill_id_idx;
DROP INDEX IF EXISTS public.purchase_bill_items_inventory_item_id_idx;
DROP INDEX IF EXISTS public.products_company_id_sku_key;
DROP INDEX IF EXISTS public.product_sub_categories_company_id_code_key;
DROP INDEX IF EXISTS public.product_images_product_id_idx;
DROP INDEX IF EXISTS public.product_categories_company_id_code_key;
DROP INDEX IF EXISTS public.metal_rates_metal_type_purity_idx;
DROP INDEX IF EXISTS public.metal_rates_is_active_idx;
DROP INDEX IF EXISTS public.metal_rates_effective_from_effective_to_idx;
DROP INDEX IF EXISTS public.metal_rates_company_id_idx;
DROP INDEX IF EXISTS public.making_charges_metal_type_purity_idx;
DROP INDEX IF EXISTS public.making_charges_is_active_idx;
DROP INDEX IF EXISTS public.making_charges_effective_from_effective_to_idx;
DROP INDEX IF EXISTS public.making_charges_company_id_idx;
DROP INDEX IF EXISTS public.job_work_receipts_receipt_number_key;
DROP INDEX IF EXISTS public.job_work_receipts_receipt_number_idx;
DROP INDEX IF EXISTS public.job_work_receipts_job_work_order_id_idx;
DROP INDEX IF EXISTS public.job_work_receipts_inventory_item_id_idx;
DROP INDEX IF EXISTS public.job_work_orders_vendor_id_idx;
DROP INDEX IF EXISTS public.job_work_orders_status_idx;
DROP INDEX IF EXISTS public.job_work_orders_order_number_key;
DROP INDEX IF EXISTS public.job_work_orders_order_number_idx;
DROP INDEX IF EXISTS public.job_work_orders_issue_date_idx;
DROP INDEX IF EXISTS public.job_work_orders_company_id_idx;
DROP INDEX IF EXISTS public.job_work_orders_branch_id_idx;
DROP INDEX IF EXISTS public.job_work_material_issues_job_work_order_id_idx;
DROP INDEX IF EXISTS public.job_work_material_issues_inventory_item_id_idx;
DROP INDEX IF EXISTS public.inventory_transfers_transfer_code_key;
DROP INDEX IF EXISTS public.inventory_transfers_to_branch_id_idx;
DROP INDEX IF EXISTS public.inventory_transfers_status_idx;
DROP INDEX IF EXISTS public.inventory_transfers_inventory_item_id_idx;
DROP INDEX IF EXISTS public.inventory_transfers_from_branch_id_idx;
DROP INDEX IF EXISTS public.inventory_transfers_created_at_idx;
DROP INDEX IF EXISTS public.inventory_tags_rfid_epc_key;
DROP INDEX IF EXISTS public.inventory_tags_inventory_item_id_idx;
DROP INDEX IF EXISTS public.inventory_tags_barcode_key;
DROP INDEX IF EXISTS public.inventory_items_status_idx;
DROP INDEX IF EXISTS public.inventory_items_product_id_idx;
DROP INDEX IF EXISTS public.inventory_items_created_at_idx;
DROP INDEX IF EXISTS public.inventory_items_company_id_item_code_key;
DROP INDEX IF EXISTS public.inventory_items_branch_id_idx;
DROP INDEX IF EXISTS public.inventory_item_images_inventory_item_id_idx;
DROP INDEX IF EXISTS public.girvi_settlements_settlement_number_key;
DROP INDEX IF EXISTS public.girvi_settlements_settlement_number_idx;
DROP INDEX IF EXISTS public.girvi_settlements_girvi_loan_id_key;
DROP INDEX IF EXISTS public.girvi_settlements_girvi_loan_id_idx;
DROP INDEX IF EXISTS public.girvi_renewals_girvi_loan_id_idx;
DROP INDEX IF EXISTS public.girvi_loans_status_idx;
DROP INDEX IF EXISTS public.girvi_loans_loan_number_key;
DROP INDEX IF EXISTS public.girvi_loans_loan_number_idx;
DROP INDEX IF EXISTS public.girvi_loans_loan_date_idx;
DROP INDEX IF EXISTS public.girvi_loans_customer_id_idx;
DROP INDEX IF EXISTS public.girvi_loans_company_id_idx;
DROP INDEX IF EXISTS public.girvi_loans_branch_id_idx;
DROP INDEX IF EXISTS public.girvi_collections_status_idx;
DROP INDEX IF EXISTS public.girvi_collections_girvi_loan_id_idx;
DROP INDEX IF EXISTS public.girvi_collections_collection_number_key;
DROP INDEX IF EXISTS public.girvi_collections_collection_number_idx;
DROP INDEX IF EXISTS public.girvi_collaterals_rfid_epc_idx;
DROP INDEX IF EXISTS public.girvi_collaterals_inventory_item_id_idx;
DROP INDEX IF EXISTS public.girvi_collaterals_girvi_loan_id_idx;
DROP INDEX IF EXISTS public.girvi_collaterals_barcode_idx;
DROP INDEX IF EXISTS public.employees_mobile_key;
DROP INDEX IF EXISTS public.employees_email_key;
DROP INDEX IF EXISTS public.employees_company_id_employee_code_key;
DROP INDEX IF EXISTS public.customers_mobile_key;
DROP INDEX IF EXISTS public.customers_company_id_customer_code_key;
DROP INDEX IF EXISTS public.customer_gold_exchanges_status_idx;
DROP INDEX IF EXISTS public.customer_gold_exchanges_sales_invoice_id_idx;
DROP INDEX IF EXISTS public.customer_gold_exchanges_exchange_number_key;
DROP INDEX IF EXISTS public.customer_gold_exchanges_exchange_number_idx;
DROP INDEX IF EXISTS public.customer_gold_exchanges_customer_id_idx;
DROP INDEX IF EXISTS public.customer_gold_exchanges_created_at_idx;
DROP INDEX IF EXISTS public.customer_gold_exchanges_branch_id_idx;
DROP INDEX IF EXISTS public.customer_gold_exchange_items_metal_type_purity_idx;
DROP INDEX IF EXISTS public.customer_gold_exchange_items_metal_rate_id_idx;
DROP INDEX IF EXISTS public.customer_gold_exchange_items_exchange_id_idx;
DROP INDEX IF EXISTS public.companies_pan_number_key;
DROP INDEX IF EXISTS public.companies_gst_number_key;
DROP INDEX IF EXISTS public.companies_company_code_key;
DROP INDEX IF EXISTS public.branches_company_id_branch_code_key;
DROP INDEX IF EXISTS public.approvals_status_idx;
DROP INDEX IF EXISTS public.approvals_salesperson_id_idx;
DROP INDEX IF EXISTS public.approvals_customer_id_idx;
DROP INDEX IF EXISTS public.approvals_company_id_idx;
DROP INDEX IF EXISTS public.approvals_company_id_approval_number_key;
DROP INDEX IF EXISTS public.approvals_branch_id_idx;
DROP INDEX IF EXISTS public.approvals_approval_number_key;
DROP INDEX IF EXISTS public.approvals_approval_number_idx;
DROP INDEX IF EXISTS public.approval_items_status_idx;
DROP INDEX IF EXISTS public.approval_items_inventory_item_id_idx;
DROP INDEX IF EXISTS public.approval_items_approval_id_idx;
DROP INDEX IF EXISTS public.approval_deposits_status_idx;
DROP INDEX IF EXISTS public.approval_deposits_payment_method_idx;
DROP INDEX IF EXISTS public.approval_deposits_payment_date_idx;
DROP INDEX IF EXISTS public.approval_deposits_deposit_number_key;
DROP INDEX IF EXISTS public.approval_deposits_customer_id_idx;
DROP INDEX IF EXISTS public.approval_deposits_company_id_idx;
DROP INDEX IF EXISTS public.approval_deposits_company_id_deposit_number_key;
DROP INDEX IF EXISTS public.approval_deposits_branch_id_idx;
DROP INDEX IF EXISTS public.approval_deposits_approval_id_idx;
DROP INDEX IF EXISTS iam.users_employee_id_key;
DROP INDEX IF EXISTS iam.users_email_key;
DROP INDEX IF EXISTS iam.user_sessions_refresh_token_key;
DROP INDEX IF EXISTS iam.roles_name_key;
DROP INDEX IF EXISTS iam.permissions_permission_key_key;
DROP INDEX IF EXISTS iam.password_reset_tokens_token_key;
ALTER TABLE IF EXISTS ONLY public.vendors DROP CONSTRAINT IF EXISTS vendors_pkey;
ALTER TABLE IF EXISTS ONLY public.vendor_payments DROP CONSTRAINT IF EXISTS vendor_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.vendor_debit_notes DROP CONSTRAINT IF EXISTS vendor_debit_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.third_party_lenders DROP CONSTRAINT IF EXISTS third_party_lenders_pkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvis DROP CONSTRAINT IF EXISTS third_party_girvis_pkey;
ALTER TABLE IF EXISTS ONLY public.third_party_girvi_collaterals DROP CONSTRAINT IF EXISTS third_party_girvi_collaterals_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_rates DROP CONSTRAINT IF EXISTS tax_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_sessions DROP CONSTRAINT IF EXISTS stock_audit_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_audit_items DROP CONSTRAINT IF EXISTS stock_audit_items_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_adjustments DROP CONSTRAINT IF EXISTS stock_adjustments_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_returns DROP CONSTRAINT IF EXISTS sales_returns_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_return_items DROP CONSTRAINT IF EXISTS sales_return_items_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_refunds DROP CONSTRAINT IF EXISTS sales_refunds_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_payments DROP CONSTRAINT IF EXISTS sales_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoices DROP CONSTRAINT IF EXISTS sales_invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoice_metal_rates DROP CONSTRAINT IF EXISTS sales_invoice_metal_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_invoice_items DROP CONSTRAINT IF EXISTS sales_invoice_items_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_returns DROP CONSTRAINT IF EXISTS purchase_returns_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_return_items DROP CONSTRAINT IF EXISTS purchase_return_items_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_receipts DROP CONSTRAINT IF EXISTS purchase_receipts_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_receipt_items DROP CONSTRAINT IF EXISTS purchase_receipt_items_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_sub_categories DROP CONSTRAINT IF EXISTS product_sub_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.metal_rates DROP CONSTRAINT IF EXISTS metal_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.making_charges DROP CONSTRAINT IF EXISTS making_charges_pkey;
ALTER TABLE IF EXISTS ONLY public.job_work_receipts DROP CONSTRAINT IF EXISTS job_work_receipts_pkey;
ALTER TABLE IF EXISTS ONLY public.job_work_orders DROP CONSTRAINT IF EXISTS job_work_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.job_work_material_issues DROP CONSTRAINT IF EXISTS job_work_material_issues_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transfers DROP CONSTRAINT IF EXISTS inventory_transfers_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_tags DROP CONSTRAINT IF EXISTS inventory_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_item_images DROP CONSTRAINT IF EXISTS inventory_item_images_pkey;
ALTER TABLE IF EXISTS ONLY public.girvi_settlements DROP CONSTRAINT IF EXISTS girvi_settlements_pkey;
ALTER TABLE IF EXISTS ONLY public.girvi_renewals DROP CONSTRAINT IF EXISTS girvi_renewals_pkey;
ALTER TABLE IF EXISTS ONLY public.girvi_loans DROP CONSTRAINT IF EXISTS girvi_loans_pkey;
ALTER TABLE IF EXISTS ONLY public.girvi_collections DROP CONSTRAINT IF EXISTS girvi_collections_pkey;
ALTER TABLE IF EXISTS ONLY public.girvi_collaterals DROP CONSTRAINT IF EXISTS girvi_collaterals_pkey;
ALTER TABLE IF EXISTS ONLY public.financial_years DROP CONSTRAINT IF EXISTS financial_years_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_branch_assignments DROP CONSTRAINT IF EXISTS employee_branch_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.document_series DROP CONSTRAINT IF EXISTS document_series_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchanges DROP CONSTRAINT IF EXISTS customer_gold_exchanges_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_gold_exchange_items DROP CONSTRAINT IF EXISTS customer_gold_exchange_items_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_documents DROP CONSTRAINT IF EXISTS customer_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS ONLY public.approvals DROP CONSTRAINT IF EXISTS approvals_pkey;
ALTER TABLE IF EXISTS ONLY public.approval_items DROP CONSTRAINT IF EXISTS approval_items_pkey;
ALTER TABLE IF EXISTS ONLY public.approval_deposits DROP CONSTRAINT IF EXISTS approval_deposits_pkey;
ALTER TABLE IF EXISTS ONLY iam.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY iam.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY iam.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY iam.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY iam.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY iam.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY iam.login_history DROP CONSTRAINT IF EXISTS login_history_pkey;
DROP TABLE IF EXISTS public.vendors;
DROP TABLE IF EXISTS public.vendor_payments;
DROP TABLE IF EXISTS public.vendor_debit_notes;
DROP TABLE IF EXISTS public.third_party_lenders;
DROP TABLE IF EXISTS public.third_party_girvis;
DROP TABLE IF EXISTS public.third_party_girvi_collaterals;
DROP TABLE IF EXISTS public.tax_rates;
DROP TABLE IF EXISTS public.stock_movements;
DROP TABLE IF EXISTS public.stock_audit_sessions;
DROP TABLE IF EXISTS public.stock_audit_items;
DROP TABLE IF EXISTS public.stock_adjustments;
DROP TABLE IF EXISTS public.sales_returns;
DROP TABLE IF EXISTS public.sales_return_items;
DROP TABLE IF EXISTS public.sales_refunds;
DROP TABLE IF EXISTS public.sales_payments;
DROP TABLE IF EXISTS public.sales_invoices;
DROP TABLE IF EXISTS public.sales_invoice_metal_rates;
DROP TABLE IF EXISTS public.sales_invoice_items;
DROP TABLE IF EXISTS public.purchase_returns;
DROP TABLE IF EXISTS public.purchase_return_items;
DROP TABLE IF EXISTS public.purchase_receipts;
DROP TABLE IF EXISTS public.purchase_receipt_items;
DROP TABLE IF EXISTS public.purchase_orders;
DROP TABLE IF EXISTS public.purchase_order_items;
DROP TABLE IF EXISTS public.purchase_bills;
DROP TABLE IF EXISTS public.purchase_bill_items;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_sub_categories;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.product_categories;
DROP TABLE IF EXISTS public.metal_rates;
DROP TABLE IF EXISTS public.making_charges;
DROP TABLE IF EXISTS public.job_work_receipts;
DROP TABLE IF EXISTS public.job_work_orders;
DROP TABLE IF EXISTS public.job_work_material_issues;
DROP TABLE IF EXISTS public.inventory_transfers;
DROP TABLE IF EXISTS public.inventory_tags;
DROP TABLE IF EXISTS public.inventory_items;
DROP TABLE IF EXISTS public.inventory_item_images;
DROP TABLE IF EXISTS public.girvi_settlements;
DROP TABLE IF EXISTS public.girvi_renewals;
DROP TABLE IF EXISTS public.girvi_loans;
DROP TABLE IF EXISTS public.girvi_collections;
DROP TABLE IF EXISTS public.girvi_collaterals;
DROP TABLE IF EXISTS public.financial_years;
DROP TABLE IF EXISTS public.employees;
DROP TABLE IF EXISTS public.employee_branch_assignments;
DROP TABLE IF EXISTS public.document_series;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.customer_gold_exchanges;
DROP TABLE IF EXISTS public.customer_gold_exchange_items;
DROP TABLE IF EXISTS public.customer_documents;
DROP TABLE IF EXISTS public.customer_addresses;
DROP TABLE IF EXISTS public.companies;
DROP TABLE IF EXISTS public.branches;
DROP TABLE IF EXISTS public.approvals;
DROP TABLE IF EXISTS public.approval_items;
DROP TABLE IF EXISTS public.approval_deposits;
DROP TABLE IF EXISTS iam.users;
DROP TABLE IF EXISTS iam.user_sessions;
DROP TABLE IF EXISTS iam.roles;
DROP TABLE IF EXISTS iam.role_permissions;
DROP TABLE IF EXISTS iam.permissions;
DROP TABLE IF EXISTS iam.password_reset_tokens;
DROP TABLE IF EXISTS iam.login_history;
DROP TYPE IF EXISTS public.vendor_payment_status;
DROP TYPE IF EXISTS public.vendor_payment_method;
DROP TYPE IF EXISTS public.transfer_status;
DROP TYPE IF EXISTS public.third_party_girvi_status;
DROP TYPE IF EXISTS public.sales_return_status;
DROP TYPE IF EXISTS public.sales_invoice_status;
DROP TYPE IF EXISTS public.refund_status;
DROP TYPE IF EXISTS public.purchase_return_status;
DROP TYPE IF EXISTS public.purchase_receipt_status;
DROP TYPE IF EXISTS public.purchase_order_status;
DROP TYPE IF EXISTS public.purchase_bill_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method;
DROP TYPE IF EXISTS public.metal_type;
DROP TYPE IF EXISTS public.making_charge_type;
DROP TYPE IF EXISTS public.job_work_order_status;
DROP TYPE IF EXISTS public.job_work_item_type;
DROP TYPE IF EXISTS public.girvi_payment_method;
DROP TYPE IF EXISTS public.girvi_loan_status;
DROP TYPE IF EXISTS public.girvi_interest_period;
DROP TYPE IF EXISTS public.girvi_collection_status;
DROP TYPE IF EXISTS public.exchange_status;
DROP TYPE IF EXISTS public.debit_note_status;
DROP TYPE IF EXISTS public.audit_session_status;
DROP TYPE IF EXISTS public.audit_item_status;
DROP TYPE IF EXISTS public.approval_status;
DROP TYPE IF EXISTS public.approval_item_status;
-- *not* dropping schema, since initdb creates it
DROP SCHEMA IF EXISTS iam;
--
-- Name: iam; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA iam;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: approval_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.approval_item_status AS ENUM (
    'ISSUED',
    'RETURNED',
    'PURCHASED',
    'CANCELLED'
);


--
-- Name: approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.approval_status AS ENUM (
    'DRAFT',
    'ISSUED',
    'WITH_CUSTOMER',
    'RETURNED',
    'PURCHASED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: audit_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_item_status AS ENUM (
    'MATCHED',
    'MISSING',
    'UNEXPECTED',
    'WEIGHT_MISMATCH'
);


--
-- Name: audit_session_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_session_status AS ENUM (
    'IN_PROGRESS',
    'SUBMITTED',
    'RECONCILED',
    'CANCELLED'
);


--
-- Name: debit_note_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.debit_note_status AS ENUM (
    'ISSUED',
    'APPLIED',
    'REVERSED'
);


--
-- Name: exchange_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exchange_status AS ENUM (
    'REQUESTED',
    'VALUED',
    'APPLIED',
    'CANCELLED'
);


--
-- Name: girvi_collection_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.girvi_collection_status AS ENUM (
    'COMPLETED',
    'REVERSED'
);


--
-- Name: girvi_interest_period; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.girvi_interest_period AS ENUM (
    'MONTHLY',
    'ANNUAL'
);


--
-- Name: girvi_loan_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.girvi_loan_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'RENEWED',
    'CLOSED',
    'DEFAULTED',
    'CANCELLED'
);


--
-- Name: girvi_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.girvi_payment_method AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'BANK_TRANSFER',
    'CHEQUE'
);


--
-- Name: job_work_item_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_work_item_type AS ENUM (
    'RAW_METAL',
    'LOOSE_STONE',
    'INVENTORY_ITEM'
);


--
-- Name: job_work_order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_work_order_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: making_charge_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.making_charge_type AS ENUM (
    'PER_GRAM',
    'FIXED',
    'PERCENTAGE'
);


--
-- Name: metal_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.metal_type AS ENUM (
    'GOLD',
    'SILVER',
    'PLATINUM'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'BANK_TRANSFER',
    'CHEQUE'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REVERSED'
);


--
-- Name: purchase_bill_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.purchase_bill_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'PARTIALLY_PAID',
    'PAID',
    'CANCELLED'
);


--
-- Name: purchase_order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.purchase_order_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'RECEIVING',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: purchase_receipt_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.purchase_receipt_status AS ENUM (
    'DRAFT',
    'RECEIVED',
    'CANCELLED'
);


--
-- Name: purchase_return_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.purchase_return_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'PROCESSED',
    'CANCELLED'
);


--
-- Name: refund_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.refund_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'REVERSED'
);


--
-- Name: sales_invoice_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sales_invoice_status AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'CANCELLED'
);


--
-- Name: sales_return_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sales_return_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'PROCESSED',
    'CANCELLED'
);


--
-- Name: third_party_girvi_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.third_party_girvi_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'CLOSED',
    'CANCELLED'
);


--
-- Name: transfer_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transfer_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'REJECTED',
    'DISPATCHED',
    'RECEIVED',
    'CANCELLED'
);


--
-- Name: vendor_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vendor_payment_method AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'BANK_TRANSFER',
    'CHEQUE'
);


--
-- Name: vendor_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vendor_payment_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REVERSED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: login_history; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.login_history (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    login_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    logout_at timestamp with time zone,
    ip_address text,
    device text,
    browser text,
    status text DEFAULT 'SUCCESS'::text NOT NULL
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.password_reset_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.permissions (
    id uuid NOT NULL,
    module text NOT NULL,
    action text NOT NULL,
    permission_key text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.roles (
    id uuid NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.user_sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    refresh_token text NOT NULL,
    device text,
    browser text,
    ip_address text,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.users (
    id uuid NOT NULL,
    role_id uuid NOT NULL,
    employee_id uuid,
    first_name text NOT NULL,
    last_name text,
    email text NOT NULL,
    mobile text,
    password_hash text NOT NULL,
    avatar_url text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    last_login_at timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: approval_deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_deposits (
    id uuid NOT NULL,
    approval_id uuid NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    deposit_number text NOT NULL,
    payment_method public.payment_method NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public.payment_status DEFAULT 'COMPLETED'::public.payment_status NOT NULL,
    transaction_reference text,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    received_by uuid,
    reversed_at timestamp with time zone,
    reversed_by uuid,
    reversal_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: approval_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_items (
    id uuid NOT NULL,
    approval_id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_price numeric(12,2) DEFAULT 0.00 NOT NULL,
    status public.approval_item_status DEFAULT 'ISSUED'::public.approval_item_status NOT NULL,
    issued_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approvals (
    id uuid NOT NULL,
    approval_number text NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    salesperson_id uuid,
    issue_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp with time zone NOT NULL,
    status public.approval_status DEFAULT 'DRAFT'::public.approval_status NOT NULL,
    notes text,
    total_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_quantity integer DEFAULT 0 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    required_deposit_amount numeric(12,2) DEFAULT 0.00 NOT NULL
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    branch_code text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    pincode text,
    is_main_branch boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    company_code text NOT NULL,
    name text NOT NULL,
    legal_name text,
    gst_number text,
    pan_number text,
    email text,
    phone text,
    website text,
    logo_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    address_type text DEFAULT 'HOME'::text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: customer_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_documents (
    id uuid NOT NULL,
    customer_id uuid NOT NULL,
    document_type text NOT NULL,
    document_number text,
    file_url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: customer_gold_exchange_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_gold_exchange_items (
    id uuid NOT NULL,
    exchange_id uuid NOT NULL,
    metal_type public.metal_type NOT NULL,
    purity text NOT NULL,
    gross_weight numeric(12,3) NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) NOT NULL,
    metal_rate_id uuid,
    rate_per_gram numeric(12,2) DEFAULT 0.00 NOT NULL,
    metal_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    deduction_percent numeric(8,4) DEFAULT 0.0000 NOT NULL,
    deduction_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    exchange_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: customer_gold_exchanges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_gold_exchanges (
    id uuid NOT NULL,
    exchange_number text NOT NULL,
    sales_invoice_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status public.exchange_status DEFAULT 'REQUESTED'::public.exchange_status NOT NULL,
    total_gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_metal_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_deduction_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_exchange_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    remarks text,
    created_by uuid,
    updated_by uuid,
    applied_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid,
    customer_code text NOT NULL,
    first_name text NOT NULL,
    last_name text,
    email text,
    mobile text NOT NULL,
    pan_number text,
    aadhar_number text,
    gst_number text,
    customer_type text DEFAULT 'RETAIL'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    cash_balance numeric(15,2) DEFAULT 0.00,
    gold_balance_grams numeric(12,3) DEFAULT 0.000,
    opening_cash_balance numeric(15,2) DEFAULT 0.00,
    opening_gold_balance_grams numeric(12,3) DEFAULT 0.000,
    opening_silver_balance_grams numeric(12,3) DEFAULT 0.000,
    silver_balance_grams numeric(12,3) DEFAULT 0.000
);


--
-- Name: document_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_series (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid,
    financial_year_id uuid NOT NULL,
    document_type text NOT NULL,
    prefix text NOT NULL,
    next_number integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: employee_branch_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_branch_assignments (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    designation text NOT NULL,
    is_primary boolean DEFAULT true NOT NULL,
    effective_from timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    effective_to timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    employee_code text NOT NULL,
    first_name text NOT NULL,
    last_name text,
    email text,
    mobile text NOT NULL,
    joining_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: financial_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_years (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: girvi_collaterals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.girvi_collaterals (
    id uuid NOT NULL,
    girvi_loan_id uuid NOT NULL,
    inventory_item_id uuid,
    item_name text NOT NULL,
    metal_type text DEFAULT 'GOLD'::text NOT NULL,
    purity text DEFAULT '22K'::text NOT NULL,
    gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    valued_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    barcode text,
    rfid_epc text,
    image_url text,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    is_released boolean DEFAULT false NOT NULL,
    released_at timestamp with time zone
);


--
-- Name: girvi_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.girvi_collections (
    id uuid NOT NULL,
    collection_number text NOT NULL,
    girvi_loan_id uuid NOT NULL,
    payment_method public.girvi_payment_method DEFAULT 'CASH'::public.girvi_payment_method NOT NULL,
    amount numeric(12,2) NOT NULL,
    principal_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    interest_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    transaction_reference text,
    collection_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public.girvi_collection_status DEFAULT 'COMPLETED'::public.girvi_collection_status NOT NULL,
    reversal_reason text,
    reversed_at timestamp with time zone,
    reversed_by uuid,
    received_by uuid,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: girvi_loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.girvi_loans (
    id uuid NOT NULL,
    loan_number text NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    status public.girvi_loan_status DEFAULT 'ACTIVE'::public.girvi_loan_status NOT NULL,
    loan_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp with time zone NOT NULL,
    principal_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    valuation_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    interest_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    interest_period public.girvi_interest_period DEFAULT 'MONTHLY'::public.girvi_interest_period NOT NULL,
    notes text,
    document_ref text,
    created_by uuid,
    updated_by uuid,
    approved_by uuid,
    approved_at timestamp with time zone,
    closed_by uuid,
    closed_at timestamp with time zone,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: girvi_renewals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.girvi_renewals (
    id uuid NOT NULL,
    girvi_loan_id uuid NOT NULL,
    previous_due_date timestamp with time zone NOT NULL,
    new_due_date timestamp with time zone NOT NULL,
    accrued_interest_at_renewal numeric(12,2) DEFAULT 0.00 NOT NULL,
    principal_at_renewal numeric(12,2) DEFAULT 0.00 NOT NULL,
    interest_paid_at_renewal numeric(12,2) DEFAULT 0.00 NOT NULL,
    renewed_by uuid,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: girvi_settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.girvi_settlements (
    id uuid NOT NULL,
    settlement_number text NOT NULL,
    girvi_loan_id uuid NOT NULL,
    payment_method public.girvi_payment_method DEFAULT 'CASH'::public.girvi_payment_method NOT NULL,
    total_settlement_amount numeric(12,2) NOT NULL,
    principal_settled numeric(12,2) DEFAULT 0.00 NOT NULL,
    interest_settled numeric(12,2) DEFAULT 0.00 NOT NULL,
    transaction_reference text,
    settlement_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    settled_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: inventory_item_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_item_images (
    id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    image_url text NOT NULL,
    thumbnail_url text,
    alt_text text,
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    purchase_receipt_item_id uuid,
    item_code text NOT NULL,
    gross_weight numeric(12,3) NOT NULL,
    net_weight numeric(12,3) NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    fine_weight numeric(12,3) NOT NULL,
    purity text NOT NULL,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: inventory_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_tags (
    id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    barcode text NOT NULL,
    rfid_epc text,
    is_active boolean DEFAULT true NOT NULL,
    tagged_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: inventory_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transfers (
    id uuid NOT NULL,
    transfer_code text NOT NULL,
    inventory_item_id uuid NOT NULL,
    from_branch_id uuid NOT NULL,
    to_branch_id uuid NOT NULL,
    status public.transfer_status DEFAULT 'REQUESTED'::public.transfer_status NOT NULL,
    requested_by uuid NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    dispatched_by uuid,
    dispatched_at timestamp with time zone,
    received_by uuid,
    received_at timestamp with time zone,
    rejected_by uuid,
    rejected_at timestamp with time zone,
    rejection_reason text,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: job_work_material_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_work_material_issues (
    id uuid NOT NULL,
    job_work_order_id uuid NOT NULL,
    item_type public.job_work_item_type DEFAULT 'RAW_METAL'::public.job_work_item_type NOT NULL,
    inventory_item_id uuid,
    description text NOT NULL,
    gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    purity text NOT NULL,
    fine_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    issued_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    issued_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: job_work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_work_orders (
    id uuid NOT NULL,
    order_number text NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    status public.job_work_order_status DEFAULT 'DRAFT'::public.job_work_order_status NOT NULL,
    issue_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expected_delivery_date timestamp with time zone,
    completed_at timestamp with time zone,
    target_item_name text NOT NULL,
    metal_type text DEFAULT 'GOLD'::text NOT NULL,
    purity text DEFAULT '22K'::text NOT NULL,
    agreed_wastage_percent numeric(5,2) DEFAULT 0.00 NOT NULL,
    agreed_making_charge_per_gram numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_issued_fine_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_received_fine_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_wastage_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    notes text,
    created_by uuid,
    updated_by uuid,
    submitted_by uuid,
    submitted_at timestamp with time zone,
    assigned_by uuid,
    assigned_at timestamp with time zone,
    completed_by uuid,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: job_work_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_work_receipts (
    id uuid NOT NULL,
    receipt_number text NOT NULL,
    job_work_order_id uuid NOT NULL,
    inventory_item_id uuid,
    item_name text NOT NULL,
    gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    purity text NOT NULL,
    fine_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    actual_wastage_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    received_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    received_by uuid,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: making_charges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.making_charges (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    metal_type public.metal_type NOT NULL,
    purity text NOT NULL,
    charge_type public.making_charge_type NOT NULL,
    rate numeric(12,2) NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    effective_to timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: metal_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metal_rates (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    metal_type public.metal_type NOT NULL,
    purity text NOT NULL,
    market_rate_per_gram numeric(12,2),
    rate_per_gram numeric(12,2) NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    effective_to timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    thumbnail_url text,
    alt_text text,
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: product_sub_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_sub_categories (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    sub_category_id uuid NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    metal_type text DEFAULT 'GOLD'::text NOT NULL,
    purity text DEFAULT '22K'::text NOT NULL,
    gross_weight numeric(10,3) DEFAULT 0.00 NOT NULL,
    net_weight numeric(10,3) DEFAULT 0.00 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_bill_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_bill_items (
    id uuid NOT NULL,
    purchase_bill_id uuid NOT NULL,
    purchase_order_item_id uuid,
    purchase_receipt_item_id uuid,
    inventory_item_id uuid,
    item_name text NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    purchase_rate numeric(12,2) DEFAULT 0.00 NOT NULL,
    metal_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    taxable_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    line_total numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_bills (
    id uuid NOT NULL,
    bill_number text NOT NULL,
    purchase_order_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status public.purchase_bill_status DEFAULT 'DRAFT'::public.purchase_bill_status NOT NULL,
    bill_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    grand_total numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    outstanding_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    notes text,
    created_by uuid,
    updated_by uuid,
    submitted_by uuid,
    submitted_at timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    product_id uuid,
    metal_type public.metal_type NOT NULL,
    purity text NOT NULL,
    item_name text NOT NULL,
    description text,
    ordered_quantity integer DEFAULT 1 NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL,
    gross_weight numeric(10,3) NOT NULL,
    net_weight numeric(10,3) NOT NULL,
    stone_weight numeric(10,3) DEFAULT 0.000 NOT NULL,
    expected_rate numeric(12,2) NOT NULL,
    making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    item_total numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id uuid NOT NULL,
    purchase_order_number text NOT NULL,
    vendor_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status public.purchase_order_status DEFAULT 'DRAFT'::public.purchase_order_status NOT NULL,
    order_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expected_delivery_date timestamp with time zone,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    grand_total numeric(12,2) DEFAULT 0.00 NOT NULL,
    notes text,
    terms_conditions text,
    created_by uuid,
    updated_by uuid,
    submitted_by uuid,
    submitted_at timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_receipt_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_receipt_items (
    id uuid NOT NULL,
    purchase_receipt_id uuid NOT NULL,
    product_id uuid NOT NULL,
    received_quantity integer DEFAULT 1 NOT NULL,
    gross_weight numeric(12,3) NOT NULL,
    net_weight numeric(12,3) NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    fine_weight numeric(12,3) NOT NULL,
    purchase_rate numeric(12,2) NOT NULL,
    making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    item_total numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_receipts (
    id uuid NOT NULL,
    purchase_receipt_number text NOT NULL,
    purchase_order_id uuid NOT NULL,
    status public.purchase_receipt_status DEFAULT 'DRAFT'::public.purchase_receipt_status NOT NULL,
    received_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    grand_total numeric(12,2) DEFAULT 0.00 NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_return_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_return_items (
    id uuid NOT NULL,
    purchase_return_id uuid NOT NULL,
    purchase_bill_item_id uuid,
    inventory_item_id uuid,
    item_name text NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    purchase_rate numeric(12,2) DEFAULT 0.00 NOT NULL,
    metal_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    line_total numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: purchase_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_returns (
    id uuid NOT NULL,
    return_number text NOT NULL,
    purchase_bill_id uuid,
    purchase_order_id uuid,
    vendor_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status public.purchase_return_status DEFAULT 'DRAFT'::public.purchase_return_status NOT NULL,
    return_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text DEFAULT 'DEFECTIVE'::text NOT NULL,
    notes text,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_return_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_by uuid,
    updated_by uuid,
    submitted_by uuid,
    submitted_at timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    processed_by uuid,
    processed_at timestamp with time zone,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: sales_invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoice_items (
    id uuid NOT NULL,
    sales_invoice_id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    metal_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    wastage_percent numeric(5,2) DEFAULT 0.00 NOT NULL,
    wastage_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    wastage_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    making_charge_type public.making_charge_type,
    making_charge_rate numeric(12,2) DEFAULT 0.00 NOT NULL,
    making_charge_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    taxable_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    line_total numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    product_name_snapshot text,
    product_sku_snapshot text,
    metal_type_snapshot text,
    purity_snapshot text,
    gross_weight_snapshot numeric(12,3),
    net_weight_snapshot numeric(12,3),
    stone_weight_snapshot numeric(12,3),
    fine_weight_snapshot numeric(12,3)
);


--
-- Name: sales_invoice_metal_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoice_metal_rates (
    id uuid NOT NULL,
    sales_invoice_id uuid NOT NULL,
    metal_rate_id uuid,
    metal_type public.metal_type NOT NULL,
    purity text NOT NULL,
    rate_per_gram numeric(12,2) NOT NULL,
    locked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sales_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoices (
    id uuid NOT NULL,
    invoice_number text NOT NULL,
    customer_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    salesperson_id uuid,
    status public.sales_invoice_status DEFAULT 'DRAFT'::public.sales_invoice_status NOT NULL,
    invoice_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    metal_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    wastage_value numeric(12,2) DEFAULT 0.00 NOT NULL,
    making_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    taxable_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    cgst_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    sgst_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    igst_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    grand_total numeric(12,2) DEFAULT 0.00 NOT NULL,
    pricing_calculated boolean DEFAULT false NOT NULL,
    pricing_calculated_at timestamp with time zone,
    notes text,
    created_by_user_id uuid,
    updated_by_user_id uuid,
    metal_rate_locked boolean DEFAULT false NOT NULL,
    metal_rate_locked_at timestamp with time zone,
    total_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    outstanding_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    payment_status text DEFAULT 'UNPAID'::text NOT NULL,
    exchange_credit numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    company_name_snapshot text,
    company_gst_snapshot text,
    company_address_snapshot text,
    branch_name_snapshot text,
    branch_address_snapshot text,
    customer_name_snapshot text,
    customer_mobile_snapshot text,
    customer_address_snapshot text,
    customer_gst_snapshot text
);


--
-- Name: sales_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_payments (
    id uuid NOT NULL,
    sales_invoice_id uuid NOT NULL,
    payment_number text NOT NULL,
    payment_method public.payment_method NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public.payment_status DEFAULT 'COMPLETED'::public.payment_status NOT NULL,
    transaction_reference text,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    received_by uuid,
    reversed_at timestamp with time zone,
    reversed_by uuid,
    reversal_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: sales_refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_refunds (
    id uuid NOT NULL,
    sales_return_id uuid NOT NULL,
    refund_number text NOT NULL,
    refund_method public.payment_method NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public.refund_status DEFAULT 'COMPLETED'::public.refund_status NOT NULL,
    transaction_reference text,
    remarks text,
    processed_by uuid,
    reversed_at timestamp with time zone,
    reversed_by uuid,
    reversal_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: sales_return_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_return_items (
    id uuid NOT NULL,
    sales_return_id uuid NOT NULL,
    sales_invoice_item_id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    original_amount numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    deduction_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    refund_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    reason text,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: sales_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_returns (
    id uuid NOT NULL,
    return_number text NOT NULL,
    sales_invoice_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status public.sales_return_status DEFAULT 'REQUESTED'::public.sales_return_status NOT NULL,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    deduction_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    refund_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    reason text,
    remarks text,
    requested_by uuid,
    approved_by uuid,
    processed_by uuid,
    cancelled_by uuid,
    approved_at timestamp with time zone,
    processed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustments (
    id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    previous_status text NOT NULL,
    new_status text NOT NULL,
    previous_gross_weight numeric(10,3) NOT NULL,
    new_gross_weight numeric(10,3) NOT NULL,
    previous_net_weight numeric(10,3) NOT NULL,
    new_net_weight numeric(10,3) NOT NULL,
    reason text NOT NULL,
    adjusted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_audit_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_audit_items (
    id uuid NOT NULL,
    audit_session_id uuid NOT NULL,
    inventory_item_id uuid,
    barcode text,
    rfid_epc text,
    status public.audit_item_status DEFAULT 'MATCHED'::public.audit_item_status NOT NULL,
    expected_gross_weight numeric(12,3),
    expected_net_weight numeric(12,3),
    scanned_gross_weight numeric(12,3),
    scanned_net_weight numeric(12,3),
    weight_discrepancy numeric(12,3) DEFAULT 0.000 NOT NULL,
    remarks text,
    scanned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    scanned_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: stock_audit_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_audit_sessions (
    id uuid NOT NULL,
    audit_number text NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    category_id uuid,
    status public.audit_session_status DEFAULT 'IN_PROGRESS'::public.audit_session_status NOT NULL,
    start_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp with time zone,
    total_expected_items integer DEFAULT 0 NOT NULL,
    total_scanned_items integer DEFAULT 0 NOT NULL,
    total_matched_items integer DEFAULT 0 NOT NULL,
    total_missing_items integer DEFAULT 0 NOT NULL,
    total_unexpected_items integer DEFAULT 0 NOT NULL,
    total_weight_mismatch_items integer DEFAULT 0 NOT NULL,
    total_expected_net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    total_scanned_net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    notes text,
    audited_by uuid,
    reconciled_by uuid,
    reconciled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    from_branch_id uuid,
    to_branch_id uuid,
    movement_type text NOT NULL,
    reference_type text,
    reference_id text,
    remarks text,
    performed_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tax_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rates (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    tax_name text NOT NULL,
    tax_code text NOT NULL,
    rate numeric(5,2) NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    effective_to timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: third_party_girvi_collaterals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.third_party_girvi_collaterals (
    id uuid NOT NULL,
    third_party_girvi_id uuid NOT NULL,
    inventory_item_id uuid,
    item_name text NOT NULL,
    metal_type text DEFAULT 'GOLD'::text NOT NULL,
    purity text DEFAULT '22K'::text NOT NULL,
    gross_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    stone_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    net_weight numeric(12,3) DEFAULT 0.000 NOT NULL,
    valued_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    barcode text,
    rfid_epc text,
    image_url text,
    is_released boolean DEFAULT false NOT NULL,
    released_at timestamp with time zone,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: third_party_girvis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.third_party_girvis (
    id uuid NOT NULL,
    reference_number text NOT NULL,
    external_loan_number text NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    third_party_lender_id uuid NOT NULL,
    loan_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp with time zone NOT NULL,
    principal_amount numeric(12,2) NOT NULL,
    valuation_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    interest_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    interest_period public.girvi_interest_period DEFAULT 'MONTHLY'::public.girvi_interest_period NOT NULL,
    status public.third_party_girvi_status DEFAULT 'DRAFT'::public.third_party_girvi_status NOT NULL,
    notes text,
    "documentRef" text,
    created_by uuid,
    approved_by uuid,
    approved_at timestamp with time zone,
    closed_by uuid,
    closed_at timestamp with time zone,
    closure_reason text,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: third_party_lenders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.third_party_lenders (
    id uuid NOT NULL,
    lender_code text NOT NULL,
    name text NOT NULL,
    contact_person text,
    mobile text,
    email text,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: vendor_debit_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_debit_notes (
    id uuid NOT NULL,
    debit_note_number text NOT NULL,
    purchase_return_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    purchase_bill_id uuid,
    amount numeric(12,2) NOT NULL,
    status public.debit_note_status DEFAULT 'ISSUED'::public.debit_note_status NOT NULL,
    issue_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: vendor_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_payments (
    id uuid NOT NULL,
    purchase_bill_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    payment_number text NOT NULL,
    payment_method public.vendor_payment_method NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public.vendor_payment_status DEFAULT 'COMPLETED'::public.vendor_payment_status NOT NULL,
    transaction_reference text,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    received_by uuid,
    processed_by uuid,
    reversed_at timestamp with time zone,
    reversed_by uuid,
    reversal_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    branch_id uuid,
    vendor_code text NOT NULL,
    company_name text NOT NULL,
    contact_person text,
    email text,
    mobile text NOT NULL,
    gst_number text,
    pan_number text,
    address_line1 text,
    city text,
    state text,
    pincode text,
    vendor_type text DEFAULT 'JEWELLERY'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.login_history (id, user_id, login_at, logout_at, ip_address, device, browser, status) FROM stdin;
56fbd165-49a2-4cf6-9992-fe612ad0a3c5	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:15:19.3-07	\N	::1	Unknown	Unknown	SUCCESS
b307ab08-ebde-4ce5-9d48-9d65b7bfbd33	dc6935a9-bd7a-419a-8403-4d2a537063e9	2026-08-21 07:15:19.496-07	\N	::1	Unknown	Unknown	SUCCESS
15e95869-1e1c-489b-8fcf-4564687e2358	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:15:56.417-07	\N	::1	Unknown	Unknown	SUCCESS
1b23e8e9-0f5c-46e3-af81-4a29352d45d3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:16:35.408-07	\N	::1	Unknown	Unknown	SUCCESS
b1096b09-440c-48bc-bcb8-5f8135474501	bdcc6746-6409-40d8-a6db-0bf31f64d1b0	2026-08-21 07:16:35.549-07	\N	::1	Unknown	Unknown	SUCCESS
9205df97-7fe9-4beb-a6e0-466983114ebc	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:20:28.383-07	\N	::1	Unknown	Unknown	SUCCESS
f5cf4122-51ea-4887-9617-d50a193b7e8f	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:41:16.528-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
909aca1d-180c-4cf1-ac61-024f31c9e4f6	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:53:44.423-07	\N	::1	Unknown	Unknown	SUCCESS
17910b58-6a51-432c-8bf1-592e531fd293	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:57:12.123-07	\N	::1	Unknown	Unknown	SUCCESS
3d3a8edb-8808-4bbe-9d19-5a5e39f6a7f1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:11.557-07	\N	::1	Unknown	Unknown	SUCCESS
4ec18682-5f16-4577-8de6-5f95d0cc29e0	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:09:09.65-07	\N	::1	Unknown	Unknown	SUCCESS
84d80b26-ba7e-45d5-ba41-5e474bc17880	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:09:49.28-07	\N	::1	Unknown	Unknown	SUCCESS
8db63e67-b617-4a6e-bf2b-a306fa06c51f	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:02.788-07	\N	::1	Unknown	Unknown	SUCCESS
14f2a611-b1bb-4a98-aae6-5dcb0681bbef	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:52.622-07	\N	::1	Unknown	Unknown	SUCCESS
1c02a668-b0e7-4b2c-aa44-705e233662bd	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:25.023-07	\N	::1	Unknown	Unknown	SUCCESS
63b75ecf-99a8-4a99-866a-83c462422665	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:01.372-07	\N	::1	Unknown	Unknown	SUCCESS
4baa934a-996b-4962-9627-ae7d903346db	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:19.054-07	\N	::1	Unknown	Unknown	SUCCESS
99070686-9b5a-481c-9146-18475f58c8d5	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:02.222-07	\N	::1	Unknown	Unknown	SUCCESS
349f6be9-884d-492c-abec-75b0947bf1b5	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:05.789-07	\N	::1	Unknown	Unknown	SUCCESS
88914a57-4e28-460e-a800-f44a673b7747	79db14f1-bcd7-441a-8a69-a3f37634b21c	2026-08-21 09:04:21.201-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
9970ee11-fb0f-4374-918b-ceb1439e5cf3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 09:04:27.326-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
94f21ab3-c0fc-42cf-ab5b-2425201b3739	570d7978-a898-4e3b-b2fd-efde15723b8f	2026-08-21 09:04:53.494-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
7913f349-65b6-43a7-9cc4-7759bbf364dc	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 09:05:34.342-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
1549a381-90d4-44b3-8cf4-b4798fae769f	570d7978-a898-4e3b-b2fd-efde15723b8f	2026-08-21 09:06:24.556-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
a5946991-8509-4b8e-8595-ce26671d7530	bdcc6746-6409-40d8-a6db-0bf31f64d1b0	2026-08-21 09:07:23.326-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
d9cf7cce-ec2f-4917-9474-30a7bef254dc	570d7978-a898-4e3b-b2fd-efde15723b8f	2026-08-21 09:08:20.753-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
65ae99c1-c6c4-4b30-b81c-57a929f18603	79db14f1-bcd7-441a-8a69-a3f37634b21c	2026-08-21 09:10:41.143-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
00aaacaa-fbc4-477f-8842-51c38ed0fd40	79db14f1-bcd7-441a-8a69-a3f37634b21c	2026-08-21 09:13:24.181-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
bd282367-909e-4860-82d7-ffbd05d3bd39	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 09:14:54.776-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
0782a0bc-562b-4ef4-aaf5-6d816d669994	79db14f1-bcd7-441a-8a69-a3f37634b21c	2026-08-21 09:19:16.924-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
a587965d-f738-4bd5-a14d-8ad4326d6a35	79db14f1-bcd7-441a-8a69-a3f37634b21c	2026-08-21 09:20:17.296-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
34472188-ade3-4b37-a764-b1d7fc22fda6	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 09:21:42.283-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
2bcbc474-5a76-4f69-83ec-3124f822d6e9	570d7978-a898-4e3b-b2fd-efde15723b8f	2026-08-21 09:21:50.143-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
a7e28463-575b-43f3-9e2e-6161bc341d1a	79db14f1-bcd7-441a-8a69-a3f37634b21c	2026-08-21 11:15:05.19-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
736627df-1336-48e7-bc43-0862b6923801	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:15:08.883-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
dc250320-b003-4d42-a7ae-e37314d8a48e	570d7978-a898-4e3b-b2fd-efde15723b8f	2026-08-21 11:15:17.251-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
7ec2931a-b80c-4b73-9f79-1e2a540b2e7d	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:15:25.877-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
99a66917-7022-4f66-a169-30933e2bdb22	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:17:29.125-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
917e4ac6-b1d3-4721-818e-7d6b99dfbd61	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:18:01.097-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
4c8480c1-9551-4c96-ac67-61ee030faca2	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:18:26.069-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
a59bd779-e746-4e96-ba8f-412ce524accb	f0f76d02-09a8-4499-acc3-f6f3fb6d16f2	2026-08-21 11:19:03.097-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
69c8ecb6-4b8b-4366-bd88-b644a7679fbd	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:23:16.941-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
fb8eafc5-2964-40b7-9ce0-d93b88de88a7	f0f76d02-09a8-4499-acc3-f6f3fb6d16f2	2026-08-21 11:26:31.516-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
c0d85235-39d2-478a-a6c7-63d4f7f6e076	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:27:58.594-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
911ba1d8-d92f-4525-926b-87873de4729c	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:33:34.938-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
923327aa-75cc-442e-8f5b-55308e7266fc	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:38:12.717-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
af918d76-69e0-4102-9117-e756bf2ba08c	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 11:48:28.268-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
79760a28-3c72-43a2-82a8-754afb8c8950	570d7978-a898-4e3b-b2fd-efde15723b8f	2026-08-21 13:31:38.377-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
1122f759-4882-4682-b862-8bbb6c1732f5	bdcc6746-6409-40d8-a6db-0bf31f64d1b0	2026-08-21 13:38:36.685-07	\N	127.0.0.1	Desktop	Chrome	SUCCESS
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.password_reset_tokens (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.permissions (id, module, action, permission_key, description, created_at) FROM stdin;
d610cd5c-bc94-4d78-b712-cc097904ba86	user	create	user.create	Create system user account	2026-08-21 07:14:37.133-07
649db1e9-a02b-4fe5-b252-850e1b546e26	user	read	user.read	View user accounts and profiles	2026-08-21 07:14:37.137-07
55c232c9-e613-478d-9692-3c1abc0f53fc	user	update	user.update	Update user account details	2026-08-21 07:14:37.139-07
f4007199-702d-485a-9be7-95008da04976	user	delete	user.delete	Delete user account	2026-08-21 07:14:37.141-07
36f9ade8-cd4e-45dc-92f3-ce11cb8dabfb	role	create	role.create	Create system security role	2026-08-21 07:14:37.143-07
5e6dc896-7ffc-4669-b636-578daa84752a	role	read	role.read	View role definitions	2026-08-21 07:14:37.144-07
2a4a5f25-7349-43d8-aff6-bd0b7df84847	role	update	role.update	Update role definitions and permissions	2026-08-21 07:14:37.146-07
2a3672ff-c8e9-4c37-9a5a-1577e65798d1	role	delete	role.delete	Delete system security role	2026-08-21 07:14:37.147-07
aceb5516-c81c-4a58-9635-6c5ef89a7a18	role	assign_permission	role.assign_permission	Assign or revoke role permissions	2026-08-21 07:14:37.149-07
dd4ceb32-0ee0-4c50-927b-ab17885ca2d3	permission	create	permission.create	Create security permission	2026-08-21 07:14:37.15-07
cfb310a6-6ceb-4319-9ac6-9f2d3a900d19	permission	read	permission.read	View security permissions catalog	2026-08-21 07:14:37.152-07
5aeae31e-6ea1-4daf-835d-c87dd18bc7a4	permission	update	permission.update	Update permission details	2026-08-21 07:14:37.153-07
dec80f73-6b42-4564-923d-0b5890f23490	permission	delete	permission.delete	Delete security permission	2026-08-21 07:14:37.155-07
031f2f69-c4c1-4bef-98af-c8a330aa860f	company	create	company.create	Create enterprise company profile	2026-08-21 07:14:37.156-07
9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	company	read	company.read	View company details and listings	2026-08-21 07:14:37.158-07
392d4d59-a8df-4b70-b297-c03de7fe140d	company	update	company.update	Update company profile	2026-08-21 07:14:37.16-07
069e6e80-03c7-4261-840a-ce7ea32f68f0	company	delete	company.delete	Delete company profile	2026-08-21 07:14:37.162-07
b14ab512-623b-48e4-9073-58e9e8c4c283	branch	create	branch.create	Create company branch showroom	2026-08-21 07:14:37.163-07
6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	branch	read	branch.read	View branch details and listings	2026-08-21 07:14:37.166-07
103b9eb2-7412-496f-aef8-93b45e99721a	branch	update	branch.update	Update branch showroom profile	2026-08-21 07:14:37.167-07
4cf05537-bd66-4fbf-8cab-dd0ada6a4c25	branch	delete	branch.delete	Delete branch showroom	2026-08-21 07:14:37.169-07
09234bd6-e590-497d-b4e6-5f0e13d9824b	employee	create	employee.create	Create staff employee record	2026-08-21 07:14:37.171-07
695d7bef-a1ea-4154-b131-ff4a9830abb2	employee	read	employee.read	View employee profiles	2026-08-21 07:14:37.172-07
0780a790-a7de-4646-8b36-ca010b5fe75d	employee	update	employee.update	Update employee details	2026-08-21 07:14:37.174-07
8f273c7c-e3d7-4153-ac49-2a5bbc3dabd8	employee	delete	employee.delete	Delete employee record	2026-08-21 07:14:37.175-07
8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	customer	create	customer.create	Create customer profile	2026-08-21 07:14:37.176-07
43fb8cac-75d9-49c9-a511-aff4a626c318	customer	read	customer.read	View customer details and search	2026-08-21 07:14:37.178-07
ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	customer	update	customer.update	Update customer profile	2026-08-21 07:14:37.18-07
4522148d-86a0-4aad-bc96-f2ac2d39d3a9	customer	delete	customer.delete	Delete customer profile	2026-08-21 07:14:37.181-07
0abe698b-4dae-4d26-b60a-017717305c18	vendor	create	vendor.create	Create supplier vendor record	2026-08-21 07:14:37.183-07
ecc4517a-f80b-42b0-b96e-4af04f6a90cb	vendor	read	vendor.read	View vendor details and listings	2026-08-21 07:14:37.185-07
830d9bd9-baa7-417b-b6dd-40bfd3269153	vendor	update	vendor.update	Update vendor details	2026-08-21 07:14:37.187-07
c435fa0a-1f63-4024-9352-585cdc9de0f7	vendor	delete	vendor.delete	Delete vendor record	2026-08-21 07:14:37.188-07
60bec952-15eb-49cc-8a94-10a163023a86	product_category	create	product_category.create	Create product category	2026-08-21 07:14:37.19-07
190fb05b-a72e-4912-9882-d089017a3f37	product_category	read	product_category.read	View product category catalog	2026-08-21 07:14:37.192-07
414089bf-2c05-4357-87ab-e1c603152e18	product_category	update	product_category.update	Update product category	2026-08-21 07:14:37.193-07
76b75238-bba8-4d94-a1ca-547b2b540e78	product_category	delete	product_category.delete	Delete product category	2026-08-21 07:14:37.195-07
d46bbc1d-bfce-4d06-8b24-7548ea39a95d	product_sub_category	create	product_sub_category.create	Create product sub-category	2026-08-21 07:14:37.196-07
e9a097c9-eca9-4c75-8589-ef12ab76f119	product_sub_category	read	product_sub_category.read	View product sub-categories	2026-08-21 07:14:37.197-07
69f712e9-1307-40c2-a9af-b911ab5ba3f2	product_sub_category	update	product_sub_category.update	Update product sub-category	2026-08-21 07:14:37.198-07
e4be0463-fbfb-4c68-bc73-e7d14abafacd	product_sub_category	delete	product_sub_category.delete	Delete product sub-category	2026-08-21 07:14:37.199-07
e6e04942-bbd6-466f-985c-d3837cb97011	product	create	product.create	Create jewellery product master	2026-08-21 07:14:37.201-07
a88240ef-620e-4a1a-8e44-9745ad0ae415	product	read	product.read	View product catalog and details	2026-08-21 07:14:37.202-07
d65a1bd7-bd8f-460e-a92a-905a332433cb	product	update	product.update	Update product details	2026-08-21 07:14:37.203-07
33ebca3b-7e61-4500-bdfb-9977a277e7b3	product	delete	product.delete	Delete product master	2026-08-21 07:14:37.205-07
4fd559ee-753d-4a15-9d80-df9fb7cf9c73	inventory	create	inventory_item.create	Create physical inventory item and tag	2026-08-21 07:14:37.206-07
73c8a06a-6e7d-427f-9f85-fdac37ab138e	inventory	read	inventory_item.read	View physical inventory items and history	2026-08-21 07:14:37.206-07
4a33f96f-736a-4c23-9074-6736405d37f7	inventory	update	inventory_item.update	Update physical inventory item attributes	2026-08-21 07:14:37.207-07
ee30d5e2-750c-48d9-893f-ba00e1ab03e8	inventory	delete	inventory_item.delete	Delete physical inventory item	2026-08-21 07:14:37.208-07
369f2d0b-d2ee-44e6-b83a-96097992c721	stock_movement	create	stock_movement.create	Create physical stock movement record	2026-08-21 07:14:37.209-07
f22ec30c-6e73-43f7-a26b-3f36d0e94489	stock_movement	read	stock_movement.read	View stock movement ledger and history	2026-08-21 07:14:37.21-07
cfdb099f-7eb3-4d62-9e88-f0e1dc909087	inventory_tag	create	inventory_tag.create	Create or generate inventory tag	2026-08-21 07:14:37.211-07
eb3de749-cc8a-41e3-be8f-6d5b14b7642b	inventory_tag	read	inventory_tag.read	View inventory tag and perform barcode/QR lookup	2026-08-21 07:14:37.212-07
b58cc4af-664b-4296-9c4a-d0d4476cc420	inventory_tag	update	inventory_tag.update	Update, regenerate, or activate/deactivate inventory tag	2026-08-21 07:14:37.213-07
e6a55012-937d-4192-8653-f20bb2942587	inventory_transfer	create	inventory_transfer.create	Create branch stock transfer request	2026-08-21 07:14:37.214-07
1a736b92-0270-47ca-9233-69568eea59f6	inventory_transfer	read	inventory_transfer.read	View branch transfer requests and history	2026-08-21 07:14:37.215-07
ea86a67f-ae17-4490-a6da-fdfb640e19ea	inventory_transfer	approve	inventory_transfer.approve	Approve pending transfer request	2026-08-21 07:14:37.216-07
1bc78a5e-0195-4268-ba46-cc3d0a00d14a	inventory_transfer	reject	inventory_transfer.reject	Reject pending transfer request	2026-08-21 07:14:37.217-07
5e15b441-9ae0-423a-ae1a-25dcf2e6ceda	inventory_transfer	dispatch	inventory_transfer.dispatch	Dispatch approved transfer request	2026-08-21 07:14:37.218-07
10afaa6d-5f25-44ed-b079-5232ea42ebfb	inventory_transfer	receive	inventory_transfer.receive	Receive dispatched transfer request	2026-08-21 07:14:37.219-07
c41f5aec-59e7-4810-9712-91eb9a21647e	product_image	create	product_image.create	Upload product master image	2026-08-21 07:14:37.221-07
8b494e8e-a934-47b6-99e3-f8215bb724fc	product_image	read	product_image.read	View product master images	2026-08-21 07:14:37.222-07
717ba5b5-b606-45fd-8a01-93a38e8cb754	product_image	update	product_image.update	Update product master image metadata	2026-08-21 07:14:37.223-07
5eca908e-984a-4658-942c-5a2dd4f71f26	product_image	delete	product_image.delete	Delete product master image	2026-08-21 07:14:37.224-07
2e0d18a6-6de4-4eed-9dd5-7f0c63632f0e	inventory_item_image	create	inventory_item_image.create	Upload physical inventory item photograph	2026-08-21 07:14:37.225-07
07bef4eb-5d86-47bf-a0f6-54ba62f709ee	inventory_item_image	read	inventory_item_image.read	View physical inventory item photographs	2026-08-21 07:14:37.226-07
6a6a381f-4d2f-4d20-883b-34dc754f2f16	inventory_item_image	update	inventory_item_image.update	Update physical inventory item photograph metadata	2026-08-21 07:14:37.228-07
31bd8425-033f-4167-a691-4548bc4c76c2	inventory_item_image	delete	inventory_item_image.delete	Delete physical inventory item photograph	2026-08-21 07:14:37.229-07
0365ceef-282e-4292-a724-40c4c725a1fb	sales	create	sales_invoice.create	Create draft sales invoice	2026-08-21 07:14:37.83-07
ce52429a-f909-4a4b-86b8-c4848e74a84a	sales	read	sales_invoice.read	View sales invoices, invoice line items, and directories	2026-08-21 07:14:37.831-07
8a51f5fb-6fa2-483a-8785-7e388e1c3c62	sales	update	sales_invoice.update	Update draft sales invoice	2026-08-21 07:14:37.832-07
395415b5-a2ab-48f5-b457-a7ac9eb10538	sales	confirm	sales_invoice.confirm	Confirm draft sales invoice	2026-08-21 07:14:37.833-07
d91c1f1d-8d58-44fa-a9cc-bdffc0f14d29	sales	cancel	sales_invoice.cancel	Cancel draft or confirmed sales invoice	2026-08-21 07:14:37.834-07
e3b5563e-70e1-443e-a854-0d314496a482	metal_rate	create	metal_rate.create	Create company daily metal rates	2026-08-21 07:14:37.835-07
71e173f0-15a4-46c8-9370-75623f8c3b3f	metal_rate	read	metal_rate.read	View metal rates, history, and calculate metal values	2026-08-21 07:14:37.837-07
822d0fda-b8d7-4114-8aac-bf43d906bffe	metal_rate	update	metal_rate.update	Update, deactivate, or sync live metal rates	2026-08-21 07:14:37.838-07
bbfdd14c-640c-43fb-9747-f10ddab43845	making_charge	create	making_charge.create	Create making charge configurations	2026-08-21 07:14:37.839-07
96006098-da4f-44ea-a634-cd0f87a43c21	making_charge	read	making_charge.read	View making charge configurations and history	2026-08-21 07:14:37.841-07
9fc36e63-889f-4b7e-b71f-be22d353f32d	making_charge	update	making_charge.update	Update or deactivate making charge configurations	2026-08-21 07:14:37.842-07
73739fd1-acfb-40b3-9103-93a64dd283e3	tax_rate	create	tax_rate.create	Create tax rate configurations	2026-08-21 07:14:37.843-07
98372475-39a1-4c35-93b6-2bf130e7fca9	tax_rate	read	tax_rate.read	View tax rate configurations and history	2026-08-21 07:14:37.845-07
8a0989ea-60e5-422b-9954-0f7d9c72faa0	tax_rate	update	tax_rate.update	Update tax rate configurations	2026-08-21 07:14:37.846-07
49786495-bcbd-49f0-a761-b6e6ce02ac6b	sales_payment	create	sales_payment.create	Record payments for confirmed sales invoices	2026-08-21 07:14:37.847-07
66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	sales_payment	read	sales_payment.read	View sales payments, invoice payment history, and payment summaries	2026-08-21 07:14:37.849-07
be948fd2-6e7f-4a88-b305-68a413b20711	sales_payment	reverse	sales_payment.reverse	Reverse completed sales payments with audit reason	2026-08-21 07:14:37.85-07
a28d44dc-5dc4-4896-81be-d43a6f2433d0	gold_exchange	create	gold_exchange.create	Create customer gold exchange requests for draft sales invoices	2026-08-21 07:14:37.851-07
3615a126-806a-4d49-8ce0-0fdb5bb4b409	gold_exchange	read	gold_exchange.read	View customer gold exchange records and history	2026-08-21 07:14:37.853-07
5eaa5b87-fc4d-481e-915b-e01cfb618de5	gold_exchange	update	gold_exchange.update	Update customer gold exchange items in draft state	2026-08-21 07:14:37.855-07
561d9c69-d7f9-4bf7-8698-ccb67e01324c	gold_exchange	value	gold_exchange.value	Calculate valuation and snapshot metal rates for gold exchanges	2026-08-21 07:14:37.856-07
41ebd34f-7f30-4e35-b32e-58fbbbf2d503	gold_exchange	apply	gold_exchange.apply	Apply valued exchange credit to draft sales invoices	2026-08-21 07:14:37.857-07
a63f8415-7e21-4439-a77b-fa3371ca02f9	gold_exchange	cancel	gold_exchange.cancel	Cancel customer gold exchange requests	2026-08-21 07:14:37.858-07
02544c70-6dc9-4981-b3f7-bd7c71ce52ba	sales_return	create	sales_return.create	Create customer sales return requests for confirmed invoices	2026-08-21 07:14:37.859-07
aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	sales_return	read	sales_return.read	View sales return records, item breakdowns, and return history	2026-08-21 07:14:37.861-07
653d3f4a-a52f-41df-8431-41f359e150c1	sales_return	update	sales_return.update	Update customer sales return requests in requested state	2026-08-21 07:14:37.862-07
4488fb06-5a6b-4a2d-8aab-dcda88bc5043	sales_return	approve	sales_return.approve	Approve requested sales return requests	2026-08-21 07:14:37.864-07
16a389db-20f1-40ca-a563-d87b1a78927a	sales_return	process	sales_return.process	Process approved sales returns, restoring items to inventory	2026-08-21 07:14:37.865-07
d60da220-c44f-40a6-8193-15fd7b86a723	sales_return	cancel	sales_return.cancel	Cancel customer sales return requests	2026-08-21 07:14:37.866-07
6fc7794c-8725-4e92-9872-782aa099d5d8	sales_refund	create	sales_refund.create	Create and issue refund records for processed sales returns	2026-08-21 07:14:37.868-07
b309c1b4-e044-4f2a-95b8-bb2bf52fe39b	sales_refund	read	sales_refund.read	View sales refund ledgers, return refund histories, and details	2026-08-21 07:14:37.869-07
d64782ed-36ac-44c1-8d58-ffbe6a540ac3	sales_refund	reverse	sales_refund.reverse	Reverse sales refunds with mandatory audit reason	2026-08-21 07:14:37.87-07
191d2519-da5d-47f9-ad4f-5055d76f5ab2	purchase	create	purchase.create	Create draft purchase order	2026-08-21 07:14:38.124-07
3d62a545-4dab-443f-ae5f-1204f711a29f	purchase	read	purchase.read	View purchase orders, line items, and order history	2026-08-21 07:14:38.125-07
a2c893a4-f0c9-4a09-a285-0875b4edd207	purchase	update	purchase.update	Update draft purchase order	2026-08-21 07:14:38.126-07
81f98dfc-7392-47e2-8a33-2df9d62d1208	purchase	submit	purchase.submit	Submit draft purchase order for managerial approval	2026-08-21 07:14:38.127-07
44e59a48-092a-40a9-a29a-4d5f9c37ffcc	purchase	approve	purchase.approve	Approve submitted purchase order	2026-08-21 07:14:38.128-07
f239bb91-bb74-4351-8daf-b7cd0a32f86f	purchase	cancel	purchase.cancel	Cancel purchase order with cancellation reason	2026-08-21 07:14:38.13-07
74d5e7ad-2833-4a7e-9154-0989c60699db	purchase	receive	purchase.receive	Receive physical stock against purchase orders	2026-08-21 07:14:38.131-07
95b04f6f-6283-467b-b7a6-0bd26879181b	purchase	receipt.read	purchase.receipt.read	View purchase receipts	2026-08-21 07:14:38.132-07
975a7aed-608b-4c7e-874d-f44af728bd38	purchase_bill	create	purchase_bill.create	Create draft purchase bill	2026-08-21 07:14:38.134-07
c605710d-149d-4b37-969a-88d0aeefe474	purchase_bill	read	purchase_bill.read	View purchase bills and bill summaries	2026-08-21 07:14:38.135-07
fbd4dd66-0f36-47f6-88e0-847dac7f1eae	purchase_bill	update	purchase_bill.update	Update draft purchase bill	2026-08-21 07:14:38.136-07
d0e52e89-2119-4785-97ed-163ff7badd96	purchase_bill	submit	purchase_bill.submit	Submit draft purchase bill	2026-08-21 07:14:38.138-07
6a79b392-3622-4fc0-9042-f43bba95a1e0	purchase_bill	approve	purchase_bill.approve	Approve submitted purchase bill	2026-08-21 07:14:38.139-07
744d181f-57cc-44c4-bac2-fba1eed123bd	purchase_bill	cancel	purchase_bill.cancel	Cancel purchase bill	2026-08-21 07:14:38.14-07
f8b07153-635d-41a1-b98d-56118e2eadcd	vendor_payment	create	vendor_payment.create	Create vendor payment against purchase bill	2026-08-21 07:14:38.142-07
57070806-0b5a-4376-a846-137645d89ed3	vendor_payment	read	vendor_payment.read	View vendor payments, payment summaries, and payable ledgers	2026-08-21 07:14:38.143-07
98549f53-a15b-473b-b770-1bd4712e00cf	vendor_payment	reverse	vendor_payment.reverse	Reverse completed vendor payment	2026-08-21 07:14:38.144-07
1c7fcab9-1ccc-4b58-b2b2-22619cf40f13	purchase_return	create	purchase_return.create	Create draft purchase return	2026-08-21 07:14:38.146-07
94218b87-932b-4dfa-a8a0-c3e277f88fc4	purchase_return	read	purchase_return.read	View purchase returns and debit notes	2026-08-21 07:14:38.147-07
d7e78cc8-235a-4722-bf8e-5c29bb58af94	purchase_return	update	purchase_return.update	Update draft purchase return	2026-08-21 07:14:38.149-07
8d6b1d04-6e2a-43db-898f-e790cf0cf2be	purchase_return	submit	purchase_return.submit	Submit draft purchase return	2026-08-21 07:14:38.15-07
b17c6924-6b53-4b87-b083-237441a21e73	purchase_return	approve	purchase_return.approve	Approve submitted purchase return	2026-08-21 07:14:38.151-07
d688d360-f756-4ebf-82f3-da70efb65fed	purchase_return	process	purchase_return.process	Process approved purchase return, remove inventory, issue debit note	2026-08-21 07:14:38.153-07
1259a991-eb10-4286-8c07-69e259b155e5	purchase_return	cancel	purchase_return.cancel	Cancel purchase return	2026-08-21 07:14:38.154-07
5feb6aee-14b3-465b-98d3-f8b5baeca8ed	debit_note	read	debit_note.read	View vendor debit notes	2026-08-21 07:14:38.155-07
8fb48900-9d20-460d-9537-3b2ddaf1c69d	job_work	create	job_work.create	Create draft job work order	2026-08-21 07:14:38.157-07
e2231230-5519-46b3-83be-7c6cf42ca1d0	job_work	read	job_work.read	View job work orders and Karigar ledger	2026-08-21 07:14:38.158-07
24ce06ae-d4de-403f-9866-910e94a9f4e1	job_work	update	job_work.update	Update draft job work order	2026-08-21 07:14:38.16-07
aa07411f-7e39-48c8-abff-33252170bbd7	job_work	submit	job_work.submit	Submit draft job work order	2026-08-21 07:14:38.161-07
9f63250b-a337-4527-b2c4-d0e8f611ac03	job_work	assign	job_work.assign	Assign job work order to Karigar	2026-08-21 07:14:38.162-07
f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	job_work	issue	job_work.issue	Issue raw material or stock to Karigar	2026-08-21 07:14:38.164-07
a9b91840-8785-4c3d-ad7f-c751d6dd79c3	job_work	receive	job_work.receive	Receive finished goods or returned material from Karigar	2026-08-21 07:14:38.165-07
dfe8f006-577e-475b-a55f-88361d32fe04	job_work	cancel	job_work.cancel	Cancel job work order	2026-08-21 07:14:38.167-07
f94f08c1-2c42-4314-98f0-0c3fe7f17da5	stock_audit	create	stock_audit.create	Create Stock Audit session	2026-08-21 07:14:38.168-07
089bdcd8-0167-4de2-95e9-386303e1417b	stock_audit	read	stock_audit.read	View Stock Audit sessions and discrepancy reports	2026-08-21 07:14:38.17-07
7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	stock_audit	scan	stock_audit.scan	Scan physical items during stocktake	2026-08-21 07:14:38.171-07
ad9f179c-583a-41e7-9b26-03b4748b7e72	stock_audit	submit	stock_audit.submit	Submit completed Stock Audit session	2026-08-21 07:14:38.171-07
e852c55e-9cf9-4433-a013-5a2d0675da40	stock_audit	reconcile	stock_audit.reconcile	Reconcile Stock Audit discrepancies and adjust inventory	2026-08-21 07:14:38.172-07
61137584-8983-49f4-9bc0-db24a44703dc	stock_audit	cancel	stock_audit.cancel	Cancel Stock Audit session	2026-08-21 07:14:38.173-07
4506c7e4-171a-4904-b1e0-742b12eaad6b	girvi	create	girvi.create	Create Self Girvi collateral loans	2026-08-21 07:14:38.664-07
f276cd0e-69b8-4438-8ca5-9536a27b6f94	girvi	read	girvi.read	View Girvi loans, loan details, and pledged collateral	2026-08-21 07:14:38.666-07
4b5ca494-75f4-464e-b8e8-8ab205d29cf0	girvi	update	girvi.update	Update active or draft Girvi loans and add collateral items	2026-08-21 07:14:38.667-07
9d2982f6-c1d1-4394-83ca-36ce0769a1d8	girvi	approve	girvi.approve	Approve draft Girvi loans	2026-08-21 07:14:38.668-07
dc8f0199-c038-45d9-8d7d-991696a0fb8a	girvi	cancel	girvi.cancel	Cancel active or draft Girvi loans with reason	2026-08-21 07:14:38.669-07
5a221778-5a1a-48c1-8b09-1a3ac2c971ed	girvi	interest.read	girvi.interest.read	View real-time Girvi loan interest accruals & financial summary	2026-08-21 07:14:38.67-07
92da785b-cb17-448d-8352-15ca8d1d25d6	girvi	collection.create	girvi.collection.create	Record Girvi interest & principal payment collections	2026-08-21 07:14:38.671-07
2fcc4de5-4a22-468a-a09f-736cbddd71d0	girvi	collection.read	girvi.collection.read	View Girvi collection ledger & payment history	2026-08-21 07:14:38.673-07
a4057848-3111-4b71-af06-d8aff874aa20	girvi	collection.reverse	girvi.collection.reverse	Reverse Girvi collection with mandatory reason	2026-08-21 07:14:38.674-07
271415f3-6ad6-4453-b955-7217d7fca9a2	girvi	renew	girvi.renew	Renew Girvi loan & extend due date with audit logging	2026-08-21 07:14:38.675-07
103c8ddd-0bb5-49b0-8096-7afc3832d7b8	girvi	settlement.create	girvi.settlement.create	Settle Girvi loan balance and trigger collateral jewellery release	2026-08-21 07:14:38.676-07
b3991c7b-5fec-4945-95d6-5b0c079489fe	girvi	settlement.read	girvi.settlement.read	View Girvi loan settlement ledger and financial closure details	2026-08-21 07:14:38.678-07
afd810d5-53e5-4549-8ee3-17b4ec7d9732	girvi	release	girvi.release	Access and view released Girvi pledged collateral items	2026-08-21 07:14:38.679-07
3d5d07c0-e60b-434f-bfcd-26a957c17792	girvi	report.read	girvi.report.read	Access Girvi financial portfolio reports and audit trails	2026-08-21 07:14:38.681-07
a71173a9-15f7-4a5a-a1bf-f464cd05de82	third_party_girvi	create	third_party_girvi.create	Create third-party lenders and third-party Girvi records	2026-08-21 07:14:38.682-07
e2747fda-4d76-47f8-96fd-d74fed508721	third_party_girvi	read	third_party_girvi.read	View third-party lenders and third-party Girvi records	2026-08-21 07:14:38.684-07
b2b29c56-1aca-497d-8d54-698012c24977	third_party_girvi	update	third_party_girvi.update	Update draft third-party Girvi records and collaterals	2026-08-21 07:14:38.685-07
191a2ee6-be34-480a-a5b0-7d894a5ee332	third_party_girvi	approve	third_party_girvi.approve	Approve and activate third-party Girvi records	2026-08-21 07:14:38.687-07
403f53c8-7477-4c8a-bc09-2e653d3eceec	third_party_girvi	close	third_party_girvi.close	Close third-party Girvi records and release collateral	2026-08-21 07:14:38.688-07
48a82475-cff5-4382-9cdb-75e84e0f8e42	third_party_girvi	cancel	third_party_girvi.cancel	Cancel draft or active third-party Girvi records	2026-08-21 07:14:38.69-07
7a426000-84f1-40b4-9cef-4cb553448c38	third_party_girvi	release	third_party_girvi.release	Release specific third-party Girvi collateral items	2026-08-21 07:14:38.691-07
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.role_permissions (role_id, permission_id, created_at) FROM stdin;
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d610cd5c-bc94-4d78-b712-cc097904ba86	2026-08-21 07:14:37.234-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	649db1e9-a02b-4fe5-b252-850e1b546e26	2026-08-21 07:14:37.237-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	55c232c9-e613-478d-9692-3c1abc0f53fc	2026-08-21 07:14:37.238-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f4007199-702d-485a-9be7-95008da04976	2026-08-21 07:14:37.24-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	36f9ade8-cd4e-45dc-92f3-ce11cb8dabfb	2026-08-21 07:14:37.241-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5e6dc896-7ffc-4669-b636-578daa84752a	2026-08-21 07:14:37.243-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	2a4a5f25-7349-43d8-aff6-bd0b7df84847	2026-08-21 07:14:37.245-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	2a3672ff-c8e9-4c37-9a5a-1577e65798d1	2026-08-21 07:14:37.246-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	aceb5516-c81c-4a58-9635-6c5ef89a7a18	2026-08-21 07:14:37.248-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	dd4ceb32-0ee0-4c50-927b-ab17885ca2d3	2026-08-21 07:14:37.25-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	cfb310a6-6ceb-4319-9ac6-9f2d3a900d19	2026-08-21 07:14:37.251-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5aeae31e-6ea1-4daf-835d-c87dd18bc7a4	2026-08-21 07:14:37.253-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	dec80f73-6b42-4564-923d-0b5890f23490	2026-08-21 07:14:37.255-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	031f2f69-c4c1-4bef-98af-c8a330aa860f	2026-08-21 07:14:37.256-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.258-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	392d4d59-a8df-4b70-b297-c03de7fe140d	2026-08-21 07:14:37.259-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	069e6e80-03c7-4261-840a-ce7ea32f68f0	2026-08-21 07:14:37.261-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	b14ab512-623b-48e4-9073-58e9e8c4c283	2026-08-21 07:14:37.262-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.263-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	103b9eb2-7412-496f-aef8-93b45e99721a	2026-08-21 07:14:37.265-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4cf05537-bd66-4fbf-8cab-dd0ada6a4c25	2026-08-21 07:14:37.267-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	09234bd6-e590-497d-b4e6-5f0e13d9824b	2026-08-21 07:14:37.268-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.27-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	0780a790-a7de-4646-8b36-ca010b5fe75d	2026-08-21 07:14:37.271-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8f273c7c-e3d7-4153-ac49-2a5bbc3dabd8	2026-08-21 07:14:37.273-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.274-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.276-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	2026-08-21 07:14:37.278-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4522148d-86a0-4aad-bc96-f2ac2d39d3a9	2026-08-21 07:14:37.279-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	0abe698b-4dae-4d26-b60a-017717305c18	2026-08-21 07:14:37.281-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	ecc4517a-f80b-42b0-b96e-4af04f6a90cb	2026-08-21 07:14:37.283-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	830d9bd9-baa7-417b-b6dd-40bfd3269153	2026-08-21 07:14:37.284-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	c435fa0a-1f63-4024-9352-585cdc9de0f7	2026-08-21 07:14:37.286-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	60bec952-15eb-49cc-8a94-10a163023a86	2026-08-21 07:14:37.287-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.289-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	414089bf-2c05-4357-87ab-e1c603152e18	2026-08-21 07:14:37.29-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	76b75238-bba8-4d94-a1ca-547b2b540e78	2026-08-21 07:14:37.291-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d46bbc1d-bfce-4d06-8b24-7548ea39a95d	2026-08-21 07:14:37.293-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.295-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	69f712e9-1307-40c2-a9af-b911ab5ba3f2	2026-08-21 07:14:37.297-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e4be0463-fbfb-4c68-bc73-e7d14abafacd	2026-08-21 07:14:37.299-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e6e04942-bbd6-466f-985c-d3837cb97011	2026-08-21 07:14:37.3-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.301-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d65a1bd7-bd8f-460e-a92a-905a332433cb	2026-08-21 07:14:37.303-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	33ebca3b-7e61-4500-bdfb-9977a277e7b3	2026-08-21 07:14:37.304-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4fd559ee-753d-4a15-9d80-df9fb7cf9c73	2026-08-21 07:14:37.305-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.307-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4a33f96f-736a-4c23-9074-6736405d37f7	2026-08-21 07:14:37.308-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	ee30d5e2-750c-48d9-893f-ba00e1ab03e8	2026-08-21 07:14:37.309-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	369f2d0b-d2ee-44e6-b83a-96097992c721	2026-08-21 07:14:37.311-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.312-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	cfdb099f-7eb3-4d62-9e88-f0e1dc909087	2026-08-21 07:14:37.314-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.315-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	b58cc4af-664b-4296-9c4a-d0d4476cc420	2026-08-21 07:14:37.317-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e6a55012-937d-4192-8653-f20bb2942587	2026-08-21 07:14:37.318-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	1a736b92-0270-47ca-9233-69568eea59f6	2026-08-21 07:14:37.319-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	ea86a67f-ae17-4490-a6da-fdfb640e19ea	2026-08-21 07:14:37.321-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	1bc78a5e-0195-4268-ba46-cc3d0a00d14a	2026-08-21 07:14:37.322-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5e15b441-9ae0-423a-ae1a-25dcf2e6ceda	2026-08-21 07:14:37.324-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	10afaa6d-5f25-44ed-b079-5232ea42ebfb	2026-08-21 07:14:37.326-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	c41f5aec-59e7-4810-9712-91eb9a21647e	2026-08-21 07:14:37.327-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.331-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	717ba5b5-b606-45fd-8a01-93a38e8cb754	2026-08-21 07:14:37.334-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5eca908e-984a-4658-942c-5a2dd4f71f26	2026-08-21 07:14:37.336-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	2e0d18a6-6de4-4eed-9dd5-7f0c63632f0e	2026-08-21 07:14:37.337-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.338-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	6a6a381f-4d2f-4d20-883b-34dc754f2f16	2026-08-21 07:14:37.34-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	31bd8425-033f-4167-a691-4548bc4c76c2	2026-08-21 07:14:37.341-07
ea35650c-7f13-4431-bad4-f804bd65c844	d610cd5c-bc94-4d78-b712-cc097904ba86	2026-08-21 07:14:37.343-07
ea35650c-7f13-4431-bad4-f804bd65c844	649db1e9-a02b-4fe5-b252-850e1b546e26	2026-08-21 07:14:37.344-07
ea35650c-7f13-4431-bad4-f804bd65c844	55c232c9-e613-478d-9692-3c1abc0f53fc	2026-08-21 07:14:37.345-07
ea35650c-7f13-4431-bad4-f804bd65c844	f4007199-702d-485a-9be7-95008da04976	2026-08-21 07:14:37.347-07
ea35650c-7f13-4431-bad4-f804bd65c844	36f9ade8-cd4e-45dc-92f3-ce11cb8dabfb	2026-08-21 07:14:37.349-07
ea35650c-7f13-4431-bad4-f804bd65c844	5e6dc896-7ffc-4669-b636-578daa84752a	2026-08-21 07:14:37.351-07
ea35650c-7f13-4431-bad4-f804bd65c844	2a4a5f25-7349-43d8-aff6-bd0b7df84847	2026-08-21 07:14:37.352-07
ea35650c-7f13-4431-bad4-f804bd65c844	2a3672ff-c8e9-4c37-9a5a-1577e65798d1	2026-08-21 07:14:37.354-07
ea35650c-7f13-4431-bad4-f804bd65c844	aceb5516-c81c-4a58-9635-6c5ef89a7a18	2026-08-21 07:14:37.355-07
ea35650c-7f13-4431-bad4-f804bd65c844	dd4ceb32-0ee0-4c50-927b-ab17885ca2d3	2026-08-21 07:14:37.356-07
ea35650c-7f13-4431-bad4-f804bd65c844	cfb310a6-6ceb-4319-9ac6-9f2d3a900d19	2026-08-21 07:14:37.358-07
ea35650c-7f13-4431-bad4-f804bd65c844	5aeae31e-6ea1-4daf-835d-c87dd18bc7a4	2026-08-21 07:14:37.359-07
ea35650c-7f13-4431-bad4-f804bd65c844	dec80f73-6b42-4564-923d-0b5890f23490	2026-08-21 07:14:37.361-07
ea35650c-7f13-4431-bad4-f804bd65c844	031f2f69-c4c1-4bef-98af-c8a330aa860f	2026-08-21 07:14:37.362-07
ea35650c-7f13-4431-bad4-f804bd65c844	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.364-07
ea35650c-7f13-4431-bad4-f804bd65c844	392d4d59-a8df-4b70-b297-c03de7fe140d	2026-08-21 07:14:37.366-07
ea35650c-7f13-4431-bad4-f804bd65c844	069e6e80-03c7-4261-840a-ce7ea32f68f0	2026-08-21 07:14:37.367-07
ea35650c-7f13-4431-bad4-f804bd65c844	b14ab512-623b-48e4-9073-58e9e8c4c283	2026-08-21 07:14:37.368-07
ea35650c-7f13-4431-bad4-f804bd65c844	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.37-07
ea35650c-7f13-4431-bad4-f804bd65c844	103b9eb2-7412-496f-aef8-93b45e99721a	2026-08-21 07:14:37.371-07
ea35650c-7f13-4431-bad4-f804bd65c844	4cf05537-bd66-4fbf-8cab-dd0ada6a4c25	2026-08-21 07:14:37.372-07
ea35650c-7f13-4431-bad4-f804bd65c844	09234bd6-e590-497d-b4e6-5f0e13d9824b	2026-08-21 07:14:37.374-07
ea35650c-7f13-4431-bad4-f804bd65c844	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.376-07
ea35650c-7f13-4431-bad4-f804bd65c844	0780a790-a7de-4646-8b36-ca010b5fe75d	2026-08-21 07:14:37.377-07
ea35650c-7f13-4431-bad4-f804bd65c844	8f273c7c-e3d7-4153-ac49-2a5bbc3dabd8	2026-08-21 07:14:37.379-07
ea35650c-7f13-4431-bad4-f804bd65c844	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.38-07
ea35650c-7f13-4431-bad4-f804bd65c844	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.382-07
ea35650c-7f13-4431-bad4-f804bd65c844	ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	2026-08-21 07:14:37.383-07
ea35650c-7f13-4431-bad4-f804bd65c844	4522148d-86a0-4aad-bc96-f2ac2d39d3a9	2026-08-21 07:14:37.385-07
ea35650c-7f13-4431-bad4-f804bd65c844	0abe698b-4dae-4d26-b60a-017717305c18	2026-08-21 07:14:37.386-07
ea35650c-7f13-4431-bad4-f804bd65c844	ecc4517a-f80b-42b0-b96e-4af04f6a90cb	2026-08-21 07:14:37.388-07
ea35650c-7f13-4431-bad4-f804bd65c844	830d9bd9-baa7-417b-b6dd-40bfd3269153	2026-08-21 07:14:37.389-07
ea35650c-7f13-4431-bad4-f804bd65c844	c435fa0a-1f63-4024-9352-585cdc9de0f7	2026-08-21 07:14:37.391-07
ea35650c-7f13-4431-bad4-f804bd65c844	60bec952-15eb-49cc-8a94-10a163023a86	2026-08-21 07:14:37.396-07
ea35650c-7f13-4431-bad4-f804bd65c844	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.398-07
ea35650c-7f13-4431-bad4-f804bd65c844	414089bf-2c05-4357-87ab-e1c603152e18	2026-08-21 07:14:37.401-07
ea35650c-7f13-4431-bad4-f804bd65c844	76b75238-bba8-4d94-a1ca-547b2b540e78	2026-08-21 07:14:37.402-07
ea35650c-7f13-4431-bad4-f804bd65c844	d46bbc1d-bfce-4d06-8b24-7548ea39a95d	2026-08-21 07:14:37.404-07
ea35650c-7f13-4431-bad4-f804bd65c844	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.405-07
ea35650c-7f13-4431-bad4-f804bd65c844	69f712e9-1307-40c2-a9af-b911ab5ba3f2	2026-08-21 07:14:37.406-07
ea35650c-7f13-4431-bad4-f804bd65c844	e4be0463-fbfb-4c68-bc73-e7d14abafacd	2026-08-21 07:14:37.408-07
ea35650c-7f13-4431-bad4-f804bd65c844	e6e04942-bbd6-466f-985c-d3837cb97011	2026-08-21 07:14:37.409-07
ea35650c-7f13-4431-bad4-f804bd65c844	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.411-07
ea35650c-7f13-4431-bad4-f804bd65c844	d65a1bd7-bd8f-460e-a92a-905a332433cb	2026-08-21 07:14:37.414-07
ea35650c-7f13-4431-bad4-f804bd65c844	33ebca3b-7e61-4500-bdfb-9977a277e7b3	2026-08-21 07:14:37.416-07
ea35650c-7f13-4431-bad4-f804bd65c844	4fd559ee-753d-4a15-9d80-df9fb7cf9c73	2026-08-21 07:14:37.417-07
ea35650c-7f13-4431-bad4-f804bd65c844	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.418-07
ea35650c-7f13-4431-bad4-f804bd65c844	4a33f96f-736a-4c23-9074-6736405d37f7	2026-08-21 07:14:37.42-07
ea35650c-7f13-4431-bad4-f804bd65c844	ee30d5e2-750c-48d9-893f-ba00e1ab03e8	2026-08-21 07:14:37.421-07
ea35650c-7f13-4431-bad4-f804bd65c844	369f2d0b-d2ee-44e6-b83a-96097992c721	2026-08-21 07:14:37.428-07
ea35650c-7f13-4431-bad4-f804bd65c844	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.43-07
ea35650c-7f13-4431-bad4-f804bd65c844	cfdb099f-7eb3-4d62-9e88-f0e1dc909087	2026-08-21 07:14:37.431-07
ea35650c-7f13-4431-bad4-f804bd65c844	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.434-07
ea35650c-7f13-4431-bad4-f804bd65c844	b58cc4af-664b-4296-9c4a-d0d4476cc420	2026-08-21 07:14:37.436-07
ea35650c-7f13-4431-bad4-f804bd65c844	e6a55012-937d-4192-8653-f20bb2942587	2026-08-21 07:14:37.438-07
ea35650c-7f13-4431-bad4-f804bd65c844	1a736b92-0270-47ca-9233-69568eea59f6	2026-08-21 07:14:37.44-07
ea35650c-7f13-4431-bad4-f804bd65c844	ea86a67f-ae17-4490-a6da-fdfb640e19ea	2026-08-21 07:14:37.442-07
ea35650c-7f13-4431-bad4-f804bd65c844	1bc78a5e-0195-4268-ba46-cc3d0a00d14a	2026-08-21 07:14:37.443-07
ea35650c-7f13-4431-bad4-f804bd65c844	5e15b441-9ae0-423a-ae1a-25dcf2e6ceda	2026-08-21 07:14:37.444-07
ea35650c-7f13-4431-bad4-f804bd65c844	10afaa6d-5f25-44ed-b079-5232ea42ebfb	2026-08-21 07:14:37.445-07
ea35650c-7f13-4431-bad4-f804bd65c844	c41f5aec-59e7-4810-9712-91eb9a21647e	2026-08-21 07:14:37.447-07
ea35650c-7f13-4431-bad4-f804bd65c844	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.448-07
ea35650c-7f13-4431-bad4-f804bd65c844	717ba5b5-b606-45fd-8a01-93a38e8cb754	2026-08-21 07:14:37.45-07
ea35650c-7f13-4431-bad4-f804bd65c844	5eca908e-984a-4658-942c-5a2dd4f71f26	2026-08-21 07:14:37.452-07
ea35650c-7f13-4431-bad4-f804bd65c844	2e0d18a6-6de4-4eed-9dd5-7f0c63632f0e	2026-08-21 07:14:37.454-07
ea35650c-7f13-4431-bad4-f804bd65c844	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.456-07
ea35650c-7f13-4431-bad4-f804bd65c844	6a6a381f-4d2f-4d20-883b-34dc754f2f16	2026-08-21 07:14:37.458-07
ea35650c-7f13-4431-bad4-f804bd65c844	31bd8425-033f-4167-a691-4548bc4c76c2	2026-08-21 07:14:37.46-07
97712d68-3e3d-49fd-9061-12c6b681eded	d610cd5c-bc94-4d78-b712-cc097904ba86	2026-08-21 07:14:37.463-07
97712d68-3e3d-49fd-9061-12c6b681eded	649db1e9-a02b-4fe5-b252-850e1b546e26	2026-08-21 07:14:37.465-07
97712d68-3e3d-49fd-9061-12c6b681eded	55c232c9-e613-478d-9692-3c1abc0f53fc	2026-08-21 07:14:37.467-07
97712d68-3e3d-49fd-9061-12c6b681eded	f4007199-702d-485a-9be7-95008da04976	2026-08-21 07:14:37.47-07
97712d68-3e3d-49fd-9061-12c6b681eded	36f9ade8-cd4e-45dc-92f3-ce11cb8dabfb	2026-08-21 07:14:37.472-07
97712d68-3e3d-49fd-9061-12c6b681eded	5e6dc896-7ffc-4669-b636-578daa84752a	2026-08-21 07:14:37.473-07
97712d68-3e3d-49fd-9061-12c6b681eded	2a4a5f25-7349-43d8-aff6-bd0b7df84847	2026-08-21 07:14:37.475-07
97712d68-3e3d-49fd-9061-12c6b681eded	2a3672ff-c8e9-4c37-9a5a-1577e65798d1	2026-08-21 07:14:37.476-07
97712d68-3e3d-49fd-9061-12c6b681eded	aceb5516-c81c-4a58-9635-6c5ef89a7a18	2026-08-21 07:14:37.477-07
97712d68-3e3d-49fd-9061-12c6b681eded	dd4ceb32-0ee0-4c50-927b-ab17885ca2d3	2026-08-21 07:14:37.479-07
97712d68-3e3d-49fd-9061-12c6b681eded	cfb310a6-6ceb-4319-9ac6-9f2d3a900d19	2026-08-21 07:14:37.48-07
97712d68-3e3d-49fd-9061-12c6b681eded	5aeae31e-6ea1-4daf-835d-c87dd18bc7a4	2026-08-21 07:14:37.482-07
97712d68-3e3d-49fd-9061-12c6b681eded	dec80f73-6b42-4564-923d-0b5890f23490	2026-08-21 07:14:37.484-07
97712d68-3e3d-49fd-9061-12c6b681eded	031f2f69-c4c1-4bef-98af-c8a330aa860f	2026-08-21 07:14:37.486-07
97712d68-3e3d-49fd-9061-12c6b681eded	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.487-07
97712d68-3e3d-49fd-9061-12c6b681eded	392d4d59-a8df-4b70-b297-c03de7fe140d	2026-08-21 07:14:37.488-07
97712d68-3e3d-49fd-9061-12c6b681eded	069e6e80-03c7-4261-840a-ce7ea32f68f0	2026-08-21 07:14:37.49-07
97712d68-3e3d-49fd-9061-12c6b681eded	b14ab512-623b-48e4-9073-58e9e8c4c283	2026-08-21 07:14:37.491-07
97712d68-3e3d-49fd-9061-12c6b681eded	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.493-07
97712d68-3e3d-49fd-9061-12c6b681eded	103b9eb2-7412-496f-aef8-93b45e99721a	2026-08-21 07:14:37.495-07
97712d68-3e3d-49fd-9061-12c6b681eded	4cf05537-bd66-4fbf-8cab-dd0ada6a4c25	2026-08-21 07:14:37.497-07
97712d68-3e3d-49fd-9061-12c6b681eded	09234bd6-e590-497d-b4e6-5f0e13d9824b	2026-08-21 07:14:37.499-07
97712d68-3e3d-49fd-9061-12c6b681eded	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.501-07
97712d68-3e3d-49fd-9061-12c6b681eded	0780a790-a7de-4646-8b36-ca010b5fe75d	2026-08-21 07:14:37.502-07
97712d68-3e3d-49fd-9061-12c6b681eded	8f273c7c-e3d7-4153-ac49-2a5bbc3dabd8	2026-08-21 07:14:37.503-07
97712d68-3e3d-49fd-9061-12c6b681eded	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.506-07
97712d68-3e3d-49fd-9061-12c6b681eded	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.509-07
97712d68-3e3d-49fd-9061-12c6b681eded	ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	2026-08-21 07:14:37.51-07
97712d68-3e3d-49fd-9061-12c6b681eded	4522148d-86a0-4aad-bc96-f2ac2d39d3a9	2026-08-21 07:14:37.512-07
97712d68-3e3d-49fd-9061-12c6b681eded	0abe698b-4dae-4d26-b60a-017717305c18	2026-08-21 07:14:37.513-07
97712d68-3e3d-49fd-9061-12c6b681eded	ecc4517a-f80b-42b0-b96e-4af04f6a90cb	2026-08-21 07:14:37.515-07
97712d68-3e3d-49fd-9061-12c6b681eded	830d9bd9-baa7-417b-b6dd-40bfd3269153	2026-08-21 07:14:37.516-07
97712d68-3e3d-49fd-9061-12c6b681eded	c435fa0a-1f63-4024-9352-585cdc9de0f7	2026-08-21 07:14:37.518-07
97712d68-3e3d-49fd-9061-12c6b681eded	60bec952-15eb-49cc-8a94-10a163023a86	2026-08-21 07:14:37.519-07
97712d68-3e3d-49fd-9061-12c6b681eded	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.52-07
97712d68-3e3d-49fd-9061-12c6b681eded	414089bf-2c05-4357-87ab-e1c603152e18	2026-08-21 07:14:37.522-07
97712d68-3e3d-49fd-9061-12c6b681eded	76b75238-bba8-4d94-a1ca-547b2b540e78	2026-08-21 07:14:37.523-07
97712d68-3e3d-49fd-9061-12c6b681eded	d46bbc1d-bfce-4d06-8b24-7548ea39a95d	2026-08-21 07:14:37.524-07
97712d68-3e3d-49fd-9061-12c6b681eded	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.526-07
97712d68-3e3d-49fd-9061-12c6b681eded	69f712e9-1307-40c2-a9af-b911ab5ba3f2	2026-08-21 07:14:37.527-07
97712d68-3e3d-49fd-9061-12c6b681eded	e4be0463-fbfb-4c68-bc73-e7d14abafacd	2026-08-21 07:14:37.529-07
97712d68-3e3d-49fd-9061-12c6b681eded	e6e04942-bbd6-466f-985c-d3837cb97011	2026-08-21 07:14:37.53-07
97712d68-3e3d-49fd-9061-12c6b681eded	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.532-07
97712d68-3e3d-49fd-9061-12c6b681eded	d65a1bd7-bd8f-460e-a92a-905a332433cb	2026-08-21 07:14:37.533-07
97712d68-3e3d-49fd-9061-12c6b681eded	33ebca3b-7e61-4500-bdfb-9977a277e7b3	2026-08-21 07:14:37.535-07
97712d68-3e3d-49fd-9061-12c6b681eded	4fd559ee-753d-4a15-9d80-df9fb7cf9c73	2026-08-21 07:14:37.536-07
97712d68-3e3d-49fd-9061-12c6b681eded	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.537-07
97712d68-3e3d-49fd-9061-12c6b681eded	4a33f96f-736a-4c23-9074-6736405d37f7	2026-08-21 07:14:37.538-07
97712d68-3e3d-49fd-9061-12c6b681eded	ee30d5e2-750c-48d9-893f-ba00e1ab03e8	2026-08-21 07:14:37.54-07
97712d68-3e3d-49fd-9061-12c6b681eded	369f2d0b-d2ee-44e6-b83a-96097992c721	2026-08-21 07:14:37.541-07
97712d68-3e3d-49fd-9061-12c6b681eded	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.543-07
97712d68-3e3d-49fd-9061-12c6b681eded	cfdb099f-7eb3-4d62-9e88-f0e1dc909087	2026-08-21 07:14:37.544-07
97712d68-3e3d-49fd-9061-12c6b681eded	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.545-07
97712d68-3e3d-49fd-9061-12c6b681eded	b58cc4af-664b-4296-9c4a-d0d4476cc420	2026-08-21 07:14:37.546-07
97712d68-3e3d-49fd-9061-12c6b681eded	e6a55012-937d-4192-8653-f20bb2942587	2026-08-21 07:14:37.548-07
97712d68-3e3d-49fd-9061-12c6b681eded	1a736b92-0270-47ca-9233-69568eea59f6	2026-08-21 07:14:37.549-07
97712d68-3e3d-49fd-9061-12c6b681eded	ea86a67f-ae17-4490-a6da-fdfb640e19ea	2026-08-21 07:14:37.55-07
97712d68-3e3d-49fd-9061-12c6b681eded	1bc78a5e-0195-4268-ba46-cc3d0a00d14a	2026-08-21 07:14:37.552-07
97712d68-3e3d-49fd-9061-12c6b681eded	5e15b441-9ae0-423a-ae1a-25dcf2e6ceda	2026-08-21 07:14:37.553-07
97712d68-3e3d-49fd-9061-12c6b681eded	10afaa6d-5f25-44ed-b079-5232ea42ebfb	2026-08-21 07:14:37.554-07
97712d68-3e3d-49fd-9061-12c6b681eded	c41f5aec-59e7-4810-9712-91eb9a21647e	2026-08-21 07:14:37.555-07
97712d68-3e3d-49fd-9061-12c6b681eded	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.557-07
97712d68-3e3d-49fd-9061-12c6b681eded	717ba5b5-b606-45fd-8a01-93a38e8cb754	2026-08-21 07:14:37.558-07
97712d68-3e3d-49fd-9061-12c6b681eded	5eca908e-984a-4658-942c-5a2dd4f71f26	2026-08-21 07:14:37.559-07
97712d68-3e3d-49fd-9061-12c6b681eded	2e0d18a6-6de4-4eed-9dd5-7f0c63632f0e	2026-08-21 07:14:37.56-07
97712d68-3e3d-49fd-9061-12c6b681eded	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.561-07
97712d68-3e3d-49fd-9061-12c6b681eded	6a6a381f-4d2f-4d20-883b-34dc754f2f16	2026-08-21 07:14:37.563-07
97712d68-3e3d-49fd-9061-12c6b681eded	31bd8425-033f-4167-a691-4548bc4c76c2	2026-08-21 07:14:37.565-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d610cd5c-bc94-4d78-b712-cc097904ba86	2026-08-21 07:14:37.567-07
f265c350-6d1c-4c90-ad41-32945c60f0da	649db1e9-a02b-4fe5-b252-850e1b546e26	2026-08-21 07:14:37.568-07
f265c350-6d1c-4c90-ad41-32945c60f0da	55c232c9-e613-478d-9692-3c1abc0f53fc	2026-08-21 07:14:37.569-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f4007199-702d-485a-9be7-95008da04976	2026-08-21 07:14:37.571-07
f265c350-6d1c-4c90-ad41-32945c60f0da	031f2f69-c4c1-4bef-98af-c8a330aa860f	2026-08-21 07:14:37.572-07
f265c350-6d1c-4c90-ad41-32945c60f0da	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.574-07
f265c350-6d1c-4c90-ad41-32945c60f0da	392d4d59-a8df-4b70-b297-c03de7fe140d	2026-08-21 07:14:37.575-07
f265c350-6d1c-4c90-ad41-32945c60f0da	b14ab512-623b-48e4-9073-58e9e8c4c283	2026-08-21 07:14:37.576-07
f265c350-6d1c-4c90-ad41-32945c60f0da	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.577-07
f265c350-6d1c-4c90-ad41-32945c60f0da	103b9eb2-7412-496f-aef8-93b45e99721a	2026-08-21 07:14:37.579-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4cf05537-bd66-4fbf-8cab-dd0ada6a4c25	2026-08-21 07:14:37.58-07
f265c350-6d1c-4c90-ad41-32945c60f0da	09234bd6-e590-497d-b4e6-5f0e13d9824b	2026-08-21 07:14:37.581-07
f265c350-6d1c-4c90-ad41-32945c60f0da	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.582-07
f265c350-6d1c-4c90-ad41-32945c60f0da	0780a790-a7de-4646-8b36-ca010b5fe75d	2026-08-21 07:14:37.584-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8f273c7c-e3d7-4153-ac49-2a5bbc3dabd8	2026-08-21 07:14:37.585-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.586-07
f265c350-6d1c-4c90-ad41-32945c60f0da	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.587-07
f265c350-6d1c-4c90-ad41-32945c60f0da	ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	2026-08-21 07:14:37.589-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4522148d-86a0-4aad-bc96-f2ac2d39d3a9	2026-08-21 07:14:37.59-07
f265c350-6d1c-4c90-ad41-32945c60f0da	0abe698b-4dae-4d26-b60a-017717305c18	2026-08-21 07:14:37.591-07
f265c350-6d1c-4c90-ad41-32945c60f0da	ecc4517a-f80b-42b0-b96e-4af04f6a90cb	2026-08-21 07:14:37.592-07
f265c350-6d1c-4c90-ad41-32945c60f0da	830d9bd9-baa7-417b-b6dd-40bfd3269153	2026-08-21 07:14:37.593-07
f265c350-6d1c-4c90-ad41-32945c60f0da	c435fa0a-1f63-4024-9352-585cdc9de0f7	2026-08-21 07:14:37.595-07
f265c350-6d1c-4c90-ad41-32945c60f0da	60bec952-15eb-49cc-8a94-10a163023a86	2026-08-21 07:14:37.597-07
f265c350-6d1c-4c90-ad41-32945c60f0da	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.599-07
f265c350-6d1c-4c90-ad41-32945c60f0da	414089bf-2c05-4357-87ab-e1c603152e18	2026-08-21 07:14:37.6-07
f265c350-6d1c-4c90-ad41-32945c60f0da	76b75238-bba8-4d94-a1ca-547b2b540e78	2026-08-21 07:14:37.602-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d46bbc1d-bfce-4d06-8b24-7548ea39a95d	2026-08-21 07:14:37.603-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.605-07
f265c350-6d1c-4c90-ad41-32945c60f0da	69f712e9-1307-40c2-a9af-b911ab5ba3f2	2026-08-21 07:14:37.606-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e4be0463-fbfb-4c68-bc73-e7d14abafacd	2026-08-21 07:14:37.607-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e6e04942-bbd6-466f-985c-d3837cb97011	2026-08-21 07:14:37.608-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.61-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d65a1bd7-bd8f-460e-a92a-905a332433cb	2026-08-21 07:14:37.611-07
f265c350-6d1c-4c90-ad41-32945c60f0da	33ebca3b-7e61-4500-bdfb-9977a277e7b3	2026-08-21 07:14:37.612-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4fd559ee-753d-4a15-9d80-df9fb7cf9c73	2026-08-21 07:14:37.613-07
f265c350-6d1c-4c90-ad41-32945c60f0da	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.615-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4a33f96f-736a-4c23-9074-6736405d37f7	2026-08-21 07:14:37.616-07
f265c350-6d1c-4c90-ad41-32945c60f0da	ee30d5e2-750c-48d9-893f-ba00e1ab03e8	2026-08-21 07:14:37.617-07
f265c350-6d1c-4c90-ad41-32945c60f0da	369f2d0b-d2ee-44e6-b83a-96097992c721	2026-08-21 07:14:37.618-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.62-07
f265c350-6d1c-4c90-ad41-32945c60f0da	cfdb099f-7eb3-4d62-9e88-f0e1dc909087	2026-08-21 07:14:37.621-07
f265c350-6d1c-4c90-ad41-32945c60f0da	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.622-07
f265c350-6d1c-4c90-ad41-32945c60f0da	b58cc4af-664b-4296-9c4a-d0d4476cc420	2026-08-21 07:14:37.623-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e6a55012-937d-4192-8653-f20bb2942587	2026-08-21 07:14:37.624-07
f265c350-6d1c-4c90-ad41-32945c60f0da	1a736b92-0270-47ca-9233-69568eea59f6	2026-08-21 07:14:37.626-07
f265c350-6d1c-4c90-ad41-32945c60f0da	ea86a67f-ae17-4490-a6da-fdfb640e19ea	2026-08-21 07:14:37.627-07
f265c350-6d1c-4c90-ad41-32945c60f0da	1bc78a5e-0195-4268-ba46-cc3d0a00d14a	2026-08-21 07:14:37.628-07
f265c350-6d1c-4c90-ad41-32945c60f0da	5e15b441-9ae0-423a-ae1a-25dcf2e6ceda	2026-08-21 07:14:37.629-07
f265c350-6d1c-4c90-ad41-32945c60f0da	10afaa6d-5f25-44ed-b079-5232ea42ebfb	2026-08-21 07:14:37.63-07
f265c350-6d1c-4c90-ad41-32945c60f0da	c41f5aec-59e7-4810-9712-91eb9a21647e	2026-08-21 07:14:37.632-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.633-07
f265c350-6d1c-4c90-ad41-32945c60f0da	717ba5b5-b606-45fd-8a01-93a38e8cb754	2026-08-21 07:14:37.634-07
f265c350-6d1c-4c90-ad41-32945c60f0da	5eca908e-984a-4658-942c-5a2dd4f71f26	2026-08-21 07:14:37.636-07
f265c350-6d1c-4c90-ad41-32945c60f0da	2e0d18a6-6de4-4eed-9dd5-7f0c63632f0e	2026-08-21 07:14:37.637-07
f265c350-6d1c-4c90-ad41-32945c60f0da	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.639-07
f265c350-6d1c-4c90-ad41-32945c60f0da	6a6a381f-4d2f-4d20-883b-34dc754f2f16	2026-08-21 07:14:37.64-07
f265c350-6d1c-4c90-ad41-32945c60f0da	31bd8425-033f-4167-a691-4548bc4c76c2	2026-08-21 07:14:37.641-07
2aecd060-569a-407c-829b-6672f7384a93	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.642-07
2aecd060-569a-407c-829b-6672f7384a93	e6e04942-bbd6-466f-985c-d3837cb97011	2026-08-21 07:14:37.644-07
2aecd060-569a-407c-829b-6672f7384a93	d65a1bd7-bd8f-460e-a92a-905a332433cb	2026-08-21 07:14:37.645-07
2aecd060-569a-407c-829b-6672f7384a93	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.646-07
2aecd060-569a-407c-829b-6672f7384a93	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.647-07
2aecd060-569a-407c-829b-6672f7384a93	c41f5aec-59e7-4810-9712-91eb9a21647e	2026-08-21 07:14:37.649-07
2aecd060-569a-407c-829b-6672f7384a93	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.65-07
2aecd060-569a-407c-829b-6672f7384a93	717ba5b5-b606-45fd-8a01-93a38e8cb754	2026-08-21 07:14:37.651-07
2aecd060-569a-407c-829b-6672f7384a93	5eca908e-984a-4658-942c-5a2dd4f71f26	2026-08-21 07:14:37.653-07
2aecd060-569a-407c-829b-6672f7384a93	4fd559ee-753d-4a15-9d80-df9fb7cf9c73	2026-08-21 07:14:37.654-07
2aecd060-569a-407c-829b-6672f7384a93	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.655-07
2aecd060-569a-407c-829b-6672f7384a93	4a33f96f-736a-4c23-9074-6736405d37f7	2026-08-21 07:14:37.656-07
2aecd060-569a-407c-829b-6672f7384a93	ee30d5e2-750c-48d9-893f-ba00e1ab03e8	2026-08-21 07:14:37.658-07
2aecd060-569a-407c-829b-6672f7384a93	cfdb099f-7eb3-4d62-9e88-f0e1dc909087	2026-08-21 07:14:37.659-07
2aecd060-569a-407c-829b-6672f7384a93	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.66-07
2aecd060-569a-407c-829b-6672f7384a93	b58cc4af-664b-4296-9c4a-d0d4476cc420	2026-08-21 07:14:37.661-07
2aecd060-569a-407c-829b-6672f7384a93	369f2d0b-d2ee-44e6-b83a-96097992c721	2026-08-21 07:14:37.662-07
2aecd060-569a-407c-829b-6672f7384a93	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.664-07
2aecd060-569a-407c-829b-6672f7384a93	e6a55012-937d-4192-8653-f20bb2942587	2026-08-21 07:14:37.666-07
2aecd060-569a-407c-829b-6672f7384a93	1a736b92-0270-47ca-9233-69568eea59f6	2026-08-21 07:14:37.668-07
2aecd060-569a-407c-829b-6672f7384a93	5e15b441-9ae0-423a-ae1a-25dcf2e6ceda	2026-08-21 07:14:37.669-07
2aecd060-569a-407c-829b-6672f7384a93	10afaa6d-5f25-44ed-b079-5232ea42ebfb	2026-08-21 07:14:37.67-07
2aecd060-569a-407c-829b-6672f7384a93	2e0d18a6-6de4-4eed-9dd5-7f0c63632f0e	2026-08-21 07:14:37.671-07
2aecd060-569a-407c-829b-6672f7384a93	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.673-07
2aecd060-569a-407c-829b-6672f7384a93	6a6a381f-4d2f-4d20-883b-34dc754f2f16	2026-08-21 07:14:37.674-07
2aecd060-569a-407c-829b-6672f7384a93	31bd8425-033f-4167-a691-4548bc4c76c2	2026-08-21 07:14:37.675-07
2aecd060-569a-407c-829b-6672f7384a93	ecc4517a-f80b-42b0-b96e-4af04f6a90cb	2026-08-21 07:14:37.677-07
2aecd060-569a-407c-829b-6672f7384a93	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.678-07
2aecd060-569a-407c-829b-6672f7384a93	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.679-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.68-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.682-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	2026-08-21 07:14:37.683-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.684-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.686-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.687-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.688-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.69-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.691-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.693-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.694-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.696-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.697-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.699-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.7-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	ab47f51f-d32e-4ca5-a55a-8cd63ccccbc5	2026-08-21 07:14:37.702-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.703-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.704-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.705-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.706-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.707-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.709-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	07bef4eb-5d86-47bf-a0f6-54ba62f709ee	2026-08-21 07:14:37.71-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.711-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.712-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.713-07
14064f0b-1901-4783-a9de-17ee538b2471	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.715-07
14064f0b-1901-4783-a9de-17ee538b2471	8a8d3864-090e-46f8-a8a0-c3b45bb43ae3	2026-08-21 07:14:37.716-07
14064f0b-1901-4783-a9de-17ee538b2471	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.718-07
14064f0b-1901-4783-a9de-17ee538b2471	190fb05b-a72e-4912-9882-d089017a3f37	2026-08-21 07:14:37.719-07
14064f0b-1901-4783-a9de-17ee538b2471	e9a097c9-eca9-4c75-8589-ef12ab76f119	2026-08-21 07:14:37.72-07
14064f0b-1901-4783-a9de-17ee538b2471	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.721-07
14064f0b-1901-4783-a9de-17ee538b2471	eb3de749-cc8a-41e3-be8f-6d5b14b7642b	2026-08-21 07:14:37.722-07
14064f0b-1901-4783-a9de-17ee538b2471	8b494e8e-a934-47b6-99e3-f8215bb724fc	2026-08-21 07:14:37.723-07
14064f0b-1901-4783-a9de-17ee538b2471	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.725-07
14064f0b-1901-4783-a9de-17ee538b2471	695d7bef-a1ea-4154-b131-ff4a9830abb2	2026-08-21 07:14:37.726-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	43fb8cac-75d9-49c9-a511-aff4a626c318	2026-08-21 07:14:37.727-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	ecc4517a-f80b-42b0-b96e-4af04f6a90cb	2026-08-21 07:14:37.728-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.729-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	9c1672cd-ae6a-43f1-be28-a7ed77d28ddb	2026-08-21 07:14:37.73-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.732-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.733-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.734-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	a88240ef-620e-4a1a-8e44-9745ad0ae415	2026-08-21 07:14:37.735-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	73c8a06a-6e7d-427f-9f85-fdac37ab138e	2026-08-21 07:14:37.737-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	369f2d0b-d2ee-44e6-b83a-96097992c721	2026-08-21 07:14:37.738-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	f22ec30c-6e73-43f7-a26b-3f36d0e94489	2026-08-21 07:14:37.739-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	6fd3c3ea-364e-4f6f-b3b8-993fb7d64a68	2026-08-21 07:14:37.74-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:37.874-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:37.875-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:37.877-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	395415b5-a2ab-48f5-b457-a7ac9eb10538	2026-08-21 07:14:37.879-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d91c1f1d-8d58-44fa-a9cc-bdffc0f14d29	2026-08-21 07:14:37.88-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e3b5563e-70e1-443e-a854-0d314496a482	2026-08-21 07:14:37.882-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:37.885-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	822d0fda-b8d7-4114-8aac-bf43d906bffe	2026-08-21 07:14:37.887-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	bbfdd14c-640c-43fb-9747-f10ddab43845	2026-08-21 07:14:37.889-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:37.891-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	9fc36e63-889f-4b7e-b71f-be22d353f32d	2026-08-21 07:14:37.892-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	73739fd1-acfb-40b3-9103-93a64dd283e3	2026-08-21 07:14:37.894-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:37.895-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8a0989ea-60e5-422b-9954-0f7d9c72faa0	2026-08-21 07:14:37.896-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:37.898-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:37.9-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	be948fd2-6e7f-4a88-b305-68a413b20711	2026-08-21 07:14:37.901-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:37.902-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:37.903-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:37.905-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:37.906-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	41ebd34f-7f30-4e35-b32e-58fbbbf2d503	2026-08-21 07:14:37.907-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a63f8415-7e21-4439-a77b-fa3371ca02f9	2026-08-21 07:14:37.909-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	02544c70-6dc9-4981-b3f7-bd7c71ce52ba	2026-08-21 07:14:37.91-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:37.911-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	653d3f4a-a52f-41df-8431-41f359e150c1	2026-08-21 07:14:37.912-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4488fb06-5a6b-4a2d-8aab-dcda88bc5043	2026-08-21 07:14:37.914-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	16a389db-20f1-40ca-a563-d87b1a78927a	2026-08-21 07:14:37.916-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d60da220-c44f-40a6-8193-15fd7b86a723	2026-08-21 07:14:37.918-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	6fc7794c-8725-4e92-9872-782aa099d5d8	2026-08-21 07:14:37.919-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	b309c1b4-e044-4f2a-95b8-bb2bf52fe39b	2026-08-21 07:14:37.92-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d64782ed-36ac-44c1-8d58-ffbe6a540ac3	2026-08-21 07:14:37.921-07
ea35650c-7f13-4431-bad4-f804bd65c844	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:37.922-07
ea35650c-7f13-4431-bad4-f804bd65c844	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:37.924-07
ea35650c-7f13-4431-bad4-f804bd65c844	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:37.925-07
ea35650c-7f13-4431-bad4-f804bd65c844	395415b5-a2ab-48f5-b457-a7ac9eb10538	2026-08-21 07:14:37.926-07
ea35650c-7f13-4431-bad4-f804bd65c844	d91c1f1d-8d58-44fa-a9cc-bdffc0f14d29	2026-08-21 07:14:37.927-07
ea35650c-7f13-4431-bad4-f804bd65c844	e3b5563e-70e1-443e-a854-0d314496a482	2026-08-21 07:14:37.928-07
ea35650c-7f13-4431-bad4-f804bd65c844	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:37.93-07
ea35650c-7f13-4431-bad4-f804bd65c844	822d0fda-b8d7-4114-8aac-bf43d906bffe	2026-08-21 07:14:37.931-07
ea35650c-7f13-4431-bad4-f804bd65c844	bbfdd14c-640c-43fb-9747-f10ddab43845	2026-08-21 07:14:37.933-07
ea35650c-7f13-4431-bad4-f804bd65c844	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:37.934-07
ea35650c-7f13-4431-bad4-f804bd65c844	9fc36e63-889f-4b7e-b71f-be22d353f32d	2026-08-21 07:14:37.935-07
ea35650c-7f13-4431-bad4-f804bd65c844	73739fd1-acfb-40b3-9103-93a64dd283e3	2026-08-21 07:14:37.937-07
ea35650c-7f13-4431-bad4-f804bd65c844	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:37.938-07
ea35650c-7f13-4431-bad4-f804bd65c844	8a0989ea-60e5-422b-9954-0f7d9c72faa0	2026-08-21 07:14:37.939-07
ea35650c-7f13-4431-bad4-f804bd65c844	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:37.94-07
ea35650c-7f13-4431-bad4-f804bd65c844	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:37.941-07
ea35650c-7f13-4431-bad4-f804bd65c844	be948fd2-6e7f-4a88-b305-68a413b20711	2026-08-21 07:14:37.943-07
ea35650c-7f13-4431-bad4-f804bd65c844	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:37.944-07
ea35650c-7f13-4431-bad4-f804bd65c844	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:37.945-07
ea35650c-7f13-4431-bad4-f804bd65c844	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:37.946-07
ea35650c-7f13-4431-bad4-f804bd65c844	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:37.947-07
ea35650c-7f13-4431-bad4-f804bd65c844	41ebd34f-7f30-4e35-b32e-58fbbbf2d503	2026-08-21 07:14:37.949-07
ea35650c-7f13-4431-bad4-f804bd65c844	a63f8415-7e21-4439-a77b-fa3371ca02f9	2026-08-21 07:14:37.95-07
ea35650c-7f13-4431-bad4-f804bd65c844	02544c70-6dc9-4981-b3f7-bd7c71ce52ba	2026-08-21 07:14:37.951-07
ea35650c-7f13-4431-bad4-f804bd65c844	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:37.952-07
ea35650c-7f13-4431-bad4-f804bd65c844	653d3f4a-a52f-41df-8431-41f359e150c1	2026-08-21 07:14:37.954-07
ea35650c-7f13-4431-bad4-f804bd65c844	4488fb06-5a6b-4a2d-8aab-dcda88bc5043	2026-08-21 07:14:37.955-07
ea35650c-7f13-4431-bad4-f804bd65c844	16a389db-20f1-40ca-a563-d87b1a78927a	2026-08-21 07:14:37.956-07
ea35650c-7f13-4431-bad4-f804bd65c844	d60da220-c44f-40a6-8193-15fd7b86a723	2026-08-21 07:14:37.957-07
ea35650c-7f13-4431-bad4-f804bd65c844	6fc7794c-8725-4e92-9872-782aa099d5d8	2026-08-21 07:14:37.959-07
ea35650c-7f13-4431-bad4-f804bd65c844	b309c1b4-e044-4f2a-95b8-bb2bf52fe39b	2026-08-21 07:14:37.96-07
ea35650c-7f13-4431-bad4-f804bd65c844	d64782ed-36ac-44c1-8d58-ffbe6a540ac3	2026-08-21 07:14:37.961-07
97712d68-3e3d-49fd-9061-12c6b681eded	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:37.963-07
97712d68-3e3d-49fd-9061-12c6b681eded	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:37.964-07
97712d68-3e3d-49fd-9061-12c6b681eded	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:37.966-07
97712d68-3e3d-49fd-9061-12c6b681eded	395415b5-a2ab-48f5-b457-a7ac9eb10538	2026-08-21 07:14:37.967-07
97712d68-3e3d-49fd-9061-12c6b681eded	d91c1f1d-8d58-44fa-a9cc-bdffc0f14d29	2026-08-21 07:14:37.969-07
97712d68-3e3d-49fd-9061-12c6b681eded	e3b5563e-70e1-443e-a854-0d314496a482	2026-08-21 07:14:37.97-07
97712d68-3e3d-49fd-9061-12c6b681eded	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:37.972-07
97712d68-3e3d-49fd-9061-12c6b681eded	822d0fda-b8d7-4114-8aac-bf43d906bffe	2026-08-21 07:14:37.974-07
97712d68-3e3d-49fd-9061-12c6b681eded	bbfdd14c-640c-43fb-9747-f10ddab43845	2026-08-21 07:14:37.975-07
97712d68-3e3d-49fd-9061-12c6b681eded	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:37.977-07
97712d68-3e3d-49fd-9061-12c6b681eded	9fc36e63-889f-4b7e-b71f-be22d353f32d	2026-08-21 07:14:37.979-07
97712d68-3e3d-49fd-9061-12c6b681eded	73739fd1-acfb-40b3-9103-93a64dd283e3	2026-08-21 07:14:37.98-07
97712d68-3e3d-49fd-9061-12c6b681eded	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:37.982-07
97712d68-3e3d-49fd-9061-12c6b681eded	8a0989ea-60e5-422b-9954-0f7d9c72faa0	2026-08-21 07:14:37.983-07
97712d68-3e3d-49fd-9061-12c6b681eded	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:37.984-07
97712d68-3e3d-49fd-9061-12c6b681eded	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:37.986-07
97712d68-3e3d-49fd-9061-12c6b681eded	be948fd2-6e7f-4a88-b305-68a413b20711	2026-08-21 07:14:37.988-07
97712d68-3e3d-49fd-9061-12c6b681eded	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:37.99-07
97712d68-3e3d-49fd-9061-12c6b681eded	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:37.991-07
97712d68-3e3d-49fd-9061-12c6b681eded	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:37.992-07
97712d68-3e3d-49fd-9061-12c6b681eded	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:37.993-07
97712d68-3e3d-49fd-9061-12c6b681eded	41ebd34f-7f30-4e35-b32e-58fbbbf2d503	2026-08-21 07:14:37.995-07
97712d68-3e3d-49fd-9061-12c6b681eded	a63f8415-7e21-4439-a77b-fa3371ca02f9	2026-08-21 07:14:37.996-07
97712d68-3e3d-49fd-9061-12c6b681eded	02544c70-6dc9-4981-b3f7-bd7c71ce52ba	2026-08-21 07:14:37.997-07
97712d68-3e3d-49fd-9061-12c6b681eded	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:37.998-07
97712d68-3e3d-49fd-9061-12c6b681eded	653d3f4a-a52f-41df-8431-41f359e150c1	2026-08-21 07:14:38-07
97712d68-3e3d-49fd-9061-12c6b681eded	4488fb06-5a6b-4a2d-8aab-dcda88bc5043	2026-08-21 07:14:38.001-07
97712d68-3e3d-49fd-9061-12c6b681eded	16a389db-20f1-40ca-a563-d87b1a78927a	2026-08-21 07:14:38.003-07
97712d68-3e3d-49fd-9061-12c6b681eded	d60da220-c44f-40a6-8193-15fd7b86a723	2026-08-21 07:14:38.004-07
97712d68-3e3d-49fd-9061-12c6b681eded	6fc7794c-8725-4e92-9872-782aa099d5d8	2026-08-21 07:14:38.005-07
97712d68-3e3d-49fd-9061-12c6b681eded	b309c1b4-e044-4f2a-95b8-bb2bf52fe39b	2026-08-21 07:14:38.007-07
97712d68-3e3d-49fd-9061-12c6b681eded	d64782ed-36ac-44c1-8d58-ffbe6a540ac3	2026-08-21 07:14:38.009-07
f265c350-6d1c-4c90-ad41-32945c60f0da	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:38.01-07
f265c350-6d1c-4c90-ad41-32945c60f0da	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:38.012-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:38.013-07
f265c350-6d1c-4c90-ad41-32945c60f0da	395415b5-a2ab-48f5-b457-a7ac9eb10538	2026-08-21 07:14:38.014-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d91c1f1d-8d58-44fa-a9cc-bdffc0f14d29	2026-08-21 07:14:38.016-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e3b5563e-70e1-443e-a854-0d314496a482	2026-08-21 07:14:38.018-07
f265c350-6d1c-4c90-ad41-32945c60f0da	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:38.019-07
f265c350-6d1c-4c90-ad41-32945c60f0da	822d0fda-b8d7-4114-8aac-bf43d906bffe	2026-08-21 07:14:38.02-07
f265c350-6d1c-4c90-ad41-32945c60f0da	bbfdd14c-640c-43fb-9747-f10ddab43845	2026-08-21 07:14:38.021-07
f265c350-6d1c-4c90-ad41-32945c60f0da	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:38.022-07
f265c350-6d1c-4c90-ad41-32945c60f0da	9fc36e63-889f-4b7e-b71f-be22d353f32d	2026-08-21 07:14:38.024-07
f265c350-6d1c-4c90-ad41-32945c60f0da	73739fd1-acfb-40b3-9103-93a64dd283e3	2026-08-21 07:14:38.025-07
f265c350-6d1c-4c90-ad41-32945c60f0da	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:38.026-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8a0989ea-60e5-422b-9954-0f7d9c72faa0	2026-08-21 07:14:38.027-07
f265c350-6d1c-4c90-ad41-32945c60f0da	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:38.028-07
f265c350-6d1c-4c90-ad41-32945c60f0da	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:38.029-07
f265c350-6d1c-4c90-ad41-32945c60f0da	be948fd2-6e7f-4a88-b305-68a413b20711	2026-08-21 07:14:38.031-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:38.032-07
f265c350-6d1c-4c90-ad41-32945c60f0da	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:38.033-07
f265c350-6d1c-4c90-ad41-32945c60f0da	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:38.034-07
f265c350-6d1c-4c90-ad41-32945c60f0da	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:38.036-07
f265c350-6d1c-4c90-ad41-32945c60f0da	41ebd34f-7f30-4e35-b32e-58fbbbf2d503	2026-08-21 07:14:38.037-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a63f8415-7e21-4439-a77b-fa3371ca02f9	2026-08-21 07:14:38.038-07
f265c350-6d1c-4c90-ad41-32945c60f0da	02544c70-6dc9-4981-b3f7-bd7c71ce52ba	2026-08-21 07:14:38.039-07
f265c350-6d1c-4c90-ad41-32945c60f0da	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:38.04-07
f265c350-6d1c-4c90-ad41-32945c60f0da	653d3f4a-a52f-41df-8431-41f359e150c1	2026-08-21 07:14:38.042-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4488fb06-5a6b-4a2d-8aab-dcda88bc5043	2026-08-21 07:14:38.043-07
f265c350-6d1c-4c90-ad41-32945c60f0da	16a389db-20f1-40ca-a563-d87b1a78927a	2026-08-21 07:14:38.044-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d60da220-c44f-40a6-8193-15fd7b86a723	2026-08-21 07:14:38.045-07
f265c350-6d1c-4c90-ad41-32945c60f0da	6fc7794c-8725-4e92-9872-782aa099d5d8	2026-08-21 07:14:38.046-07
f265c350-6d1c-4c90-ad41-32945c60f0da	b309c1b4-e044-4f2a-95b8-bb2bf52fe39b	2026-08-21 07:14:38.048-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d64782ed-36ac-44c1-8d58-ffbe6a540ac3	2026-08-21 07:14:38.049-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:38.05-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:38.051-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:38.052-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	395415b5-a2ab-48f5-b457-a7ac9eb10538	2026-08-21 07:14:38.054-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:38.055-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:38.056-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:38.057-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:38.058-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:38.06-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:38.061-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:38.062-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:38.063-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:38.064-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	41ebd34f-7f30-4e35-b32e-58fbbbf2d503	2026-08-21 07:14:38.066-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	02544c70-6dc9-4981-b3f7-bd7c71ce52ba	2026-08-21 07:14:38.067-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:38.068-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:38.069-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:38.071-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:38.072-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	395415b5-a2ab-48f5-b457-a7ac9eb10538	2026-08-21 07:14:38.073-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:38.074-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:38.078-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:38.08-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:38.081-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:38.082-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:38.084-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:38.085-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:38.086-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:38.087-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	41ebd34f-7f30-4e35-b32e-58fbbbf2d503	2026-08-21 07:14:38.089-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	02544c70-6dc9-4981-b3f7-bd7c71ce52ba	2026-08-21 07:14:38.091-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:38.092-07
14064f0b-1901-4783-a9de-17ee538b2471	0365ceef-282e-4292-a724-40c4c725a1fb	2026-08-21 07:14:38.094-07
14064f0b-1901-4783-a9de-17ee538b2471	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:38.095-07
14064f0b-1901-4783-a9de-17ee538b2471	8a51f5fb-6fa2-483a-8785-7e388e1c3c62	2026-08-21 07:14:38.096-07
14064f0b-1901-4783-a9de-17ee538b2471	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:38.097-07
14064f0b-1901-4783-a9de-17ee538b2471	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:38.098-07
14064f0b-1901-4783-a9de-17ee538b2471	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:38.1-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	ce52429a-f909-4a4b-86b8-c4848e74a84a	2026-08-21 07:14:38.102-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	49786495-bcbd-49f0-a761-b6e6ce02ac6b	2026-08-21 07:14:38.103-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	66ecb7b9-c846-46f3-8b5b-8d7dd4282c21	2026-08-21 07:14:38.104-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	be948fd2-6e7f-4a88-b305-68a413b20711	2026-08-21 07:14:38.106-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	6fc7794c-8725-4e92-9872-782aa099d5d8	2026-08-21 07:14:38.107-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	b309c1b4-e044-4f2a-95b8-bb2bf52fe39b	2026-08-21 07:14:38.108-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	d64782ed-36ac-44c1-8d58-ffbe6a540ac3	2026-08-21 07:14:38.11-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	aedf7b28-6f87-4e02-a5e8-e2d30dd7b1c0	2026-08-21 07:14:38.111-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:38.112-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	98372475-39a1-4c35-93b6-2bf130e7fca9	2026-08-21 07:14:38.113-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	96006098-da4f-44ea-a634-cd0f87a43c21	2026-08-21 07:14:38.115-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:38.117-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	a28d44dc-5dc4-4896-81be-d43a6f2433d0	2026-08-21 07:14:38.118-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	3615a126-806a-4d49-8ce0-0fdb5bb4b409	2026-08-21 07:14:38.119-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	5eaa5b87-fc4d-481e-915b-e01cfb618de5	2026-08-21 07:14:38.12-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	561d9c69-d7f9-4bf7-8698-ccb67e01324c	2026-08-21 07:14:38.122-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	71e173f0-15a4-46c8-9370-75623f8c3b3f	2026-08-21 07:14:38.123-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	191d2519-da5d-47f9-ad4f-5055d76f5ab2	2026-08-21 07:14:38.175-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.177-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a2c893a4-f0c9-4a09-a285-0875b4edd207	2026-08-21 07:14:38.178-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	81f98dfc-7392-47e2-8a33-2df9d62d1208	2026-08-21 07:14:38.179-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	44e59a48-092a-40a9-a29a-4d5f9c37ffcc	2026-08-21 07:14:38.18-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f239bb91-bb74-4351-8daf-b7cd0a32f86f	2026-08-21 07:14:38.182-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	74d5e7ad-2833-4a7e-9154-0989c60699db	2026-08-21 07:14:38.184-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.185-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	975a7aed-608b-4c7e-874d-f44af728bd38	2026-08-21 07:14:38.187-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.189-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	fbd4dd66-0f36-47f6-88e0-847dac7f1eae	2026-08-21 07:14:38.191-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d0e52e89-2119-4785-97ed-163ff7badd96	2026-08-21 07:14:38.193-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	6a79b392-3622-4fc0-9042-f43bba95a1e0	2026-08-21 07:14:38.196-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	744d181f-57cc-44c4-bac2-fba1eed123bd	2026-08-21 07:14:38.198-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f8b07153-635d-41a1-b98d-56118e2eadcd	2026-08-21 07:14:38.2-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.202-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	98549f53-a15b-473b-b770-1bd4712e00cf	2026-08-21 07:14:38.204-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	1c7fcab9-1ccc-4b58-b2b2-22619cf40f13	2026-08-21 07:14:38.206-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.208-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d7e78cc8-235a-4722-bf8e-5c29bb58af94	2026-08-21 07:14:38.21-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8d6b1d04-6e2a-43db-898f-e790cf0cf2be	2026-08-21 07:14:38.211-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	b17c6924-6b53-4b87-b083-237441a21e73	2026-08-21 07:14:38.214-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	d688d360-f756-4ebf-82f3-da70efb65fed	2026-08-21 07:14:38.216-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	1259a991-eb10-4286-8c07-69e259b155e5	2026-08-21 07:14:38.218-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.22-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	8fb48900-9d20-460d-9537-3b2ddaf1c69d	2026-08-21 07:14:38.222-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.224-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	24ce06ae-d4de-403f-9866-910e94a9f4e1	2026-08-21 07:14:38.226-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	aa07411f-7e39-48c8-abff-33252170bbd7	2026-08-21 07:14:38.228-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	9f63250b-a337-4527-b2c4-d0e8f611ac03	2026-08-21 07:14:38.23-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	2026-08-21 07:14:38.232-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a9b91840-8785-4c3d-ad7f-c751d6dd79c3	2026-08-21 07:14:38.234-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	dfe8f006-577e-475b-a55f-88361d32fe04	2026-08-21 07:14:38.236-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f94f08c1-2c42-4314-98f0-0c3fe7f17da5	2026-08-21 07:14:38.238-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.24-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.242-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	ad9f179c-583a-41e7-9b26-03b4748b7e72	2026-08-21 07:14:38.244-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e852c55e-9cf9-4433-a013-5a2d0675da40	2026-08-21 07:14:38.245-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	61137584-8983-49f4-9bc0-db24a44703dc	2026-08-21 07:14:38.247-07
ea35650c-7f13-4431-bad4-f804bd65c844	191d2519-da5d-47f9-ad4f-5055d76f5ab2	2026-08-21 07:14:38.25-07
ea35650c-7f13-4431-bad4-f804bd65c844	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.252-07
ea35650c-7f13-4431-bad4-f804bd65c844	a2c893a4-f0c9-4a09-a285-0875b4edd207	2026-08-21 07:14:38.254-07
ea35650c-7f13-4431-bad4-f804bd65c844	81f98dfc-7392-47e2-8a33-2df9d62d1208	2026-08-21 07:14:38.255-07
ea35650c-7f13-4431-bad4-f804bd65c844	44e59a48-092a-40a9-a29a-4d5f9c37ffcc	2026-08-21 07:14:38.257-07
ea35650c-7f13-4431-bad4-f804bd65c844	f239bb91-bb74-4351-8daf-b7cd0a32f86f	2026-08-21 07:14:38.259-07
ea35650c-7f13-4431-bad4-f804bd65c844	74d5e7ad-2833-4a7e-9154-0989c60699db	2026-08-21 07:14:38.261-07
ea35650c-7f13-4431-bad4-f804bd65c844	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.263-07
ea35650c-7f13-4431-bad4-f804bd65c844	975a7aed-608b-4c7e-874d-f44af728bd38	2026-08-21 07:14:38.265-07
ea35650c-7f13-4431-bad4-f804bd65c844	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.268-07
ea35650c-7f13-4431-bad4-f804bd65c844	fbd4dd66-0f36-47f6-88e0-847dac7f1eae	2026-08-21 07:14:38.269-07
ea35650c-7f13-4431-bad4-f804bd65c844	d0e52e89-2119-4785-97ed-163ff7badd96	2026-08-21 07:14:38.271-07
ea35650c-7f13-4431-bad4-f804bd65c844	6a79b392-3622-4fc0-9042-f43bba95a1e0	2026-08-21 07:14:38.273-07
ea35650c-7f13-4431-bad4-f804bd65c844	744d181f-57cc-44c4-bac2-fba1eed123bd	2026-08-21 07:14:38.275-07
ea35650c-7f13-4431-bad4-f804bd65c844	f8b07153-635d-41a1-b98d-56118e2eadcd	2026-08-21 07:14:38.278-07
ea35650c-7f13-4431-bad4-f804bd65c844	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.28-07
ea35650c-7f13-4431-bad4-f804bd65c844	98549f53-a15b-473b-b770-1bd4712e00cf	2026-08-21 07:14:38.283-07
ea35650c-7f13-4431-bad4-f804bd65c844	1c7fcab9-1ccc-4b58-b2b2-22619cf40f13	2026-08-21 07:14:38.285-07
ea35650c-7f13-4431-bad4-f804bd65c844	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.287-07
ea35650c-7f13-4431-bad4-f804bd65c844	d7e78cc8-235a-4722-bf8e-5c29bb58af94	2026-08-21 07:14:38.29-07
ea35650c-7f13-4431-bad4-f804bd65c844	8d6b1d04-6e2a-43db-898f-e790cf0cf2be	2026-08-21 07:14:38.292-07
ea35650c-7f13-4431-bad4-f804bd65c844	b17c6924-6b53-4b87-b083-237441a21e73	2026-08-21 07:14:38.294-07
ea35650c-7f13-4431-bad4-f804bd65c844	d688d360-f756-4ebf-82f3-da70efb65fed	2026-08-21 07:14:38.296-07
ea35650c-7f13-4431-bad4-f804bd65c844	1259a991-eb10-4286-8c07-69e259b155e5	2026-08-21 07:14:38.297-07
ea35650c-7f13-4431-bad4-f804bd65c844	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.299-07
ea35650c-7f13-4431-bad4-f804bd65c844	8fb48900-9d20-460d-9537-3b2ddaf1c69d	2026-08-21 07:14:38.301-07
ea35650c-7f13-4431-bad4-f804bd65c844	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.303-07
ea35650c-7f13-4431-bad4-f804bd65c844	24ce06ae-d4de-403f-9866-910e94a9f4e1	2026-08-21 07:14:38.305-07
ea35650c-7f13-4431-bad4-f804bd65c844	aa07411f-7e39-48c8-abff-33252170bbd7	2026-08-21 07:14:38.307-07
ea35650c-7f13-4431-bad4-f804bd65c844	9f63250b-a337-4527-b2c4-d0e8f611ac03	2026-08-21 07:14:38.31-07
ea35650c-7f13-4431-bad4-f804bd65c844	f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	2026-08-21 07:14:38.312-07
ea35650c-7f13-4431-bad4-f804bd65c844	a9b91840-8785-4c3d-ad7f-c751d6dd79c3	2026-08-21 07:14:38.314-07
ea35650c-7f13-4431-bad4-f804bd65c844	dfe8f006-577e-475b-a55f-88361d32fe04	2026-08-21 07:14:38.316-07
ea35650c-7f13-4431-bad4-f804bd65c844	f94f08c1-2c42-4314-98f0-0c3fe7f17da5	2026-08-21 07:14:38.319-07
ea35650c-7f13-4431-bad4-f804bd65c844	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.321-07
ea35650c-7f13-4431-bad4-f804bd65c844	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.324-07
ea35650c-7f13-4431-bad4-f804bd65c844	ad9f179c-583a-41e7-9b26-03b4748b7e72	2026-08-21 07:14:38.326-07
ea35650c-7f13-4431-bad4-f804bd65c844	e852c55e-9cf9-4433-a013-5a2d0675da40	2026-08-21 07:14:38.328-07
ea35650c-7f13-4431-bad4-f804bd65c844	61137584-8983-49f4-9bc0-db24a44703dc	2026-08-21 07:14:38.33-07
97712d68-3e3d-49fd-9061-12c6b681eded	191d2519-da5d-47f9-ad4f-5055d76f5ab2	2026-08-21 07:14:38.332-07
97712d68-3e3d-49fd-9061-12c6b681eded	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.334-07
97712d68-3e3d-49fd-9061-12c6b681eded	a2c893a4-f0c9-4a09-a285-0875b4edd207	2026-08-21 07:14:38.336-07
97712d68-3e3d-49fd-9061-12c6b681eded	81f98dfc-7392-47e2-8a33-2df9d62d1208	2026-08-21 07:14:38.337-07
97712d68-3e3d-49fd-9061-12c6b681eded	44e59a48-092a-40a9-a29a-4d5f9c37ffcc	2026-08-21 07:14:38.339-07
97712d68-3e3d-49fd-9061-12c6b681eded	f239bb91-bb74-4351-8daf-b7cd0a32f86f	2026-08-21 07:14:38.341-07
97712d68-3e3d-49fd-9061-12c6b681eded	74d5e7ad-2833-4a7e-9154-0989c60699db	2026-08-21 07:14:38.342-07
97712d68-3e3d-49fd-9061-12c6b681eded	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.344-07
97712d68-3e3d-49fd-9061-12c6b681eded	975a7aed-608b-4c7e-874d-f44af728bd38	2026-08-21 07:14:38.347-07
97712d68-3e3d-49fd-9061-12c6b681eded	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.349-07
97712d68-3e3d-49fd-9061-12c6b681eded	fbd4dd66-0f36-47f6-88e0-847dac7f1eae	2026-08-21 07:14:38.351-07
97712d68-3e3d-49fd-9061-12c6b681eded	d0e52e89-2119-4785-97ed-163ff7badd96	2026-08-21 07:14:38.353-07
97712d68-3e3d-49fd-9061-12c6b681eded	6a79b392-3622-4fc0-9042-f43bba95a1e0	2026-08-21 07:14:38.355-07
97712d68-3e3d-49fd-9061-12c6b681eded	744d181f-57cc-44c4-bac2-fba1eed123bd	2026-08-21 07:14:38.357-07
97712d68-3e3d-49fd-9061-12c6b681eded	f8b07153-635d-41a1-b98d-56118e2eadcd	2026-08-21 07:14:38.359-07
97712d68-3e3d-49fd-9061-12c6b681eded	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.361-07
97712d68-3e3d-49fd-9061-12c6b681eded	98549f53-a15b-473b-b770-1bd4712e00cf	2026-08-21 07:14:38.364-07
97712d68-3e3d-49fd-9061-12c6b681eded	1c7fcab9-1ccc-4b58-b2b2-22619cf40f13	2026-08-21 07:14:38.366-07
97712d68-3e3d-49fd-9061-12c6b681eded	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.368-07
97712d68-3e3d-49fd-9061-12c6b681eded	d7e78cc8-235a-4722-bf8e-5c29bb58af94	2026-08-21 07:14:38.37-07
97712d68-3e3d-49fd-9061-12c6b681eded	8d6b1d04-6e2a-43db-898f-e790cf0cf2be	2026-08-21 07:14:38.372-07
97712d68-3e3d-49fd-9061-12c6b681eded	b17c6924-6b53-4b87-b083-237441a21e73	2026-08-21 07:14:38.374-07
97712d68-3e3d-49fd-9061-12c6b681eded	d688d360-f756-4ebf-82f3-da70efb65fed	2026-08-21 07:14:38.376-07
97712d68-3e3d-49fd-9061-12c6b681eded	1259a991-eb10-4286-8c07-69e259b155e5	2026-08-21 07:14:38.378-07
97712d68-3e3d-49fd-9061-12c6b681eded	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.38-07
97712d68-3e3d-49fd-9061-12c6b681eded	8fb48900-9d20-460d-9537-3b2ddaf1c69d	2026-08-21 07:14:38.382-07
97712d68-3e3d-49fd-9061-12c6b681eded	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.385-07
97712d68-3e3d-49fd-9061-12c6b681eded	24ce06ae-d4de-403f-9866-910e94a9f4e1	2026-08-21 07:14:38.387-07
97712d68-3e3d-49fd-9061-12c6b681eded	aa07411f-7e39-48c8-abff-33252170bbd7	2026-08-21 07:14:38.389-07
97712d68-3e3d-49fd-9061-12c6b681eded	9f63250b-a337-4527-b2c4-d0e8f611ac03	2026-08-21 07:14:38.392-07
97712d68-3e3d-49fd-9061-12c6b681eded	f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	2026-08-21 07:14:38.394-07
97712d68-3e3d-49fd-9061-12c6b681eded	a9b91840-8785-4c3d-ad7f-c751d6dd79c3	2026-08-21 07:14:38.396-07
97712d68-3e3d-49fd-9061-12c6b681eded	dfe8f006-577e-475b-a55f-88361d32fe04	2026-08-21 07:14:38.398-07
97712d68-3e3d-49fd-9061-12c6b681eded	f94f08c1-2c42-4314-98f0-0c3fe7f17da5	2026-08-21 07:14:38.4-07
97712d68-3e3d-49fd-9061-12c6b681eded	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.402-07
97712d68-3e3d-49fd-9061-12c6b681eded	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.405-07
97712d68-3e3d-49fd-9061-12c6b681eded	ad9f179c-583a-41e7-9b26-03b4748b7e72	2026-08-21 07:14:38.407-07
97712d68-3e3d-49fd-9061-12c6b681eded	e852c55e-9cf9-4433-a013-5a2d0675da40	2026-08-21 07:14:38.409-07
97712d68-3e3d-49fd-9061-12c6b681eded	61137584-8983-49f4-9bc0-db24a44703dc	2026-08-21 07:14:38.411-07
f265c350-6d1c-4c90-ad41-32945c60f0da	191d2519-da5d-47f9-ad4f-5055d76f5ab2	2026-08-21 07:14:38.413-07
f265c350-6d1c-4c90-ad41-32945c60f0da	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.415-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a2c893a4-f0c9-4a09-a285-0875b4edd207	2026-08-21 07:14:38.417-07
f265c350-6d1c-4c90-ad41-32945c60f0da	81f98dfc-7392-47e2-8a33-2df9d62d1208	2026-08-21 07:14:38.418-07
f265c350-6d1c-4c90-ad41-32945c60f0da	44e59a48-092a-40a9-a29a-4d5f9c37ffcc	2026-08-21 07:14:38.42-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f239bb91-bb74-4351-8daf-b7cd0a32f86f	2026-08-21 07:14:38.422-07
f265c350-6d1c-4c90-ad41-32945c60f0da	74d5e7ad-2833-4a7e-9154-0989c60699db	2026-08-21 07:14:38.424-07
f265c350-6d1c-4c90-ad41-32945c60f0da	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.426-07
f265c350-6d1c-4c90-ad41-32945c60f0da	975a7aed-608b-4c7e-874d-f44af728bd38	2026-08-21 07:14:38.428-07
f265c350-6d1c-4c90-ad41-32945c60f0da	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.43-07
f265c350-6d1c-4c90-ad41-32945c60f0da	fbd4dd66-0f36-47f6-88e0-847dac7f1eae	2026-08-21 07:14:38.432-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d0e52e89-2119-4785-97ed-163ff7badd96	2026-08-21 07:14:38.434-07
f265c350-6d1c-4c90-ad41-32945c60f0da	6a79b392-3622-4fc0-9042-f43bba95a1e0	2026-08-21 07:14:38.437-07
f265c350-6d1c-4c90-ad41-32945c60f0da	744d181f-57cc-44c4-bac2-fba1eed123bd	2026-08-21 07:14:38.439-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f8b07153-635d-41a1-b98d-56118e2eadcd	2026-08-21 07:14:38.442-07
f265c350-6d1c-4c90-ad41-32945c60f0da	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.444-07
f265c350-6d1c-4c90-ad41-32945c60f0da	98549f53-a15b-473b-b770-1bd4712e00cf	2026-08-21 07:14:38.446-07
f265c350-6d1c-4c90-ad41-32945c60f0da	1c7fcab9-1ccc-4b58-b2b2-22619cf40f13	2026-08-21 07:14:38.448-07
f265c350-6d1c-4c90-ad41-32945c60f0da	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.449-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d7e78cc8-235a-4722-bf8e-5c29bb58af94	2026-08-21 07:14:38.451-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8d6b1d04-6e2a-43db-898f-e790cf0cf2be	2026-08-21 07:14:38.453-07
f265c350-6d1c-4c90-ad41-32945c60f0da	b17c6924-6b53-4b87-b083-237441a21e73	2026-08-21 07:14:38.454-07
f265c350-6d1c-4c90-ad41-32945c60f0da	d688d360-f756-4ebf-82f3-da70efb65fed	2026-08-21 07:14:38.457-07
f265c350-6d1c-4c90-ad41-32945c60f0da	1259a991-eb10-4286-8c07-69e259b155e5	2026-08-21 07:14:38.459-07
f265c350-6d1c-4c90-ad41-32945c60f0da	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.461-07
f265c350-6d1c-4c90-ad41-32945c60f0da	8fb48900-9d20-460d-9537-3b2ddaf1c69d	2026-08-21 07:14:38.463-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.465-07
f265c350-6d1c-4c90-ad41-32945c60f0da	24ce06ae-d4de-403f-9866-910e94a9f4e1	2026-08-21 07:14:38.468-07
f265c350-6d1c-4c90-ad41-32945c60f0da	aa07411f-7e39-48c8-abff-33252170bbd7	2026-08-21 07:14:38.47-07
f265c350-6d1c-4c90-ad41-32945c60f0da	9f63250b-a337-4527-b2c4-d0e8f611ac03	2026-08-21 07:14:38.472-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	2026-08-21 07:14:38.474-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a9b91840-8785-4c3d-ad7f-c751d6dd79c3	2026-08-21 07:14:38.476-07
f265c350-6d1c-4c90-ad41-32945c60f0da	dfe8f006-577e-475b-a55f-88361d32fe04	2026-08-21 07:14:38.478-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f94f08c1-2c42-4314-98f0-0c3fe7f17da5	2026-08-21 07:14:38.48-07
f265c350-6d1c-4c90-ad41-32945c60f0da	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.482-07
f265c350-6d1c-4c90-ad41-32945c60f0da	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.484-07
f265c350-6d1c-4c90-ad41-32945c60f0da	ad9f179c-583a-41e7-9b26-03b4748b7e72	2026-08-21 07:14:38.486-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e852c55e-9cf9-4433-a013-5a2d0675da40	2026-08-21 07:14:38.488-07
f265c350-6d1c-4c90-ad41-32945c60f0da	61137584-8983-49f4-9bc0-db24a44703dc	2026-08-21 07:14:38.49-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	191d2519-da5d-47f9-ad4f-5055d76f5ab2	2026-08-21 07:14:38.492-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.494-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	a2c893a4-f0c9-4a09-a285-0875b4edd207	2026-08-21 07:14:38.497-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	81f98dfc-7392-47e2-8a33-2df9d62d1208	2026-08-21 07:14:38.499-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.501-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	975a7aed-608b-4c7e-874d-f44af728bd38	2026-08-21 07:14:38.503-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.505-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	fbd4dd66-0f36-47f6-88e0-847dac7f1eae	2026-08-21 07:14:38.507-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	d0e52e89-2119-4785-97ed-163ff7badd96	2026-08-21 07:14:38.509-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	6a79b392-3622-4fc0-9042-f43bba95a1e0	2026-08-21 07:14:38.511-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	744d181f-57cc-44c4-bac2-fba1eed123bd	2026-08-21 07:14:38.513-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	f8b07153-635d-41a1-b98d-56118e2eadcd	2026-08-21 07:14:38.515-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.517-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	98549f53-a15b-473b-b770-1bd4712e00cf	2026-08-21 07:14:38.52-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	1c7fcab9-1ccc-4b58-b2b2-22619cf40f13	2026-08-21 07:14:38.522-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.524-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	d7e78cc8-235a-4722-bf8e-5c29bb58af94	2026-08-21 07:14:38.526-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	8d6b1d04-6e2a-43db-898f-e790cf0cf2be	2026-08-21 07:14:38.528-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	b17c6924-6b53-4b87-b083-237441a21e73	2026-08-21 07:14:38.53-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	d688d360-f756-4ebf-82f3-da70efb65fed	2026-08-21 07:14:38.532-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	1259a991-eb10-4286-8c07-69e259b155e5	2026-08-21 07:14:38.534-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.536-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	8fb48900-9d20-460d-9537-3b2ddaf1c69d	2026-08-21 07:14:38.563-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.565-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	24ce06ae-d4de-403f-9866-910e94a9f4e1	2026-08-21 07:14:38.567-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	aa07411f-7e39-48c8-abff-33252170bbd7	2026-08-21 07:14:38.569-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	9f63250b-a337-4527-b2c4-d0e8f611ac03	2026-08-21 07:14:38.571-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	2026-08-21 07:14:38.574-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	a9b91840-8785-4c3d-ad7f-c751d6dd79c3	2026-08-21 07:14:38.576-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	dfe8f006-577e-475b-a55f-88361d32fe04	2026-08-21 07:14:38.577-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	f94f08c1-2c42-4314-98f0-0c3fe7f17da5	2026-08-21 07:14:38.579-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.581-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.583-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	ad9f179c-583a-41e7-9b26-03b4748b7e72	2026-08-21 07:14:38.585-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	e852c55e-9cf9-4433-a013-5a2d0675da40	2026-08-21 07:14:38.587-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	61137584-8983-49f4-9bc0-db24a44703dc	2026-08-21 07:14:38.589-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	8fb48900-9d20-460d-9537-3b2ddaf1c69d	2026-08-21 07:14:38.591-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.592-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	24ce06ae-d4de-403f-9866-910e94a9f4e1	2026-08-21 07:14:38.594-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	aa07411f-7e39-48c8-abff-33252170bbd7	2026-08-21 07:14:38.596-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	9f63250b-a337-4527-b2c4-d0e8f611ac03	2026-08-21 07:14:38.598-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	f6918ca3-fcf3-4057-b1c6-34bbc13e0a5d	2026-08-21 07:14:38.6-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	a9b91840-8785-4c3d-ad7f-c751d6dd79c3	2026-08-21 07:14:38.601-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	dfe8f006-577e-475b-a55f-88361d32fe04	2026-08-21 07:14:38.603-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.605-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.607-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.608-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.61-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.612-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.614-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.616-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.617-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.619-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.621-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.623-07
14064f0b-1901-4783-a9de-17ee538b2471	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.625-07
14064f0b-1901-4783-a9de-17ee538b2471	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.627-07
14064f0b-1901-4783-a9de-17ee538b2471	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.629-07
14064f0b-1901-4783-a9de-17ee538b2471	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.631-07
14064f0b-1901-4783-a9de-17ee538b2471	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.633-07
14064f0b-1901-4783-a9de-17ee538b2471	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.635-07
14064f0b-1901-4783-a9de-17ee538b2471	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.637-07
14064f0b-1901-4783-a9de-17ee538b2471	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.639-07
14064f0b-1901-4783-a9de-17ee538b2471	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.64-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	3d62a545-4dab-443f-ae5f-1204f711a29f	2026-08-21 07:14:38.642-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	95b04f6f-6283-467b-b7a6-0bd26879181b	2026-08-21 07:14:38.646-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	c605710d-149d-4b37-969a-88d0aeefe474	2026-08-21 07:14:38.648-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	57070806-0b5a-4376-a846-137645d89ed3	2026-08-21 07:14:38.65-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	94218b87-932b-4dfa-a8a0-c3e277f88fc4	2026-08-21 07:14:38.652-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	5feb6aee-14b3-465b-98d3-f8b5baeca8ed	2026-08-21 07:14:38.656-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	e2231230-5519-46b3-83be-7c6cf42ca1d0	2026-08-21 07:14:38.659-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	089bdcd8-0167-4de2-95e9-386303e1417b	2026-08-21 07:14:38.661-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	7fd0c77d-9dbd-4f4f-bf77-930f6be80c69	2026-08-21 07:14:38.663-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4506c7e4-171a-4904-b1e0-742b12eaad6b	2026-08-21 07:14:38.696-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	f276cd0e-69b8-4438-8ca5-9536a27b6f94	2026-08-21 07:14:38.699-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	4b5ca494-75f4-464e-b8e8-8ab205d29cf0	2026-08-21 07:14:38.702-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	9d2982f6-c1d1-4394-83ca-36ce0769a1d8	2026-08-21 07:14:38.704-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	dc8f0199-c038-45d9-8d7d-991696a0fb8a	2026-08-21 07:14:38.706-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	5a221778-5a1a-48c1-8b09-1a3ac2c971ed	2026-08-21 07:14:38.709-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	92da785b-cb17-448d-8352-15ca8d1d25d6	2026-08-21 07:14:38.711-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	2fcc4de5-4a22-468a-a09f-736cbddd71d0	2026-08-21 07:14:38.713-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a4057848-3111-4b71-af06-d8aff874aa20	2026-08-21 07:14:38.715-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	271415f3-6ad6-4453-b955-7217d7fca9a2	2026-08-21 07:14:38.717-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	103c8ddd-0bb5-49b0-8096-7afc3832d7b8	2026-08-21 07:14:38.719-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	b3991c7b-5fec-4945-95d6-5b0c079489fe	2026-08-21 07:14:38.721-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	afd810d5-53e5-4549-8ee3-17b4ec7d9732	2026-08-21 07:14:38.724-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	3d5d07c0-e60b-434f-bfcd-26a957c17792	2026-08-21 07:14:38.726-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	a71173a9-15f7-4a5a-a1bf-f464cd05de82	2026-08-21 07:14:38.728-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	e2747fda-4d76-47f8-96fd-d74fed508721	2026-08-21 07:14:38.73-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	b2b29c56-1aca-497d-8d54-698012c24977	2026-08-21 07:14:38.733-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	191a2ee6-be34-480a-a5b0-7d894a5ee332	2026-08-21 07:14:38.735-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	403f53c8-7477-4c8a-bc09-2e653d3eceec	2026-08-21 07:14:38.737-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	48a82475-cff5-4382-9cdb-75e84e0f8e42	2026-08-21 07:14:38.739-07
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	7a426000-84f1-40b4-9cef-4cb553448c38	2026-08-21 07:14:38.741-07
ea35650c-7f13-4431-bad4-f804bd65c844	4506c7e4-171a-4904-b1e0-742b12eaad6b	2026-08-21 07:14:38.744-07
ea35650c-7f13-4431-bad4-f804bd65c844	f276cd0e-69b8-4438-8ca5-9536a27b6f94	2026-08-21 07:14:38.746-07
ea35650c-7f13-4431-bad4-f804bd65c844	4b5ca494-75f4-464e-b8e8-8ab205d29cf0	2026-08-21 07:14:38.748-07
ea35650c-7f13-4431-bad4-f804bd65c844	9d2982f6-c1d1-4394-83ca-36ce0769a1d8	2026-08-21 07:14:38.75-07
ea35650c-7f13-4431-bad4-f804bd65c844	dc8f0199-c038-45d9-8d7d-991696a0fb8a	2026-08-21 07:14:38.752-07
ea35650c-7f13-4431-bad4-f804bd65c844	5a221778-5a1a-48c1-8b09-1a3ac2c971ed	2026-08-21 07:14:38.754-07
ea35650c-7f13-4431-bad4-f804bd65c844	92da785b-cb17-448d-8352-15ca8d1d25d6	2026-08-21 07:14:38.756-07
ea35650c-7f13-4431-bad4-f804bd65c844	2fcc4de5-4a22-468a-a09f-736cbddd71d0	2026-08-21 07:14:38.759-07
ea35650c-7f13-4431-bad4-f804bd65c844	a4057848-3111-4b71-af06-d8aff874aa20	2026-08-21 07:14:38.761-07
ea35650c-7f13-4431-bad4-f804bd65c844	271415f3-6ad6-4453-b955-7217d7fca9a2	2026-08-21 07:14:38.763-07
ea35650c-7f13-4431-bad4-f804bd65c844	103c8ddd-0bb5-49b0-8096-7afc3832d7b8	2026-08-21 07:14:38.765-07
ea35650c-7f13-4431-bad4-f804bd65c844	b3991c7b-5fec-4945-95d6-5b0c079489fe	2026-08-21 07:14:38.768-07
ea35650c-7f13-4431-bad4-f804bd65c844	afd810d5-53e5-4549-8ee3-17b4ec7d9732	2026-08-21 07:14:38.77-07
ea35650c-7f13-4431-bad4-f804bd65c844	3d5d07c0-e60b-434f-bfcd-26a957c17792	2026-08-21 07:14:38.772-07
ea35650c-7f13-4431-bad4-f804bd65c844	a71173a9-15f7-4a5a-a1bf-f464cd05de82	2026-08-21 07:14:38.774-07
ea35650c-7f13-4431-bad4-f804bd65c844	e2747fda-4d76-47f8-96fd-d74fed508721	2026-08-21 07:14:38.776-07
ea35650c-7f13-4431-bad4-f804bd65c844	b2b29c56-1aca-497d-8d54-698012c24977	2026-08-21 07:14:38.778-07
ea35650c-7f13-4431-bad4-f804bd65c844	191a2ee6-be34-480a-a5b0-7d894a5ee332	2026-08-21 07:14:38.78-07
ea35650c-7f13-4431-bad4-f804bd65c844	403f53c8-7477-4c8a-bc09-2e653d3eceec	2026-08-21 07:14:38.783-07
ea35650c-7f13-4431-bad4-f804bd65c844	48a82475-cff5-4382-9cdb-75e84e0f8e42	2026-08-21 07:14:38.785-07
ea35650c-7f13-4431-bad4-f804bd65c844	7a426000-84f1-40b4-9cef-4cb553448c38	2026-08-21 07:14:38.787-07
97712d68-3e3d-49fd-9061-12c6b681eded	4506c7e4-171a-4904-b1e0-742b12eaad6b	2026-08-21 07:14:38.789-07
97712d68-3e3d-49fd-9061-12c6b681eded	f276cd0e-69b8-4438-8ca5-9536a27b6f94	2026-08-21 07:14:38.79-07
97712d68-3e3d-49fd-9061-12c6b681eded	4b5ca494-75f4-464e-b8e8-8ab205d29cf0	2026-08-21 07:14:38.792-07
97712d68-3e3d-49fd-9061-12c6b681eded	9d2982f6-c1d1-4394-83ca-36ce0769a1d8	2026-08-21 07:14:38.794-07
97712d68-3e3d-49fd-9061-12c6b681eded	dc8f0199-c038-45d9-8d7d-991696a0fb8a	2026-08-21 07:14:38.795-07
97712d68-3e3d-49fd-9061-12c6b681eded	5a221778-5a1a-48c1-8b09-1a3ac2c971ed	2026-08-21 07:14:38.797-07
97712d68-3e3d-49fd-9061-12c6b681eded	92da785b-cb17-448d-8352-15ca8d1d25d6	2026-08-21 07:14:38.799-07
97712d68-3e3d-49fd-9061-12c6b681eded	2fcc4de5-4a22-468a-a09f-736cbddd71d0	2026-08-21 07:14:38.801-07
97712d68-3e3d-49fd-9061-12c6b681eded	a4057848-3111-4b71-af06-d8aff874aa20	2026-08-21 07:14:38.803-07
97712d68-3e3d-49fd-9061-12c6b681eded	271415f3-6ad6-4453-b955-7217d7fca9a2	2026-08-21 07:14:38.805-07
97712d68-3e3d-49fd-9061-12c6b681eded	103c8ddd-0bb5-49b0-8096-7afc3832d7b8	2026-08-21 07:14:38.807-07
97712d68-3e3d-49fd-9061-12c6b681eded	b3991c7b-5fec-4945-95d6-5b0c079489fe	2026-08-21 07:14:38.81-07
97712d68-3e3d-49fd-9061-12c6b681eded	afd810d5-53e5-4549-8ee3-17b4ec7d9732	2026-08-21 07:14:38.812-07
97712d68-3e3d-49fd-9061-12c6b681eded	3d5d07c0-e60b-434f-bfcd-26a957c17792	2026-08-21 07:14:38.814-07
97712d68-3e3d-49fd-9061-12c6b681eded	a71173a9-15f7-4a5a-a1bf-f464cd05de82	2026-08-21 07:14:38.816-07
97712d68-3e3d-49fd-9061-12c6b681eded	e2747fda-4d76-47f8-96fd-d74fed508721	2026-08-21 07:14:38.818-07
97712d68-3e3d-49fd-9061-12c6b681eded	b2b29c56-1aca-497d-8d54-698012c24977	2026-08-21 07:14:38.821-07
97712d68-3e3d-49fd-9061-12c6b681eded	191a2ee6-be34-480a-a5b0-7d894a5ee332	2026-08-21 07:14:38.823-07
97712d68-3e3d-49fd-9061-12c6b681eded	403f53c8-7477-4c8a-bc09-2e653d3eceec	2026-08-21 07:14:38.825-07
97712d68-3e3d-49fd-9061-12c6b681eded	48a82475-cff5-4382-9cdb-75e84e0f8e42	2026-08-21 07:14:38.827-07
97712d68-3e3d-49fd-9061-12c6b681eded	7a426000-84f1-40b4-9cef-4cb553448c38	2026-08-21 07:14:38.829-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4506c7e4-171a-4904-b1e0-742b12eaad6b	2026-08-21 07:14:38.831-07
f265c350-6d1c-4c90-ad41-32945c60f0da	f276cd0e-69b8-4438-8ca5-9536a27b6f94	2026-08-21 07:14:38.833-07
f265c350-6d1c-4c90-ad41-32945c60f0da	4b5ca494-75f4-464e-b8e8-8ab205d29cf0	2026-08-21 07:14:38.835-07
f265c350-6d1c-4c90-ad41-32945c60f0da	9d2982f6-c1d1-4394-83ca-36ce0769a1d8	2026-08-21 07:14:38.837-07
f265c350-6d1c-4c90-ad41-32945c60f0da	dc8f0199-c038-45d9-8d7d-991696a0fb8a	2026-08-21 07:14:38.84-07
f265c350-6d1c-4c90-ad41-32945c60f0da	5a221778-5a1a-48c1-8b09-1a3ac2c971ed	2026-08-21 07:14:38.842-07
f265c350-6d1c-4c90-ad41-32945c60f0da	92da785b-cb17-448d-8352-15ca8d1d25d6	2026-08-21 07:14:38.844-07
f265c350-6d1c-4c90-ad41-32945c60f0da	2fcc4de5-4a22-468a-a09f-736cbddd71d0	2026-08-21 07:14:38.846-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a4057848-3111-4b71-af06-d8aff874aa20	2026-08-21 07:14:38.848-07
f265c350-6d1c-4c90-ad41-32945c60f0da	271415f3-6ad6-4453-b955-7217d7fca9a2	2026-08-21 07:14:38.851-07
f265c350-6d1c-4c90-ad41-32945c60f0da	103c8ddd-0bb5-49b0-8096-7afc3832d7b8	2026-08-21 07:14:38.853-07
f265c350-6d1c-4c90-ad41-32945c60f0da	b3991c7b-5fec-4945-95d6-5b0c079489fe	2026-08-21 07:14:38.855-07
f265c350-6d1c-4c90-ad41-32945c60f0da	afd810d5-53e5-4549-8ee3-17b4ec7d9732	2026-08-21 07:14:38.857-07
f265c350-6d1c-4c90-ad41-32945c60f0da	3d5d07c0-e60b-434f-bfcd-26a957c17792	2026-08-21 07:14:38.859-07
f265c350-6d1c-4c90-ad41-32945c60f0da	a71173a9-15f7-4a5a-a1bf-f464cd05de82	2026-08-21 07:14:38.862-07
f265c350-6d1c-4c90-ad41-32945c60f0da	e2747fda-4d76-47f8-96fd-d74fed508721	2026-08-21 07:14:38.864-07
f265c350-6d1c-4c90-ad41-32945c60f0da	b2b29c56-1aca-497d-8d54-698012c24977	2026-08-21 07:14:38.866-07
f265c350-6d1c-4c90-ad41-32945c60f0da	191a2ee6-be34-480a-a5b0-7d894a5ee332	2026-08-21 07:14:38.869-07
f265c350-6d1c-4c90-ad41-32945c60f0da	403f53c8-7477-4c8a-bc09-2e653d3eceec	2026-08-21 07:14:38.871-07
f265c350-6d1c-4c90-ad41-32945c60f0da	48a82475-cff5-4382-9cdb-75e84e0f8e42	2026-08-21 07:14:38.873-07
f265c350-6d1c-4c90-ad41-32945c60f0da	7a426000-84f1-40b4-9cef-4cb553448c38	2026-08-21 07:14:38.875-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	4506c7e4-171a-4904-b1e0-742b12eaad6b	2026-08-21 07:14:38.877-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	f276cd0e-69b8-4438-8ca5-9536a27b6f94	2026-08-21 07:14:38.879-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	4b5ca494-75f4-464e-b8e8-8ab205d29cf0	2026-08-21 07:14:38.882-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	5a221778-5a1a-48c1-8b09-1a3ac2c971ed	2026-08-21 07:14:38.884-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	92da785b-cb17-448d-8352-15ca8d1d25d6	2026-08-21 07:14:38.886-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	2fcc4de5-4a22-468a-a09f-736cbddd71d0	2026-08-21 07:14:38.888-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	a4057848-3111-4b71-af06-d8aff874aa20	2026-08-21 07:14:38.89-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	271415f3-6ad6-4453-b955-7217d7fca9a2	2026-08-21 07:14:38.892-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	103c8ddd-0bb5-49b0-8096-7afc3832d7b8	2026-08-21 07:14:38.893-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	b3991c7b-5fec-4945-95d6-5b0c079489fe	2026-08-21 07:14:38.894-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	afd810d5-53e5-4549-8ee3-17b4ec7d9732	2026-08-21 07:14:38.896-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	3d5d07c0-e60b-434f-bfcd-26a957c17792	2026-08-21 07:14:38.898-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	a71173a9-15f7-4a5a-a1bf-f464cd05de82	2026-08-21 07:14:38.901-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	e2747fda-4d76-47f8-96fd-d74fed508721	2026-08-21 07:14:38.902-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	b2b29c56-1aca-497d-8d54-698012c24977	2026-08-21 07:14:38.904-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	191a2ee6-be34-480a-a5b0-7d894a5ee332	2026-08-21 07:14:38.906-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	403f53c8-7477-4c8a-bc09-2e653d3eceec	2026-08-21 07:14:38.908-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	48a82475-cff5-4382-9cdb-75e84e0f8e42	2026-08-21 07:14:38.909-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	7a426000-84f1-40b4-9cef-4cb553448c38	2026-08-21 07:14:38.911-07
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.roles (id, name, display_name, description, is_active, created_at, updated_at) FROM stdin;
7111cdcd-03c7-460c-a7dd-12686a6fbdb2	OWNER	Store Owner / Director	Proprietor / MD / Partner - Full unrestricted access to all branches, profit reports, audit logs, and settings.	t	2026-08-21 07:14:36.371-07	2026-08-21 07:14:36.371-07
ea35650c-7f13-4431-bad4-f804bd65c844	SUPER_ADMIN	Super Administrator	Full unrestricted administrative access to system configurations, security, audit logs, and all branches.	t	2026-08-21 07:14:36.38-07	2026-08-21 07:14:36.38-07
97712d68-3e3d-49fd-9061-12c6b681eded	ADMIN	System Administrator	IT & System Administrator managing users, branches, permissions, and technical configurations.	t	2026-08-21 07:14:36.382-07	2026-08-21 07:14:36.382-07
f265c350-6d1c-4c90-ad41-32945c60f0da	BRANCH_MANAGER	Showroom Store Manager	Showroom floor manager - Manages branch sales, inventory stock, staff attendance, approves returns & discounts.	t	2026-08-21 07:14:36.385-07	2026-08-21 07:14:36.385-07
fc71c7fb-5a43-4cff-bb9e-9dea0433664d	CASHIER	Billing Cashier	Counter billing staff - Creates customer bills, scans barcodes/QR tags, locks gold rates, takes payments (Cash/UPI/Card).	t	2026-08-21 07:14:36.387-07	2026-08-21 07:14:36.387-07
43eaf92e-1e60-4e1c-906d-c0585b57fea5	STAFF	Billing Cashier / Staff	Operational billing counter and counter sales assistance staff.	t	2026-08-21 07:14:36.389-07	2026-08-21 07:14:36.389-07
14064f0b-1901-4783-a9de-17ee538b2471	SALESPERSON	Sales Executive	Floor counter staff - Searches jewellery items, assists customers, quotes estimated totals, tags sales commissions.	t	2026-08-21 07:14:36.39-07	2026-08-21 07:14:36.39-07
2aecd060-569a-407c-829b-6672f7384a93	INVENTORY_MANAGER	Vault & Stock Keeper	Stock vault in-charge - Manages physical stock, receives vendor bullion, prints/regenerates barcode tags, handles branch transfers.	t	2026-08-21 07:14:36.392-07	2026-08-21 07:14:36.392-07
0ed6e173-2f93-4236-a0c7-8733cb86fe3a	ACCOUNTANT	Accounts & Tax Officer	Store accountant / CA - Monitors cash/bank collections, customer credit balances, refunds, and GST (3%) tax ledgers.	t	2026-08-21 07:14:36.393-07	2026-08-21 07:14:36.393-07
dafbbe1b-828d-43a2-9c62-01d294e39d21	KARIGAR_SUPERVISOR	Goldsmith / Workshop Head	Workshop supervisor - Manages old gold melting, custom jewellery orders, repairs, and craftsmanship tracking.	t	2026-08-21 07:14:36.395-07	2026-08-21 07:14:36.395-07
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.user_sessions (id, user_id, refresh_token, device, browser, ip_address, expires_at, created_at) FROM stdin;
1a949485-da1b-4fe2-b44c-da89a0d60f69	dc6935a9-bd7a-419a-8403-4d2a537063e9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYzY5MzVhOS1iZDdhLTQxOWEtODQwMy00ZDJhNTM3MDYzZTkiLCJ0eXBlIjoicmVmcmVzaCIsIm5vbmNlIjoiMTc4NzI5NjUxOTQ4OC0wLjE1ODI0NTk2NTEwMjUxMzk5IiwiaWF0IjoxNzg3Mjk2NTE5LCJleHAiOjE3ODc5MDEzMTl9.zo1SmGkVZyarka_HFor5lSvlJM6LFxt635eGIA4x6sM	Unknown	Unknown	::1	2026-08-28 07:15:19.489-07	2026-08-21 07:15:19.49-07
196d317e-5888-40a2-b212-03ebc1aa6af0	bdcc6746-6409-40d8-a6db-0bf31f64d1b0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGNjNjc0Ni02NDA5LTQwZDgtYTZkYi0wYmYzMWY2NGQxYjAiLCJ0eXBlIjoicmVmcmVzaCIsIm5vbmNlIjoiMTc4NzMxOTUxNjY3NS0wLjgxMzUxMjYxNDM1NjM1ODciLCJpYXQiOjE3ODczMTk1MTYsImV4cCI6MTc4NzkyNDMxNn0.IolKcMRs1n3lDNN0rLwCQuVe6Kxv7r7Bcl4vGGZJOrA	Desktop	Chrome	127.0.0.1	2026-08-28 13:38:36.676-07	2026-08-21 13:38:36.677-07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: iam; Owner: -
--

COPY iam.users (id, role_id, employee_id, first_name, last_name, email, mobile, password_hash, avatar_url, status, last_login_at, created_by, updated_by, created_at, updated_at) FROM stdin;
208f9c52-2ca5-4cfb-9e70-b28829c0b9ea	ea35650c-7f13-4431-bad4-f804bd65c844	\N	Vikram	Singhania (Super Admin)	superadmin@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.764-07	2026-08-21 07:14:36.764-07
f6630c28-91d0-497f-b918-c37178cec06d	7111cdcd-03c7-460c-a7dd-12686a6fbdb2	\N	System	Administrator	admin@erp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.79-07	2026-08-21 07:14:36.79-07
05459a1f-7e2c-4c9c-87b0-7058c974e832	fc71c7fb-5a43-4cff-bb9e-9dea0433664d	\N	Operational	Staff	staff@erp.com	\N	$2b$10$TxKGs.JDlaNKiHMouOfxo.dalC3.mfXHDNwA2ZMIIldReuBwm8rWq	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.793-07	2026-08-21 07:14:36.793-07
c864574a-0fc2-4df3-b6ec-d9b4971a8327	43eaf92e-1e60-4e1c-906d-c0585b57fea5	\N	Standard	User	user@erp.com	\N	$2b$10$NwjgX/LgI3Vr7RV.KzODSOs6ZO1HgldITMNiUC3pM2d1LAKuoDjA6	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.795-07	2026-08-21 07:14:36.795-07
e1635232-094f-4f62-b70f-64b172b93f00	fc71c7fb-5a43-4cff-bb9e-9dea0433664d	e36ec614-0ddc-4f6d-a4cd-985ee38c3f5a	Pooja	Gupta (Head Cashier)	cashier@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.772-07	2026-08-21 07:14:36.88-07
7ee47aa5-b8bf-42c2-92ae-7c54b4698143	14064f0b-1901-4783-a9de-17ee538b2471	9968be38-bef1-40d3-be1b-c8a2280b4b43	Rahul	Kapoor (Bridal Gold Specialist)	sales2@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.78-07	2026-08-21 07:14:36.902-07
41da369f-4bae-43fa-b8da-73553e35e963	2aecd060-569a-407c-829b-6672f7384a93	d2f27c5c-f457-44cb-94d0-b623cfcaa393	Deepak	Chawla (Vault Keeper)	vault@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.783-07	2026-08-21 07:14:36.909-07
f89432a3-5e02-496e-b377-2bf7f0c230fb	dafbbe1b-828d-43a2-9c62-01d294e39d21	7a66720c-47e9-4cf3-92d5-e43ba11f8785	Gopal	Swarnakar (Master Karigar)	karigar@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	\N	\N	\N	2026-08-21 07:14:36.788-07	2026-08-21 07:14:36.924-07
dc6935a9-bd7a-419a-8403-4d2a537063e9	43eaf92e-1e60-4e1c-906d-c0585b57fea5	17370f83-c0ad-44b4-9545-28992ae46d43	Rohit	Mehta (Counter Staff)	staff@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	2026-08-21 07:15:19.492-07	\N	\N	2026-08-21 07:14:36.774-07	2026-08-21 07:15:19.493-07
79db14f1-bcd7-441a-8a69-a3f37634b21c	97712d68-3e3d-49fd-9061-12c6b681eded	\N	System	Admin	admin@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	2026-08-21 11:15:05.163-07	\N	\N	2026-08-21 07:14:36.766-07	2026-08-21 11:15:05.185-07
f0f76d02-09a8-4499-acc3-f6f3fb6d16f2	0ed6e173-2f93-4236-a0c7-8733cb86fe3a	8a6d14cd-85ff-4007-b9d4-6bbb63b7f65d	Sanjay	Agrawal (CA / Accounts)	accountant@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	2026-08-21 11:26:31.513-07	\N	\N	2026-08-21 07:14:36.785-07	2026-08-21 11:26:31.513-07
50aa2e65-a948-40eb-b7e0-7d85f2a353e3	7111cdcd-03c7-460c-a7dd-12686a6fbdb2	2406c478-00f7-4791-b275-e3d215791f3a	Tanishk	Agrawal (Owner)	owner@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	2026-08-21 11:48:28.265-07	\N	\N	2026-08-21 07:14:36.757-07	2026-08-21 11:48:28.265-07
570d7978-a898-4e3b-b2fd-efde15723b8f	f265c350-6d1c-4c90-ad41-32945c60f0da	0bc5feb4-2537-4248-b708-5830a3032f4e	Amit	Sharma (Store Manager)	manager@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	2026-08-21 13:31:38.371-07	\N	\N	2026-08-21 07:14:36.769-07	2026-08-21 13:31:38.375-07
bdcc6746-6409-40d8-a6db-0bf31f64d1b0	14064f0b-1901-4783-a9de-17ee538b2471	603a2115-7be9-4fd9-bd7a-9d8d667fc5b0	Ananya	Roy (Sales Specialist)	sales@jewelleryerp.com	\N	$2b$10$6PF2rknS5ma5jqxWT0OVbekvtEEqM3xcjnrU3u4odzgKKmbarhJIW	\N	ACTIVE	2026-08-21 13:38:36.683-07	\N	\N	2026-08-21 07:14:36.777-07	2026-08-21 13:38:36.683-07
\.


--
-- Data for Name: approval_deposits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approval_deposits (id, approval_id, company_id, branch_id, customer_id, deposit_number, payment_method, amount, status, transaction_reference, payment_date, remarks, received_by, reversed_at, reversed_by, reversal_reason, created_at, updated_at) FROM stdin;
13b2ed84-5ece-418d-ac5c-ed3a2c3033fb	d4e00a35-c386-4bdf-8848-97d9cb22d185	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00002	UPI	15000.00	COMPLETED	UPI-REF-998811	2026-08-21 08:16:03.598-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:16:03.601-07	2026-08-21 08:16:03.601-07
6866e91c-398d-4957-89c2-dada04e68bf8	d4e00a35-c386-4bdf-8848-97d9cb22d185	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00003	CARD	15000.00	COMPLETED	CARD-TXN-4455	2026-08-21 08:16:03.7-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:16:03.703-07	2026-08-21 08:16:03.703-07
b4d544a7-80f7-45ff-814e-972c6e200c32	d4e00a35-c386-4bdf-8848-97d9cb22d185	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00001	CASH	20000.00	REVERSED	\N	2026-08-21 08:16:03.518-07	Cash security deposit	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:03.765-07	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Customer requested partial refund of cash deposit	2026-08-21 08:16:03.524-07	2026-08-21 08:16:03.77-07
7f508d6d-1b55-44b3-abc1-4ff260f06d6e	d4e00a35-c386-4bdf-8848-97d9cb22d185	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00004	BANK_TRANSFER	20000.00	COMPLETED	\N	2026-08-21 08:16:03.858-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:16:03.864-07	2026-08-21 08:16:03.864-07
afabf36b-3fc6-4286-a230-e9b92d391886	db48825b-c834-422e-a49f-32c60eee2bb8	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00006	UPI	15000.00	COMPLETED	UPI-REF-998811	2026-08-21 08:16:53.424-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:16:53.429-07	2026-08-21 08:16:53.429-07
a63a4ea9-96ea-454a-885b-3468a42399c9	db48825b-c834-422e-a49f-32c60eee2bb8	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00007	CARD	15000.00	COMPLETED	CARD-TXN-4455	2026-08-21 08:16:53.518-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:16:53.522-07	2026-08-21 08:16:53.522-07
db6551c3-c3b4-45d3-aebb-265948470f83	db48825b-c834-422e-a49f-32c60eee2bb8	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00005	CASH	20000.00	REVERSED	\N	2026-08-21 08:16:53.362-07	Cash security deposit	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:53.562-07	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Customer requested partial refund of cash deposit	2026-08-21 08:16:53.367-07	2026-08-21 08:16:53.567-07
4b4f0ffc-c8b3-449c-b57f-a49e4b253c06	db48825b-c834-422e-a49f-32c60eee2bb8	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00008	BANK_TRANSFER	20000.00	COMPLETED	\N	2026-08-21 08:16:53.643-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:16:53.647-07	2026-08-21 08:16:53.647-07
59b1c00a-31d8-4e05-befc-a6a509be704e	75770175-3ceb-4a2e-9d1d-1e67973755b4	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00009	CASH	20000.00	COMPLETED	\N	2026-08-21 08:24:26.04-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:24:26.045-07	2026-08-21 08:24:26.045-07
636de661-d553-409c-9ecc-63b730a510bd	d59c178b-227d-4465-abf5-eb659ae78ce7	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00010	UPI	40000.00	COMPLETED	UPI-PUR-123	2026-08-21 08:24:26.556-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:24:26.561-07	2026-08-21 08:24:26.561-07
3223a61a-2518-4753-8da0-bde0ee1ec8f5	d73aac67-8f8c-4227-b2eb-ed101d1ec81f	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00011	CASH	20000.00	COMPLETED	\N	2026-08-21 08:26:02.377-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:26:02.382-07	2026-08-21 08:26:02.382-07
0a7decc0-cc70-4c48-8836-8766f3e87a1f	52037f9b-143e-42b6-8a29-090ddd39dd7d	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00012	UPI	40000.00	COMPLETED	UPI-PUR-123	2026-08-21 08:26:03.319-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:26:03.328-07	2026-08-21 08:26:03.328-07
ea94c2c1-0816-44a3-b7a0-1ae83c801c22	f40b092d-11ae-49d6-9e79-37ed18590f2e	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00013	UPI	15000.00	COMPLETED	\N	2026-08-21 08:37:20.2-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:37:20.211-07	2026-08-21 08:37:20.211-07
7f5502e5-fe36-4828-8d1f-f657a6da8138	10af99aa-871d-46d0-bbc3-24496c7879bf	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00014	CASH	30000.00	COMPLETED	\N	2026-08-21 08:37:21.056-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:37:21.064-07	2026-08-21 08:37:21.064-07
935553f5-9dbe-444d-9ab2-6f7415fa19b0	1765330d-b797-4c1e-a19e-3ad842e5b50c	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00015	UPI	15000.00	COMPLETED	\N	2026-08-21 08:40:03.48-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:40:03.497-07	2026-08-21 08:40:03.497-07
ebb38370-ab24-4c7d-a8b8-32758d7708fa	4c518c77-93cd-459b-ae8c-767c175c0e99	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00016	CASH	30000.00	COMPLETED	\N	2026-08-21 08:40:04.506-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:40:04.516-07	2026-08-21 08:40:04.516-07
e5f0b62c-e5d3-41bb-93b1-a709183a69e1	a2075f02-44ff-41fc-bf0e-048fb8daad9a	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00017	UPI	15000.00	COMPLETED	\N	2026-08-21 08:42:07.225-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:42:07.258-07	2026-08-21 08:42:07.258-07
8f136ec2-24ef-4edc-8eb6-6cbdf0f69d95	60d1aa60-631c-4de3-ae97-049a5db19f90	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	DEP-00018	CASH	30000.00	COMPLETED	\N	2026-08-21 08:42:08.582-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:42:08.594-07	2026-08-21 08:42:08.594-07
\.


--
-- Data for Name: approval_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approval_items (id, approval_id, inventory_item_id, quantity, unit_price, total_price, status, issued_at, notes, created_at, updated_at) FROM stdin;
d8dc1594-dd79-4b0b-b426-16c60e48dde1	ede1efe6-744e-4ce5-9f1e-65c821346ee0	24807e7e-992a-4946-8dda-89b79542c844	1	50000.00	50000.00	ISSUED	2026-08-21 07:57:12.459-07	22K Gold Bangle	2026-08-21 07:57:12.459-07	2026-08-21 07:57:12.459-07
cf74b6d9-4675-4df2-9c4f-a9eafd2a3dfc	8d3729d6-0ecc-4f5f-88a6-2f04bc232b0b	24807e7e-992a-4946-8dda-89b79542c844	1	1000.00	1000.00	ISSUED	2026-08-21 07:57:12.997-07	\N	2026-08-21 07:57:12.997-07	2026-08-21 07:57:12.997-07
43fffe0a-b493-4453-9277-acb85680a7bd	316b38e6-7a43-4fbe-b553-725474b9fb24	ffd46571-4a97-4c17-9380-35bd6eebb0aa	1	25000.00	25000.00	ISSUED	2026-08-21 08:08:11.949-07	\N	2026-08-21 08:08:11.949-07	2026-08-21 08:08:11.949-07
e4a664a7-f0f2-4b77-8ce5-533ce87f7abc	7e74a7d0-811c-40d5-9161-24b74f9f03d9	0cb08f23-70b1-4339-b614-8f436b5f255f	1	15000.00	15000.00	ISSUED	2026-08-21 08:08:12.281-07	\N	2026-08-21 08:08:12.281-07	2026-08-21 08:08:12.281-07
f24fe318-0738-414d-b45f-9ebe9b47b5e6	7e74a7d0-811c-40d5-9161-24b74f9f03d9	ae8ed4b6-5e74-4e21-8bdb-29b6c617d8cd	1	35000.00	35000.00	ISSUED	2026-08-21 08:08:12.281-07	\N	2026-08-21 08:08:12.281-07	2026-08-21 08:08:12.281-07
3405069d-18b7-48f4-bf42-7024c4fd4fb4	ac2b2d62-d017-4d78-a0cd-b9b262bf1308	2ec430fc-0e0a-44f7-b95b-8a71cb2940dd	1	5000.00	5000.00	ISSUED	2026-08-21 08:08:12.495-07	\N	2026-08-21 08:08:12.495-07	2026-08-21 08:08:12.495-07
bf1f0b50-016c-4f87-8bd3-76c3f7baef2e	43bf4d1f-2e80-4028-991b-0a144efbd607	ffd46571-4a97-4c17-9380-35bd6eebb0aa	1	10000.00	10000.00	ISSUED	2026-08-21 08:08:12.587-07	\N	2026-08-21 08:08:12.587-07	2026-08-21 08:08:12.587-07
6fa988b5-8497-44e4-8d66-bd43cd83eed5	ac85f7e4-7bd2-46c7-a271-d5ff1ca9e374	d94d9dfa-84f3-4a73-8674-195049fdc3f6	1	10000.00	10000.00	ISSUED	2026-08-21 08:08:12.719-07	\N	2026-08-21 08:08:12.719-07	2026-08-21 08:08:12.719-07
e9985eed-5fe7-4121-a5ea-3bca348b4a75	ac85f7e4-7bd2-46c7-a271-d5ff1ca9e374	92b9f462-63e1-4de8-aa00-e707190a1159	1	20000.00	20000.00	ISSUED	2026-08-21 08:08:12.719-07	\N	2026-08-21 08:08:12.719-07	2026-08-21 08:08:12.719-07
8c1d1a5e-f635-4d90-a31a-d193c73f931a	d2fb5c6c-01c8-4546-85c9-692b768c7a89	59705c38-9a6c-4144-98fb-50d8fc29234f	1	30000.00	30000.00	ISSUED	2026-08-21 08:08:12.811-07	\N	2026-08-21 08:08:12.811-07	2026-08-21 08:08:12.811-07
0eef8b83-f561-4052-885f-befdc1d10f56	e74dbf4f-409a-4583-b7a3-34d8bb73a8ab	59705c38-9a6c-4144-98fb-50d8fc29234f	1	30000.00	30000.00	ISSUED	2026-08-21 08:08:12.853-07	\N	2026-08-21 08:08:12.853-07	2026-08-21 08:08:12.853-07
eb3443f7-f65e-46b9-8e8b-0013e5641b82	6c39e315-19d0-4741-9b38-0a97adb2d781	24807e7e-992a-4946-8dda-89b79542c844	1	50000.00	50000.00	ISSUED	2026-08-21 08:09:09.966-07	22K Gold Bangle	2026-08-21 08:09:09.966-07	2026-08-21 08:09:09.966-07
ff9b79cb-ed5e-4b99-8631-aaad519890ed	039f678d-6ea4-410d-8232-0db38d1ed3a4	296e8525-b704-41bf-80df-f273efbd53d4	1	50000.00	50000.00	ISSUED	2026-08-21 08:09:49.603-07	22K Gold Bangle	2026-08-21 08:09:49.603-07	2026-08-21 08:09:49.603-07
ac8d3061-6058-4456-a1f8-48d1b57c13d7	2f09725d-6261-432c-9b29-6bb0c42e68e3	296e8525-b704-41bf-80df-f273efbd53d4	1	1000.00	1000.00	ISSUED	2026-08-21 08:09:50.079-07	\N	2026-08-21 08:09:50.079-07	2026-08-21 08:09:50.079-07
f15d1bea-aea2-4a5c-bd6b-b57a83b46f4b	d4e00a35-c386-4bdf-8848-97d9cb22d185	d6026b3e-e7f3-4ab2-9f3c-fa62dde869d4	1	150000.00	150000.00	ISSUED	2026-08-21 08:16:03.2-07	\N	2026-08-21 08:16:03.2-07	2026-08-21 08:16:03.2-07
c4d9484e-c2fa-4baf-abb2-1247cc66ba28	db48825b-c834-422e-a49f-32c60eee2bb8	0729dd37-e008-4b1d-a7e5-3176679edee7	1	150000.00	150000.00	ISSUED	2026-08-21 08:16:53.112-07	\N	2026-08-21 08:16:53.112-07	2026-08-21 08:16:53.112-07
3a48f216-33be-444a-a3f6-47550e8205ce	75770175-3ceb-4a2e-9d1d-1e67973755b4	dbfb33b0-a0cf-48cb-ab76-7bbce04c95d6	1	80000.00	80000.00	RETURNED	2026-08-21 08:24:25.799-07	\N	2026-08-21 08:24:25.799-07	2026-08-21 08:24:26.123-07
a1e6cddc-9926-4a2a-a10e-d0260d1983cc	d59c178b-227d-4465-abf5-eb659ae78ce7	3199d846-8209-41ce-9da7-b9b80c1f0484	1	100000.00	100000.00	PURCHASED	2026-08-21 08:24:26.402-07	\N	2026-08-21 08:24:26.402-07	2026-08-21 08:24:26.593-07
756d3f3b-a48a-411f-8123-259733162bc8	4d3f3674-0a92-45ea-85a4-2318e368d7c0	e31636a0-8fc6-4cf3-add9-e33c92a54723	1	50000.00	50000.00	RETURNED	2026-08-21 08:24:26.781-07	\N	2026-08-21 08:24:26.781-07	2026-08-21 08:24:26.858-07
4d1df35c-1e44-4cc6-8bde-23a0fb67df4f	d73aac67-8f8c-4227-b2eb-ed101d1ec81f	f89f11a0-9b0d-4b2d-a27c-3238f1d9397f	1	80000.00	80000.00	RETURNED	2026-08-21 08:26:01.97-07	\N	2026-08-21 08:26:01.97-07	2026-08-21 08:26:02.477-07
86ccce51-779d-4e02-b774-dd303e1366b0	52037f9b-143e-42b6-8a29-090ddd39dd7d	c48b857c-3097-4edd-aa98-51ee9b59f8fd	1	100000.00	100000.00	PURCHASED	2026-08-21 08:26:03.141-07	\N	2026-08-21 08:26:03.141-07	2026-08-21 08:26:03.386-07
78f6886d-761f-4c3b-b728-cd03a980898d	5ed2ff1e-17ff-4164-9767-be27ed717cda	a7bfd35c-32e1-4f80-90e2-9739c95fdafc	1	50000.00	50000.00	RETURNED	2026-08-21 08:26:03.768-07	\N	2026-08-21 08:26:03.768-07	2026-08-21 08:26:03.935-07
7d145da0-d2f4-48a0-bc14-c9629237fba9	f40b092d-11ae-49d6-9e79-37ed18590f2e	a26e66e0-87e7-4068-b016-efa2074aac85	1	60000.00	60000.00	ISSUED	2026-08-21 08:37:19.808-07	\N	2026-08-21 08:37:19.808-07	2026-08-21 08:37:19.808-07
dfbb3aee-1cfc-4dc8-a472-af42d26db012	464cdb69-da33-4f02-8422-6014c7f521ae	7787c368-6244-4102-a576-9c54decd56ae	1	75000.00	75000.00	RETURNED	2026-08-21 08:37:20.362-07	\N	2026-08-21 08:37:20.362-07	2026-08-21 08:37:20.497-07
42209bfa-4210-4432-8a1e-4f3b9b7f0d3b	10af99aa-871d-46d0-bbc3-24496c7879bf	6bc93e18-46a1-4cc9-a541-423342649060	1	90000.00	90000.00	PURCHASED	2026-08-21 08:37:20.885-07	\N	2026-08-21 08:37:20.885-07	2026-08-21 08:37:21.114-07
f706132d-5bcd-47d4-b132-a6b6ce76dc24	1765330d-b797-4c1e-a19e-3ad842e5b50c	2ae8e740-3a75-4e14-89c4-a6f80da44035	1	60000.00	60000.00	ISSUED	2026-08-21 08:40:02.948-07	\N	2026-08-21 08:40:02.948-07	2026-08-21 08:40:02.948-07
ff581a41-851e-43dd-b682-c749a667eb24	78e7b540-5b02-486b-a7de-5cdb4ecc464d	70b3a45c-148e-4f3b-aad1-82818f7255b3	1	75000.00	75000.00	RETURNED	2026-08-21 08:40:03.638-07	\N	2026-08-21 08:40:03.638-07	2026-08-21 08:40:03.816-07
0a055384-a01d-4d3f-948b-e12f02068da4	4c518c77-93cd-459b-ae8c-767c175c0e99	800922af-8a0c-4b43-8bdc-42b65710d3c3	1	90000.00	90000.00	PURCHASED	2026-08-21 08:40:04.262-07	\N	2026-08-21 08:40:04.262-07	2026-08-21 08:40:04.606-07
33102423-a9dc-460f-8a24-420bebc93ac0	3c7491c3-8bb7-4976-8b31-231607cecd37	d178ffd8-2bcf-401d-b470-d449b93053e7	1	50000.00	50000.00	ISSUED	2026-08-21 08:40:04.938-07	\N	2026-08-21 08:40:04.938-07	2026-08-21 08:40:04.938-07
e9320e05-a4b3-49b4-bf59-a5a0c4f5441d	a2075f02-44ff-41fc-bf0e-048fb8daad9a	f8727754-e35f-44b7-b70f-98f5c4bbb7d8	1	60000.00	60000.00	ISSUED	2026-08-21 08:42:06.519-07	\N	2026-08-21 08:42:06.519-07	2026-08-21 08:42:06.519-07
a004b416-5949-4c3c-9a4e-e34f5b702642	7812cc52-344f-40a1-9670-0828df74c2fd	6c6cabb9-190f-4987-9cfa-f2de2bcee678	1	75000.00	75000.00	RETURNED	2026-08-21 08:42:07.529-07	\N	2026-08-21 08:42:07.529-07	2026-08-21 08:42:07.852-07
09b651ac-0561-4550-9ece-a28d9de96bda	60d1aa60-631c-4de3-ae97-049a5db19f90	7114131d-077a-4326-8235-7125ced8bade	1	90000.00	90000.00	PURCHASED	2026-08-21 08:42:08.31-07	\N	2026-08-21 08:42:08.31-07	2026-08-21 08:42:08.692-07
d07f8db0-b088-4031-978e-493fd7e6517b	3cc7fe49-b5b5-429e-bf46-6f9a1f7d6d25	86b0966e-9cc0-49c3-8dd9-c6a5e837c44d	1	50000.00	50000.00	ISSUED	2026-08-21 08:42:09.028-07	\N	2026-08-21 08:42:09.028-07	2026-08-21 08:42:09.028-07
\.


--
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approvals (id, approval_number, company_id, branch_id, customer_id, salesperson_id, issue_date, due_date, status, notes, total_amount, total_quantity, created_by, updated_by, created_at, updated_at, required_deposit_amount) FROM stdin;
ede1efe6-744e-4ce5-9f1e-65c821346ee0	APP-00001	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	2406c478-00f7-4791-b275-e3d215791f3a	2026-08-21 07:57:12.362-07	2026-09-04 07:57:12.767-07	ISSUED	Updated approval slip notes	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:57:12.459-07	2026-08-21 07:57:12.852-07	0.00
8d3729d6-0ecc-4f5f-88a6-2f04bc232b0b	APP-00002	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 07:57:12.969-07	2026-08-26 07:57:12.954-07	CANCELLED	\N	1000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:57:12.997-07	2026-08-21 07:57:13.032-07	0.00
316b38e6-7a43-4fbe-b553-725474b9fb24	APP-00003	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	2406c478-00f7-4791-b275-e3d215791f3a	2026-08-21 08:08:11.871-07	2026-08-28 08:08:11.71-07	ISSUED	\N	25000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:11.949-07	2026-08-21 08:08:12.149-07	0.00
7e74a7d0-811c-40d5-9161-24b74f9f03d9	APP-00004	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:08:12.225-07	2026-08-28 08:08:12.208-07	ISSUED	\N	50000.00	2	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.281-07	2026-08-21 08:08:12.406-07	0.00
ac2b2d62-d017-4d78-a0cd-b9b262bf1308	APP-00005	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:08:12.469-07	2026-08-28 08:08:12.45-07	DRAFT	\N	5000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 08:08:12.495-07	2026-08-21 08:08:12.495-07	0.00
43bf4d1f-2e80-4028-991b-0a144efbd607	APP-00006	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:08:12.563-07	2026-08-28 08:08:12.551-07	DRAFT	\N	10000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 08:08:12.587-07	2026-08-21 08:08:12.587-07	0.00
ac85f7e4-7bd2-46c7-a271-d5ff1ca9e374	APP-00007	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:08:12.688-07	2026-08-28 08:08:12.675-07	DRAFT	\N	30000.00	2	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 08:08:12.719-07	2026-08-21 08:08:12.719-07	0.00
e74dbf4f-409a-4583-b7a3-34d8bb73a8ab	APP-00009	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:08:12.84-07	2026-08-28 08:08:12.824-07	DRAFT	\N	30000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 08:08:12.853-07	2026-08-21 08:08:12.853-07	0.00
d2fb5c6c-01c8-4546-85c9-692b768c7a89	APP-00008	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:08:12.793-07	2026-08-28 08:08:12.777-07	ISSUED	\N	30000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.811-07	2026-08-21 08:08:12.893-07	0.00
6c39e315-19d0-4741-9b38-0a97adb2d781	APP-00010	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	2406c478-00f7-4791-b275-e3d215791f3a	2026-08-21 08:09:09.882-07	2026-09-04 08:09:10.202-07	DRAFT	Updated approval slip notes	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:09:09.966-07	2026-08-21 08:09:10.238-07	0.00
d73aac67-8f8c-4227-b2eb-ed101d1ec81f	APP-00018	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:26:01.824-07	2026-08-28 08:26:01.631-07	RETURNED	Return Reason: Customer selected another piece	80000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:01.97-07	2026-08-21 08:26:02.484-07	20000.00
039f678d-6ea4-410d-8232-0db38d1ed3a4	APP-00011	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	2406c478-00f7-4791-b275-e3d215791f3a	2026-08-21 08:09:49.544-07	2026-09-04 08:09:49.82-07	ISSUED	Updated approval slip notes	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:09:49.603-07	2026-08-21 08:09:49.95-07	0.00
2f09725d-6261-432c-9b29-6bb0c42e68e3	APP-00012	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:09:50.059-07	2026-08-26 08:09:50.045-07	CANCELLED	\N	1000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 08:09:50.079-07	2026-08-21 08:09:50.121-07	0.00
d4e00a35-c386-4bdf-8848-97d9cb22d185	APP-00013	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:16:03.125-07	2026-08-28 08:16:02.991-07	ISSUED	\N	150000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:03.2-07	2026-08-21 08:16:03.459-07	50000.00
db48825b-c834-422e-a49f-32c60eee2bb8	APP-00014	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:16:52.905-07	2026-08-28 08:16:52.76-07	ISSUED	\N	150000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:53.112-07	2026-08-21 08:16:53.298-07	50000.00
75770175-3ceb-4a2e-9d1d-1e67973755b4	APP-00015	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:24:25.64-07	2026-08-28 08:24:25.21-07	RETURNED	Return Reason: Customer selected another piece	80000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:25.799-07	2026-08-21 08:24:26.13-07	20000.00
d59c178b-227d-4465-abf5-eb659ae78ce7	APP-00016	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:24:26.371-07	2026-08-28 08:24:26.349-07	PURCHASED	\N	100000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.402-07	2026-08-21 08:24:26.676-07	40000.00
4d3f3674-0a92-45ea-85a4-2318e368d7c0	APP-00017	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:24:26.759-07	2026-08-28 08:24:26.738-07	RETURNED	Return Reason: Concurrent return	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.781-07	2026-08-21 08:24:26.866-07	0.00
52037f9b-143e-42b6-8a29-090ddd39dd7d	APP-00019	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:26:03.104-07	2026-08-28 08:26:03.07-07	PURCHASED	\N	100000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.141-07	2026-08-21 08:26:03.556-07	40000.00
5ed2ff1e-17ff-4164-9767-be27ed717cda	APP-00020	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:26:03.731-07	2026-08-28 08:26:03.706-07	RETURNED	Return Reason: Concurrent return	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.768-07	2026-08-21 08:26:03.937-07	0.00
f40b092d-11ae-49d6-9e79-37ed18590f2e	APP-00021	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:37:19.516-07	2026-08-26 08:37:19.312-07	ISSUED	\N	60000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:19.808-07	2026-08-21 08:37:20.044-07	15000.00
464cdb69-da33-4f02-8422-6014c7f521ae	APP-00022	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:37:20.302-07	2026-08-24 08:37:20.278-07	RETURNED	Return Reason: Design mismatch	75000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.362-07	2026-08-21 08:37:20.51-07	0.00
10af99aa-871d-46d0-bbc3-24496c7879bf	APP-00023	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:37:20.833-07	2026-08-23 08:37:20.806-07	PURCHASED	\N	90000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.885-07	2026-08-21 08:37:21.216-07	30000.00
1765330d-b797-4c1e-a19e-3ad842e5b50c	APP-00024	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:40:02.755-07	2026-08-26 08:40:02.519-07	ISSUED	\N	60000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:02.948-07	2026-08-21 08:40:03.314-07	15000.00
78e7b540-5b02-486b-a7de-5cdb4ecc464d	APP-00025	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:40:03.584-07	2026-08-24 08:40:03.546-07	RETURNED	Return Reason: Design mismatch	75000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:03.638-07	2026-08-21 08:40:03.837-07	0.00
4c518c77-93cd-459b-ae8c-767c175c0e99	APP-00026	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:40:04.144-07	2026-08-23 08:40:04.108-07	PURCHASED	\N	90000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:04.262-07	2026-08-21 08:40:04.828-07	30000.00
3c7491c3-8bb7-4976-8b31-231607cecd37	APP-00027	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:40:04.888-07	2026-08-11 08:40:05.027-07	ISSUED	\N	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:04.938-07	2026-08-21 08:40:05.03-07	10000.00
a2075f02-44ff-41fc-bf0e-048fb8daad9a	APP-00028	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:42:06.258-07	2026-08-26 08:42:06.036-07	ISSUED	\N	60000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:06.519-07	2026-08-21 08:42:06.993-07	15000.00
7812cc52-344f-40a1-9670-0828df74c2fd	APP-00029	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:42:07.417-07	2026-08-24 08:42:07.36-07	RETURNED	Return Reason: Design mismatch	75000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:07.529-07	2026-08-21 08:42:07.867-07	0.00
60d1aa60-631c-4de3-ae97-049a5db19f90	APP-00030	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:42:08.241-07	2026-08-23 08:42:08.191-07	PURCHASED	\N	90000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:08.31-07	2026-08-21 08:42:08.906-07	30000.00
3cc7fe49-b5b5-429e-bf46-6f9a1f7d6d25	APP-00031	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	\N	2026-08-21 08:42:08.978-07	2026-08-11 08:42:09.128-07	ISSUED	\N	50000.00	1	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:09.028-07	2026-08-21 08:42:09.14-07	10000.00
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, company_id, branch_code, name, email, phone, address_line1, address_line2, city, state, pincode, is_main_branch, is_active, created_at, updated_at) FROM stdin;
22222222-2222-4222-a222-222222222221	11111111-1111-4111-a111-111111111111	BR-DEL-01	Connaught Place Flagship Showroom	cp.branch@tanishajewels.com	011-23415500	Plaza 14, Inner Circle, Connaught Place	Opposite Metro Gate 2	New Delhi	Delhi	110001	t	t	2026-08-21 07:14:36.811-07	2026-08-21 07:14:36.811-07
22222222-2222-4222-a222-222222222222	11111111-1111-4111-a111-111111111111	BR-GGN-02	Gurgaon Galleria Boulevard Showroom	ggn.branch@tanishajewels.com	0124-4455667	Galleria Market, Sector 28	DLF Phase 4	Gurgaon	Haryana	122009	f	t	2026-08-21 07:14:36.816-07	2026-08-21 07:14:36.816-07
e1f5a61a-288d-472a-9b4d-e56b5c8ef11b	3a63d766-7cfd-49b5-bcbb-a8f0555459c9	TST-BR-2	Test Branch 2	\N	\N	\N	\N	\N	\N	\N	f	t	2026-08-21 07:57:12.194-07	2026-08-21 07:57:12.194-07
96c1c182-b994-4ea1-9505-2989d119d466	683abc93-acf5-40d2-af8a-e0a0994594f7	ISO-BR-2	Isolation Branch 2	\N	\N	\N	\N	\N	\N	\N	f	t	2026-08-21 08:08:11.621-07	2026-08-21 08:08:11.621-07
62993a07-55b7-42fd-942e-5ff564e2935d	d2bf74bb-2d13-4f96-9f29-053011760151	DEP-BR-2	Deposit Branch 2	\N	\N	\N	\N	\N	\N	\N	f	t	2026-08-21 08:16:02.864-07	2026-08-21 08:16:02.864-07
f9b3c70a-7ebd-41a2-9a68-2dc530eea328	04e9bd01-0b04-48d0-b149-606dcdb1350a	RET-BR-2	Return Branch 2	\N	\N	\N	\N	\N	\N	\N	f	t	2026-08-21 08:24:25.096-07	2026-08-21 08:24:25.096-07
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, company_code, name, legal_name, gst_number, pan_number, email, phone, website, logo_url, is_active, created_at, updated_at) FROM stdin;
11111111-1111-4111-a111-111111111111	COMP-001	Tanisha Heritage Jewels Pvt Ltd	Tanisha Heritage Jewels Private Limited	07AABCT1234F1Z1	AABCT1234F	contact@tanishajewels.com	011-45678901	https://tanishajewels.com	https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300	t	2026-08-21 07:14:36.801-07	2026-08-21 07:14:36.801-07
3a63d766-7cfd-49b5-bcbb-a8f0555459c9	TEST-COMP-2	Test Company 2 Ltd	\N	\N	\N	\N	\N	\N	\N	t	2026-08-21 07:57:12.188-07	2026-08-21 07:57:12.188-07
683abc93-acf5-40d2-af8a-e0a0994594f7	COMP-ISO-2	Isolation Company 2	\N	\N	\N	\N	\N	\N	\N	t	2026-08-21 08:08:11.615-07	2026-08-21 08:08:11.615-07
d2bf74bb-2d13-4f96-9f29-053011760151	COMP-DEP-2	Deposit Isolation Co 2	\N	\N	\N	\N	\N	\N	\N	t	2026-08-21 08:16:02.859-07	2026-08-21 08:16:02.859-07
04e9bd01-0b04-48d0-b149-606dcdb1350a	COMP-RET-2	Return Isolation Co 2	\N	\N	\N	\N	\N	\N	\N	t	2026-08-21 08:24:25.09-07	2026-08-21 08:24:25.09-07
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_addresses (id, customer_id, address_type, address_line1, address_line2, city, state, pincode, is_default, created_at, updated_at) FROM stdin;
40f17ed8-38e4-432b-9a0b-ce76ef325101	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	OFFICE	Flat 402, Green Park Enclave	\N	New Delhi	Delhi	110016	t	2026-08-21 07:14:37.043-07	2026-08-21 07:14:37.043-07
360b5675-4e55-4aa5-abb8-dc8e49b08805	3ef592c6-ba49-4ae3-b06f-6d4a25f1fd8b	OFFICE	B-24, Hauz Khas Main Market	\N	New Delhi	Delhi	110016	t	2026-08-21 07:14:37.052-07	2026-08-21 07:14:37.052-07
3bd41b5e-2084-4a57-a380-128c62f8c24e	608393c9-9846-47bd-b7f9-2cc6e190966a	OFFICE	Pocket 3, Sector D, Vasant Kunj	\N	New Delhi	Delhi	110070	t	2026-08-21 07:14:37.061-07	2026-08-21 07:14:37.061-07
1297ef82-e182-4daa-ae8d-1692d194101e	ea5ab1e5-4e08-4baf-a391-39c6edcf5f60	OFFICE	Shop 102, Kucha Mahajani, Chandni Chowk	\N	Delhi	Delhi	110006	t	2026-08-21 07:14:37.071-07	2026-08-21 07:14:37.071-07
c403c0b1-d31c-4b38-b020-e6703b1d8b95	0876f480-3ea1-41fa-bcbd-45f3afc90d5e	OFFICE	128, Sheikh Memon Street, Zaveri Bazaar	\N	Mumbai	Maharashtra	400002	t	2026-08-21 07:14:37.08-07	2026-08-21 07:14:37.08-07
637cb4e2-71b4-4d01-b58b-f447e58dfddf	06073102-f069-4abd-99f0-b8b694a52b87	OFFICE	Villa 12, Golf Links	\N	New Delhi	Delhi	110003	t	2026-08-21 07:14:37.086-07	2026-08-21 07:14:37.086-07
fcf7a4ff-ea11-4343-b65c-b5c516dec465	3b90446b-b97d-4368-a571-05c21d3a9de1	OFFICE	Heritage Bhavan, Civil Lines	\N	Jaipur	Rajasthan	302006	t	2026-08-21 07:14:37.093-07	2026-08-21 07:14:37.093-07
dba2e663-4c3a-431c-9a22-7e163251ecb8	bdbd9dc7-245f-4335-bab9-40a3095bd5f2	OFFICE	M-Block, Greater Kailash 2	\N	New Delhi	Delhi	110048	t	2026-08-21 07:14:37.102-07	2026-08-21 07:14:37.102-07
11b122dd-8e70-4c29-8665-a806ed557f84	15a7841b-6bac-429f-8d41-4b3acb140d2a	OFFICE	Barakhamba Road, Connaught Place	\N	New Delhi	Delhi	110001	t	2026-08-21 07:14:37.11-07	2026-08-21 07:14:37.11-07
4cbef75d-95a4-4b1d-ab88-2a9ded34c540	657d98a9-0aca-4410-baa0-7ec4c77d0705	OFFICE	DLF Cyber Park, Udyog Vihar Phase 3	\N	Gurgaon	Haryana	122016	t	2026-08-21 07:14:37.116-07	2026-08-21 07:14:37.116-07
\.


--
-- Data for Name: customer_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_documents (id, customer_id, document_type, document_number, file_url, created_at, updated_at) FROM stdin;
9bd6fd9e-1de3-40b0-bf84-d2c977c1a73d	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	AADHAR	5432-1234-5678	https://storage.jewelleryerp.com/docs/cust-001_kyc.pdf	2026-08-21 07:14:37.043-07	2026-08-21 07:14:37.043-07
00642fd6-77ba-44ea-b001-f470459f4713	3ef592c6-ba49-4ae3-b06f-6d4a25f1fd8b	AADHAR	5432-1234-5679	https://storage.jewelleryerp.com/docs/cust-002_kyc.pdf	2026-08-21 07:14:37.052-07	2026-08-21 07:14:37.052-07
78427bcf-feb3-47bb-9cee-4fac8be27686	608393c9-9846-47bd-b7f9-2cc6e190966a	DRIVING_LICENSE	DL-0420180012345	https://storage.jewelleryerp.com/docs/cust-003_kyc.pdf	2026-08-21 07:14:37.061-07	2026-08-21 07:14:37.061-07
9a6ee02d-df92-4159-8709-2033b761496c	ea5ab1e5-4e08-4baf-a391-39c6edcf5f60	GST_CERTIFICATE	07AACCM5566B1Z8	https://storage.jewelleryerp.com/docs/cust-004_kyc.pdf	2026-08-21 07:14:37.071-07	2026-08-21 07:14:37.071-07
b15ee5b3-5600-44f0-a981-35b3ab1a316d	0876f480-3ea1-41fa-bcbd-45f3afc90d5e	GST_CERTIFICATE	27AABCT9988H1Z5	https://storage.jewelleryerp.com/docs/cust-005_kyc.pdf	2026-08-21 07:14:37.08-07	2026-08-21 07:14:37.08-07
1246de94-0d5d-49fe-9afe-d6fed0ed88ca	06073102-f069-4abd-99f0-b8b694a52b87	PASSPORT	Z9876543	https://storage.jewelleryerp.com/docs/cust-006_kyc.pdf	2026-08-21 07:14:37.086-07	2026-08-21 07:14:37.086-07
1e78cdc0-ac3d-49ca-baea-f383fc295022	3b90446b-b97d-4368-a571-05c21d3a9de1	TRUST_DEED	TR-RJ-1985-001	https://storage.jewelleryerp.com/docs/cust-007_kyc.pdf	2026-08-21 07:14:37.093-07	2026-08-21 07:14:37.093-07
5799abfd-6382-482e-bec7-c7b81f9666a1	bdbd9dc7-245f-4335-bab9-40a3095bd5f2	PAN_CARD	ABCPS6655E	https://storage.jewelleryerp.com/docs/cust-008_kyc.pdf	2026-08-21 07:14:37.102-07	2026-08-21 07:14:37.102-07
30baa6b3-a495-4a2f-a229-aab1a2560755	15a7841b-6bac-429f-8d41-4b3acb140d2a	COMPANY_PAN	AABCR1122D	https://storage.jewelleryerp.com/docs/cust-009_kyc.pdf	2026-08-21 07:14:37.11-07	2026-08-21 07:14:37.11-07
6bf6330a-3cc5-4e1b-830b-a12f709e187a	657d98a9-0aca-4410-baa0-7ec4c77d0705	GST_CERTIFICATE	06AAACT2233E1Z4	https://storage.jewelleryerp.com/docs/cust-010_kyc.pdf	2026-08-21 07:14:37.116-07	2026-08-21 07:14:37.116-07
\.


--
-- Data for Name: customer_gold_exchange_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_gold_exchange_items (id, exchange_id, metal_type, purity, gross_weight, stone_weight, net_weight, metal_rate_id, rate_per_gram, metal_value, deduction_percent, deduction_amount, exchange_value, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_gold_exchanges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_gold_exchanges (id, exchange_number, sales_invoice_id, customer_id, branch_id, status, total_gross_weight, total_stone_weight, total_net_weight, total_metal_value, total_deduction_amount, total_exchange_value, remarks, created_by, updated_by, applied_at, cancelled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, company_id, branch_id, customer_code, first_name, last_name, email, mobile, pan_number, aadhar_number, gst_number, customer_type, is_active, created_at, updated_at, cash_balance, gold_balance_grams, opening_cash_balance, opening_gold_balance_grams, opening_silver_balance_grams, silver_balance_grams) FROM stdin;
aa4939e0-414d-4f8c-a5f8-9df73d1120c7	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-001	Priya	Sharma	priya.sharma@example.com	9811223344	ABCPS1234A	543212345678	\N	RETAIL	t	2026-08-21 07:14:37.043-07	2026-08-21 07:14:37.043-07	0.00	0.000	0.00	0.000	0.000	0.000
3ef592c6-ba49-4ae3-b06f-6d4a25f1fd8b	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-002	Rohan	Malhotra	rohan.malhotra@gmail.com	9811223345	ABCMR2345B	543212345679	\N	RETAIL	t	2026-08-21 07:14:37.052-07	2026-08-21 07:14:37.052-07	0.00	0.000	0.00	0.000	0.000	0.000
608393c9-9846-47bd-b7f9-2cc6e190966a	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-003	Sunita	Deshmukh	sunita.deshmukh@yahoo.com	9811223346	ABCDD3456C	\N	\N	RETAIL	t	2026-08-21 07:14:37.061-07	2026-08-21 07:14:37.061-07	0.00	0.000	0.00	0.000	0.000	0.000
ea5ab1e5-4e08-4baf-a391-39c6edcf5f60	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-004	Mittal	Bullion & Trade Mart	sales@mittalbullion.com	9822334455	AACCM5566B	\N	07AACCM5566B1Z8	WHOLESALE	t	2026-08-21 07:14:37.071-07	2026-08-21 07:14:37.071-07	0.00	0.000	0.00	0.000	0.000	0.000
0876f480-3ea1-41fa-bcbd-45f3afc90d5e	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-005	Zaveri	Bazaar Gemstone Traders	orders@zaveritraders.com	9822334456	AABCT9988H	\N	27AABCT9988H1Z5	WHOLESALE	t	2026-08-21 07:14:37.08-07	2026-08-21 07:14:37.08-07	0.00	0.000	0.00	0.000	0.000	0.000
06073102-f069-4abd-99f0-b8b694a52b87	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-006	Vikramaditya	Singhania	v.singhania@heritagegroup.in	9833445566	AABPS9988C	\N	\N	VIP	t	2026-08-21 07:14:37.086-07	2026-08-21 07:14:37.086-07	0.00	0.000	0.00	0.000	0.000	0.000
3b90446b-b97d-4368-a571-05c21d3a9de1	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-007	Gayatri	Devi Trust / Royal Palace	estates@gayatritrust.org	9833445567	AAATG8877D	\N	\N	VIP	t	2026-08-21 07:14:37.093-07	2026-08-21 07:14:37.093-07	0.00	0.000	0.00	0.000	0.000	0.000
bdbd9dc7-245f-4335-bab9-40a3095bd5f2	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-008	Dr. Arvind	Swaminathan	arvind.swaminathan@apollo.org	9833445568	ABCPS6655E	\N	\N	VIP	t	2026-08-21 07:14:37.102-07	2026-08-21 07:14:37.102-07	0.00	0.000	0.00	0.000	0.000	0.000
15a7841b-6bac-429f-8d41-4b3acb140d2a	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-009	Reliance	Corporate Gifting Desk	corporate.gifts@rilgifting.com	9844556677	AABCR1122D	\N	07AABCR1122D1Z2	CORPORATE	t	2026-08-21 07:14:37.11-07	2026-08-21 07:14:37.11-07	0.00	0.000	0.00	0.000	0.000	0.000
657d98a9-0aca-4410-baa0-7ec4c77d0705	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	CUST-010	Tata Consultancy Services	Festive Rewards Cell	employee.rewards@tcs.com	9844556678	AAACT2233E	\N	06AAACT2233E1Z4	CORPORATE	t	2026-08-21 07:14:37.116-07	2026-08-21 07:14:37.116-07	0.00	0.000	0.00	0.000	0.000	0.000
f34ff351-2211-4f6e-9106-3de21cabf67a	683abc93-acf5-40d2-af8a-e0a0994594f7	96c1c182-b994-4ea1-9505-2989d119d466	CUST-ISO-02	Iso	Customer	\N	9988776655	\N	\N	\N	RETAIL	t	2026-08-21 08:08:11.628-07	2026-08-21 08:08:11.628-07	0.00	0.000	0.00	0.000	0.000	0.000
29ab1b72-395c-43e0-9c71-411dbb81a373	d2bf74bb-2d13-4f96-9f29-053011760151	62993a07-55b7-42fd-942e-5ff564e2935d	DEP-CUST-2	Dep	Iso	\N	9911223344	\N	\N	\N	RETAIL	t	2026-08-21 08:16:02.872-07	2026-08-21 08:16:02.872-07	0.00	0.000	0.00	0.000	0.000	0.000
e9f94735-c274-47ea-b704-93bfb96fe747	04e9bd01-0b04-48d0-b149-606dcdb1350a	f9b3c70a-7ebd-41a2-9a68-2dc530eea328	RET-CUST-2	Ret	Iso	\N	9900112233	\N	\N	\N	RETAIL	t	2026-08-21 08:24:25.104-07	2026-08-21 08:24:25.104-07	0.00	0.000	0.00	0.000	0.000	0.000
\.


--
-- Data for Name: document_series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_series (id, company_id, branch_id, financial_year_id, document_type, prefix, next_number, created_at, updated_at) FROM stdin;
b2ff06f0-5b99-4e16-b306-cca0d212a9e8	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	f4f629d5-e154-4026-aef1-ef561f27ecf3	APPROVAL_DEPOSIT	DEP	19	2026-08-21 08:16:03.507-07	2026-08-21 08:42:08.577-07
f7b79ce0-c3da-4229-9ae6-b4e30f1ac3d7	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	f4f629d5-e154-4026-aef1-ef561f27ecf3	APPROVAL	APP	32	2026-08-21 07:57:12.414-07	2026-08-21 08:42:09.008-07
\.


--
-- Data for Name: employee_branch_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_branch_assignments (id, employee_id, branch_id, designation, is_primary, effective_from, effective_to, created_at, updated_at) FROM stdin;
792eb20d-6c64-49ad-a5b1-093f002d4f10	2406c478-00f7-4791-b275-e3d215791f3a	22222222-2222-4222-a222-222222222221	Managing Director & Store Owner	t	2026-08-21 07:14:36.849-07	\N	2026-08-21 07:14:36.849-07	2026-08-21 07:14:36.849-07
14f8bc52-5a9a-4cac-b99b-f1b717428919	0bc5feb4-2537-4248-b708-5830a3032f4e	22222222-2222-4222-a222-222222222221	Showroom Store Manager	t	2026-08-21 07:14:36.867-07	\N	2026-08-21 07:14:36.867-07	2026-08-21 07:14:36.867-07
012a40b0-7545-4c10-a7ed-aaf053991b45	e36ec614-0ddc-4f6d-a4cd-985ee38c3f5a	22222222-2222-4222-a222-222222222221	Head Billing Cashier	t	2026-08-21 07:14:36.876-07	\N	2026-08-21 07:14:36.876-07	2026-08-21 07:14:36.876-07
a498a12f-8a35-4a6b-ad07-3db280366526	17370f83-c0ad-44b4-9545-28992ae46d43	22222222-2222-4222-a222-222222222221	Counter Sales Staff	t	2026-08-21 07:14:36.884-07	\N	2026-08-21 07:14:36.884-07	2026-08-21 07:14:36.884-07
349e8fae-6d8c-4ffb-82ce-00786c737c51	603a2115-7be9-4fd9-bd7a-9d8d667fc5b0	22222222-2222-4222-a222-222222222221	Senior Sales Executive - Solitaire & Diamonds	t	2026-08-21 07:14:36.891-07	\N	2026-08-21 07:14:36.891-07	2026-08-21 07:14:36.891-07
0a99a098-5c79-4028-af66-410d1b95d0fa	9968be38-bef1-40d3-be1b-c8a2280b4b43	22222222-2222-4222-a222-222222222221	Sales Executive - Bridal Gold & Ornaments	t	2026-08-21 07:14:36.898-07	\N	2026-08-21 07:14:36.898-07	2026-08-21 07:14:36.898-07
f65ee717-1aee-49cf-8722-c8e6c802c0a7	d2f27c5c-f457-44cb-94d0-b623cfcaa393	22222222-2222-4222-a222-222222222221	Vault & Bullion Stock Keeper	t	2026-08-21 07:14:36.906-07	\N	2026-08-21 07:14:36.906-07	2026-08-21 07:14:36.906-07
71b727a7-7299-443c-a415-4f02eb9b07fb	8a6d14cd-85ff-4007-b9d4-6bbb63b7f65d	22222222-2222-4222-a222-222222222221	Chief Accounts & Tax Officer	t	2026-08-21 07:14:36.912-07	\N	2026-08-21 07:14:36.912-07	2026-08-21 07:14:36.912-07
c6465e38-98d1-46aa-83b5-99303a693637	7a66720c-47e9-4cf3-92d5-e43ba11f8785	22222222-2222-4222-a222-222222222221	Workshop Head & Goldsmith Supervisor	t	2026-08-21 07:14:36.92-07	\N	2026-08-21 07:14:36.92-07	2026-08-21 07:14:36.92-07
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, company_id, employee_code, first_name, last_name, email, mobile, joining_date, is_active, created_at, updated_at) FROM stdin;
2406c478-00f7-4791-b275-e3d215791f3a	11111111-1111-4111-a111-111111111111	EMP-001	Tanishk	Agrawal	owner@jewelleryerp.com	9810011001	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.849-07	2026-08-21 07:14:36.849-07
0bc5feb4-2537-4248-b708-5830a3032f4e	11111111-1111-4111-a111-111111111111	EMP-002	Amit	Sharma	manager@jewelleryerp.com	9810011002	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.867-07	2026-08-21 07:14:36.867-07
e36ec614-0ddc-4f6d-a4cd-985ee38c3f5a	11111111-1111-4111-a111-111111111111	EMP-003	Pooja	Gupta	cashier@jewelleryerp.com	9810011003	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.876-07	2026-08-21 07:14:36.876-07
17370f83-c0ad-44b4-9545-28992ae46d43	11111111-1111-4111-a111-111111111111	EMP-004	Rohit	Mehta	staff@jewelleryerp.com	9810011014	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.884-07	2026-08-21 07:14:36.884-07
603a2115-7be9-4fd9-bd7a-9d8d667fc5b0	11111111-1111-4111-a111-111111111111	EMP-005	Ananya	Roy	sales@jewelleryerp.com	9810011004	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.891-07	2026-08-21 07:14:36.891-07
9968be38-bef1-40d3-be1b-c8a2280b4b43	11111111-1111-4111-a111-111111111111	EMP-006	Rahul	Kapoor	sales2@jewelleryerp.com	9810011008	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.898-07	2026-08-21 07:14:36.898-07
d2f27c5c-f457-44cb-94d0-b623cfcaa393	11111111-1111-4111-a111-111111111111	EMP-007	Deepak	Chawla	vault@jewelleryerp.com	9810011005	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.906-07	2026-08-21 07:14:36.906-07
8a6d14cd-85ff-4007-b9d4-6bbb63b7f65d	11111111-1111-4111-a111-111111111111	EMP-008	Sanjay	Agrawal	accountant@jewelleryerp.com	9810011006	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.912-07	2026-08-21 07:14:36.912-07
7a66720c-47e9-4cf3-92d5-e43ba11f8785	11111111-1111-4111-a111-111111111111	EMP-009	Gopal	Swarnakar	karigar@jewelleryerp.com	9810011007	2024-01-15 00:00:00-08	t	2026-08-21 07:14:36.92-07	2026-08-21 07:14:36.92-07
\.


--
-- Data for Name: financial_years; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_years (id, company_id, name, start_date, end_date, is_current, created_at, updated_at) FROM stdin;
f4f629d5-e154-4026-aef1-ef561f27ecf3	11111111-1111-4111-a111-111111111111	FY 2026-2027	2026-04-01 00:00:00-07	2027-03-31 23:59:59-07	t	2026-08-21 07:57:12.4-07	2026-08-21 07:57:12.4-07
\.


--
-- Data for Name: girvi_collaterals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.girvi_collaterals (id, girvi_loan_id, inventory_item_id, item_name, metal_type, purity, gross_weight, stone_weight, net_weight, valued_amount, barcode, rfid_epc, image_url, remarks, created_at, updated_at, is_released, released_at) FROM stdin;
5df82213-1e1f-47e1-9e02-959d20dbbc0f	e6e170e7-2ece-4f2b-852e-8b2f962215a1	\N	24K Gold Bar 20g	GOLD	22K	20.000	0.000	20.000	140000.00	\N	\N	\N	\N	2026-08-21 07:15:56.659-07	2026-08-21 07:15:56.659-07	f	\N
6b7566f2-124d-447f-8c21-c88ef23289bc	d6719e86-ec10-4a16-b075-2bc37f313dd5	9c7c52f6-7fe6-4364-b063-ebeaac2cfc8f	22K Gold Chain 25g	GOLD	22K	25.000	0.000	25.000	140000.00	\N	\N	\N	\N	2026-08-21 07:16:35.924-07	2026-08-21 07:16:36.437-07	t	2026-08-21 07:16:36.436-07
\.


--
-- Data for Name: girvi_collections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.girvi_collections (id, collection_number, girvi_loan_id, payment_method, amount, principal_amount, interest_amount, transaction_reference, collection_date, status, reversal_reason, reversed_at, reversed_by, received_by, remarks, created_at, updated_at) FROM stdin;
ca27a2b1-ffa1-4879-896c-f9fa50bc0b9c	COL-20260821-0001	e6e170e7-2ece-4f2b-852e-8b2f962215a1	CASH	2000.00	2000.00	0.00	\N	2026-08-21 07:15:56.725-07	COMPLETED	\N	\N	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Part interest payment	2026-08-21 07:15:56.729-07	2026-08-21 07:15:56.729-07
4201235e-1b5c-4be6-a03f-b32ce3860fca	COL-20260821-0002	d6719e86-ec10-4a16-b075-2bc37f313dd5	CASH	4000.00	4000.00	0.00	\N	2026-08-21 07:16:36.024-07	REVERSED	Incorrect entry test	2026-08-21 07:16:36.048-07	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Interest collection	2026-08-21 07:16:36.028-07	2026-08-21 07:16:36.051-07
ece3f632-1df0-4526-b4e5-a2c4bf7504fc	COL-20260821-0003	d6719e86-ec10-4a16-b075-2bc37f313dd5	UPI	100000.00	100000.00	0.00	\N	2026-08-21 07:16:36.414-07	COMPLETED	\N	\N	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Full settlement payment	2026-08-21 07:16:36.417-07	2026-08-21 07:16:36.417-07
\.


--
-- Data for Name: girvi_loans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.girvi_loans (id, loan_number, company_id, branch_id, customer_id, status, loan_date, due_date, principal_amount, valuation_amount, interest_rate, interest_period, notes, document_ref, created_by, updated_by, approved_by, approved_at, closed_by, closed_at, cancelled_by, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
e6e170e7-2ece-4f2b-852e-8b2f962215a1	GL-20260821-0001	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	RENEWED	2026-08-21 07:15:56.659-07	2027-02-21 07:15:56.739-08	100000.00	140000.00	2.00	MONTHLY	\N	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:15:56.659-07	2026-08-21 07:15:56.76-07
d6719e86-ec10-4a16-b075-2bc37f313dd5	GL-20260821-0002	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	CLOSED	2026-08-21 07:16:35.924-07	2027-02-21 07:16:36.059-08	100000.00	140000.00	2.00	MONTHLY	\N	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:16:36.479-07	\N	\N	\N	2026-08-21 07:16:35.924-07	2026-08-21 07:16:36.48-07
\.


--
-- Data for Name: girvi_renewals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.girvi_renewals (id, girvi_loan_id, previous_due_date, new_due_date, accrued_interest_at_renewal, principal_at_renewal, interest_paid_at_renewal, renewed_by, remarks, created_at) FROM stdin;
a141f451-4bc6-472d-b4c3-dfecd4058e6c	e6e170e7-2ece-4f2b-852e-8b2f962215a1	2026-06-21 07:15:56.462-07	2027-02-21 07:15:56.739-08	0.00	98000.00	0.00	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Renewed for 6 months	2026-08-21 07:15:56.752-07
66913a40-099e-40a7-b005-31281f2cba57	d6719e86-ec10-4a16-b075-2bc37f313dd5	2026-06-21 07:16:35.733-07	2027-02-21 07:16:36.059-08	0.00	100000.00	0.00	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	Renewed for 6 months	2026-08-21 07:16:36.073-07
\.


--
-- Data for Name: girvi_settlements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.girvi_settlements (id, settlement_number, girvi_loan_id, payment_method, total_settlement_amount, principal_settled, interest_settled, transaction_reference, settlement_date, remarks, settled_by, created_at, updated_at) FROM stdin;
cde490a2-aee3-478b-adc5-8c744e8b4dab	SETTLE-20260821-0001	d6719e86-ec10-4a16-b075-2bc37f313dd5	UPI	100000.00	100000.00	0.00	\N	2026-08-21 07:16:36.425-07	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:16:36.429-07	2026-08-21 07:16:36.429-07
\.


--
-- Data for Name: inventory_item_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_item_images (id, inventory_item_id, image_url, thumbnail_url, alt_text, is_primary, sort_order, created_at, updated_at) FROM stdin;
5feab618-8913-4003-84af-0e84be7a68e3	5c32a406-1533-4d3e-b8b3-fd184da47f2c	https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600	https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600	22K Peacock Antique Gold Ring Stock Tagged Piece	t	0	2026-08-21 07:14:37.756-07	2026-08-21 07:14:37.756-07
59f3a439-0491-4c49-a26a-f7df028333c0	70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600	22K Royal Temple Bridal Choker Necklace Stock Tagged Piece	t	0	2026-08-21 07:14:37.785-07	2026-08-21 07:14:37.785-07
e8d489bb-7760-4d76-a14e-11ab7ff60b34	9c7c52f6-7fe6-4364-b063-ebeaac2cfc8f	https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?w=600	https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?w=600	22K Classic Hollow Rope Gold Chain Stock Tagged Piece	t	0	2026-08-21 07:14:37.794-07	2026-08-21 07:14:37.794-07
37755db6-7142-4b55-b0cb-485dbf3866c2	24807e7e-992a-4946-8dda-89b79542c844	https://images.unsplash.com/photo-1611591475102-4fa1b7765e7e?w=600	https://images.unsplash.com/photo-1611591475102-4fa1b7765e7e?w=600	22K Handcrafted Filigree Gold Kada Stock Tagged Piece	t	0	2026-08-21 07:14:37.804-07	2026-08-21 07:14:37.804-07
deb22739-7921-43e2-9404-cf523e36c4f3	be4e8f1d-b962-400b-b2f1-ae96c8ea6ba3	https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600	https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600	18K Solitaire Diamond Engagement Ring Stock Tagged Piece	t	0	2026-08-21 07:14:37.812-07	2026-08-21 07:14:37.812-07
cc667bcb-916f-4b53-8c7a-fc0f58663db7	c14404b2-9337-40d5-a14c-c68996de647c	https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600	https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600	999 Fine Silver Lakshmi Ganesh 50g Coin Stock Tagged Piece	t	0	2026-08-21 07:14:37.819-07	2026-08-21 07:14:37.819-07
263b36dd-46df-4579-82a4-e3b49c6c3e89	1fab3bf5-3fb7-4875-bc24-ebfc55f2b34c	https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600	https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600	950 Pure Platinum Forever Love Couple Band Stock Tagged Piece	t	0	2026-08-21 07:14:37.826-07	2026-08-21 07:14:37.826-07
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_items (id, company_id, product_id, branch_id, purchase_receipt_item_id, item_code, gross_weight, net_weight, stone_weight, fine_weight, purity, status, created_by, updated_by, created_at, updated_at) FROM stdin;
24807e7e-992a-4946-8dda-89b79542c844	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000004	22222222-2222-4222-a222-222222222221	\N	INV-BNG-00001	26.800	26.800	0.000	24.549	22K	AVAILABLE	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.804-07	2026-08-21 07:14:37.804-07
be4e8f1d-b962-400b-b2f1-ae96c8ea6ba3	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000005	22222222-2222-4222-a222-222222222221	\N	INV-DMD-00001	3.850	3.700	0.150	3.389	18K	AVAILABLE	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.812-07	2026-08-21 07:14:37.812-07
c14404b2-9337-40d5-a14c-c68996de647c	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000007	22222222-2222-4222-a222-222222222221	\N	INV-SLV-00001	50.000	50.000	0.000	45.800	999	AVAILABLE	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.819-07	2026-08-21 07:14:37.819-07
1fab3bf5-3fb7-4875-bc24-ebfc55f2b34c	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000008	22222222-2222-4222-a222-222222222221	\N	INV-PLT-00001	6.250	6.250	0.000	5.725	950	AVAILABLE	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.826-07	2026-08-21 07:14:37.826-07
5c32a406-1533-4d3e-b8b3-fd184da47f2c	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	INV-RNG-00001	5.450	5.450	0.000	4.992	22K	RETURNED_TO_VENDOR	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.756-07	2026-08-21 07:14:39.173-07
70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000002	22222222-2222-4222-a222-222222222221	\N	INV-NCK-00001	38.200	38.200	0.000	34.991	22K	AVAILABLE	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.785-07	2026-08-21 07:15:20.22-07
9c7c52f6-7fe6-4364-b063-ebeaac2cfc8f	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000003	22222222-2222-4222-a222-222222222221	\N	INV-CHN-00001	14.500	14.500	0.000	13.282	22K	AVAILABLE	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	2026-08-21 07:14:37.794-07	2026-08-21 07:16:36.44-07
ffd46571-4a97-4c17-9380-35bd6eebb0aa	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-ITEM-1787299691651-1	10.500	10.000	0.000	9.160	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:11.689-07	2026-08-21 08:08:12.138-07
0cb08f23-70b1-4339-b614-8f436b5f255f	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-ITEM-1787299692188-2A	10.500	10.000	0.000	9.160	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.191-07	2026-08-21 08:08:12.398-07
ae8ed4b6-5e74-4e21-8bdb-29b6c617d8cd	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-ITEM-1787299692199-2B	10.500	10.000	0.000	9.160	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.201-07	2026-08-21 08:08:12.403-07
2ec430fc-0e0a-44f7-b95b-8a71cb2940dd	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-SOLD-1787299692439	10.500	10.000	0.000	9.160	22K	SOLD	\N	\N	2026-08-21 08:08:12.441-07	2026-08-21 08:08:12.441-07
debc2240-3805-4f98-814f-a0cc68d5c1e6	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222222	\N	APP-XBR-1787299692617	10.500	10.000	0.000	9.160	22K	AVAILABLE	\N	\N	2026-08-21 08:08:12.62-07	2026-08-21 08:08:12.62-07
d94d9dfa-84f3-4a73-8674-195049fdc3f6	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-RB-AVAIL-1787299692659	10.500	10.000	0.000	9.160	22K	AVAILABLE	\N	\N	2026-08-21 08:08:12.661-07	2026-08-21 08:08:12.661-07
92b9f462-63e1-4de8-aa00-e707190a1159	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-RB-SOLD-1787299692668	10.500	10.000	0.000	9.160	22K	SOLD	\N	\N	2026-08-21 08:08:12.67-07	2026-08-21 08:08:12.67-07
59705c38-9a6c-4144-98fb-50d8fc29234f	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	APP-RACE-1787299692766	10.500	10.000	0.000	9.160	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.769-07	2026-08-21 08:08:12.89-07
296e8525-b704-41bf-80df-f273efbd53d4	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	TEST-APP-1787299789338	12.000	11.500	0.000	10.530	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:09:49.368-07	2026-08-21 08:09:49.939-07
d6026b3e-e7f3-4ab2-9f3c-fa62dde869d4	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	DEP-ITEM-1787300162909-1	15.000	14.200	0.000	13.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:02.969-07	2026-08-21 08:16:03.437-07
0729dd37-e008-4b1d-a7e5-3176679edee7	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	DEP-ITEM-1787300212701-1	15.000	14.200	0.000	13.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:52.738-07	2026-08-21 08:16:53.277-07
dbfb33b0-a0cf-48cb-ab76-7bbce04c95d6	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	RET-ITEM-1787300665140	20.000	19.100	0.000	17.500	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:25.187-07	2026-08-21 08:24:26.115-07
3199d846-8209-41ce-9da7-b9b80c1f0484	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	PUR-ITEM-1787300666337	20.000	19.100	0.000	17.500	22K	SOLD	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.34-07	2026-08-21 08:24:26.59-07
e31636a0-8fc6-4cf3-add9-e33c92a54723	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	RACE-ITEM-1787300666728	20.000	19.100	0.000	17.500	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.731-07	2026-08-21 08:24:26.852-07
f89f11a0-9b0d-4b2d-a27c-3238f1d9397f	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	RET-ITEM-1787300761487	20.000	19.100	0.000	17.500	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:01.543-07	2026-08-21 08:26:02.469-07
c48b857c-3097-4edd-aa98-51ee9b59f8fd	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	PUR-ITEM-1787300763058	20.000	19.100	0.000	17.500	22K	SOLD	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.062-07	2026-08-21 08:26:03.382-07
a7bfd35c-32e1-4f80-90e2-9739c95fdafc	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	RACE-ITEM-1787300763693	20.000	19.100	0.000	17.500	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.697-07	2026-08-21 08:26:03.928-07
a26e66e0-87e7-4068-b016-efa2074aac85	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-1-1787301439187	25.000	24.000	0.000	22.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:19.278-07	2026-08-21 08:37:20.014-07
7787c368-6244-4102-a576-9c54decd56ae	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-2-1787301440250	25.000	24.000	0.000	22.000	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.258-07	2026-08-21 08:37:20.49-07
6bc93e18-46a1-4cc9-a541-423342649060	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-3-1787301440787	25.000	24.000	0.000	22.000	22K	SOLD	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.793-07	2026-08-21 08:37:21.111-07
d8661ae2-00ef-4b46-bf57-2dc8989ec2f7	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-4-1787301441230	25.000	24.000	0.000	22.000	22K	AVAILABLE	\N	\N	2026-08-21 08:37:21.234-07	2026-08-21 08:37:21.234-07
2ae8e740-3a75-4e14-89c4-a6f80da44035	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-1-1787301602390	25.000	24.000	0.000	22.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:02.486-07	2026-08-21 08:40:03.284-07
70b3a45c-148e-4f3b-aad1-82818f7255b3	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-2-1787301603532	25.000	24.000	0.000	22.000	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:03.536-07	2026-08-21 08:40:03.809-07
800922af-8a0c-4b43-8bdc-42b65710d3c3	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-3-1787301604092	25.000	24.000	0.000	22.000	22K	SOLD	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:04.097-07	2026-08-21 08:40:04.591-07
d178ffd8-2bcf-401d-b470-d449b93053e7	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-4-1787301604845	25.000	24.000	0.000	22.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:04.848-07	2026-08-21 08:40:05.004-07
f8727754-e35f-44b7-b70f-98f5c4bbb7d8	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-1-1787301725891	25.000	24.000	0.000	22.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:05.944-07	2026-08-21 08:42:06.927-07
6c6cabb9-190f-4987-9cfa-f2de2bcee678	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-2-1787301727312	25.000	24.000	0.000	22.000	22K	AVAILABLE	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:07.343-07	2026-08-21 08:42:07.811-07
7114131d-077a-4326-8235-7125ced8bade	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-3-1787301728161	25.000	24.000	0.000	22.000	22K	SOLD	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:08.175-07	2026-08-21 08:42:08.689-07
86b0966e-9cc0-49c3-8dd9-c6a5e837c44d	11111111-1111-4111-a111-111111111111	50000000-0000-4000-a000-000000000001	22222222-2222-4222-a222-222222222221	\N	REP-ITEM-4-1787301728925	25.000	24.000	0.000	22.000	22K	ON_APPROVAL	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:08.928-07	2026-08-21 08:42:09.105-07
\.


--
-- Data for Name: inventory_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_tags (id, inventory_item_id, barcode, rfid_epc, is_active, tagged_at, created_at, updated_at) FROM stdin;
4e75a137-244c-4473-a36e-b5dd066a7585	5c32a406-1533-4d3e-b8b3-fd184da47f2c	BC-RNG-00001	\N	t	2026-08-21 07:14:37.756-07	2026-08-21 07:14:37.756-07	2026-08-21 07:14:37.756-07
e94333d3-8341-4fb3-b6b4-ab4d82ef6bdf	70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	BC-NCK-00001	\N	t	2026-08-21 07:14:37.785-07	2026-08-21 07:14:37.785-07	2026-08-21 07:14:37.785-07
72857961-686f-4323-9ca7-028c43a40a7a	9c7c52f6-7fe6-4364-b063-ebeaac2cfc8f	BC-CHN-00001	\N	t	2026-08-21 07:14:37.794-07	2026-08-21 07:14:37.794-07	2026-08-21 07:14:37.794-07
0cbd85c9-debc-4331-b238-cc39e1b0b866	24807e7e-992a-4946-8dda-89b79542c844	BC-BNG-00001	\N	t	2026-08-21 07:14:37.804-07	2026-08-21 07:14:37.804-07	2026-08-21 07:14:37.804-07
9520eca3-6822-4d1f-a790-d110bde192ab	be4e8f1d-b962-400b-b2f1-ae96c8ea6ba3	BC-DMD-00001	\N	t	2026-08-21 07:14:37.812-07	2026-08-21 07:14:37.812-07	2026-08-21 07:14:37.812-07
7f3e72dc-c50e-46b8-81cd-4a9c555ee26e	c14404b2-9337-40d5-a14c-c68996de647c	BC-SLV-00001	\N	t	2026-08-21 07:14:37.819-07	2026-08-21 07:14:37.819-07	2026-08-21 07:14:37.819-07
d8edf7b2-4d26-40bf-8e2b-f76bbdf71a09	1fab3bf5-3fb7-4875-bc24-ebfc55f2b34c	BC-PLT-00001	\N	t	2026-08-21 07:14:37.826-07	2026-08-21 07:14:37.826-07	2026-08-21 07:14:37.826-07
1e7c07ac-7a9f-4021-b22d-7982b4feb26b	ffd46571-4a97-4c17-9380-35bd6eebb0aa	BC-APP-ITEM-1787299691651-1	\N	t	2026-08-21 08:08:11.689-07	2026-08-21 08:08:11.689-07	2026-08-21 08:08:11.689-07
93ed9573-667a-4b3b-9b2b-d65f5f47c9dd	0cb08f23-70b1-4339-b614-8f436b5f255f	BC-APP-ITEM-1787299692188-2A	\N	t	2026-08-21 08:08:12.191-07	2026-08-21 08:08:12.191-07	2026-08-21 08:08:12.191-07
50027f97-ae3d-4e8b-92c8-7b12093c7788	ae8ed4b6-5e74-4e21-8bdb-29b6c617d8cd	BC-APP-ITEM-1787299692199-2B	\N	t	2026-08-21 08:08:12.201-07	2026-08-21 08:08:12.201-07	2026-08-21 08:08:12.201-07
f04372e8-444b-4bfb-8360-25c6a57ce3e6	2ec430fc-0e0a-44f7-b95b-8a71cb2940dd	BC-APP-SOLD-1787299692439	\N	t	2026-08-21 08:08:12.441-07	2026-08-21 08:08:12.441-07	2026-08-21 08:08:12.441-07
8b32c1e1-5fe6-4ad4-ae43-c31525bf77ca	debc2240-3805-4f98-814f-a0cc68d5c1e6	BC-APP-XBR-1787299692617	\N	t	2026-08-21 08:08:12.62-07	2026-08-21 08:08:12.62-07	2026-08-21 08:08:12.62-07
d33a2699-8f85-47f2-bbfc-ce45a6608ee9	d94d9dfa-84f3-4a73-8674-195049fdc3f6	BC-APP-RB-AVAIL-1787299692659	\N	t	2026-08-21 08:08:12.661-07	2026-08-21 08:08:12.661-07	2026-08-21 08:08:12.661-07
7edb10d1-ea70-40e3-b07c-1d8764eabffc	92b9f462-63e1-4de8-aa00-e707190a1159	BC-APP-RB-SOLD-1787299692668	\N	t	2026-08-21 08:08:12.67-07	2026-08-21 08:08:12.67-07	2026-08-21 08:08:12.67-07
1bab4eb2-3f1e-425b-a910-fe99dba7604a	59705c38-9a6c-4144-98fb-50d8fc29234f	BC-APP-RACE-1787299692766	\N	t	2026-08-21 08:08:12.769-07	2026-08-21 08:08:12.769-07	2026-08-21 08:08:12.769-07
053247a3-dbea-4333-a122-97037023943e	296e8525-b704-41bf-80df-f273efbd53d4	BC-TEST-APP-1787299789338	\N	t	2026-08-21 08:09:49.368-07	2026-08-21 08:09:49.368-07	2026-08-21 08:09:49.368-07
fa243d56-2d17-4f93-bde0-083b640c8af4	d6026b3e-e7f3-4ab2-9f3c-fa62dde869d4	BC-DEP-ITEM-1787300162909-1	\N	t	2026-08-21 08:16:02.969-07	2026-08-21 08:16:02.969-07	2026-08-21 08:16:02.969-07
a7f956c5-3af1-4790-84a7-3f1694828df1	0729dd37-e008-4b1d-a7e5-3176679edee7	BC-DEP-ITEM-1787300212701-1	\N	t	2026-08-21 08:16:52.738-07	2026-08-21 08:16:52.738-07	2026-08-21 08:16:52.738-07
93c09370-a732-4e58-b565-298c7f98acfe	dbfb33b0-a0cf-48cb-ab76-7bbce04c95d6	BC-RET-ITEM-1787300665140	\N	t	2026-08-21 08:24:25.187-07	2026-08-21 08:24:25.187-07	2026-08-21 08:24:25.187-07
45c1d901-0e1c-4269-834c-a000c70a38a4	3199d846-8209-41ce-9da7-b9b80c1f0484	BC-PUR-ITEM-1787300666337	\N	t	2026-08-21 08:24:26.34-07	2026-08-21 08:24:26.34-07	2026-08-21 08:24:26.34-07
99e87ae9-6cf9-4eb4-b364-6424cba6df98	e31636a0-8fc6-4cf3-add9-e33c92a54723	BC-RACE-ITEM-1787300666728	\N	t	2026-08-21 08:24:26.731-07	2026-08-21 08:24:26.731-07	2026-08-21 08:24:26.731-07
cde26865-a89f-4567-bb8b-f09bb1555196	f89f11a0-9b0d-4b2d-a27c-3238f1d9397f	BC-RET-ITEM-1787300761487	\N	t	2026-08-21 08:26:01.543-07	2026-08-21 08:26:01.543-07	2026-08-21 08:26:01.543-07
f46ba5b8-007d-4770-af45-42ac874accf5	c48b857c-3097-4edd-aa98-51ee9b59f8fd	BC-PUR-ITEM-1787300763058	\N	t	2026-08-21 08:26:03.062-07	2026-08-21 08:26:03.062-07	2026-08-21 08:26:03.062-07
274b4f25-d62d-49a1-914f-020da9b3d80c	a7bfd35c-32e1-4f80-90e2-9739c95fdafc	BC-RACE-ITEM-1787300763693	\N	t	2026-08-21 08:26:03.697-07	2026-08-21 08:26:03.697-07	2026-08-21 08:26:03.697-07
8aedeb46-7233-4db2-a35b-31ff41339a19	a26e66e0-87e7-4068-b016-efa2074aac85	BC-REP-ITEM-1-1787301439187	RFID-REP-ITEM-1-1787301439187	t	2026-08-21 08:37:19.278-07	2026-08-21 08:37:19.278-07	2026-08-21 08:37:19.278-07
00a3b5fe-392f-4664-b39f-cee59b8040ab	7787c368-6244-4102-a576-9c54decd56ae	BC-REP-ITEM-2-1787301440250	RFID-REP-ITEM-2-1787301440250	t	2026-08-21 08:37:20.258-07	2026-08-21 08:37:20.258-07	2026-08-21 08:37:20.258-07
4ee86a65-6cf4-4ce6-a250-3a6d7b8c7530	6bc93e18-46a1-4cc9-a541-423342649060	BC-REP-ITEM-3-1787301440787	RFID-REP-ITEM-3-1787301440787	t	2026-08-21 08:37:20.793-07	2026-08-21 08:37:20.793-07	2026-08-21 08:37:20.793-07
13a31b6a-d49e-44ea-819d-1e3ea78d6539	d8661ae2-00ef-4b46-bf57-2dc8989ec2f7	BC-REP-ITEM-4-1787301441230	RFID-REP-ITEM-4-1787301441230	t	2026-08-21 08:37:21.234-07	2026-08-21 08:37:21.234-07	2026-08-21 08:37:21.234-07
5f132fba-ce97-4872-b727-b14f43cad8df	2ae8e740-3a75-4e14-89c4-a6f80da44035	BC-REP-ITEM-1-1787301602390	RFID-REP-ITEM-1-1787301602390	t	2026-08-21 08:40:02.486-07	2026-08-21 08:40:02.486-07	2026-08-21 08:40:02.486-07
eb69eff4-a25f-4cba-be47-5e5049fe7f87	70b3a45c-148e-4f3b-aad1-82818f7255b3	BC-REP-ITEM-2-1787301603532	RFID-REP-ITEM-2-1787301603532	t	2026-08-21 08:40:03.536-07	2026-08-21 08:40:03.536-07	2026-08-21 08:40:03.536-07
1d8749e0-9c4b-4942-b0f9-924bf9497524	800922af-8a0c-4b43-8bdc-42b65710d3c3	BC-REP-ITEM-3-1787301604092	RFID-REP-ITEM-3-1787301604092	t	2026-08-21 08:40:04.097-07	2026-08-21 08:40:04.097-07	2026-08-21 08:40:04.097-07
01ee7cfd-1671-40f8-b8dd-c4ce8c63c9eb	d178ffd8-2bcf-401d-b470-d449b93053e7	BC-REP-ITEM-4-1787301604845	RFID-REP-ITEM-4-1787301604845	t	2026-08-21 08:40:04.848-07	2026-08-21 08:40:04.848-07	2026-08-21 08:40:04.848-07
9c555cde-f139-4f6e-a074-7cb0041e96e8	f8727754-e35f-44b7-b70f-98f5c4bbb7d8	BC-REP-ITEM-1-1787301725891	RFID-REP-ITEM-1-1787301725891	t	2026-08-21 08:42:05.944-07	2026-08-21 08:42:05.944-07	2026-08-21 08:42:05.944-07
8435e57f-f278-4327-affa-ab8f16acb3a9	6c6cabb9-190f-4987-9cfa-f2de2bcee678	BC-REP-ITEM-2-1787301727312	RFID-REP-ITEM-2-1787301727312	t	2026-08-21 08:42:07.343-07	2026-08-21 08:42:07.343-07	2026-08-21 08:42:07.343-07
ded33b0a-9446-4fea-b665-c13325eca024	7114131d-077a-4326-8235-7125ced8bade	BC-REP-ITEM-3-1787301728161	RFID-REP-ITEM-3-1787301728161	t	2026-08-21 08:42:08.175-07	2026-08-21 08:42:08.175-07	2026-08-21 08:42:08.175-07
b56bff38-8515-4c86-aae0-5b332574a24f	86b0966e-9cc0-49c3-8dd9-c6a5e837c44d	BC-REP-ITEM-4-1787301728925	RFID-REP-ITEM-4-1787301728925	t	2026-08-21 08:42:08.928-07	2026-08-21 08:42:08.928-07	2026-08-21 08:42:08.928-07
\.


--
-- Data for Name: inventory_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transfers (id, transfer_code, inventory_item_id, from_branch_id, to_branch_id, status, requested_by, approved_by, approved_at, dispatched_by, dispatched_at, received_by, received_at, rejected_by, rejected_at, rejection_reason, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_work_material_issues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_work_material_issues (id, job_work_order_id, item_type, inventory_item_id, description, gross_weight, stone_weight, net_weight, purity, fine_weight, issued_at, issued_by, created_at, updated_at) FROM stdin;
299ae064-5843-44ff-bbde-5a1723a0f4b9	b9fe7436-704d-4846-b7dd-18981c5e5393	RAW_METAL	\N	24K Gold Bullion Issue	50.000	0.000	50.000	999	50.000	2026-08-21 07:14:39.218-07	\N	2026-08-21 07:14:39.219-07	2026-08-21 07:14:39.219-07
\.


--
-- Data for Name: job_work_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_work_orders (id, order_number, company_id, branch_id, vendor_id, status, issue_date, expected_delivery_date, completed_at, target_item_name, metal_type, purity, agreed_wastage_percent, agreed_making_charge_per_gram, total_issued_fine_weight, total_received_fine_weight, total_wastage_weight, total_making_charges, notes, created_by, updated_by, submitted_by, submitted_at, assigned_by, assigned_at, completed_by, cancelled_by, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
b9fe7436-704d-4846-b7dd-18981c5e5393	JW-SEED-20260820-0001	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	1b842ebf-20a1-4838-8c39-1c10290723e7	COMPLETED	2026-08-21 07:14:39.211-07	\N	2026-08-21 07:14:39.211-07	Seed 22K Handmade Gold Bangles	GOLD	22K	1.50	350.00	50.000	49.000	0.750	17150.00	Sample seed job work order for handmade bangle crafting	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:14:39.213-07	2026-08-21 07:14:39.213-07
\.


--
-- Data for Name: job_work_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_work_receipts (id, receipt_number, job_work_order_id, inventory_item_id, item_name, gross_weight, stone_weight, net_weight, purity, fine_weight, actual_wastage_weight, making_charges, received_at, received_by, remarks, created_at, updated_at) FROM stdin;
adc3f566-5ad0-4aa6-883f-b604227cbdc1	JWR-SEED-20260820-0001	b9fe7436-704d-4846-b7dd-18981c5e5393	\N	Seed 22K Handmade Gold Bangles	49.500	0.500	49.000	22K	49.000	0.750	17150.00	2026-08-21 07:14:39.226-07	\N	Sample seed job work receipt	2026-08-21 07:14:39.227-07	2026-08-21 07:14:39.227-07
\.


--
-- Data for Name: making_charges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.making_charges (id, company_id, metal_type, purity, charge_type, rate, effective_from, effective_to, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
03ac724e-2403-4d0b-911b-2b3f46e02cba	11111111-1111-4111-a111-111111111111	GOLD	22K	PER_GRAM	450.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.329-07	2026-08-21 07:14:39.329-07
5e2d82bf-92de-4075-8290-d74eb9501aa2	11111111-1111-4111-a111-111111111111	GOLD	18K	PER_GRAM	400.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.335-07	2026-08-21 07:14:39.335-07
b5a437c3-1047-4dee-9170-0c0bc437a00a	11111111-1111-4111-a111-111111111111	GOLD	14K	PER_GRAM	350.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.338-07	2026-08-21 07:14:39.338-07
5a0b2819-c63a-44db-a78c-a5ee7563c912	11111111-1111-4111-a111-111111111111	SILVER	999	PER_GRAM	15.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.343-07	2026-08-21 07:14:39.343-07
b7c62966-e873-4c01-b59b-c3cf5b2138a1	11111111-1111-4111-a111-111111111111	SILVER	925	PER_GRAM	25.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.348-07	2026-08-21 07:14:39.348-07
cd8b842f-eb2c-4265-ab06-91f54bfaadbf	11111111-1111-4111-a111-111111111111	PLATINUM	950	PER_GRAM	550.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.353-07	2026-08-21 07:14:39.353-07
\.


--
-- Data for Name: metal_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.metal_rates (id, company_id, metal_type, purity, market_rate_per_gram, rate_per_gram, effective_from, effective_to, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
812b3e05-cf1d-4b22-847a-a5ebaa4b69db	11111111-1111-4111-a111-111111111111	GOLD	24K	14900.00	15500.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.294-07	2026-08-21 07:14:39.294-07
88a4bd1a-d69c-46b9-8224-dad4cc9ba999	11111111-1111-4111-a111-111111111111	GOLD	22K	13700.00	14250.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.298-07	2026-08-21 07:14:39.298-07
9ae6ee82-6ab2-477f-94a2-83e051ef7f45	11111111-1111-4111-a111-111111111111	GOLD	18K	11150.00	11600.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.302-07	2026-08-21 07:14:39.302-07
4c0ff6ab-5efb-422f-a97c-66c7b9a46dc1	11111111-1111-4111-a111-111111111111	GOLD	14K	8650.00	9000.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.305-07	2026-08-21 07:14:39.305-07
4ad988cf-bf73-433e-8389-dad70301107e	11111111-1111-4111-a111-111111111111	SILVER	999	148.00	155.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.31-07	2026-08-21 07:14:39.31-07
1cb6976f-2236-409d-8875-e11bb4078e44	11111111-1111-4111-a111-111111111111	SILVER	925	136.00	142.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.313-07	2026-08-21 07:14:39.313-07
806ccbb5-bfe5-40c5-9cd4-32a796bd2a0b	11111111-1111-4111-a111-111111111111	PLATINUM	950	6250.00	6500.00	2026-08-20 07:14:39.283-07	\N	t	\N	\N	2026-08-21 07:14:39.318-07	2026-08-21 07:14:39.318-07
286ca9a6-f4d0-4f87-bdf7-0e285196b625	04e9bd01-0b04-48d0-b149-606dcdb1350a	GOLD	24K	\N	7450.00	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.48-07	2026-08-21 09:14:49.48-07
6d812ee0-4976-495c-abad-2bffca3b4de7	04e9bd01-0b04-48d0-b149-606dcdb1350a	GOLD	22K	\N	6830.00	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.488-07	2026-08-21 09:14:49.488-07
0500d7c9-2c0a-4bd4-bcf4-e2ba88918c99	04e9bd01-0b04-48d0-b149-606dcdb1350a	GOLD	18K	\N	5590.00	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.494-07	2026-08-21 09:14:49.494-07
136a5d71-c571-4f84-9524-ad43d8c131a2	04e9bd01-0b04-48d0-b149-606dcdb1350a	GOLD	14K	\N	4350.00	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.502-07	2026-08-21 09:14:49.502-07
2a4c7633-43cb-4a8e-9623-03f21e39dd08	04e9bd01-0b04-48d0-b149-606dcdb1350a	SILVER	999	\N	89.00	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.509-07	2026-08-21 09:14:49.509-07
cb7d3f90-9c11-4708-b20d-3b69739e7f9b	04e9bd01-0b04-48d0-b149-606dcdb1350a	SILVER	925	\N	82.50	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.521-07	2026-08-21 09:14:49.521-07
58acfd00-6487-48a0-b48e-1cd5c7dc8526	04e9bd01-0b04-48d0-b149-606dcdb1350a	PLATINUM	950	\N	3250.00	2026-08-21 09:14:49.45-07	\N	t	79db14f1-bcd7-441a-8a69-a3f37634b21c	\N	2026-08-21 09:14:49.53-07	2026-08-21 09:14:49.53-07
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_categories (id, company_id, name, code, description, is_active, created_at, updated_at) FROM stdin;
33333333-3333-4333-a333-333333333331	11111111-1111-4111-a111-111111111111	Gold Jewellery	CAT-GOLD	Hallmarked 22K, 18K, and 14K Gold Ornaments & Jewellery Articles	t	2026-08-21 07:14:36.927-07	2026-08-21 07:14:36.927-07
33333333-3333-4333-a333-333333333332	11111111-1111-4111-a111-111111111111	Diamond Jewellery	CAT-DIAMOND	IGI/GIA Certified Solitaire and Studded Diamond Jewellery	t	2026-08-21 07:14:36.932-07	2026-08-21 07:14:36.932-07
33333333-3333-4333-a333-333333333333	11111111-1111-4111-a111-111111111111	Silver Articles & Jewellery	CAT-SILVER	999 Fine Silver Bullion Coins, 925 Sterling Silver Ornaments & Utensils	t	2026-08-21 07:14:36.934-07	2026-08-21 07:14:36.934-07
33333333-3333-4333-a333-333333333334	11111111-1111-4111-a111-111111111111	Platinum Collection	CAT-PLATINUM	PGI Certified 950 Pure Platinum Couple Bands, Chains, and Pendants	t	2026-08-21 07:14:36.935-07	2026-08-21 07:14:36.935-07
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, image_url, thumbnail_url, alt_text, is_primary, sort_order, created_at, updated_at) FROM stdin;
3282ab8c-acc0-48dd-8b82-e922430d4870	50000000-0000-4000-a000-000000000001	https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80	22K Peacock Antique Gold Ring	t	0	2026-08-21 07:14:36.982-07	2026-08-21 07:14:36.982-07
f43deb47-094e-409b-b5e1-f94a8c396123	50000000-0000-4000-a000-000000000002	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80	22K Royal Temple Bridal Choker Necklace	t	0	2026-08-21 07:14:36.992-07	2026-08-21 07:14:36.992-07
2b59cc96-66f8-42f2-af2b-9fdad0b44231	50000000-0000-4000-a000-000000000003	https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?w=800&auto=format&fit=crop&q=80	22K Classic Hollow Rope Gold Chain	t	0	2026-08-21 07:14:37.002-07	2026-08-21 07:14:37.002-07
4db1c3f9-a63f-401d-9b6a-471a8f10aba4	50000000-0000-4000-a000-000000000004	https://images.unsplash.com/photo-1611591475102-4fa1b7765a7e?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1611591475102-4fa1b7765a7e?w=800&auto=format&fit=crop&q=80	22K Handcrafted Filigree Gold Kada	t	0	2026-08-21 07:14:37.01-07	2026-08-21 07:14:37.01-07
55015d8a-5c0b-487c-a7b9-644fecee7c7f	50000000-0000-4000-a000-000000000005	https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80	18K Solitaire Diamond Engagement Ring	t	0	2026-08-21 07:14:37.017-07	2026-08-21 07:14:37.017-07
ef5ce9ee-9f21-4229-870e-595cacca3686	50000000-0000-4000-a000-000000000006	https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80	18K Floral Diamond Stud Earrings	t	0	2026-08-21 07:14:37.023-07	2026-08-21 07:14:37.023-07
e95cc3a4-9b32-44bf-9a15-1dfbeaa04ef6	50000000-0000-4000-a000-000000000007	https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80	999 Fine Silver Lakshmi Ganesh 50g Coin	t	0	2026-08-21 07:14:37.028-07	2026-08-21 07:14:37.028-07
ab8ebcd3-2ad0-4fff-9092-c78387f29ce1	50000000-0000-4000-a000-000000000008	https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80	https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80	950 Pure Platinum Forever Love Couple Band	t	0	2026-08-21 07:14:37.034-07	2026-08-21 07:14:37.034-07
\.


--
-- Data for Name: product_sub_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_sub_categories (id, company_id, category_id, name, code, description, is_active, created_at, updated_at) FROM stdin;
44444444-4444-4444-a444-444444444441	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333331	Gold Rings	SUBCAT-GOLD-RNG	Ladies & Gents 22K/18K Gold Designer Rings	t	2026-08-21 07:14:36.942-07	2026-08-21 07:14:36.942-07
44444444-4444-4444-a444-444444444442	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333331	Gold Necklaces	SUBCAT-GOLD-NCK	Bridal Chokers, Temple Haar, and Lightweight Gold Necklaces	t	2026-08-21 07:14:36.946-07	2026-08-21 07:14:36.946-07
44444444-4444-4444-a444-444444444443	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333331	Gold Chains	SUBCAT-GOLD-CHN	Daily Wear Hollow & Solid Machine-Made Gold Chains	t	2026-08-21 07:14:36.95-07	2026-08-21 07:14:36.95-07
44444444-4444-4444-a444-444444444444	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333331	Gold Bangles & Kadas	SUBCAT-GOLD-BNG	Antique Finished & Die-Cast Gold Bangles and Kadas	t	2026-08-21 07:14:36.952-07	2026-08-21 07:14:36.952-07
44444444-4444-4444-a444-444444444445	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333332	Diamond Solitaire Rings	SUBCAT-DMD-RNG	18K White/Rose/Yellow Gold Diamond Engagement Rings	t	2026-08-21 07:14:36.955-07	2026-08-21 07:14:36.955-07
44444444-4444-4444-a444-444444444446	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333332	Diamond Stud Earrings	SUBCAT-DMD-ERG	Solitaire & Cluster Diamond Tops & Drop Earrings	t	2026-08-21 07:14:36.96-07	2026-08-21 07:14:36.96-07
44444444-4444-4444-a444-444444444447	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333333	Silver Coins & Bars	SUBCAT-SLV-COIN	999 Pure Silver Religious Coins and Investment Bullion Bars	t	2026-08-21 07:14:36.964-07	2026-08-21 07:14:36.964-07
44444444-4444-4444-a444-444444444448	11111111-1111-4111-a111-111111111111	33333333-3333-4333-a333-333333333334	Platinum Couple Bands	SUBCAT-PLT-BND	950 Pure Platinum Wedding & Anniversary Rings	t	2026-08-21 07:14:36.968-07	2026-08-21 07:14:36.968-07
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, company_id, sub_category_id, sku, name, description, metal_type, purity, gross_weight, net_weight, is_active, created_at, updated_at) FROM stdin;
50000000-0000-4000-a000-000000000001	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444441	SKU-GOLD-RNG-22K-001	22K Peacock Antique Gold Ring	Handcrafted traditional Peacock motif gold ring with Meenakari enamel accents	GOLD	22K	5.450	5.450	t	2026-08-21 07:14:36.973-07	2026-08-21 07:14:36.973-07
50000000-0000-4000-a000-000000000002	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444442	SKU-GOLD-NCK-22K-002	22K Royal Temple Bridal Choker Necklace	Magnificent 22K temple jewellery choker necklace crafted with Lakshmi Goddess engravings and cluster bead hangings	GOLD	22K	38.200	38.200	t	2026-08-21 07:14:36.987-07	2026-08-21 07:14:36.987-07
50000000-0000-4000-a000-000000000003	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444443	SKU-GOLD-CHN-22K-003	22K Classic Hollow Rope Gold Chain	22-inch Italian cut daily wear hollow rope design gold chain with lobster claw lock	GOLD	22K	14.500	14.500	t	2026-08-21 07:14:36.997-07	2026-08-21 07:14:36.997-07
50000000-0000-4000-a000-000000000004	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444444	SKU-GOLD-BNG-22K-004	22K Handcrafted Filigree Gold Kada	Openable screw-style royal gold kada with intricate floral filigree craftsmanship	GOLD	22K	26.800	26.800	t	2026-08-21 07:14:37.006-07	2026-08-21 07:14:37.006-07
50000000-0000-4000-a000-000000000005	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444445	SKU-DMD-RNG-18K-005	18K Solitaire Diamond Engagement Ring	0.75 Carat round brilliant cut VVS1-EF certified diamond mounted on 18K white gold prong setting	GOLD	18K	3.850	3.700	t	2026-08-21 07:14:37.014-07	2026-08-21 07:14:37.014-07
50000000-0000-4000-a000-000000000006	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444446	SKU-DMD-ERG-18K-006	18K Floral Diamond Stud Earrings	Pair of floral cluster diamond stud earrings with 0.50 ctw brilliant cut diamonds in 18K rose gold	GOLD	18K	4.200	4.100	t	2026-08-21 07:14:37.02-07	2026-08-21 07:14:37.02-07
50000000-0000-4000-a000-000000000007	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444447	SKU-SLV-COIN-999-007	999 Fine Silver Lakshmi Ganesh 50g Coin	99.9% fine silver festive gift coin minted with embossed Lord Ganesha and Goddess Lakshmi icons	SILVER	999	50.000	50.000	t	2026-08-21 07:14:37.026-07	2026-08-21 07:14:37.026-07
50000000-0000-4000-a000-000000000008	11111111-1111-4111-a111-111111111111	44444444-4444-4444-a444-444444444448	SKU-PLT-BND-950-008	950 Pure Platinum Forever Love Couple Band	Sleek matte and high-polish dual-finish 950 platinum wedding band with single hidden diamond	PLATINUM	950	6.250	6.250	t	2026-08-21 07:14:37.031-07	2026-08-21 07:14:37.031-07
\.


--
-- Data for Name: purchase_bill_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_bill_items (id, purchase_bill_id, purchase_order_item_id, purchase_receipt_item_id, inventory_item_id, item_name, description, quantity, gross_weight, stone_weight, net_weight, purchase_rate, metal_value, making_charges, discount_amount, taxable_amount, tax_rate, tax_amount, line_total, created_at, updated_at) FROM stdin;
baa315d6-9362-42ac-b2db-fcd15a29c68e	c2116caa-993d-4484-9cf0-21f9e73d0351	e6b6e75d-a4e9-49d8-8b61-0b8685dbed5e	46c7aa00-1e63-4c5a-a080-950f12b8fd5f	\N	22K Gold Seed Bangle	\N	3	30.000	1.200	28.800	2000.00	57600.00	2400.00	0.00	60000.00	3.00	1800.00	61800.00	2026-08-21 07:14:39.067-07	2026-08-21 07:14:39.067-07
\.


--
-- Data for Name: purchase_bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_bills (id, bill_number, purchase_order_id, vendor_id, branch_id, status, bill_date, due_date, subtotal, discount_amount, tax_amount, grand_total, total_paid, outstanding_amount, notes, created_by, updated_by, submitted_by, submitted_at, approved_by, approved_at, cancelled_by, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
c2116caa-993d-4484-9cf0-21f9e73d0351	PB-SEED-20260820-0001	4b614291-231c-4ba0-8aed-053b295e10f4	1b842ebf-20a1-4838-8c39-1c10290723e7	22222222-2222-4222-a222-222222222221	PARTIALLY_PAID	2026-08-21 07:14:39.067-07	\N	60000.00	0.00	1800.00	61800.00	10000.00	51800.00	Idempotent seed purchase bill for partial billing intake	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:14:39.067-07	2026-08-21 07:14:39.134-07
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, metal_type, purity, item_name, description, ordered_quantity, received_quantity, gross_weight, net_weight, stone_weight, expected_rate, making_charges, tax_rate, tax_amount, item_total, created_at, updated_at) FROM stdin;
e6b6e75d-a4e9-49d8-8b61-0b8685dbed5e	4b614291-231c-4ba0-8aed-053b295e10f4	50000000-0000-4000-a000-000000000001	GOLD	22K	22K Gold Seed Bangle	\N	5	5	50.000	48.000	2.000	20000.00	0.00	3.00	3000.00	103000.00	2026-08-21 07:14:38.939-07	2026-08-21 07:14:38.939-07
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, purchase_order_number, vendor_id, branch_id, status, order_date, expected_delivery_date, subtotal, tax_amount, grand_total, notes, terms_conditions, created_by, updated_by, submitted_by, submitted_at, approved_by, approved_at, cancelled_by, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
4b614291-231c-4ba0-8aed-053b295e10f4	PO-SEED-20260820-0001	1b842ebf-20a1-4838-8c39-1c10290723e7	22222222-2222-4222-a222-222222222221	COMPLETED	2026-08-21 07:14:38.939-07	\N	100000.00	3000.00	103000.00	Sample Seed Purchase Order for Billing	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:14:38.939-07	2026-08-21 07:14:38.939-07
\.


--
-- Data for Name: purchase_receipt_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_receipt_items (id, purchase_receipt_id, product_id, received_quantity, gross_weight, net_weight, stone_weight, fine_weight, purchase_rate, making_charges, tax_rate, tax_amount, item_total, created_at, updated_at) FROM stdin;
46c7aa00-1e63-4c5a-a080-950f12b8fd5f	96efbc21-0d77-48f2-b8ca-4a48179d4151	50000000-0000-4000-a000-000000000001	5	50.000	48.000	2.000	44.000	20000.00	0.00	3.00	3000.00	103000.00	2026-08-21 07:14:38.966-07	2026-08-21 07:14:38.966-07
\.


--
-- Data for Name: purchase_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_receipts (id, purchase_receipt_number, purchase_order_id, status, received_date, subtotal, tax_amount, grand_total, remarks, created_at, updated_at) FROM stdin;
96efbc21-0d77-48f2-b8ca-4a48179d4151	PR-SEED-20260820-0001	4b614291-231c-4ba0-8aed-053b295e10f4	RECEIVED	2026-08-21 07:14:38.966-07	100000.00	3000.00	103000.00	Seed physical intake	2026-08-21 07:14:38.966-07	2026-08-21 07:14:38.966-07
\.


--
-- Data for Name: purchase_return_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_return_items (id, purchase_return_id, purchase_bill_item_id, inventory_item_id, item_name, description, quantity, gross_weight, stone_weight, net_weight, purchase_rate, metal_value, making_charges, tax_rate, tax_amount, line_total, created_at, updated_at) FROM stdin;
0dad6d99-2ce1-45ec-8f54-83b68392b0c8	2cb5c403-284a-4b2b-a0f0-85006381d8dc	\N	5c32a406-1533-4d3e-b8b3-fd184da47f2c	Defective 22K Gold Chain	\N	1	10.000	0.500	9.500	6000.00	57000.00	1000.00	3.00	1740.00	59740.00	2026-08-21 07:14:39.161-07	2026-08-21 07:14:39.161-07
\.


--
-- Data for Name: purchase_returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_returns (id, return_number, purchase_bill_id, purchase_order_id, vendor_id, branch_id, status, return_date, reason, notes, subtotal, tax_amount, total_return_amount, created_by, updated_by, submitted_by, submitted_at, approved_by, approved_at, processed_by, processed_at, cancelled_by, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
2cb5c403-284a-4b2b-a0f0-85006381d8dc	PR-SEED-20260820-0001	\N	\N	1b842ebf-20a1-4838-8c39-1c10290723e7	22222222-2222-4222-a222-222222222221	PROCESSED	2026-08-21 07:14:39.158-07	DEFECTIVE_CLASP	Sample seed purchase return for defective gold chain	58000.00	1740.00	59740.00	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:14:39.158-07	\N	\N	\N	2026-08-21 07:14:39.161-07	2026-08-21 07:14:39.161-07
\.


--
-- Data for Name: sales_invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoice_items (id, sales_invoice_id, inventory_item_id, quantity, unit_price, metal_value, wastage_percent, wastage_weight, wastage_value, making_charge_type, making_charge_rate, making_charge_amount, taxable_amount, tax_rate, discount_amount, tax_amount, line_total, created_at, updated_at, product_name_snapshot, product_sku_snapshot, metal_type_snapshot, purity_snapshot, gross_weight_snapshot, net_weight_snapshot, stone_weight_snapshot, fine_weight_snapshot) FROM stdin;
6f84d05c-fd2b-4594-b116-3c5d73af250e	fed46839-f2ee-4648-96ea-cf53c8ff7a82	3199d846-8209-41ce-9da7-b9b80c1f0484	1	100000.00	0.00	0.00	0.000	0.00	\N	0.00	0.00	100000.00	3.00	0.00	3000.00	103000.00	2026-08-21 08:24:26.621-07	2026-08-21 08:24:26.621-07	22K Peacock Antique Gold Ring	\N	GOLD	22K	\N	\N	\N	\N
570a676d-2008-4af9-b23e-0a2166219644	24b545e8-f3dd-4794-a1d6-eab43be3e491	c48b857c-3097-4edd-aa98-51ee9b59f8fd	1	100000.00	0.00	0.00	0.000	0.00	\N	0.00	0.00	100000.00	3.00	0.00	3000.00	103000.00	2026-08-21 08:26:03.485-07	2026-08-21 08:26:03.485-07	22K Peacock Antique Gold Ring	\N	GOLD	22K	\N	\N	\N	\N
1ae964b7-42d2-4653-a540-76d4334dade5	51d76463-08b2-4108-a22e-c7e95c97a5a6	6bc93e18-46a1-4cc9-a541-423342649060	1	90000.00	0.00	0.00	0.000	0.00	\N	0.00	0.00	90000.00	3.00	0.00	2700.00	92700.00	2026-08-21 08:37:21.156-07	2026-08-21 08:37:21.156-07	22K Peacock Antique Gold Ring	\N	GOLD	22K	\N	\N	\N	\N
1d315626-5ec3-4650-88a4-40ecb96cff77	d7f44d67-c8f6-4e5b-8cb4-b4297cec4124	800922af-8a0c-4b43-8bdc-42b65710d3c3	1	90000.00	0.00	0.00	0.000	0.00	\N	0.00	0.00	90000.00	3.00	0.00	2700.00	92700.00	2026-08-21 08:40:04.732-07	2026-08-21 08:40:04.732-07	22K Peacock Antique Gold Ring	\N	GOLD	22K	\N	\N	\N	\N
2e7ffc65-f903-478e-bfc9-e4693926a778	83bd15ef-bbea-4b60-a7dd-fdba52e65bd0	7114131d-077a-4326-8235-7125ced8bade	1	90000.00	0.00	0.00	0.000	0.00	\N	0.00	0.00	90000.00	3.00	0.00	2700.00	92700.00	2026-08-21 08:42:08.758-07	2026-08-21 08:42:08.758-07	22K Peacock Antique Gold Ring	\N	GOLD	22K	\N	\N	\N	\N
\.


--
-- Data for Name: sales_invoice_metal_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoice_metal_rates (id, sales_invoice_id, metal_rate_id, metal_type, purity, rate_per_gram, locked_at, created_at) FROM stdin;
\.


--
-- Data for Name: sales_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoices (id, invoice_number, customer_id, branch_id, salesperson_id, status, invoice_date, subtotal, metal_value, wastage_value, making_charges, taxable_amount, discount_amount, cgst_amount, sgst_amount, igst_amount, tax_amount, grand_total, pricing_calculated, pricing_calculated_at, notes, created_by_user_id, updated_by_user_id, metal_rate_locked, metal_rate_locked_at, total_paid, outstanding_amount, payment_status, exchange_credit, created_at, updated_at, company_name_snapshot, company_gst_snapshot, company_address_snapshot, branch_name_snapshot, branch_address_snapshot, customer_name_snapshot, customer_mobile_snapshot, customer_address_snapshot, customer_gst_snapshot) FROM stdin;
fed46839-f2ee-4648-96ea-cf53c8ff7a82	INV-20260821-0001	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	22222222-2222-4222-a222-222222222221	\N	CONFIRMED	2026-08-21 08:24:26.615-07	100000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	3000.00	103000.00	t	2026-08-21 08:24:26.615-07	Converted from Approval #APP-00016 | Customer confirmed purchase	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	t	2026-08-21 08:24:26.615-07	40000.00	63000.00	PARTIAL	0.00	2026-08-21 08:24:26.621-07	2026-08-21 08:24:26.669-07	Tanisha Heritage Jewels Pvt Ltd	\N	\N	Connaught Place Flagship Showroom	\N	Priya Sharma	9811223344	\N	\N
24b545e8-f3dd-4794-a1d6-eab43be3e491	INV-20260821-0002	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	22222222-2222-4222-a222-222222222221	\N	CONFIRMED	2026-08-21 08:26:03.46-07	100000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	3000.00	103000.00	t	2026-08-21 08:26:03.46-07	Converted from Approval #APP-00019 | Customer confirmed purchase	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	t	2026-08-21 08:26:03.46-07	40000.00	63000.00	PARTIAL	0.00	2026-08-21 08:26:03.485-07	2026-08-21 08:26:03.545-07	Tanisha Heritage Jewels Pvt Ltd	\N	\N	Connaught Place Flagship Showroom	\N	Priya Sharma	9811223344	\N	\N
51d76463-08b2-4108-a22e-c7e95c97a5a6	INV-20260821-0003	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	22222222-2222-4222-a222-222222222221	\N	CONFIRMED	2026-08-21 08:37:21.147-07	90000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2700.00	92700.00	t	2026-08-21 08:37:21.147-07	Converted from Approval #APP-00023 | Purchased for wedding	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	t	2026-08-21 08:37:21.147-07	30000.00	62700.00	PARTIAL	0.00	2026-08-21 08:37:21.156-07	2026-08-21 08:37:21.205-07	Tanisha Heritage Jewels Pvt Ltd	\N	\N	Connaught Place Flagship Showroom	\N	Priya Sharma	9811223344	\N	\N
d7f44d67-c8f6-4e5b-8cb4-b4297cec4124	INV-20260821-0004	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	22222222-2222-4222-a222-222222222221	\N	CONFIRMED	2026-08-21 08:40:04.707-07	90000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2700.00	92700.00	t	2026-08-21 08:40:04.707-07	Converted from Approval #APP-00026 | Purchased for wedding	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	t	2026-08-21 08:40:04.707-07	30000.00	62700.00	PARTIAL	0.00	2026-08-21 08:40:04.732-07	2026-08-21 08:40:04.797-07	Tanisha Heritage Jewels Pvt Ltd	\N	\N	Connaught Place Flagship Showroom	\N	Priya Sharma	9811223344	\N	\N
83bd15ef-bbea-4b60-a7dd-fdba52e65bd0	INV-20260821-0005	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	22222222-2222-4222-a222-222222222221	\N	CONFIRMED	2026-08-21 08:42:08.728-07	90000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2700.00	92700.00	t	2026-08-21 08:42:08.728-07	Converted from Approval #APP-00030 | Purchased for wedding	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	t	2026-08-21 08:42:08.728-07	30000.00	62700.00	PARTIAL	0.00	2026-08-21 08:42:08.758-07	2026-08-21 08:42:08.885-07	Tanisha Heritage Jewels Pvt Ltd	\N	\N	Connaught Place Flagship Showroom	\N	Priya Sharma	9811223344	\N	\N
\.


--
-- Data for Name: sales_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_payments (id, sales_invoice_id, payment_number, payment_method, amount, status, transaction_reference, payment_date, remarks, received_by, reversed_at, reversed_by, reversal_reason, created_at, updated_at) FROM stdin;
4ff98d24-0d57-4527-b357-d8ec13d85e52	fed46839-f2ee-4648-96ea-cf53c8ff7a82	PAY-DEP-1787300666659-1	UPI	40000.00	COMPLETED	\N	2026-08-21 08:24:26.661-07	Applied security deposit from Approval APP-00016	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:24:26.661-07	2026-08-21 08:24:26.661-07
a912e784-048e-4334-8bbc-474f8c5a6348	24b545e8-f3dd-4794-a1d6-eab43be3e491	PAY-DEP-1787300763534-1	UPI	40000.00	COMPLETED	\N	2026-08-21 08:26:03.537-07	Applied security deposit from Approval APP-00019	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:26:03.537-07	2026-08-21 08:26:03.537-07
c6fa2d46-d964-4f76-8aa1-c11988aefa0b	51d76463-08b2-4108-a22e-c7e95c97a5a6	PAY-DEP-1787301441195-1	CASH	30000.00	COMPLETED	\N	2026-08-21 08:37:21.197-07	Applied security deposit from Approval APP-00023	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:37:21.197-07	2026-08-21 08:37:21.197-07
6da0efb0-c462-4f2d-b8ac-43c7880aafb2	d7f44d67-c8f6-4e5b-8cb4-b4297cec4124	PAY-DEP-1787301604782-1	CASH	30000.00	COMPLETED	\N	2026-08-21 08:40:04.785-07	Applied security deposit from Approval APP-00026	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:40:04.785-07	2026-08-21 08:40:04.785-07
c9c67f48-31b3-4548-85e1-c396ded8f331	83bd15ef-bbea-4b60-a7dd-fdba52e65bd0	PAY-DEP-1787301728868-1	CASH	30000.00	COMPLETED	\N	2026-08-21 08:42:08.876-07	Applied security deposit from Approval APP-00030	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	2026-08-21 08:42:08.876-07	2026-08-21 08:42:08.876-07
\.


--
-- Data for Name: sales_refunds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_refunds (id, sales_return_id, refund_number, refund_method, amount, status, transaction_reference, remarks, processed_by, reversed_at, reversed_by, reversal_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sales_return_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_return_items (id, sales_return_id, sales_invoice_item_id, inventory_item_id, quantity, original_amount, tax_amount, deduction_amount, refund_amount, reason, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sales_returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_returns (id, return_number, sales_invoice_id, customer_id, branch_id, status, subtotal, tax_amount, deduction_amount, refund_amount, reason, remarks, requested_by, approved_by, processed_by, cancelled_by, approved_at, processed_at, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_adjustments (id, inventory_item_id, branch_id, previous_status, new_status, previous_gross_weight, new_gross_weight, previous_net_weight, new_net_weight, reason, adjusted_by, created_at) FROM stdin;
\.


--
-- Data for Name: stock_audit_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_audit_items (id, audit_session_id, inventory_item_id, barcode, rfid_epc, status, expected_gross_weight, expected_net_weight, scanned_gross_weight, scanned_net_weight, weight_discrepancy, remarks, scanned_at, scanned_by, created_at, updated_at) FROM stdin;
dfb693c0-809c-49df-9af7-07a52811726f	95a103b6-bc8a-4042-961b-8e728dd67718	1fab3bf5-3fb7-4875-bc24-ebfc55f2b34c	BC-PLT-00001	\N	MATCHED	6.250	6.250	6.250	6.250	0.000	Matched during seed physical stocktake audit	2026-08-21 07:14:39.265-07	\N	2026-08-21 07:14:39.265-07	2026-08-21 07:14:39.265-07
86c9fb9f-7c85-40ad-967c-c2b8e0be4bdf	95a103b6-bc8a-4042-961b-8e728dd67718	24807e7e-992a-4946-8dda-89b79542c844	BC-BNG-00001	\N	MATCHED	26.800	26.800	26.800	26.800	0.000	Matched during seed physical stocktake audit	2026-08-21 07:14:39.275-07	\N	2026-08-21 07:14:39.275-07	2026-08-21 07:14:39.275-07
360a0693-f4db-4edc-bfee-6ddfc64283f2	95a103b6-bc8a-4042-961b-8e728dd67718	5c32a406-1533-4d3e-b8b3-fd184da47f2c	BC-RNG-00001	\N	MATCHED	5.450	5.450	5.450	5.450	0.000	Matched during seed physical stocktake audit	2026-08-21 07:14:39.277-07	\N	2026-08-21 07:14:39.277-07	2026-08-21 07:14:39.277-07
40ea59e2-1c79-449f-8411-496c290facea	95a103b6-bc8a-4042-961b-8e728dd67718	70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	BC-NCK-00001	\N	MATCHED	38.200	38.200	38.200	38.200	0.000	Matched during seed physical stocktake audit	2026-08-21 07:14:39.279-07	\N	2026-08-21 07:14:39.279-07	2026-08-21 07:14:39.279-07
\.


--
-- Data for Name: stock_audit_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_audit_sessions (id, audit_number, company_id, branch_id, category_id, status, start_date, completed_at, total_expected_items, total_scanned_items, total_matched_items, total_missing_items, total_unexpected_items, total_weight_mismatch_items, total_expected_net_weight, total_scanned_net_weight, notes, audited_by, reconciled_by, reconciled_at, cancellation_reason, created_at, updated_at) FROM stdin;
95a103b6-bc8a-4042-961b-8e728dd67718	AUD-SEED-20260820-0001	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	\N	RECONCILED	2026-08-21 07:14:39.25-07	2026-08-21 07:14:39.25-07	5	5	4	1	0	0	100.000	80.000	Sample seed physical inventory stock audit and reconciliation	\N	\N	2026-08-21 07:14:39.25-07	\N	2026-08-21 07:14:39.251-07	2026-08-21 07:14:39.251-07
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, inventory_item_id, from_branch_id, to_branch_id, movement_type, reference_type, reference_id, remarks, performed_by, created_at) FROM stdin;
99157be1-bd30-4822-96c6-2f29610ab3a7	5c32a406-1533-4d3e-b8b3-fd184da47f2c	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-RNG-00001	Initial physical stock intake for 22K Peacock Antique Gold Ring into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.777-07
a1db70e9-978d-41c3-9b14-59887a0524fa	70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-NCK-00001	Initial physical stock intake for 22K Royal Temple Bridal Choker Necklace into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.79-07
5c6e1309-75a5-4b8b-b2a5-08d57b01cccc	9c7c52f6-7fe6-4364-b063-ebeaac2cfc8f	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-CHN-00001	Initial physical stock intake for 22K Classic Hollow Rope Gold Chain into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.8-07
955b0881-ceb7-491b-9fcf-80238a6bf23d	24807e7e-992a-4946-8dda-89b79542c844	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-BNG-00001	Initial physical stock intake for 22K Handcrafted Filigree Gold Kada into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.808-07
0621f416-fd75-44a7-97f3-770d03c47aa3	be4e8f1d-b962-400b-b2f1-ae96c8ea6ba3	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-DMD-00001	Initial physical stock intake for 18K Solitaire Diamond Engagement Ring into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.815-07
1fa08bd9-06fa-4e1d-9fb2-ccff6beccb6b	c14404b2-9337-40d5-a14c-c68996de647c	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-SLV-00001	Initial physical stock intake for 999 Fine Silver Lakshmi Ganesh 50g Coin into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.822-07
e9b4a069-88cf-41a3-a357-bcf9cd49a56f	1fab3bf5-3fb7-4875-bc24-ebfc55f2b34c	\N	22222222-2222-4222-a222-222222222221	STOCK_IN	BULLION_PURCHASE_RECEIPT	GRN-2026-INV-PLT-00001	Initial physical stock intake for 950 Pure Platinum Forever Love Couple Band into Connaught Place vault	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:14:37.828-07
e66f9ced-ac65-40d2-b027-1355d0d28adb	5c32a406-1533-4d3e-b8b3-fd184da47f2c	22222222-2222-4222-a222-222222222221	\N	PURCHASE_RETURN	PURCHASE_RETURN	2cb5c403-284a-4b2b-a0f0-85006381d8dc	Returned to vendor under seed return PR-SEED-20260820-0001	\N	2026-08-21 07:14:39.176-07
c09fe510-7b86-4ac6-a454-331021438bd6	70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	22222222-2222-4222-a222-222222222221	22222222-2222-4222-a222-222222222221	THIRD_PARTY_GIRVI_RELEASE	THIRD_PARTY_GIRVI	ff17c719-3220-4044-ae2a-7de5ba3c5c49	Third-party collateral '22K Antique Gold Bangle Set' released upon closure TPG-20260821-0001	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:15:20.228-07
f20d3425-c986-4b55-9e2c-80e56e594fd4	9c7c52f6-7fe6-4364-b063-ebeaac2cfc8f	22222222-2222-4222-a222-222222222221	22222222-2222-4222-a222-222222222221	GIRVI_RELEASE	GIRVI_SETTLEMENT	cde490a2-aee3-478b-adc5-8c744e8b4dab	Collateral '22K Gold Chain 25g' released upon full Girvi settlement SETTLE-20260821-0001	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:16:36.453-07
77186c2c-0082-484d-bf98-878c6ad3d376	ffd46571-4a97-4c17-9380-35bd6eebb0aa	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	316b38e6-7a43-4fbe-b553-725474b9fb24	Issued on Approval APP-00003	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.14-07
3c423783-93da-44b4-a4bb-c20712783405	0cb08f23-70b1-4339-b614-8f436b5f255f	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	7e74a7d0-811c-40d5-9161-24b74f9f03d9	Issued on Approval APP-00004	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.4-07
0cf00732-88b7-40ea-bf24-9727be702d48	ae8ed4b6-5e74-4e21-8bdb-29b6c617d8cd	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	7e74a7d0-811c-40d5-9161-24b74f9f03d9	Issued on Approval APP-00004	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.404-07
1e945d6a-bf45-46df-991f-73dee75d1648	59705c38-9a6c-4144-98fb-50d8fc29234f	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	d2fb5c6c-01c8-4546-85c9-692b768c7a89	Issued on Approval APP-00008	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:08:12.892-07
15ba5318-7fb5-4ebd-ae32-8fcdc886b409	296e8525-b704-41bf-80df-f273efbd53d4	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	039f678d-6ea4-410d-8232-0db38d1ed3a4	Issued on Approval APP-00011	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:09:49.942-07
068e2dfa-f344-416f-8805-73459af11860	d6026b3e-e7f3-4ab2-9f3c-fa62dde869d4	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	d4e00a35-c386-4bdf-8848-97d9cb22d185	Issued on Approval APP-00013	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:03.445-07
eeed3095-1c34-415f-a413-6a520d5180fe	0729dd37-e008-4b1d-a7e5-3176679edee7	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	db48825b-c834-422e-a49f-32c60eee2bb8	Issued on Approval APP-00014	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:16:53.289-07
ccd60d46-cdee-4628-a2b0-c020fd57aa3e	dbfb33b0-a0cf-48cb-ab76-7bbce04c95d6	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	75770175-3ceb-4a2e-9d1d-1e67973755b4	Issued on Approval APP-00015	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:25.934-07
5bb2dfbb-d28c-4e84-b31b-b88e0da98420	dbfb33b0-a0cf-48cb-ab76-7bbce04c95d6	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	75770175-3ceb-4a2e-9d1d-1e67973755b4	Returned from Approval APP-00015	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.117-07
f22e2da4-f716-474a-8de7-a90c99459273	3199d846-8209-41ce-9da7-b9b80c1f0484	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	d59c178b-227d-4465-abf5-eb659ae78ce7	Issued on Approval APP-00016	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.5-07
9e8322fb-4af5-44a2-a69e-046dc525bce7	3199d846-8209-41ce-9da7-b9b80c1f0484	22222222-2222-4222-a222-222222222221	\N	SALE	SALES_INVOICE	fed46839-f2ee-4648-96ea-cf53c8ff7a82	Sold via Approval Conversion Invoice INV-20260821-0001	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.64-07
6e663ebb-7b12-4ff6-b6b2-9ee8f390f879	e31636a0-8fc6-4cf3-add9-e33c92a54723	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	4d3f3674-0a92-45ea-85a4-2318e368d7c0	Issued on Approval APP-00017	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.814-07
ef273f62-2781-47f8-8ae2-9d260b49fec9	e31636a0-8fc6-4cf3-add9-e33c92a54723	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	4d3f3674-0a92-45ea-85a4-2318e368d7c0	Returned from Approval APP-00017	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:24:26.854-07
942490ae-f2fd-4bbf-921d-543869a9e155	f89f11a0-9b0d-4b2d-a27c-3238f1d9397f	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	d73aac67-8f8c-4227-b2eb-ed101d1ec81f	Issued on Approval APP-00018	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:02.201-07
79740e55-d940-4456-8b9f-6130da17534e	f89f11a0-9b0d-4b2d-a27c-3238f1d9397f	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	d73aac67-8f8c-4227-b2eb-ed101d1ec81f	Returned from Approval APP-00018	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:02.471-07
6748c5db-3599-41f2-bc7d-2ec112895476	c48b857c-3097-4edd-aa98-51ee9b59f8fd	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	52037f9b-143e-42b6-8a29-090ddd39dd7d	Issued on Approval APP-00019	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.236-07
2db4f812-062d-4646-a1de-666ccb61ef75	c48b857c-3097-4edd-aa98-51ee9b59f8fd	22222222-2222-4222-a222-222222222221	\N	SALE	SALES_INVOICE	24b545e8-f3dd-4794-a1d6-eab43be3e491	Sold via Approval Conversion Invoice INV-20260821-0002	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.504-07
02b3097b-8c03-44d3-a33f-911c5d218455	a7bfd35c-32e1-4f80-90e2-9739c95fdafc	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	5ed2ff1e-17ff-4164-9767-be27ed717cda	Issued on Approval APP-00020	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.841-07
6ffc608f-98de-49dc-87f5-2d5491eb1a4b	a7bfd35c-32e1-4f80-90e2-9739c95fdafc	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	5ed2ff1e-17ff-4164-9767-be27ed717cda	Returned from Approval APP-00020	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:26:03.93-07
04ce59a9-263e-445c-9484-18aba213470c	a26e66e0-87e7-4068-b016-efa2074aac85	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	f40b092d-11ae-49d6-9e79-37ed18590f2e	Issued on Approval APP-00021	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.02-07
4693ee0a-d7ac-48f6-8f96-8d4e5a67b8b6	7787c368-6244-4102-a576-9c54decd56ae	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	464cdb69-da33-4f02-8422-6014c7f521ae	Issued on Approval APP-00022	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.426-07
7e3de3b2-dc38-48ef-81a7-e3111b32d06f	7787c368-6244-4102-a576-9c54decd56ae	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	464cdb69-da33-4f02-8422-6014c7f521ae	Returned from Approval APP-00022	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.493-07
168b09e9-e131-4767-aeea-e113f9aff9b9	6bc93e18-46a1-4cc9-a541-423342649060	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	10af99aa-871d-46d0-bbc3-24496c7879bf	Issued on Approval APP-00023	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:20.965-07
7c632ee2-f9dc-4c19-a82b-5a4312359539	6bc93e18-46a1-4cc9-a541-423342649060	22222222-2222-4222-a222-222222222221	\N	SALE	SALES_INVOICE	51d76463-08b2-4108-a22e-c7e95c97a5a6	Sold via Approval Conversion Invoice INV-20260821-0003	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:37:21.173-07
395e096a-704c-44e8-a73f-de41f9198611	2ae8e740-3a75-4e14-89c4-a6f80da44035	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	1765330d-b797-4c1e-a19e-3ad842e5b50c	Issued on Approval APP-00024	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:03.294-07
198bfe37-c571-4c51-970b-89e13eb74be5	70b3a45c-148e-4f3b-aad1-82818f7255b3	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	78e7b540-5b02-486b-a7de-5cdb4ecc464d	Issued on Approval APP-00025	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:03.743-07
61f16c0b-bf18-4159-92d4-6df438521f68	70b3a45c-148e-4f3b-aad1-82818f7255b3	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	78e7b540-5b02-486b-a7de-5cdb4ecc464d	Returned from Approval APP-00025	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:03.811-07
2f8cb1fc-0194-4ac5-8706-22f1351c4f0d	800922af-8a0c-4b43-8bdc-42b65710d3c3	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	4c518c77-93cd-459b-ae8c-767c175c0e99	Issued on Approval APP-00026	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:04.373-07
76e5e14d-7503-44a2-a69e-6e326b4781a3	800922af-8a0c-4b43-8bdc-42b65710d3c3	22222222-2222-4222-a222-222222222221	\N	SALE	SALES_INVOICE	d7f44d67-c8f6-4e5b-8cb4-b4297cec4124	Sold via Approval Conversion Invoice INV-20260821-0004	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:04.748-07
850789d7-8aa7-4050-a0c0-67891d015df9	d178ffd8-2bcf-401d-b470-d449b93053e7	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	3c7491c3-8bb7-4976-8b31-231607cecd37	Issued on Approval APP-00027	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:40:05.006-07
4a95d520-09af-4fae-8f4e-2148f2ffbb9a	f8727754-e35f-44b7-b70f-98f5c4bbb7d8	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	a2075f02-44ff-41fc-bf0e-048fb8daad9a	Issued on Approval APP-00028	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:06.934-07
899886ed-32fc-4fa6-9177-b061c91795fc	6c6cabb9-190f-4987-9cfa-f2de2bcee678	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	7812cc52-344f-40a1-9670-0828df74c2fd	Issued on Approval APP-00029	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:07.634-07
168a18c8-b106-49fd-aa33-2210c5bb5c91	6c6cabb9-190f-4987-9cfa-f2de2bcee678	22222222-2222-4222-a222-222222222221	\N	APPROVAL_RETURN	SALES_APPROVAL	7812cc52-344f-40a1-9670-0828df74c2fd	Returned from Approval APP-00029	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:07.813-07
cf7c95b0-57d9-4cce-8ffe-6d543045910e	7114131d-077a-4326-8235-7125ced8bade	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	60d1aa60-631c-4de3-ae97-049a5db19f90	Issued on Approval APP-00030	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:08.46-07
b86a9376-7550-4833-b716-3bf9d549a41b	7114131d-077a-4326-8235-7125ced8bade	22222222-2222-4222-a222-222222222221	\N	SALE	SALES_INVOICE	83bd15ef-bbea-4b60-a7dd-fdba52e65bd0	Sold via Approval Conversion Invoice INV-20260821-0005	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:08.777-07
d656b9fb-3335-4380-8711-6606c64684e8	86b0966e-9cc0-49c3-8dd9-c6a5e837c44d	22222222-2222-4222-a222-222222222221	\N	APPROVAL_ISSUE	SALES_APPROVAL	3cc7fe49-b5b5-429e-bf46-6f9a1f7d6d25	Issued on Approval APP-00031	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 08:42:09.107-07
\.


--
-- Data for Name: tax_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_rates (id, company_id, tax_name, tax_code, rate, effective_from, effective_to, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
b73998ea-d7f6-4574-83e7-f8f02ec00523	11111111-1111-4111-a111-111111111111	GST (CGST 1.5% + SGST 1.5%)	GST_3	3.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.364-07	2026-08-21 07:14:39.364-07
81c93ffb-0f60-4587-9187-0f67397b31c0	11111111-1111-4111-a111-111111111111	Integrated GST (IGST 3%)	IGST_3	3.00	2026-01-01 00:00:00-08	\N	t	\N	\N	2026-08-21 07:14:39.369-07	2026-08-21 07:14:39.369-07
\.


--
-- Data for Name: third_party_girvi_collaterals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.third_party_girvi_collaterals (id, third_party_girvi_id, inventory_item_id, item_name, metal_type, purity, gross_weight, stone_weight, net_weight, valued_amount, barcode, rfid_epc, image_url, is_released, released_at, remarks, created_at, updated_at) FROM stdin;
6b367a08-fbf5-4e39-8345-c7afea45586a	ff17c719-3220-4044-ae2a-7de5ba3c5c49	70ac2eaa-0ae5-4d65-9dcf-83707fb04bdc	22K Antique Gold Bangle Set	GOLD	22K	35.000	0.000	35.000	200000.00	\N	\N	\N	t	2026-08-21 07:15:20.212-07	\N	2026-08-21 07:15:19.974-07	2026-08-21 07:15:20.213-07
\.


--
-- Data for Name: third_party_girvis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.third_party_girvis (id, reference_number, external_loan_number, company_id, branch_id, customer_id, third_party_lender_id, loan_date, due_date, principal_amount, valuation_amount, interest_rate, interest_period, status, notes, "documentRef", created_by, approved_by, approved_at, closed_by, closed_at, closure_reason, cancelled_by, cancelled_at, cancellation_reason, created_at, updated_at) FROM stdin;
ff17c719-3220-4044-ae2a-7de5ba3c5c49	TPG-20260821-0001	MUT-EXT-2026-99	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	342858c9-2f5d-447e-810d-1152124d8a23	2026-08-21 07:15:19.974-07	2027-02-21 07:15:19.745-08	150000.00	200000.00	1.25	MONTHLY	CLOSED	Updated notes: Verified original pledge receipt from lender	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:15:20.139-07	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	2026-08-21 07:15:20.256-07	External loan settled with Muthoot Finance, collateral returned to customer	\N	\N	\N	2026-08-21 07:15:19.974-07	2026-08-21 07:15:20.26-07
b6e6ced1-44c5-49ec-bc41-0cd0c0ddb9a4	TPG-20260821-0002	EXT-REP-999	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	aa4939e0-414d-4f8c-a5f8-9df73d1120c7	7dfffd78-99b5-4fe0-99bc-3e9154278b3d	2026-08-21 07:16:36.577-07	2027-02-21 07:16:36.059-08	80000.00	0.00	0.00	MONTHLY	DRAFT	\N	\N	50aa2e65-a948-40eb-b7e0-7d85f2a353e3	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-21 07:16:36.577-07	2026-08-21 07:16:36.577-07
\.


--
-- Data for Name: third_party_lenders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.third_party_lenders (id, lender_code, name, contact_person, mobile, email, address, is_active, company_id, branch_id, created_at, updated_at) FROM stdin;
342858c9-2f5d-447e-810d-1152124d8a23	LDR-TEST-001	Muthoot Finance Jaipur Branch	Ramesh Patel	9876501234	jaipur@muthoot.com	MI Road, Jaipur	t	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	2026-08-21 07:15:19.704-07	2026-08-21 07:15:19.704-07
7dfffd78-99b5-4fe0-99bc-3e9154278b3d	LDR-REP-01	Rep Lender	\N	\N	\N	\N	t	11111111-1111-4111-a111-111111111111	\N	2026-08-21 07:16:36.519-07	2026-08-21 07:16:36.519-07
\.


--
-- Data for Name: vendor_debit_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_debit_notes (id, debit_note_number, purchase_return_id, vendor_id, branch_id, purchase_bill_id, amount, status, issue_date, remarks, created_by, created_at, updated_at) FROM stdin;
6b2abe8b-015e-433d-9512-5ff1f58d2e44	DN-SEED-2026-00001	2cb5c403-284a-4b2b-a0f0-85006381d8dc	1b842ebf-20a1-4838-8c39-1c10290723e7	22222222-2222-4222-a222-222222222221	\N	59740.00	ISSUED	2026-08-21 07:14:39.179-07	Sample seed debit note for purchase return	\N	2026-08-21 07:14:39.179-07	2026-08-21 07:14:39.179-07
\.


--
-- Data for Name: vendor_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_payments (id, purchase_bill_id, vendor_id, branch_id, payment_number, payment_method, amount, status, transaction_reference, payment_date, remarks, received_by, processed_by, reversed_at, reversed_by, reversal_reason, created_at, updated_at) FROM stdin;
0bb07d81-c7f6-4bf1-843c-67cf13d143cf	c2116caa-993d-4484-9cf0-21f9e73d0351	1b842ebf-20a1-4838-8c39-1c10290723e7	22222222-2222-4222-a222-222222222221	VPAY-SEED-2026-00001	BANK_TRANSFER	10000.00	COMPLETED	SEED-NEFT-99887766	2026-08-21 07:14:39.121-07	Sample seed bank transfer payment for vendor payable settlement	\N	\N	\N	\N	\N	2026-08-21 07:14:39.121-07	2026-08-21 07:14:39.121-07
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, company_id, branch_id, vendor_code, company_name, contact_person, email, mobile, gst_number, pan_number, address_line1, city, state, pincode, vendor_type, is_active, created_at, updated_at) FROM stdin;
1b842ebf-20a1-4838-8c39-1c10290723e7	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	VEND-001	MMTC-PAMP Bullion Refinery Pvt Ltd	Harish Nair	orders@mmtcpamp.com	9876500111	07AAAAM1111A1Z5	AAAAM1111A	Roj-ka-Meo Industrial Area	Mewat	Haryana	122103	BULLION	t	2026-08-21 07:14:37.126-07	2026-08-21 07:14:37.126-07
164493c8-8c80-4d94-b071-b13214f5719e	11111111-1111-4111-a111-111111111111	22222222-2222-4222-a222-222222222221	VEND-002	Surat Artisan Diamond & Jewellery Guild	Kantilal Patel	support@suratdiamondguild.com	9876500222	24AAAKS2222B1Z4	AAAKS2222B	Mini Bazar, Varachha Road	Surat	Gujarat	395006	JEWELLERY	t	2026-08-21 07:14:37.13-07	2026-08-21 07:14:37.13-07
\.


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: approval_deposits approval_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_deposits
    ADD CONSTRAINT approval_deposits_pkey PRIMARY KEY (id);


--
-- Name: approval_items approval_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_pkey PRIMARY KEY (id);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_documents customer_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_documents
    ADD CONSTRAINT customer_documents_pkey PRIMARY KEY (id);


--
-- Name: customer_gold_exchange_items customer_gold_exchange_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchange_items
    ADD CONSTRAINT customer_gold_exchange_items_pkey PRIMARY KEY (id);


--
-- Name: customer_gold_exchanges customer_gold_exchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchanges
    ADD CONSTRAINT customer_gold_exchanges_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: document_series document_series_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_series
    ADD CONSTRAINT document_series_pkey PRIMARY KEY (id);


--
-- Name: employee_branch_assignments employee_branch_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_branch_assignments
    ADD CONSTRAINT employee_branch_assignments_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: financial_years financial_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_years
    ADD CONSTRAINT financial_years_pkey PRIMARY KEY (id);


--
-- Name: girvi_collaterals girvi_collaterals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_collaterals
    ADD CONSTRAINT girvi_collaterals_pkey PRIMARY KEY (id);


--
-- Name: girvi_collections girvi_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_collections
    ADD CONSTRAINT girvi_collections_pkey PRIMARY KEY (id);


--
-- Name: girvi_loans girvi_loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_loans
    ADD CONSTRAINT girvi_loans_pkey PRIMARY KEY (id);


--
-- Name: girvi_renewals girvi_renewals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_renewals
    ADD CONSTRAINT girvi_renewals_pkey PRIMARY KEY (id);


--
-- Name: girvi_settlements girvi_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_settlements
    ADD CONSTRAINT girvi_settlements_pkey PRIMARY KEY (id);


--
-- Name: inventory_item_images inventory_item_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_item_images
    ADD CONSTRAINT inventory_item_images_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_tags inventory_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_tags
    ADD CONSTRAINT inventory_tags_pkey PRIMARY KEY (id);


--
-- Name: inventory_transfers inventory_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_pkey PRIMARY KEY (id);


--
-- Name: job_work_material_issues job_work_material_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_material_issues
    ADD CONSTRAINT job_work_material_issues_pkey PRIMARY KEY (id);


--
-- Name: job_work_orders job_work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_orders
    ADD CONSTRAINT job_work_orders_pkey PRIMARY KEY (id);


--
-- Name: job_work_receipts job_work_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_receipts
    ADD CONSTRAINT job_work_receipts_pkey PRIMARY KEY (id);


--
-- Name: making_charges making_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.making_charges
    ADD CONSTRAINT making_charges_pkey PRIMARY KEY (id);


--
-- Name: metal_rates metal_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metal_rates
    ADD CONSTRAINT metal_rates_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_sub_categories product_sub_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sub_categories
    ADD CONSTRAINT product_sub_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_bill_items purchase_bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bill_items
    ADD CONSTRAINT purchase_bill_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_bills purchase_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bills
    ADD CONSTRAINT purchase_bills_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_receipt_items purchase_receipt_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipt_items
    ADD CONSTRAINT purchase_receipt_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_receipts purchase_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipts
    ADD CONSTRAINT purchase_receipts_pkey PRIMARY KEY (id);


--
-- Name: purchase_return_items purchase_return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_items
    ADD CONSTRAINT purchase_return_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_returns purchase_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_pkey PRIMARY KEY (id);


--
-- Name: sales_invoice_items sales_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_pkey PRIMARY KEY (id);


--
-- Name: sales_invoice_metal_rates sales_invoice_metal_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_metal_rates
    ADD CONSTRAINT sales_invoice_metal_rates_pkey PRIMARY KEY (id);


--
-- Name: sales_invoices sales_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_pkey PRIMARY KEY (id);


--
-- Name: sales_payments sales_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_payments
    ADD CONSTRAINT sales_payments_pkey PRIMARY KEY (id);


--
-- Name: sales_refunds sales_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_refunds
    ADD CONSTRAINT sales_refunds_pkey PRIMARY KEY (id);


--
-- Name: sales_return_items sales_return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT sales_return_items_pkey PRIMARY KEY (id);


--
-- Name: sales_returns sales_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT sales_returns_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_audit_items stock_audit_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_items
    ADD CONSTRAINT stock_audit_items_pkey PRIMARY KEY (id);


--
-- Name: stock_audit_sessions stock_audit_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_sessions
    ADD CONSTRAINT stock_audit_sessions_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: tax_rates tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_pkey PRIMARY KEY (id);


--
-- Name: third_party_girvi_collaterals third_party_girvi_collaterals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvi_collaterals
    ADD CONSTRAINT third_party_girvi_collaterals_pkey PRIMARY KEY (id);


--
-- Name: third_party_girvis third_party_girvis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvis
    ADD CONSTRAINT third_party_girvis_pkey PRIMARY KEY (id);


--
-- Name: third_party_lenders third_party_lenders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_lenders
    ADD CONSTRAINT third_party_lenders_pkey PRIMARY KEY (id);


--
-- Name: vendor_debit_notes vendor_debit_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_debit_notes
    ADD CONSTRAINT vendor_debit_notes_pkey PRIMARY KEY (id);


--
-- Name: vendor_payments vendor_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON iam.password_reset_tokens USING btree (token);


--
-- Name: permissions_permission_key_key; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX permissions_permission_key_key ON iam.permissions USING btree (permission_key);


--
-- Name: roles_name_key; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON iam.roles USING btree (name);


--
-- Name: user_sessions_refresh_token_key; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX user_sessions_refresh_token_key ON iam.user_sessions USING btree (refresh_token);


--
-- Name: users_email_key; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON iam.users USING btree (email);


--
-- Name: users_employee_id_key; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX users_employee_id_key ON iam.users USING btree (employee_id);


--
-- Name: approval_deposits_approval_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_approval_id_idx ON public.approval_deposits USING btree (approval_id);


--
-- Name: approval_deposits_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_branch_id_idx ON public.approval_deposits USING btree (branch_id);


--
-- Name: approval_deposits_company_id_deposit_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX approval_deposits_company_id_deposit_number_key ON public.approval_deposits USING btree (company_id, deposit_number);


--
-- Name: approval_deposits_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_company_id_idx ON public.approval_deposits USING btree (company_id);


--
-- Name: approval_deposits_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_customer_id_idx ON public.approval_deposits USING btree (customer_id);


--
-- Name: approval_deposits_deposit_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX approval_deposits_deposit_number_key ON public.approval_deposits USING btree (deposit_number);


--
-- Name: approval_deposits_payment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_payment_date_idx ON public.approval_deposits USING btree (payment_date);


--
-- Name: approval_deposits_payment_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_payment_method_idx ON public.approval_deposits USING btree (payment_method);


--
-- Name: approval_deposits_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_deposits_status_idx ON public.approval_deposits USING btree (status);


--
-- Name: approval_items_approval_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_items_approval_id_idx ON public.approval_items USING btree (approval_id);


--
-- Name: approval_items_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_items_inventory_item_id_idx ON public.approval_items USING btree (inventory_item_id);


--
-- Name: approval_items_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_items_status_idx ON public.approval_items USING btree (status);


--
-- Name: approvals_approval_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_approval_number_idx ON public.approvals USING btree (approval_number);


--
-- Name: approvals_approval_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX approvals_approval_number_key ON public.approvals USING btree (approval_number);


--
-- Name: approvals_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_branch_id_idx ON public.approvals USING btree (branch_id);


--
-- Name: approvals_company_id_approval_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX approvals_company_id_approval_number_key ON public.approvals USING btree (company_id, approval_number);


--
-- Name: approvals_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_company_id_idx ON public.approvals USING btree (company_id);


--
-- Name: approvals_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_customer_id_idx ON public.approvals USING btree (customer_id);


--
-- Name: approvals_salesperson_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_salesperson_id_idx ON public.approvals USING btree (salesperson_id);


--
-- Name: approvals_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_status_idx ON public.approvals USING btree (status);


--
-- Name: branches_company_id_branch_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX branches_company_id_branch_code_key ON public.branches USING btree (company_id, branch_code);


--
-- Name: companies_company_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_company_code_key ON public.companies USING btree (company_code);


--
-- Name: companies_gst_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_gst_number_key ON public.companies USING btree (gst_number);


--
-- Name: companies_pan_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_pan_number_key ON public.companies USING btree (pan_number);


--
-- Name: customer_gold_exchange_items_exchange_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchange_items_exchange_id_idx ON public.customer_gold_exchange_items USING btree (exchange_id);


--
-- Name: customer_gold_exchange_items_metal_rate_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchange_items_metal_rate_id_idx ON public.customer_gold_exchange_items USING btree (metal_rate_id);


--
-- Name: customer_gold_exchange_items_metal_type_purity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchange_items_metal_type_purity_idx ON public.customer_gold_exchange_items USING btree (metal_type, purity);


--
-- Name: customer_gold_exchanges_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchanges_branch_id_idx ON public.customer_gold_exchanges USING btree (branch_id);


--
-- Name: customer_gold_exchanges_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchanges_created_at_idx ON public.customer_gold_exchanges USING btree (created_at);


--
-- Name: customer_gold_exchanges_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchanges_customer_id_idx ON public.customer_gold_exchanges USING btree (customer_id);


--
-- Name: customer_gold_exchanges_exchange_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchanges_exchange_number_idx ON public.customer_gold_exchanges USING btree (exchange_number);


--
-- Name: customer_gold_exchanges_exchange_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customer_gold_exchanges_exchange_number_key ON public.customer_gold_exchanges USING btree (exchange_number);


--
-- Name: customer_gold_exchanges_sales_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchanges_sales_invoice_id_idx ON public.customer_gold_exchanges USING btree (sales_invoice_id);


--
-- Name: customer_gold_exchanges_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customer_gold_exchanges_status_idx ON public.customer_gold_exchanges USING btree (status);


--
-- Name: customers_company_id_customer_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_company_id_customer_code_key ON public.customers USING btree (company_id, customer_code);


--
-- Name: customers_mobile_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_mobile_key ON public.customers USING btree (mobile);


--
-- Name: employees_company_id_employee_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_company_id_employee_code_key ON public.employees USING btree (company_id, employee_code);


--
-- Name: employees_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);


--
-- Name: employees_mobile_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_mobile_key ON public.employees USING btree (mobile);


--
-- Name: girvi_collaterals_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collaterals_barcode_idx ON public.girvi_collaterals USING btree (barcode);


--
-- Name: girvi_collaterals_girvi_loan_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collaterals_girvi_loan_id_idx ON public.girvi_collaterals USING btree (girvi_loan_id);


--
-- Name: girvi_collaterals_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collaterals_inventory_item_id_idx ON public.girvi_collaterals USING btree (inventory_item_id);


--
-- Name: girvi_collaterals_rfid_epc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collaterals_rfid_epc_idx ON public.girvi_collaterals USING btree (rfid_epc);


--
-- Name: girvi_collections_collection_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collections_collection_number_idx ON public.girvi_collections USING btree (collection_number);


--
-- Name: girvi_collections_collection_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX girvi_collections_collection_number_key ON public.girvi_collections USING btree (collection_number);


--
-- Name: girvi_collections_girvi_loan_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collections_girvi_loan_id_idx ON public.girvi_collections USING btree (girvi_loan_id);


--
-- Name: girvi_collections_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_collections_status_idx ON public.girvi_collections USING btree (status);


--
-- Name: girvi_loans_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_loans_branch_id_idx ON public.girvi_loans USING btree (branch_id);


--
-- Name: girvi_loans_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_loans_company_id_idx ON public.girvi_loans USING btree (company_id);


--
-- Name: girvi_loans_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_loans_customer_id_idx ON public.girvi_loans USING btree (customer_id);


--
-- Name: girvi_loans_loan_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_loans_loan_date_idx ON public.girvi_loans USING btree (loan_date);


--
-- Name: girvi_loans_loan_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_loans_loan_number_idx ON public.girvi_loans USING btree (loan_number);


--
-- Name: girvi_loans_loan_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX girvi_loans_loan_number_key ON public.girvi_loans USING btree (loan_number);


--
-- Name: girvi_loans_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_loans_status_idx ON public.girvi_loans USING btree (status);


--
-- Name: girvi_renewals_girvi_loan_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_renewals_girvi_loan_id_idx ON public.girvi_renewals USING btree (girvi_loan_id);


--
-- Name: girvi_settlements_girvi_loan_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_settlements_girvi_loan_id_idx ON public.girvi_settlements USING btree (girvi_loan_id);


--
-- Name: girvi_settlements_girvi_loan_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX girvi_settlements_girvi_loan_id_key ON public.girvi_settlements USING btree (girvi_loan_id);


--
-- Name: girvi_settlements_settlement_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX girvi_settlements_settlement_number_idx ON public.girvi_settlements USING btree (settlement_number);


--
-- Name: girvi_settlements_settlement_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX girvi_settlements_settlement_number_key ON public.girvi_settlements USING btree (settlement_number);


--
-- Name: inventory_item_images_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_item_images_inventory_item_id_idx ON public.inventory_item_images USING btree (inventory_item_id);


--
-- Name: inventory_items_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_items_branch_id_idx ON public.inventory_items USING btree (branch_id);


--
-- Name: inventory_items_company_id_item_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX inventory_items_company_id_item_code_key ON public.inventory_items USING btree (company_id, item_code);


--
-- Name: inventory_items_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_items_created_at_idx ON public.inventory_items USING btree (created_at);


--
-- Name: inventory_items_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_items_product_id_idx ON public.inventory_items USING btree (product_id);


--
-- Name: inventory_items_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_items_status_idx ON public.inventory_items USING btree (status);


--
-- Name: inventory_tags_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX inventory_tags_barcode_key ON public.inventory_tags USING btree (barcode);


--
-- Name: inventory_tags_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_tags_inventory_item_id_idx ON public.inventory_tags USING btree (inventory_item_id);


--
-- Name: inventory_tags_rfid_epc_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX inventory_tags_rfid_epc_key ON public.inventory_tags USING btree (rfid_epc);


--
-- Name: inventory_transfers_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transfers_created_at_idx ON public.inventory_transfers USING btree (created_at);


--
-- Name: inventory_transfers_from_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transfers_from_branch_id_idx ON public.inventory_transfers USING btree (from_branch_id);


--
-- Name: inventory_transfers_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transfers_inventory_item_id_idx ON public.inventory_transfers USING btree (inventory_item_id);


--
-- Name: inventory_transfers_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transfers_status_idx ON public.inventory_transfers USING btree (status);


--
-- Name: inventory_transfers_to_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_transfers_to_branch_id_idx ON public.inventory_transfers USING btree (to_branch_id);


--
-- Name: inventory_transfers_transfer_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX inventory_transfers_transfer_code_key ON public.inventory_transfers USING btree (transfer_code);


--
-- Name: job_work_material_issues_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_material_issues_inventory_item_id_idx ON public.job_work_material_issues USING btree (inventory_item_id);


--
-- Name: job_work_material_issues_job_work_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_material_issues_job_work_order_id_idx ON public.job_work_material_issues USING btree (job_work_order_id);


--
-- Name: job_work_orders_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_orders_branch_id_idx ON public.job_work_orders USING btree (branch_id);


--
-- Name: job_work_orders_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_orders_company_id_idx ON public.job_work_orders USING btree (company_id);


--
-- Name: job_work_orders_issue_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_orders_issue_date_idx ON public.job_work_orders USING btree (issue_date);


--
-- Name: job_work_orders_order_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_orders_order_number_idx ON public.job_work_orders USING btree (order_number);


--
-- Name: job_work_orders_order_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX job_work_orders_order_number_key ON public.job_work_orders USING btree (order_number);


--
-- Name: job_work_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_orders_status_idx ON public.job_work_orders USING btree (status);


--
-- Name: job_work_orders_vendor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_orders_vendor_id_idx ON public.job_work_orders USING btree (vendor_id);


--
-- Name: job_work_receipts_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_receipts_inventory_item_id_idx ON public.job_work_receipts USING btree (inventory_item_id);


--
-- Name: job_work_receipts_job_work_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_receipts_job_work_order_id_idx ON public.job_work_receipts USING btree (job_work_order_id);


--
-- Name: job_work_receipts_receipt_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_work_receipts_receipt_number_idx ON public.job_work_receipts USING btree (receipt_number);


--
-- Name: job_work_receipts_receipt_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX job_work_receipts_receipt_number_key ON public.job_work_receipts USING btree (receipt_number);


--
-- Name: making_charges_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX making_charges_company_id_idx ON public.making_charges USING btree (company_id);


--
-- Name: making_charges_effective_from_effective_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX making_charges_effective_from_effective_to_idx ON public.making_charges USING btree (effective_from, effective_to);


--
-- Name: making_charges_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX making_charges_is_active_idx ON public.making_charges USING btree (is_active);


--
-- Name: making_charges_metal_type_purity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX making_charges_metal_type_purity_idx ON public.making_charges USING btree (metal_type, purity);


--
-- Name: metal_rates_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metal_rates_company_id_idx ON public.metal_rates USING btree (company_id);


--
-- Name: metal_rates_effective_from_effective_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metal_rates_effective_from_effective_to_idx ON public.metal_rates USING btree (effective_from, effective_to);


--
-- Name: metal_rates_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metal_rates_is_active_idx ON public.metal_rates USING btree (is_active);


--
-- Name: metal_rates_metal_type_purity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX metal_rates_metal_type_purity_idx ON public.metal_rates USING btree (metal_type, purity);


--
-- Name: product_categories_company_id_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_categories_company_id_code_key ON public.product_categories USING btree (company_id, code);


--
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- Name: product_sub_categories_company_id_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_sub_categories_company_id_code_key ON public.product_sub_categories USING btree (company_id, code);


--
-- Name: products_company_id_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_company_id_sku_key ON public.products USING btree (company_id, sku);


--
-- Name: purchase_bill_items_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bill_items_inventory_item_id_idx ON public.purchase_bill_items USING btree (inventory_item_id);


--
-- Name: purchase_bill_items_purchase_bill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bill_items_purchase_bill_id_idx ON public.purchase_bill_items USING btree (purchase_bill_id);


--
-- Name: purchase_bill_items_purchase_order_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bill_items_purchase_order_item_id_idx ON public.purchase_bill_items USING btree (purchase_order_item_id);


--
-- Name: purchase_bill_items_purchase_receipt_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bill_items_purchase_receipt_item_id_idx ON public.purchase_bill_items USING btree (purchase_receipt_item_id);


--
-- Name: purchase_bills_bill_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bills_bill_date_idx ON public.purchase_bills USING btree (bill_date);


--
-- Name: purchase_bills_bill_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bills_bill_number_idx ON public.purchase_bills USING btree (bill_number);


--
-- Name: purchase_bills_bill_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX purchase_bills_bill_number_key ON public.purchase_bills USING btree (bill_number);


--
-- Name: purchase_bills_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bills_branch_id_idx ON public.purchase_bills USING btree (branch_id);


--
-- Name: purchase_bills_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bills_purchase_order_id_idx ON public.purchase_bills USING btree (purchase_order_id);


--
-- Name: purchase_bills_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bills_status_idx ON public.purchase_bills USING btree (status);


--
-- Name: purchase_bills_vendor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_bills_vendor_id_idx ON public.purchase_bills USING btree (vendor_id);


--
-- Name: purchase_order_items_metal_type_purity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_items_metal_type_purity_idx ON public.purchase_order_items USING btree (metal_type, purity);


--
-- Name: purchase_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_items_product_id_idx ON public.purchase_order_items USING btree (product_id);


--
-- Name: purchase_order_items_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_items_purchase_order_id_idx ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: purchase_orders_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_branch_id_idx ON public.purchase_orders USING btree (branch_id);


--
-- Name: purchase_orders_order_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_order_date_idx ON public.purchase_orders USING btree (order_date);


--
-- Name: purchase_orders_purchase_order_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_purchase_order_number_idx ON public.purchase_orders USING btree (purchase_order_number);


--
-- Name: purchase_orders_purchase_order_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX purchase_orders_purchase_order_number_key ON public.purchase_orders USING btree (purchase_order_number);


--
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- Name: purchase_orders_vendor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_orders_vendor_id_idx ON public.purchase_orders USING btree (vendor_id);


--
-- Name: purchase_receipts_purchase_receipt_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX purchase_receipts_purchase_receipt_number_key ON public.purchase_receipts USING btree (purchase_receipt_number);


--
-- Name: purchase_return_items_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_return_items_inventory_item_id_idx ON public.purchase_return_items USING btree (inventory_item_id);


--
-- Name: purchase_return_items_purchase_bill_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_return_items_purchase_bill_item_id_idx ON public.purchase_return_items USING btree (purchase_bill_item_id);


--
-- Name: purchase_return_items_purchase_return_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_return_items_purchase_return_id_idx ON public.purchase_return_items USING btree (purchase_return_id);


--
-- Name: purchase_returns_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_branch_id_idx ON public.purchase_returns USING btree (branch_id);


--
-- Name: purchase_returns_purchase_bill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_purchase_bill_id_idx ON public.purchase_returns USING btree (purchase_bill_id);


--
-- Name: purchase_returns_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_purchase_order_id_idx ON public.purchase_returns USING btree (purchase_order_id);


--
-- Name: purchase_returns_return_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_return_date_idx ON public.purchase_returns USING btree (return_date);


--
-- Name: purchase_returns_return_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_return_number_idx ON public.purchase_returns USING btree (return_number);


--
-- Name: purchase_returns_return_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX purchase_returns_return_number_key ON public.purchase_returns USING btree (return_number);


--
-- Name: purchase_returns_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_status_idx ON public.purchase_returns USING btree (status);


--
-- Name: purchase_returns_vendor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_returns_vendor_id_idx ON public.purchase_returns USING btree (vendor_id);


--
-- Name: sales_invoice_items_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoice_items_inventory_item_id_idx ON public.sales_invoice_items USING btree (inventory_item_id);


--
-- Name: sales_invoice_items_sales_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoice_items_sales_invoice_id_idx ON public.sales_invoice_items USING btree (sales_invoice_id);


--
-- Name: sales_invoice_metal_rates_metal_rate_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoice_metal_rates_metal_rate_id_idx ON public.sales_invoice_metal_rates USING btree (metal_rate_id);


--
-- Name: sales_invoice_metal_rates_sales_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoice_metal_rates_sales_invoice_id_idx ON public.sales_invoice_metal_rates USING btree (sales_invoice_id);


--
-- Name: sales_invoice_metal_rates_sales_invoice_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_invoice_metal_rates_sales_invoice_id_key ON public.sales_invoice_metal_rates USING btree (sales_invoice_id);


--
-- Name: sales_invoices_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoices_branch_id_idx ON public.sales_invoices USING btree (branch_id);


--
-- Name: sales_invoices_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoices_customer_id_idx ON public.sales_invoices USING btree (customer_id);


--
-- Name: sales_invoices_invoice_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoices_invoice_date_idx ON public.sales_invoices USING btree (invoice_date);


--
-- Name: sales_invoices_invoice_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_invoices_invoice_number_key ON public.sales_invoices USING btree (invoice_number);


--
-- Name: sales_invoices_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_invoices_status_idx ON public.sales_invoices USING btree (status);


--
-- Name: sales_payments_payment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_payments_payment_date_idx ON public.sales_payments USING btree (payment_date);


--
-- Name: sales_payments_payment_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_payments_payment_method_idx ON public.sales_payments USING btree (payment_method);


--
-- Name: sales_payments_payment_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_payments_payment_number_key ON public.sales_payments USING btree (payment_number);


--
-- Name: sales_payments_sales_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_payments_sales_invoice_id_idx ON public.sales_payments USING btree (sales_invoice_id);


--
-- Name: sales_payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_payments_status_idx ON public.sales_payments USING btree (status);


--
-- Name: sales_payments_transaction_reference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_payments_transaction_reference_idx ON public.sales_payments USING btree (transaction_reference);


--
-- Name: sales_refunds_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_refunds_created_at_idx ON public.sales_refunds USING btree (created_at);


--
-- Name: sales_refunds_refund_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_refunds_refund_method_idx ON public.sales_refunds USING btree (refund_method);


--
-- Name: sales_refunds_refund_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_refunds_refund_number_key ON public.sales_refunds USING btree (refund_number);


--
-- Name: sales_refunds_sales_return_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_refunds_sales_return_id_idx ON public.sales_refunds USING btree (sales_return_id);


--
-- Name: sales_refunds_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_refunds_status_idx ON public.sales_refunds USING btree (status);


--
-- Name: sales_return_items_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_return_items_inventory_item_id_idx ON public.sales_return_items USING btree (inventory_item_id);


--
-- Name: sales_return_items_sales_invoice_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_return_items_sales_invoice_item_id_idx ON public.sales_return_items USING btree (sales_invoice_item_id);


--
-- Name: sales_return_items_sales_return_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_return_items_sales_return_id_idx ON public.sales_return_items USING btree (sales_return_id);


--
-- Name: sales_returns_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_returns_branch_id_idx ON public.sales_returns USING btree (branch_id);


--
-- Name: sales_returns_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_returns_created_at_idx ON public.sales_returns USING btree (created_at);


--
-- Name: sales_returns_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_returns_customer_id_idx ON public.sales_returns USING btree (customer_id);


--
-- Name: sales_returns_return_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sales_returns_return_number_key ON public.sales_returns USING btree (return_number);


--
-- Name: sales_returns_sales_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_returns_sales_invoice_id_idx ON public.sales_returns USING btree (sales_invoice_id);


--
-- Name: sales_returns_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_returns_status_idx ON public.sales_returns USING btree (status);


--
-- Name: stock_adjustments_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_adjustments_branch_id_idx ON public.stock_adjustments USING btree (branch_id);


--
-- Name: stock_adjustments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_adjustments_created_at_idx ON public.stock_adjustments USING btree (created_at);


--
-- Name: stock_adjustments_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_adjustments_inventory_item_id_idx ON public.stock_adjustments USING btree (inventory_item_id);


--
-- Name: stock_audit_items_audit_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_items_audit_session_id_idx ON public.stock_audit_items USING btree (audit_session_id);


--
-- Name: stock_audit_items_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_items_barcode_idx ON public.stock_audit_items USING btree (barcode);


--
-- Name: stock_audit_items_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_items_inventory_item_id_idx ON public.stock_audit_items USING btree (inventory_item_id);


--
-- Name: stock_audit_items_rfid_epc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_items_rfid_epc_idx ON public.stock_audit_items USING btree (rfid_epc);


--
-- Name: stock_audit_items_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_items_status_idx ON public.stock_audit_items USING btree (status);


--
-- Name: stock_audit_sessions_audit_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_sessions_audit_number_idx ON public.stock_audit_sessions USING btree (audit_number);


--
-- Name: stock_audit_sessions_audit_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stock_audit_sessions_audit_number_key ON public.stock_audit_sessions USING btree (audit_number);


--
-- Name: stock_audit_sessions_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_sessions_branch_id_idx ON public.stock_audit_sessions USING btree (branch_id);


--
-- Name: stock_audit_sessions_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_sessions_category_id_idx ON public.stock_audit_sessions USING btree (category_id);


--
-- Name: stock_audit_sessions_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_sessions_company_id_idx ON public.stock_audit_sessions USING btree (company_id);


--
-- Name: stock_audit_sessions_start_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_sessions_start_date_idx ON public.stock_audit_sessions USING btree (start_date);


--
-- Name: stock_audit_sessions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_audit_sessions_status_idx ON public.stock_audit_sessions USING btree (status);


--
-- Name: stock_movements_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_created_at_idx ON public.stock_movements USING btree (created_at);


--
-- Name: stock_movements_from_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_from_branch_id_idx ON public.stock_movements USING btree (from_branch_id);


--
-- Name: stock_movements_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_inventory_item_id_idx ON public.stock_movements USING btree (inventory_item_id);


--
-- Name: stock_movements_movement_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_movement_type_idx ON public.stock_movements USING btree (movement_type);


--
-- Name: stock_movements_to_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_to_branch_id_idx ON public.stock_movements USING btree (to_branch_id);


--
-- Name: tax_rates_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_company_id_idx ON public.tax_rates USING btree (company_id);


--
-- Name: tax_rates_effective_from_effective_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_effective_from_effective_to_idx ON public.tax_rates USING btree (effective_from, effective_to);


--
-- Name: tax_rates_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_is_active_idx ON public.tax_rates USING btree (is_active);


--
-- Name: tax_rates_tax_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_tax_code_idx ON public.tax_rates USING btree (tax_code);


--
-- Name: third_party_girvi_collaterals_inventory_item_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvi_collaterals_inventory_item_id_idx ON public.third_party_girvi_collaterals USING btree (inventory_item_id);


--
-- Name: third_party_girvi_collaterals_third_party_girvi_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvi_collaterals_third_party_girvi_id_idx ON public.third_party_girvi_collaterals USING btree (third_party_girvi_id);


--
-- Name: third_party_girvis_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvis_branch_id_idx ON public.third_party_girvis USING btree (branch_id);


--
-- Name: third_party_girvis_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvis_company_id_idx ON public.third_party_girvis USING btree (company_id);


--
-- Name: third_party_girvis_company_id_third_party_lender_id_externa_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX third_party_girvis_company_id_third_party_lender_id_externa_key ON public.third_party_girvis USING btree (company_id, third_party_lender_id, external_loan_number);


--
-- Name: third_party_girvis_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvis_customer_id_idx ON public.third_party_girvis USING btree (customer_id);


--
-- Name: third_party_girvis_reference_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvis_reference_number_idx ON public.third_party_girvis USING btree (reference_number);


--
-- Name: third_party_girvis_reference_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX third_party_girvis_reference_number_key ON public.third_party_girvis USING btree (reference_number);


--
-- Name: third_party_girvis_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvis_status_idx ON public.third_party_girvis USING btree (status);


--
-- Name: third_party_girvis_third_party_lender_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_girvis_third_party_lender_id_idx ON public.third_party_girvis USING btree (third_party_lender_id);


--
-- Name: third_party_lenders_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_lenders_branch_id_idx ON public.third_party_lenders USING btree (branch_id);


--
-- Name: third_party_lenders_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX third_party_lenders_company_id_idx ON public.third_party_lenders USING btree (company_id);


--
-- Name: third_party_lenders_company_id_lender_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX third_party_lenders_company_id_lender_code_key ON public.third_party_lenders USING btree (company_id, lender_code);


--
-- Name: vendor_debit_notes_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_debit_notes_branch_id_idx ON public.vendor_debit_notes USING btree (branch_id);


--
-- Name: vendor_debit_notes_debit_note_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_debit_notes_debit_note_number_idx ON public.vendor_debit_notes USING btree (debit_note_number);


--
-- Name: vendor_debit_notes_debit_note_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vendor_debit_notes_debit_note_number_key ON public.vendor_debit_notes USING btree (debit_note_number);


--
-- Name: vendor_debit_notes_purchase_bill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_debit_notes_purchase_bill_id_idx ON public.vendor_debit_notes USING btree (purchase_bill_id);


--
-- Name: vendor_debit_notes_purchase_return_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_debit_notes_purchase_return_id_idx ON public.vendor_debit_notes USING btree (purchase_return_id);


--
-- Name: vendor_debit_notes_purchase_return_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vendor_debit_notes_purchase_return_id_key ON public.vendor_debit_notes USING btree (purchase_return_id);


--
-- Name: vendor_debit_notes_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_debit_notes_status_idx ON public.vendor_debit_notes USING btree (status);


--
-- Name: vendor_debit_notes_vendor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_debit_notes_vendor_id_idx ON public.vendor_debit_notes USING btree (vendor_id);


--
-- Name: vendor_payments_branch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_branch_id_idx ON public.vendor_payments USING btree (branch_id);


--
-- Name: vendor_payments_payment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_payment_date_idx ON public.vendor_payments USING btree (payment_date);


--
-- Name: vendor_payments_payment_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_payment_method_idx ON public.vendor_payments USING btree (payment_method);


--
-- Name: vendor_payments_payment_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vendor_payments_payment_number_key ON public.vendor_payments USING btree (payment_number);


--
-- Name: vendor_payments_purchase_bill_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_purchase_bill_id_idx ON public.vendor_payments USING btree (purchase_bill_id);


--
-- Name: vendor_payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_status_idx ON public.vendor_payments USING btree (status);


--
-- Name: vendor_payments_transaction_reference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_transaction_reference_idx ON public.vendor_payments USING btree (transaction_reference);


--
-- Name: vendor_payments_vendor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_payments_vendor_id_idx ON public.vendor_payments USING btree (vendor_id);


--
-- Name: vendors_company_id_vendor_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vendors_company_id_vendor_code_key ON public.vendors USING btree (company_id, vendor_code);


--
-- Name: vendors_gst_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vendors_gst_number_key ON public.vendors USING btree (gst_number);


--
-- Name: login_history login_history_user_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.login_history
    ADD CONSTRAINT login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES iam.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES iam.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES iam.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approval_deposits approval_deposits_approval_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_deposits
    ADD CONSTRAINT approval_deposits_approval_id_fkey FOREIGN KEY (approval_id) REFERENCES public.approvals(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approval_deposits approval_deposits_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_deposits
    ADD CONSTRAINT approval_deposits_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approval_deposits approval_deposits_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_deposits
    ADD CONSTRAINT approval_deposits_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approval_deposits approval_deposits_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_deposits
    ADD CONSTRAINT approval_deposits_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approval_items approval_items_approval_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_approval_id_fkey FOREIGN KEY (approval_id) REFERENCES public.approvals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: approval_items approval_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_items
    ADD CONSTRAINT approval_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approvals approvals_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approvals approvals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approvals approvals_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: approvals approvals_salesperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_salesperson_id_fkey FOREIGN KEY (salesperson_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branches branches_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_documents customer_documents_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_documents
    ADD CONSTRAINT customer_documents_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_gold_exchange_items customer_gold_exchange_items_exchange_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchange_items
    ADD CONSTRAINT customer_gold_exchange_items_exchange_id_fkey FOREIGN KEY (exchange_id) REFERENCES public.customer_gold_exchanges(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_gold_exchange_items customer_gold_exchange_items_metal_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchange_items
    ADD CONSTRAINT customer_gold_exchange_items_metal_rate_id_fkey FOREIGN KEY (metal_rate_id) REFERENCES public.metal_rates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customer_gold_exchanges customer_gold_exchanges_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchanges
    ADD CONSTRAINT customer_gold_exchanges_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_gold_exchanges customer_gold_exchanges_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchanges
    ADD CONSTRAINT customer_gold_exchanges_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customer_gold_exchanges customer_gold_exchanges_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_gold_exchanges
    ADD CONSTRAINT customer_gold_exchanges_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customers customers_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customers customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_series document_series_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_series
    ADD CONSTRAINT document_series_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_series document_series_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_series
    ADD CONSTRAINT document_series_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: document_series document_series_financial_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_series
    ADD CONSTRAINT document_series_financial_year_id_fkey FOREIGN KEY (financial_year_id) REFERENCES public.financial_years(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employee_branch_assignments employee_branch_assignments_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_branch_assignments
    ADD CONSTRAINT employee_branch_assignments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employee_branch_assignments employee_branch_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_branch_assignments
    ADD CONSTRAINT employee_branch_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: financial_years financial_years_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_years
    ADD CONSTRAINT financial_years_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: girvi_collaterals girvi_collaterals_girvi_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_collaterals
    ADD CONSTRAINT girvi_collaterals_girvi_loan_id_fkey FOREIGN KEY (girvi_loan_id) REFERENCES public.girvi_loans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: girvi_collaterals girvi_collaterals_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_collaterals
    ADD CONSTRAINT girvi_collaterals_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: girvi_collections girvi_collections_girvi_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_collections
    ADD CONSTRAINT girvi_collections_girvi_loan_id_fkey FOREIGN KEY (girvi_loan_id) REFERENCES public.girvi_loans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: girvi_loans girvi_loans_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_loans
    ADD CONSTRAINT girvi_loans_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: girvi_loans girvi_loans_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_loans
    ADD CONSTRAINT girvi_loans_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: girvi_loans girvi_loans_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_loans
    ADD CONSTRAINT girvi_loans_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: girvi_renewals girvi_renewals_girvi_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_renewals
    ADD CONSTRAINT girvi_renewals_girvi_loan_id_fkey FOREIGN KEY (girvi_loan_id) REFERENCES public.girvi_loans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: girvi_settlements girvi_settlements_girvi_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.girvi_settlements
    ADD CONSTRAINT girvi_settlements_girvi_loan_id_fkey FOREIGN KEY (girvi_loan_id) REFERENCES public.girvi_loans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_item_images inventory_item_images_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_item_images
    ADD CONSTRAINT inventory_item_images_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_purchase_receipt_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_purchase_receipt_item_id_fkey FOREIGN KEY (purchase_receipt_item_id) REFERENCES public.purchase_receipt_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_tags inventory_tags_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_tags
    ADD CONSTRAINT inventory_tags_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_transfers inventory_transfers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_dispatched_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_dispatched_by_fkey FOREIGN KEY (dispatched_by) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_received_by_fkey FOREIGN KEY (received_by) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_transfers inventory_transfers_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transfers
    ADD CONSTRAINT inventory_transfers_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: job_work_material_issues job_work_material_issues_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_material_issues
    ADD CONSTRAINT job_work_material_issues_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: job_work_material_issues job_work_material_issues_job_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_material_issues
    ADD CONSTRAINT job_work_material_issues_job_work_order_id_fkey FOREIGN KEY (job_work_order_id) REFERENCES public.job_work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_work_orders job_work_orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_orders
    ADD CONSTRAINT job_work_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: job_work_orders job_work_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_orders
    ADD CONSTRAINT job_work_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: job_work_orders job_work_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_orders
    ADD CONSTRAINT job_work_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: job_work_receipts job_work_receipts_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_receipts
    ADD CONSTRAINT job_work_receipts_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: job_work_receipts job_work_receipts_job_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_work_receipts
    ADD CONSTRAINT job_work_receipts_job_work_order_id_fkey FOREIGN KEY (job_work_order_id) REFERENCES public.job_work_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: making_charges making_charges_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.making_charges
    ADD CONSTRAINT making_charges_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: metal_rates metal_rates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metal_rates
    ADD CONSTRAINT metal_rates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_categories product_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_sub_categories product_sub_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sub_categories
    ADD CONSTRAINT product_sub_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_sub_categories product_sub_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sub_categories
    ADD CONSTRAINT product_sub_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_sub_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sub_category_id_fkey FOREIGN KEY (sub_category_id) REFERENCES public.product_sub_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_bill_items purchase_bill_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bill_items
    ADD CONSTRAINT purchase_bill_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_bill_items purchase_bill_items_purchase_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bill_items
    ADD CONSTRAINT purchase_bill_items_purchase_bill_id_fkey FOREIGN KEY (purchase_bill_id) REFERENCES public.purchase_bills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_bill_items purchase_bill_items_purchase_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bill_items
    ADD CONSTRAINT purchase_bill_items_purchase_order_item_id_fkey FOREIGN KEY (purchase_order_item_id) REFERENCES public.purchase_order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_bill_items purchase_bill_items_purchase_receipt_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bill_items
    ADD CONSTRAINT purchase_bill_items_purchase_receipt_item_id_fkey FOREIGN KEY (purchase_receipt_item_id) REFERENCES public.purchase_receipt_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_bills purchase_bills_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bills
    ADD CONSTRAINT purchase_bills_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_bills purchase_bills_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bills
    ADD CONSTRAINT purchase_bills_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_bills purchase_bills_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_bills
    ADD CONSTRAINT purchase_bills_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_receipt_items purchase_receipt_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipt_items
    ADD CONSTRAINT purchase_receipt_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_receipt_items purchase_receipt_items_purchase_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipt_items
    ADD CONSTRAINT purchase_receipt_items_purchase_receipt_id_fkey FOREIGN KEY (purchase_receipt_id) REFERENCES public.purchase_receipts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_receipts purchase_receipts_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipts
    ADD CONSTRAINT purchase_receipts_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_return_items purchase_return_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_items
    ADD CONSTRAINT purchase_return_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_return_items purchase_return_items_purchase_bill_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_items
    ADD CONSTRAINT purchase_return_items_purchase_bill_item_id_fkey FOREIGN KEY (purchase_bill_item_id) REFERENCES public.purchase_bill_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_return_items purchase_return_items_purchase_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_items
    ADD CONSTRAINT purchase_return_items_purchase_return_id_fkey FOREIGN KEY (purchase_return_id) REFERENCES public.purchase_returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_returns purchase_returns_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_returns purchase_returns_purchase_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_purchase_bill_id_fkey FOREIGN KEY (purchase_bill_id) REFERENCES public.purchase_bills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_returns purchase_returns_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_returns purchase_returns_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_invoice_items sales_invoice_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_invoice_items sales_invoice_items_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_invoice_metal_rates sales_invoice_metal_rates_metal_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_metal_rates
    ADD CONSTRAINT sales_invoice_metal_rates_metal_rate_id_fkey FOREIGN KEY (metal_rate_id) REFERENCES public.metal_rates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_invoice_metal_rates sales_invoice_metal_rates_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_metal_rates
    ADD CONSTRAINT sales_invoice_metal_rates_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_invoices sales_invoices_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_invoices sales_invoices_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_invoices sales_invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_invoices sales_invoices_salesperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_salesperson_id_fkey FOREIGN KEY (salesperson_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_invoices sales_invoices_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES iam.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_payments sales_payments_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_payments
    ADD CONSTRAINT sales_payments_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_refunds sales_refunds_sales_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_refunds
    ADD CONSTRAINT sales_refunds_sales_return_id_fkey FOREIGN KEY (sales_return_id) REFERENCES public.sales_returns(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_return_items sales_return_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT sales_return_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_return_items sales_return_items_sales_invoice_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT sales_return_items_sales_invoice_item_id_fkey FOREIGN KEY (sales_invoice_item_id) REFERENCES public.sales_invoice_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_return_items sales_return_items_sales_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_items
    ADD CONSTRAINT sales_return_items_sales_return_id_fkey FOREIGN KEY (sales_return_id) REFERENCES public.sales_returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_returns sales_returns_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT sales_returns_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_returns sales_returns_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT sales_returns_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_returns sales_returns_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT sales_returns_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_adjustments stock_adjustments_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_adjustments stock_adjustments_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_audit_items stock_audit_items_audit_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_items
    ADD CONSTRAINT stock_audit_items_audit_session_id_fkey FOREIGN KEY (audit_session_id) REFERENCES public.stock_audit_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_audit_items stock_audit_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_items
    ADD CONSTRAINT stock_audit_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_audit_sessions stock_audit_sessions_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_sessions
    ADD CONSTRAINT stock_audit_sessions_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_audit_sessions stock_audit_sessions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_sessions
    ADD CONSTRAINT stock_audit_sessions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_audit_sessions stock_audit_sessions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_audit_sessions
    ADD CONSTRAINT stock_audit_sessions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tax_rates tax_rates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: third_party_girvi_collaterals third_party_girvi_collaterals_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvi_collaterals
    ADD CONSTRAINT third_party_girvi_collaterals_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: third_party_girvi_collaterals third_party_girvi_collaterals_third_party_girvi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvi_collaterals
    ADD CONSTRAINT third_party_girvi_collaterals_third_party_girvi_id_fkey FOREIGN KEY (third_party_girvi_id) REFERENCES public.third_party_girvis(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: third_party_girvis third_party_girvis_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvis
    ADD CONSTRAINT third_party_girvis_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: third_party_girvis third_party_girvis_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvis
    ADD CONSTRAINT third_party_girvis_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: third_party_girvis third_party_girvis_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvis
    ADD CONSTRAINT third_party_girvis_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: third_party_girvis third_party_girvis_third_party_lender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_girvis
    ADD CONSTRAINT third_party_girvis_third_party_lender_id_fkey FOREIGN KEY (third_party_lender_id) REFERENCES public.third_party_lenders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: third_party_lenders third_party_lenders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_lenders
    ADD CONSTRAINT third_party_lenders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: third_party_lenders third_party_lenders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.third_party_lenders
    ADD CONSTRAINT third_party_lenders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_debit_notes vendor_debit_notes_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_debit_notes
    ADD CONSTRAINT vendor_debit_notes_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_debit_notes vendor_debit_notes_purchase_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_debit_notes
    ADD CONSTRAINT vendor_debit_notes_purchase_bill_id_fkey FOREIGN KEY (purchase_bill_id) REFERENCES public.purchase_bills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendor_debit_notes vendor_debit_notes_purchase_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_debit_notes
    ADD CONSTRAINT vendor_debit_notes_purchase_return_id_fkey FOREIGN KEY (purchase_return_id) REFERENCES public.purchase_returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendor_debit_notes vendor_debit_notes_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_debit_notes
    ADD CONSTRAINT vendor_debit_notes_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_payments vendor_payments_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_payments vendor_payments_purchase_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_purchase_bill_id_fkey FOREIGN KEY (purchase_bill_id) REFERENCES public.purchase_bills(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_payments vendor_payments_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendors vendors_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendors vendors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict MkOwj8cE2FtK4cDk1IK1pRKcoH3g0fMdcyrgHxKVC7OPbIkOZ4Yw4zCU1GrGnme

