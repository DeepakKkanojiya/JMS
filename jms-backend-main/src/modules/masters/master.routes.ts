import { Router } from 'express';
import { masterController } from './master.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/dropdowns', masterController.getDropdowns);
router.get('/statuses', masterController.getStatuses);
router.get('/branches', masterController.getBranches);
router.get('/roles', masterController.getRoles);
router.get('/categories', masterController.getCategories);

export default router;
