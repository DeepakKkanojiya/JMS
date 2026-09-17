import { prisma } from '../../database';
import { productCategoryRepository, ProductCategoryRepository } from '../../repositories/productCategory.repository';
import { CreateProductCategoryDTO, UpdateProductCategoryDTO, ProductCategoryQueryOptions } from './product-category.types';
import { NotFoundError, ConflictError } from '../../errors';

export class ProductCategoryService {
  constructor(private repo: ProductCategoryRepository = productCategoryRepository) {}

  async createCategory(data: CreateProductCategoryDTO) {
    let companyId = data.companyId || '';
    if (!companyId) {
      const company = await prisma.company.findFirst();
      if (!company) {
        throw new NotFoundError(`No company found in database.`);
      }
      companyId = company.id;
    }

    const existingCode = await this.repo.findByCode(companyId, data.code);
    if (existingCode) {
      throw new ConflictError(`Product category with code '${data.code}' already exists.`);
    }

    const existingName = await this.repo.findByName(data.name);
    if (existingName) {
      throw new ConflictError(`Product category with name '${data.name}' already exists.`);
    }

    return this.repo.create({
      ...data,
      companyId,
    });
  }

  async getCategories(options: ProductCategoryQueryOptions) {
    const page = Math.max(1, typeof options.page === 'number' ? options.page : parseInt((options.page as any) || '1', 10));
    const limit = Math.min(100, Math.max(1, typeof options.limit === 'number' ? options.limit : parseInt((options.limit as any) || '10', 10)));
    const search = options.search?.trim();
    const isActive = (options.isActive as any) === true || (options.isActive as any) === 'true' ? true : (options.isActive as any) === false || (options.isActive as any) === 'false' ? false : undefined;
    const sortBy = options.sortBy;
    const sortOrder = options.sortOrder;

    return this.repo.findAll({ page, limit, search, isActive, sortBy, sortOrder });
  }

  async getCategoryById(id: string) {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new NotFoundError(`Product category with ID '${id}' not found.`);
    }
    return category;
  }

  async updateCategory(id: string, data: UpdateProductCategoryDTO) {
    const existing = await this.getCategoryById(id);

    if (data.code && data.code !== existing.code) {
      const existingCode = await this.repo.findByCode(existing.companyId, data.code);
      if (existingCode) {
        throw new ConflictError(`Product category with code '${data.code}' already exists.`);
      }
    }

    if (data.name && data.name !== existing.name) {
      const existingName = await this.repo.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`Product category with name '${data.name}' already exists.`);
      }
    }

    return this.repo.update(id, data);
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);
    return this.repo.delete(id);
  }
}

export const productCategoryService = new ProductCategoryService();
