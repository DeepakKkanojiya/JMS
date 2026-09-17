-- CreateEnum
CREATE TYPE "public"."purchase_receipt_status" AS ENUM ('DRAFT', 'RECEIVED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_user_id_fkey";

-- DropIndex
DROP INDEX "users_employee_code_key";

-- DropIndex
DROP INDEX "public"."branches_branch_code_key";

-- DropIndex
DROP INDEX "public"."customers_customer_code_key";

-- DropIndex
DROP INDEX "public"."employees_employee_code_key";

-- DropIndex
DROP INDEX "public"."employees_user_id_key";

-- DropIndex
DROP INDEX "public"."inventory_items_item_code_key";

-- DropIndex
DROP INDEX "public"."inventory_tags_inventory_item_id_key";

-- DropIndex
DROP INDEX "public"."product_categories_code_key";

-- DropIndex
DROP INDEX "public"."product_categories_name_key";

-- DropIndex
DROP INDEX "public"."product_sub_categories_code_key";

-- DropIndex
DROP INDEX "public"."products_sku_key";

-- DropIndex
DROP INDEX "public"."vendors_vendor_code_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "employee_code",
ADD COLUMN     "employee_id" UUID;

-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "company_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."customers" ADD COLUMN     "company_id" UUID NOT NULL,
ALTER COLUMN "branch_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."employees" DROP COLUMN "branch_id",
DROP COLUMN "designation",
DROP COLUMN "user_id",
ADD COLUMN     "company_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."inventory_items" ADD COLUMN     "company_id" UUID NOT NULL,
ADD COLUMN     "fine_weight" DECIMAL(12,3) NOT NULL,
ADD COLUMN     "purchase_receipt_item_id" UUID,
ALTER COLUMN "gross_weight" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "net_weight" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "stone_weight" SET DATA TYPE DECIMAL(12,3);

-- AlterTable
ALTER TABLE "public"."product_categories" ADD COLUMN     "company_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."product_sub_categories" ADD COLUMN     "company_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "company_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."sales_invoice_items" ADD COLUMN     "fine_weight_snapshot" DECIMAL(12,3),
ADD COLUMN     "gross_weight_snapshot" DECIMAL(12,3),
ADD COLUMN     "metal_type_snapshot" TEXT,
ADD COLUMN     "net_weight_snapshot" DECIMAL(12,3),
ADD COLUMN     "product_name_snapshot" TEXT,
ADD COLUMN     "product_sku_snapshot" TEXT,
ADD COLUMN     "purity_snapshot" TEXT,
ADD COLUMN     "stone_weight_snapshot" DECIMAL(12,3),
ALTER COLUMN "wastage_weight" SET DATA TYPE DECIMAL(12,3);

-- AlterTable
ALTER TABLE "public"."sales_invoices" DROP COLUMN "created_by",
DROP COLUMN "updated_by",
ADD COLUMN     "branch_address_snapshot" TEXT,
ADD COLUMN     "branch_name_snapshot" TEXT,
ADD COLUMN     "company_address_snapshot" TEXT,
ADD COLUMN     "company_gst_snapshot" TEXT,
ADD COLUMN     "company_name_snapshot" TEXT,
ADD COLUMN     "created_by_user_id" UUID,
ADD COLUMN     "customer_address_snapshot" TEXT,
ADD COLUMN     "customer_gst_snapshot" TEXT,
ADD COLUMN     "customer_mobile_snapshot" TEXT,
ADD COLUMN     "customer_name_snapshot" TEXT,
ADD COLUMN     "updated_by_user_id" UUID;

-- AlterTable
ALTER TABLE "public"."vendors" ADD COLUMN     "company_id" UUID NOT NULL,
ALTER COLUMN "branch_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."employee_branch_assignments" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "designation" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employee_branch_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_receipts" (
    "id" UUID NOT NULL,
    "purchase_receipt_number" TEXT NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "status" "public"."purchase_receipt_status" NOT NULL DEFAULT 'DRAFT',
    "received_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "grand_total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_receipt_items" (
    "id" UUID NOT NULL,
    "purchase_receipt_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 1,
    "gross_weight" DECIMAL(12,3) NOT NULL,
    "net_weight" DECIMAL(12,3) NOT NULL,
    "stone_weight" DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    "fine_weight" DECIMAL(12,3) NOT NULL,
    "purchase_rate" DECIMAL(12,2) NOT NULL,
    "making_charges" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "item_total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financial_years" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "financial_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_series" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID,
    "financial_year_id" UUID NOT NULL,
    "document_type" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "next_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_receipts_purchase_receipt_number_key" ON "public"."purchase_receipts"("purchase_receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_company_id_branch_code_key" ON "public"."branches"("company_id", "branch_code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_code_key" ON "public"."companies"("company_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_customer_code_key" ON "public"."customers"("company_id", "customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_company_id_employee_code_key" ON "public"."employees"("company_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_company_id_item_code_key" ON "public"."inventory_items"("company_id", "item_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_company_id_code_key" ON "public"."product_categories"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "product_sub_categories_company_id_code_key" ON "public"."product_sub_categories"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_sku_key" ON "public"."products"("company_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_company_id_vendor_code_key" ON "public"."vendors"("company_id", "vendor_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendors" ADD CONSTRAINT "vendors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_categories" ADD CONSTRAINT "product_categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sub_categories" ADD CONSTRAINT "product_sub_categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_purchase_receipt_item_id_fkey" FOREIGN KEY ("purchase_receipt_item_id") REFERENCES "public"."purchase_receipt_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_invoices" ADD CONSTRAINT "sales_invoices_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_invoices" ADD CONSTRAINT "sales_invoices_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_branch_assignments" ADD CONSTRAINT "employee_branch_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_branch_assignments" ADD CONSTRAINT "employee_branch_assignments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipts" ADD CONSTRAINT "purchase_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipt_items" ADD CONSTRAINT "purchase_receipt_items_purchase_receipt_id_fkey" FOREIGN KEY ("purchase_receipt_id") REFERENCES "public"."purchase_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipt_items" ADD CONSTRAINT "purchase_receipt_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_years" ADD CONSTRAINT "financial_years_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_series" ADD CONSTRAINT "document_series_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_series" ADD CONSTRAINT "document_series_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_series" ADD CONSTRAINT "document_series_financial_year_id_fkey" FOREIGN KEY ("financial_year_id") REFERENCES "public"."financial_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

