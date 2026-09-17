import { Request, Response, NextFunction } from 'express';
import { makingChargeService } from './makingCharge.service';
import { MetalType } from '../../generated/prisma';

export class MakingChargeController {
  async createMakingCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const charge = await makingChargeService.createMakingCharge(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Making charge configuration created successfully',
        data: charge,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMakingChargeById(req: Request, res: Response, next: NextFunction) {
    try {
      const charge = await makingChargeService.getMakingChargeById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: charge,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentMakingCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, metalType, purity, timestamp } = req.query;
      const charge = await makingChargeService.getCurrentMakingCharge(
        companyId as string,
        metalType as MetalType,
        purity as string,
        timestamp ? new Date(timestamp as string) : undefined
      );
      res.status(200).json({
        success: true,
        data: charge,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMakingChargeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, metalType, purity } = req.query;
      const history = await makingChargeService.getMakingChargeHistory(
        companyId as string | undefined,
        metalType as MetalType | undefined,
        purity as string | undefined
      );
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllMakingCharges(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await makingChargeService.getAllMakingCharges(req.query as any);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMakingCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const updated = await makingChargeService.updateMakingCharge(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: 'Making charge configuration updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateMakingCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const deactivated = await makingChargeService.deactivateMakingCharge(
        req.params.id as string,
        userId
      );
      res.status(200).json({
        success: true,
        message: 'Making charge configuration deactivated successfully',
        data: deactivated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const makingChargeController = new MakingChargeController();
