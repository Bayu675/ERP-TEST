// File: src/pages/QuotationsPage.jsx (dengan Tombol Edit & Manajemen Status)

import React, { useState, useEffect } from 'react';
import { apiGetQuotations, apiUpdateQuotation } from '../api/apiService';

// Terima `setView` dan `setEditingQuotationId` sebagai props
const QuotationsPage = ({ setView, setEditingQuotationId }) => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const res = await apiGetQuotations();
            if (!res.ok) throw new Error('Gagal memuat data penawaran');
            const data = await res.json();
            setQuotations(data.data.quotations);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const handleEdit = (id) => {
        setEditingQuotationId(id); // Simpan ID penawaran yang akan diedit
        setView('editQuotation'); // Pindah ke halaman edit
    };

    // --- FUNGSI BARU UNTUK MANAJEMEN STATUS ---
    const handleStatusChange = async (id, newStatus) => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`)) return;
        
        try {
            const res = await apiUpdateQuotation(id, { status: newStatus });
            if (!res.ok) throw new Error('Gagal memperbarui status');
            // Muat ulang data untuk melihat perubahan
            fetchQuotations();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Manajemen Penawaran</h1>
                <button className="btn btn-primary" onClick={() => setView('createQuotation')}>
                    + Buat Penawaran Baru
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Nomor Penawaran</th>
                            <th>Pelanggan</th>
                            <th>Salesperson</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Aksi</th> {/* Kolom Baru */}
                        </tr>
                    </thead>
                    <tbody>
                        {quotations.map(q => (
                            <tr key={q.id}>
                                <td><span className="font-mono">{q.quotationNumber}</span></td>
                                <td>{q.customer.name}</td>
                                <td>{q.salesperson.username}</td>
                                <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(q.grandTotal)}</td>
                                <td>
                                    {/* Dropdown Status */}
                                    <select 
                                        className="select select-bordered select-xs" 
                                        value={q.status}
                                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="SENT">Sent</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="CONVERTED">Converted</option>
                                    </select>
                                </td>
                                <td className="space-x-2">
                                    {/* Tombol Edit Baru */}
                                    <button className="btn btn-sm btn-outline btn-info" onClick={() => handleEdit(q.id)}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotationsPage;
