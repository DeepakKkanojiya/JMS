import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  girviApi,
  GirviLoan,
  GirviFinancialSummary,
  GirviCollection,
  GirviAuditTrailResponse,
  GirviCollateral,
} from '../api/girvi';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  ShieldCheck,
  Receipt,
  RotateCcw,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const GirviLoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'collateral' | 'collections' | 'renewals' | 'settlement' | 'audit'>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [loan, setLoan] = useState<GirviLoan | null>(null);
  const [finSummary, setFinSummary] = useState<GirviFinancialSummary | null>(null);
  const [collections, setCollections] = useState<GirviCollection[]>([]);
  const [releasedCollaterals, setReleasedCollaterals] = useState<GirviCollateral[]>([]);
  const [auditTrail, setAuditTrail] = useState<GirviAuditTrailResponse | null>(null);

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

  const fetchLoanData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [loanRes, finRes, colRes, relRes, auditRes] = await Promise.all([
        girviApi.getLoanById(id).catch(() => null),
        girviApi.getFinancialSummary(id).catch(() => null),
        girviApi.getLoanCollections(id).catch(() => null),
        girviApi.getReleasedCollateral(id).catch(() => null),
        girviApi.getAuditTrail(id).catch(() => null),
      ]);

      if (loanRes?.success && loanRes?.data) {
        setLoan(loanRes.data);
      }
      if (finRes?.success && finRes?.data) {
        setFinSummary(finRes.data);
      }
      if (colRes?.success && Array.isArray(colRes.data)) {
        setCollections(colRes.data);
      }
      if (relRes?.success && Array.isArray(relRes.data)) {
        setReleasedCollaterals(relRes.data);
      }
      if (auditRes?.success && auditRes?.data) {
        setAuditTrail(auditRes.data);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load Girvi loan details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <SkeletonLoader type="detail" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Girvi Loan Not Found</h2>
        <button onClick={() => navigate('/girvi/loans')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Loans
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Navigation */}
      <button
        onClick={() => navigate('/girvi/loans')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Girvi Loans
      </button>

      {/* Main Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B' }}>
                Loan #{loan.loanNumber}
              </h1>
              <span style={{
                background: loan.status === 'ACTIVE' ? '#ECFDF5' : loan.status === 'CLOSED' ? '#E0F2FE' : loan.status === 'RENEWED' ? '#FEF3C7' : '#F3F4F6',
                color: loan.status === 'ACTIVE' ? '#059669' : loan.status === 'CLOSED' ? '#0284C7' : loan.status === 'RENEWED' ? '#D97706' : '#4B5563',
                padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 800
              }}>
                {loan.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '10px', fontSize: '0.86rem', color: '#52525B' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#C6A15B" />
                Customer: <strong>{loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName || ''}` : 'N/A'}</strong> ({loan.customer?.mobile})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="#C6A15B" />
                Branch: <strong>{loan.branch?.name || 'Main Branch'}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#C6A15B" />
                Loan Date: {new Date(loan.loanDate).toLocaleDateString('en-IN')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#DC2626" />
                Due Date: {new Date(loan.dueDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/girvi/loans')}
              className="btn btn-secondary"
            >
              Loan List
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #E4E4E7', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview & Details', icon: FileText },
          { id: 'financial', label: 'Financial Summary', icon: TrendingUp },
          { id: 'collateral', label: `Collateral Jewellery (${loan.collaterals?.length || 0})`, icon: ShieldCheck },
          { id: 'collections', label: `Collections (${collections.length})`, icon: Receipt },
          { id: 'renewals', label: `Renewals (${loan.renewals?.length || 0})`, icon: RotateCcw },
          { id: 'settlement', label: 'Settlement & Release', icon: CheckCircle2 },
          { id: 'audit', label: 'Chronological Audit Trail', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #C6A15B' : '3px solid transparent',
                color: isActive ? '#C6A15B' : '#71717A',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Loan Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Principal Amount:</span>
                <span style={{ fontWeight: 700, color: '#18181B' }}>{formatCurrency(loan.principalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Valuation Amount:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(loan.valuationAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Interest Rate:</span>
                <span style={{ fontWeight: 700, color: '#18181B' }}>{loan.interestRate}% ({loan.interestPeriod})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Document Reference:</span>
                <span style={{ fontWeight: 600, color: '#3F3F46' }}>{loan.documentRef || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Notes / Remarks:</span>
                <span style={{ fontWeight: 500, color: '#3F3F46' }}>{loan.notes || 'None'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Customer Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Customer Code:</span>
                <span style={{ fontWeight: 700, color: '#18181B' }}>{loan.customer?.customerCode || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Full Name:</span>
                <span style={{ fontWeight: 700, color: '#18181B' }}>{loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName || ''}` : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Mobile Number:</span>
                <span style={{ fontWeight: 600, color: '#18181B' }}>{loan.customer?.mobile}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A' }}>Email Address:</span>
                <span style={{ fontWeight: 500, color: '#3F3F46' }}>{loan.customer?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '18px' }}>
            Authoritative Financial Calculation Summary
          </h3>

          {finSummary ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E4E4E7' }}>
                <div style={{ fontSize: '0.78rem', color: '#71717A', fontWeight: 600 }}>PRINCIPAL OUTSTANDING</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181B', marginTop: '6px' }}>
                  {formatCurrency(finSummary.principalOutstanding)}
                </div>
              </div>

              <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 600 }}>ACCRUED INTEREST DUE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '6px' }}>
                  {formatCurrency(finSummary.interestOutstanding)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: '4px' }}>
                  Total Accrued: {formatCurrency(finSummary.accruedInterest)}
                </div>
              </div>

              <div style={{ padding: '16px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>INTEREST COLLECTED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                  {formatCurrency(finSummary.collectedInterest)}
                </div>
              </div>

              <div style={{ padding: '16px', background: '#18181B', color: '#FFFFFF', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>TOTAL OUTSTANDING DUE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FACC15', marginTop: '6px' }}>
                  {formatCurrency(finSummary.totalOutstanding)}
                </div>
                {finSummary.isOverdue && (
                  <div style={{ fontSize: '0.74rem', color: '#F87171', marginTop: '4px', fontWeight: 700 }}>
                    ⚠️ {finSummary.overdueDays} Days Overdue!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Loading financial summary...</p>
          )}
        </div>
      )}

      {activeTab === 'collateral' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Pledged Collateral Jewellery</h3>

          {loan.collaterals && loan.collaterals.length > 0 ? (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', fontSize: '0.78rem', color: '#71717A' }}>
                  <th style={{ padding: '10px 14px' }}>Item Name</th>
                  <th style={{ padding: '10px 14px' }}>Metal / Purity</th>
                  <th style={{ padding: '10px 14px' }}>Gross Wt</th>
                  <th style={{ padding: '10px 14px' }}>Net Wt</th>
                  <th style={{ padding: '10px 14px' }}>Valuation Amount</th>
                  <th style={{ padding: '10px 14px' }}>Barcode / RFID</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.collaterals.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#18181B' }}>{c.itemName}</td>
                    <td style={{ padding: '12px 14px', color: '#52525B' }}>{c.metalType} ({c.purity})</td>
                    <td style={{ padding: '12px 14px', color: '#52525B' }}>{Number(c.grossWeight).toFixed(3)} g</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#18181B' }}>{Number(c.netWeight).toFixed(3)} g</td>
                    <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 700 }}>{formatCurrency(c.valuedAmount)}</td>
                    <td style={{ padding: '12px 14px', color: '#71717A' }}>{c.barcode || 'N/A'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: c.isReleased ? '#ECFDF5' : '#FEF3C7',
                        color: c.isReleased ? '#059669' : '#D97706',
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700
                      }}>
                        {c.isReleased ? 'RELEASED' : 'PLEDGED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No collaterals attached.</p>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Collection Receipts History</h3>

          {collections.length > 0 ? (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', fontSize: '0.78rem', color: '#71717A' }}>
                  <th style={{ padding: '10px 14px' }}>Collection #</th>
                  <th style={{ padding: '10px 14px' }}>Date</th>
                  <th style={{ padding: '10px 14px' }}>Method</th>
                  <th style={{ padding: '10px 14px' }}>Total Amount</th>
                  <th style={{ padding: '10px 14px' }}>Interest Component</th>
                  <th style={{ padding: '10px 14px' }}>Principal Component</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((col) => (
                  <tr key={col.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#18181B' }}>{col.collectionNumber}</td>
                    <td style={{ padding: '12px 14px', color: '#52525B' }}>{new Date(col.collectionDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', color: '#52525B' }}>{col.paymentMethod}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#18181B' }}>{formatCurrency(col.amount)}</td>
                    <td style={{ padding: '12px 14px', color: '#D97706', fontWeight: 600 }}>{formatCurrency(col.interestAmount)}</td>
                    <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 600 }}>{formatCurrency(col.principalAmount)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: col.status === 'COMPLETED' ? '#ECFDF5' : '#FEE2E2',
                        color: col.status === 'COMPLETED' ? '#059669' : '#DC2626',
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700
                      }}>
                        {col.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No collections recorded for this loan yet.</p>
          )}
        </div>
      )}

      {activeTab === 'renewals' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Loan Renewals History</h3>

          {loan.renewals && loan.renewals.length > 0 ? (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', fontSize: '0.78rem', color: '#71717A' }}>
                  <th style={{ padding: '10px 14px' }}>Renewal Date</th>
                  <th style={{ padding: '10px 14px' }}>Previous Due Date</th>
                  <th style={{ padding: '10px 14px' }}>New Due Date</th>
                  <th style={{ padding: '10px 14px' }}>Interest Paid</th>
                  <th style={{ padding: '10px 14px' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loan.renewals.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#18181B' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', color: '#52525B' }}>{new Date(r.previousDueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#D97706' }}>{new Date(r.newDueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 600 }}>{formatCurrency(r.interestPaidAtRenewal)}</td>
                    <td style={{ padding: '12px 14px', color: '#71717A' }}>{r.remarks || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No renewals recorded.</p>
          )}
        </div>
      )}

      {activeTab === 'settlement' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Settlement & Collateral Release Status</h3>

          {loan.settlement ? (
            <div style={{ fontSize: '0.88rem' }}>
              <div style={{ padding: '16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ color: '#047857', fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>
                  ✅ Settlement #{loan.settlement.settlementNumber}
                </h4>
                <p style={{ color: '#065F46' }}>
                  Settled on <strong>{new Date(loan.settlement.settlementDate).toLocaleDateString('en-IN')}</strong> via <strong>{loan.settlement.paymentMethod}</strong>.
                </p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>Total Settled: <strong>{formatCurrency(loan.settlement.totalSettlementAmount)}</strong></div>
                  <div>Principal Settled: <strong>{formatCurrency(loan.settlement.principalSettled)}</strong></div>
                  <div>Interest Settled: <strong>{formatCurrency(loan.settlement.interestSettled)}</strong></div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '10px' }}>Released Collateral Items</h4>
              {releasedCollaterals.length > 0 ? (
                <ul>
                  {releasedCollaterals.map((item) => (
                    <li key={item.id} style={{ marginBottom: '6px' }}>
                      <strong>{item.itemName}</strong> — {Number(item.netWeight).toFixed(3)}g ({item.metalType} {item.purity}) — Valued at {formatCurrency(item.valuedAmount)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>All pledged items released upon settlement.</p>
              )}
            </div>
          ) : (
            <p>Loan is currently active/renewed and not yet settled.</p>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>360-Degree Activity Timeline</h3>

          {auditTrail && auditTrail.events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {auditTrail.events.map((ev, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '14px', padding: '12px', background: '#F8F9FA', borderRadius: '8px', borderLeft: '3px solid #C6A15B' }}>
                  <div style={{ minWidth: '140px', fontSize: '0.78rem', color: '#71717A' }}>
                    {new Date(ev.timestamp).toLocaleString('en-IN')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#18181B' }}>{ev.eventType}</div>
                    <div style={{ fontSize: '0.82rem', color: '#52525B', marginTop: '2px' }}>{ev.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No audit events recorded.</p>
          )}
        </div>
      )}
    </div>
  );
};
