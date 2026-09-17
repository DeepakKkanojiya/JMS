import { prisma } from '../../src/database';
import { AuditSessionStatus, AuditItemStatus } from '../../src/generated/prisma';

export async function seedStockAudit() {
  console.log('[SEED] Seeding Stock Audit Sessions & Audit Scanned Items...');

  const company = await prisma.company.findFirst({ where: { isActive: true } });
  const branch = await prisma.branch.findFirst({ where: { isActive: true } });

  if (!company || !branch) {
    console.log('[SEED] Skipping Stock Audit seed - missing active company or branch');
    return;
  }

  const auditNumber = 'AUD-SEED-20260820-0001';
  const existing = await prisma.stockAuditSession.findUnique({
    where: { auditNumber },
  });

  if (!existing) {
    // 1. Create Stock Audit Session in RECONCILED status
    const session = await prisma.stockAuditSession.create({
      data: {
        auditNumber,
        companyId: company.id,
        branchId: branch.id,
        status: AuditSessionStatus.RECONCILED,
        totalExpectedItems: 5,
        totalScannedItems: 5,
        totalMatchedItems: 4,
        totalMissingItems: 1,
        totalUnexpectedItems: 0,
        totalWeightMismatchItems: 0,
        totalExpectedNetWeight: 100.000,
        totalScannedNetWeight: 80.000,
        notes: 'Sample seed physical inventory stock audit and reconciliation',
        startDate: new Date(),
        completedAt: new Date(),
        reconciledAt: new Date(),
      },
    });

    // 2. Fetch inventory items to attach
    const availableItems = await prisma.inventoryItem.findMany({
      where: { branchId: branch.id },
      take: 4,
      include: { tags: true },
    });

    for (const item of availableItems) {
      await prisma.stockAuditItem.create({
        data: {
          auditSessionId: session.id,
          inventoryItemId: item.id,
          barcode: item.tags[0]?.barcode || item.itemCode,
          rfidEpc: item.tags[0]?.rfidEpc || null,
          status: AuditItemStatus.MATCHED,
          expectedGrossWeight: item.grossWeight,
          expectedNetWeight: item.netWeight,
          scannedGrossWeight: item.grossWeight,
          scannedNetWeight: item.netWeight,
          weightDiscrepancy: 0,
          remarks: 'Matched during seed physical stocktake audit',
        },
      });
    }

    console.log(`[PASS] Stock Audit Seeded: Session ${auditNumber}`);
  } else {
    console.log('[SKIP] Stock Audit Seed already exists');
  }
}
