import { prisma } from '../../src/database';

export const seedRoles = async () => {
  const roles = [
    {
      name: 'OWNER',
      displayName: 'Store Owner / Director',
      description: 'Proprietor / MD / Partner - Full unrestricted access to all branches, profit reports, audit logs, and settings.',
    },
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Full unrestricted administrative access to system configurations, security, audit logs, and all branches.',
    },
    {
      name: 'ADMIN',
      displayName: 'System Administrator',
      description: 'IT & System Administrator managing users, branches, permissions, and technical configurations.',
    },
    {
      name: 'BRANCH_MANAGER',
      displayName: 'Showroom Store Manager',
      description: 'Showroom floor manager - Manages branch sales, inventory stock, staff attendance, approves returns & discounts.',
    },
    {
      name: 'CASHIER',
      displayName: 'Billing Cashier',
      description: 'Counter billing staff - Creates customer bills, scans barcodes/QR tags, locks gold rates, takes payments (Cash/UPI/Card).',
    },
    {
      name: 'STAFF',
      displayName: 'Billing Cashier / Staff',
      description: 'Operational billing counter and counter sales assistance staff.',
    },
    {
      name: 'SALESPERSON',
      displayName: 'Sales Executive',
      description: 'Floor counter staff - Searches jewellery items, assists customers, quotes estimated totals, tags sales commissions.',
    },
    {
      name: 'INVENTORY_MANAGER',
      displayName: 'Vault & Stock Keeper',
      description: 'Stock vault in-charge - Manages physical stock, receives vendor bullion, prints/regenerates barcode tags, handles branch transfers.',
    },
    {
      name: 'ACCOUNTANT',
      displayName: 'Accounts & Tax Officer',
      description: 'Store accountant / CA - Monitors cash/bank collections, customer credit balances, refunds, and GST (3%) tax ledgers.',
    },
    {
      name: 'KARIGAR_SUPERVISOR',
      displayName: 'Goldsmith / Workshop Head',
      description: 'Workshop supervisor - Manages old gold melting, custom jewellery orders, repairs, and craftsmanship tracking.',
    },
  ];

  console.log('[INFO] Seeding standard jewellery store staff roles...');

  const seededRoles = [];
  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, description: role.description, isActive: true },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isActive: true,
      },
    });
    seededRoles.push(created);
  }

  console.log(`[INFO] Seeded ${seededRoles.length} standard store staff roles.`);
  return seededRoles;
};
