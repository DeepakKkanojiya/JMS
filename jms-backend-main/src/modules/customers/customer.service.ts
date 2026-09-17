import { customerRepository, CustomerRepository } from '../../repositories/customer.repository';
import { branchRepository, BranchRepository } from '../../repositories/branch.repository';
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO, CustomerSearchQueryDTO } from './customer.types';
import { NotFoundError, ConflictError } from '../../errors';

export class CustomerService {
  constructor(
    private repo: CustomerRepository = customerRepository,
    private branchRepo: BranchRepository = branchRepository
  ) {}

  async createCustomer(data: CreateCustomerDTO) {
    let companyId = data.companyId;
    if (data.branchId) {
      const branch = await this.branchRepo.findById(data.branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${data.branchId}' not found.`);
      }
      companyId = branch.companyId;
    }

    if (!companyId) {
      throw new ConflictError(`companyId or branchId is required.`);
    }

    const customerCount = await this.repo.count(companyId);
    let serialNum = customerCount + 1;
    let customerCode = `CUST-${String(serialNum).padStart(3, '0')}`;
    let codeExists = await this.repo.findByCode(companyId, customerCode);
    while (codeExists) {
      serialNum += 1;
      customerCode = `CUST-${String(serialNum).padStart(3, '0')}`;
      codeExists = await this.repo.findByCode(companyId, customerCode);
    }

    const existingMobile = await this.repo.findByMobile(data.mobile);
    if (existingMobile) {
      throw new ConflictError(`Customer with mobile '${data.mobile}' already exists.`);
    }

    if (data.email) {
      const existingEmail = await this.repo.findByEmail(data.email);
      if (existingEmail) {
        throw new ConflictError(`Customer with email '${data.email}' already exists.`);
      }
    }

    if (data.gstNumber) {
      const existingGst = await this.repo.findByGst(data.gstNumber);
      if (existingGst) {
        throw new ConflictError(`Customer with GSTIN '${data.gstNumber}' already exists.`);
      }
    }

    if (data.panNumber) {
      const existingPan = await this.repo.findByPan(data.panNumber);
      if (existingPan) {
        throw new ConflictError(`Customer with PAN '${data.panNumber}' already exists.`);
      }
    }

    return this.repo.create({
      ...data,
      customerCode,
      companyId,
    });
  }

  async getCustomers(query: CustomerQueryDTO) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const search = query.search?.trim();
    const companyId = query.companyId?.trim();
    const branchId = query.branchId?.trim();
    const customerType = query.customerType?.trim();
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    if (branchId) {
      const branch = await this.branchRepo.findById(branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${branchId}' not found.`);
      }
    }

    return this.repo.findAll({ page, limit, search, companyId, branchId, customerType, isActive, sortBy, sortOrder });
  }

  async searchQuick(query: CustomerSearchQueryDTO) {
    const q = query.q?.trim() || '';
    const branchId = query.branchId?.trim();
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10', 10)));

    return this.repo.searchQuick(q, branchId, limit);
  }

  async getCustomerById(id: string) {
    const customer = await this.repo.findById(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${id}' not found.`);
    }
    return customer;
  }

  async updateCustomer(id: string, data: UpdateCustomerDTO) {
    const existing = await this.getCustomerById(id);

    if (data.branchId) {
      const branch = await this.branchRepo.findById(data.branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${data.branchId}' not found.`);
      }
    }

    if (data.customerCode) {
      const existingCode = await this.repo.findByCode(existing.companyId, data.customerCode);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictError(`Customer with code '${data.customerCode}' already exists.`);
      }
    }

    if (data.mobile) {
      const existingMobile = await this.repo.findByMobile(data.mobile);
      if (existingMobile && existingMobile.id !== id) {
        throw new ConflictError(`Customer with mobile '${data.mobile}' already exists.`);
      }
    }

    if (data.email) {
      const existingEmail = await this.repo.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictError(`Customer with email '${data.email}' already exists.`);
      }
    }

    if (data.gstNumber) {
      const existingGst = await this.repo.findByGst(data.gstNumber);
      if (existingGst && existingGst.id !== id) {
        throw new ConflictError(`Customer with GSTIN '${data.gstNumber}' already exists.`);
      }
    }

    if (data.panNumber) {
      const existingPan = await this.repo.findByPan(data.panNumber);
      if (existingPan && existingPan.id !== id) {
        throw new ConflictError(`Customer with PAN '${data.panNumber}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteCustomer(id: string) {
    await this.getCustomerById(id);
    return this.repo.delete(id);
  }
}

export const customerService = new CustomerService();
