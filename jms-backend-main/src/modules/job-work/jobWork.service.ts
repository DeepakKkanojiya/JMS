import { prisma } from '../../database';
import { Prisma, JobWorkOrderStatus, JobWorkItemType } from '../../generated/prisma';
import { jobWorkRepository, vendorRepository, branchRepository, companyRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreateJobWorkOrderDTO,
  UpdateJobWorkOrderDTO,
  IssueMaterialDTO,
  ReceiveJobWorkDTO,
  JobWorkOrderQueryDTO,
} from './jobWork.types';

export class JobWorkService {
  private async generateOrderNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `JW-${dateStr}-`;

    const count = await client.jobWorkOrder.count({
      where: { orderNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let orderNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.jobWorkOrder.findUnique({ where: { orderNumber } });
    while (existing) {
      seq++;
      orderNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.jobWorkOrder.findUnique({ where: { orderNumber } });
    }

    return orderNumber;
  }

  private async generateReceiptNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `JWR-${dateStr}-`;

    const count = await client.jobWorkReceipt.count({
      where: { receiptNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let receiptNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.jobWorkReceipt.findUnique({ where: { receiptNumber } });
    while (existing) {
      seq++;
      receiptNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.jobWorkReceipt.findUnique({ where: { receiptNumber } });
    }

    return receiptNumber;
  }

  async createJobWorkOrder(dto: CreateJobWorkOrderDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({ where: { id: dto.companyId } });
      if (!company) throw new NotFoundError('Company not found');

      const branch = await tx.branch.findUnique({ where: { id: dto.branchId } });
      if (!branch) throw new NotFoundError('Branch not found');
      if (!branch.isActive) throw new BadRequestError('Branch is inactive');
      if (branch.companyId !== dto.companyId) throw new BadRequestError('Branch company mismatch');

      const vendor = await tx.vendor.findUnique({ where: { id: dto.vendorId } });
      if (!vendor) throw new NotFoundError('Karigar/Vendor not found');
      if (!vendor.isActive) throw new BadRequestError('Karigar/Vendor is inactive');

      const orderNumber = await this.generateOrderNumber(tx);

      return jobWorkRepository.createOrder(
        {
          orderNumber,
          companyId: dto.companyId,
          branchId: dto.branchId,
          vendorId: dto.vendorId,
          targetItemName: dto.targetItemName,
          metalType: dto.metalType || 'GOLD',
          purity: dto.purity || '22K',
          expectedDeliveryDate: dto.expectedDeliveryDate,
          agreedWastagePercent: dto.agreedWastagePercent || 0,
          agreedMakingChargePerGram: dto.agreedMakingChargePerGram || 0,
          notes: dto.notes || null,
          createdBy: userId || null,
        },
        tx
      );
    });
  }

  async getJobWorkOrderById(id: string) {
    const order = await jobWorkRepository.findOrderById(id);
    if (!order) throw new NotFoundError('Job Work Order not found');
    return order;
  }

  async getAllJobWorkOrders(options: JobWorkOrderQueryDTO) {
    return jobWorkRepository.findAllOrders(options);
  }

  async updateJobWorkOrder(id: string, dto: UpdateJobWorkOrderDTO, userId?: string) {
    const order = await jobWorkRepository.findOrderById(id);
    if (!order) throw new NotFoundError('Job Work Order not found');
    if (order.status !== JobWorkOrderStatus.DRAFT) {
      throw new BadRequestError(`Cannot update Job Work Order in ${order.status} status. Only DRAFT orders can be updated`);
    }

    return jobWorkRepository.updateOrder(id, { ...dto, updatedBy: userId });
  }

  async submitJobWorkOrder(id: string, userId?: string) {
    const order = await jobWorkRepository.findOrderById(id);
    if (!order) throw new NotFoundError('Job Work Order not found');
    if (order.status !== JobWorkOrderStatus.DRAFT) {
      throw new BadRequestError(`Cannot submit Job Work Order in ${order.status} status. Expected DRAFT`);
    }

    return jobWorkRepository.submitOrder(id, userId || 'SYSTEM');
  }

  async assignJobWorkOrder(id: string, userId?: string) {
    const order = await jobWorkRepository.findOrderById(id);
    if (!order) throw new NotFoundError('Job Work Order not found');
    if (order.status !== JobWorkOrderStatus.SUBMITTED) {
      throw new BadRequestError(`Cannot assign Job Work Order in ${order.status} status. Expected SUBMITTED`);
    }

    return jobWorkRepository.assignOrder(id, userId || 'SYSTEM');
  }

  async issueMaterialToKarigar(id: string, dto: IssueMaterialDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await jobWorkRepository.findOrderById(id, tx);
      if (!order) throw new NotFoundError('Job Work Order not found');
      if (order.status !== JobWorkOrderStatus.ASSIGNED && order.status !== JobWorkOrderStatus.IN_PROGRESS) {
        throw new BadRequestError(`Cannot issue material for Job Work Order in ${order.status} status. Expected ASSIGNED or IN_PROGRESS`);
      }

      if (dto.inventoryItemId) {
        const invItem = await tx.inventoryItem.findUnique({ where: { id: dto.inventoryItemId } });
        if (!invItem) throw new NotFoundError('Inventory item not found');
        if (invItem.status !== 'AVAILABLE') {
          throw new ConflictError(`Inventory item '${invItem.itemCode}' is not AVAILABLE (Current: ${invItem.status})`);
        }

        // Update inventory item status => ISSUED_TO_KARIGAR
        await tx.inventoryItem.update({
          where: { id: dto.inventoryItemId },
          data: { status: 'ISSUED_TO_KARIGAR', updatedBy: userId || undefined },
        });

        // Audit Stock Movement
        await tx.stockMovement.create({
          data: {
            inventoryItemId: dto.inventoryItemId,
            fromBranchId: order.branchId,
            movementType: 'ISSUED_TO_KARIGAR',
            referenceType: 'JOB_WORK_ORDER',
            referenceId: order.id,
            remarks: `Issued to Karigar '${order.vendor.companyName}' for Job Work Order '${order.orderNumber}'`,
            performedBy: userId || null,
          },
        });
      }

      const issue = await jobWorkRepository.addMaterialIssue(
        {
          jobWorkOrderId: order.id,
          itemType: dto.itemType || JobWorkItemType.RAW_METAL,
          inventoryItemId: dto.inventoryItemId || null,
          description: dto.description,
          grossWeight: dto.grossWeight,
          stoneWeight: dto.stoneWeight || 0,
          netWeight: dto.netWeight,
          purity: dto.purity,
          fineWeight: dto.fineWeight,
          issuedBy: userId || null,
        },
        tx
      );

      return issue;
    });
  }

  async receiveJobWorkFromKarigar(id: string, dto: ReceiveJobWorkDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await jobWorkRepository.findOrderById(id, tx);
      if (!order) throw new NotFoundError('Job Work Order not found');
      if (order.status !== JobWorkOrderStatus.ASSIGNED && order.status !== JobWorkOrderStatus.IN_PROGRESS) {
        throw new BadRequestError(`Cannot receive finished goods for Job Work Order in ${order.status} status. Expected ASSIGNED or IN_PROGRESS`);
      }

      let createdInventoryItemId: string | null = null;

      // Optional: Generate finished product InventoryItem tag
      if (dto.createInventoryItem && dto.productId) {
        const product = await tx.product.findUnique({ where: { id: dto.productId } });
        if (!product) throw new NotFoundError('Product not found for finished item intake');

        const itemSeq = await tx.inventoryItem.count({ where: { companyId: order.companyId } });
        const itemCode = `ITM-JW-${(itemSeq + 1).toString().padStart(6, '0')}`;

        const invItem = await tx.inventoryItem.create({
          data: {
            companyId: order.companyId,
            productId: dto.productId,
            branchId: order.branchId,
            itemCode,
            grossWeight: new Prisma.Decimal(dto.grossWeight),
            stoneWeight: new Prisma.Decimal(dto.stoneWeight || 0),
            netWeight: new Prisma.Decimal(dto.netWeight),
            fineWeight: new Prisma.Decimal(dto.fineWeight),
            purity: dto.purity,
            status: 'AVAILABLE',
            createdBy: userId || null,
          },
        });
        createdInventoryItemId = invItem.id;

        // Generate barcode tag
        const barcode = `TAG-JW-${Date.now()}`;
        await tx.inventoryTag.create({
          data: {
            inventoryItemId: invItem.id,
            barcode,
          },
        });

        // Audit Stock Movement
        await tx.stockMovement.create({
          data: {
            inventoryItemId: invItem.id,
            toBranchId: order.branchId,
            movementType: 'KARIGAR_RECEIVING',
            referenceType: 'JOB_WORK_ORDER',
            referenceId: order.id,
            remarks: `Received finished product '${dto.itemName}' from Karigar '${order.vendor.companyName}' under Job Work Order '${order.orderNumber}'`,
            performedBy: userId || null,
          },
        });
      }

      // Calculate making charges if not explicitly supplied
      const netWeight = new Prisma.Decimal(dto.netWeight);
      const agreedMakingRate = new Prisma.Decimal(order.agreedMakingChargePerGram);
      const calculatedMakingCharges = agreedMakingRate.mul(netWeight).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      const makingCharges = dto.makingCharges !== undefined ? new Prisma.Decimal(dto.makingCharges) : calculatedMakingCharges;
      const receiptNumber = await this.generateReceiptNumber(tx);

      const receipt = await jobWorkRepository.addReceipt(
        {
          receiptNumber,
          jobWorkOrderId: order.id,
          inventoryItemId: createdInventoryItemId,
          itemName: dto.itemName,
          grossWeight: dto.grossWeight,
          stoneWeight: dto.stoneWeight || 0,
          netWeight: dto.netWeight,
          purity: dto.purity,
          fineWeight: dto.fineWeight,
          actualWastageWeight: dto.actualWastageWeight || 0,
          makingCharges,
          receivedBy: userId || null,
          remarks: dto.remarks || null,
        },
        tx
      );

      return receipt;
    });
  }

  async cancelJobWorkOrder(id: string, cancellationReason: string, userId?: string) {
    const order = await jobWorkRepository.findOrderById(id);
    if (!order) throw new NotFoundError('Job Work Order not found');
    if (order.status === JobWorkOrderStatus.COMPLETED || order.status === JobWorkOrderStatus.CANCELLED) {
      throw new BadRequestError(`Cannot cancel Job Work Order in ${order.status} status`);
    }

    if (order.issuedMaterials.length > 0) {
      throw new BadRequestError('Cannot cancel Job Work Order after materials have already been issued to Karigar');
    }

    if (!cancellationReason || cancellationReason.trim().length < 3) {
      throw new BadRequestError('Mandatory cancellation reason must be provided (at least 3 characters)');
    }

    return jobWorkRepository.cancelOrder(id, userId || 'SYSTEM', cancellationReason.trim());
  }

  async getKarigarSummary(vendorId: string) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Karigar/Vendor not found');
    return jobWorkRepository.getKarigarSummary(vendorId);
  }
}

export const jobWorkService = new JobWorkService();
