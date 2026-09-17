import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { corsOptions } from './config/cors';
import { healthRoutes } from './modules/health';
import { authRoutes, authAliasRouter } from './modules/auth';
import userRoutes from './modules/users/user.routes';
import roleRoutes from './modules/roles/role.routes';
import permissionRoutes from './modules/permissions/permission.routes';
import companyRoutes from './modules/companies/company.routes';
import branchRoutes from './modules/branches/branch.routes';
import employeeRoutes from './modules/employees/employee.routes';
import customerRoutes from './modules/customers/customer.routes';
import customerAddressRoutes from './modules/customer-addresses/customer-address.routes';
import customerDocumentRoutes from './modules/customer-documents/customer-document.routes';
import vendorRoutes from './modules/vendors/vendor.routes';
import productCategoryRoutes from './modules/product-categories/product-category.routes';
import productSubCategoryRoutes from './modules/product-sub-categories/product-sub-category.routes';
import productRoutes from './modules/products/product.routes';
import masterRoutes from './modules/masters/master.routes';
import inventoryItemRoutes from './modules/inventory-items/inventoryItem.routes';
import stockMovementRoutes from './modules/stock-movements/stockMovement.routes';
import inventoryTagRoutes, { itemTagRouter } from './modules/inventory-tags/inventoryTag.routes';
import path from 'path';
import inventoryTransferRoutes from './modules/inventory-transfers/inventoryTransfer.routes';
import productImageRoutes from './modules/product-images/productImage.routes';
import inventoryItemImageRoutes from './modules/inventory-item-images/inventoryItemImage.routes';
import salesInvoiceRoutes, { posLookupRouter } from './modules/sales-invoices/salesInvoice.routes';
import metalRateRoutes, { salesInvoiceRateLockRouter } from './modules/metal-rates/metalRate.routes';
import { makingChargeRoutes } from './modules/making-charges/makingCharge.routes';
import { taxRateRoutes } from './modules/tax-rates/taxRate.routes';
import { pricingRoutes } from './modules/pricing/pricing.routes';
import { salesPaymentRoutes, invoicePaymentRouter } from './modules/sales-payments/salesPayment.routes';
import { goldExchangeRoutes, invoiceGoldExchangeRouter } from './modules/gold-exchanges/goldExchange.routes';
import { salesReturnRoutes, invoiceReturnRouter } from './modules/sales-returns/salesReturn.routes';
import { salesRefundRoutes, returnRefundRouter } from './modules/sales-refunds/salesRefund.routes';
import purchaseRoutes from './modules/purchases/purchase.routes';
import purchaseReceiptRoutes from './modules/purchases/purchaseReceipt.routes';
import purchaseBillRoutes, { poPurchaseBillRouter, vendorPurchaseBillRouter } from './modules/purchase-bills/purchaseBill.routes';
import vendorPaymentRoutes, { billVendorPaymentRouter, vendorPayableRouter } from './modules/vendor-payments/vendorPayment.routes';
import purchaseReturnRoutes, { debitNoteRouter, vendorDebitNoteRouter } from './modules/purchase-returns/purchaseReturn.routes';
import jobWorkRoutes, { karigarJobWorkRouter } from './modules/job-work/jobWork.routes';
import stockAuditRoutes from './modules/stock-audit/stockAudit.routes';
import girviRoutes from './modules/girvi/girvi.routes';
import thirdPartyGirviRoutes from './modules/third-party-girvi/thirdPartyGirvi.routes';
import approvalRoutes from './modules/approval/approval.routes';
import approvalDepositRoutes from './modules/approval/approvalDeposit.routes';


import { swaggerSpec } from './docs/swagger';
import { errorHandler } from './middleware/error.middleware';
import { NotFoundError, DatabaseError } from './errors';
import { requestLogger, responseLogger } from './logger';
import { securityHeaders } from './middleware/security.middleware';
import { sanitizeInput } from './middleware/sanitize.middleware';
import { apiRateLimiter, authRateLimiter } from './middleware/rate-limit.middleware';

const app: Application = express();

// Set security HTTP headers
app.use(helmet());
app.use(securityHeaders);

// Enable CORS
app.use(cors(corsOptions));

// Input sanitization middleware to prevent XSS & HTML Injections
app.use(sanitizeInput);

// Parse JSON request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Gzip compression
app.use(compression());

// Request & Response Logging Middleware
app.use(requestLogger);
app.use(responseLogger);

if (!config.server.isTest) {
  app.use(morgan('combined'));
}

// Health Check Routes (Unprotected)
app.use('/', healthRoutes);

// Swagger Documentation Route (Unprotected)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs/json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Test Simulation Routes
const testRouter = express.Router();
testRouter.get('/db-error', (_req: Request, _res: Response, next: NextFunction) => {
  next(new DatabaseError('Database unavailable'));
});
testRouter.get('/internal-error', (_req: Request, _res: Response, next: NextFunction) => {
  next(new Error('Simulated uncaught exception'));
});
app.use(`${config.server.apiPrefix}/test`, testRouter);
app.use('/api/test', testRouter);
app.use('/test', testRouter);

// Apply Rate Limiters & Router Mounting
app.use(`${config.server.apiPrefix}/auth`, authRateLimiter, authRoutes);
app.use(`${config.server.apiPrefix}/users`, apiRateLimiter, userRoutes);
app.use(`${config.server.apiPrefix}/roles`, apiRateLimiter, roleRoutes);
app.use(`${config.server.apiPrefix}/permissions`, apiRateLimiter, permissionRoutes);
app.use(`${config.server.apiPrefix}/companies`, apiRateLimiter, companyRoutes);
app.use(`${config.server.apiPrefix}/branches`, apiRateLimiter, branchRoutes);
app.use(`${config.server.apiPrefix}/employees`, apiRateLimiter, employeeRoutes);
app.use(`${config.server.apiPrefix}/customers/:customerId/addresses`, apiRateLimiter, customerAddressRoutes);
app.use(`${config.server.apiPrefix}/customers/:customerId/documents`, apiRateLimiter, customerDocumentRoutes);
app.use(`${config.server.apiPrefix}/customers`, apiRateLimiter, customerRoutes);
app.use(`${config.server.apiPrefix}/vendors`, apiRateLimiter, vendorRoutes);
app.use(`${config.server.apiPrefix}/product-categories`, apiRateLimiter, productCategoryRoutes);
app.use(`${config.server.apiPrefix}/product-sub-categories`, apiRateLimiter, productSubCategoryRoutes);
app.use(`${config.server.apiPrefix}/products`, apiRateLimiter, productRoutes);
app.use(`${config.server.apiPrefix}/masters`, apiRateLimiter, masterRoutes);
app.use(`${config.server.apiPrefix}/inventory-items`, apiRateLimiter, inventoryItemRoutes);
app.use(`${config.server.apiPrefix}/inventory-items`, apiRateLimiter, itemTagRouter);
app.use(`${config.server.apiPrefix}/stock-movements`, apiRateLimiter, stockMovementRoutes);
app.use(`${config.server.apiPrefix}/inventory-tags`, apiRateLimiter, inventoryTagRoutes);
import { env } from './config/env';

// Serve static upload directory
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_PATH || 'uploads')));

app.use(`${config.server.apiPrefix}/products/:productId/images`, apiRateLimiter, productImageRoutes);
app.use(`${config.server.apiPrefix}/inventory-items/:inventoryItemId/images`, apiRateLimiter, inventoryItemImageRoutes);
app.use(`${config.server.apiPrefix}/inventory-transfers`, apiRateLimiter, inventoryTransferRoutes);
app.use(`${config.server.apiPrefix}/sales/pos`, apiRateLimiter, posLookupRouter);
app.use(`${config.server.apiPrefix}/sales/invoices`, apiRateLimiter, salesInvoiceRateLockRouter);
app.use(`${config.server.apiPrefix}/sales/invoices`, apiRateLimiter, invoicePaymentRouter);
app.use(`${config.server.apiPrefix}/sales/invoices`, apiRateLimiter, invoiceGoldExchangeRouter);
app.use(`${config.server.apiPrefix}/sales/invoices`, apiRateLimiter, invoiceReturnRouter);
app.use(`${config.server.apiPrefix}/sales`, apiRateLimiter, pricingRoutes);
app.use(`${config.server.apiPrefix}/sales/invoices`, apiRateLimiter, salesInvoiceRoutes);
app.use(`${config.server.apiPrefix}/sales/payments`, apiRateLimiter, salesPaymentRoutes);
app.use(`${config.server.apiPrefix}/sales/gold-exchanges`, apiRateLimiter, goldExchangeRoutes);
app.use(`${config.server.apiPrefix}/gold-exchanges`, apiRateLimiter, goldExchangeRoutes);
app.use(`${config.server.apiPrefix}/sales/returns`, apiRateLimiter, salesReturnRoutes);
app.use(`${config.server.apiPrefix}/sales/returns`, apiRateLimiter, returnRefundRouter);
app.use(`${config.server.apiPrefix}/sales/refunds`, apiRateLimiter, salesRefundRoutes);
app.use(`${config.server.apiPrefix}/sales-returns`, apiRateLimiter, salesReturnRoutes);
app.use(`${config.server.apiPrefix}/sales-refunds`, apiRateLimiter, salesRefundRoutes);
app.use(`${config.server.apiPrefix}/sales-payments`, apiRateLimiter, salesPaymentRoutes);
app.use(`${config.server.apiPrefix}/sales-invoices`, apiRateLimiter, salesInvoiceRateLockRouter);
app.use(`${config.server.apiPrefix}/sales-invoices`, apiRateLimiter, invoicePaymentRouter);
app.use(`${config.server.apiPrefix}/sales-invoices`, apiRateLimiter, invoiceGoldExchangeRouter);
app.use(`${config.server.apiPrefix}/sales-invoices`, apiRateLimiter, invoiceReturnRouter);
app.use(`${config.server.apiPrefix}/sales-invoices`, apiRateLimiter, pricingRoutes);
app.use(`${config.server.apiPrefix}/sales-invoices`, apiRateLimiter, salesInvoiceRoutes);
app.use(`${config.server.apiPrefix}/metal-rates`, apiRateLimiter, metalRateRoutes);
app.use(`${config.server.apiPrefix}/making-charges`, apiRateLimiter, makingChargeRoutes);
app.use(`${config.server.apiPrefix}/tax-rates`, apiRateLimiter, taxRateRoutes);
app.use(`${config.server.apiPrefix}/purchases/orders`, apiRateLimiter, purchaseRoutes);
app.use(`${config.server.apiPrefix}/purchases`, apiRateLimiter, purchaseRoutes);
app.use(`${config.server.apiPrefix}/purchases`, apiRateLimiter, poPurchaseBillRouter);
app.use(`${config.server.apiPrefix}/vendors`, apiRateLimiter, vendorPurchaseBillRouter);
app.use(`${config.server.apiPrefix}/purchase-receipts`, apiRateLimiter, purchaseReceiptRoutes);
app.use(`${config.server.apiPrefix}/purchase-bills`, apiRateLimiter, billVendorPaymentRouter);
app.use(`${config.server.apiPrefix}/purchase-bills`, apiRateLimiter, purchaseBillRoutes);
app.use(`${config.server.apiPrefix}/vendors`, apiRateLimiter, vendorPayableRouter);
app.use(`${config.server.apiPrefix}/vendors`, apiRateLimiter, vendorDebitNoteRouter);
app.use(`${config.server.apiPrefix}/vendor-payments`, apiRateLimiter, vendorPaymentRoutes);
app.use(`${config.server.apiPrefix}/purchase-returns`, apiRateLimiter, purchaseReturnRoutes);
app.use(`${config.server.apiPrefix}/vendor-debit-notes`, apiRateLimiter, debitNoteRouter);
app.use(`${config.server.apiPrefix}/job-work/orders`, apiRateLimiter, jobWorkRoutes);
app.use(`${config.server.apiPrefix}/karigars`, apiRateLimiter, karigarJobWorkRouter);
app.use(`${config.server.apiPrefix}/stock-audits`, apiRateLimiter, stockAuditRoutes);
app.use(`${config.server.apiPrefix}/girvi/loans`, apiRateLimiter, girviRoutes);
app.use(`${config.server.apiPrefix}/girvi`, apiRateLimiter, girviRoutes);
app.use(`${config.server.apiPrefix}/girvi`, apiRateLimiter, thirdPartyGirviRoutes);
app.use(`${config.server.apiPrefix}/approvals`, apiRateLimiter, approvalRoutes);
app.use(`${config.server.apiPrefix}/approval-deposits`, apiRateLimiter, approvalDepositRoutes);



// Fallbacks & Aliases for /api and direct root paths
app.use(`${config.server.apiPrefix}`, authAliasRouter);
app.use('/api', authAliasRouter);
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/', authAliasRouter);
app.use('/api/users', apiRateLimiter, userRoutes);
app.use('/api/roles', apiRateLimiter, roleRoutes);
app.use('/api/permissions', apiRateLimiter, permissionRoutes);
app.use('/api/companies', apiRateLimiter, companyRoutes);
app.use('/api/branches', apiRateLimiter, branchRoutes);
app.use('/api/employees', apiRateLimiter, employeeRoutes);
app.use('/api/customers/:customerId/addresses', apiRateLimiter, customerAddressRoutes);
app.use('/api/customers/:customerId/documents', apiRateLimiter, customerDocumentRoutes);
app.use('/api/customers', apiRateLimiter, customerRoutes);
app.use('/api/vendors', apiRateLimiter, vendorRoutes);
app.use('/api/product-categories', apiRateLimiter, productCategoryRoutes);
app.use('/api/product-sub-categories', apiRateLimiter, productSubCategoryRoutes);
app.use('/api/products', apiRateLimiter, productRoutes);
app.use('/api/products/:productId/images', apiRateLimiter, productImageRoutes);
app.use('/api/inventory-items/:inventoryItemId/images', apiRateLimiter, inventoryItemImageRoutes);
app.use('/api/inventory-items', apiRateLimiter, inventoryItemRoutes);
app.use('/api/masters', apiRateLimiter, masterRoutes);
app.use('/api/purchases/orders', apiRateLimiter, purchaseRoutes);
app.use('/api/purchases', apiRateLimiter, purchaseRoutes);
app.use('/api/purchases', apiRateLimiter, poPurchaseBillRouter);
app.use('/api/vendors', apiRateLimiter, vendorPurchaseBillRouter);
app.use('/api/purchase-receipts', apiRateLimiter, purchaseReceiptRoutes);
app.use('/api/purchase-bills', apiRateLimiter, billVendorPaymentRouter);
app.use('/api/purchase-bills', apiRateLimiter, purchaseBillRoutes);
app.use('/api/vendors', apiRateLimiter, vendorPayableRouter);
app.use('/api/vendors', apiRateLimiter, vendorDebitNoteRouter);
app.use('/api/vendor-payments', apiRateLimiter, vendorPaymentRoutes);
app.use('/api/purchase-returns', apiRateLimiter, purchaseReturnRoutes);
app.use('/api/vendor-debit-notes', apiRateLimiter, debitNoteRouter);
app.use('/api/job-work/orders', apiRateLimiter, jobWorkRoutes);
app.use('/api/karigars', apiRateLimiter, karigarJobWorkRouter);
app.use('/api/stock-audits', apiRateLimiter, stockAuditRoutes);
app.use('/api/girvi/loans', apiRateLimiter, girviRoutes);
app.use('/api/girvi', apiRateLimiter, girviRoutes);

app.use('/api/sales/pos', apiRateLimiter, posLookupRouter);
app.use('/api/sales/invoices', apiRateLimiter, salesInvoiceRateLockRouter);
app.use('/api/sales/invoices', apiRateLimiter, salesInvoiceRoutes);
app.use('/api/sales-invoices', apiRateLimiter, salesInvoiceRoutes);
app.use('/api/metal-rates', apiRateLimiter, metalRateRoutes);

app.use('/auth', authRateLimiter, authRoutes);
app.use('/users', apiRateLimiter, userRoutes);
app.use('/roles', apiRateLimiter, roleRoutes);
app.use('/permissions', apiRateLimiter, permissionRoutes);
app.use('/companies', apiRateLimiter, companyRoutes);
app.use('/branches', apiRateLimiter, branchRoutes);
app.use('/employees', apiRateLimiter, employeeRoutes);
app.use('/customers/:customerId/addresses', apiRateLimiter, customerAddressRoutes);
app.use('/customers/:customerId/documents', apiRateLimiter, customerDocumentRoutes);
app.use('/customers', apiRateLimiter, customerRoutes);
app.use('/vendors', apiRateLimiter, vendorRoutes);
app.use('/product-categories', apiRateLimiter, productCategoryRoutes);
app.use('/product-sub-categories', apiRateLimiter, productSubCategoryRoutes);
app.use('/products', apiRateLimiter, productRoutes);
app.use('/masters', apiRateLimiter, masterRoutes);
app.use('/inventory-items', apiRateLimiter, inventoryItemRoutes);
app.use('/purchases/orders', apiRateLimiter, purchaseRoutes);
app.use('/purchases', apiRateLimiter, purchaseRoutes);
app.use('/purchase-receipts', apiRateLimiter, purchaseReceiptRoutes);
app.use('/sales/pos', apiRateLimiter, posLookupRouter);
app.use('/sales/invoices', apiRateLimiter, salesInvoiceRateLockRouter);
app.use('/sales/invoices', apiRateLimiter, salesInvoiceRoutes);
app.use('/sales-invoices', apiRateLimiter, salesInvoiceRoutes);
app.use('/api/approvals', apiRateLimiter, approvalRoutes);
app.use('/approvals', apiRateLimiter, approvalRoutes);
app.use('/api/approval-deposits', apiRateLimiter, approvalDepositRoutes);
app.use('/approval-deposits', apiRateLimiter, approvalDepositRoutes);
app.use('/metal-rates', apiRateLimiter, metalRateRoutes);

// 404 Handler - For all unmatched routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route not found'));
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

export default app;
