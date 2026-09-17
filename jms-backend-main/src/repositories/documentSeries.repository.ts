import { prisma } from '../database';

export class DocumentSeriesRepository {
  async getNextNumber(params: {
    companyId: string;
    branchId?: string | null;
    documentType: string;
    prefix: string;
  }): Promise<string> {
    const now = new Date();
    let financialYear = await prisma.financialYear.findFirst({
      where: {
        companyId: params.companyId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!financialYear) {
      const year = now.getFullYear();
      financialYear = await prisma.financialYear.create({
        data: {
          companyId: params.companyId,
          name: `FY ${year}-${year + 1}`,
          startDate: new Date(`${year}-04-01T00:00:00Z`),
          endDate: new Date(`${year + 1}-03-31T23:59:59Z`),
          isCurrent: true,
        },
      });
    }

    return prisma.$transaction(async (tx) => {
      const series = await tx.documentSeries.findFirst({
        where: {
          companyId: params.companyId,
          branchId: params.branchId || null,
          documentType: params.documentType,
          financialYearId: financialYear.id,
        },
      });

      let currentSeries: any;

      if (!series) {
        currentSeries = await tx.documentSeries.create({
          data: {
            companyId: params.companyId,
            branchId: params.branchId || null,
            documentType: params.documentType,
            financialYearId: financialYear.id,
            prefix: params.prefix,
            nextNumber: 1,
          },
        });
      } else {
        currentSeries = series;
      }

      const [lockedSeries] = await tx.$queryRawUnsafe<any[]>(
        `SELECT id, next_number as "nextNumber", prefix FROM document_series WHERE id = $1 FOR UPDATE`,
        currentSeries.id
      );

      const nextNum = lockedSeries ? Number(lockedSeries.nextNumber) : currentSeries.nextNumber;
      const prefix = lockedSeries ? lockedSeries.prefix : currentSeries.prefix;

      await tx.documentSeries.update({
        where: { id: currentSeries.id },
        data: { nextNumber: nextNum + 1 },
      });

      return `${prefix}-${String(nextNum).padStart(5, '0')}`;
    });
  }
}

export const documentSeriesRepository = new DocumentSeriesRepository();
