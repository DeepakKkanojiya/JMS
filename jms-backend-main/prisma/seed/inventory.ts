import { prisma } from '../../src/database';

export async function seedInventory() {
  console.log('[SEED] Seeding Real Inventory Items with Barcode & QR Tags...');

  const mainBranch = await prisma.branch.findFirst({
    where: { branchCode: 'BR-DEL-01' },
  });

  const ownerUser = await prisma.user.findUnique({
    where: { email: 'owner@jewelleryerp.com' },
  });

  if (!mainBranch) {
    console.log('[WARN] Main branch BR-DEL-01 not found. Skipping inventory seed.');
    return;
  }

  const products = await prisma.product.findMany();
  if (products.length === 0) {
    console.log('[WARN] No products found for inventory seeding.');
    return;
  }

  const inventoryStockData = [
    {
      sku: 'SKU-GOLD-RNG-22K-001',
      itemCode: 'INV-RNG-00001',
      barcode: 'BC-RNG-00001',
      grossWeight: 5.45,
      netWeight: 5.45,
      stoneWeight: 0.0,
      purity: '22K',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
    },
    {
      sku: 'SKU-GOLD-NCK-22K-002',
      itemCode: 'INV-NCK-00001',
      barcode: 'BC-NCK-00001',
      grossWeight: 38.2,
      netWeight: 38.2,
      stoneWeight: 0.0,
      purity: '22K',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    },
    {
      sku: 'SKU-GOLD-CHN-22K-003',
      itemCode: 'INV-CHN-00001',
      barcode: 'BC-CHN-00001',
      grossWeight: 14.5,
      netWeight: 14.5,
      stoneWeight: 0.0,
      purity: '22K',
      imageUrl: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?w=600',
    },
    {
      sku: 'SKU-GOLD-BNG-22K-004',
      itemCode: 'INV-BNG-00001',
      barcode: 'BC-BNG-00001',
      grossWeight: 26.8,
      netWeight: 26.8,
      stoneWeight: 0.0,
      purity: '22K',
      imageUrl: 'https://images.unsplash.com/photo-1611591475102-4fa1b7765e7e?w=600',
    },
    {
      sku: 'SKU-DMD-RNG-18K-005',
      itemCode: 'INV-DMD-00001',
      barcode: 'BC-DMD-00001',
      grossWeight: 3.85,
      netWeight: 3.7,
      stoneWeight: 0.15,
      purity: '18K',
      imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600',
    },
    {
      sku: 'SKU-SLV-COIN-999-007',
      itemCode: 'INV-SLV-00001',
      barcode: 'BC-SLV-00001',
      grossWeight: 50.0,
      netWeight: 50.0,
      stoneWeight: 0.0,
      purity: '999',
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600',
    },
    {
      sku: 'SKU-PLT-BND-950-008',
      itemCode: 'INV-PLT-00001',
      barcode: 'BC-PLT-00001',
      grossWeight: 6.25,
      netWeight: 6.25,
      stoneWeight: 0.0,
      purity: '950',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
    },
  ];

  for (const item of inventoryStockData) {
    const prod = products.find((p) => p.sku === item.sku);
    if (!prod) continue;

    const invItem = await prisma.inventoryItem.upsert({
      where: {
        companyId_itemCode: { companyId: mainBranch.companyId, itemCode: item.itemCode },
      },
      update: {
        status: 'AVAILABLE',
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        stoneWeight: item.stoneWeight,
      },
      create: {
        companyId: mainBranch.companyId,
        productId: prod.id,
        branchId: mainBranch.id,
        itemCode: item.itemCode,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        stoneWeight: item.stoneWeight,
        fineWeight: Number(item.netWeight) * 0.916, // Default Gold 22K multiplier rate
        purity: item.purity,
        status: 'AVAILABLE',
        createdBy: ownerUser?.id,
        tags: {
          create: {
            barcode: item.barcode,
            isActive: true,
          },
        },
        images: {
          create: [
            {
              imageUrl: item.imageUrl,
              thumbnailUrl: item.imageUrl,
              altText: `${prod.name} Stock Tagged Piece`,
              isPrimary: true,
            },
          ],
        },
      },
    });

    // Record STOCK_IN movement
    const existingMovement = await prisma.stockMovement.findFirst({
      where: { inventoryItemId: invItem.id, movementType: 'STOCK_IN' },
    });

    if (!existingMovement) {
      await prisma.stockMovement.create({
        data: {
          inventoryItemId: invItem.id,
          toBranchId: mainBranch.id,
          movementType: 'STOCK_IN',
          referenceType: 'BULLION_PURCHASE_RECEIPT',
          referenceId: `GRN-2026-${item.itemCode}`,
          remarks: `Initial physical stock intake for ${prod.name} into Connaught Place vault`,
          performedBy: ownerUser?.id,
        },
      });
    }
  }

  console.log(`[PASS] Seeded ${inventoryStockData.length} physical inventory items with barcode tags.`);
}
