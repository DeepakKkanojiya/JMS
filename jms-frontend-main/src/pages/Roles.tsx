import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';

export const Roles: React.FC = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/roles');
      if (res?.data?.success || Array.isArray(res?.data)) {
        setRoles(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <Shield color="#C6A15B" /> System Roles Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            RBAC System Roles defined in iam.roles.
          </p>
        </div>
        <button onClick={fetchRoles} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Role Code</th>
              <th>Description</th>
              <th>Permissions Count</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>Loading roles...</td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>No roles found.</td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td><strong style={{ color: '#C6A15B' }}>{r.code}</strong></td>
                  <td>{r.description || 'System RBAC role'}</td>
                  <td><span className="badge badge-gold">{r.permissions?.length || r.permissionCount || 'Dynamic'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
