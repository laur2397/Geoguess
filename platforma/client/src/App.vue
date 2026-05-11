<template>
  <div class="app-root">
    <Navbar v-if="auth.isAuthenticated" />
    <main class="main" :class="{ 'with-nav': auth.isAuthenticated }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ToastHost />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useUiStore } from './stores/ui';
import { api } from './api';
import Navbar from './components/Navbar.vue';
import ToastHost from './components/ToastHost.vue';

const auth = useAuthStore();
const ui = useUiStore();

onMounted(async () => {
  if (auth.token) {
    await auth.fetchMe();
  }
  try {
    const { settings } = await api.getSettings();
    ui.setSettings(settings);
    if (settings.theme_color) {
      document.documentElement.style.setProperty('--color-primary', settings.theme_color);
    }
    if (settings.school_name) {
      document.title = `${settings.school_name} – Platforma Resurse`;
    }
  } catch (e) { /* noop */ }
});
</script>

<style>
.app-root { min-height: 100vh; display: flex; flex-direction: column; }
.main { flex: 1; padding: 20px; max-width: 1280px; width: 100%; margin: 0 auto; }
.main.with-nav { padding-top: 84px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
