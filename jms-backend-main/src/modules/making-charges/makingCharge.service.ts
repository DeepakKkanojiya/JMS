import { makingChargeRepository } from '../../repositories/makingCharge.repository';
import { companyRepository } from '../../repositories/company.repository';
import { CreateMakingChargeDTO, UpdateMakingChargeDTO, MakingChargeQueryDTO } from './makingCharge.types';
import { NotFoundError, ConflictError, ValidationError } from '../../errors';
import { MetalType } from '../../generated/prisma';

export class MakingChargeService {
  async createMakingCharge(dto: CreateMakingChargeDTO, userId?: string) {
    const company = await companyRepository.findById(dto.companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID '${dto.companyId}' not found.`);
    }

    const effectiveFrom = new Date(dto.effectiveFrom);
    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;

    if (effectiveTo && effectiveTo <= effectiveFrom) {
      throw new ValidationError('effectiveTo date must be strictly after effectiveFrom date.');
    }

    // Overlap Guard
    const overlap = await makingChargeRepository.findOverlappingRate(
      dto.companyId,
      dto.metalType,
      dto.purity,
      effectiveFrom,
      effectiveTo
    );

    if (overlap) {
      throw new ConflictError(
        `An active making charge configuration already exists for metal ${dto.metalType} (${dto.purity}) during the specified period.`
      );
    }

    return makingChargeRepository.create({
      companyId: dto.companyId,
      metalType: dto.metalType,
      purity: dto.purity,
      chargeType: dto.chargeType,
      rate: dto.rate,
      effectiveFrom,
      effectiveTo,
      createdBy: userId,
    });
  }

  async getMakingChargeById(id: string) {
    const charge = await makingChargeRepository.findById(id);
    if (!charge) {
      throw new NotFoundError(`Making charge configuration with ID '${id}' not found.`);
    }
    return charge;
  }

  async getCurrentMakingCharge(companyId: string, metalType: MetalType, purity: string, timestamp?: Date) {
    const charge = await makingChargeRepository.findCurrent(
      companyId,
      metalType,
      purity,
      timestamp || new Date()
    );
    if (!charge) {
      throw new NotFoundError(
        `No active making charge configuration found for company '${companyId}', metal ${metalType} (${purity}).`
      );
    }
    return charge;
  }

  async getMakingChargeHistory(companyId?: string, metalType?: MetalType, purity?: string) {
    return makingChargeRepository.findHistory(companyId, metalType, purity);
  }

  async getAllMakingCharges(query: MakingChargeQueryDTO) {
    return makingChargeRepository.findAll({
      ...query,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });
  }

  async updateMakingCharge(id: string, dto: UpdateMakingChargeDTO, userId?: string) {
    const existing = await makingChargeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Making charge configuration with ID '${id}' not found.`);
    }

    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : undefined;
    if (effectiveTo && effectiveTo <= existing.effectiveFrom) {
      throw new ValidationError('effectiveTo date must be strictly after effectiveFrom date.');
    }

    return makingChargeRepository.update(id, {
      rate: dto.rate,
      effectiveTo,
      isActive: dto.isActive,
      updatedBy: userId,
    });
  }

  async deactivateMakingCharge(id: string, userId?: string) {
    const existing = await makingChargeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Making charge configuration with ID '${id}' not found.`);
    }

    return makingChargeRepository.deactivate(id, userId);
  }
}

export const makingChargeService = new MakingChargeService();
