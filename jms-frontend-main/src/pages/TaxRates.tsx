import React, { useState, useEffect } from 'react';
import { taxRatesApi, TaxRate } from '../api/taxRates';
import { companiesApi } from '../api/companies';
import { useAuth } from '../context/AuthContext';
import { parseValidationErrors } from '../api/client';
import { useEscapeKey } from '../hooks/useEscapeKey';
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle,
  Edit2,
  PowerOff,
  Calculator,
} from 'lucide-react';

export const TaxRates: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('tax_rate.create');
  const canUpdate = hasPermission('tax_rate.update');

  const [rates, setRates] = useState<TaxRate[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    taxName: '',
    taxCode: '',
    rate: '',
    effectiveFrom: new Date().toISOString().slice(0, 16),
    effectiveTo: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deactivate Modal
  const [deactivatingRate, setDeactivatingRate] = useState<TaxRate | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRates();
  }, [search, activeFilter, page]);

  const fetchInitialData = async () => {
    try {
      const compRes = await companiesApi.list();
      const compList = compRes?.data || [];
      setCompanies(compList);
      if (compList.length > 0 && !formData.companyId) {
        setFormData((prev) => ({ ...prev, companyId: compList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load companies:', e);
    }
  };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await taxRatesApi.list({
        search: search || undefined,
        isActive: activeFilter,
        page,
        limit: 12,
      });

      if (res?.success || Array.isArray(res?.data)) {
        setRates(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching tax rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rate?: TaxRate) => {
    setFormErrors({});
    if (rate) {
      setEditingRate(rate);
      setFormData({
        companyId: rate.companyId,
        taxName: rate.taxName,
        taxCode: rate.taxCode,
        rate: rate.rate.toString(),
        effectiveFrom: rate.effectiveFrom.slice(0, 16),
        effectiveTo: rate.effectiveTo ? rate.effectiveTo.slice(0, 16) : '',
        isActive: rate.isActive,
      });
    } else {
      setEditingRate(null);
      setFormData({
        companyId: companies[0]?.id || '',
        taxName: 'GST 3% (Jewellery Standard)',
        taxCode: 'GST_3',
        rate: '3.0',
        effectiveFrom: new Date().toISOString().slice(0, 16),
        effectiveTo: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      if (!formData.companyId) throw new Error('Please select a company');
      if (formData.rate === '' || parseFloat(formData.rate) < 0) {
        throw new Error('Rate percentage must be non-negative');
      }

      if (editingRate) {
        await taxRatesApi.update(editingRate.id, {
          taxName: formData.taxName,
          rate: parseFloat(formData.rate),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
          isActive: formData.isActive,
        });
        setFeedback({ type: 'success', message: 'Tax rate configuration updated successfully.' });
      } else {
        await taxRatesApi.create({
          companyId: formData.companyId,
          taxName: formData.taxName.trim(),
          taxCode: formData.taxCode.trim().toUpperCase(),
          rate: parseFloat(formData.rate),
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
        });
        setFeedback({ type: 'success', message: 'New GST tax rate created successfully.' });
      }

      setIsModalOpen(false);
      fetchRates();
    } catch (err: any) {
      const fieldErrors = parseValidationErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      } else {
        setFormErrors({ general: err.response?.data?.message || err.message || 'Operation failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingRate) return;
    try {
      await taxRatesApi.deactivate(deactivatingRate.id);
      setFeedback({ type: 'success', message: 'Tax rate deactivated successfully.' });
      setDeactivatingRate(null);
      fetchRates();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to deactivate tax rate.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            GST & Tax Rates
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage GST tax rates applied to jewellery sales and invoices.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={fetchRates} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={() => handleOpenModal()} className="btn btn-gold">
              <Plus size={18} />
              <span>Create Tax Rate</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}><X size={16} /></button>
        </div>
      )}

      {/* Main Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search tax name, code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
              onChange={(e) => {
                setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true');
                setPage(1);
              }}
              className="form-input"
              style={{ width: '140px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Name</th>
                <th>Tax Code</th>
                <th>Tax Rate (%)</th>
                <th>Effective Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading tax rates...</div>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Receipt size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No tax rates configured</div>
                    <div style={{ fontSize: '0.8rem' }}>Create GST rate rules (e.g. GST_3 = 3%) for statutory compliance.</div>
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id}>
                    <td style={{ fontWeight: 600, color: '#18181B' }}>{rate.taxName}</td>
                    <td>
                      <span className="badge badge-platinum" style={{ fontWeight: 800 }}>
                        {rate.taxCode}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '1.05rem', color: '#C6A15B' }}>
                      {parseFloat(rate.rate.toString())}%
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(rate.effectiveFrom).toLocaleDateString()}
                      {rate.effectiveTo ? ` — ${new Date(rate.effectiveTo).toLocaleDateString()}` : ' (Indefinite)'}
                    </td>
                    <td>
                      <span className={`badge ${rate.isActive ? 'badge-emerald' : 'badge-ruby'}`}>
                        {rate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {canUpdate && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenModal(rate)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="Edit Tax Rate"
                          >
                            <Edit2 size={13} />
                          </button>
                          {rate.isActive && (
                            <button
                              onClick={() => setDeactivatingRate(rate)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626' }}
                              title="Deactivate"
                            >
                              <PowerOff size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Showing {rates.length} of {pagination.total} records
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Previous
              </button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                {editingRate ? 'Edit Tax Rate' : 'Create GST Tax Rate'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {formErrors.general && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.82rem', marginBottom: '16px' }}>
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editingRate && (
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="form-input"
                    required
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tax Name *</label>
                <input
                  type="text"
                  value={formData.taxName}
                  onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                  placeholder="e.g. GST 3% (Jewellery Standard)"
                  className="form-input"
                  required
                />
              </div>

              {!editingRate && (
                <div className="form-group">
                  <label className="form-label">Tax Code *</label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. GST_3, GST_5, EXEMPT"
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tax Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="e.g. 3.0"
                  className="form-input"
                  required
                  style={{ fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {!editingRate && (
                  <div className="form-group">
                    <label className="form-label">Effective From *</label>
                    <input
                      type="datetime-local"
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Effective To (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {editingRate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="checkbox"
                    id="isTaxActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isTaxActiveToggle" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#18181B' }}>
                    Tax Rate is Active
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold">
                  {isSubmitting ? 'Saving...' : editingRate ? 'Update Rate' : 'Create Tax Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {deactivatingRate && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Deactivate Tax Rate
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Deactivate tax rate {deactivatingRate.taxName} ({parseFloat(deactivatingRate.rate.toString())}%)?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setDeactivatingRate(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDeactivate} className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                Deactivate Tax Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
