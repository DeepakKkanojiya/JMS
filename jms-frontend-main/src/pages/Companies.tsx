import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Building2, Search, RefreshCw, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const Companies: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const roleObj = user?.role;
  const roleCode = (typeof roleObj === 'string' ? roleObj : roleObj?.code || roleObj?.name || 'ADMIN').toUpperCase();
  const canCreate = hasPermission('company.create');
  const canUpdate = hasPermission('company.update');
  const canDelete = hasPermission('company.delete');

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deletingCompany, setDeletingCompany] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingCompany, setEditingCompany] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    legalName: '',
    gstNumber: '',
    panNumber: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/companies', {
        params: { search: search || undefined, page: 1, limit: 20 },
      });
      if (res.data?.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sequential Auto-Increment Company Code Generator (e.g. COMP-0003)
  const handleOpenAdd = () => {
    setEditingCompany(null);
    const nextSeq = String(companies.length + 1).padStart(3, '0');
    setFormData({
      code: `COMP-${nextSeq}`,
      name: '',
      legalName: '',
      gstNumber: '',
      panNumber: '',
      address: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: any) => {
    setEditingCompany(comp);
    setFormData({
      code: comp.code || comp.companyCode || '',
      name: comp.name || '',
      legalName: comp.legalName || '',
      gstNumber: comp.gstNumber || '',
      panNumber: comp.panNumber || '',
      address: comp.address || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCompany) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/companies/${deletingCompany.id}`);
      setDeletingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Delete company failed:', err);
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
        code: formData.code,
        companyCode: formData.code,
        name: formData.name,
        legalName: formData.legalName || undefined,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        address: formData.address || undefined,
      };

      if (editingCompany) {
        await apiClient.put(`/companies/${editingCompany.id}`, payload);
      } else {
        await apiClient.post('/companies', payload);
      }

      setIsModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <Building2 color="#C6A15B" /> Enterprise Companies Master
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Registered enterprise legal entities, Company Codes, GSTIN & PAN details.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Company
            </button>
          )}
          <button onClick={fetchCompanies} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by company code, name, GSTIN..."
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
              <th>Company Code</th>
              <th>Company Name</th>
              <th>Legal Name</th>
              <th>GSTIN</th>
              <th>PAN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Loading enterprise companies...</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No company records found.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ color: '#C6A15B', fontSize: '0.9rem' }}>
                      {c.companyCode || c.code || 'COMP-0001'}
                    </strong>
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.legalName || c.name}</td>
                  <td>{c.gstNumber || '-'}</td>
                  <td>{c.panNumber || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Edit Company"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingCompany(c)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#DC2626' }}
                          title="Delete Company"
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

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCompany}
        title="Delete Company Profile"
        message={`Are you sure you want to delete company "${deletingCompany?.name}"? This action cannot be undone.`}
        confirmText="Delete Company"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCompany(null)}
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="gold-text" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingCompany ? 'Edit Company Profile' : 'Add New Enterprise Company'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748B' }}>
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
              }}>
                <AlertCircle size={16} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Auto-Increment Company Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                  {formErrors.code && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.code}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Company Brand Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Legal Name (GST Certificate)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingCompany ? 'Update Company' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
