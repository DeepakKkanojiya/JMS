import { Request, Response, NextFunction } from 'express';
import { vendorService, VendorService } from './vendor.service';

export class VendorController {
  constructor(private service: VendorService = vendorService) {}

  createVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vendor = await this.service.createVendor(req.body);
      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  getVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getVendors(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getVendorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const vendor = await this.service.getVendorById(id);
      res.status(200).json({
        success: true,
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  updateVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const vendor = await this.service.updateVendor(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteVendor(id);
      res.status(200).json({
        success: true,
        message: 'Vendor deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const vendorController = new VendorController();
