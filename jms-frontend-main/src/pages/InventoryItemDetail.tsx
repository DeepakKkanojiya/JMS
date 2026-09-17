import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryApi, InventoryItem } from '../api/inventory';
import { BarcodeViewer } from '../components/barcode/BarcodeViewer';
import { InventoryItemImageGallery } from '../components/images/InventoryItemImageGallery';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ArrowLeft, Package, Layers, Tag, History, Camera, AlertCircle, CheckCircle, Clock, ArrowLeftRight, Gem, Shield, IndianRupee, Store, Barcode } from 'lucide-react';

export const InventoryItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [historyData, setHistoryData] = useState<{ movements: any[]; adjustments: any[] }>({ movements: [], adjustments: [] });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'history'>('overview');

  useEffect(() => {
    if (id) {
      fetchDetail();
      fetchHistory();
    }
  }, [id]);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await inventoryApi.getById(id);
      if (res?.success || res?.data) {
        setItem(res.data || res);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to load inventory item details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!id) return;
    try {
      const res = await inventoryApi.getHistory(id);
      if (res?.success || res?.data) {
        setHistoryData(res.data || { movements: [], adjustments: [] });
      }
    } catch (e) {
      // Ignore
    }
  };

  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>Loading product details...</div>;
  }

  if (errorMsg || !item) {
    return (
      <div className="glass-card" style={{ padding: '24px', borderColor: '#DC2626', color: '#DC2626' }}>
        <AlertCircle size={24} style={{ marginBottom: '10px' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Product Not Found</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{errorMsg || 'The requested inventory item could not be retrieved.'}</p>
        <button onClick={() => navigate('/inventory-items')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Inventory
        </button>
      </div>
    );
  }

  const cleanUniqueTag = item.itemCode || (item as any).qrCode || item.id;
  const purity = item.purity || '22K';
  let baseRate = 7000;
  if (purity.includes('999') || item.product?.name?.toLowerCase().includes('silver')) baseRate = 85;
  else if (purity.includes('950') || item.product?.name?.toLowerCase().includes('platinum')) baseRate = 3800;

  const fallbackCost = Number(item.grossWeight || 0) * baseRate;
  const costPrice = (item as any).costPrice || fallbackCost;
  const marketPrice = (item as any).marketPrice || (fallbackCost * 1.15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Breadcrumb items={[
        { label: 'Inventory', path: '/inventory' },
        { label: 'Stock Items', path: '/inventory/items' },
        { label: item?.product?.name || (item as any)?.tagCode || 'Item Detail' }
      ]} />
      {/* Back Button & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/inventory-items')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181B' }}>
                {(item as any).productName || item.product?.name || item.itemCode}
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
              Showroom Location: <strong>{item.branch?.name || 'Main Showroom'}</strong> · Brand: <strong>{(item as any).brand || 'JMS Heritage'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-emerald" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Status: {item.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid #C6A15B' : '2px solid transparent',
            color: activeTab === 'overview' ? '#C6A15B' : '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Layers size={16} /> Product Specifications & Barcode
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          style={{
            padding: '10px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'photos' ? '2px solid #C6A15B' : '2px solid transparent',
            color: activeTab === 'photos' ? '#C6A15B' : '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Camera size={16} /> Photographs
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'history' ? '2px solid #C6A15B' : '2px solid transparent',
            color: activeTab === 'history' ? '#C6A15B' : '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <History size={16} /> Stock History & Movements ({historyData.movements?.length || 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hierarchy & Product Details */}
            <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="#C6A15B" /> Brand & Category Hierarchy
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.86rem' }}>
                <div><span style={{ color: '#64748B' }}>Brand / Collection:</span> <strong style={{ color: '#C6A15B' }}>{(item as any).brand || 'JMS Heritage'}</strong></div>
                <div><span style={{ color: '#64748B' }}>Category:</span> <strong>{item.product?.category?.name || 'Gold Jewellery'}</strong></div>
                <div><span style={{ color: '#64748B' }}>Subcategory:</span> <strong>{item.product?.subCategory?.name || 'Jewellery'}</strong></div>
                <div><span style={{ color: '#64748B' }}>Product Name:</span> <strong>{(item as any).productName || item.product?.name || 'Jewellery Piece'}</strong></div>
                {(item as any).huidCode && (
                  <div><span style={{ color: '#64748B' }}>Hallmark HUID / Cert:</span> <strong>{(item as any).huidCode}</strong></div>
                )}
              </div>
              {((item as any).description || item.product?.description) && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '0.84rem', color: '#4B5563' }}>
                  <span style={{ fontWeight: 600, color: '#1F2937' }}>Description: </span>
                  {(item as any).description || item.product?.description}
                </div>
              )}
            </div>

            {/* Weights Breakdown */}
            <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#C6A15B" /> Karat Purity & Weight Breakdown
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Gross Weight</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181B' }}>{item.grossWeight}g</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Net Metal Weight</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{item.netWeight}g</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Stone Weight</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>{item.stoneWeight || '0.000'}g</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.86rem' }}>
                <div><span style={{ color: '#64748B' }}>Purity Standard:</span> <strong style={{ color: '#C6A15B' }}>{item.purity}</strong></div>
                <div><span style={{ color: '#64748B' }}>Metal Type:</span> <strong>{item.metalType || item.product?.metalType || 'GOLD'}</strong></div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={18} color="#C6A15B" /> Price Valuation & Making Charges
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#F0FDF6', border: '1px solid rgba(5,150,105,0.25)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Jeweller Cost Price
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
                    ₹{Number(costPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div style={{ background: 'rgba(198,161,91,0.08)', border: '1px solid rgba(198,161,91,0.35)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92700A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tagged Market / Selling Price
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C6A15B', marginTop: '4px' }}>
                    ₹{Number(marketPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Barcode Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', textAlign: 'center', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Barcode size={18} color="#C6A15B" /> Unique Barcode Tag Label
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarcodeViewer value={cleanUniqueTag} showLabel={false} width={220} height={70} />
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px', fontSize: '0.82rem', textAlign: 'left' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>Barcode Tag Number: </span>
                  <strong style={{ color: '#C6A15B', fontFamily: 'monospace' }}>{cleanUniqueTag}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Showroom: </span>
                  <strong>{item.branch?.name || 'Connaught Place'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Photos */}
      {activeTab === 'photos' && (
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px' }}>
          <InventoryItemImageGallery inventoryItemId={item.id} itemCode={cleanUniqueTag} />
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#C6A15B" /> Piece Stock In & Out History
          </h3>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status / Type</th>
                  <th>Source Branch</th>
                  <th>Destination Branch</th>
                  <th>Reference</th>
                  <th>Remarks</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyData.movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>No historical stock movements recorded.</td>
                  </tr>
                ) : (
                  historyData.movements.map((m: any) => {
                    const isOut = m.movementType === 'STOCK_OUT' || m.movementType === 'SALE';
                    const isIn = m.movementType === 'STOCK_IN' || m.movementType === 'PURCHASE';
                    const badgeClass = isOut ? 'badge-gold' : isIn ? 'badge-emerald' : 'badge-blue';
                    const labelText = isOut ? 'Stock Out' : isIn ? 'Stock In' : m.movementType;

                    return (
                      <tr key={m.id}>
                        <td><span className={`badge ${badgeClass}`}>{labelText}</span></td>
                        <td>{m.fromBranch?.name || '-'}</td>
                        <td>{m.toBranch?.name || '-'}</td>
                        <td><code>{m.referenceType || 'MANUAL'}</code></td>
                        <td>{m.remarks || '-'}</td>
                        <td>{new Date(m.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
