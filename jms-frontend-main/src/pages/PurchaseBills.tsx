import React, { useState, useEffect } from 'react';
import { purchaseBillsApi } from '../api/purchaseBills';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileText, Search, RefreshCw, Plus, CheckCircle, AlertCircle, X, Layers, CheckCircle2 } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const PurchaseBills: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('purchase_bill.create');
  const canSubmit = hasPermission('purchase_bill.submit');
  const canApprove = hasPermission('purchase_bill.approve');

  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));

  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    companyId: '',
    branchId: '',
    vendorId: '',
    vendorInvoiceNumber: '',
    vendorInvoiceDate: '',
    notes: '',
    items: [
      { billedQuantity: 1, unitPrice: 0, taxRatePercent: 3, makingCharge: 0, remarks: '' }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchMasters();
    fetchBills();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [search, statusFilter]);

  const fetchMasters = async () => {
    try {
      const [cRes, bRes, vRes] = await Promise.all([
        apiClient.get('/companies'),
        apiClient.get('/branches'),
        apiClient.get('/vendors')
      ]);
      setCompanies(cRes.data?.data || []);
      setBranches(bRes.data?.data || []);
      setVendors(vRes.data?.data || []);

      if (cRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, companyId: cRes.data.data[0].id }));
      if (bRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, branchId: bRes.data.data[0].id }));
      if (vRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, vendorId: vRes.data.data[0].id }));
    } catch (err) {
      console.error('Failed to load masters:', err);
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await purchaseBillsApi.getAll({ search, status: statusFilter || undefined });
      setBills(res.data || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch Purchase Bills' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await purchaseBillsApi.create(formData as any);
      setFeedback({ type: 'success', message: 'Purchase bill draft created successfully' });
      setIsModalOpen(false);
      fetchBills();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create purchase bill' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBill = async (id: string) => {
    try {
      await purchaseBillsApi.submit(id);
      setFeedback({ type: 'success', message: 'Purchase bill submitted successfully' });
      fetchBills();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to submit bill' });
    }
  };

  const handleApproveBill = async (id: string) => {
    try {
      await purchaseBillsApi.approve(id);
      setFeedback({ type: 'success', message: 'Purchase bill approved successfully' });
      fetchBills();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to approve bill' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <FileText size={22} color="#C6A15B" />
          </div>
          <div>
            <h1 className="brand-font page-title">Purchase Bills & Costing</h1>
            <p className="page-subtitle">
              <Layers size={13} /> Record vendor invoice bills & track accounts payable
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={fetchBills} className="btn btn-secondary">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Create Purchase Bill</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={feedback.type === 'success' ? 'badge badge-emerald' : 'form-error-alert'} style={{ padding: '10px 14px', fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" color="#C6A15B" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search Bill Number or Vendor Invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input filter-select"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Vendor</th>
              <th>Vendor Inv #</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Outstanding</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading purchase bills...
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <FileText size={32} className="empty-icon" />
                    <div className="empty-title">No Purchase Bills found</div>
                    <div className="empty-desc">Create a vendor invoice bill to track payables.</div>
                  </div>
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id}>
                  <td>
                    <span className="code-text">{bill.billNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{bill.vendor?.name || 'N/A'}</td>
                  <td>{bill.vendorInvoiceNumber || '—'}</td>
                  <td>
                    <span className={`badge ${bill.status === 'APPROVED' ? 'badge-emerald' : 'badge-gold'}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{Number(bill.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600, color: '#047857' }}>₹{Number(bill.totalPaid || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: '#DC2626' }}>₹{Number(bill.outstandingAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {bill.status === 'DRAFT' && canSubmit && (
                        <button
                          onClick={() => handleSubmitBill(bill.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#2563EB', borderColor: 'rgba(37,99,235,0.3)' }}
                        >
                          Submit
                        </button>
                      )}
                      {bill.status === 'SUBMITTED' && canApprove && (
                        <button
                          onClick={() => handleApproveBill(bill.id)}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                        >
                          Approve
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-card lg">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <FileText size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>Create New Purchase Bill</h3>
                  <p>Record supplier invoice details & costing</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateBill} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body">
                <div className="form-section">
                  <div className="form-row cols-3">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company</label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        className="form-input"
                        required
                      >
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Branch</label>
                      <select
                        value={formData.branchId}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        className="form-input"
                        required
                      >
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Vendor</label>
                      <select
                        value={formData.vendorId}
                        onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                        className="form-input"
                        required
                      >
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-row cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Vendor Invoice #</label>
                      <input
                        type="text"
                        value={formData.vendorInvoiceNumber}
                        onChange={(e) => setFormData({ ...formData, vendorInvoiceNumber: e.target.value })}
                        className="form-input"
                        placeholder="Vendor Tax Inv Number"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="form-input"
                        placeholder="Bill remarks"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section gold">
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '10px' }}>Billed Items</h4>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="form-row cols-4" style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Billed Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.billedQuantity}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].billedQuantity = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].unitPrice = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>GST Rate %</label>
                        <input
                          type="number"
                          value={item.taxRatePercent}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].taxRatePercent = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Making Charges</label>
                        <input
                          type="number"
                          value={item.makingCharge}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].makingCharge = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Create Purchase Bill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
