import type { RouteRecordRaw } from 'vue-router'

const teacherRoute: RouteRecordRaw = {
    path: '/teacher',
    meta: { auth: true },
    children: [
        {
            path: 'dashboard',
            name: 'teacher-dashboard',
            component: () => import('@/views/teacher/Dashboard.vue'),
            meta: { teacherOnly: true }
        },
        {
            path: 'courses/create',
            name: 'teacher-course-create',
            component: () => import('@/views/teacher/CourseCreate.vue'),
            meta: { teacherOnly: true }
        },
        {
            path: 'courses/:id/edit',
            name: 'teacher-course-edit',
            component: () => import('@/views/teacher/CourseEdit.vue'),
            props: true,
            meta: { teacherOnly: true }
        },
        {
            path: 'courses/:id/lessons',
            name: 'teacher-course-lessons',
            component: () => import('@/views/teacher/LessonManagement.vue'),
            props: true,
            meta: { teacherOnly: true }
        },
        {
            path: 'courses/:id/quizzes',
            name: 'teacher-course-quizzes',
            component: () => import('@/views/teacher/QuizManagement.vue'),
            props: true,
            meta: { teacherOnly: true }
        }
    ]
};

export default teacherRoute;
