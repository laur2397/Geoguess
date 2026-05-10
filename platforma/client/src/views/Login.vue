<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="logo-row">
        <div class="logo-circle">📚</div>
        <div>
          <h1 style="margin:0">{{ schoolName }}</h1>
          <p class="muted small" style="margin:0">Platformă de centralizare a resurselor didactice</p>
        </div>
      </div>

      <form @submit.prevent="onSubmit" class="stack" style="margin-top: 20px">
        <div>
          <label>Email</label>
          <input class="input" type="email" v-model="email" required autocomplete="email" />
        </div>
        <div>
          <label>Parolă</label>
          <input class="input" type="password" v-model="password" required autocomplete="current-password" />
        </div>
        <button class="btn" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Autentificare…' : 'Autentificare' }}
        </button>
      </form>

      <p class="center muted small" style="margin-top: 16px">
        Nu aveți cont? <router-link to="/register">Înregistrare</router-link>
      </p>

      <details class="demo-creds">
        <summary>Conturi demo</summary>
        <div class="small">
          <p><strong>Admin:</strong> admin@scoala.local / admin1234</p>
          <p><strong>Profesor:</strong> profesor@scoala.local / profesor1234</p>
          <p><strong>Elev:</strong> elev@scoala.local / elev1234</p>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';

const auth = useAuthStore();
const ui = useUiStore();
const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const schoolName = computed(() => ui.settings.school_name || 'Școala Gimnazială Greceşti');

async function onSubmit() {
  try {
    await auth.login(email.value, password.value);
    ui.success('Bine ați venit!');
    router.push(route.query.redirect || '/');
  } catch (e) {
    ui.error(e.message);
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-card { width: 100%; max-width: 440px; }
.logo-row { display: flex; align-items: center; gap: 12px; }
.logo-circle {
  width: 56px; height: 56px;
  background: var(--color-primary-light);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
}
.demo-creds { margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: var(--radius-sm); }
.demo-creds summary { cursor: pointer; font-weight: 500; }
</style>
