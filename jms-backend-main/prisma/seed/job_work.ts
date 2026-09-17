import { prisma } from '../../src/database';
import { JobWorkOrderStatus, JobWorkItemType } from '../../src/generated/prisma';

export async function seedJobWork() {
  console.log('[SEED] Seeding Karigar Job Work Orders & Material Issues...');

  const company = await prisma.company.findFirst({ where: { isActive: true } });
  const branch = await prisma.branch.findFirst({ where: { isActive: true } });
  const vendor = await prisma.vendor.findFirst({ where: { isActive: true } });

  if (!company || !branch || !vendor) {
    console.log('[SEED] Skipping Job Work seed - missing active company, branch, or vendor');
    return;
  }

  const orderNumber = 'JW-SEED-20260820-0001';
  const existing = await prisma.jobWorkOrder.findUnique({
    where: { orderNumber },
  });

  if (!existing) {
    // 1. Create Job Work Order in COMPLETED status
    const order = await prisma.jobWorkOrder.create({
      data: {
        orderNumber,
        companyId: company.id,
        branchId: branch.id,
        vendorId: vendor.id,
        status: JobWorkOrderStatus.COMPLETED,
        targetItemName: 'Seed 22K Handmade Gold Bangles',
        metalType: 'GOLD',
        purity: '22K',
        agreedWastagePercent: 1.5,
        agreedMakingChargePerGram: 350.00,
        totalIssuedFineWeight: 50.000,
        totalReceivedFineWeight: 49.000,
        totalWastageWeight: 0.750,
        totalMakingCharges: 17150.00,
        notes: 'Sample seed job work order for handmade bangle crafting',
        issueDate: new Date(),
        completedAt: new Date(),
      },
    });

    // 2. Add Material Issue
    await prisma.jobWorkMaterialIssue.create({
      data: {
        jobWorkOrderId: order.id,
        itemType: JobWorkItemType.RAW_METAL,
        description: '24K Gold Bullion Issue',
        grossWeight: 50.000,
        netWeight: 50.000,
        purity: '999',
        fineWeight: 50.000,
        issuedAt: new Date(),
      },
    });

    // 3. Add Job Work Receipt
    const receiptNumber = 'JWR-SEED-20260820-0001';
    await prisma.jobWorkReceipt.create({
      data: {
        receiptNumber,
        jobWorkOrderId: order.id,
        itemName: 'Seed 22K Handmade Gold Bangles',
        grossWeight: 49.500,
        stoneWeight: 0.500,
        netWeight: 49.000,
        purity: '22K',
        fineWeight: 49.000,
        actualWastageWeight: 0.750,
        makingCharges: 17150.00,
        receivedAt: new Date(),
        remarks: 'Sample seed job work receipt',
      },
    });

    console.log(`[PASS] Job Work Seeded: Order ${orderNumber} & Receipt ${receiptNumber}`);
  } else {
    console.log('[SKIP] Job Work Seed already exists');
  }
}
