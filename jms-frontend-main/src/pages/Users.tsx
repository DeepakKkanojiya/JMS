import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, Search, CheckCircle, XCircle, Plus, Edit2, Trash2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const Users: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const roleObj = user?.role;
  const roleCode = (typeof roleObj === 'string' ? roleObj : roleObj?.code || roleObj?.name || 'ADMIN').toUpperCase();
  const canCreate = hasPermission('user.create');
  const canUpdate = hasPermission('user.update');
  const canDelete = hasPermission('user.delete');

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users', {
        params: { search: search || undefined, page: 1, limit: 20 },
      });
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiClient.get('/roles');
      if (res.data?.success) {
        setRoles(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: 'Admin@123',
      roleId: roles.length > 0 ? roles[0].id : '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      roleId: u.roleId || u.role?.id || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (u: any) => {
    const isCurrentlyActive = u.status === 'ACTIVE' || u.isActive === true;
    const action = isCurrentlyActive ? 'deactivate' : 'activate';
    try {
      await apiClient.patch(`/users/${u.id}/${action}`);
      fetchUsers();
    } catch (err: any) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/users/${deletingUser.id}`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          roleId: formData.roleId || undefined,
        });
      } else {
        await apiClient.post('/users', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId || undefined,
        });
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UsersIcon color="var(--gold-primary)" /> IAM Users & Access Control
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Role-Based User Administration, status toggles, and security privileges.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add New User
            </button>
          )}
          <button onClick={fetchUsers} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status (On / Off)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>Loading user data...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No users found in database.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isUserActive = u.status === 'ACTIVE' || u.isActive === true;
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.firstName} {u.lastName}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role?.name?.toUpperCase() === 'OWNER' || u.role?.code === 'OWNER' ? 'badge-gold' : u.role?.name?.toUpperCase() === 'BRANCH_MANAGER' ? 'badge-blue' : 'badge-emerald'}`}>
                        {u.role?.name || u.role?.code || 'User'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => canUpdate && handleToggleStatus(u)}
                        disabled={!canUpdate}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: canUpdate ? 'pointer' : 'default',
                        }}
                        title={`Click to switch ${isUserActive ? 'OFF (Deactivate)' : 'ON (Activate)'}`}
                      >
                        {/* iOS-Style Switch Toggle */}
                        <div
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            background: isUserActive ? '#10B981' : '#CBD5E1',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isUserActive ? 'flex-end' : 'flex-start',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isUserActive ? '0 0 10px rgba(16, 185, 129, 0.45)' : 'none',
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: isUserActive ? '#059669' : '#64748B',
                            letterSpacing: '0.4px',
                          }}
                        >
                          {isUserActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </button>
                    </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Edit User"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--accent-red)' }}
                          title="Delete User"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${deletingUser?.firstName} ${deletingUser?.lastName || ''}" (${deletingUser?.email})? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingUser(null)}
      />

      {/* CRUD Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 className="gold-text" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingUser ? 'Edit User Profile' : 'Add New IAM User Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '16px',
                color: 'var(--accent-red)',
                fontSize: '0.85rem',
              }}>
                <AlertCircle size={16} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{formErrors.email}</span>}
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  {formErrors.password && <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{formErrors.password}</span>}
                </div>
              )}

              {roles.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Assign Role</label>
                  <select
                    className="form-input"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
