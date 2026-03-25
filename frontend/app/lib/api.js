// API Client for connecting frontend to backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.token = null;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, detail: data.detail || 'Request failed' };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      console.error('API Error:', error);
      throw { status: 0, detail: 'Network error. Backend may not be running.' };
    }
  }

  // Auth
  async sendOtp(phone) {
    return this.request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
  }

  async verifyOtp(phone, code) {
    return this.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code }) });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  userLogout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_phone');
    }
  }

  isUserLoggedIn() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }

  // Admin Auth
  async adminLogin(username, password) {
    const data = await this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_user', JSON.stringify({
          id: data.user_id,
          username: data.username,
          role: data.role,
        }));
      }
    }
    return data;
  }

  adminLogout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_user');
    }
  }

  isAdminLoggedIn() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('admin_user');
    if (!token || !user) return false;
    try {
      const parsed = JSON.parse(user);
      return parsed.role === 'admin';
    } catch {
      return false;
    }
  }

  getAdminUser() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('admin_user'));
    } catch {
      return null;
    }
  }

  // Bloggers
  async getBloggers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bloggers?${query}`);
  }

  async getBlogger(id) {
    return this.request(`/bloggers/${id}`);
  }

  async registerBlogger(data) {
    return this.request('/bloggers', { method: 'POST', body: JSON.stringify(data) });
  }

  async getLeaderboard(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bloggers/leaderboard/top?${query}`);
  }

  // Voting
  async castVote(data) {
    return this.request('/votes', { method: 'POST', body: JSON.stringify(data) });
  }

  async getMyVotes() {
    return this.request('/votes/my-votes');
  }

  async canVote(bloggerId) {
    return this.request(`/votes/can-vote/${bloggerId}`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(slug) {
    return this.request(`/categories/${slug}`);
  }

  async createCategory(data) {
    const params = new URLSearchParams(data).toString();
    return this.request(`/categories?${params}`, { method: 'POST' });
  }

  async updateCategory(id, data) {
    const params = new URLSearchParams(data).toString();
    return this.request(`/categories/${id}?${params}`, { method: 'PUT' });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Admin
  async getDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminBloggers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/bloggers?${query}`);
  }

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  async approveBlogger(id) {
    return this.request(`/admin/bloggers/${id}/approve`, { method: 'PUT' });
  }

  async rejectBlogger(id) {
    return this.request(`/admin/bloggers/${id}/reject`, { method: 'PUT' });
  }

  async blockBlogger(id) {
    return this.request(`/admin/bloggers/${id}/block`, { method: 'PUT' });
  }

  async getAdminVotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/votes?${query}`);
  }

  async cancelVote(id) {
    return this.request(`/admin/votes/${id}`, { method: 'DELETE' });
  }

  async blockUser(id) {
    return this.request(`/admin/users/${id}/block`, { method: 'PUT' });
  }

  async unblockUser(id) {
    return this.request(`/admin/users/${id}/unblock`, { method: 'PUT' });
  }

  async getAdminPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/payments?${query}`);
  }

  async getAdminLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/logs?${query}`);
  }

  async getAdminSettings() {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(data) {
    return this.request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Sponsors
  async getSponsors() {
    return this.request('/sponsors');
  }

  async getAllSponsors() {
    return this.request('/sponsors/all');
  }

  async createSponsor(data) {
    const params = new URLSearchParams(data).toString();
    return this.request(`/sponsors?${params}`, { method: 'POST' });
  }

  async updateSponsor(id, data) {
    const params = new URLSearchParams(data).toString();
    return this.request(`/sponsors/${id}?${params}`, { method: 'PUT' });
  }

  async deleteSponsor(id) {
    return this.request(`/sponsors/${id}`, { method: 'DELETE' });
  }
}

const api = new ApiClient();
export default api;
