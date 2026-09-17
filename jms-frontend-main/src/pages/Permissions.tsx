import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Key, RefreshCw, Search } from 'lucide-react';

export const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/permissions');
      if (res?.data?.success || Array.isArray(res?.data)) {
        setPermissions(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.key || p.name || '').toLowerCase().includes(term) ||
      (p.module || p.category || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <Key color="#C6A15B" /> System Permissions Dictionary
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Granular system permission keys used for backend enforcement & frontend authority rendering.
          </p>
        </div>
        <button onClick={fetchPermissions} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search permission keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Permission Key</th>
              <th>Module / Category</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '30px' }}>Loading permissions dictionary...</td>
              </tr>
            ) : filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>No permissions found.</td>
              </tr>
            ) : (
              filteredPermissions.map((p, idx) => (
                <tr key={p.id || idx}>
                  <td><code style={{ fontSize: '0.85rem', color: '#C6A15B', fontWeight: 700 }}>{p.key || p.name}</code></td>
                  <td><span className="badge badge-blue">{p.module || p.category || 'General'}</span></td>
                  <td>{p.description || 'Access control permission key'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
