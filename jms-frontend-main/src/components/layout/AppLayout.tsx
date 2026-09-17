import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Package,
  Building2,
  Store,
  BadgeCheck,
  Truck,
  LogOut,
  Server,
  Gem,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Shield,
  Layers,
  ArrowLeftRight,
  QrCode,
  Users as UsersIcon,
  Tag,
  ShoppingBag,
  FileText,
  CreditCard,
  Coins,
  RotateCcw,
  TrendingUp,
  Percent,
  Calculator,
  Flame,
  Clock,
  MapPin,
  Menu,
  X,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout, environment, toggleEnvironment, hasPermission, businessMode, setBusinessMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Close mobile drawer whenever user navigates to a new route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Extract role code safely whether user.role is string or object
  const getRoleCode = (u: any): string => {
    if (!u) return 'ADMIN';
    if (typeof u.role === 'string') return u.role.toUpperCase();
    if (typeof u.role === 'object' && u.role !== null) {
      return (u.role.code || u.role.name || 'ADMIN').toUpperCase();
    }
    return 'ADMIN';
  };

  const roleCode = getRoleCode(user);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Accordion open/close state for menu sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    inventory: true,
    sales: true,
    'pricing-rates': true,
    'crm-showrooms': true,
    girvi: true,
    purchases: true,
    approvals: true,
    'stock-audits': true,
    administration: true,
  });

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));
      return;
    }
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Structured Nav Groups matching User Architecture
  const navSections = [
    {
      id: 'main',
      title: 'Main',
      type: 'single',
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      permission: null,
      mode: 'BOTH',
    },
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'group',
      icon: Layers,
      mode: 'BOTH',
      items: [
        { label: 'Inventory Stock', path: '/inventory-items', icon: Layers, permission: 'inventory_item.read' },
        { label: 'Categories & Brands', path: '/categories', icon: FolderTree, permission: 'product.read' },
        { label: 'Stock Movements', path: '/stock-movements', icon: ArrowLeftRight, permission: 'stock_movement.read' },
        { label: 'Branch Transfers', path: '/inventory-transfers', icon: Truck, permission: 'inventory_transfer.read' },
      ],
    },
    {
      id: 'sales',
      title: 'Sales',
      type: 'group',
      icon: ShoppingBag,
      mode: 'RETAIL',
      items: [
        { label: 'New Sale / POS', path: '/sales/pos', icon: ShoppingBag, permission: 'sales_invoice.read', badge: 'POS' },
        { label: 'Invoices & Bills', path: '/sales/invoices', icon: FileText, permission: 'sales_invoice.read' },
        { label: 'Payments', path: '/sales/payments', icon: CreditCard, permission: 'sales_payment.read' },
        { label: 'Returns & Credits', path: '/sales/returns', icon: RotateCcw, permission: 'sales_return.read' },
        { label: 'Refunds', path: '/sales/refunds', icon: CreditCard, permission: 'sales_refund.read' },
        { label: 'Old Gold Exchange', path: '/sales/gold-exchanges', icon: Coins, permission: 'gold_exchange.read' },
      ],
    },
    {
      id: 'pricing-rates',
      title: 'Pricing & Rates',
      type: 'group',
      icon: TrendingUp,
      mode: 'BOTH',
      items: [
        { label: 'Rates', path: '/masters/metal-rates', icon: TrendingUp, permission: 'metal_rate.read' },
        { label: 'Making Charges', path: '/masters/making-charges', icon: Percent, permission: 'making_charge.read' },
        { label: 'Stone Rates & GST', path: '/masters/tax-rates', icon: Calculator, permission: 'tax_rate.read' },
      ],
    },
    {
      id: 'crm-showrooms',
      title: 'Customers & CRM',
      type: 'group',
      icon: UserCheck,
      mode: 'BOTH',
      items: [
        { label: 'Customers', path: '/customers', icon: UserCheck, permission: 'customer.read' },
        { label: 'Vendors & Suppliers', path: '/vendors', icon: Truck, permission: 'vendor.read' },
        { label: 'Staff Employees', path: '/employees', icon: BadgeCheck, permission: 'employee.read' },
        { label: 'Showroom Branches', path: '/branches', icon: Store, permission: 'branch.read' },
        { label: 'Company Profile', path: '/companies', icon: Building2, permission: 'company.read' },
      ],
    },
    {
      id: 'girvi',
      title: 'Girvi / Pawn',
      type: 'group',
      icon: Flame,
      mode: 'BOTH',
      items: [
        { label: 'Girvi Dashboard', path: '/girvi', icon: LayoutDashboard, permission: 'girvi.read' },
        { label: 'Self Girvi Loans', path: '/girvi/loans', icon: Coins, permission: 'girvi.read' },
        { label: 'Collections Ledger', path: '/girvi/collections', icon: CreditCard, permission: 'girvi.collection.read' },
        { label: 'Settlements & Release', path: '/girvi/settlements', icon: BadgeCheck, permission: 'girvi.settlement.read' },
        { label: 'Third-Party Girvi', path: '/girvi/third-party', icon: Building2, permission: 'third_party_girvi.read' },
        { label: 'Third-Party Lenders', path: '/girvi/lenders', icon: UsersIcon, permission: 'third_party_girvi.read' },
        { label: 'Girvi Reports', path: '/girvi/reports', icon: FileText, permission: 'girvi.report.read' },
      ],
    },
    {
      id: 'purchases',
      title: 'Procurement & Purchases',
      type: 'group',
      icon: Truck,
      mode: 'BOTH',
      items: [
        { label: 'Purchase Orders', path: '/purchases/orders', icon: FileText, permission: 'purchase.read' },
        { label: 'Goods Receipts (GRN)', path: '/purchases/receipts', icon: Package, permission: 'purchase.read' },
        { label: 'Purchase Invoices', path: '/purchases/bills', icon: CreditCard, permission: 'purchase.read' },
        { label: 'Purchase Returns', path: '/purchases/returns', icon: RotateCcw, permission: 'purchase.read' },
        { label: 'Vendor Payments', path: '/purchases/payments', icon: Coins, permission: 'purchase.read' },
      ],
    },
    {
      id: 'approvals',
      title: 'Approval / Jangad',
      type: 'group',
      icon: Tag,
      mode: 'BOTH',
      items: [
        { label: 'Approval Hub', path: '/approvals', icon: LayoutDashboard, permission: 'approval.read' },
        { label: 'Approvals Issued', path: '/approvals/list', icon: FileText, permission: 'approval.read' },
        { label: 'Customer Deposits', path: '/approvals/deposits', icon: Shield, permission: 'approval.read' },
        { label: 'Approval Reports', path: '/approvals/reports', icon: FileText, permission: 'approval.read' },
      ],
    },
    {
      id: 'operations',
      title: 'Operations',
      type: 'group',
      icon: ShieldCheck,
      mode: 'BOTH',
      items: [
        { label: 'Karigar Job Work', path: '/job-work', icon: Gem, permission: 'job_work.read' },
        { label: 'Stock Audits', path: '/stock-audits', icon: ShieldCheck, permission: 'stock_audit.read' },
      ],
    },
    {
      id: 'administration',
      title: 'Administration',
      type: 'group',
      icon: Shield,
      mode: 'BOTH',
      items: [
        { label: 'User Accounts', path: '/users', icon: UsersIcon, permission: 'user.read' },
        { label: 'Roles & Permissions', path: '/roles', icon: Shield, permission: 'role.read' },
      ],
    },
  ];

  // Auto expand the parent section of the current active pathname
  useEffect(() => {
    const current = location.pathname;
    navSections.forEach((sec) => {
      if (sec.type === 'group' && sec.items) {
        const hasActive = sec.items.some((item) => current.startsWith(item.path));
        if (hasActive) {
          setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  return (
    <div className="app-layout-container">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-nav-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Top Header */}
      <header className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#C6A15B',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'rgba(198, 161, 91, 0.25)',
                border: '1px solid rgba(198, 161, 91, 0.5)',
                color: '#C6A15B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gem size={16} />
            </div>
            <span className="brand-font" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#C6A15B' }}>
              JMS Jewellery
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
            {roleCode}
          </span>
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', padding: '6px', cursor: 'pointer' }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop Collapsible & Mobile Sliding Drawer) */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: isCollapsed ? '70px' : '255px' }}>
        {/* Toggle Collapse Button (Reveals on Hover) */}
        <button
          className="desktop-only sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
          {/* Logo Branding */}
          <div
            style={{
              padding: isCollapsed ? '16px 10px' : '18px 16px',
              borderBottom: '1px solid #1C1D24',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(198, 161, 91, 0.25) 0%, rgba(215, 217, 220, 0.05) 100%)',
                border: '1px solid rgba(198, 161, 91, 0.5)',
                color: '#C6A15B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(198, 161, 91, 0.3)',
                flexShrink: 0,
              }}
            >
              <Gem size={20} />
            </div>
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="brand-font" style={{ fontSize: '1.18rem', fontWeight: 700, color: '#C6A15B', letterSpacing: '0.5px' }}>
                  JMS Jewellery
                </div>
                <div style={{ fontSize: '0.68rem', color: '#D7D9DC' }}>
                  Store Management System
                </div>
              </div>
            )}
            <button
              className="mobile-only"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748B', padding: '4px', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav List */}
          <nav
            style={{
              padding: '12px 8px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {navSections.map((section: any) => {
              // Strictly display sections matching current session businessMode or BOTH (Admin sees everything)
              if (roleCode !== 'ADMIN' && roleCode !== 'SUPER_ADMIN') {
                if (section.mode !== 'BOTH' && section.mode !== businessMode) {
                  return null;
                }
              }

              if (section.type === 'single') {
                if (section.permission && !hasPermission(section.permission)) return null;
                const Icon = section.icon;
                return (
                  <div key={section.path} className="sidebar-nav-item">
                    <NavLink
                      to={section.path}
                      end={section.path === '/'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '11px',
                        padding: isCollapsed ? '10px 0' : '9px 12px',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        borderRadius: '8px',
                        marginBottom: '2px',
                        fontSize: '0.86rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#C6A15B' : '#94A3B8',
                        background: isActive ? 'rgba(198, 161, 91, 0.14)' : 'transparent',
                        borderLeft: isCollapsed ? 'none' : isActive ? '3px solid #C6A15B' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        {!isCollapsed && <span>{section.label}</span>}
                      </div>
                      {!isCollapsed && section.badge && (
                        <span
                          style={{
                            fontSize: '0.66rem',
                            padding: '2px 7px',
                            borderRadius: '12px',
                            background: 'rgba(198, 161, 91, 0.2)',
                            color: '#C6A15B',
                            fontWeight: 700,
                            border: '1px solid rgba(198, 161, 91, 0.35)',
                          }}
                        >
                          {section.badge}
                        </span>
                      )}
                    </NavLink>
                    {isCollapsed && <div className="sidebar-tooltip">{section.label}</div>}
                  </div>
                );
              }

              // Group / Accordion Section
              const visibleSubItems = section.items || [];

              if (visibleSubItems.length === 0) return null;

              const isSectionOpen = !!openSections[section.id];
              const isAnyChildActive = visibleSubItems.some((item: any) => location.pathname.startsWith(item.path));
              const GroupIcon = section.icon;

              return (
                <div key={section.id} style={{ marginBottom: '4px' }}>
                  {/* Accordion Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      padding: isCollapsed ? '10px 0' : '9px 12px',
                      borderRadius: '8px',
                      color: isAnyChildActive ? '#C6A15B' : isSectionOpen ? '#F1F5F9' : '#94A3B8',
                      background: isAnyChildActive ? 'rgba(198, 161, 91, 0.12)' : isSectionOpen ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                      fontWeight: isAnyChildActive ? 700 : 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    title={section.title}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <GroupIcon size={18} color={isAnyChildActive ? '#C6A15B' : isSectionOpen ? '#E2E8F0' : '#94A3B8'} style={{ flexShrink: 0 }} />
                      {!isCollapsed && <span>{section.title}</span>}
                    </div>

                    {!isCollapsed && (
                      <ChevronRight
                        size={15}
                        color={isAnyChildActive ? '#C6A15B' : '#94A3B8'}
                        style={{
                          transform: isSectionOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    )}
                  </button>

                  {/* Sub-items (smoothly rendered when expanded) */}
                  {isSectionOpen && !isCollapsed && (
                    <div
                      style={{
                        paddingLeft: '10px',
                        marginTop: '3px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        borderLeft: '1.5px solid rgba(198, 161, 91, 0.3)',
                        marginLeft: '18px',
                        animation: 'fadeIn 0.15s ease-in-out',
                      }}
                    >
                      {visibleSubItems.map((subItem: any) => {
                        const SubIcon = subItem.icon;
                        return (
                          <div key={subItem.path} className="sidebar-nav-item">
                            <NavLink
                              to={subItem.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '7px 10px',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#C6A15B' : '#CBD5E1',
                                background: isActive ? 'rgba(198, 161, 91, 0.16)' : 'transparent',
                                borderLeft: isActive ? '3px solid #C6A15B' : '3px solid transparent',
                                transition: 'all 0.15s ease',
                              })}
                            >
                              <SubIcon size={15} style={{ flexShrink: 0, opacity: 0.9 }} />
                              <span>{subItem.label}</span>
                            </NavLink>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Backend Switcher */}
          {import.meta.env.DEV && (
            <div
              style={{
                padding: '10px',
                borderTop: '1px solid #1C1D24',
                background: '#070709',
                flexShrink: 0,
              }}
            >
              {!isCollapsed ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#141519',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #27272A',
                    fontSize: '0.74rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Server size={13} color={environment === 'live' ? '#C6A15B' : '#059669'} />
                    <span style={{ fontWeight: 600, color: environment === 'live' ? '#C6A15B' : '#059669' }}>
                      {environment === 'live' ? 'Railway Cloud' : 'Localhost'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleEnvironment(environment === 'live' ? 'local' : 'live')}
                    style={{
                      fontSize: '0.7rem',
                      color: '#C6A15B',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Switch
                  </button>
                </div>
              ) : (
                <div className="sidebar-nav-item">
                  <button
                    onClick={() => toggleEnvironment(environment === 'live' ? 'local' : 'live')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 0',
                      borderRadius: '6px',
                      background: '#141519',
                      color: environment === 'live' ? '#C6A15B' : '#059669',
                    }}
                  >
                    <Server size={16} />
                  </button>
                  <div className="sidebar-tooltip">
                    Target: {environment === 'live' ? 'Railway Cloud' : 'Localhost Dev'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="app-main-workspace">
        {/* Desktop Header Bar */}
        <header className="desktop-header-bar">
          {/* Left: Role badge + Mode Toggle + Branch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(198,161,91,0.1)',
                border: '1px solid rgba(198,161,91,0.28)',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#7A5C0A',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <ShieldCheck size={13} color="#C6A15B" />
              {roleCode}
            </span>

            <div style={{ width: '1px', height: '20px', background: '#E8E5E0' }} />

            <div style={{ width: '1px', height: '20px', background: '#E8E5E0' }} />

            {/* Active Session Mode Display Badge (Set during login selection) */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 800,
                background: businessMode === 'RETAIL' ? 'rgba(198, 161, 91, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                color: businessMode === 'RETAIL' ? '#C6A15B' : '#2563EB',
                border: businessMode === 'RETAIL' ? '1px solid rgba(198, 161, 91, 0.35)' : '1px solid rgba(37, 99, 235, 0.35)',
              }}
            >
              {businessMode === 'RETAIL' ? <ShoppingBag size={13} /> : <Truck size={13} />}
              <span>{businessMode === 'RETAIL' ? 'RETAIL SHOWROOM' : 'WHOLESALE MODE'}</span>
            </span>

            <div style={{ width: '1px', height: '20px', background: '#E8E5E0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} color="#C6A15B" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                {(user as any)?.branch?.name || 'Connaught Place Flagship Showroom'}
              </span>
            </div>
          </div>

          {/* Right: Clock + Profile + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>
                <Clock size={13} color="#C6A15B" />
                <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>{currentTime}</span>
              </div>
            )}

            <div style={{ width: '1px', height: '20px', background: '#E8E5E0' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px 5px 6px',
                borderRadius: 'var(--radius-full)',
                background: '#F8F7F3',
                border: '1px solid #E8E5E0',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #141518 0%, #2a2b35 100%)',
                  color: '#C6A15B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(user?.firstName?.[0] || 'S').toUpperCase()}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a1b20' }}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'System Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '5px' }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="app-main-content">
          <div className="page-transition" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
