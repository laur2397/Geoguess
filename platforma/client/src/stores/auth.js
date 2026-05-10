import { defineStore } from 'pinia';
import { api } from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    role: (s) => s.user?.role,
    isAdmin: (s) => s.user?.role === 'admin',
    isTeacher: (s) => s.user?.role === 'profesor',
    isStudent: (s) => s.user?.role === 'elev',
    fullName: (s) => s.user ? `${s.user.first_name} ${s.user.last_name}` : '',
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      try {
        const { token, user } = await api.login(email, password);
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
      } finally {
        this.loading = false;
      }
    },
    async register(data) {
      this.loading = true;
      try {
        const { token, user } = await api.register(data);
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      if (!this.token) return;
      try {
        const { user } = await api.me();
        this.user = user;
      } catch (e) {
        this.logout();
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
