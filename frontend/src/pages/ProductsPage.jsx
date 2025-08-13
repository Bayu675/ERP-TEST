// File: src/pages/ProductsPage.jsx (Final, dengan Modularitas & Perbaikan Bug)

import React, { useState, useEffect, useMemo } from 'react';
import { 
    apiGetProducts, 
    apiCreateProduct, 
    apiGetCategories, 
    apiGetUoMs,
    apiGetBrands,
    apiGetSubCategories,
    apiCreateCategory,
    apiCreateSubCategory,
    apiCreateBrand,
    apiCreateUoM
} from '../api/apiService';

// =================================================================================
// --- KELOMPOK 1: KOMPONEN DROPDOWN "PILIH-ATAU-BUAT" ---
// =================================================================================
const CreatableSelect = ({ options, value, onChange, onCreate, placeholder, disabled = false }) => {
    const [inputValue, setInputValue] = useState('');
    const [showOptions, setShowOptions] = useState(false);

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;
        return options.filter(opt => opt.name.toLowerCase().includes(inputValue.toLowerCase()));
    }, [inputValue, options]);

    const handleSelect = (option) => {
        onChange(option.id);
        setInputValue(option.name);
        setShowOptions(false);
    };

    const handleCreate = async () => {
        if (inputValue && !options.some(opt => opt.name.toLowerCase() === inputValue.toLowerCase())) {
            const newItem = await onCreate(inputValue);
            if (newItem) {
                handleSelect(newItem);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }
    };
    
    useEffect(() => {
        const selectedOption = options.find(opt => opt.id === value);
        setInputValue(selectedOption ? selectedOption.name : '');
    }, [value, options]);

    return (
        <div className="dropdown w-full">
            <input
                type="text"
                className="input input-bordered w-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setShowOptions(true)}
                onBlur={() => setTimeout(() => setShowOptions(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
            />
            {showOptions && (
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full max-h-60 overflow-y-auto">
                    {filteredOptions.map(opt => (
                        <li key={opt.id} onMouseDown={() => handleSelect(opt)}><a>{opt.name}</a></li>
                    ))}
                    {inputValue && !filteredOptions.some(opt => opt.name.toLowerCase() === inputValue.toLowerCase()) && (
                         <li onMouseDown={handleCreate}><a>+ Buat baru: "{inputValue}"</a></li>
                    )}
                </ul>
            )}
        </div>
    );
};


// =================================================================================
// --- KELOMPOK 2: KOMPONEN UTAMA HALAMAN PRODUK ---
// =================================================================================
const ProductsPage = ({ setView, setViewingProductId }) => {
    // --- Bagian State ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [newProduct, setNewProduct] = useState({});

    // --- Bagian Pengambilan Data & Logika Sampingan ---
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const responses = await Promise.all([
                apiGetProducts(), 
                apiGetCategories(), 
                apiGetSubCategories(), 
                apiGetBrands(), 
                apiGetUoMs()
            ]);

            for (const res of responses) {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: `Server error: ${res.status}` }));
                    throw new Error(errorData.message || 'Gagal memuat data awal');
                }
            }

            const [productsData, categoriesData, subCategoriesData, brandsData, uomsData] = await Promise.all(responses.map(res => res.json()));

            setProducts(productsData.data.products);
            setCategories(categoriesData.data);
            setSubCategories(subCategoriesData.data);
            setBrands(brandsData.data);
            setUoms(uomsData.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInitialData(); }, []);

    const filteredSubCategories = useMemo(() => {
        if (!newProduct.productCategoryId) return [];
        return subCategories.filter(sc => sc.productCategoryId === parseInt(newProduct.productCategoryId));
    }, [newProduct.productCategoryId, subCategories]);

    // --- Bagian Event Handlers ---
    const handleRowClick = (productId) => {
        setViewingProductId(productId);
        setView('productDetail');
    };

    const handleOpenModal = () => {
        setError('');
        setNotification('');
        setActiveTab('info');
        setNewProduct({
            name: '', sku: '', productCategoryId: '', subCategoryId: '', brandId: '',
            productType: 'TRADED_GOOD', uomId: '', purchasePrice: 0, standardSalePrice: 0,
            noDiscount: false, isTracked: true, reorderPoint: 0, lotNumberTracking: false,
            description: '', status: 'ACTIVE', isBundle: false, isService: false,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (name, value) => {
        if (name === 'productCategoryId') {
            setNewProduct(prev => ({ ...prev, subCategoryId: '', [name]: value }));
        } else {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: checked }));
    };

    const handleCreateCategory = async (name) => {
        try {
            setError('');
            const res = await apiCreateCategory({ name });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal membuat kategori');
            setCategories(prev => [...prev, data.data]);
            return data.data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const handleCreateBrand = async (name) => {
        try {
            setError('');
            const res = await apiCreateBrand({ name });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal membuat brand');
            setBrands(prev => [...prev, data.data]);
            return data.data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const handleCreateUoM = async (name) => {
        try {
            setError('');
            const res = await apiCreateUoM({ name: name, symbol: name.toUpperCase() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal membuat satuan');
            setUoms(prev => [...prev, data.data]);
            return data.data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };
    
    const handleCreateSubCategory = async (name) => {
        if (!newProduct.productCategoryId) {
            setError('Pilih kategori terlebih dahulu sebelum membuat subkategori.');
            return null;
        }
        try {
            setError('');
            const res = await apiCreateSubCategory({ name, productCategoryId: newProduct.productCategoryId });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal membuat subkategori');
            setSubCategories(prev => [...prev, data.data]);
            return data.data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const payload = { ...newProduct };
            const integerFields = ['productCategoryId', 'subCategoryId', 'brandId', 'uomId'];
            integerFields.forEach(field => {
                if (payload[field] === '') {
                    payload[field] = null;
                }
            });

            const res = await apiCreateProduct(payload);
            
            if (!res.ok) {
                const data = await res.json().catch(() => {
                    throw new Error('Terjadi kesalahan pada server. Respons tidak valid.');
                });
                throw new Error(data.message || 'Gagal membuat produk');
            }

            setNotification('Produk baru berhasil ditambahkan.');
            handleCloseModal();
            await fetchInitialData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Bagian Render ---
    if (loading && products.length === 0) return <div className="text-center"><span className="loading loading-lg"></span></div>;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Manajemen Produk</h1>
                <button className="btn btn-primary" onClick={handleOpenModal}>+ Tambah Produk</button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            <div className="overflow-x-auto">
                <table className="table table-zebra table-hover">
                    <thead><tr><th>SKU</th><th>Nama Produk</th><th>Tipe</th><th>Status</th></tr></thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} onClick={() => handleRowClick(p.id)} className="cursor-pointer">
                                <td><span className="font-mono">{p.sku}</span></td>
                                <td>{p.name}</td>
                                <td><div className="badge badge-neutral">{p.productType}</div></td>
                                <td><div className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'}`}>{p.status}</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                 <dialog className="modal modal-open">
                    <form onSubmit={handleSubmit} className="modal-box w-11/12 max-w-3xl">
                        <h3 className="font-bold text-lg">Tambah Produk Baru</h3>
                        
                        <div role="tablist" className="tabs tabs-lifted mt-4">
                            <a role="tab" className={`tab ${activeTab === 'info' ? 'tab-active' : ''}`} onClick={() => setActiveTab('info')}>Informasi Utama</a>
                            <a role="tab" className={`tab ${activeTab === 'pricing' ? 'tab-active' : ''}`} onClick={() => setActiveTab('pricing')}>Harga & Stok</a>
                            <a role="tab" className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('settings')}>Pengaturan Lainnya</a>
                        </div>

                        <div className="bg-base-100 p-6 rounded-b-box rounded-tr-box border-t-0 border">
                            {activeTab === 'info' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Nama Produk*</span></label><input type="text" name="name" value={newProduct.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="input input-bordered" required /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">SKU / Kode Unik*</span></label><input type="text" name="sku" value={newProduct.sku || ''} onChange={(e) => handleInputChange('sku', e.target.value)} className="input input-bordered" required /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Kategori</span></label><CreatableSelect options={categories} value={newProduct.productCategoryId} onChange={(id) => handleInputChange('productCategoryId', id)} onCreate={handleCreateCategory} placeholder="Pilih atau buat kategori"/></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Subkategori</span></label><CreatableSelect options={filteredSubCategories} value={newProduct.subCategoryId} onChange={(id) => handleInputChange('subCategoryId', id)} onCreate={handleCreateSubCategory} placeholder="Pilih atau buat subkategori" disabled={!newProduct.productCategoryId}/></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Brand</span></label><CreatableSelect options={brands} value={newProduct.brandId} onChange={(id) => handleInputChange('brandId', id)} onCreate={handleCreateBrand} placeholder="Pilih atau buat brand"/></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Tipe Produk*</span></label><select name="productType" value={newProduct.productType} onChange={(e) => handleInputChange('productType', e.target.value)} className="select select-bordered" required><option value="TRADED_GOOD">Barang Jadi</option><option value="RAW_MATERIAL">Bahan Baku</option><option value="SERVICE">Jasa</option></select></div>
                                    </div>
                                    <div className="form-control"><label className="label"><span className="label-text">Satuan Utama</span></label><CreatableSelect options={uoms} value={newProduct.uomId} onChange={(id) => handleInputChange('uomId', id)} onCreate={handleCreateUoM} placeholder="Pilih atau buat satuan"/></div>
                                </div>
                            )}
                            {activeTab === 'pricing' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Harga Beli</span></label><input type="number" name="purchasePrice" value={newProduct.purchasePrice || 0} onChange={(e) => handleInputChange('purchasePrice', e.target.value)} className="input input-bordered" /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Harga Jual Standar</span></label><input type="number" name="standardSalePrice" value={newProduct.standardSalePrice || 0} onChange={(e) => handleInputChange('standardSalePrice', e.target.value)} className="input input-bordered" /></div>
                                    </div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="noDiscount" checked={newProduct.noDiscount} onChange={handleCheckboxChange} className="checkbox checkbox-primary" /><span className="label-text">Harga Bersih (Tidak bisa didiskon)</span></label></div>
                                    <div className="divider"></div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="isTracked" checked={newProduct.isTracked} onChange={handleCheckboxChange} className="checkbox checkbox-primary" /><span className="label-text">Lacak Stok untuk Produk Ini</span></label></div>
                                    {newProduct.isTracked && (
                                        <div className="collapse collapse-arrow bg-base-200">
                                            <input type="checkbox" defaultChecked/> 
                                            <div className="collapse-title text-sm font-medium">Pengaturan Stok Lanjutan</div>
                                            <div className="collapse-content"> 
                                                <div className="form-control"><label className="label"><span className="label-text">Minimal Stok / Reorder Point</span></label><input type="number" name="reorderPoint" value={newProduct.reorderPoint || 0} onChange={(e) => handleInputChange('reorderPoint', e.target.value)} className="input input-bordered" /></div>
                                                <div className="form-control mt-4"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="lotNumberTracking" checked={newProduct.lotNumberTracking} onChange={handleCheckboxChange} className="checkbox" /><span className="label-text">Perlu Pelacakan Lot/Batch</span></label></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    <div className="form-control"><label className="label"><span className="label-text">Deskripsi Produk</span></label><textarea name="description" value={newProduct.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} className="textarea textarea-bordered h-24"></textarea></div>
                                    <div className="form-control"><label className="label"><span className="label-text">Status Produk</span></label><select name="status" value={newProduct.status} onChange={(e) => handleInputChange('status', e.target.value)} className="select select-bordered" required><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select></div>
                                    <div className="divider"></div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="isBundle" checked={newProduct.isBundle} onChange={handleCheckboxChange} className="checkbox" /><span className="label-text">Produk ini adalah Bundle / Punya BOM</span></label></div>
                                    <div className="form-control"><label className="cursor-pointer label justify-start gap-4"><input type="checkbox" name="isService" checked={newProduct.isService} onChange={handleCheckboxChange} className="checkbox" /><span className="label-text">Produk ini adalah Jasa</span></label></div>
                                </div>
                            )}
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={handleCloseModal}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading && <span className="loading loading-spinner"></span>}
                                Simpan Produk
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default ProductsPage;
