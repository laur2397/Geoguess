<template>
  <div v-if="loading" class="empty">Se încarcă…</div>
  <div v-else-if="!resource" class="empty card">Resursă inexistentă.</div>
  <div v-else class="stack">
    <div class="row">
      <router-link to="/resurse" class="btn ghost sm">← Înapoi</router-link>
      <div class="spacer"></div>
      <a v-if="resource.file_path" :href="downloadUrl" class="btn secondary sm">Descarcă</a>
    </div>

    <div class="card">
      <h1>{{ resource.title }}</h1>
      <div class="row wrap small muted" style="margin-bottom: 12px">
        <span>📚 {{ resource.subject_name || '—' }}</span>
        <span v-if="resource.class_name">· Clasa {{ resource.class_name }}</span>
        <span>· Adăugat de {{ resource.uploader_name }}</span>
        <span>· {{ formatDate(resource.created_at) }}</span>
      </div>

      <p v-if="resource.description">{{ resource.description }}</p>

      <div v-if="resource.type === 'video' && resource.file_path" class="preview">
        <video controls :src="streamUrl" style="width: 100%; max-height: 70vh; background: black"></video>
      </div>
      <div v-else-if="resource.type === 'imagine' && resource.file_path" class="preview">
        <img :src="streamUrl" :alt="resource.title" style="max-width: 100%; border-radius: var(--radius-sm)" />
      </div>
      <div v-else-if="resource.type === 'link' && resource.external_url" class="preview">
        <a :href="resource.external_url" target="_blank" rel="noopener" class="btn">Deschide link extern ↗</a>
      </div>
      <div v-else-if="isPdf" class="preview">
        <iframe :src="streamUrl" style="width: 100%; height: 80vh; border: 1px solid var(--color-border); border-radius: var(--radius-sm)"></iframe>
      </div>
      <div v-else-if="resource.file_path" class="preview muted">
        <p>Acest tip de fișier nu poate fi previzualizat. Folosiți butonul „Descarcă" mai sus.</p>
        <p class="small">Nume: {{ resource.file_name }} · {{ formatSize(resource.file_size) }}</p>
      </div>

      <div v-if="resource.tags" style="margin-top: 12px">
        <span v-for="t in resource.tags.split(',')" :key="t" class="badge muted" style="margin-right: 4px">{{ t.trim() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api, authHeaderForUrl } from '../api';

const route = useRoute();
const resource = ref(null);
const loading = ref(true);

const id = computed(() => parseInt(route.params.id, 10));
const downloadUrl = computed(() => authHeaderForUrl(api.downloadResourceUrl(id.value)));
const streamUrl = computed(() => authHeaderForUrl(api.streamResourceUrl(id.value)));
const isPdf = computed(() => resource.value?.mime_type?.includes('pdf'));

function formatDate(s) { return new Date(s).toLocaleString('ro-RO'); }
function formatSize(n) {
  if (!n) return '—';
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n > 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

onMounted(async () => {
  try {
    const { resource: r } = await api.getResource(id.value);
    resource.value = r;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.preview { margin-top: 16px; }
</style>
