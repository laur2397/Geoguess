<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Înregistrare</h1>
      <p class="muted small">Creați un cont de profesor sau elev.</p>

      <form @submit.prevent="onSubmit" class="stack">
        <div class="row">
          <div style="flex: 1">
            <label>Prenume</label>
            <input class="input" v-model="form.first_name" required />
          </div>
          <div style="flex: 1">
            <label>Nume</label>
            <input class="input" v-model="form.last_name" required />
          </div>
        </div>
        <div>
          <label>Email</label>
          <input class="input" type="email" v-model="form.email" required />
        </div>
        <div>
          <label>Parolă (min. 8 caractere)</label>
          <input class="input" type="password" v-model="form.password" required minlength="8" />
        </div>
        <div>
          <label>Rol</label>
          <select class="select" v-model="form.role" required>
            <option value="elev">Elev</option>
            <option value="profesor">Profesor</option>
          </select>
        </div>
        <div v-if="form.role === 'elev'">
          <label>Clasa (ex: V A, VI B)</label>
          <input class="input" v-model="form.class_name" placeholder="V A" />
        </div>
        <button class="btn" :disabled="auth.loading">{{ auth.loading ? 'Se creează…' : 'Creează cont' }}</button>
      </form>

      <p class="center muted small" style="margin-top: 16px">
        Aveți deja cont? <router-link to="/login">Autentificare</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'elev',
  class_name: '',
});

async function onSubmit() {
  try {
    await auth.register({ ...form });
    ui.success('Cont creat cu succes!');
    router.push('/');
  } catch (e) {
    ui.error(e.message);
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-card { width: 100%; max-width: 480px; }
</style>
