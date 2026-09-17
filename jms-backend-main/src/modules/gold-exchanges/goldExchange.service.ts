import { prisma } from '../../database';
import { Prisma, ExchangeStatus } from '../../generated/prisma';
import { goldExchangeRepository, salesInvoiceRepository, metalRateRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import { CreateGoldExchangeDTO, FindGoldExchangesQueryDTO } from './goldExchange.types';

export class GoldExchangeService {
  private async generateExchangeNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `EXC-${year}-`;

    const latest = await client.customerGoldExchange.findFirst({
      where: { exchangeNumber: { startsWith: prefix } },
      orderBy: { exchangeNumber: 'desc' },
    });

    let seq = 1;
    if (latest && latest.exchangeNumber) {
      const parts = latest.exchangeNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }

  async createExchange(salesInvoiceId: string, dto: CreateGoldExchangeDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const invoice = await salesInvoiceRepository.findById(salesInvoiceId, tx);
      if (!invoice) {
        throw new NotFoundError('Sales invoice not found');
      }

      if (invoice.status !== 'DRAFT') {
        throw new BadRequestError('Gold exchange can only be created for DRAFT sales invoices');
      }

      const customerId = dto.customerId || invoice.customerId;
      if (customerId !== invoice.customerId) {
        throw new BadRequestError('Customer ID does not match the sales invoice customer');
      }

      const branchId = invoice.branchId;

      // Prepare items Decimal values
      const itemsToCreate = dto.items.map((item) => {
        const grossWeight = new Prisma.Decimal(item.grossWeight);
        const stoneWeight = new Prisma.Decimal(item.stoneWeight || 0);
        const netWeight = grossWeight.sub(stoneWeight);

        if (netWeight.lte(0)) {
          throw new BadRequestError('Net weight must be greater than 0');
        }

        return {
          metalType: item.metalType,
          purity: item.purity,
          grossWeight,
          stoneWeight,
          netWeight,
          deductionPercent: new Prisma.Decimal(item.deductionPercent || 0),
          remarks: item.remarks,
        };
      });

      const exchangeNumber = await this.generateExchangeNumber(tx);

      const exchange = await goldExchangeRepository.create(
        {
          salesInvoiceId,
          customerId,
          branchId,
          remarks: dto.remarks,
          createdBy: userId,
          items: itemsToCreate,
        },
        exchangeNumber,
        tx
      );

      return exchange;
    });
  }

  async valueExchange(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const exchange = await goldExchangeRepository.findById(id, tx);
      if (!exchange) {
        throw new NotFoundError('Gold exchange record not found');
      }

      if (exchange.status !== ExchangeStatus.REQUESTED) {
        throw new BadRequestError(`Cannot value gold exchange in '${exchange.status}' status. Only 'REQUESTED' exchanges can be valued.`);
      }

      const invoice = await salesInvoiceRepository.findById(exchange.salesInvoiceId, tx);
      if (!invoice) {
        throw new NotFoundError('Associated sales invoice not found');
      }
      if (invoice.status !== 'DRAFT') {
        throw new BadRequestError('Associated sales invoice must be in DRAFT state to value gold exchange');
      }

      const branch = invoice.branch as any;
      const companyId = branch.companyId;

      let totalGrossWeight = new Prisma.Decimal(0);
      let totalStoneWeight = new Prisma.Decimal(0);
      let totalNetWeight = new Prisma.Decimal(0);
      let totalMetalValue = new Prisma.Decimal(0);
      let totalDeductionAmount = new Prisma.Decimal(0);
      let totalExchangeValue = new Prisma.Decimal(0);

      for (const item of exchange.items) {
        const activeRate = await metalRateRepository.findCurrentRate(
          companyId,
          item.metalType,
          item.purity,
          new Date(),
          tx
        );

        if (!activeRate) {
          throw new BadRequestError(
            `No active metal rate found for ${item.metalType} ${item.purity}. Please set current metal rate first.`
          );
        }

        const ratePerGram = activeRate.ratePerGram;
        const metalValue = item.netWeight.mul(ratePerGram).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const deductionAmount = metalValue.mul(item.deductionPercent).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        let exchangeValue = metalValue.sub(deductionAmount);
        if (exchangeValue.lt(0)) {
          exchangeValue = new Prisma.Decimal(0);
        }

        await goldExchangeRepository.updateItem(
          item.id,
          {
            metalRate: { connect: { id: activeRate.id } },
            ratePerGram,
            metalValue,
            deductionAmount,
            exchangeValue,
          },
          tx
        );

        totalGrossWeight = totalGrossWeight.add(item.grossWeight);
        totalStoneWeight = totalStoneWeight.add(item.stoneWeight);
        totalNetWeight = totalNetWeight.add(item.netWeight);
        totalMetalValue = totalMetalValue.add(metalValue);
        totalDeductionAmount = totalDeductionAmount.add(deductionAmount);
        totalExchangeValue = totalExchangeValue.add(exchangeValue);
      }

      const updatedExchange = await goldExchangeRepository.update(
        id,
        {
          status: ExchangeStatus.VALUED,
          totalGrossWeight,
          totalStoneWeight,
          totalNetWeight,
          totalMetalValue,
          totalDeductionAmount,
          totalExchangeValue,
          updatedBy: userId,
        },
        tx
      );

      return updatedExchange;
    });
  }

  async applyExchange(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const exchange = await goldExchangeRepository.findById(id, tx);
      if (!exchange) {
        throw new NotFoundError('Gold exchange record not found');
      }

      if (exchange.status !== ExchangeStatus.VALUED) {
        throw new BadRequestError(`Cannot apply gold exchange in '${exchange.status}' status. Only 'VALUED' exchanges can be applied.`);
      }

      const invoice = await salesInvoiceRepository.findById(exchange.salesInvoiceId, tx);
      if (!invoice) {
        throw new NotFoundError('Associated sales invoice not found');
      }

      if (invoice.status !== 'DRAFT') {
        throw new BadRequestError('Gold exchange credit can only be applied to DRAFT sales invoices');
      }

      // Check if another applied exchange already exists for this invoice
      const existingApplied = await tx.customerGoldExchange.findFirst({
        where: {
          salesInvoiceId: invoice.id,
          status: ExchangeStatus.APPLIED,
          id: { not: id },
        },
      });

      if (existingApplied) {
        throw new ConflictError('An exchange credit has already been applied to this sales invoice');
      }

      const exchangeCredit = exchange.totalExchangeValue;
      let newOutstanding = invoice.grandTotal.sub(exchangeCredit).sub(invoice.totalPaid);
      if (newOutstanding.lt(0)) {
        newOutstanding = new Prisma.Decimal(0);
      }

      // Update invoice exchangeCredit & outstandingAmount
      await salesInvoiceRepository.update(
        invoice.id,
        {
          exchangeCredit,
          outstandingAmount: newOutstanding,
        },
        tx
      );

      // Mark exchange as APPLIED
      const appliedExchange = await goldExchangeRepository.update(
        id,
        {
          status: ExchangeStatus.APPLIED,
          appliedAt: new Date(),
          updatedBy: userId,
        },
        tx
      );

      return {
        exchange: appliedExchange,
        invoiceSettlement: {
          grandTotal: invoice.grandTotal.toString(),
          exchangeCredit: exchangeCredit.toString(),
          netPayable: invoice.grandTotal.sub(exchangeCredit).toString(),
          totalPaid: invoice.totalPaid.toString(),
          outstandingAmount: newOutstanding.toString(),
        },
      };
    });
  }

  async cancelExchange(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const exchange = await goldExchangeRepository.findById(id, tx);
      if (!exchange) {
        throw new NotFoundError('Gold exchange record not found');
      }

      if (exchange.status === ExchangeStatus.APPLIED) {
        throw new BadRequestError('Cannot cancel an exchange that has already been APPLIED to an invoice');
      }

      if (exchange.status === ExchangeStatus.CANCELLED) {
        throw new BadRequestError('Gold exchange is already CANCELLED');
      }

      const cancelledExchange = await goldExchangeRepository.update(
        id,
        {
          status: ExchangeStatus.CANCELLED,
          cancelledAt: new Date(),
          updatedBy: userId,
        },
        tx
      );

      return cancelledExchange;
    });
  }

  async getExchangeById(id: string) {
    const exchange = await goldExchangeRepository.findById(id);
    if (!exchange) {
      throw new NotFoundError('Gold exchange record not found');
    }
    return exchange;
  }

  async getAllExchanges(query: FindGoldExchangesQueryDTO) {
    return goldExchangeRepository.findAll({
      ...query,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });
  }

  async getInvoiceExchanges(invoiceId: string) {
    const invoice = await salesInvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Sales invoice not found');
    }
    return goldExchangeRepository.findByInvoiceId(invoiceId);
  }

  async getExchangeHistory(id: string) {
    const exchange = await goldExchangeRepository.findById(id);
    if (!exchange) {
      throw new NotFoundError('Gold exchange record not found');
    }
    return {
      exchangeId: exchange.id,
      exchangeNumber: exchange.exchangeNumber,
      status: exchange.status,
      createdAt: exchange.createdAt,
      createdBy: exchange.createdBy,
      appliedAt: exchange.appliedAt,
      cancelledAt: exchange.cancelledAt,
      updatedAt: exchange.updatedAt,
      updatedBy: exchange.updatedBy,
      totalNetWeight: exchange.totalNetWeight.toString(),
      totalExchangeValue: exchange.totalExchangeValue.toString(),
    };
  }
}

export const goldExchangeService = new GoldExchangeService();
