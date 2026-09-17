import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../database';


export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const dbHealth = await checkDatabaseHealth();

  if (dbHealth.healthy) {
    res.status(200).json({
      success: true,
      server: 'running',
      database: 'connected',
    });
  } else {
    res.status(503).json({
      success: false,
      server: 'running',
      database: 'disconnected',
      error: dbHealth.error,
    });
  }
};
