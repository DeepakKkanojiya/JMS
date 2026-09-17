import React, { useState, useEffect } from 'react';
import { makingChargesApi, MakingCharge, MakingChargeType } from '../api/makingCharges';
import { MetalType } from '../api/metalRates';
import { companiesApi } from '../api/companies';
import { useAuth } from '../context/AuthContext';
import { parseValidationErrors } from '../api/client';
import { useEscapeKey } from '../hooks/useEscapeKey';
import {
  Percent,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle,
  Edit2,
  PowerOff,
  Sparkles,
} from 'lucide-react';

export const MakingCharges: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('making_charge.create');
  const canUpdate = hasPermission('making_charge.update');

  const [charges, setCharges] = useState<MakingCharge[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [metalFilter, setMetalFilter] = useState<MetalType | ''>('');
  const [typeFilter, setTypeFilter] = useState<MakingChargeType | ''>('');
  const [purityFilter, setPurityFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingCharge, setEditingCharge] = useState<MakingCharge | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    metalType: 'GOLD' as MetalType,
    purity: '22K',
    chargeType: 'PER_GRAM' as MakingChargeType,
    rate: '',
    effectiveFrom: new Date().toISOString().slice(0, 16),
    effectiveTo: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deactivate
  const [deactivatingCharge, setDeactivatingCharge] = useState<MakingCharge | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [search, metalFilter, typeFilter, purityFilter, activeFilter, page]);

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

  const fetchCharges = async () => {
    setLoading(true);
    try {
      const res = await makingChargesApi.list({
        search: search || undefined,
        metalType: metalFilter || undefined,
        chargeType: typeFilter || undefined,
        purity: purityFilter || undefined,
        isActive: activeFilter,
        page,
        limit: 12,
      });

      if (res?.success || Array.isArray(res?.data)) {
        setCharges(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching making charges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (charge?: MakingCharge) => {
    setFormErrors({});
    if (charge) {
      setEditingCharge(charge);
      setFormData({
        companyId: charge.companyId,
        metalType: charge.metalType,
        purity: charge.purity,
        chargeType: charge.chargeType,
        rate: charge.rate.toString(),
        effectiveFrom: charge.effectiveFrom.slice(0, 16),
        effectiveTo: charge.effectiveTo ? charge.effectiveTo.slice(0, 16) : '',
        isActive: charge.isActive,
      });
    } else {
      setEditingCharge(null);
      setFormData({
        companyId: companies[0]?.id || '',
        metalType: 'GOLD',
        purity: '22K',
        chargeType: 'PER_GRAM',
        rate: '',
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
        throw new Error('Rate must be a non-negative number');
      }

      if (editingCharge) {
        await makingChargesApi.update(editingCharge.id, {
          rate: parseFloat(formData.rate),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
          isActive: formData.isActive,
        });
        setFeedback({ type: 'success', message: 'Making charge configuration updated successfully.' });
      } else {
        await makingChargesApi.create({
          companyId: formData.companyId,
          metalType: formData.metalType,
          purity: formData.purity.trim(),
          chargeType: formData.chargeType,
          rate: parseFloat(formData.rate),
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
        });
        setFeedback({ type: 'success', message: 'New making charge rule created successfully.' });
      }

      setIsModalOpen(false);
      fetchCharges();
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
    if (!deactivatingCharge) return;
    try {
      await makingChargesApi.deactivate(deactivatingCharge.id);
      setFeedback({ type: 'success', message: 'Making charge deactivated successfully.' });
      setDeactivatingCharge(null);
      fetchCharges();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to deactivate making charge.' });
    }
  };

  const renderRateBadge = (charge: MakingCharge) => {
    const rateVal = parseFloat(charge.rate.toString());
    if (charge.chargeType === 'PER_GRAM') {
      return <span>₹{rateVal.toLocaleString('en-IN')} / g</span>;
    }
    if (charge.chargeType === 'PERCENTAGE') {
      return <span>{rateVal}% of metal value</span>;
    }
    return <span>₹{rateVal.toLocaleString('en-IN')} Fixed</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Making Charges
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Set making charges per gram, flat amount, or percentage for jewellery items.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={fetchCharges} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={() => handleOpenModal()} className="btn btn-gold">
              <Plus size={18} />
              <span>Create Making Charge</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.88rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}><X size={16} /></button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search purity, type..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={metalFilter}
              onChange={(e) => { setMetalFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '130px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Metals</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="PLATINUM">Platinum</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '150px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Types</option>
              <option value="PER_GRAM">Per Gram (₹/g)</option>
              <option value="FIXED">Fixed (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>

            <select
              value={purityFilter}
              onChange={(e) => { setPurityFilter(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '120px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Purities</option>
              <option value="24K">24K</option>
              <option value="22K">22K</option>
              <option value="18K">18K</option>
              <option value="999">999</option>
              <option value="950">950</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Metal</th>
                <th>Purity</th>
                <th>Charge Type</th>
                <th>Effective Rate</th>
                <th>Effective Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading making charges...</div>
                  </td>
                </tr>
              ) : charges.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Percent size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No making charge rules found</div>
                    <div style={{ fontSize: '0.8rem' }}>Create a making charge rule to automate line-item sales pricing.</div>
                  </td>
                </tr>
              ) : (
                charges.map((charge) => (
                  <tr key={charge.id}>
                    <td>
                      <span className={`badge ${charge.metalType === 'GOLD' ? 'badge-gold' : charge.metalType === 'SILVER' ? 'badge-platinum' : 'badge-blue'}`}>
                        {charge.metalType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>{charge.purity}</td>
                    <td>
                      <span className="badge badge-platinum">
                        {charge.chargeType.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#18181B', fontSize: '0.94rem' }}>
                      {renderRateBadge(charge)}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(charge.effectiveFrom).toLocaleDateString()}
                      {charge.effectiveTo ? ` — ${new Date(charge.effectiveTo).toLocaleDateString()}` : ' (Indefinite)'}
                    </td>
                    <td>
                      <span className={`badge ${charge.isActive ? 'badge-emerald' : 'badge-ruby'}`}>
                        {charge.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {canUpdate && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenModal(charge)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="Edit Rule"
                          >
                            <Edit2 size={13} />
                          </button>
                          {charge.isActive && (
                            <button
                              onClick={() => setDeactivatingCharge(charge)}
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
              Showing {charges.length} of {pagination.total} records
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                {editingCharge ? 'Edit Making Charge Rule' : 'Create Making Charge Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {formErrors.general && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.82rem', marginBottom: '16px' }}>
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!editingCharge && (
                <>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Precious Metal *</label>
                      <select
                        value={formData.metalType}
                        onChange={(e) => setFormData({ ...formData, metalType: e.target.value as MetalType })}
                        className="form-input"
                        required
                      >
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                        <option value="PLATINUM">Platinum</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Purity *</label>
                      <input
                        type="text"
                        value={formData.purity}
                        onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                        placeholder="e.g. 22K, 18K"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Making Charge Type *</label>
                    <select
                      value={formData.chargeType}
                      onChange={(e) => setFormData({ ...formData, chargeType: e.target.value as MakingChargeType })}
                      className="form-input"
                      required
                    >
                      <option value="PER_GRAM">Per Gram (₹ / gram)</option>
                      <option value="FIXED">Fixed Amount (₹ per item)</option>
                      <option value="PERCENTAGE">Percentage (% of metal value)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  Rate {formData.chargeType === 'PERCENTAGE' ? '(%)' : '(₹)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder={formData.chargeType === 'PERCENTAGE' ? 'e.g. 12.5' : 'e.g. 450.00'}
                  className="form-input"
                  required
                  style={{ fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {!editingCharge && (
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

              {editingCharge && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActiveToggle" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#18181B' }}>
                    Rule is Active
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold">
                  {isSubmitting ? 'Saving...' : editingCharge ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {deactivatingCharge && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Deactivate Making Charge Rule
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Deactivate {deactivatingCharge.chargeType.replace('_', ' ')} making charge rule for {deactivatingCharge.metalType} ({deactivatingCharge.purity})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setDeactivatingCharge(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDeactivate} className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                Deactivate Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
