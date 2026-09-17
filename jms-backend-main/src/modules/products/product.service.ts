import { productRepository, ProductRepository } from '../../repositories/product.repository';
import { productSubCategoryRepository, ProductSubCategoryRepository } from '../../repositories/productSubCategory.repository';
import { CreateProductDTO, UpdateProductDTO, ProductQueryOptions } from './product.types';
import { NotFoundError, ConflictError } from '../../errors';
import { prisma } from '../../database';

export class ProductService {
  constructor(
    private repo: ProductRepository = productRepository,
    private subCategoryRepo: ProductSubCategoryRepository = productSubCategoryRepository
  ) {}

  async createProduct(data: CreateProductDTO) {
    const subCategory = await this.subCategoryRepo.findById(data.subCategoryId);
    if (!subCategory) {
      throw new NotFoundError(`Product sub-category with ID '${data.subCategoryId}' not found.`);
    }

    const companyId = subCategory.companyId;

    const existingSku = await this.repo.findBySku(companyId, data.sku);
    if (existingSku) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists.`);
    }

    return this.repo.create({
      ...data,
      companyId,
    });
  }

  async getProducts(options: ProductQueryOptions) {
    const page = Math.max(1, typeof options.page === 'number' ? options.page : parseInt((options.page as any) || '1', 10));
    const limit = Math.min(100, Math.max(1, typeof options.limit === 'number' ? options.limit : parseInt((options.limit as any) || '10', 10)));
    const search = options.search?.trim();
    const subCategoryId = options.subCategoryId?.trim();
    const categoryId = options.categoryId?.trim();
    const metalType = options.metalType?.trim();
    const purity = options.purity?.trim();
    const isActive = (options.isActive as any) === true || (options.isActive as any) === 'true' ? true : (options.isActive as any) === false || (options.isActive as any) === 'false' ? false : undefined;
    const sortBy = options.sortBy;
    const sortOrder = options.sortOrder;

    if (subCategoryId) {
      const subCategory = await this.subCategoryRepo.findById(subCategoryId);
      if (!subCategory) {
        throw new NotFoundError(`Product sub-category with ID '${subCategoryId}' not found.`);
      }
    }
    return this.repo.findAll({ page, limit, search, subCategoryId, categoryId, metalType, purity, isActive, sortBy, sortOrder });
  }

  async getProductById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found.`);
    }
    return product;
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    const existing = await this.getProductById(id);

    if (data.subCategoryId && data.subCategoryId !== existing.subCategoryId) {
      const subCategory = await this.subCategoryRepo.findById(data.subCategoryId);
      if (!subCategory) {
        throw new NotFoundError(`Product sub-category with ID '${data.subCategoryId}' not found.`);
      }
    }

    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await this.repo.findBySku(existing.companyId, data.sku);
      if (existingSku) {
        throw new ConflictError(`Product with SKU '${data.sku}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteProduct(id: string) {
    const product = await this.getProductById(id);
    const count = await prisma.inventoryItem.count({ where: { productId: id } });
    if (count > 0) {
      throw new ConflictError(
        `Cannot delete product '${product.name}' (${product.sku}) because it has ${count} physical inventory item(s) associated. Please remove or reassign associated inventory items first.`
      );
    }
    return this.repo.delete(id);
  }
}

export const productService = new ProductService();
