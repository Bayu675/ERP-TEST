// File: src/pages/SalesOrdersPage.jsx (BARU)
// Halaman untuk menampilkan daftar pesanan penjualan.

import React, { useState, useEffect } from 'react';
import { apiGetSalesOrders, apiCreateWorkOrderFromSO } from '../api/apiService';

const SalesOrdersPage = () => {
    const [salesOrders, setSalesOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    const fetchSalesOrders = async () => {
        try {
            setLoading(true);
            const res = await apiGetSalesOrders();
            if (!res.ok) throw new Error('Gagal memuat data pesanan penjualan');
            const data = await res.json();
            setSalesOrders(data.data.salesOrders);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesOrders();
    }, []);

    // --- FUNGSI BARU UNTUK MEMBUAT SPK ---
    const handleCreateWorkOrder = async (soId) => {
        setNotification('');
        setError('');
        if (!confirm('Apakah Anda yakin ingin membuat SPK untuk pesanan ini? Stok komponen akan dikurangi.')) {
            return;
        }
        try {
            const res = await apiCreateWorkOrderFromSO(soId);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Gagal membuat SPK');
            }
            setNotification(data.message);
            // Muat ulang data untuk melihat perubahan status
            fetchSalesOrders();
        } catch (err) {
            setError(err.message);
        }
    };
    // --- AKHIR FUNGSI BARU ---

    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Manajemen Pesanan Penjualan</h1>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Nomor SO</th>
                            <th>Pelanggan</th>
                            <th>Salesperson</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesOrders.map(so => (
                            <tr key={so.id}>
                                <td><span className="font-mono">{so.salesOrderNumber}</span></td>
                                <td>{so.customer.name}</td>
                                <td>{so.salesperson.username}</td>
                                <td>Rp {new Intl.NumberFormat('id-ID').format(so.grandTotal)}</td>
                                <td><div className={`badge ${so.status === 'IN_PRODUCTION' ? 'badge-warning' : 'badge-accent'}`}>{so.status}</div></td>
                                <td>
                                    {/* --- TOMBOL BARU --- */}
                                    {so.status === 'CONFIRMED' && (
                                        <button 
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleCreateWorkOrder(so.id)}
                                        >
                                            Buat SPK
                                        </button>
                                    )}
                                    {/* --- AKHIR TOMBOL BARU --- */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesOrdersPage;