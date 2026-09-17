import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { inventoryApi } from '../api/inventory';
import { salesInvoiceApi, SalesInvoice } from '../api/salesInvoices';
import { metalRatesApi, MetalRate } from '../api/metalRates';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Store,
  BadgeCheck,
  UserCheck,
  Truck,
  Package,
  Search,
  Coins,
  Layers,
  CheckCircle,
  Clock,
  ArrowLeftRight,
  ShieldCheck,
  ShoppingBag,
  FileText,
  CreditCard,
  TrendingUp,
  RotateCcw,
  Sparkles,
  RefreshCw,
  QrCode,
  Tag,
  AlertCircle,
  DollarSign,
  PlusCircle,
  Eye,
  Hammer,
  Scale,
  Calculator,
  Flame,
  Zap,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, hasPermission, businessMode, setBusinessMode } = useAuth();
  const navigate = useNavigate();

  const getRoleCode = (u: any): string => {
    if (!u) return 'ADMIN';
    if (typeof u.role === 'string') return u.role.toUpperCase();
    if (typeof u.role === 'object' && u.role !== null) {
      return (u.role.code || u.role.name || 'ADMIN').toUpperCase();
    }
    return 'ADMIN';
  };

  const roleCode = getRoleCode(user);
  const roleName = (typeof user?.role === 'object' ? user?.role?.name : '')?.toUpperCase() || '';
  const email = (user?.email || '').toLowerCase();

  // Role Category Resolvers
  const isOwnerOrAdmin =
    roleCode === 'OWNER' ||
    roleCode === 'SUPER_ADMIN' ||
    roleCode === 'ADMIN' ||
    roleName.includes('OWNER') ||
    roleName.includes('SUPER') ||
    roleName.includes('ADMIN') ||
    roleName.includes('DIRECTOR');

  const isBranchManager =
    !isOwnerOrAdmin &&
    (roleCode === 'BRANCH_MANAGER' ||
      roleCode === 'MANAGER' ||
      roleName.includes('MANAGER') ||
      email.includes('manager'));

  const isCashierOrStaff =
    !isOwnerOrAdmin &&
    !isBranchManager &&
    (roleCode === 'CASHIER' ||
      roleCode === 'STAFF' ||
      roleName.includes('CASHIER') ||
      roleName.includes('STAFF') ||
      email.includes('cashier') ||
      email.includes('staff'));

  const isSalesperson =
    !isOwnerOrAdmin &&
    !isBranchManager &&
    !isCashierOrStaff &&
    (roleCode === 'SALESPERSON' ||
      roleCode === 'SALES_EXECUTIVE' ||
      roleName.includes('SALES') ||
      email.includes('sales'));

  const isInventory =
    !isOwnerOrAdmin &&
    !isBranchManager &&
    !isCashierOrStaff &&
    !isSalesperson &&
    (roleCode.includes('INVENTORY') ||
      roleCode.includes('VAULT') ||
      roleCode.includes('STOCK') ||
      roleName.includes('INVENTORY') ||
      email.includes('vault') ||
      email.includes('inventory'));

  const isAccountant =
    !isOwnerOrAdmin &&
    !isBranchManager &&
    !isCashierOrStaff &&
    !isSalesperson &&
    !isInventory &&
    (roleCode.includes('ACCOUNT') ||
      roleCode.includes('FINANCE') ||
      roleName.includes('ACCOUNT') ||
      email.includes('account'));

  const isKarigar =
    !isOwnerOrAdmin &&
    !isBranchManager &&
    !isCashierOrStaff &&
    !isSalesperson &&
    !isInventory &&
    !isAccountant &&
    (roleCode.includes('KARIGAR') ||
      roleCode.includes('WORKSHOP') ||
      roleCode.includes('GOLDSMITH') ||
      roleName.includes('KARIGAR') ||
      email.includes('karigar'));

  const [stats, setStats] = useState({
    companies: 0,
    branches: 0,
    employees: 0,
    customers: 0,
    vendors: 0,
    products: 0,
    inventoryItems: 0,
    availableItems: 0,
    reservedItems: 0,
    inTransitItems: 0,
    soldItems: 0,
    totalSalesVolume: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    invoicesCount: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<SalesInvoice[]>([]);
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [liveFeed, setLiveFeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingRates, setSyncingRates] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Salesperson Quick Quotation Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(10);
  const [calcPurity, setCalcPurity] = useState<string>('22K');
  const [calcMakingRate, setCalcMakingRate] = useState<number>(450);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        apiClient.get('/companies').catch(() => ({ data: { data: [] } })),
        apiClient.get('/branches').catch(() => ({ data: { data: [] } })),
        apiClient.get('/employees').catch(() => ({ data: { data: [] } })),
        apiClient.get('/customers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/vendors').catch(() => ({ data: { data: [] } })),
        apiClient.get('/products').catch(() => ({ data: { data: [] } })),
        inventoryApi.list({ limit: 100 }).catch(() => ({ data: [] })),
        hasPermission('sales_invoice.read')
          ? salesInvoiceApi.list({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => null)
          : Promise.resolve(null),
        metalRatesApi.list({ isActive: true, limit: 10 }).catch(() => ({ data: [] })),
        apiClient.get('/metal-rates/live').catch(() => ({ data: { data: null } })),
      ];

      const [compRes, branchRes, empRes, custRes, vendRes, prodRes, invRes, salesRes, ratesRes, liveRes] =
        await Promise.allSettled(promises);

      let invItems = invRes.status === 'fulfilled' ? invRes.value?.data || invRes.value : [];
      let itemsList = Array.isArray(invItems) ? invItems : invItems?.data || [];

      const availableCount = itemsList.filter((item: any) => item.status === 'AVAILABLE').length;
      const reservedCount = itemsList.filter((item: any) => item.status === 'RESERVED').length;
      const inTransitCount = itemsList.filter(
        (item: any) => item.status === 'IN_TRANSIT' || item.status === 'TRANSFER_PENDING'
      ).length;
      const soldCount = itemsList.filter((item: any) => item.status === 'SOLD').length;

      let invoicesList: SalesInvoice[] = [];
      let totalSales = 0;
      let paid = 0;
      let outstanding = 0;
      let totalInvoices = 0;

      if (salesRes.status === 'fulfilled' && salesRes.value) {
        invoicesList = salesRes.value.data || [];
        totalInvoices = salesRes.value.pagination?.total || invoicesList.length;
        setRecentInvoices(invoicesList);

        invoicesList.forEach((inv) => {
          totalSales += parseFloat(inv.grandTotal?.toString() || '0');
          paid += parseFloat(inv.totalPaid?.toString() || '0');
          outstanding += parseFloat(inv.outstandingAmount?.toString() || '0');
        });
      }

      if (ratesRes.status === 'fulfilled' && ratesRes.value?.data) {
        setMetalRates(ratesRes.value.data);
      }

      if (liveRes.status === 'fulfilled' && liveRes.value?.data?.data) {
        setLiveFeed(liveRes.value.data.data);
      }

      setStats({
        companies: compRes.status === 'fulfilled' ? compRes.value.data?.pagination?.total || compRes.value.data?.data?.length || 0 : 0,
        branches: branchRes.status === 'fulfilled' ? branchRes.value.data?.pagination?.total || branchRes.value.data?.data?.length || 0 : 0,
        employees: empRes.status === 'fulfilled' ? empRes.value.data?.pagination?.total || empRes.value.data?.data?.length || 0 : 0,
        customers: custRes.status === 'fulfilled' ? custRes.value.data?.pagination?.total || custRes.value.data?.data?.length || 0 : 0,
        vendors: vendRes.status === 'fulfilled' ? vendRes.value.data?.pagination?.total || vendRes.value.data?.data?.length || 0 : 0,
        products: prodRes.status === 'fulfilled' ? prodRes.value.data?.pagination?.total || prodRes.value.data?.data?.length || 0 : 0,
        inventoryItems: itemsList.length,
        availableItems: availableCount,
        reservedItems: reservedCount,
        inTransitItems: inTransitCount,
        soldItems: soldCount,
        totalSalesVolume: totalSales,
        totalPaid: paid,
        totalOutstanding: outstanding,
        invoicesCount: totalInvoices,
      });
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLiveRates = async () => {
    setSyncingRates(true);
    setSyncFeedback(null);
    try {
      const companiesRes = await apiClient.get('/companies');
      const compList = companiesRes.data?.data || [];
      if (compList.length === 0) {
        setSyncFeedback('No active company found to sync rates.');
        return;
      }
      const companyId = compList[0].id;
      const res = await apiClient.post('/metal-rates/sync-live', { companyId, markupPercent: 0 });
      if (res.data?.success) {
        setSyncFeedback(`Successfully synchronized ${res.data.data?.totalRatesUpdated || 'all'} live market rates to ${compList[0].name}.`);
        fetchDashboardData();
      }
    } catch (err: any) {
      setSyncFeedback(err?.response?.data?.message || 'Failed to synchronize live metal rates.');
    } finally {
      setSyncingRates(false);
    }
  };

  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const roleTitle = isOwnerOrAdmin
    ? 'Store Management (360° Overview)'
    : isBranchManager
    ? 'Showroom Store Management'
    : isCashierOrStaff
    ? 'Billing Counter & POS'
    : isSalesperson
    ? 'Sales & Catalog View'
    : isInventory
    ? 'Stock & Vault Control'
    : isAccountant
    ? 'Finance & Accounts'
    : isKarigar
    ? 'Workshop & Repairs'
    : 'Jewellery ERP Workspace';

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || (user as any)?.name || 'Staff Member';

  // Salesperson Quote Estimator calculation
  const getSelectedRate = (purity?: string): number => {
    const p = purity || calcPurity;
    const isSilver = p === '999' || p === '925';
    const isPlatinum = p === '950';
    const metalType = isSilver ? 'SILVER' : isPlatinum ? 'PLATINUM' : 'GOLD';
    
    const rateItem = metalRates.find((r) => r.purity === p && r.metalType === metalType);
    if (rateItem) return parseFloat(rateItem.ratePerGram.toString());
    
    if (p === '24K') return 14900;
    if (p === '22K') return 13700;
    if (p === '18K') return 11150;
    if (p === '14K') return 8650;
    if (p === '999') return 148;
    if (p === '925') return 136;
    if (p === '950') return 6250;
    return 13700;
  };

  const selectedRatePerGram = getSelectedRate();
  const estimatedMetalValue = calcWeight * selectedRatePerGram;
  const estimatedMakingCharge = calcWeight * calcMakingRate;
  const estimatedTaxable = estimatedMetalValue + estimatedMakingCharge;
  const estimatedGst = estimatedTaxable * 0.03;
  const estimatedGrandTotal = estimatedTaxable + estimatedGst;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Top Banner */}
      <div
        className="glass-card"
        style={{
          background: '#FFFFFF',
          borderLeft: '4px solid #C6A15B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 28px',
          boxShadow: '0 4px 16px rgba(11, 11, 13, 0.05)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#18181B', letterSpacing: '-0.5px' }}>
              {greetingTime}, {displayName}
            </h1>
            <span className="badge badge-gold">{roleTitle}</span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            {isOwnerOrAdmin && 'Enterprise store overview — sales, daily bullion rates, multi-branch operations, and profit margins.'}
            {isBranchManager && 'Showroom floor management — branch revenue, staff attendance, showroom inventory, and return approvals.'}
            {isCashierOrStaff && 'Billing counter workspace — scan barcodes/QR tags, lock live gold rates, and process customer receipts.'}
            {isSalesperson && 'Floor sales executive workspace — search jewellery catalog, calculate instant customer quotes, and manage client orders.'}
            {isInventory && 'Vault & stock controller — track tagged physical ornaments, receive vendor bullion, and manage branch stock transfers.'}
            {isAccountant && 'Finance & tax officer — monitor cash/UPI/card collections, customer credit balances, refunds, and GST (3%) tax ledgers.'}
            {isKarigar && 'Goldsmith & workshop supervisor — old gold melting, custom jewellery crafting, repair jobs, and gold assay tracking.'}
          </p>
        </div>
      </div>


      {/* Live Market Bullion Rate Ticker Banner */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          background: '#FCFBF7',
          border: '1px solid #F3E8D2',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C6A15B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} /> LIVE MARKET BULLION BENCHMARK & STORE RATES
          </div>
          {isOwnerOrAdmin && (
            <button
              onClick={handleSyncLiveRates}
              disabled={syncingRates}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 12px', borderColor: '#C6A15B', color: '#8F7132' }}
            >
              <Zap size={13} color="#C6A15B" />
              <span>{syncingRates ? 'Syncing...' : '1-Click Sync to Store Rates'}</span>
            </button>
          )}
        </div>

        {syncFeedback && (
          <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
            <CheckCircle size={14} /> {syncFeedback}
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {liveFeed?.rates?.map((item: any) => (
            <div key={item.purity + item.metalType} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                {item.metalType} {item.purity}:
              </span>
              <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.02rem' }}>
                ₹{parseFloat(item.ratePerGram.toString()).toLocaleString('en-IN')}/g
              </span>
              {item.change24h !== undefined && (
                <span style={{ fontSize: '0.72rem', color: item.change24h >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>
                  ({item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STORE OWNER / SUPER ADMIN / ADMIN: 360° EXECUTIVE DASHBOARD            */}
      {/* ========================================================================= */}
      {isOwnerOrAdmin && (
        <>
          {/* Executive KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-card glass-card-interactive" style={{ padding: '18px', borderTop: '3px solid #C6A15B' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Total Sales Volume</span>
                <Coins size={18} color="#C6A15B" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B' }}>
                ₹{stats.totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#C6A15B', fontWeight: 600, marginTop: '4px' }}>
                {stats.invoicesCount} Customer Invoices
              </div>
            </div>

            <div className="glass-card glass-card-interactive" style={{ padding: '18px', borderTop: '3px solid #059669' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Total Collections</span>
                <CreditCard size={18} color="#059669" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
                ₹{stats.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                Cash, UPI & Card Settlements
              </div>
            </div>

            <div className="glass-card glass-card-interactive" style={{ padding: '18px', borderTop: '3px solid #D97706' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Customer Receivables</span>
                <DollarSign size={18} color="#D97706" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706' }}>
                ₹{stats.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 600, marginTop: '4px' }}>
                Outstanding Dues
              </div>
            </div>

            <div className="glass-card glass-card-interactive" style={{ padding: '18px', borderTop: '3px solid #2563EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Store Showrooms</span>
                <Store size={18} color="#2563EB" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B' }}>
                {stats.branches}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>
                Across {stats.companies} Enterprises
              </div>
            </div>

            <div className="glass-card glass-card-interactive" style={{ padding: '18px', borderTop: '3px solid #7C3AED' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Registered Clients</span>
                <UserCheck size={18} color="#7C3AED" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B' }}>
                {stats.customers}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 600, marginTop: '4px' }}>
                Retail, B2B, VIP & Corporate
              </div>
            </div>
          </div>

          {/* Stock Health Breakdown */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#C6A15B" /> Enterprise Inventory Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>AVAILABLE STOCK</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{stats.availableItems}</div>
                <span className="badge badge-emerald" style={{ marginTop: '6px' }}>Ready for POS Sale</span>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>RESERVED / ON HOLD</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{stats.reservedItems}</div>
                <span className="badge badge-gold" style={{ marginTop: '6px' }}>Customer Booking</span>
              </div>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 700 }}>SOLD PIECES</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6', marginTop: '2px' }}>{stats.soldItems}</div>
                <span className="badge badge-platinum" style={{ marginTop: '6px' }}>Delivered to Clients</span>
              </div>
            </div>
          </div>

          {/* Dedicated Girvi & Approval Hub Cards */}
          <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #C6A15B' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#C6A15B" /> Phase 6 & 7 Subsystems — Girvi Pawn & Sell on Approval (Jangad)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div
                onClick={() => navigate('/girvi/loans')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#FDFCF7',
                  border: '1px solid rgba(198,161,91,0.3)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92700A' }}>Self Girvi Loans</span>
                  <Coins size={20} color="#C6A15B" />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                  Register pawn loans, calculate interest accruals & manage pledged items.
                </p>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Open Loans Hub →</span>
              </div>

              <div
                onClick={() => navigate('/girvi/collections')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#FDFCF7',
                  border: '1px solid rgba(198,161,91,0.3)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92700A' }}>Girvi Collections</span>
                  <CreditCard size={20} color="#C6A15B" />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                  Record interest & principal repayments with mandatory reversal audit logs.
                </p>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Collections Ledger →</span>
              </div>

              <div
                onClick={() => navigate('/approvals/list')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#FDFCF7',
                  border: '1px solid rgba(198,161,91,0.3)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92700A' }}>Approvals Issued (Jangad)</span>
                  <Tag size={20} color="#C6A15B" />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                  Issue ornaments out on customer approval, process returns & convert to POS sales.
                </p>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Jangad Register →</span>
              </div>

              <div
                onClick={() => navigate('/approvals/deposits')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#FDFCF7',
                  border: '1px solid rgba(198,161,91,0.3)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92700A' }}>Customer Deposits</span>
                  <ShieldCheck size={20} color="#C6A15B" />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '10px' }}>
                  Manage cash or gold security deposits collected against approval vouchers.
                </p>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Deposits Ledger →</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. BRANCH MANAGER: SHOWROOM MANAGEMENT DASHBOARD                          */}
      {/* ========================================================================= */}
      {isBranchManager && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #C6A15B' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>BRANCH BILLED REVENUE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
                ₹{stats.totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#C6A15B', marginTop: '4px' }}>Across {stats.invoicesCount} showroom bills</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>SHOWROOM STOCK ON HAND</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {stats.availableItems} Pieces
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Available on sales counter</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>BRANCH STAFF MEMBERS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                {stats.employees} Active Staff
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '4px' }}>Sales & Cashier team</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/sales/pos')} className="btn btn-gold">
              <ShoppingBag size={16} /> Open Billing Counter
            </button>
            <button onClick={() => navigate('/sales/returns')} className="btn btn-secondary">
              <RotateCcw size={16} /> Return Approvals
            </button>
            <button onClick={() => navigate('/employees')} className="btn btn-secondary">
              <BadgeCheck size={16} /> Staff Attendance & Profiles
            </button>
            <button onClick={() => navigate('/inventory-transfers')} className="btn btn-secondary">
              <ArrowLeftRight size={16} /> Branch Transfers
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CASHIER & STAFF: BILLING COUNTER & POS DASHBOARD                       */}
      {/* ========================================================================= */}
      {isCashierOrStaff && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #C6A15B' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>TODAY'S BILLED SALES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
                ₹{stats.totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Across {stats.invoicesCount} customer bills</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>PAYMENTS COLLECTED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ₹{stats.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Settled cash / UPI / card</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>REMAINING CUSTOMER DUES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                ₹{stats.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '4px' }}>Pending settlement</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>ITEMS READY TO SCAN</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                {stats.availableItems}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '4px' }}>Barcode tagged items</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/sales/pos')} className="btn btn-gold" style={{ padding: '12px 20px' }}>
              <ShoppingBag size={18} /> New POS Bill / Invoice
            </button>
            <button onClick={() => navigate('/sales/invoices')} className="btn btn-secondary">
              <FileText size={16} /> All Invoices
            </button>
            <button onClick={() => navigate('/sales/payments')} className="btn btn-secondary">
              <CreditCard size={16} /> Record Payment
            </button>
            <button onClick={() => navigate('/customers')} className="btn btn-secondary">
              <UserCheck size={16} /> Customer Lookup
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SALESPERSON: SALES, CATALOGUE & ESTIMATION CALCULATOR                   */}
      {/* ========================================================================= */}
      {isSalesperson && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Quotation Estimator Widget */}
          <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderTop: '4px solid #C6A15B' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={20} color="#C6A15B" /> Instant Jewellery Price Estimator (Quote Calculator)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Quickly calculate estimate for walk-in customer based on weight, karat purity, making charges, and GST 3%.
                </p>
              </div>
              <button onClick={() => navigate('/products')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                <Package size={14} /> Browse Catalog
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Net Weight (Grams)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="form-input"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Gold Purity</label>
                <select
                  className="form-input"
                  value={calcPurity}
                  onChange={(e) => setCalcPurity(e.target.value)}
                >
                  <option value="24K">24K Pure (₹{getSelectedRate('24K')}/g)</option>
                  <option value="22K">22K Standard (₹{getSelectedRate('22K')}/g)</option>
                  <option value="18K">18K Diamond (₹{getSelectedRate('18K')}/g)</option>
                  <option value="14K">14K Designer (₹{getSelectedRate('14K')}/g)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Making Charges (₹ / gram)</label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  className="form-input"
                  value={calcMakingRate}
                  onChange={(e) => setCalcMakingRate(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>ESTIMATED TOTAL (INCL. GST 3%)</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#C6A15B', marginTop: '2px' }}>
                  ₹{estimatedGrandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Metal: ₹{estimatedMetalValue.toFixed(0)} | Making: ₹{estimatedMakingCharge.toFixed(0)} | GST: ₹{estimatedGst.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/products')} className="btn btn-gold">
              <Package size={16} /> Jewellery Showcase & SKUs
            </button>
            <button onClick={() => navigate('/sales/pos')} className="btn btn-secondary">
              <ShoppingBag size={16} /> Create Draft Bill
            </button>
            <button onClick={() => navigate('/customers')} className="btn btn-secondary">
              <UserCheck size={16} /> Customer Directory
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INVENTORY MANAGER: VAULT & STOCK CONTROL                               */}
      {/* ========================================================================= */}
      {isInventory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>AVAILABLE STOCK PIECES</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {stats.availableItems}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Ready on showroom floor</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700 }}>RESERVED ITEMS</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {stats.reservedItems}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Customer booking hold</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700 }}>IN-TRANSIT TRANSFERS</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                {stats.inTransitItems}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Inter-branch shipments</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #64748B' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>SOLD INVENTORY PIECES</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#64748B', marginTop: '4px' }}>
                {stats.soldItems}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Sold via POS invoices</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/inventory-items')} className="btn btn-gold">
              <Layers size={16} /> Manage Physical Inventory Items
            </button>
            <button onClick={() => navigate('/inventory-tags')} className="btn btn-secondary">
              <Tag size={16} /> Barcode & QR Code Tags
            </button>
            <button onClick={() => navigate('/inventory-transfers')} className="btn btn-secondary">
              <ArrowLeftRight size={16} /> Stock Transfers
            </button>
            <button onClick={() => navigate('/stock-movements')} className="btn btn-secondary">
              <RotateCcw size={16} /> Stock Movement Ledgers
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ACCOUNTANT: FINANCE, TAX & SETTLEMENTS                                  */}
      {/* ========================================================================= */}
      {isAccountant && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #C6A15B' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>GROSS BILLED REVENUE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
                ₹{stats.totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#C6A15B', marginTop: '4px' }}>Total sales invoice volume</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>TOTAL PAYMENTS COLLECTED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ₹{stats.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Received via Cash, UPI, Card & Bank</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>CUSTOMER RECEIVABLES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                ₹{stats.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '4px' }}>Outstanding credit balances</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/sales/payments')} className="btn btn-gold">
              <CreditCard size={16} /> Payment Settlements Ledger
            </button>
            <button onClick={() => navigate('/sales/refunds')} className="btn btn-secondary">
              <RotateCcw size={16} /> Sales Refunds
            </button>
            <button onClick={() => navigate('/masters/tax-rates')} className="btn btn-secondary">
              <Calculator size={16} /> GST (3%) Tax Rates
            </button>
            <button onClick={() => navigate('/sales/invoices')} className="btn btn-secondary">
              <FileText size={16} /> Sales Invoices Directory
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. KARIGAR SUPERVISOR: WORKSHOP & REPAIRS                                 */}
      {/* ========================================================================= */}
      {isKarigar && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #C6A15B' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>OLD GOLD EXCHANGE JOBS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
                Active Valuation
              </div>
              <div style={{ fontSize: '0.75rem', color: '#C6A15B', marginTop: '4px' }}>Melting, assaying & purity testing</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>AVAILABLE VAULT PIECES</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {stats.availableItems} Items
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Stock in workshop & showroom</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/sales/gold-exchanges')} className="btn btn-gold">
              <Flame size={16} /> Customer Old Gold Exchange Intake
            </button>
            <button onClick={() => navigate('/products')} className="btn btn-secondary">
              <Package size={16} /> Product Specifications Master
            </button>
            <button onClick={() => navigate('/stock-movements')} className="btn btn-secondary">
              <ArrowLeftRight size={16} /> Goldsmith Movement Records
            </button>
          </div>
        </div>
      )}

      {/* Recent Customer Invoices Table (Universal across commercial roles) */}
      {!isInventory && !isKarigar && recentInvoices.length > 0 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B' }}>Recent Customer Invoices</h3>
            <button onClick={() => navigate('/sales/invoices')} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              <span>View All Invoices</span>
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Grand Total</th>
                  <th>Paid Amount</th>
                  <th>Payment Status</th>
                  <th>Invoice Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.slice(0, 6).map((inv) => (
                  <tr key={inv.id} onClick={() => navigate(`/sales/invoices/${inv.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700, color: '#C6A15B' }}>#{inv.invoiceNumber}</td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer?.firstName} {inv.customer?.lastName || ''}</td>
                    <td style={{ fontWeight: 800 }}>₹{parseFloat(inv.grandTotal?.toString() || '0').toLocaleString('en-IN')}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>₹{parseFloat(inv.totalPaid?.toString() || '0').toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-emerald' : inv.paymentStatus === 'PARTIALLY_PAID' ? 'badge-platinum' : 'badge-ruby'}`}>
                        {inv.paymentStatus || 'UNPAID'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${inv.status === 'CONFIRMED' ? 'badge-emerald' : inv.status === 'DRAFT' ? 'badge-gold' : 'badge-ruby'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
