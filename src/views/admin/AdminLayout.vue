<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>{{ isMerchant ? '商家管理中心' : '莆田文旅管理后台' }}</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          router
          background-color="#001529"
          text-color="#fff"
          active-text-color="#1890ff"
        >
          <!-- 商家中心 -->
          <template v-if="isMerchant">
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据看板</span>
            </el-menu-item>

            <el-sub-menu index="business">
              <template #title>
                <el-icon><Shop /></el-icon>
                <span>商家业务</span>
              </template>
              <el-menu-item index="/admin/merchant-foods">美食管理</el-menu-item>
              <el-menu-item index="/admin/merchant-hotels">酒店管理</el-menu-item>
              <el-menu-item index="/admin/merchant-attractions">景点管理</el-menu-item>
              <el-menu-item index="/admin/merchant-orders">订单管理</el-menu-item>
            </el-sub-menu>
          </template>

          <!-- 管理员菜单 -->
          <template v-else>
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据看板</span>
            </el-menu-item>

            <el-sub-menu index="user">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/admin/users">用户列表</el-menu-item>
              <el-menu-item index="/admin/user-certification">认证审核</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="audit">
              <template #title>
                <el-icon><DocumentChecked /></el-icon>
                <span>内容审核</span>
              </template>
              <el-menu-item index="/admin/audit-content">内容审核</el-menu-item>
              <el-menu-item index="/admin/audit-records">审核记录</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="statistics">
              <template #title>
                <el-icon><TrendCharts /></el-icon>
                <span>数据统计</span>
              </template>
              <el-menu-item index="/admin/statistics-user">用户统计</el-menu-item>
              <el-menu-item index="/admin/statistics-content">内容统计</el-menu-item>
              <el-menu-item index="/admin/statistics-hot">热门排行</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/admin/announcements">
              <el-icon><Bell /></el-icon>
              <span>公告管理</span>
            </el-menu-item>

            <el-sub-menu index="content">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>内容管理</span>
              </template>
              <el-menu-item index="/admin/manage-content">内容列表</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="resource">
              <template #title>
                <el-icon><OfficeBuilding /></el-icon>
                <span>资源管理</span>
              </template>
              <el-menu-item index="/admin/manage-hotel">酒店管理</el-menu-item>
              <el-menu-item index="/admin/manage-food">美食管理</el-menu-item>
              <el-menu-item index="/admin/manage-attraction">景点管理</el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="breadcrumb">{{ breadcrumb }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :src="userInfo.avatar" :size="32" />
                <span class="username">{{ userInfo.nickname || userInfo.username }}</span>
                <el-tag v-if="isMerchant" type="warning" size="small">商家</el-tag>
                <el-tag v-else type="danger" size="small">管理员</el-tag>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="home">返回前台</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataAnalysis, User, DocumentChecked, TrendCharts, Bell, Document, OfficeBuilding, Shop } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const userInfo = ref<any>({})
const activeMenu = computed(() => route.path)

// 判断是否是商家（userType=2 是商家，userType=4 是管理员）
const isMerchant = computed(() => {
  return userInfo.value.userType === 2
})

const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': '数据看板',
  // 商家菜单
  '/admin/merchant-foods': '美食管理',
  '/admin/merchant-hotels': '酒店管理',
  '/admin/merchant-attractions': '景点管理',
  '/admin/merchant-orders': '订单管理',
  // 管理员菜单
  '/admin/users': '用户列表',
  '/admin/user-certification': '认证审核',
  '/admin/audit-content': '内容审核',
  '/admin/audit-records': '审核记录',
  '/admin/statistics-user': '用户统计',
  '/admin/statistics-content': '内容统计',
  '/admin/statistics-hot': '热门排行',
  '/admin/announcements': '公告管理',
  '/admin/manage-content': '内容管理',
  '/admin/manage-hotel': '酒店管理',
  '/admin/manage-food': '美食管理',
  '/admin/manage-attraction': '景点管理'
}

const breadcrumb = computed(() => breadcrumbMap[route.path] || '')

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('userInfo')
    ElMessage.success('退出成功')
    router.push('/login')
  } else if (command === 'home') {
    router.push('/')
  }
}

onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr)
    // 验证是否为管理员或商家
    if (userInfo.value.userType !== 2 && userInfo.value.userType !== 4) {
      ElMessage.error('无管理权限')
      router.push('/')
    }
  } else {
    ElMessage.error('请先登录')
    router.push('/login')
  }
})
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  overflow: hidden;

  .el-container {
    height: 100%;
  }

  .sidebar {
    background: #001529;
    height: 100vh;
    overflow-y: auto;

    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #002140;

      h2 {
        color: #fff;
        font-size: 18px;
        margin: 0;
        font-weight: 600;
      }
    }

    .admin-menu {
      border: none;
    }
  }

  .header {
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;

    .header-left {
      flex: 1;
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .username {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }

  .main-content {
    background: #f0f2f5;
    padding: 24px;
    overflow-y: auto;
  }
}

:deep(.el-sub-menu__title) {
  color: #fff !important;
}
</style>
