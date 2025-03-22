import type { RouteRecordRaw } from 'vue-router'

const authenticationRoute: RouteRecordRaw = {
    path: '/',
    meta: { auth: false },
    children: [
        {
            path: 'login',  // /auth/login
            name: 'login',
            component: () => import('@/views/login.vue')
        },
        {
            path: 'register',  // /auth/register
            name: 'register',
            component: () => import('@/views/register.vue')
        },
    ]
};

export default authenticationRoute
