import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';

export class HealthController {
  public getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await healthService.getHealth();
      const statusCode = result.status === 'UP' ? 200 : 503;
      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getReadiness = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await healthService.getReadiness();
      const statusCode = result.ready ? 200 : 503;
      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getLiveness = (_req: Request, res: Response): void => {
    const result = healthService.getLiveness();
    res.status(200).json(result);
  };
}

export const healthController = new HealthController();
