const BASE = '/api';

function getToken() { return localStorage.getItem('token'); }

async function request(path, { method = 'GET', body, headers = {}, formData = false } = {}) {
  const opts = { method, headers: { ...headers } };
  const token = getToken();
  if (token) opts.headers.Authorization = `Bearer ${token}`;

  if (body) {
    if (formData) {
      opts.body = body;
    } else {
      opts.body = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes('application/json')) {
      try { msg = (await res.json()).error || msg; } catch (e) { /* noop */ }
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (ct.includes('application/json')) return res.json();
  return res;
}

export const api = {
  // auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  me: () => request('/auth/me'),
  changePassword: (current_password, new_password) =>
    request('/auth/change-password', { method: 'POST', body: { current_password, new_password } }),

  // users
  listUsers: (params = {}) => request('/users?' + new URLSearchParams(params)),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  listClasses: () => request('/users/classes'),

  // subjects
  listSubjects: () => request('/resources/subjects'),
  createSubject: (data) => request('/resources/subjects', { method: 'POST', body: data }),

  // resources
  listResources: (params = {}) => request('/resources?' + new URLSearchParams(params)),
  getResource: (id) => request(`/resources/${id}`),
  uploadResource: (formData) => request('/resources', { method: 'POST', body: formData, formData: true }),
  updateResource: (id, data) => request(`/resources/${id}`, { method: 'PUT', body: data }),
  deleteResource: (id) => request(`/resources/${id}`, { method: 'DELETE' }),
  downloadResourceUrl: (id) => `${BASE}/resources/${id}/download`,
  streamResourceUrl: (id) => `${BASE}/resources/${id}/stream`,

  // homework
  listHomework: (params = {}) => request('/homework?' + new URLSearchParams(params)),
  getHomework: (id) => request(`/homework/${id}`),
  createHomework: (formData) => request('/homework', { method: 'POST', body: formData, formData: true }),
  deleteHomework: (id) => request(`/homework/${id}`, { method: 'DELETE' }),
  submitHomework: (id, formData) => request(`/homework/${id}/submit`, { method: 'POST', body: formData, formData: true }),
  gradeSubmission: (subId, data) => request(`/homework/submissions/${subId}/grade`, { method: 'POST', body: data }),
  downloadSubmissionUrl: (id) => `${BASE}/homework/submissions/${id}/download`,
  downloadAttachmentUrl: (id) => `${BASE}/homework/attachments/${id}/download`,

  // progress
  myProgress: () => request('/progress/me'),
  studentProgress: (id) => request(`/progress/student/${id}`),
  classProgress: (className) => request(`/progress/class/${encodeURIComponent(className)}`),
  overview: () => request('/progress/overview'),

  // settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),
  getActivity: () => request('/settings/activity'),
};

export function authHeaderForUrl(url) {
  const token = getToken();
  return token ? `${url}${url.includes('?') ? '&' : '?'}token=${token}` : url;
}
