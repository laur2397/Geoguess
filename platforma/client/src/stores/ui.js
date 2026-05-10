import { defineStore } from 'pinia';

let id = 0;

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    settings: {},
  }),
  actions: {
    toast(message, type = 'info', timeout = 3500) {
      const t = { id: ++id, message, type };
      this.toasts.push(t);
      setTimeout(() => {
        this.toasts = this.toasts.filter((x) => x.id !== t.id);
      }, timeout);
    },
    success(msg) { this.toast(msg, 'success'); },
    error(msg) { this.toast(msg, 'error', 5000); },
    setSettings(s) { this.settings = s || {}; },
  },
});
