<template>
  <div class="page-container">
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
          <el-select v-model="filterType" placeholder="标签选择">
            <!-- 使用 prefix 插槽 添加文字-->
            <!-- #prefix 插槽：
            这是 Element Plus 的 el-select 组件提供的一个具名插槽
            用于自定义选择器前缀区域的内容
            会始终显示在选择框的左侧 -->
            <template #prefix>
              <span style="color: #333;">{{ filterType === 'all' ? '全部文章' : filterType === null ? '标签选择' : getArticleTypeLabel(Number(filterType)) }}</span>
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
        <el-card v-for="item in articles" :key="item.id" class="discussion-item">
          <div class="article-main" @click="goToDetail(item.id)">
            <div class="article-meta">
              <el-tag :type="getArticleTypeTag(item.articleType)" class="article-type-tag">
                {{ getArticleTypeLabel(item.articleType) }}
              </el-tag>
              <h3 class="article-title">{{ item.title }}</h3>
            </div>
            <div class="article-brief" v-html="renderMarkdown(item.content.substring(0, 150))"></div>
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
        <div class="publish-container">
          <!-- <div class="publish-header">
            <h2>发布文章</h2>
            <el-button @click="dialogVisible = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div> -->
          
          <el-form :model="newArticle" :rules="rules" ref="formRef" class="publish-form">
            <el-form-item label="标题" prop="title">
              <el-input v-model="newArticle.title" placeholder="请输入标题"></el-input>
            </el-form-item>
            
            <el-form-item label="文章类型" prop="articleTypeName">
              <el-select 
                v-model="newArticle.articleTypeName" 
                placeholder="请选择文章类型" 
                style="width: 100%"
                @change="handleArticleTypeChange"
              >
                <el-option
                  v-for="type in articleTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="内容" prop="content">
              <div class="editor-container">
                <mavon-editor
                  v-model="newArticle.content"
                  class="md-editor"
                  ref="mavonEditorRef"
                  :ishljs="true"
                  :toolbars="toolbars"
                  @change="handleEditorChange"
                  :boxShadow="false"
                />
              </div>
            </el-form-item>

            <el-form-item class="publish-actions">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitArticle">发布</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.pageStart"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          :pager-count="4"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
    
    <div class="side-panel">
      <el-card class="side-card">
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
    <!-- ai按钮 -->
    <div class="ai-button-container">
      <el-button 
        class="ai-button" 
        @click="router.push('/ai')"
      >
        <el-icon class="ai-icon"><ChatDotRound /></el-icon>
        <span class="ai-text">AI</span>
      </el-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { View, Star, Pointer, Plus, Close, ChatDotRound, Clock, Sunrise } from '@element-plus/icons-vue'
import { type Article } from '@/types/article'
import type { FormInstance } from 'element-plus'
import { marked } from 'marked'

// 排序选项
const sortOptions = [
  { label: '最新', value: 'newest', icon: Clock },
  { label: '最热', value: 'hot', icon: Sunrise },
  { label: '最多点赞', value: 'likes', icon: Pointer }
]

const router = useRouter()
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const total = ref(0)
const token = localStorage.getItem('auth-token')
const uid = localStorage.getItem('uid')
// 文章类型列表
const articleTypes = [
  { value: 0, label: '算法文章' },
  { value: 1, label: '题解文章' },
  { value: 2, label: '经验分享' },
  { value: 3, label: '杂谈' },
  { value: 4, label: '竞赛' },
  { value: 5, label: '算法模板' },
]

// 添加编辑器变更处理函数
const handleEditorChange = (value: string, render: string) => {
  newArticle.content = value // 保存 markdown 内容
}

// 文章列表
const articles = ref<Array<Article>>([])

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

// 获取文章类型对应的标签样式
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

// 获取文章章类型的显示文本
const getArticleTypeLabel = (type: number) => {
  return articleTypes.find(t => t.value === type)?.label || '未知类型'
}

// 格式化日期
const formatDate = (dateArray: number[]) => {
  if(dateArray==null) return 'error'
  return `${dateArray[0]}年${dateArray[1]}月${dateArray[2]}日`
}

// 跳转到详情页
const goToDetail = (id: string) => {
  router.push(`/discuss/${id}`)
}



// 分页参数
const pageParams = reactive({
  pageStart: 1,
  pageSize: 10,
  sortField: 'create_time',
  // create_time favour_num like_num
  sortOrder: 'desc'
})

// 获取文章列表
const getArticles = async () => {
  try {

    const response = await request.post('/article/list', {
      pageStart: pageParams.pageStart,
      pageSize: pageParams.pageSize,
      sortField: pageParams.sortField,
      sortOrder: pageParams.sortOrder
    }, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    })as any
    
    if (response.code === 200) {
      // 在发起请求前清空文章列表
      articles.value = []
      articles.value = response.data.list 
      console.log(response.data )
    } else { 
      ElMessage.error(response.data || '获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  }
}

// 获取总数
const getTotalCount = async () => {
  try {
    const response = await request.post('/article/list', {
      pageStart: 1,
      pageSize: 100000,  //较大数
      sortField: 'create_time',
      sortOrder: 'desc'
    }, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    })as any
    
    if (response.code === 200) {
      total.value = response.data.list.length
      getArticles()
    } else {
      ElMessage.error(response.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  }
}
// 提交文章
const submitArticle = async () => {
  try {
    if (!formRef.value) return
    const response = await request.post('/article/add', { 
      title: newArticle.title,
      content: newArticle.content,
      articleType: newArticle.articleType,
      sourceId: newArticle.sourceId,
    }, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    })as any
    
    if (response.code === 200) {  
        ElMessage.success('发布成功！')
        dialogVisible.value = false
        formRef.value.resetFields()
        await getTotalCount() // 更新总数
        // 重新获取文章列表
        getArticles()
      } else {
        ElMessage.error(response.msg || '发布失败')
      }
    } catch (error) {
      console.error('发布文章失败:', error)
      ElMessage.error('发布文章失败')
    }
} 

// 页面加载时获取数据
onMounted(() => { 
  getTotalCount()
})

// 分页处理
const handleCurrentChange = (val: number) => {
  pageParams.pageStart = val
  getArticles()
}

const handleSizeChange = (val: number) => {
  pageParams.pageSize = val
  pageParams.pageStart = 1
  getArticles()
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
      // 更新文章的收藏状态和数量
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

const handleLike = async (event: Event, item: Article) => {
  event.preventDefault()
  try {
    const response = await request.put(`/article/like/${item.id}`, null, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      // 更新文章的点赞状态和数量
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

// 新增的状态
const filterType = ref<string | null>("all")
const sortBy = ref('newest')

 

const handleSortChange = () => {
  // 根据选择的排序方式更新 sortField
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
  console.log("修改")
  console.log(pageParams.sortField)
  pageParams.pageStart = 1
  getArticles() // 重新获取排序后的数据
}

const handleArticleTypeChange = (value: number) => {
  newArticle.articleType = value
}

// 添加 markdown 渲染函数
const renderMarkdown = (content: string) => {
  try {
    return marked(content + '...')
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return content + '...'
  }
}

// 添加工具栏配置
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
.sort-options {
  margin-left: auto;
}

.sort-buttons-group {
  display: flex;
  align-items: center;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: #909399;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  transition: color 0.3s ease;
}

.sort-btn:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background-color: #dcdfe6;
}

.sort-btn:hover {
  color: #409EFF;
}

.sort-btn.active {
  color: #303133;
  font-weight: 500;
}

.sort-btn.active::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: #409EFF;
  border-radius: 1px;
}

.sort-btn .el-icon {
  font-size: 14px;
}
.page-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 85%;
  margin: 0 auto;
}

.discussion-container {
  flex: 1;
  padding: 24px;
  margin: 0;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
}

.left-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.discussion-item {
  margin-bottom: 16px;
  transition: all 0.3s;
  border-radius: 12px;
  overflow: hidden;
}

.discussion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-main {
  cursor: pointer;
}

.article-meta {
  margin-bottom: 12px;
}

.article-title {
  margin: 8px 0;
  font-size: 18px;
  color: #2c3e50;
}

.article-type-tag {
  margin-right: 8px;
}

.article-brief {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-count {
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-info {
  color: #909399;
  font-size: 14px;
  display: flex;
  gap: 16px;
}

.sort-options {
  margin-left: auto;
}

.sort-buttons-group {
  display: flex;
  align-items: center;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: #909399;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  transition: color 0.3s ease;
}

.sort-btn:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background-color: #dcdfe6;
}

.sort-btn:hover {
  color: #409EFF;
}

.sort-btn.active {
  color: #303133;
  font-weight: 500;
}

.sort-btn.active::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: #409EFF;
  border-radius: 1px;
}

.sort-btn .el-icon {
  font-size: 14px;
}

.discussion-list {
  padding: 0 20px;
}

.side-panel {
  width: 300px;
}

.side-card {
  position: sticky;
  top: 24px;
  border-radius: 20px;
}

.side-card-header {
  font-weight: bold;
  color: #333;
}

.announcement-content {
  color: #666;
  line-height: 1.6;
}

.publish-drawer :deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}

.publish-container {
  height: 100%;
  padding: 24px;
  background-color: #fff;
  overflow-y: auto;
}

.publish-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.publish-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.publish-form {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.publish-form :deep(.el-form-item__label) {
  font-weight: bold;
}

.publish-actions {
  margin-top: 20px;
  text-align: right;
}
/* ai按钮 */
.ai-button-container {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
}

.ai-button {
  width: 64px;
  height: 64px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px 0 0 12px;
  background: linear-gradient(145deg, #7F53FF, #3C8CE7);
  border: none;
  box-shadow: -2px 2px 10px rgba(60, 140, 231, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
}

.ai-button:hover {
  width: 72px;
  background: linear-gradient(145deg, #8E67FF, #479FFF);
  box-shadow: -4px 4px 15px rgba(60, 140, 231, 0.3);
}

.ai-icon {
  font-size: 28px;
  margin-bottom: 4px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.ai-text {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 添加动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.ai-button:active {
  transform: scale(0.95);
}

.ai-button:hover .ai-icon {
  animation: pulse 1s infinite;
}
/* 上面是ai按钮 */

.editor-container {
  position: relative;
  height: 500px;
  width: 100%;
}

.md-editor {
  z-index: 3000;
  height: 100% !important;
}

.interaction-buttons {
  display: flex;
  gap: 12px;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #f5f7fa;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.interaction-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.like-btn.active {
  background-color: #e1f3d8;
  color: #67c23a;
}

.favorite-btn.active {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.interaction-btn .el-icon {
  font-size: 16px;
}

/* 添加点击动画效果 */
.interaction-btn:active {
  transform: scale(0.95);
}

/* 修改浏览数样式 */
.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: #f5f7fa;
}

.publish-button {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 18px;
  transition: transform 0.3s ease;
}

.publish-button:hover .publish-icon {
  transform: rotate(90deg);
}

.publish-text {
  font-size: 15px;
  letter-spacing: 0.5px;
}
</style>
