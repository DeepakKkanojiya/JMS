import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { thirdPartyGirviApi, ThirdPartyLender, CreateThirdPartyLenderPayload } from '../api/thirdPartyGirvi';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Building2, Plus } from 'lucide-react';

export const ThirdPartyLenders: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lenders, setLenders] = useState<ThirdPartyLender[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [lenderCode, setLenderCode] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toastId = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchLenders = async () => {
    setIsLoading(true);
    try {
      const res = await thirdPartyGirviApi.listLenders(user?.companyId, user?.branchId);
      if (res?.success && Array.isArray(res.data)) {
        setLenders(res.data);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load lenders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
  }, []);

  const handleCreateLender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Lender name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateThirdPartyLenderPayload = {
        companyId: user?.companyId || '',
        branchId: user?.branchId || undefined,
        name,
        lenderCode: lenderCode || undefined,
        contactPerson: contactPerson || undefined,
        mobile: mobile || undefined,
        email: email || undefined,
        address: address || undefined,
      };

      const res = await thirdPartyGirviApi.createLender(payload);
      if (res?.success) {
        showToast(`Lender ${res.data?.name} created successfully!`, 'success');
        setIsModalOpen(false);
        resetForm();
        fetchLenders();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create lender', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLenderCode('');
    setContactPerson('');
    setMobile('');
    setEmail('');
    setAddress('');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 color="#38BDF8" size={26} />
            Third-Party External Lenders Catalog
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            External financiers and institutions (e.g. Muthoot Finance, Manappuram) for re-pledging loans.
          </p>
        </div>

        {hasPermission('third_party_girvi.create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn"
            style={{ background: '#38BDF8', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={18} />
            Add External Lender
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader type="table" rows={5} />
      ) : lenders.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <Building2 size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3F3F46' }}>No Third-Party Lenders Registered</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E4E7', fontSize: '0.78rem', color: '#71717A', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Lender Code</th>
                <th style={{ padding: '12px 16px' }}>Lender Name</th>
                <th style={{ padding: '12px 16px' }}>Contact Person</th>
                <th style={{ padding: '12px 16px' }}>Mobile</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>{l.lenderCode}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#38BDF8' }}>{l.name}</td>
                  <td style={{ padding: '14px 16px', color: '#52525B' }}>{l.contactPerson || 'N/A'}</td>
                  <td style={{ padding: '14px 16px', color: '#52525B' }}>{l.mobile || 'N/A'}</td>
                  <td style={{ padding: '14px 16px', color: '#52525B' }}>{l.email || 'N/A'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: l.isActive ? '#ECFDF5' : '#FEF2F2',
                      color: l.isActive ? '#059669' : '#DC2626',
                      padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700
                    }}>
                      {l.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE LENDER MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '500px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={22} color="#38BDF8" />
              Add External Lender / Institution
            </h2>

            <form onSubmit={handleCreateLender}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Lender Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Muthoot Finance Connaught Place"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Lender Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MUTH-DEL-01"
                  value={lenderCode}
                  onChange={(e) => setLenderCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Contact Person</label>
                <input
                  type="text"
                  placeholder="Manager / Agent Name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Mobile</label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Address</label>
                <input
                  type="text"
                  placeholder="Branch address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn" style={{ background: '#38BDF8', color: '#0F172A', fontWeight: 700 }}>
                  {isSubmitting ? 'Creating...' : 'Save Lender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
