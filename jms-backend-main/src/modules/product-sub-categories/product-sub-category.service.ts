import { productSubCategoryRepository, ProductSubCategoryRepository } from '../../repositories/productSubCategory.repository';
import { productCategoryRepository, ProductCategoryRepository } from '../../repositories/productCategory.repository';
import { CreateProductSubCategoryDTO, UpdateProductSubCategoryDTO, ProductSubCategoryQueryOptions } from './product-sub-category.types';
import { NotFoundError, ConflictError } from '../../errors';

export class ProductSubCategoryService {
  constructor(
    private repo: ProductSubCategoryRepository = productSubCategoryRepository,
    private categoryRepo: ProductCategoryRepository = productCategoryRepository
  ) {}

  async createSubCategory(data: CreateProductSubCategoryDTO) {
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category) {
      throw new NotFoundError(`Product category with ID '${data.categoryId}' not found.`);
    }

    const companyId = category.companyId;

    const existingCode = await this.repo.findByCode(companyId, data.code);
    if (existingCode) {
      throw new ConflictError(`Product sub-category with code '${data.code}' already exists.`);
    }

    return this.repo.create({
      ...data,
      companyId,
    });
  }

  async getSubCategories(options: ProductSubCategoryQueryOptions) {
    const page = Math.max(1, typeof options.page === 'number' ? options.page : parseInt((options.page as any) || '1', 10));
    const limit = Math.min(100, Math.max(1, typeof options.limit === 'number' ? options.limit : parseInt((options.limit as any) || '10', 10)));
    const search = options.search?.trim();
    const categoryId = options.categoryId?.trim();
    const isActive = (options.isActive as any) === true || (options.isActive as any) === 'true' ? true : (options.isActive as any) === false || (options.isActive as any) === 'false' ? false : undefined;
    const sortBy = options.sortBy;
    const sortOrder = options.sortOrder;

    if (categoryId) {
      const category = await this.categoryRepo.findById(categoryId);
      if (!category) {
        throw new NotFoundError(`Product category with ID '${categoryId}' not found.`);
      }
    }
    return this.repo.findAll({ page, limit, search, categoryId, isActive, sortBy, sortOrder });
  }

  async getSubCategoryById(id: string) {
    const subCategory = await this.repo.findById(id);
    if (!subCategory) {
      throw new NotFoundError(`Product sub-category with ID '${id}' not found.`);
    }
    return subCategory;
  }

  async updateSubCategory(id: string, data: UpdateProductSubCategoryDTO) {
    const existing = await this.getSubCategoryById(id);

    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw new NotFoundError(`Product category with ID '${data.categoryId}' not found.`);
      }
    }

    if (data.code && data.code !== existing.code) {
      const existingCode = await this.repo.findByCode(existing.companyId, data.code);
      if (existingCode) {
        throw new ConflictError(`Product sub-category with code '${data.code}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteSubCategory(id: string) {
    await this.getSubCategoryById(id);
    return this.repo.delete(id);
  }
}

export const productSubCategoryService = new ProductSubCategoryService();
