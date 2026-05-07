<template>
  <div class="content-detail-container">
    <TourismTopNav />

    <el-main v-loading="loading" class="main-content">
      <div class="content-wrapper">
        <!-- 内容主体 -->
        <div class="content-main">
          <h1 class="title">{{ content.title }}</h1>
          
          <div class="author-info" @click="goUserProfile(content)">
            <el-avatar :src="resolveAvatar(content)" :size="40" class="clickable-avatar">
              {{ getAvatarText(getDisplayName(content)) }}
            </el-avatar>
            <div class="author-detail">
              <div class="author-name">{{ getDisplayName(content) }}</div>
            </div>
          </div>

          <div class="content-body">
            <div v-if="content.type === 3" class="video-player">
              <video :src="content.videoUrl" controls style="width: 100%; max-height: 600px"></video>
            </div>
            <div v-else class="images-grid">
              <el-image
                v-for="(img, index) in content.images"
                :key="index"
                :src="img"
                fit="cover"
                :preview-src-list="content.images"
                :initial-index="index"
              />
            </div>
            <div class="text-content markdown-body" v-html="renderedContent"></div>
          </div>

          <div v-if="displayTags.length" class="tags">
            <el-tag v-for="tag in displayTags" :key="tag" type="info">{{ tag }}</el-tag>
          </div>

          <div class="actions">
            <el-button :icon="isLiked ? StarFilled : Star" @click="toggleLike">
              {{ isLiked ? '已点赞' : '点赞' }} ({{ content.likeCount }})
            </el-button>
            <el-button :type="isCollected ? 'warning' : 'default'" :icon="isCollected ? StarFilled : Star" @click="toggleCollect">
              {{ isCollected ? '已收藏' : '收藏' }} ({{ content.collectCount }})
            </el-button>
            <el-button :icon="ChatDotRound">评论 ({{ content.commentCount }})</el-button>
            <el-button :icon="Share">分享</el-button>
          </div>

          <!-- 评论区 -->
          <div class="comments-section">
            <h3>评论 ({{ comments.length }})</h3>
            
            <div v-if="isLogin" class="comment-input">
              <div v-if="replyingTo" class="reply-tip">
                正在回复 {{ getDisplayName(replyingTo) }}
                <el-button text size="small" @click="cancelReply">取消回复</el-button>
              </div>
              <el-input
                v-model="commentText"
                type="textarea"
                :rows="3"
                :placeholder="replyingTo ? `回复 ${getDisplayName(replyingTo)}...` : '写下你的评论...'"
              />
              <el-button type="primary" @click="submitComment" :loading="submitting">
                {{ replyingTo ? '发表回复' : '发表评论' }}
              </el-button>
            </div>
            <div v-else class="login-tip">
              <el-link type="primary" @click="goLogin">登录后发表评论</el-link>
            </div>

            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar
                  :src="resolveAvatar(comment)"
                  :size="36"
                  class="clickable-avatar"
                  @click.stop="goUserProfile(comment)"
                >
                  {{ getAvatarText(getDisplayName(comment)) }}
                </el-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="username">{{ getDisplayName(comment) }}</span>
                    <span class="time">{{ formatTime(comment.createTime) }}</span>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-actions">
                    <el-button
                      text
                      :icon="Pointer"
                      class="comment-like-button"
                      :class="{ liked: comment.liked }"
                      @click="toggleCommentLike(comment)"
                    >
                      {{ comment.likeCount }}
                    </el-button>
                    <el-button text @click="replyComment(comment, comment)">回复</el-button>
                    <el-button
                      v-if="comment.canDelete"
                      text
                      type="danger"
                      :icon="Delete"
                      @click="deleteComment(comment)"
                    >
                      删除
                    </el-button>
                  </div>
                  <div v-if="comment.replies?.length" class="reply-list">
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                      <el-avatar
                        :src="resolveAvatar(reply)"
                        :size="28"
                        class="clickable-avatar"
                        @click.stop="goUserProfile(reply)"
                      >
                        {{ getAvatarText(getDisplayName(reply)) }}
                      </el-avatar>
                      <div class="reply-body">
                        <div class="comment-header">
                          <span class="username">{{ getDisplayName(reply) }}</span>
                          <span class="time">{{ formatTime(reply.createTime) }}</span>
                        </div>
                        <div class="comment-text">{{ reply.content }}</div>
                        <div class="comment-actions">
                          <el-button text @click="replyComment(reply, comment)">回复</el-button>
                          <el-button
                            v-if="reply.canDelete"
                            text
                            type="danger"
                            :icon="Delete"
                            @click="deleteComment(reply)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hasMoreComments" class="load-more">
              <el-button @click="loadMoreComments">加载更多评论</el-button>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="sidebar">
          <el-card class="related-card">
            <template #header>
              <div class="card-header">相关推荐</div>
            </template>
            <div class="related-list">
              <div v-for="item in relatedList" :key="item.id" class="related-item" @click="goDetail(item.id)">
                <el-image :src="item.coverImage" fit="cover" style="width: 80px; height: 80px; border-radius: 4px" />
                <div class="related-info">
                  <div class="related-title">{{ item.title }}</div>
                  <div class="related-stats">
                    <span><el-icon><View /></el-icon> {{ item.viewCount }}</span>
                    <span><el-icon><Collection /></el-icon> {{ item.collectCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, StarFilled, ChatDotRound, Share, View, Pointer, Delete, Collection } from '@element-plus/icons-vue'
import request from '@/util/request'
import { renderMarkdown } from '@/utils/markdown'
import { extractDisplayTags } from '@/utils/contentTags'
import { formatDateTime, type DateInput } from '@/utils/date'
import TourismTopNav from '@/components/TourismTopNav.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const content = ref<any>({})
const comments = ref<any[]>([])
const relatedList = ref<any[]>([])
const commentText = ref('')
const replyingTo = ref<any>(null)
const replyRoot = ref<any>(null)
const isLiked = ref(false)
const isCollected = ref(false)
const hasMoreComments = ref(false)
const commentPage = ref(1)

const isLogin = computed(() => !!localStorage.getItem('auth-token'))
const isAuthor = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.id === content.value.userId
})

const renderedContent = computed(() => renderMarkdown(content.value?.content))
const displayTags = computed(() => extractDisplayTags(content.value, ['tags', 'tagList', 'tagNames', 'labels', 'keywords', 'theme']))

const getDisplayName = (target: any) => {
  if (!target) return '平台用户'
  return (
    target.authorName ||
    target.userName ||
    target.nickname ||
    target.username ||
    target.user?.nickname ||
    target.user?.username ||
    '平台用户'
  )
}

const resolveAvatar = (target: any) => {
  if (!target) return ''
  return target.authorAvatar || target.userAvatar || target.avatar || target.user?.avatar || ''
}

const resolveUserId = (target: any) => {
  if (!target) return ''
  return target.authorId || target.userId || target.uid || target.user?.id || target.user?.uid || ''
}

const getAvatarText = (name?: string) => name?.trim()?.charAt(0) || '游'

// 加载内容详情
const loadContent = async () => {
  loading.value = true
  try {
    const res: any = await request.get(`/content/${route.params.id}`)
    if (res.code === 200) {
      content.value = res.data
      // 从API响应中获取收藏状态
      if (res.data.isCollected !== undefined) {
        isCollected.value = res.data.isCollected === 1
      }
      // 解析图片和标签
      if (res.data.images) {
        content.value.images = JSON.parse(res.data.images)
      }
      loadComments()
      loadRelated()
      checkLikeStatus()
      // 如果API没有返回收藏状态，单独检查
      if (res.data.isCollected === undefined) {
        checkCollectStatus()
      }
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  try {
    const res: any = await request.get('/comment/list', {
      params: {
        contentId: route.params.id,
        contentType: 1, // 1表示内容类型
        pageNum: commentPage.value,
        pageSize: 10
      }
    })
    if (res.code === 200) {
      comments.value = res.data.list || res.data.records || []
      hasMoreComments.value = comments.value.length < (res.data.total || 0)
    }
  } catch (error) {
    console.error('加载评论失败', error)
  }
}

// 加载相关内容
const loadRelated = async () => {
  try {
    const res: any = await request.get('/content/related', {
      params: { contentId: route.params.id }
    })
    if (res.code === 200) {
      relatedList.value = res.data || []
    }
  } catch (error) {
    console.error('加载相关内容失败', error)
  }
}

// 检查点赞状态
const checkLikeStatus = async () => {
  if (!isLogin.value) return
  try {
    const res: any = await request.get(`/content/like/check/${route.params.id}`)
    if (res.code === 200) {
      isLiked.value = res.data
    }
  } catch (error) {
    console.error('检查点赞状态失败', error)
  }
}

// 检查收藏状态
const checkCollectStatus = async () => {
  if (!isLogin.value) return
  try {
    const res: any = await request.get(`/content/collect/check/${route.params.id}`)
    if (res.code === 200) {
      isCollected.value = res.data
    }
  } catch (error) {
    console.error('检查收藏状态失败', error)
  }
}

// 切换点赞
const toggleLike = async () => {
  if (!isLogin.value) {
    goLogin()
    return
  }
  try {
    if (isLiked.value) {
      // 取消点赞
      await request.delete(`/content/like/${route.params.id}`)
      isLiked.value = false
      content.value.likeCount = Math.max(0, (content.value.likeCount || 0) - 1)
      ElMessage.success('取消点赞')
    } else {
      // 点赞
      await request.post(`/content/like/${route.params.id}`)
      isLiked.value = true
      content.value.likeCount = (content.value.likeCount || 0) + 1
      ElMessage.success('点赞成功')
    }
  } catch (error: any) {
    console.error('点赞操作失败:', error)
    // 如果是已点赞的错误，更新状态
    if (error.message && error.message.includes('已点赞')) {
      isLiked.value = true
    }
    ElMessage.error(error.message || '操作失败')
  }
}

// 切换收藏
const toggleCollect = async () => {
  if (!isLogin.value) {
    goLogin()
    return
  }
  try {
    if (isCollected.value) {
      // 取消收藏
      await request.delete(`/content/collect/${route.params.id}`)
      isCollected.value = false
      content.value.collectCount = Math.max(0, (content.value.collectCount || 0) - 1)
      ElMessage.success('取消收藏')
    } else {
      // 收藏
      await request.post(`/content/collect/${route.params.id}`)
      isCollected.value = true
      content.value.collectCount = (content.value.collectCount || 0) + 1
      ElMessage.success('收藏成功')
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    // 如果是已收藏的错误，更新状态
    if (error.message && error.message.includes('已收藏')) {
      isCollected.value = true
    }
    ElMessage.error(error.message || '操作失败')
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    const res: any = await request.post('/comment/add', {
      contentId: Number(route.params.id),
      contentType: 1, // 1表示内容类型
      content: commentText.value,
      parentId: replyRoot.value?.id || null,
      status: 1 // 1表示已发布
    })
    if (res.code === 200) {
      ElMessage.success(replyingTo.value ? '回复成功' : '评论成功')
      commentText.value = ''
      replyingTo.value = null
      replyRoot.value = null
      commentPage.value = 1
      loadComments()
      // 更新评论数
      if (content.value.commentCount !== undefined) {
        content.value.commentCount++
      }
    }
  } catch (error: any) {
    if (!error.messageShown) ElMessage.error(error.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  commentPage.value++
  loadComments()
}

// 切换评论点赞
const toggleCommentLike = async (comment: any) => {
  if (!isLogin.value) {
    goLogin()
    return
  }
  try {
    if (comment.liked) {
      const res: any = await request.delete(`/comment/like/${comment.id}`)
      if (res.code === 200) {
        comment.liked = false
        comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1)
        ElMessage.success('取消点赞')
      }
    } else {
      const res: any = await request.post(`/comment/like/${comment.id}`)
      if (res.code === 200) {
        comment.liked = true
        comment.likeCount = (comment.likeCount || 0) + 1
        ElMessage.success('点赞成功')
      }
    }
  } catch (error: any) {
    if (error.message && error.message.includes('已点赞')) {
      comment.liked = true
    }
    ElMessage.error(error.message || '操作失败')
  }
}

// 回复评论
const replyComment = (comment: any, rootComment: any) => {
  if (!isLogin.value) {
    goLogin()
    return
  }
  replyingTo.value = comment
  replyRoot.value = rootComment
  commentText.value = `@${getDisplayName(comment)} `
}

const cancelReply = () => {
  replyingTo.value = null
  replyRoot.value = null
  commentText.value = ''
}

const deleteComment = async (comment: any) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？', '删除评论', { type: 'warning' })
    const res: any = await request.delete(`/comment/delete/${comment.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      commentPage.value = 1
      loadComments()
      if (content.value.commentCount !== undefined) {
        content.value.commentCount = Math.max(0, content.value.commentCount - 1)
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 格式化时间
const formatTime = (time: DateInput) => formatDateTime(time, '-', 'YYYY-MM-DD HH:mm')

// 跳转详情
const goDetail = (id: number) => {
  router.push(`/content/${id}`)
  loadContent()
}

const goUserProfile = (target: any) => {
  const userId = resolveUserId(target)
  if (!userId) {
    ElMessage.warning('暂未获取到用户信息')
    return
  }
  router.push(`/user/${userId}`)
}

const goBack = () => router.back()
const goHome = () => router.push('/')
const goLogin = () => router.push('/login')

onMounted(() => {
  loadContent()
})
</script>

<style scoped lang="scss">
.content-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
  line-height: 60px;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 20px;

    .logo h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #ff6b6b;
      cursor: pointer;
    }
  }
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.content-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 32px;

  .title {
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 20px 0;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    width: fit-content;
    cursor: pointer;

    &:hover {
      .author-name {
        color: #409eff;
      }
    }

    .author-detail {
      min-width: 0;

      .author-name {
        font-weight: bold;
        margin-bottom: 0;
      }
    }
  }

  .content-body {
    margin-bottom: 24px;

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 20px;

      .el-image {
        width: 100%;
        height: 200px;
        border-radius: 8px;
      }
    }

    .text-content {
      line-height: 1.8;
      font-size: 16px;
      color: #333;

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6) {
        margin: 1.1em 0 0.6em;
        line-height: 1.35;
        color: #0f172a;
      }

      :deep(p) {
        margin: 0 0 1em;
        white-space: normal;
        word-break: break-word;
      }

      :deep(ul),
      :deep(ol) {
        margin: 0 0 1em;
        padding-left: 1.5em;
      }

      :deep(li) {
        margin-bottom: 0.35em;
      }

      :deep(blockquote) {
        margin: 1em 0;
        padding: 12px 16px;
        border-left: 4px solid #409eff;
        background: #f8fbff;
        color: #475569;
        border-radius: 6px;
      }

      :deep(pre) {
        margin: 1em 0;
        padding: 16px;
        overflow-x: auto;
        border-radius: 10px;
        background: #0f172a;
        color: #e2e8f0;
      }

      :deep(code) {
        padding: 2px 6px;
        border-radius: 4px;
        background: #f1f5f9;
        font-size: 0.92em;
      }

      :deep(pre code) {
        padding: 0;
        background: transparent;
        color: inherit;
      }

      :deep(img) {
        display: block;
        max-width: 100%;
        border-radius: 10px;
        margin: 12px 0;
      }

      :deep(a) {
        color: #2563eb;
        text-decoration: none;
      }

      :deep(a:hover) {
        text-decoration: underline;
      }
    }
  }

  .tags {
    margin-bottom: 24px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    :deep(.el-tag) {
      border-radius: 999px;
      padding-inline: 12px;
    }
  }

  .actions {
    display: flex;
    gap: 12px;
    padding: 20px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }
}

.clickable-avatar {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.22);
  }
}

.comments-section {
  margin-top: 32px;

  h3 {
    margin-bottom: 20px;
  }

  .comment-input {
    margin-bottom: 24px;

    .reply-tip {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #606266;
      font-size: 13px;
    }

    .el-button {
      margin-top: 12px;
    }
  }

  .login-tip {
    text-align: center;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .comments-list {
    .comment-item {
      display: flex;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid #eee;

      .comment-content {
        flex: 1;

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .username {
            font-weight: bold;
          }

          .time {
            font-size: 12px;
            color: #999;
          }
        }

        .comment-text {
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .comment-actions {
          display: flex;
          gap: 16px;

          .comment-like-button {
            color: #606266;

            &.liked {
              color: #0f8f73;
            }
          }
        }

        .reply-list {
          margin-top: 12px;
          padding: 12px;
          background: #f8f9fb;
          border-radius: 8px;

          .reply-item {
            display: flex;
            gap: 10px;
            padding: 10px 0;

            &:not(:last-child) {
              border-bottom: 1px solid #e9edf3;
            }

            .reply-body {
              flex: 1;
            }
          }
        }
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 20px 0;
  }
}

.sidebar {
  width: 320px;

  .related-card {
    .card-header {
      font-weight: bold;
    }

    .related-list {
      .related-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        cursor: pointer;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f5f5f5;
        }

        .related-info {
          flex: 1;

          .related-title {
            font-size: 14px;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .related-stats {
            font-size: 12px;
            color: #999;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}
</style>
