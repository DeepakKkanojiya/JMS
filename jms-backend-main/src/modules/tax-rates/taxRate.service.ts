import { taxRateRepository } from '../../repositories/taxRate.repository';
import { companyRepository } from '../../repositories/company.repository';
import { CreateTaxRateDTO, UpdateTaxRateDTO, TaxRateQueryDTO } from './taxRate.types';
import { NotFoundError, ConflictError, ValidationError } from '../../errors';

export class TaxRateService {
  async createTaxRate(dto: CreateTaxRateDTO, userId?: string) {
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
    const overlap = await taxRateRepository.findOverlappingRate(
      dto.companyId,
      dto.taxCode,
      effectiveFrom,
      effectiveTo
    );

    if (overlap) {
      throw new ConflictError(
        `An active tax rate configuration already exists for tax code '${dto.taxCode}' during the specified period.`
      );
    }

    return taxRateRepository.create({
      companyId: dto.companyId,
      taxName: dto.taxName,
      taxCode: dto.taxCode,
      rate: dto.rate,
      effectiveFrom,
      effectiveTo,
      createdBy: userId,
    });
  }

  async getTaxRateById(id: string) {
    const tax = await taxRateRepository.findById(id);
    if (!tax) {
      throw new NotFoundError(`Tax rate configuration with ID '${id}' not found.`);
    }
    return tax;
  }

  async getCurrentTaxRate(companyId: string, taxCode: string = 'GST_3', timestamp?: Date) {
    const tax = await taxRateRepository.findCurrent(
      companyId,
      taxCode,
      timestamp || new Date()
    );
    if (!tax) {
      throw new NotFoundError(
        `No active tax rate configuration found for company '${companyId}', tax code '${taxCode}'.`
      );
    }
    return tax;
  }

  async getTaxRateHistory(companyId?: string, taxCode?: string) {
    return taxRateRepository.findHistory(companyId, taxCode);
  }

  async getAllTaxRates(query: TaxRateQueryDTO) {
    return taxRateRepository.findAll({
      ...query,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });
  }

  async updateTaxRate(id: string, dto: UpdateTaxRateDTO, userId?: string) {
    const existing = await taxRateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Tax rate configuration with ID '${id}' not found.`);
    }

    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : undefined;
    if (effectiveTo && effectiveTo <= existing.effectiveFrom) {
      throw new ValidationError('effectiveTo date must be strictly after effectiveFrom date.');
    }

    return taxRateRepository.update(id, {
      taxName: dto.taxName,
      rate: dto.rate,
      effectiveTo,
      isActive: dto.isActive,
      updatedBy: userId,
    });
  }

  async deactivateTaxRate(id: string, userId?: string) {
    const existing = await taxRateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Tax rate configuration with ID '${id}' not found.`);
    }

    return taxRateRepository.deactivate(id, userId);
  }
}

export const taxRateService = new TaxRateService();
