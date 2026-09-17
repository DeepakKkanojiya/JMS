import { Request, Response, NextFunction } from 'express';
import '../types/express';
import { ConflictError, DatabaseError } from '../errors';

export class RbacController {
  /**
   * GET /api/v1/users (Admin & Owner only, Query Validated)
   */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sort, search } = req.query;
      res.status(200).json({
        success: true,
        message: 'Admin Access Granted: User management list retrieved.',
        pagination: {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          sort: sort || 'createdAt',
          search: search || null,
        },
        requestedBy: req.user,
        data: [
          { id: '1a9860b0-379e-4e78-8314-b2581691efb0', name: 'System Admin', role: 'ADMIN' },
          { id: '2b9860b0-379e-4e78-8314-b2581691efb1', name: 'Store Staff', role: 'STAFF' },
          { id: '3c9860b0-379e-4e78-8314-b2581691efb2', name: 'Standard User', role: 'USER' },
        ],
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/users/:id (Admin & Owner only, Param Validated)
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      res.status(200).json({
        success: true,
        message: 'User details retrieved successfully.',
        data: {
          id,
          name: 'Validated User',
          email: 'user@jewelleryerp.com',
          role: 'STAFF',
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/users (Admin & Owner only, Body Validated)
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, role, branchId } = req.body;

      if (email === 'existing@test.com' || email === 'duplicate@jewelleryerp.com') {
        throw new ConflictError('Email already exists');
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: {
          id: '4d9860b0-379e-4e78-8314-b2581691efb3',
          name,
          email,
          role,
          branchId: branchId || null,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/customers (Admin, Owner, Staff, Query Validated)
   */
  getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query;
      res.status(200).json({
        success: true,
        message: 'Staff Access Granted: Customer list retrieved.',
        pagination: {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
        },
        requestedBy: req.user,
        data: [
          { id: 'c1', name: 'Rajesh Kumar', phone: '+919876543210' },
          { id: 'c2', name: 'Priya Sharma', phone: '+919876543211' },
        ],
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/customer/upload (Admin, Owner, Staff, File Validated)
   */
  uploadCustomerDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file || (req as any).files;
      res.status(200).json({
        success: true,
        message: 'Customer document uploaded and validated successfully.',
        file: {
          filename: file?.originalname || 'uploaded-file.pdf',
          mimetype: file?.mimetype,
          size: file?.size,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/profile (Admin, Owner, Staff, User)
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'User Access Granted: User profile retrieved.',
        data: req.user,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/inventory (Admin, Owner, Staff, Query Validated)
   */
  getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query;
      res.status(200).json({
        success: true,
        message: 'Staff Access Granted: Inventory list retrieved.',
        pagination: {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
        },
        data: [
          { id: 'i1', name: '24K Gold Ring 10g', category: 'Jewellery' },
          { id: 'i2', name: 'Silver Chain 20g', category: 'Jewellery' },
        ],
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Test Endpoint: Database Error Simulation
   */
  testDatabaseError = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new DatabaseError('Database unavailable');
    } catch (err) {
      next(err);
    }
  };

  /**
   * Test Endpoint: Internal Error Simulation
   */
  testInternalError = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      throw new Error('Simulated uncaught exception');
    } catch (err) {
      next(err);
    }
  };
}

export const rbacController = new RbacController();
