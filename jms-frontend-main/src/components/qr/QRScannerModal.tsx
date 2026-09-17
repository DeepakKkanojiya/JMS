import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Upload, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5qr-code-reader';

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      }

      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Default to back camera on smartphones
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopCamera();
          onClose();
        },
        (_errorMessage) => {
          // Continuous scanning errors ignored
        }
      );
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(err?.message || 'Could not access camera. Please allow camera permissions or upload an image file.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        // Ignore stop errors
      }
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(readerElementId);
        }
        const decodedText = await scannerRef.current.scanFile(file, true);
        onScanSuccess(decodedText);
        onClose();
      } catch (err: any) {
        setCameraError('Could not decode QR code from uploaded image. Please ensure image contains a clear QR code.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '460px', position: 'relative' }}>
        <button onClick={() => { stopCamera(); onClose(); }} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18181B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={20} color="#C6A15B" /> Camera QR Scanner
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '16px' }}>
          Point smartphone or desktop camera at inventory item QR code.
        </p>

        {cameraError && (
          <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', color: '#DC2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>{cameraError}</div>
          </div>
        )}

        <div id={readerElementId} style={{ width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden', background: '#0B0B0D' }} />

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#C6A15B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={14} /> Or Upload QR Code Image
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  );
};
