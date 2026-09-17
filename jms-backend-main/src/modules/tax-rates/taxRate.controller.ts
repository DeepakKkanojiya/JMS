import { Request, Response, NextFunction } from 'express';
import { taxRateService } from './taxRate.service';

export class TaxRateController {
  async createTaxRate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const tax = await taxRateService.createTaxRate(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Tax rate configuration created successfully',
        data: tax,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaxRateById(req: Request, res: Response, next: NextFunction) {
    try {
      const tax = await taxRateService.getTaxRateById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: tax,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentTaxRate(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, taxCode, timestamp } = req.query;
      const tax = await taxRateService.getCurrentTaxRate(
        companyId as string,
        (taxCode as string) || 'GST_3',
        timestamp ? new Date(timestamp as string) : undefined
      );
      res.status(200).json({
        success: true,
        data: tax,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaxRateHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, taxCode } = req.query;
      const history = await taxRateService.getTaxRateHistory(
        companyId as string | undefined,
        taxCode as string | undefined
      );
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTaxRates(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taxRateService.getAllTaxRates(req.query as any);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaxRate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const updated = await taxRateService.updateTaxRate(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: 'Tax rate configuration updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateTaxRate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const deactivated = await taxRateService.deactivateTaxRate(
        req.params.id as string,
        userId
      );
      res.status(200).json({
        success: true,
        message: 'Tax rate configuration deactivated successfully',
        data: deactivated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taxRateController = new TaxRateController();
