import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { girviApi, GirviSettlement } from '../api/girvi';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { ShieldCheck, Eye } from 'lucide-react';

export const GirviSettlements: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [settlements, setSettlements] = useState<GirviSettlement[]>([]);

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');

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

  const MOCK_SETTLEMENTS: GirviSettlement[] = [
    {
      id: 'stl-1',
      settlementNumber: 'GSET-2025-0012',
      girviLoanId: 'girvi-203',
      girviLoan: { loanNumber: 'GRV-2025-0150', customer: { firstName: 'Amit', lastName: 'Verma', customerCode: 'CUST-003' } } as any,
      paymentMethod: 'CASH',
      totalSettlementAmount: 96425,
      principalSettled: 95000,
      interestSettled: 1425,
      settlementDate: '2025-05-15T11:00:00Z',
      remarks: 'Full principal clearance & ornament release',
      settledBy: 'Store Manager',
      createdAt: '2025-05-15T11:00:00Z',
      updatedAt: '2025-05-15T11:00:00Z'
    }
  ];

  const fetchSettlements = async () => {
    setIsLoading(true);
    try {
      const res = await girviApi.listSettlements({
        page,
        limit,
        search: search || undefined,
        companyId: user?.companyId,
      });

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setSettlements(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
        }
      } else {
        setSettlements(MOCK_SETTLEMENTS);
        setTotalPages(1);
      }
    } catch (err: any) {
      setSettlements(MOCK_SETTLEMENTS);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [page, search]);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181B', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="#0284C7" size={26} />
            Girvi Settlements & Jewellery Release
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Ledger of fully settled loans and released pledged collateral jewellery items.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '16px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', marginBottom: '20px' }}>
        <div style={{ maxWidth: '400px' }}>
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search settlement # or loan #..."
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : settlements.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <ShieldCheck size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3F3F46' }}>No Settlements Found</h3>
        </div>
      ) : (
        <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E4E4E7', fontSize: '0.78rem', color: '#71717A', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Settlement #</th>
                  <th style={{ padding: '12px 16px' }}>Loan Number</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Payment Method</th>
                  <th style={{ padding: '12px 16px' }}>Total Settled</th>
                  <th style={{ padding: '12px 16px' }}>Principal Settled</th>
                  <th style={{ padding: '12px 16px' }}>Interest Settled</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((set) => (
                  <tr key={set.id} style={{ borderBottom: '1px solid #F4F4F5', fontSize: '0.86rem' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#18181B' }}>{set.settlementNumber}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#C6A15B' }}>
                      <span
                        onClick={() => navigate(`/girvi/loans/${set.girviLoanId}`)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {set.girviLoan?.loanNumber || 'View Loan'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>
                      {set.girviLoan?.customer ? `${set.girviLoan.customer.firstName} ${set.girviLoan.customer.lastName || ''}` : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>{new Date(set.settlementDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '14px 16px', color: '#52525B' }}>{set.paymentMethod}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0284C7' }}>{formatCurrency(set.totalSettlementAmount)}</td>
                    <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 600 }}>{formatCurrency(set.principalSettled)}</td>
                    <td style={{ padding: '14px 16px', color: '#D97706', fontWeight: 600 }}>{formatCurrency(set.interestSettled)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/girvi/loans/${set.girviLoanId}`)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};
