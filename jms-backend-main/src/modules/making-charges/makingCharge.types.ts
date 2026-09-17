import { MetalType, MakingChargeType } from '../../generated/prisma';

export interface CreateMakingChargeDTO {
  companyId: string;
  metalType: MetalType;
  purity: string;
  chargeType: MakingChargeType;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateMakingChargeDTO {
  rate?: number;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface MakingChargeQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  metalType?: MetalType;
  purity?: string;
  chargeType?: MakingChargeType;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
