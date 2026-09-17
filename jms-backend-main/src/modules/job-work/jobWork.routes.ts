import { Router } from 'express';
import { jobWorkController } from './jobWork.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import {
  createJobWorkOrderSchema,
  updateJobWorkOrderSchema,
  issueMaterialSchema,
  receiveJobWorkSchema,
  cancelJobWorkOrderSchema,
  jobWorkOrderParamSchema,
  jobWorkOrderQuerySchema,
} from './jobWork.validation';

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/v1/job-work/orders
 * @desc    Create a draft job work order
 * @access  Private (job_work.create)
 */
router.post(
  '/',
  requirePermission('job_work.create'),
  validate({ body: createJobWorkOrderSchema }),
  jobWorkController.createJobWorkOrder
);

/**
 * @route   GET /api/v1/job-work/orders
 * @desc    List paginated job work orders with filters
 * @access  Private (job_work.read)
 */
router.get(
  '/',
  requirePermission('job_work.read'),
  validate({ query: jobWorkOrderQuerySchema }),
  jobWorkController.getAllJobWorkOrders
);

/**
 * @route   GET /api/v1/job-work/orders/:id
 * @desc    Get job work order details by ID
 * @access  Private (job_work.read)
 */
router.get(
  '/:id',
  requirePermission('job_work.read'),
  validate({ params: jobWorkOrderParamSchema }),
  jobWorkController.getJobWorkOrderById
);

/**
 * @route   PUT /api/v1/job-work/orders/:id
 * @desc    Update draft job work order
 * @access  Private (job_work.update)
 */
router.put(
  '/:id',
  requirePermission('job_work.update'),
  validate({ params: jobWorkOrderParamSchema, body: updateJobWorkOrderSchema }),
  jobWorkController.updateJobWorkOrder
);

/**
 * @route   POST /api/v1/job-work/orders/:id/submit
 * @desc    Submit draft job work order for review
 * @access  Private (job_work.submit)
 */
router.post(
  '/:id/submit',
  requirePermission('job_work.submit'),
  validate({ params: jobWorkOrderParamSchema }),
  jobWorkController.submitJobWorkOrder
);

/**
 * @route   POST /api/v1/job-work/orders/:id/assign
 * @desc    Assign submitted job work order to Karigar
 * @access  Private (job_work.assign)
 */
router.post(
  '/:id/assign',
  requirePermission('job_work.assign'),
  validate({ params: jobWorkOrderParamSchema }),
  jobWorkController.assignJobWorkOrder
);

/**
 * @route   POST /api/v1/job-work/orders/:id/issue-material
 * @desc    Issue raw metal, loose stones, or inventory stock to Karigar
 * @access  Private (job_work.issue)
 */
router.post(
  '/:id/issue-material',
  requirePermission('job_work.issue'),
  validate({ params: jobWorkOrderParamSchema, body: issueMaterialSchema }),
  jobWorkController.issueMaterialToKarigar
);

/**
 * @route   POST /api/v1/job-work/orders/:id/receive
 * @desc    Receive finished goods or returned raw material from Karigar
 * @access  Private (job_work.receive)
 */
router.post(
  '/:id/receive',
  requirePermission('job_work.receive'),
  validate({ params: jobWorkOrderParamSchema, body: receiveJobWorkSchema }),
  jobWorkController.receiveJobWorkFromKarigar
);

/**
 * @route   POST /api/v1/job-work/orders/:id/cancel
 * @desc    Cancel job work order with mandatory reason
 * @access  Private (job_work.cancel)
 */
router.post(
  '/:id/cancel',
  requirePermission('job_work.cancel'),
  validate({ params: jobWorkOrderParamSchema, body: cancelJobWorkOrderSchema }),
  jobWorkController.cancelJobWorkOrder
);

export default router;

// Karigar Summary sub-router
export const karigarJobWorkRouter = Router();
karigarJobWorkRouter.use(authenticateToken);

/**
 * @route   GET /api/v1/karigars/:id/job-work-summary
 * @desc    Get job work ledger summary for a Karigar (Vendor)
 * @access  Private (job_work.read)
 */
karigarJobWorkRouter.get(
  '/:id/job-work-summary',
  requirePermission('job_work.read'),
  validate({ params: jobWorkOrderParamSchema }),
  jobWorkController.getKarigarSummary
);
