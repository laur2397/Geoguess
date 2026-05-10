<template>
  <div class="stack">
    <div class="row wrap">
      <h1>Teme</h1>
      <div class="spacer"></div>
      <button v-if="!auth.isStudent" class="btn" @click="showCreate = true">+ Temă nouă</button>
    </div>

    <div v-if="loading" class="empty">Se încarcă…</div>
    <div v-else-if="!homework.length" class="empty card">
      <p>{{ auth.isStudent ? 'Nu ai teme momentan.' : 'Nu există teme create.' }}</p>
    </div>
    <div v-else class="stack">
      <article v-for="h in homework" :key="h.id" class="card hw-card">
        <div class="row wrap">
          <div style="flex: 1; min-width: 260px">
            <h3 style="margin: 0">{{ h.title }}</h3>
            <div class="row small muted wrap" style="gap: 8px; margin-top: 4px">
              <span>{{ h.subject_name || '—' }}</span>
              <span>· Clasa {{ h.class_name }}</span>
              <span>· {{ h.teacher_name }}</span>
              <span v-if="h.due_date">· Termen: {{ formatDate(h.due_date) }}</span>
            </div>
          </div>
          <div>
            <span v-if="auth.isStudent && h.my_submission?.score != null" class="badge success">
              Nota: {{ h.my_submission.score }}/{{ h.max_score }}
            </span>
            <span v-else-if="auth.isStudent && h.my_submission" class="badge warn">Predată, în așteptare</span>
            <span v-else-if="auth.isStudent && isOverdue(h)" class="badge danger">Întârziată</span>
            <span v-else-if="auth.isStudent" class="badge">De predat</span>
            <span v-else class="badge">{{ h.submissions_count }} predări</span>
          </div>
        </div>
        <p v-if="h.description" class="small" style="margin: 8px 0">{{ h.description }}</p>
        <div class="row" style="margin-top: 8px">
          <router-link :to="`/teme/${h.id}`" class="btn secondary sm">Deschide</router-link>
          <a v-if="h.attachment_path" :href="attachmentUrl(h.id)" class="btn ghost sm">Descarcă atașament</a>
          <div class="spacer"></div>
          <button v-if="canDelete(h)" class="btn ghost sm danger-text" @click="onDelete(h)">Șterge</button>
        </div>
      </article>
    </div>

    <Modal :open="showCreate" title="Creează temă nouă" @close="showCreate = false">
      <form @submit.prevent="onCreate" class="stack" id="hw-form">
        <div>
          <label>Titlu *</label>
          <input class="input" v-model="form.title" required />
        </div>
        <div>
          <label>Cerință / descriere</label>
          <textarea class="input" v-model="form.description" rows="4"></textarea>
        </div>
        <div class="row">
          <div style="flex: 1">
            <label>Materie</label>
            <select class="select" v-model="form.subject_id">
              <option value="">—</option>
              <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div style="flex: 1">
            <label>Clasa *</label>
            <input class="input" v-model="form.class_name" required placeholder="ex: V A" />
          </div>
        </div>
        <div class="row">
          <div style="flex: 1">
            <label>Termen limită</label>
            <input class="input" type="datetime-local" v-model="form.due_date" />
          </div>
          <div style="flex: 1">
            <label>Notă maximă</label>
            <input class="input" type="number" v-model.number="form.max_score" min="1" max="100" />
          </div>
        </div>
        <div>
          <label>Atașament (opțional)</label>
          <input type="file" @change="onFile" />
        </div>
      </form>
      <template #footer>
        <button class="btn secondary" @click="showCreate = false">Renunță</button>
        <button class="btn" form="hw-form" type="submit" :disabled="creating">
          {{ creating ? 'Se salvează…' : 'Creează' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import { api, authHeaderForUrl } from '../api';
import Modal from '../components/Modal.vue';

const auth = useAuthStore();
const ui = useUiStore();

const homework = ref([]);
const subjects = ref([]);
const loading = ref(true);
const showCreate = ref(false);
const creating = ref(false);
const file = ref(null);

const form = reactive({
  title: '', description: '', subject_id: '', class_name: '',
  due_date: '', max_score: 10,
});

function formatDate(s) { return new Date(s).toLocaleString('ro-RO'); }
function attachmentUrl(id) { return authHeaderForUrl(api.downloadAttachmentUrl(id)); }
function canDelete(h) { return auth.isAdmin || h.teacher_id === auth.user?.id; }
function isOverdue(h) { return h.due_date && new Date(h.due_date) < new Date(); }
function onFile(e) { file.value = e.target.files[0]; }

async function load() {
  loading.value = true;
  try {
    const [h, s] = await Promise.all([api.listHomework(), api.listSubjects()]);
    homework.value = h.homework;
    subjects.value = s.subjects;
  } catch (e) {
    ui.error(e.message);
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(k, v); });
  if (file.value) fd.append('attachment', file.value);
  creating.value = true;
  try {
    await api.createHomework(fd);
    ui.success('Temă creată');
    showCreate.value = false;
    Object.assign(form, { title: '', description: '', subject_id: '', class_name: '', due_date: '', max_score: 10 });
    file.value = null;
    load();
  } catch (e) {
    ui.error(e.message);
  } finally {
    creating.value = false;
  }
}

async function onDelete(h) {
  if (!confirm(`Ștergeți tema "${h.title}"?`)) return;
  try {
    await api.deleteHomework(h.id);
    ui.success('Șters');
    load();
  } catch (e) {
    ui.error(e.message);
  }
}

onMounted(load);
</script>

<style scoped>
.hw-card { transition: box-shadow 0.15s; }
.hw-card:hover { box-shadow: var(--shadow-md); }
.danger-text { color: var(--color-danger); }
</style>
