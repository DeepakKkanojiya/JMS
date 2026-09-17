import { MetalType, ExchangeStatus } from '../../generated/prisma';

export interface GoldExchangeItemInputDTO {
  metalType: MetalType;
  purity: string;
  grossWeight: number;
  stoneWeight?: number;
  deductionPercent?: number;
  remarks?: string;
}

export interface CreateGoldExchangeDTO {
  customerId?: string;
  remarks?: string;
  items: GoldExchangeItemInputDTO[];
}

export interface FindGoldExchangesQueryDTO {
  search?: string;
  exchangeNumber?: string;
  customerId?: string;
  salesInvoiceId?: string;
  branchId?: string;
  status?: ExchangeStatus;
  metalType?: MetalType;
  purity?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
