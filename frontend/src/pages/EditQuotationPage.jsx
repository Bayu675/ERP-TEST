// File: src/pages/EditQuotationPage.jsx (BARU)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiGetPartners, apiGetProducts, apiGetSalesmen, apiGetQuotationById, apiUpdateQuotation } from '../api/apiService';
import { generateQuotationPDF } from '../utils/pdfGenerator';

const EditQuotationPage = ({ setView, quotationId }) => {
    // Data master
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    
    // Header Penawaran
    const [quotationNumber, setQuotationNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [salespersonId, setSalespersonId] = useState('');
    const [quotationDate, setQuotationDate] = useState('');
    const [notes, setNotes] = useState('');
    
    // Items Penawaran
    const [items, setItems] = useState([]);
    
    const [calculationResult, setCalculationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [editingNotesIndex, setEditingNotesIndex] = useState(null);
    const [currentNote, setCurrentNote] = useState('');

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };
    
    // Memuat semua data awal DAN data penawaran yang ada
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [customersRes, productsRes, salesmenRes, quotationRes] = await Promise.all([
                    apiGetPartners(), 
                    apiGetProducts(),
                    apiGetSalesmen(),
                    apiGetQuotationById(quotationId) // Ambil data penawaran spesifik
                ]);

                if (!customersRes.ok) throw new Error('Gagal memuat pelanggan');
                if (!productsRes.ok) throw new Error('Gagal memuat produk');
                if (!salesmenRes.ok) throw new Error('Gagal memuat salesman');
                if (!quotationRes.ok) throw new Error('Gagal memuat data penawaran');

                const customersData = await customersRes.json();
                const productsData = await productsRes.json();
                const salesmenData = await salesmenRes.json();
                const quotationData = await quotationRes.json();
                const quotation = quotationData.data.quotation;

                // Isi semua state dengan data yang ada
                setCustomers(customersData.data.partners);
                setProducts(productsData.data.products);
                setSalesmen(salesmenData.data.users);
                
                setQuotationNumber(quotation.quotationNumber);
                setCustomerId(quotation.customerId);
                setSalespersonId(quotation.salespersonId);
                setQuotationDate(new Date(quotation.quotationDate).toISOString().split('T')[0]);
                setNotes(quotation.notes || '');

                const loadedItems = quotation.items.map(item => {
                    const discountValues = item.discounts.map(d => d.discountPercentage);
                    return {
                        id: item.id,
                        productId: item.productId,
                        width: item.width,
                        height: item.height,
                        quantity: item.quantity,
                        discounts: [discountValues[0] || 0, discountValues[1] || 0, discountValues[2] || 0],
                        notes: item.notes || ''
                    };
                });
                setItems(loadedItems);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [quotationId]);

    // ... (Semua fungsi handler lainnya: handleItemChange, handleAddItem, dll. tetap sama)
    const handleItemChange = (index, event) => {
        const newItems = [...items];
        newItems[index][event.target.name] = event.target.value;
        setItems(newItems);
    };

    const handleDiscountChange = (itemIndex, discountIndex, value) => {
        const newItems = [...items];
        newItems[itemIndex].discounts[discountIndex] = parseFloat(value) || 0;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { 
            id: Date.now(), 
            productId: '', 
            width: 0, 
            height: 0, 
            quantity: 1, 
            discounts: [0,0,0], 
            notes: '' 
        }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleOpenNotesModal = (index) => {
        setEditingNotesIndex(index);
        setCurrentNote(items[index].notes || '');
        setIsNotesModalOpen(true);
    };

    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setEditingNotesIndex(null);
        setCurrentNote('');
    };

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
        
        const itemsForPayload = items.map(item => ({
            ...item,
            manualDiscount: item.discounts.filter(d => d > 0).join('+')
        }));
        
        const payload = { customerId, quotationDate, items: itemsForPayload };
        try {
            // Gunakan API update sebagai "preview" saat mengedit
            const res = await apiUpdateQuotation(quotationId, payload);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal menghitung');
            setCalculationResult(data.data.quotation);
        } catch (err) {
            console.error("Calculation Error:", err.message);
            setCalculationResult(null);
        }
    }, [customerId, quotationDate, items, quotationId]);

    useEffect(() => {
        const handler = setTimeout(() => {
            runCalculation();
        }, 500);
        return () => clearTimeout(handler);
    }, [items, runCalculation]);

    // --- LOGIKA SUBMIT SEKARANG MENGGUNAKAN API UPDATE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNotification('');
        
        const itemsForPayload = items.map(item => ({
            ...item,
            manualDiscount: item.discounts.filter(d => d > 0).join('+')
        }));
        
        const payload = { customerId, salespersonId, quotationDate, items: itemsForPayload, quotationNumber, notes };

        try {
            const res = await apiUpdateQuotation(quotationId, payload);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal memperbarui penawaran');
            
            const finalQuotationData = {
                ...data.data.quotation,
                customer: customers.find(c => c.id === parseInt(customerId))
            };
            generateQuotationPDF(finalQuotationData);

            setNotification(`Penawaran ${data.data.quotation.quotationNumber} berhasil diperbarui & dicetak!`);
            setTimeout(() => setView('quotations'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tableTotals = useMemo(() => {
        if (!calculationResult || !calculationResult.items) {
            return { totalQty: 0, totalNominal: 0 };
        }
        return calculationResult.items.reduce((acc, item) => {
            acc.totalQty += Number(item.quantity) || 0;
            acc.totalNominal += Number(item.basePrice) || 0;
            return acc;
        }, { totalQty: 0, totalNominal: 0 });
    }, [calculationResult]);

    if (loading && !calculationResult) {
        return <div className="text-center"><span className="loading loading-lg"></span></div>;
    }

    return (
        <div>
            {/* ... (Seluruh JSX form sama seperti CreateQuotationPage) ... */}
            {/* Perbedaannya hanya pada judul dan teks tombol simpan */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit Penawaran: {quotationNumber}</h1>
                <button className="btn btn-ghost" onClick={() => setView('quotations')}>&larr; Kembali</button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-6 rounded-lg shadow-lg">
                {/* ... (Form header: Pelanggan, Salesman, Tanggal) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Nomor Penawaran</span></label>
                        <input type="text" className="input input-bordered" value={quotationNumber} onChange={(e) => setQuotationNumber(e.target.value)} required />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Pelanggan</span></label>
                        <select className="select select-bordered" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                            <option value="" disabled>Pilih Pelanggan</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Salesman</span></label>
                        <select className="select select-bordered" value={salespersonId} onChange={(e) => setSalespersonId(e.target.value)} required>
                            <option value="" disabled>Pilih Salesman</option>
                            {salesmen.map(s => <option key={s.id} value={s.id}>{s.username}</option>)}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Tanggal</span></label>
                        <input type="date" className="input input-bordered" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} required />
                    </div>
                </div>

                <div className="divider">DETAIL BARANG</div>
                <div className="overflow-x-auto">
                    <table className="table table-xs w-full">
                        {/* ... (thead tabel) ... */}
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th className="w-1/3">Nama Barang</th>
                                <th>Satuan</th>
                                <th>L</th>
                                <th>T</th>
                                <th>M²</th>
                                <th>Qty</th>
                                <th>Nominal</th>
                                <th>Disc 1(%)</th>
                                <th>Disc 2(%)</th>
                                <th>Disc 3(%)</th>
                                <th>Jumlah</th>
                                <th>Ket.</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const resultItem = calculationResult?.items[index];
                                return (
                                <tr key={item.id}>
                                    <td>{resultItem?.sku || '-'}</td>
                                    <td>
                                        <select name="productId" value={item.productId} onChange={e => handleItemChange(index, e)} className="select select-bordered select-xs w-full" required>
                                            <option value="" disabled>Pilih Produk</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </td>
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
                                    <td>
                                        <button type="button" className={`btn btn-xs ${item.notes ? 'btn-success' : 'btn-ghost'}`} onClick={() => handleOpenNotesModal(index)}>+</button>
                                    </td>
                                    <td><button type="button" className="btn btn-xs btn-error" onClick={() => handleRemoveItem(index)}>&times;</button></td>
                                </tr>
                            )})}
                        </tbody>
                        {/* ... (tfoot tabel) ... */}
                        <tfoot>
                            <tr className="font-bold bg-base-200">
                                <td colSpan="6" className="text-right">Total</td>
                                <td>{tableTotals.totalQty}</td>
                                <td>{formatCurrency(tableTotals.totalNominal)}</td>
                                <td colSpan="5"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem}>+ Tambah Baris</button>

                {/* ... (Form Keterangan Umum & Rincian Total) ... */}
                <div className="flex flex-col md:flex-row justify-between items-start mt-6 gap-6">
                    <div className="w-full md:w-1/2">
                        <label className="label"><span className="label-text">Keterangan Umum</span></label>
                        <textarea className="textarea textarea-bordered w-full" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                    </div>
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
                        Perbarui & Cetak PDF
                    </button>
                </div>
            </form>

            {/* ... (Modal Keterangan Item) ... */}
            {isNotesModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Tambah/Edit Keterangan</h3>
                        <textarea
                            className="textarea textarea-bordered w-full mt-4"
                            rows="5"
                            placeholder="Masukkan keterangan untuk item ini..."
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                        ></textarea>
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

export default EditQuotationPage;
