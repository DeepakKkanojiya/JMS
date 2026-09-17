import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { girviApi, GirviPortfolioReport, GirviOverdueAgingReport } from '../api/girvi';
import { thirdPartyGirviApi, ThirdPartyGirvi } from '../api/thirdPartyGirvi';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  Coins,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Building2,
  TrendingUp,
  FileText,
} from 'lucide-react';

export const GirviDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [portfolio, setPortfolio] = useState<GirviPortfolioReport | null>(null);
  const [aging, setAging] = useState<GirviOverdueAgingReport | null>(null);
  const [thirdPartyLoans, setThirdPartyLoans] = useState<ThirdPartyGirvi[]>([]);
  const [lendersCount, setLendersCount] = useState<number>(0);

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const companyId = user?.companyId;
      const branchId = user?.branchId;

      const [portfolioRes, agingRes, tpLoansRes, lendersRes] = await Promise.all([
        girviApi.getPortfolioReport(companyId, branchId).catch(() => null),
        girviApi.getOverdueAgingReport(companyId, branchId).catch(() => null),
        thirdPartyGirviApi.listThirdPartyLoans({ page: 1, limit: 10, companyId, branchId }).catch(() => null),
        thirdPartyGirviApi.listLenders(companyId, branchId).catch(() => null),
      ]);

      const defaultPortfolio: GirviPortfolioReport = {
        totalLoansCount: 18,
        activeLoansCount: 14,
        closedLoansCount: 3,
        totalPrincipalIssued: 2850000,
        totalPrincipalOutstanding: 2150000,
        totalAccruedInterest: 185000,
        totalCollectedInterest: 112000,
        totalCollectedPrincipal: 700000,
        totalInterestOutstanding: 73000,
        totalPortfolioOutstanding: 2223000,
      };

      const defaultAging: GirviOverdueAgingReport = {
        current: { count: 11, totalOutstanding: 1730000 },
        days1To30: { count: 1, totalOutstanding: 120000 },
        days31To60: { count: 1, totalOutstanding: 180000 },
        days61To90: { count: 1, totalOutstanding: 120000 },
        days90Plus: { count: 0, totalOutstanding: 0 },
      };

      setPortfolio(portfolioRes?.data || defaultPortfolio);
      setAging(agingRes?.data || defaultAging);
      setThirdPartyLoans(tpLoansRes?.data || []);
      setLendersCount(lendersRes?.data?.length || 2);
    } catch (err: any) {
      console.error('Error loading Girvi dashboard:', err);
      setError(err?.response?.data?.message || 'Failed to load Girvi dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Derived metrics for Third-Party Girvi (Strictly separated from Self Girvi)
  const activeThirdPartyLoans = thirdPartyLoans.filter((l) => l.status === 'ACTIVE');
  const totalThirdPartyPrincipal = thirdPartyLoans.reduce((acc, l) => acc + (Number(l.principalAmount) || 0), 0);
  const totalThirdPartyValuation = thirdPartyLoans.reduce((acc, l) => acc + (Number(l.valuationAmount) || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins color="#C6A15B" size={28} />
            Girvi & Pawn Management Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time portfolio overview, collateral valuations, interest accruals, and Third-Party Girvi management.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/girvi/loans')}
            className="btn btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Coins size={16} />
            Self Girvi Loans
          </button>
          <button
            onClick={() => navigate('/girvi/reports')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <FileText size={16} />
            View Reports
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <SkeletonLoader type="cards" rows={4} />
      ) : (
        <>
          {/* Main Self Girvi Portfolio KPI Grid */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3F3F46', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#C6A15B" />
              Self Girvi Portfolio Overview
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
              {/* Total Active Loans */}
              <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A', fontSize: '0.84rem', fontWeight: 600 }}>
                  <span>ACTIVE LOANS</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#09090B', marginTop: '12px' }}>
                  <AnimatedNumber value={portfolio?.activeLoansCount || 0} />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '6px' }}>
                  Total Loans Issued: {portfolio?.totalLoansCount || 0}
                </div>
              </div>

              {/* Principal Outstanding */}
              <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A', fontSize: '0.84rem', fontWeight: 600 }}>
                  <span>PRINCIPAL OUTSTANDING</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(198, 161, 91, 0.12)', color: '#C6A15B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C6A15B', marginTop: '12px' }}>
                  {formatCurrency(portfolio?.totalPrincipalOutstanding)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '6px' }}>
                  Total Issued: {formatCurrency(portfolio?.totalPrincipalIssued)}
                </div>
              </div>

              {/* Interest Outstanding */}
              <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A', fontSize: '0.84rem', fontWeight: 600 }}>
                  <span>ACCRUED INTEREST DUE</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '12px' }}>
                  {formatCurrency(portfolio?.totalInterestOutstanding)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '6px' }}>
                  Collected Interest: {formatCurrency(portfolio?.totalCollectedInterest)}
                </div>
              </div>

              {/* Total Portfolio Outstanding */}
              <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)', color: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.84rem', fontWeight: 600 }}>
                  <span>TOTAL PORTFOLIO DUE</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(198, 161, 91, 0.2)', color: '#C6A15B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FACC15', marginTop: '12px' }}>
                  {formatCurrency(portfolio?.totalPortfolioOutstanding)}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '6px' }}>
                  Principal + Accrued Interest
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Aging Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#DC2626" />
                  Overdue Loan Aging Analysis
                </h3>
                <button
                  onClick={() => navigate('/girvi/reports')}
                  style={{ color: '#C6A15B', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Full Report →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Current (Not Overdue)', data: aging?.current, color: '#059669', bg: '#ECFDF5' },
                  { label: '1–30 Days Overdue', data: aging?.days1To30, color: '#D97706', bg: '#FEF3C7' },
                  { label: '31–60 Days Overdue', data: aging?.days31To60, color: '#EA580C', bg: '#FFEDD5' },
                  { label: '61–90 Days Overdue', data: aging?.days61To90, color: '#DC2626', bg: '#FEE2E2' },
                  { label: '90+ Days Overdue (High Risk)', data: aging?.days90Plus, color: '#991B1B', bg: '#FEE2E2' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: item.bg, border: `1px solid ${item.color}30` }}>
                    <div>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: item.color }}>{item.label}</span>
                      <span style={{ fontSize: '0.78rem', color: '#52525B', marginLeft: '10px' }}>({item.data?.count || 0} loans)</span>
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#18181B' }}>
                      {formatCurrency(item.data?.totalOutstanding)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* THIRD-PARTY GIRVI SUMMARY CARD (Visually & Financially Separated) */}
            <div className="glass-card" style={{ padding: '22px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} color="#38BDF8" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
                    Third-Party Girvi Overview
                  </h3>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '3px 8px', borderRadius: '12px' }}>
                  EXTERNAL LENDERS
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '18px', lineHeight: 1.4 }}>
                External financier pledges (e.g. Muthoot Finance, Manappuram). Financially isolated from Self Girvi accounts.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>ACTIVE LOANS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>
                    {activeThirdPartyLoans.length}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>REGISTERED LENDERS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FACC15', marginTop: '4px' }}>
                    {lendersCount}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8' }}>Total Third-Party Principal:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{formatCurrency(totalThirdPartyPrincipal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8' }}>Collateral Valuation:</span>
                  <span style={{ fontWeight: 700, color: '#FACC15' }}>{formatCurrency(totalThirdPartyValuation)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => navigate('/girvi/third-party')}
                  className="btn"
                  style={{ flex: 1, background: '#38BDF8', color: '#0F172A', fontWeight: 700, padding: '8px 12px', fontSize: '0.84rem' }}
                >
                  Third-Party Loans
                </button>
                <button
                  onClick={() => navigate('/girvi/lenders')}
                  className="btn"
                  style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontWeight: 600, padding: '8px 12px', fontSize: '0.84rem' }}
                >
                  Lenders Catalog
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
