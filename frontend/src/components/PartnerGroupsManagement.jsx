// File: src/components/PartnerGroupsManagement.jsx (Tampilan Diskon Diperbaiki)

import React, { useState, useEffect } from 'react';
import { apiGetPartnerGroups, apiCreatePartnerGroup, apiUpdatePartnerGroup, apiDeletePartnerGroup } from '../api/apiService';

const PartnerGroupsManagement = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await apiGetPartnerGroups();
            if (!res.ok) throw new Error('Gagal memuat data grup');
            const data = await res.json();
            setGroups(data.data.groups);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (group = null) => {
        setError('');
        setNotification('');
        if (group) {
            setIsEditing(true);
            setCurrentGroup({ ...group });
        } else {
            setIsEditing(false);
            setCurrentGroup({ id: null, name: '', description: '', defaultDiscount: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentGroup(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...currentGroup,
                defaultDiscount: currentGroup.defaultDiscount || '0'
            };

            const res = isEditing
                ? await apiUpdatePartnerGroup(currentGroup.id, payload)
                : await apiCreatePartnerGroup(payload);
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Terjadi kesalahan');
            }
            setNotification(isEditing ? 'Grup berhasil diperbarui.' : 'Grup baru berhasil ditambahkan.');
            handleCloseModal();
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus grup ini?')) {
            try {
                const res = await apiDeletePartnerGroup(id);
                if (res.status !== 204) {
                     const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'Gagal menghapus grup');
                }
                setNotification('Grup berhasil dihapus.');
                fetchData();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // --- FUNGSI BARU UNTUK FORMAT TAMPILAN DISKON ---
    const formatDiscountDisplay = (discountString) => {
        if (!discountString || discountString.trim() === '0') return '0%';
        // Ubah "10+5" menjadi "10% + 5%"
        return discountString.split('+').map(d => `${d.trim()}%`).join(' + ');
    };

    return (
        <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manajemen Grup Mitra Bisnis</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    Tambah Grup Baru
                </button>
            </div>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            {loading ? (
                <div className="text-center"><span className="loading loading-lg"></span></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Nama Grup</th>
                                <th>Deskripsi</th>
                                <th>Diskon Default</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(g => (
                                <tr key={g.id}>
                                    <td>{g.name}</td>
                                    <td>{g.description}</td>
                                    {/* --- PERUBAHAN TAMPILAN DI SINI --- */}
                                    <td>{formatDiscountDisplay(g.defaultDiscount)}</td>
                                    <td className="space-x-2">
                                        <button className="btn btn-sm btn-outline btn-info" onClick={() => handleOpenModal(g)}>Edit</button>
                                        <button className="btn btn-sm btn-outline btn-error" onClick={() => handleDelete(g.id)}>Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit Grup' : 'Tambah Grup Baru'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1 justify-self-start"><span className="label-text">Nama Grup</span></label>
                                <input type="text" name="name" value={currentGroup.name || ''} onChange={handleInputChange} className="input input-bordered col-span-2" required />
                            </div>
                            <div className="grid grid-cols-3 items-start gap-4">
                                <label className="label col-span-1 justify-self-start pt-2"><span className="label-text">Deskripsi</span></label>
                                <textarea name="description" value={currentGroup.description || ''} onChange={handleInputChange} className="textarea textarea-bordered col-span-2"></textarea>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1 justify-self-start"><span className="label-text">Diskon</span></label>
                                <input 
                                    type="text"
                                    name="defaultDiscount" 
                                    placeholder="Contoh: 10+5 atau 12.5"
                                    value={currentGroup.defaultDiscount || ''} 
                                    onChange={handleInputChange} 
                                    className="input input-bordered col-span-2"
                                />
                            </div>
                            <div className="modal-action mt-6">
                                <button type="button" className="btn" onClick={handleCloseModal}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading && <span className="loading loading-spinner"></span>}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default PartnerGroupsManagement;
