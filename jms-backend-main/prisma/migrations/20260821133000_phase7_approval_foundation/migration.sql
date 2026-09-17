-- CreateEnum
CREATE TYPE "public"."approval_status" AS ENUM ('DRAFT', 'ISSUED', 'WITH_CUSTOMER', 'RETURNED', 'PURCHASED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."approval_item_status" AS ENUM ('ISSUED', 'RETURNED', 'PURCHASED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."approvals" (
    "id" UUID NOT NULL,
    "approval_number" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "salesperson_id" UUID,
    "issue_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMPTZ NOT NULL,
    "status" "public"."approval_status" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."approval_items" (
    "id" UUID NOT NULL,
    "approval_id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_price" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "status" "public"."approval_item_status" NOT NULL DEFAULT 'ISSUED',
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "approval_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "approvals_approval_number_key" ON "public"."approvals"("approval_number");

-- CreateIndex
CREATE INDEX "approvals_company_id_idx" ON "public"."approvals"("company_id");

-- CreateIndex
CREATE INDEX "approvals_branch_id_idx" ON "public"."approvals"("branch_id");

-- CreateIndex
CREATE INDEX "approvals_customer_id_idx" ON "public"."approvals"("customer_id");

-- CreateIndex
CREATE INDEX "approvals_salesperson_id_idx" ON "public"."approvals"("salesperson_id");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "public"."approvals"("status");

-- CreateIndex
CREATE INDEX "approvals_approval_number_idx" ON "public"."approvals"("approval_number");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_company_id_approval_number_key" ON "public"."approvals"("company_id", "approval_number");

-- CreateIndex
CREATE INDEX "approval_items_approval_id_idx" ON "public"."approval_items"("approval_id");

-- CreateIndex
CREATE INDEX "approval_items_inventory_item_id_idx" ON "public"."approval_items"("inventory_item_id");

-- CreateIndex
CREATE INDEX "approval_items_status_idx" ON "public"."approval_items"("status");

-- AddForeignKey
ALTER TABLE "public"."approvals" ADD CONSTRAINT "approvals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approvals" ADD CONSTRAINT "approvals_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approvals" ADD CONSTRAINT "approvals_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approvals" ADD CONSTRAINT "approvals_salesperson_id_fkey" FOREIGN KEY ("salesperson_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_items" ADD CONSTRAINT "approval_items_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_items" ADD CONSTRAINT "approval_items_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
