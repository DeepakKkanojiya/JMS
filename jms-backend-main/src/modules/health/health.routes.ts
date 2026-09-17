import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

router.get('/health', healthController.getHealth);
router.get('/health/ready', healthController.getReadiness);
router.get('/health/live', healthController.getLiveness);
router.get('/ready', healthController.getReadiness);
router.get('/live', healthController.getLiveness);
router.get('/', healthController.getHealth);

export default router;
