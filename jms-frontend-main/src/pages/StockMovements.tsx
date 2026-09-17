import React, { useState, useEffect } from 'react';
import { stockMovementsApi, StockMovement, MovementType } from '../api/stockMovements';
import { branchesApi } from '../api/branches';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Search, Filter, RefreshCw, Eye, X, ShieldAlert } from 'lucide-react';

export const StockMovements: React.FC = () => {
  const { hasPermission } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Detail Modal State
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  useEffect(() => {
    fetchMovements();
    fetchBranches();
  }, [search, typeFilter, branchFilter, dateFrom, dateTo, page]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await stockMovementsApi.list({
        search: search || undefined,
        movementType: typeFilter || undefined,
        branchId: branchFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 15,
      });

      if (res?.success || Array.isArray(res?.data)) {
        setMovements(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching stock movements ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await branchesApi.list({ limit: 100 });
      setBranches(res?.data || []);
    } catch (e) {
      // Fallback
    }
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'STOCK_IN':
      case 'PURCHASE': return <span className="badge badge-emerald">Stock In</span>;
      case 'STOCK_OUT':
      case 'SALE': return <span className="badge badge-gold">Stock Out</span>;
      case 'TRANSFER': return <span className="badge badge-blue">Transfer</span>;
      case 'ADJUSTMENT': return <span className="badge badge-amber">Adjustment</span>;
      case 'REPAIR_OUT':
      case 'REPAIR_IN': return <span className="badge badge-gray">Repair</span>;
      default: return <span className="badge badge-gray">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <ArrowLeftRight color="#C6A15B" /> Stock In & Out Movement History
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '2px' }}>
            Track every piece added to inventory, sold at checkout counter, or transferred between branches.
          </p>
        </div>
        <button onClick={fetchMovements} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search SKU, item code, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>

        <select className="form-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '160px', padding: '8px 12px' }}>
          <option value="">All Movement Types</option>
          <option value="STOCK_IN">STOCK_IN</option>
          <option value="STOCK_OUT">STOCK_OUT</option>
          <option value="TRANSFER">TRANSFER</option>
          <option value="ADJUSTMENT">ADJUSTMENT</option>
          <option value="SALE">SALE</option>
          <option value="SALE_RETURN">SALE_RETURN</option>
          <option value="PURCHASE">PURCHASE</option>
          <option value="PURCHASE_RETURN">PURCHASE_RETURN</option>
          <option value="REPAIR_OUT">REPAIR_OUT</option>
          <option value="REPAIR_IN">REPAIR_IN</option>
        </select>

        <select className="form-input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ width: '170px', padding: '8px 12px' }}>
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '140px', padding: '7px 10px', fontSize: '0.8rem' }} title="From Date" />
        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '140px', padding: '7px 10px', fontSize: '0.8rem' }} title="To Date" />
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Movement Type</th>
              <th>Item Code / SKU</th>
              <th>From Branch</th>
              <th>To Branch</th>
              <th>Reference</th>
              <th>Performed By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>Loading stock ledger...</td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No stock movements match the selected filters.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{getMovementBadge(m.movementType)}</td>
                  <td>
                    <strong style={{ color: '#C6A15B' }}>{m.inventoryItem?.itemCode || m.inventoryItemId}</strong>
                    {m.inventoryItem?.product?.name && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{m.inventoryItem.product.name}</div>}
                  </td>
                  <td>{m.fromBranch?.name || '-'}</td>
                  <td>{m.toBranch?.name || '-'}</td>
                  <td><code>{m.referenceType || 'MANUAL'}</code></td>
                  <td>{m.performedByUser?.name || m.performedBy || 'System'}</td>
                  <td>
                    {/* View Details ONLY — Immutable Log */}
                    <button onClick={() => setSelectedMovement(m)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      <Eye size={13} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Movement Detail Modal */}
      {selectedMovement && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181B' }}>
                  Stock Movement Log Details
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {selectedMovement.id}</span>
              </div>
              <button onClick={() => setSelectedMovement(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#64748B' }}>Movement Type:</span> {getMovementBadge(selectedMovement.movementType)}</div>
              <div><span style={{ color: '#64748B' }}>Item Code:</span> <strong style={{ color: '#C6A15B' }}>{selectedMovement.inventoryItem?.itemCode || selectedMovement.inventoryItemId}</strong></div>
              <div><span style={{ color: '#64748B' }}>Source Branch:</span> <strong>{selectedMovement.fromBranch?.name || 'N/A'}</strong></div>
              <div><span style={{ color: '#64748B' }}>Destination Branch:</span> <strong>{selectedMovement.toBranch?.name || 'N/A'}</strong></div>
              <div><span style={{ color: '#64748B' }}>Reference Type / ID:</span> <code>{selectedMovement.referenceType || 'N/A'} {selectedMovement.referenceId ? `(${selectedMovement.referenceId})` : ''}</code></div>
              <div><span style={{ color: '#64748B' }}>Remarks:</span> <span>{selectedMovement.remarks || 'No remarks recorded.'}</span></div>
              <div><span style={{ color: '#64748B' }}>Performed By:</span> <strong>{selectedMovement.performedByUser?.name || selectedMovement.performedByUser?.email || 'System Admin'}</strong></div>
              <div><span style={{ color: '#64748B' }}>Timestamp:</span> <span>{new Date(selectedMovement.createdAt).toLocaleString()}</span></div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setSelectedMovement(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
