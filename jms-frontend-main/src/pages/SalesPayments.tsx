import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesPaymentsApi, SalesPayment, PaymentMethod, PaymentStatus } from '../api/salesPayments';
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
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const SalesPayments: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canReverse = hasPermission('sales_payment.reverse');

  const [payments, setPayments] = useState<SalesPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Reverse Modal
  const [reversingPayment, setReversingPayment] = useState<SalesPayment | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [search, methodFilter, statusFilter, dateFrom, dateTo, page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await salesPaymentsApi.list({
        search: search || undefined,
        paymentMethod: methodFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (res?.success || Array.isArray(res?.data)) {
        setPayments(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching payments ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async () => {
    if (!reversingPayment) return;
    if (!reversalReason.trim()) {
      setFeedback({ type: 'error', message: 'Reversal reason is required.' });
      return;
    }

    setActionLoading(true);
    try {
      await salesPaymentsApi.reverse(reversingPayment.id, reversalReason.trim());
      setFeedback({ type: 'success', message: `Payment #${reversingPayment.paymentNumber} has been reversed.` });
      setReversingPayment(null);
      setReversalReason('');
      fetchPayments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Payment reversal failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((acc, p) => acc + parseFloat(p.amount.toString()), 0);

  const totalReversed = payments
    .filter((p) => p.status === 'REVERSED')
    .reduce((acc, p) => acc + parseFloat(p.amount.toString()), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Payments Received
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            View all payments collected from customers across Cash, UPI, Card, and Bank Transfer.
          </p>
        </div>

        <button onClick={fetchPayments} className="btn btn-secondary">
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
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Page Collections</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Completed transactions</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Reversals Volume</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
            ₹{totalReversed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Audited reversals</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #C6A15B' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Transactions</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            {pagination.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Across all payment tenders</div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search payment #, ref..."
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
              <option value="">All Tenders</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
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
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Payment #</th>
                <th>Invoice #</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Transaction Ref</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading payments...</div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <CreditCard size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No payment records found</div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>#{p.paymentNumber}</td>
                    <td>
                      {p.salesInvoice ? (
                        <span
                          onClick={() => navigate(`/sales/invoices/${p.salesInvoiceId}`)}
                          style={{ color: '#C6A15B', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          #{p.salesInvoice.invoiceNumber}
                        </span>
                      ) : (
                        <span>{p.salesInvoiceId?.slice(0, 8)}...</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-platinum" style={{ fontWeight: 700 }}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.96rem', color: p.status === 'COMPLETED' ? '#059669' : '#94A3B8' }}>
                      ₹{parseFloat(p.amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{p.transactionReference || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(p.paymentDate || p.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'COMPLETED' ? 'badge-emerald' : p.status === 'REVERSED' ? 'badge-ruby' : 'badge-platinum'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.salesInvoiceId && (
                          <button
                            onClick={() => navigate(`/sales/invoices/${p.salesInvoiceId}`)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            title="View Invoice"
                          >
                            <Eye size={13} />
                          </button>
                        )}
                        {p.status === 'COMPLETED' && canReverse && (
                          <button
                            onClick={() => setReversingPayment(p)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#DC2626' }}
                            title="Reverse Payment"
                          >
                            <RotateCcw size={13} />
                            <span>Reverse</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Showing {payments.length} of {pagination.total} records (Page {page} of {pagination.totalPages})
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
      {reversingPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Reverse Payment #{reversingPayment.paymentNumber}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '16px' }}>
              Reversing this payment of ₹{parseFloat(reversingPayment.amount.toString()).toLocaleString('en-IN')} will restore the invoice balance.
            </p>
            <div className="form-group">
              <label className="form-label">Mandatory Audit Reversal Reason *</label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="State the justification for this payment reversal..."
                className="form-input"
                rows={3}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setReversingPayment(null)} className="btn btn-secondary">Cancel</button>
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
