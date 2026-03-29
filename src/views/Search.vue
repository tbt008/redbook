<template>
  <div class="search-container">
    <!-- 顶部导航 -->
    <header class="search-header">
      <div class="header-inner">
        <div class="logo-section" @click="goHome">
          <span class="logo-icon">🏝️</span>
          <span class="logo-text">莆田文旅</span>
        </div>
        <div class="search-bar">
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
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <!-- 筛选区域 -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button
            :class="['filter-tab', { active: !category }]"
            @click="category = ''; handleSearch()"
          >
            全部
          </button>
          <button
            :class="['filter-tab', { active: category === 'attraction' }]"
            @click="category = 'attraction'; handleSearch()"
          >
            🏞️ 景点
          </button>
          <button
            :class="['filter-tab', { active: category === 'food' }]"
            @click="category = 'food'; handleSearch()"
          >
            🍜 美食
          </button>
          <button
            :class="['filter-tab', { active: category === 'hotel' }]"
            @click="category = 'hotel'; handleSearch()"
          >
            🏨 酒店
          </button>
        </div>
        <div class="filter-selects">
          <el-select v-model="contentType" placeholder="内容类型" clearable @change="handleSearch">
            <el-option label="全部类型" value="" />
            <el-option label="攻略" :value="1" />
            <el-option label="笔记" :value="2" />
            <el-option label="视频" :value="3" />
          </el-select>
          <el-select v-model="sortBy" placeholder="排序" @change="handleSearch">
            <el-option label="综合排序" value="default" />
            <el-option label="最新发布" value="time" />
            <el-option label="最多浏览" value="view" />
            <el-option label="最多点赞" value="like" />
          </el-select>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-loading="loading" class="results-section">
        <div v-if="results.length > 0" class="results-header">
          <span class="results-count">找到 <strong>{{ total }}</strong> 个结果</span>
        </div>

        <div v-if="results.length > 0" class="content-grid">
          <div
            v-for="item in results"
            :key="item.id"
            class="content-card"
            @click="goDetail(item)"
          >
            <div class="card-image-wrapper">
              <el-image
                :src="item.coverImage || '/default-cover.jpg'"
                fit="cover"
                class="card-image"
                loading="lazy"
              />
              <div v-if="item.type === 3" class="video-badge">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <div :class="['type-tag', item.category]">
                {{ getCategoryName(item.category) }}
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title" v-html="highlightKeyword(item.title)"></h3>
              <p class="card-desc">{{ item.description }}</p>
              <div class="card-meta">
                <div class="meta-left">
                  <el-avatar :src="item.authorAvatar" :size="20" />
                  <span>{{ item.authorName }}</span>
                </div>
                <div class="meta-right">
                  <span><el-icon><View /></el-icon> {{ item.viewCount }}</span>
                  <span><el-icon><Star /></el-icon> {{ item.likeCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else-if="!loading" description="没有找到相关内容，换个关键词试试？" class="empty-state">
          <template #image>
            <div class="empty-illustration">🔍</div>
          </template>
        </el-empty>

        <div v-if="results.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :pager-count="5"
            layout="prev, pager, next, jumper, total"
            background
            @current-change="handleSearch"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, VideoPlay, View, Star } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const searchKeyword = ref('')
const category = ref('')
const contentType = ref<number | string>('')
const sortBy = ref('default')
const results = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const getCategoryName = (cat: string) => {
  const map: Record<string, string> = {
    attraction: '景点',
    food: '美食',
    hotel: '酒店'
  }
  return map[cat] || '内容'
}

const handleSearch = async () => {
  loading.value = true
  try {
    const params: any = {
      title: searchKeyword.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (category.value) params.category = category.value
    if (contentType.value) params.dataType = contentType.value
    if (sortBy.value) params.sortType = sortBy.value === 'hot' ? 2 : 1

    const res: any = await request.get('/content/search', { params })
    if (res.code === 200) {
      let list = res.data.records || []
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
      results.value = list
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const highlightKeyword = (text: string) => {
  if (!searchKeyword.value) return text
  const regex = new RegExp(searchKeyword.value, 'gi')
  return text.replace(regex, (match) => `<span style="color: #1a5f4a; font-weight: 600">${match}</span>`)
}

const goDetail = (item: any) => {
  if (item.category === 'attraction') {
    router.push(`/attraction/${item.id}`)
  } else if (item.category === 'food') {
    router.push(`/food/${item.id}`)
  } else if (item.category === 'hotel') {
    router.push(`/hotel/${item.id}`)
  } else {
    router.push(`/content/${item.id}`)
  }
}

const goHome = () => router.push('/')

onMounted(() => {
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword as string
  }
  if (route.query.category) {
    category.value = route.query.category as string
  }
  handleSearch()
})
</script>

<style scoped lang="scss">
$primary: #1a5f4a;
$primary-light: #2d8b6f;
$text-primary: #1a1a1a;
$text-secondary: #666;
$text-muted: #999;
$border: #eee;
$bg-light: #f8f9fa;
$white: #fff;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 20px rgba(0, 0, 0, 0.1);

.search-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f5f3 0%, #e8f0ec 100%);
}

.search-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    gap: 32px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: $primary;
    }
  }

  .search-bar {
    flex: 1;
    max-width: 600px;
    display: flex;
    align-items: center;
    background: $bg-light;
    border: 2px solid transparent;
    border-radius: 30px;
    padding: 0 6px;
    transition: all 0.3s;

    &:focus-within {
      background: $white;
      border-color: $primary;
      box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.1);
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 16px;
      font-size: 15px;
      outline: none;

      &::placeholder {
        color: $text-muted;
      }
    }

    .search-btn {
      width: 44px;
      height: 44px;
      border: none;
      background: linear-gradient(135deg, $primary, $primary-light);
      border-radius: 50%;
      color: $white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(26, 95, 74, 0.3);
      }
    }
  }
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $white;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: $shadow-sm;

  .filter-tabs {
    display: flex;
    gap: 8px;

    .filter-tab {
      padding: 8px 18px;
      border: none;
      background: $bg-light;
      border-radius: 20px;
      font-size: 14px;
      color: $text-secondary;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(26, 95, 74, 0.1);
        color: $primary;
      }

      &.active {
        background: linear-gradient(135deg, $primary, $primary-light);
        color: $white;
      }
    }
  }

  .filter-selects {
    display: flex;
    gap: 12px;

    :deep(.el-select) {
      width: 130px;

      .el-select__wrapper {
        border-radius: 20px;
      }
    }
  }
}

.results-section {
  min-height: 400px;

  .results-header {
    margin-bottom: 20px;

    .results-count {
      font-size: 14px;
      color: $text-secondary;

      strong {
        color: $primary;
      }
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  .content-card {
    background: $white;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: $shadow-sm;
    cursor: pointer;
    transition: all 0.4s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: $shadow-md;

      .card-image {
        transform: scale(1.1);
      }
    }

    .card-image-wrapper {
      position: relative;
      height: 180px;
      overflow: hidden;

      .card-image {
        width: 100%;
        height: 100%;
        transition: transform 0.5s;
      }

      .video-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $white;
      }

      .type-tag {
        position: absolute;
        bottom: 12px;
        left: 12px;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        color: $white;

        &.attraction { background: linear-gradient(135deg, $primary, $primary-light); }
        &.food { background: linear-gradient(135deg, #f5576c, #f093fb); }
        &.hotel { background: linear-gradient(135deg, #4facfe, #00f2fe); }
      }
    }

    .card-body {
      padding: 16px;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
        margin: 0 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-desc {
        font-size: 13px;
        color: $text-muted;
        margin: 0 0 12px;
        line-height: 1.5;
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
        }

        .meta-right {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: $text-muted;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

.empty-state {
  padding: 60px;

  .empty-illustration {
    font-size: 80px;
  }
}

.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: 8px;

      &.is-active {
        background: $primary;
      }
    }
  }
}

@media (max-width: 768px) {
  .search-header .header-inner {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .search-bar {
      max-width: 100%;
    }
  }

  .filter-bar {
    flex-direction: column;
    gap: 16px;

    .filter-tabs {
      width: 100%;
      overflow-x: auto;
      justify-content: flex-start;
    }

    .filter-selects {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
