const API_BASE = '/api';

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

  // Orders
  async createOrder(orderPayload) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },

  async getOrder(id) {
    return request(`/orders/${id}`);
  },

  async updateOrderStatus(id, status) {
    return request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateOrderPayment(id, paymentStatus) {
    return request(`/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  },

  async getStats() {
    return request('/orders/stats/summary');
  },
};
