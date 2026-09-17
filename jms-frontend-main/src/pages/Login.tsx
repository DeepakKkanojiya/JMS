import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Gem,
  AlertCircle,
  Server,
  ShieldCheck,
  Crown,
  Briefcase,
  Receipt,
  UserCheck,
  Layers,
  Calculator,
  Flame,
  ArrowRight,
  Key,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { LIVE_API_URL, LOCAL_API_URL } from '../api/client';

const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@jewelleryerp.com';
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@123';

interface RolePreset {
  roleCode: string;
  roleName: string;
  department: string;
  email: string;
  pass: string;
  icon: any;
  color: string;
}

export const Login: React.FC = () => {
  const { login, environment, toggleEnvironment, businessMode, setBusinessMode } = useAuth();
  const navigate = useNavigate();

  const [currentEnv, setCurrentEnv] = useState<'local' | 'live'>(environment);
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLoggingRole, setActiveLoggingRole] = useState<string | null>(null);

  // Post-login Workspace Selector Modal Step
  const [step, setStep] = useState<'LOGIN' | 'MODE_SELECTION'>('LOGIN');

  useEffect(() => {
    setCurrentEnv(environment);
  }, [environment]);

  const activeUrl = currentEnv === 'live' ? LIVE_API_URL : LOCAL_API_URL;

  // Standard Store Role Credentials
  const rolePresets: RolePreset[] = [
    {
      roleCode: 'ADMIN',
      roleName: 'Admin',
      department: 'System & Security',
      email: 'admin@jewelleryerp.com',
      pass: 'Admin@123',
      icon: ShieldCheck,
      color: '#3B82F6',
    },
    {
      roleCode: 'OWNER',
      roleName: 'Owner (Tanishk Agrawal)',
      department: 'Store 360° Management',
      email: 'owner@jewelleryerp.com',
      pass: 'Admin@123',
      icon: Crown,
      color: '#C6A15B',
    },
    {
      roleCode: 'BRANCH_MANAGER',
      roleName: 'Manager',
      department: 'Showroom Floor',
      email: 'manager@jewelleryerp.com',
      pass: 'Admin@123',
      icon: Briefcase,
      color: '#8B5CF6',
    },
    {
      roleCode: 'CASHIER',
      roleName: 'Cashier / Staff',
      department: 'Billing & POS Counter',
      email: 'cashier@jewelleryerp.com',
      pass: 'Admin@123',
      icon: Receipt,
      color: '#059669',
    },
    {
      roleCode: 'SALESPERSON',
      roleName: 'Salesperson',
      department: 'Jewellery Catalog & Quotes',
      email: 'sales@jewelleryerp.com',
      pass: 'Admin@123',
      icon: UserCheck,
      color: '#EC4899',
    },
    {
      roleCode: 'INVENTORY_MANAGER',
      roleName: 'Vault / Stock',
      department: 'Physical Stock & Tagging',
      email: 'vault@jewelleryerp.com',
      pass: 'Admin@123',
      icon: Layers,
      color: '#D97706',
    },
    {
      roleCode: 'ACCOUNTANT',
      roleName: 'Accountant',
      department: 'Finance & GST Ledgers',
      email: 'accountant@jewelleryerp.com',
      pass: 'Admin@123',
      icon: Calculator,
      color: '#6366F1',
    },
    {
      roleCode: 'KARIGAR_SUPERVISOR',
      roleName: 'Karigar Head',
      department: 'Workshop & Old Gold Melting',
      email: 'karigar@jewelleryerp.com',
      pass: 'Admin@123',
      icon: Flame,
      color: '#EA580C',
    },
  ];

  const handleLoginAction = async (targetEmail: string, targetPass: string, roleCode?: string) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    if (roleCode) setActiveLoggingRole(roleCode);
    try {
      await login(targetEmail, targetPass);
      // Admin goes directly to dashboard; all other roles see Retail / Wholesale selection step
      if (roleCode === 'ADMIN' || targetEmail === 'admin@jewelleryerp.com') {
        navigate('/');
      } else {
        setStep('MODE_SELECTION');
      }
    } catch (err: any) {
      if (err?.code === 'ERR_NETWORK' || !err?.response) {
        setErrorMsg(`Unable to connect to ${currentEnv === 'live' ? 'Railway Cloud' : 'Localhost'} backend (${activeUrl}). Please ensure the backend server is active.`);
      } else {
        const msg = err?.response?.data?.message || 'Login failed. Please verify credentials.';
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
      setActiveLoggingRole(null);
    }
  };

  const handleModeChoice = (chosenMode: 'RETAIL' | 'WHOLESALE') => {
    setBusinessMode(chosenMode);
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginAction(email, password);
  };

  const handleEnvSwitch = (newEnv: 'local' | 'live') => {
    setCurrentEnv(newEnv);
    toggleEnvironment(newEnv);
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #0F0F12 100%)',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(198, 161, 91, 0.15)',
              border: '1px solid rgba(198, 161, 91, 0.4)',
              color: '#C6A15B',
              marginBottom: '8px',
              boxShadow: '0 0 20px rgba(198, 161, 91, 0.25)',
            }}
          >
            <Gem size={24} />
          </div>
          <h1 className="brand-font" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#C6A15B', letterSpacing: '1px', lineHeight: 1.1 }}>
            JMS ERP
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '3px' }}>
            Jewellery Enterprise Management Suite
          </p>
        </div>

        {step === 'MODE_SELECTION' ? (
          <div
            className="glass-card"
            style={{
              padding: '32px 28px',
              borderRadius: '16px',
              background: '#FFFFFF',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181B', marginBottom: '6px' }}>
                Select Workspace Mode
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
                Choose the operating mode for your session to load tailored features & workflows.
              </p>
            </div>

            {/* The Two Boxes: Retail vs Wholesale */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {/* Box 1: Retail Showroom */}
              <div
                onClick={() => handleModeChoice('RETAIL')}
                className="glass-card-interactive"
                style={{
                  padding: '28px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 100%)',
                  border: '2px solid #C6A15B',
                  boxShadow: '0 10px 30px rgba(198,161,91,0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: '#C6A15B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 18px rgba(198,161,91,0.35)',
                  }}
                >
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: '6px' }}>
                    Retail Showroom
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                    POS Counter Billing, Sales Invoices, CRM, <strong>Girvi / Pawn Loans</strong>, and <strong>Sale on Approval (Jangad)</strong>.
                  </p>
                </div>
                <button className="btn btn-gold" style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 700, marginTop: 'auto' }}>
                  Enter Retail Mode →
                </button>
              </div>

              {/* Box 2: Wholesale Mode */}
              <div
                onClick={() => handleModeChoice('WHOLESALE')}
                className="glass-card-interactive"
                style={{
                  padding: '28px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 100%)',
                  border: '2px solid #2563EB',
                  boxShadow: '0 10px 30px rgba(37,99,235,0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 18px rgba(37,99,235,0.35)',
                  }}
                >
                  <Truck size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#18181B', marginBottom: '6px' }}>
                    Wholesale Mode
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                    Procurement, Purchase Orders, GRN Goods Receipts, Vendor Bills, Physical Audits, and Karigar Job Work.
                  </p>
                </div>
                <button className="btn" style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 700, background: '#2563EB', color: '#FFFFFF', marginTop: 'auto' }}>
                  Enter Wholesale Mode →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Two-Column Minimalist Layout */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 360px) minmax(300px, 1fr)',
              gap: '18px',
              alignItems: 'stretch',
            }}
          >
          {/* ========================================================================= */}
          {/* LEFT: LOGIN FORM                                                          */}
          {/* ========================================================================= */}
          <div
            className="glass-card"
            style={{
              padding: '22px 20px',
              borderRadius: '14px',
              background: '#FFFFFF',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Environment Switcher */}
              {import.meta.env.DEV && (
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 10px',
                    marginBottom: '14px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.74rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Server size={13} color={currentEnv === 'live' ? '#C6A15B' : '#059669'} />
                    <div>
                      <span style={{ color: '#64748B' }}>Target: </span>
                      <strong style={{ color: currentEnv === 'live' ? '#C6A15B' : '#059669' }}>
                        {currentEnv === 'live' ? 'Railway' : 'Localhost'}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleEnvSwitch('local')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: currentEnv === 'local' ? 'rgba(5, 150, 105, 0.15)' : 'transparent',
                        color: currentEnv === 'local' ? '#059669' : '#64748B',
                        border: currentEnv === 'local' ? '1px solid rgba(5, 150, 105, 0.4)' : '1px solid transparent',
                      }}
                    >
                      Local
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnvSwitch('live')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: currentEnv === 'live' ? 'rgba(198, 161, 91, 0.15)' : 'transparent',
                        color: currentEnv === 'live' ? '#C6A15B' : '#64748B',
                        border: currentEnv === 'live' ? '1px solid rgba(198, 161, 91, 0.4)' : '1px solid transparent',
                      }}
                    >
                      Live
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#18181B' }}>Sign In</h2>
              </div>

              {errorMsg && (
                <div
                  style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <div>{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="admin@jewelleryerp.com"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>
                    Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 700, marginTop: '4px' }}
                >
                  {isSubmitting && !activeLoggingRole ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', textAlign: 'center', fontSize: '0.72rem', color: '#64748B' }}>
              Connected API: <br />
              <code style={{ color: currentEnv === 'live' ? '#C6A15B' : '#059669', fontWeight: 700, fontSize: '0.74rem' }}>
                {activeUrl}
              </code>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: CREDENTIALS SCROLLABLE LIST                                        */}
          {/* ========================================================================= */}
          <div
            className="glass-card"
            style={{
              padding: '18px',
              borderRadius: '14px',
              background: '#FFFFFF',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="#C6A15B" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#18181B' }}>
                  Credentials
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                Pass: <code style={{ color: '#18181B', fontWeight: 700 }}>Admin@123</code>
              </span>
            </div>

            {/* Scrollable List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {rolePresets.map((preset) => {
                const IconComponent = preset.icon;
                const isThisLogging = isSubmitting && activeLoggingRole === preset.roleCode;
                return (
                  <button
                    key={preset.roleCode}
                    type="button"
                    onClick={() => handleLoginAction(preset.email, preset.pass, preset.roleCode)}
                    disabled={isSubmitting}
                    className="glass-card-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: `${preset.color}15`,
                        color: preset.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={14} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18181B' }}>
                          {preset.roleName}
                        </span>
                        <ArrowRight size={11} color="#94A3B8" />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{isThisLogging ? 'Logging in...' : preset.email}</span>
                        <span style={{ fontSize: '0.66rem', color: '#94A3B8' }}>{preset.department}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
