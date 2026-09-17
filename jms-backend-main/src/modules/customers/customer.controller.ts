import { Request, Response, NextFunction } from 'express';
import { customerService, CustomerService } from './customer.service';

export class CustomerController {
  constructor(private service: CustomerService = customerService) {}

  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customer = await this.service.createCustomer(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCustomers(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  searchQuick = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.searchQuick(req.query as any);
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const customer = await this.service.getCustomerById(id);
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const customer = await this.service.updateCustomer(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteCustomer(id);
      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const customerController = new CustomerController();
