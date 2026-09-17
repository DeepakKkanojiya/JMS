import React, { useState } from 'react';
import { Copy, Check, Download, QrCode as QrIcon } from 'lucide-react';

interface QRCodeViewerProps {
  value: string;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ value, size = 150, label, showLabel = false }) => {
  const [copied, setCopied] = useState(false);

  // Generate Google Chart API QR image URL or quick SVG fallback
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${value}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: `${size + 40}px` }}>
      <div style={{ padding: '8px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #F1F5F9', marginBottom: '8px' }}>
        <img src={qrImageUrl} alt={`QR code for ${value}`} width={size} height={size} style={{ display: 'block' }} />
      </div>

      {showLabel && (label || value) && (
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C6A15B', letterSpacing: '0.5px', marginBottom: '4px', textAlign: 'center' }}>
          {label || value}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} title="Copy QR String">
          {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button onClick={handleDownload} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} title="Download QR Image">
          <Download size={12} />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
