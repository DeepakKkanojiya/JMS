import { customerAddressRepository, CustomerAddressRepository } from '../../repositories/customerAddress.repository';
import { customerRepository, CustomerRepository } from '../../repositories/customer.repository';
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from './customer-address.types';
import { NotFoundError } from '../../errors';

export class CustomerAddressService {
  constructor(
    private repo: CustomerAddressRepository = customerAddressRepository,
    private customerRepo: CustomerRepository = customerRepository
  ) {}

  async createAddress(customerId: string, data: CreateCustomerAddressDTO) {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found.`);
    }

    if (data.isDefault) {
      await this.repo.unsetOtherDefaults(customerId);
    }

    return this.repo.create({
      customerId,
      ...data,
    });
  }

  async getAddressesByCustomerId(customerId: string) {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found.`);
    }
    return this.repo.findByCustomerId(customerId);
  }

  async getAddressById(customerId: string, addressId: string) {
    const address = await this.repo.findById(addressId);
    if (!address || address.customerId !== customerId) {
      throw new NotFoundError(`Address with ID '${addressId}' not found for customer '${customerId}'.`);
    }
    return address;
  }

  async updateAddress(customerId: string, addressId: string, data: UpdateCustomerAddressDTO) {
    await this.getAddressById(customerId, addressId);

    if (data.isDefault) {
      await this.repo.unsetOtherDefaults(customerId, addressId);
    }

    return this.repo.update(addressId, data);
  }

  async deleteAddress(customerId: string, addressId: string) {
    await this.getAddressById(customerId, addressId);
    return this.repo.delete(addressId);
  }
}

export const customerAddressService = new CustomerAddressService();
