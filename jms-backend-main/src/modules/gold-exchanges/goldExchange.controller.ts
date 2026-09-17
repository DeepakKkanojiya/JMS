import { Request, Response, NextFunction } from 'express';
import { goldExchangeService } from './goldExchange.service';
import { CreateGoldExchangeDTO, FindGoldExchangesQueryDTO } from './goldExchange.types';

export class GoldExchangeController {
  async createExchange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoiceId = req.params.invoiceId as string;
      const userId = req.user?.userId;
      const dto: CreateGoldExchangeDTO = req.body;

      const exchange = await goldExchangeService.createExchange(invoiceId, dto, userId);

      res.status(201).json({
        success: true,
        message: 'Gold exchange record created successfully',
        data: exchange,
      });
    } catch (error) {
      next(error);
    }
  }

  async valueExchange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;

      const exchange = await goldExchangeService.valueExchange(id, userId);

      res.status(200).json({
        success: true,
        message: 'Gold exchange valuation completed successfully',
        data: exchange,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyExchange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;

      const result = await goldExchangeService.applyExchange(id, userId);

      res.status(200).json({
        success: true,
        message: 'Gold exchange credit applied to sales invoice successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelExchange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;

      const exchange = await goldExchangeService.cancelExchange(id, userId);

      res.status(200).json({
        success: true,
        message: 'Gold exchange request cancelled successfully',
        data: exchange,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExchangeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const exchange = await goldExchangeService.getExchangeById(id);

      res.status(200).json({
        success: true,
        data: exchange,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceExchanges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoiceId = req.params.invoiceId as string;
      const exchanges = await goldExchangeService.getInvoiceExchanges(invoiceId);

      res.status(200).json({
        success: true,
        data: exchanges,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllExchanges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: FindGoldExchangesQueryDTO = req.query;
      const result = await goldExchangeService.getAllExchanges(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExchangeHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const history = await goldExchangeService.getExchangeHistory(id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const goldExchangeController = new GoldExchangeController();
