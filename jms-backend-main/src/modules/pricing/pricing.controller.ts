import { Request, Response, NextFunction } from 'express';
import { pricingService } from './pricing.service';

export class PricingController {
  async calculateInvoicePricing(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = req.params.id as string;
      const breakdown = await pricingService.calculateInvoicePricing(invoiceId, req.body);
      res.status(200).json({
        success: true,
        message: 'Invoice pricing calculated and persisted successfully',
        data: breakdown,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoicePricing(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = req.params.id as string;
      const breakdown = await pricingService.getInvoicePricing(invoiceId);
      res.status(200).json({
        success: true,
        data: breakdown,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const pricingController = new PricingController();
