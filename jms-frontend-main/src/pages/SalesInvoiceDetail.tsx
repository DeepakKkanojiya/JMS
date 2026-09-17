import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesInvoiceApi, SalesInvoice } from '../api/salesInvoices';
import { salesPaymentsApi, SalesPayment, PaymentMethod } from '../api/salesPayments';
import { goldExchangesApi, CustomerGoldExchange } from '../api/goldExchanges';
import { salesReturnsApi, SalesReturn } from '../api/salesReturns';
import { salesRefundsApi } from '../api/salesRefunds';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lock,
  Calculator,
  Coins,
  CreditCard,
  RotateCcw,
  Receipt,
  Layers,
  Clock,
  Printer,
  Plus,
  AlertCircle,
  X,
  User,
  Store,
  ShieldCheck,
  PowerOff,
  DollarSign,
  TrendingDown,
} from 'lucide-react';

export const SalesInvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canUpdate = hasPermission('sales_invoice.update');
  const canConfirm = hasPermission('sales_invoice.confirm');
  const canCancel = hasPermission('sales_invoice.cancel');
  const canLockRate = hasPermission('metal_rate.create') || hasPermission('sales_invoice.update');
  const canPay = hasPermission('sales_payment.create');
  const canReversePay = hasPermission('sales_payment.reverse');
  const canAddExchange = hasPermission('gold_exchange.create');
  const canValueExchange = hasPermission('gold_exchange.value');
  const canApplyExchange = hasPermission('gold_exchange.apply');
  const canReturn = hasPermission('sales_return.create');
  const canApproveReturn = hasPermission('sales_return.approve');
  const canProcessReturn = hasPermission('sales_return.process');
  const canRefund = hasPermission('sales_refund.create');

  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [payments, setPayments] = useState<SalesPayment[]>([]);
  const [exchanges, setExchanges] = useState<CustomerGoldExchange[]>([]);
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'items' | 'pricing' | 'exchange' | 'payments' | 'returns'>('items');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'UPI' as PaymentMethod,
    amount: '',
    transactionReference: '',
    remarks: '',
  });
  const [reversingPayment, setReversingPayment] = useState<SalesPayment | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Exchange Modal
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({
    metalType: 'GOLD' as const,
    purity: '22K',
    grossWeight: '',
    stoneWeight: '0',
    deductionPercent: '5',
    remarks: '',
  });

  // Return Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, { deduction: number }>>({});
  const [returnReason, setReturnReason] = useState('');

  // Action Loading & Feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadMasterInvoiceData();
    }
  }, [id]);

  const loadMasterInvoiceData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [invRes, payRes, excRes, retRes] = await Promise.all([
        salesInvoiceApi.getById(id),
        salesPaymentsApi.getInvoicePayments(id).catch(() => ({ data: [] })),
        goldExchangesApi.getInvoiceExchanges(id).catch(() => ({ data: [] })),
        salesReturnsApi.getByInvoiceId(id).catch(() => ({ data: [] })),
      ]);

      if (invRes?.data) {
        setInvoice(invRes.data);
      }
      setPayments(payRes?.data || []);
      setExchanges(excRes?.data || []);
      setReturns(retRes?.data || []);
    } catch (err) {
      console.error('Error loading master invoice details:', err);
      setFeedback({ type: 'error', message: 'Failed to load sales invoice records.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLockMetalRate = async () => {
    if (!invoice) return;
    setActionLoading(true);
    try {
      await salesInvoiceApi.lockMetalRate(invoice.id);
      setFeedback({ type: 'success', message: 'Active metal rate snapshot locked on invoice.' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to lock metal rate.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculatePricing = async () => {
    if (!invoice) return;
    setActionLoading(true);
    try {
      await salesInvoiceApi.recalculatePricing(invoice.id);
      setFeedback({ type: 'success', message: 'Authoritative pricing and GST recalculation completed.' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to recalculate pricing.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmInvoice = async () => {
    if (!invoice) return;
    setActionLoading(true);
    try {
      await salesInvoiceApi.confirm(invoice.id);
      setFeedback({ type: 'success', message: `Invoice #${invoice.invoiceNumber} CONFIRMED! Inventory items marked SOLD.` });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to confirm sale.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setActionLoading(true);
    try {
      const amt = parseFloat(paymentForm.amount);
      if (amt <= 0) throw new Error('Payment amount must be greater than 0');

      await salesPaymentsApi.create({
        salesInvoiceId: invoice.id,
        paymentMethod: paymentForm.paymentMethod,
        amount: amt,
        transactionReference: paymentForm.transactionReference || null,
        remarks: paymentForm.remarks || null,
      });

      setFeedback({ type: 'success', message: `Payment of ₹${amt.toLocaleString('en-IN')} recorded successfully.` });
      setIsPaymentModalOpen(false);
      setPaymentForm({ paymentMethod: 'UPI', amount: '', transactionReference: '', remarks: '' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Payment recording failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReversePayment = async () => {
    if (!reversingPayment) return;
    if (!reversalReason.trim()) {
      setFeedback({ type: 'error', message: 'Reversal reason is mandatory for audit trail.' });
      return;
    }
    setActionLoading(true);
    try {
      await salesPaymentsApi.reverse(reversingPayment.id, reversalReason.trim());
      setFeedback({ type: 'success', message: `Payment #${reversingPayment.paymentNumber} has been reversed.` });
      setReversingPayment(null);
      setReversalReason('');
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Payment reversal failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setActionLoading(true);
    try {
      const gross = parseFloat(exchangeForm.grossWeight);
      const stone = parseFloat(exchangeForm.stoneWeight || '0');
      const ded = parseFloat(exchangeForm.deductionPercent || '0');

      if (gross <= 0) throw new Error('Gross weight must be greater than 0');

      const excRes = await goldExchangesApi.createForInvoice(invoice.id, {
        customerId: invoice.customerId,
        remarks: exchangeForm.remarks || 'Customer old gold exchange',
        items: [{
          metalType: exchangeForm.metalType,
          purity: exchangeForm.purity,
          grossWeight: gross,
          stoneWeight: stone,
          deductionPercent: ded,
        }],
      });

      const excId = excRes?.data?.id;
      if (excId) {
        // Automatically value exchange with active rates
        await goldExchangesApi.valueExchange(excId);
      }

      setFeedback({ type: 'success', message: 'Old gold exchange item created and valued successfully.' });
      setIsExchangeModalOpen(false);
      setExchangeForm({ metalType: 'GOLD', purity: '22K', grossWeight: '', stoneWeight: '0', deductionPercent: '5', remarks: '' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to create gold exchange.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyExchange = async (exchangeId: string) => {
    setActionLoading(true);
    try {
      await goldExchangesApi.applyExchange(exchangeId);
      setFeedback({ type: 'success', message: 'Gold exchange credit successfully applied to invoice.' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to apply gold exchange credit.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    const selectedItemIds = Object.keys(selectedReturnItems);
    if (selectedItemIds.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one item to return.' });
      return;
    }

    setActionLoading(true);
    try {
      const itemsPayload = selectedItemIds.map((invItemId) => {
        const lineItem = invoice.items?.find((it) => it.id === invItemId || it.inventoryItemId === invItemId);
        return {
          salesInvoiceItemId: lineItem?.id || invItemId,
          inventoryItemId: lineItem?.inventoryItemId || invItemId,
          quantity: 1,
          deductionAmount: selectedReturnItems[invItemId].deduction || 0,
          reason: returnReason || 'Customer return',
        };
      });

      await salesReturnsApi.create({
        salesInvoiceId: invoice.id,
        reason: returnReason || 'Customer return request',
        items: itemsPayload,
      });

      setFeedback({ type: 'success', message: 'Sales return request initiated successfully.' });
      setIsReturnModalOpen(false);
      setSelectedReturnItems({});
      setReturnReason('');
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create return request.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReturn = async (returnId: string) => {
    setActionLoading(true);
    try {
      await salesReturnsApi.approve(returnId);
      setFeedback({ type: 'success', message: 'Sales return request approved.' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Return approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessReturn = async (returnId: string) => {
    setActionLoading(true);
    try {
      await salesReturnsApi.process(returnId);
      setFeedback({ type: 'success', message: 'Return processed! Items restored to AVAILABLE and SALE_RETURN movement logged.' });
      loadMasterInvoiceData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Return processing failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !invoice) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#C6A15B', flexDirection: 'column', gap: '12px' }}>
        <Clock size={32} className="spin" />
        <div style={{ fontWeight: 600, fontSize: '1rem', color: '#18181B' }}>Loading Master Sales Record #{id}...</div>
      </div>
    );
  }

  const grandTotal = parseFloat(invoice.grandTotal?.toString() || '0');
  const exchangeCredit = parseFloat(invoice.exchangeCredit?.toString() || '0');
  const netPayable = grandTotal - exchangeCredit;
  const totalPaid = parseFloat(invoice.totalPaid?.toString() || '0');
  const outstanding = parseFloat(invoice.outstandingAmount?.toString() || '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb items={[
        { label: 'Sales', path: '/sales' },
        { label: 'Invoices', path: '/sales/invoices' },
        { label: invoice?.invoiceNumber || 'Invoice Detail' }
      ]} />
      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/sales/invoices')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
            <span>Invoices</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="brand-font" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#18181B' }}>
                Invoice #{invoice.invoiceNumber}
              </h1>
              <span className={`badge ${invoice.status === 'CONFIRMED' ? 'badge-emerald' : invoice.status === 'DRAFT' ? 'badge-gold' : 'badge-ruby'}`}>
                {invoice.status}
              </span>
              <span className={`badge ${invoice.paymentStatus === 'PAID' ? 'badge-emerald' : invoice.paymentStatus === 'PARTIALLY_PAID' ? 'badge-platinum' : 'badge-ruby'}`}>
                {invoice.paymentStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
              Created on {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        {/* Action Buttons based on Invoice State & Permissions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {invoice.status === 'DRAFT' && (
            <>
              {canLockRate && (
                <button onClick={handleLockMetalRate} disabled={actionLoading} className="btn btn-secondary">
                  <Lock size={15} color="#C6A15B" />
                  <span>{invoice.metalRateLocked ? 'Refresh Rate Lock' : 'Lock Metal Rate'}</span>
                </button>
              )}

              {canUpdate && (
                <button onClick={handleRecalculatePricing} disabled={actionLoading} className="btn btn-secondary">
                  <Calculator size={15} color="#2563EB" />
                  <span>Recalculate Pricing</span>
                </button>
              )}

              {canConfirm && (
                <button onClick={handleConfirmInvoice} disabled={actionLoading} className="btn btn-gold">
                  <CheckCircle2 size={16} />
                  <span>Confirm Sale (POS)</span>
                </button>
              )}
            </>
          )}

          {invoice.status === 'CONFIRMED' && outstanding > 0 && canPay && (
            <button onClick={() => {
              setPaymentForm({ ...paymentForm, amount: outstanding.toString() });
              setIsPaymentModalOpen(true);
            }} className="btn btn-gold">
              <CreditCard size={16} />
              <span>Record Payment (₹{outstanding.toLocaleString('en-IN')})</span>
            </button>
          )}

          {invoice.status === 'CONFIRMED' && canReturn && (
            <button onClick={() => setIsReturnModalOpen(true)} className="btn btn-secondary">
              <RotateCcw size={15} color="#DC2626" />
              <span>Initiate Return</span>
            </button>
          )}

          <button onClick={() => window.print()} className="btn btn-secondary" title="Print Invoice">
            <Printer size={16} />
            <span>Print</span>
          </button>
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
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}><X size={16} /></button>
        </div>
      )}

      {/* Overview Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Customer Capsule */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <User size={14} /> Customer Profile
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginTop: '6px' }}>
            {invoice.customer?.firstName} {invoice.customer?.lastName || ''}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{invoice.customer?.mobile}</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{invoice.customer?.city || 'Retail Walk-in'}</div>
        </div>

        {/* Branch & Salesperson */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Store size={14} /> Showroom & Staff
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginTop: '6px' }}>
            {invoice.branch?.name || 'Main Branch'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Salesperson: {invoice.salesperson?.firstName || 'POS Cashier Desk'}
          </div>
        </div>

        {/* Grand Total & Settlement */}
        <div className="glass-card" style={{ padding: '16px', borderTop: '4px solid #C6A15B' }}>
          <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Grand Total</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181B', marginTop: '4px' }}>
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          {exchangeCredit > 0 && (
            <div style={{ fontSize: '0.76rem', color: '#C6A15B', fontWeight: 600 }}>
              - ₹{exchangeCredit.toLocaleString('en-IN')} Old Gold Credit
            </div>
          )}
        </div>

        {/* Paid & Outstanding */}
        <div className="glass-card" style={{ padding: '16px', borderTop: `4px solid ${outstanding > 0 ? '#D97706' : '#059669'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Settlement</span>
            <span className={`badge ${outstanding === 0 ? 'badge-emerald' : 'badge-ruby'}`}>
              {outstanding === 0 ? 'PAID' : 'DUE'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
              ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>collected</span>
          </div>
          {outstanding > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 700, marginTop: '2px' }}>
              ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Outstanding
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'items', label: `Line Items (${invoice.items?.length || 0})`, icon: Layers },
            { id: 'pricing', label: 'Authoritative Pricing & Tax Breakdown', icon: Calculator },
            { id: 'exchange', label: `Gold Exchange (${exchanges.length})`, icon: Coins },
            { id: 'payments', label: `Payments & Receipts (${payments.length})`, icon: CreditCard },
            { id: 'returns', label: `Sales Returns (${returns.length})`, icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#C6A15B' : '#64748B',
                  background: isActive ? 'rgba(198, 161, 91, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(198, 161, 91, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: LINE ITEMS TABLE */}
        {activeTab === 'items' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Product Description</th>
                    <th>Purity</th>
                    <th>Gross / Net Wt</th>
                    <th>Unit Price (₹)</th>
                    <th>Making Charge</th>
                    <th>Tax Amount</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#18181B' }}>
                        {item.inventoryItem?.itemCode || 'ITEM-N/A'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#18181B' }}>
                          {item.inventoryItem?.product?.name || 'Jewellery Ornament'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          SKU: {item.inventoryItem?.product?.sku || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gold">{item.inventoryItem?.purity || '22K'}</span>
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        <div>Gross: {parseFloat(item.inventoryItem?.grossWeight?.toString() || '0').toFixed(3)}g</div>
                        <div style={{ color: '#059669', fontWeight: 600 }}>Net: {parseFloat(item.inventoryItem?.netWeight?.toString() || '0').toFixed(3)}g</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{parseFloat(item.unitPrice?.toString() || '0').toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                        ₹{parseFloat(item.makingChargeAmount?.toString() || '0').toLocaleString('en-IN')}
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.makingChargeType || 'STANDARD'}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                        ₹{parseFloat(item.taxAmount?.toString() || '0').toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '0.96rem', color: '#18181B' }}>
                        ₹{parseFloat(item.lineTotal?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING BREAKDOWN & METAL RATE SNAPSHOT */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Locked Rate Snapshot Card */}
            <div className="glass-card" style={{ padding: '20px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C6A15B', marginBottom: '14px' }}>
                <Lock size={18} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B' }}>Locked Metal Rate Snapshot</h4>
              </div>
              {invoice.metalRateSnapshot ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Metal Type:</span>
                    <span style={{ fontWeight: 700 }}>{invoice.metalRateSnapshot.metalType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Purity:</span>
                    <span style={{ fontWeight: 700 }}>{invoice.metalRateSnapshot.purity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Locked Rate Per Gram:</span>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                      ₹{parseFloat(invoice.metalRateSnapshot.ratePerGram.toString()).toLocaleString('en-IN')}/g
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem' }}>
                    <span>Locked At:</span>
                    <span>{new Date(invoice.metalRateSnapshot.lockedAt).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem' }}>
                  No metal rate snapshot locked yet. Rate will be locked on confirmation or via the action button.
                </div>
              )}
            </div>

            {/* Comprehensive Pricing Ledger */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginBottom: '14px' }}>Authoritative Invoice Pricing Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Pure Metal Value:</span>
                  <span style={{ fontWeight: 600 }}>₹{parseFloat(invoice.metalValue?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Making Charges:</span>
                  <span style={{ fontWeight: 600 }}>₹{parseFloat(invoice.makingCharges?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Wastage Value:</span>
                  <span style={{ fontWeight: 600 }}>₹{parseFloat(invoice.wastageValue?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderTop: '1px solid #E5E7EB', paddingTop: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Taxable Amount:</span>
                  <span style={{ fontWeight: 700 }}>₹{parseFloat(invoice.taxableAmount?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem' }}>
                  <span>CGST (1.5%):</span>
                  <span>₹{parseFloat(invoice.cgstAmount?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem' }}>
                  <span>SGST (1.5%):</span>
                  <span>₹{parseFloat(invoice.sgstAmount?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Total Tax Amount (3%):</span>
                  <span style={{ fontWeight: 600 }}>₹{parseFloat(invoice.taxAmount?.toString() || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #18181B', paddingTop: '10px', fontSize: '1.15rem' }}>
                  <span style={{ fontWeight: 800, color: '#18181B' }}>Grand Total:</span>
                  <span style={{ fontWeight: 800, color: '#C6A15B' }}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOLD EXCHANGE */}
        {activeTab === 'exchange' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Customer Old Gold Exchange Credit Items
              </div>
              {invoice.status === 'DRAFT' && canAddExchange && (
                <button onClick={() => setIsExchangeModalOpen(true)} className="btn btn-gold" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  <Plus size={16} />
                  <span>+ Add Old Gold</span>
                </button>
              )}
            </div>

            {exchanges.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                <Coins size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: '#475569' }}>No Old Gold Exchange Applied</div>
                <div style={{ fontSize: '0.8rem' }}>Add old customer gold to deduct valuation credit directly from net payable.</div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Exchange #</th>
                      <th>Metal / Purity</th>
                      <th>Gross Wt</th>
                      <th>Net Wt</th>
                      <th>Rate / g</th>
                      <th>Deduction %</th>
                      <th>Exchange Valuation Credit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchanges.map((exc) => (
                      <tr key={exc.id}>
                        <td style={{ fontWeight: 700, color: '#18181B' }}>#{exc.exchangeNumber}</td>
                        <td>
                          {exc.items?.map((it, idx) => (
                            <span key={idx} className="badge badge-gold" style={{ marginRight: '4px' }}>
                              {it.metalType} {it.purity}
                            </span>
                          ))}
                        </td>
                        <td>{parseFloat(exc.totalGrossWeight.toString()).toFixed(3)}g</td>
                        <td style={{ fontWeight: 600, color: '#059669' }}>
                          {parseFloat(exc.totalNetWeight.toString()).toFixed(3)}g
                        </td>
                        <td>
                          {exc.items?.[0]?.ratePerGram ? `₹${parseFloat(exc.items[0].ratePerGram.toString()).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td>{exc.items?.[0]?.deductionPercent || 0}%</td>
                        <td style={{ fontWeight: 800, fontSize: '0.96rem', color: '#059669' }}>
                          ₹{parseFloat(exc.totalExchangeValue.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge ${exc.status === 'APPLIED' ? 'badge-emerald' : exc.status === 'VALUED' ? 'badge-blue' : 'badge-gold'}`}>
                            {exc.status}
                          </span>
                        </td>
                        <td>
                          {exc.status === 'VALUED' && invoice.status === 'DRAFT' && canApplyExchange && (
                            <button
                              onClick={() => handleApplyExchange(exc.id)}
                              disabled={actionLoading}
                              className="btn btn-gold"
                              style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                            >
                              Apply Credit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & SETTLEMENT */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Payment Transactions & Tender Receipts
              </div>
              {invoice.status === 'CONFIRMED' && outstanding > 0 && canPay && (
                <button
                  onClick={() => {
                    setPaymentForm({ ...paymentForm, amount: outstanding.toString() });
                    setIsPaymentModalOpen(true);
                  }}
                  className="btn btn-gold"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  <Plus size={16} />
                  <span>Record Payment</span>
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                <CreditCard size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: '#475569' }}>No Payments Recorded Yet</div>
                <div style={{ fontSize: '0.8rem' }}>Record multi-tender split payments (Cash, UPI, Card, Bank) against confirmed invoice.</div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Transaction Ref</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id}>
                        <td style={{ fontWeight: 700, color: '#18181B' }}>#{pay.paymentNumber}</td>
                        <td>
                          <span className="badge badge-platinum" style={{ fontWeight: 700 }}>
                            {pay.paymentMethod}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '0.96rem', color: pay.status === 'COMPLETED' ? '#059669' : '#94A3B8' }}>
                          ₹{parseFloat(pay.amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {pay.transactionReference || '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {new Date(pay.paymentDate || pay.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${pay.status === 'COMPLETED' ? 'badge-emerald' : 'badge-ruby'}`}>
                            {pay.status}
                          </span>
                        </td>
                        <td>
                          {pay.status === 'COMPLETED' && canReversePay && (
                            <button
                              onClick={() => setReversingPayment(pay)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#DC2626' }}
                              title="Reverse Payment"
                            >
                              <RotateCcw size={13} />
                              <span>Reverse</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SALES RETURNS */}
        {activeTab === 'returns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Sales Returns & Physical Restocking Ledger
              </div>
              {invoice.status === 'CONFIRMED' && canReturn && (
                <button onClick={() => setIsReturnModalOpen(true)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  <RotateCcw size={15} color="#DC2626" />
                  <span>+ Return Item</span>
                </button>
              )}
            </div>

            {returns.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                <RotateCcw size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: '#475569' }}>No Returns Initiated</div>
                <div style={{ fontSize: '0.8rem' }}>Sold items can be returned with approval and automatic physical restocking.</div>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Return #</th>
                      <th>Reason</th>
                      <th>Deduction</th>
                      <th>Refund Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((ret) => (
                      <tr key={ret.id}>
                        <td style={{ fontWeight: 700, color: '#18181B' }}>#{ret.returnNumber}</td>
                        <td style={{ fontSize: '0.84rem', color: '#475569' }}>{ret.reason || 'Customer Return'}</td>
                        <td style={{ color: '#DC2626' }}>₹{parseFloat(ret.deductionAmount.toString()).toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 800, fontSize: '0.96rem', color: '#059669' }}>
                          ₹{parseFloat(ret.refundAmount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className={`badge ${ret.status === 'PROCESSED' ? 'badge-emerald' : ret.status === 'APPROVED' ? 'badge-blue' : ret.status === 'REQUESTED' ? 'badge-gold' : 'badge-ruby'}`}>
                            {ret.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {ret.status === 'REQUESTED' && canApproveReturn && (
                              <button onClick={() => handleApproveReturn(ret.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#2563EB' }}>
                                Approve
                              </button>
                            )}
                            {ret.status === 'APPROVED' && canProcessReturn && (
                              <button onClick={() => handleProcessReturn(ret.id)} className="btn btn-gold" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                                Process & Restock
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>Record Sales Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as PaymentMethod })}
                  className="form-input"
                  required
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
                  <option value="CASH">Cash Tender</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstanding}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="form-input"
                  required
                  style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Maximum due: ₹{outstanding.toLocaleString('en-IN')}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-TXN-989823 or Card Auth Code"
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-gold">
                  {actionLoading ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Payment Modal */}
      {reversingPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>
              Reverse Payment #{reversingPayment.paymentNumber}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '16px' }}>
              Reversing payment of ₹{parseFloat(reversingPayment.amount.toString()).toLocaleString('en-IN')} will restore the invoice outstanding amount.
            </p>
            <div className="form-group">
              <label className="form-label">Mandatory Audit Reversal Reason *</label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="State the justification for this payment reversal..."
                className="form-input"
                rows={3}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setReversingPayment(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleReversePayment} disabled={actionLoading} className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Old Gold Modal */}
      {isExchangeModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>Add Customer Old Gold</h3>
              <button onClick={() => setIsExchangeModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateExchange}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Metal *</label>
                  <select
                    value={exchangeForm.metalType}
                    onChange={(e) => setExchangeForm({ ...exchangeForm, metalType: e.target.value as any })}
                    className="form-input"
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
                    value={exchangeForm.purity}
                    onChange={(e) => setExchangeForm({ ...exchangeForm, purity: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Gross Wt (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={exchangeForm.grossWeight}
                    onChange={(e) => setExchangeForm({ ...exchangeForm, grossWeight: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stone Wt (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={exchangeForm.stoneWeight}
                    onChange={(e) => setExchangeForm({ ...exchangeForm, stoneWeight: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deduction / Melting Loss (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={exchangeForm.deductionPercent}
                  onChange={(e) => setExchangeForm({ ...exchangeForm, deductionPercent: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsExchangeModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-gold">
                  {actionLoading ? 'Valuing...' : 'Save & Value Exchange'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Return Modal */}
      {isReturnModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#DC2626' }}>Initiate Sales Return</h3>
              <button onClick={() => setIsReturnModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateReturn}>
              <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '12px' }}>
                Select the sold line items to return back into inventory stock:
              </p>

              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', padding: '10px', marginBottom: '16px' }}>
                {invoice.items?.map((it) => {
                  const isChecked = !!selectedReturnItems[it.id];
                  return (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const copy = { ...selectedReturnItems };
                            if (e.target.checked) {
                              copy[it.id] = { deduction: 0 };
                            } else {
                              delete copy[it.id];
                            }
                            setSelectedReturnItems(copy);
                          }}
                        />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{it.inventoryItem?.itemCode}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>({it.inventoryItem?.product?.name})</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                        ₹{parseFloat(it.lineTotal.toString()).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="form-group">
                <label className="form-label">Return Reason *</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Size mismatch / exchange requirement"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
                  {actionLoading ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
