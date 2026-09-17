import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goldExchangesApi, CustomerGoldExchange, ExchangeStatus } from '../api/goldExchanges';
import { MetalType } from '../api/metalRates';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  X,
  CheckCircle2,
  XCircle,
  History,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export const GoldExchanges: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canValue = hasPermission('gold_exchange.value');
  const canApply = hasPermission('gold_exchange.apply');
  const canCancel = hasPermission('gold_exchange.cancel');

  const [exchanges, setExchanges] = useState<CustomerGoldExchange[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExchangeStatus | ''>('');
  const [metalFilter, setMetalFilter] = useState<MetalType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Detail & History Modals
  const [viewingExchange, setViewingExchange] = useState<CustomerGoldExchange | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cancellingExchange, setCancellingExchange] = useState<CustomerGoldExchange | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchExchanges();
  }, [search, statusFilter, metalFilter, dateFrom, dateTo, page]);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const res = await goldExchangesApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        metalType: metalFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (res?.success || Array.isArray(res?.data)) {
        setExchanges(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching gold exchanges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValue = async (id: string) => {
    setActionLoading(true);
    try {
      await goldExchangesApi.valueExchange(id);
      setFeedback({ type: 'success', message: 'Exchange valued with current active market rate.' });
      fetchExchanges();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Valuation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async (id: string) => {
    setActionLoading(true);
    try {
      await goldExchangesApi.applyExchange(id);
      setFeedback({ type: 'success', message: 'Exchange credit applied to invoice.' });
      fetchExchanges();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to apply credit.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingExchange) return;
    setActionLoading(true);
    try {
      await goldExchangesApi.cancelExchange(cancellingExchange.id);
      setFeedback({ type: 'success', message: `Exchange #${cancellingExchange.exchangeNumber} cancelled.` });
      setCancellingExchange(null);
      fetchExchanges();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cancellation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewHistory = async (id: string) => {
    try {
      const res = await goldExchangesApi.getHistory(id);
      setHistoryRecords(res?.data || []);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const totalExchangeValue = exchanges
    .filter((e) => e.status === 'APPLIED')
    .reduce((acc, e) => acc + parseFloat(e.totalExchangeValue.toString()), 0);

  const totalGrossWeight = exchanges.reduce((acc, e) => acc + parseFloat(e.totalGrossWeight.toString()), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Old Gold Exchanges
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Track customer old gold intake, purity testing, melting loss, and trade-in discount values.
          </p>
        </div>

        <button onClick={fetchExchanges} className="btn btn-secondary">
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
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #C6A15B' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Applied Trade-in Credit</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C6A15B', marginTop: '4px' }}>
            ₹{totalExchangeValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Deducted from sales invoices</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Gold Intaked</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            {totalGrossWeight.toFixed(3)} g
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Physical bullion received</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Exchanges</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            {pagination.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Customer exchange events</div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search exchange #, customer..."
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
              <option value="VALUED">Valued</option>
              <option value="APPLIED">Applied</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={metalFilter}
              onChange={(e) => { setMetalFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '130px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Metals</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Exchange #</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Gross Wt</th>
                <th>Net Wt</th>
                <th>Exchange Valuation (₹)</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading gold exchanges...</div>
                  </td>
                </tr>
              ) : exchanges.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Coins size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No gold exchanges found</div>
                  </td>
                </tr>
              ) : (
                exchanges.map((exc) => (
                  <tr key={exc.id}>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>#{exc.exchangeNumber}</td>
                    <td>
                      {exc.salesInvoice ? (
                        <span
                          onClick={() => navigate(`/sales/invoices/${exc.salesInvoiceId}`)}
                          style={{ color: '#C6A15B', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          #{exc.salesInvoice.invoiceNumber}
                        </span>
                      ) : (
                        <span>{exc.salesInvoiceId?.slice(0, 8)}...</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exc.customer?.firstName} {exc.customer?.lastName || ''}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{exc.customer?.mobile}</div>
                    </td>
                    <td>{parseFloat(exc.totalGrossWeight.toString()).toFixed(3)}g</td>
                    <td style={{ fontWeight: 600, color: '#059669' }}>
                      {parseFloat(exc.totalNetWeight.toString()).toFixed(3)}g
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.96rem', color: '#059669' }}>
                      ₹{parseFloat(exc.totalExchangeValue.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${exc.status === 'APPLIED' ? 'badge-emerald' : exc.status === 'VALUED' ? 'badge-blue' : exc.status === 'REQUESTED' ? 'badge-gold' : 'badge-ruby'}`}>
                        {exc.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(exc.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setViewingExchange(exc)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>

                        {exc.status === 'REQUESTED' && canValue && (
                          <button
                            onClick={() => handleValue(exc.id)}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#2563EB' }}
                            title="Calculate Active Valuation"
                          >
                            Value
                          </button>
                        )}

                        {exc.status === 'VALUED' && canApply && (
                          <button
                            onClick={() => handleApply(exc.id)}
                            disabled={actionLoading}
                            className="btn btn-gold"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            title="Apply to Invoice"
                          >
                            Apply
                          </button>
                        )}

                        {(exc.status === 'REQUESTED' || exc.status === 'VALUED') && canCancel && (
                          <button
                            onClick={() => setCancellingExchange(exc)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#DC2626' }}
                            title="Cancel Exchange"
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

        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Showing {exchanges.length} of {pagination.total} records
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

      {/* Viewing Details Modal */}
      {viewingExchange && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                  Exchange #{viewingExchange.exchangeNumber}
                </h3>
                <span className={`badge ${viewingExchange.status === 'APPLIED' ? 'badge-emerald' : 'badge-gold'}`}>
                  {viewingExchange.status}
                </span>
              </div>
              <button onClick={() => setViewingExchange(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', background: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Weight:</span>
                <span style={{ fontWeight: 700 }}>{parseFloat(viewingExchange.totalGrossWeight.toString()).toFixed(3)}g</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Stone Weight:</span>
                <span>{parseFloat(viewingExchange.totalStoneWeight.toString()).toFixed(3)}g</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Net Gold Weight:</span>
                <span style={{ fontWeight: 800 }}>{parseFloat(viewingExchange.totalNetWeight.toString()).toFixed(3)}g</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Melting & Loss Deduction:</span>
                <span style={{ color: '#DC2626' }}>₹{parseFloat(viewingExchange.totalDeductionAmount.toString()).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #CBD5E1', paddingTop: '8px', fontSize: '1rem' }}>
                <span style={{ fontWeight: 700 }}>Total Exchange Credit:</span>
                <span style={{ fontWeight: 800, color: '#C6A15B' }}>
                  ₹{parseFloat(viewingExchange.totalExchangeValue.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setViewingExchange(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingExchange && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Cancel Gold Exchange #{cancellingExchange.exchangeNumber}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
              Are you sure you want to cancel this exchange record?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setCancellingExchange(null)} className="btn btn-secondary">Keep</button>
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
