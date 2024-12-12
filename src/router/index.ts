import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
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
      path: '/question/editor',
      name: 'questionEditor',
      component: () => import('@/views/questionEditor.vue')
    },

    {
      path: '/contest/editor',
      name: 'contestEditor',
      component: () => import('@/views/contestEditor.vue')
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
      path: '/ai',
      name: 'ai',
      component: () => import('@/views/Ai.vue')
    }
  ]
})

export default router
