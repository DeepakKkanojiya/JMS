import React, { useState, useEffect } from 'react';
import { vendorPaymentsApi } from '../api/vendorPayments';
import { purchaseBillsApi } from '../api/purchaseBills';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Search, RefreshCw, Plus, RotateCcw, AlertCircle, X, Layers, CheckCircle2 } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const VendorPayments: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('vendor_payment.create');
  const canReverse = hasPermission('vendor_payment.reverse');

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));

  const [approvedBills, setApprovedBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    companyId: '',
    branchId: '',
    vendorId: '',
    purchaseBillId: '',
    paymentMode: 'BANK_TRANSFER' as any,
    amount: 0,
    referenceNumber: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await vendorPaymentsApi.getAll({ search });
      setPayments(res.data || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch Vendor Payments' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    try {
      const res = await purchaseBillsApi.getAll({ status: 'APPROVED' });
      setApprovedBills(res.data || []);
      setIsModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch approved purchase bills' });
    }
  };

  const handleSelectBill = (billId: string) => {
    const bill = approvedBills.find(b => b.id === billId);
    setSelectedBill(bill || null);
    if (bill) {
      setFormData(prev => ({
        ...prev,
        companyId: bill.companyId,
        branchId: bill.branchId,
        vendorId: bill.vendorId,
        purchaseBillId: bill.id,
        amount: Number(bill.outstandingAmount),
      }));
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || formData.amount <= 0) return;
    setIsSubmitting(true);
    try {
      await vendorPaymentsApi.create(formData);
      setFeedback({ type: 'success', message: 'Vendor payment recorded & bill settled successfully' });
      setIsModalOpen(false);
      fetchPayments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Vendor payment failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReversePayment = async (id: string) => {
    const reason = prompt('Enter mandatory reversal reason:');
    if (!reason || reason.trim().length < 3) return;
    try {
      await vendorPaymentsApi.reverse(id, reason.trim());
      setFeedback({ type: 'success', message: 'Payment reversed & bill balance restored successfully' });
      fetchPayments();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Reversal failed' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <CreditCard size={22} color="#C6A15B" />
          </div>
          <div>
            <h1 className="brand-font page-title">Vendor Payments</h1>
            <p className="page-subtitle">
              <Layers size={13} /> Settle vendor purchase bills with cash, bank transfers & card payments
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={fetchPayments} className="btn btn-secondary">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={handleOpenModal} className="btn btn-primary">
              <Plus size={16} />
              <span>Record Vendor Payment</span>
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
            placeholder="Search Payment Number or Reference..."
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

      {/* Payments Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Bill #</th>
              <th>Vendor</th>
              <th>Mode</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading vendor payments...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <CreditCard size={32} className="empty-icon" />
                    <div className="empty-title">No Vendor Payments found</div>
                    <div className="empty-desc">Record a payment settlement against an approved bill.</div>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="code-text">{p.paymentNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.purchaseBill?.billNumber || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.vendor?.name || 'N/A'}</td>
                  <td>
                    <span className="badge badge-gray">{p.paymentMode}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#047857' }}>₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${p.status === 'CONFIRMED' ? 'badge-emerald' : 'badge-ruby'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                    {p.status === 'CONFIRMED' && canReverse && (
                      <button
                        onClick={() => handleReversePayment(p.id)}
                        className="btn-icon-sm danger"
                        title="Reverse Payment"
                        style={{ marginLeft: 'auto' }}
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <CreditCard size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>Record Vendor Payment</h3>
                  <p>Settle accounts payable invoice</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body">
                <div className="form-group">
                  <label className="form-label">Approved Purchase Bill</label>
                  <select
                    onChange={(e) => handleSelectBill(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Bill to Settle</option>
                    {approvedBills.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.billNumber} ({b.vendor?.name}) — Outstanding: ₹{Number(b.outstandingAmount || 0).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBill && (
                  <>
                    <div className="form-section gold">
                      <div className="form-row cols-2">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Payment Mode</label>
                          <select
                            value={formData.paymentMode}
                            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                            className="form-input"
                          >
                            <option value="BANK_TRANSFER">BANK TRANSFER</option>
                            <option value="CASH">CASH</option>
                            <option value="CARD">CARD</option>
                            <option value="UPI">UPI</option>
                            <option value="CHEQUE">CHEQUE</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Amount (₹)</label>
                          <input
                            type="number"
                            min="1"
                            max={Number(selectedBill.outstandingAmount)}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            className="form-input"
                            style={{ fontWeight: 700, color: '#047857' }}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reference / UTR Number</label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        className="form-input"
                        placeholder="Bank UTR, Cheque #, or UPI ref"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="form-input"
                        placeholder="Payment remarks"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting || !selectedBill} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Processing...' : 'Confirm Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
