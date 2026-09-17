import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { thirdPartyGirviApi, ThirdPartyGirvi } from '../api/thirdPartyGirvi';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { ArrowLeft } from 'lucide-react';

export const ThirdPartyGirviDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loan, setLoan] = useState<ThirdPartyGirvi | null>(null);

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

  const fetchLoanData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await thirdPartyGirviApi.getThirdPartyGirviById(id);
      if (res?.success && res?.data) {
        setLoan(res.data);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}><SkeletonLoader type="detail" /></div>;
  }

  if (!loan) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Third-Party Girvi Not Found</h2>
        <button onClick={() => navigate('/girvi/third-party')} className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Third-Party List</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      <button
        onClick={() => navigate('/girvi/third-party')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Third-Party Loans
      </button>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC' }}>
                Ref: {loan.referenceNumber}
              </h1>
              <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                {loan.status}
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.86rem', marginTop: '6px' }}>
              External Lender Loan Number: <strong>{loan.externalLoanNumber}</strong> ({loan.lender?.name})
            </p>
          </div>
          <button onClick={() => navigate('/girvi/third-party')} className="btn btn-secondary">
            Close View
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Loan Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>External Lender:</span>
              <span style={{ fontWeight: 700, color: '#38BDF8' }}>{loan.lender?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Principal Amount:</span>
              <span style={{ fontWeight: 700, color: '#18181B' }}>{formatCurrency(loan.principalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Valuation Amount:</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(loan.valuationAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Interest Rate:</span>
              <span style={{ fontWeight: 700, color: '#18181B' }}>{loan.interestRate}% ({loan.interestPeriod})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Due Date:</span>
              <span style={{ fontWeight: 600, color: '#DC2626' }}>{new Date(loan.dueDate).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '16px' }}>Customer Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Customer Code:</span>
              <span style={{ fontWeight: 700, color: '#18181B' }}>{loan.customer?.customerCode || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Full Name:</span>
              <span style={{ fontWeight: 700, color: '#18181B' }}>{loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName || ''}` : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717A' }}>Mobile Number:</span>
              <span style={{ fontWeight: 600, color: '#18181B' }}>{loan.customer?.mobile}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
