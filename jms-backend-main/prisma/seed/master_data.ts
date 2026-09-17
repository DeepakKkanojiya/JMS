import { prisma } from '../../src/database';

export async function seedMasterData() {
  console.log('[SEED] Seeding Real Master Entities (Companies, Branches, Categories, Products, 10 Customers, 10+ Staff Employees, Vendors)...');

  // ==========================================
  // 1. Single Enterprise Company
  // ==========================================
  const company1 = await prisma.company.upsert({
    where: { gstNumber: '07AABCT1234F1Z1' },
    update: {
      companyCode: 'COMP-001',
      name: 'Tanisha Heritage Jewels Pvt Ltd',
      legalName: 'Tanisha Heritage Jewels Private Limited',
      panNumber: 'AABCT1234F',
      email: 'contact@tanishajewels.com',
      phone: '011-45678901',
      website: 'https://tanishajewels.com',
    },
    create: {
      id: '11111111-1111-4111-a111-111111111111',
      companyCode: 'COMP-001',
      name: 'Tanisha Heritage Jewels Pvt Ltd',
      legalName: 'Tanisha Heritage Jewels Private Limited',
      gstNumber: '07AABCT1234F1Z1',
      panNumber: 'AABCT1234F',
      email: 'contact@tanishajewels.com',
      phone: '011-45678901',
      website: 'https://tanishajewels.com',
      logoUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
    },
  });

  // ==========================================
  // 2. Two Showroom Branches
  // ==========================================
  const mainBranch = await prisma.branch.upsert({
    where: {
      companyId_branchCode: { companyId: company1.id, branchCode: 'BR-DEL-01' },
    },
    update: { 
      name: 'Connaught Place Flagship Showroom',
      isMainBranch: true,
    },
    create: {
      id: '22222222-2222-4222-a222-222222222221',
      companyId: company1.id,
      branchCode: 'BR-DEL-01',
      name: 'Connaught Place Flagship Showroom',
      email: 'cp.branch@tanishajewels.com',
      phone: '011-23415500',
      addressLine1: 'Plaza 14, Inner Circle, Connaught Place',
      addressLine2: 'Opposite Metro Gate 2',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      isMainBranch: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: {
      companyId_branchCode: { companyId: company1.id, branchCode: 'BR-GGN-02' },
    },
    update: {
      name: 'Gurgaon Galleria Boulevard Showroom',
      isMainBranch: false,
    },
    create: {
      id: '22222222-2222-4222-a222-222222222222',
      companyId: company1.id,
      branchCode: 'BR-GGN-02',
      name: 'Gurgaon Galleria Boulevard Showroom',
      email: 'ggn.branch@tanishajewels.com',
      phone: '0124-4455667',
      addressLine1: 'Galleria Market, Sector 28',
      addressLine2: 'DLF Phase 4',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122009',
      isMainBranch: false,
    },
  });

  // ==========================================
  // 3. Single Branch Store Team & Staff
  // ==========================================
  const users = await prisma.user.findMany();
  const userMap = new Map(users.map((u) => [u.email, u]));

  const employeeData = [
    {
      email: 'owner@jewelleryerp.com',
      code: 'EMP-001',
      firstName: 'Tanishk',
      lastName: 'Agrawal',
      mobile: '9810011001',
      designation: 'Managing Director & Store Owner',
      branchId: mainBranch.id,
    },
    {
      email: 'manager@jewelleryerp.com',
      code: 'EMP-002',
      firstName: 'Amit',
      lastName: 'Sharma',
      mobile: '9810011002',
      designation: 'Showroom Store Manager',
      branchId: mainBranch.id,
    },
    {
      email: 'cashier@jewelleryerp.com',
      code: 'EMP-003',
      firstName: 'Pooja',
      lastName: 'Gupta',
      mobile: '9810011003',
      designation: 'Head Billing Cashier',
      branchId: mainBranch.id,
    },
    {
      email: 'staff@jewelleryerp.com',
      code: 'EMP-004',
      firstName: 'Rohit',
      lastName: 'Mehta',
      mobile: '9810011014',
      designation: 'Counter Sales Staff',
      branchId: mainBranch.id,
    },
    {
      email: 'sales@jewelleryerp.com',
      code: 'EMP-005',
      firstName: 'Ananya',
      lastName: 'Roy',
      mobile: '9810011004',
      designation: 'Senior Sales Executive - Solitaire & Diamonds',
      branchId: mainBranch.id,
    },
    {
      email: 'sales2@jewelleryerp.com',
      code: 'EMP-006',
      firstName: 'Rahul',
      lastName: 'Kapoor',
      mobile: '9810011008',
      designation: 'Sales Executive - Bridal Gold & Ornaments',
      branchId: mainBranch.id,
    },
    {
      email: 'vault@jewelleryerp.com',
      code: 'EMP-007',
      firstName: 'Deepak',
      lastName: 'Chawla',
      mobile: '9810011005',
      designation: 'Vault & Bullion Stock Keeper',
      branchId: mainBranch.id,
    },
    {
      email: 'accountant@jewelleryerp.com',
      code: 'EMP-008',
      firstName: 'Sanjay',
      lastName: 'Agrawal',
      mobile: '9810011006',
      designation: 'Chief Accounts & Tax Officer',
      branchId: mainBranch.id,
    },
    {
      email: 'karigar@jewelleryerp.com',
      code: 'EMP-009',
      firstName: 'Gopal',
      lastName: 'Swarnakar',
      mobile: '9810011007',
      designation: 'Workshop Head & Goldsmith Supervisor',
      branchId: mainBranch.id,
    },
  ];

  for (const emp of employeeData) {
    const userRec = userMap.get(emp.email);
    const existingEmp = await prisma.employee.findFirst({
      where: { employeeCode: emp.code },
    });

    if (existingEmp) {
      await prisma.employee.update({
        where: { id: existingEmp.id },
        data: {
          firstName: emp.firstName,
          lastName: emp.lastName,
        },
      });

      // Update primary assignment
      const current = await prisma.employeeBranchAssignment.findFirst({
        where: { employeeId: existingEmp.id, isPrimary: true, effectiveTo: null },
      });
      if (current && (current.branchId !== emp.branchId || current.designation !== emp.designation)) {
        await prisma.employeeBranchAssignment.update({
          where: { id: current.id },
          data: { isPrimary: false, effectiveTo: new Date() },
        });
        await prisma.employeeBranchAssignment.create({
          data: {
            employeeId: existingEmp.id,
            branchId: emp.branchId,
            designation: emp.designation,
            isPrimary: true,
          },
        });
      }

      if (userRec) {
        await prisma.user.update({
          where: { id: userRec.id },
          data: { employeeId: existingEmp.id },
        });
      }
    } else {
      const newEmp = await prisma.employee.create({
        data: {
          companyId: company1.id,
          employeeCode: emp.code,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          mobile: emp.mobile,
          joiningDate: new Date('2024-01-15T00:00:00.000Z'),
          branchAssignments: {
            create: {
              branchId: emp.branchId,
              designation: emp.designation,
              isPrimary: true,
            },
          },
        },
      });

      if (userRec) {
        await prisma.user.update({
          where: { id: userRec.id },
          data: { employeeId: newEmp.id },
        });
      }
    }
  }

  // ==========================================
  // 4. Product Categories
  // ==========================================
  const catGold = await prisma.productCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'CAT-GOLD' },
    },
    update: { name: 'Gold Jewellery' },
    create: {
      id: '33333333-3333-4333-a333-333333333331',
      companyId: company1.id,
      name: 'Gold Jewellery',
      code: 'CAT-GOLD',
      description: 'Hallmarked 22K, 18K, and 14K Gold Ornaments & Jewellery Articles',
    },
  });

  const catDiamond = await prisma.productCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'CAT-DIAMOND' },
    },
    update: { name: 'Diamond Jewellery' },
    create: {
      id: '33333333-3333-4333-a333-333333333332',
      companyId: company1.id,
      name: 'Diamond Jewellery',
      code: 'CAT-DIAMOND',
      description: 'IGI/GIA Certified Solitaire and Studded Diamond Jewellery',
    },
  });

  const catSilver = await prisma.productCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'CAT-SILVER' },
    },
    update: { name: 'Silver Articles & Jewellery' },
    create: {
      id: '33333333-3333-4333-a333-333333333333',
      companyId: company1.id,
      name: 'Silver Articles & Jewellery',
      code: 'CAT-SILVER',
      description: '999 Fine Silver Bullion Coins, 925 Sterling Silver Ornaments & Utensils',
    },
  });

  const catPlatinum = await prisma.productCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'CAT-PLATINUM' },
    },
    update: { name: 'Platinum Collection' },
    create: {
      id: '33333333-3333-4333-a333-333333333334',
      companyId: company1.id,
      name: 'Platinum Collection',
      code: 'CAT-PLATINUM',
      description: 'PGI Certified 950 Pure Platinum Couple Bands, Chains, and Pendants',
    },
  });

  // ==========================================
  // 5. Product Sub-Categories
  // ==========================================
  const subCatGoldRing = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-GOLD-RNG' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444441',
      companyId: company1.id,
      categoryId: catGold.id,
      name: 'Gold Rings',
      code: 'SUBCAT-GOLD-RNG',
      description: 'Ladies & Gents 22K/18K Gold Designer Rings',
    },
  });

  const subCatGoldNecklace = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-GOLD-NCK' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444442',
      companyId: company1.id,
      categoryId: catGold.id,
      name: 'Gold Necklaces',
      code: 'SUBCAT-GOLD-NCK',
      description: 'Bridal Chokers, Temple Haar, and Lightweight Gold Necklaces',
    },
  });

  const subCatGoldChain = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-GOLD-CHN' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444443',
      companyId: company1.id,
      categoryId: catGold.id,
      name: 'Gold Chains',
      code: 'SUBCAT-GOLD-CHN',
      description: 'Daily Wear Hollow & Solid Machine-Made Gold Chains',
    },
  });

  const subCatGoldBangle = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-GOLD-BNG' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444444',
      companyId: company1.id,
      categoryId: catGold.id,
      name: 'Gold Bangles & Kadas',
      code: 'SUBCAT-GOLD-BNG',
      description: 'Antique Finished & Die-Cast Gold Bangles and Kadas',
    },
  });

  const subCatDiamondRing = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-DMD-RNG' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444445',
      companyId: company1.id,
      categoryId: catDiamond.id,
      name: 'Diamond Solitaire Rings',
      code: 'SUBCAT-DMD-RNG',
      description: '18K White/Rose/Yellow Gold Diamond Engagement Rings',
    },
  });

  const subCatDiamondEarring = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-DMD-ERG' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444446',
      companyId: company1.id,
      categoryId: catDiamond.id,
      name: 'Diamond Stud Earrings',
      code: 'SUBCAT-DMD-ERG',
      description: 'Solitaire & Cluster Diamond Tops & Drop Earrings',
    },
  });

  const subCatSilverCoin = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-SLV-COIN' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444447',
      companyId: company1.id,
      categoryId: catSilver.id,
      name: 'Silver Coins & Bars',
      code: 'SUBCAT-SLV-COIN',
      description: '999 Pure Silver Religious Coins and Investment Bullion Bars',
    },
  });

  const subCatPlatinumBand = await prisma.productSubCategory.upsert({
    where: {
      companyId_code: { companyId: company1.id, code: 'SUBCAT-PLT-BND' },
    },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444448',
      companyId: company1.id,
      categoryId: catPlatinum.id,
      name: 'Platinum Couple Bands',
      code: 'SUBCAT-PLT-BND',
      description: '950 Pure Platinum Wedding & Anniversary Rings',
    },
  });

  // ==========================================
  // 6. Real Products with HD Jewellery Images
  // ==========================================
  const productsToSeed = [
    {
      id: '50000000-0000-4000-a000-000000000001',
      subCategoryId: subCatGoldRing.id,
      sku: 'SKU-GOLD-RNG-22K-001',
      name: '22K Peacock Antique Gold Ring',
      description: 'Handcrafted traditional Peacock motif gold ring with Meenakari enamel accents',
      metalType: 'GOLD',
      purity: '22K',
      grossWeight: 5.45,
      netWeight: 5.45,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000002',
      subCategoryId: subCatGoldNecklace.id,
      sku: 'SKU-GOLD-NCK-22K-002',
      name: '22K Royal Temple Bridal Choker Necklace',
      description: 'Magnificent 22K temple jewellery choker necklace crafted with Lakshmi Goddess engravings and cluster bead hangings',
      metalType: 'GOLD',
      purity: '22K',
      grossWeight: 38.20,
      netWeight: 38.20,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000003',
      subCategoryId: subCatGoldChain.id,
      sku: 'SKU-GOLD-CHN-22K-003',
      name: '22K Classic Hollow Rope Gold Chain',
      description: '22-inch Italian cut daily wear hollow rope design gold chain with lobster claw lock',
      metalType: 'GOLD',
      purity: '22K',
      grossWeight: 14.50,
      netWeight: 14.50,
      imageUrl: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000004',
      subCategoryId: subCatGoldBangle.id,
      sku: 'SKU-GOLD-BNG-22K-004',
      name: '22K Handcrafted Filigree Gold Kada',
      description: 'Openable screw-style royal gold kada with intricate floral filigree craftsmanship',
      metalType: 'GOLD',
      purity: '22K',
      grossWeight: 26.80,
      netWeight: 26.80,
      imageUrl: 'https://images.unsplash.com/photo-1611591475102-4fa1b7765a7e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000005',
      subCategoryId: subCatDiamondRing.id,
      sku: 'SKU-DMD-RNG-18K-005',
      name: '18K Solitaire Diamond Engagement Ring',
      description: '0.75 Carat round brilliant cut VVS1-EF certified diamond mounted on 18K white gold prong setting',
      metalType: 'GOLD',
      purity: '18K',
      grossWeight: 3.85,
      netWeight: 3.70,
      imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000006',
      subCategoryId: subCatDiamondEarring.id,
      sku: 'SKU-DMD-ERG-18K-006',
      name: '18K Floral Diamond Stud Earrings',
      description: 'Pair of floral cluster diamond stud earrings with 0.50 ctw brilliant cut diamonds in 18K rose gold',
      metalType: 'GOLD',
      purity: '18K',
      grossWeight: 4.20,
      netWeight: 4.10,
      imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000007',
      subCategoryId: subCatSilverCoin.id,
      sku: 'SKU-SLV-COIN-999-007',
      name: '999 Fine Silver Lakshmi Ganesh 50g Coin',
      description: '99.9% fine silver festive gift coin minted with embossed Lord Ganesha and Goddess Lakshmi icons',
      metalType: 'SILVER',
      purity: '999',
      grossWeight: 50.00,
      netWeight: 50.00,
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '50000000-0000-4000-a000-000000000008',
      subCategoryId: subCatPlatinumBand.id,
      sku: 'SKU-PLT-BND-950-008',
      name: '950 Pure Platinum Forever Love Couple Band',
      description: 'Sleek matte and high-polish dual-finish 950 platinum wedding band with single hidden diamond',
      metalType: 'PLATINUM',
      purity: '950',
      grossWeight: 6.25,
      netWeight: 6.25,
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    },
  ];

  for (const prod of productsToSeed) {
    const createdProd = await prisma.product.upsert({
      where: {
        companyId_sku: { companyId: company1.id, sku: prod.sku },
      },
      update: {
        name: prod.name,
        description: prod.description,
        metalType: prod.metalType,
        purity: prod.purity,
        grossWeight: prod.grossWeight,
        netWeight: prod.netWeight,
      },
      create: {
        id: prod.id,
        companyId: company1.id,
        subCategoryId: prod.subCategoryId,
        sku: prod.sku,
        name: prod.name,
        description: prod.description,
        metalType: prod.metalType,
        purity: prod.purity,
        grossWeight: prod.grossWeight,
        netWeight: prod.netWeight,
      },
    });

    const existingImg = await prisma.productImage.findFirst({
      where: { productId: createdProd.id, isPrimary: true },
    });

    if (!existingImg) {
      await prisma.productImage.create({
        data: {
          productId: createdProd.id,
          imageUrl: prod.imageUrl,
          thumbnailUrl: prod.imageUrl,
          altText: prod.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
  }

  // ==========================================
  const customersToSeed = [
    // RETAIL Walk-in & Bridal Buyers
    {
      code: 'CUST-001',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@example.com',
      mobile: '9811223344',
      panNumber: 'ABCPS1234A',
      aadharNumber: '543212345678',
      customerType: 'RETAIL',
      addressLine1: 'Flat 402, Green Park Enclave',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      docType: 'AADHAR',
      docNum: '5432-1234-5678',
      branchId: mainBranch.id,
    },
    {
      code: 'CUST-002',
      firstName: 'Rohan',
      lastName: 'Malhotra',
      email: 'rohan.malhotra@gmail.com',
      mobile: '9811223345',
      panNumber: 'ABCMR2345B',
      aadharNumber: '543212345679',
      customerType: 'RETAIL',
      addressLine1: 'B-24, Hauz Khas Main Market',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      docType: 'AADHAR',
      docNum: '5432-1234-5679',
      branchId: mainBranch.id,
    },
    {
      code: 'CUST-003',
      firstName: 'Sunita',
      lastName: 'Deshmukh',
      email: 'sunita.deshmukh@yahoo.com',
      mobile: '9811223346',
      panNumber: 'ABCDD3456C',
      customerType: 'RETAIL',
      addressLine1: 'Pocket 3, Sector D, Vasant Kunj',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110070',
      docType: 'DRIVING_LICENSE',
      docNum: 'DL-0420180012345',
      branchId: mainBranch.id,
    },

    // WHOLESALE B2B Bulk Traders
    {
      code: 'CUST-004',
      firstName: 'Mittal',
      lastName: 'Bullion & Trade Mart',
      email: 'sales@mittalbullion.com',
      mobile: '9822334455',
      panNumber: 'AACCM5566B',
      gstNumber: '07AACCM5566B1Z8',
      customerType: 'WHOLESALE',
      addressLine1: 'Shop 102, Kucha Mahajani, Chandni Chowk',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110006',
      docType: 'GST_CERTIFICATE',
      docNum: '07AACCM5566B1Z8',
      branchId: mainBranch.id,
    },
    {
      code: 'CUST-005',
      firstName: 'Zaveri',
      lastName: 'Bazaar Gemstone Traders',
      email: 'orders@zaveritraders.com',
      mobile: '9822334456',
      panNumber: 'AABCT9988H',
      gstNumber: '27AABCT9988H1Z5',
      customerType: 'WHOLESALE',
      addressLine1: '128, Sheikh Memon Street, Zaveri Bazaar',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      docType: 'GST_CERTIFICATE',
      docNum: '27AABCT9988H1Z5',
      branchId: mainBranch.id,
    },

    // VIP High-Value Clients
    {
      code: 'CUST-006',
      firstName: 'Vikramaditya',
      lastName: 'Singhania',
      email: 'v.singhania@heritagegroup.in',
      mobile: '9833445566',
      panNumber: 'AABPS9988C',
      customerType: 'VIP',
      addressLine1: 'Villa 12, Golf Links',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110003',
      docType: 'PASSPORT',
      docNum: 'Z9876543',
      branchId: mainBranch.id,
    },
    {
      code: 'CUST-007',
      firstName: 'Gayatri',
      lastName: 'Devi Trust / Royal Palace',
      email: 'estates@gayatritrust.org',
      mobile: '9833445567',
      panNumber: 'AAATG8877D',
      customerType: 'VIP',
      addressLine1: 'Heritage Bhavan, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
      docType: 'TRUST_DEED',
      docNum: 'TR-RJ-1985-001',
      branchId: mainBranch.id,
    },
    {
      code: 'CUST-008',
      firstName: 'Dr. Arvind',
      lastName: 'Swaminathan',
      email: 'arvind.swaminathan@apollo.org',
      mobile: '9833445568',
      panNumber: 'ABCPS6655E',
      customerType: 'VIP',
      addressLine1: 'M-Block, Greater Kailash 2',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110048',
      docType: 'PAN_CARD',
      docNum: 'ABCPS6655E',
      branchId: mainBranch.id,
    },

    // CORPORATE Institutional Gifting Clients
    {
      code: 'CUST-009',
      firstName: 'Reliance',
      lastName: 'Corporate Gifting Desk',
      email: 'corporate.gifts@rilgifting.com',
      mobile: '9844556677',
      panNumber: 'AABCR1122D',
      gstNumber: '07AABCR1122D1Z2',
      customerType: 'CORPORATE',
      addressLine1: 'Barakhamba Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      docType: 'COMPANY_PAN',
      docNum: 'AABCR1122D',
      branchId: mainBranch.id,
    },
    {
      code: 'CUST-010',
      firstName: 'Tata Consultancy Services',
      lastName: 'Festive Rewards Cell',
      email: 'employee.rewards@tcs.com',
      mobile: '9844556678',
      panNumber: 'AAACT2233E',
      gstNumber: '06AAACT2233E1Z4',
      customerType: 'CORPORATE',
      addressLine1: 'DLF Cyber Park, Udyog Vihar Phase 3',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122016',
      docType: 'GST_CERTIFICATE',
      docNum: '06AAACT2233E1Z4',
      branchId: mainBranch.id,
    },
  ];

  for (const c of customersToSeed) {
    await prisma.customer.upsert({
      where: {
        companyId_customerCode: { companyId: company1.id, customerCode: c.code },
      },
      update: {
        branchId: c.branchId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        customerType: c.customerType,
        panNumber: c.panNumber,
        gstNumber: c.gstNumber || null,
        aadharNumber: c.aadharNumber || null,
      },
      create: {
        companyId: company1.id,
        branchId: c.branchId,
        customerCode: c.code,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        mobile: c.mobile,
        panNumber: c.panNumber,
        gstNumber: c.gstNumber || null,
        aadharNumber: c.aadharNumber || null,
        customerType: c.customerType,
        customerAddresses: {
          create: [
            {
              addressType: 'OFFICE',
              addressLine1: c.addressLine1,
              city: c.city,
              state: c.state,
              pincode: c.pincode,
              isDefault: true,
            },
          ],
        },
        customerDocuments: {
          create: [
            {
              documentType: c.docType,
              documentNumber: c.docNum,
              fileUrl: `https://storage.jewelleryerp.com/docs/${c.code.toLowerCase()}_kyc.pdf`,
            },
          ],
        },
      },
    });
  }

  // ==========================================
  // 8. Vendors (Bullion & Artisan Suppliers)
  // ==========================================
  await prisma.vendor.upsert({
    where: {
      companyId_vendorCode: { companyId: company1.id, vendorCode: 'VEND-001' },
    },
    update: {},
    create: {
      companyId: company1.id,
      branchId: mainBranch.id,
      vendorCode: 'VEND-001',
      companyName: 'MMTC-PAMP Bullion Refinery Pvt Ltd',
      contactPerson: 'Harish Nair',
      email: 'orders@mmtcpamp.com',
      mobile: '9876500111',
      gstNumber: '07AAAAM1111A1Z5',
      panNumber: 'AAAAM1111A',
      vendorType: 'BULLION',
      addressLine1: 'Roj-ka-Meo Industrial Area',
      city: 'Mewat',
      state: 'Haryana',
      pincode: '122103',
    },
  });

  await prisma.vendor.upsert({
    where: {
      companyId_vendorCode: { companyId: company1.id, vendorCode: 'VEND-002' },
    },
    update: {},
    create: {
      companyId: company1.id,
      branchId: mainBranch.id,
      vendorCode: 'VEND-002',
      companyName: 'Surat Artisan Diamond & Jewellery Guild',
      contactPerson: 'Kantilal Patel',
      email: 'support@suratdiamondguild.com',
      mobile: '9876500222',
      gstNumber: '24AAAKS2222B1Z4',
      panNumber: 'AAAKS2222B',
      vendorType: 'JEWELLERY',
      addressLine1: 'Mini Bazar, Varachha Road',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395006',
    },
  });

  console.log(`[PASS] Real Master Entities Seeded: ${employeeData.length} Staff Employees, ${customersToSeed.length} Real Customers.`);
}
