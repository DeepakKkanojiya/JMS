import { prisma } from '../../src/database';
import { Prisma } from '../../src/generated/prisma';

export async function seedGoldExchanges() {
  console.log('[SEED] Seeding Gold Exchange Master Data...');

  const draftInvoice = await prisma.salesInvoice.findFirst({
    where: { status: 'DRAFT' },
    include: { customer: true, branch: true },
  });

  if (!draftInvoice) {
    console.log('[WARN] No DRAFT sales invoice found for seeding gold exchanges. Skipping.');
    return;
  }

  const existingExchange = await prisma.customerGoldExchange.findFirst({
    where: { salesInvoiceId: draftInvoice.id },
  });

  if (existingExchange) {
    console.log('[SEED] Sample gold exchange already exists. Skipping.');
    return;
  }

  const exchangeNumber = 'EXC-2026-00001';

  await prisma.customerGoldExchange.create({
    data: {
      exchangeNumber,
      salesInvoiceId: draftInvoice.id,
      customerId: draftInvoice.customerId,
      branchId: draftInvoice.branchId,
      status: 'REQUESTED',
      totalGrossWeight: new Prisma.Decimal(20.0),
      totalStoneWeight: new Prisma.Decimal(2.0),
      totalNetWeight: new Prisma.Decimal(18.0),
      totalMetalValue: new Prisma.Decimal(0.0),
      totalDeductionAmount: new Prisma.Decimal(0.0),
      totalExchangeValue: new Prisma.Decimal(0.0),
      remarks: 'Sample customer old gold exchange request',
      items: {
        create: [
          {
            metalType: 'GOLD',
            purity: '22K',
            grossWeight: new Prisma.Decimal(20.0),
            stoneWeight: new Prisma.Decimal(2.0),
            netWeight: new Prisma.Decimal(18.0),
            ratePerGram: new Prisma.Decimal(0.0),
            metalValue: new Prisma.Decimal(0.0),
            deductionPercent: new Prisma.Decimal(5.0),
            deductionAmount: new Prisma.Decimal(0.0),
            exchangeValue: new Prisma.Decimal(0.0),
            remarks: '22K Old Gold Bangle with stones',
          },
        ],
      },
    },
  });

  console.log('[PASS] Sample Gold Exchange Seeded Successfully.');
}
