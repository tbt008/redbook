import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },

    {
      path: '/problems',
      name: 'problemList',
      component: () => import('@/views/problemList.vue')
    },
    {
      path: '/contest',
      name: 'contest',
      component: () => import('@/views/contest.vue')
    },

    {
      path: '/contest/detail/:id',
      name: 'contestInfo',
      component: () => import('@/views/contestInfo.vue')
    },
    {
      path: '/question',
      name: 'question',
      component: () => import('@/views/problems.vue')
    },
    {
      path: '/circle',
      name: 'circle',
      component: () => import('@/views/circle.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/about.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login.vue')
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/person/profile.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/admin.vue'),
      children: [
        {
          path: 'problem',
          name: 'problemManage',
          component: () => import('@/views/admin/problemManage.vue')
        },
        {
          path: 'contest',
          name: 'contestManage',
          component: () => import('@/views/admin/contestManage.vue')
        },
        {
          path: 'user',
          name: 'userManage',
          component: () => import('@/views/admin/userManage.vue')
        },
        {
          path: 'discussion',
          name: 'discussionManage',
          component: () => import('@/views/admin/discussionManage.vue')
        },
        {
          path: 'excel',
          name: 'excelManager',
          component: () => import('@/views/admin/excelManager.vue')
        },
        {
          path: 'class',
          name: 'classManager',
          component: () => import('@/views/admin/classManager.vue')
        },
        {
          path: 'role',
          name: 'roleManager',
          component: () => import('@/views/admin/roleManager.vue')
        },
        {
          path: 'system',
          name: 'SystemManager',
          component: () => import('@/views/admin/systemManager.vue'),
          meta: { title: '系统管理' }
        }
      ]
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('@/views/Ai.vue')
    },
    { path: '/discuss', name: 'discussion', component: () => import('@/views/Discussion.vue') },
    {
      path: '/discuss/:id',
      name: 'discussionDetail',
      component: () => import('@/views/DiscussionDetail.vue')
    },
    {
      path: '/files/problemid=:problemid',
      name: 'ListFile',
      component: () => import('@/components/ListFiles.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/register.vue')
    },
    {
      path: '/submission/:id',
      name: 'submissionDetail',
      component: () => import('@/views/SubmissionDetail.vue')
    },
    {
      path: '/message',
      name: 'Message',
      component: () => import('@/views/message/message.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/error/404.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

export default router
