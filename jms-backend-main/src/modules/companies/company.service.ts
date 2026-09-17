import { companyRepository, CompanyRepository } from '../../repositories/company.repository';
import { CreateCompanyDTO, UpdateCompanyDTO, CompanyQueryDTO } from './company.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';

export class CompanyService {
  constructor(private repo: CompanyRepository = companyRepository) {}

  async createCompany(data: CreateCompanyDTO) {
    if (data.gstNumber) {
      const existingGst = await this.repo.findByGstNumber(data.gstNumber);
      if (existingGst) {
        throw new ConflictError(`Company with GSTIN '${data.gstNumber}' already exists.`);
      }
    }

    if (data.panNumber) {
      const existingPan = await this.repo.findByPanNumber(data.panNumber);
      if (existingPan) {
        throw new ConflictError(`Company with PAN '${data.panNumber}' already exists.`);
      }
    }

    return this.repo.create(data);
  }

  async getCompanies(query: CompanyQueryDTO) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const search = query.search?.trim();
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    return this.repo.findAll({ page, limit, search, isActive, sortBy, sortOrder });
  }

  async getCompanyById(id: string) {
    const company = await this.repo.findById(id);
    if (!company) {
      throw new NotFoundError(`Company with ID '${id}' not found.`);
    }
    return company;
  }

  async updateCompany(id: string, data: UpdateCompanyDTO) {
    await this.getCompanyById(id);

    if (data.gstNumber) {
      const existingGst = await this.repo.findByGstNumber(data.gstNumber);
      if (existingGst && existingGst.id !== id) {
        throw new ConflictError(`Company with GSTIN '${data.gstNumber}' already exists.`);
      }
    }

    if (data.panNumber) {
      const existingPan = await this.repo.findByPanNumber(data.panNumber);
      if (existingPan && existingPan.id !== id) {
        throw new ConflictError(`Company with PAN '${data.panNumber}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteCompany(id: string) {
    await this.getCompanyById(id);

    try {
      return await this.repo.delete(id);
    } catch (error: any) {
      if (
        error?.code === 'P2003' ||
        error?.code === 'P2014' ||
        (typeof error?.message === 'string' &&
          (error.message.includes('branches') ||
            error.message.includes('foreign key') ||
            error.message.includes('RESTRICT') ||
            error.message.includes('23001')))
      ) {
        throw new BadRequestError('Cannot delete company with active branches. Delete or reassign branches first.');
      }
      throw error;
    }
  }
}

export const companyService = new CompanyService();
