import { prisma } from '../../src/database';
import { PurchaseReturnStatus, DebitNoteStatus } from '../../src/generated/prisma';

export async function seedPurchaseReturns() {
  console.log('[SEED] Seeding Purchase Returns & Vendor Debit Notes...');

  // Find active vendor and branch
  const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
  const branch = await prisma.branch.findFirst({ where: { isActive: true } });

  if (!vendor || !branch) {
    console.log('[SEED] Skipping Purchase Returns seed - missing active vendor or branch');
    return;
  }

  const returnNumber = 'PR-SEED-20260820-0001';
  const existing = await prisma.purchaseReturn.findUnique({
    where: { returnNumber },
  });

  if (!existing) {
    // Find an available inventory item to link (if available)
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { status: 'AVAILABLE' },
    });

    const returnItemGrossWeight = 10.0;
    const returnItemNetWeight = 9.5;
    const purchaseRate = 6000.0;
    const metalValue = returnItemNetWeight * purchaseRate; // 57000
    const makingCharges = 1000.0;
    const subtotal = metalValue + makingCharges; // 58000
    const taxAmount = subtotal * 0.03; // 1740
    const totalReturnAmount = subtotal + taxAmount; // 59740

    const purchaseReturn = await prisma.purchaseReturn.create({
      data: {
        returnNumber,
        vendorId: vendor.id,
        branchId: branch.id,
        status: PurchaseReturnStatus.PROCESSED,
        reason: 'DEFECTIVE_CLASP',
        notes: 'Sample seed purchase return for defective gold chain',
        subtotal,
        taxAmount,
        totalReturnAmount,
        returnDate: new Date(),
        processedAt: new Date(),
        items: {
          create: [
            {
              inventoryItemId: inventoryItem ? inventoryItem.id : null,
              itemName: 'Defective 22K Gold Chain',
              quantity: 1,
              grossWeight: returnItemGrossWeight,
              stoneWeight: 0.5,
              netWeight: returnItemNetWeight,
              purchaseRate,
              metalValue,
              makingCharges,
              taxRate: 3.0,
              taxAmount,
              lineTotal: totalReturnAmount,
            },
          ],
        },
      },
    });

    if (inventoryItem) {
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { status: 'RETURNED_TO_VENDOR' },
      });

      await prisma.stockMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          fromBranchId: branch.id,
          movementType: 'PURCHASE_RETURN',
          referenceType: 'PURCHASE_RETURN',
          referenceId: purchaseReturn.id,
          remarks: `Returned to vendor under seed return ${returnNumber}`,
        },
      });
    }

    // Seed Vendor Debit Note
    const debitNoteNumber = 'DN-SEED-2026-00001';
    await prisma.vendorDebitNote.create({
      data: {
        debitNoteNumber,
        purchaseReturnId: purchaseReturn.id,
        vendorId: vendor.id,
        branchId: branch.id,
        amount: totalReturnAmount,
        status: DebitNoteStatus.ISSUED,
        remarks: 'Sample seed debit note for purchase return',
      },
    });

    console.log(`[PASS] Purchase Return Seeded: ${returnNumber} & Debit Note: ${debitNoteNumber} (Amount: ₹${totalReturnAmount})`);
  } else {
    console.log('[SKIP] Purchase Return Seed already exists');
  }
}
