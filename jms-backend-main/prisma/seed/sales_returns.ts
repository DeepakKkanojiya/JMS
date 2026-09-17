import { prisma } from '../../src/database';
import { SalesReturnStatus, SalesInvoiceStatus, Prisma } from '../../src/generated/prisma';

export async function seedSalesReturns() {
  console.log('[SEED] Seeding Sales Returns...');

  const existingAny = await prisma.salesReturn.findFirst();
  if (existingAny) {
    console.log('[SEED] Sales Return seed data already exists. Skipping.');
    return;
  }

  const invoice = await prisma.salesInvoice.findFirst({
    where: {
      status: SalesInvoiceStatus.CONFIRMED,
      exchangeCredit: new Prisma.Decimal(0),
      items: {
        some: {},
      },
    },
    include: {
      items: {
        include: {
          inventoryItem: true,
        },
      },
      customer: true,
      branch: true,
    },
  });

  if (!invoice || invoice.items.length === 0) {
    console.log('[SEED] Skipping Sales Returns: No confirmed invoice eligible for return found.');
    return;
  }

  const firstItem = invoice.items[0];
  const returnNumber = 'RET-2026-00001';

  const originalAmount = new Prisma.Decimal(firstItem.taxableAmount);
  const taxAmount = new Prisma.Decimal(firstItem.taxAmount);
  const deductionAmount = new Prisma.Decimal(0);
  const refundAmount = new Prisma.Decimal(firstItem.lineTotal);

  await prisma.salesReturn.create({
    data: {
      returnNumber,
      salesInvoiceId: invoice.id,
      customerId: invoice.customerId,
      branchId: invoice.branchId,
      status: SalesReturnStatus.REQUESTED,
      subtotal: originalAmount,
      taxAmount,
      deductionAmount,
      refundAmount,
      reason: 'Sample seed return request',
      remarks: 'Seeded test return',
      items: {
        create: [
          {
            salesInvoiceItemId: firstItem.id,
            inventoryItemId: firstItem.inventoryItemId,
            quantity: 1,
            originalAmount,
            taxAmount,
            deductionAmount,
            refundAmount,
            reason: 'Sample seed return item',
          },
        ],
      },
    },
  });

  console.log(`[PASS] Sample Sales Return ${returnNumber} created successfully.`);
}
