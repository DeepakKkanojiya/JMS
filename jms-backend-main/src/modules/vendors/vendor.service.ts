import { vendorRepository, VendorRepository } from '../../repositories/vendor.repository';
import { branchRepository, BranchRepository } from '../../repositories/branch.repository';
import { CreateVendorDTO, UpdateVendorDTO, VendorQueryOptions } from './vendor.types';
import { NotFoundError, ConflictError } from '../../errors';

export class VendorService {
  constructor(
    private repo: VendorRepository = vendorRepository,
    private branchRepo: BranchRepository = branchRepository
  ) {}

  async createVendor(data: CreateVendorDTO) {
    const branch = await this.branchRepo.findById(data.branchId);
    if (!branch) {
      throw new NotFoundError(`Branch with ID '${data.branchId}' not found.`);
    }

    const existingCode = await this.repo.findByCode(branch.companyId, data.vendorCode);
    if (existingCode) {
      throw new ConflictError(`Vendor with code '${data.vendorCode}' already exists.`);
    }

    if (data.gstNumber) {
      const existingGst = await this.repo.findByGstNumber(data.gstNumber);
      if (existingGst) {
        throw new ConflictError(`Vendor with GSTIN '${data.gstNumber}' already exists.`);
      }
    }

    return this.repo.create({
      ...data,
      companyId: branch.companyId
    });
  }

  async getVendors(options: VendorQueryOptions) {
    const page = Math.max(1, typeof options.page === 'number' ? options.page : parseInt((options.page as any) || '1', 10));
    const limit = Math.min(100, Math.max(1, typeof options.limit === 'number' ? options.limit : parseInt((options.limit as any) || '10', 10)));
    const search = options.search?.trim();
    const branchId = options.branchId?.trim();
    const gstNumber = (options.gstNumber || options.gstin)?.trim();
    const isActive = (options.isActive as any) === true || (options.isActive as any) === 'true' ? true : (options.isActive as any) === false || (options.isActive as any) === 'false' ? false : undefined;
    const sortBy = options.sortBy;
    const sortOrder = options.sortOrder;

    if (branchId) {
      const branch = await this.branchRepo.findById(branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${branchId}' not found.`);
      }
    }

    return this.repo.findAll({ page, limit, search, branchId, gstNumber, isActive, sortBy, sortOrder });
  }

  async getVendorById(id: string) {
    const vendor = await this.repo.findById(id);
    if (!vendor) {
      throw new NotFoundError(`Vendor with ID '${id}' not found.`);
    }
    return vendor;
  }

  async updateVendor(id: string, data: UpdateVendorDTO) {
    const existing = await this.getVendorById(id);

    if (data.branchId && data.branchId !== existing.branchId) {
      const branch = await this.branchRepo.findById(data.branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${data.branchId}' not found.`);
      }
    }

    if (data.gstNumber && data.gstNumber !== existing.gstNumber) {
      const existingGst = await this.repo.findByGstNumber(data.gstNumber);
      if (existingGst) {
        throw new ConflictError(`Vendor with GSTIN '${data.gstNumber}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteVendor(id: string) {
    await this.getVendorById(id);
    return this.repo.delete(id);
  }
}

export const vendorService = new VendorService();
