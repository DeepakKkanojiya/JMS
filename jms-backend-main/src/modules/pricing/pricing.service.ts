import { prisma } from '../../database';
import { Prisma, MetalType, MakingChargeType, SalesInvoiceStatus } from '../../generated/prisma';
import { calculatePricingBodySchema } from './pricing.validation';
import { CalculatePricingDTO, InvoicePricingBreakdown, LineItemPricingBreakdown, TaxType } from './pricing.types';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import { makingChargeRepository } from '../../repositories/makingCharge.repository';
import { taxRateRepository } from '../../repositories/taxRate.repository';

export class PricingService {
  /**
   * Calculate line item breakdown and invoice totals, persisting values atomically.
   */
  async calculateInvoicePricing(
    invoiceId: string,
    dto: CalculatePricingDTO
  ): Promise<InvoicePricingBreakdown> {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        branch: true,
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true,
              },
            },
          },
        },
        metalRateSnapshot: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${invoiceId}' not found.`);
    }

    if (invoice.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestError(
        `Pricing calculation is only allowed for DRAFT invoices. Current status is '${invoice.status}'.`
      );
    }

    if (!invoice.items || invoice.items.length === 0) {
      throw new BadRequestError('Cannot calculate pricing for an invoice with no line items.');
    }

    if (!invoice.metalRateLocked || !invoice.metalRateSnapshot) {
      throw new BadRequestError(
        'Metal rate must be locked on the invoice before pricing calculation can be performed.'
      );
    }

    const companyId = invoice.branch.companyId;
    const lockedRatePerGram = new Prisma.Decimal(invoice.metalRateSnapshot.ratePerGram);
    const taxType = dto.taxType || 'INTRA_STATE';

    // Resolve Default Tax Rate
    let defaultTaxRate = new Prisma.Decimal(3.00); // Default GST 3%
    if (dto.taxRate !== undefined) {
      defaultTaxRate = new Prisma.Decimal(dto.taxRate);
    } else {
      const activeTax = await taxRateRepository.findCurrent(companyId, 'GST_3');
      if (activeTax) {
        defaultTaxRate = new Prisma.Decimal(activeTax.rate);
      }
    }

    const calculatedLineItems: Array<{
      item: (typeof invoice.items)[0];
      metalValue: Prisma.Decimal;
      wastagePercent: Prisma.Decimal;
      wastageWeight: Prisma.Decimal;
      wastageValue: Prisma.Decimal;
      makingChargeType: MakingChargeType;
      makingChargeRate: Prisma.Decimal;
      makingChargeAmount: Prisma.Decimal;
      taxableAmount: Prisma.Decimal;
      taxRate: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      lineTotal: Prisma.Decimal;
      lineBreakdown: LineItemPricingBreakdown;
    }> = [];

    let totalMetalValue = new Prisma.Decimal(0);
    let totalWastageValue = new Prisma.Decimal(0);
    let totalMakingCharges = new Prisma.Decimal(0);
    let totalTaxableAmount = new Prisma.Decimal(0);
    let totalTaxAmount = new Prisma.Decimal(0);
    let totalLineDiscount = new Prisma.Decimal(0);

    for (const item of invoice.items) {
      const invItem = item.inventoryItem;
      const netWeight = new Prisma.Decimal(invItem.netWeight);
      const discountAmount = new Prisma.Decimal(item.discountAmount);

      // 1. Metal Value = Net Weight * Locked Rate Per Gram
      const metalValue = netWeight.mul(lockedRatePerGram).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      // 2. Wastage Weight & Value
      const wastagePercent = dto.wastagePercent !== undefined
        ? new Prisma.Decimal(dto.wastagePercent)
        : new Prisma.Decimal(0);
      
      const wastageWeight = netWeight.mul(wastagePercent.div(100)).toDecimalPlaces(3, Prisma.Decimal.ROUND_HALF_UP);
      const wastageValue = wastageWeight.mul(lockedRatePerGram).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      // 3. Making Charges Resolution
      let chargeType: MakingChargeType = MakingChargeType.PER_GRAM;
      let chargeRate = new Prisma.Decimal(0);

      if (dto.makingChargeType !== undefined && dto.makingChargeRate !== undefined) {
        chargeType = dto.makingChargeType;
        chargeRate = new Prisma.Decimal(dto.makingChargeRate);
      } else {
        const mc = await makingChargeRepository.findCurrent(
          companyId,
          invItem.product.metalType as MetalType,
          invItem.purity
        );
        if (mc) {
          chargeType = mc.chargeType;
          chargeRate = new Prisma.Decimal(mc.rate);
        }
      }

      let makingChargeAmount = new Prisma.Decimal(0);
      if (chargeType === MakingChargeType.PER_GRAM) {
        makingChargeAmount = netWeight.mul(chargeRate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      } else if (chargeType === MakingChargeType.FIXED) {
        makingChargeAmount = chargeRate.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      } else if (chargeType === MakingChargeType.PERCENTAGE) {
        const baseAmount = metalValue.add(wastageValue);
        makingChargeAmount = baseAmount.mul(chargeRate.div(100)).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      }

      // 4. Taxable Amount = Metal Value + Wastage Value + Making Charges - Discount
      const baseTaxable = metalValue.add(wastageValue).add(makingChargeAmount).sub(discountAmount);
      const taxableAmount = baseTaxable.gte(0) ? baseTaxable.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP) : new Prisma.Decimal(0);

      // 5. Tax Calculation
      const taxRate = defaultTaxRate;
      const taxAmount = taxableAmount.mul(taxRate.div(100)).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      // 6. Line Total = Taxable Amount + Tax Amount
      const lineTotal = taxableAmount.add(taxAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      totalMetalValue = totalMetalValue.add(metalValue);
      totalWastageValue = totalWastageValue.add(wastageValue);
      totalMakingCharges = totalMakingCharges.add(makingChargeAmount);
      totalTaxableAmount = totalTaxableAmount.add(taxableAmount);
      totalTaxAmount = totalTaxAmount.add(taxAmount);
      totalLineDiscount = totalLineDiscount.add(discountAmount);

      const lineBreakdown: LineItemPricingBreakdown = {
        itemId: item.id,
        inventoryItemId: invItem.id,
        itemCode: invItem.itemCode,
        productName: invItem.product.name,
        netWeight: netWeight.toFixed(3),
        metalValue: metalValue.toFixed(2),
        wastagePercent: wastagePercent.toFixed(2),
        wastageWeight: wastageWeight.toFixed(3),
        wastageValue: wastageValue.toFixed(2),
        makingChargeType: chargeType,
        makingChargeRate: chargeRate.toFixed(2),
        makingChargeAmount: makingChargeAmount.toFixed(2),
        taxableAmount: taxableAmount.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };

      calculatedLineItems.push({
        item,
        metalValue,
        wastagePercent,
        wastageWeight,
        wastageValue,
        makingChargeType: chargeType,
        makingChargeRate: chargeRate,
        makingChargeAmount,
        taxableAmount,
        taxRate,
        taxAmount,
        lineTotal,
        lineBreakdown,
      });
    }

    // Split Tax based on INTRA_STATE vs INTER_STATE
    let cgstAmount = new Prisma.Decimal(0);
    let sgstAmount = new Prisma.Decimal(0);
    let igstAmount = new Prisma.Decimal(0);

    if (taxType === 'INTRA_STATE') {
      cgstAmount = totalTaxAmount.div(2).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      sgstAmount = totalTaxAmount.sub(cgstAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP); // Handles odd cents safely
      igstAmount = new Prisma.Decimal(0);
    } else {
      cgstAmount = new Prisma.Decimal(0);
      sgstAmount = new Prisma.Decimal(0);
      igstAmount = totalTaxAmount.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    }

    const totalInvoiceDiscount = new Prisma.Decimal(invoice.discountAmount).add(totalLineDiscount);
    const grandTotal = totalTaxableAmount.add(totalTaxAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    const now = new Date();

    // Persist all calculated fields atomically in a Prisma transaction
    await prisma.$transaction(async (tx) => {
      for (const calcItem of calculatedLineItems) {
        await tx.salesInvoiceItem.update({
          where: { id: calcItem.item.id },
          data: {
            metalValue: calcItem.metalValue,
            wastagePercent: calcItem.wastagePercent,
            wastageWeight: calcItem.wastageWeight,
            wastageValue: calcItem.wastageValue,
            makingChargeType: calcItem.makingChargeType,
            makingChargeRate: calcItem.makingChargeRate,
            makingChargeAmount: calcItem.makingChargeAmount,
            taxableAmount: calcItem.taxableAmount,
            taxRate: calcItem.taxRate,
            taxAmount: calcItem.taxAmount,
            lineTotal: calcItem.lineTotal,
          },
        });
      }

      await tx.salesInvoice.update({
        where: { id: invoiceId },
        data: {
          subtotal: totalMetalValue,
          metalValue: totalMetalValue,
          wastageValue: totalWastageValue,
          makingCharges: totalMakingCharges,
          taxableAmount: totalTaxableAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          taxAmount: totalTaxAmount,
          grandTotal,
          pricingCalculated: true,
          pricingCalculatedAt: now,
        },
      });
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      taxType,
      metalValue: totalMetalValue.toFixed(2),
      wastageValue: totalWastageValue.toFixed(2),
      makingCharges: totalMakingCharges.toFixed(2),
      taxableAmount: totalTaxableAmount.toFixed(2),
      discountAmount: totalInvoiceDiscount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      igstAmount: igstAmount.toFixed(2),
      taxAmount: totalTaxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      pricingCalculated: true,
      pricingCalculatedAt: now,
      items: calculatedLineItems.map((c) => c.lineBreakdown),
    };
  }

  /**
   * Get stored pricing breakdown for an invoice
   */
  async getInvoicePricing(invoiceId: string): Promise<InvoicePricingBreakdown> {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${invoiceId}' not found.`);
    }

    const isInterstate = new Prisma.Decimal(invoice.igstAmount).gt(0);
    const taxType: TaxType = isInterstate ? 'INTER_STATE' : 'INTRA_STATE';

    const items: LineItemPricingBreakdown[] = invoice.items.map((item) => {
      const invItem = item.inventoryItem;
      return {
        itemId: item.id,
        inventoryItemId: invItem.id,
        itemCode: invItem.itemCode,
        productName: invItem.product.name,
        netWeight: new Prisma.Decimal(invItem.netWeight).toFixed(3),
        metalValue: new Prisma.Decimal(item.metalValue).toFixed(2),
        wastagePercent: new Prisma.Decimal(item.wastagePercent).toFixed(2),
        wastageWeight: new Prisma.Decimal(item.wastageWeight).toFixed(3),
        wastageValue: new Prisma.Decimal(item.wastageValue).toFixed(2),
        makingChargeType: item.makingChargeType || MakingChargeType.PER_GRAM,
        makingChargeRate: new Prisma.Decimal(item.makingChargeRate).toFixed(2),
        makingChargeAmount: new Prisma.Decimal(item.makingChargeAmount).toFixed(2),
        taxableAmount: new Prisma.Decimal(item.taxableAmount).toFixed(2),
        taxRate: new Prisma.Decimal(item.taxRate).toFixed(2),
        taxAmount: new Prisma.Decimal(item.taxAmount).toFixed(2),
        lineTotal: new Prisma.Decimal(item.lineTotal).toFixed(2),
      };
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      taxType,
      metalValue: new Prisma.Decimal(invoice.metalValue).toFixed(2),
      wastageValue: new Prisma.Decimal(invoice.wastageValue).toFixed(2),
      makingCharges: new Prisma.Decimal(invoice.makingCharges).toFixed(2),
      taxableAmount: new Prisma.Decimal(invoice.taxableAmount).toFixed(2),
      discountAmount: new Prisma.Decimal(invoice.discountAmount).toFixed(2),
      cgstAmount: new Prisma.Decimal(invoice.cgstAmount).toFixed(2),
      sgstAmount: new Prisma.Decimal(invoice.sgstAmount).toFixed(2),
      igstAmount: new Prisma.Decimal(invoice.igstAmount).toFixed(2),
      taxAmount: new Prisma.Decimal(invoice.taxAmount).toFixed(2),
      grandTotal: new Prisma.Decimal(invoice.grandTotal).toFixed(2),
      pricingCalculated: invoice.pricingCalculated,
      pricingCalculatedAt: invoice.pricingCalculatedAt,
      items,
    };
  }
}

export const pricingService = new PricingService();
