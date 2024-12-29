<template>
  <div class="page-container">
    <div class="main-content">
      <div class="discussion-container">
        <!-- 顶部操作栏 -->
        <div class="discussion-header">
          <div class="left-actions">
            <el-button 
              class="publish-button" 
              @click="dialogVisible = true"
            >
              <el-icon class="publish-icon"><EditPen /></el-icon>
              <span class="publish-text">发布文章</span> 
            </el-button>
            
            <!-- 文章类型筛选 -->
            <el-select 
              v-model="filterType" 
              placeholder="标签选择"
              class="filter-select"
            >
              <template #prefix>
                <span class="select-label">
                  {{ filterType === 'all' ? '全部文章' : 
                     filterType === null ? '标签选择' : 
                     getArticleTypeLabel(Number(filterType)) }}
                </span>
              </template>
              <el-option label="全部" value="all" />
              <el-option
                v-for="type in articleTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value.toString()"
              />
            </el-select>
          </div>

          <!-- 排序选项 -->
          <div class="sort-options">
            <div class="sort-buttons-group">
              <button 
                v-for="option in sortOptions" 
                :key="option.value"
                class="sort-btn"
                :class="{ active: sortBy === option.value }"
                @click="sortBy = option.value; handleSortChange()"
              >
                <el-icon><component :is="option.icon" /></el-icon>
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 文章列表 -->
        <div class="discussion-list">
          <el-card 
            v-for="item in articles" 
            :key="item.id" 
            class="discussion-item"
          >
            <div class="article-main" @click="goToDetail(item.id)">
              <div class="article-meta">
                <el-tag 
                  :type="getArticleTypeTag(item.articleType)" 
                  class="article-type-tag"
                  effect="light"
                >
                  {{ getArticleTypeLabel(item.articleType) }}
                </el-tag>
                <h3 class="article-title">{{ item.title }}</h3>
              </div>
              <div 
                class="article-brief" 
                v-html="renderMarkdown(item.content.substring(0, 150))"
              ></div>
            </div>
            <div class="article-footer">
              <div class="article-stats">
                <div class="interaction-buttons">
                  <button 
                    class="interaction-btn like-btn" 
                    :class="{ 'active': item.isLiked }"
                    @click="handleLike($event, item)"
                  >
                    <el-icon><Pointer /></el-icon>
                    <span>{{ item.likeNum }}</span>
                  </button>
                  <button 
                    class="interaction-btn favorite-btn" 
                    :class="{ 'active': item.isFavorited }"
                    @click="handleFavorite($event, item)"
                  >
                    <el-icon><Star /></el-icon>
                    <span>{{ item.favourNum }}</span>
                  </button>
                </div>
                <span class="view-count">
                  <el-icon><View /></el-icon>
                  {{ item.articleReads }}次浏览
                </span>
              </div>
              <div class="article-info">
                <span class="author">作者: {{ item.userId }}</span>
                <span class="time">发布于 {{ formatDate(item.createTime) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 分页组件 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pageParams.pageStart"
              v-model:page-size="pageParams.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="total"
              :pager-count="7"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="side-panel">
        <!-- 用户统计卡片 -->
        <el-card class="side-card user-stats">
          <template #header>
            <div class="side-card-header">
              <span>社区数据</span>
            </div>
          </template>
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-value">{{ total }}</div>
              <div class="stat-label">文章总数</div>
            </div>
            <!-- 可以添加更多统计数据 -->
          </div>
        </el-card>

        <!-- 公告卡片 -->
        <el-card class="side-card announcement">
          <template #header>
            <div class="side-card-header">
              <span>社区公告</span>
            </div>
          </template>
          <div class="announcement-content">
            <p>欢迎来到讨论区！</p>
            <p>这里可以分享你的想法和经验。</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <el-backtop :right="100" :bottom="100" />

    <!-- AI助手按钮 -->
    <div class="ai-button-container">
      <el-button 
        class="ai-button" 
        @click="router.push('/ai')"
      >
        <el-icon class="ai-icon"><ChatDotRound /></el-icon>
        <span class="ai-text">AI</span>
      </el-button>
    </div>

    <!-- 发布文章对话框 -->
    <el-drawer
      v-model="dialogVisible"
      title="发布文章"
      size="100%"
      :with-header="false"
      direction="ttb"
      class="publish-drawer"
    >
      <!-- 发布文章表单内容保持不变 -->
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { View, Star, Pointer, Plus, Close, ChatDotRound, Clock, Sunrise } from '@element-plus/icons-vue'
import { type Article } from '@/types/article'
import type { FormInstance } from 'element-plus'
import { marked } from 'marked'
import { useIntersectionObserver } from '@vueuse/core'
import debounce from 'lodash/debounce'

// 状态管理
const router = useRouter()
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const total = ref(0)
const loading = ref(false)
const token = localStorage.getItem('auth-token')
const uid = localStorage.getItem('uid')

// 文章列表相关
const articles = ref<Array<Article>>([])
const filterType = ref<string | null>("all")
const sortBy = ref('newest')

// 排序选项
const sortOptions = [
  { label: '最新', value: 'newest', icon: Clock },
  { label: '最热', value: 'hot', icon: Sunrise },
  { label: '最多点赞', value: 'likes', icon: Pointer }
]

// 文章类型列表
const articleTypes = [
  { value: 0, label: '算法文章' },
  { value: 1, label: '题解文章' },
  { value: 2, label: '经验分享' },
  { value: 3, label: '杂谈' },
  { value: 4, label: '竞赛' },
  { value: 5, label: '算法模板' },
]

// 分页参数
const pageParams = reactive({
  pageStart: 1,
  pageSize: 10,
  sortField: 'create_time',
  sortOrder: 'desc'
})

// 新文章表单
const newArticle = reactive({
  title: '',
  content: '',
  articleTypeName: '',
  articleType: 0,
  likeNum: 0,
  favourNum: 0,
  articleReads: 0,
  sourceId: 0
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 50, message: '标题长度应在 3 到 50 个字符之间', trigger: 'blur' }
  ],
  articleTypeName: [
    { required: true, message: '请选择文章类型', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容不能少于 10 个字符', trigger: 'blur' }
  ]
}

// 工具函数
const getArticleTypeTag = (type: number) => {
  const types: Record<number, string> = {
    0: 'success',
    1: 'warning',
    2: 'info',
    3: 'default',
    4: 'danger',
    5: 'primary'
  }
  return types[type] || ''
}

const getArticleTypeLabel = (type: number) => {
  return articleTypes.find(t => t.value === type)?.label || '未知类型'
}

const formatDate = (dateArray: number[]) => {
  if (!dateArray) return 'error'
  const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2])
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Markdown 渲染
const renderMarkdown = (content: string) => {
  try {
    return marked(content + '...')
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return content + '...'
  }
}

// API 请求函数
const getArticles = async () => {
  try {
    loading.value = true
    const response = await request.post('/article/list', {
      pageStart: pageParams.pageStart,
      pageSize: pageParams.pageSize,
      sortField: pageParams.sortField,
      sortOrder: pageParams.sortOrder
    }, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any
    
    if (response.code === 200) {
      articles.value = response.data.list
      total.value = response.data.total // 假设后端返回总数
    } else {
      ElMessage.error(response.msg || '获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 交互处理函数
const handleLike = async (event: Event, item: Article) => {
  event.preventDefault()
  try {
    const response = await request.put(`/article/like/${item.id}`, null, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      item.isLiked = !item.isLiked
      item.likeNum = item.isLiked ? item.likeNum + 1 : item.likeNum - 1
      ElMessage.success(item.isLiked ? '点赞成功' : '取消点赞成功')
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('点赞操作失败')
  }
}

const handleFavorite = async (event: Event, item: Article) => {
  event.preventDefault()
  try {
    const response = await request.put(`/article/star/${item.id}`, null, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      item.isFavorited = !item.isFavorited
      item.favourNum = item.isFavorited ? item.favourNum + 1 : item.favourNum - 1
      ElMessage.success(item.isFavorited ? '收藏成功' : '取消收藏成功')
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('收藏操作失败')
  }
}

// 排序和筛选
const handleSortChange = debounce(() => {
  switch (sortBy.value) {
    case 'newest':
      pageParams.sortField = 'create_time'
      break
    case 'hot':
      pageParams.sortField = 'article_reads'
      break
    case 'likes':
      pageParams.sortField = 'like_num'
      break
  }
  pageParams.pageStart = 1
  getArticles()
}, 300)

// 页面跳转
const goToDetail = (id: string) => {
  router.push(`/discuss/${id}`)
}

// 文章发布
const submitArticle = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const response = await request.post('/article/add', {
      title: newArticle.title,
      content: newArticle.content,
      articleType: newArticle.articleType,
      sourceId: newArticle.sourceId,
    }, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any
    
    if (response.code === 200) {
      ElMessage.success('发布成功！')
      dialogVisible.value = false
      formRef.value.resetFields()
      await getArticles()
    } else {
      ElMessage.error(response.msg || '发布失败')
    }
  } catch (error) {
    console.error('发布文章失败:', error)
    ElMessage.error('发布文章失败')
  }
}

// 分页处理函数
const handleSizeChange = (val: number) => {
  pageParams.pageSize = val
  pageParams.pageStart = 1
  getArticles()
}

const handleCurrentChange = (val: number) => {
  pageParams.pageStart = val
  getArticles()
}

// 生命周期钩子
onMounted(() => {
  getArticles()
})

// 清理工作
onUnmounted(() => {
  // 清理防抖函数
  handleSortChange.cancel()
})

// 编辑器配置
const toolbars = {
  bold: true,
  italic: true,
  header: true,
  underline: true,
  strikethrough: true,
  mark: true,
  superscript: true,
  subscript: true,
  quote: true,
  ol: true,
  ul: true,
  link: true,
  imagelink: true,
  code: true,
  table: true,
  fullscreen: true,
  readmodel: true,
  htmlcode: true,
  help: true,
  undo: true,
  redo: true,
  trash: true,
  navigation: true,
  alignleft: true,
  aligncenter: true,
  alignright: true,
  subfield: true,
  preview: true
}
</script>
<style scoped>
/* 页面基础布局 */
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 讨论区容器 */
.discussion-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 顶部操作栏 */
.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.left-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 发布按钮 */
.publish-button {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.publish-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
  background: linear-gradient(135deg, #7075f5 0%, #5a52f3 100%);
}

.publish-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.publish-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.publish-button:hover .publish-icon {
  transform: rotate(90deg);
}

/* 文章列表 */
.discussion-list {
  margin-top: 2rem;
}

.articles-container {
  display: grid;
  gap: 1.5rem;
}

.discussion-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.discussion-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.article-main {
  cursor: pointer;
  padding: 1.5rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.article-type-tag {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.article-brief {
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.975rem;
}

/* 文章底部 */
.article-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.interaction-buttons {
  display: flex;
  gap: 0.75rem;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.05);
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.interaction-btn:hover {
  transform: translateY(-2px);
  background-color: rgba(0, 0, 0, 0.08);
}

.interaction-btn.active {
  background-color: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

/* 侧边栏 */
.side-panel {
  position: sticky;
  top: 2rem;
}

.side-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.side-card-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #1a1a1a;
}

.stats-content {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

/* AI助手按钮 */
.ai-button-container {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 100;
}

.ai-button {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.ai-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
}

.ai-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

/* 动画效果 */
.article-list-enter-active,
.article-list-leave-active {
  transition: all 0.3s ease;
}

.article-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.article-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
  gap: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .side-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 1rem;
  }

  .discussion-header {
    flex-direction: column;
    gap: 1rem;
  }

  .left-actions {
    width: 100%;
  }

  .sort-options {
    width: 100%;
  }
}

/* 工具栏样式 */
.filter-select {
  min-width: 150px;
}

.sort-buttons-group {
  display: flex;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 0.25rem;
}

.sort-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sort-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 发布抽屉样式 */
.publish-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.publish-container {
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
}

.publish-form {
  max-width: 800px;
  margin: 0 auto;
}

.editor-container {
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

/* 工具提示 */
[data-tooltip] {
  position: relative;
}

[data-tooltip]:before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

[data-tooltip]:hover:before {
  opacity: 1;
  visibility: visible;
}

/* 添加分页容器样式 */
.pagination-container {
  margin-top: 2rem;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

/* 调整主内容区域样式 */
.main-content {
  padding-top: 2rem; /* 由于移除了横幅，添加适当的顶部间距 */
}
</style>