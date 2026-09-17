import React, { useState, useEffect } from 'react';
import { inventoryTagsApi, InventoryTagDetail } from '../api/inventoryTags';
import { QRCodeViewer } from '../components/qr/QRCodeViewer';
import { QRScannerModal } from '../components/qr/QRScannerModal';
import { useAuth } from '../context/AuthContext';
import { Tag, Search, Camera, RefreshCw, QrCode, CheckCircle, AlertCircle, Eye, Power, RotateCw, X } from 'lucide-react';

import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const InventoryTags: React.FC = () => {
  const { hasPermission } = useAuth();
  const canUpdateTag = hasPermission('inventory_tag.update');

  const [tags, setTags] = useState<InventoryTagDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // QR Viewer Modal
  const [viewQrCode, setViewQrCode] = useState<{ value: string; label: string } | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchTags();
  }, [search, activeFilter]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await inventoryTagsApi.list({
        search: search || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter === 'true',
        page: 1,
        limit: 20,
      });

      if (res?.success || Array.isArray(res?.data)) {
        setTags(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching inventory tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (code: string) => {
    if (!code.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    const term = code.trim();
    try {
      let res;
      if (term.startsWith('QR-') || term.includes('QR')) {
        res = await inventoryTagsApi.getByQrCode(term);
      } else {
        res = await inventoryTagsApi.getByBarcode(term);
      }

      if (res?.success || res?.data) {
        setLookupResult(res.data || res);
      } else {
        setLookupError(`Tag with code '${term}' not found or inactive.`);
      }
    } catch (err: any) {
      setLookupError(err?.response?.data?.message || `Tag '${term}' not found or inactive.`);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setLookupCode(decodedText);
    handleLookup(decodedText);
  };

  const handleToggleStatus = async (inventoryItemId: string, currentStatus: boolean) => {
    try {
      await inventoryTagsApi.updateStatus(inventoryItemId, !currentStatus);
      fetchTags();
    } catch (err: any) {
      console.error('Failed to update tag status:', err);
    }
  };

  const handleConfirmRegenerate = async () => {
    if (!regenerateTarget) return;
    setIsRegenerating(true);
    try {
      await inventoryTagsApi.regenerateTag(regenerateTarget);
      setRegenerateTarget(null);
      fetchTags();
    } catch (err: any) {
      console.error('Failed to regenerate tag:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <Tag color="#C6A15B" /> Barcode & QR Code Tag Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Smartphone camera QR scanning, barcode lookups & auto-generated tag management.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsScannerOpen(true)} className="btn btn-primary">
            <Camera size={16} /> Scan QR with Camera
          </button>
          <button onClick={fetchTags} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Direct Barcode / QR Lookup Widget */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderColor: '#C6A15B' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={18} color="#C6A15B" /> Direct Barcode / QR Tag Lookup
        </h3>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Barcode (BC-INV-...) or QR Code (QR-INV-...)"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(lookupCode)}
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button onClick={() => handleLookup(lookupCode)} disabled={lookupLoading} className="btn btn-primary" style={{ padding: '8px 20px' }}>
            {lookupLoading ? 'Searching...' : 'Lookup Tag'}
          </button>
        </div>

        {lookupError && (
          <div style={{ marginTop: '12px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '10px', color: '#DC2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {lookupError}
          </div>
        )}

        {lookupResult && (
          <div style={{ marginTop: '16px', background: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', alignItems: 'center' }}>
            <QRCodeViewer value={lookupResult.qrCode || lookupResult.barcode} label={lookupResult.inventoryItem?.itemCode || 'Tagged Item'} size={120} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#18181B', marginBottom: '4px' }}>
                Item Code: <span style={{ color: '#C6A15B' }}>{lookupResult.inventoryItem?.itemCode || 'INV-ITEM'}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                Product: {lookupResult.inventoryItem?.product?.name || 'Jewellery'} (SKU: {lookupResult.inventoryItem?.product?.sku || '-'})
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                <div><span style={{ color: '#64748B' }}>Gross Wt:</span> <strong>{lookupResult.inventoryItem?.grossWeight}g</strong></div>
                <div><span style={{ color: '#64748B' }}>Net Wt:</span> <strong>{lookupResult.inventoryItem?.netWeight}g</strong></div>
                <div><span style={{ color: '#64748B' }}>Purity:</span> <strong>{lookupResult.inventoryItem?.purity}</strong></div>
                <div><span style={{ color: '#64748B' }}>Status:</span> <span className="badge badge-emerald">{lookupResult.inventoryItem?.status}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search barcode, QR code, item code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>

        <select className="form-input" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} style={{ width: '160px', padding: '8px 12px' }}>
          <option value="">All Statuses</option>
          <option value="true">Active Tags</option>
          <option value="false">Inactive Tags</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Barcode String</th>
              <th>QR Code String</th>
              <th>RFID Status</th>
              <th>Tag Status</th>
              <th>Tagged Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading inventory tags...</td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>No inventory tags found.</td>
              </tr>
            ) : (
              tags.map((t) => (
                <tr key={t.id}>
                  <td><strong style={{ color: '#C6A15B' }}>{t.inventoryItem?.itemCode || t.inventoryItemId}</strong></td>
                  <td><code>{t.barcode}</code></td>
                  <td>
                    <button onClick={() => setViewQrCode({ value: t.qrCode, label: t.inventoryItem?.itemCode || 'Item' })} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      <QrCode size={12} color="#C6A15B" /> {t.qrCode}
                    </button>
                  </td>
                  <td>
                    {t.rfidEpc ? <span className="badge badge-emerald">{t.rfidEpc}</span> : <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>RFID — Not Assigned</span>}
                  </td>
                  <td>
                    {t.isActive ? <span className="badge badge-emerald">ACTIVE</span> : <span className="badge badge-gray">INACTIVE</span>}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{t.taggedAt ? new Date(t.taggedAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {canUpdateTag && (
                        <>
                          <button onClick={() => handleToggleStatus(t.inventoryItemId, t.isActive)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} title={t.isActive ? 'Deactivate Tag' : 'Activate Tag'}>
                            <Power size={13} color={t.isActive ? '#DC2626' : '#059669'} />
                          </button>
                          <button onClick={() => setRegenerateTarget(t.inventoryItemId)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} title="Regenerate Tag">
                            <RotateCw size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Regenerate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!regenerateTarget}
        title="Regenerate Barcode & QR Code"
        message="Are you sure you want to regenerate a new Barcode and QR code for this item? Stock history and weights will remain untouched."
        confirmText="Regenerate Tag"
        variant="gold"
        isLoading={isRegenerating}
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setRegenerateTarget(null)}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />

      {/* QR Viewer Modal */}
      {viewQrCode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setViewQrCode(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
              <X size={18} />
            </button>
            <QRCodeViewer value={viewQrCode.value} label={viewQrCode.label} size={200} />
          </div>
        </div>
      )}
    </div>
  );
};
