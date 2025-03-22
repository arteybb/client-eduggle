import type { RouteRecordRaw } from 'vue-router'

const courseRoute: RouteRecordRaw = {
  path: '/courses',
  meta: { auth: true },
  children: [
    {
      path: '',
      name: 'courses',
      component: () => import('@/views/courses/CoursesPage.vue')
    },
    {
      path: 'view/:id',
      name: 'course-view',
      component: () => import('@/views/courses/CoursePageView.vue'),
      props: true
    },
    {
      path: 'add',
      name: 'course-add',
      component: () => import('@/views/courses/CourseAdd.vue')
    },
    {
      path: ':courseId/discussions/:id',
      name: 'discussion-detail',
      component: () => import('@/views/courses/DiscussionDetailView.vue'),
      props: true
    },
    {
      path: ':courseId/lesson',
      name: 'lesson-view',
      component: () => import('@/views/courses/CourseViewMain.vue'),
      props: true
    },
  ]
};


export default courseRoute
