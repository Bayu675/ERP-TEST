// File: src/pages/ConfiguratorPage.jsx (Tata Letak Diperbaiki)

import React, { useState, useEffect } from 'react';
import { apiGetConfigTemplates, apiCreateConfigTemplate } from '../api/apiService';

const ConfiguratorPage = ({ setView, setEditingTemplateId }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    // State untuk modal tambah template
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: '', description: '' });

    const handleEdit = (id) => {
        setEditingTemplateId(id);
        setView('templateEditor');
    };

    const handleCreateNew = () => {
        setEditingTemplateId('new'); // Gunakan 'new' sebagai penanda
        setView('templateEditor');
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await apiGetConfigTemplates();
            if (!res.ok) throw new Error('Gagal memuat template konfigurasi');
            const data = await res.json();
            setTemplates(data.data.templates);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleOpenModal = () => {
        setError('');
        setNewTemplate({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTemplate(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await apiCreateConfigTemplate(newTemplate);
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal membuat template');
            setNotification('Template baru berhasil dibuat.');
            handleCloseModal();
            await fetchTemplates(); // Muat ulang daftar
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Product Configurator</h1>
                <button className="btn btn-primary" onClick={handleCreateNew}>
                    + Buat Template Baru
                </button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {notification && <div className="alert alert-success mb-4">{notification}</div>}

            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Nama Template</th>
                            <th>Deskripsi</th>
                            <th>Versi Aktif</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.length > 0 ? (
                            templates.map(template => (
                                <tr key={template.id}>
                                    <td className="font-bold">{template.name}</td>
                                    <td>{template.description}</td>
                                    <td>
                                        {/* Logika untuk versi akan ditambahkan nanti */}
                                        <span className="badge badge-accent">v{template.versions?.length || 0}</span>
                                    </td>
                                    <td>
                                    <button className="btn btn-sm btn-outline btn-info" onClick={() => handleEdit(template.id)}>Edit</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">Belum ada template konfigurasi.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal untuk membuat template baru */}
            {isModalOpen && (
                <dialog className="modal modal-open">
                    <form onSubmit={handleSubmit} className="modal-box">
                        <h3 className="font-bold text-lg">Buat Template Konfigurasi Baru</h3>
                        {/* --- PERBAIKAN TATA LETAK DIMULAI DI SINI --- */}
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="label col-span-1"><span className="label-text">Nama Template</span></label>
                                <input type="text" name="name" value={newTemplate.name} onChange={handleInputChange} className="input input-bordered col-span-2" required />
                            </div>
                            <div className="grid grid-cols-3 items-start gap-4">
                                <label className="label col-span-1 pt-2"><span className="label-text">Deskripsi</span></label>
                                <textarea name="description" value={newTemplate.description} onChange={handleInputChange} className="textarea textarea-bordered col-span-2"></textarea>
                            </div>
                        </div>
                        {/* --- AKHIR PERBAIKAN TATA LETAK --- */}
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={handleCloseModal}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading && <span className="loading loading-spinner"></span>}
                                Simpan
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default ConfiguratorPage;
