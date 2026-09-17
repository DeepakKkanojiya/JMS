import { Request, Response, NextFunction } from 'express';
import { companyService, CompanyService } from './company.service';

export class CompanyController {
  constructor(private service: CompanyService = companyService) {}

  createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const company = await this.service.createCompany(req.body);
      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCompanies(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const company = await this.service.getCompanyById(id);
      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const company = await this.service.updateCompany(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteCompany(id);
      res.status(200).json({
        success: true,
        message: 'Company deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const companyController = new CompanyController();
