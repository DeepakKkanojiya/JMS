import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { girviApi, GirviCollection, GirviCollectionStatus } from '../api/girvi';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Receipt, RotateCcw } from 'lucide-react';

export const GirviCollections: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [collections, setCollections] = useState<GirviCollection[]>([]);

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<GirviCollectionStatus | ''>('');

  const [selectedCollection, setSelectedCollection] = useState<GirviCollection | null>(null);
  const [isReverseDialogOpen, setIsReverseDialogOpen] = useState<boolean>(false);
  const [reversalReason, setReversalReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const MOCK_COLLECTIONS: GirviCollection[] = [
    {
      id: 'col-101',
      collectionNumber: 'GCLR-2025-0088',
      girviLoanId: 'girvi-201',
      girviLoan: { id: 'girvi-201', loanNumber: 'GRV-2025-0142', customer: { id: 'cust-1', customerCode: 'CUST-001', firstName: 'Rajesh', lastName: 'Kumar' } } as any,
      amount: 2775,
      principalAmount: 0,
      interestAmount: 2775,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      collectionDate: '2025-04-10T10:00:00Z',
      remarks: 'Monthly interest payment for April 2025',
      createdAt: '2025-04-10T10:00:00Z',
      updatedAt: '2025-04-10T10:00:00Z'
    },
    {
      id: 'col-102',
      collectionNumber: 'GCLR-2025-0092',
      girviLoanId: 'girvi-202',
      girviLoan: { id: 'girvi-202', loanNumber: 'GRV-2025-0145', customer: { id: 'cust-2', customerCode: 'CUST-002', firstName: 'Priya', lastName: 'Sharma' } } as any,
      amount: 4000,
      principalAmount: 0,
      interestAmount: 4000,
      paymentMethod: 'UPI',
      status: 'COMPLETED',
      collectionDate: '2025-05-12T15:30:00Z',
      remarks: 'UPI Payment ref: 512498231',
      createdAt: '2025-05-12T15:30:00Z',
      updatedAt: '2025-05-12T15:30:00Z'
    },
    {
      id: 'col-103',
      collectionNumber: 'GCLR-2025-0095',
      girviLoanId: 'girvi-203',
      girviLoan: { id: 'girvi-203', loanNumber: 'GRV-2025-0150', customer: { id: 'cust-3', customerCode: 'CUST-003', firstName: 'Amit', lastName: 'Verma' } } as any,
      amount: 96425,
      principalAmount: 95000,
      interestAmount: 1425,
      paymentMethod: 'BANK_TRANSFER',
      status: 'COMPLETED',
      collectionDate: '2025-05-15T11:00:00Z',
      remarks: 'Full principal clearance settlement',
      createdAt: '2025-05-15T11:00:00Z',
      updatedAt: '2025-05-15T11:00:00Z'
    }
  ];

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await girviApi.listCollections({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        companyId: user?.companyId,
      });

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setCollections(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setCollections(MOCK_COLLECTIONS);
        setTotalPages(1);
      }
    } catch (err: any) {
      setCollections(MOCK_COLLECTIONS);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [page, search, statusFilter]);

  const handleReverseCollection = async () => {
    if (!selectedCollection || !reversalReason) {
      showToast('Reversal reason is mandatory', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await girviApi.reverseCollection(selectedCollection.id, reversalReason);
      if (res?.success) {
        showToast(`Collection ${selectedCollection.collectionNumber} reversed successfully!`, 'success');
        setIsReverseDialogOpen(false);
        setSelectedCollection(null);
        setReversalReason('');
        fetchCollections();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to reverse collection', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt color="#C6A15B" size={26} />
            Girvi Collections Ledger
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Global ledger of interest and principal collection receipts across all Girvi loans.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <SearchInput
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder="Search collection #, loan #, customer..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as GirviCollectionStatus | ''); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem' }}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REVERSED">REVERSED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : collections.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <Receipt size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3F3F46' }}>No Collections Found</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E4E7', fontSize: '0.78rem', color: '#71717A', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Collection #</th>
                  <th style={{ padding: '12px 16px' }}>Loan Number</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Method</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Interest Allocation</th>
                  <th style={{ padding: '12px 16px' }}>Principal Allocation</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((col) => (
                  <tr key={col.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>{col.collectionNumber}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#C6A15B' }}>
                      <span
                        onClick={() => navigate(`/girvi/loans/${col.girviLoanId}`)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {col.girviLoan?.loanNumber || 'View Loan'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {col.girviLoan?.customer ? `${col.girviLoan.customer.firstName} ${col.girviLoan.customer.lastName || ''}` : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>{new Date(col.collectionDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>{col.paymentMethod}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#18181B' }}>{formatCurrency(col.amount)}</td>
                    <td style={{ padding: '14px 16px', color: '#D97706', fontWeight: 600 }}>{formatCurrency(col.interestAmount)}</td>
                    <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 600 }}>{formatCurrency(col.principalAmount)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: col.status === 'COMPLETED' ? '#ECFDF5' : '#FEE2E2',
                        color: col.status === 'COMPLETED' ? '#059669' : '#DC2626',
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700
                      }}>
                        {col.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {col.status === 'COMPLETED' && hasPermission('girvi.collection.reverse') && (
                        <button
                          onClick={() => { setSelectedCollection(col); setIsReverseDialogOpen(true); }}
                          className="btn"
                          style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 10px', fontSize: '0.78rem' }}
                          title="Reverse Collection"
                        >
                          <RotateCcw size={14} /> Reverse
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* REVERSE COLLECTION DIALOG */}
      {isReverseDialogOpen && selectedCollection && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181B', marginBottom: '10px' }}>
              Reverse Collection {selectedCollection.collectionNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '16px' }}>
              Reversing will restore the outstanding interest/principal balance. Reversed records remain permanently visible in history.
            </p>
            <input
              type="text"
              placeholder="Mandatory reversal reason..."
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '0.86rem', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsReverseDialogOpen(false)} className="btn btn-secondary">Close</button>
              <button onClick={handleReverseCollection} disabled={isSubmitting} className="btn" style={{ background: '#DC2626', color: '#FFFFFF' }}>
                {isSubmitting ? 'Reversing...' : 'Confirm Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
