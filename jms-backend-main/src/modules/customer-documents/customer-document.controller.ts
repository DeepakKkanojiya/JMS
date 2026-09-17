import { Request, Response, NextFunction } from 'express';
import { customerDocumentService, CustomerDocumentService } from './customer-document.service';

export class CustomerDocumentController {
  constructor(private service: CustomerDocumentService = customerDocumentService) {}

  createDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const document = await this.service.createDocument(customerId, req.body);
      res.status(201).json({
        success: true,
        message: 'Customer document added successfully',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const documents = await this.service.getDocumentsByCustomerId(customerId);
      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  };

  getDocumentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const documentId = String(req.params.documentId);
      const document = await this.service.getDocumentById(customerId, documentId);
      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const documentId = String(req.params.documentId);
      const document = await this.service.updateDocument(customerId, documentId, req.body);
      res.status(200).json({
        success: true,
        message: 'Customer document updated successfully',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = String(req.params.customerId);
      const documentId = String(req.params.documentId);
      await this.service.deleteDocument(customerId, documentId);
      res.status(200).json({
        success: true,
        message: 'Customer document deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const customerDocumentController = new CustomerDocumentController();
