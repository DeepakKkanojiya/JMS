import React, { useState } from 'react';
import { Copy, Check, Download, Barcode as BarcodeIcon } from 'lucide-react';

interface BarcodeViewerProps {
  value: string;
  width?: number;
  height?: number;
  label?: string;
  showLabel?: boolean;
}

export const BarcodeViewer: React.FC<BarcodeViewerProps> = ({
  value,
  width = 240,
  height = 80,
  label,
  showLabel = true,
}) => {
  const [copied, setCopied] = useState(false);

  // High-resolution barcode image generator
  const barcodeImageUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(value)}&scale=3&rotate=N&includetext`;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(barcodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BARCODE-${value}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback direct click download
      const link = document.createElement('a');
      link.href = barcodeImageUrl;
      link.download = `BARCODE-${value}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: `${width + 40}px`,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #F1F5F9',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <img
          src={barcodeImageUrl}
          alt={`Barcode for ${value}`}
          style={{
            maxWidth: '100%',
            height: `${height}px`,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {showLabel && (
        <div
          style={{
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#C6A15B',
            letterSpacing: '1px',
            fontFamily: 'monospace',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          {label || value}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
        <button
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Copy Barcode Tag Code"
        >
          {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-primary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Download Barcode Label Image"
        >
          <Download size={13} />
          <span>Download Label</span>
        </button>
      </div>
    </div>
  );
};
