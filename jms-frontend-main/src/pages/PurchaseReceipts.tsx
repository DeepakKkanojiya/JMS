import React, { useState, useEffect } from 'react';
import { purchaseReceiptsApi } from '../api/purchaseReceipts';
import { purchasesApi } from '../api/purchases';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Truck, Search, RefreshCw, Plus, CheckCircle2, AlertCircle, X, Layers } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const PurchaseReceipts: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('purchase.receipt.create');
  const canReceive = hasPermission('purchase.receipt.receive');

  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));

  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [selectedPo, setSelectedPo] = useState<any | null>(null);
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receivedItems, setReceivedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchReceipts();
  }, [search]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await purchaseReceiptsApi.getAll({ search });
      setReceipts(res.data || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch Purchase Receipts' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    try {
      const res = await purchasesApi.getAll({ status: 'APPROVED' });
      setApprovedOrders(res.data || []);
      setIsModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch approved purchase orders' });
    }
  };

  const handleSelectPo = (poId: string) => {
    const po = approvedOrders.find(p => p.id === poId);
    setSelectedPo(po || null);
    if (po && po.items) {
      setReceivedItems(
        po.items.map((item: any) => ({
          purchaseOrderItemId: item.id,
          productName: item.product?.name || 'Item',
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity - (item.receivedQuantity || 0),
          grossWeight: item.product?.grossWeight || 0,
          netWeight: item.product?.netWeight || 0,
          purity: item.product?.purity || '22K',
        }))
      );
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;
    setIsSubmitting(true);
    try {
      await purchaseReceiptsApi.create({
        purchaseOrderId: selectedPo.id,
        companyId: selectedPo.companyId,
        branchId: selectedPo.branchId,
        vendorId: selectedPo.vendorId,
        supplierInvoiceNumber,
        notes,
        items: receivedItems.map(i => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          receivedQuantity: Number(i.receivedQuantity),
          grossWeight: Number(i.grossWeight),
          netWeight: Number(i.netWeight),
          purity: i.purity,
        })),
      });
      setFeedback({ type: 'success', message: 'Purchase receipt created successfully' });
      setIsModalOpen(false);
      fetchReceipts();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create receipt' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessIntake = async (id: string) => {
    try {
      await purchaseReceiptsApi.processIntake(id);
      setFeedback({ type: 'success', message: 'Inventory stock intake & barcode tag generation completed successfully' });
      fetchReceipts();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Stock intake failed' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <Truck size={22} color="#C6A15B" />
          </div>
          <div>
            <h1 className="brand-font page-title">Goods Receiving & Stock Intake</h1>
            <p className="page-subtitle">
              <Layers size={13} /> Record physical delivery receipts & intake inventory tags
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={fetchReceipts} className="btn btn-secondary">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={handleOpenModal} className="btn btn-primary">
              <Plus size={16} />
              <span>New Receiving Receipt</span>
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
        <div className="search-wrapper" style={{ maxWidth: '400px' }}>
          <Search size={16} className="search-icon" color="#C6A15B" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search Receipt Number..."
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
        <table>
          <thead>
            <tr>
              <th>Receipt Number</th>
              <th>PO Number</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Supplier Inv #</th>
              <th>Received Date</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading purchase receipts...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Truck size={32} className="empty-icon" />
                    <div className="empty-title">No Purchase Receipts found</div>
                    <div className="empty-desc">Record a new physical delivery receipt to intake stock.</div>
                  </div>
                </td>
              </tr>
            ) : (
              receipts.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <span className="code-text">{rec.receiptNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{rec.purchaseOrder?.poNumber || rec.purchaseOrder?.orderNumber || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rec.vendor?.name || 'N/A'}</td>
                  <td>
                    <span className={`badge ${rec.status === 'COMPLETED' ? 'badge-emerald' : 'badge-blue'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>{rec.supplierInvoiceNumber || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(rec.receivedDate || rec.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                    {rec.status === 'RECEIVING' && canReceive && (
                      <button
                        onClick={() => handleProcessIntake(rec.id)}
                        className="btn btn-primary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Process Intake & Barcodes</span>
                      </button>
                    )}
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
                  <Truck size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>New Purchase Receipt</h3>
                  <p>Intake stock items against approved purchase order</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateReceipt} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body">
                <div className="form-group">
                  <label className="form-label">Approved Purchase Order</label>
                  <select
                    onChange={(e) => handleSelectPo(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Approved PO</option>
                    {approvedOrders.map(p => <option key={p.id} value={p.id}>{p.poNumber || p.orderNumber} — {p.vendor?.name}</option>)}
                  </select>
                </div>

                {selectedPo && (
                  <>
                    <div className="form-section">
                      <div className="form-row cols-2">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Supplier Invoice Number</label>
                          <input
                            type="text"
                            value={supplierInvoiceNumber}
                            onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                            className="form-input"
                            placeholder="e.g. INV-998822"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Notes</label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-input"
                            placeholder="Receiving remarks"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section gold">
                      <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '10px' }}>Items Received Intake</h4>
                      {receivedItems.map((item, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                            {item.productName} (Ordered: {item.orderedQuantity})
                          </div>
                          <div className="form-row cols-4">
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem' }}>Rec Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={item.receivedQuantity}
                                onChange={(e) => {
                                  const newItems = [...receivedItems];
                                  newItems[idx].receivedQuantity = Number(e.target.value);
                                  setReceivedItems(newItems);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.82rem' }}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem' }}>Gross Wt (g)</label>
                              <input
                                type="number"
                                step="0.001"
                                value={item.grossWeight}
                                onChange={(e) => {
                                  const newItems = [...receivedItems];
                                  newItems[idx].grossWeight = Number(e.target.value);
                                  setReceivedItems(newItems);
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
                                  const newItems = [...receivedItems];
                                  newItems[idx].netWeight = Number(e.target.value);
                                  setReceivedItems(newItems);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.82rem' }}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.72rem' }}>Purity</label>
                              <input
                                type="text"
                                value={item.purity}
                                onChange={(e) => {
                                  const newItems = [...receivedItems];
                                  newItems[idx].purity = e.target.value;
                                  setReceivedItems(newItems);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.82rem' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting || !selectedPo} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Create Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
