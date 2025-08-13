// File: src/pages/WorkOrdersPage.jsx (BARU)
// Halaman untuk menampilkan daftar SPK.

import React, { useState, useEffect } from 'react';
import { apiGetWorkOrders } from '../api/apiService';

const WorkOrdersPage = () => {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWorkOrders = async () => {
            try {
                const res = await apiGetWorkOrders();
                if (!res.ok) throw new Error('Gagal memuat data SPK');
                const data = await res.json();
                setWorkOrders(data.data.workOrders);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkOrders();
    }, []);

    if (loading) return <div className="text-center"><span className="loading loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Manajemen Perintah Kerja (SPK)</h1>
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Nomor SPK</th>
                            <th>Nomor SO Terkait</th>
                            <th>Tanggal Dibuat</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workOrders.map(wo => (
                            <tr key={wo.id}>
                                <td><span className="font-mono">{wo.workOrderNumber}</span></td>
                                <td><span className="font-mono">{wo.SalesOrder?.salesOrderNumber}</span></td>
                                <td>{new Date(wo.issueDate).toLocaleDateString('id-ID')}</td>
                                <td><div className="badge badge-warning">{wo.status}</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkOrdersPage;