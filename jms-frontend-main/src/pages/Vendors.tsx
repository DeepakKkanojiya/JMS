import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Truck, Search, RefreshCw, Plus, Edit2, Trash2, X, AlertCircle, Phone, Mail, CheckCircle2, Building2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const Vendors: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const canCreate = hasPermission('vendor.create');
  const canUpdate = hasPermission('vendor.update');
  const canDelete = hasPermission('vendor.delete');

  const [vendors, setVendors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deletingVendor, setDeletingVendor] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    branchId: '',
    code: '',
    name: '',
    gstNumber: '',
    panNumber: '',
    mobile: '',
    email: '',
    city: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [search]);

  const fetchBranches = async () => {
    try {
      const res = await apiClient.get('/branches');
      if (res.data?.success) {
        setBranches(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/vendors', {
        params: { search: search || undefined, page: 1, limit: 50 },
      });
      if (res.data?.success) {
        setVendors(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sequential Vendor Code Generator (e.g. VEND-001)
  const handleOpenAdd = () => {
    setEditingVendor(null);
    const nextSeq = String(vendors.length + 1).padStart(3, '0');
    setFormData({
      branchId: branches[0]?.id || (user as any)?.branchId || '',
      code: `VEND-${nextSeq}`,
      name: '',
      gstNumber: '',
      panNumber: '',
      mobile: '',
      email: '',
      city: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVendor(v);
    setFormData({
      branchId: v.branchId || branches[0]?.id || '',
      code: v.vendorCode || v.code || '',
      name: v.companyName || v.name || '',
      gstNumber: v.gstNumber || '',
      panNumber: v.panNumber || '',
      mobile: v.mobile || v.phone || '',
      email: v.email || '',
      city: v.city || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVendor) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/vendors/${deletingVendor.id}`);
      setFeedback({ type: 'success', message: `Supplier "${deletingVendor.companyName || deletingVendor.name}" deleted successfully.` });
      setDeletingVendor(null);
      fetchVendors();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to delete supplier.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const branchIdToUse = formData.branchId || branches[0]?.id || (user as any)?.branchId;
      if (!branchIdToUse) {
        throw new Error('Please select a showroom branch for this supplier.');
      }

      if (!formData.name.trim()) {
        throw new Error('Supplier name is required.');
      }

      if (!formData.mobile.trim() || formData.mobile.trim().length < 10) {
        throw new Error('Valid 10-digit mobile number is required.');
      }

      const payload: any = {
        branchId: branchIdToUse,
        vendorCode: formData.code.trim(),
        companyName: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email?.trim() || undefined,
        gstNumber: formData.gstNumber?.trim() || undefined,
        panNumber: formData.panNumber?.trim() || undefined,
        city: formData.city?.trim() || undefined,
      };

      if (editingVendor) {
        await apiClient.put(`/vendors/${editingVendor.id}`, payload);
        setFeedback({ type: 'success', message: `Supplier "${formData.name}" updated successfully!` });
      } else {
        await apiClient.post('/vendors', payload);
        setFeedback({ type: 'success', message: `Supplier "${formData.name}" added successfully!` });
      }

      setIsModalOpen(false);
      fetchVendors();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
      } else {
        setFormErrors({ general: err.response?.data?.message || err.message || 'Operation failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <Truck color="#C6A15B" /> Suppliers & Bullion Vendors Master
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Bullion suppliers, gemstone vendors, verified GSTIN, and artisan contacts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Vendor
            </button>
          )}
          <button onClick={fetchVendors} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
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
            placeholder="Search suppliers by vendor code, supplier name, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Vendor Code</th>
              <th>Supplier Name</th>
              <th>Branch Showroom</th>
              <th>GSTIN</th>
              <th>PAN</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading suppliers...</td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No supplier records found.
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong style={{ color: '#C6A15B', fontSize: '0.9rem' }}>
                      {v.vendorCode || v.code || 'VEND-001'}
                    </strong>
                  </td>
                  <td><strong>{v.companyName || v.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#475569' }}>
                      <Building2 size={13} color="#94A3B8" />
                      <span>{v.branch?.name || 'Main Showroom'}</span>
                    </div>
                  </td>
                  <td>{v.gstNumber || '—'}</td>
                  <td>{v.panNumber || '—'}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {(v.mobile || v.phone) && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {v.mobile || v.phone}</span>}
                      {v.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {v.email}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Edit Vendor"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingVendor(v)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#DC2626' }}
                          title="Delete Vendor"
                        >
                          <Trash2 size={14} /> Delete
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
      <ConfirmDialog
        isOpen={!!deletingVendor}
        title="Delete Supplier Profile"
        message={`Are you sure you want to delete supplier "${deletingVendor?.companyName || deletingVendor?.name}"? This action cannot be undone.`}
        confirmText="Delete Supplier"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingVendor(null)}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                {editingVendor ? 'Edit Supplier Profile' : 'Add New Bullion / Gem Supplier'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '16px',
                color: '#DC2626',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AlertCircle size={16} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              {branches.length > 1 && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Showroom Branch *</label>
                  <select
                    className="form-input"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                  {formErrors.vendorCode && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.vendorCode}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swarna Bullion Refineries"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.companyName && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.companyName}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="07AAAAA0000A1Z5"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  />
                  {formErrors.gstNumber && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.gstNumber}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    className="form-input"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  />
                  {formErrors.panNumber && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.panNumber}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Mobile Phone *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0 12px',
                        background: '#F1F5F9',
                        border: '1.5px solid var(--border-color)',
                        borderRight: 'none',
                        borderRadius: '10px 0 0 10px',
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
                      placeholder="9876500111"
                      maxLength={10}
                      className="form-input"
                      style={{ borderRadius: '0 10px 10px 0' }}
                      value={formData.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, mobile: val });
                      }}
                    />
                  </div>
                  {formErrors.mobile && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.mobile}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="supplier@bullion.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.email}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingVendor ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
