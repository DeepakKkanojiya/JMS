import { customerDocumentRepository, CustomerDocumentRepository } from '../../repositories/customerDocument.repository';
import { customerRepository, CustomerRepository } from '../../repositories/customer.repository';
import { CreateCustomerDocumentDTO, UpdateCustomerDocumentDTO } from './customer-document.types';
import { NotFoundError } from '../../errors';

export class CustomerDocumentService {
  constructor(
    private repo: CustomerDocumentRepository = customerDocumentRepository,
    private customerRepo: CustomerRepository = customerRepository
  ) {}

  async createDocument(customerId: string, data: CreateCustomerDocumentDTO) {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found.`);
    }

    return this.repo.create({
      customerId,
      ...data,
    });
  }

  async getDocumentsByCustomerId(customerId: string) {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found.`);
    }
    return this.repo.findByCustomerId(customerId);
  }

  async getDocumentById(customerId: string, documentId: string) {
    const document = await this.repo.findById(documentId);
    if (!document || document.customerId !== customerId) {
      throw new NotFoundError(`Document with ID '${documentId}' not found for customer '${customerId}'.`);
    }
    return document;
  }

  async updateDocument(customerId: string, documentId: string, data: UpdateCustomerDocumentDTO) {
    await this.getDocumentById(customerId, documentId);
    return this.repo.update(documentId, data);
  }

  async deleteDocument(customerId: string, documentId: string) {
    await this.getDocumentById(customerId, documentId);
    return this.repo.delete(documentId);
  }
}

export const customerDocumentService = new CustomerDocumentService();
