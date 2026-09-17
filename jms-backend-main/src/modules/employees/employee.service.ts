import { employeeRepository, EmployeeRepository } from '../../repositories/employee.repository';
import { branchRepository, BranchRepository } from '../../repositories/branch.repository';
import { prisma } from '../../database';
import { CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeQueryDTO } from './employee.types';
import { NotFoundError, ConflictError } from '../../errors';

export class EmployeeService {
  constructor(
    private repo: EmployeeRepository = employeeRepository,
    private branchRepo: BranchRepository = branchRepository
  ) {}

  async createEmployee(data: Omit<CreateEmployeeDTO, 'employeeCode'> & { employeeCode?: string }) {
    const branch = await this.branchRepo.findById(data.branchId);
    if (!branch) {
      throw new NotFoundError(`Branch with ID '${data.branchId}' not found.`);
    }

    if (data.userId) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        throw new NotFoundError(`IAM User with ID '${data.userId}' not found.`);
      }

      const existingUserEmp = await this.repo.findByUserId(data.userId);
      if (existingUserEmp) {
        throw new ConflictError(`IAM User with ID '${data.userId}' is already assigned to employee '${existingUserEmp.employeeCode}'.`);
      }
    }

    // Auto-generate unique serial-wise Employee Code
    const employeeCount = await prisma.employee.count({
      where: { companyId: branch.companyId }
    });
    
    let serialNum = employeeCount + 1;
    let employeeCode = `EMP-${String(serialNum).padStart(3, '0')}`;
    let codeExists = await this.repo.findByCode(employeeCode);
    
    while (codeExists) {
      serialNum += 1;
      employeeCode = `EMP-${String(serialNum).padStart(3, '0')}`;
      codeExists = await this.repo.findByCode(employeeCode);
    }

    const existingMobile = await this.repo.findByMobile(data.mobile);
    if (existingMobile) {
      throw new ConflictError(`Employee with mobile '${data.mobile}' already exists.`);
    }

    if (data.email) {
      const existingEmail = await this.repo.findByEmail(data.email);
      if (existingEmail) {
        throw new ConflictError(`Employee with email '${data.email}' already exists.`);
      }
    }

    const joiningDate = data.joiningDate ? new Date(data.joiningDate) : undefined;

    return this.repo.create({
      ...data,
      employeeCode,
      joiningDate,
    });
  }

  async getEmployees(query: EmployeeQueryDTO) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const search = query.search?.trim();
    const companyId = query.companyId?.trim();
    const branchId = query.branchId?.trim();
    const designation = query.designation?.trim();
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    if (branchId) {
      const branch = await this.branchRepo.findById(branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${branchId}' not found.`);
      }
    }

    return this.repo.findAll({ page, limit, search, companyId, branchId, designation, isActive, sortBy, sortOrder });
  }

  async getEmployeeById(id: string) {
    const employee = await this.repo.findById(id);
    if (!employee) {
      throw new NotFoundError(`Employee with ID '${id}' not found.`);
    }
    return employee;
  }

  async updateEmployee(id: string, data: UpdateEmployeeDTO) {
    await this.getEmployeeById(id);

    if (data.branchId) {
      const branch = await this.branchRepo.findById(data.branchId);
      if (!branch) {
        throw new NotFoundError(`Branch with ID '${data.branchId}' not found.`);
      }
    }

    if (data.userId) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        throw new NotFoundError(`IAM User with ID '${data.userId}' not found.`);
      }

      const existingUserEmp = await this.repo.findByUserId(data.userId);
      if (existingUserEmp && existingUserEmp.id !== id) {
        throw new ConflictError(`IAM User with ID '${data.userId}' is already assigned to employee '${existingUserEmp.employeeCode}'.`);
      }
    }

    if (data.employeeCode) {
      const existingCode = await this.repo.findByCode(data.employeeCode);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictError(`Employee with code '${data.employeeCode}' already exists.`);
      }
    }

    if (data.mobile) {
      const existingMobile = await this.repo.findByMobile(data.mobile);
      if (existingMobile && existingMobile.id !== id) {
        throw new ConflictError(`Employee with mobile '${data.mobile}' already exists.`);
      }
    }

    if (data.email) {
      const existingEmail = await this.repo.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictError(`Employee with email '${data.email}' already exists.`);
      }
    }

    const joiningDate = data.joiningDate ? new Date(data.joiningDate) : undefined;

    return this.repo.update(id, {
      ...data,
      joiningDate,
    });
  }

  async deleteEmployee(id: string) {
    await this.getEmployeeById(id);
    return this.repo.delete(id);
  }
}

export const employeeService = new EmployeeService();
