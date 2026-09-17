import { Request, Response, NextFunction } from 'express';
import { approvalReportService } from './approvalReport.service';

export class ApprovalReportController {
  async getSummaryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const branchId = req.query.branchId as string | undefined;
      const result = await approvalReportService.getSummaryReport(userCompanyId, branchId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRegisterReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalReportService.getRegisterReport(query as any, userCompanyId);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalReportService.getInventoryReport(query as any, userCompanyId);
      res.status(200).json({
        success: true,
        data: result.items,
        summary: {
          totalCount: result.totalCount,
          totalValue: result.totalValue,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDepositsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalReportService.getDepositsReport(query as any, userCompanyId);
      res.status(200).json({
        success: true,
        summary: result.summary,
        data: result.items,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReturnVsPurchaseReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalReportService.getReturnVsPurchaseReport(query as any, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerHistoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.params.customerId as string;
      const userCompanyId = (req.user as any)?.companyId;
      const result = await approvalReportService.getCustomerHistoryReport(customerId, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAgeingReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalReportService.getAgeingReport(query as any, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditTrail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const result = await approvalReportService.getAuditTrail(id, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const approvalReportController = new ApprovalReportController();
