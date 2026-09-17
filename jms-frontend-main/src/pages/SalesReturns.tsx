import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesReturnsApi, SalesReturn, SalesReturnStatus } from '../api/salesReturns';
import { salesRefundsApi } from '../api/salesRefunds';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  PackageCheck,
  History,
  CreditCard,
  TrendingDown,
} from 'lucide-react';

export const SalesReturns: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canApprove = hasPermission('sales_return.approve');
  const canProcess = hasPermission('sales_return.process');
  const canCancel = hasPermission('sales_return.cancel');
  const canRefund = hasPermission('sales_refund.create');

  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SalesReturnStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Detail Modal & History
  const [viewingReturn, setViewingReturn] = useState<SalesReturn | null>(null);
  const [cancellingReturn, setCancellingReturn] = useState<SalesReturn | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Refund Issue Modal
  const [refundingReturn, setRefundingReturn] = useState<SalesReturn | null>(null);
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'>('BANK_TRANSFER');
  const [refundRef, setRefundRef] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [search, statusFilter, dateFrom, dateTo, page]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await salesReturnsApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (res?.success || Array.isArray(res?.data)) {
        setReturns(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching sales returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await salesReturnsApi.approve(id);
      setFeedback({ type: 'success', message: 'Sales return approved successfully.' });
      fetchReturns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async (id: string) => {
    setActionLoading(true);
    try {
      await salesReturnsApi.process(id);
      setFeedback({ type: 'success', message: 'Return processed! Physical items restored to AVAILABLE and SALE_RETURN movement logged.' });
      fetchReturns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Processing failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingReturn) return;
    if (cancelReason.trim().length < 3) {
      setFeedback({ type: 'error', message: 'Cancellation reason must be at least 3 characters long.' });
      return;
    }
    setActionLoading(true);
    try {
      await salesReturnsApi.cancel(cancellingReturn.id, cancelReason.trim());
      setFeedback({ type: 'success', message: `Return #${cancellingReturn.returnNumber} has been cancelled.` });
      setCancellingReturn(null);
      setCancelReason('');
      fetchReturns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cancellation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingReturn) return;
    setActionLoading(true);
    try {
      const amt = parseFloat(refundingReturn.refundAmount.toString());
      await salesRefundsApi.create({
        salesReturnId: refundingReturn.id,
        refundMethod: refundMethod,
        amount: amt,
        transactionReference: refundRef || undefined,
      });
      setFeedback({ type: 'success', message: `Refund of ₹${amt.toLocaleString('en-IN')} issued successfully.` });
      setRefundingReturn(null);
      setRefundRef('');
      fetchReturns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to issue refund.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewHistory = async (id: string) => {
    try {
      const res = await salesReturnsApi.getHistory(id);
      setHistoryRecords(res?.data || []);
      setIsHistoryOpen(true);
    } catch (e) {
      console.error('Failed to load return history:', e);
    }
  };

  const totalRefundsPayable = returns
    .filter((r) => r.status === 'PROCESSED')
    .reduce((acc, r) => acc + parseFloat(r.refundAmount.toString()), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Customer Returns
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage jewellery returned by customers and restock items back into store inventory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchReturns} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button onClick={() => navigate('/sales/refunds')} className="btn btn-secondary">
            <CreditCard size={16} />
            <span>Refunds Register</span>
          </button>
        </div>
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

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Processed Refunds Volume</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
            ₹{totalRefundsPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Inventory restocked to AVAILABLE</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Pending Approvals</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            {returns.filter((r) => r.status === 'REQUESTED').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Awaiting manager action</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Return Events</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            {pagination.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Across all showroom branches</div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search return #, invoice #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '150px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSED">Processed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Return #</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Deduction</th>
                <th>Refund Amount</th>
                <th>Restocking Status</th>
                <th>Return Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading sales returns...</div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <RotateCcw size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No sales return records found</div>
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id}>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>#{ret.returnNumber}</td>
                    <td>
                      {ret.salesInvoice ? (
                        <span
                          onClick={() => navigate(`/sales/invoices/${ret.salesInvoiceId}`)}
                          style={{ color: '#C6A15B', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          #{ret.salesInvoice.invoiceNumber}
                        </span>
                      ) : (
                        <span>{ret.salesInvoiceId?.slice(0, 8)}...</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ret.customer?.firstName} {ret.customer?.lastName || ''}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{ret.customer?.mobile}</div>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: '#475569' }}>{ret.reason || 'Customer Return'}</td>
                    <td style={{ color: '#DC2626' }}>₹{parseFloat(ret.deductionAmount.toString()).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 800, fontSize: '0.96rem', color: '#059669' }}>
                      ₹{parseFloat(ret.refundAmount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {ret.status === 'PROCESSED' ? (
                        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <PackageCheck size={12} /> Restocked (AVAILABLE)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Pending Process</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${ret.status === 'PROCESSED' ? 'badge-emerald' : ret.status === 'APPROVED' ? 'badge-blue' : ret.status === 'REQUESTED' ? 'badge-gold' : 'badge-ruby'}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => setViewingReturn(ret)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>

                        {ret.status === 'REQUESTED' && canApprove && (
                          <button
                            onClick={() => handleApprove(ret.id)}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#2563EB', borderColor: '#93C5FD' }}
                          >
                            Approve
                          </button>
                        )}

                        {ret.status === 'APPROVED' && canProcess && (
                          <button
                            onClick={() => handleProcess(ret.id)}
                            disabled={actionLoading}
                            className="btn btn-gold"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          >
                            Process & Restock
                          </button>
                        )}

                        {ret.status === 'PROCESSED' && canRefund && (
                          <button
                            onClick={() => setRefundingReturn(ret)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#059669', borderColor: '#A7F3D0' }}
                            title="Disburse Customer Refund"
                          >
                            <CreditCard size={13} />
                            <span>Refund</span>
                          </button>
                        )}

                        {(ret.status === 'REQUESTED' || ret.status === 'APPROVED') && canCancel && (
                          <button
                            onClick={() => setCancellingReturn(ret)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#DC2626' }}
                            title="Cancel Return"
                          >
                            <XCircle size={13} />
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
              Showing {returns.length} of {pagination.total} records
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

      {/* Details Modal */}
      {viewingReturn && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '560px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                  Return #{viewingReturn.returnNumber}
                </h3>
                <span className={`badge ${viewingReturn.status === 'PROCESSED' ? 'badge-emerald' : 'badge-gold'}`}>
                  {viewingReturn.status}
                </span>
              </div>
              <button onClick={() => setViewingReturn(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', background: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal of Returned Items:</span>
                <span style={{ fontWeight: 700 }}>₹{parseFloat(viewingReturn.subtotal.toString()).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax Reversal Amount:</span>
                <span>₹{parseFloat(viewingReturn.taxAmount.toString()).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                <span>Deductions Applied:</span>
                <span>- ₹{parseFloat(viewingReturn.deductionAmount.toString()).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #CBD5E1', paddingTop: '8px', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700 }}>Net Refund Amount:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>
                  ₹{parseFloat(viewingReturn.refundAmount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setViewingReturn(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Refund Modal */}
      {refundingReturn && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669' }}>Issue Customer Refund</h3>
              <button onClick={() => setRefundingReturn(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleIssueRefund}>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Refund Payable for Return #{refundingReturn.returnNumber}:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  ₹{parseFloat(refundingReturn.refundAmount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Disbursement Method *</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as any)}
                  className="form-input"
                  required
                >
                  <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="CASH">Cash Refund</option>
                  <option value="CARD">Card Reversal</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. NEFT-REF-889911"
                  value={refundRef}
                  onChange={(e) => setRefundRef(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setRefundingReturn(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-gold">
                  {actionLoading ? 'Issuing...' : 'Confirm Refund Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingReturn && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Cancel Sales Return #{cancellingReturn.returnNumber}
            </h3>
            <div className="form-group">
              <label className="form-label">Cancellation Reason *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="State the reason for cancelling this return..."
                className="form-input"
                rows={3}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setCancellingReturn(null)} className="btn btn-secondary">Keep</button>
              <button onClick={handleCancel} disabled={actionLoading} className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
