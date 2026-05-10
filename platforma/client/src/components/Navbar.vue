<template>
  <header class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="brand">
        <span class="logo">📚</span>
        <span class="name">{{ schoolName }}</span>
      </router-link>

      <button class="menu-toggle" @click="mobileOpen = !mobileOpen" aria-label="Meniu">
        <span></span><span></span><span></span>
      </button>

      <nav class="nav-links" :class="{ open: mobileOpen }" @click="mobileOpen = false">
        <router-link to="/" exact-active-class="active">Acasă</router-link>
        <router-link to="/resurse" active-class="active">Resurse</router-link>
        <router-link to="/teme" active-class="active">Teme</router-link>
        <router-link to="/progres" active-class="active">Progres</router-link>
        <router-link v-if="auth.isAdmin" to="/utilizatori" active-class="active">Utilizatori</router-link>
        <router-link to="/setari" active-class="active">Setări</router-link>
      </nav>

      <div class="user-area" :class="{ open: mobileOpen }">
        <div class="user-info">
          <div class="user-name">{{ auth.fullName }}</div>
          <div class="user-role">
            <span class="badge">{{ roleLabel }}</span>
            <span v-if="auth.user?.class_name" class="muted small">{{ auth.user.class_name }}</span>
          </div>
        </div>
        <button class="btn ghost sm" @click="logout">Ieșire</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';

const auth = useAuthStore();
const ui = useUiStore();
const router = useRouter();
const mobileOpen = ref(false);

const schoolName = computed(() => ui.settings.school_name || 'Platforma Resurse');
const roleLabel = computed(() => {
  const map = { admin: 'Administrator', profesor: 'Profesor', elev: 'Elev' };
  return map[auth.role] || auth.role;
});

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: white;
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  box-shadow: var(--shadow-sm);
}
.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.brand {
  display: flex; align-items: center; gap: 10px;
  font-weight: 700; color: var(--color-text);
  text-decoration: none;
}
.brand:hover { text-decoration: none; }
.logo { font-size: 22px; }
.name { font-size: 16px; }
.nav-links {
  display: flex; gap: 4px; flex: 1;
}
.nav-links a {
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 14px;
}
.nav-links a:hover { background: var(--color-primary-light); color: var(--color-primary-dark); text-decoration: none; }
.nav-links a.active { background: var(--color-primary-light); color: var(--color-primary-dark); }
.user-area { display: flex; align-items: center; gap: 12px; }
.user-info { text-align: right; }
.user-name { font-weight: 500; font-size: 14px; }
.user-role { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }

.menu-toggle {
  display: none;
  background: transparent; border: 0;
  width: 36px; height: 36px;
  flex-direction: column; justify-content: center; align-items: center;
  gap: 4px;
}
.menu-toggle span { display: block; width: 22px; height: 2px; background: var(--color-text); }

@media (max-width: 900px) {
  .menu-toggle { display: flex; }
  .nav-links, .user-area {
    position: absolute; top: 64px; left: 0; right: 0;
    background: white; flex-direction: column; align-items: stretch;
    padding: 12px; border-bottom: 1px solid var(--color-border);
    display: none;
  }
  .nav-links.open, .user-area.open { display: flex; }
  .user-area { top: auto; gap: 8px; padding-top: 0; }
  .user-info { text-align: left; }
  .user-role { justify-content: flex-start; }
}
</style>
