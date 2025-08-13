// File: src/pages/CreateQuotationPage.jsx (Lengkap dengan Product Configurator)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { create, all } from 'mathjs';
import { 
    apiGetPartners, 
    apiGetProducts, 
    apiGetSalesmen, 
    apiCreateQuotation,
    apiGetProductLinks,
    apiGetTemplateVersionById 
} from '../api/apiService';

// =================================================================================
// --- KELOMPOK 1: KONFIGURASI & UTILITAS ---
// =================================================================================

// Konfigurasi mathjs yang aman
const math = create(all, { epsilon: 1e-12 });

// Fungsi utilitas untuk format mata uang
const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};


// =================================================================================
// --- KELOMPOK 2: SUB-KOMPONEN PANEL PARAMETER ---
// =================================================================================
const ParameterPanel = ({ templateVersion, parameterValues, onApply, onCancel }) => {
    const [localParams, setLocalParams] = useState(parameterValues || {});
    const [previewResult, setPreviewResult] = useState(null);

    const handleLocalChange = (code, value) => {
        setLocalParams(prev => ({ ...prev, [code]: value }));
    };

    const runPreview = useCallback(() => {
        const scope = { ...(templateVersion.constants || {}), ...localParams };
        const resolvedComponents = [];
        let warnings = [];

        (templateVersion.components || []).forEach(comp => {
            try {
                let qty = math.evaluate(comp.qty_expression, scope);
                if (comp.loss_factor) qty *= (1 + comp.loss_factor / 100);
                if (comp.unit === 'pcs') qty = Math.ceil(qty);
                else qty = parseFloat(qty.toFixed(2));

                if (isNaN(qty) || qty < 0) throw new Error('Hasil tidak valid');
                resolvedComponents.push({ name: comp.name, qty, unit: comp.unit });
            } catch (err) {
                warnings.push(`Error di ${comp.name}: ${err.message}`);
            }
        });
        setPreviewResult({ resolvedComponents, warnings });
    }, [templateVersion, localParams]);
    
    useEffect(() => {
        const handler = setTimeout(() => runPreview(), 300);
        return () => clearTimeout(handler);
    }, [localParams, runPreview]);

    return (
        <tr className="bg-base-200">
            <td colSpan="14">
                <div className="p-4 my-2">
                    <h4 className="font-bold mb-2 text-center">Konfigurasi Item</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(templateVersion.parameters || []).map(param => (
                            <div className="form-control" key={param.code}>
                                <label className="label"><span className="label-text">{param.label} ({param.unit})</span></label>
                                <input
                                    type="number"
                                    value={localParams[param.code] || ''}
                                    onChange={(e) => handleLocalChange(param.code, parseFloat(e.target.value) || 0)}
                                    className="input input-bordered input-sm"
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div className="divider">Preview BOM</div>
                    {previewResult?.warnings.length > 0 && <div className="alert alert-warning text-xs p-2">{previewResult.warnings.join(', ')}</div>}
                    <ul className="text-xs space-y-1 mt-2 columns-2">
                        {previewResult?.resolvedComponents.map((comp, i) => <li key={i}>{comp.name}: <strong>{comp.qty} {comp.unit}</strong></li>)}
                    </ul>

                    <div className="text-right mt-4 space-x-2">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>Batal</button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => onApply(localParams)}>Terapkan</button>
                    </div>
                </div>
            </td>
        </tr>
    );
};


// =================================================================================
// --- KELOMPOK 3: KOMPONEN UTAMA HALAMAN PENAWARAN ---
// =================================================================================
const CreateQuotationPage = ({ setView }) => {
    // --- Bagian State ---
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [quotationNumber, setQuotationNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [salespersonId, setSalespersonId] = useState('');
    const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ id: 1, productId: '', width: 0, height: 0, quantity: 1, discounts: [0, 0, 0], notes: '', parameterValues: null }]);
    const [calculationResult, setCalculationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [editingNotesIndex, setEditingNotesIndex] = useState(null);
    const [currentNote, setCurrentNote] = useState('');
    const [productLinks, setProductLinks] = useState({});
    const [templateCache, setTemplateCache] = useState({});
    const [editingItemIndex, setEditingItemIndex] = useState(null);

    // --- Bagian Pengambilan Data & Logika Sampingan ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                setQuotationNumber(`QT-${yyyy}${mm}${dd}-0001`);

                const [customersRes, productsRes, salesmenRes, linksRes] = await Promise.all([
                    apiGetPartners(), apiGetProducts(), apiGetSalesmen(), apiGetProductLinks()
                ]);

                if (!customersRes.ok) throw new Error('Gagal memuat pelanggan');
                if (!productsRes.ok) throw new Error('Gagal memuat produk');
                if (!salesmenRes.ok) throw new Error('Gagal memuat salesman');
                if (!linksRes.ok) throw new Error('Gagal memuat link produk');
                
                const customersData = await customersRes.json();
                const productsData = await productsRes.json();
                const salesmenData = await salesmenRes.json();
                const linksData = await linksRes.json();
                
                setCustomers(customersData.data.partners);
                setProducts(productsData.data.products);
                setSalesmen(salesmenData.data.users);

                const linksMap = linksData.data.links.reduce((acc, link) => {
                    acc[link.productId] = link.templateId;
                    return acc;
                }, {});
                setProductLinks(linksMap);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (customerId) {
            const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
            if (selectedCustomer) {
                setSalespersonId(selectedCustomer.salespersonId || '');
                const defaultDiscountStr = selectedCustomer.group?.defaultDiscount || '0';
                const discountValues = defaultDiscountStr.split('+').map(d => parseFloat(d.trim()) || 0);
                const updatedItems = items.map(item => ({
                    ...item,
                    discounts: [discountValues[0] || 0, discountValues[1] || 0, discountValues[2] || 0]
                }));
                setItems(updatedItems);
            }
        }
    }, [customerId, customers]);

    // --- Bagian Event Handlers ---
    const handleItemChange = async (index, event) => {
        const { name, value } = event.target;
        const newItems = [...items];
        newItems[index][name] = value;

        if (name === 'productId') {
            const templateId = productLinks[value];
            newItems[index].parameterValues = null;

            if (templateId && !templateCache[templateId]) {
                try {
                    const dummyTemplate = {
                        parameters: [{ code: 'lebar', label: 'Lebar', unit: 'cm' }, { code: 'tinggi', label: 'Tinggi', unit: 'cm' }],
                        components: [{ name: 'Kain', qty_expression: '(lebar * tinggi) / 10000', unit: 'm²' }, { name: 'Hook', qty_expression: 'ceil(lebar / 10)', unit: 'pcs' }],
                        constants: {}
                    };
                    setTemplateCache(prev => ({...prev, [templateId]: dummyTemplate}));
                } catch (err) {
                    setError(`Gagal memuat template untuk produk: ${err.message}`);
                }
            }
        }
        setItems(newItems);
    };

    const handleDiscountChange = (itemIndex, discountIndex, value) => {
        const newItems = [...items];
        newItems[itemIndex].discounts[discountIndex] = parseFloat(value) || 0;
        setItems(newItems);
    };

    const handleAddItem = () => {
        const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
        const defaultDiscountStr = selectedCustomer?.group?.defaultDiscount || '0';
        const discountValues = defaultDiscountStr.split('+').map(d => parseFloat(d.trim()) || 0);
        setItems([...items, { id: Date.now(), productId: '', width: 0, height: 0, quantity: 1, discounts: [discountValues[0] || 0, discountValues[1] || 0, discountValues[2] || 0], notes: '', parameterValues: null }]);
    };

    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
    const handleTogglePanel = (index) => setEditingItemIndex(editingItemIndex === index ? null : index);
    const handleApplyParams = (index, params) => {
        const newItems = [...items];
        newItems[index].parameterValues = params;
        setItems(newItems);
        setEditingItemIndex(null);
    };

    const handleOpenNotesModal = (index) => {
        setEditingNotesIndex(index);
        setCurrentNote(items[index].notes || '');
        setIsNotesModalOpen(true);
    };
    const handleCloseNotesModal = () => setIsNotesModalOpen(false);
    const handleSaveNote = () => {
        const newItems = [...items];
        newItems[editingNotesIndex].notes = currentNote;
        setItems(newItems);
        handleCloseNotesModal();
    };

    const runCalculation = useCallback(async () => {
        if (!customerId || items.every(item => !item.productId)) {
            setCalculationResult(null);
            return;
        }
        const itemsForPayload = items.map(item => ({ ...item, manualDiscount: item.discounts.filter(d => d > 0).join('+') }));
        const payload = { customerId, quotationDate, items: itemsForPayload };
        try {
            const res = await apiCreateQuotation(payload);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menghitung');
            setCalculationResult(data.data.quotation);
        } catch (err) {
            console.error("Calculation Error:", err.message);
            setCalculationResult(null);
        }
    }, [customerId, quotationDate, items]);

    useEffect(() => {
        const handler = setTimeout(() => runCalculation(), 500);
        return () => clearTimeout(handler);
    }, [items, runCalculation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNotification('');
        const itemsForPayload = items.map(item => ({ ...item, manualDiscount: item.discounts.filter(d => d > 0).join('+') }));
        const payload = { customerId, salespersonId, quotationDate, items: itemsForPayload, quotationNumber, notes };
        try {
            const res = await apiCreateQuotation(payload);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menyimpan penawaran');
            setNotification(`Penawaran ${data.data.quotation.quotationNumber} berhasil disimpan!`);
            setTimeout(() => setView('quotations'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tableTotals = useMemo(() => {
        if (!calculationResult || !calculationResult.items) return { totalQty: 0, totalNominal: 0 };
        return calculationResult.items.reduce((acc, item) => {
            acc.totalQty += Number(item.quantity) || 0;
            acc.totalNominal += Number(item.basePrice) || 0;
            return acc;
        }, { totalQty: 0, totalNominal: 0 });
    }, [calculationResult]);

    // --- Bagian Render ---
    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Buat Penawaran Baru</h1>
                <button className="btn btn-ghost" onClick={() => setView('quotations')}>&larr; Kembali</button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="form-control"><label className="label"><span className="label-text">Nomor Penawaran</span></label><input type="text" className="input input-bordered" value={quotationNumber} onChange={(e) => setQuotationNumber(e.target.value)} required /></div>
                    <div className="form-control"><label className="label"><span className="label-text">Pelanggan</span></label><select className="select select-bordered" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required><option value="" disabled>Pilih Pelanggan</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    <div className="form-control"><label className="label"><span className="label-text">Salesman</span></label><select className="select select-bordered" value={salespersonId} onChange={(e) => setSalespersonId(e.target.value)} required><option value="" disabled>Pilih Salesman</option>{salesmen.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}</select></div>
                    <div className="form-control"><label className="label"><span className="label-text">Tanggal</span></label><input type="date" className="input input-bordered" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} required /></div>
                </div>
                
                <div className="divider">DETAIL BARANG</div>
                <div className="overflow-x-auto">
                    <table className="table table-xs w-full">
                        <thead>
                            <tr>
                                <th>Kode</th><th className="w-1/3">Nama Barang</th><th>Satuan</th><th>L</th><th>T</th><th>M²</th><th>Qty</th><th>Nominal</th><th>Disc 1(%)</th><th>Disc 2(%)</th><th>Disc 3(%)</th><th>Jumlah</th><th>Ket.</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const resultItem = calculationResult?.items[index];
                                const templateId = productLinks[item.productId];
                                const templateVersion = templateId ? templateCache[templateId] : null;
                                const isConfigurable = !!templateId;
                                return (
                                <React.Fragment key={item.id}>
                                    <tr>
                                        <td>{resultItem?.sku || '-'}</td>
                                        <td><select name="productId" value={item.productId} onChange={e => handleItemChange(index, e)} className="select select-bordered select-xs w-full" required><option value="" disabled>Pilih Produk</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                        <td>{resultItem?.uom || '-'}</td>
                                        <td><input type="number" name="width" value={item.width} onChange={e => handleItemChange(index, e)} className="input input-bordered input-xs w-full" /></td>
                                        <td><input type="number" name="height" value={item.height} onChange={e => handleItemChange(index, e)} className="input input-bordered input-xs w-full" /></td>
                                        <td>{resultItem?.calculatedArea.toFixed(2) || '0.00'}</td>
                                        <td><input type="number" name="quantity" value={item.quantity} onChange={e => handleItemChange(index, e)} className="input input-bordered input-xs w-full" required min="1" /></td>
                                        <td>{formatCurrency(resultItem?.basePrice || 0)}</td>
                                        <td><input type="number" value={item.discounts[0]} onChange={e => handleDiscountChange(index, 0, e.target.value)} className="input input-bordered input-xs w-full" /></td>
                                        <td><input type="number" value={item.discounts[1]} onChange={e => handleDiscountChange(index, 1, e.target.value)} className="input input-bordered input-xs w-full" /></td>
                                        <td><input type="number" value={item.discounts[2]} onChange={e => handleDiscountChange(index, 2, e.target.value)} className="input input-bordered input-xs w-full" /></td>
                                        <td>{formatCurrency(resultItem?.netPrice || 0)}</td>
                                        <td className="text-center">
                                            {isConfigurable && <button type="button" className={`btn btn-xs ${editingItemIndex === index ? 'btn-primary' : 'btn-ghost'}`} onClick={() => handleTogglePanel(index)}>⚙️</button>}
                                            <button type="button" className={`btn btn-xs ${item.notes ? 'btn-success' : 'btn-ghost'}`} onClick={() => handleOpenNotesModal(index)}>+</button>
                                        </td>
                                        <td><button type="button" className="btn btn-xs btn-error" onClick={() => handleRemoveItem(index)}>&times;</button></td>
                                    </tr>
                                    {editingItemIndex === index && templateVersion && (
                                        <ParameterPanel
                                            templateVersion={templateVersion}
                                            parameterValues={item.parameterValues}
                                            onApply={(params) => handleApplyParams(index, params)}
                                            onCancel={() => setEditingItemIndex(null)}
                                        />
                                    )}
                                </React.Fragment>
                            )})}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-base-200"><td colSpan="6" className="text-right">Total</td><td>{tableTotals.totalQty}</td><td>{formatCurrency(tableTotals.totalNominal)}</td><td colSpan="5"></td></tr>
                        </tfoot>
                    </table>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem}>+ Tambah Baris</button>

                <div className="flex flex-col md:flex-row justify-between items-start mt-6 gap-6">
                    <div className="w-full md:w-1/2"><label className="label"><span className="label-text">Keterangan Umum</span></label><textarea className="textarea textarea-bordered w-full" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between"><span className="font-bold">Subtotal:</span> <span>{formatCurrency(calculationResult?.subTotal || 0)}</span></div>
                        <div className="flex justify-between"><span className="font-bold">Total Diskon Item:</span> <span className="text-red-500">{formatCurrency(-(calculationResult?.totalItemDiscount || 0))}</span></div>
                        <div className="flex justify-between"><span className="font-bold">PPN (11%):</span> <span>{formatCurrency(calculationResult?.totalTax || 0)}</span></div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between text-lg font-bold"><span >Grand Total:</span> <span>{formatCurrency(calculationResult?.grandTotal || 0)}</span></div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="submit" className="btn btn-primary" disabled={loading || !calculationResult}>
                        {loading && <span className="loading loading-spinner"></span>}
                        Simpan Penawaran
                    </button>
                </div>
            </form>

            {isNotesModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Tambah/Edit Keterangan</h3>
                        <textarea className="textarea textarea-bordered w-full mt-4" rows="5" placeholder="Masukkan keterangan untuk item ini..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)}></textarea>
                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={handleCloseNotesModal}>Batal</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveNote}>Simpan</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default CreateQuotationPage;
