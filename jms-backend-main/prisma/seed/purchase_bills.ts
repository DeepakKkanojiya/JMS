import { prisma } from '../../src/database';
import { PurchaseOrderStatus, PurchaseReceiptStatus, PurchaseBillStatus } from '../../src/generated/prisma';

export async function seedPurchaseBills() {
  console.log('[SEED] Seeding Purchase Bills...');

  const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });
  const branch = await prisma.branch.findFirst({ where: { isActive: true } });
  const product = await prisma.product.findFirst({ where: { isActive: true } });

  if (!vendor || !branch || !product) {
    console.log('[SEED] Skipping Purchase Bills seed - missing vendor, branch, or product');
    return;
  }

  // 1. Create or find a seed PO
  const poNumber = 'PO-SEED-20260820-0001';
  let po = await prisma.purchaseOrder.findUnique({
    where: { purchaseOrderNumber: poNumber },
    include: { items: true, purchaseReceipts: { include: { items: true } } },
  });

  if (!po) {
    po = await prisma.purchaseOrder.create({
      data: {
        purchaseOrderNumber: poNumber,
        vendorId: vendor.id,
        branchId: branch.id,
        status: PurchaseOrderStatus.COMPLETED,
        subtotal: 100000.00,
        taxAmount: 3000.00,
        grandTotal: 103000.00,
        notes: 'Sample Seed Purchase Order for Billing',
        items: {
          create: [
            {
              productId: product.id,
              metalType: 'GOLD',
              purity: '22K',
              itemName: '22K Gold Seed Bangle',
              orderedQuantity: 5,
              receivedQuantity: 5,
              grossWeight: 50.000,
              netWeight: 48.000,
              stoneWeight: 2.000,
              expectedRate: 20000.00,
              makingCharges: 0.00,
              taxRate: 3.00,
              taxAmount: 3000.00,
              itemTotal: 103000.00,
            },
          ],
        },
      },
      include: { items: true, purchaseReceipts: { include: { items: true } } },
    });

    // Create receipt for the PO
    const receiptNumber = 'PR-SEED-20260820-0001';
    await prisma.purchaseReceipt.create({
      data: {
        purchaseReceiptNumber: receiptNumber,
        purchaseOrderId: po.id,
        status: PurchaseReceiptStatus.RECEIVED,
        subtotal: 100000.00,
        taxAmount: 3000.00,
        grandTotal: 103000.00,
        remarks: 'Seed physical intake',
        items: {
          create: [
            {
              productId: product.id,
              receivedQuantity: 5,
              grossWeight: 50.000,
              netWeight: 48.000,
              stoneWeight: 2.000,
              fineWeight: 44.000,
              purchaseRate: 20000.00,
              makingCharges: 0.00,
              taxRate: 3.00,
              taxAmount: 3000.00,
              itemTotal: 103000.00,
            },
          ],
        },
      },
    });

    // Re-fetch PO with receipts
    po = await prisma.purchaseOrder.findUnique({
      where: { id: po.id },
      include: { items: true, purchaseReceipts: { include: { items: true } } },
    })!;
  }

  const billNumber = 'PB-SEED-20260820-0001';
  const existingBill = await prisma.purchaseBill.findUnique({
    where: { billNumber },
  });

  if (!existingBill && po && po.items.length > 0) {
    const poItem = po.items[0];
    const receiptItem = po.purchaseReceipts[0]?.items[0];

    await prisma.purchaseBill.create({
      data: {
        billNumber,
        purchaseOrderId: po.id,
        vendorId: po.vendorId,
        branchId: po.branchId,
        status: PurchaseBillStatus.APPROVED,
        subtotal: 60000.00,
        discountAmount: 0.00,
        taxAmount: 1800.00,
        grandTotal: 61800.00,
        totalPaid: 0.00,
        outstandingAmount: 61800.00,
        notes: 'Idempotent seed purchase bill for partial billing intake',
        items: {
          create: [
            {
              purchaseOrderItemId: poItem.id,
              purchaseReceiptItemId: receiptItem?.id || null,
              itemName: poItem.itemName,
              quantity: 3,
              grossWeight: 30.000,
              stoneWeight: 1.200,
              netWeight: 28.800,
              purchaseRate: 2000.00,
              metalValue: 57600.00,
              makingCharges: 2400.00,
              discountAmount: 0.00,
              taxableAmount: 60000.00,
              taxRate: 3.00,
              taxAmount: 1800.00,
              lineTotal: 61800.00,
            },
          ],
        },
      },
    });
    console.log('[PASS] Purchase Bill Seeded: PB-SEED-20260820-0001');
  } else {
    console.log('[SKIP] Purchase Bill Seed already exists or missing PO items');
  }
}
