import React, { useState, useEffect } from 'react';
import { metalRatesApi, MetalRate, MetalType } from '../api/metalRates';
import { companiesApi } from '../api/companies';
import { useAuth } from '../context/AuthContext';
import { parseValidationErrors } from '../api/client';
import { useEscapeKey } from '../hooks/useEscapeKey';
import {
  Gem,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle,
  TrendingUp,
  History,
  ShieldAlert,
  PowerOff,
  Coins,
} from 'lucide-react';

export const MetalRates: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('metal_rate.create');
  const canUpdate = hasPermission('metal_rate.update');

  const [rates, setRates] = useState<MetalRate[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentRates, setCurrentRates] = useState<Record<string, MetalRate | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Filters
  const [search, setSearch] = useState('');
  const [metalFilter, setMetalFilter] = useState<MetalType | ''>('');
  const [purityFilter, setPurityFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Create Rate Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    metalType: 'GOLD' as MetalType,
    purity: '22K',
    marketRate: '',
    ratePerGram: '',
    effectiveFrom: new Date().toISOString().slice(0, 16),
    effectiveTo: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deactivate Confirmation Modal
  const [deactivatingRate, setDeactivatingRate] = useState<MetalRate | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Success Feedback Toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live Market Prices
  const [liveMarketPrices, setLiveMarketPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await metalRatesApi.getLiveMarketRates();
        if (res?.data?.rates && Array.isArray(res.data.rates)) {
          const prices: Record<string, number> = {};
          for (const item of res.data.rates) {
            const key = `${item.metalType}_${item.purity}`;
            prices[key] = item.ratePerGram;
          }
          setLiveMarketPrices(prices);
        }
      } catch (err) {
        console.error('Failed to fetch live benchmark prices from GoodReturns/IBJA feed:', err);
      }
    };
    fetchLivePrices();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (feedback?.type === 'success') {
      timer = setTimeout(() => setFeedback(null), 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [feedback]);

  useEffect(() => {
    fetchRates();
  }, [search, metalFilter, purityFilter, companyFilter, activeFilter, page, activeTab]);

  const fetchInitialData = async () => {
    try {
      const compRes = await companiesApi.list();
      const compList = compRes?.data || [];
      setCompanies(compList);
      if (compList.length > 0 && !formData.companyId) {
        setFormData((prev) => ({ ...prev, companyId: compList[0].id }));
      }
      fetchCurrentTickerRates(compList[0]?.id);
    } catch (e) {
      console.error('Failed to load companies:', e);
    }
  };

  const fetchCurrentTickerRates = async (companyId?: string) => {
    if (!companyId) return;
    const tickerPairs: Array<{ metalType: MetalType; purity: string; key: string }> = [
      { metalType: 'GOLD', purity: '24K', key: 'GOLD_24K' },
      { metalType: 'GOLD', purity: '22K', key: 'GOLD_22K' },
      { metalType: 'GOLD', purity: '18K', key: 'GOLD_18K' },
      { metalType: 'SILVER', purity: '999', key: 'SILVER_999' },
      { metalType: 'PLATINUM', purity: '950', key: 'PLATINUM_950' },
    ];

    const results: Record<string, MetalRate | null> = {};
    for (const pair of tickerPairs) {
      try {
        const res = await metalRatesApi.getCurrentRate({
          companyId,
          metalType: pair.metalType,
          purity: pair.purity,
        });
        results[pair.key] = res?.data || null;
      } catch {
        results[pair.key] = null;
      }
    }
    setCurrentRates(results);
  };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const fetcher = activeTab === 'history' ? metalRatesApi.getHistory : metalRatesApi.list;
      const res = await fetcher({
        search: search || undefined,
        metalType: metalFilter || undefined,
        purity: purityFilter || undefined,
        companyId: companyFilter || undefined,
        isActive: activeTab === 'current' ? (activeFilter !== undefined ? activeFilter : true) : undefined,
        page,
        limit: 12,
      });

      if (res?.success || Array.isArray(res?.data)) {
        setRates(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching metal rates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch market rate when modal opens or metal/purity changes
  // Automatically fetch market rate from GoodReturns/IBJA feed when modal opens or metal/purity changes
  useEffect(() => {
    if (!isModalOpen) return;

    let isMounted = true;
    const fetchRate = async () => {
      setIsFetchingApi(true);
      setFormErrors((prev) => ({ ...prev, marketRate: '' }));

      try {
        const res = await metalRatesApi.getLiveMarketRates();
        const found = res?.data?.rates?.find(
          (r: any) =>
            r.metalType === formData.metalType &&
            r.purity.toLowerCase() === formData.purity.toLowerCase()
        );

        let finalRate = found?.ratePerGram || 0;
        if (!finalRate) {
          const gold24k =
            res?.data?.rates?.find((r: any) => r.metalType === 'GOLD' && r.purity === '24K')
              ?.ratePerGram || 7450;
          if (formData.metalType === 'GOLD') {
            const p = parseInt(formData.purity.replace('K', ''));
            if (!isNaN(p)) finalRate = gold24k * (p / 24);
          } else if (formData.metalType === 'SILVER') {
            const p = parseInt(formData.purity);
            if (!isNaN(p)) finalRate = 89 * (p / 999);
          } else if (formData.metalType === 'PLATINUM') {
            finalRate = 3250;
          }
        }

        if (isMounted && finalRate > 0) {
          setFormData((prev) => ({
            ...prev,
            marketRate: finalRate.toFixed(2),
            ratePerGram: prev.ratePerGram ? prev.ratePerGram : finalRate.toFixed(2),
          }));
        }
      } catch (err) {
        console.error('Failed to fetch from GoodReturns benchmark API:', err);
      } finally {
        if (isMounted) setIsFetchingApi(false);
      }
    };

    fetchRate();
    return () => {
      isMounted = false;
    };
  }, [isModalOpen, formData.metalType, formData.purity]);

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    try {
      if (!formData.companyId) throw new Error('Please select a company');
      if (!formData.ratePerGram || parseFloat(formData.ratePerGram) <= 0) {
        throw new Error('Rate per gram must be greater than 0');
      }

      await metalRatesApi.create({
        companyId: formData.companyId,
        metalType: formData.metalType,
        purity: formData.purity.trim(),
        marketRatePerGram: formData.marketRate ? parseFloat(formData.marketRate) : null,
        ratePerGram: parseFloat(formData.ratePerGram),
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
      });

      setFeedback({ type: 'success', message: `Metal Rate for ${formData.metalType} (${formData.purity}) published successfully!` });
      setIsModalOpen(false);
      setFormData({
        companyId: companies[0]?.id || '',
        metalType: 'GOLD',
        purity: '22K',
        marketRate: '',
        ratePerGram: '',
        effectiveFrom: new Date().toISOString().slice(0, 16),
        effectiveTo: '',
      });
      fetchRates();
      fetchCurrentTickerRates(formData.companyId);
    } catch (err: any) {
      const fieldErrors = parseValidationErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      } else {
        setFormErrors({ general: err.response?.data?.message || err.message || 'Failed to save rate' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingRate) return;
    setIsDeactivating(true);
    try {
      await metalRatesApi.deactivate(deactivatingRate.id);
      setFeedback({ type: 'success', message: `Metal Rate for ${deactivatingRate.metalType} (${deactivatingRate.purity}) deactivated.` });
      setDeactivatingRate(null);
      fetchRates();
      if (companies[0]?.id) fetchCurrentTickerRates(companies[0].id);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to deactivate rate.' });
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>
            Today's Gold & Metal Rates
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Set and update daily gold (24K, 22K, 18K), silver, and platinum rates for billing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              fetchRates();
              if (companies[0]?.id) fetchCurrentTickerRates(companies[0].id);
            }}
            className="btn btn-secondary"
            title="Refresh Rates"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} />
              <span>Publish Daily Rate</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
            color: feedback.type === 'success' ? '#065F46' : '#991B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} style={{ color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Live Market Benchmark Ticker Cards */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          {[
            { label: '24K Pure Gold', key: 'GOLD_24K', metal: 'GOLD', purity: '24K', color: '#C6A15B' },
            { label: '22K Standard Gold', key: 'GOLD_22K', metal: 'GOLD', purity: '22K', color: '#C6A15B' },
            { label: '18K Jewellery Gold', key: 'GOLD_18K', metal: 'GOLD', purity: '18K', color: '#C6A15B' },
            { label: '999 Fine Silver', key: 'SILVER_999', metal: 'SILVER', purity: '999', color: '#94A3B8' },
            { label: '950 Platinum', key: 'PLATINUM_950', metal: 'PLATINUM', purity: '950', color: '#6366F1' },
          ].map((card) => {
            const current = currentRates[card.key];
            return (
              <div
                key={card.key}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '16px 20px',
                  borderTop: `4px solid ${card.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>{card.label}</span>
                    <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                      {card.purity}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Market Price</span>
                      {liveMarketPrices[card.key] ? <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>Live</span> : current?.marketRatePerGram ? <span style={{ fontSize: '0.65rem', color: '#64748B' }}>DB</span> : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B' }}>
                        ₹{liveMarketPrices[card.key] ? liveMarketPrices[card.key].toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : current?.marketRatePerGram ? parseFloat(current.marketRatePerGram.toString()).toLocaleString('en-IN') : '—'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>/g</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>Jeweller Price</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                        ₹{current?.ratePerGram ? parseFloat(current.ratePerGram.toString()).toLocaleString('en-IN') : '—'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>/g</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: current ? '#059669' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} />
                  <span>{current ? `Active from ${new Date(current.effectiveFrom).toLocaleDateString()}` : 'No active rate set'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => { setActiveTab('current'); setPage(1); }}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'current' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'current' ? '#18181B' : '#64748B',
                boxShadow: activeTab === 'current' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Active Rates Directory
            </button>
            <button
              onClick={() => { setActiveTab('history'); setPage(1); }}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'history' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'history' ? '#18181B' : '#64748B',
                boxShadow: activeTab === 'history' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <History size={14} />
              <span>Historical Rate Ledger</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search purity, metal..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="form-input"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
              />
            </div>

            <select
              value={metalFilter}
              onChange={(e) => { setMetalFilter(e.target.value as any); setPage(1); }}
              className="form-input"
              style={{ width: '130px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Metals</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="PLATINUM">Platinum</option>
            </select>

            <select
              value={purityFilter}
              onChange={(e) => { setPurityFilter(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: '120px', height: '36px', fontSize: '0.82rem' }}
            >
              <option value="">All Purities</option>
              <option value="24K">24K</option>
              <option value="22K">22K</option>
              <option value="18K">18K</option>
              <option value="14K">14K</option>
              <option value="999">999 (Silver)</option>
              <option value="950">950 (Platinum)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Metal</th>
                <th>Purity</th>
                <th>Market Price</th>
                <th>Jeweller Price</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading metal rates...</div>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <Gem size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#475569' }}>No metal rates found</div>
                    <div style={{ fontSize: '0.8rem' }}>Publish a new daily rate to start sales and rate locking.</div>
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id}>
                    <td>
                      <span className={`badge ${rate.metalType === 'GOLD' ? 'badge-gold' : rate.metalType === 'SILVER' ? 'badge-platinum' : 'badge-blue'}`}>
                        {rate.metalType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#18181B' }}>{rate.purity}</td>
                    <td style={{ fontWeight: 600, fontSize: '0.9rem', color: '#64748B' }}>
                      ₹{rate.marketRatePerGram ? parseFloat(rate.marketRatePerGram.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.96rem', color: '#047857' }}>
                      ₹{parseFloat(rate.ratePerGram.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {new Date(rate.effectiveFrom).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: rate.effectiveTo ? '#64748B' : '#059669' }}>
                      {rate.effectiveTo ? new Date(rate.effectiveTo).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Indefinite (Active)'}
                    </td>
                    <td>
                      <span className={`badge ${rate.isActive ? 'badge-emerald' : 'badge-ruby'}`}>
                        {rate.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      {canUpdate && rate.isActive && (
                        <button
                          onClick={() => setDeactivatingRate(rate)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                          title="Deactivate Rate"
                        >
                          <PowerOff size={14} />
                          <span>Deactivate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Showing {rates.length} of {pagination.total} records (Page {page} of {pagination.totalPages})
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Publish Rate Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(198,161,91,0.15)', color: '#C6A15B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>Publish Daily Metal Rate</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Publishing automatically closes any previous active rate for this purity.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {formErrors.general && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #F87171', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.82rem', marginBottom: '16px' }}>
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleCreateRate}>
              <div className="form-group">
                <label className="form-label">Company / Organization *</label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="form-input"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Precious Metal *</label>
                  <select
                    value={formData.metalType}
                    onChange={(e) => setFormData({ ...formData, metalType: e.target.value as MetalType })}
                    className="form-input"
                    required
                  >
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purity Grade *</label>
                  <input
                    type="text"
                    value={formData.purity}
                    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                    placeholder="e.g. 24K, 22K, 18K, 999"
                    className="form-input"
                    required
                  />
                  {formErrors.purity && <span style={{ color: '#DC2626', fontSize: '0.75rem' }}>{formErrors.purity}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Market Live Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.marketRate}
                    onChange={(e) => setFormData({ ...formData, marketRate: e.target.value })}
                    placeholder={isFetchingApi ? "Fetching..." : "e.g. 13500.00"}
                    className="form-input"
                    disabled={isFetchingApi}
                    style={{ fontSize: '1.1rem', fontWeight: 600, opacity: isFetchingApi ? 0.7 : 1 }}
                  />
                  {formErrors.marketRate && <span style={{ color: '#DC2626', fontSize: '0.75rem' }}>{formErrors.marketRate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Jeweller Rate Per Gram (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.ratePerGram}
                    onChange={(e) => setFormData({ ...formData, ratePerGram: e.target.value })}
                    placeholder="e.g. 6850.00"
                    className="form-input"
                    required
                    style={{ fontSize: '1.1rem', fontWeight: 700, color: '#047857', borderColor: '#34D399', background: '#F0FDF4' }}
                  />
                  {formErrors.ratePerGram && <span style={{ color: '#DC2626', fontSize: '0.75rem' }}>{formErrors.ratePerGram}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Effective From *</label>
                  <input
                    type="datetime-local"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Effective To (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-gold">
                  {isSubmitting ? 'Publishing...' : 'Publish Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivatingRate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#DC2626' }}>
              <ShieldAlert size={28} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181B' }}>Deactivate Metal Rate</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to deactivate the <strong>{deactivatingRate.metalType} ({deactivatingRate.purity})</strong> rate of ₹{parseFloat(deactivatingRate.ratePerGram.toString())}/g?
              New sales will require publishing a new active benchmark rate.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setDeactivatingRate(null)} className="btn btn-secondary">Cancel</button>
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="btn btn-primary"
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
