// File: src/pages/PartnersPage.jsx (dengan Tab Manajemen Salesman)

import React, { useState, useEffect, useMemo } from 'react';
import { 
    apiGetPartners, 
    apiCreatePartner, 
    apiUpdatePartner, 
    apiDeletePartner, 
    apiGetPartnerGroups,
    apiGetSalesmen
} from '../api/apiService';
import PartnerGroupsManagement from '../components/PartnerGroupsManagement';
import SalesmanManagement from '../components/SalesmanManagement'; // Impor komponen baru

const PartnersPage = () => {
    const [activeTab, setActiveTab] = useState('partners');
    
    // Data utama
    const [partners, setPartners] = useState([]);
    const [partnerGroups, setPartnerGroups] = useState([]);
    const [salesmen, setSalesmen] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPartner, setCurrentPartner] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const [partnersRes, groupsRes, salesmenRes] = await Promise.all([
                apiGetPartners(),
                apiGetPartnerGroups(),
                apiGetSalesmen()
            ]);

            if (!partnersRes.ok) throw new Error('Gagal memuat data mitra bisnis');
            if (!groupsRes.ok) throw new Error('Gagal memuat data grup mitra bisnis');
            if (!salesmenRes.ok) throw new Error('Gagal memuat data salesman');

            const partnersData = await partnersRes.json();
            const groupsData = await groupsRes.json();
            const salesmenData = await salesmenRes.json();

            setPartners(partnersData.data.partners);
            setPartnerGroups(groupsData.data.groups);
            setSalesmen(salesmenData.data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Hanya fetch data jika tab 'partners' aktif untuk efisiensi
        if (activeTab === 'partners') {
            fetchData();
        }
    }, [activeTab]);

    const filteredPartners = useMemo(() => {
        return partners.filter(partner => {
            const nameMatch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
            const groupMatch = filterGroup ? partner.group?.id === parseInt(filterGroup) : true;
            return nameMatch && groupMatch;
        });
    }, [partners, searchTerm, filterGroup]);


    const handleOpenModal = (partner = null) => {
        setError('');
        setNotification('');
        if (partner) {
            setIsEditing(true);
            setCurrentPartner({ ...partner, partnerGroupId: partner.group?.id || '', salespersonId: partner.salesperson?.id || '' });
        } else {
            setIsEditing(false);
            setCurrentPartner({ id: null, name: '', partnerGroupId: '', email: '', phone: '', salespersonId: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPartner(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                name: currentPartner.name,
                partnerGroupId: currentPartner.partnerGroupId,
                salespersonId: currentPartner.salespersonId,
                email: currentPartner.email || null,
                phone: currentPartner.phone || null,
            };

            const res = isEditing
                ? await apiUpdatePartner(currentPartner.id, payload)
                : await apiCreatePartner(payload);

            if (!res.ok) {
                const data = await res.json();
                if (data.errors) {
                    const errorMessages = data.errors.map(err => Object.values(err)[0]);
                    throw new Error(errorMessages.join(' '));
                }
                throw new Error(data.message || 'Terjadi kesalahan');
            }
            setNotification(isEditing ? 'Mitra bisnis berhasil diperbarui.' : 'Mitra bisnis baru berhasil ditambahkan.');
            handleCloseModal();
            await fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin mengarsipkan mitra bisnis ini?')) {
            try {
                const res = await apiDeletePartner(id);
                if (res.status !== 204) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'Gagal mengarsipkan data');
                }
                setNotification('Mitra bisnis berhasil diarsipkan.');
                await fetchData();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Mitra Bisnis</h1>

            <div role="tablist" className="tabs tabs-lifted">
                <a role="tab" className={`tab ${activeTab === 'partners' ? 'tab-active' : ''}`} onClick={() => setActiveTab('partners')}>
                    Daftar Mitra Bisnis
                </a>
                <a role="tab" className={`tab ${activeTab === 'groups' ? 'tab-active' : ''}`} onClick={() => setActiveTab('groups')}>
                    Manajemen Grup
                </a>
                {/* --- TAB BARU --- */}
                <a role="tab" className={`tab ${activeTab === 'salesmen' ? 'tab-active' : ''}`} onClick={() => setActiveTab('salesmen')}>
                    Manajemen Salesman
                </a>
            </div>

            <div className="bg-base-100 p-6 rounded-b-box rounded-tr-box shadow-lg">
                {activeTab === 'partners' && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Daftar Semua Mitra</h2>
                            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                                Tambah Mitra Bisnis
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama..."
                                className="input input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="select select-bordered w-full"
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                            >
                                <option value="">Semua Grup</option>
                                {partnerGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>

                        {error && <div className="alert alert-error mb-4">{error}</div>}
                        {notification && <div className="alert alert-success mb-4">{notification}</div>}
                        
                        {loading && activeTab === 'partners' ? (
                             <div className="text-center"><span className="loading loading-lg"></span></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Nama</th>
                                            <th>Grup</th>
                                            <th>Salesman</th>
                                            <th>Email</th>
                                            <th>Telepon</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPartners.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.name}</td>
                                                <td><div className="badge badge-info">{p.group?.name || 'N/A'}</div></td>
                                                <td>{p.salesperson?.username || 'N/A'}</td>
                                                <td>{p.email}</td>
                                                <td>{p.phone}</td>
                                                <td className="space-x-2">
                                                    <button className="btn btn-sm btn-outline btn-info" onClick={() => handleOpenModal(p)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline btn-error" onClick={() => handleDelete(p.id)}>Arsipkan</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {isModalOpen && (
                            <dialog id="partner_modal" className="modal modal-open">
                                <div className="modal-box">
                                    <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit Mitra Bisnis' : 'Tambah Mitra Bisnis Baru'}</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <label className="label col-span-1"><span className="label-text">Nama</span></label>
                                            <input type="text" name="name" value={currentPartner.name} onChange={handleInputChange} className="input input-bordered col-span-2" required />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <label className="label col-span-1"><span className="label-text">Grup</span></label>
                                            <select name="partnerGroupId" value={currentPartner.partnerGroupId} onChange={handleInputChange} className="select select-bordered col-span-2" required>
                                                <option disabled value="">Pilih Grup</option>
                                                {partnerGroups.map(group => (
                                                    <option key={group.id} value={group.id}>{group.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <label className="label col-span-1"><span className="label-text">Salesman</span></label>
                                            <select name="salespersonId" value={currentPartner.salespersonId} onChange={handleInputChange} className="select select-bordered col-span-2" required>
                                                <option disabled value="">Pilih Salesman</option>
                                                {salesmen.map(s => (
                                                    <option key={s.id} value={s.id}>{s.username}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <label className="label col-span-1"><span className="label-text">Email</span></label>
                                            <input type="email" name="email" value={currentPartner.email || ''} onChange={handleInputChange} className="input input-bordered col-span-2" />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <label className="label col-span-1"><span className="label-text">Telepon</span></label>
                                            <input type="text" name="phone" value={currentPartner.phone || ''} onChange={handleInputChange} className="input input-bordered col-span-2" />
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
                    </>
                )}

                {activeTab === 'groups' && (
                    <PartnerGroupsManagement />
                )}

                {/* --- KONTEN TAB BARU --- */}
                {activeTab === 'salesmen' && (
                    <SalesmanManagement />
                )}
            </div>
        </div>
    );
};

export default PartnersPage;
