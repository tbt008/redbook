<template>
  <div class="discussion-detail-container" v-loading="loading">
    <!-- 返回按钮 -->
    <el-button @click="router.back()" class="back-button">
  <el-icon><ArrowLeft />返回</el-icon>
</el-button>
    <!-- 文章主体内容 -->
    <div class="discussion-main" v-if="discussion">
      <div class="discussion-header">
        <h1>{{ discussion.title }}</h1>
        <div class="meta-info">
          <el-tag :type="getArticleTypeTag(discussion.articleTypeName )">
            {{ discussion.articleTypeName }}
          </el-tag>
        </div>
        <div class="author-info">
          <span class="author-name">{{ discussion.userId }}</span>
          <span class="publish-time">发布于 {{ formatDateArray(discussion.createTime) }}</span>
          <div class="article-stats">
            <span class="stats-item">
              <el-icon><View /></el-icon>
              <span class="stats-number">{{ discussion.articleReads }}</span>
            </span>
            <span class="stats-item" @click="handleFavorite">
              <el-icon><Star /></el-icon>
              <span class="stats-number">{{ discussion.favourNum }}</span>
            </span>
            <span class="stats-item" @click="handleLike" :class="{ 'active': isLiked }">
              <el-icon><Pointer /></el-icon>
              <span class="stats-number">{{ discussion.likeNum }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="discussion-content">
        {{ discussion.content }}
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <h3>评论 ({{ discussion.comments?.length || 0 }})</h3>
        
        <!-- 发表评论 -->
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
              <el-avatar :size="24" :src="comment.authorAvatar"></el-avatar>
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="DiscussionDetail">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus' 
import { type Article } from '@/types/article'
import request from '@/util/request' 
import { View, Star, Pointer, ArrowLeft } from '@element-plus/icons-vue' 
 

const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(true) 
const discussion = ref<Article | null>(null)
const newComment = ref<string>('') 
const token = localStorage.getItem('auth-token') 
const isLiked = ref(false)

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
    "算法板子文章": 'primary'
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

onMounted(() => {
  getDiscussionDetail()
})
</script>

<style scoped>
.discussion-detail-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.discussion-main {
  margin-top: 20px;
}

.discussion-header {
  margin-bottom: 24px;
}

.discussion-header h1 {
  margin-bottom: 16px;
}

.meta-info {
  margin-bottom: 16px;
}

.meta-info .el-tag {
  margin-right: 8px;
}

.problem-link {
  color: #409EFF;
  margin-left: 8px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}

.discussion-content {
  font-size: 16px;
  line-height: 1.6;
  margin: 24px 0;
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
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-content {
  margin: 8px 0;
}

.action-bar,
.comment-actions {
  display: none;
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
.article-stats {
  display: flex;
  gap: 12px; /* 增加间距 */
  align-items: center;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.stats-item .el-icon {
  font-size: 16px;
  color: #606266;
}

.stats-number {
  font-size: 14px;
  color: #606266;
}

.stats-item.active {
  color: #409EFF;
}

.stats-item.active .el-icon,
.stats-item.active .stats-number {
  color: #409EFF;
}
</style>
