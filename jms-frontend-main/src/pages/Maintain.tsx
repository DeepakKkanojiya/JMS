import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  UserX,
  Edit,
  ShieldAlert,
  FilePlus,
  FileX,
  List,
  FolderTree,
  GitMerge,
  MapPin,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

export const Maintain: React.FC = () => {
  const navigate = useNavigate();

  const accountsCards = [
    { title: 'Add', subtitle: 'Add new account', icon: UserPlus, color: '#10B981', path: '/customers' },
    { title: 'Add', subtitle: 'Delete account', icon: UserX, color: '#EF4444', path: '/customers' },
    { title: 'Modify', subtitle: 'Modify account', icon: Edit, color: '#F59E0B', path: '/customers' },
    { title: 'Modify Right', subtitle: 'Modify account rights', icon: ShieldAlert, color: '#8B5CF6', path: '/permissions' },
  ];

  const subAccountsCards = [
    { title: 'Add', subtitle: 'Add new account', icon: FilePlus, color: '#10B981', path: '/vendors' },
    { title: 'Del', subtitle: 'Delete account', icon: FileX, color: '#EF4444', path: '/vendors' },
    { title: 'Modify', subtitle: 'Modify account', icon: Edit, color: '#F59E0B', path: '/vendors' },
    { title: 'List', subtitle: 'Account list', icon: List, color: '#3B82F6', path: '/vendors' },
  ];

  const accountGroupsCards = [
    { title: 'List', subtitle: 'Account groups list', icon: FolderTree, color: '#F59E0B', path: '/categories' },
    { title: 'Account Merge', subtitle: 'Merge accounts', icon: GitMerge, color: '#F97316', path: '/maintain/merge' },
    { title: 'Location', subtitle: 'Account location', icon: MapPin, color: '#3B82F6', path: '/branches' },
    { title: 'Account Relogge', subtitle: 'Account relogge', icon: RefreshCw, color: '#8B5CF6', path: '/maintain/relogge' },
  ];

  const bottomPills = [
    { label: 'Item', path: '/products' },
    { label: 'Item Group', path: '/categories' },
    { label: 'Stamp', path: '/masters/making-charges' },
    { label: 'Diamond Stone Setup', path: '/inventory-items' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
        Maintain
      </h1>

      {/* Section 1: Accounts */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
          Accounts
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {accountsCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <IconComp size={24} color={card.color} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                    {card.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Sub Accounts */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
          Sub Accounts
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {subAccountsCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <IconComp size={24} color={card.color} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                    {card.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Account Groups */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
          Account Groups
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {accountGroupsCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <IconComp size={24} color={card.color} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                    {card.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Category Quick Navigation Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '8px' }}>
        {bottomPills.map((pill, idx) => (
          <div
            key={idx}
            onClick={() => navigate(pill.path)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: '#111827',
            }}
          >
            <span>{pill.label}</span>
            <ChevronRight size={16} color="#9CA3AF" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Maintain;
