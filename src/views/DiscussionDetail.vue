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
      <!-- 编辑文章对话框 -->
      <el-drawer
        v-model="disabled"
        title="编辑文章"
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
              <el-button type="primary" @click="editArticle">修改</el-button>
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
            <div class="interaction-buttons">
              <button 
                class="interaction-btn like-btn" 
                :class="{ 'active': discussion.isLiked }"
                @click="handleLike($event, discussion)"
              >
                <el-icon><Pointer /></el-icon>
                <span>{{ discussion.likeNum }}</span>
              </button>
              <button 
                class="interaction-btn favorite-btn" 
                :class="{ 'active': discussion.isFavorited }"
                @click="handleFavorite($event, discussion)"
              >
                <el-icon><Star /></el-icon>
                <span>{{ discussion.favourNum }}</span>
              </button>
            </div>
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
  border: 1px solid #ddd;
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
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.back-button:hover {
  background-color: #e4e7ed;
  color: #409EFF;
  transform: translateX(-5px);
}

.back-button:active {
  transform: translateX(-2px);
}

.back-button .el-icon {
  margin-right: 4px;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.back-button:hover .el-icon {
  transform: translateX(-3px);
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
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: #f5f7fa;
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
  gap: 12px;
}

.article-operations .el-button {
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

/* 编辑按钮样式 */
.article-operations .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #2c89ff 100%);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.article-operations .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 100%);
}

/* 删除按钮样式 */
.article-operations .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e64242 100%);
  box-shadow: 0 2px 12px rgba(245, 108, 108, 0.2);
}

.article-operations .el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(245, 108, 108, 0.3);
  background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%);
}

/* 点击效果 */
.article-operations .el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 图标样式 */
.article-operations .el-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.article-operations .el-button:hover .el-icon {
  transform: scale(1.1);
}

:deep(.markdown-body) {
  min-height: auto !important;
}

:deep(.v-note-wrapper) {
  height: 100% !important;
}

:deep(.v-note-wrapper .v-note-panel) {
  height: 100% !important;
}

:deep(.v-note-wrapper .v-note-panel .v-note-edit) {
  height: 100% !important;
}

:deep(.v-note-wrapper .v-note-panel .v-note-show) {
  height: 100% !important;
}

:deep(.v-note-wrapper .v-note-panel .v-note-edit .v-note-edit-content),
:deep(.v-note-wrapper .v-note-panel .v-note-show .v-show-content) {
  height: calc(100% - 40px) !important;  /* 减去工具栏的高度 */
  overflow-y: auto !important;
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
    await formRef.value.validate()
    
    const response = await request.put('/article/update', newArticle, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      ElMessage.success('文章编辑成功')
      disabled.value = false // 关闭弹窗
      await getDiscussionDetail() // 重新获取文章详情
    } else {
      ElMessage.error(response.msg || '编辑文章失败')
    }
  } catch (error) {
    console.error('编辑文章失败:', error)
    ElMessage.error('编辑文章失败')
  }
} 
// 处理编辑按钮点击
const handleEdit = () => {
  // 填充表单数据
  if (discussion.value) {
    newArticle.title = discussion.value.title
    newArticle.content = discussion.value.content
    newArticle.articleTypeName = discussion.value.articleTypeName
    newArticle.articleType = discussion.value.articleType
    newArticle.sourceId = Number(discussion.value.id)
  }
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
      isFavorited.value=item.isFavorited
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
