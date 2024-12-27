<template>
  <div class="page-container">
    <!-- 主要内容区 -->
    <div class="main-content" v-loading="loading">
      <el-button @click="router.back()" class="back-button">
        <el-icon><ArrowLeft /></el-icon>返回
      </el-button>
      
      <div class="discussion-main" v-if="discussion">
        <!-- 文章头部 -->
        <div class="article-header">
          <h1 class="article-title">{{ discussion.title }}</h1>
          <div class="article-meta">
            <el-tag 
              :type="getArticleTypeTag(discussion.articleTypeName)"
              size="small"
              
              class="article-type-tag"
            >
              {{ discussion.articleTypeName }}
            </el-tag>
            <div class="author-info">
              <el-avatar :size="32" :src="Avatar"/>
              <span class="author-name">{{ discussion.userId }}</span>
              <span class="publish-time">发布于 {{ formatDateArray(discussion.createTime) }}</span>
              <div class="article-operations" v-if="isAuthor">
                <el-button type="primary" size="small" @click="handleEdit">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      <!-- 发布文章对话框 -->
      <el-drawer
        v-model="disabled"
        title="发布文章"
        size="100%"
        :with-header="false"
        direction="ttb"
        class="publish-drawer"
      >
        <div class="publish-container">
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
              <el-button @click="disabled = false">取消</el-button>
              <el-button type="primary" @click="editArticle">发布</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
        <!-- 文章内容 -->
        <div class="article-content markdown-body">
          <mavon-editor
            v-model="discussion.content"
            :subfield="false"
            :defaultOpen="'preview'"
            :toolbarsFlag="false"
            :editable="false"
            :scrollStyle="true"
            :ishljs="true"
          />
        </div>

        <!-- 文章底部操作栏 -->
        <div class="article-actions">
          <div class="action-buttons">
            <el-button-group>
              <el-button :type="isLiked ? 'primary' : 'default'" @click="handleLike">
                <el-icon><Pointer /></el-icon>
                <span>{{ discussion.likeNum }}</span>
              </el-button>
              <el-button :type="isFavorited ? 'primary' : 'default'" @click="handleFavorite">
                <el-icon><Star /></el-icon>
                <span>{{ discussion.favourNum }}</span>
              </el-button>
            </el-button-group>
            <span class="view-count">
              <el-icon><View /></el-icon>
              {{ discussion.articleReads }}次浏览
            </span>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <h3>评论 ({{ discussion.comments?.length || 0 }})</h3>
          
          <!-- 评论输入框 -->
          <div class="comment-input">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
            />
            <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
              发表评论
            </el-button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <el-card v-for="comment in discussion.comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <el-avatar :size="32" :src="comment.authorAvatar"/>
                <div class="comment-info">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div class="side-panel">
      <el-card class="side-card">
        <template #header>
          <div class="side-card-header">
            <span>作者信息</span>
          </div>
        </template>
        <div class="author-profile" v-if="discussion">
          <el-avatar :size="64" :src="Avatar"/>
          <h3>{{ discussion.userId }}</h3>
          <div class="author-stats">
            <div class="stat-item">
              <div class="stat-value">{{ authorStats.articles || 0 }}</div>
              <div class="stat-label">文章</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ authorStats.likes || 0 }}</div>
              <div class="stat-label">获赞</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  position: relative;
  height: 500px;
  width: 100%;
}
.md-editor {
  z-index: 3000;
  height: 100% !important;
}
.publish-actions {
  margin-top: 20px;
  text-align: right;
}
.page-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.side-panel {
  width: 300px;
}

.side-card {
  position: sticky;
  top: 24px;
  border-radius: 20px;
}

.back-button {
  width: 80px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background-color: #f2f3f5;
  border: none;
  color: #606266;
  transition: all 0.3s ease;
}
.back-button:hover {
  background-color: #e4e7ed;
  color: #409EFF;
}
 .back-button .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.article-header {
  margin-bottom: 32px;
}

.article-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #2c3e50;
}

.article-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.publish-time {
  color: #909399;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #2c3e50;
  margin: 32px 0;
}

.article-actions {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-bottom: 32px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comments-section {
  margin-top: 40px;
}

.comment-input {
  margin: 20px 0;
}

.comment-input .el-button {
  margin-top: 12px;
}

.comment-item {
  margin-bottom: 16px;
  border-radius: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-author {
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  color: #2c3e50;
  line-height: 1.6;
}

.author-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.article-type-tag {
  padding: 0 8px;
  height: 24px;
  width: 100px;
  line-height: 22px;
}

.article-operations {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

:deep(.markdown-body) {
  min-height: auto !important;
}

:deep(.v-note-wrapper) {
  min-height: auto !important;
  height: auto !important;
}

:deep(.v-note-panel) {
  height: auto !important;
}

:deep(.v-note-show) {
  height: auto !important;
}
/* 修改抽屉样式 */
.publish-drawer :deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}
.publish-drawer :deep(.el-drawer__body) {
  padding: 0;
}

/* 确保发布容器可以正确滚动 */
.publish-container {
  height: 100%;
  padding: 24px;
  background-color: #fff;
  overflow-y: auto;
}
 
/* 确保表单容器不会限制编辑器的全屏显示 */
.publish-form {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}
.publish-form :deep(.el-form-item__label) {
  font-weight: bold;
}

</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, Pointer, ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import { type Article } from '@/types/article'
import request from '@/util/request'
const Avatar = new URL('../views/imgs/bot.jpg', import.meta.url).href
const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(true)
const discussion = ref<Article | null>(null)
const newComment = ref<string>('')
const token = localStorage.getItem('auth-token')
const isLiked = ref(false)
const isFavorited = ref(false)
const currentUser = ref<any>(null)
const isAuthor = ref(false)
const disabled = ref(false)
import type { FormInstance } from 'element-plus'
const formRef = ref<FormInstance>()
// 作者统计数据
const authorStats = reactive({
  articles: 0,
  likes: 0
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
// 添加编辑器变更处理函数
const handleEditorChange = (value: string, render: string) => {
  newArticle.content = value // 保存 markdown 内容
}
// 文章类型列表
const articleTypes = [
  { value: 0, label: '算法文章' },
  { value: 1, label: '题解文章' },
  { value: 2, label: '经验分享' },
  { value: 3, label: '杂谈' },
  { value: 4, label: '竞赛' },
  { value: 5, label: '算法模板' },
]
const handleArticleTypeChange = (value: number) => {
  newArticle.articleType = value
}
// 编辑文章
const editArticle = async () => {
  try {
    if (!formRef.value) return
    // TODO: 编辑文章
    ElMessage.success('编辑文章还没写')
    } catch (error) {
      console.error('编辑文章失败:', error)
      ElMessage.error('编辑文章失败')
    }
} 
// 处理编辑按钮点击
const handleEdit = () => {
  disabled.value = true 
}
// 格式化日期
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}
const formatDateArray = (dateArray: number[]) => {
  return `${dateArray[0]}年${dateArray[1]}月${dateArray[2]}日`
}
// 获取文章详情
const getDiscussionDetail = async () => {
  try {
    loading.value = true
    const response = await request.get(`/article/${route.params.id}`, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    })as any
    
    if (response.code === 200) { 
      discussion.value = response.data
      console.log(discussion.value)
      console.log(response.data)
    } else {
      ElMessage.error(response.msg || '获取文章详情失败')
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}
 
const submitComment = async () => {
  if (!newComment.value.trim() || !discussion.value) return
  
  try {
    //TODO
    //评论
  } catch (error) {
    console.error('评论发表失败:', error)
    ElMessage.error('评论发表失败')
  }
}

// 获取文章类型对应的标签样式
const getArticleTypeTag = (type: string) => {
  const types: Record<string, string> = {
    "算法文章": 'success',
    "题解文章": 'warning',
    "分享文章": 'info',
    "杂谈文章": 'default',
    "竞赛文章": 'danger',
    "算法模板": 'primary'
  }
  return types[type] || 'info'
}

const handleLike = async () => {
  // TODO: 实现点赞功能
  console.log('点赞文章:', discussion.value?.id)
}

const handleFavorite = async () => {
  // TODO: 实现收藏功能
  console.log('收藏文章:', discussion.value?.id)
}

// 新增获取作者统计数据的方法
const getAuthorStats = async () => {
  if (!discussion.value?.userId) return
  // TODO: 实现获取作者统计数据的接口调用
}

// 获取当前用户信息
const getCurrentUser = async () => {
  try {
    const response = await request.get('/user/get/user', {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any
    
    if (response.code === 200) {
      currentUser.value = response.data
      // 检查当前用户是否为文章作者
      if (discussion.value) {
        isAuthor.value = currentUser.value.uid == discussion.value.userId
      }
      else{
        isAuthor.value = false

      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}



// 处理删除按钮点击
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await request.delete(`/article/delete/${discussion.value?.id}`, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      ElMessage.success('文章删除成功')
      router.back() // 删除成功后返回上一页
    } else {
      ElMessage.error(response.msg || '删除文章失败')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error('删除文章失败')
    }
  }
}
// 异步执行来获取文章详情和用户信息
onMounted(async () => {
  await getDiscussionDetail()
  await getCurrentUser()  
})
</script>
