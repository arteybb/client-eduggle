import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import authenticationRoute from './authentication';
import homeRoute from './home';
import courseRoute from './course';
import teacherRoute from './teacher';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'landingPage',
    component: () => import('@/views/index.vue')
  },
  authenticationRoute,
  homeRoute,
  courseRoute,
  teacherRoute,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { auth: true },
    component: () => import('@/views/NotFound.vue'),
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initAuth();





  if (!authStore.user && to.meta?.auth) {
    return next('/login');

  }
  if (authStore.user && (to.path === '/login' || to.path === '/register')) {
    return next('/home');
  }




  if (to.meta?.teacherOnly && (!authStore.user || authStore.user.role !== 'T')) {
    return next('/home');
  }




  next();
});

export default router
