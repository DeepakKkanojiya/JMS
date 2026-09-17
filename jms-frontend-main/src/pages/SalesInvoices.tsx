import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesInvoiceApi, SalesInvoice, SalesInvoiceStatus } from '../api/salesInvoices';
import { branchesApi } from '../api/branches';
import { customersApi } from '../api/customers';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  ArrowRight,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';

export const SalesInvoices: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasPermission('sales_invoice.create');
  const canRead = hasPermission('sales_invoice.read');
  const canConfirm = hasPermission('sales_invoice.confirm');
  const canCancel = hasPermission('sales_invoice.cancel');

  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SalesInvoiceStatus | ''>('');
  const [branchFilter, setBranchFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Confirmation & Cancellation Modals
  const [confirmingInvoice, setConfirmingInvoice] = useState<SalesInvoice | null>(null);
  const [cancellingInvoice, setCancellingInvoice] = useState<SalesInvoice | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, branchFilter, customerFilter, fromDate, toDate, page]);

  const fetchDropdowns = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        branchesApi.list({ limit: 100 }),
        customersApi.list({ limit: 100 }),
      ]);
      setBranches(bRes?.data || []);
      setCustomers(cRes?.data || []);
    } catch (e) {
      console.error('Failed to load filter dropdowns:', e);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await salesInvoiceApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        branchId: branchFilter || undefined,
        customerId: customerFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (res?.success || Array.isArray(res?.data)) {
        setInvoices(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching sales invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvoice = async () => {
    if (!confirmingInvoice) return;
    setActionLoading(true);
    try {
      await salesInvoiceApi.confirm(confirmingInvoice.id);
      setFeedback({ type: 'success', message: `Invoice #${confirmingInvoice.invoiceNumber} confirmed successfully. Inventory status updated to SOLD.` });
      setConfirmingInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to confirm invoice.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!cancellingInvoice) return;
    setActionLoading(true);
    try {
      await salesInvoiceApi.cancel(cancellingInvoice.id);
      setFeedback({ type: 'success', message: `Invoice #${cancellingInvoice.invoiceNumber} has been cancelled.` });
      setCancellingInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to cancel invoice.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculation
  const totalVolume = invoices.reduce((acc, inv) => acc + (parseFloat(inv.grandTotal?.toString() || '0')), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (parseFloat(inv.totalPaid?.toString() || '0')), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (parseFloat(inv.outstandingAmount?.toString() || '0')), 0);
  const confirmedCount = invoices.filter((i) => i.status === 'CONFIRMED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Invoices & Customer Bills
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            View and manage all customer bills, sales history, and payment status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={fetchInvoices} className="btn btn-secondary" title="Refresh">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          {canCreate && (
            <button
              onClick={() => navigate('/sales/pos')}
              className="btn btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShoppingBag size={18} />
              <span>Launch POS Billing</span>
            </button>
          )}
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
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #C6A15B' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Page Sales Volume</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>{confirmedCount} Confirmed on this page</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Collections Received</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Settled payments</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Outstanding Balance</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Pending customer settlement</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Invoices Recorded</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            {pagination.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Across all showroom branches</div>
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
              placeholder="Search invoice #, customer..."
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
              style={{ width: '140px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '150px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={customerFilter}
              onChange={(e) => { setCustomerFilter(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '160px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Grand Total</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Payment Status</th>
                <th>Invoice Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading sales invoices...</div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No sales invoices found</div>
                    <div style={{ fontSize: '0.8rem' }}>Create invoices through the POS terminal to start recording sales.</div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>
                      <span
                        onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                        style={{ cursor: 'pointer', color: '#C6A15B', textDecoration: 'underline' }}
                        title="View Master Detail"
                      >
                        #{inv.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#18181B' }}>
                        {inv.customer?.firstName} {inv.customer?.lastName || ''}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{inv.customer?.mobile}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {inv.branch?.name || 'Main Showroom'}
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.94rem', color: '#18181B' }}>
                      ₹{parseFloat(inv.grandTotal?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.86rem', color: '#059669' }}>
                      ₹{parseFloat(inv.totalPaid?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.86rem', color: parseFloat(inv.outstandingAmount?.toString() || '0') > 0 ? '#D97706' : '#64748B' }}>
                      ₹{parseFloat(inv.outstandingAmount?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
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
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.76rem' }}
                          title="Open Master Invoice Record"
                        >
                          <Eye size={14} />
                        </button>

                        {inv.status === 'DRAFT' && canConfirm && (
                          <button
                            onClick={() => setConfirmingInvoice(inv)}
                            className="btn btn-gold"
                            style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                            title="Confirm Sale (Deduct Inventory)"
                          >
                            <CheckCircle2 size={14} />
                            <span>Confirm</span>
                          </button>
                        )}

                        {inv.status !== 'CANCELLED' && canCancel && (
                          <button
                            onClick={() => setCancellingInvoice(inv)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 8px', fontSize: '0.76rem', color: '#DC2626' }}
                            title="Cancel Invoice"
                          >
                            <XCircle size={14} />
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
              Showing {invoices.length} of {pagination.total} invoices (Page {page} of {pagination.totalPages})
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

      {/* Confirmation Modal */}
      {confirmingInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#059669', marginBottom: '14px' }}>
              <CheckCircle2 size={26} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>Confirm Sales Invoice</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Confirm invoice <strong>#{confirmingInvoice.invoiceNumber}</strong> for <strong>₹{parseFloat(confirmingInvoice.grandTotal?.toString() || '0').toLocaleString('en-IN')}</strong>?
              <br /><br />
              This will atomically mark all physical line items as <strong>SOLD</strong> and record irreversible <code>SALE</code> stock movements.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setConfirmingInvoice(null)} className="btn btn-secondary">Cancel</button>
              <button
                onClick={handleConfirmInvoice}
                disabled={actionLoading}
                className="btn btn-gold"
              >
                {actionLoading ? 'Confirming...' : 'Yes, Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Cancel Sales Invoice
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to cancel invoice <strong>#{cancellingInvoice.invoiceNumber}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setCancellingInvoice(null)} className="btn btn-secondary">No, Keep</button>
              <button
                onClick={handleCancelInvoice}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
