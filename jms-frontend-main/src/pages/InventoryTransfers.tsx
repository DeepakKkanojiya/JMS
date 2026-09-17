import React, { useState, useEffect } from 'react';
import { inventoryTransfersApi, InventoryTransfer, TransferStatus } from '../api/inventoryTransfers';
import { inventoryApi } from '../api/inventory';
import { branchesApi } from '../api/branches';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Plus, RefreshCw, Eye, CheckCircle, XCircle, Send, PackageCheck, AlertCircle, X, Clock } from 'lucide-react';

export const InventoryTransfers: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('inventory_transfer.create');
  const canApprove = hasPermission('inventory_transfer.approve');
  const canReject = hasPermission('inventory_transfer.reject');
  const canDispatch = hasPermission('inventory_transfer.dispatch');
  const canReceive = hasPermission('inventory_transfer.receive');

  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    inventoryItemId: '',
    fromBranchId: '',
    toBranchId: '',
    remarks: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Reject Modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Detail View Modal
  const [selectedTransfer, setSelectedTransfer] = useState<InventoryTransfer | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchTransfers();
    fetchBranches();
  }, [statusFilter]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await inventoryTransfersApi.list({
        status: statusFilter ? (statusFilter as TransferStatus) : undefined,
      });
      setTransfers(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await branchesApi.list();
      setBranches(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const handleOpenCreate = async () => {
    setCreateError(null);
    setCreateData({ inventoryItemId: '', fromBranchId: '', toBranchId: '', remarks: '' });
    try {
      const res = await inventoryApi.list({ limit: 100 });
      const availableItems = (res.data || []).filter((i: any) => i.status === 'AVAILABLE');
      setItems(availableItems);
      setIsCreateOpen(true);
    } catch (err: any) {
      console.error('Failed to fetch items for transfer:', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!createData.inventoryItemId || !createData.fromBranchId || !createData.toBranchId) {
      setCreateError('Please select item, source branch, and destination branch.');
      return;
    }
    if (createData.fromBranchId === createData.toBranchId) {
      setCreateError('Source and destination branches must be different.');
      return;
    }

    try {
      await inventoryTransfersApi.create({
        inventoryItemId: createData.inventoryItemId,
        fromBranchId: createData.fromBranchId,
        toBranchId: createData.toBranchId,
        remarks: createData.remarks || undefined,
      });
      setIsCreateOpen(false);
      setFeedback({ type: 'success', message: 'Transfer request submitted successfully.' });
      fetchTransfers();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create transfer request.');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await inventoryTransfersApi.approve(id);
      setFeedback({ type: 'success', message: 'Transfer approved.' });
      fetchTransfers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to approve transfer.' });
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectionReason.trim()) return;
    try {
      await inventoryTransfersApi.reject(rejectingId, rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
      setFeedback({ type: 'success', message: 'Transfer rejected.' });
      fetchTransfers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to reject transfer.' });
    }
  };

  const handleDispatch = async (id: string) => {
    try {
      await inventoryTransfersApi.dispatch(id);
      setFeedback({ type: 'success', message: 'Transfer dispatched (In-Transit).' });
      fetchTransfers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to dispatch transfer.' });
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await inventoryTransfersApi.receive(id);
      setFeedback({ type: 'success', message: 'Transfer received and inventory restocked into destination branch.' });
      fetchTransfers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to receive transfer.' });
    }
  };

  const getStatusBadge = (st: TransferStatus) => {
    switch (st) {
      case 'REQUESTED': return <span className="badge badge-gold">REQUESTED</span>;
      case 'APPROVED': return <span className="badge badge-emerald">APPROVED</span>;
      case 'DISPATCHED': return <span className="badge badge-blue">IN TRANSIT</span>;
      case 'RECEIVED': return <span className="badge badge-emerald">RECEIVED</span>;
      case 'REJECTED': return <span className="badge badge-gray" style={{ color: '#DC2626' }}>REJECTED</span>;
      default: return <span className="badge badge-gray">{st}</span>;
    }
  };

  const renderTimeline = (t: InventoryTransfer) => {
    const steps = [
      { key: 'REQUESTED', label: 'Requested', time: t.createdAt, user: t.requestedByUser?.name || t.requestedBy },
      { key: 'APPROVED', label: 'Approved', time: t.approvedAt, user: t.approvedByUser?.name || t.approvedBy },
      { key: 'DISPATCHED', label: 'Dispatched', time: t.dispatchedAt, user: t.dispatchedByUser?.name || t.dispatchedBy },
      { key: 'RECEIVED', label: 'Received', time: t.receivedAt, user: t.receivedByUser?.name || t.receivedBy },
    ];

    if (t.status === 'REJECTED') {
      return (
        <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '12px', color: '#DC2626', fontSize: '0.82rem' }}>
          <strong>Transfer Rejected:</strong> {t.rejectionReason || 'No reason provided.'} (By {t.rejectedByUser?.name || t.rejectedBy || 'Manager'})
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        {steps.map((step, idx) => {
          const isDone = Boolean(step.time);
          const isCurrent = t.status === step.key;
          return (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isDone ? '#059669' : isCurrent ? '#C6A15B' : '#E2E8F0',
                  color: isDone || isCurrent ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isDone ? '#18181B' : '#64748B' }}>{step.label}</div>
                {step.time && <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
              </div>
              {idx < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: isDone ? '#059669' : '#E2E8F0', margin: '0 8px' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <ArrowLeftRight color="#C6A15B" /> Branch Stock Transfers
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Manage inventory transfers between showroom branches with live status updates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={16} /> Create Transfer Request
            </button>
          )}
          <button onClick={fetchTransfers} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}><X size={14} /></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Filter Lifecycle Status:</span>
        <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '180px', padding: '8px 12px' }}>
          <option value="">All Statuses</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Transfer Code</th>
              <th>Item Code / SKU</th>
              <th>From Branch</th>
              <th>To Branch</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading branch transfers...</td>
              </tr>
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>No branch stock transfers found.</td>
              </tr>
            ) : (
              transfers.map((t) => (
                <tr key={t.id}>
                  <td><strong style={{ color: '#C6A15B' }}>{t.transferCode}</strong></td>
                  <td>
                    <strong>{t.inventoryItem?.itemCode || t.inventoryItemId}</strong>
                    {t.inventoryItem?.product?.name && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{t.inventoryItem.product.name}</div>}
                  </td>
                  <td>{t.fromBranch?.name || t.fromBranchId}</td>
                  <td>{t.toBranch?.name || t.toBranchId}</td>
                  <td>{getStatusBadge(t.status)}</td>
                  <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedTransfer(t)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="View Transfer Timeline">
                        <Eye size={13} />
                      </button>

                      {t.status === 'REQUESTED' && canApprove && (
                        <button onClick={() => handleApprove(t.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#059669' }} title="Approve Transfer">
                          <CheckCircle size={13} /> Approve
                        </button>
                      )}

                      {t.status === 'REQUESTED' && canReject && (
                        <button onClick={() => setRejectingId(t.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626' }} title="Reject Transfer">
                          <XCircle size={13} /> Reject
                        </button>
                      )}

                      {t.status === 'APPROVED' && canDispatch && (
                        <button onClick={() => handleDispatch(t.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#2563EB' }} title="Dispatch Physical Item">
                          <Send size={13} /> Dispatch
                        </button>
                      )}

                      {t.status === 'DISPATCHED' && canReceive && (
                        <button onClick={() => handleReceive(t.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Receive Stock at Destination">
                          <PackageCheck size={13} /> Receive
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 className="gold-text" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Request Branch Stock Transfer</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {createError && (
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: '#DC2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Available Inventory Item</label>
                <select className="form-input" value={createData.inventoryItemId} onChange={(e) => {
                  const selItem = items.find((i) => i.id === e.target.value);
                  setCreateData({
                    ...createData,
                    inventoryItemId: e.target.value,
                    fromBranchId: selItem?.branchId || branches[0]?.id || '',
                  });
                }} required>
                  <option value="">Select Item...</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.itemCode} - {i.product?.name} ({i.grossWeight}g)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">From Branch</label>
                  <select className="form-input" value={createData.fromBranchId} onChange={(e) => setCreateData({ ...createData, fromBranchId: e.target.value })} required>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Branch</label>
                  <select className="form-input" value={createData.toBranchId} onChange={(e) => setCreateData({ ...createData, toBranchId: e.target.value })} required>
                    <option value="">Select Destination...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Remarks / Transfer Reason</label>
                <textarea className="form-input" value={createData.remarks} onChange={(e) => setCreateData({ ...createData, remarks: e.target.value })} placeholder="Transferring item to main showroom exhibition..." rows={3} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>Reject Transfer Request</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Rejection Reason (Required)</label>
                <textarea className="form-input" required value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Destination showroom display capacity full..." rows={3} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setRejectingId(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>Reject Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal with Visual Timeline */}
      {selectedTransfer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '620px', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>Transfer Details — {selectedTransfer.transferCode}</h3>
                <span className="gold-text" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Item: {selectedTransfer.inventoryItem?.itemCode || selectedTransfer.inventoryItemId}</span>
              </div>
              <button onClick={() => setSelectedTransfer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>

            {renderTimeline(selectedTransfer)}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginTop: '16px' }}>
              <div><span style={{ color: '#64748B' }}>From Branch:</span> <strong>{selectedTransfer.fromBranch?.name || selectedTransfer.fromBranchId}</strong></div>
              <div><span style={{ color: '#64748B' }}>Destination:</span> <strong>{selectedTransfer.toBranch?.name || selectedTransfer.toBranchId}</strong></div>
              <div><span style={{ color: '#64748B' }}>Requested By:</span> <span>{selectedTransfer.requestedByUser?.name || selectedTransfer.requestedBy}</span></div>
              <div><span style={{ color: '#64748B' }}>Created At:</span> <span>{new Date(selectedTransfer.createdAt).toLocaleString()}</span></div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setSelectedTransfer(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
