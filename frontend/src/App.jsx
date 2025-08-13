// File: src/App.jsx (Routing untuk Detail Produk)

import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PartnersPage from './pages/PartnersPage';
import ProductsPage from './pages/ProductsPage';
import QuotationsPage from './pages/QuotationsPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import CreateQuotationPage from './pages/CreateQuotationPage';
import EditQuotationPage from './pages/EditQuotationPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import TemplateEditorPage from './pages/TemplateEditorPage'; // Impor Halaman Baru

function App() {
    const { isAuthenticated, loading } = useAuth();
    const [view, setView] = useState('dashboard');
    
    const [editingQuotationId, setEditingQuotationId] = useState(null);
    const [viewingProductId, setViewingProductId] = useState(null);
    const [editingTemplateId, setEditingTemplateId] = useState(null); // State Baru

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-infinity loading-lg"></span></div>;
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <DashboardPage />;
            case 'partners':
                return <PartnersPage />;
            case 'products':
                // 3. Kirim fungsi setViewingProductId
                return <ProductsPage setView={setView} setViewingProductId={setViewingProductId} />;
            case 'quotations':
                return <QuotationsPage setView={setView} setEditingQuotationId={setEditingQuotationId} />;
            case 'salesOrders':
                return <SalesOrdersPage />;
            case 'workOrders':
                return <WorkOrdersPage />;
            case 'createQuotation':
                return <CreateQuotationPage setView={setView} />;
            case 'editQuotation':
                return <EditQuotationPage setView={setView} quotationId={editingQuotationId} />;
            case 'productDetail':
                return <ProductDetailPage setView={setView} productId={viewingProductId} />;
            case 'configurator':
                return <ConfiguratorPage setView={setView} setEditingTemplateId={setEditingTemplateId} />;
            case 'templateEditor': // Tambahkan Case Baru
                return <TemplateEditorPage setView={setView} templateId={editingTemplateId} />;
                default:
        }
    };

    return (
        <Layout setView={setView} currentView={view}>
            {renderView()}
        </Layout>
    );
}

export default App;
