<template>
  <div v-if="loading" class="empty">Se încarcă…</div>
  <div v-else-if="!hw" class="empty card">Temă inexistentă.</div>
  <div v-else class="stack">
    <div class="row">
      <router-link to="/teme" class="btn ghost sm">← Înapoi</router-link>
    </div>

    <div class="card">
      <h1>{{ hw.title }}</h1>
      <div class="row wrap small muted">
        <span>📚 {{ hw.subject_name || '—' }}</span>
        <span>· Clasa {{ hw.class_name }}</span>
        <span>· {{ hw.teacher_name }}</span>
        <span v-if="hw.due_date">· Termen: <strong>{{ formatDate(hw.due_date) }}</strong></span>
        <span>· Notă maximă: {{ hw.max_score }}</span>
      </div>
      <p v-if="hw.description" style="margin-top: 12px; white-space: pre-wrap">{{ hw.description }}</p>
      <div v-if="hw.attachment_path" style="margin-top: 12px">
        <a :href="attachmentUrl" class="btn secondary sm">📎 Descarcă atașament: {{ hw.attachment_name }}</a>
      </div>
    </div>

    <!-- Student: predare temă -->
    <div v-if="auth.isStudent" class="card">
      <h2>Predarea ta</h2>
      <div v-if="mySubmission" style="margin-bottom: 12px">
        <p class="small muted">Predată la {{ formatDate(mySubmission.submitted_at) }}</p>
        <p v-if="mySubmission.content" style="white-space: pre-wrap">{{ mySubmission.content }}</p>
        <p v-if="mySubmission.file_name">
          <a :href="submissionDownloadUrl(mySubmission.id)" class="btn ghost sm">📎 {{ mySubmission.file_name }}</a>
        </p>
        <div v-if="mySubmission.score != null" class="grade-block">
          <div class="row">
            <span class="badge success">Nota: {{ mySubmission.score }}/{{ hw.max_score }}</span>
            <span class="muted small">· Evaluată {{ formatDate(mySubmission.graded_at) }}</span>
          </div>
          <p v-if="mySubmission.feedback" style="margin-top: 8px"><em>{{ mySubmission.feedback }}</em></p>
        </div>
      </div>
      <form @submit.prevent="onSubmit" class="stack">
        <div>
          <label>{{ mySubmission ? 'Repredă (înlocuiește predarea curentă)' : 'Predă tema' }}</label>
          <textarea class="input" v-model="subForm.content" rows="4" placeholder="Răspunsul tău (opțional)…"></textarea>
        </div>
        <div>
          <input type="file" @change="onFile" />
        </div>
        <button class="btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Se trimite…' : 'Trimite' }}
        </button>
      </form>
    </div>

    <!-- Profesor: lista predărilor -->
    <div v-else class="card">
      <h2>Predări ({{ submissions.length }})</h2>
      <div v-if="!submissions.length" class="empty">Nicio predare încă.</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Elev</th>
            <th>Predată</th>
            <th>Fișier</th>
            <th>Răspuns</th>
            <th>Notă</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in submissions" :key="s.id">
            <td>{{ s.student_name }}</td>
            <td class="small">{{ formatDate(s.submitted_at) }}</td>
            <td>
              <a v-if="s.file_path" :href="submissionDownloadUrl(s.id)" class="btn ghost sm">📎 {{ s.file_name }}</a>
              <span v-else class="muted small">—</span>
            </td>
            <td class="small" :title="s.content">{{ truncate(s.content, 60) || '—' }}</td>
            <td>
              <span v-if="s.score != null" class="badge success">{{ s.score }}/{{ hw.max_score }}</span>
              <span v-else class="badge warn">Neevaluată</span>
            </td>
            <td>
              <button class="btn sm" @click="openGrade(s)">{{ s.score != null ? 'Modifică' : 'Notează' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :open="!!gradeFor" :title="`Notează: ${gradeFor?.student_name}`" @close="gradeFor = null">
      <form @submit.prevent="onGrade" class="stack" id="grade-form">
        <div>
          <label>Notă (0 – {{ hw.max_score }})</label>
          <input class="input" type="number" v-model.number="gradeForm.score" :max="hw.max_score" min="0" step="0.5" required />
        </div>
        <div>
          <label>Feedback pentru elev</label>
          <textarea class="input" v-model="gradeForm.feedback" rows="4"></textarea>
        </div>
      </form>
      <template #footer>
        <button class="btn secondary" @click="gradeFor = null">Renunță</button>
        <button class="btn" form="grade-form" type="submit">Salvează nota</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import { api, authHeaderForUrl } from '../api';
import Modal from '../components/Modal.vue';

const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();

const hw = ref(null);
const submissions = ref([]);
const loading = ref(true);
const submitting = ref(false);
const file = ref(null);
const subForm = reactive({ content: '' });

const gradeFor = ref(null);
const gradeForm = reactive({ score: null, feedback: '' });

const id = computed(() => parseInt(route.params.id, 10));
const attachmentUrl = computed(() => hw.value?.attachment_path ? authHeaderForUrl(api.downloadAttachmentUrl(id.value)) : '');
const mySubmission = computed(() => submissions.value[0]);

function formatDate(s) { return s ? new Date(s).toLocaleString('ro-RO') : ''; }
function submissionDownloadUrl(sid) { return authHeaderForUrl(api.downloadSubmissionUrl(sid)); }
function onFile(e) { file.value = e.target.files[0]; }
function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : s; }

function openGrade(s) {
  gradeFor.value = s;
  gradeForm.score = s.score ?? null;
  gradeForm.feedback = s.feedback || '';
}

async function load() {
  loading.value = true;
  try {
    const data = await api.getHomework(id.value);
    hw.value = data.homework;
    submissions.value = data.submissions;
  } catch (e) {
    ui.error(e.message);
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  const fd = new FormData();
  if (subForm.content) fd.append('content', subForm.content);
  if (file.value) fd.append('file', file.value);
  if (!subForm.content && !file.value) {
    ui.error('Adăugați text sau un fișier');
    return;
  }
  submitting.value = true;
  try {
    await api.submitHomework(id.value, fd);
    ui.success('Predare trimisă');
    subForm.content = '';
    file.value = null;
    load();
  } catch (e) {
    ui.error(e.message);
  } finally {
    submitting.value = false;
  }
}

async function onGrade() {
  try {
    await api.gradeSubmission(gradeFor.value.id, { score: gradeForm.score, feedback: gradeForm.feedback });
    ui.success('Notă salvată');
    gradeFor.value = null;
    load();
  } catch (e) {
    ui.error(e.message);
  }
}

onMounted(load);
</script>

<style scoped>
.grade-block { background: #ecfdf5; padding: 12px; border-radius: var(--radius-sm); margin-top: 12px; border-left: 3px solid var(--color-success); }
</style>
