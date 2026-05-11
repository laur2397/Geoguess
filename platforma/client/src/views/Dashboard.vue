<template>
  <div class="stack">
    <div class="hero card">
      <div>
        <h1>Salut, {{ auth.user?.first_name }}! 👋</h1>
        <p class="muted">{{ greeting }}</p>
      </div>
    </div>

    <div v-if="auth.isStudent" class="grid">
      <div class="card stat">
        <div class="stat-label">Teme primite</div>
        <div class="stat-value">{{ progress?.stats.total_homework || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Teme predate</div>
        <div class="stat-value">{{ progress?.stats.submitted || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Teme evaluate</div>
        <div class="stat-value">{{ progress?.stats.graded || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Medie</div>
        <div class="stat-value">{{ progress?.stats.avg_score ? progress.stats.avg_score.toFixed(2) : '—' }}</div>
      </div>
    </div>

    <div v-else class="grid">
      <div class="card stat">
        <div class="stat-label">Elevi activi</div>
        <div class="stat-value">{{ overview?.students || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Profesori</div>
        <div class="stat-value">{{ overview?.teachers || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Resurse</div>
        <div class="stat-value">{{ overview?.resources || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Teme date</div>
        <div class="stat-value">{{ overview?.homework || 0 }}</div>
      </div>
      <div class="card stat">
        <div class="stat-label">Predări</div>
        <div class="stat-value">{{ overview?.submissions || 0 }}</div>
      </div>
      <div class="card stat warn">
        <div class="stat-label">De evaluat</div>
        <div class="stat-value">{{ overview?.pending_grading || 0 }}</div>
      </div>
    </div>

    <div class="row wrap">
      <router-link to="/resurse" class="card action">
        <div class="action-icon">📁</div>
        <div>
          <h3>Resurse didactice</h3>
          <p class="muted small">Materiale, documente, video, link-uri</p>
        </div>
      </router-link>
      <router-link to="/teme" class="card action">
        <div class="action-icon">📝</div>
        <div>
          <h3>Teme</h3>
          <p class="muted small">{{ auth.isStudent ? 'Vezi temele și predă' : 'Creează și evaluează teme' }}</p>
        </div>
      </router-link>
      <router-link to="/catalog" class="card action">
        <div class="action-icon">📒</div>
        <div>
          <h3>{{ auth.isStudent ? 'Carnet de note' : 'Catalog electronic' }}</h3>
          <p class="muted small">{{ auth.isStudent ? 'Notele tale pe materii și absențe' : 'Note pe materii, medii, absențe' }}</p>
        </div>
      </router-link>
      <router-link to="/progres" class="card action">
        <div class="action-icon">📊</div>
        <div>
          <h3>Progres</h3>
          <p class="muted small">{{ auth.isStudent ? 'Notele tale' : 'Monitorizează elevii' }}</p>
        </div>
      </router-link>
    </div>

    <div v-if="auth.isStudent && progress?.recent?.length" class="card">
      <h2>Predările tale recente</h2>
      <table class="table">
        <thead>
          <tr><th>Temă</th><th>Materie</th><th>Predată</th><th>Notă</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in progress.recent" :key="r.id">
            <td>{{ r.homework_title }}</td>
            <td>{{ r.subject_name || '—' }}</td>
            <td>{{ formatDate(r.submitted_at) }}</td>
            <td>
              <span v-if="r.score != null" class="badge success">{{ r.score }}/{{ r.max_score }}</span>
              <span v-else class="badge warn">În așteptare</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../api';

const auth = useAuthStore();
const progress = ref(null);
const overview = ref(null);

const greeting = computed(() => {
  if (auth.isStudent) return `Clasa ${auth.user?.class_name || '—'}. Aici găsești toate resursele și temele tale.`;
  if (auth.isTeacher) return 'Gestionează resurse, teme și urmărește progresul elevilor.';
  return 'Panou de administrare a platformei.';
});

function formatDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleString('ro-RO');
}

onMounted(async () => {
  try {
    if (auth.isStudent) {
      progress.value = await api.myProgress();
    } else {
      const r = await api.overview();
      overview.value = r.stats;
    }
  } catch (e) { /* noop */ }
});
</script>

<style scoped>
.hero { background: linear-gradient(135deg, var(--color-primary) 0%, #2196f3 100%); color: white; }
.hero h1 { color: white; }
.hero .muted { color: rgba(255, 255, 255, 0.9); }
.stat { display: flex; flex-direction: column; gap: 4px; }
.stat-label { color: var(--color-text-muted); font-size: 13px; font-weight: 500; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--color-primary-dark); }
.stat.warn .stat-value { color: var(--color-warning); }
.action {
  flex: 1; min-width: 240px;
  display: flex; align-items: center; gap: 16px;
  text-decoration: none; color: var(--color-text);
  transition: transform 0.1s, box-shadow 0.15s;
}
.action:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); text-decoration: none; }
.action-icon { font-size: 36px; }
.action h3 { margin: 0; }
.action p { margin: 0; }
</style>
