import { prisma } from '../../src/database';
import { VendorPaymentMethod, VendorPaymentStatus, PurchaseBillStatus } from '../../src/generated/prisma';

export async function seedVendorPayments() {
  console.log('[SEED] Seeding Vendor Payments...');

  // Find an APPROVED purchase bill
  const bill = await prisma.purchaseBill.findFirst({
    where: {
      status: { in: [PurchaseBillStatus.APPROVED, PurchaseBillStatus.PARTIALLY_PAID] },
    },
    include: {
      vendor: true,
      branch: true,
    },
  });

  if (!bill) {
    console.log('[SEED] Skipping Vendor Payments seed - no APPROVED or PARTIALLY_PAID Purchase Bill found');
    return;
  }

  const paymentNumber = 'VPAY-SEED-2026-00001';
  const existing = await prisma.vendorPayment.findUnique({
    where: { paymentNumber },
  });

  if (!existing) {
    const paymentAmount = 10000.00;
    const payment = await prisma.vendorPayment.create({
      data: {
        purchaseBillId: bill.id,
        vendorId: bill.vendorId,
        branchId: bill.branchId,
        paymentNumber,
        paymentMethod: VendorPaymentMethod.BANK_TRANSFER,
        amount: paymentAmount,
        status: VendorPaymentStatus.COMPLETED,
        transactionReference: 'SEED-NEFT-99887766',
        remarks: 'Sample seed bank transfer payment for vendor payable settlement',
      },
    });

    // Update purchase bill totals
    const completedPayments = await prisma.vendorPayment.aggregate({
      where: { purchaseBillId: bill.id, status: VendorPaymentStatus.COMPLETED },
      _sum: { amount: true },
    });

    const totalPaid = completedPayments._sum.amount || paymentAmount;
    const grandTotal = Number(bill.grandTotal);
    const outstanding = Math.max(0, grandTotal - Number(totalPaid));
    const newStatus = outstanding === 0 ? PurchaseBillStatus.PAID : PurchaseBillStatus.PARTIALLY_PAID;

    await prisma.purchaseBill.update({
      where: { id: bill.id },
      data: {
        totalPaid,
        outstandingAmount: outstanding,
        status: newStatus,
      },
    });

    console.log(`[PASS] Vendor Payment Seeded: ${paymentNumber} (Amount: ₹${paymentAmount})`);
  } else {
    console.log('[SKIP] Vendor Payment Seed already exists');
  }
}
