<template>
  <div class="stack">
    <div class="row wrap">
      <h1>Utilizatori</h1>
      <div class="spacer"></div>
      <button class="btn" @click="openCreate">+ Utilizator nou</button>
    </div>

    <div class="card">
      <div class="row wrap">
        <input class="input" v-model="q" placeholder="Caută…" style="flex: 1; min-width: 200px" />
        <select class="select" v-model="roleFilter" style="max-width: 180px">
          <option value="">Toate rolurile</option>
          <option value="admin">Administratori</option>
          <option value="profesor">Profesori</option>
          <option value="elev">Elevi</option>
        </select>
      </div>
    </div>

    <div class="card" style="padding: 0; overflow: auto">
      <table class="table">
        <thead>
          <tr><th>Nume</th><th>Email</th><th>Rol</th><th>Clasă</th><th>Activ</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id">
            <td>{{ u.first_name }} {{ u.last_name }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge">{{ u.role }}</span></td>
            <td>{{ u.class_name || '—' }}</td>
            <td><span :class="['badge', u.active ? 'success' : 'danger']">{{ u.active ? 'da' : 'nu' }}</span></td>
            <td style="white-space: nowrap">
              <button class="btn ghost sm" @click="openEdit(u)">Editează</button>
              <button class="btn ghost sm danger-text" @click="onDelete(u)">Șterge</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filtered.length" class="empty">Niciun utilizator.</div>
    </div>

    <Modal :open="showForm" :title="editingId ? 'Editează utilizator' : 'Utilizator nou'" @close="showForm = false">
      <form @submit.prevent="onSave" class="stack" id="user-form">
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
          <label>Email {{ editingId ? '(necesită ștergere și recreare pentru modificare)' : '' }}</label>
          <input class="input" type="email" v-model="form.email" :disabled="!!editingId" required />
        </div>
        <div v-if="!editingId">
          <label>Parolă</label>
          <input class="input" type="password" v-model="form.password" required minlength="8" />
        </div>
        <div class="row">
          <div style="flex: 1">
            <label>Rol</label>
            <select class="select" v-model="form.role" required>
              <option value="admin">Administrator</option>
              <option value="profesor">Profesor</option>
              <option value="elev">Elev</option>
            </select>
          </div>
          <div v-if="form.role === 'elev'" style="flex: 1">
            <label>Clasa</label>
            <input class="input" v-model="form.class_name" placeholder="V A" />
          </div>
        </div>
        <div v-if="editingId">
          <label>
            <input type="checkbox" v-model="form.active" /> Activ
          </label>
        </div>
      </form>
      <template #footer>
        <button class="btn secondary" @click="showForm = false">Renunță</button>
        <button class="btn" form="user-form" type="submit">Salvează</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUiStore } from '../stores/ui';
import { api } from '../api';
import Modal from '../components/Modal.vue';

const ui = useUiStore();

const users = ref([]);
const q = ref('');
const roleFilter = ref('');
const showForm = ref(false);
const editingId = ref(null);
const form = reactive({ first_name: '', last_name: '', email: '', password: '', role: 'elev', class_name: '', active: true });

const filtered = computed(() => users.value.filter((u) => {
  if (roleFilter.value && u.role !== roleFilter.value) return false;
  if (q.value) {
    const s = q.value.toLowerCase();
    return [u.first_name, u.last_name, u.email].some((v) => (v || '').toLowerCase().includes(s));
  }
  return true;
}));

async function load() {
  try {
    const { users: list } = await api.listUsers();
    users.value = list;
  } catch (e) {
    ui.error(e.message);
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { first_name: '', last_name: '', email: '', password: '', role: 'elev', class_name: '', active: true });
  showForm.value = true;
}

function openEdit(u) {
  editingId.value = u.id;
  Object.assign(form, {
    first_name: u.first_name, last_name: u.last_name, email: u.email,
    password: '', role: u.role, class_name: u.class_name || '', active: !!u.active,
  });
  showForm.value = true;
}

async function onSave() {
  try {
    if (editingId.value) {
      await api.updateUser(editingId.value, {
        first_name: form.first_name,
        last_name: form.last_name,
        class_name: form.class_name,
        role: form.role,
        active: form.active,
      });
      ui.success('Salvat');
    } else {
      await api.createUser({ ...form });
      ui.success('Utilizator creat');
    }
    showForm.value = false;
    load();
  } catch (e) {
    ui.error(e.message);
  }
}

async function onDelete(u) {
  if (!confirm(`Ștergeți utilizatorul ${u.first_name} ${u.last_name}?`)) return;
  try {
    await api.deleteUser(u.id);
    ui.success('Șters');
    load();
  } catch (e) {
    ui.error(e.message);
  }
}

onMounted(load);
</script>

<style scoped>
.danger-text { color: var(--color-danger); }
</style>
