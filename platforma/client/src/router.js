import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('./views/Login.vue'), meta: { public: true } },
  { path: '/register', name: 'register', component: () => import('./views/Register.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('./views/Dashboard.vue') },
  { path: '/resurse', name: 'resources', component: () => import('./views/Resources.vue') },
  { path: '/resurse/:id', name: 'resource', component: () => import('./views/ResourceDetail.vue') },
  { path: '/teme', name: 'homework', component: () => import('./views/Homework.vue') },
  { path: '/teme/:id', name: 'homework-detail', component: () => import('./views/HomeworkDetail.vue') },
  { path: '/progres', name: 'progress', component: () => import('./views/Progress.vue') },
  { path: '/utilizatori', name: 'users', component: () => import('./views/Users.vue'), meta: { roles: ['admin'] } },
  { path: '/setari', name: 'settings', component: () => import('./views/Settings.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.token && !auth.user) {
    await auth.fetchMe();
  }
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.public && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: 'dashboard' };
  }
});

export default router;
