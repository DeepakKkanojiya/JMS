import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  approvalApi,
  ApprovalSlip,
  ApprovalAuditTrailReport,
  ApprovalDepositSummaryResponse,
} from '../api/approval';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  BadgeCheck,
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Clock,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data
  const [approval, setApproval] = useState<ApprovalSlip | null>(null);
  const [depositSummary, setDepositSummary] = useState<ApprovalDepositSummaryResponse | null>(null);
  const [auditTrail, setAuditTrail] = useState<ApprovalAuditTrailReport | null>(null);

  // Active Tab State: overview | items | deposits | customer | invoice | audit
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'deposits' | 'customer' | 'invoice' | 'audit'>('overview');

  // Modal & Workflow States
  const [isIssueConfirmOpen, setIsIssueConfirmOpen] = useState<boolean>(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState<boolean>(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  // Action Inputs
  const [returnReason, setReturnReason] = useState<string>('');
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number | string>('');
  const [depositMethod, setDepositMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');
  const [depositTxRef, setDepositTxRef] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string | Date): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [appRes, summaryRes, auditRes] = await Promise.all([
        approvalApi.getById(id).catch(() => null),
        approvalApi.getDepositSummary(id).catch(() => null),
        approvalApi.getAuditTrail(id).catch(() => null),
      ]);

      if (appRes?.success && appRes?.data) {
        setApproval(appRes.data);
      } else {
        setError('Approval slip not found or access denied.');
      }

      if (summaryRes?.success && summaryRes?.data) {
        setDepositSummary(summaryRes.data);
      }

      if (auditRes?.success && auditRes?.data) {
        setAuditTrail(auditRes.data);
      }
    } catch (err: any) {
      console.error('Error fetching approval detail:', err);
      setError(err?.response?.data?.message || 'Failed to load approval slip details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle Issue Approval Action
  const handleIssueApproval = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const res = await approvalApi.issue(id);
      if (res?.success) {
        setIsIssueConfirmOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to issue approval slip.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error issuing approval slip.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Cancel Approval Action
  const handleCancelApproval = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const res = await approvalApi.cancel(id);
      if (res?.success) {
        setIsCancelConfirmOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to cancel approval slip.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error cancelling approval slip.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Record Deposit Action
  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !depositAmount || Number(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await approvalApi.createDeposit(id, {
        paymentMethod: depositMethod,
        amount: Number(depositAmount),
        transactionReference: depositTxRef.trim() || undefined,
      });

      if (res?.success) {
        setIsDepositModalOpen(false);
        setDepositAmount('');
        setDepositTxRef('');
        fetchData();
      } else {
        alert(res?.message || 'Failed to record security deposit.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error recording security deposit.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Return Approval Action
  const handleReturnApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsActionLoading(true);
    try {
      const res = await approvalApi.returnApproval(id, { returnReason });
      if (res?.success) {
        setIsReturnModalOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to return approval items.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error processing jewellery return.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Purchase Approval Action
  const handlePurchaseApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsActionLoading(true);
    try {
      const res = await approvalApi.purchaseApproval(id, { notes: purchaseNotes });
      if (res?.success) {
        setIsPurchaseModalOpen(false);
        fetchData();
      } else {
        alert(res?.message || 'Failed to convert approval into purchase.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error confirming purchase.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <SkeletonLoader type="detail" rows={6} />
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          {error || 'Approval slip not found.'}
        </div>
        <button onClick={() => navigate('/approvals/register')} className="btn btn-gold">
          Return to Approval Register
        </button>
      </div>
    );
  }

  const isDraft = approval.status === 'DRAFT';
  const isActiveWithCustomer = approval.status === 'ISSUED' || approval.status === 'WITH_CUSTOMER';
  const isReturned = approval.status === 'RETURNED';
  const isPurchased = approval.status === 'PURCHASED';

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Navigation & Header */}
      <button
        onClick={() => navigate('/approvals/register')}
        style={{ background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Register
      </button>

      {/* Header Info Banner */}
      <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '1px solid #E4E4E7', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {approval.approvalNumber}
              </h1>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  background:
                    approval.status === 'PURCHASED'
                      ? '#DCFCE7'
                      : approval.status === 'RETURNED'
                      ? '#FEF3C7'
                      : isActiveWithCustomer
                      ? '#DBEAFE'
                      : '#F1F5F9',
                  color:
                    approval.status === 'PURCHASED'
                      ? '#15803D'
                      : approval.status === 'RETURNED'
                      ? '#D97706'
                      : isActiveWithCustomer
                      ? '#1D4ED8'
                      : '#475569',
                }}
              >
                {approval.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', color: '#64748B', fontSize: '0.88rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} color="#C6A15B" />
                Customer: <strong>{approval.customer?.firstName} {approval.customer?.lastName}</strong> ({approval.customer?.mobile})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} color="#C6A15B" />
                Branch: <strong>{approval.branch?.name}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#C6A15B" />
                Due: <strong>{formatDate(approval.dueDate)}</strong>
              </span>
            </div>
          </div>

          {/* Status-Aware Operational Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* DRAFT ACTIONS */}
            {isDraft && (
              <>
                {hasPermission('approval.issue') && (
                  <button
                    onClick={() => setIsIssueConfirmOpen(true)}
                    className="btn btn-gold"
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> Issue Approval Slip
                  </button>
                )}
                {hasPermission('approval.cancel') && (
                  <button
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="btn btn-secondary"
                    style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                  >
                    <XCircle size={16} /> Cancel Draft
                  </button>
                )}
              </>
            )}

            {/* ISSUED / WITH_CUSTOMER ACTIONS */}
            {isActiveWithCustomer && (
              <>
                {hasPermission('approval.deposit.create') && (
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CreditCard size={16} color="#059669" /> Record Security Deposit
                  </button>
                )}
                {hasPermission('approval.return') && (
                  <button
                    onClick={() => setIsReturnModalOpen(true)}
                    className="btn btn-secondary"
                    style={{ color: '#D97706', borderColor: '#FDE68A', background: '#FEF3C7', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={16} /> Return Jewellery
                  </button>
                )}
                {hasPermission('approval.purchase') && (
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="btn btn-gold"
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ShoppingBag size={16} /> Confirm Purchase & Invoice
                  </button>
                )}
              </>
            )}

            {/* PURCHASED LINK TO SALES INVOICE */}
            {isPurchased && approval.salesInvoiceId && (
              <button
                onClick={() => navigate(`/sales/invoices/${approval.salesInvoiceId}`)}
                className="btn btn-gold"
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={16} /> View Sales Invoice #{approval.salesInvoiceNumber || ''}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck },
          { id: 'items', label: `Jewellery Items (${approval.items?.length || 0})`, icon: ShoppingBag },
          { id: 'deposits', label: 'Deposits & Payments', icon: CreditCard },
          { id: 'customer', label: 'Customer Status', icon: User },
          { id: 'invoice', label: 'Sales Invoice', icon: FileText },
          { id: 'audit', label: 'Chronological Audit Trail', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '0.88rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#C6A15B' : '#64748B',
                borderBottom: isActive ? '3px solid #C6A15B' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Financial Summary */}
          <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#C6A15B" /> Financial Valuation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.86rem', color: '#64748B' }}>Total Jewellery Value:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(approval.totalApprovalValue)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.86rem', color: '#64748B' }}>Required Security Deposit:</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>{formatCurrency(approval.requiredDepositAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#DCFCE7', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.86rem', color: '#166534', fontWeight: 700 }}>Paid Deposit Total:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803D' }}>{formatCurrency(approval.paidDepositAmount)}</span>
              </div>
            </div>
          </div>

          {/* Slip Info */}
          <div className="glass-card" style={{ padding: '22px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Approval Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <div><span style={{ color: '#64748B' }}>Issue Date:</span> <strong>{formatDate(approval.issueDate)}</strong></div>
              <div><span style={{ color: '#64748B' }}>Expected Return Date:</span> <strong>{formatDate(approval.dueDate)}</strong></div>
              <div><span style={{ color: '#64748B' }}>Assigned Salesperson:</span> <strong>{approval.salesperson ? `${approval.salesperson.firstName} ${approval.salesperson.lastName || ''}` : 'Unassigned'}</strong></div>
              {approval.notes && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700 }}>NOTES / REMARKS:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{approval.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. JEWELLERY ITEMS */}
      {activeTab === 'items' && (
        <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 700, color: '#1E293B' }}>
            Locked Inventory Items ({approval.items?.length || 0})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Item Code</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Product Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Weights (Gross/Net)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Purity</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Item Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Unit Value</th>
              </tr>
            </thead>
            <tbody>
              {approval.items?.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>
                    {item.inventoryItem?.itemCode || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>
                    {item.inventoryItem?.product?.name || 'Jewellery Item'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {item.inventoryItem?.grossWeight}g / {item.inventoryItem?.netWeight}g
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{item.inventoryItem?.purity}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 800, background: '#DBEAFE', color: '#1E40AF' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: 3. DEPOSITS & PAYMENTS */}
      {activeTab === 'deposits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {depositSummary && (
            <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>REQUIRED DEPOSIT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(depositSummary.requiredDeposit)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>COMPLETED DEPOSIT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(depositSummary.completedDeposit)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>REVERSED DEPOSIT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#DC2626' }}>{formatCurrency(depositSummary.reversedDeposit)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>OUTSTANDING DEPOSIT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#D97706' }}>{formatCurrency(depositSummary.outstandingDeposit)}</div>
              </div>
            </div>
          )}

          <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 700, color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Deposit Ledger Payments ({approval.deposits?.length || 0})</span>
              {isActiveWithCustomer && hasPermission('approval.deposit.create') && (
                <button onClick={() => setIsDepositModalOpen(true)} className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  <Plus size={14} /> Record Deposit
                </button>
              )}
            </div>

            {(!approval.deposits || approval.deposits.length === 0) ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No security deposits recorded for this approval slip.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Payment Method</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Tx Reference</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {approval.deposits.map((dep) => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(dep.paymentDate)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1E293B' }}>{dep.paymentMethod}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{dep.transactionReference || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 800, background: dep.status === 'COMPLETED' ? '#DCFCE7' : '#FEE2E2', color: dep.status === 'COMPLETED' ? '#15803D' : '#991B1B' }}>
                          {dep.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: dep.status === 'COMPLETED' ? '#059669' : '#DC2626' }}>
                        {formatCurrency(dep.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. CUSTOMER STATUS */}
      {activeTab === 'customer' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Customer Profile & Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
            <div><span style={{ color: '#64748B' }}>Name:</span> <strong>{approval.customer?.firstName} {approval.customer?.lastName}</strong></div>
            <div><span style={{ color: '#64748B' }}>Customer Code:</span> <strong>{approval.customer?.customerCode || 'N/A'}</strong></div>
            <div><span style={{ color: '#64748B' }}>Mobile:</span> <strong>{approval.customer?.mobile || '-'}</strong></div>
            <div><span style={{ color: '#64748B' }}>Email:</span> <strong>{approval.customer?.email || '-'}</strong></div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. SALES INVOICE */}
      {activeTab === 'invoice' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          {isPurchased ? (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#15803D', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#15803D" /> Converted to Sales Invoice
              </h3>
              <p style={{ color: '#475569', fontSize: '0.88rem' }}>
                This approval slip has been fully converted into completed Sales Invoice #{approval.salesInvoiceNumber || 'N/A'}.
              </p>
              {approval.salesInvoiceId && (
                <button onClick={() => navigate(`/sales/invoices/${approval.salesInvoiceId}`)} className="btn btn-gold" style={{ marginTop: '12px' }}>
                  Navigate to Sales Invoice Detail
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: '#64748B', fontSize: '0.88rem' }}>
              No Sales Invoice generated yet. Once customer confirms purchase, a Sales Invoice will be linked here.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 6. CHRONOLOGICAL AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#C6A15B" /> Chronological Event Timeline
          </h3>

          {(!auditTrail?.timeline || auditTrail.timeline.length === 0) ? (
            <div style={{ color: '#64748B' }}>No audit trail events recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #E2E8F0' }}>
              {auditTrail.timeline.map((event, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#C6A15B', border: '2px solid #FFFFFF' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '10px' }}>
                      {event.eventType}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{formatDate(event.timestamp)}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                    {event.description}
                  </div>
                  {event.performedBy && (
                    <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                      By: {event.performedBy}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM ISSUE DIALOG */}
      {isIssueConfirmOpen && (
        <ConfirmDialog
          isOpen={isIssueConfirmOpen}
          title="Issue Sell on Approval Slip?"
          message="These jewellery items will be placed ON APPROVAL and cannot be sold, transferred or issued for job work until returned or purchased."
          onConfirm={handleIssueApproval}
          onCancel={() => setIsIssueConfirmOpen(false)}
          confirmText="Yes, Issue Approval"
          cancelText="Cancel"
          isLoading={isActionLoading}
        />
      )}

      {/* CONFIRM CANCEL DIALOG */}
      {isCancelConfirmOpen && (
        <ConfirmDialog
          isOpen={isCancelConfirmOpen}
          title="Cancel Draft Approval Slip?"
          message="Are you sure you want to cancel this draft approval slip? This action cannot be undone."
          onConfirm={handleCancelApproval}
          onCancel={() => setIsCancelConfirmOpen(false)}
          confirmText="Yes, Cancel Approval"
          cancelText="Close"
          isLoading={isActionLoading}
        />
      )}

      {/* RECORD DEPOSIT MODAL */}
      {isDepositModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Record Security Deposit</h3>
            <form onSubmit={handleCreateDeposit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Payment Method</label>
                <select value={depositMethod} onChange={(e) => setDepositMethod(e.target.value as any)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Deposit Amount (₹)</label>
                <input type="number" required min="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Transaction Reference / Cheque #</label>
                <input type="text" placeholder="UPI Ref / Cheque No" value={depositTxRef} onChange={(e) => setDepositTxRef(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsDepositModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isActionLoading} className="btn btn-gold" style={{ fontWeight: 700 }}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN JEWELLERY MODAL */}
      {isReturnModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Process Jewellery Return</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '16px' }}>
              Confirm return of all jewellery items back to AVAILABLE inventory stock.
            </p>
            <form onSubmit={handleReturnApproval}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Return Reason / Inspection Notes</label>
                <textarea rows={3} placeholder="Customer returned after trial..." value={returnReason} onChange={(e) => setReturnReason(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isActionLoading} className="btn btn-gold" style={{ fontWeight: 700 }}>Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM PURCHASE MODAL */}
      {isPurchaseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Confirm Customer Purchase</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '14px' }}>
              This will convert the approval slip into a final Sales Invoice and mark items as SOLD. Security deposits will be applied as payment credit.
            </p>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Approval Value:</span> <strong>{formatCurrency(approval.totalApprovalValue)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Paid Deposit Credit:</span> <strong>{formatCurrency(approval.paidDepositAmount)}</strong>
              </div>
            </div>

            <form onSubmit={handlePurchaseApproval}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Purchase Remarks</label>
                <textarea rows={2} placeholder="Final purchase confirmed by customer..." value={purchaseNotes} onChange={(e) => setPurchaseNotes(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isActionLoading} className="btn btn-gold" style={{ fontWeight: 700 }}>Generate Sales Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
