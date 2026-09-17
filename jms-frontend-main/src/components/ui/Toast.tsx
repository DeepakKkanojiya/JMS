import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '8px',
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast.type === 'success' || toast.type === 'info') {
      const timer = setTimeout(() => onDismiss(toast.id), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.type, onDismiss]);

  const styles: Record<string, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
    success: {
      bg: '#F0FDF4',
      border: '#BBF7D0',
      color: '#166534',
      icon: <CheckCircle size={18} color="#16A34A" />,
    },
    error: {
      bg: '#FEF2F2',
      border: '#FECACA',
      color: '#991B1B',
      icon: <AlertCircle size={18} color="#DC2626" />,
    },
    info: {
      bg: '#F0F9FF',
      border: '#BAE6FD',
      color: '#075985',
      icon: <Info size={18} color="#0284C7" />,
    },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 16px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        color: s.color,
        fontSize: '0.86rem',
        fontWeight: 500,
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        minWidth: '280px',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '1px' }}>{s.icon}</div>
      <div style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          flexShrink: 0,
          color: s.color,
          opacity: 0.6,
          padding: '2px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
