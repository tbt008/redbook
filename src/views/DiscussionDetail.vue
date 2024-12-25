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
            </div>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="article-content">
          {{ discussion.content }}
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
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Star, Pointer, ArrowLeft } from '@element-plus/icons-vue'
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

// 作者统计数据
const authorStats = reactive({
  articles: 0,
  likes: 0
})

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

onMounted(() => {
  getDiscussionDetail()
})
</script>
