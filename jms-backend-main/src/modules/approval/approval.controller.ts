import { Request, Response, NextFunction } from 'express';
import { approvalService } from './approval.service';

export class ApprovalController {
  async createApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const payload = {
        ...req.body,
        createdBy: userId,
      };
      const result = await approvalService.createApproval(payload);
      res.status(201).json({
        success: true,
        message: 'Approval slip created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getApprovalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const result = await approvalService.getApprovalById(id, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalService.listApprovals(query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const payload = {
        ...req.body,
        updatedBy: userId,
      };
      const result = await approvalService.updateApproval(id, payload, userCompanyId);
      res.status(200).json({
        success: true,
        message: 'Approval slip updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async issueApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const result = await approvalService.issueApproval(id, userCompanyId, userId);
      res.status(200).json({
        success: true,
        message: 'Approval slip issued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const result = await approvalService.cancelApproval(id, userCompanyId, userId);
      res.status(200).json({
        success: true,
        message: 'Approval slip cancelled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PHASE 7.4 RETURN & PURCHASE CONTROLLERS
  // ==========================================

  async returnApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const result = await approvalService.returnApproval(id, req.body, userCompanyId, userId);
      res.status(200).json({
        success: true,
        message: 'Approval items returned to inventory successfully (ON_APPROVAL -> AVAILABLE)',
        data: result.approval,
        depositSummary: result.depositSummary,
      });
    } catch (error) {
      next(error);
    }
  }

  async purchaseApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const result = await approvalService.purchaseApproval(id, req.body, userCompanyId, userId);
      res.status(200).json({
        success: true,
        message: 'Approval slip converted to completed purchase invoice successfully (ON_APPROVAL -> SOLD)',
        data: result.approval,
        salesInvoice: result.salesInvoice,
        depositApplied: result.depositApplied,
        remainingBalance: result.remainingBalance,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PHASE 7.3 APPROVAL DEPOSIT CONTROLLERS
  // ==========================================

  async createDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvalId = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const result = await approvalService.createDeposit(approvalId, req.body, userCompanyId, userId);
      res.status(201).json({
        success: true,
        message: 'Approval deposit payment recorded successfully',
        data: result.deposit,
        summary: result.summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDepositSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvalId = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const result = await approvalService.getDepositSummary(approvalId, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDepositById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const result = await approvalService.getDepositById(id, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async listDeposits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userCompanyId = (req.user as any)?.companyId;
      const query = {
        ...req.query,
        ...(userCompanyId ? { companyId: userCompanyId } : {}),
      };
      const result = await approvalService.listDeposits(query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async listDepositsForApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvalId = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const result = await approvalService.listDepositsForApproval(approvalId, userCompanyId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async reverseDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = (req.user as any)?.companyId;
      const userId = req.user?.userId;
      const result = await approvalService.reverseDeposit(id, req.body, userCompanyId, userId);
      res.status(200).json({
        success: true,
        message: 'Approval deposit payment reversed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const approvalController = new ApprovalController();
