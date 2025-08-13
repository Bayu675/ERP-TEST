// File: src/api/apiService.js
// Pusat untuk semua panggilan API ke backend.

const API_URL = 'http://localhost:3000/api'; // URL dasar backend Anda

const getAuthHeaders = () => {
    const token = localStorage.getItem('erp_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const apiLogin = (username, password) => {
    return fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
};

export const apiGetMyProfile = () => {
    return fetch(`${API_URL}/users/me`, {
        headers: getAuthHeaders()
    });
};

export const apiGetPartners = () => {
    return fetch(`${API_URL}/partners`, {
        headers: getAuthHeaders()
    });
};

// --- FUNGSI API BARU ---
export const apiGetProducts = () => {
    return fetch(`${API_URL}/products`, {
        headers: getAuthHeaders()
    });
};

export const apiGetQuotations = () => {
    return fetch(`${API_URL}/quotations`, {
        headers: getAuthHeaders()
    });
};

// --- FUNGSI API BARU ---
export const apiGetSalesOrders = () => {
    return fetch(`${API_URL}/sales-orders`, {
        headers: getAuthHeaders()
    });
};

export const apiGetWorkOrders = () => {
    return fetch(`${API_URL}/work-orders`, {
        headers: getAuthHeaders()
    });
};

export const apiCreateWorkOrderFromSO = (salesOrderId) => {
    return fetch(`${API_URL}/sales-orders/${salesOrderId}/create-work-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
};

// --- FUNGSI API BARU ---
export const apiGetDeliveryOrders = () => {
    return fetch(`${API_URL}/delivery-orders`, { // Asumsi endpoint ini akan kita buat
        headers: getAuthHeaders()
    });
};

export const apiCreateDeliveryOrder = (payload) => {
    return fetch(`${API_URL}/delivery-orders`, { // Asumsi endpoint ini akan kita buat
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
};

// --- FUNGSI API BARU ---
export const apiGetPartnerGroups = () => {
    return fetch(`${API_URL}/partner-groups`, {
        headers: getAuthHeaders()
    });
};

export const apiCreatePartnerGroup = (groupData) => {
    return fetch(`${API_URL}/partner-groups`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(groupData),
    });
};

export const apiUpdatePartnerGroup = (id, groupData) => {
    return fetch(`${API_URL}/partner-groups/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(groupData),
    });
};

export const apiDeletePartnerGroup = (id) => {
    return fetch(`${API_URL}/partner-groups/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
};



export const apiCreatePartner = (partnerData) => {
    return fetch(`${API_URL}/partners`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(partnerData),
    });
};

export const apiUpdatePartner = (id, partnerData) => {
    return fetch(`${API_URL}/partners/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(partnerData),
    });
};

export const apiDeletePartner = (id) => {
    return fetch(`${API_URL}/partners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
};

export const apiCreateQuotation = (quotationData) => {
    return fetch(`${API_URL}/quotations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(quotationData),
    });
};

export const apiGetSalesmen = () => {
    // Kita ambil semua user yang perannya bukan admin
    return fetch(`${API_URL}/users?role[ne]=admin`, {
        headers: getAuthHeaders()
    });
};

export const apiCreateUser = (userData) => {
    return fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
};

export const apiUpdateUser = (id, userData) => {
    // Note: Backend route for updating user might need to be created/checked
    // For now, we assume a PUT /api/users/:id endpoint exists
    return fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
};

export const apiGetQuotationById = (id) => {
    return fetch(`${API_URL}/quotations/${id}`, {
        headers: getAuthHeaders(),
    });
};

export const apiUpdateQuotation = (id, quotationData) => {
    return fetch(`${API_URL}/quotations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(quotationData),
    });
};

export const apiGetProductById = (id) => {
    return fetch(`${API_URL}/products/${id}`, {
        headers: getAuthHeaders(),
    });
};

export const apiGetProductInventory = (productId) => {
    return fetch(`${API_URL}/products/${productId}/inventory`, {
        headers: getAuthHeaders(),
    });
};

export const apiUpdateProduct = (id, productData) => {
    return fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
    });
};

export const apiDeleteProduct = (id) => {
    return fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE', // Ini akan memicu soft delete (arsip) di backend
        headers: getAuthHeaders(),
    });
};

export const apiCreateProduct = (productData) => {
    return fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
    });
};

// Fungsi untuk mengambil data master
export const apiGetCategories = () => {
    return fetch(`${API_URL}/master/categories`, { headers: getAuthHeaders() });
};

export const apiGetUoMs = () => {
    return fetch(`${API_URL}/master/uoms`, { headers: getAuthHeaders() });
};

export const apiGetBrands = () => {
    // Asumsi endpoint ini akan kita buat di masterData.routes.js
    return fetch(`${API_URL}/master/brands`, { headers: getAuthHeaders() });
};

export const apiGetSubCategories = () => {
    // Asumsi endpoint ini akan kita buat di masterData.routes.js
    return fetch(`${API_URL}/master/subcategories`, { headers: getAuthHeaders() });
};

export const apiCreateCategory = (data) => {
    return fetch(`${API_URL}/master/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const apiCreateSubCategory = (data) => {
    return fetch(`${API_URL}/master/subcategories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const apiCreateBrand = (data) => {
    return fetch(`${API_URL}/master/brands`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const apiCreateUoM = (data) => {
    return fetch(`${API_URL}/master/uoms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
};

export const apiCreateInventoryLot = (lotData) => {
    return fetch(`${API_URL}/inventory/lots`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(lotData),
    });
};

export const apiAdjustStock = (productId, adjustmentData) => {
    return fetch(`${API_URL}/products/${productId}/inventory/adjust`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adjustmentData),
    });
};

// --- FUNGSI BARU UNTUK PRODUCT CONFIGURATOR ---

export const apiGetConfigTemplates = () => {
    return fetch(`${API_URL}/config_templates`, {
        headers: getAuthHeaders(),
    });
};

export const apiCreateConfigTemplate = (templateData) => {
    return fetch(`${API_URL}/config_templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templateData),
    });
};

export const apiCreateTemplateVersion = (templateId, versionData) => {
    return fetch(`${API_URL}/config_templates/${templateId}/versions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(versionData),
    });
};

export const apiGetTemplateVersionById = (versionId) => {
    return fetch(`${API_URL}/template_versions/${versionId}`, {
        headers: getAuthHeaders(),
    });
};

// Fungsi ini akan kita gunakan untuk mengetahui produk mana saja yang bisa dikonfigurasi
export const apiGetProductLinks = () => {
    // Kita perlu membuat endpoint ini di backend nanti
    return fetch(`${API_URL}/product-links`, { 
        headers: getAuthHeaders(),
    });
};