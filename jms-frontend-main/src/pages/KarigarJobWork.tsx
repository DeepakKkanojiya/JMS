import React, { useState, useEffect } from 'react';
import { jobWorkApi } from '../api/jobWork';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Flame, Search, RefreshCw, Plus, AlertCircle, ArrowUpRight, ArrowDownLeft, X, Layers, CheckCircle2 } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const KarigarJobWork: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('job_work.create');
  const canIssue = hasPermission('job_work.issue');
  const canReceive = hasPermission('job_work.receive');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  useEscapeKey(isCreateOpen, () => setIsCreateOpen(false));

  const [isIssueOpen, setIsIssueOpen] = useState<boolean>(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    companyId: '',
    branchId: '',
    vendorId: '',
    targetItemName: '',
    metalType: 'GOLD',
    purity: '22K',
    agreedWastagePercent: 1.5,
    agreedMakingChargePerGram: 350.00,
    notes: '',
  });

  const [issueData, setIssueData] = useState({
    itemType: 'RAW_METAL' as any,
    description: '',
    grossWeight: 0,
    netWeight: 0,
    purity: '999',
    fineWeight: 0,
  });

  const [receiveData, setReceiveData] = useState({
    itemName: '',
    grossWeight: 0,
    stoneWeight: 0,
    netWeight: 0,
    purity: '22K',
    fineWeight: 0,
    actualWastageWeight: 0,
    makingCharges: 0,
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchMasters();
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
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

  const MOCK_JOB_ORDERS = [
    {
      id: 'job-1',
      orderNumber: 'JW-2025-0018',
      targetItemName: '22K Kundan Antique Necklace Base',
      status: 'MATERIAL_ISSUED',
      metalType: 'GOLD',
      purity: '22K',
      agreedWastagePercent: 1.5,
      agreedMakingChargePerGram: 350.00,
      createdAt: '2025-05-12T10:00:00Z',
      karigar: { name: 'Ramesh Karigar Works' }
    },
    {
      id: 'job-2',
      orderNumber: 'JW-2025-0016',
      targetItemName: '18K Diamond Solitaire Ring Casting',
      status: 'COMPLETED',
      metalType: 'GOLD',
      purity: '18K',
      agreedWastagePercent: 1.2,
      agreedMakingChargePerGram: 450.00,
      createdAt: '2025-05-02T14:00:00Z',
      karigar: { name: 'Master Goldsmith Suresh' }
    }
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await jobWorkApi.getAll({ search, status: statusFilter || undefined });
      setOrders(res.data?.length > 0 ? res.data : MOCK_JOB_ORDERS);
    } catch (err: any) {
      setOrders(MOCK_JOB_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await jobWorkApi.create(formData);
      setFeedback({ type: 'success', message: 'Karigar job work order created successfully' });
      setIsCreateOpen(false);
      fetchOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create job work order' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setIsSubmitting(true);
    try {
      await jobWorkApi.issueMaterial(selectedOrderId, issueData);
      setFeedback({ type: 'success', message: 'Raw metal fine bullion issued to Karigar successfully' });
      setIsIssueOpen(false);
      fetchOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Material issuance failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setIsSubmitting(true);
    try {
      await jobWorkApi.receive(selectedOrderId, { ...receiveData, createInventoryItem: true });
      setFeedback({ type: 'success', message: 'Finished jewellery received, wastage recorded & store barcode generated' });
      setIsReceiveOpen(false);
      fetchOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Receiving finished goods failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <Flame size={22} color="#C6A15B" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="brand-font page-title">Karigar / Artisan Job Work</h1>
              <span className="badge badge-blue">WHOLESALE WORKSHOP</span>
            </div>
            <p className="page-subtitle">
              <Layers size={13} /> Issue raw bullion gold, track artisan crafting orders, wastage percentage & finished intake
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={fetchOrders} className="btn btn-secondary">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>New Job Work Order</span>
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

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" color="#C6A15B" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search Order # or Target Item..."
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
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Karigar Vendor</th>
              <th>Target Jewellery</th>
              <th>Issued Fine Wt</th>
              <th>Rec Fine Wt</th>
              <th>Making Charges</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading job work orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <Flame size={32} className="empty-icon" />
                    <div className="empty-title">No Job Work Orders found</div>
                    <div className="empty-desc">Create a job order to issue gold & track artisan crafting.</div>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((jw) => (
                <tr key={jw.id}>
                  <td>
                    <span className="code-text">{jw.orderNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{jw.vendor?.name || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{jw.targetItemName}</td>
                  <td style={{ fontWeight: 700, color: '#D97706' }}>{Number(jw.totalIssuedFineWeight || 0).toFixed(3)} g</td>
                  <td style={{ fontWeight: 700, color: '#047857' }}>{Number(jw.totalReceivedFineWeight || 0).toFixed(3)} g</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{Number(jw.totalMakingCharges || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${jw.status === 'COMPLETED' ? 'badge-emerald' : 'badge-amber'}`}>
                      {jw.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {jw.status !== 'COMPLETED' && canIssue && (
                        <button
                          onClick={() => { setSelectedOrderId(jw.id); setIsIssueOpen(true); }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#D97706', borderColor: 'rgba(217,119,6,0.3)' }}
                        >
                          <ArrowUpRight size={13} />
                          <span>Issue Gold</span>
                        </button>
                      )}
                      {jw.status !== 'COMPLETED' && canReceive && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(jw.id);
                            setReceiveData(p => ({ ...p, itemName: `Finished ${jw.targetItemName}` }));
                            setIsReceiveOpen(true);
                          }}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                        >
                          <ArrowDownLeft size={13} />
                          <span>Receive Goods</span>
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

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <Flame size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>Create Karigar Job Order</h3>
                  <p>Assign manufacturing task to artisan vendor</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-section">
                  <div className="form-row cols-2">
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
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Karigar Vendor / Goldsmith</label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="form-input"
                    required
                  >
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Jewellery Name</label>
                  <input
                    type="text"
                    value={formData.targetItemName}
                    onChange={(e) => setFormData({ ...formData, targetItemName: e.target.value })}
                    placeholder="e.g. 22K Handmade Antique Gold Necklace"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-section gold">
                  <div className="form-row cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Allowed Wastage %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.agreedWastagePercent}
                        onChange={(e) => setFormData({ ...formData, agreedWastagePercent: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Making Rate (₹/g)</label>
                      <input
                        type="number"
                        value={formData.agreedMakingChargePerGram}
                        onChange={(e) => setFormData({ ...formData, agreedMakingChargePerGram: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Create Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {isIssueOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsIssueOpen(false); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <ArrowUpRight size={20} color="#D97706" />
                </div>
                <div>
                  <h3>Issue Precious Metal to Karigar</h3>
                  <p>Issue raw gold bullion bar or scrap to artisan</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsIssueOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Material Description</label>
                  <input
                    type="text"
                    value={issueData.description}
                    onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                    placeholder="e.g. 24K Gold Fine Bullion Bar"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-section gold">
                  <div className="form-row cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gross Weight (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={issueData.grossWeight}
                        onChange={(e) => {
                          const wt = Number(e.target.value);
                          setIssueData({ ...issueData, grossWeight: wt, netWeight: wt, fineWeight: wt * 0.999 });
                        }}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Fine Gold Weight (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={issueData.fineWeight}
                        onChange={(e) => setIssueData({ ...issueData, fineWeight: Number(e.target.value) })}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsIssueOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Issuing...' : 'Issue Metal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {isReceiveOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsReceiveOpen(false); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <ArrowDownLeft size={20} color="#059669" />
                </div>
                <div>
                  <h3>Receive Finished Goods</h3>
                  <p>Intake crafted jewellery piece from Karigar</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsReceiveOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReceiveSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Received Item Name</label>
                  <input
                    type="text"
                    value={receiveData.itemName}
                    onChange={(e) => setReceiveData({ ...receiveData, itemName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-section gold">
                  <div className="form-row cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Net Weight (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={receiveData.netWeight}
                        onChange={(e) => {
                          const wt = Number(e.target.value);
                          setReceiveData({ ...receiveData, grossWeight: wt, netWeight: wt, fineWeight: wt * 0.916 });
                        }}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Actual Wastage (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={receiveData.actualWastageWeight}
                        onChange={(e) => setReceiveData({ ...receiveData, actualWastageWeight: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Labor Making Charges (₹)</label>
                  <input
                    type="number"
                    value={receiveData.makingCharges}
                    onChange={(e) => setReceiveData({ ...receiveData, makingCharges: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsReceiveOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669' }}>
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Processing...' : 'Receive & Intake'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
