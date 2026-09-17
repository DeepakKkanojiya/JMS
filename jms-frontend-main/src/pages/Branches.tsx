import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GitBranch, Search, RefreshCw, MapPin, Phone, Mail, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const Branches: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('branch.create');
  const canUpdate = hasPermission('branch.update');
  const canDelete = hasPermission('branch.delete');

  const [branches, setBranches] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deletingBranch, setDeletingBranch] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    branchCode: '',
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isMainBranch: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [search]);

  const fetchCompanies = async () => {
    try {
      const res = await apiClient.get('/companies');
      if (res.data?.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/branches', {
        params: { search: search || undefined, page: 1, limit: 20 },
      });
      if (res.data?.success) {
        setBranches(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    const nextSeq = String(branches.length + 1).padStart(2, '0');
    setFormData({
      companyId: companies[0]?.id || '',
      branchCode: `BR-DEL-${nextSeq}`,
      name: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      isMainBranch: branches.length === 0,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: any) => {
    setEditingBranch(branch);
    setFormData({
      companyId: branch.companyId || companies[0]?.id || '',
      branchCode: branch.branchCode || branch.code || '',
      name: branch.name || '',
      email: branch.email || '',
      phone: branch.phone || '',
      addressLine1: branch.addressLine1 || '',
      addressLine2: branch.addressLine2 || '',
      city: branch.city || '',
      state: branch.state || '',
      pincode: branch.pincode || '',
      isMainBranch: !!branch.isMainBranch,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBranch) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/branches/${deletingBranch.id}`);
      setFeedback({ type: 'success', message: `Branch "${deletingBranch.name}" deleted successfully.` });
      setDeletingBranch(null);
      fetchBranches();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to delete branch.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const payload = {
        companyId: formData.companyId || companies[0]?.id,
        branchCode: formData.branchCode.trim(),
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2?.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        isMainBranch: formData.isMainBranch,
      };

      if (editingBranch) {
        await apiClient.put(`/branches/${editingBranch.id}`, payload);
      } else {
        await apiClient.post('/branches', payload);
      }

      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: editingBranch ? 'Branch showroom updated successfully.' : 'New showroom branch registered successfully.',
      });
      fetchBranches();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <GitBranch color="#C6A15B" /> Showroom Branches Master
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Retail showroom locations, Branch Codes, Branch IDs, addresses, and contacts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Branch
            </button>
          )}
          <button onClick={fetchBranches} className="btn btn-secondary">
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

      {/* Search */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search branches by code, name, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Branch Code</th>
              <th>Branch Name</th>
              <th>City & Location</th>
              <th>Contact Info</th>
              <th>Main Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Loading showroom branches...</td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No showroom branches found.
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ color: '#C6A15B', fontSize: '0.9rem' }}>
                      {b.branchCode || b.code || `BR-${b.id.slice(0, 6).toUpperCase()}`}
                    </strong>
                  </td>
                  <td><strong>{b.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#64748B" /> {b.addressLine1 ? `${b.addressLine1}, ${b.city}` : b.city || '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {b.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {b.phone}</span>}
                      {b.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {b.email}</span>}
                    </div>
                  </td>
                  <td>
                    {b.isMainBranch ? (
                      <span className="badge badge-gold">HQ Main Branch</span>
                    ) : (
                      <span className="badge badge-blue">Regional Showroom</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Edit Branch"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingBranch(b)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', color: '#EF4444' }}
                          title="Delete Branch"
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
      {deletingBranch && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Showroom Branch"
          message={`Are you sure you want to delete branch "${deletingBranch.name}" (${deletingBranch.branchCode})? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete Branch'}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingBranch(null)}
        />
      )}

      {/* Add / Edit Branch Modal */}
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
                {editingBranch ? 'Edit Showroom Branch' : 'Register New Showroom Branch'}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Enterprise Company <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    required
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Branch Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                  />
                  {formErrors.branchCode && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.branchCode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Showroom Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place Flagship Showroom"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="branch@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="011-23456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Address Line 1 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street / Plaza address"
                  className="form-input"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
                {formErrors.addressLine1 && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.addressLine1}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    City <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                  {formErrors.city && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    State <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                  {formErrors.state && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.state}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pincode <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                  {formErrors.pincode && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.pincode}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="isMainBranch"
                  checked={formData.isMainBranch}
                  onChange={(e) => setFormData({ ...formData, isMainBranch: e.target.checked })}
                />
                <label htmlFor="isMainBranch" style={{ fontSize: '0.85rem', color: '#18181B', fontWeight: 600 }}>
                  Designate as Head Office / Flagship Main Branch
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
