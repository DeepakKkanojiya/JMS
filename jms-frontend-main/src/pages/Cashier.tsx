import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LogIn,
  LogOut,
  ListTodo,
  FileSpreadsheet,
  ClipboardList,
  DollarSign,
} from 'lucide-react';
import { salesPaymentsApi } from '../api/salesPayments';

export const Cashier: React.FC = () => {
  const navigate = useNavigate();
  const [totalPaymentsCount, setTotalPaymentsCount] = useState<number>(0);
  const [totalCollectedAmount, setTotalCollectedAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPaymentsSummary();
  }, []);

  const fetchPaymentsSummary = async () => {
    setLoading(true);
    try {
      const res = await salesPaymentsApi.list({ limit: 100 });
      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setTotalPaymentsCount(list.length);
        const sum = list.reduce((acc: number, p: any) => acc + (parseFloat(p.amount) || 0), 0);
        setTotalCollectedAmount(sum);
      }
    } catch (e) {
      console.error('Error fetching cashier summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const cashierCards = [
    {
      title: 'Daily Cash Book',
      subtitle: `View ${totalPaymentsCount} transactions (₹${totalCollectedAmount.toLocaleString('en-IN')})`,
      icon: BookOpen,
      color: '#3B82F6',
      path: '/sales/payments',
    },
    {
      title: 'Box Tag In',
      subtitle: 'Tag in cash box',
      icon: LogIn,
      color: '#10B981',
      path: '/cashier/tag-in',
    },
    {
      title: 'Box Tag Out',
      subtitle: 'Tag out cash box',
      icon: LogOut,
      color: '#F59E0B',
      path: '/cashier/tag-out',
    },
    {
      title: 'To Do Task',
      subtitle: 'Task management',
      icon: ListTodo,
      color: '#EF4444',
      path: '/cashier/todo',
    },
    {
      title: 'Work Book',
      subtitle: 'Work book',
      icon: FileSpreadsheet,
      color: '#8B5CF6',
      path: '/cashier/workbook',
    },
    {
      title: 'Order Register',
      subtitle: 'Order register',
      icon: ClipboardList,
      color: '#8B5CF6',
      path: '/sales/invoices',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
        Cashier
      </h1>

      {/* Live DB Summary Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={20} color="#2563EB" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Total Ledger Recorded Payments</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              ₹ {totalCollectedAmount.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '6px 12px', borderRadius: '8px' }}>
          {totalPaymentsCount} Records Fetched
        </div>
      </div>

      {/* 3x2 Action Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {cashierCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComp size={24} color="#FFFFFF" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                  {card.title}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                  {card.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cashier;
