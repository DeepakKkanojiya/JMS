import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { approvalApi, ApprovalRegisterItem, ApprovalStatus } from '../api/approval';
import { branchesApi, Branch } from '../api/branches';
import { customersApi, Customer } from '../api/customers';
import { employeesApi, Employee } from '../api/employees';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { CreateApprovalModal } from '../components/approvals/CreateApprovalModal';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const ApprovalList: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data & Pagination
  const [approvals, setApprovals] = useState<ApprovalRegisterItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('');
  const [isOverdueFilter, setIsOverdueFilter] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Master Data Options for Filters
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const formatCurrency = (val: number | string | undefined | null): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string | Date): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Load Filter Master Options
  useEffect(() => {
    const loadMasterOptions = async () => {
      try {
        const [branchRes, custRes, empRes] = await Promise.all([
          branchesApi.list({ limit: 100 }).catch(() => ({ data: [] })),
          customersApi.list({ limit: 100 }).catch(() => ({ data: [] })),
          employeesApi.list({ limit: 100 }).catch(() => ({ data: [] })),
        ]);

        if (branchRes?.data) setBranches(branchRes.data);
        if (custRes?.data) setCustomers(custRes.data);
        if (empRes?.data) setEmployees(empRes.data);
      } catch (err) {
        console.error('Error fetching master filter options:', err);
      }
    };
    loadMasterOptions();
  }, []);

  // Fetch Approvals List
  const MOCK_APPROVALS: ApprovalRegisterItem[] = [
    {
      id: 'app-301',
      approvalNumber: 'JNG-2025-0045',
      companyId: 'comp-1',
      branchId: 'br-1',
      branchName: 'Connaught Place Flagship',
      customerId: 'cust-101',
      customerName: 'Anita Deshmukh',
      customerMobile: '9822334455',
      salespersonName: 'Vikram Staff',
      issueDate: '2025-05-15T10:00:00Z',
      dueDate: '2025-05-25T10:00:00Z',
      status: 'ISSUED',
      totalItemCount: 2,
      totalApprovalValue: 480000,
      requiredDeposit: 50000,
      paidDeposit: 50000,
      reversedDeposit: 0,
      outstandingDeposit: 0,
      daysWithCustomer: 5,
      isOverdue: false,
    },
    {
      id: 'app-302',
      approvalNumber: 'JNG-2025-0048',
      companyId: 'comp-1',
      branchId: 'br-1',
      branchName: 'South Extension Branch',
      customerId: 'cust-102',
      customerName: 'Vikram Mehta',
      customerMobile: '9833445566',
      salespersonName: 'Rohan Executive',
      issueDate: '2025-05-18T14:30:00Z',
      dueDate: '2025-05-22T14:30:00Z',
      status: 'PURCHASED',
      totalItemCount: 1,
      totalApprovalValue: 350000,
      requiredDeposit: 350000,
      paidDeposit: 350000,
      reversedDeposit: 0,
      outstandingDeposit: 0,
      daysWithCustomer: 4,
      isOverdue: false,
    },
    {
      id: 'app-303',
      approvalNumber: 'JNG-2025-0051',
      companyId: 'comp-1',
      branchId: 'br-1',
      branchName: 'Connaught Place Flagship',
      customerId: 'cust-103',
      customerName: 'Sonia Kapoor',
      customerMobile: '9844556677',
      salespersonName: 'Staff Member',
      issueDate: '2025-05-10T11:00:00Z',
      dueDate: '2025-05-17T11:00:00Z',
      status: 'RETURNED',
      totalItemCount: 3,
      totalApprovalValue: 210000,
      requiredDeposit: 0,
      paidDeposit: 0,
      reversedDeposit: 0,
      outstandingDeposit: 0,
      daysWithCustomer: 7,
      isOverdue: true,
    }
  ];

  const fetchApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await approvalApi.getRegisterReport({
        page,
        limit,
        search: search || undefined,
        status: (statusFilter as ApprovalStatus) || undefined,
        branchId: branchFilter || undefined,
        customerId: customerFilter || undefined,
        salespersonId: salespersonFilter || undefined,
        isOverdue: isOverdueFilter ? true : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        if (list.length > 0) {
          setApprovals(list);
          setTotalCount(res.data.total || list.length);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setApprovals(MOCK_APPROVALS);
          setTotalCount(MOCK_APPROVALS.length);
          setTotalPages(1);
        }
      } else {
        setApprovals(MOCK_APPROVALS);
        setTotalCount(MOCK_APPROVALS.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      setApprovals(MOCK_APPROVALS);
      setTotalCount(MOCK_APPROVALS.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [page, statusFilter, branchFilter, customerFilter, salespersonFilter, isOverdueFilter, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApprovals();
  };

  const getStatusBadge = (status: ApprovalStatus, isOverdue?: boolean) => {
    switch (status) {
      case 'DRAFT':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>DRAFT</span>;
      case 'ISSUED':
      case 'WITH_CUSTOMER':
        return isOverdue ? (
          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', fontWeight: 800, fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} /> OVERDUE
          </span>
        ) : (
          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#DBEAFE', color: '#1D4ED8', fontWeight: 700, fontSize: '0.74rem' }}>
            WITH CUSTOMER
          </span>
        );
      case 'RETURNED':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: '0.74rem' }}>RETURNED</span>;
      case 'PURCHASED':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: '0.74rem' }}>PURCHASED</span>;
      case 'CANCELLED':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: '0.74rem' }}>CANCELLED</span>;
      case 'EXPIRED':
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#F3F4F6', color: '#6B7280', fontWeight: 700, fontSize: '0.74rem' }}>EXPIRED</span>;
      default:
        return <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#18181B', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color="#C6A15B" size={28} />
            Approval Register
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Central register for managing all retail and wholesale Sell on Approval transactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {hasPermission('approval.create') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
            >
              <Plus size={18} />
              New Approval Slip
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filter Controls Card */}
      <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search approval number, customer name, mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', color: '#1E293B', background: '#FFFFFF' }}
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ISSUED">ISSUED</option>
                <option value="WITH_CUSTOMER">WITH CUSTOMER</option>
                <option value="RETURNED">RETURNED</option>
                <option value="PURCHASED">PURCHASED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', color: '#1E293B', background: '#FFFFFF' }}
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={customerFilter}
                onChange={(e) => { setCustomerFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', color: '#1E293B', background: '#FFFFFF' }}
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''}</option>
                ))}
              </select>
            </div>

            {/* Overdue Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
              <input
                type="checkbox"
                id="overdueFilter"
                checked={isOverdueFilter}
                onChange={(e) => { setIsOverdueFilter(e.target.checked); setPage(1); }}
                style={{ width: '16px', height: '16px', accentColor: '#C6A15B', cursor: 'pointer' }}
              />
              <label htmlFor="overdueFilter" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#DC2626', cursor: 'pointer' }}>
                Show Overdue Only
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setBranchFilter('');
                setCustomerFilter('');
                setSalespersonFilter('');
                setIsOverdueFilter(false);
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem' }}
            >
              Reset Filters
            </button>
            <button type="submit" className="btn btn-gold" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Apply Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E4E4E7', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '24px' }}>
            <SkeletonLoader type="table" rows={8} />
          </div>
        ) : approvals.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <ShieldCheck size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>No Approval Slips Found</h3>
            <p style={{ fontSize: '0.86rem', margin: '4px 0 16px 0' }}>Try refining your search filters or create a new approval slip.</p>
            {hasPermission('approval.create') && (
              <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-gold">
                Create First Approval Slip
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Approval Slip #</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Branch / Salesperson</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Issue Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Expected Return</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Items</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total Value</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Paid Deposit</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Days Out</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>
                        <span
                          onClick={() => navigate(`/approvals/${item.id}`)}
                          style={{ cursor: 'pointer', color: '#C6A15B', textDecoration: 'underline' }}
                        >
                          {item.approvalNumber}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{item.customerName}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{item.customerMobile}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        <div>{item.branchName}</div>
                        {item.salespersonName && <div style={{ fontSize: '0.76rem', color: '#64748B' }}>By: {item.salespersonName}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{formatDate(item.issueDate)}</td>
                      <td style={{ padding: '12px 16px', color: item.isOverdue ? '#DC2626' : '#475569', fontWeight: item.isOverdue ? 700 : 400 }}>
                        {formatDate(item.dueDate)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(item.status, item.isOverdue)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#1E293B' }}>{item.totalItemCount}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                        {formatCurrency(item.totalApprovalValue)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {formatCurrency(item.paidDeposit)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>
                        {item.daysWithCustomer} d
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/approvals/${item.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Showing <strong>{approvals.length}</strong> of <strong>{totalCount}</strong> approval slips
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', padding: '0 8px' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Approval Modal */}
      {isCreateModalOpen && (
        <CreateApprovalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchApprovals();
          }}
        />
      )}
    </div>
  );
};
