<template>
  <div class="search-page">
    <header class="search-header app-topbar">
      <div class="header-inner app-topbar__inner">
        <div class="brand-block" @click="goHome">
          <div class="brand-mark">PT</div>
          <div>
            <div class="brand-name">莆田文旅</div>
            <div class="brand-subtitle">搜索发现</div>
          </div>
        </div>

        <div class="search-bar">
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="搜索景点、美食、酒店、攻略"
            @keyup.enter="handleSearch"
          />
          <button class="search-button" @click="handleSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>
      </div>
    </header>

    <main class="page-main app-main">
      <section class="hero-card app-page-card">
        <div class="hero-copy">
          <p class="eyebrow">Discover</p>
          <h1 class="hero-title">搜索你想去的地方</h1>
          <p class="hero-subtitle">
            用统一的筛选视图浏览景点、美食、酒店与攻略内容，减少信息噪音，让搜索结果更像一份可逛的灵感清单。
          </p>
        </div>

        <div class="hero-aside">
          <div class="hero-stat">
            <span class="hero-stat__label">结果数量</span>
            <strong class="hero-stat__value">{{ total }}</strong>
          </div>
          <div class="hero-stat muted">
            <span class="hero-stat__label">当前分类</span>
            <strong class="hero-stat__value hero-stat__value--small">{{ getCategoryName(category) }}</strong>
          </div>
        </div>
      </section>

      <section class="filters-card app-page-card">
        <div class="filter-block">
          <span class="filter-label">场景分类</span>
          <div class="filter-tabs">
            <button :class="['filter-tab', { active: !category }]" @click="setCategory('')">全部</button>
            <button :class="['filter-tab', { active: category === 'attraction' }]" @click="setCategory('attraction')">景点</button>
            <button :class="['filter-tab', { active: category === 'food' }]" @click="setCategory('food')">美食</button>
            <button :class="['filter-tab', { active: category === 'hotel' }]" @click="setCategory('hotel')">酒店</button>
          </div>
        </div>

        <div class="filter-block filter-block--compact">
          <span class="filter-label">内容类型</span>
          <el-select v-model="dataTypeFilter" placeholder="全部类型" clearable @change="handleFilterChange">
            <el-option label="全部类型" value="" />
            <el-option label="攻略" :value="1" />
            <el-option label="景点" :value="2" />
            <el-option label="美食" :value="3" />
            <el-option label="酒店" :value="4" />
          </el-select>
        </div>

        <div class="filter-block filter-block--compact">
          <span class="filter-label">排序方式</span>
          <el-select v-model="sortBy" placeholder="综合排序" @change="handleFilterChange">
            <el-option label="综合排序" value="default" />
            <el-option label="最新发布" value="time" />
            <el-option label="最多浏览" value="view" />
            <el-option label="最多点赞" value="like" />
          </el-select>
        </div>
      </section>

      <section v-loading="loading" class="results-panel">
        <div v-if="results.length" class="results-toolbar">
          <div class="results-summary">
            为你找到 <strong>{{ total }}</strong> 条相关结果
          </div>
        </div>

        <div v-if="results.length" class="results-grid">
          <article v-for="item in results" :key="`${item.id}-${item.dataType || item.category}`" class="result-card" @click="goDetail(item)">
            <div class="result-card__media">
              <el-image
                :src="item.coverImage || '/local-images/default-cover.svg'"
                fit="cover"
                class="result-card__image"
                loading="lazy"
              />
              <div class="result-card__overlay" />
              <div class="result-card__chips">
                <span :class="['category-chip', item.category || 'content']">{{ getCategoryName(item.category) }}</span>
                <span v-if="isVideoContent(item)" class="video-chip">
                  <el-icon><VideoPlay /></el-icon>
                  视频
                </span>
              </div>
            </div>

            <div class="result-card__body">
              <h3 class="result-card__title" v-html="highlightKeyword(item.title)"></h3>
              <p class="result-card__desc">{{ item.description || item.summary || '暂无内容摘要' }}</p>

              <div class="result-card__footer">
                <div class="author-info">
                  <el-avatar :src="item.authorAvatar" :size="24">
                    {{ (item.authorName || '游').slice(0, 1) }}
                  </el-avatar>
                  <span>{{ item.authorName || '平台用户' }}</span>
                </div>

                <div class="metric-list">
                  <span><el-icon><View /></el-icon>{{ item.viewCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon>{{ item.likeCount || 0 }}</span>
                  <span><el-icon><Collection /></el-icon>{{ item.collectCount || 0 }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <el-empty v-else-if="!loading" class="empty-state" description="没有找到相关内容，换个关键词再试试。">
          <template #image>
            <div class="empty-mark">搜</div>
          </template>
        </el-empty>

        <div v-if="results.length" class="pagination-wrapper">
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
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Collection, Search, Star, VideoPlay, View } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const searchKeyword = ref('')
const category = ref('')
const dataTypeFilter = ref<number | string>('')
const sortBy = ref('default')
const results = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const CATEGORY_TO_DATA_TYPE: Record<string, number> = {
  guide: 1,
  attraction: 2,
  food: 3,
  hotel: 4
}

const DATA_TYPE_TO_CATEGORY: Record<number, string> = {
  1: 'guide',
  2: 'attraction',
  3: 'food',
  4: 'hotel'
}

const getCategoryByDataType = (dataType?: number | string) => {
  const resolvedType = Number(dataType)
  return DATA_TYPE_TO_CATEGORY[resolvedType] || ''
}

const getCategoryName = (cat?: string) => {
  const map: Record<string, string> = {
    guide: '攻略',
    attraction: '景点',
    food: '美食',
    hotel: '酒店'
  }
  if (!cat) return '全部'
  return map[cat] || '内容'
}

const isVideoContent = (item: any) => {
  const currentDataType = Number(item?.dataType)
  return currentDataType === 1 && (item?.contentType === 3 || item?.contentType === 4 || Boolean(item?.videoUrl))
}

const normalizeResultItem = (item: any) => {
  const dataType = Number(item?.dataType || item?.type) || 0

  return {
    ...item,
    dataType,
    category: item?.category || getCategoryByDataType(dataType)
  }
}

const handleSearch = async () => {
  loading.value = true

  try {
    const params: any = {
      title: searchKeyword.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    const resolvedDataType = Number(dataTypeFilter.value || CATEGORY_TO_DATA_TYPE[category.value] || 0)
    if (resolvedDataType) params.dataType = resolvedDataType
    if (sortBy.value) params.sortType = sortBy.value === 'view' || sortBy.value === 'like' ? 2 : 1

    const res: any = await request.get('/content/search', { params })
    if (res?.code === 200) {
      let list = res.data?.list || res.data?.records || []
      const seen = new Set<string>()

      list = list.map((item: any) => normalizeResultItem(item)).filter((item: any) => {
        const key = `${item.id}-${item.dataType || item.category || 'content'}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      results.value = list
      total.value = res.data?.total || list.length
    } else {
      results.value = []
      total.value = 0
    }
  } catch (error) {
    results.value = []
    total.value = 0
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const highlightKeyword = (text = '') => {
  if (!searchKeyword.value.trim()) return text
  const regex = new RegExp(escapeRegExp(searchKeyword.value.trim()), 'gi')
  return text.replace(regex, match => `<span class="keyword-highlight">${match}</span>`)
}

const setCategory = (value: string) => {
  category.value = value
  dataTypeFilter.value = value ? CATEGORY_TO_DATA_TYPE[value] || '' : ''
  currentPage.value = 1
  handleSearch()
}

const handleFilterChange = () => {
  category.value = getCategoryByDataType(dataTypeFilter.value)
  currentPage.value = 1
  handleSearch()
}

const goDetail = (item: any) => {
  const routeMap: Record<number, string> = {
    1: `/content/${item.id}`,
    2: `/attraction/${item.id}`,
    3: `/food/${item.id}`,
    4: `/hotel/${item.id}`
  }

  router.push(routeMap[Number(item.dataType)] || `/content/${item.id}`)
}

const goHome = () => router.push('/')

const syncStateFromRoute = () => {
  searchKeyword.value = typeof route.query.keyword === 'string' ? route.query.keyword : ''

  const queryCategory = typeof route.query.category === 'string' ? route.query.category : ''
  const rawDataType = typeof route.query.dataType === 'string' ? Number(route.query.dataType) : NaN
  const legacyDataType = typeof route.query.contentType === 'string' ? Number(route.query.contentType) : NaN
  const resolvedDataType = !Number.isNaN(rawDataType)
    ? rawDataType
    : !Number.isNaN(legacyDataType)
      ? legacyDataType
      : CATEGORY_TO_DATA_TYPE[queryCategory] || 0

  dataTypeFilter.value = resolvedDataType || ''
  category.value = queryCategory || getCategoryByDataType(resolvedDataType)

  const page = typeof route.query.page === 'string' ? Number(route.query.page) : 1
  currentPage.value = Number.isNaN(page) || page < 1 ? 1 : page
}

watch(
  () => route.query,
  () => {
    syncStateFromRoute()
    handleSearch()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(31, 111, 95, 0.15), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(226, 162, 78, 0.14), transparent 18%),
    linear-gradient(180deg, #f5f7f1 0%, #eef2ec 48%, #edf1ea 100%);
}

.search-header {
  padding: 0;
}

.header-inner {
  gap: 24px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.brand-mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.16em;
  background: linear-gradient(135deg, #17594d 0%, #2f8a75 100%);
  box-shadow: 0 14px 30px rgba(31, 111, 95, 0.25);
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #18362e;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7b8a86;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 680px;
  padding: 8px 8px 8px 18px;
  border-radius: 999px;
  background: rgba(244, 247, 244, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  transition: box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.search-bar:focus-within {
  background: #fff;
  border-color: rgba(31, 111, 95, 0.3);
  box-shadow: 0 0 0 5px rgba(31, 111, 95, 0.08);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1f2933;
}

.search-input::placeholder {
  color: #98a6a0;
}

.search-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1a6657 0%, #2d8c74 100%);
  box-shadow: 0 14px 24px rgba(31, 111, 95, 0.18);
}

.page-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(260px, 340px);
  gap: 22px;
  padding: 30px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 249, 246, 0.98) 62%, rgba(234, 244, 239, 0.96) 100%);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7d8d88;
}

.hero-title {
  margin: 0;
  font-size: 38px;
  line-height: 1.08;
  color: #18362e;
}

.hero-subtitle {
  max-width: 700px;
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: #627470;
}

.hero-aside {
  display: grid;
  gap: 12px;
}

.hero-stat {
  padding: 20px 22px;
  border-radius: 22px;
  color: #fff;
  background: linear-gradient(135deg, #1a6657 0%, #2d8c74 100%);
  box-shadow: 0 22px 36px rgba(31, 111, 95, 0.18);
}

.hero-stat.muted {
  color: #18362e;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: none;
}

.hero-stat__label {
  display: block;
  font-size: 12px;
  opacity: 0.76;
}

.hero-stat__value {
  display: block;
  margin-top: 10px;
  font-size: 32px;
  line-height: 1;
}

.hero-stat__value--small {
  font-size: 22px;
  line-height: 1.3;
}

.filters-card {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 220px 220px;
  gap: 16px;
  padding: 20px;
}

.filter-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-block--compact {
  min-width: 0;
}

.filter-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a8a86;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tab {
  padding: 10px 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: #f7faf8;
  color: #617571;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;
}

.filter-tab:hover {
  transform: translateY(-1px);
  border-color: rgba(31, 111, 95, 0.2);
  color: #1f6f5f;
}

.filter-tab.active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, #1a6657 0%, #2d8c74 100%);
  box-shadow: 0 12px 24px rgba(31, 111, 95, 0.16);
}

.results-panel {
  min-height: 420px;
}

.results-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.results-summary {
  font-size: 14px;
  color: #6c7d79;
}

.results-summary strong {
  color: #1f6f5f;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.result-card {
  overflow: hidden;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 18px 38px rgba(18, 28, 45, 0.06);
  cursor: pointer;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(18, 28, 45, 0.1);
}

.result-card__media {
  position: relative;
  height: 210px;
  overflow: hidden;
}

.result-card__image {
  width: 100%;
  height: 100%;
  transition: transform 0.45s ease;
}

.result-card:hover .result-card__image {
  transform: scale(1.05);
}

.result-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 38%, rgba(13, 28, 23, 0.52) 100%);
}

.result-card__chips {
  position: absolute;
  inset: auto 14px 14px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.category-chip,
.video-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  backdrop-filter: blur(16px);
}

.category-chip {
  background: rgba(255, 255, 255, 0.2);
}

.category-chip.attraction {
  background: rgba(31, 111, 95, 0.82);
}

.category-chip.food {
  background: rgba(193, 97, 60, 0.82);
}

.category-chip.hotel {
  background: rgba(45, 113, 142, 0.82);
}

.video-chip {
  background: rgba(17, 24, 39, 0.58);
}

.result-card__body {
  padding: 18px 18px 20px;
}

.result-card__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.45;
  color: #18362e;
}

.result-card__desc {
  min-height: 44px;
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #6e807c;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.result-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
  color: #627470;
}

.author-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-list {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #80908c;
}

.metric-list span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  padding: 56px 0 24px;
}

.empty-mark {
  width: 96px;
  height: 96px;
  margin: 0 auto;
  display: grid;
  place-items: center;
  border-radius: 28px;
  color: #fff;
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #1a6657 0%, #2d8c74 100%);
  box-shadow: 0 18px 32px rgba(31, 111, 95, 0.2);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

:deep(.keyword-highlight) {
  color: #1f6f5f;
  font-weight: 700;
}

:deep(.el-select .el-select__wrapper) {
  min-height: 44px;
  border-radius: 16px;
}

@media (max-width: 980px) {
  .hero-card,
  .filters-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-inner {
    height: auto;
    padding-top: 14px;
    padding-bottom: 14px;
    flex-direction: column;
    align-items: stretch;
  }

  .search-bar {
    max-width: none;
  }

  .hero-card {
    padding: 22px;
  }

  .hero-title {
    font-size: 30px;
  }
}

@media (max-width: 560px) {
  .brand-name {
    font-size: 20px;
  }

  .filters-card {
    padding: 16px;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
