import { branchRepository, BranchRepository } from '../../repositories/branch.repository';
import { companyRepository, CompanyRepository } from '../../repositories/company.repository';
import { CreateBranchDTO, UpdateBranchDTO, BranchQueryDTO } from './branch.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';

export class BranchService {
  constructor(
    private repo: BranchRepository = branchRepository,
    private companyRepo: CompanyRepository = companyRepository
  ) {}

  async createBranch(data: CreateBranchDTO) {
    const company = await this.companyRepo.findById(data.companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID '${data.companyId}' not found.`);
    }

    const existingBranch = await this.repo.findByCode(data.companyId, data.branchCode);
    if (existingBranch) {
      throw new ConflictError(`Branch with code '${data.branchCode}' already exists.`);
    }

    return this.repo.create(data);
  }

  async getBranches(query: BranchQueryDTO) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const search = query.search?.trim();
    const companyId = query.companyId?.trim();
    const city = query.city?.trim();
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    if (companyId) {
      const company = await this.companyRepo.findById(companyId);
      if (!company) {
        throw new NotFoundError(`Company with ID '${companyId}' not found.`);
      }
    }

    return this.repo.findAll({ page, limit, search, companyId, city, isActive, sortBy, sortOrder });
  }

  async getBranchById(id: string) {
    const branch = await this.repo.findById(id);
    if (!branch) {
      throw new NotFoundError(`Branch with ID '${id}' not found.`);
    }
    return branch;
  }

  async updateBranch(id: string, data: UpdateBranchDTO) {
    const branch = await this.getBranchById(id);

    if (data.companyId) {
      const company = await this.companyRepo.findById(data.companyId);
      if (!company) {
        throw new NotFoundError(`Company with ID '${data.companyId}' not found.`);
      }
    }

    if (data.branchCode) {
      const companyId = data.companyId || branch.companyId;
      const existingBranch = await this.repo.findByCode(companyId, data.branchCode);
      if (existingBranch && existingBranch.id !== id) {
        throw new ConflictError(`Branch with code '${data.branchCode}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteBranch(id: string) {
    await this.getBranchById(id);

    try {
      return await this.repo.delete(id);
    } catch (error: any) {
      if (
        error?.code === 'P2003' ||
        error?.code === 'P2014' ||
        (typeof error?.message === 'string' &&
          (error.message.includes('employees') ||
            error.message.includes('customers') ||
            error.message.includes('vendors') ||
            error.message.includes('foreign key') ||
            error.message.includes('RESTRICT') ||
            error.message.includes('23001')))
      ) {
        throw new BadRequestError('Cannot delete branch with active employees, customers, or vendors.');
      }
      throw error;
    }
  }
}

export const branchService = new BranchService();
