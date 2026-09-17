import { Request, Response, NextFunction } from 'express';
import { metalRateService } from './metalRate.service';
import { MetalType } from '../../generated/prisma';

export class MetalRateController {
  async createMetalRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const rate = await metalRateService.createMetalRate(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Metal rate created successfully',
        data: rate,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetalRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metalRateService.getMetalRates(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetalRateHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await metalRateService.getMetalRates(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string;
      const metalType = req.query.metalType as MetalType;
      const purity = req.query.purity as string;
      const at = req.query.at as string | undefined;

      const rate = await metalRateService.getCurrentRate(companyId, metalType, purity, at);
      res.status(200).json({
        success: true,
        data: rate,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveMarketMetalRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feed = await metalRateService.getLiveMarketMetalRates();
      res.status(200).json({
        success: true,
        data: feed,
      });
    } catch (error) {
      next(error);
    }
  }

  async syncLiveRatesToCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await metalRateService.syncLiveRatesToCompany(req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Live market metal rates synchronized to company successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateCompanyRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await metalRateService.bulkUpdateCompanyRates(req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Company metal rates updated in bulk successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetalRateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const rate = await metalRateService.getMetalRateById(id);
      res.status(200).json({
        success: true,
        data: rate,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMetalRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const updatedRate = await metalRateService.updateMetalRate(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Metal rate updated successfully',
        data: updatedRate,
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateMetalRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const deactivatedRate = await metalRateService.deactivateMetalRate(id, userId);
      res.status(200).json({
        success: true,
        message: 'Metal rate deactivated successfully',
        data: deactivatedRate,
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateMetalValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const calculation = await metalRateService.calculateMetalValue(req.body);
      res.status(200).json({
        success: true,
        message: 'Metal value calculated successfully',
        data: calculation,
      });
    } catch (error) {
      next(error);
    }
  }

  async lockSalesInvoiceMetalRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const snapshot = await metalRateService.lockSalesInvoiceMetalRate(id, userId);
      res.status(200).json({
        success: true,
        message: 'Metal rate locked for sales invoice successfully',
        data: snapshot,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesInvoiceMetalRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const snapshot = await metalRateService.getSalesInvoiceMetalRate(id);
      res.status(200).json({
        success: true,
        data: snapshot,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const metalRateController = new MetalRateController();
