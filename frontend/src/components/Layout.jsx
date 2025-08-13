// File: src/components/Layout.jsx
// Komponen layout utama dengan sidebar dan header.

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children, setView, currentView }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { key: 'dashboard', label: 'Dasbor' },
        { key: 'partners', label: 'Mitra Bisnis' },
        { key: 'products', label: 'Produk' },
        { key: 'quotations', label: 'Penawaran' },
        { key: 'configurator', label: 'Product Configurator' },
        { key: 'salesOrders', label: 'Pesanan Penjualan' },
        { key: 'workOrders', label: 'Perintah Kerja (SPK)' },
        { key: 'deliveryOrders', label: 'Pengiriman' },
    ];

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center">
                {/* Header */}
                <div className="navbar bg-base-100 shadow-md w-full">
                    <div className="flex-none">
                        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                    </div>
                    <div className="flex-1">
                        <a className="btn btn-ghost text-xl">Dasbor ERP</a>
                    </div>
                    <div className="flex-none">
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
                                    <span className="text-xl">{user?.username.charAt(0).toUpperCase()}</span>
                                </div>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li><a>Profil</a></li>
                                <li><a onClick={logout}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Konten Halaman */}
                <main className="w-full p-6 bg-base-200 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-64 min-h-full bg-base-300 text-base-content">
                    <li className="text-xl font-bold p-4">ERP Nove</li>
                    {menuItems.map(item => (
                         <li key={item.key}><a className={currentView === item.key ? 'active' : ''} onClick={() => setView(item.key)}>{item.label}</a></li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Layout;