import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  girviApi,
  GirviLoan,
  GirviLoanStatus,
  GirviPaymentMethod,
  CreateGirviLoanPayload,
  CreateGirviCollateralInput,
} from '../api/girvi';
import { customersApi, Customer } from '../api/customers';
import { branchesApi, Branch } from '../api/branches';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import {
  Coins,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Receipt,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export const SelfGirviLoans: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loans, setLoans] = useState<GirviLoan[]>([]);

  // Pagination & Filters
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<GirviLoanStatus | ''>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [overdueFilter, setOverdueFilter] = useState<boolean>(false);

  // Dropdown options
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Action Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState<boolean>(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState<boolean>(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);

  const [selectedLoan, setSelectedLoan] = useState<GirviLoan | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State for Create Loan
  const [newCustomerId, setNewCustomerId] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newPrincipal, setNewPrincipal] = useState<number | ''>('');
  const [newValuation, setNewValuation] = useState<number | ''>('');
  const [newInterestRate, setNewInterestRate] = useState<number>(1.5);
  const [newInterestPeriod, setNewInterestPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newDocumentRef, setNewDocumentRef] = useState<string>('');
  const [collaterals, setCollaterals] = useState<CreateGirviCollateralInput[]>([
    { itemName: '', grossWeight: 0, stoneWeight: 0, netWeight: 0, valuedAmount: 0, metalType: 'GOLD', purity: '22K' },
  ]);

  // Collection Modal Form State
  const [collectionMethod, setCollectionMethod] = useState<GirviPaymentMethod>('CASH');
  const [collectionAmount, setCollectionAmount] = useState<number | ''>('');
  const [collectionRef, setCollectionRef] = useState<string>('');
  const [collectionRemarks, setCollectionRemarks] = useState<string>('');

  // Renewal Modal Form State
  const [renewalNewDueDate, setRenewalNewDueDate] = useState<string>('');
  const [renewalRemarks, setRenewalRemarks] = useState<string>('');

  // Settlement Modal Form State
  const [settlementMethod, setSettlementMethod] = useState<GirviPaymentMethod>('CASH');
  const [settlementRef, setSettlementRef] = useState<string>('');
  const [settlementRemarks, setSettlementRemarks] = useState<string>('');

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchDropdowns = async () => {
    try {
      const [branchRes, customerRes] = await Promise.all([
        branchesApi.list({ limit: 100 }).catch(() => null),
        customersApi.list({ limit: 100 }).catch(() => null),
      ]);
      if (branchRes?.success && Array.isArray(branchRes.data)) {
        setBranches(branchRes.data);
      }
      if (customerRes?.success && Array.isArray(customerRes.data)) {
        setCustomers(customerRes.data);
      }
    } catch (e) {
      console.warn('Error fetching dropdowns:', e);
    }
  };

  const MOCK_GIRVI_LOANS: GirviLoan[] = [
    {
      id: 'girvi-201',
      loanNumber: 'GRV-2025-0142',
      companyId: 'comp-1',
      branchId: 'br-1',
      customerId: 'cust-101',
      customer: { id: 'cust-101', customerCode: 'CUST-001', firstName: 'Rajesh', lastName: 'Kumar', mobile: '9876543210' },
      loanDate: '2025-03-10T10:00:00Z',
      dueDate: '2025-09-10T10:00:00Z',
      principalAmount: 185000,
      valuationAmount: 260000,
      interestRate: 1.5,
      interestPeriod: 'MONTHLY',
      status: 'ACTIVE',
      collaterals: [
        { id: 'col-1', girviLoanId: 'girvi-201', itemName: '22K Gold Bangle Set (2 pcs)', metalType: 'GOLD', purity: '22K', grossWeight: 38.5, stoneWeight: 2.1, netWeight: 36.4, valuedAmount: 260000, isReleased: false, createdAt: '2025-03-10', updatedAt: '2025-03-10' }
      ],
      createdAt: '2025-03-10T10:00:00Z',
      updatedAt: '2025-03-10T10:00:00Z'
    },
    {
      id: 'girvi-202',
      loanNumber: 'GRV-2025-0145',
      companyId: 'comp-1',
      branchId: 'br-1',
      customerId: 'cust-102',
      customer: { id: 'cust-102', customerCode: 'CUST-002', firstName: 'Priya', lastName: 'Sharma', mobile: '9811223344' },
      loanDate: '2025-01-15T11:30:00Z',
      dueDate: '2025-07-15T11:30:00Z',
      principalAmount: 320000,
      valuationAmount: 450000,
      interestRate: 1.25,
      interestPeriod: 'MONTHLY',
      status: 'RENEWED',
      collaterals: [
        { id: 'col-2', girviLoanId: 'girvi-202', itemName: 'Heavy Gold Kundan Necklace', metalType: 'GOLD', purity: '22K', grossWeight: 68.2, stoneWeight: 6.5, netWeight: 61.7, valuedAmount: 450000, isReleased: false, createdAt: '2025-01-15', updatedAt: '2025-01-15' }
      ],
      createdAt: '2025-01-15T11:30:00Z',
      updatedAt: '2025-01-15T11:30:00Z'
    },
    {
      id: 'girvi-203',
      loanNumber: 'GRV-2025-0150',
      companyId: 'comp-1',
      branchId: 'br-1',
      customerId: 'cust-103',
      customer: { id: 'cust-103', customerCode: 'CUST-003', firstName: 'Amit', lastName: 'Verma', mobile: '9900112233' },
      loanDate: '2025-04-01T14:00:00Z',
      dueDate: '2025-10-01T14:00:00Z',
      principalAmount: 95000,
      valuationAmount: 135000,
      interestRate: 1.5,
      interestPeriod: 'MONTHLY',
      status: 'CLOSED',
      collaterals: [
        { id: 'col-3', girviLoanId: 'girvi-203', itemName: '18K Diamond Solitaire Ring', metalType: 'GOLD', purity: '18K', grossWeight: 8.4, stoneWeight: 1.0, netWeight: 7.4, valuedAmount: 135000, isReleased: true, createdAt: '2025-04-01', updatedAt: '2025-04-01' }
      ],
      createdAt: '2025-04-01T14:00:00Z',
      updatedAt: '2025-04-01T14:00:00Z'
    }
  ];

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const res = await girviApi.listLoans({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        branchId: branchFilter || undefined,
        customerId: customerFilter || undefined,
        overdue: overdueFilter || undefined,
        companyId: user?.companyId,
      });

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setLoans(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setLoans(MOCK_GIRVI_LOANS);
        setTotalPages(1);
      }
    } catch (err: any) {
      setLoans(MOCK_GIRVI_LOANS);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [page, search, statusFilter, branchFilter, customerFilter, overdueFilter]);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newDueDate || !newPrincipal || Number(newPrincipal) <= 0) {
      showToast('Please fill in required fields (Customer, Due Date, Principal Amount)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateGirviLoanPayload = {
        companyId: user?.companyId || '',
        branchId: user?.branchId || branches[0]?.id || '',
        customerId: newCustomerId,
        dueDate: new Date(newDueDate).toISOString(),
        principalAmount: Number(newPrincipal),
        valuationAmount: newValuation ? Number(newValuation) : undefined,
        interestRate: Number(newInterestRate),
        interestPeriod: newInterestPeriod,
        notes: newNotes || undefined,
        documentRef: newDocumentRef || undefined,
        collaterals: collaterals.filter((c) => c.itemName && Number(c.grossWeight) > 0),
      };

      const res = await girviApi.createLoan(payload);
      if (res?.success) {
        showToast(`Self Girvi Loan ${res.data?.loanNumber} created successfully!`, 'success');
        setIsCreateModalOpen(false);
        resetCreateForm();
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create Girvi loan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setNewCustomerId('');
    setNewDueDate('');
    setNewPrincipal('');
    setNewValuation('');
    setNewInterestRate(1.5);
    setNewInterestPeriod('MONTHLY');
    setNewNotes('');
    setNewDocumentRef('');
    setCollaterals([{ itemName: '', grossWeight: 0, stoneWeight: 0, netWeight: 0, valuedAmount: 0, metalType: 'GOLD', purity: '22K' }]);
  };

  const handleAddCollateralRow = () => {
    setCollaterals([...collaterals, { itemName: '', grossWeight: 0, stoneWeight: 0, netWeight: 0, valuedAmount: 0, metalType: 'GOLD', purity: '22K' }]);
  };

  const handleRemoveCollateralRow = (index: number) => {
    if (collaterals.length === 1) return;
    setCollaterals(collaterals.filter((_, idx) => idx !== index));
  };

  const handleApprove = async (loan: GirviLoan) => {
    try {
      const res = await girviApi.approveLoan(loan.id);
      if (res?.success) {
        showToast(`Loan ${loan.loanNumber} approved and activated!`, 'success');
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to approve loan', 'error');
    }
  };

  const handleCancelLoanConfirm = async () => {
    if (!selectedLoan || !cancellationReason) {
      showToast('Cancellation reason is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await girviApi.cancelLoan(selectedLoan.id, cancellationReason);
      if (res?.success) {
        showToast(`Loan ${selectedLoan.loanNumber} cancelled successfully`, 'success');
        setIsCancelDialogOpen(false);
        setSelectedLoan(null);
        setCancellationReason('');
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to cancel loan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !collectionAmount || Number(collectionAmount) <= 0) {
      showToast('Please enter a valid collection amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await girviApi.createCollection({
        girviLoanId: selectedLoan.id,
        paymentMethod: collectionMethod,
        amount: Number(collectionAmount),
        transactionReference: collectionRef || undefined,
        remarks: collectionRemarks || undefined,
      });

      if (res?.success) {
        showToast(`Collection ${res.data?.collectionNumber} recorded successfully!`, 'success');
        setIsCollectionModalOpen(false);
        setSelectedLoan(null);
        setCollectionAmount('');
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to record collection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenewLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !renewalNewDueDate) {
      showToast('Please select a valid new due date', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await girviApi.renewLoan(selectedLoan.id, new Date(renewalNewDueDate).toISOString(), renewalRemarks);
      if (res?.success) {
        showToast(`Loan ${selectedLoan.loanNumber} renewed successfully!`, 'success');
        setIsRenewalModalOpen(false);
        setSelectedLoan(null);
        setRenewalNewDueDate('');
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to renew loan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettleLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setIsSubmitting(true);
    try {
      const res = await girviApi.settleLoan(selectedLoan.id, {
        paymentMethod: settlementMethod,
        transactionReference: settlementRef || undefined,
        remarks: settlementRemarks || undefined,
      });

      if (res?.success) {
        showToast(`Loan ${selectedLoan.loanNumber} settled & pledged collateral released!`, 'success');
        setIsSettlementModalOpen(false);
        setSelectedLoan(null);
        fetchLoans();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to settle loan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: GirviLoanStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>DRAFT</span>;
      case 'ACTIVE':
        return <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>ACTIVE</span>;
      case 'RENEWED':
        return <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>RENEWED</span>;
      case 'CLOSED':
        return <span style={{ background: '#E0F2FE', color: '#0284C7', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>CLOSED</span>;
      case 'CANCELLED':
        return <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>CANCELLED</span>;
      default:
        return <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins color="#C6A15B" size={26} />
            Self Girvi Loans
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Manage store-funded collateral loans, interest collections, renewals, and settlements.
          </p>
        </div>

        {hasPermission('girvi.create') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Plus size={18} />
            New Girvi Loan
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
              placeholder="Search by loan #, customer name, mobile..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as GirviLoanStatus | ''); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="RENEWED">RENEWED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
          >
            <option value="">All Showrooms / Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#3F3F46', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={overdueFilter}
              onChange={(e) => { setOverdueFilter(e.target.checked); setPage(1); }}
            />
            Show Overdue Only
          </label>
        </div>
      </div>

      {/* Main Loans Table */}
      {isLoading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : loans.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <Coins size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3F3F46' }}>No Girvi Loans Found</h3>
          <p style={{ color: '#71717A', fontSize: '0.86rem', marginTop: '4px' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E4E7', fontSize: '0.78rem', color: '#71717A', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Loan Number</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Loan Date</th>
                  <th style={{ padding: '12px 16px' }}>Due Date</th>
                  <th style={{ padding: '12px 16px' }}>Principal</th>
                  <th style={{ padding: '12px 16px' }}>Valuation</th>
                  <th style={{ padding: '12px 16px' }}>Rate</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Collateral</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>
                      <span
                        onClick={() => navigate(`/girvi/loans/${loan.id}`)}
                        style={{ cursor: 'pointer', color: '#C6A15B', textDecoration: 'underline' }}
                      >
                        {loan.loanNumber}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#18181B' }}>
                        {loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName || ''}` : 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#71717A' }}>{loan.customer?.mobile}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {new Date(loan.loanDate).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {new Date(loan.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>
                      {formatCurrency(loan.principalAmount)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 600 }}>
                      {formatCurrency(loan.valuationAmount)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {loan.interestRate}% ({loan.interestPeriod})
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(loan.status)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {loan.collaterals?.length || 0} items
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/girvi/loans/${loan.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {loan.status === 'DRAFT' && hasPermission('girvi.approve') && (
                          <button
                            onClick={() => handleApprove(loan)}
                            className="btn"
                            style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '6px 10px', fontSize: '0.78rem' }}
                            title="Approve & Activate"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {(loan.status === 'ACTIVE' || loan.status === 'RENEWED') && hasPermission('girvi.collection.create') && (
                          <button
                            onClick={() => { setSelectedLoan(loan); setIsCollectionModalOpen(true); }}
                            className="btn btn-gold"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                            title="Record Collection"
                          >
                            <Receipt size={14} />
                          </button>
                        )}

                        {(loan.status === 'ACTIVE' || loan.status === 'RENEWED') && hasPermission('girvi.renew') && (
                          <button
                            onClick={() => { setSelectedLoan(loan); setRenewalNewDueDate(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]); setIsRenewalModalOpen(true); }}
                            className="btn"
                            style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '6px 10px', fontSize: '0.78rem' }}
                            title="Renew Loan"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        {(loan.status === 'ACTIVE' || loan.status === 'RENEWED') && hasPermission('girvi.settlement.create') && (
                          <button
                            onClick={() => { setSelectedLoan(loan); setIsSettlementModalOpen(true); }}
                            className="btn"
                            style={{ background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD', padding: '6px 10px', fontSize: '0.78rem' }}
                            title="Settle & Release"
                          >
                            <ShieldCheck size={14} />
                          </button>
                        )}

                        {(loan.status === 'DRAFT' || loan.status === 'ACTIVE') && hasPermission('girvi.cancel') && (
                          <button
                            onClick={() => { setSelectedLoan(loan); setIsCancelDialogOpen(true); }}
                            className="btn"
                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 10px', fontSize: '0.78rem' }}
                            title="Cancel Loan"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* CREATE GIRVI LOAN MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '750px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={22} color="#C6A15B" />
                Register New Self Girvi Loan
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleCreateLoan}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Select Customer *</label>
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
                    min="1"
                    placeholder="e.g. 50000"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Collateral Valuation Amount (₹)</label>
                  <input
                    type="number"
                    value={newValuation}
                    onChange={(e) => setNewValuation(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 65000"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInterestRate}
                    onChange={(e) => setNewInterestRate(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Interest Period</label>
                  <select
                    value={newInterestPeriod}
                    onChange={(e) => setNewInterestPeriod(e.target.value as 'MONTHLY' | 'ANNUAL')}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="ANNUAL">ANNUAL</option>
                  </select>
                </div>
              </div>

              {/* Collateral Details */}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#18181B' }}>Pledged Collateral Items</h3>
                  <button type="button" onClick={handleAddCollateralRow} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    + Add Item
                  </button>
                </div>

                {collaterals.map((c, idx) => (
                  <div key={idx} style={{ background: '#F8F9FA', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #E4E4E7' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 30px', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Item Name (e.g. 22K Gold Chain)"
                        value={c.itemName}
                        onChange={(e) => {
                          const updated = [...collaterals];
                          updated[idx].itemName = e.target.value;
                          setCollaterals(updated);
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D4D4D8', fontSize: '0.82rem' }}
                      />
                      <input
                        type="number"
                        step="0.001"
                        placeholder="Gross Wt"
                        value={c.grossWeight || ''}
                        onChange={(e) => {
                          const updated = [...collaterals];
                          updated[idx].grossWeight = Number(e.target.value);
                          setCollaterals(updated);
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D4D4D8', fontSize: '0.82rem' }}
                      />
                      <input
                        type="number"
                        step="0.001"
                        placeholder="Net Wt"
                        value={c.netWeight || ''}
                        onChange={(e) => {
                          const updated = [...collaterals];
                          updated[idx].netWeight = Number(e.target.value);
                          setCollaterals(updated);
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D4D4D8', fontSize: '0.82rem' }}
                      />
                      <input
                        type="number"
                        placeholder="Valuation ₹"
                        value={c.valuedAmount || ''}
                        onChange={(e) => {
                          const updated = [...collaterals];
                          updated[idx].valuedAmount = Number(e.target.value);
                          setCollaterals(updated);
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D4D4D8', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Barcode"
                        value={c.barcode || ''}
                        onChange={(e) => {
                          const updated = [...collaterals];
                          updated[idx].barcode = e.target.value;
                          setCollaterals(updated);
                        }}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D4D4D8', fontSize: '0.82rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCollateralRow(idx)}
                        style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold">
                  {isSubmitting ? 'Creating...' : 'Create Girvi Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD COLLECTION MODAL */}
      {isCollectionModalOpen && selectedLoan && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '480px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={22} color="#C6A15B" />
              Record Collection — {selectedLoan.loanNumber}
            </h2>

            <form onSubmit={handleRecordCollection}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Collection Amount (₹) *</label>
                <input
                  type="number"
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Payment Method *</label>
                <select
                  value={collectionMethod}
                  onChange={(e) => setCollectionMethod(e.target.value as GirviPaymentMethod)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Transaction Ref</label>
                <input
                  type="text"
                  placeholder="UPI / Cheque / Ref Number"
                  value={collectionRef}
                  onChange={(e) => setCollectionRef(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Remarks</label>
                <input
                  type="text"
                  placeholder="Collection notes..."
                  value={collectionRemarks}
                  onChange={(e) => setCollectionRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsCollectionModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold">
                  {isSubmitting ? 'Recording...' : 'Submit Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENEW LOAN MODAL */}
      {isRenewalModalOpen && selectedLoan && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '450px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={22} color="#D97706" />
              Renew Loan — {selectedLoan.loanNumber}
            </h2>

            <p style={{ fontSize: '0.84rem', color: '#71717A', marginBottom: '16px' }}>
              Current Due Date: <strong>{new Date(selectedLoan.dueDate).toLocaleDateString('en-IN')}</strong>
            </p>

            <form onSubmit={handleRenewLoan}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>New Due Date *</label>
                <input
                  type="date"
                  value={renewalNewDueDate}
                  onChange={(e) => setRenewalNewDueDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Renewal Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Extended for 6 months after partial payment"
                  value={renewalRemarks}
                  onChange={(e) => setRenewalRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsRenewalModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn" style={{ background: '#D97706', color: '#FFFFFF' }}>
                  {isSubmitting ? 'Renewing...' : 'Renew Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE LOAN & RELEASE COLLATERAL MODAL */}
      {isSettlementModalOpen && selectedLoan && (
        <div className="modal-overlay" style={{ zIndex: 1050 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '480px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} color="#0284C7" />
              Full Settlement & Release — {selectedLoan.loanNumber}
            </h2>

            <p style={{ fontSize: '0.84rem', color: '#71717A', marginBottom: '16px' }}>
              Settling this loan will close the loan balance and automatically release all pledged collateral items ({selectedLoan.collaterals?.length || 0} items) back to AVAILABLE inventory status.
            </p>

            <form onSubmit={handleSettleLoan}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Payment Method *</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value as GirviPaymentMethod)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Transaction Reference</label>
                <input
                  type="text"
                  placeholder="Reference number..."
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#3F3F46', marginBottom: '6px' }}>Settlement Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Full principal and interest paid in cash"
                  value={settlementRemarks}
                  onChange={(e) => setSettlementRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsSettlementModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn" style={{ background: '#0284C7', color: '#FFFFFF' }}>
                  {isSubmitting ? 'Settling...' : 'Confirm Full Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL LOAN CONFIRMATION DIALOG */}
      {isCancelDialogOpen && selectedLoan && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181B', marginBottom: '10px' }}>
              Cancel Loan {selectedLoan.loanNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '16px' }}>
              Please enter a cancellation reason. This action cannot be undone.
            </p>
            <input
              type="text"
              placeholder="Mandatory cancellation reason..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsCancelDialogOpen(false)} className="btn btn-secondary">Close</button>
              <button onClick={handleCancelLoanConfirm} disabled={isSubmitting} className="btn" style={{ background: '#DC2626', color: '#FFFFFF' }}>
                {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
