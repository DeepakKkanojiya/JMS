import React, { useState, useEffect } from 'react';
import { imagesApi, ImageRecord } from '../../api/images';
import { getActiveBaseUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Upload, Star, Trash2, Eye, AlertCircle, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ProductImageGalleryProps {
  productId: string;
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ productId, productName }) => {
  const { hasPermission } = useAuth();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Modal State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const canCreate = hasPermission('product_image.create');
  const canUpdate = hasPermission('product_image.update');
  const canDelete = hasPermission('product_image.delete');

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await imagesApi.listProductImages(productId);
      if (res?.success || Array.isArray(res?.data)) {
        setImages(res.data || []);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to load product design images.');
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (urlPath: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) return urlPath;
    const baseApi = getActiveBaseUrl();
    const origin = baseApi.replace(/\/api\/v1\/?$/, '');
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    return `${origin}${cleanPath}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMsg('Invalid file format. Allowed formats: JPEG, JPG, PNG, WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select an image file to upload.');
      return;
    }
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await imagesApi.uploadProductImage(productId, selectedFile, altText, isPrimary);
      setSuccessMsg('Product design image uploaded successfully.');
      setSelectedFile(null);
      setAltText('');
      setIsPrimary(false);
      fetchImages();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to upload product image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await imagesApi.updateProductImage(productId, imageId, { isPrimary: true });
      setSuccessMsg('Primary design image updated.');
      fetchImages();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update primary image.');
    }
  };

  const handleDelete = (imageId: string) => {
    setDeleteTarget(imageId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await imagesApi.deleteProductImage(productId, deleteTarget);
      setSuccessMsg('Image deleted successfully.');
      fetchImages();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to delete product image.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="#C6A15B" /> Product Design Catalog Images ({images.length})
          </h4>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Master design/catalog photographs for <strong>{productName}</strong>.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#DC2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#059669', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Upload Form Section */}
      {canCreate && (
        <div className="glass-card" style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '20px', border: '1px dashed #CBD5E1' }}>
          <h5 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: '#18181B' }}>Upload New Master Design Image</h5>
          <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Image (JPEG, PNG, WEBP ≤ 5MB)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="form-input" style={{ padding: '6px', fontSize: '0.8rem' }} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Alt Text / Description</label>
              <input type="text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Front view, side profile..." className="form-input" style={{ padding: '7px 10px', fontSize: '0.82rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '8px' }}>
              <input type="checkbox" id={`prod-primary-${productId}`} checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              <label htmlFor={`prod-primary-${productId}`} style={{ fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none', color: '#475569' }}>Set Primary</label>
            </div>
            <button type="submit" disabled={uploading || !selectedFile} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>Loading product images...</div>
      ) : images.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem' }}>
          No design catalog images uploaded for this product yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {images.map((img) => {
            const fullUrl = getFullImageUrl(img.imageUrl);
            return (
              <div key={img.id} className="glass-card" style={{ padding: '10px', background: '#FFFFFF', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {img.isPrimary && (
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10, padding: '2px 8px', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={11} fill="#C6A15B" /> Primary
                  </span>
                )}
                <div style={{ height: '140px', width: '100%', borderRadius: '8px', overflow: 'hidden', background: '#F1F5F9', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={fullUrl} alt={img.altText || productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                  {img.altText || 'No description'}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                  <button onClick={() => setPreviewModalUrl(fullUrl)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} title="Preview Image">
                    <Eye size={13} />
                  </button>

                  {!img.isPrimary && canUpdate && (
                    <button onClick={() => handleSetPrimary(img.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#C6A15B' }} title="Make Primary">
                      <Star size={13} />
                    </button>
                  )}

                  {canDelete && (
                    <button onClick={() => handleDelete(img.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#DC2626' }} title="Delete Image">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewModalUrl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button onClick={() => setPreviewModalUrl(null)} style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#FFFFFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
            <img src={previewModalUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Image"
        message="Are you sure you want to delete this design image? This action cannot be undone."
        confirmText="Delete Photo"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
};
