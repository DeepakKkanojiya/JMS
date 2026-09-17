import { prisma } from '../../database';

export class MasterService {
  async getDropdowns() {
    const [companies, branches, categories, subCategories, roles] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.branch.findMany({
        where: { isActive: true },
        select: { id: true, name: true, branchCode: true, companyId: true },
        orderBy: { name: 'asc' },
      }),
      prisma.productCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
      }),
      prisma.productSubCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, categoryId: true },
        orderBy: { name: 'asc' },
      }),
      prisma.role.findMany({
        select: { id: true, name: true, displayName: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      companies: companies.map((c) => ({ id: c.id, name: c.name })),
      branches: branches.map((b) => ({ id: b.id, name: b.name, code: b.branchCode, companyId: b.companyId })),
      categories: categories.map((c) => ({ id: c.id, name: c.name, code: c.code })),
      subCategories: subCategories.map((sc) => ({ id: sc.id, name: sc.name, code: sc.code, categoryId: sc.categoryId })),
      roles: roles.map((r) => ({ id: r.id, name: r.displayName || r.name, code: r.name })),
      customerTypes: ['RETAIL', 'WHOLESALE', 'VIP', 'CORPORATE'],
      vendorTypes: ['JEWELLERY', 'BULLION', 'GEMSTONE', 'PACKAGING', 'SERVICE', 'OTHER'],
      metalTypes: ['GOLD', 'SILVER', 'PLATINUM', 'DIAMOND'],
    };
  }

  async getStatuses() {
    return {
      masterEntityStatus: ['ACTIVE', 'INACTIVE'],
      customerTypes: ['RETAIL', 'WHOLESALE', 'VIP', 'CORPORATE'],
      vendorTypes: ['JEWELLERY', 'BULLION', 'GEMSTONE', 'PACKAGING', 'SERVICE', 'OTHER'],
      metalTypes: ['GOLD', 'SILVER', 'PLATINUM', 'DIAMOND'],
    };
  }

  async getBranches() {
    return prisma.branch.findMany({
      where: { isActive: true },
      select: {
        id: true,
        companyId: true,
        branchCode: true,
        name: true,
        city: true,
        state: true,
        isMainBranch: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRoles() {
    return prisma.role.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCategories() {
    return prisma.productCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const masterService = new MasterService();
