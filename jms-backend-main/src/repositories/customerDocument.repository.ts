import { prisma } from '../database';

export class CustomerDocumentRepository {
  async create(data: {
    customerId: string;
    documentType: string;
    documentNumber?: string;
    fileUrl?: string;
  }) {
    return prisma.customerDocument.create({
      data: {
        customerId: data.customerId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        fileUrl: data.fileUrl || '',
      },
      include: { customer: true },
    });
  }

  async findById(id: string) {
    return prisma.customerDocument.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async findByCustomerId(customerId: string) {
    return prisma.customerDocument.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: {
      documentType?: string;
      documentNumber?: string;
      fileUrl?: string;
    }
  ) {
    return prisma.customerDocument.update({
      where: { id },
      data,
      include: { customer: true },
    });
  }

  async delete(id: string) {
    return prisma.customerDocument.delete({ where: { id } });
  }
}

export const customerDocumentRepository = new CustomerDocumentRepository();
