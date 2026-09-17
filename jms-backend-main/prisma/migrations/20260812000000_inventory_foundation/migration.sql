-- CreateTable
CREATE TABLE "public"."inventory_items" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_code" TEXT NOT NULL,
    "gross_weight" DECIMAL(10,3) NOT NULL,
    "net_weight" DECIMAL(10,3) NOT NULL,
    "stone_weight" DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    "purity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_tags" (
    "id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "rfid_epc" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tagged_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "inventory_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_movements" (
    "id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "from_branch_id" UUID,
    "to_branch_id" UUID,
    "movement_type" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "remarks" TEXT,
    "performed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_adjustments" (
    "id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "previous_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "previous_gross_weight" DECIMAL(10,3) NOT NULL,
    "new_gross_weight" DECIMAL(10,3) NOT NULL,
    "previous_net_weight" DECIMAL(10,3) NOT NULL,
    "new_net_weight" DECIMAL(10,3) NOT NULL,
    "reason" TEXT NOT NULL,
    "adjusted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_item_code_key" ON "public"."inventory_items"("item_code");

-- CreateIndex
CREATE INDEX "inventory_items_product_id_idx" ON "public"."inventory_items"("product_id");

-- CreateIndex
CREATE INDEX "inventory_items_branch_id_idx" ON "public"."inventory_items"("branch_id");

-- CreateIndex
CREATE INDEX "inventory_items_status_idx" ON "public"."inventory_items"("status");

-- CreateIndex
CREATE INDEX "inventory_items_created_at_idx" ON "public"."inventory_items"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_tags_inventory_item_id_key" ON "public"."inventory_tags"("inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_tags_barcode_key" ON "public"."inventory_tags"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_tags_qr_code_key" ON "public"."inventory_tags"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_tags_rfid_epc_key" ON "public"."inventory_tags"("rfid_epc");

-- CreateIndex
CREATE INDEX "inventory_tags_inventory_item_id_idx" ON "public"."inventory_tags"("inventory_item_id");

-- CreateIndex
CREATE INDEX "stock_movements_inventory_item_id_idx" ON "public"."stock_movements"("inventory_item_id");

-- CreateIndex
CREATE INDEX "stock_movements_from_branch_id_idx" ON "public"."stock_movements"("from_branch_id");

-- CreateIndex
CREATE INDEX "stock_movements_to_branch_id_idx" ON "public"."stock_movements"("to_branch_id");

-- CreateIndex
CREATE INDEX "stock_movements_movement_type_idx" ON "public"."stock_movements"("movement_type");

-- CreateIndex
CREATE INDEX "stock_movements_created_at_idx" ON "public"."stock_movements"("created_at");

-- CreateIndex
CREATE INDEX "stock_adjustments_inventory_item_id_idx" ON "public"."stock_adjustments"("inventory_item_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_branch_id_idx" ON "public"."stock_adjustments"("branch_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_created_at_idx" ON "public"."stock_adjustments"("created_at");

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_tags" ADD CONSTRAINT "inventory_tags_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_from_branch_id_fkey" FOREIGN KEY ("from_branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_to_branch_id_fkey" FOREIGN KEY ("to_branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_adjustments" ADD CONSTRAINT "stock_adjustments_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_adjustments" ADD CONSTRAINT "stock_adjustments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
