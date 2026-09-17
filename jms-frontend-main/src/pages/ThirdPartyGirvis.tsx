import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  thirdPartyGirviApi,
  ThirdPartyGirvi,
  ThirdPartyGirviStatus,
  ThirdPartyLender,
  CreateThirdPartyGirviPayload,
  CreateThirdPartyCollateralInput,
} from '../api/thirdPartyGirvi';
import { customersApi, Customer } from '../api/customers';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import {
  ArrowLeftRight,
  Plus,
  Eye,
  CheckCircle2,
  Lock,
  Trash2,
} from 'lucide-react';

export const ThirdPartyGirvis: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loans, setLoans] = useState<ThirdPartyGirvi[]>([]);

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ThirdPartyGirviStatus | ''>('');
  const [lenderFilter, setLenderFilter] = useState<string>('');

  const [lenders, setLenders] = useState<ThirdPartyLender[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Action Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);
  const [selectedLoan, setSelectedLoan] = useState<ThirdPartyGirvi | null>(null);
  const [closureReason, setClosureReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [newCustomerId, setNewCustomerId] = useState<string>('');
  const [newLenderId, setNewLenderId] = useState<string>('');
  const [newExternalLoanNo, setNewExternalLoanNo] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newPrincipal, setNewPrincipal] = useState<number | ''>('');
  const [newValuation, setNewValuation] = useState<number | ''>('');
  const [newInterestRate, setNewInterestRate] = useState<number>(2.0);
  const [newNotes, setNewNotes] = useState<string>('');
  const [newDocumentRef, setNewDocumentRef] = useState<string>('');
  const [collaterals, setCollaterals] = useState<CreateThirdPartyCollateralInput[]>([
    { itemName: '', grossWeight: 0, stoneWeight: 0, netWeight: 0, valuedAmount: 0, metalType: 'GOLD', purity: '22K' },
  ]);

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toastId = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchDropdowns = async () => {
    try {
      const [lendersRes, customersRes] = await Promise.all([
        thirdPartyGirviApi.listLenders(user?.companyId, user?.branchId).catch(() => null),
        customersApi.list({ limit: 100 }).catch(() => null),
      ]);
      if (lendersRes?.success && Array.isArray(lendersRes.data)) {
        setLenders(lendersRes.data);
      }
      if (customersRes?.success && Array.isArray(customersRes.data)) {
        setCustomers(customersRes.data);
      }
    } catch (e) {
      console.warn('Error fetching dropdowns:', e);
    }
  };

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const res = await thirdPartyGirviApi.listThirdPartyLoans({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        thirdPartyLenderId: lenderFilter || undefined,
        companyId: user?.companyId,
      });

      if (res?.success && Array.isArray(res.data)) {
        setLoans(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load Third-Party Girvis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [page, search, statusFilter, lenderFilter]);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newLenderId || !newExternalLoanNo || !newDueDate || !newPrincipal || Number(newPrincipal) <= 0) {
      showToast('Please fill in required fields (Customer, Lender, External Loan #, Due Date, Principal)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateThirdPartyGirviPayload = {
        companyId: user?.companyId || '',
        branchId: user?.branchId || '',
        customerId: newCustomerId,
        thirdPartyLenderId: newLenderId,
        externalLoanNumber: newExternalLoanNo,
        dueDate: new Date(newDueDate).toISOString(),
        principalAmount: Number(newPrincipal),
        valuationAmount: newValuation ? Number(newValuation) : undefined,
        interestRate: Number(newInterestRate),
        notes: newNotes || undefined,
        documentRef: newDocumentRef || undefined,
        collaterals: collaterals.filter((c) => c.itemName && Number(c.grossWeight) > 0),
      };

      const res = await thirdPartyGirviApi.createThirdPartyGirvi(payload);
      if (res?.success) {
        showToast(`Third-Party Girvi ${res.data?.referenceNumber} created successfully!`, 'success');
        setIsCreateModalOpen(false);
        resetCreateForm();
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create Third-Party Girvi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setNewCustomerId('');
    setNewLenderId('');
    setNewExternalLoanNo('');
    setNewDueDate('');
    setNewPrincipal('');
    setNewValuation('');
    setNewInterestRate(2.0);
    setNewNotes('');
    setNewDocumentRef('');
    setCollaterals([{ itemName: '', grossWeight: 0, stoneWeight: 0, netWeight: 0, valuedAmount: 0, metalType: 'GOLD', purity: '22K' }]);
  };

  const handleApprove = async (loan: ThirdPartyGirvi) => {
    try {
      const res = await thirdPartyGirviApi.approveThirdPartyGirvi(loan.id);
      if (res?.success) {
        showToast(`Third-Party Girvi ${loan.referenceNumber} approved and activated!`, 'success');
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to approve', 'error');
    }
  };

  const handleCloseConfirm = async () => {
    if (!selectedLoan) return;
    setIsSubmitting(true);
    try {
      const res = await thirdPartyGirviApi.closeThirdPartyGirvi(selectedLoan.id, closureReason);
      if (res?.success) {
        showToast(`Third-Party Girvi ${selectedLoan.referenceNumber} closed & pledged collateral released!`, 'success');
        setIsCloseModalOpen(false);
        setSelectedLoan(null);
        setClosureReason('');
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to close loan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Visual Separation Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '16px 20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArrowLeftRight color="#38BDF8" size={24} />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC' }}>Third-Party Girvi Subsystem</h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px' }}>
              External lender re-pledge records. Kept strictly isolated from Self Girvi accounts and store receivables.
            </p>
          </div>
        </div>
        {hasPermission('third_party_girvi.create') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn"
            style={{ background: '#38BDF8', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.86rem' }}
          >
            <Plus size={16} />
            New Third-Party Girvi
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <SearchInput
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder="Search reference #, external loan #, customer..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as ThirdPartyGirviStatus | ''); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={lenderFilter}
            onChange={(e) => { setLenderFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
          >
            <option value="">All Lenders</option>
            {lenders.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : loans.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <ArrowLeftRight size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3F3F46' }}>No Third-Party Girvis Found</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E4E7', fontSize: '0.78rem', color: '#71717A', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>JMS Reference</th>
                  <th style={{ padding: '12px 16px' }}>External Loan #</th>
                  <th style={{ padding: '12px 16px' }}>Lender</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Principal</th>
                  <th style={{ padding: '12px 16px' }}>Valuation</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#38BDF8' }}>
                      <span onClick={() => navigate(`/girvi/third-party/${loan.id}`)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {loan.referenceNumber}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>{loan.externalLoanNumber}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{loan.lender?.name || 'N/A'}</td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName || ''}` : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>{formatCurrency(loan.principalAmount)}</td>
                    <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 600 }}>{formatCurrency(loan.valuationAmount)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: loan.status === 'ACTIVE' ? '#ECFDF5' : loan.status === 'CLOSED' ? '#E0F2FE' : '#F3F4F6',
                        color: loan.status === 'ACTIVE' ? '#059669' : loan.status === 'CLOSED' ? '#0284C7' : '#4B5563',
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700
                      }}>
                        {loan.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/girvi/third-party/${loan.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          <Eye size={14} />
                        </button>

                        {loan.status === 'DRAFT' && hasPermission('third_party_girvi.approve') && (
                          <button
                            onClick={() => handleApprove(loan)}
                            className="btn"
                            style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        )}

                        {loan.status === 'ACTIVE' && hasPermission('third_party_girvi.close') && (
                          <button
                            onClick={() => { setSelectedLoan(loan); setIsCloseModalOpen(true); }}
                            className="btn"
                            style={{ background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD', padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <Lock size={14} /> Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* CREATE THIRD-PARTY GIRVI MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '750px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeftRight size={22} color="#38BDF8" />
              Register Third-Party External Girvi
            </h2>

            <form onSubmit={handleCreateLoan}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Select Lender *</label>
                  <select
                    value={newLenderId}
                    onChange={(e) => setNewLenderId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  >
                    <option value="">-- Choose External Lender --</option>
                    {lenders.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>External Loan # *</label>
                  <input
                    type="text"
                    placeholder="e.g. MUTH-2026-99001"
                    value={newExternalLoanNo}
                    onChange={(e) => setNewExternalLoanNo(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Customer *</label>
                  <select
                    value={newCustomerId}
                    onChange={(e) => setNewCustomerId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''} ({c.mobile})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Due Date *</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Principal Amount (₹) *</label>
                  <input
                    type="number"
                    value={newPrincipal}
                    onChange={(e) => setNewPrincipal(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder="e.g. 100000"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Valuation Amount (₹)</label>
                  <input
                    type="number"
                    value={newValuation}
                    onChange={(e) => setNewValuation(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 130000"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn" style={{ background: '#38BDF8', color: '#0F172A', fontWeight: 700 }}>
                  {isSubmitting ? 'Creating...' : 'Create Third-Party Girvi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE THIRD-PARTY GIRVI MODAL */}
      {isCloseModalOpen && selectedLoan && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181B', marginBottom: '10px' }}>
              Close Third-Party Girvi {selectedLoan.referenceNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '16px' }}>
              Closing this external loan will mark it CLOSED and release pledged collateral items.
            </p>
            <input
              type="text"
              placeholder="Closure remarks..."
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsCloseModalOpen(false)} className="btn btn-secondary">Close</button>
              <button onClick={handleCloseConfirm} disabled={isSubmitting} className="btn" style={{ background: '#0284C7', color: '#FFFFFF' }}>
                {isSubmitting ? 'Closing...' : 'Confirm Closure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
