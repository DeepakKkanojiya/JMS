import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesRefundsApi, SalesRefund, RefundStatus } from '../api/salesRefunds';
import { PaymentMethod } from '../api/salesPayments';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  X,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';

export const SalesRefunds: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canReverse = hasPermission('sales_refund.reverse');

  const [refunds, setRefunds] = useState<SalesRefund[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Reverse Modal
  const [reversingRefund, setReversingRefund] = useState<SalesRefund | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, [search, methodFilter, statusFilter, dateFrom, dateTo, page]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await salesRefundsApi.list({
        search: search || undefined,
        refundMethod: methodFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (res?.success || Array.isArray(res?.data)) {
        setRefunds(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching sales refunds ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async () => {
    if (!reversingRefund) return;
    if (reversalReason.trim().length < 3) {
      setFeedback({ type: 'error', message: 'Reversal reason must be at least 3 characters long.' });
      return;
    }

    setActionLoading(true);
    try {
      await salesRefundsApi.reverse(reversingRefund.id, reversalReason.trim());
      setFeedback({ type: 'success', message: `Refund #${reversingRefund.refundNumber} reversed successfully.` });
      setReversingRefund(null);
      setReversalReason('');
      fetchRefunds();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Refund reversal failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalRefunded = refunds
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + parseFloat(r.amount.toString()), 0);

  const totalReversed = refunds
    .filter((r) => r.status === 'REVERSED')
    .reduce((acc, r) => acc + parseFloat(r.amount.toString()), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Refunds Paid
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            View all payments refunded back to customers for returned jewellery items.
          </p>
        </div>

        <button onClick={fetchRefunds} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}><X size={16} /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Disbursed Refunds</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
            ₹{totalRefunded.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Completed payouts</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Reversed Refunds</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            ₹{totalReversed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Audited reversals</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Refund Records</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            {pagination.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Disbursements ledger</div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search refund #, ref..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '150px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Methods</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="CHEQUE">Cheque</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '140px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVERSED">Reversed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Refund #</th>
                <th>Return #</th>
                <th>Disbursement Method</th>
                <th>Amount</th>
                <th>Transaction Ref</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading refunds ledger...</div>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <CreditCard size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No refund records found</div>
                  </td>
                </tr>
              ) : (
                refunds.map((ref) => (
                  <tr key={ref.id}>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>#{ref.refundNumber}</td>
                    <td>
                      {ref.salesReturn ? (
                        <span style={{ fontWeight: 600, color: '#C6A15B' }}>
                          #{ref.salesReturn.returnNumber}
                        </span>
                      ) : (
                        <span>{ref.salesReturnId?.slice(0, 8)}...</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-platinum" style={{ fontWeight: 700 }}>
                        {ref.refundMethod}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.96rem', color: ref.status === 'COMPLETED' ? '#DC2626' : '#94A3B8' }}>
                      ₹{parseFloat(ref.amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{ref.transactionReference || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(ref.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${ref.status === 'COMPLETED' ? 'badge-emerald' : ref.status === 'REVERSED' ? 'badge-ruby' : 'badge-gold'}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td>
                      {ref.status === 'COMPLETED' && canReverse && (
                        <button
                          onClick={() => setReversingRefund(ref)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#DC2626' }}
                          title="Reverse Refund"
                        >
                          <RotateCcw size={13} />
                          <span>Reverse</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Showing {refunds.length} of {pagination.total} records
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Previous
              </button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reversal Modal */}
      {reversingRefund && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Reverse Refund #{reversingRefund.refundNumber}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '16px' }}>
              Reversing refund payout of ₹{parseFloat(reversingRefund.amount.toString()).toLocaleString('en-IN')} requires mandatory audit reason.
            </p>
            <div className="form-group">
              <label className="form-label">Mandatory Audit Reversal Reason *</label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="State the justification for this refund reversal..."
                className="form-input"
                rows={3}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setReversingRefund(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleReverse} disabled={actionLoading} className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                {actionLoading ? 'Reversing...' : 'Confirm Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
