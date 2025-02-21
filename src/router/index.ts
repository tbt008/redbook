import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import request from '@/util/request'
import { ElMessage } from 'element-plus'

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
    // {
    //   path: '/circle',
    //   name: 'circle',
    //   component: () => import('@/views/circle.vue')
    // },
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
      path: '/user/:id',
      name: 'user',
      component: () => import('@/views/person/profile.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/admin.vue'),
      meta: { requiresAdmin: true },
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
          // meta: { title: '系统管理' }
        },
        {
          path: 'notice',
          name: 'noticeManage',
          component: () => import('@/views/admin/noticeManage.vue')
        },

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
      path: '/systemUpdate',
      name: 'systemUpdate',
      component: () => import('@/views/error/systemUpdate.vue')
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

// 添加路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查该路由是否需要管理员权限或是否访问 /admin 路径
  if (to.matched.some(record => record.meta.requiresAdmin) || to.path.startsWith('/admin')) {
    // 检查是否有token
    const token = localStorage.getItem('authToken')
    if (!token) {
      ElMessage.error('请先登录')
      next('/login')
      return
    }

    try {
      // 获取用户信息检查权限
      const res = await request.get('/user/get/user') as any
      if (res.code === 200 && res.data.permissionList &&
        (res.data.permissionList.includes(5006) || res.data.permissionList.includes(5007))) {
        next() // 是管理员，允许访问
      } else {
        ElMessage.error('您没有管理员权限')
        next('/home') // 不是管理员，跳转到首页
      }
    } catch (error) {
      ElMessage.error('获取用户信息失败')
      next('/login')
    }
  } else {
    next() // 不需要管理员权限的路由直接放行
  }
})

export default router
