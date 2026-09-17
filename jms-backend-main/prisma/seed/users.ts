import { prisma } from '../../src/database';
import bcrypt from 'bcryptjs';

export const seedUsers = async () => {
  console.log('[INFO] Seeding official staff user accounts for single company / single branch store...');

  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  const ownerRoleId = roleMap.get('OWNER');
  const superAdminRoleId = roleMap.get('SUPER_ADMIN') || ownerRoleId;
  const adminRoleId = roleMap.get('ADMIN') || superAdminRoleId || ownerRoleId;
  const managerRoleId = roleMap.get('BRANCH_MANAGER') || ownerRoleId;
  const cashierRoleId = roleMap.get('CASHIER') || ownerRoleId;
  const staffRoleId = roleMap.get('STAFF') || cashierRoleId || ownerRoleId;
  const salespersonRoleId = roleMap.get('SALESPERSON') || staffRoleId || ownerRoleId;
  const inventoryManagerRoleId = roleMap.get('INVENTORY_MANAGER') || managerRoleId || ownerRoleId;
  const accountantRoleId = roleMap.get('ACCOUNTANT') || ownerRoleId;
  const karigarRoleId = roleMap.get('KARIGAR_SUPERVISOR') || staffRoleId || ownerRoleId;

  if (!ownerRoleId) {
    throw new Error('Required roles not found in database. Seed roles first.');
  }

  const defaultHash = await bcrypt.hash('Admin@123', 10);

  const usersToSeed = [
    // 1. Leadership & Administration
    {
      email: 'owner@jewelleryerp.com',
      employeeCode: 'EMP-OWN-001',
      firstName: 'Tanishk',
      lastName: 'Agrawal (Owner)',
      passwordHash: defaultHash,
      roleId: ownerRoleId,
    },
    {
      email: 'superadmin@jewelleryerp.com',
      employeeCode: 'EMP-ADM-001',
      firstName: 'Vikram',
      lastName: 'Singhania (Super Admin)',
      passwordHash: defaultHash,
      roleId: superAdminRoleId!,
    },
    {
      email: 'admin@jewelleryerp.com',
      employeeCode: 'EMP-ADM-002',
      firstName: 'System',
      lastName: 'Admin',
      passwordHash: defaultHash,
      roleId: adminRoleId!,
    },
    // 2. Single Store Manager (Flagship Branch)
    {
      email: 'manager@jewelleryerp.com',
      employeeCode: 'EMP-MGR-001',
      firstName: 'Amit',
      lastName: 'Sharma (Store Manager)',
      passwordHash: defaultHash,
      roleId: managerRoleId!,
    },
    // 3. Single Head Cashier (POS & Billing)
    {
      email: 'cashier@jewelleryerp.com',
      employeeCode: 'EMP-CSH-001',
      firstName: 'Pooja',
      lastName: 'Gupta (Head Cashier)',
      passwordHash: defaultHash,
      roleId: cashierRoleId!,
    },
    {
      email: 'staff@jewelleryerp.com',
      employeeCode: 'EMP-STF-001',
      firstName: 'Rohit',
      lastName: 'Mehta (Counter Staff)',
      passwordHash: defaultHash,
      roleId: staffRoleId!,
    },
    // 4. Sales Executives
    {
      email: 'sales@jewelleryerp.com',
      employeeCode: 'EMP-SAL-001',
      firstName: 'Ananya',
      lastName: 'Roy (Sales Specialist)',
      passwordHash: defaultHash,
      roleId: salespersonRoleId!,
    },
    {
      email: 'sales2@jewelleryerp.com',
      employeeCode: 'EMP-SAL-002',
      firstName: 'Rahul',
      lastName: 'Kapoor (Bridal Gold Specialist)',
      passwordHash: defaultHash,
      roleId: salespersonRoleId!,
    },
    // 5. Vault, Accounts & Karigar
    {
      email: 'vault@jewelleryerp.com',
      employeeCode: 'EMP-VLT-001',
      firstName: 'Deepak',
      lastName: 'Chawla (Vault Keeper)',
      passwordHash: defaultHash,
      roleId: inventoryManagerRoleId!,
    },
    {
      email: 'accountant@jewelleryerp.com',
      employeeCode: 'EMP-ACC-001',
      firstName: 'Sanjay',
      lastName: 'Agrawal (CA / Accounts)',
      passwordHash: defaultHash,
      roleId: accountantRoleId!,
    },
    {
      email: 'karigar@jewelleryerp.com',
      employeeCode: 'EMP-KRG-001',
      firstName: 'Gopal',
      lastName: 'Swarnakar (Master Karigar)',
      passwordHash: defaultHash,
      roleId: karigarRoleId!,
    },
    // 6. Compatibility accounts for automated test runners
    {
      email: 'admin@erp.com',
      employeeCode: 'EMP-ADM-003',
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: defaultHash,
      roleId: ownerRoleId,
    },
    {
      email: 'staff@erp.com',
      employeeCode: 'EMP-STF-002',
      firstName: 'Operational',
      lastName: 'Staff',
      passwordHash: await bcrypt.hash('Staff@123', 10),
      roleId: cashierRoleId!,
    },
    {
      email: 'user@erp.com',
      employeeCode: 'EMP-USR-001',
      firstName: 'Standard',
      lastName: 'User',
      passwordHash: await bcrypt.hash('User@123', 10),
      roleId: staffRoleId!,
    },
  ];

  const seededUsers = [];
  for (const u of usersToSeed) {
    let employeeId: string | null = null;
    if (u.employeeCode) {
      const emp = await prisma.employee.findFirst({
        where: { employeeCode: u.employeeCode },
      });
      if (emp) {
        employeeId = emp.id;
      }
    }

    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        employeeId,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: u.passwordHash,
        roleId: u.roleId,
        status: 'ACTIVE',
      },
      create: {
        employeeId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash: u.passwordHash,
        roleId: u.roleId,
        status: 'ACTIVE',
      },
    });
    seededUsers.push(userRecord);
  }

  console.log(`[INFO] Seeded ${seededUsers.length} official store user accounts successfully.`);
  return seededUsers;
};
