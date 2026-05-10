<template>
  <div class="stack">
    <h1>Setări</h1>

    <div class="card">
      <h2>Contul meu</h2>
      <div class="stack">
        <div><strong>Nume:</strong> {{ auth.fullName }}</div>
        <div><strong>Email:</strong> {{ auth.user?.email }}</div>
        <div><strong>Rol:</strong> {{ auth.role }}</div>
        <div v-if="auth.user?.class_name"><strong>Clasa:</strong> {{ auth.user.class_name }}</div>
      </div>

      <h3 style="margin-top: 20px">Schimbă parola</h3>
      <form @submit.prevent="onChangePassword" class="stack" style="max-width: 420px">
        <div>
          <label>Parola curentă</label>
          <input class="input" type="password" v-model="pw.current_password" required />
        </div>
        <div>
          <label>Parola nouă (min. 8 caractere)</label>
          <input class="input" type="password" v-model="pw.new_password" required minlength="8" />
        </div>
        <button class="btn" :disabled="changing">{{ changing ? 'Se salvează…' : 'Schimbă parola' }}</button>
      </form>
    </div>

    <div v-if="auth.isAdmin" class="card">
      <h2>Personalizare platformă</h2>
      <form @submit.prevent="onSaveSettings" class="stack" style="max-width: 560px">
        <div>
          <label>Numele școlii</label>
          <input class="input" v-model="settings.school_name" />
        </div>
        <div>
          <label>Culoare temă (HEX)</label>
          <input class="input" v-model="settings.theme_color" type="color" style="height: 40px" />
        </div>
        <div>
          <label>Email de contact</label>
          <input class="input" type="email" v-model="settings.contact_email" />
        </div>
        <div>
          <label>URL logo (opțional)</label>
          <input class="input" v-model="settings.logo_url" />
        </div>
        <button class="btn" :disabled="savingSettings">{{ savingSettings ? 'Se salvează…' : 'Salvează setările' }}</button>
      </form>
    </div>

    <div v-if="auth.isAdmin" class="card">
      <h2>Jurnal de activitate</h2>
      <p class="small muted">Ultimele 200 de acțiuni (pentru audit GDPR/securitate).</p>
      <div style="overflow: auto; max-height: 480px">
        <table class="table">
          <thead><tr><th>Data</th><th>Utilizator</th><th>Acțiune</th><th>Detalii</th><th>IP</th></tr></thead>
          <tbody>
            <tr v-for="a in activity" :key="a.id">
              <td class="small">{{ formatDate(a.created_at) }}</td>
              <td class="small">{{ a.user_name || '—' }}</td>
              <td><span class="badge muted">{{ a.action }}</span></td>
              <td class="small">{{ a.entity_type }}#{{ a.entity_id }} {{ a.details || '' }}</td>
              <td class="small muted">{{ a.ip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h2>Despre platformă</h2>
      <p class="small muted">
        Platformă de centralizare a resurselor cadrelor didactice. Conformă cu cerințele caietului de sarcini al Școlii Gimnaziale Greceşti.
      </p>
      <p class="small muted">
        Suport tehnic: <a :href="`mailto:${settings.contact_email || 'scoalagrecesti@gmail.com'}`">{{ settings.contact_email || 'scoalagrecesti@gmail.com' }}</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import { api } from '../api';

const auth = useAuthStore();
const ui = useUiStore();

const pw = reactive({ current_password: '', new_password: '' });
const changing = ref(false);
const settings = reactive({ school_name: '', theme_color: '#1565c0', contact_email: '', logo_url: '' });
const savingSettings = ref(false);
const activity = ref([]);

function formatDate(s) { return new Date(s).toLocaleString('ro-RO'); }

async function onChangePassword() {
  changing.value = true;
  try {
    await api.changePassword(pw.current_password, pw.new_password);
    ui.success('Parolă schimbată');
    pw.current_password = '';
    pw.new_password = '';
  } catch (e) {
    ui.error(e.message);
  } finally {
    changing.value = false;
  }
}

async function onSaveSettings() {
  savingSettings.value = true;
  try {
    const { settings: s } = await api.updateSettings({ ...settings });
    ui.setSettings(s);
    if (s.theme_color) document.documentElement.style.setProperty('--color-primary', s.theme_color);
    ui.success('Setări salvate');
  } catch (e) {
    ui.error(e.message);
  } finally {
    savingSettings.value = false;
  }
}

onMounted(async () => {
  try {
    const { settings: s } = await api.getSettings();
    Object.assign(settings, s);
  } catch (e) { /* noop */ }

  if (auth.isAdmin) {
    try {
      const { activity: a } = await api.getActivity();
      activity.value = a;
    } catch (e) { /* noop */ }
  }
});
</script>
