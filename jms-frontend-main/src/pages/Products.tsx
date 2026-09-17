import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseValidationErrors, getActiveBaseUrl } from '../api/client';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { productsApi, ProductCategory, ProductSubCategory } from '../api/products';
import { imagesApi } from '../api/images';
import { useAuth } from '../context/AuthContext';
import { ProductImageGallery } from '../components/images/ProductImageGallery';
import { QRScannerModal } from '../components/qr/QRScannerModal';
import {
  Gem,
  RefreshCw,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Image as ImageIcon,
  Camera,
  Download,
  Barcode,
  Layers,
  Package,
  Wand2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Upload,
  ArrowRight,
  Shield,
  Tag,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

// Standard Default Categories and Subcategories for Jewelry Management Systems
const DEFAULT_CATEGORIES = [
  { id: 'cat-gold', name: 'Gold Jewellery', code: 'GOLD', metalType: 'GOLD', description: '22K & 18K Hallmarked Gold Ornaments' },
  { id: 'cat-silver', name: 'Silver Jewellery', code: 'SILVER', metalType: 'SILVER', description: '925 Sterling Silver & Utensils' },
  { id: 'cat-diamond', name: 'Diamond Jewellery', code: 'DIAMOND', metalType: 'DIAMOND', description: 'Certified Solitaire & Diamond Studded Jewellery' },
  { id: 'cat-platinum', name: 'Platinum Jewellery', code: 'PLATINUM', metalType: 'PLATINUM', description: '950 Purity Platinum Bands & Chains' },
  { id: 'cat-gemstone', name: 'Gemstone Jewellery', code: 'GEMSTONE', metalType: 'GOLD', description: 'Precious & Semi-precious Gemstones' },
];

const DEFAULT_SUBCATEGORIES: Record<string, { id: string; name: string; code: string }[]> = {
  GOLD: [
    { id: 'sub-g-ring', name: 'Ring', code: 'RING' },
    { id: 'sub-g-chain', name: 'Chain', code: 'CHAIN' },
    { id: 'sub-g-necklace', name: 'Necklace', code: 'NECKLACE' },
    { id: 'sub-g-earrings', name: 'Earrings', code: 'EARRINGS' },
    { id: 'sub-g-bracelet', name: 'Bracelet', code: 'BRACELET' },
    { id: 'sub-g-bangle', name: 'Bangle', code: 'BANGLE' },
    { id: 'sub-g-pendant', name: 'Pendant', code: 'PENDANT' },
    { id: 'sub-g-mangalsutra', name: 'Mangalsutra', code: 'MANGALSUTRA' },
  ],
  SILVER: [
    { id: 'sub-s-anklet', name: 'Anklet / Payal', code: 'ANKLET' },
    { id: 'sub-s-coin', name: 'Silver Coin / Bar', code: 'COIN' },
    { id: 'sub-s-ring', name: 'Silver Ring', code: 'RING' },
    { id: 'sub-s-utensil', name: 'Utensils & Puja Items', code: 'UTENSIL' },
    { id: 'sub-s-kada', name: 'Men Kada', code: 'KADA' },
  ],
  DIAMOND: [
    { id: 'sub-d-ring', name: 'Diamond Ring', code: 'RING' },
    { id: 'sub-d-earrings', name: 'Diamond Earrings', code: 'EARRINGS' },
    { id: 'sub-d-pendant', name: 'Diamond Pendant', code: 'PENDANT' },
    { id: 'sub-d-bracelet', name: 'Tennis Bracelet', code: 'BRACELET' },
    { id: 'sub-d-solitaire', name: 'Solitaire Engagement Ring', code: 'SOLITAIRE' },
  ],
  PLATINUM: [
    { id: 'sub-p-band', name: 'Couple Bands', code: 'BAND' },
    { id: 'sub-p-chain', name: 'Platinum Chain', code: 'CHAIN' },
    { id: 'sub-p-ring', name: 'Platinum Ring', code: 'RING' },
  ],
  GEMSTONE: [
    { id: 'sub-gem-ring', name: 'Navratna / Astrological Ring', code: 'RING' },
    { id: 'sub-gem-necklace', name: 'Emerald / Ruby Beads Necklace', code: 'NECKLACE' },
  ],
};

export const Products: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasPermission('product.create');
  const canUpdate = hasPermission('product.update');
  const canDelete = hasPermission('product.delete');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [metalFilter, setMetalFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [imageModalProduct, setImageModalProduct] = useState<any | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState<boolean>(false);

  // Quick Add Subcategory Inline Modal
  const [quickSubModalOpen, setQuickSubModalOpen] = useState<boolean>(false);
  const [newSubName, setNewSubName] = useState<string>('');

  // Dual Image Input State (File Upload OR Image URL)
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imageAltText, setImageAltText] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: '',
    subCategoryId: '',
    metalType: 'GOLD',
    purity: '22K',
    grossWeight: '10.5',
    netWeight: '10.0',
    description: '',
    brand: 'JMS Heritage',
    isActive: true,
    hsnCode: '7113',
    qrCode: '',
    barcode: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, metalFilter, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({
        search: search || undefined,
        metalType: metalFilter || undefined,
        categoryId: categoryFilter || undefined,
        page: 1,
        limit: 100,
      });
      if (res?.success || Array.isArray(res?.data)) {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const catRes = await productsApi.listCategories();
      const loadedCats = catRes?.data && catRes.data.length > 0 ? catRes.data : DEFAULT_CATEGORIES;
      setCategories(loadedCats);

      const subRes = await productsApi.listSubCategories();
      if (subRes?.data && subRes.data.length > 0) {
        setSubCategories(subRes.data);
      } else {
        // Flatten default subcategories
        const flattenedDefaults: any[] = [];
        Object.entries(DEFAULT_SUBCATEGORIES).forEach(([metal, list]) => {
          const parent = loadedCats.find((c: any) => c.code === metal || c.name.toUpperCase().includes(metal)) || loadedCats[0];
          list.forEach((item) => {
            flattenedDefaults.push({
              ...item,
              categoryId: parent?.id || 'cat-gold',
            });
          });
        });
        setSubCategories(flattenedDefaults);
      }
    } catch (e) {
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const getFullImageUrl = (urlPath: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://') || urlPath.startsWith('blob:')) return urlPath;
    const baseApi = getActiveBaseUrl();
    const origin = baseApi.replace(/\/api\/v1\/?$/, '');
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    return `${origin}${cleanPath}`;
  };

  const downloadQrImage = (qrValue: string, labelName: string) => {
    if (!qrValue) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${labelName || qrValue}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormErrors({});
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors({ general: 'Invalid file format. Allowed: JPEG, PNG, WEBP.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ general: 'File size exceeds 5MB limit.' });
        return;
      }
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Helper to automatically generate clean, human-readable SKU & Barcode
  const generateSmartSku = (catId?: string, subCatId?: string, metal?: string) => {
    const selectedCat = categories.find((c) => c.id === (catId || formData.categoryId));
    const selectedSub = subCategories.find((s) => s.id === (subCatId || formData.subCategoryId));
    const metalCode = (metal || formData.metalType || 'GOLD').substring(0, 3).toUpperCase();
    const subCode = selectedSub?.code || (selectedSub?.name ? selectedSub.name.substring(0, 4).toUpperCase() : 'ITEM');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const autoSku = `JMS-${metalCode}-${subCode}-${randomNum}`;

    setFormData((prev) => ({
      ...prev,
      sku: autoSku,
      barcode: `BC-${autoSku}`,
      qrCode: `QR-${autoSku}`,
    }));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setSelectedImageFile(null);
    setImageUrlInput('');
    setImageInputMode('file');
    setImageAltText('');
    setImagePreviewUrl(null);
    setShowAdvancedFields(false);

    const defaultCat = categories[0]?.id || '';
    const filteredSubs = subCategories.filter((s) => s.categoryId === defaultCat);
    const defaultSub = filteredSubs[0]?.id || '';
    const initialSku = `JMS-GLD-RING-${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData({
      sku: initialSku,
      name: '',
      categoryId: defaultCat,
      subCategoryId: defaultSub,
      metalType: 'GOLD',
      purity: '22K',
      grossWeight: '4.50',
      netWeight: '4.25',
      description: '',
      brand: 'JMS Heritage',
      isActive: true,
      hsnCode: '7113',
      qrCode: `QR-${initialSku}`,
      barcode: `BC-${initialSku}`,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setSelectedImageFile(null);
    const existingImgUrl = prod.images?.[0]?.imageUrl ? getFullImageUrl(prod.images[0].imageUrl) : '';
    setImageUrlInput(existingImgUrl);
    setImageInputMode(existingImgUrl ? 'url' : 'file');
    setImageAltText('');
    setImagePreviewUrl(existingImgUrl || null);
    setShowAdvancedFields(!!prod.description || !!prod.hsnCode);

    setFormData({
      sku: prod.sku || '',
      name: prod.name || '',
      categoryId: prod.categoryId || '',
      subCategoryId: prod.subCategoryId || '',
      metalType: prod.metalType || 'GOLD',
      purity: prod.purity || '22K',
      grossWeight: prod.grossWeight ? String(prod.grossWeight) : '',
      netWeight: prod.netWeight ? String(prod.netWeight) : '',
      description: prod.description || '',
      brand: prod.brand || 'JMS Heritage',
      isActive: prod.isActive !== false,
      hsnCode: prod.hsnCode || '7113',
      qrCode: prod.qrCode || `QR-${prod.sku}`,
      barcode: prod.barcode || `BC-${prod.sku}`,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleQuickAddSub = async () => {
    if (!newSubName.trim() || !formData.categoryId) return;
    try {
      const code = `SUB-${newSubName.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const res = await productsApi.createSubCategory({
        categoryId: formData.categoryId,
        name: newSubName.trim(),
        code,
      });
      const created = res?.data || { id: `sub-${Date.now()}`, name: newSubName.trim(), code, categoryId: formData.categoryId };
      setSubCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, subCategoryId: created.id }));
      setNewSubName('');
      setQuickSubModalOpen(false);
    } catch (e) {
      // Add locally
      const created = { id: `sub-${Date.now()}`, name: newSubName.trim(), code: 'SUB-NEW', categoryId: formData.categoryId };
      setSubCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, subCategoryId: created.id }));
      setNewSubName('');
      setQuickSubModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deletingProduct.id);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Delete product failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    const rawTag = decodedText.trim();
    const cleanCode = rawTag.replace(/^(QR-|BC-)/i, '');
    const newQr = rawTag.toUpperCase().startsWith('QR-') ? rawTag : `QR-${rawTag}`;
    const newBc = `BC-${cleanCode}`;

    setFormData((prev) => ({
      ...prev,
      sku: cleanCode,
      qrCode: newQr,
      barcode: newBc,
    }));
    setIsScannerOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const payload: any = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        categoryId: formData.categoryId || undefined,
        subCategoryId: formData.subCategoryId || undefined,
        metalType: formData.metalType,
        purity: formData.purity,
        grossWeight: parseFloat(formData.grossWeight) || 0,
        netWeight: parseFloat(formData.netWeight) || 0,
        description: formData.description || undefined,
        isActive: formData.isActive,
        hsnCode: formData.hsnCode || undefined,
        qrCode: formData.qrCode || `QR-${formData.sku.trim()}`,
        barcode: formData.barcode || `BC-${formData.sku.trim()}`,
      };

      let savedProduct: any;
      if (editingProduct) {
        const res = await productsApi.update(editingProduct.id, payload);
        savedProduct = res?.data || editingProduct;
      } else {
        const res = await productsApi.create(payload);
        savedProduct = res?.data;
      }

      // Save image via File Upload OR pasted Image URL
      if (savedProduct?.id) {
        try {
          if (imageInputMode === 'file' && selectedImageFile) {
            await imagesApi.uploadProductImage(savedProduct.id, selectedImageFile, imageAltText || formData.name, true);
          } else if (imageInputMode === 'url' && imageUrlInput.trim()) {
            await imagesApi.uploadProductImage(savedProduct.id, imageUrlInput.trim(), imageAltText || formData.name, true);
          }
        } catch (imgErr: any) {
          console.warn('Image save failed:', imgErr);
        }
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === formData.categoryId);
  const currentSubCategory = subCategories.find((s) => s.id === formData.subCategoryId);
  const filteredSubCategories = subCategories.filter((s) => !formData.categoryId || s.categoryId === formData.categoryId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(198,161,91,0.15) 0%, rgba(198,161,91,0.05) 100%)', border: '1px solid rgba(198,161,91,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gem color="#C6A15B" size={20} />
            </div>
            <div>
              <h1 className="brand-font" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181B' }}>Product Catalog</h1>
              <p style={{ color: '#9CA3AF', fontSize: '0.81rem', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12}/> Category → Subcategory → Product Master</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '9px 18px' }}>
              <Plus size={16} /> Add Product Master
            </button>
          )}
          <button onClick={fetchProducts} className="btn btn-secondary" style={{ padding: '9px 14px' }}>
            <RefreshCw size={14} /><span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '10px 14px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Barcode size={16} color="#C6A15B" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, SKU, barcode or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.88rem', border: '1.5px solid var(--border-color)', background: 'var(--bg-muted)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', cursor: 'pointer', padding: '2px' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} color="#9CA3AF" />
          <select
            className="form-input"
            value={metalFilter}
            onChange={(e) => setMetalFilter(e.target.value)}
            style={{ width: '132px', height: '40px', fontSize: '0.84rem' }}
          >
            <option value="">All Metals</option>
            <option value="GOLD">Gold</option>
            <option value="SILVER">Silver</option>
            <option value="PLATINUM">Platinum</option>
            <option value="DIAMOND">Diamond</option>
          </select>
        </div>

        {categories.length > 0 && (
          <select
            className="form-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px', height: '40px', fontSize: '0.84rem' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '68px' }}>Photo</th>
              <th>SKU / Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Metal & Purity</th>
              <th>Weight</th>
              <th>Barcode / QR</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                  <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading product catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <Package size={32} color="#CBD5E1" style={{ margin: '0 auto 8px', display: 'block' }} />
                  No jewellery products found matching your search.
                  {canCreate && (
                    <div style={{ marginTop: '12px' }}>
                      <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                        <Plus size={14} /> Add First Product
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const primaryImage = p.images?.[0]?.imageUrl;
                const qrTagVal = p.qrCode || `QR-${p.sku}`;
                const barcodeVal = p.barcode || `BC-${p.sku}`;
                const metalBadge = p.metalType === 'GOLD' ? 'badge-gold' : p.metalType === 'SILVER' ? 'badge-platinum' : p.metalType === 'DIAMOND' ? 'badge-purple' : 'badge-blue';

                return (
                  <tr key={p.id}>
                    {/* Photo */}
                    <td style={{ paddingLeft: '16px', paddingRight: '8px' }}>
                      {primaryImage ? (
                        <div
                          onClick={() => setImageModalProduct(p)}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1.5px solid rgba(198,161,91,0.35)',
                            cursor: 'pointer',
                            background: '#F8F7F3',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                            transition: 'box-shadow 0.15s ease',
                          }}
                          title="Click to view design photos"
                        >
                          <img src={getFullImageUrl(primaryImage)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <button
                          onClick={() => setImageModalProduct(p)}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            border: '1.5px dashed #D1CBC0',
                            background: '#FAF9F6',
                            color: '#C6A15B',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'border-color 0.15s ease, background 0.15s ease',
                          }}
                          title="Upload product photo"
                        >
                          <Camera size={14} color="#C6A15B" />
                          <span style={{ color: '#B8A87A', fontSize: '0.56rem' }}>Add</span>
                        </button>
                      )}
                    </td>

                    {/* SKU */}
                    <td>
                      <span style={{ color: '#C6A15B', fontSize: '0.86rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{p.sku}</span>
                    </td>

                    {/* Name */}
                    <td>
                      <span style={{ fontWeight: 600, color: '#141518', fontSize: '0.88rem' }}>{p.name}</span>
                    </td>

                    {/* Category & Subcategory */}
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                        {p.subCategory?.name || p.category?.name || 'Jewellery'}
                      </span>
                    </td>

                    {/* Metal & Purity */}
                    <td>
                      <span className={`badge ${metalBadge}`} style={{ fontSize: '0.72rem' }}>
                        {p.metalType} · {p.purity}
                      </span>
                    </td>

                    {/* Weight */}
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#374151' }}>
                        {p.grossWeight || p.netWeight || '--'}g
                        {p.grossWeight && p.netWeight && Number(p.grossWeight) !== Number(p.netWeight) && (
                          <span style={{ color: '#9CA3AF', fontSize: '0.72rem', marginLeft: '4px', fontWeight: 400 }}>(Net: {p.netWeight}g)</span>
                        )}
                      </span>
                    </td>

                    {/* QR */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280', fontFamily: 'monospace', background: '#F3F2EE', padding: '2px 7px', borderRadius: '5px', border: '1px solid #E8E5E0' }}>
                          {qrTagVal.length > 18 ? qrTagVal.substring(0, 18) + '…' : qrTagVal}
                        </span>
                        <button
                          onClick={() => downloadQrImage(qrTagVal, p.sku)}
                          style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(198,161,91,0.3)', background: 'rgba(198,161,91,0.06)', color: '#C6A15B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Download QR"
                        >
                          <Download size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', paddingRight: '18px' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/inventory-items?productId=${p.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#047857', borderColor: 'rgba(5,150,105,0.28)', background: '#F0FDF9' }}
                          title="View Inventory Stock"
                        >
                          <Shield size={13} /> Stock ({p.inventoryItemsCount || 0})
                        </button>
                        {canUpdate && (
                          <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} title="Edit">
                            <Tag size={13} /> Edit Master
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeletingProduct(p)} className="btn btn-secondary" style={{ padding: '5px 9px', borderColor: 'rgba(220,38,38,0.3)', color: '#B91C1C', background: '#FFF5F5' }} title="Delete">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        title="Delete Product Master SKU"
        message={`Are you sure you want to delete product "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})?`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />

      {/* Product Image Gallery Modal */}
      {imageModalProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '24px',
              background: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#18181B' }}>
                Design Photos: {imageModalProduct.name} ({imageModalProduct.sku})
              </h3>
              <button
                onClick={() => {
                  setImageModalProduct(null);
                  fetchProducts();
                }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <ProductImageGallery
              productId={imageModalProduct.id}
              productName={imageModalProduct.name}
            />
          </div>
        </div>
      )}

      {/* QR Camera Scanner Modal */}
      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Quick Add Subcategory Popup Modal */}
      {quickSubModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '20px', background: '#FFFFFF', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181B', marginBottom: '8px' }}>
              Add Subcategory to {currentCategory?.name || 'Category'}
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '12px' }}>
              e.g. Ring, Chain, Necklace, Earrings, Bracelet, Bangle, Pendant, Anklet
            </p>
            <input
              type="text"
              placeholder="Subcategory name..."
              className="form-input"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              style={{ marginBottom: '14px' }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setQuickSubModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleQuickAddSub} className="btn btn-primary">
                Add Subcategory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal matching Category → Subcategory → Product Hierarchy */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '740px',
              padding: '24px',
              background: '#FFFFFF',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal Header with AI Autofill Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(198, 161, 91, 0.15)', color: '#C6A15B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gem size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181B', lineHeight: 1.2 }}>
                    {editingProduct ? 'Edit Product Master' : 'Add New Product Master'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Define design master (Category → Subcategory → Product Master)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Visual Master Hierarchy Breadcrumb Banner */}
            <div style={{ background: '#FFFDF0', border: '1px solid #FDE68A', padding: '8px 14px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: '#92400E', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>Hierarchy:</span>
              <span className="badge badge-gold" style={{ fontSize: '0.74rem' }}>
                {currentCategory?.name || 'Category'}
              </span>
              <ArrowRight size={12} color="#D97706" />
              <span className="badge badge-blue" style={{ fontSize: '0.74rem' }}>
                {currentSubCategory?.name || 'Subcategory'}
              </span>
              <ArrowRight size={12} color="#D97706" />
              <strong style={{ color: '#18181B' }}>
                {formData.name || 'Product Master (e.g. Ladies Gold Ring)'}
              </strong>
            </div>

            {formErrors.general && (
              <div
                style={{
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: '#DC2626',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} /> {formErrors.general}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* ── Section 1: Basic Info ── */}
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.69rem', fontWeight: 800, color: '#C6A15B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ImageIcon size={13} /> Product Photo, Category & Description
                </div>

                {/* — Image Upload (full-width, prominent) — */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Camera size={13} color="#C6A15B" /> Product Image
                      <span style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 400 }}>Optional</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setImageInputMode(imageInputMode === 'file' ? 'url' : 'file')}
                      style={{ fontSize: '0.72rem', color: '#C6A15B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                    >
                      {imageInputMode === 'file' ? 'Or paste URL instead' : 'Or upload file instead'}
                    </button>
                  </div>

                  {imagePreviewUrl ? (
                    <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '6px' }}>
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: '2px solid rgba(198,161,91,0.4)', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}
                      />
                      <button
                        type="button"
                        onClick={() => { setSelectedImageFile(null); setImagePreviewUrl(null); setImageUrlInput(''); }}
                        style={{ position: 'absolute', top: '-7px', right: '-7px', width: '20px', height: '20px', background: '#DC2626', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : null}

                  {imageInputMode === 'file' ? (
                    <div
                      style={{ border: '2px dashed #D1CBC0', borderRadius: '10px', padding: imagePreviewUrl ? '10px' : '22px 16px', textAlign: 'center', background: '#FFFDF9', cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s ease' }}
                    >
                      {!imagePreviewUrl && (
                        <>
                          <Upload size={22} color="#C6A15B" style={{ margin: '0 auto 6px', display: 'block' }} />
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4B5563' }}>Click to upload photo or drag &amp; drop</div>
                          <div style={{ fontSize: '0.71rem', color: '#9CA3AF', marginTop: '3px' }}>JPG, PNG, WEBP — max 5MB</div>
                        </>
                      )}
                      {imagePreviewUrl && <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>Click to change image</span>}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                    </div>
                  ) : (
                    <input
                      type="url"
                      placeholder="https://example.com/product.jpg"
                      value={imageUrlInput}
                      onChange={(e) => { setImageUrlInput(e.target.value); setImagePreviewUrl(e.target.value || null); }}
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    />
                  )}
                </div>

                {/* — Category & Subcategory (side by side) — */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="form-input"
                      value={formData.categoryId}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        const newCat = categories.find((c) => c.id === newCatId);
                        const matchingSubs = subCategories.filter((s) => s.categoryId === newCatId);
                        const firstSubId = matchingSubs[0]?.id || '';
                        const metal = newCat?.metalType || (newCat?.name.toUpperCase().includes('SILVER') ? 'SILVER' : 'GOLD');
                        setFormData({ ...formData, categoryId: newCatId, subCategoryId: firstSubId, metalType: metal });
                        if (!editingProduct) generateSmartSku(newCatId, firstSubId, metal);
                      }}
                      style={{ fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <p style={{ fontSize: '0.69rem', color: '#9CA3AF', marginTop: '3px' }}>e.g. Gold Jewellery, Silver, Diamond</p>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Subcategory *</span>
                      <button type="button" onClick={() => setQuickSubModalOpen(true)} style={{ border: 'none', background: 'none', color: '#C6A15B', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        + Add New
                      </button>
                    </label>
                    <select
                      className="form-input"
                      value={formData.subCategoryId}
                      onChange={(e) => { const newSub = e.target.value; setFormData({ ...formData, subCategoryId: newSub }); if (!editingProduct) generateSmartSku(undefined, newSub); }}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {filteredSubCategories.length === 0 && <option value="">No subcategories — add one above</option>}
                      {filteredSubCategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <p style={{ fontSize: '0.69rem', color: '#9CA3AF', marginTop: '3px' }}>e.g. Ring, Chain, Necklace, Bangle</p>
                  </div>
                </div>

                {/* — Product Master Name — */}
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Product Master Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ladies Gold Ring, Men's Platinum Band, Diamond Necklace Set"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ fontSize: '0.9rem', fontWeight: 600 }}
                  />
                  {formErrors.name && <span style={{ fontSize: '0.72rem', color: '#DC2626' }}>{formErrors.name}</span>}
                  <p style={{ fontSize: '0.69rem', color: '#9CA3AF', marginTop: '3px' }}>This is the design master name — not an individual piece. All stock items of this type will link here.</p>
                </div>

                {/* — Description — */}
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the design, finish, occasion, or any special features. Shown on product tag & customer invoice."
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ fontSize: '0.84rem', resize: 'vertical' }}
                  />
                </div>

                {/* — Brand / Collection + Active toggle — */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label className="form-label">Brand / Collection</label>
                    <input
                      type="text"
                      placeholder="e.g. JMS Heritage, Classic Line"
                      className="form-input"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      style={{ fontSize: '0.84rem' }}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.84rem', fontWeight: 600, color: '#374151', cursor: 'pointer', paddingBottom: '8px', whiteSpace: 'nowrap' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#C6A15B' }}
                    />
                    Active
                  </label>
                </div>
              </div>

              {/* ── Section 2: Metal & Weight ── */}
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.69rem', fontWeight: 800, color: '#C6A15B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                  2 · Standard Metal & Weight Specifications
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Metal Type</label>
                    <select
                      className="form-input"
                      value={formData.metalType}
                      onChange={(e) => {
                        const newMetal = e.target.value;
                        const defaultPurity = newMetal === 'GOLD' ? '22K' : newMetal === 'SILVER' ? '925' : '950';
                        setFormData({ ...formData, metalType: newMetal, purity: defaultPurity });
                        if (!editingProduct) generateSmartSku(undefined, undefined, newMetal);
                      }}
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    >
                      <option value="GOLD">Gold</option>
                      <option value="SILVER">Silver</option>
                      <option value="PLATINUM">Platinum</option>
                      <option value="DIAMOND">Diamond</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Standard Purity *</label>
                    <input
                      type="text"
                      required
                      placeholder="22K, 24K, 18K"
                      className="form-input"
                      value={formData.purity}
                      onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Std Gross Wt (g) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="4.50"
                      className="form-input"
                      value={formData.grossWeight}
                      onChange={(e) => {
                        const gw = e.target.value;
                        setFormData({
                          ...formData,
                          grossWeight: gw,
                          netWeight: formData.netWeight || gw,
                        });
                      }}
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Std Net Wt (g) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="4.25"
                      className="form-input"
                      value={formData.netWeight}
                      onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 3: Smart SKU ── */}
              <div style={{ background: 'linear-gradient(135deg, #FFFEF6 0%, #FFF9E6 100%)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(198,161,91,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.69rem', fontWeight: 800, color: '#92700A', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    3 · Auto-Assigned Master SKU & Barcode
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Master SKU Code *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.sku}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          sku: val,
                          barcode: `BC-${val}`,
                          qrCode: `QR-${val}`,
                        });
                      }}
                      style={{ height: '36px', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Scannable Barcode</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        style={{ height: '36px', fontFamily: 'monospace', fontSize: '0.82rem', flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="btn btn-secondary"
                        style={{ padding: '0 10px', height: '36px' }}
                        title="Scan Barcode via Camera"
                      >
                        <Camera size={14} color="#C6A15B" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Collapsible Advanced Details */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: '#64748B',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 0',
                  }}
                >
                  {showAdvancedFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showAdvancedFields ? 'Hide' : 'Show'} Advanced Details (HSN Code)</span>
                </button>

                {showAdvancedFields && (
                  <div style={{ marginTop: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.76rem' }}>HSN Tax Code</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="7113"
                        value={formData.hsnCode}
                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                  style={{ padding: '8px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ padding: '8px 22px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle size={16} />
                  <span>{isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product Master'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
