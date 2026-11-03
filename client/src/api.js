const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '') + '/api';

function getAuthHeader() {
  const token = localStorage.getItem('noir_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/login')) {
      // Clear expired admin credentials and broadcast session expiry
      if (localStorage.getItem('noir_admin_token')) {
        localStorage.removeItem('noir_admin_token');
        localStorage.removeItem('noir_admin_user');
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: data.message || 'Sesi telah berakhir' }));
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(username, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      localStorage.setItem('noir_admin_token', res.token);
      localStorage.setItem('noir_admin_user', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe() {
    return request('/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout() {
    localStorage.removeItem('noir_admin_token');
    localStorage.removeItem('noir_admin_user');
  },

  getStoredUser() {
    try {
      const stored = localStorage.getItem('noir_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Menu
  async getCategories() {
    return request('/menu/categories');
  },

  async addCategory(name, sort_order) {
    return request('/menu/categories', {
      method: 'POST',
      body: JSON.stringify({ name, sort_order }),
    });
  },

  async getMenuItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/menu/items${query ? `?${query}` : ''}`);
  },

  async addMenuItem(itemData) {
    return request('/menu/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async updateMenuItem(id, itemData) {
    return request(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  async toggleMenuItemStock(id) {
    return request(`/menu/items/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async deleteMenuItem(id) {
    return request(`/menu/items/${id}`, {
      method: 'DELETE',
    });
  },

  // Tables
  async getTables() {
    return request('/tables');
  },

  async addTable(data) {
    return request('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteTable(id) {
    return request(`/tables/${id}`, {
      method: 'DELETE',
    });
  },

  async validateTable(table, token) {
    const query = new URLSearchParams({ table, ...(token ? { token } : {}) }).toString();
    return request(`/tables/validate?${query}`);
  },

  async callWaiter(tableNumber, callType = 'BANTUAN', note = '') {
    return request('/tables/calls', {
      method: 'POST',
      body: JSON.stringify({ tableNumber, callType, note }),
    });
  },

  async getWaiterCalls() {
    return request('/tables/calls');
  },

  async resolveWaiterCall(id) {
    return request(`/tables/calls/${id}/resolve`, {
      method: 'PATCH',
    });
  },

  async resolveAllWaiterCalls() {
    return request('/tables/calls/resolve-all', {
      method: 'PATCH',
    });
  },

  // Orders
  async createOrder(orderPayload) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getMyOrders(deviceId, tableNumber) {
    const params = new URLSearchParams();
    if (deviceId) params.append('deviceId', deviceId);
    if (tableNumber) params.append('tableNumber', tableNumber);
    return request(`/orders/my-orders?${params.toString()}`);
  },

  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },

  async getOrder(id) {
    return request(`/orders/${id}`);
  },

  async updateOrderStatus(id, status, cancelReason = '') {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancelReason }),
    });
  },

  async updateOrderPayment(id, paymentStatus) {
    return request(`/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  },

  async getStats(period = 'today') {
    return request(`/orders/stats/summary?period=${encodeURIComponent(period)}`);
  },

  async downloadOrdersCsv() {
    const token = localStorage.getItem('noir_admin_token');
    const res = await fetch('/api/orders/export/csv', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal mengunduh laporan CSV');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-pesanan-lajava-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
