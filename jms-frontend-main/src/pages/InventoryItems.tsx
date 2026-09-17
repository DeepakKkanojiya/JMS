import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { inventoryApi, InventoryItem } from '../api/inventory';
import { productsApi } from '../api/products';
import { branchesApi } from '../api/branches';
import { imagesApi } from '../api/images';
import { useAuth } from '../context/AuthContext';
import { parseValidationErrors, getActiveBaseUrl } from '../api/client';
import { QRScannerModal } from '../components/qr/QRScannerModal';
import {
  Layers,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  CheckCircle,
  Tag,
  Image as ImageIcon,
  Camera,
  QrCode,
  Download,
  Barcode,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  TrendingUp,
  Shield,
  Package,
  EyeOff,
  Lock,
  Banknote,
  Truck,
  Wrench,
  Store,
  Sparkles,
  Award,
  Gem,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useEscapeKey } from '../hooks/useEscapeKey';

const PRESET_BRANDS = [
  'JMS Heritage',
  'Tanishq',
  'Kalyan Jewellers',
  'Malabar Gold & Diamonds',
  'In-House Artisan',
  'CaratLane',
  'Custom Order',
];

const PRESET_CATEGORIES = [
  'Gold Jewellery',
  'Silver Jewellery',
  'Diamond Jewellery',
  'Platinum Jewellery',
  'Gemstone Jewellery',
];

const PRESET_SUBCATEGORIES: Record<string, string[]> = {
  'Gold Jewellery': ['Ring', 'Chain', 'Necklace', 'Bracelet', 'Bangle', 'Pendant', 'Earrings', 'Nosepin', 'Mangalsutra', 'Kada', 'Men Jewellery', 'Women Jewellery'],
  'Silver Jewellery': ['Anklet / Payal', 'Coin / Bar', 'Silver Ring', 'Utensils & Puja', 'Men Kada', 'Silver Chain', 'Silver Bracelet'],
  'Diamond Jewellery': ['Solitaire Ring', 'Diamond Earrings', 'Diamond Pendant', 'Tennis Bracelet', 'Nosepin', 'Eternity Band'],
  'Platinum Jewellery': ['Couple Bands', 'Platinum Chain', 'Platinum Ring', 'Platinum Bracelet'],
  'Gemstone Jewellery': ['Navratna Ring', 'Emerald Necklace', 'Ruby Pendant', 'Sapphire Studs'],
};

const PRESET_PURITIES = [
  { label: '24K — 99.9% Pure Gold', value: '24K' },
  { label: '22K — 91.6% Hallmark Standard Gold', value: '22K' },
  { label: '18K — 75.0% Diamond Studded Gold', value: '18K' },
  { label: '14K — 58.5% Contemporary Gold', value: '14K' },
  { label: '999 — Fine Silver (99.9%)', value: '999' },
  { label: '925 — Sterling Silver (92.5%)', value: '925' },
  { label: '950 — Pure Platinum (95.0%)', value: '950' },
];

export const InventoryItems: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedProductId = searchParams.get('productId');

  const canCreate = hasPermission('inventory_item.create');
  const canUpdate = hasPermission('inventory_item.update');
  const canDelete = hasPermission('inventory_item.delete');

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEscapeKey(isModalOpen, () => setIsModalOpen(false));
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Dual Image Input State (File Upload OR Image URL)
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // 4-Tier Form State: Brand -> Category -> Subcategory -> Product Details
  const [formData, setFormData] = useState({
    brand: 'JMS Heritage',
    category: 'Gold Jewellery',
    subCategory: 'Ring',
    productName: '',
    productId: '',
    branchId: '',
    itemCode: '',
    quantity: '1',
    purity: '22K',
    huidCode: '',
    // Precision weights
    grossWeight: '8.500',
    stoneWeight: '0.000',
    diamondCarats: '0.00',
    diamondClarity: 'VS-GH',
    netWeight: '8.500',
    // Pricing
    metalRatePerGram: '7000',
    makingCharges: '450',
    costPrice: '',
    marketPrice: '',
    status: 'AVAILABLE',
    description: '',
    // Unique identifier
    qrCode: '',
    barcode: '',
    rfidEpc: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchDropdowns();
  }, [search, statusFilter, branchFilter, categoryFilter, page]);

  useEffect(() => {
    if (preSelectedProductId && products.length > 0) {
      const match = products.find((p) => p.id === preSelectedProductId);
      if (match) {
        setSearch(match.sku || match.name);
      }
    }
  }, [preSelectedProductId, products]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        branchId: branchFilter || undefined,
        page,
        limit: 25,
      });

      if (res?.success || Array.isArray(res?.data)) {
        setItems(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const prodRes = await productsApi.list({ limit: 100 });
      setProducts(prodRes?.data || []);
      const branchRes = await branchesApi.list({ limit: 100 });
      setBranches(branchRes?.data || []);
    } catch (e) {
      // Fallback
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

  const downloadBarcodeImage = (barcodeValue: string, labelName: string) => {
    if (!barcodeValue) return;
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeValue)}&scale=3&rotate=N&includetext`;
    const link = document.createElement('a');
    link.href = barcodeUrl;
    link.download = `BARCODE-${labelName || barcodeValue}.png`;
    link.target = '_blank';
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

  const handleScanSuccess = (decodedText: string) => {
    const cleanCode = decodedText.trim().replace(/^(QR-|BC-)/i, '');
    setFormData((prev) => ({
      ...prev,
      itemCode: cleanCode,
      qrCode: cleanCode,
      barcode: cleanCode,
    }));
    setIsScannerOpen(false);
  };

  // Helper to generate a clean, unified Item Code (used as the single unique QR code)
  const generateUnifiedItemCode = (category: string, subCategory: string) => {
    const catCode = (category.split(' ')[0] || 'GLD').substring(0, 3).toUpperCase();
    const subCode = (subCategory || 'RNG').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `JMS-${catCode}-${subCode}-${randomNum}`;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSelectedImageFile(null);
    setImageUrlInput('');
    setImageInputMode('file');
    setImagePreviewUrl(null);

    const defaultCat = 'Gold Jewellery';
    const defaultSub = 'Ring';
    const defaultBranch = branches[0]?.id || '';
    const autoCode = generateUnifiedItemCode(defaultCat, defaultSub);
    const defaultProd = products[0]?.id || '';

    setFormData({
      brand: 'JMS Heritage',
      category: defaultCat,
      subCategory: defaultSub,
      productName: '',
      productId: defaultProd,
      branchId: defaultBranch,
      itemCode: autoCode,
      quantity: '1',
      purity: '22K',
      huidCode: '',
      grossWeight: '8.500',
      stoneWeight: '0.000',
      diamondCarats: '0.00',
      diamondClarity: 'VS-GH',
      netWeight: '8.500',
      metalRatePerGram: '7000',
      makingCharges: '450',
      costPrice: '59500',
      marketPrice: '68425',
      status: 'AVAILABLE',
      description: '',
      qrCode: autoCode,
      barcode: autoCode,
      rfidEpc: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setSelectedImageFile(null);
    const existingImgUrl = item.images?.[0]?.imageUrl ? getFullImageUrl(item.images[0].imageUrl) : '';
    setImageUrlInput(existingImgUrl);
    setImageInputMode(existingImgUrl ? 'url' : 'file');
    setImagePreviewUrl(existingImgUrl || null);

    const singleId = item.itemCode || item.inventoryTag?.qrCode || `JMS-${item.id.substring(0, 8)}`;

    setFormData({
      brand: (item as any).brand || 'JMS Heritage',
      category: item.product?.category?.name || 'Gold Jewellery',
      subCategory: item.product?.subCategory?.name || 'Ring',
      productName: item.product?.name || '',
      productId: item.productId || '',
      branchId: item.branchId || '',
      itemCode: singleId,
      quantity: '1',
      purity: item.purity || '22K',
      huidCode: (item as any).huidCode || '',
      grossWeight: String(item.grossWeight || '0.000'),
      stoneWeight: String(item.stoneWeight || '0.000'),
      diamondCarats: String((item as any).diamondCarats || '0.00'),
      diamondClarity: (item as any).diamondClarity || 'VS-GH',
      netWeight: String(item.netWeight || '0.000'),
      metalRatePerGram: String((item as any).metalRatePerGram || '7000'),
      makingCharges: String((item as any).makingCharges || '450'),
      costPrice: String((item as any).costPrice || ''),
      marketPrice: String((item as any).marketPrice || ''),
      status: item.status || 'AVAILABLE',
      description: (item as any).description || item.product?.description || '',
      qrCode: singleId,
      barcode: singleId,
      rfidEpc: item.inventoryTag?.rfidEpc || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await inventoryApi.delete(deletingItem.id);
      setDeletingItem(null);
      fetchInventory();
    } catch (err: any) {
      console.error('Delete inventory item failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Re-calculate weights and prices dynamically
  const handleWeightOrRateChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    const gw = parseFloat(field === 'grossWeight' ? value : updated.grossWeight) || 0;
    const sw = parseFloat(field === 'stoneWeight' ? value : updated.stoneWeight) || 0;
    const diaCts = parseFloat(field === 'diamondCarats' ? value : updated.diamondCarats) || 0;
    const diaGrams = diaCts * 0.2; // 1 Carat = 0.20 grams

    const netW = Math.max(0, gw - sw - diaGrams);
    updated.netWeight = netW.toFixed(3);

    // Dynamic price calculation
    const rate = parseFloat(updated.metalRatePerGram) || 7000;
    const mc = parseFloat(updated.makingCharges) || 0;
    const metalVal = netW * rate;
    const makingVal = gw * mc;
    const estCost = Math.round(metalVal + makingVal);
    const estMarket = Math.round(estCost * 1.15); // standard 15% margin benchmark

    if (!updated.costPrice || field === 'grossWeight' || field === 'metalRatePerGram' || field === 'makingCharges') {
      updated.costPrice = String(estCost);
      updated.marketPrice = String(estMarket);
    }

    setFormData(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const cleanUniqueId = formData.itemCode.trim();

      // If productId is not selected or matches empty, find/create appropriate product
      let targetProductId = formData.productId;
      if (!targetProductId && products.length > 0) {
        targetProductId = products[0].id;
      }

      const buildPayload = (code: string) => ({
        productId: targetProductId,
        branchId: formData.branchId,
        itemCode: code,
        grossWeight: parseFloat(formData.grossWeight) || 0,
        netWeight: parseFloat(formData.netWeight) || 0,
        stoneWeight: parseFloat(formData.stoneWeight) || 0,
        purity: formData.purity,
        status: formData.status,
        barcode: code,
        qrCode: code,
        rfidEpc: formData.rfidEpc ? formData.rfidEpc : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        marketPrice: formData.marketPrice ? parseFloat(formData.marketPrice) : null,
        makingCharges: formData.makingCharges ? parseFloat(formData.makingCharges) : null,
        brand: formData.brand,
        productName: formData.productName || undefined,
        huidCode: formData.huidCode || undefined,
        diamondCarats: formData.diamondCarats ? parseFloat(formData.diamondCarats) : null,
        diamondClarity: formData.diamondClarity || undefined,
        description: formData.description || undefined,
      });

      if (editingItem) {
        const payload = buildPayload(cleanUniqueId);
        const res = await inventoryApi.update(editingItem.id, payload);
        const savedItem = res?.data || editingItem;

        if (savedItem?.id && (selectedImageFile || imageUrlInput.trim())) {
          try {
            if (imageInputMode === 'file' && selectedImageFile) {
              await imagesApi.uploadInventoryItemImage(savedItem.id, selectedImageFile, cleanUniqueId, true);
            } else if (imageInputMode === 'url' && imageUrlInput.trim()) {
              await imagesApi.uploadInventoryItemImage(savedItem.id, imageUrlInput.trim(), cleanUniqueId, true);
            }
          } catch (imgErr) {
            console.warn('Image upload failed:', imgErr);
          }
        }
      } else {
        // Multi-quantity support: create specified number of pieces with unique codes
        const qtyCount = Math.max(1, Math.min(50, parseInt(formData.quantity) || 1));
        for (let i = 0; i < qtyCount; i++) {
          const itemTag = i === 0 ? cleanUniqueId : generateUnifiedItemCode(formData.category, formData.subCategory);
          const payload = buildPayload(itemTag);
          const res = await inventoryApi.create(payload);
          const savedItem = res?.data;

          if (savedItem?.id && (selectedImageFile || imageUrlInput.trim())) {
            try {
              if (imageInputMode === 'file' && selectedImageFile) {
                await imagesApi.uploadInventoryItemImage(savedItem.id, selectedImageFile, itemTag, true);
              } else if (imageInputMode === 'url' && imageUrlInput.trim()) {
                await imagesApi.uploadInventoryItemImage(savedItem.id, imageUrlInput.trim(), itemTag, true);
              }
            } catch (imgErr) {
              console.warn('Image upload failed:', imgErr);
            }
          }
        }
      }

      setIsModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      const errors = parseValidationErrors(err);
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(198,161,91,0.2) 0%, rgba(198,161,91,0.06) 100%)', border: '1px solid rgba(198,161,91,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers color="#C6A15B" size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#141518', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Inventory Stock & Products
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.81rem', marginTop: '1px' }}>
              Hierarchy: <strong>Brand → Category → Subcategory → Product Piece</strong> · Single Unique QR Tag per piece
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canCreate && (
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add Inventory Product
            </button>
          )}
          <button onClick={fetchInventory} className="btn btn-secondary" style={{ padding: '9px 14px' }}>
            <RefreshCw size={14} /><span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar (Brand, Category, Branch, Status) */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '10px 14px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '230px' }}>
          <Barcode size={16} color="#C6A15B" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by unique tag ID, product name, brand, karats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.88rem', background: 'var(--bg-muted)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', cursor: 'pointer', padding: '2px' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <select className="form-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '155px', height: '40px', fontSize: '0.84rem' }}>
          <option value="">All Categories</option>
          {PRESET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} color="#9CA3AF" />
          <select className="form-input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ width: '155px', height: '40px', fontSize: '0.84rem' }}>
            <option value="">All Showrooms</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '138px', height: '40px', fontSize: '0.84rem' }}>
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
          <option value="TRANSFER_PENDING">In Transit</option>
        </select>
      </div>

      {/* Unified Inventory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '62px', paddingLeft: '16px' }}>Photo</th>
              <th>Unique Tag / QR</th>
              <th>Product Details</th>
              <th>Category & Brand</th>
              <th>Purity & Weights</th>
              <th>Jeweller Cost</th>
              <th>Market Live Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '18px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#9CA3AF' }}>
                  <RefreshCw className="animate-spin" size={18} style={{ display: 'inline', marginRight: '8px' }} />
                  Loading inventory stock & products...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '44px', color: '#9CA3AF' }}>
                  <Layers size={32} color="#D1C9BC" style={{ margin: '0 auto 10px', display: 'block' }} />
                  <div style={{ fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>No inventory items found</div>
                  <div style={{ fontSize: '0.8rem' }}>Adjust your search filter or add your first inventory piece.</div>
                  {canCreate && (
                    <div style={{ marginTop: '14px' }}>
                      <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                        <Plus size={14} /> Add Inventory Product
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const getResolvedItemPhoto = (itm: any) => {
                  const uploaded = itm.images?.[0]?.imageUrl || itm.product?.images?.[0]?.imageUrl;
                  if (uploaded) return getFullImageUrl(uploaded);

                  const name = ((itm as any).productName || itm.product?.name || '').toLowerCase();
                  const pur = (itm.purity || '').toLowerCase();
                  const met = (itm.metalType || itm.product?.metalType || '').toLowerCase();
                  const cat = (itm.product?.category?.name || '').toLowerCase();

                  if (name.includes('platinum') || pur.includes('950') || met.includes('platinum')) {
                    return 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=400&q=80';
                  }
                  if (name.includes('silver') || pur.includes('999') || pur.includes('925') || met.includes('silver')) {
                    return 'https://images.unsplash.com/photo-1611591475152-473523dd665e?auto=format&fit=crop&w=400&q=80';
                  }
                  if (name.includes('diamond') || name.includes('solitaire') || pur.includes('18k') || cat.includes('diamond')) {
                    return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80';
                  }
                  return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';
                };

                const itemImg = getResolvedItemPhoto(item);
                const uniqueId = item.itemCode || item.inventoryTag?.qrCode || `JMS-${item.id.substring(0, 8)}`;
                
                const purity = item.purity || '22K';
                let baseRate = 7000;
                if (purity.includes('999') || item.product?.name?.toLowerCase().includes('silver')) baseRate = 85;
                else if (purity.includes('950') || item.product?.name?.toLowerCase().includes('platinum')) baseRate = 3800;
                
                const fallbackCost = Number(item.grossWeight || 0) * baseRate;
                const costP = (item as any).costPrice || fallbackCost;
                const mktP = (item as any).marketPrice || (fallbackCost * 1.15);
                
                const statusCls = item.status === 'AVAILABLE' ? 'badge-emerald' : item.status === 'SOLD' ? 'badge-gray' : item.status === 'RESERVED' ? 'badge-amber' : 'badge-blue';
                const statusLabel: Record<string, string> = { AVAILABLE: 'Available', SOLD: 'Sold', RESERVED: 'Reserved', TRANSFER_PENDING: 'In Transit', IN_TRANSIT: 'In Transit', UNDER_REPAIR: 'Repair' };

                return (
                  <tr key={item.id}>
                    {/* Photo */}
                    <td style={{ paddingLeft: '16px', paddingRight: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(198,161,91,0.35)', background: '#F8F7F3', boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}>
                        <img
                          src={itemImg}
                          alt={item.itemCode}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                    </td>

                    {/* Single Unique Tag / QR ID */}
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#C6A15B', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                        {uniqueId}
                      </span>
                    </td>

                    {/* Product Name */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#141518', fontSize: '0.88rem' }}>
                          {(item as any).productName || item.product?.name || 'Jewellery Ornament'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                          {item.branch?.name || 'Connaught Place Showroom'}
                        </span>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.68rem', alignSelf: 'flex-start' }}>
                          {item.product?.category?.name || 'Gold Jewellery'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 500 }}>
                          {(item as any).brand || 'JMS Heritage'}
                        </span>
                      </div>
                    </td>

                    {/* Purity & Weights Breakdown */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.68rem', alignSelf: 'flex-start' }}>{item.purity}</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                          {item.grossWeight}g
                          {Number(item.stoneWeight || 0) > 0 && (
                            <span style={{ color: '#9CA3AF', fontSize: '0.72rem', marginLeft: '4px', fontWeight: 400 }}>(Net: {item.netWeight}g)</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Jeweller Cost Price */}
                    <td>
                      {costP ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Jeweller Cost</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857' }}>
                            ₹{Number(costP).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      ) : <span style={{ color: '#D1CBC0', fontSize: '0.78rem' }}>Not Set</span>}
                    </td>

                    {/* Market Live Price */}
                    <td>
                      {mktP ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Market Live</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#C6A15B' }}>
                            ₹{Number(mktP).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      ) : <span style={{ color: '#D1CBC0', fontSize: '0.78rem' }}>Not Set</span>}
                    </td>

                    {/* Qty */}
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: item.status === 'AVAILABLE' ? '#047857' : '#9CA3AF', background: item.status === 'AVAILABLE' ? 'rgba(5,150,105,0.08)' : '#F3F4F6', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${item.status === 'AVAILABLE' ? 'rgba(5,150,105,0.2)' : '#E5E7EB'}` }}>
                        {item.status === 'AVAILABLE' ? '1 pc' : '0 pc'}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${statusCls}`} style={{ fontSize: '0.72rem' }}>
                        {statusLabel[item.status] || item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => downloadBarcodeImage(uniqueId, uniqueId)}
                          style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid rgba(198,161,91,0.3)', background: 'rgba(198,161,91,0.06)', color: '#C6A15B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Download Barcode Label"
                        >
                          <Barcode size={13} />
                        </button>
                        <button
                          onClick={() => navigate(`/inventory-items/${item.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                          title="View Full Item Details"
                        >
                          <Eye size={13} />
                        </button>
                        {canUpdate && (
                          <button onClick={() => handleOpenEdit(item)} className="btn btn-secondary" style={{ padding: '5px 9px', fontSize: '0.75rem' }} title="Edit">
                            <Edit2 size={13} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeletingItem(item)} className="btn btn-secondary" style={{ padding: '5px 8px', borderColor: 'rgba(220,38,38,0.3)', color: '#B91C1C', background: '#FFF5F5' }} title="Delete">
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
        isOpen={!!deletingItem}
        title="Delete Stock Item"
        message={`Are you sure you want to remove item "${deletingItem?.itemCode}" from inventory? This action cannot be undone.`}
        confirmText="Delete Stock Item"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />

      {/* QR Camera Scanner Modal */}
      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Comprehensive Add / Edit Inventory Product Modal (Brand -> Category -> Subcategory -> Product) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div
            style={{
              width: '100%',
              maxWidth: '740px',
              background: '#FFFFFF',
              maxHeight: '94vh',
              overflowY: 'auto',
              borderRadius: '16px',
              boxShadow: '0 32px 64px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'linear-gradient(to bottom, #FFFEF9 0%, #FFFFFF 100%)', borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(198,161,91,0.2) 0%, rgba(198,161,91,0.06) 100%)', border: '1px solid rgba(198,161,91,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Gem size={20} color="#C6A15B" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#141518', lineHeight: 1.2 }}>
                    {editingItem ? 'Edit Product Item' : 'Add New Product Item'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '2px' }}>
                    Enter product details, purity, weights, rates, and photograph
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#9CA3AF', padding: '6px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {formErrors.general && (
                <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#B91C1C', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} /> {formErrors.general}
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Brand, Category, Subcategory & Product */}
                <div style={{ background: 'var(--bg-muted)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    {/* Brand */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Brand / Collection</label>
                      <select
                        className="form-input"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        style={{ fontWeight: 600 }}
                      >
                        {PRESET_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    {/* Category */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={formData.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const subs = PRESET_SUBCATEGORIES[newCat] || ['General'];
                          const newSub = subs[0];
                          const newCode = generateUnifiedItemCode(newCat, newSub);
                          setFormData({
                            ...formData,
                            category: newCat,
                            subCategory: newSub,
                            itemCode: newCode,
                            qrCode: newCode,
                            barcode: newCode,
                          });
                        }}
                        style={{ fontWeight: 600 }}
                      >
                        {PRESET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Subcategory</label>
                      <select
                        className="form-input"
                        value={formData.subCategory}
                        onChange={(e) => {
                          const newSub = e.target.value;
                          const newCode = generateUnifiedItemCode(formData.category, newSub);
                          setFormData({
                            ...formData,
                            subCategory: newSub,
                            itemCode: newCode,
                            qrCode: newCode,
                            barcode: newCode,
                          });
                        }}
                        style={{ fontWeight: 600 }}
                      >
                        {(PRESET_SUBCATEGORIES[formData.category] || ['General']).map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific Product Name & Branch */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Antique Gold Necklace Set, Diamond Solitaire Ring"
                        className="form-input"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        style={{ fontWeight: 600 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Showroom Branch</label>
                      <select
                        className="form-input"
                        required
                        value={formData.branchId}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      >
                        <option value="" disabled>Select Branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Metal, Karat & Weights Breakdown */}
                <div style={{ background: 'var(--bg-muted)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Karat / Purity</label>
                      <select
                        className="form-input"
                        value={formData.purity}
                        onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                        style={{ fontWeight: 600 }}
                      >
                        {PRESET_PURITIES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Hallmark HUID / Cert No</label>
                      <input
                        type="text"
                        placeholder="e.g. HUID-829182 / IGI-9218"
                        className="form-input"
                        value={formData.huidCode}
                        onChange={(e) => setFormData({ ...formData, huidCode: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Weights Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gross Wt (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        className="form-input"
                        value={formData.grossWeight}
                        onChange={(e) => handleWeightOrRateChange('grossWeight', e.target.value)}
                        style={{ fontWeight: 700 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Stone Wt (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        className="form-input"
                        value={formData.stoneWeight}
                        onChange={(e) => handleWeightOrRateChange('stoneWeight', e.target.value)}
                        placeholder="0.000"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Diamond (Cts)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={formData.diamondCarats}
                        onChange={(e) => handleWeightOrRateChange('diamondCarats', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Net Metal Wt (g)</label>
                      <input
                        type="number"
                        step="0.001"
                        readOnly
                        className="form-input"
                        value={formData.netWeight}
                        style={{ background: '#FFFDF0', borderColor: 'rgba(198,161,91,0.5)', fontWeight: 700, color: '#7A5C0A' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Rates, Making Charges & Prices */}
                <div style={{ background: 'linear-gradient(135deg, #FFFEF6 0%, #FFF9E6 100%)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(198,161,91,0.32)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Metal Rate per gram (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.metalRatePerGram}
                        onChange={(e) => handleWeightOrRateChange('metalRatePerGram', e.target.value)}
                        placeholder="7000"
                        style={{ fontWeight: 600 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Making Charges per gram (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.makingCharges}
                        onChange={(e) => handleWeightOrRateChange('makingCharges', e.target.value)}
                        placeholder="450"
                        style={{ fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  {/* Jeweller Cost vs Retail Market Price */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#F0FDF6', border: '1px solid rgba(5,150,105,0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Store size={13}/> Jeweller Cost Price
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', fontWeight: 700, color: '#047857' }}>₹</span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                          style={{ paddingLeft: '26px', fontSize: '1.1rem', fontWeight: 700, color: '#047857', border: '1.5px solid rgba(5,150,105,0.3)', background: '#F0FDF9', borderRadius: '8px' }}
                        />
                      </div>
                    </div>

                    <div style={{ background: 'rgba(198,161,91,0.08)', border: '1px solid rgba(198,161,91,0.35)', borderRadius: '10px', padding: '12px 14px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92700A', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Tag size={13}/> Tagged Market / MRP Price
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', fontWeight: 700, color: '#C6A15B' }}>₹</span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={formData.marketPrice}
                          onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                          style={{ paddingLeft: '26px', fontSize: '1.1rem', fontWeight: 700, color: '#92700A', border: '1.5px solid rgba(198,161,91,0.4)', background: '#FFFDF5', borderRadius: '8px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unique Code, Quantity & Status */}
                <div style={{ background: '#FFFDF6', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(198,161,91,0.35)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Unique QR / Tag Code</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.itemCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, itemCode: val, qrCode: val, barcode: val });
                        }}
                        style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: '#C6A15B' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Quantity (Pieces)</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        required
                        className="form-input"
                        value={formData.quantity || '1'}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        disabled={!!editingItem}
                        style={{ fontWeight: 700 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Stock Status</label>
                      <select
                        className="form-input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ fontWeight: 600 }}
                      >
                        <option value="AVAILABLE">Available in Showroom</option>
                        <option value="RESERVED">Reserved for Customer</option>
                        <option value="ON_APPROVAL">On Approval / Trial</option>
                        <option value="TRANSFER_PENDING">In Transit to Branch</option>
                        <option value="UNDER_REPAIR">Under Polish / Repair</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description & Piece Photograph */}
                <div style={{ background: 'var(--bg-muted)', padding: '14px 16px', borderRadius: '12px', border: '1px dashed #D1CBC0' }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="e.g. Handcrafted antique gold finish with floral motifs..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.79rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Camera size={14} color="#C6A15B" /> High-Resolution Jewellery Photograph
                    </label>
                    <div style={{ display: 'flex', gap: '4px', background: '#E8E5E0', borderRadius: '6px', padding: '2px' }}>
                      {(['file', 'url'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setImageInputMode(mode)}
                          style={{
                            padding: '3px 10px',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: imageInputMode === mode ? 700 : 500,
                            background: imageInputMode === mode ? '#FFFFFF' : 'transparent',
                            color: imageInputMode === mode ? '#C6A15B' : '#6B7280',
                            cursor: 'pointer',
                          }}
                        >
                          {mode === 'file' ? 'Upload File' : 'Paste URL'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {imageInputMode === 'file' ? (
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    />
                  ) : (
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      className="form-input"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setImagePreviewUrl(e.target.value);
                      }}
                      style={{ fontSize: '0.84rem' }}
                    />
                  )}

                  {imagePreviewUrl && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '55px', height: '55px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid rgba(198,161,91,0.4)', background: '#FFFFFF' }}>
                        <img src={imagePreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>Image Ready for Upload</span>
                    </div>
                  )}
                </div>

                {/* Modal Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '9px 24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} />
                    <span>{isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Inventory Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
