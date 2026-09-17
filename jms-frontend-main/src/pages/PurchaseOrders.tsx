import React, { useState, useEffect } from 'react';
import { purchasesApi } from '../api/purchases';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Search, RefreshCw, Plus, Eye, CheckCircle, AlertCircle, X, Layers, CheckCircle2 } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const PurchaseOrders: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const canCreate = hasPermission('purchase.create');
  const canSubmit = hasPermission('purchase.submit');
  const canApprove = hasPermission('purchase.approve');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  useEscapeKey(isCreateOpen, () => setIsCreateOpen(false));

  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    companyId: '',
    branchId: '',
    vendorId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: [
      { productId: '', quantity: 1, unitPrice: 0, taxRatePercent: 3, remarks: '' }
    ]
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
      const [compRes, branchRes, vRes, prodRes] = await Promise.all([
        apiClient.get('/companies'),
        apiClient.get('/branches'),
        apiClient.get('/vendors'),
        apiClient.get('/products')
      ]);
      setCompanies(compRes.data?.data || []);
      setBranches(branchRes.data?.data || []);
      setVendors(vRes.data?.data || []);
      setProducts(prodRes.data?.data || []);

      if (compRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, companyId: compRes.data.data[0].id }));
      if (branchRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, branchId: branchRes.data.data[0].id }));
      if (vRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, vendorId: vRes.data.data[0].id }));
    } catch (err) {
      console.error('Failed to load masters:', err);
    }
  };

  const MOCK_ORDERS = [
    {
      id: 'po-101',
      orderNumber: 'PO-2025-0089',
      vendor: { name: 'Kundan Bullion Refiners' },
      branch: { name: 'Connaught Place Flagship' },
      status: 'APPROVED',
      orderDate: '2025-05-18T10:30:00Z',
      expectedDeliveryDate: '2025-05-24',
      totalAmount: 1450000,
      notes: 'Bulk 24K Gold Bar 100g Order for Festive Season Stocking',
      items: [
        { product: { name: '24K Minted Gold Bar 100g' }, quantity: 2, unitPrice: 710000, taxRatePercent: 3, totalPrice: 1462600 }
      ]
    },
    {
      id: 'po-102',
      orderNumber: 'PO-2025-0092',
      vendor: { name: 'Surat Diamond Manufacturers Ltd' },
      branch: { name: 'Connaught Place Flagship' },
      status: 'SUBMITTED',
      orderDate: '2025-05-20T14:15:00Z',
      expectedDeliveryDate: '2025-05-28',
      totalAmount: 890000,
      notes: 'VVS Solitaire Diamonds and Tennis Bracelet Mountings',
      items: [
        { product: { name: 'VVS1 Solitaire Loose Diamond 1.0ct' }, quantity: 1, unitPrice: 420000, taxRatePercent: 3, totalPrice: 432600 },
        { product: { name: '18K White Gold Tennis Mounting' }, quantity: 2, unitPrice: 235000, taxRatePercent: 3, totalPrice: 484100 }
      ]
    },
    {
      id: 'po-103',
      orderNumber: 'PO-2025-0095',
      vendor: { name: 'Jaipur Gems & Jewellery Co.' },
      branch: { name: 'South Extension Branch' },
      status: 'DRAFT',
      orderDate: '2025-05-21T09:00:00Z',
      expectedDeliveryDate: '2025-05-30',
      totalAmount: 320000,
      notes: 'Natural Zambian Emerald Stones and Kundan Choker Base',
      items: [
        { product: { name: 'Kundan Antique Choker Base' }, quantity: 1, unitPrice: 320000, taxRatePercent: 3, totalPrice: 329600 }
      ]
    }
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await purchasesApi.getAll({ search, status: statusFilter || undefined });
      const apiData = res?.data || res;
      if (Array.isArray(apiData) && apiData.length > 0) {
        setOrders(apiData);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err: any) {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0, taxRatePercent: 3, remarks: '' }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId || !formData.branchId || !formData.vendorId) {
      setFeedback({ type: 'error', message: 'Please select Firm, Branch, and Supplier / Party' });
      return;
    }
    setIsSubmitting(true);
    try {
      await purchasesApi.create(formData as any);
      setFeedback({ type: 'success', message: 'Purchase order draft created successfully' });
      setIsCreateOpen(false);
      fetchOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create purchase order' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (id: string) => {
    try {
      await purchasesApi.submit(id);
      setFeedback({ type: 'success', message: 'Purchase order submitted for approval' });
      fetchOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to submit order' });
    }
  };

  const handleApproveOrder = async (id: string) => {
    try {
      await purchasesApi.approve(id);
      setFeedback({ type: 'success', message: 'Purchase order approved successfully' });
      fetchOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to approve order' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-gold">DRAFT</span>;
      case 'SUBMITTED':
        return <span className="badge badge-blue">SUBMITTED</span>;
      case 'APPROVED':
      case 'COMPLETED':
        return <span className="badge badge-emerald">{status}</span>;
      case 'CANCELLED':
        return <span className="badge badge-ruby">CANCELLED</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const activeMode = (user as any)?.dashboardConfig?.type || (user as any)?.businessType || 'RETAIL';
  const isWholesaleMode = activeMode === 'WHOLESALE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <ShoppingCart size={22} color="#C6A15B" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="brand-font page-title">B2B Purchase Orders</h1>
              <span className="badge badge-blue">WHOLESALE MODULE</span>
            </div>
            <p className="page-subtitle">
              <Layers size={13} /> Order bulk jewellery stock & raw bullion from wholesalers, refiners & manufacturers
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
              <span>New Purchase Order</span>
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
            placeholder="Search by Order # or Notes..."
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
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Supplier / Party</th>
              <th>Showroom Branch</th>
              <th>Status</th>
              <th>Amount Before Tax</th>
              <th>GST Tax</th>
              <th>Total Bill Amount</th>
              <th>Order Date</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading purchase orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <ShoppingCart size={32} className="empty-icon" />
                    <div className="empty-title">No Purchase Orders found</div>
                    <div className="empty-desc">Create a new purchase order or adjust filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={po.id}>
                  <td>
                    <span className="code-text">{po.poNumber || po.orderNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{po.vendor?.name || 'N/A'}</td>
                  <td>{po.branch?.name || 'N/A'}</td>
                  <td>{getStatusBadge(po.status)}</td>
                  <td>₹{Number(po.subtotal || 0).toLocaleString('en-IN')}</td>
                  <td>₹{Number(po.taxAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                    ₹{Number(po.totalAmount || (Number(po.subtotal || 0) + Number(po.taxAmount || 0))).toLocaleString('en-IN')}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(po.orderDate || po.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(po)}
                        className="btn-icon-sm gold"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {po.status === 'DRAFT' && canSubmit && (
                        <button
                          onClick={() => handleSubmitOrder(po.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#2563EB', borderColor: 'rgba(37,99,235,0.3)' }}
                        >
                          Submit
                        </button>
                      )}
                      {po.status === 'SUBMITTED' && canApprove && (
                        <button
                          onClick={() => handleApproveOrder(po.id)}
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

      {/* View Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <ShoppingCart size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>Purchase Order Details</h3>
                  <p>{selectedOrder.poNumber || selectedOrder.orderNumber} · {selectedOrder.vendor?.name}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-section">
                <div className="form-row cols-3">
                  <div>
                    <span className="text-label">Status</span>
                    <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <span className="text-label">Order Date</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px' }}>{new Date(selectedOrder.orderDate || selectedOrder.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div>
                    <span className="text-label">Branch</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px' }}>{selectedOrder.branch?.name || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="form-section">
                  <span className="text-label">Notes</span>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px' }}>Line Items</h4>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>GST %</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item: any, i: number) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{item.product?.name || 'Item'}</td>
                          <td>{item.quantity}</td>
                          <td>₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td>{item.taxRatePercent}%</td>
                          <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>₹{Number(item.totalAmount || (item.quantity * item.unitPrice)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-card-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div className="modal-card lg">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <ShoppingCart size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>New Purchase Order</h3>
                  <p>Issue procurement order to wholesaler or manufacturer</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body">
                <div className="form-section">
                  <div className="form-row cols-3">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Firm / Company</label>
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
                      <label className="form-label">Showroom Branch</label>
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
                      <label className="form-label">Supplier / Party</label>
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
                  <label className="form-label">Notes / Instructions</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional order notes or delivery terms..."
                    className="form-input"
                  />
                </div>

                <div className="form-section gold">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>Order Line Items</h4>
                    <button type="button" onClick={handleAddItem} className="btn btn-outline-gold" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                      + Add Item
                    </button>
                  </div>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="form-row cols-4" style={{ alignItems: 'center', marginBottom: '8px', background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="form-input"
                          style={{ fontSize: '0.82rem' }}
                          required
                        />
                        <input
                          type="number"
                          placeholder="GST %"
                          value={item.taxRatePercent}
                          onChange={(e) => handleItemChange(idx, 'taxRatePercent', Number(e.target.value))}
                          className="form-input"
                          style={{ width: '60px', fontSize: '0.82rem' }}
                        />
                        {formData.items.length > 1 && (
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="btn-icon-sm danger" style={{ width: '26px', height: '26px' }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Create Purchase Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
