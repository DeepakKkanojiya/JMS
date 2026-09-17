import { prisma } from '../../database';
import { Prisma, RefundStatus, SalesReturnStatus } from '../../generated/prisma';
import { SalesRefundRepository } from '../../repositories/salesRefund.repository';
import { SalesReturnRepository } from '../../repositories/salesReturn.repository';
import { BadRequestError, NotFoundError, ConflictError } from '../../errors';
import { CreateSalesRefundDTO, ReverseSalesRefundDTO, SalesRefundFilters } from './salesRefund.types';

export class SalesRefundService {
  private salesRefundRepo: SalesRefundRepository;
  private salesReturnRepo: SalesReturnRepository;

  constructor() {
    this.salesRefundRepo = new SalesRefundRepository();
    this.salesReturnRepo = new SalesReturnRepository();
  }

  private async generateRefundNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.salesRefundRepo.countByYear(year, tx);
    const sequence = String(count + 1).padStart(5, '0');
    return `REF-${year}-${sequence}`;
  }

  async createRefund(dto: CreateSalesRefundDTO, userId?: string) {
    const salesReturn = await this.salesReturnRepo.findById(dto.salesReturnId);
    if (!salesReturn) {
      throw new NotFoundError(`Sales Return not found with ID: ${dto.salesReturnId}`);
    }

    if (salesReturn.status !== SalesReturnStatus.PROCESSED) {
      throw new BadRequestError(
        `Cannot issue refund for Sales Return with status '${salesReturn.status}'. Refunds can only be issued for 'PROCESSED' returns.`
      );
    }

    const refundAmountDecimal = new Prisma.Decimal(dto.amount);
    if (refundAmountDecimal.lessThanOrEqualTo(0)) {
      throw new BadRequestError('Refund amount must be greater than 0.');
    }

    // Check existing completed refunds for this return
    const existingRefunds = await this.salesRefundRepo.findByReturnId(dto.salesReturnId);
    const totalAlreadyRefunded = existingRefunds
      .filter((r) => r.status === RefundStatus.COMPLETED)
      .reduce((sum, r) => sum.plus(new Prisma.Decimal(r.amount)), new Prisma.Decimal(0));

    const totalEligibleRefund = new Prisma.Decimal(salesReturn.refundAmount);
    const remainingEligible = totalEligibleRefund.minus(totalAlreadyRefunded);

    if (refundAmountDecimal.greaterThan(remainingEligible)) {
      throw new BadRequestError(
        `Requested refund amount (${refundAmountDecimal}) exceeds remaining eligible refund balance (${remainingEligible}). Total return refund amount: ${totalEligibleRefund}, Already refunded: ${totalAlreadyRefunded}.`
      );
    }

    return prisma.$transaction(async (tx) => {
      const refundNumber = await this.generateRefundNumber(tx);
      return this.salesRefundRepo.create(
        {
          salesReturnId: dto.salesReturnId,
          refundMethod: dto.refundMethod,
          amount: refundAmountDecimal,
          transactionReference: dto.transactionReference,
          remarks: dto.remarks,
          processedBy: userId,
        },
        refundNumber,
        tx
      );
    });
  }

  async reverseRefund(id: string, dto: ReverseSalesRefundDTO, userId?: string) {
    const refund = await this.salesRefundRepo.findById(id);
    if (!refund) {
      throw new NotFoundError(`Sales Refund not found with ID: ${id}`);
    }

    if (refund.status === RefundStatus.REVERSED) {
      throw new BadRequestError(`Sales Refund #${refund.refundNumber} is already REVERSED.`);
    }

    if (refund.status !== RefundStatus.COMPLETED) {
      throw new BadRequestError(
        `Cannot reverse Sales Refund with status '${refund.status}'. Only COMPLETED refunds can be reversed.`
      );
    }

    if (!dto.reversalReason || dto.reversalReason.trim().length < 3) {
      throw new BadRequestError('A valid reversal reason of at least 3 characters is required.');
    }

    return this.salesRefundRepo.reverse(id, {
      reversedBy: userId || '00000000-0000-0000-0000-000000000000',
      reversalReason: dto.reversalReason,
      reversedAt: new Date(),
    });
  }

  async getRefundById(id: string) {
    const refund = await this.salesRefundRepo.findById(id);
    if (!refund) {
      throw new NotFoundError(`Sales Refund not found with ID: ${id}`);
    }
    return refund;
  }

  async getRefunds(query: SalesRefundFilters) {
    const filters = {
      ...query,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };
    return this.salesRefundRepo.findAll(filters);
  }

  async getRefundsByReturnId(salesReturnId: string) {
    const salesReturn = await this.salesReturnRepo.findById(salesReturnId);
    if (!salesReturn) {
      throw new NotFoundError(`Sales Return not found with ID: ${salesReturnId}`);
    }
    return this.salesRefundRepo.findByReturnId(salesReturnId);
  }
}
