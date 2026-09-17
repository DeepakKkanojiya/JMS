import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';
import { commonSchemas } from './common.responses';
import { authSchemas, authPaths } from './auth.swagger';
import { userSchemas, userPaths } from './user.swagger';
import { customerPaths } from './customer.swagger';
import { inventoryPaths } from './inventory.swagger';
import { healthPaths } from './health.swagger';
import { masterDataPaths } from './masterData.swagger';
import { inventoryItemSwaggerDocs } from '../modules/inventory-items/inventoryItem.swagger';
import { stockMovementSwaggerDocs } from '../modules/stock-movements/stockMovement.swagger';
import { inventoryTagSwaggerDocs } from '../modules/inventory-tags/inventoryTag.swagger';
import { inventoryTransferSwaggerDocs } from '../modules/inventory-transfers/inventoryTransfer.swagger';
import { imageSwaggerDocs } from './image.swagger';

import { salesInvoiceSwaggerDocs } from '../modules/sales-invoices/salesInvoice.swagger';
import { metalRateSwaggerDocs } from '../modules/metal-rates/metalRate.swagger';
import { makingChargeSwaggerDocs } from '../modules/making-charges/makingCharge.swagger';
import { taxRateSwaggerDocs } from '../modules/tax-rates/taxRate.swagger';
import { salesPaymentSwaggerDocs } from '../modules/sales-payments/salesPayment.swagger';
import { goldExchangeSwaggerDocs } from '../modules/gold-exchanges/goldExchange.swagger';
import { salesReturnSwaggerDocs } from '../modules/sales-returns/salesReturn.swagger';
import { salesRefundSwaggerDocs } from '../modules/sales-refunds/salesRefund.swagger';
import { purchaseSwaggerDocs } from '../modules/purchases/purchase.swagger';
import { purchaseBillSwaggerDocs } from '../modules/purchase-bills/purchaseBill.swagger';
import { vendorPaymentSwaggerDocs } from '../modules/vendor-payments/vendorPayment.swagger';
import { purchaseReturnSwaggerDocs } from '../modules/purchase-returns/purchaseReturn.swagger';
import { jobWorkSwaggerDocs } from '../modules/job-work/jobWork.swagger';
import { stockAuditSwaggerDocs } from '../modules/stock-audit/stockAudit.swagger';
import { girviSwaggerDocs } from '../modules/girvi/girvi.swagger';
import { thirdPartyGirviSwaggerDocs } from '../modules/third-party-girvi/thirdPartyGirvi.swagger';
import { approvalSwaggerDocs } from '../modules/approval/approval.swagger';



const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jewellery ERP API',
      version: '1.0.0',
      description: 'Interactive OpenAPI 3.0 Documentation for Jewellery ERP Backend API Services.',
      contact: {
        name: 'Jewellery ERP Engineering Team',
        url: 'https://github.com/ctpl-rajveer/jms-backend',
      },
    },
    servers: [
      {
        url: `${config.server.apiPrefix}`,
        description: 'Current Host Domain Server (v1 Prefix)',
      },
      {
        url: 'https://jms-backend.up.railway.app/api/v1',
        description: 'Railway Production API Server',
      },
      {
        url: `${config.server.appUrl}${config.server.apiPrefix}`,
        description: 'Localhost API Server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User login, token refresh, logout, profile endpoints' },
      { name: 'Users', description: 'User management & administration endpoints' },
      { name: 'Role Management', description: 'Role creation, updates, and permission matrix assignment endpoints' },
      { name: 'Permission Management', description: 'System permission catalog and module listing endpoints' },
      { name: 'Companies', description: 'Company master profile management endpoints' },
      { name: 'Branches', description: 'Branch master location management endpoints' },
      { name: 'Employees', description: 'Employee master personnel endpoints' },
      { name: 'Customers', description: 'Customer management, POS quick search & KYC document upload endpoints' },
      { name: 'Vendors', description: 'Vendor supplier master endpoints' },
      { name: 'Product Categories', description: 'Product category taxonomy endpoints' },
      { name: 'Product Sub-Categories', description: 'Product sub-category taxonomy endpoints' },
      { name: 'Products', description: 'Product master inventory definition endpoints' },
      { name: 'Common Masters', description: 'Reusable dropdown options and lookup endpoints' },
      { name: 'Inventory', description: 'RFID Jewellery inventory management endpoints' },
      { name: 'Purchases & Procurement', description: 'Procurement purchase orders, line items, and approval workflows' },
      { name: 'Sales Invoices', description: 'Sales invoice foundation & draft workflow endpoints' },
      { name: 'Sales Invoices - Pricing', description: 'Sales invoice making charge, wastage & GST pricing breakdown calculation endpoints' },
      { name: 'Sales Payments', description: 'Sales transaction payment processing, settlement, split payments, and reversals' },
      { name: 'Sales Returns', description: 'Customer sales return requests, item restorations, and inventory reversals' },
      { name: 'Sales Refunds', description: 'Financial refund ledgers and payment reversals for processed sales returns' },
      { name: 'Metal Rate Engine', description: 'Company daily metal rates, rate resolution, metal value calculation, and invoice rate locking endpoints' },
      { name: 'Making Charges', description: 'Master making charge rate configurations (PER_GRAM, FIXED, PERCENTAGE)' },
      { name: 'Tax Rates', description: 'Master GST tax rate configurations' },
      { name: 'System', description: 'System health check endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Access Token (obtainable from /api/v1/auth/login)',
        },
      },
      schemas: {
        ...commonSchemas,
        ...authSchemas,
        ...userSchemas,
      },
    },
    paths: {
      ...healthPaths,
      ...authPaths,
      ...userPaths,
      ...customerPaths,
      ...masterDataPaths,
      ...inventoryPaths,
      ...inventoryItemSwaggerDocs,
      ...stockMovementSwaggerDocs,
      ...inventoryTagSwaggerDocs,
      ...inventoryTransferSwaggerDocs,
      ...imageSwaggerDocs,
      ...purchaseSwaggerDocs,
      ...purchaseBillSwaggerDocs,
      ...vendorPaymentSwaggerDocs,
      ...purchaseReturnSwaggerDocs,
      ...jobWorkSwaggerDocs,
      ...stockAuditSwaggerDocs,
      ...girviSwaggerDocs,
      ...thirdPartyGirviSwaggerDocs,
      ...approvalSwaggerDocs,

      ...salesInvoiceSwaggerDocs,
      ...metalRateSwaggerDocs,
      ...makingChargeSwaggerDocs,
      ...taxRateSwaggerDocs,
      ...salesPaymentSwaggerDocs.paths,
      ...goldExchangeSwaggerDocs.paths,
      ...salesReturnSwaggerDocs.paths,
      ...salesRefundSwaggerDocs.paths,
      '/profile': {
        get: {
          summary: 'User Profile (All Authenticated Users)',
          description: 'Allowed Roles: ADMIN, OWNER, STAFF, USER.',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile retrieved successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.swagger.ts', './src/docs/**/*.swagger.ts', './src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
