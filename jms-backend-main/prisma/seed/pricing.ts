import { prisma } from '../../src/database';
import { MetalType, MakingChargeType } from '../../src/generated/prisma';

export async function seedPricing() {
  console.log('[SEED] Seeding Making Charges & Tax Rates...');

  const companies = await prisma.company.findMany({ where: { isActive: true } });
  if (companies.length === 0) {
    console.log('[SEED] Warning: No active company found for pricing seed.');
    return;
  }

  const effectiveFrom = new Date('2026-01-01T00:00:00.000Z');

  for (const company of companies) {
    // 1. Making Charges
    const makingCharges = [
      {
        companyId: company.id,
        metalType: MetalType.GOLD,
        purity: '22K',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 450.0,
        effectiveFrom,
      },
      {
        companyId: company.id,
        metalType: MetalType.GOLD,
        purity: '18K',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 400.0,
        effectiveFrom,
      },
      {
        companyId: company.id,
        metalType: MetalType.GOLD,
        purity: '14K',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 350.0,
        effectiveFrom,
      },
      {
        companyId: company.id,
        metalType: MetalType.SILVER,
        purity: '999',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 15.0,
        effectiveFrom,
      },
      {
        companyId: company.id,
        metalType: MetalType.SILVER,
        purity: '925',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 25.0,
        effectiveFrom,
      },
      {
        companyId: company.id,
        metalType: MetalType.PLATINUM,
        purity: '950',
        chargeType: MakingChargeType.PER_GRAM,
        rate: 550.0,
        effectiveFrom,
      },
    ];

    for (const mc of makingCharges) {
      const existing = await prisma.makingCharge.findFirst({
        where: {
          companyId: mc.companyId,
          metalType: mc.metalType,
          purity: mc.purity,
          isActive: true,
        },
      });

      if (!existing) {
        await prisma.makingCharge.create({ data: mc });
      }
    }

    // 2. Tax Rates (Intra-state GST 3% and Inter-state IGST 3%)
    const taxRates = [
      {
        companyId: company.id,
        taxName: 'GST (CGST 1.5% + SGST 1.5%)',
        taxCode: 'GST_3',
        rate: 3.0,
        effectiveFrom,
      },
      {
        companyId: company.id,
        taxName: 'Integrated GST (IGST 3%)',
        taxCode: 'IGST_3',
        rate: 3.0,
        effectiveFrom,
      },
    ];

    for (const tr of taxRates) {
      const existing = await prisma.taxRate.findFirst({
        where: {
          companyId: tr.companyId,
          taxCode: tr.taxCode,
          isActive: true,
        },
      });

      if (!existing) {
        await prisma.taxRate.create({ data: tr });
      }
    }
  }

  console.log('[PASS] Making Charges & Tax Rates Seeded Successfully for all active companies.');
}
