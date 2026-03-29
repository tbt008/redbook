<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <header class="main-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner">
        <div class="logo-section">
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
              placeholder="搜索景点、攻略、美食..."
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
                  <el-avatar :src="userInfo.avatar || '/default-avatar.png'" :size="36" />
                  <span class="user-name">{{ userInfo.nickName || userInfo.userName }}</span>
                  <el-icon class="arrow-down"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu class="user-dropdown">
                    <el-dropdown-item command="center">
                      <el-icon><User /></el-icon>
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item command="publish">
                      <el-icon><Edit /></el-icon>
                      发布内容
                    </el-dropdown-item>
                    <el-dropdown-item command="admin" v-if="isAdminOrMerchant" divided>
                      <el-icon><Setting /></el-icon>
                      {{ isMerchant ? '商家中心' : '管理后台' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="logout" divided>
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button type="primary" class="login-btn" @click="goLogin">登录</el-button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">探索</span>
          <span class="title-highlight">莆田</span>
          <span class="title-line">无限风光</span>
        </h1>
        <p class="hero-subtitle">寻访妈祖故里，感受海丝文化，品味闽中美食</p>

        <div class="hero-search">
          <div class="search-tabs">
            <button
              v-for="tab in searchTabs"
              :key="tab.type"
              :class="['search-tab', { active: searchType === tab.type }]"
              @click="searchType = tab.type"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-text">{{ tab.label }}</span>
            </button>
          </div>
          <div class="search-form">
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="searchPlaceholder"
              class="main-search-input"
              @keyup.enter="handleSearch"
            />
            <button class="search-button" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </button>
          </div>
          <div class="search-tags">
            <span class="tag-label">热门搜索：</span>
            <span
              v-for="tag in hotSearchTags"
              :key="tag"
              class="hot-tag"
              @click="quickSearch(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 快速分类入口 -->
      <div class="quick-entry">
        <div
          v-for="entry in quickEntries"
          :key="entry.label"
          class="entry-item"
          @click="navigateToCategory(entry.type)"
        >
          <div class="entry-icon">{{ entry.icon }}</div>
          <span class="entry-label">{{ entry.label }}</span>
        </div>
      </div>
    </section>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 精选推荐 -->
      <section class="featured-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">{{ currentCategoryTitle }}</h2>
            <p class="section-subtitle">精选内容，为您推荐</p>
          </div>
          <div class="section-actions">
            <el-button
              v-for="sort in sortOptions"
              :key="sort.value"
              :type="filterSort === sort.value ? 'primary' : 'default'"
              :class="['sort-btn', { active: filterSort === sort.value }]"
              @click="selectSort(sort.value)"
            >
              {{ sort.label }}
            </el-button>
          </div>
        </div>

        <!-- 筛选标签 -->
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">类型：</span>
            <div class="filter-pills">
              <span
                v-for="type in typeOptions"
                :key="type.value"
                :class="['filter-pill', { active: filterDataType === type.value }]"
                @click="selectDataType(type.value)"
              >
                {{ type.label }}
              </span>
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">地区：</span>
            <div class="filter-pills">
              <span
                v-for="region in regionOptions"
                :key="region"
                :class="['filter-pill', { active: filterRegion === region || (region === '全部' && !filterRegion) }]"
                @click="selectRegion(region)"
              >
                {{ region }}
              </span>
            </div>
          </div>
        </div>

        <!-- 内容卡片 -->
        <div v-loading="loading" class="content-grid">
          <div
            v-for="(item, index) in contentList"
            :key="`${item.id}-${item.dataType}`"
            class="content-card"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="goDetail(item)"
          >
            <div class="card-image-wrapper">
              <el-image
                :src="item.coverImage || '/default-cover.jpg'"
                fit="cover"
                class="card-image"
                loading="lazy"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="card-badges">
                <span v-if="item.dataType === 3" class="type-tag video">
                  <el-icon><VideoPlay /></el-icon>
                </span>
                <span :class="['type-tag', `type-${item.dataType}`]">
                  {{ getTypeName(item.dataType) }}
                </span>
              </div>
              <div class="card-overlay">
                <button class="preview-btn">
                  <el-icon><ZoomIn /></el-icon>
                  预览
                </button>
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-desc">{{ item.description }}</p>
              <div class="card-meta">
                <div class="meta-left">
                  <template v-if="item.authorName">
                    <el-avatar :src="item.authorAvatar" :size="20" />
                    <span class="author-name">{{ item.authorName }}</span>
                  </template>
                  <template v-else-if="item.region">
                    <el-icon class="meta-icon"><Location /></el-icon>
                    <span>{{ item.region }}</span>
                  </template>
                </div>
                <div class="meta-right">
                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    {{ item.viewCount || 0 }}
                  </span>
                  <span v-if="item.rating" class="meta-item rating">
                    <el-icon><Star /></el-icon>
                    {{ item.rating }}
                  </span>
                  <span v-else-if="item.likeCount" class="meta-item">
                    <el-icon><Star /></el-icon>
                    {{ item.likeCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && contentList.length === 0" class="empty-state">
          <template #image>
            <div class="empty-illustration">🌴</div>
          </template>
          <p class="empty-text">暂无相关内容，换个关键词试试？</p>
        </el-empty>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :pager-count="5"
            layout="prev, pager, next, jumper, total"
            background
            @current-change="loadContents"
          />
        </div>
      </section>
    </main>

    <!-- AI规划浮动按钮 -->
    <div class="ai-float-button" @click="goToAIMap">
      <div class="ai-content">
        <span class="ai-icon">🤖</span>
        <span class="ai-label">AI规划</span>
      </div>
      <div class="ai-ripple"></div>
    </div>

    <!-- 页脚 -->
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-icon">🏝️</span>
            <span>莆田文旅</span>
          </div>
          <p class="footer-desc">发现莆田之美，体验海丝文化</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <a href="#">平台介绍</a>
            <a href="#">联系方式</a>
            <a href="#">隐私政策</a>
          </div>
          <div class="link-group">
            <h4>服务支持</h4>
            <a href="#">帮助中心</a>
            <a href="#">意见反馈</a>
            <a href="#">版权声明</a>
          </div>
          <div class="link-group">
            <h4>关注我们</h4>
            <div class="social-icons">
              <span class="social-icon">📱</span>
              <span class="social-icon">💬</span>
              <span class="social-icon">📧</span>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 莆田文旅平台 All Rights Reserved</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  User,
  Edit,
  Setting,
  SwitchButton,
  ArrowDown,
  Location,
  View,
  Star,
  VideoPlay,
  ZoomIn,
  Picture
} from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()

// 滚动状态
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 80
}

// 状态
const activeMenu = ref('home')
const searchKeyword = ref('')
const searchType = ref('attraction')
const isSearching = ref(false)
const isLogin = ref(false)
const userInfo = ref<any>({})
const loading = ref(false)
const contentList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(16)
const total = ref(0)

// 判断是否为管理员
const isAdmin = computed(() => userInfo.value.userType === 4)

// 判断是否为商家
const isMerchant = computed(() => userInfo.value.userType === 2)

// 判断是否为商家或管理员
const isAdminOrMerchant = computed(() => userInfo.value.userType === 2 || userInfo.value.userType === 4)

// 搜索类型相关
const searchTabs = [
  { type: 'attraction', label: '景点', icon: '🏞️' },
  { type: 'food', label: '美食', icon: '🍜' },
  { type: 'hotel', label: '酒店', icon: '🏨' },
  { type: 'guide', label: '攻略', icon: '📖' }
]

const hotSearchTags = ['湄洲岛', '南少林', '莆田卤面', '九鲤湖']

const searchPlaceholder = computed(() => {
  const map: Record<string, string> = {
    attraction: '搜索景点名称、地区...',
    food: '搜索美食名称、餐厅...',
    hotel: '搜索酒店、民宿...',
    guide: '搜索攻略标题...'
  }
  return map[searchType.value] || '搜索...'
})

// 导航
const navItems = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'attraction', label: '景点', icon: '🏞️' },
  { key: 'food', label: '美食', icon: '🍜' },
  { key: 'hotel', label: '酒店', icon: '🏨' },
  { key: 'guide', label: '攻略', icon: '📖' }
]

// 快速入口
const quickEntries = [
  { type: 2, label: '景点', icon: '🏞️' },
  { type: 3, label: '美食', icon: '🍜' },
  { type: 4, label: '住宿', icon: '🏨' },
  { type: 1, label: '攻略', icon: '📖' },
  { type: 'map', label: '地图', icon: '🗺️' },
  { type: 'route', label: '路线', icon: '🛤️' }
]

// 筛选条件
const filterDataType = ref<number | null>(null)
const filterRegion = ref<string | null>(null)
const filterSort = ref<number>(1)

// 当前分类标题
const currentCategoryTitle = computed(() => {
  if (activeMenu.value === 'home') return '精选推荐'
  const map: Record<string, string> = {
    attraction: '景点推荐',
    food: '美食推荐',
    hotel: '酒店推荐',
    guide: '攻略精选'
  }
  return map[activeMenu.value] || '精选推荐'
})

// 筛选选项
const typeOptions = [
  { label: '全部', value: null },
  { label: '攻略', value: 1 },
  { label: '景点', value: 2 },
  { label: '美食', value: 3 },
  { label: '住宿', value: 4 }
]

const regionOptions = ['全部', '荔城区', '城厢区', '涵江区', '秀屿区', '湄洲岛', '仙游县']

const sortOptions = [
  { label: '最新', value: 1 },
  { label: '最热', value: 2 },
  { label: '评分', value: 3 }
]

// 检查登录状态
const checkLogin = () => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    isLogin.value = true
    getUserInfo()
  }
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res: any = await request.get('/user/info')
    if (res.code === 200) {
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 加载内容列表
const loadContents = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      sortType: filterSort.value
    }

    if (isSearching.value && searchKeyword.value.trim()) {
      params.title = searchKeyword.value.trim()
    }

    if (filterDataType.value !== null && filterDataType.value !== undefined) {
      params.dataType = filterDataType.value
    }

    if (filterRegion.value && filterRegion.value !== '全部') {
      params.region = filterRegion.value
    }

    console.log('Loading contents with params:', params)
    const res: any = await request.get('/content/search', { params })
    console.log('API response:', res)
    if (res.code === 200) {
      let list = res.data.list || res.data.records || []
      // 根据 id 和 dataType 去重，防止同一内容被多次显示
      const seen = new Set<string>()
      list = list.filter((item: any) => {
        const key = `${item.id}-${item.dataType}`
        if (seen.has(key)) {
          console.warn('Duplicate item detected:', key)
          return false
        }
        seen.add(key)
        return true
      })
      contentList.value = list
      total.value = res.data.total || 0
      console.log('Content loaded:', contentList.value.length, 'items')
    } else {
      console.error('API error:', res)
    }
  } catch (error) {
    ElMessage.error('加载内容失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 选择数据类型
const selectDataType = (value: number | null) => {
  filterDataType.value = value
  currentPage.value = 1
  loadContents()
}

// 选择地区
const selectRegion = (value: string) => {
  filterRegion.value = value === '全部' ? null : value
  currentPage.value = 1
  loadContents()
}

// 选择排序
const selectSort = (value: number) => {
  filterSort.value = value
  currentPage.value = 1
  loadContents()
}

// 获取类型名称
const getTypeName = (dataType: number) => {
  const typeMap: any = {
    1: '攻略',
    2: '景点',
    3: '美食',
    4: '住宿'
  }
  return typeMap[dataType] || '未知'
}

// 菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  isSearching.value = false
  searchKeyword.value = ''

  const typeMap: Record<string, number | null> = {
    home: null,
    attraction: 2,
    food: 3,
    hotel: 4,
    guide: 1
  }

  filterDataType.value = typeMap[index]
  currentPage.value = 1
  loadContents()
}

// 搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    isSearching.value = true
    currentPage.value = 1
    loadContents()
  }
}

// 快速搜索
const quickSearch = (tag: string) => {
  searchKeyword.value = tag
  handleSearch()
}

// 导航到分类
const navigateToCategory = (type: string | number) => {
  if (type === 'map') {
    router.push('/ai-map')
  } else if (type === 'route') {
    router.push('/route')
  } else {
    filterDataType.value = type as number
    currentPage.value = 1
    loadContents()
  }
}

// 用户菜单
const handleCommand = (command: string) => {
  if (command === 'center') {
    router.push('/user/center')
  } else if (command === 'publish') {
    router.push('/publish')
  } else if (command === 'admin') {
    router.push('/admin')
  } else if (command === 'logout') {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('userInfo')
    isLogin.value = false
    userInfo.value = {}
    ElMessage.success('退出成功')
    loadContents()
  }
}

// 跳转登录
const goLogin = () => {
  router.push('/login')
}

// 跳转详情
const goDetail = (item: any) => {
  const routeMap: Record<number, string> = {
    1: `/content/${item.id}`,
    2: `/attraction/${item.id}`,
    3: `/food/${item.id}`,
    4: `/hotel/${item.id}`
  }
  router.push(routeMap[item.dataType] || '/')
}

// 跳转AI地图规划
const goToAIMap = () => {
  router.push('/ai-map')
}

onMounted(() => {
  checkLogin()
  loadContents()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
// 主题色
$primary: #1a5f4a;
$primary-light: #2d8b6f;
$primary-dark: #0f3d2f;
$accent: #e8a838;
$accent-light: #f0c05a;
$text-primary: #1a1a1a;
$text-secondary: #666;
$text-muted: #999;
$border: #eee;
$bg-light: #f8f9fa;
$white: #fff;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 20px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.15);

.home-container {
  min-height: 100vh;
  background: $bg-light;
}

// 头部导航
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  background: transparent;

  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: $shadow-sm;

    .logo-text,
    .nav-item,
    .search-btn {
      color: $text-primary !important;
    }

    .logo-subtitle {
      color: $text-muted !important;
    }

    .search-box {
      background: $bg-light;
      border-color: $border;

      .search-input {
        color: $text-primary !important;

        &::placeholder {
          color: $text-muted;
        }
      }
    }

    .nav-item::after {
      background: $primary;
    }

    .user-avatar-wrapper {
      .user-name {
        color: $text-primary !important;
      }

      .arrow-down {
        color: $text-secondary !important;
      }

      &:hover {
        background: $bg-light;
      }
    }

    .login-btn {
      background: $accent;
      border: none;
      color: $white !important;

      &:hover {
        background: $accent-light;
      }
    }

    .nav-icon {
      filter: none;
    }

    .main-nav .nav-item .nav-icon {
      filter: none !important;
    }

    .logo-section .logo .logo-icon {
      filter: none;
    }
  }

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 40px;
  }

  .logo-section {
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;

      .logo-icon {
        font-size: 32px;
      }

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        color: $white;
        transition: color 0.3s;
      }
    }

    .logo-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 2px;
      transition: color 0.3s;
    }
  }

  .main-nav {
    display: flex;
    gap: 8px;

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      cursor: pointer;
      transition: color 0.3s;
      border-radius: 8px;

      .nav-icon {
        font-size: 16px;
        transition: filter 0.3s;
      }

      &:hover,
      &.active {
        color: $white;
        background: rgba(255, 255, 255, 0.1);
      }

      &.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 3px;
        background: $accent;
        border-radius: 2px;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 20px;

    .search-box {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 30px;
      padding: 0 16px;
      transition: all 0.3s;

      &:focus-within {
        background: $white;
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
      }

      .search-input {
        border: none;
        background: transparent;
        padding: 8px 12px;
        width: 200px;
        font-size: 14px;
        outline: none;

        &::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .search-btn {
        border: none;
        background: transparent;
        color: $white;
        cursor: pointer;
        padding: 4px;
        transition: color 0.3s;

        &:hover {
          color: $primary;
        }
      }

      &:focus-within .search-btn {
        color: $primary;
      }

      &:focus-within .search-input::placeholder {
        color: $text-muted;
      }
    }

    .user-section {
      .user-avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 12px 4px 4px;
        border-radius: 24px;
        transition: background 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-name {
          color: $white;
          font-size: 14px;
        }

        .arrow-down {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }
      }

      .login-btn {
        background: $accent;
        border: none;
        border-radius: 20px;
        padding: 8px 24px;
        font-weight: 500;

        &:hover {
          background: $accent-light;
        }
      }
    }
  }
}

:deep(.user-dropdown) {
  border-radius: 12px;
  padding: 8px;
  box-shadow: $shadow-md;

  .el-dropdown-menu__item {
    border-radius: 8px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 16px;
      color: $text-secondary;
    }
  }
}

// 英雄区域
.hero-section {
  position: relative;
  min-height: 580px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px 60px;
  overflow: hidden;

  .hero-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #0f3d2f 0%, #1a5f4a 50%, #2d8b6f 100%);

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    }

    .hero-pattern {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 80%, rgba(232, 168, 56, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(45, 139, 111, 0.2) 0%, transparent 50%);
    }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 800px;
  }

  .hero-title {
    margin: 0 0 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .title-line {
      font-size: 48px;
      font-weight: 700;
      color: $white;
      letter-spacing: 8px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .title-highlight {
      font-size: 72px;
      font-weight: 800;
      color: $accent;
      letter-spacing: 12px;
      text-shadow: 0 4px 30px rgba(232, 168, 56, 0.4);
      animation: titleFloat 3s ease-in-out infinite;
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 40px;
    letter-spacing: 2px;
  }

  .hero-search {
    background: $white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: $shadow-lg;

    .search-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid $border;

      .search-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border: none;
        background: $bg-light;
        border-radius: 24px;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
        color: $text-secondary;

        .tab-icon {
          font-size: 18px;
        }

        &:hover {
          background: rgba(26, 95, 74, 0.1);
        }

        &.active {
          background: $primary;
          color: $white;
        }
      }
    }

    .search-form {
      display: flex;
      gap: 12px;

      .main-search-input {
        flex: 1;
        border: 2px solid $border;
        border-radius: 12px;
        padding: 16px 20px;
        font-size: 15px;
        outline: none;
        transition: all 0.3s;

        &:focus {
          border-color: $primary;
          box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.1);
        }
      }

      .search-button {
        background: linear-gradient(135deg, $primary, $primary-light);
        border: none;
        border-radius: 12px;
        padding: 16px 32px;
        color: $white;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26, 95, 74, 0.3);
        }
      }
    }

    .search-tags {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      justify-content: center;

      .tag-label {
        font-size: 13px;
        color: $text-muted;
      }

      .hot-tag {
        padding: 4px 12px;
        background: rgba(232, 168, 56, 0.1);
        color: $accent;
        border-radius: 12px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: $accent;
          color: $white;
        }
      }
    }
  }

  .quick-entry {
    position: absolute;
    bottom: -40px;
    display: flex;
    gap: 24px;
    background: $white;
    padding: 20px 40px;
    border-radius: 16px;
    box-shadow: $shadow-md;
    z-index: 2;

    .entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s;

      .entry-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, $bg-light, #e8f0ec);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        transition: all 0.3s;
      }

      .entry-label {
        font-size: 13px;
        color: $text-secondary;
        font-weight: 500;
      }

      &:hover {
        transform: translateY(-4px);

        .entry-icon {
          background: linear-gradient(135deg, $primary, $primary-light);
          box-shadow: 0 8px 20px rgba(26, 95, 74, 0.3);
        }

        .entry-label {
          color: $primary;
        }
      }
    }
  }
}

@keyframes titleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

// 主体内容
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 40px 60px;
}

.featured-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;

    .section-title-group {
      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: $text-primary;
        display: flex;
        align-items: center;
        gap: 12px;

        &::before {
          content: '';
          width: 5px;
          height: 28px;
          background: linear-gradient(180deg, $primary, $primary-light);
          border-radius: 3px;
        }
      }

      .section-subtitle {
        margin: 8px 0 0;
        font-size: 14px;
        color: $text-muted;
      }
    }

    .section-actions {
      display: flex;
      gap: 8px;

      .sort-btn {
        border-radius: 20px;
        padding: 8px 20px;
        border-color: $border;
        color: $text-secondary;

        &.active {
          background: $primary;
          border-color: $primary;
          color: $white;
        }
      }
    }
  }

  .filter-bar {
    background: $white;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: $shadow-sm;

    .filter-group {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        min-width: 50px;
        font-size: 14px;
        color: $text-secondary;
        font-weight: 500;
      }

      .filter-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .filter-pill {
          padding: 6px 16px;
          background: $bg-light;
          color: $text-secondary;
          border-radius: 16px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: rgba(26, 95, 74, 0.1);
            color: $primary;
          }

          &.active {
            background: $primary;
            color: $white;
          }
        }
      }
    }
  }
}

// 内容卡片
.content-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  min-height: 400px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-card {
    background: $white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: $shadow-sm;
    cursor: pointer;
    transition: all 0.4s ease;
    animation: fadeInUp 0.5s ease-out both;

    &:hover {
      transform: translateY(-8px);
      box-shadow: $shadow-lg;

      .card-image-wrapper {
        .card-image {
          transform: scale(1.1);
        }

        .card-overlay {
          opacity: 1;
        }
      }

      .card-title {
        color: $primary;
      }
    }

    .card-image-wrapper {
      position: relative;
      height: 200px;
      overflow: hidden;

      .card-image {
        width: 100%;
        height: 100%;
        transition: transform 0.5s ease;
      }

      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $bg-light;
        color: $text-muted;
        font-size: 40px;
      }

      .card-badges {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        gap: 8px;

        .type-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: $white;

          &.type-1 { background: linear-gradient(135deg, #667eea, #764ba2); }
          &.type-2 { background: linear-gradient(135deg, $primary, $primary-light); }
          &.type-3 { background: linear-gradient(135deg, #f093fb, #f5576c); }
          &.type-4 { background: linear-gradient(135deg, #4facfe, #00f2fe); }
          &.video {
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            padding: 0;
          }
        }
      }

      .card-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        .preview-btn {
          background: $white;
          border: none;
          border-radius: 24px;
          padding: 10px 24px;
          color: $text-primary;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;

          &:hover {
            background: $primary;
            color: $white;
          }
        }
      }
    }

    .card-body {
      padding: 16px;

      .card-title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.3s;
      }

      .card-desc {
        margin: 0 0 12px;
        font-size: 13px;
        color: $text-muted;
        line-height: 1.6;
        height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .meta-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: $text-muted;

          .meta-icon {
            color: $primary-light;
          }

          .author-name {
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .meta-right {
          display: flex;
          align-items: center;
          gap: 12px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: $text-muted;

            .el-icon {
              font-size: 14px;
            }

            &.rating {
              color: $accent;
            }
          }
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 空状态
.empty-state {
  padding: 60px 20px;

  .empty-illustration {
    font-size: 80px;
  }

  .empty-text {
    color: $text-muted;
    font-size: 15px;
  }
}

// 分页
.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: 8px;
      margin: 0 3px;

      &.is-active {
        background: $primary;
      }
    }

    .btn-prev,
    .btn-next {
      border-radius: 8px;
    }
  }
}

// AI浮动按钮
.ai-float-button {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 999;
  cursor: pointer;

  .ai-content {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, $primary, $primary-light);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    box-shadow: 0 8px 24px rgba(26, 95, 74, 0.4);
    transition: all 0.3s;
    position: relative;
    z-index: 1;

    .ai-icon {
      font-size: 24px;
    }

    .ai-label {
      font-size: 11px;
      color: $white;
      font-weight: 600;
    }
  }

  .ai-ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, $primary-light);
    animation: ripple 2s infinite;
  }

  &:hover .ai-content {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(26, 95, 74, 0.5);
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

// 页脚
.main-footer {
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  color: $white;
  margin-top: 80px;

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 60px 40px;
    display: flex;
    justify-content: space-between;

    .footer-brand {
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
        font-weight: 700;

        .logo-icon {
          font-size: 32px;
        }
      }

      .footer-desc {
        margin: 12px 0 0;
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
      }
    }

    .footer-links {
      display: flex;
      gap: 80px;

      .link-group {
        h4 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 600;
        }

        a {
          display: block;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-bottom: 10px;
          text-decoration: none;
          transition: color 0.3s;

          &:hover {
            color: $accent;
          }
        }

        .social-icons {
          display: flex;
          gap: 12px;

          .social-icon {
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: $primary;
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    text-align: center;

    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.4);
      font-size: 13px;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .main-header {
    .header-inner {
      padding: 16px 24px;
    }

    .main-nav {
      .nav-item {
        padding: 8px 14px;
        font-size: 14px;

        .nav-text {
          display: none;
        }
      }
    }
  }

  .hero-section {
    padding: 100px 24px 60px;

    .hero-title {
      .title-line {
        font-size: 36px;
      }

      .title-highlight {
        font-size: 56px;
      }
    }

    .quick-entry {
      gap: 16px;
      padding: 16px 24px;

      .entry-item {
        .entry-icon {
          width: 48px;
          height: 48px;
          font-size: 22px;
        }
      }
    }
  }

  .main-content {
    padding: 80px 24px 40px;
  }
}

@media (max-width: 768px) {
  .main-header {
    .header-inner {
      .logo-section .logo .logo-text {
        display: none;
      }

      .logo-section .logo-subtitle {
        display: none;
      }

      .header-actions .search-box {
        display: none;
      }
    }
  }

  .hero-section {
    min-height: 450px;

    .hero-title {
      .title-line,
      .title-highlight {
        font-size: 32px;
        letter-spacing: 4px;
      }
    }

    .hero-search {
      .search-tabs {
        flex-wrap: wrap;
        justify-content: center;
      }

      .search-form {
        flex-direction: column;
      }
    }

    .quick-entry {
      display: none;
    }
  }

  .main-content {
    .featured-section {
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filter-bar .filter-group {
        flex-direction: column;
        align-items: flex-start;

        .filter-pills {
          margin-top: 8px;
        }
      }
    }
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .main-footer {
    .footer-content {
      flex-direction: column;
      gap: 40px;

      .footer-links {
        flex-wrap: wrap;
        gap: 40px;
      }
    }
  }
}
</style>
