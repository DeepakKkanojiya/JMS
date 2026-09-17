import React, { useState, useEffect } from 'react';
import { productsApi, ProductCategory, ProductSubCategory } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { parseValidationErrors } from '../api/client';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  Layers,
} from 'lucide-react';

export const Categories: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('product.create');
  const canUpdate = hasPermission('product.update');
  const canDelete = hasPermission('product.delete');

  const [activeTab, setActiveTab] = useState<'brands' | 'categories' | 'subcategories'>('brands');
  const [brands, setBrands] = useState<string[]>([
    'JMS Heritage',
    'Tanishq',
    'Kalyan Jewellers',
    'Malabar Gold & Diamonds',
    'In-House Artisan',
    'CaratLane',
    'Custom Order',
  ]);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [editingCat, setEditingCat] = useState<ProductCategory | null>(null);
  const [catFormData, setCatFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  // Subcategory Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);
  const [editingSub, setEditingSub] = useState<ProductSubCategory | null>(null);
  const [subFormData, setSubFormData] = useState({
    categoryId: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  // Delete State
  const [deletingCat, setDeletingCat] = useState<ProductCategory | null>(null);
  const [deletingSub, setDeletingSub] = useState<ProductSubCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await productsApi.listCategories({ search: search || undefined });
      setCategories(catRes?.data || []);

      const subRes = await productsApi.listSubCategories({ search: search || undefined });
      setSubCategories(subRes?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Category Handlers
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatFormData({
      name: '',
      code: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
      description: '',
      isActive: true,
    });
    setFormErrors({});
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: ProductCategory) => {
    setEditingCat(cat);
    setCatFormData({
      name: cat.name,
      code: cat.code || '',
      description: cat.description || '',
      isActive: cat.isActive !== false,
    });
    setFormErrors({});
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      if (editingCat) {
        await productsApi.updateCategory(editingCat.id, catFormData);
      } else {
        await productsApi.createCategory(catFormData);
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteCat = async () => {
    if (!deletingCat) return;
    setIsDeleting(true);
    try {
      await productsApi.deleteCategory(deletingCat.id);
      setDeletingCat(null);
      fetchData();
    } catch (err) {
      console.error('Delete category failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Subcategory Handlers
  const handleOpenAddSub = (preCatId?: string) => {
    setEditingSub(null);
    setSubFormData({
      categoryId: preCatId || categories[0]?.id || '',
      name: '',
      code: `SUB-${String(subCategories.length + 1).padStart(3, '0')}`,
      description: '',
      isActive: true,
    });
    setFormErrors({});
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (sub: ProductSubCategory) => {
    setEditingSub(sub);
    setSubFormData({
      categoryId: sub.categoryId || categories[0]?.id || '',
      name: sub.name,
      code: sub.code || '',
      description: sub.description || '',
      isActive: sub.isActive !== false,
    });
    setFormErrors({});
    setIsSubModalOpen(true);
  };

  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      if (editingSub) {
        await productsApi.updateSubCategory(editingSub.id, subFormData);
      } else {
        await productsApi.createSubCategory(subFormData);
      }
      setIsSubModalOpen(false);
      fetchData();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteSub = async () => {
    if (!deletingSub) return;
    setIsDeleting(true);
    try {
      await productsApi.deleteSubCategory(deletingSub.id);
      setDeletingSub(null);
      fetchData();
    } catch (err) {
      console.error('Delete subcategory failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#18181B' }}>
            <FolderTree color="#C6A15B" size={24} /> Product Categories & Subcategories
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '2px' }}>
            Organize rings, necklaces, bangles, and bridal collections into clean hierarchical catalog groups.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canCreate && (
            <>
              <button onClick={handleOpenAddCat} className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Category
              </button>
              <button onClick={() => handleOpenAddSub()} className="btn btn-secondary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderPlus size={16} color="#C6A15B" /> Add Subcategory
              </button>
            </>
          )}
          <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('brands')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: activeTab === 'brands' ? 700 : 500,
              background: activeTab === 'brands' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'brands' ? '#C6A15B' : '#64748B',
              boxShadow: activeTab === 'brands' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Brands ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: activeTab === 'categories' ? 700 : 500,
              background: activeTab === 'categories' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'categories' ? '#C6A15B' : '#64748B',
              boxShadow: activeTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: activeTab === 'subcategories' ? 700 : 500,
              background: activeTab === 'subcategories' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'subcategories' ? '#C6A15B' : '#64748B',
              boxShadow: activeTab === 'subcategories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Subcategories ({subCategories.length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
          />
        </div>
      </div>

      {/* Main Content Table */}
      {activeTab === 'brands' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {canCreate && (
            <div className="glass-card" style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter new brand name (e.g. Tanishq, Kalyan, In-House, Senco)..."
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newBrandName.trim()) {
                    if (!brands.includes(newBrandName.trim())) {
                      setBrands([...brands, newBrandName.trim()]);
                    }
                    setNewBrandName('');
                  }
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newBrandName.trim() && !brands.includes(newBrandName.trim())) {
                    setBrands([...brands, newBrandName.trim()]);
                    setNewBrandName('');
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Brand
              </button>
            </div>
          )}

          <div className="table-container" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <table>
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Category Coverage</th>
                  <th>Status</th>
                  {canDelete && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {brands
                  .filter((b) => !search || b.toLowerCase().includes(search.toLowerCase()))
                  .map((bName, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#1E293B', fontSize: '0.9rem' }}>{bName}</strong>
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.74rem' }}>
                          Gold, Silver, Diamond & Platinum
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                          Active Brand
                        </span>
                      </td>
                      {canDelete && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setBrands(brands.filter((b) => b !== bName))}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#DC2626' }}
                            title="Remove Brand"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'categories' ? (
        <div className="table-container" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Category Code</th>
                <th>Description</th>
                <th>Subcategories Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: '8px' }} />
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <FolderTree size={32} color="#CBD5E1" style={{ margin: '0 auto 8px', display: 'block' }} />
                    No product categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const subCount = subCategories.filter((s) => s.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id}>
                      <td>
                        <strong style={{ color: '#1E293B', fontSize: '0.9rem' }}>{cat.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: '0.76rem' }}>
                          {cat.code}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#64748B', fontSize: '0.82rem' }}>{cat.description || '--'}</span>
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.74rem' }}>
                          {subCount} Subcategories
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${cat.isActive !== false ? 'badge-emerald' : 'badge-gray'}`} style={{ fontSize: '0.72rem' }}>
                          {cat.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {canCreate && (
                            <button
                              onClick={() => handleOpenAddSub(cat.id)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#C6A15B' }}
                              title="Add subcategory inside this category"
                            >
                              <Plus size={13} /> Subcategory
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEditCat(cat)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              title="Edit Category"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingCat(cat)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#DC2626' }}
                              title="Delete Category"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <table>
            <thead>
              <tr>
                <th>Subcategory Name</th>
                <th>Subcategory Code</th>
                <th>Parent Category</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: '8px' }} />
                    Loading subcategories...
                  </td>
                </tr>
              ) : subCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <Layers size={32} color="#CBD5E1" style={{ margin: '0 auto 8px', display: 'block' }} />
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subCategories.map((sub) => {
                  const parentCat = categories.find((c) => c.id === sub.categoryId) || sub.category;
                  return (
                    <tr key={sub.id}>
                      <td>
                        <strong style={{ color: '#1E293B', fontSize: '0.9rem' }}>{sub.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: '0.76rem' }}>
                          {sub.code}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.76rem' }}>
                          {parentCat?.name || 'General'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#64748B', fontSize: '0.82rem' }}>{sub.description || '--'}</span>
                      </td>
                      <td>
                        <span className={`badge ${sub.isActive !== false ? 'badge-emerald' : 'badge-gray'}`} style={{ fontSize: '0.72rem' }}>
                          {sub.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEditSub(sub)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              title="Edit Subcategory"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingSub(sub)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'rgba(220, 38, 38, 0.4)', color: '#DC2626' }}
                              title="Delete Subcategory"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCat}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCat?.name}"? Subcategories and products linked to it may be affected.`}
        confirmText="Delete Category"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteCat}
        onCancel={() => setDeletingCat(null)}
      />

      {/* Delete Subcategory Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingSub}
        title="Delete Subcategory"
        message={`Are you sure you want to delete subcategory "${deletingSub?.name}"?`}
        confirmText="Delete Subcategory"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteSub}
        onCancel={() => setDeletingSub(null)}
      />

      {/* Category Modal */}
      {isCatModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '24px', background: '#FFFFFF', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                {editingCat ? 'Edit Product Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: '#DC2626', fontSize: '0.84rem' }}>
                <AlertCircle size={15} style={{ display: 'inline', marginRight: '6px' }} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diamond Rings, Gold Necklaces"
                  className="form-input"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT-RINGS"
                  className="form-input"
                  value={catFormData.code}
                  onChange={(e) => setCatFormData({ ...catFormData, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Category details..."
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="btn btn-secondary" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <CheckCircle size={16} />
                  <span>{isSubmitting ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '24px', background: '#FFFFFF', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                {editingSub ? 'Edit Product Subcategory' : 'Add New Subcategory'}
              </h3>
              <button onClick={() => setIsSubModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: '#DC2626', fontSize: '0.84rem' }}>
                <AlertCircle size={15} style={{ display: 'inline', marginRight: '6px' }} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSaveSubCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Parent Category *</label>
                <select
                  className="form-input"
                  required
                  value={subFormData.categoryId}
                  onChange={(e) => setSubFormData({ ...subFormData, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solitaire Rings, Choker Necklaces"
                  className="form-input"
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subcategory Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUB-SOLITAIRE"
                  className="form-input"
                  value={subFormData.code}
                  onChange={(e) => setSubFormData({ ...subFormData, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Subcategory details..."
                  value={subFormData.description}
                  onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsSubModalOpen(false)} className="btn btn-secondary" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <CheckCircle size={16} />
                  <span>{isSubmitting ? 'Saving...' : editingSub ? 'Save Changes' : 'Create Subcategory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
