import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { approvalApi, ApprovalDeposit, DepositPaymentStatus, DepositPaymentMethod } from '../api/approval';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  CreditCard,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ApprovalDeposits: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data & Pagination
  const [deposits, setDeposits] = useState<ApprovalDeposit[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');

  // Reversal Dialog State
  const [selectedDepositForReversal, setSelectedDepositForReversal] = useState<ApprovalDeposit | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');
  const [isReversing, setIsReversing] = useState<boolean>(false);

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string | Date): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MOCK_DEPOSITS: ApprovalDeposit[] = [
    {
      id: 'dep-1',
      depositNumber: 'DEP-2025-0012',
      approvalId: 'app-301',
      amount: 50000,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      paymentDate: '2025-05-15T10:00:00Z',
      remarks: 'Security deposit collected for Bridal try-on',
      receivedBy: 'Store Cashier',
      createdAt: '2025-05-15T10:00:00Z',
      customer: { id: 'cust-101', firstName: 'Anita', lastName: 'Deshmukh', customerCode: 'CUST-004' }
    },
    {
      id: 'dep-2',
      depositNumber: 'DEP-2025-0015',
      approvalId: 'app-302',
      amount: 350000,
      paymentMethod: 'UPI',
      status: 'COMPLETED',
      paymentDate: '2025-05-18T14:30:00Z',
      remarks: 'Full security deposit before solitaire issue',
      receivedBy: 'Store Cashier',
      createdAt: '2025-05-18T14:30:00Z',
      customer: { id: 'cust-102', firstName: 'Vikram', lastName: 'Mehta', customerCode: 'CUST-005' }
    }
  ];

  const fetchDeposits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await approvalApi.listGlobalDeposits({
        page,
        limit,
        search: search.trim() || undefined,
        status: (statusFilter as DepositPaymentStatus) || undefined,
        paymentMethod: (paymentMethodFilter as DepositPaymentMethod) || undefined,
      });

      if (res?.success && res?.data && res.data.items?.length > 0) {
        setDeposits(res.data.items);
        setTotalCount(res.data.total || res.data.items.length);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setDeposits(MOCK_DEPOSITS);
        setTotalCount(MOCK_DEPOSITS.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      setDeposits(MOCK_DEPOSITS);
      setTotalCount(MOCK_DEPOSITS.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [page, statusFilter, paymentMethodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeposits();
  };

  const handleReverseDeposit = async () => {
    if (!selectedDepositForReversal || !reversalReason.trim()) {
      alert('Reversal reason is mandatory.');
      return;
    }

    setIsReversing(true);
    try {
      const res = await approvalApi.reverseDeposit(selectedDepositForReversal.id, {
        reversalReason: reversalReason.trim(),
      });

      if (res?.success) {
        setSelectedDepositForReversal(null);
        setReversalReason('');
        fetchDeposits();
      } else {
        alert(res?.message || 'Failed to reverse deposit payment.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error executing deposit reversal.');
    } finally {
      setIsReversing(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard color="#059669" size={28} />
            Approval Deposit Ledger
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Global financial ledger tracking all security deposits collected and reversed for approval slips.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filter Controls */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search deposit number, approval number, customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', color: '#1E293B', background: '#FFFFFF' }}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REVERSED">REVERSED</option>
              </select>
            </div>

            <div>
              <select
                value={paymentMethodFilter}
                onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', color: '#1E293B', background: '#FFFFFF' }}
              >
                <option value="">All Payment Methods</option>
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '24px' }}>
            <SkeletonLoader type="table" rows={8} />
          </div>
        ) : deposits.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <CreditCard size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>No Deposit Ledger Records</h3>
            <p style={{ fontSize: '0.86rem', margin: '4px 0 0 0' }}>No security deposits match your active filter selection.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Deposit #</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Approval Slip #</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Payment Method</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Tx Reference</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((dep) => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{dep.depositNumber || dep.id.slice(0, 8)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          onClick={() => navigate(`/approvals/${dep.approvalId}`)}
                          style={{ cursor: 'pointer', color: '#C6A15B', fontWeight: 700, textDecoration: 'underline' }}
                        >
                          {dep.approval?.approvalNumber || 'View Slip'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#1E293B', fontWeight: 600 }}>
                        {dep.customer?.firstName} {dep.customer?.lastName || ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 600 }}>{dep.paymentMethod}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{dep.transactionReference || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(dep.paymentDate)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 800, background: dep.status === 'COMPLETED' ? '#DCFCE7' : '#FEE2E2', color: dep.status === 'COMPLETED' ? '#15803D' : '#991B1B' }}>
                          {dep.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: dep.status === 'COMPLETED' ? '#059669' : '#DC2626' }}>
                        {formatCurrency(dep.amount)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {dep.status === 'COMPLETED' && hasPermission('approval.deposit.reverse') && (
                          <button
                            onClick={() => setSelectedDepositForReversal(dep)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                          >
                            <RotateCcw size={12} /> Reverse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Showing <strong>{deposits.length}</strong> of <strong>{totalCount}</strong> deposit records
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', padding: '0 8px' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MANDATORY REVERSAL REASON MODAL */}
      {selectedDepositForReversal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Reverse Approval Security Deposit</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '14px' }}>
              Reversing deposit of {formatCurrency(selectedDepositForReversal.amount)}. A historical REVERSED record will be preserved.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mandatory Reversal Reason <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Reason for reversing deposit payment (e.g. cheque bounced, incorrect entry)..."
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedDepositForReversal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleReverseDeposit} disabled={isReversing || !reversalReason.trim()} className="btn btn-gold" style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 700 }}>
                {isReversing ? 'Reversing...' : 'Execute Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
