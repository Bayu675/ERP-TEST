// File: src/pages/ProductDetailPage.jsx (dengan Modal Edit yang Canggih)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    apiGetProductById, 
    apiUpdateProduct, 
    apiDeleteProduct,
    apiGetCategories,
    apiGetSubCategories,
    apiGetBrands,
    apiGetUoMs
} from '../api/apiService';
import InventoryTab from '../components/InventoryTab';

// Menggunakan kembali komponen CreatableSelect dari ProductsPage jika memungkinkan
// Untuk kesederhanaan, kita akan gunakan dropdown biasa di sini.
// Jika CreatableSelect diekspor, kita bisa menggunakannya di sini juga.

const ProductDetailPage = ({ setView, productId }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('info');
    
    // State untuk Modal Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalActiveTab, setModalActiveTab] = useState('info');

    // State untuk data master di dalam modal
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [uoms, setUoms] = useState([]);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiGetProductById(productId);
            if (!res.ok) throw new Error('Gagal memuat data produk');
            const data = await res.json();
            setProduct(data.data.product);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId, fetchProduct]);

    // --- FUNGSI BARU UNTUK MEMUAT DATA MASTER UNTUK MODAL ---
    const loadMasterDataForModal = async () => {
        try {
            const [categoriesRes, subCategoriesRes, brandsRes, uomsRes] = await Promise.all([
                apiGetCategories(), apiGetSubCategories(), apiGetBrands(), apiGetUoMs()
            ]);
            const categoriesData = await categoriesRes.json();
            const subCategoriesData = await subCategoriesRes.json();
            const brandsData = await brandsRes.json();
            const uomsData = await uomsRes.json();
            setCategories(categoriesData.data);
            setSubCategories(subCategoriesData.data);
            setBrands(brandsData.data);
            setUoms(uomsData.data);
        } catch (err) {
            // Tampilkan error di dalam modal jika gagal
            setError(err.message);
        }
    };

    const handleOpenEditModal = () => {
        // Isi form edit dengan data produk yang ada, pastikan semua field ada
        setEditingProduct({
            name: product.name || '',
            sku: product.sku || '',
            productCategoryId: product.category?.id || '',
            subCategoryId: product.subcategory?.id || '',
            brandId: product.brand?.id || '',
            productType: product.productType || 'TRADED_GOOD',
            uomId: product.uom?.id || '',
            purchasePrice: product.purchasePrice || 0,
            standardSalePrice: product.standardSalePrice || 0,
            noDiscount: product.noDiscount || false,
            isTracked: product.isTracked || false,
            reorderPoint: product.reorderPoint || 0,
            lotNumberTracking: product.lotNumberTracking || false,
            description: product.description || '',
            status: product.status || 'ACTIVE',
            isBundle: product.isBundle || false,
            isService: product.isService || false,
        });
        loadMasterDataForModal(); // Muat data dropdown
        setModalActiveTab('info');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await apiUpdateProduct(productId, editingProduct);
            if (!res.ok) throw new Error('Gagal memperbarui produk');
            handleCloseModal();
            await fetchProduct();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (window.confirm('Apakah Anda yakin ingin mengarsipkan produk ini?')) {
            try {
                setLoading(true);
                const res = await apiDeleteProduct(productId);
                if (res.status !== 204) throw new Error('Gagal mengarsipkan produk');
                setView('products');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredSubCategories = useMemo(() => {
        if (!editingProduct?.productCategoryId) return [];
        return subCategories.filter(sc => sc.productCategoryId === parseInt(editingProduct.productCategoryId));
    }, [editingProduct?.productCategoryId, subCategories]);

    if (loading && !product) return <div className="text-center"><span className="loading loading-lg"></span></div>;
    if (error && !isModalOpen) return <div className="alert alert-error">{error}</div>;
    if (!product) return <div className="alert alert-warning">Produk tidak ditemukan.</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Informasi Umum</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><strong>SKU:</strong> {product.sku}</div>
                            <div><strong>Tipe Produk:</strong> {product.productType}</div>
                            <div><strong>Kategori:</strong> {product.category?.name || 'N/A'}</div>
                            <div><strong>Subkategori:</strong> {product.subcategory?.name || 'N/A'}</div>
                            <div><strong>Brand:</strong> {product.brand?.name || 'N/A'}</div>
                            <div><strong>Satuan:</strong> {product.uom?.name || 'N/A'}</div>
                            <div><strong>Status:</strong> <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'}`}>{product.status}</span></div>
                            <div><strong>Dilacak Stok:</strong> {product.isTracked ? 'Ya' : 'Tidak'}</div>
                        </div>
                        <p className="mt-4">{product.description}</p>
                    </div>
                );
            case 'inventory':
                return <InventoryTab productId={productId} productUoM={product.uom} />;
            case 'config':
                return <div>Konten untuk Product Configurator (BOM) akan ada di sini.</div>;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-500">{product.sku}</p>
                </div>
                <div className="space-x-2">
                    <button className="btn btn-outline btn-info" onClick={handleOpenEditModal}>Edit</button>
                    <button className="btn btn-outline btn-error" onClick={handleArchive}>Arsipkan</button>
                    <button className="btn btn-ghost" onClick={() => setView('products')}>&larr; Kembali</button>
                </div>
            </div>

            <div role="tablist" className="tabs tabs-lifted">
                <a role="tab" className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`} onClick={() => setActiveTab('info')}>Informasi Umum</a>
                <a role="tab" className={`tab ${activeTab === 'inventory' ? 'tab-active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventaris & Stok</a>
                <a role="tab" className={`tab ${activeTab === 'config' ? 'tab-active' : ''}`} onClick={() => setActiveTab('config')}>Konfigurasi & BOM</a>
            </div>

            <div className="bg-base-100 p-6 rounded-b-box rounded-tr-box shadow-lg">
                {renderTabContent()}
            </div>

            {isModalOpen && editingProduct && (
                 <dialog className="modal modal-open">
                    <form onSubmit={handleUpdateSubmit} className="modal-box w-11/12 max-w-3xl">
                        <h3 className="font-bold text-lg">Edit Produk: {product.name}</h3>
                        {error && <div className="alert alert-error my-4">{error}</div>}
                        
                        <div role="tablist" className="tabs tabs-lifted mt-4">
                            <a role="tab" className={`tab ${modalActiveTab === 'info' ? 'tab-active' : ''}`} onClick={() => setModalActiveTab('info')}>Informasi Utama</a>
                            <a role="tab" className={`tab ${modalActiveTab === 'pricing' ? 'tab-active' : ''}`} onClick={() => setModalActiveTab('pricing')}>Harga & Stok</a>
                            <a role="tab" className={`tab ${modalActiveTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setModalActiveTab('settings')}>Pengaturan Lainnya</a>
                        </div>

                        <div className="bg-base-100 p-6 rounded-b-box rounded-tr-box border-t-0 border">
                            {modalActiveTab === 'info' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Nama Produk*</span></label><input type="text" name="name" value={editingProduct.name} onChange={handleInputChange} className="input input-bordered" required /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">SKU / Kode Unik*</span></label><input type="text" name="sku" value={editingProduct.sku} onChange={handleInputChange} className="input input-bordered" required /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Kategori</span></label><select name="productCategoryId" value={editingProduct.productCategoryId} onChange={handleInputChange} className="select select-bordered"><option value="">Pilih Kategori</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Subkategori</span></label><select name="subCategoryId" value={editingProduct.subCategoryId} onChange={handleInputChange} className="select select-bordered" disabled={!editingProduct.productCategoryId}><option value="">Pilih Subkategori</option>{filteredSubCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Brand</span></label><select name="brandId" value={editingProduct.brandId} onChange={handleInputChange} className="select select-bordered"><option value="">Pilih Brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Tipe Produk*</span></label><select name="productType" value={editingProduct.productType} onChange={handleInputChange} className="select select-bordered" required><option value="TRADED_GOOD">Barang Jadi</option><option value="RAW_MATERIAL">Bahan Baku</option><option value="SERVICE">Jasa</option></select></div>
                                    </div>
                                    <div className="form-control"><label className="label"><span className="label-text">Satuan Utama</span></label><select name="uomId" value={editingProduct.uomId} onChange={handleInputChange} className="select select-bordered"><option value="">Pilih Satuan</option>{uoms.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}</select></div>
                                </div>
                            )}
                            {modalActiveTab === 'pricing' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Harga Beli</span></label><input type="number" name="purchasePrice" value={editingProduct.purchasePrice} onChange={handleInputChange} className="input input-bordered" /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Harga Jual Standar</span></label><input type="number" name="standardSalePrice" value={editingProduct.standardSalePrice} onChange={handleInputChange} className="input input-bordered" /></div>
                                    </div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="noDiscount" checked={editingProduct.noDiscount} onChange={handleInputChange} className="checkbox checkbox-primary" /><span className="label-text">Harga Bersih (Tidak bisa didiskon)</span></label></div>
                                    <div className="divider"></div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="isTracked" checked={editingProduct.isTracked} onChange={handleInputChange} className="checkbox checkbox-primary" /><span className="label-text">Lacak Stok untuk Produk Ini</span></label></div>
                                    {editingProduct.isTracked && (
                                        <div className="collapse collapse-arrow bg-base-200">
                                            <input type="checkbox" defaultChecked/> 
                                            <div className="collapse-title text-sm font-medium">Pengaturan Stok Lanjutan</div>
                                            <div className="collapse-content"> 
                                                <div className="form-control"><label className="label"><span className="label-text">Minimal Stok / Reorder Point</span></label><input type="number" name="reorderPoint" value={editingProduct.reorderPoint} onChange={handleInputChange} className="input input-bordered" /></div>
                                                <div className="form-control mt-4"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="lotNumberTracking" checked={editingProduct.lotNumberTracking} onChange={handleInputChange} className="checkbox" /><span className="label-text">Perlu Pelacakan Lot/Batch</span></label></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {modalActiveTab === 'settings' && (
                                <div className="space-y-4">
                                    <div className="form-control"><label className="label"><span className="label-text">Deskripsi Produk</span></label><textarea name="description" value={editingProduct.description} onChange={handleInputChange} className="textarea textarea-bordered h-24"></textarea></div>
                                    <div className="form-control"><label className="label"><span className="label-text">Status Produk</span></label><select name="status" value={editingProduct.status} onChange={handleInputChange} className="select select-bordered" required><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select></div>
                                    <div className="divider"></div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="isBundle" checked={editingProduct.isBundle} onChange={handleInputChange} className="checkbox" /><span className="label-text">Produk ini adalah Bundle / Punya BOM</span></label></div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="isService" checked={editingProduct.isService} onChange={handleInputChange} className="checkbox" /><span className="label-text">Produk ini adalah Jasa</span></label></div>
                                </div>
                            )}
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={handleCloseModal}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading && <span className="loading loading-spinner"></span>}
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default ProductDetailPage;
