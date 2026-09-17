import { prisma } from '../database';

function mapEmployee(emp: any) {
  if (!emp) return null;
  const primaryAssignment = emp.branchAssignments?.find(
    (a: any) => a.isPrimary && !a.effectiveTo
  ) || emp.branchAssignments?.[0];

  return {
    ...emp,
    branchId: primaryAssignment?.branchId || null,
    branch: primaryAssignment?.branch || null,
    designation: primaryAssignment?.designation || null,
  };
}

export class EmployeeRepository {
  async create(data: {
    branchId: string;
    userId?: string;
    employeeCode: string;
    firstName: string;
    lastName?: string;
    email?: string;
    mobile: string;
    designation?: string;
    joiningDate?: Date;
    isActive?: boolean;
  }) {
    // Retrieve companyId from the branch
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId }
    });
    if (!branch) {
      throw new Error(`Branch with ID '${data.branchId}' not found.`);
    }

    const employee = await prisma.$transaction(async (tx) => {
      // 1. Create the Employee
      const emp = await tx.employee.create({
        data: {
          companyId: branch.companyId,
          employeeCode: data.employeeCode,
          firstName: data.firstName,
          lastName: data.lastName || null,
          email: data.email || null,
          mobile: data.mobile,
          joiningDate: data.joiningDate || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        }
      });

      // 2. Create the Branch Assignment
      await tx.employeeBranchAssignment.create({
        data: {
          employeeId: emp.id,
          branchId: data.branchId,
          designation: data.designation || 'Staff',
          isPrimary: true,
          effectiveFrom: data.joiningDate || new Date(),
        }
      });

      // 3. Link user if userId is provided
      if (data.userId) {
        await tx.user.update({
          where: { id: data.userId },
          data: { employeeId: emp.id }
        });
      }

      return emp;
    });

    return this.findById(employee.id);
  }

  async findById(id: string) {
    const emp = await prisma.employee.findUnique({
      where: { id },
      include: {
        branchAssignments: {
          where: { isPrimary: true, effectiveTo: null },
          include: { branch: true }
        },
        user: true,
      },
    });
    return mapEmployee(emp);
  }

  async findByCode(employeeCode: string) {
    const emp = await prisma.employee.findFirst({
      where: { employeeCode },
      include: {
        branchAssignments: {
          where: { isPrimary: true, effectiveTo: null },
          include: { branch: true }
        },
        user: true,
      },
    });
    return mapEmployee(emp);
  }

  async findByMobile(mobile: string) {
    const emp = await prisma.employee.findUnique({
      where: { mobile },
      include: {
        branchAssignments: {
          where: { isPrimary: true, effectiveTo: null },
          include: { branch: true }
        },
        user: true,
      },
    });
    return mapEmployee(emp);
  }

  async findByEmail(email: string) {
    const emp = await prisma.employee.findFirst({
      where: { email },
      include: {
        branchAssignments: {
          where: { isPrimary: true, effectiveTo: null },
          include: { branch: true }
        },
        user: true,
      },
    });
    return mapEmployee(emp);
  }

  async findByUserId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            branchAssignments: {
              where: { isPrimary: true, effectiveTo: null },
              include: { branch: true }
            },
            user: true
          }
        }
      }
    });
    return user?.employee ? mapEmployee(user.employee) : null;
  }

  async findByBranchId(branchId: string) {
    const employees = await prisma.employee.findMany({
      where: {
        branchAssignments: {
          some: { branchId, isPrimary: true, effectiveTo: null }
        }
      },
      include: {
        branchAssignments: {
          where: { isPrimary: true, effectiveTo: null },
          include: { branch: true }
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return employees.map(mapEmployee);
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    branchId?: string;
    designation?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.branchId) {
      where.branchAssignments = {
        some: { branchId: params.branchId, isPrimary: true, effectiveTo: null }
      };
    }
    if (params?.companyId) {
      where.companyId = params.companyId;
    }
    if (params?.designation) {
      where.branchAssignments = {
        some: {
          designation: { contains: params.designation, mode: 'insensitive' },
          isPrimary: true,
          effectiveTo: null
        }
      };
    }
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params?.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { employeeCode: { contains: params.search, mode: 'insensitive' } },
        { mobile: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        {
          branchAssignments: {
            some: {
              designation: { contains: params.search, mode: 'insensitive' },
              isPrimary: true,
              effectiveTo: null
            }
          }
        }
      ];
    }

    const validSortFields = ['createdAt', 'employeeCode', 'firstName', 'lastName'];
    const sortBy = params?.sortBy && validSortFields.includes(params.sortBy) ? params.sortBy : 'createdAt';
    const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          branchAssignments: {
            where: { isPrimary: true, effectiveTo: null },
            include: { branch: true }
          },
          user: true,
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: data.map(mapEmployee),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: string,
    data: {
      branchId?: string;
      userId?: string;
      employeeCode?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile?: string;
      designation?: string;
      joiningDate?: Date;
      isActive?: boolean;
    }
  ) {
    const mapped = await prisma.$transaction(async (tx) => {
      // 1. Update Employee
      const emp = await tx.employee.update({
        where: { id },
        data: {
          employeeCode: data.employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          joiningDate: data.joiningDate,
          isActive: data.isActive,
        }
      });

      // 2. Update Branch or Designation if provided
      if (data.branchId || data.designation) {
        // Find the current active assignment
        const currentAssignment = await tx.employeeBranchAssignment.findFirst({
          where: { employeeId: id, isPrimary: true, effectiveTo: null }
        });

        const activeBranchId = data.branchId || currentAssignment?.branchId;
        const activeDesignation = data.designation || currentAssignment?.designation || 'Staff';

        if (
          !currentAssignment ||
          currentAssignment.branchId !== activeBranchId ||
          currentAssignment.designation !== activeDesignation
        ) {
          if (currentAssignment) {
            // Terminate current assignment
            await tx.employeeBranchAssignment.update({
              where: { id: currentAssignment.id },
              data: { isPrimary: false, effectiveTo: new Date() }
            });
          }

          if (!activeBranchId) {
            throw new Error('Branch ID is required for a new assignment.');
          }

          // Create new assignment
          await tx.employeeBranchAssignment.create({
            data: {
              employeeId: id,
              branchId: activeBranchId,
              designation: activeDesignation,
              isPrimary: true,
              effectiveFrom: new Date(),
            }
          });
        }
      }

      // 3. Link user if userId is provided
      if (data.userId) {
        await tx.user.updateMany({
          where: { employeeId: id },
          data: { employeeId: null }
        });
        await tx.user.update({
          where: { id: data.userId },
          data: { employeeId: id }
        });
      }

      return emp;
    });

    return this.findById(id);
  }

  async delete(id: string) {
    return prisma.employee.delete({ where: { id } });
  }
}

export const employeeRepository = new EmployeeRepository();
