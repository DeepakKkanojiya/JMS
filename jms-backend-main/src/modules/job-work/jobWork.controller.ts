import { Request, Response, NextFunction } from 'express';
import { jobWorkService } from './jobWork.service';

export class JobWorkController {
  async createJobWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await jobWorkService.createJobWorkOrder(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Job work order draft created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllJobWorkOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await jobWorkService.getAllJobWorkOrders(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobWorkOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await jobWorkService.getJobWorkOrderById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJobWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await jobWorkService.updateJobWorkOrder(id, req.body, userId);
      res.status(200).json({
        success: true,
        message: 'Job work order updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitJobWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await jobWorkService.submitJobWorkOrder(id, userId);
      res.status(200).json({
        success: true,
        message: 'Job work order submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignJobWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await jobWorkService.assignJobWorkOrder(id, userId);
      res.status(200).json({
        success: true,
        message: 'Job work order assigned to Karigar successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async issueMaterialToKarigar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await jobWorkService.issueMaterialToKarigar(id, req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Material issued to Karigar successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async receiveJobWorkFromKarigar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await jobWorkService.receiveJobWorkFromKarigar(id, req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Finished goods / material received from Karigar successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelJobWorkOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { cancellationReason } = req.body;
      const result = await jobWorkService.cancelJobWorkOrder(id, cancellationReason, userId);
      res.status(200).json({
        success: true,
        message: 'Job work order cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getKarigarSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = req.params.id as string;
      const result = await jobWorkService.getKarigarSummary(vendorId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobWorkController = new JobWorkController();
