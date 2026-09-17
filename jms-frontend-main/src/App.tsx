import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionGuard } from './components/auth/PermissionGuard';
import { Login } from './pages/Login';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Branches } from './pages/Branches';
import { Employees } from './pages/Employees';
import { Customers } from './pages/Customers';
import { Vendors } from './pages/Vendors';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { InventoryItems } from './pages/InventoryItems';
import { InventoryItemDetail } from './pages/InventoryItemDetail';
import { StockMovements } from './pages/StockMovements';
import { InventoryTags } from './pages/InventoryTags';
import { InventoryTransfers } from './pages/InventoryTransfers';
import { Users } from './pages/Users';
import { Roles } from './pages/Roles';
import { Permissions } from './pages/Permissions';
import { POSBilling } from './pages/POSBilling';
import { SalesInvoices } from './pages/SalesInvoices';
import { SalesInvoiceDetail } from './pages/SalesInvoiceDetail';
import { SalesPayments } from './pages/SalesPayments';
import { GoldExchanges } from './pages/GoldExchanges';
import { SalesReturns } from './pages/SalesReturns';
import { SalesRefunds } from './pages/SalesRefunds';
import { MetalRates } from './pages/MetalRates';
import { MakingCharges } from './pages/MakingCharges';
import { TaxRates } from './pages/TaxRates';

// Phase 5, 6, 7 & Action Hub Modules
import { GirviDashboard } from './pages/GirviDashboard';
import { SelfGirviLoans } from './pages/SelfGirviLoans';
import { GirviLoanDetail } from './pages/GirviLoanDetail';
import { GirviCollections } from './pages/GirviCollections';
import { GirviSettlements } from './pages/GirviSettlements';
import { ThirdPartyGirvis } from './pages/ThirdPartyGirvis';
import { ThirdPartyGirviDetail } from './pages/ThirdPartyGirviDetail';
import { ThirdPartyLenders } from './pages/ThirdPartyLenders';
import { GirviReports } from './pages/GirviReports';

import { PurchaseOrders } from './pages/PurchaseOrders';
import { PurchaseReceipts } from './pages/PurchaseReceipts';
import { PurchaseBills } from './pages/PurchaseBills';
import { PurchaseReturns } from './pages/PurchaseReturns';
import { VendorPayments } from './pages/VendorPayments';

import { ApprovalDashboard } from './pages/ApprovalDashboard';
import { ApprovalList } from './pages/ApprovalList';
import { ApprovalDeposits } from './pages/ApprovalDeposits';
import { ApprovalReports } from './pages/ApprovalReports';
import { ApprovalDetail } from './pages/ApprovalDetail';

import { StockAudits } from './pages/StockAudits';
import { KarigarJobWork } from './pages/KarigarJobWork';
import { Cashier } from './pages/Cashier';
import { Maintain } from './pages/Maintain';

const ProtectedRoute: React.FC<{ children: React.ReactNode; permission?: string }> = ({ children, permission }) => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    return <PermissionGuard permission={permission} fallback={<Navigate to="/" replace />}>{children}</PermissionGuard>;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Girvi / Pawn Subsystem Routes */}
            <Route path="girvi" element={<ProtectedRoute permission="girvi.read"><GirviDashboard /></ProtectedRoute>} />
            <Route path="girvi/loans" element={<ProtectedRoute permission="girvi.read"><SelfGirviLoans /></ProtectedRoute>} />
            <Route path="girvi/loans/:id" element={<ProtectedRoute permission="girvi.read"><GirviLoanDetail /></ProtectedRoute>} />
            <Route path="girvi/collections" element={<ProtectedRoute permission="girvi.collection.read"><GirviCollections /></ProtectedRoute>} />
            <Route path="girvi/settlements" element={<ProtectedRoute permission="girvi.settlement.read"><GirviSettlements /></ProtectedRoute>} />
            <Route path="girvi/third-party" element={<ProtectedRoute permission="third_party_girvi.read"><ThirdPartyGirvis /></ProtectedRoute>} />
            <Route path="girvi/third-party/:id" element={<ProtectedRoute permission="third_party_girvi.read"><ThirdPartyGirviDetail /></ProtectedRoute>} />
            <Route path="girvi/lenders" element={<ProtectedRoute permission="third_party_girvi.read"><ThirdPartyLenders /></ProtectedRoute>} />
            <Route path="girvi/reports" element={<ProtectedRoute permission="girvi.report.read"><GirviReports /></ProtectedRoute>} />

            {/* Procurement & Purchase Subsystem Routes */}
            <Route path="purchases/orders" element={<ProtectedRoute permission="purchase.read"><PurchaseOrders /></ProtectedRoute>} />
            <Route path="purchases/receipts" element={<ProtectedRoute permission="purchase.read"><PurchaseReceipts /></ProtectedRoute>} />
            <Route path="purchases/bills" element={<ProtectedRoute permission="purchase.read"><PurchaseBills /></ProtectedRoute>} />
            <Route path="purchases/returns" element={<ProtectedRoute permission="purchase.read"><PurchaseReturns /></ProtectedRoute>} />
            <Route path="purchases/payments" element={<ProtectedRoute permission="purchase.read"><VendorPayments /></ProtectedRoute>} />

            {/* Approval Subsystem Routes */}
            <Route path="approvals" element={<ProtectedRoute permission="approval.read"><ApprovalDashboard /></ProtectedRoute>} />
            <Route path="approvals/list" element={<ProtectedRoute permission="approval.read"><ApprovalList /></ProtectedRoute>} />
            <Route path="approvals/deposits" element={<ProtectedRoute permission="approval.read"><ApprovalDeposits /></ProtectedRoute>} />
            <Route path="approvals/reports" element={<ProtectedRoute permission="approval.read"><ApprovalReports /></ProtectedRoute>} />
            <Route path="approvals/:id" element={<ProtectedRoute permission="approval.read"><ApprovalDetail /></ProtectedRoute>} />

            {/* Stock Audits & Job Work Routes */}
            <Route path="stock-audits" element={<ProtectedRoute permission="stock_audit.read"><StockAudits /></ProtectedRoute>} />
            <Route path="job-work" element={<ProtectedRoute permission="job_work.read"><KarigarJobWork /></ProtectedRoute>} />

            {/* Action Hub Routes */}
            <Route path="cashier" element={<ProtectedRoute><Cashier /></ProtectedRoute>} />
            <Route path="maintain" element={<ProtectedRoute><Maintain /></ProtectedRoute>} />
            <Route path="sales/pos" element={<ProtectedRoute permission="sales_invoice.read"><POSBilling /></ProtectedRoute>} />
            <Route path="sales/invoices" element={<ProtectedRoute permission="sales_invoice.read"><SalesInvoices /></ProtectedRoute>} />
            <Route path="sales/invoices/:id" element={<ProtectedRoute permission="sales_invoice.read"><SalesInvoiceDetail /></ProtectedRoute>} />
            <Route path="sales/payments" element={<ProtectedRoute permission="sales_payment.read"><SalesPayments /></ProtectedRoute>} />
            <Route path="sales/gold-exchanges" element={<ProtectedRoute permission="gold_exchange.read"><GoldExchanges /></ProtectedRoute>} />
            <Route path="sales/returns" element={<ProtectedRoute permission="sales_return.read"><SalesReturns /></ProtectedRoute>} />
            <Route path="sales/refunds" element={<ProtectedRoute permission="sales_refund.read"><SalesRefunds /></ProtectedRoute>} />

            {/* Pricing & Tax Masters */}
            <Route path="masters/metal-rates" element={<ProtectedRoute permission="metal_rate.read"><MetalRates /></ProtectedRoute>} />
            <Route path="masters/making-charges" element={<ProtectedRoute permission="making_charge.read"><MakingCharges /></ProtectedRoute>} />
            <Route path="masters/tax-rates" element={<ProtectedRoute permission="tax_rate.read"><TaxRates /></ProtectedRoute>} />

            {/* Master Data Routes */}
            <Route path="companies" element={<ProtectedRoute permission="company.read"><Companies /></ProtectedRoute>} />
            <Route path="branches" element={<ProtectedRoute permission="branch.read"><Branches /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute permission="employee.read"><Employees /></ProtectedRoute>} />
            <Route path="customers" element={<ProtectedRoute permission="customer.read"><Customers /></ProtectedRoute>} />
            <Route path="vendors" element={<ProtectedRoute permission="vendor.read"><Vendors /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute permission="product.read"><Categories /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute permission="product.read"><Products /></ProtectedRoute>} />

            {/* Inventory Routes */}
            <Route path="inventory-items" element={<ProtectedRoute permission="inventory_item.read"><InventoryItems /></ProtectedRoute>} />
            <Route path="inventory-items/:id" element={<ProtectedRoute permission="inventory_item.read"><InventoryItemDetail /></ProtectedRoute>} />
            <Route path="stock-movements" element={<ProtectedRoute permission="stock_movement.read"><StockMovements /></ProtectedRoute>} />
            <Route path="inventory-tags" element={<ProtectedRoute permission="inventory_tag.read"><InventoryTags /></ProtectedRoute>} />
            <Route path="inventory-transfers" element={<ProtectedRoute permission="inventory_transfer.read"><InventoryTransfers /></ProtectedRoute>} />

            {/* Administration Routes */}
            <Route path="users" element={<ProtectedRoute permission="user.read"><Users /></ProtectedRoute>} />
            <Route path="roles" element={<ProtectedRoute permission="role.read"><Roles /></ProtectedRoute>} />
            <Route path="permissions" element={<ProtectedRoute permission="permission.read"><Permissions /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
