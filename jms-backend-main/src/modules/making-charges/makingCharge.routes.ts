import { Router } from 'express';
import { makingChargeController } from './makingCharge.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createMakingChargeSchema,
  updateMakingChargeSchema,
  makingChargeParamSchema,
  makingChargeQuerySchema,
} from './makingCharge.validation';

const router = Router();

router.use(authenticateToken);

router.post(
  '/',
  requirePermission('making_charge.create'),
  validate(createMakingChargeSchema),
  makingChargeController.createMakingCharge
);

router.get(
  '/current',
  requirePermission('making_charge.read'),
  makingChargeController.getCurrentMakingCharge
);

router.get(
  '/history',
  requirePermission('making_charge.read'),
  makingChargeController.getMakingChargeHistory
);

router.get(
  '/',
  requirePermission('making_charge.read'),
  validate({ query: makingChargeQuerySchema }),
  makingChargeController.getAllMakingCharges
);

router.get(
  '/:id',
  requirePermission('making_charge.read'),
  validate({ params: makingChargeParamSchema }),
  makingChargeController.getMakingChargeById
);

router.put(
  '/:id',
  requirePermission('making_charge.update'),
  validate({ params: makingChargeParamSchema, body: updateMakingChargeSchema }),
  makingChargeController.updateMakingCharge
);

router.post(
  '/:id/deactivate',
  requirePermission('making_charge.update'),
  validate({ params: makingChargeParamSchema }),
  makingChargeController.deactivateMakingCharge
);

export const makingChargeRoutes = router;
