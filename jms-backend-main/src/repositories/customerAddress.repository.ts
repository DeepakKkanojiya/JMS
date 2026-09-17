import { prisma } from '../database';

export class CustomerAddressRepository {
  async create(data: {
    customerId: string;
    addressType?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) {
    return prisma.customerAddress.create({
      data,
      include: { customer: true },
    });
  }

  async findById(id: string) {
    return prisma.customerAddress.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async findByCustomerId(customerId: string) {
    return prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async unsetOtherDefaults(customerId: string, excludeId?: string) {
    const where: any = { customerId };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return prisma.customerAddress.updateMany({
      where,
      data: { isDefault: false },
    });
  }

  async update(
    id: string,
    data: {
      addressType?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    }
  ) {
    return prisma.customerAddress.update({
      where: { id },
      data,
      include: { customer: true },
    });
  }

  async delete(id: string) {
    return prisma.customerAddress.delete({ where: { id } });
  }
}

export const customerAddressRepository = new CustomerAddressRepository();
