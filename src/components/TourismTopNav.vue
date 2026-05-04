<template>
  <header class="tourism-top-nav" :class="{ scrolled: isScrolled }">
    <div class="nav-inner app-page">
      <div class="logo-section" @click="router.push('/')">
        <div class="logo">
          <span class="logo-icon">🏝️</span>
          <span class="logo-text">莆田文旅</span>
        </div>
        <div class="logo-subtitle">发现莆田之美</div>
      </div>

      <nav class="main-nav">
        <a
          v-for="item in navItems"
          :key="item.key"
          :class="['nav-item', { active: activeMenu === item.key }]"
          @click="handleMenuSelect(item.key)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.label }}</span>
        </a>
      </nav>

      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索景点、美食、酒店、攻略..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>

        <div class="user-section">
          <template v-if="isLogin">
            <el-dropdown @command="handleCommand">
              <div class="user-avatar-wrapper">
                <el-avatar :src="userInfo.avatar || '/default-avatar.png'" :size="36">
                  {{ displayUserName.slice(0, 1) }}
                </el-avatar>
                <span class="user-name">{{ displayUserName }}</span>
                <el-icon class="arrow-down"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <el-dropdown-item command="center">个人中心</el-dropdown-item>
                  <el-dropdown-item command="publish">发布内容</el-dropdown-item>
                  <el-dropdown-item command="admin" v-if="isAdminOrMerchant" divided>
                    {{ isMerchant ? '商家中心' : '管理后台' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" class="login-btn" @click="router.push('/login')">登录</el-button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, Search } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const isScrolled = ref(false)
const isLogin = ref(false)
const userInfo = ref<Record<string, any>>({})

const navItems = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'attraction', label: '景点', icon: '🌏' },
  { key: 'food', label: '美食', icon: '🍜' },
  { key: 'hotel', label: '酒店', icon: '🏨' },
  { key: 'guide', label: '攻略', icon: '📝' }
]

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/attraction')) return 'attraction'
  if (path.startsWith('/food')) return 'food'
  if (path.startsWith('/hotel')) return 'hotel'
  if (path.startsWith('/content')) return 'guide'
  return 'home'
})

const displayUserName = computed(() => {
  return userInfo.value.nickName || userInfo.value.nickname || userInfo.value.userName || userInfo.value.username || '用户'
})

const isMerchant = computed(() => Number(userInfo.value.role) === 2)
const isAdmin = computed(() => Number(userInfo.value.role) === 1)
const isAdminOrMerchant = computed(() => isAdmin.value || isMerchant.value)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 16
}

const handleMenuSelect = (key: string) => {
  const routeMap: Record<string, any> = {
    home: { path: '/home', query: { menu: 'home' } },
    attraction: { path: '/home', query: { menu: 'attraction' } },
    food: { path: '/home', query: { menu: 'food' } },
    hotel: { path: '/home', query: { menu: 'hotel' } },
    guide: { path: '/home', query: { menu: 'guide' } }
  }
  router.push(routeMap[key] || { path: '/home', query: { menu: 'home' } })
}

const handleSearch = () => {
  router.push({
    path: '/search',
    query: searchKeyword.value.trim() ? { keyword: searchKeyword.value.trim() } : {}
  })
}

const handleCommand = (command: string) => {
  if (command === 'center') {
    router.push('/user/center')
    return
  }
  if (command === 'publish') {
    router.push('/publish')
    return
  }
  if (command === 'admin') {
    router.push('/admin')
    return
  }

  localStorage.removeItem('auth-token')
  localStorage.removeItem('userInfo')
  isLogin.value = false
  userInfo.value = {}
  ElMessage.success('退出成功')
}

const getUserInfo = async () => {
  try {
    const res: any = await request.get('/user/info')
    if (res?.code === 200) {
      userInfo.value = res.data || {}
      localStorage.setItem('userInfo', JSON.stringify(res.data || {}))
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

onMounted(() => {
  searchKeyword.value = typeof route.query.keyword === 'string' ? route.query.keyword : ''
  isLogin.value = !!localStorage.getItem('auth-token')
  if (isLogin.value) {
    getUserInfo()
  }
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.tourism-top-nav {
  position: sticky;
  top: 0;
  z-index: 140;
  background: rgba(255, 252, 246, 0.86);
  border-bottom: 1px solid rgba(18, 51, 45, 0.08);
  backdrop-filter: blur(18px);
  transition: box-shadow 0.25s ease, background 0.25s ease;

  &.scrolled {
    box-shadow: 0 14px 30px rgba(18, 51, 45, 0.08);
    background: rgba(255, 252, 246, 0.94);
  }
}

.nav-inner {
  min-height: 78px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #1a5f4a, #2d8b6f);
  box-shadow: 0 12px 22px rgba(26, 95, 74, 0.2);
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  color: #17362f;
}

.logo-subtitle {
  padding-left: 54px;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: #7a8b85;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  min-width: 0;
}

.nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  color: #4a5f59;
  cursor: pointer;
  transition: all 0.22s ease;
}

.nav-item:hover,
.nav-item.active {
  color: #17362f;
  background: rgba(31, 111, 95, 0.08);
}

.nav-icon {
  font-size: 15px;
}

.nav-text {
  font-size: 14px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.search-box {
  width: min(320px, 32vw);
  height: 46px;
  display: flex;
  align-items: center;
  padding: 0 6px 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(18, 51, 45, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.search-input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #17362f;
  font-size: 14px;
}

.search-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, #1f6f5f, #2d8b6f);
  cursor: pointer;
}

.user-avatar-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(18, 51, 45, 0.08);
  cursor: pointer;
}

.user-name {
  max-width: 84px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: #23413a;
}

.arrow-down {
  color: #6e817a;
}

.login-btn {
  border-radius: 999px;
  padding-inline: 18px;
}

@media (max-width: 1100px) {
  .nav-inner {
    grid-template-columns: 1fr;
    padding: 14px 0;
  }

  .main-nav {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .header-actions {
    justify-content: space-between;
  }

  .search-box {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .logo-subtitle,
  .nav-text,
  .user-name {
    display: none;
  }

  .nav-item {
    padding: 10px 12px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
