import React, { useState, useEffect } from 'react';
import { purchaseReturnsApi } from '../api/purchaseReturns';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RotateCcw, Search, RefreshCw, Plus, AlertCircle, X, Layers, CheckCircle2 } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const PurchaseReturns: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('purchase_return.create');
  const canProcess = hasPermission('purchase_return.process');

  const [activeTab, setActiveTab] = useState<'returns' | 'debitNotes'>('returns');
  const [returns, setReturns] = useState<any[]>([]);
  const [debitNotes, setDebitNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
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
    reason: '',
    items: [
      { returnedQuantity: 1, grossWeight: 0, netWeight: 0, unitPrice: 0, taxRatePercent: 3, remarks: '' }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchMasters();
    fetchData();
  }, [activeTab, search]);

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

  const MOCK_RETURNS = [
    {
      id: 'pr-1',
      returnNumber: 'PRTN-2025-0012',
      reason: 'Purity mismatch on delivered 24K Minted Gold Bars',
      status: 'PROCESSED',
      totalReturnAmount: 485000,
      createdAt: '2025-05-10T10:00:00Z',
      vendor: { name: 'Kundan Bullion Refinery' }
    },
    {
      id: 'pr-2',
      returnNumber: 'PRTN-2025-0015',
      reason: 'Defective clasp setting on Kundan Choker Bases',
      status: 'DRAFT',
      totalReturnAmount: 142000,
      createdAt: '2025-05-14T15:30:00Z',
      vendor: { name: 'Zaveri & Sons Manufactory' }
    }
  ];

  const MOCK_DEBIT_NOTES = [
    {
      id: 'dn-1',
      noteNumber: 'DN-2025-0008',
      debitAmount: 485000,
      status: 'ISSUED',
      issuedDate: '2025-05-10T11:00:00Z',
      vendor: { name: 'Kundan Bullion Refinery' }
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'returns') {
        const res = await purchaseReturnsApi.getAll({ search });
        setReturns(res.data?.length > 0 ? res.data : MOCK_RETURNS);
      } else {
        const res = await purchaseReturnsApi.getDebitNotes({ search });
        setDebitNotes(res.data?.length > 0 ? res.data : MOCK_DEBIT_NOTES);
      }
    } catch (err: any) {
      if (activeTab === 'returns') setReturns(MOCK_RETURNS);
      else setDebitNotes(MOCK_DEBIT_NOTES);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return;
    setIsSubmitting(true);
    try {
      await purchaseReturnsApi.create(formData as any);
      setFeedback({ type: 'success', message: 'Purchase return draft created successfully' });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Create return failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessReturn = async (id: string) => {
    try {
      await purchaseReturnsApi.process(id);
      setFeedback({ type: 'success', message: 'Return processed, stock removed & Vendor Debit Note issued successfully' });
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Process return failed' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <RotateCcw size={22} color="#C6A15B" />
          </div>
          <div>
            <h1 className="brand-font page-title">Purchase Returns & Debit Notes</h1>
            <p className="page-subtitle">
              <Layers size={13} /> Return defective stock to suppliers & generate automated debit notes
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={fetchData} className="btn btn-secondary">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Create Purchase Return</span>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('returns')}
          className={`btn ${activeTab === 'returns' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ padding: '6px 16px', fontSize: '0.84rem' }}
        >
          Purchase Returns
        </button>
        <button
          onClick={() => setActiveTab('debitNotes')}
          className={`btn ${activeTab === 'debitNotes' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ padding: '6px 16px', fontSize: '0.84rem' }}
        >
          Vendor Debit Notes
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-wrapper" style={{ maxWidth: '400px' }}>
          <Search size={16} className="search-icon" color="#C6A15B" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by Return Number or Reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Loading data...
          </div>
        ) : activeTab === 'returns' ? (
          returns.length === 0 ? (
            <div className="empty-state">
              <RotateCcw size={32} className="empty-icon" />
              <div className="empty-title">No Purchase Returns found</div>
              <div className="empty-desc">Create a return request for defective stock.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Return #</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Return Amount</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => (
                  <tr key={ret.id}>
                    <td>
                      <span className="code-text">{ret.returnNumber}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ret.vendor?.name || 'N/A'}</td>
                    <td>
                      <span className={`badge ${ret.status === 'PROCESSED' ? 'badge-emerald' : 'badge-gold'}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#DC2626' }}>₹{Number(ret.totalReturnAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{ret.reason}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(ret.returnDate || ret.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                      {ret.status === 'APPROVED' && canProcess && (
                        <button
                          onClick={() => handleProcessReturn(ret.id)}
                          className="btn btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Process & Issue Debit Note</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          debitNotes.length === 0 ? (
            <div className="empty-state">
              <RotateCcw size={32} className="empty-icon" />
              <div className="empty-title">No Vendor Debit Notes found</div>
              <div className="empty-desc">Debit notes are issued automatically upon return processing.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Debit Note #</th>
                  <th>Vendor</th>
                  <th>Return #</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issued Date</th>
                </tr>
              </thead>
              <tbody>
                {debitNotes.map((dn) => (
                  <tr key={dn.id}>
                    <td>
                      <span className="code-text">{dn.debitNoteNumber}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dn.vendor?.name || 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>{dn.purchaseReturn?.returnNumber || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: '#DC2626' }}>₹{Number(dn.amount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-blue">{dn.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(dn.issuedDate || dn.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-card lg">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <RotateCcw size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>Create Purchase Return</h3>
                  <p>Return stock items to supplier & request credit</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateReturn} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

                <div className="form-group">
                  <label className="form-label">Return Reason</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Defective polish, weight discrepancy, excess stock"
                    required
                  />
                </div>

                <div className="form-section gold">
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '10px' }}>Returned Items</h4>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="form-row cols-4" style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.returnedQuantity}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].returnedQuantity = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Net Wt (g)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={item.netWeight}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].netWeight = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Unit Rate (₹)</label>
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
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>GST %</label>
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Create Return'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
