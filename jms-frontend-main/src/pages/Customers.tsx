import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, Search, RefreshCw, Phone, Mail, Plus, Edit2, Trash2, X, AlertCircle, Building2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const Customers: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('customer.create');
  const canUpdate = hasPermission('customer.update');
  const canDelete = hasPermission('customer.delete');

  const [customers, setCustomers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    branchId: '',
    customerCode: '',
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    customerType: 'RETAIL',
    panNumber: '',
    aadharNumber: '',
    gstNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchBranches = async () => {
    try {
      const res = await apiClient.get('/branches');
      if (res.data?.success) {
        const branchList = res.data.data || [];
        setBranches(branchList);
        if (branchList.length > 0 && !formData.branchId) {
          setFormData((prev) => ({ ...prev, branchId: branchList[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/customers', {
        params: { search: search || undefined, page: 1, limit: 50 },
      });
      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    const nextSeq = String(customers.length + 1).padStart(4, '0');
    setFormData({
      branchId: branches[0]?.id || '',
      customerCode: `CUST-${nextSeq}`,
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      customerType: 'RETAIL',
      panNumber: '',
      aadharNumber: '',
      gstNumber: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust: any) => {
    setEditingCustomer(cust);
    setFormData({
      branchId: cust.branchId || branches[0]?.id || '',
      customerCode: cust.customerCode || cust.code || '',
      firstName: cust.firstName || '',
      lastName: cust.lastName || '',
      mobile: cust.mobile || '',
      email: cust.email || '',
      customerType: cust.customerType || 'RETAIL',
      panNumber: cust.panNumber || '',
      aadharNumber: cust.aadharNumber || '',
      gstNumber: cust.gstNumber || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/customers/${deletingCustomer.id}`);
      setFeedback({
        type: 'success',
        message: `Customer "${deletingCustomer.firstName} ${deletingCustomer.lastName || ''}" deleted successfully.`,
      });
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete customer profile.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const payload: any = {
        branchId: formData.branchId || branches[0]?.id,
        customerCode: formData.customerCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName?.trim() || undefined,
        mobile: formData.mobile.trim(),
        email: formData.email?.trim() || undefined,
        customerType: formData.customerType,
        panNumber: formData.panNumber?.trim() || undefined,
        aadharNumber: formData.aadharNumber?.trim() || undefined,
        gstNumber: formData.gstNumber?.trim() || undefined,
      };

      if (editingCustomer) {
        await apiClient.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        await apiClient.post('/customers', payload);
      }

      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: editingCustomer ? 'Customer profile updated successfully.' : 'New customer registered successfully.',
      });
      fetchCustomers();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCustomerTypeBadge = (type: string) => {
    if (type === 'WHOLESALE') {
      return <span className="badge badge-blue">WHOLESALE (B2B)</span>;
    }
    return <span className="badge badge-emerald">NORMAL CUSTOMER</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <Users color="#C6A15B" /> Customer CRM Master
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Retail, Wholesale, VIP, and Corporate client profiles, contact directory, and KYC records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Customer
            </button>
          )}
          <button onClick={fetchCustomers} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: feedback.type === 'success' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            border: feedback.type === 'success' ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)',
            color: feedback.type === 'success' ? '#059669' : '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by customer code, name, phone number, GSTIN, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      {/* Customers Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Full Name / Company</th>
              <th>Mobile Phone</th>
              <th>Email Address</th>
              <th>Classification</th>
              <th>Branch Showroom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading customer directory...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#C6A15B' }}>{c.customerCode || c.code}</td>
                  <td style={{ fontWeight: 600 }}>
                    {c.firstName} {c.lastName || ''}
                    {c.gstNumber && (
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>GSTIN: {c.gstNumber}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                      <Phone size={13} color="#64748B" />
                      <span>{c.mobile}</span>
                    </div>
                  </td>
                  <td>
                    {c.email ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748B' }}>
                        <Mail size={13} />
                        <span>{c.email}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#CBD5E1', fontSize: '0.82rem' }}>—</span>
                    )}
                  </td>
                  <td>{getCustomerTypeBadge(c.customerType)}</td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {c.branch?.name || 'Connaught Place Flagship'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Edit Customer"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingCustomer(c)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', color: '#EF4444' }}
                          title="Delete Customer"
                        >
                          <Trash2 size={14} />
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

      {/* Delete Confirmation Dialog */}
      {deletingCustomer && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Customer Account"
          message={`Are you sure you want to delete customer "${deletingCustomer.firstName} ${deletingCustomer.lastName || ''}" (${deletingCustomer.customerCode})? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete Customer'}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCustomer(null)}
        />
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181B' }}>
                {editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '16px',
                color: '#DC2626',
                fontSize: '0.85rem',
              }}>
                <AlertCircle size={16} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Branch Selection & Customer Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Branch Showroom <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.branchCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Customer Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.customerCode}
                    onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                  />
                  {formErrors.customerCode && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.customerCode}</span>}
                </div>
              </div>

              {/* Classification & Mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Customer Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    required
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  >
                    <option value="RETAIL">Normal Customer (Retail)</option>
                    <option value="WHOLESALE">Wholesale Customer (B2B)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mobile Phone <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0 12px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRight: 'none',
                        borderRadius: '8px 0 0 8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#475569',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9811001122"
                      maxLength={10}
                      className="form-input"
                      style={{ borderRadius: '0 8px 8px 0' }}
                      value={formData.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, mobile: val });
                      }}
                    />
                  </div>
                  {formErrors.mobile && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.mobile}</span>}
                </div>
              </div>

              {/* Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    First Name / Entity Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Rajesh or Mittal Bullion"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  {formErrors.firstName && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sharma or Traders"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email & Tax Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="10-digit PAN (e.g. ABCDE1234F)"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  />
                  {formErrors.panNumber && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.panNumber}</span>}
                </div>
              </div>

              {/* GSTIN (for Wholesale & Corporate) & Aadhar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN (B2B / Corporate)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="15-digit GSTIN"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  />
                  {formErrors.gstNumber && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.gstNumber}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Aadhar Number (Retail KYC)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="12-digit Aadhar"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                  />
                  {formErrors.aadharNumber && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.aadharNumber}</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
