import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { approvalApi, CreateApprovalItemInput } from '../../api/approval';
import { customersApi, Customer } from '../../api/customers';
import { employeesApi, Employee } from '../../api/employees';
import { branchesApi, Branch } from '../../api/branches';
import { inventoryApi, InventoryItem } from '../../api/inventory';
import { X, Search, Plus, Trash2, ShieldCheck, AlertCircle, CheckCircle, Package } from 'lucide-react';

interface CreateApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateApprovalModal: React.FC<CreateApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Master Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Inventory Selection State
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [isSearchingInventory, setIsSearchingInventory] = useState<boolean>(false);

  // Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(user?.branchId || '');
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default 7 days return expected
    return d.toISOString().split('T')[0];
  });
  const [requiredDepositAmount, setRequiredDepositAmount] = useState<number | string>('');
  const [notes, setNotes] = useState<string>('');

  // Selected Line Items
  const [selectedItems, setSelectedItems] = useState<{
    inventoryItemId: string;
    itemCode: string;
    productName: string;
    metalType?: string;
    purity: string;
    grossWeight: number | string;
    netWeight: number | string;
    unitPrice: number;
    notes?: string;
  }[]>([]);

  // Format INR Currency
  const formatCurrency = (val: number | string): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadMasterData = async () => {
      try {
        const [custRes, empRes, branchRes] = await Promise.all([
          customersApi.list({ limit: 100 }).catch(() => ({ data: [] })),
          employeesApi.list({ limit: 100 }).catch(() => ({ data: [] })),
          branchesApi.list({ limit: 100 }).catch(() => ({ data: [] })),
        ]);

        if (custRes?.data && Array.isArray(custRes.data)) {
          setCustomers(custRes.data);
        }
        if (empRes?.data && Array.isArray(empRes.data)) {
          setEmployees(empRes.data);
        }
        if (branchRes?.data && Array.isArray(branchRes.data)) {
          setBranches(branchRes.data);
        }
      } catch (err) {
        console.error('Error fetching master data for create approval:', err);
      }
    };

    loadMasterData();
  }, [isOpen]);

  // Inventory Search for Available Items
  const handleSearchInventory = async (query: string) => {
    setInventorySearch(query);
    if (!query || query.trim().length < 2) {
      setAvailableInventory([]);
      return;
    }

    setIsSearchingInventory(true);
    try {
      const res = await inventoryApi.list({
        search: query.trim(),
        status: 'AVAILABLE',
        branchId: selectedBranchId || user?.branchId,
        limit: 10,
      });

      if (res?.data && Array.isArray(res.data)) {
        setAvailableInventory(res.data);
      } else {
        setAvailableInventory([]);
      }
    } catch (err) {
      console.error('Error searching available inventory:', err);
    } finally {
      setIsSearchingInventory(false);
    }
  };

  const addItemToApproval = (item: InventoryItem) => {
    if (selectedItems.some((i) => i.inventoryItemId === item.id)) {
      return;
    }

    const price = Number((item.product as any)?.basePrice) || 50000;

    setSelectedItems((prev) => [
      ...prev,
      {
        inventoryItemId: item.id,
        itemCode: item.itemCode,
        productName: (item.product as any)?.name || 'Jewellery Item',
        metalType: item.metalType || (item.product as any)?.metalType || 'GOLD',
        purity: item.purity,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        unitPrice: price,
        notes: '',
      },
    ]);

    setInventorySearch('');
    setAvailableInventory([]);
  };

  const removeItem = (inventoryItemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.inventoryItemId !== inventoryItemId));
  };

  const handlePriceChange = (inventoryItemId: string, price: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.inventoryItemId === inventoryItemId ? { ...item, unitPrice: price } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    if (!selectedBranchId && !user?.branchId) {
      setError('Please select a showroom branch.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please select at least one AVAILABLE jewellery item.');
      return;
    }

    setIsLoading(true);
    try {
      const itemsPayload: CreateApprovalItemInput[] = selectedItems.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: 1,
        unitPrice: item.unitPrice,
        notes: item.notes,
      }));

      const payload = {
        companyId: user?.companyId || '',
        branchId: selectedBranchId || user?.branchId || '',
        customerId: selectedCustomerId,
        salespersonId: selectedSalespersonId || undefined,
        dueDate,
        notes: notes.trim() || undefined,
        requiredDepositAmount: requiredDepositAmount !== '' ? Number(requiredDepositAmount) : undefined,
        items: itemsPayload,
      };

      const res = await approvalApi.create(payload);
      if (res?.success) {
        onSuccess();
      } else {
        setError(res?.message || 'Failed to create approval slip.');
      }
    } catch (err: any) {
      console.error('Error creating approval slip:', err);
      setError(err?.response?.data?.message || 'An error occurred while creating approval slip.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalValue = selectedItems.reduce((acc, item) => acc + item.unitPrice, 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="glass-card"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 16px)',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(198, 161, 91, 0.15)',
                color: '#C6A15B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Create Sell on Approval Slip
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Draft an approval slip for jewellery items issued to customer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Header Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Customer */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Customer <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName || ''} ({c.mobile || c.code || 'No Mobile'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Showroom Branch
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                  }}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Salesperson */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Assigned Salesperson
                </label>
                <select
                  value={selectedSalespersonId}
                  onChange={(e) => setSelectedSalespersonId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="">-- None / Select Salesperson --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName || ''} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected Return Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Expected Return Date <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                  }}
                />
              </div>

              {/* Security Deposit Required */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Required Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Optional deposit requirement"
                  value={requiredDepositAmount}
                  onChange={(e) => setRequiredDepositAmount(e.target.value)}
                  min="0"
                  step="500"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            {/* Inventory Item Selector Section */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                Search & Add Jewellery Items (AVAILABLE status only)
              </label>

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0 12px' }}>
                  <Search size={18} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Search item code, barcode, or product name..."
                    value={inventorySearch}
                    onChange={(e) => handleSearchInventory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.88rem',
                    }}
                  />
                  {isSearchingInventory && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Searching...</span>}
                </div>

                {/* Search Dropdown Results */}
                {availableInventory.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      marginTop: '4px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    {availableInventory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addItemToApproval(item)}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      >
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                            {item.itemCode} - {(item.product as any)?.name || 'Jewellery'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                            Purity: {item.purity} | Gross Wt: {item.grossWeight}g | Net Wt: {item.netWeight}g
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px' }}>
                            AVAILABLE
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Items Table */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Selected Jewellery Items ({selectedItems.length})</span>
                <span style={{ fontSize: '0.9rem', color: '#C6A15B', fontWeight: 800 }}>
                  Total Value: {formatCurrency(totalValue)}
                </span>
              </h3>

              {selectedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', color: '#64748B' }}>
                  <Package size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>No jewellery items selected yet. Use search above to add items.</p>
                </div>
              ) : (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Item Code</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Product</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Weights (Gross/Net)</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Purity</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Item Value (₹)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item) => (
                        <tr key={item.inventoryItemId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>{item.itemCode}</td>
                          <td style={{ padding: '10px 12px', color: '#334155' }}>{item.productName}</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {item.grossWeight}g / {item.netWeight}g
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>{item.purity}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handlePriceChange(item.inventoryItemId, Number(e.target.value) || 0)}
                              min="0"
                              style={{
                                width: '120px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeItem(item.inventoryItemId)}
                              style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Remarks / Notes */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Approval Notes / Handover Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Specific customer instructions or conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Items will be saved as <strong>DRAFT</strong> approval slip.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-gold"
                disabled={isLoading || selectedItems.length === 0}
                style={{ fontWeight: 700 }}
              >
                {isLoading ? 'Creating Draft...' : 'Save Draft Approval'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
