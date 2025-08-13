// File: src/components/InventoryTab.jsx (dengan Perbaikan Modal Terima Barang)

import React, { useState, useEffect } from 'react';
import { apiGetProductInventory, apiCreateInventoryLot, apiAdjustStock } from '../api/apiService';

const InventoryTab = ({ productId, productUoM }) => {
    const [inventory, setInventory] = useState({ totalStock: 0, lots: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    // State untuk Modal Penerimaan Barang
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [newLot, setNewLot] = useState({});

    // State untuk Modal Penyesuaian Stok
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustment, setAdjustment] = useState({ newTotalQuantity: 0, reason: '' });

    const fetchInventory = async () => {
        if (!productId) return;
        try {
            setLoading(true);
            const res = await apiGetProductInventory(productId);
            if (!res.ok) throw new Error('Gagal memuat data inventaris');
            const data = await res.json();
            setInventory(data.data);
            setAdjustment(prev => ({ ...prev, newTotalQuantity: data.data.totalStock || 0 }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [productId]);

    // --- KELOMPOK FUNGSI: PENERIMAAN BARANG ---
    const handleOpenReceiveModal = () => {
        setError('');
        setNotification('');
        setNewLot({
            lotNumber: '', initialQuantity: 0,
            receivedDate: new Date().toISOString().split('T')[0], costPerUnit: 0,
        });
        setIsReceiveModalOpen(true);
    };
    const handleCloseReceiveModal = () => setIsReceiveModalOpen(false);
    const handleReceiveSubmit = async (e) => {
        e.preventDefault();
        if (!productUoM || !productUoM.id) {
            setError("Satuan (UoM) untuk produk ini belum diatur.");
            return;
        }
        try {
            setLoading(true);
            const payload = { ...newLot, productId: productId, uomId: productUoM.id };
            const res = await apiCreateInventoryLot(payload);
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal mencatat penerimaan');
            setNotification('Penerimaan barang baru berhasil dicatat.');
            handleCloseReceiveModal();
            await fetchInventory();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- KELOMPOK FUNGSI: PENYESUAIAN STOK ---
    const handleOpenAdjustModal = () => {
        setError('');
        setNotification('');
        setAdjustment({ newTotalQuantity: inventory.totalStock, reason: '' });
        setIsAdjustModalOpen(true);
    };
    const handleCloseAdjustModal = () => setIsAdjustModalOpen(false);
    const handleAdjustmentSubmit = async (e) => {
        e.preventDefault();
        if (!productUoM || !productUoM.id) {
            setError("Satuan (UoM) untuk produk ini belum diatur.");
            return;
        }
        try {
            setLoading(true);
            const payload = { ...adjustment, uomId: productUoM.id };
            const res = await apiAdjustStock(productId, payload);
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal menyesuaikan stok');
            setNotification('Stok berhasil disesuaikan.');
            handleCloseAdjustModal();
            await fetchInventory();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);

    return (
        <div>
            {notification && <div className="alert alert-success mb-4">{notification}</div>}
            {error && <div className="alert alert-error mb-4">{error}</div>}

            <div className="flex justify-between items-center mb-6">
                <div className="stats shadow bg-base-200">
                    <div className="stat">
                        <div className="stat-title">Total Stok Tersedia</div>
                        <div className="stat-value text-primary">{inventory.totalStock} {productUoM?.symbol}</div>
                        <div className="stat-desc">Dari {inventory.lots.length} batch/lot berbeda</div>
                    </div>
                </div>
                <div className="space-x-2">
                    <button className="btn btn-secondary" onClick={handleOpenAdjustModal}>Sesuaikan Stok</button>
                    <button className="btn btn-primary" onClick={handleOpenReceiveModal}>+ Terima Barang</button>
                </div>
            </div>

            <h4 className="text-lg font-bold mb-2">Rincian Lot/Batch</h4>
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Nomor Lot</th>
                            <th>Kuantitas Saat Ini</th>
                            <th>Tanggal Diterima</th>
                            <th>Biaya per Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.lots.length > 0 ? (
                            inventory.lots.map(lot => (
                                <tr key={lot.id}>
                                    <td>{lot.lotNumber}</td>
                                    <td>{lot.currentQuantity} {productUoM?.symbol}</td>
                                    <td>{new Date(lot.receivedDate).toLocaleDateString('id-ID')}</td>
                                    <td>{formatCurrency(lot.costPerUnit)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">Belum ada data lot untuk produk ini.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL PENERIMAAN BARANG (DIPERBAIKI) --- */}
            {isReceiveModalOpen && (
                <dialog className="modal modal-open">
                    <form onSubmit={handleReceiveSubmit} className="modal-box">
                        <h3 className="font-bold text-lg">Catat Penerimaan Barang Baru</h3>
                        {/* --- PERBAIKAN TATA LETAK DIMULAI DI SINI --- */}
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Nomor Lot</span></label>
                                <input type="text" name="lotNumber" value={newLot.lotNumber || ''} onChange={handleInputChange(setNewLot)} className="input input-bordered col-span-2" required />
                            </div>
                             <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Kuantitas</span></label>
                                <input type="number" name="initialQuantity" value={newLot.initialQuantity || 0} onChange={handleInputChange(setNewLot)} className="input input-bordered col-span-2" required />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Tanggal</span></label>
                                <input type="date" name="receivedDate" value={newLot.receivedDate || ''} onChange={handleInputChange(setNewLot)} className="input input-bordered col-span-2" required />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Harga Beli</span></label>
                                <input type="number" name="costPerUnit" value={newLot.costPerUnit || 0} onChange={handleInputChange(setNewLot)} className="input input-bordered col-span-2" required />
                            </div>
                        </div>
                        {/* --- AKHIR PERBAIKAN TATA LETAK --- */}
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={handleCloseReceiveModal}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading && <span className="loading loading-spinner"></span>}
                                Simpan
                            </button>
                        </div>
                    </form>
                </dialog>
            )}

            {/* Modal Penyesuaian Stok */}
            {isAdjustModalOpen && (
                <dialog className="modal modal-open">
                    <form onSubmit={handleAdjustmentSubmit} className="modal-box">
                        <h3 className="font-bold text-lg">Penyesuaian Stok</h3>
                        <p className="py-2 text-sm">Masukkan total kuantitas fisik yang ada di gudang saat ini. Sistem akan menghitung selisihnya secara otomatis.</p>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Kuantitas Baru</span></label>
                                <input 
                                    type="number" 
                                    name="newTotalQuantity" 
                                    value={adjustment.newTotalQuantity} 
                                    onChange={handleInputChange(setAdjustment)}
                                    className="input input-bordered col-span-2" 
                                    required 
                                />
                            </div>
                             <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Alasan</span></label>
                                <textarea 
                                    name="reason"
                                    value={adjustment.reason}
                                    onChange={handleInputChange(setAdjustment)}
                                    className="textarea textarea-bordered col-span-2"
                                    placeholder="Contoh: Hasil Stock Opname"
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={handleCloseAdjustModal}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading && <span className="loading loading-spinner"></span>}
                                Simpan Penyesuaian
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default InventoryTab;
