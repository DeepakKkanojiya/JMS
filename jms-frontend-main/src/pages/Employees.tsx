import React, { useState, useEffect } from 'react';
import { apiClient, parseValidationErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Search, RefreshCw, Phone, Mail, BadgeCheck, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const Employees: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('employee.create');
  const canUpdate = hasPermission('employee.update');
  const canDelete = hasPermission('employee.delete');

  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deletingEmployee, setDeletingEmployee] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    branchId: '',
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    designation: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchBranches = async () => {
    try {
      const res = await apiClient.get('/branches');
      if (res.data?.success) {
        setBranches(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/employees', {
        params: { search: search || undefined, page: 1, limit: 50 },
      });
      if (res.data?.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    const nextSeq = String(employees.length + 1).padStart(3, '0');
    setFormData({
      branchId: branches[0]?.id || '',
      employeeCode: `EMP-STF-${nextSeq}`,
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      designation: 'Sales Executive',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      branchId: emp.branchId || branches[0]?.id || '',
      employeeCode: emp.employeeCode || emp.code || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      mobile: emp.mobile || '',
      designation: emp.designation || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/employees/${deletingEmployee.id}`);
      setFeedback({
        type: 'success',
        message: `Employee "${deletingEmployee.firstName} ${deletingEmployee.lastName || ''}" deleted successfully.`,
      });
      setDeletingEmployee(null);
      fetchEmployees();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete employee.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const payload = {
        branchId: formData.branchId || branches[0]?.id,
        employeeCode: formData.employeeCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email?.trim() || undefined,
        mobile: formData.mobile.trim(),
        designation: formData.designation?.trim() || undefined,
      };

      if (editingEmployee) {
        await apiClient.put(`/employees/${editingEmployee.id}`, payload);
      } else {
        await apiClient.post('/employees', payload);
      }

      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: editingEmployee ? 'Employee profile updated successfully.' : 'New employee registered successfully.',
      });
      fetchEmployees();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <UserCheck color="#C6A15B" /> Employees & Staff Directory
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
            Showroom staff, Employee Codes, designations, and showroom branch assignments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add Employee
            </button>
          )}
          <button onClick={fetchEmployees} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: feedback.type === 'success' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            border: feedback.type === 'success' ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)',
            color: feedback.type === 'success' ? '#059669' : '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search employees by code, name, designation, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Full Name</th>
              <th>Designation</th>
              <th>Branch Showroom</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Loading staff directory...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No employee records found.
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong style={{ color: '#C6A15B', fontSize: '0.9rem' }}>
                        {e.employeeCode || e.code}
                      </strong>
                    </div>
                  </td>
                  <td><strong>{e.firstName} {e.lastName}</strong></td>
                  <td>
                    <span className="badge badge-platinum" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <BadgeCheck size={12} /> {e.designation || 'Staff'}
                    </span>
                  </td>
                  <td>{e.branch?.name || 'Connaught Place Flagship'}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {e.mobile && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} color="#64748B" /> {e.mobile}</span>}
                      {e.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '0.78rem' }}><Mail size={12} /> {e.email}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(e)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Edit Employee"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingEmployee(e)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', color: '#EF4444' }}
                          title="Delete Employee"
                        >
                          <Trash2 size={14} />
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

      {/* Delete Confirmation Dialog */}
      {deletingEmployee && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Employee Record"
          message={`Are you sure you want to delete employee "${deletingEmployee.firstName} ${deletingEmployee.lastName || ''}" (${deletingEmployee.employeeCode})? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete Employee'}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingEmployee(null)}
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181B' }}>
                {editingEmployee ? 'Edit Staff Profile' : 'Register New Employee'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '16px',
                color: '#DC2626',
                fontSize: '0.85rem',
              }}>
                <AlertCircle size={16} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Branch Showroom <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Employee Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  />
                  {formErrors.employeeCode && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.employeeCode}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    First Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  {formErrors.firstName && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Last Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                  {formErrors.lastName && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.lastName}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Mobile Phone <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0 12px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRight: 'none',
                        borderRadius: '8px 0 0 8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#475569',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9810011001"
                      maxLength={10}
                      className="form-input"
                      style={{ borderRadius: '0 8px 8px 0' }}
                      value={formData.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, mobile: val });
                      }}
                    />
                  </div>
                  {formErrors.mobile && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{formErrors.mobile}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="staff@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Designation / Role Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Sales Executive (Diamonds)"
                  className="form-input"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : editingEmployee ? 'Update Profile' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
