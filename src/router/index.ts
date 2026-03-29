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
      path: '/login',
      name: 'login',
      component: () => import('@/views/login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/register.vue')
    },
    {
      path: '/content/:id',
      name: 'contentDetail',
      component: () => import('@/views/ContentDetail.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/Search.vue')
    },
    // 个人主页路由
    {
      path: '/profile',
      component: () => import('@/views/person/personMain.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'notes',
          name: 'personNotes',
          component: () => import('@/views/person/child/personNote.vue')
        },
        {
          path: 'info',
          name: 'personInfo',
          component: () => import('@/views/person/child/personInfo.vue')
        },
        {
          path: 'favour',
          name: 'personFavour',
          component: () => import('@/views/person/child/personFavour.vue')
        }
      ]
    },
    {
      path: '/user/center',
      name: 'userCenter',
      component: () => import('@/views/UserCenter.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/PublishContent.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/merchant/publish',
      name: 'merchantPublish',
      component: () => import('@/views/MerchantPublish.vue'),
      meta: { requiresAuth: true, requiresMerchant: true }
    },
    {
      path: '/attraction/:id',
      name: 'attractionDetail',
      component: () => import('@/views/AttractionDetail.vue')
    },
    {
      path: '/food/:id',
      name: 'foodDetail',
      component: () => import('@/views/FoodDetail.vue')
    },
    {
      path: '/hotel/:id',
      name: 'hotelDetail',
      component: () => import('@/views/HotelDetail.vue')
    },
    {
      path: '/orders',
      name: 'myOrders',
      component: () => import('@/views/MyOrders.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ai-assistant',
      name: 'aiAssistant',
      component: () => import('@/views/AIAssistant.vue')
    },
    {
      path: '/ai-itinerary',
      name: 'aiItinerary',
      component: () => import('@/views/AIItineraryAssistant.vue')
    },
    {
      path: '/ai-map',
      name: 'aiMapPlanner',
      component: () => import('@/views/AIMapPlanner.vue')
    },
    {
      path: '/eticket/:orderNo',
      name: 'eticketView',
      component: () => import('@/views/ETicketView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/itinerary/create',
      name: 'itineraryCreate',
      component: () => import('@/views/ItineraryCreate.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/itinerary/editor',
      name: 'itineraryEditor',
      component: () => import('@/views/ItineraryEditor.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/itinerary/list',
      name: 'myItineraries',
      component: () => import('@/views/MyItineraries.vue'),
      meta: { requiresAuth: true }
    },
    // 管理后台路由
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdminOrMerchant: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'adminDashboard',
          component: () => import('@/views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'adminUsers',
          component: () => import('@/views/admin/UserManagement.vue')
        },
        {
          path: 'user-certification',
          name: 'adminUserCertification',
          component: () => import('@/views/admin/UserManagement.vue')
        },
        {
          path: 'audit-content',
          name: 'adminAuditContent',
          component: () => import('@/views/admin/ContentAudit.vue')
        },
        {
          path: 'audit-records',
          name: 'adminAuditRecords',
          component: () => import('@/views/admin/AuditRecords.vue')
        },
        {
          path: 'statistics-user',
          name: 'adminStatisticsUser',
          component: () => import('@/views/admin/UserStatistics.vue')
        },
        {
          path: 'statistics-content',
          name: 'adminStatisticsContent',
          component: () => import('@/views/admin/ContentStatistics.vue')
        },
        {
          path: 'statistics-hot',
          name: 'adminStatisticsHot',
          component: () => import('@/views/admin/HotStatistics.vue')
        },
        {
          path: 'announcements',
          name: 'adminAnnouncements',
          component: () => import('@/views/admin/AnnouncementManagement.vue')
        },
        {
          path: 'manage-content',
          name: 'adminManageContent',
          component: () => import('@/views/admin/ContentManagement.vue')
        },
        {
          path: 'manage-hotel',
          name: 'adminManageHotel',
          component: () => import('@/views/admin/HotelManagement.vue')
        },
        {
          path: 'manage-food',
          name: 'adminManageFood',
          component: () => import('@/views/admin/FoodManagement.vue')
        },
        {
          path: 'manage-attraction',
          name: 'adminManageAttraction',
          component: () => import('@/views/admin/AttractionManagement.vue')
        },
        // 商家管理路由
        {
          path: 'merchant-foods',
          name: 'merchantFoods',
          component: () => import('@/views/admin/MerchantFoods.vue')
        },
        {
          path: 'merchant-hotels',
          name: 'merchantHotels',
          component: () => import('@/views/admin/MerchantHotels.vue')
        },
        {
          path: 'merchant-attractions',
          name: 'merchantAttractions',
          component: () => import('@/views/admin/MerchantAttractions.vue')
        },
        {
          path: 'merchant-orders',
          name: 'merchantOrders',
          component: () => import('@/views/admin/MerchantOrders.vue')
        }
      ]
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
  // 检查该路由是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否有token
    const token = localStorage.getItem('auth-token')
    if (!token) {
      ElMessage.error('请先登录')
      next('/login')
      return
    }

    // 检查是否需要管理员权限
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        if (userInfo.userType !== 4) {
          ElMessage.error('无管理员权限')
          next('/')
          return
        }
      } else {
        ElMessage.error('请先登录')
        next('/login')
        return
      }
    }

    // 检查是否需要管理员或商家权限
    if (to.matched.some(record => record.meta.requiresAdminOrMerchant)) {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        // 允许userType=2(商家)或userType=4(管理员)访问
        if (userInfo.userType !== 2 && userInfo.userType !== 4) {
          ElMessage.error('无权限访问管理后台')
          next('/')
          return
        }
      } else {
        ElMessage.error('请先登录')
        next('/login')
        return
      }
    }

    // 检查是否需要商家权限
    if (to.matched.some(record => record.meta.requiresMerchant)) {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        if (userInfo.userType !== 2 && userInfo.userType !== 4) {
          ElMessage.error('只有商家才能访问此页面')
          next('/')
          return
        }
      } else {
        ElMessage.error('请先登录')
        next('/login')
        return
      }
    }

    next()
  } else {
    next()
  }
})

export default router
