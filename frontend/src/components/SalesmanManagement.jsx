// File: src/components/SalesmanManagement.jsx (Layout Diperbaiki)

import React, { useState, useEffect } from 'react';
import { apiGetSalesmen, apiCreateUser, apiUpdateUser } from '../api/apiService';

const SalesmanManagement = () => {
    const [salesmen, setSalesmen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await apiGetSalesmen();
            if (!res.ok) throw new Error('Gagal memuat data salesman');
            const data = await res.json();
            setSalesmen(data.data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (user = null) => {
        setError('');
        setNotification('');
        if (user) {
            setIsEditing(true);
            setCurrentUser({ id: user.id, username: user.username, role: user.role, status: user.status, password: '' });
        } else {
            setIsEditing(false);
            setCurrentUser({ id: null, username: '', password: '', role: 'sales', status: 'active' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                username: currentUser.username,
                role: currentUser.role,
                status: currentUser.status,
            };
            if (currentUser.password) {
                payload.password = currentUser.password;
            }

            const res = isEditing
                ? await apiUpdateUser(currentUser.id, payload)
                : await apiCreateUser(payload);
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Terjadi kesalahan');
            }
            setNotification(isEditing ? 'Data salesman berhasil diperbarui.' : 'Salesman baru berhasil ditambahkan.');
            handleCloseModal();
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;

    return (
        <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manajemen Salesman</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + Tambah Salesman
                </button>
            </div>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Peran</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesmen.map(s => (
                            <tr key={s.id}>
                                <td>{s.username}</td>
                                <td><div className="badge badge-ghost">{s.role}</div></td>
                                <td>
                                    <div className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                        {s.status}
                                    </div>
                                </td>
                                <td className="space-x-2">
                                    <button className="btn btn-sm btn-outline btn-info" onClick={() => handleOpenModal(s)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit Salesman' : 'Tambah Salesman Baru'}</h3>
                        {/* --- PERBAIKAN LAYOUT DIMULAI DI SINI --- */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label"><span className="label-text">Username</span></label>
                                <input type="text" name="username" value={currentUser.username} onChange={handleInputChange} className="input input-bordered col-span-2" required disabled={isEditing} />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label"><span className="label-text">Password</span></label>
                                <input type="password" name="password" value={currentUser.password} onChange={handleInputChange} className="input input-bordered col-span-2" placeholder={isEditing ? 'Isi untuk reset' : 'Wajib diisi'} required={!isEditing} />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label"><span className="label-text">Peran</span></label>
                                <select name="role" value={currentUser.role} onChange={handleInputChange} className="select select-bordered col-span-2" required>
                                    <option value="sales">Sales</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                             <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label"><span className="label-text">Status Akun</span></label>
                                <select name="status" value={currentUser.status} onChange={handleInputChange} className="select select-bordered col-span-2" required>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                            <div className="modal-action mt-6">
                                <button type="button" className="btn" onClick={handleCloseModal}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading && <span className="loading loading-spinner"></span>}
                                    Simpan
                                </button>
                            </div>
                        </form>
                        {/* --- AKHIR PERBAIKAN LAYOUT --- */}
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default SalesmanManagement;
