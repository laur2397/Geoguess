<template>
  <div class="stack">
    <div class="row wrap">
      <h1>{{ auth.isStudent ? 'Carnetul de note' : 'Catalog electronic' }}</h1>
      <div class="spacer"></div>
      <div class="row" v-if="yearInfo">
        <select class="select" v-model="selectedSemester" @change="reload">
          <option value="">Tot anul</option>
          <option value="1">Semestrul 1</option>
          <option value="2">Semestrul 2</option>
        </select>
        <span class="badge muted">An școlar: {{ yearInfo.school_year }}</span>
      </div>
    </div>

    <!-- ============ STUDENT (carnet) ============ -->
    <template v-if="auth.isStudent">
      <div v-if="loading" class="empty">Se încarcă carnetul…</div>
      <template v-else-if="carnet">
        <div class="grid">
          <div class="card stat">
            <div class="stat-label">Medie generală</div>
            <div class="stat-value">{{ carnet.general_average ? carnet.general_average.toFixed(2) : '—' }}</div>
          </div>
          <div class="card stat">
            <div class="stat-label">Materii cu note</div>
            <div class="stat-value">{{ carnet.by_subject.length }}</div>
          </div>
          <div class="card stat warn">
            <div class="stat-label">Absențe totale</div>
            <div class="stat-value">{{ carnet.absence_stats.total }}</div>
            <div class="small muted">{{ carnet.absence_stats.motivated }} motivate · {{ carnet.absence_stats.unmotivated }} nemotivate</div>
          </div>
        </div>

        <div class="card">
          <h2>Note pe materii</h2>
          <div v-if="!carnet.by_subject.length" class="empty">Nu există note încă.</div>
          <table v-else class="table">
            <thead>
              <tr>
                <th>Materie</th>
                <th>Note semestrul 1</th>
                <th>Media S1</th>
                <th>Note semestrul 2</th>
                <th>Media S2</th>
                <th>Media anuală</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in carnet.by_subject" :key="s.subject_id">
                <td><strong>{{ s.subject_name }}</strong></td>
                <td>
                  <span v-for="g in s.sem1" :key="g.id" class="grade-pill" :title="`${gradeTypeLabel(g.type)} · ${formatDate(g.graded_at)}${g.description ? '\n' + g.description : ''}`">
                    {{ g.value }}
                  </span>
                  <span v-if="!s.sem1.length" class="muted small">—</span>
                </td>
                <td><strong v-if="s.avg_sem1 != null" :class="gradeClass(s.avg_sem1)">{{ s.avg_sem1.toFixed(2) }}</strong><span v-else class="muted">—</span></td>
                <td>
                  <span v-for="g in s.sem2" :key="g.id" class="grade-pill" :title="`${gradeTypeLabel(g.type)} · ${formatDate(g.graded_at)}${g.description ? '\n' + g.description : ''}`">
                    {{ g.value }}
                  </span>
                  <span v-if="!s.sem2.length" class="muted small">—</span>
                </td>
                <td><strong v-if="s.avg_sem2 != null" :class="gradeClass(s.avg_sem2)">{{ s.avg_sem2.toFixed(2) }}</strong><span v-else class="muted">—</span></td>
                <td><strong v-if="s.avg_year != null" :class="gradeClass(s.avg_year)">{{ s.avg_year.toFixed(2) }}</strong><span v-else class="muted">—</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="carnet.absences.length" class="card">
          <h2>Absențe</h2>
          <table class="table">
            <thead><tr><th>Data</th><th>Materie</th><th>Status</th><th>Motiv</th></tr></thead>
            <tbody>
              <tr v-for="a in carnet.absences" :key="a.id">
                <td class="small">{{ a.date }}</td>
                <td>{{ a.subject_name || '—' }}</td>
                <td>
                  <span :class="['badge', a.motivated ? 'success' : 'danger']">{{ a.motivated ? 'Motivată' : 'Nemotivată' }}</span>
                </td>
                <td class="small muted">{{ a.reason || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>

    <!-- ============ TEACHER / ADMIN (catalog) ============ -->
    <template v-else>
      <div class="card">
        <div class="row wrap">
          <div>
            <label>Selectează clasa</label>
            <select class="select" v-model="selectedClass" @change="reload">
              <option value="">— alege —</option>
              <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="spacer"></div>
          <button class="btn" :disabled="!selectedClass" @click="openAddGrade()">+ Adaugă notă</button>
          <button class="btn secondary" :disabled="!selectedClass" @click="openAddAbsence()">+ Înregistrează absență</button>
        </div>
      </div>

      <div v-if="!selectedClass" class="empty card">Selectează o clasă pentru a vedea catalogul.</div>
      <div v-else-if="catalogLoading" class="empty">Se încarcă catalogul…</div>
      <template v-else-if="classData">
        <div class="card" style="padding: 0; overflow: auto">
          <table class="table catalog-table">
            <thead>
              <tr>
                <th class="sticky-col">Elev</th>
                <th v-for="s in classData.subjects" :key="s.id" class="subject-col">
                  {{ s.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="st in classData.students" :key="st.id">
                <td class="sticky-col">
                  <strong>{{ st.last_name }} {{ st.first_name }}</strong>
                </td>
                <td v-for="s in classData.subjects" :key="s.id" class="cell">
                  <div class="grades-row">
                    <span
                      v-for="g in classData.matrix[st.id][s.id].grades"
                      :key="g.id"
                      class="grade-pill clickable"
                      :title="`${gradeTypeLabel(g.type)} · ${formatDate(g.graded_at)}${g.description ? '\n' + g.description : ''}\nClick pentru a edita`"
                      @click="openEditGrade(g)"
                    >{{ g.value }}</span>
                    <button class="add-grade" @click="openAddGrade(st, s)" title="Adaugă notă">+</button>
                  </div>
                  <div v-if="classData.matrix[st.id][s.id].avg != null" class="cell-avg" :class="gradeClass(classData.matrix[st.id][s.id].avg)">
                    {{ classData.matrix[st.id][s.id].avg.toFixed(2) }}
                  </div>
                  <div v-if="classData.matrix[st.id][s.id].absences" class="cell-abs">
                    {{ classData.matrix[st.id][s.id].absences }} abs
                    <span v-if="classData.matrix[st.id][s.id].motivated">({{ classData.matrix[st.id][s.id].motivated }}m)</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>

    <!-- Modal: Add/Edit grade -->
    <Modal :open="showGradeModal" :title="editingGrade ? 'Editează notă' : 'Adaugă notă'" @close="closeGradeModal">
      <form @submit.prevent="saveGrade" class="stack" id="grade-form">
        <div v-if="!editingGrade && !gradeForm.student_id_locked">
          <label>Elev</label>
          <select class="select" v-model="gradeForm.student_id" required>
            <option v-for="st in (classData?.students || [])" :key="st.id" :value="st.id">
              {{ st.last_name }} {{ st.first_name }}
            </option>
          </select>
        </div>
        <div v-else-if="gradeForm.student_id_locked" class="muted small">
          Elev: <strong>{{ gradeForm.student_label }}</strong>
        </div>
        <div v-if="!editingGrade && !gradeForm.subject_id_locked">
          <label>Materie</label>
          <select class="select" v-model="gradeForm.subject_id" required>
            <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div v-else-if="gradeForm.subject_id_locked" class="muted small">
          Materie: <strong>{{ gradeForm.subject_label }}</strong>
        </div>
        <div class="row">
          <div style="flex: 1">
            <label>Nota *</label>
            <input class="input" type="number" v-model.number="gradeForm.value" min="1" max="10" step="0.5" required />
          </div>
          <div style="flex: 1">
            <label>Tip</label>
            <select class="select" v-model="gradeForm.type">
              <option value="oral">Oral</option>
              <option value="scris">Scris</option>
              <option value="teza">Teză</option>
              <option value="proiect">Proiect</option>
              <option value="referat">Referat</option>
              <option value="practica">Practică</option>
            </select>
          </div>
          <div style="flex: 1">
            <label>Semestru</label>
            <select class="select" v-model.number="gradeForm.semester">
              <option :value="1">Semestrul 1</option>
              <option :value="2">Semestrul 2</option>
            </select>
          </div>
        </div>
        <div>
          <label>Observații</label>
          <input class="input" v-model="gradeForm.description" placeholder="ex: Capitolul fracții, lecția 3" />
        </div>
      </form>
      <template #footer>
        <button v-if="editingGrade" class="btn ghost danger-text" type="button" @click="deleteGrade">Șterge</button>
        <div class="spacer"></div>
        <button class="btn secondary" @click="closeGradeModal">Renunță</button>
        <button class="btn" form="grade-form" type="submit">Salvează</button>
      </template>
    </Modal>

    <!-- Modal: Add absence -->
    <Modal :open="showAbsenceModal" title="Înregistrează absență" @close="showAbsenceModal = false">
      <form @submit.prevent="saveAbsence" class="stack" id="abs-form">
        <div>
          <label>Elev</label>
          <select class="select" v-model="absenceForm.student_id" required>
            <option v-for="st in (classData?.students || [])" :key="st.id" :value="st.id">
              {{ st.last_name }} {{ st.first_name }}
            </option>
          </select>
        </div>
        <div class="row">
          <div style="flex: 1">
            <label>Materie</label>
            <select class="select" v-model="absenceForm.subject_id">
              <option value="">—</option>
              <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div style="flex: 1">
            <label>Data *</label>
            <input class="input" type="date" v-model="absenceForm.date" required />
          </div>
        </div>
        <div>
          <label>
            <input type="checkbox" v-model="absenceForm.motivated" /> Motivată
          </label>
        </div>
        <div v-if="absenceForm.motivated">
          <label>Motiv</label>
          <input class="input" v-model="absenceForm.reason" placeholder="ex: Adeverință medicală" />
        </div>
      </form>
      <template #footer>
        <button class="btn secondary" @click="showAbsenceModal = false">Renunță</button>
        <button class="btn" form="abs-form" type="submit">Salvează</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import { api } from '../api';
import Modal from '../components/Modal.vue';

const auth = useAuthStore();
const ui = useUiStore();

const loading = ref(true);
const yearInfo = ref(null);
const selectedSemester = ref('');
const carnet = ref(null);
const classes = ref([]);
const selectedClass = ref('');
const catalogLoading = ref(false);
const classData = ref(null);
const subjects = ref([]);

const showGradeModal = ref(false);
const editingGrade = ref(null);
const gradeForm = reactive({
  student_id: '', subject_id: '', value: null, type: 'oral', description: '', semester: 1,
  student_id_locked: false, subject_id_locked: false, student_label: '', subject_label: '',
});

const showAbsenceModal = ref(false);
const absenceForm = reactive({ student_id: '', subject_id: '', date: '', motivated: false, reason: '' });

const typeLabels = { oral: 'Oral', scris: 'Scris', teza: 'Teză', proiect: 'Proiect', referat: 'Referat', practica: 'Practică' };
function gradeTypeLabel(t) { return typeLabels[t] || t; }
function formatDate(s) { return new Date(s).toLocaleDateString('ro-RO'); }
function gradeClass(v) { if (v == null) return ''; if (v < 5) return 'grade-fail'; if (v < 7) return 'grade-mid'; return 'grade-good'; }

async function reload() {
  loading.value = true;
  try {
    if (auth.isStudent) {
      carnet.value = await api.myCarnet(selectedSemester.value ? { semester: selectedSemester.value } : {});
    } else if (selectedClass.value) {
      await loadClass();
    }
  } catch (e) {
    ui.error(e.message);
  } finally {
    loading.value = false;
  }
}

async function loadClass() {
  catalogLoading.value = true;
  try {
    classData.value = await api.classCatalog(selectedClass.value, selectedSemester.value ? { semester: selectedSemester.value } : {});
  } catch (e) {
    ui.error(e.message);
  } finally {
    catalogLoading.value = false;
  }
}

function openAddGrade(student = null, subject = null) {
  editingGrade.value = null;
  Object.assign(gradeForm, {
    student_id: student?.id || '',
    subject_id: subject?.id || '',
    value: null,
    type: 'oral',
    description: '',
    semester: yearInfo.value?.semester || 1,
    student_id_locked: !!student,
    subject_id_locked: !!subject,
    student_label: student ? `${student.last_name} ${student.first_name}` : '',
    subject_label: subject ? subject.name : '',
  });
  showGradeModal.value = true;
}

function openEditGrade(g) {
  editingGrade.value = g;
  const student = classData.value.students.find((s) => s.id === g.student_id);
  const subject = classData.value.subjects.find((s) => s.id === g.subject_id);
  Object.assign(gradeForm, {
    student_id: g.student_id,
    subject_id: g.subject_id,
    value: g.value,
    type: g.type,
    description: g.description || '',
    semester: g.semester,
    student_id_locked: true,
    subject_id_locked: true,
    student_label: student ? `${student.last_name} ${student.first_name}` : '',
    subject_label: subject ? subject.name : '',
  });
  showGradeModal.value = true;
}

function closeGradeModal() {
  showGradeModal.value = false;
  editingGrade.value = null;
}

async function saveGrade() {
  try {
    if (editingGrade.value) {
      await api.updateGrade(editingGrade.value.id, {
        value: gradeForm.value, type: gradeForm.type,
        description: gradeForm.description, semester: gradeForm.semester,
      });
      ui.success('Notă actualizată');
    } else {
      await api.createGrade({
        student_id: gradeForm.student_id, subject_id: gradeForm.subject_id,
        value: gradeForm.value, type: gradeForm.type,
        description: gradeForm.description, semester: gradeForm.semester,
      });
      ui.success('Notă adăugată');
    }
    closeGradeModal();
    loadClass();
  } catch (e) {
    ui.error(e.message);
  }
}

async function deleteGrade() {
  if (!confirm(`Ștergeți nota ${editingGrade.value.value}?`)) return;
  try {
    await api.deleteGrade(editingGrade.value.id);
    ui.success('Notă ștearsă');
    closeGradeModal();
    loadClass();
  } catch (e) {
    ui.error(e.message);
  }
}

function openAddAbsence() {
  Object.assign(absenceForm, {
    student_id: '', subject_id: '', date: new Date().toISOString().slice(0, 10), motivated: false, reason: '',
  });
  showAbsenceModal.value = true;
}

async function saveAbsence() {
  try {
    await api.createAbsence({
      student_id: absenceForm.student_id,
      subject_id: absenceForm.subject_id || null,
      date: absenceForm.date,
      motivated: absenceForm.motivated,
      reason: absenceForm.reason,
    });
    ui.success('Absență înregistrată');
    showAbsenceModal.value = false;
    loadClass();
  } catch (e) {
    ui.error(e.message);
  }
}

onMounted(async () => {
  yearInfo.value = await api.getYear();
  if (!auth.isStudent) {
    const [{ classes: c }, { subjects: s }] = await Promise.all([api.listClasses(), api.listSubjects()]);
    classes.value = c;
    subjects.value = s;
  }
  await reload();
});
</script>

<style scoped>
.grade-pill {
  display: inline-block;
  min-width: 26px;
  padding: 2px 8px;
  margin: 2px 3px 2px 0;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: 13px;
  text-align: center;
}
.grade-pill.clickable { cursor: pointer; }
.grade-pill.clickable:hover { background: var(--color-primary); color: white; }

.add-grade {
  display: inline-flex;
  width: 22px; height: 22px;
  align-items: center; justify-content: center;
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  margin-left: 2px;
}
.add-grade:hover { background: var(--color-primary); color: white; border-style: solid; }

.grade-fail { color: var(--color-danger); }
.grade-mid { color: var(--color-warning); }
.grade-good { color: var(--color-success); }

.stat-label { color: var(--color-text-muted); font-size: 13px; font-weight: 500; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--color-primary-dark); }
.stat.warn .stat-value { color: var(--color-warning); }

.catalog-table {
  min-width: 100%;
  border-collapse: collapse;
}
.catalog-table th, .catalog-table td {
  vertical-align: top;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  font-size: 13px;
}
.catalog-table .sticky-col {
  position: sticky;
  left: 0;
  background: white;
  z-index: 2;
  min-width: 180px;
  white-space: nowrap;
}
.catalog-table thead .sticky-col { background: #f8fafc; }
.catalog-table .subject-col { min-width: 140px; }
.catalog-table .cell { min-width: 140px; }
.grades-row { display: flex; flex-wrap: wrap; align-items: center; }
.cell-avg { margin-top: 4px; font-weight: 700; font-size: 14px; }
.cell-abs { margin-top: 2px; font-size: 11px; color: var(--color-warning); }
.danger-text { color: var(--color-danger); }

@media (max-width: 768px) {
  .catalog-table .sticky-col { min-width: 120px; }
}
</style>
