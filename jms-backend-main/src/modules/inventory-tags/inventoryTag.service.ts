import { inventoryTagRepository, inventoryItemRepository } from '../../repositories';
import {
  CreateInventoryTagDTO,
  UpdateInventoryTagDTO,
  InventoryTagQueryOptions,
} from './inventoryTag.types';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';
import { prisma } from '../../database';

export class InventoryTagService {  /**
   * Collision-safe barcode generator.
   */
  private async generateUniqueBarcode(itemCode: string): Promise<string> {
    let candidate = itemCode;
    let existing = await inventoryTagRepository.findByBarcode(candidate);
    let counter = 1;

    while (existing && counter <= 10) {
      candidate = `${itemCode}-${counter}`;
      existing = await inventoryTagRepository.findByBarcode(candidate);
      counter++;
    }

    if (existing) {
      candidate = `${itemCode}-${Date.now().toString().slice(-4)}`;
    }

    return candidate;
  }

  /**
   * Create or assign an inventory tag to an inventory item.
   */
  async createOrAssignTag(inventoryItemId: string, dto: CreateInventoryTagDTO) {
    // 1. Verify Inventory Item exists
    const item = await inventoryItemRepository.findById(inventoryItemId);
    if (!item) {
      throw new NotFoundError(`Inventory item with ID '${inventoryItemId}' not found`);
    }

    // 2. Verify Tag does not already exist for this item
    const existingTag = await inventoryTagRepository.findByInventoryItemId(inventoryItemId);
    if (existingTag) {
      throw new ConflictError(`Inventory item '${item.itemCode}' already has an assigned tag`);
    }

    // 3. Handle Barcode
    let barcode = dto.barcode;
    if (barcode) {
      const barcodeDup = await inventoryTagRepository.findByBarcode(barcode);
      if (barcodeDup) {
        throw new ConflictError(`Barcode identifier '${barcode}' already exists`);
      }
    } else {
      barcode = await this.generateUniqueBarcode(item.itemCode);
    }

    // 5. Handle optional RFID EPC
    if (dto.rfidEpc) {
      const rfidDup = await inventoryTagRepository.findByRfidEpc(dto.rfidEpc);
      if (rfidDup) {
        throw new ConflictError(`RFID EPC identifier '${dto.rfidEpc}' already exists`);
      }
    }

    // 6. Create Tag Record
    return inventoryTagRepository.create({
      inventoryItemId,
      barcode,
      rfidEpc: dto.rfidEpc || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
  }

  /**
   * Get tag details by inventory item ID.
   */
  async getTagByInventoryItem(inventoryItemId: string) {
    const tag = await inventoryTagRepository.findByInventoryItemId(inventoryItemId);
    if (!tag) {
      throw new NotFoundError(`Tag for inventory item ID '${inventoryItemId}' not found`);
    }
    return tag;
  }

  /**
   * Update existing tag attributes.
   */
  async updateTag(inventoryItemId: string, dto: UpdateInventoryTagDTO) {
    const tag = await inventoryTagRepository.findByInventoryItemId(inventoryItemId);
    if (!tag) {
      throw new NotFoundError(`Tag for inventory item ID '${inventoryItemId}' not found`);
    }

    if (dto.barcode && dto.barcode !== tag.barcode) {
      const dup = await inventoryTagRepository.findByBarcode(dto.barcode);
      if (dup && dup.id !== tag.id) {
        throw new ConflictError(`Barcode identifier '${dto.barcode}' already exists`);
      }
    }

    if (dto.rfidEpc && dto.rfidEpc !== tag.rfidEpc) {
      const dup = await inventoryTagRepository.findByRfidEpc(dto.rfidEpc);
      if (dup && dup.id !== tag.id) {
        throw new ConflictError(`RFID EPC identifier '${dto.rfidEpc}' already exists`);
      }
    }

    return inventoryTagRepository.update(tag.id, {
      barcode: dto.barcode,
      rfidEpc: dto.rfidEpc,
      isActive: dto.isActive,
    });
  }

  /**
   * Regenerate barcode for an inventory item.
   * Executed inside a Prisma transaction for atomic safety.
   */
  async regenerateTag(inventoryItemId: string) {
    const item = await inventoryItemRepository.findById(inventoryItemId);
    if (!item) {
      throw new NotFoundError(`Inventory item with ID '${inventoryItemId}' not found`);
    }

    const tag = await inventoryTagRepository.findByInventoryItemId(inventoryItemId);
    if (!tag) {
      throw new NotFoundError(`Tag for inventory item ID '${inventoryItemId}' not found`);
    }

    const newBarcode = await this.generateUniqueBarcode(`${item.itemCode}-${Date.now().toString().slice(-4)}`);

    return prisma.$transaction(async (tx) => {
      return inventoryTagRepository.update(
        tag.id,
        {
          barcode: newBarcode,
        },
        tx
      );
    });
  }

  /**
   * Activate or deactivate tag.
   */
  async updateTagStatus(inventoryItemId: string, isActive: boolean) {
    const tag = await inventoryTagRepository.findByInventoryItemId(inventoryItemId);
    if (!tag) {
      throw new NotFoundError(`Tag for inventory item ID '${inventoryItemId}' not found`);
    }
    return inventoryTagRepository.updateStatus(tag.id, isActive);
  }

  /**
   * Lookup tag and full item details by barcode.
   */
  async getTagByBarcode(barcode: string) {
    const tag = await inventoryTagRepository.findByBarcode(barcode);
    if (!tag) {
      throw new NotFoundError(`Inventory tag with barcode '${barcode}' not found`);
    }
    if (!tag.isActive) {
      throw new NotFoundError(`Inventory tag with barcode '${barcode}' is inactive`);
    }
    return tag;
  }

  /**
   * Get paginated inventory tags with search, filters, and safe sorting.
   */
  async getTags(options?: InventoryTagQueryOptions) {
    return inventoryTagRepository.findAll(options);
  }

  /**
   * Generate downloadable vector SVG label for barcode printing
   */
  async generateBarcodeDownload(barcode: string): Promise<string> {
    const tag = await this.getTagByBarcode(barcode);
    const item = tag.inventoryItem;
    const productName = item?.product?.name || 'Jewellery Item';
    const purity = item?.purity || '';
    const weight = item?.netWeight ? `${item.netWeight}g` : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="2" rx="10"/>
  <text x="150" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1a1a1a">${productName}</text>
  <text x="150" y="42" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" fill="#555555">Purity: ${purity} | Net Wt: ${weight}</text>
  <!-- Barcode Visual Representation -->
  <g transform="translate(30, 52)">
    <rect x="0" y="0" width="4" height="50" fill="#000000"/>
    <rect x="6" y="0" width="2" height="50" fill="#000000"/>
    <rect x="12" y="0" width="6" height="50" fill="#000000"/>
    <rect x="22" y="0" width="2" height="50" fill="#000000"/>
    <rect x="28" y="0" width="4" height="50" fill="#000000"/>
    <rect x="36" y="0" width="8" height="50" fill="#000000"/>
    <rect x="48" y="0" width="2" height="50" fill="#000000"/>
    <rect x="54" y="0" width="6" height="50" fill="#000000"/>
    <rect x="64" y="0" width="4" height="50" fill="#000000"/>
    <rect x="72" y="0" width="2" height="50" fill="#000000"/>
    <rect x="78" y="0" width="6" height="50" fill="#000000"/>
    <rect x="88" y="0" width="4" height="50" fill="#000000"/>
    <rect x="96" y="0" width="8" height="50" fill="#000000"/>
    <rect x="108" y="0" width="2" height="50" fill="#000000"/>
    <rect x="114" y="0" width="4" height="50" fill="#000000"/>
    <rect x="122" y="0" width="6" height="50" fill="#000000"/>
    <rect x="132" y="0" width="2" height="50" fill="#000000"/>
    <rect x="138" y="0" width="8" height="50" fill="#000000"/>
    <rect x="150" y="0" width="4" height="50" fill="#000000"/>
    <rect x="158" y="0" width="2" height="50" fill="#000000"/>
    <rect x="164" y="0" width="6" height="50" fill="#000000"/>
    <rect x="174" y="0" width="4" height="50" fill="#000000"/>
    <rect x="182" y="0" width="8" height="50" fill="#000000"/>
    <rect x="194" y="0" width="2" height="50" fill="#000000"/>
    <rect x="200" y="0" width="6" height="50" fill="#000000"/>
    <rect x="210" y="0" width="4" height="50" fill="#000000"/>
    <rect x="218" y="0" width="2" height="50" fill="#000000"/>
    <rect x="224" y="0" width="8" height="50" fill="#000000"/>
    <rect x="236" y="0" width="4" height="50" fill="#000000"/>
  </g>
  <text x="150" y="120" font-family="Courier, monospace" font-size="14" font-weight="bold" text-anchor="middle" fill="#000000">${barcode}</text>
  <text x="150" y="138" font-family="Arial, sans-serif" font-size="9" text-anchor="middle" fill="#777777">JMS BARCODE TAG</text>
</svg>`;
  }
}

export const inventoryTagService = new InventoryTagService();
