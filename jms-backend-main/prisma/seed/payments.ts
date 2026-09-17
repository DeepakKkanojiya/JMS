import { prisma } from '../../src/database';

export async function seedPayments() {
  console.log('[SEED] Checking Sales Payment Seed Data...');

  // Find a confirmed invoice to optionally attach initial seed payment
  const confirmedInvoice = await prisma.salesInvoice.findFirst({
    where: { status: 'CONFIRMED' },
    include: { payments: true },
  });

  if (!confirmedInvoice) {
    console.log('[SEED] No CONFIRMED sales invoice found. Skipping payment seed safely.');
    return;
  }

  if (confirmedInvoice.payments.length > 0) {
    console.log('[SEED] Confirmed invoice already has payments. Payment seed is idempotent.');
    return;
  }

  const cashier = await prisma.user.findFirst({
    where: { email: 'cashier@jewelleryerp.com' },
  });

  const paymentNumber = `PAY-2026-${Date.now().toString().slice(-5)}`;

  await prisma.$transaction(async (tx) => {
    await tx.salesPayment.create({
      data: {
        salesInvoiceId: confirmedInvoice.id,
        paymentNumber,
        paymentMethod: 'CASH',
        amount: confirmedInvoice.grandTotal,
        status: 'COMPLETED',
        remarks: 'Initial full cash payment via seed script',
        receivedBy: cashier?.id || null,
      },
    });

    await tx.salesInvoice.update({
      where: { id: confirmedInvoice.id },
      data: {
        totalPaid: confirmedInvoice.grandTotal,
        outstandingAmount: 0.00,
        paymentStatus: 'PAID',
      },
    });
  });

  console.log(`[PASS] Sample payment ${paymentNumber} created for invoice ${confirmedInvoice.invoiceNumber}.`);
}
