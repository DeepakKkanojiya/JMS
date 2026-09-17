-- AlterTable
ALTER TABLE "public"."approvals" ADD COLUMN "required_deposit_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE "public"."approval_deposits" (
    "id" UUID NOT NULL,
    "approval_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "deposit_number" TEXT NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."payment_status" NOT NULL DEFAULT 'COMPLETED',
    "transaction_reference" TEXT,
    "payment_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "received_by" UUID,
    "reversed_at" TIMESTAMPTZ,
    "reversed_by" UUID,
    "reversal_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "approval_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "approval_deposits_deposit_number_key" ON "public"."approval_deposits"("deposit_number");

-- CreateIndex
CREATE INDEX "approval_deposits_approval_id_idx" ON "public"."approval_deposits"("approval_id");

-- CreateIndex
CREATE INDEX "approval_deposits_company_id_idx" ON "public"."approval_deposits"("company_id");

-- CreateIndex
CREATE INDEX "approval_deposits_branch_id_idx" ON "public"."approval_deposits"("branch_id");

-- CreateIndex
CREATE INDEX "approval_deposits_customer_id_idx" ON "public"."approval_deposits"("customer_id");

-- CreateIndex
CREATE INDEX "approval_deposits_status_idx" ON "public"."approval_deposits"("status");

-- CreateIndex
CREATE INDEX "approval_deposits_payment_method_idx" ON "public"."approval_deposits"("payment_method");

-- CreateIndex
CREATE INDEX "approval_deposits_payment_date_idx" ON "public"."approval_deposits"("payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "approval_deposits_company_id_deposit_number_key" ON "public"."approval_deposits"("company_id", "deposit_number");

-- AddForeignKey
ALTER TABLE "public"."approval_deposits" ADD CONSTRAINT "approval_deposits_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_deposits" ADD CONSTRAINT "approval_deposits_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_deposits" ADD CONSTRAINT "approval_deposits_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_deposits" ADD CONSTRAINT "approval_deposits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
