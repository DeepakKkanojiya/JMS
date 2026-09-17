import { Request, Response, NextFunction } from 'express';
import { employeeService, EmployeeService } from './employee.service';

export class EmployeeController {
  constructor(private service: EmployeeService = employeeService) {}

  createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.createEmployee(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getEmployees(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const employee = await this.service.getEmployeeById(id);
      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const employee = await this.service.updateEmployee(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteEmployee(id);
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const employeeController = new EmployeeController();
