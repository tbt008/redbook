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
            <div class="header-badge">文旅控制台</div>
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
  background:
    radial-gradient(circle at top left, rgba(214, 154, 45, 0.08), transparent 26%),
    linear-gradient(180deg, #f6f7f4 0%, #eef4f0 100%);

  .el-container {
    height: 100%;
  }

  .sidebar {
    position: relative;
    background:
      radial-gradient(circle at top, rgba(214, 154, 45, 0.18), transparent 28%),
      linear-gradient(180deg, #16342c 0%, #0e201c 58%, #091613 100%);
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 20px 0 48px rgba(9, 22, 19, 0.24);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(160deg, rgba(255, 255, 255, 0.04), transparent 32%),
        repeating-linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.03) 0,
          rgba(255, 255, 255, 0.03) 1px,
          transparent 1px,
          transparent 18px
        );
      opacity: 0.45;
    }

    .logo {
      position: relative;
      z-index: 1;
      min-height: 88px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 18px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      h2 {
        color: #fff;
        font-size: 18px;
        margin: 0;
        font-weight: 600;
        letter-spacing: 1px;
        text-align: center;
      }
    }

    .admin-menu {
      border: none;
    }
  }

  .header {
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(18, 51, 45, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-shadow: 0 10px 32px rgba(18, 51, 45, 0.06);

    .header-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .header-badge {
      width: fit-content;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(31, 111, 95, 0.08);
      color: var(--app-primary);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.84);
        border: 1px solid rgba(18, 51, 45, 0.08);
        box-shadow: 0 12px 28px rgba(18, 51, 45, 0.08);

        .username {
          font-size: 14px;
          color: var(--app-text);
          font-weight: 600;
        }
      }
    }
  }

  .main-content {
    background: transparent;
    padding: 24px;
    overflow-y: auto;
  }
}

:deep(.el-sub-menu__title) {
  color: #fff !important;
}

:deep(.admin-menu) {
  border-right: none !important;
  background: transparent !important;
  position: relative;
  z-index: 1;
  padding-top: 12px;
}

:deep(.admin-menu .el-menu-item),
:deep(.admin-menu .el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  margin: 7px 12px;
  border-radius: 14px;
  font-weight: 600;
  transition: all 0.22s ease;
}

:deep(.admin-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(214, 154, 45, 0.24), rgba(255, 255, 255, 0.1)) !important;
  color: #ffffff !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.16);
}

:deep(.admin-menu .el-menu-item:hover),
:deep(.admin-menu .el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.header-left .el-breadcrumb__inner),
:deep(.header-left .el-breadcrumb__inner a) {
  color: var(--app-text-muted) !important;
}

:deep(.header-left .el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--app-ink) !important;
  font-weight: 700;
}

@media (max-width: 768px) {
  .admin-layout {
    .header {
      padding: 0 16px;

      .header-badge {
        display: none;
      }
    }

    .main-content {
      padding: 16px;
    }
  }
}
</style>
