import type { RouteRecordRaw } from 'vue-router'

const homeRoute: RouteRecordRaw = {
    path: '/',
    meta: { auth: true },
    children: [
        {
            path: '/home',
            name: 'home',
            component: () => import('@/views/home/HomePage.vue')
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('@/views/chat/ChatView.vue')
        },
        {
            path: 'profile',
            name: 'profile',
            component: () => import('@/views/profile/ProfilePage.vue')
        },

    ]
}

export default homeRoute