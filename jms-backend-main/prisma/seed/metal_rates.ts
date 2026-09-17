import { prisma } from '../../src/database';
import { MetalType } from '../../src/generated/prisma';

export async function seedMetalRates() {
  console.log('[SEED] Seeding Company Daily Active Metal Rates...');

  const companies = await prisma.company.findMany({ where: { isActive: true } });
  if (companies.length === 0) {
    console.log('[SEED] Skipping Metal Rates Seed: No active companies found.');
    return;
  }

  const now = new Date();
  const effectiveFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

  const standardRates = [
    { metalType: MetalType.GOLD, purity: '24K', marketRatePerGram: 14900.0, ratePerGram: 15500.0 },
    { metalType: MetalType.GOLD, purity: '22K', marketRatePerGram: 13700.0, ratePerGram: 14250.0 },
    { metalType: MetalType.GOLD, purity: '18K', marketRatePerGram: 11150.0, ratePerGram: 11600.0 },
    { metalType: MetalType.GOLD, purity: '14K', marketRatePerGram: 8650.0, ratePerGram: 9000.0 },
    { metalType: MetalType.SILVER, purity: '999', marketRatePerGram: 148.0, ratePerGram: 155.0 },
    { metalType: MetalType.SILVER, purity: '925', marketRatePerGram: 136.0, ratePerGram: 142.0 },
    { metalType: MetalType.PLATINUM, purity: '950', marketRatePerGram: 6250.0, ratePerGram: 6500.0 },
  ];

  for (const company of companies) {
    for (const rate of standardRates) {
      const existing = await prisma.metalRate.findFirst({
        where: {
          companyId: company.id,
          metalType: rate.metalType,
          purity: rate.purity,
          isActive: true,
          effectiveTo: null,
        },
      });

      if (!existing) {
        await prisma.metalRate.create({
          data: {
            companyId: company.id,
            metalType: rate.metalType,
            purity: rate.purity,
            marketRatePerGram: rate.marketRatePerGram,
            ratePerGram: rate.ratePerGram,
            effectiveFrom,
            effectiveTo: null,
            isActive: true,
          },
        });
      }
    }
  }

  console.log('[PASS] Metal Rates Seeded Successfully for all active companies.');
}
