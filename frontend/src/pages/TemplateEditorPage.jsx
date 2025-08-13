// File: src/pages/TemplateEditorPage.jsx (Final dengan Semua Fitur)

import React, { useState, useEffect, useMemo } from 'react';
import { create, all } from 'mathjs';
import { apiGetProducts, apiCreateConfigTemplate, apiCreateTemplateVersion } from '../api/apiService';

// =================================================================================
// --- KELOMPOK 1: KONFIGURASI & KOMPONEN BANTU ---
// =================================================================================
const math = create(all, { epsilon: 1e-12 });

const ProductSearchSelect = ({ products, value, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const [showOptions, setShowOptions] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!inputValue) return products;
        const lowerCaseInput = inputValue.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerCaseInput) ||
            p.sku.toLowerCase().includes(lowerCaseInput)
        );
    }, [inputValue, products]);

    const handleSelect = (product) => {
        onChange(product);
        setInputValue(`${product.name} (${product.sku})`);
        setShowOptions(false);
    };
    
    useEffect(() => {
        const selectedProduct = products.find(p => p.id === value);
        setInputValue(selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : '');
    }, [value, products]);

    return (
        <div className="relative w-full">
            <input type="text" className="input input-bordered input-xs w-full" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onFocus={() => setShowOptions(true)} onBlur={() => setTimeout(() => setShowOptions(false), 200)} placeholder={placeholder}/>
            {showOptions && (
                <ul tabIndex={0} className="absolute z-10 menu p-1 shadow bg-base-200 rounded-box w-full mt-1 max-h-40 overflow-y-auto">
                    {filteredProducts.map(p => (
                        <li key={p.id} onMouseDown={() => handleSelect(p)}>
                            <a className="text-xs p-2">
                                <div className="flex justify-between w-full">
                                    <span>{p.name}</span>
                                    <span className="font-mono opacity-60">{p.sku}</span>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// =================================================================================
// --- KELOMPOK 2: KOMPONEN UTAMA EDITOR TEMPLATE ---
// =================================================================================
const TemplateEditorPage = ({ setView, templateId }) => {
    // --- Bagian State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [parameters, setParameters] = useState([]);
    const [components, setComponents] = useState([]);
    const [constants, setConstants] = useState([]);
    const [productList, setProductList] = useState([]);
    const [testParameters, setTestParameters] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [activeTab, setActiveTab] = useState('parameters');

    // --- Bagian Pengambilan Data ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const productsRes = await apiGetProducts();
                if (!productsRes.ok) throw new Error('Gagal memuat daftar produk komponen');
                const productsData = await productsRes.json();
                setProductList(productsData.data.products);

                if (templateId === 'new') {
                    setTemplateName('Template Baru');
                    setParameters([{ id: Date.now(), code: '', label: '', type: 'number', unit: '' }]);
                    setComponents([{ id: Date.now(), productId: '', sku: '', name: '', qty_expression: '', unit: '' }]);
                    setConstants([{ id: Date.now(), key: '', value: '' }]);
                } else {
                    // Logika untuk fetch data template yang ada akan ditambahkan di sini
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [templateId]);

    // --- KELOMPOK 3: EVENT HANDLERS EDITOR ---
    const handleParamChange = (index, event) => {
        const newParams = [...parameters];
        newParams[index][event.target.name] = event.target.value;
        setParameters(newParams);
    };
    const handleAddParam = () => setParameters([...parameters, { id: Date.now(), code: '', label: '', type: 'number', unit: '' }]);
    const handleRemoveParam = (index) => setParameters(parameters.filter((_, i) => i !== index));

    const handleCompChange = (index, fieldName, value) => {
        const newComps = [...components];
        newComps[index][fieldName] = value;
        setComponents(newComps);
    };
    const handleComponentSelect = (index, selectedProduct) => {
        const newComps = [...components];
        newComps[index] = { ...newComps[index], productId: selectedProduct.id, sku: selectedProduct.sku, name: selectedProduct.name, unit: selectedProduct.uom?.symbol || '' };
        setComponents(newComps);
    };
    const handleAddComp = () => setComponents([...components, { id: Date.now(), productId: '', sku: '', name: '', qty_expression: '', unit: '' }]);
    const handleRemoveComp = (index) => setComponents(components.filter((_, i) => i !== index));

    const handleConstChange = (index, event) => {
        const newConsts = [...constants];
        newConsts[index][event.target.name] = event.target.value;
        setConstants(newConsts);
    };
    const handleAddConst = () => setConstants([...constants, { id: Date.now(), key: '', value: '' }]);
    const handleRemoveConst = (index) => setConstants(constants.filter((_, i) => i !== index));

    // --- KELOMPOK 4: LOGIKA TEST PANEL (DIPERBARUI) ---
    const handleTestParamChange = (code, value) => setTestParameters(prev => ({ ...prev, [code]: value }));
    const runTest = () => {
        setTestResult(null);
        const resolvedComponents = [];
        const warnings = [];
        const scope = {};

        constants.forEach(c => { if (c.key && c.value) scope[c.key] = parseFloat(c.value) || 0; });
        Object.keys(testParameters).forEach(key => { scope[key] = parseFloat(testParameters[key]) || 0; });

        components.forEach(comp => {
            if (!comp.qty_expression) return;
            try {
                let qty = math.evaluate(comp.qty_expression, scope);
                if (isNaN(qty) || qty < 0) throw new Error('Hasil tidak valid (NaN atau negatif)');
                
                // Tampilkan hasil dengan presisi, tanpa pembulatan paksa
                const preciseQty = parseFloat(qty.toFixed(4));
                resolvedComponents.push({ ...comp, qty: preciseQty });
            } catch (error) {
                warnings.push(`Error di komponen "${comp.name || comp.sku}": ${error.message}`);
            }
        });
        setTestResult({ resolvedComponents, warnings });
    };

    // --- KELOMPOK 5: FUNGSI SIMPAN (BARU) ---
    const handleSaveAndPublish = async () => {
        setLoading(true);
        setError('');
        setNotification('');
        try {
            // Siapkan payload data versi
            const versionData = {
                parameters: parameters.map(({ id, ...rest }) => rest),
                components: components.map(({ id, ...rest }) => rest),
                constants: constants.map(({ id, ...rest }) => rest),
                status: 'PUBLISHED'
            };

            if (templateId === 'new') {
                // Jika ini adalah template baru, panggil API untuk membuat template
                const templateData = {
                    name: templateName,
                    description: templateDescription,
                    initialVersion: versionData // Kirim versi pertama bersamaan
                };
                const res = await apiCreateConfigTemplate(templateData);
                if (!res.ok) throw new Error((await res.json()).message || 'Gagal membuat template baru');
            } else {
                // Jika ini adalah template yang sudah ada, panggil API untuk membuat versi baru
                const res = await apiCreateTemplateVersion(templateId, versionData);
                if (!res.ok) throw new Error((await res.json()).message || 'Gagal menyimpan versi baru');
            }
            
            setNotification('Template berhasil disimpan dan dipublikasikan!');
            setTimeout(() => setView('configurator'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- KELOMPOK 6: RENDER KOMPONEN ---
    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;

    return (
        <div>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div className="flex-grow">
                    <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="input input-bordered w-full text-3xl font-bold" placeholder="Nama Template Konfigurasi"/>
                    <textarea value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} className="textarea textarea-bordered w-full mt-2" placeholder="Deskripsi singkat..." rows="1"></textarea>
                </div>
                <div className="space-x-2 self-start md:self-center">
                     <button className="btn btn-success" onClick={handleSaveAndPublish} disabled={loading}>
                        {loading && <span className="loading loading-spinner"></span>}
                        Simpan & Publikasi
                     </button>
                     <button className="btn btn-ghost" onClick={() => setView('configurator')}>&larr; Kembali</button>
                </div>
            </div>

            <div role="tablist" className="tabs tabs-lifted">
                <a role="tab" className={`tab ${activeTab === 'parameters' ? 'tab-active' : ''}`} onClick={() => setActiveTab('parameters')}>Parameters</a>
                <a role="tab" className={`tab ${activeTab === 'components' ? 'tab-active' : ''}`} onClick={() => setActiveTab('components')}>Components (BOM)</a>
                <a role="tab" className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('settings')}>Constants & Test</a>
            </div>
            <div className="bg-base-100 p-6 rounded-b-box rounded-tr-box shadow-lg">
                {activeTab === 'parameters' && (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Parameters (Input untuk Sales)</h2>
                        <p className="text-sm text-gray-500 mb-4">Definisikan input yang akan diisi oleh tim sales.</p>
                        <div className="overflow-x-auto">
                            <table className="table table-xs">
                                <thead><tr><th>Code</th><th>Label</th><th>Tipe</th><th>Satuan</th><th></th></tr></thead>
                                <tbody>
                                    {parameters.map((param, index) => (
                                        <tr key={param.id}>
                                            <td><input type="text" name="code" value={param.code} onChange={e => handleParamChange(index, e)} className="input input-bordered input-xs w-full"/></td>
                                            <td><input type="text" name="label" value={param.label} onChange={e => handleParamChange(index, e)} className="input input-bordered input-xs w-full"/></td>
                                            <td><select name="type" value={param.type} onChange={e => handleParamChange(index, e)} className="select select-bordered select-xs w-full"><option value="number">Angka</option><option value="text">Teks</option></select></td>
                                            <td><input type="text" name="unit" value={param.unit} onChange={e => handleParamChange(index, e)} className="input input-bordered input-xs w-full"/></td>
                                            <td><button className="btn btn-xs btn-error" onClick={() => handleRemoveParam(index)}>&times;</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="btn btn-sm btn-outline mt-4" onClick={handleAddParam}>+ Tambah Parameter</button>
                    </div>
                )}
                {activeTab === 'components' && (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Components (Bill of Materials)</h2>
                        <p className="text-sm text-gray-500 mb-4">Pilih komponen dan tulis formula kuantitasnya.</p>
                        <div className="overflow-x-auto">
                            <table className="table table-xs">
                                <thead><tr><th className="w-2/5">Nama Komponen</th><th className="w-3/5">Formula Kuantitas</th><th></th></tr></thead>
                                <tbody>
                                    {components.map((comp, index) => (
                                        <tr key={comp.id}>
                                            <td><ProductSearchSelect products={productList} value={comp.productId} onChange={(p) => handleComponentSelect(index, p)} placeholder="Cari nama atau SKU..."/></td>
                                            <td><input type="text" name="qty_expression" value={comp.qty_expression} onChange={(e) => handleCompChange(index, 'qty_expression', e.target.value)} className="input input-bordered input-xs w-full font-mono"/></td>
                                            <td><button className="btn btn-xs btn-error" onClick={() => handleRemoveComp(index)}>&times;</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="btn btn-sm btn-outline mt-4" onClick={handleAddComp}>+ Tambah Komponen</button>
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Constants</h2>
                            <p className="text-sm text-gray-500 mb-4">Nilai tetap untuk formula.</p>
                            <div className="space-y-2">
                                {constants.map((c, index) => (
                                    <div key={c.id} className="flex items-center gap-2">
                                        <input type="text" name="key" value={c.key} onChange={e => handleConstChange(index, e)} className="input input-bordered input-xs flex-1" placeholder="Nama Konstanta"/>
                                        <input type="text" name="value" value={c.value} onChange={e => handleConstChange(index, e)} className="input input-bordered input-xs flex-1" placeholder="Nilai"/>
                                        <button className="btn btn-xs btn-error" onClick={() => handleRemoveConst(index)}>&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-sm btn-outline mt-4" onClick={handleAddConst}>+ Tambah Konstanta</button>
                        </div>
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">Test Panel</h2>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {parameters.map(param => (
                                        <div key={param.id} className="form-control">
                                            <label className="label py-1"><span className="label-text">{param.label || param.code}</span></label>
                                            <input type="number" placeholder="Nilai..." className="input input-bordered input-sm" onChange={(e) => handleTestParamChange(param.code, e.target.value)}/>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-sm btn-secondary mt-4 w-full" onClick={runTest}>Jalankan Tes</button>
                                {testResult && (
                                    <div className="mt-4">
                                        <h4 className="font-bold">Hasil Tes:</h4>
                                        {testResult.warnings.length > 0 && <div className="alert alert-warning text-xs p-2 mt-2">{testResult.warnings.map((w, i) => <div key={i}>{w}</div>)}</div>}
                                        <ul className="list-disc list-inside text-sm mt-2">
                                            {testResult.resolvedComponents.map((rc, i) => (
                                                <li key={i}><strong>{rc.name || rc.sku}:</strong> {rc.qty} {rc.unit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateEditorPage;
