<template>
  <div class="stack">
    <div class="row wrap">
      <h1>Resurse didactice</h1>
      <div class="spacer"></div>
      <button v-if="!auth.isStudent" class="btn" @click="showUpload = true">+ Adaugă resursă</button>
    </div>

    <div class="card">
      <div class="row wrap" style="gap: 10px">
        <input class="input" v-model="q" placeholder="Caută…" style="flex: 1; min-width: 200px" />
        <select class="select" v-model="subjectFilter" style="max-width: 220px">
          <option value="">Toate materiile</option>
          <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select class="select" v-model="typeFilter" style="max-width: 180px">
          <option value="">Toate tipurile</option>
          <option value="document">Documente</option>
          <option value="video">Video</option>
          <option value="link">Link-uri</option>
          <option value="imagine">Imagini</option>
          <option value="altul">Altele</option>
        </select>
        <select v-if="!auth.isStudent" class="select" v-model="mineFilter" style="max-width: 180px">
          <option value="">Toate resursele</option>
          <option value="1">Doar ale mele</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="empty">Se încarcă…</div>
    <div v-else-if="!filtered.length" class="empty card">
      <p>Nu există resurse care să corespundă filtrelor.</p>
    </div>
    <div v-else class="grid">
      <article v-for="r in filtered" :key="r.id" class="resource-card card">
        <div class="row">
          <div class="type-icon">{{ typeIcon(r.type) }}</div>
          <div style="flex: 1">
            <h3>{{ r.title }}</h3>
            <p class="muted small" style="margin: 0">{{ r.subject_name || '—' }} · {{ r.uploader_name }}</p>
          </div>
        </div>
        <p v-if="r.description" class="small" style="margin: 8px 0">{{ r.description }}</p>
        <div class="row small muted" style="margin-top: 8px">
          <span v-if="r.class_name">Clasa {{ r.class_name }}</span>
          <span class="badge muted">{{ r.type }}</span>
        </div>
        <div class="row" style="margin-top: 12px">
          <router-link :to="`/resurse/${r.id}`" class="btn secondary sm">Deschide</router-link>
          <a v-if="r.file_path" :href="downloadUrl(r.id)" class="btn ghost sm" target="_blank">Descarcă</a>
          <a v-if="r.external_url" :href="r.external_url" target="_blank" rel="noopener" class="btn ghost sm">Link extern</a>
          <div class="spacer"></div>
          <button v-if="canEdit(r)" class="btn ghost sm danger-text" @click="onDelete(r)">Șterge</button>
        </div>
      </article>
    </div>

    <Modal :open="showUpload" title="Adaugă resursă nouă" @close="showUpload = false">
      <form @submit.prevent="onUpload" class="stack" id="upload-form">
        <div>
          <label>Titlu *</label>
          <input class="input" v-model="form.title" required />
        </div>
        <div>
          <label>Descriere</label>
          <textarea class="input" v-model="form.description" rows="3"></textarea>
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
            <label>Clasa</label>
            <input class="input" v-model="form.class_name" placeholder="ex: V A" />
          </div>
        </div>
        <div class="row">
          <div style="flex: 1">
            <label>Tip *</label>
            <select class="select" v-model="form.type" required>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="imagine">Imagine</option>
              <option value="link">Link extern</option>
              <option value="altul">Altul</option>
            </select>
          </div>
          <div style="flex: 1">
            <label>Vizibil pentru</label>
            <select class="select" v-model="form.visible_to">
              <option value="toti">Toți utilizatorii</option>
              <option value="elevi">Doar elevi</option>
              <option value="profesori">Doar profesori</option>
              <option value="clasa">Doar clasa specificată</option>
            </select>
          </div>
        </div>
        <div v-if="form.type !== 'link'">
          <label>Fișier *</label>
          <input type="file" @change="onFile" :required="form.type !== 'link'" />
          <p class="small muted" style="margin: 4px 0">Max. 200 MB. Acceptat: PDF, DOCX, PPTX, MP4, JPG, PNG, ZIP etc.</p>
        </div>
        <div v-else>
          <label>URL extern *</label>
          <input class="input" type="url" v-model="form.external_url" required placeholder="https://…" />
        </div>
        <div>
          <label>Etichete (separate prin virgulă)</label>
          <input class="input" v-model="form.tags" placeholder="evaluare, fracții, recapitulare" />
        </div>
      </form>
      <template #footer>
        <button class="btn secondary" @click="showUpload = false">Renunță</button>
        <button class="btn" form="upload-form" type="submit" :disabled="uploading">
          {{ uploading ? 'Se încarcă…' : 'Salvează' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import { api, authHeaderForUrl } from '../api';
import Modal from '../components/Modal.vue';

const auth = useAuthStore();
const ui = useUiStore();

const resources = ref([]);
const subjects = ref([]);
const loading = ref(true);
const q = ref('');
const subjectFilter = ref('');
const typeFilter = ref('');
const mineFilter = ref('');

const showUpload = ref(false);
const uploading = ref(false);
const file = ref(null);
const form = reactive({
  title: '', description: '', subject_id: '', class_name: '',
  type: 'document', external_url: '', visible_to: 'toti', tags: '',
});

const filtered = computed(() => {
  return resources.value.filter((r) => {
    if (q.value) {
      const s = q.value.toLowerCase();
      if (!r.title.toLowerCase().includes(s) && !(r.description || '').toLowerCase().includes(s)) return false;
    }
    if (subjectFilter.value && r.subject_id !== parseInt(subjectFilter.value, 10)) return false;
    if (typeFilter.value && r.type !== typeFilter.value) return false;
    if (mineFilter.value === '1' && r.uploaded_by !== auth.user?.id) return false;
    return true;
  });
});

function typeIcon(t) {
  return { document: '📄', video: '🎬', link: '🔗', imagine: '🖼️', altul: '📎' }[t] || '📎';
}
function downloadUrl(id) { return authHeaderForUrl(api.downloadResourceUrl(id)); }
function canEdit(r) { return auth.isAdmin || r.uploaded_by === auth.user?.id; }
function onFile(e) { file.value = e.target.files[0]; }

async function load() {
  loading.value = true;
  try {
    const [r, s] = await Promise.all([api.listResources(), api.listSubjects()]);
    resources.value = r.resources;
    subjects.value = s.subjects;
  } catch (e) {
    ui.error(e.message);
  } finally {
    loading.value = false;
  }
}

async function onUpload() {
  if (form.type !== 'link' && !file.value) {
    ui.error('Selectați un fișier');
    return;
  }
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
  if (file.value) fd.append('file', file.value);

  uploading.value = true;
  try {
    await api.uploadResource(fd);
    ui.success('Resursă adăugată');
    showUpload.value = false;
    Object.assign(form, { title: '', description: '', subject_id: '', class_name: '', type: 'document', external_url: '', visible_to: 'toti', tags: '' });
    file.value = null;
    load();
  } catch (e) {
    ui.error(e.message);
  } finally {
    uploading.value = false;
  }
}

async function onDelete(r) {
  if (!confirm(`Ștergeți resursa "${r.title}"?`)) return;
  try {
    await api.deleteResource(r.id);
    ui.success('Șters');
    load();
  } catch (e) {
    ui.error(e.message);
  }
}

onMounted(load);
</script>

<style scoped>
.resource-card { transition: transform 0.1s, box-shadow 0.15s; }
.resource-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.type-icon { font-size: 32px; }
.danger-text { color: var(--color-danger); }
</style>
