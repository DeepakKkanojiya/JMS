import { Request, Response, NextFunction } from 'express';
import { customerAddressService, CustomerAddressService } from './customer-address.service';

export class CustomerAddressController {
  constructor(private service: CustomerAddressService = customerAddressService) {}

  createAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const address = await this.service.createAddress(customerId, req.body);
      res.status(201).json({
        success: true,
        message: 'Customer address added successfully',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };

  getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const addresses = await this.service.getAddressesByCustomerId(customerId);
      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  };

  getAddressById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const addressId = String(req.params.addressId);
      const address = await this.service.getAddressById(customerId, addressId);
      res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const addressId = String(req.params.addressId);
      const address = await this.service.updateAddress(customerId, addressId, req.body);
      res.status(200).json({
        success: true,
        message: 'Customer address updated successfully',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const addressId = String(req.params.addressId);
      await this.service.deleteAddress(customerId, addressId);
      res.status(200).json({
        success: true,
        message: 'Customer address deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const customerAddressController = new CustomerAddressController();
