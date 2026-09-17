import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Layers, Tag, ArrowLeftRight, Truck, FolderTree } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProductsInventoryNav: React.FC = () => {
  const { hasPermission } = useAuth();

  const tabs = [
    { label: 'Inventory Stock & Products', path: '/inventory-items', icon: Layers, permission: 'inventory_item.read' },
    { label: 'Categories & Brands Hierarchy', path: '/categories', icon: FolderTree, permission: 'product.read' },
    { label: 'Stock Movements', path: '/stock-movements', icon: ArrowLeftRight, permission: 'stock_movement.read' },
    { label: 'Branch Transfers', path: '/inventory-transfers', icon: Truck, permission: 'inventory_transfer.read' },
  ];

  const visibleTabs = tabs.filter((t) => !t.permission || hasPermission(t.permission));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        marginBottom: '16px',
      }}
    >
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#C6A15B' : '#64748B',
              background: isActive ? 'rgba(198, 161, 91, 0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(198, 161, 91, 0.35)' : '1px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
