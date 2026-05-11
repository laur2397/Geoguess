<template>
  <div class="stack">
    <h1>{{ auth.isStudent ? 'Progresul tău' : 'Monitorizarea elevilor' }}</h1>

    <!-- Elev -->
    <template v-if="auth.isStudent">
      <div v-if="loading" class="empty">Se încarcă…</div>
      <template v-else-if="data">
        <div class="grid">
          <div class="card stat">
            <div class="stat-label">Teme primite</div>
            <div class="stat-value">{{ data.stats.total_homework }}</div>
          </div>
          <div class="card stat">
            <div class="stat-label">Predate</div>
            <div class="stat-value">{{ data.stats.submitted }}</div>
          </div>
          <div class="card stat">
            <div class="stat-label">Evaluate</div>
            <div class="stat-value">{{ data.stats.graded }}</div>
          </div>
          <div class="card stat">
            <div class="stat-label">Medie generală</div>
            <div class="stat-value">{{ data.stats.avg_score ? data.stats.avg_score.toFixed(2) : '—' }}</div>
          </div>
        </div>

        <div v-if="data.bySubject?.length" class="card">
          <h2>Medii pe materii</h2>
          <table class="table">
            <thead><tr><th>Materie</th><th>Medie</th><th>Note</th></tr></thead>
            <tbody>
              <tr v-for="s in data.bySubject" :key="s.subject_name">
                <td>{{ s.subject_name || '—' }}</td>
                <td><strong>{{ s.avg_score.toFixed(2) }}</strong></td>
                <td>{{ s.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>Predări recente</h2>
          <table class="table">
            <thead><tr><th>Temă</th><th>Materie</th><th>Predată</th><th>Notă</th><th>Feedback</th></tr></thead>
            <tbody>
              <tr v-for="r in data.recent" :key="r.id">
                <td>{{ r.homework_title }}</td>
                <td>{{ r.subject_name || '—' }}</td>
                <td class="small">{{ formatDate(r.submitted_at) }}</td>
                <td>
                  <span v-if="r.score != null" class="badge success">{{ r.score }}/{{ r.max_score }}</span>
                  <span v-else class="badge warn">În așteptare</span>
                </td>
                <td class="small muted">{{ r.feedback || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>

    <!-- Profesor/Admin -->
    <template v-else>
      <div class="card">
        <label>Selectează clasa</label>
        <div class="row">
          <select class="select" v-model="selectedClass" @change="loadClass">
            <option value="">— alege —</option>
            <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div v-if="classData" class="card">
        <h2>Clasa {{ classData.class_name }} – {{ classData.total_homework }} teme</h2>
        <table class="table">
          <thead><tr><th>Elev</th><th>Predate</th><th>Evaluate</th><th>Medie</th><th></th></tr></thead>
          <tbody>
            <tr v-for="s in classData.students" :key="s.id">
              <td>{{ s.first_name }} {{ s.last_name }}</td>
              <td>{{ s.submitted }}/{{ classData.total_homework }}</td>
              <td>{{ s.graded }}</td>
              <td><strong>{{ s.avg_score ? s.avg_score.toFixed(2) : '—' }}</strong></td>
              <td><button class="btn ghost sm" @click="openStudent(s.id)">Detalii</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal :open="!!studentData" :title="studentData ? `${studentData.student.first_name} ${studentData.student.last_name}` : ''" @close="studentData = null">
        <div v-if="studentData">
          <div class="row wrap" style="gap: 16px; margin-bottom: 12px">
            <div><strong>Clasa:</strong> {{ studentData.student.class_name }}</div>
            <div><strong>Predate:</strong> {{ studentData.stats.submitted }}/{{ studentData.stats.total_homework }}</div>
            <div><strong>Medie:</strong> {{ studentData.stats.avg_score ? studentData.stats.avg_score.toFixed(2) : '—' }}</div>
          </div>
          <table class="table">
            <thead><tr><th>Temă</th><th>Predată</th><th>Notă</th></tr></thead>
            <tbody>
              <tr v-for="s in studentData.submissions" :key="s.id">
                <td>{{ s.homework_title }}</td>
                <td class="small">{{ formatDate(s.submitted_at) }}</td>
                <td>
                  <span v-if="s.score != null" class="badge success">{{ s.score }}/{{ s.max_score }}</span>
                  <span v-else class="badge warn">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import { api } from '../api';
import Modal from '../components/Modal.vue';

const auth = useAuthStore();
const ui = useUiStore();

const loading = ref(true);
const data = ref(null);
const classes = ref([]);
const selectedClass = ref('');
const classData = ref(null);
const studentData = ref(null);

function formatDate(s) { return s ? new Date(s).toLocaleString('ro-RO') : ''; }

async function loadClass() {
  if (!selectedClass.value) { classData.value = null; return; }
  try {
    classData.value = await api.classProgress(selectedClass.value);
  } catch (e) { ui.error(e.message); }
}

async function openStudent(id) {
  try {
    studentData.value = await api.studentProgress(id);
  } catch (e) { ui.error(e.message); }
}

onMounted(async () => {
  loading.value = true;
  try {
    if (auth.isStudent) {
      data.value = await api.myProgress();
    } else {
      const { classes: c } = await api.listClasses();
      classes.value = c;
    }
  } catch (e) {
    ui.error(e.message);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.stat-label { color: var(--color-text-muted); font-size: 13px; font-weight: 500; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--color-primary-dark); }
</style>
