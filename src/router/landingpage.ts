import type { RouteRecordRaw } from 'vue-router'

const landingpageRoute: RouteRecordRaw = {
    path: '',
    name: 'landing',
    meta: { auth: false },
    component: () => import('@/views/index.vue')
};

export default landingpageRoute;
