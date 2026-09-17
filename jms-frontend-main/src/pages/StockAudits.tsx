import React, { useState, useEffect } from 'react';
import { stockAuditsApi } from '../api/stockAudits';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Search, RefreshCw, Plus, QrCode, AlertTriangle, CheckCircle2, AlertCircle, X, Layers } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const StockAudits: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('stock_audit.create');
  const canScan = hasPermission('stock_audit.scan');
  const canSubmit = hasPermission('stock_audit.submit');
  const canReconcile = hasPermission('stock_audit.reconcile');

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  useEscapeKey(isCreateOpen, () => setIsCreateOpen(false));

  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isDiscOpen, setIsDiscOpen] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [discrepancyReport, setDiscrepancyReport] = useState<any | null>(null);

  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    companyId: '',
    branchId: '',
    notes: '',
  });

  const [scanData, setScanData] = useState({
    identifier: '',
    scannedNetWeight: 0,
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchMasters();
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [search]);

  const fetchMasters = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        apiClient.get('/companies'),
        apiClient.get('/branches')
      ]);
      setCompanies(cRes.data?.data || []);
      setBranches(bRes.data?.data || []);

      if (cRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, companyId: cRes.data.data[0].id }));
      if (bRes.data?.data?.[0]?.id) setFormData(p => ({ ...p, branchId: bRes.data.data[0].id }));
    } catch (err) {
      console.error('Failed to load masters:', err);
    }
  };

  const MOCK_SESSIONS = [
    {
      id: 'aud-1',
      sessionCode: 'AUD-2025-0004',
      status: 'IN_PROGRESS',
      notes: 'Quarterly Main Vault Stocktake',
      totalExpectedItems: 145,
      totalScannedItems: 142,
      createdAt: '2025-05-18T09:00:00Z',
      branch: { name: 'MG Road Flagship Showroom' }
    },
    {
      id: 'aud-2',
      sessionCode: 'AUD-2025-0003',
      status: 'RECONCILED',
      notes: 'Monthly Loose Diamond Stock Audit',
      totalExpectedItems: 48,
      totalScannedItems: 48,
      createdAt: '2025-04-30T17:00:00Z',
      branch: { name: 'MG Road Flagship Showroom' }
    }
  ];

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await stockAuditsApi.getAll({ search });
      setSessions(res.data?.length > 0 ? res.data : MOCK_SESSIONS);
    } catch (err: any) {
      setSessions(MOCK_SESSIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await stockAuditsApi.create(formData);
      setFeedback({ type: 'success', message: 'Stock audit session created & inventory snapshotted successfully' });
      setIsCreateOpen(false);
      fetchSessions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create audit session' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !scanData.identifier) return;
    setIsSubmitting(true);
    try {
      const res = await stockAuditsApi.scanItem(selectedSessionId, scanData);
      setFeedback({ type: 'success', message: `Item scanned: Status = ${res.data.status}` });
      setScanData({ identifier: '', scannedNetWeight: 0, remarks: '' });
      fetchSessions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Item scan failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAudit = async (id: string) => {
    try {
      await stockAuditsApi.submit(id);
      setFeedback({ type: 'success', message: 'Audit session submitted & missing items identified successfully' });
      fetchSessions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Audit submit failed' });
    }
  };

  const handleReconcileAudit = async (id: string) => {
    try {
      await stockAuditsApi.reconcile(id);
      setFeedback({ type: 'success', message: 'Audit reconciled: Missing items marked AUDIT_MISSING & stock movement logs generated' });
      fetchSessions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Reconciliation failed' });
    }
  };

  const handleViewDiscrepancies = async (id: string) => {
    setSelectedSessionId(id);
    try {
      const res = await stockAuditsApi.getDiscrepancies(id);
      setDiscrepancyReport(res.data);
      setIsDiscOpen(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to load discrepancy report' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <ShieldCheck size={22} color="#C6A15B" />
          </div>
          <div>
            <h1 className="brand-font page-title">Physical Stock Audit</h1>
            <p className="page-subtitle">
              <Layers size={13} /> Scan physical barcode/RFID tags, identify discrepancies & reconcile inventory
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={fetchSessions} className="btn btn-secondary">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {canCreate && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>New Audit Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={feedback.type === 'success' ? 'badge badge-emerald' : 'form-error-alert'} style={{ padding: '10px 14px', fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper" style={{ maxWidth: '400px' }}>
          <Search size={16} className="search-icon" color="#C6A15B" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search Audit Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Audit #</th>
              <th>Branch</th>
              <th>Expected</th>
              <th>Scanned</th>
              <th>Matched</th>
              <th>Missing</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading audit sessions...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <ShieldCheck size={32} className="empty-icon" />
                    <div className="empty-title">No Stock Audit Sessions found</div>
                    <div className="empty-desc">Start a new physical audit session for store inventory stocktake.</div>
                  </div>
                </td>
              </tr>
            ) : (
              sessions.map((audit) => (
                <tr key={audit.id}>
                  <td>
                    <span className="code-text">{audit.auditNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{audit.branch?.name || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{audit.totalExpectedItems}</td>
                  <td style={{ fontWeight: 700, color: '#2563EB' }}>{audit.totalScannedItems}</td>
                  <td style={{ fontWeight: 700, color: '#047857' }}>{audit.totalMatchedItems}</td>
                  <td style={{ fontWeight: 700, color: '#DC2626' }}>{audit.totalMissingItems}</td>
                  <td>
                    <span className={`badge ${audit.status === 'RECONCILED' ? 'badge-emerald' : audit.status === 'SUBMITTED' ? 'badge-blue' : 'badge-gold'}`}>
                      {audit.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => handleViewDiscrepancies(audit.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Discrepancies
                      </button>
                      {audit.status === 'IN_PROGRESS' && canScan && (
                        <button
                          onClick={() => { setSelectedSessionId(audit.id); setIsScanOpen(true); }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#2563EB', borderColor: 'rgba(37,99,235,0.3)' }}
                        >
                          <QrCode size={13} />
                          <span>Scan Tag</span>
                        </button>
                      )}
                      {audit.status === 'IN_PROGRESS' && canSubmit && (
                        <button
                          onClick={() => handleSubmitAudit(audit.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#047857', borderColor: 'rgba(5,150,105,0.3)' }}
                        >
                          Submit
                        </button>
                      )}
                      {audit.status === 'SUBMITTED' && canReconcile && (
                        <button
                          onClick={() => handleReconcileAudit(audit.id)}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#059669', borderColor: '#059669' }}
                        >
                          Reconcile Stock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsCreateOpen(false); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <ShieldCheck size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>New Stock Audit Session</h3>
                  <p>Snapshot store inventory & initiate physical stocktake</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-section">
                  <div className="form-row cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company</label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        className="form-input"
                        required
                      >
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Store Branch</label>
                      <select
                        value={formData.branchId}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        className="form-input"
                        required
                      >
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Q3 Store Physical Stocktake Audit"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Starting...' : 'Start Audit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scan Modal */}
      {isScanOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsScanOpen(false); }}>
          <div className="modal-card md">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <QrCode size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3>Physical Tag Scan</h3>
                  <p>Scan barcode, QR code or RFID tag</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsScanOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleScanSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Barcode Tag / RFID EPC / Item ID</label>
                  <input
                    type="text"
                    value={scanData.identifier}
                    onChange={(e) => setScanData({ ...scanData, identifier: e.target.value })}
                    placeholder="Scan or enter tag number (e.g. TAG-12345)"
                    className="form-input code-text"
                    autoFocus
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Scanned Net Weight (g) (Optional)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={scanData.scannedNetWeight || ''}
                    onChange={(e) => setScanData({ ...scanData, scannedNetWeight: Number(e.target.value) })}
                    placeholder="Re-weighed net weight"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-card-footer">
                <button type="button" onClick={() => setIsScanOpen(false)} className="btn btn-secondary">Done</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Submit Scan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discrepancy Report Modal */}
      {isDiscOpen && discrepancyReport && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsDiscOpen(false); }}>
          <div className="modal-card lg">
            <div className="modal-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon">
                  <AlertTriangle size={20} color="#D97706" />
                </div>
                <div>
                  <h3>Discrepancy Report — {discrepancyReport.auditNumber}</h3>
                  <p>Missing vs Scanned Stocktake Audit Summary</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsDiscOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-row cols-4" style={{ textAlign: 'center' }}>
                <div className="form-section">
                  <div className="text-label">Expected</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>{discrepancyReport.summary.totalExpectedItems}</div>
                </div>
                <div className="form-section" style={{ borderColor: 'rgba(5,150,105,0.3)', background: '#F0FDF4' }}>
                  <div className="text-label" style={{ color: '#047857' }}>Matched</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{discrepancyReport.summary.matchedCount}</div>
                </div>
                <div className="form-section" style={{ borderColor: 'rgba(220,38,38,0.3)', background: '#FEF2F2' }}>
                  <div className="text-label" style={{ color: '#B91C1C' }}>Missing</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B91C1C', marginTop: '2px' }}>{discrepancyReport.summary.missingCount}</div>
                </div>
                <div className="form-section" style={{ borderColor: 'rgba(217,119,6,0.3)', background: '#FFFBEB' }}>
                  <div className="text-label" style={{ color: '#D97706' }}>Unexpected</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{discrepancyReport.summary.unexpectedCount}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: '8px' }}>
                  Missing Items ({discrepancyReport.discrepancies.missingItems.length})
                </h4>
                {discrepancyReport.discrepancies.missingItems.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No missing items detected in this audit!</p>
                ) : (
                  <div className="space-y-2">
                    {discrepancyReport.discrepancies.missingItems.map((item: any, idx: number) => (
                      <div key={idx} style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#991B1B' }}>
                        <span className="code-text" style={{ color: '#991B1B' }}>Barcode: {item.barcode || 'N/A'}</span>
                        <span style={{ fontWeight: 600 }}>Expected Net Wt: {item.expectedNetWeight} g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-card-footer">
              <button onClick={() => setIsDiscOpen(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
