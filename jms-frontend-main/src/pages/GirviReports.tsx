import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { girviApi, GirviPortfolioReport, GirviOverdueAgingReport, GirviCollection, GirviSettlement } from '../api/girvi';
import { thirdPartyGirviApi, ThirdPartyGirvi } from '../api/thirdPartyGirvi';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { FileText, ShieldCheck, Clock, Receipt, ArrowLeftRight, TrendingUp } from 'lucide-react';

export const GirviReports: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeReport, setActiveReport] = useState<'portfolio' | 'aging' | 'collections' | 'settlements' | 'thirdParty'>('portfolio');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [portfolio, setPortfolio] = useState<GirviPortfolioReport | null>(null);
  const [aging, setAging] = useState<GirviOverdueAgingReport | null>(null);
  const [collections, setCollections] = useState<GirviCollection[]>([]);
  const [settlements, setSettlements] = useState<GirviSettlement[]>([]);
  const [thirdPartyLoans, setThirdPartyLoans] = useState<ThirdPartyGirvi[]>([]);

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toastId = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const companyId = user?.companyId;
      const branchId = user?.branchId;

      const [portRes, agingRes, colRes, setRes, tpRes] = await Promise.all([
        girviApi.getPortfolioReport(companyId, branchId).catch(() => null),
        girviApi.getOverdueAgingReport(companyId, branchId).catch(() => null),
        girviApi.listCollections({ limit: 50, companyId }).catch(() => null),
        girviApi.listSettlements({ limit: 50, companyId }).catch(() => null),
        thirdPartyGirviApi.listThirdPartyLoans({ limit: 50, companyId }).catch(() => null),
      ]);

      if (portRes?.success) setPortfolio(portRes.data);
      if (agingRes?.success) setAging(agingRes.data);
      if (colRes?.success && Array.isArray(colRes.data)) setCollections(colRes.data);
      if (setRes?.success && Array.isArray(setRes.data)) setSettlements(setRes.data);
      if (tpRes?.success && Array.isArray(tpRes.data)) setThirdPartyLoans(tpRes.data);
    } catch (err: any) {
      showToast('Failed to load report metrics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="#C6A15B" size={26} />
          Girvi Unified Reporting & Analytics Catalog
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
          Authoritative read-only financial reporting, overdue aging, collections ledger, settlements, and Third-Party metrics.
        </p>
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'portfolio', label: 'Portfolio Summary', icon: TrendingUp },
          { id: 'aging', label: 'Overdue Aging Report', icon: Clock },
          { id: 'collections', label: 'Collections Ledger Report', icon: Receipt },
          { id: 'settlements', label: 'Settlement & Release Report', icon: ShieldCheck },
          { id: 'thirdParty', label: 'Third-Party Girvi Report', icon: ArrowLeftRight },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={isActive ? 'btn btn-gold' : 'btn btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.84rem' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" rows={5} />
      ) : (
        <>
          {activeReport === 'portfolio' && portfolio && (
            <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Self Girvi Portfolio Financial Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#71717A' }}>TOTAL ACTIVE LOANS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{portfolio.activeLoansCount}</div>
                </div>
                <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#71717A' }}>PRINCIPAL ISSUED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>{formatCurrency(portfolio.totalPrincipalIssued)}</div>
                </div>
                <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#B45309' }}>PRINCIPAL OUTSTANDING</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{formatCurrency(portfolio.totalPrincipalOutstanding)}</div>
                </div>
                <div style={{ padding: '16px', background: '#ECFDF5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#047857' }}>COLLECTED INTEREST</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{formatCurrency(portfolio.totalCollectedInterest)}</div>
                </div>
                <div style={{ padding: '16px', background: '#18181B', color: '#FFFFFF', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>TOTAL PORTFOLIO OUTSTANDING</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FACC15', marginTop: '4px' }}>{formatCurrency(portfolio.totalPortfolioOutstanding)}</div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'aging' && aging && (
            <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Overdue Aging Analysis Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Current (Not Overdue)', count: aging.current.count, total: aging.current.totalOutstanding, color: '#059669' },
                  { label: '1–30 Days Overdue', count: aging.days1To30.count, total: aging.days1To30.totalOutstanding, color: '#D97706' },
                  { label: '31–60 Days Overdue', count: aging.days31To60.count, total: aging.days31To60.totalOutstanding, color: '#EA580C' },
                  { label: '61–90 Days Overdue', count: aging.days61To90.count, total: aging.days61To90.totalOutstanding, color: '#DC2626' },
                  { label: '90+ Days Overdue', count: aging.days90Plus.count, total: aging.days90Plus.totalOutstanding, color: '#991B1B' },
                ].map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8F9FA', borderRadius: '8px', borderLeft: `4px solid ${row.color}` }}>
                    <div>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.label}</span>
                      <span style={{ fontSize: '0.82rem', color: '#71717A', marginLeft: '12px' }}>({row.count} loans)</span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#18181B' }}>{formatCurrency(row.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === 'collections' && (
            <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Collections Ledger Report</h3>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F9FA', fontSize: '0.78rem', color: '#71717A' }}>
                    <th style={{ padding: '10px 14px' }}>Collection #</th>
                    <th style={{ padding: '10px 14px' }}>Date</th>
                    <th style={{ padding: '10px 14px' }}>Method</th>
                    <th style={{ padding: '10px 14px' }}>Amount</th>
                    <th style={{ padding: '10px 14px' }}>Interest Component</th>
                    <th style={{ padding: '10px 14px' }}>Principal Component</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => (
                    <tr key={col.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{col.collectionNumber}</td>
                      <td style={{ padding: '12px 14px' }}>{new Date(col.collectionDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 14px' }}>{col.paymentMethod}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800 }}>{formatCurrency(col.amount)}</td>
                      <td style={{ padding: '12px 14px', color: '#D97706' }}>{formatCurrency(col.interestAmount)}</td>
                      <td style={{ padding: '12px 14px', color: '#059669' }}>{formatCurrency(col.principalAmount)}</td>
                      <td style={{ padding: '12px 14px' }}>{col.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'settlements' && (
            <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Settlements & Collateral Release Report</h3>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F9FA', fontSize: '0.78rem', color: '#71717A' }}>
                    <th style={{ padding: '10px 14px' }}>Settlement #</th>
                    <th style={{ padding: '10px 14px' }}>Settlement Date</th>
                    <th style={{ padding: '10px 14px' }}>Method</th>
                    <th style={{ padding: '10px 14px' }}>Total Settled</th>
                    <th style={{ padding: '10px 14px' }}>Principal Settled</th>
                    <th style={{ padding: '10px 14px' }}>Interest Settled</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{s.settlementNumber}</td>
                      <td style={{ padding: '12px 14px' }}>{new Date(s.settlementDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 14px' }}>{s.paymentMethod}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0284C7' }}>{formatCurrency(s.totalSettlementAmount)}</td>
                      <td style={{ padding: '12px 14px', color: '#059669' }}>{formatCurrency(s.principalSettled)}</td>
                      <td style={{ padding: '12px 14px', color: '#D97706' }}>{formatCurrency(s.interestSettled)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'thirdParty' && (
            <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Third-Party Girvi Report (External Lenders)</h3>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', color: '#FFFFFF' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.78rem', color: '#94A3B8' }}>
                    <th style={{ padding: '10px 14px' }}>JMS Ref</th>
                    <th style={{ padding: '10px 14px' }}>External Loan #</th>
                    <th style={{ padding: '10px 14px' }}>Lender</th>
                    <th style={{ padding: '10px 14px' }}>Principal</th>
                    <th style={{ padding: '10px 14px' }}>Valuation</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {thirdPartyLoans.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.86rem' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#38BDF8' }}>{l.referenceNumber}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{l.externalLoanNumber}</td>
                      <td style={{ padding: '12px 14px', color: '#FACC15' }}>{l.lender?.name}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{formatCurrency(l.principalAmount)}</td>
                      <td style={{ padding: '12px 14px', color: '#34D399' }}>{formatCurrency(l.valuationAmount)}</td>
                      <td style={{ padding: '12px 14px' }}>{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
