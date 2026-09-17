import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'gold';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isGold = variant === 'gold';

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="glass-card modal-content"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '24px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(11, 11, 13, 0.2)',
          border: '1px solid #E5E7EB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isDanger ? 'rgba(220, 38, 38, 0.1)' : 'rgba(198, 161, 91, 0.12)',
                color: isDanger ? '#DC2626' : '#C6A15B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isDanger ? <Trash2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181B' }}>{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{ color: '#94A3B8', padding: '4px', borderRadius: '4px' }}
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '22px', paddingLeft: '54px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={isDanger ? 'btn btn-primary' : isGold ? 'btn btn-gold' : 'btn btn-primary'}
            style={
              isDanger
                ? { background: '#DC2626', borderColor: '#DC2626', padding: '8px 18px' }
                : { padding: '8px 18px' }
            }
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
