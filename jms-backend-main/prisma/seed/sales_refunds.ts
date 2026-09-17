import { prisma } from '../../src/database';
import { SalesReturnStatus, RefundStatus, PaymentMethod, Prisma } from '../../src/generated/prisma';

export async function seedSalesRefunds() {
  console.log('[SEED] Seeding Sales Refunds...');

  const existingAny = await prisma.salesRefund.findFirst();
  if (existingAny) {
    console.log('[SEED] Sales Refund seed data already exists. Skipping.');
    return;
  }

  const salesReturn = await prisma.salesReturn.findFirst({
    where: { status: SalesReturnStatus.PROCESSED },
  });

  if (!salesReturn) {
    console.log('[SEED] Skipping Sales Refunds: No processed sales return found.');
    return;
  }

  const refundNumber = 'REF-2026-00001';

  await prisma.salesRefund.create({
    data: {
      salesReturnId: salesReturn.id,
      refundNumber,
      refundMethod: PaymentMethod.CASH,
      amount: salesReturn.refundAmount,
      status: RefundStatus.COMPLETED,
      transactionReference: 'SEED-REFUND-001',
      remarks: 'Sample seed refund record',
    },
  });

  console.log(`[PASS] Sample Sales Refund ${refundNumber} created successfully.`);
}
