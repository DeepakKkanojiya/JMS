import {
  salesInvoiceRepository,
  customerRepository,
  branchRepository,
  employeeRepository,
  inventoryItemRepository,
  documentSeriesRepository,
} from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import { prisma } from '../../database';
import { SalesInvoiceStatus } from '../../generated/prisma';
import {
  CreateSalesInvoiceInput,
  UpdateSalesInvoiceInput,
  SalesInvoiceQueryOptions,
} from './salesInvoice.types';

export class SalesInvoiceService {
  /**
   * Generate a unique invoice number (INV-YYYY-XXXXX or INV-BRANCH-YYYY-XXXXX)
   */
  private async generateInvoiceNumber(companyId: string, branchId: string, branchCode: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${branchCode.toUpperCase()}-${year}`;
    return documentSeriesRepository.getNextNumber({
      companyId,
      branchId,
      documentType: 'INV',
      prefix,
    });
  }

  /**
   * Calculate financial totals for line items and invoice header
   */
  private calculateTotals(
    items: Array<{
      inventoryItemId: string;
      quantity?: number;
      unitPrice: number;
      discountAmount?: number;
      taxAmount?: number;
    }>
  ) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const calculatedItems = items.map((item) => {
      const qty = item.quantity || 1;
      const price = Number(item.unitPrice);
      const discount = Number(item.discountAmount || 0);
      const tax = Number(item.taxAmount || 0);
      const itemSubtotal = price * qty;
      const lineTotal = Math.max(0, itemSubtotal - discount + tax);

      subtotal += itemSubtotal;
      totalDiscount += discount;
      totalTax += tax;

      return {
        inventoryItemId: item.inventoryItemId,
        quantity: qty,
        unitPrice: price,
        discountAmount: discount,
        taxAmount: tax,
        lineTotal,
      };
    });

    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    return {
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      grandTotal,
      items: calculatedItems,
    };
  }

  /**
   * Validate items, branches, customer, and salesperson associations
   */
  private async validateInvoiceAssociations(
    customerId: string,
    branchId: string,
    salespersonId?: string | null,
    items?: Array<{ inventoryItemId: string }>
  ) {
    // 1. Verify Customer exists and is active
    const customer = await customerRepository.findById(customerId);
    if (!customer || !customer.isActive) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found or is inactive`);
    }

    // 2. Verify Branch exists and is active
    const branch = await branchRepository.findById(branchId);
    if (!branch || !branch.isActive) {
      throw new NotFoundError(`Branch with ID '${branchId}' not found or is inactive`);
    }

    // 3. Verify Salesperson Employee if provided
    if (salespersonId) {
      const salesperson = await employeeRepository.findById(salespersonId);
      if (!salesperson || !salesperson.isActive) {
        throw new NotFoundError(`Salesperson with ID '${salespersonId}' not found or is inactive`);
      }
      if (salesperson.branchId !== branchId) {
        throw new BadRequestError(
          `Salesperson '${salesperson.employeeCode}' does not belong to the selected branch '${branch.name}'`
        );
      }
    }

    // 4. Verify line items if provided
    if (items && items.length > 0) {
      const itemIds = items.map((i) => i.inventoryItemId);
      const uniqueItemIds = new Set(itemIds);

      if (uniqueItemIds.size !== itemIds.length) {
        throw new BadRequestError('Duplicate inventory items found in invoice items payload');
      }

      for (const itemInput of items) {
        const inventoryItem = await inventoryItemRepository.findById(itemInput.inventoryItemId);
        if (!inventoryItem) {
          throw new NotFoundError(
            `Inventory item with ID '${itemInput.inventoryItemId}' not found`
          );
        }

        if (inventoryItem.branchId !== branchId) {
          throw new BadRequestError(
            `Inventory item '${inventoryItem.itemCode}' does not belong to branch '${branch.name}'`
          );
        }

        // Must be in AVAILABLE status for selling
        if (inventoryItem.status !== 'AVAILABLE') {
          throw new BadRequestError(
            `Inventory item '${inventoryItem.itemCode}' is not available for sale (current status: '${inventoryItem.status}')`
          );
        }
      }
    }

    return { branch };
  }

  /**
   * Create a DRAFT Sales Invoice
   */
  async createSalesInvoice(input: CreateSalesInvoiceInput, userId?: string) {
    const { branch } = await this.validateInvoiceAssociations(
      input.customerId,
      input.branchId,
      input.salespersonId,
      input.items
    );

    const { subtotal, discountAmount, taxAmount, grandTotal, items } = this.calculateTotals(
      input.items
    );

    const invoiceNumber = await this.generateInvoiceNumber(branch.companyId, branch.id, branch.branchCode);

    return salesInvoiceRepository.create({
      invoiceNumber,
      customerId: input.customerId,
      branchId: input.branchId,
      salespersonId: input.salespersonId || null,
      status: SalesInvoiceStatus.DRAFT,
      invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : new Date(),
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      notes: input.notes || null,
      createdByUserId: userId || null,
      items,
    });
  }

  /**
   * Get paginated sales invoices
   */
  async getSalesInvoices(options: SalesInvoiceQueryOptions = {}) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (options.fromDate) {
      fromDate = new Date(options.fromDate);
    }

    if (options.toDate) {
      toDate = new Date(options.toDate);
    }

    return salesInvoiceRepository.findAll({
      ...options,
      fromDate,
      toDate,
    });
  }

  /**
   * Get sales invoice details by ID
   */
  async getSalesInvoiceById(id: string) {
    const invoice = await salesInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${id}' not found`);
    }
    return invoice;
  }

  /**
   * Get line items for a sales invoice
   */
  async getSalesInvoiceItems(id: string) {
    const invoice = await salesInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${id}' not found`);
    }
    return salesInvoiceRepository.findItemsByInvoiceId(id);
  }

  /**
   * Update a DRAFT sales invoice
   */
  async updateSalesInvoice(id: string, input: UpdateSalesInvoiceInput, userId?: string) {
    const existingInvoice = await salesInvoiceRepository.findById(id);
    if (!existingInvoice) {
      throw new NotFoundError(`Sales invoice with ID '${id}' not found`);
    }

    // Mutability Guard: Only DRAFT invoices can be updated
    if (existingInvoice.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestError(
        `Cannot update sales invoice '${existingInvoice.invoiceNumber}' because its current status is '${existingInvoice.status}' (only DRAFT invoices can be edited)`
      );
    }

    const effectiveCustomerId = input.customerId || existingInvoice.customerId;
    const effectiveBranchId = input.branchId || existingInvoice.branchId;
    const effectiveSalespersonId =
      input.salespersonId !== undefined
        ? input.salespersonId
        : existingInvoice.salespersonId;

    await this.validateInvoiceAssociations(
      effectiveCustomerId,
      effectiveBranchId,
      effectiveSalespersonId,
      input.items
    );

    let totalsData = {};
    if (input.items && input.items.length > 0) {
      const { subtotal, discountAmount, taxAmount, grandTotal, items } = this.calculateTotals(
        input.items
      );
      totalsData = {
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        items,
      };
    }

    return salesInvoiceRepository.update(id, {
      customerId: input.customerId,
      branchId: input.branchId,
      salespersonId: input.salespersonId,
      notes: input.notes,
      updatedByUserId: userId || null,
      ...totalsData,
    });
  }

  /**
   * Confirm a DRAFT sales invoice (DRAFT -> CONFIRMED) with atomic inventory deduction (AVAILABLE -> SOLD)
   * and SALE StockMovement creation.
   */
  async confirmSalesInvoice(id: string, userId?: string) {
    const invoice = await salesInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${id}' not found`);
    }

    if (invoice.status === SalesInvoiceStatus.CONFIRMED) {
      throw new BadRequestError(
        `Sales invoice '${invoice.invoiceNumber}' is already confirmed`
      );
    }

    if (invoice.status === SalesInvoiceStatus.CANCELLED) {
      throw new BadRequestError(
        `Cannot confirm sales invoice '${invoice.invoiceNumber}' because it is cancelled`
      );
    }

    if (invoice.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestError(
        `Cannot confirm sales invoice '${invoice.invoiceNumber}' from current status '${invoice.status}'`
      );
    }

    // Verify metal rate is locked
    if (!invoice.metalRateLocked) {
      throw new BadRequestError(
        `Metal rate must be locked on sales invoice '${invoice.invoiceNumber}' before confirmation`
      );
    }

    // Verify invoice pricing has been calculated
    if (!invoice.pricingCalculated) {
      throw new BadRequestError(
        `Invoice pricing must be calculated for sales invoice '${invoice.invoiceNumber}' before confirmation`
      );
    }

    // 1. Verify invoice has line items
    if (!invoice.items || invoice.items.length === 0) {
      throw new BadRequestError(
        `Cannot confirm sales invoice '${invoice.invoiceNumber}' because it has no line items`
      );
    }

    // 2. Prevent duplicate inventory items within invoice
    const itemIds = invoice.items.map((i: any) => i.inventoryItemId);
    const uniqueItemIds = new Set(itemIds);
    if (uniqueItemIds.size !== itemIds.length) {
      throw new BadRequestError(
        `Duplicate inventory items found in sales invoice '${invoice.invoiceNumber}'`
      );
    }

    // 3. Validate associations, branch ownership, and item status prior to transaction
    await this.validateInvoiceAssociations(
      invoice.customerId,
      invoice.branchId,
      invoice.salespersonId,
      invoice.items.map((i: any) => ({ inventoryItemId: i.inventoryItemId }))
    );

    // 4. Verify branch ownership and AVAILABLE status for each inventory item
    for (const item of invoice.items) {
      const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
      if (!invItem) {
        throw new NotFoundError(`Inventory item with ID '${item.inventoryItemId}' not found`);
      }
      if (invItem.branchId !== invoice.branchId) {
        throw new BadRequestError(
          `Inventory item '${invItem.itemCode}' belongs to branch '${invItem.branchId}', but sales invoice is for branch '${invoice.branchId}'`
        );
      }
      if (invItem.status !== 'AVAILABLE') {
        throw new BadRequestError(
          `Inventory item '${invItem.itemCode}' is not AVAILABLE for sale (current status: '${invItem.status}')`
        );
      }
    }

    // 5. Execute atomic confirmation transaction
    return prisma.$transaction(async (tx) => {
      // Lock invoice row FOR UPDATE
      await tx.$queryRawUnsafe(
        `SELECT id FROM sales_invoices WHERE id = $1 FOR UPDATE`,
        id
      );

      // Re-verify invoice status inside transaction to prevent race conditions
      const txInvoice = await tx.salesInvoice.findUnique({
        where: { id },
        include: {
          items: { include: { inventoryItem: { include: { product: true } } } },
          branch: { include: { company: true } },
          customer: { include: { customerAddresses: true } },
        },
      });

      if (!txInvoice || txInvoice.status !== SalesInvoiceStatus.DRAFT) {
        throw new ConflictError(
          `Sales invoice '${invoice.invoiceNumber}' is no longer in DRAFT status`
        );
      }

      // Resolve Company Details
      const company = txInvoice.branch.company;
      const companyNameSnapshot = company.name;
      const companyGstSnapshot = company.gstNumber || null;
      const companyAddressSnapshot = company.legalName || null;

      // Resolve Branch Details
      const branchNameSnapshot = txInvoice.branch.name;
      const branchAddressSnapshot = `${txInvoice.branch.addressLine1 || ''} ${txInvoice.branch.addressLine2 || ''} ${txInvoice.branch.city || ''} ${txInvoice.branch.state || ''} ${txInvoice.branch.pincode || ''}`.trim() || null;

      // Resolve Customer Details
      const customer = txInvoice.customer;
      const customerNameSnapshot = `${customer.firstName} ${customer.lastName || ''}`.trim();
      const customerMobileSnapshot = customer.mobile;
      const customerGstSnapshot = customer.gstNumber || null;
      const defaultAddr = customer.customerAddresses?.find((a: any) => a.isDefault) || customer.customerAddresses?.[0];
      const customerAddressSnapshot = defaultAddr ? `${defaultAddr.addressLine1} ${defaultAddr.addressLine2 || ''} ${defaultAddr.city} ${defaultAddr.state} ${defaultAddr.pincode}`.trim() : null;

      // For each item: atomically update status AVAILABLE -> SOLD & create SALE StockMovement
      for (const item of txInvoice.items) {
        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: item.inventoryItemId,
            branchId: invoice.branchId,
            status: 'AVAILABLE',
          },
          data: {
            status: 'SOLD',
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictError(
            `Inventory item '${item.inventoryItemId}' could not be marked as SOLD (item is no longer AVAILABLE or was concurrently sold)`
          );
        }

        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            fromBranchId: invoice.branchId,
            toBranchId: null,
            movementType: 'SALE',
            referenceType: 'POS_INVOICE',
            referenceId: invoice.id,
            remarks: `POS Sales Invoice ${invoice.invoiceNumber}`,
            performedBy: userId || null,
          },
        });

        // Snapshot Item Details
        const product = item.inventoryItem.product;
        await tx.salesInvoiceItem.update({
          where: { id: item.id },
          data: {
            productNameSnapshot: product.name,
            productSkuSnapshot: product.sku,
            metalTypeSnapshot: product.metalType,
            puritySnapshot: item.inventoryItem.purity,
            grossWeightSnapshot: item.inventoryItem.grossWeight,
            netWeightSnapshot: item.inventoryItem.netWeight,
            stoneWeightSnapshot: item.inventoryItem.stoneWeight,
            fineWeightSnapshot: item.inventoryItem.fineWeight,
          }
        });
      }

      // Update SalesInvoice status to CONFIRMED
      const confirmedInvoice = await tx.salesInvoice.update({
        where: { id },
        data: {
          status: SalesInvoiceStatus.CONFIRMED,
          updatedByUserId: userId || null,
          companyNameSnapshot,
          companyGstSnapshot,
          companyAddressSnapshot,
          branchNameSnapshot,
          branchAddressSnapshot,
          customerNameSnapshot,
          customerMobileSnapshot,
          customerAddressSnapshot,
          customerGstSnapshot,
        },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              firstName: true,
              lastName: true,
              email: true,
              mobile: true,
              customerType: true,
            },
          },
          branch: {
            select: {
              id: true,
              branchCode: true,
              name: true,
              city: true,
            },
          },
          salesperson: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              branchAssignments: {
                where: { isPrimary: true, effectiveTo: null },
                select: { designation: true }
              }
            },
          },
          items: {
            include: {
              inventoryItem: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      metalType: true,
                      purity: true,
                    },
                  },
                  tags: true,
                },
              },
            },
          },
          metalRateSnapshot: true,
        },
      });

      // Map back to legacy representation
      if (confirmedInvoice.salesperson) {
        (confirmedInvoice.salesperson as any).designation = confirmedInvoice.salesperson.branchAssignments?.[0]?.designation || null;
        delete (confirmedInvoice.salesperson as any).branchAssignments;
      }
      confirmedInvoice.items.forEach((item: any) => {
        if (item.inventoryItem) {
          const activeTag = item.inventoryItem.tags?.find((t: any) => t.isActive) || item.inventoryItem.tags?.[0] || null;
          item.inventoryItem.inventoryTag = activeTag;
        }
      });

      return confirmedInvoice;
    });
  }

  /**
   * Cancel a sales invoice (DRAFT -> CANCELLED or CONFIRMED -> CANCELLED)
   */
  async cancelSalesInvoice(id: string, userId?: string) {
    const invoice = await salesInvoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${id}' not found`);
    }

    if (invoice.status === SalesInvoiceStatus.CANCELLED) {
      throw new BadRequestError(
        `Sales invoice '${invoice.invoiceNumber}' is already cancelled`
      );
    }

    return salesInvoiceRepository.updateStatus(
      id,
      SalesInvoiceStatus.CANCELLED,
      userId
    );
  }

  /**
   * Quick POS lookup for AVAILABLE inventory items by itemCode, barcode, qrCode, or ID
   */
  async getPosAvailableInventoryItem(identifier: string) {
    if (!identifier || !identifier.trim()) {
      throw new BadRequestError('Identifier parameter is required');
    }
    const item = await inventoryItemRepository.lookupAvailableByIdentifier(identifier);
    if (!item) {
      throw new NotFoundError(
        `Available inventory item with identifier '${identifier}' not found`
      );
    }
    return item;
  }
}

export const salesInvoiceService = new SalesInvoiceService();
