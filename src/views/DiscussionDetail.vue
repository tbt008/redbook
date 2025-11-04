<template>
  <div class="page-container">
    <!-- 主要内容区 -->
    <div class="main-content" v-loading="loading">
      <el-button @click="router.back()" class="back-button">
        <el-icon>
          <ArrowLeft />
        </el-icon>返回
      </el-button>

      <div class="discussion-main" v-if="discussion">
        <!-- 文章头部 -->
        <div class="article-header">
          <h1 class="article-title">{{ discussion.title }}</h1>
          <div class="article-meta">
            <div class="article-info-row">
              <el-tag :type="getArticleTypeTag(discussion.articleTypeName)" size="small" class="article-type-tag">
                {{ discussion.articleTypeName }}
              </el-tag>
              <!-- 修改题目链接显示 -->
              <el-link v-if="discussion?.articleTypeName === '题解文章' && discussion?.sourceId"
                :href="`/question?id=${discussion.sourceId}`" type="primary" class="problem-link">
                <el-icon>
                  <Link />
                </el-icon>
                题目：{{ discussion.sourceId }}. {{ questionTitle }}
              </el-link>
            </div>
            <div class="author-info">
              <el-avatar :size="32" :src="discussion.avatar" />
              <span class="author-name">{{ discussion.userId }}</span>
              <span class="publish-time">发布于 {{ formatDateArray(discussion.createTime) }}</span>
              <div class="article-operations" v-if="discussion?.userId?.toString() === isAuthor?.toString()">
                <el-button type="primary" size="small" @click="handleEdit">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <!-- 编辑文章对话框 -->
        <el-drawer v-model="disabled" title="编辑文章" size="100%" :with-header="false" direction="ttb"
          class="publish-drawer">
          <div class="publish-container">
            <el-form :model="newArticle" :rules="rules" ref="formRef" class="publish-form">
              <el-form-item label="标题" prop="title">
                <el-input v-model="newArticle.title" placeholder="请输入标题"></el-input>
              </el-form-item>

              <el-form-item label="文章类型" prop="articleTypeName">
                <el-select v-model="newArticle.articleTypeName" placeholder="请选择文章类型" style="width: 100%"
                  @change="handleArticleTypeChange">
                  <el-option v-for="type in articleTypes" :key="type.value" :label="type.label" :value="type.value" />
                </el-select>
              </el-form-item>

              <!-- 添加题解文章关联题目选项 -->
              <el-form-item v-if="newArticle.articleType === 1" label="关联题目" prop="sourceId">
                <el-select v-model="newArticle.sourceId" placeholder="请输入题目名称选择关联的题目" filterable remote
                  :remote-method="searchProblems" :loading="problemsLoading" style="width: 100%">
                  <el-option v-for="item in problemOptions" :key="item.questionId"
                    :label="`${item.questionId}. ${item.title}`" :value="item.questionId" />
                </el-select>
              </el-form-item>

              <el-form-item label="内容" prop="content">
                <div class="editor-container">
                  <mavon-editor v-model="newArticle.content" class="md-editor" ref="mavonEditorRef" :ishljs="true"
                    :toolbars="toolbars" @change="handleEditorChange" :boxShadow="false" />
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
          <mavon-editor v-model="discussion.content" :subfield="false" :defaultOpen="'preview'" :toolbarsFlag="false"
            :editable="false" :scrollStyle="true" :ishljs="true" />
        </div>

        <!-- 文章底部操作栏 -->
        <div class="article-actions">
          <div class="action-buttons">
            <div class="interaction-buttons">
              <button class="interaction-btn like-btn" :class="{ 'active': discussion.isLiked }"
                @click="handleLike($event, discussion)">
                <el-icon>
                  <Pointer />
                </el-icon>
                <span>{{ discussion.likeNum }}</span>
              </button>
              <button class="interaction-btn favorite-btn" :class="{ 'active': discussion.isFavorited }"
                @click="handleFavorite($event, discussion)">
                <el-icon>
                  <Star />
                </el-icon>
                <span>{{ discussion.favourNum }}</span>
              </button>
            </div>
            <span class="view-count">
              <el-icon>
                <View />
              </el-icon>
              {{ discussion.articleReads }}次浏览
            </span>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <h3>评论 ({{ discussion.comments?.length || 0 }})</h3>

          <!-- 评论输入框 -->
          <div class="comment-input">
            <mavon-editor v-model="newComment" class="comment-editor" :toolbars="commentToolbars" :boxShadow="false"
              placeholder="写下你的评论..." />
            <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
              发表评论
            </el-button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <el-card v-for="comment in discussion.comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <el-avatar :size="32" :src="comment.avatar" />
                <div class="comment-info">
                  <span class="comment-author">{{ comment.userId }}</span>
                  <span class="comment-time">{{ formatDateArray(comment.createTime) }}</span>
                </div>

                <!-- 添加删除按钮 -->
                <!-- 如果是作者是用户或者评论作者是用户则可以删除 -->
                <el-button
                  v-if="isAuthor?.toString() === comment.userId?.toString() || isAuthor?.toString() === discussion?.userId?.toString()"
                  type="danger" size="small" class="delete-comment-btn" @click="handleDeleteComment(comment.id)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>

              <div class="comment-content markdown-body">
                <mavon-editor v-model="comment.content" :subfield="false" :defaultOpen="'preview'" :toolbarsFlag="false"
                  :editable="false" :scrollStyle="true" :ishljs="true" />
              </div>

              <div class="comment-divider"></div>

              <div class="comment-footer">
                <div class="comment-actions">
                  <!-- 左侧查看回复按钮 -->
                  <div class="left-actions">
                    <el-button type="text" size="small" @click="toggleReplies(comment)" class="view-replies-button"
                      v-if="comment.children && comment.children.length > 0">
                      <el-icon>
                        <ArrowDown :class="{ 'rotate': showRepliesMap[comment.id] }" />
                      </el-icon>
                      {{ showRepliesMap[comment.id] ? '收起' : `${comment.children.length}条回复` }}
                    </el-button>
                  </div>

                  <!-- 右侧固定的发表回复按钮 -->
                  <div class="right-actions">
                    <el-button type="text" size="small" @click="showReplyInput(comment)" class="create-reply-button">
                      <el-icon>
                        <ChatLineRound />
                      </el-icon>
                      回复
                    </el-button>
                  </div>
                </div>

                <!-- 回复输入框 -->
                <div v-if="activeReplyId === comment.id" class="reply-input">
                  <div class="reply-to">
                    回复 <span class="reply-target">@{{ replyToUser }}</span>
                  </div>
                  <mavon-editor v-model="replyContent" class="reply-editor" :toolbars="commentToolbars"
                    :boxShadow="false" placeholder="写下你的回复..." />
                  <div class="reply-actions">
                    <el-button size="small" @click="cancelReply">取消</el-button>
                    <el-button type="primary" size="small" @click="submitReply(comment)"
                      :disabled="!replyContent.trim()">
                      回复
                    </el-button>
                  </div>
                </div>

                <!-- 回复列表 -->
                <div v-if="showRepliesMap[comment.id] && comment.children && comment.children.length > 0"
                  class="reply-list">
                  <div v-for="reply in comment.children" :key="reply.id" class="reply-item">
                    <div class="reply-header">
                      <el-avatar :size="24" :src="reply.avatar" />
                      <span class="reply-author">{{ reply.userId }}</span>
                      <span class="reply-time">{{ formatDateArray(reply.createTime) }}</span>

                      <!-- 调整按钮顺序 -->
                      <div class="reply-header-actions">
                        <el-button type="text" size="small" @click="showReplyInput(reply)">
                          回复
                        </el-button>
                        <el-button
                          v-if="isAuthor?.toString() === reply.userId?.toString() || isAuthor?.toString() === discussion?.userId?.toString()"
                          type="danger" size="small" class="delete-comment-btn" @click="handleDeleteComment(reply.id)">
                          <el-icon>
                            <Delete />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                    <div class="reply-content markdown-body">
                      <template v-if="reply.parentId !== reply.rootId">
                        <!-- {{ reply.parentId }} -->
                        回复 <span class="reply-target">@{{ findParentCommentUser(reply.parentId) }}</span>：
                      </template>
                      <mavon-editor v-model="reply.content" :subfield="false" :defaultOpen="'preview'"
                        :toolbarsFlag="false" :editable="false" :scrollStyle="true" :ishljs="true" />
                    </div>
                    <!-- 回复的回复输入框 -->
                    <div v-if="activeReplyId === reply.id" class="nested-reply-input">
                      <div class="reply-to">
                        回复 <span class="reply-target">@{{ replyToUser }}</span>
                      </div>
                      <mavon-editor v-model="replyContent" class="reply-editor" :toolbars="commentToolbars"
                        :boxShadow="false" placeholder="写下你的回复..." />
                      <div class="reply-actions">
                        <el-button size="small" @click="cancelReply">取消</el-button>
                        <el-button type="primary" size="small" @click="submitReply(reply)"
                          :disabled="!replyContent.trim()">
                          回复
                        </el-button>
                      </div>
                    </div>

                  </div>
                </div>
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
          <el-avatar :size="64" :src="discussion.avatar" />
          <!-- <h3>{{ discussion.userId }}</h3> -->
          <h3>{{ discussion.nickName }}</h3>
          <div class="author-stats">
            <div class="stat-item">
              <div class="stat-value">{{ authorStats.articles }}</div>
              <div class="stat-label">总文章</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ authorStats.totalLikes }}</div>
              <div class="stat-label">总获赞</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, Pointer, ArrowLeft, Edit, Delete, ChatLineRound, ArrowDown, Link } from '@element-plus/icons-vue'
import { type Article } from '@/types/article'
import request from '@/util/request'
const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(true)
const discussion = ref<Article | null>(null)
const newComment = ref<string>('')
const token = localStorage.getItem('auth-token')
const isFavorited = ref(false)
const currentUser = ref<any>(null)
const isAuthor = localStorage.getItem('uid')
const disabled = ref(false)
import type { FormInstance } from 'element-plus'
const formRef = ref<FormInstance>()
// 作者统计数据
const authorStats = reactive({
  articles: "null" as number | string,
  totalLikes: "null" as number | string
})
// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度应在 2 到 50 个字符之间', trigger: 'blur' }
  ],
  articleTypeName: [
    { required: true, message: '请选择文章类型', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 3, message: '内容不能少于 3 个字符', trigger: 'blur' }
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
  sourceId: null as number | null
})
// 编辑器变更处理函数
const handleEditorChange = (value: string, render: string) => {
  newArticle.content = value // 保存 markdown 内容
}
// 添加响应式数据
const problemOptions = ref<Problem[]>([])
const problemsLoading = ref(false)

// 添加文章类型列表
const articleTypes = [
  { value: 0, label: '算法文章' },
  { value: 1, label: '题解文章' },
  { value: 2, label: '经验分享' },
  { value: 3, label: '杂谈' },
  { value: 4, label: '竞赛' },
  { value: 5, label: '算法模板' },
]

// 添加类型定义
interface Problem {
  questionId: number
  title: string
}

// 文章类型变更处理方法
const handleArticleTypeChange = (value: number) => {
  newArticle.articleType = value
  if (value !== 1) {
    newArticle.sourceId = null
  }
}

// 搜索题目方法
const searchProblems = async (query: string) => {
  if (query) {
    problemsLoading.value = true
    try {
      const response = await request.get('/question/list', {
        params: {
          pageStart: 1,
          pageSize: 10,
          title: query,
        }
      }) as any

      if (response.code === 200) {
        problemOptions.value = response.data.list
      }
    } catch (error) {
      console.error('搜索题目失败:', error)
    } finally {
      problemsLoading.value = false
    }
  } else {
    problemOptions.value = []
  }
}

// 编辑文章
const editArticle = async () => {
  try {
    if (!formRef.value) {
      ElMessage.error('表单初始化失败,请刷新页面重试')
      return
    }
    // formRef.value.validate() 是 Element Plus 表单组件提供的验证方法，
    // 它会根据之前定义的 rules 规则来验证表单中的所有字段。
    await formRef.value.validate()

    const response = await request.post('/article/update', {
      id: discussion.value?.id, // 使用当前文章的ID
      title: newArticle.title,
      content: newArticle.content,
      articleType: newArticle.articleType,
      sourceId: newArticle.sourceId
    }, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      ElMessage.success('文章编辑成功')
      disabled.value = false
      await getDiscussionDetail()
    } else {
      ElMessage.error(response.msg || '编辑文章失败')
    }
  } catch (error) {
    console.error('编辑文章失败:', error)
    ElMessage.error(error || '编辑文章失败')
  }
}

const handleEdit = async () => {
  if (discussion.value) {
    newArticle.title = discussion.value.title
    newArticle.content = discussion.value.content
    newArticle.articleTypeName = discussion.value.articleTypeName
    newArticle.articleType = discussion.value.articleType
    newArticle.sourceId = discussion.value.sourceId

    // 如果是题解文章，获取关联题目的详细信息
    if (discussion.value.articleTypeName === '题解文章') {
      handleArticleTypeChange(1)
      if (discussion.value.sourceId) {
        try {
          const response = await request.get('/question/info', {
            params: {
              questionId: discussion.value.sourceId
            }
          }) as any
          console.log(response)
          if (response.code === 200) {
            // 将关联题目添加到选项中
            problemOptions.value = [{
              questionId: response.data.id,
              title: response.data.title
            }]
          }
        } catch (error) {
          console.error('获取关联题目信息失败:', error)
        }
      }
    }
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
// 类型定义
interface Comment {
  id: number
  userId: number
  rootId: number
  parentId: number
  avatar: string
  content: string
  createTime: number[]
  children?: Comment[]
}

// 将评论数组转换为树形结构
const transformComments = (comments: Comment[]) => {
  const commentMap = new Map<number, Comment>()
  const rootComments: Comment[] = []

  // 首先创建所有评论的映射
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] })
  })

  // 构建树形结构
  comments.forEach(comment => {
    const currentComment = commentMap.get(comment.id)!
    if (comment.rootId === 0) {
      // 这是一级评论
      rootComments.push(currentComment)
    } else {
      // 这是回复
      const parentComment = commentMap.get(comment.rootId)
      if (parentComment && parentComment.children) {
        parentComment.children.push(currentComment)
      }
    }
  })

  return rootComments
}


const questionTitle = ref<string>('')

// 获取题目详情
const getQuestionTitle = async (questionId: number) => {
  try {
    const response = await request.get('/question/info', {
      params: {
        questionId: questionId
      }
    }) as any

    if (response.code === 200) {
      questionTitle.value = response.data.title
    }
  } catch (error) {
    console.error('获取题目信息失败:', error)
    questionTitle.value = '获取失败'
  }
}


const getDiscussionDetail = async () => {
  try {
    loading.value = true
    const response = await request.get(`/article/${route.params.id}`, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      const articleData = response.data
      if (articleData.comments) {
        articleData.comments = transformComments(articleData.comments)
      }
      discussion.value = articleData

      // 如果是题解文章，获取题目信息 
      if (articleData.articleTypeName === '题解文章' && articleData.sourceId) {

        await getQuestionTitle(articleData.sourceId)
      }
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
    const commentData = {
      articleId: discussion.value.id,
      rootId: 0,  // 顶级评论
      parentId: 0, // 顶级评论
      content: newComment.value.trim() //去除左右空格再发送
    }

    const response = await request.post('/article/comment', commentData, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      ElMessage.success('评论发表成功')
      newComment.value = '' // 清空评论输入框
      await getDiscussionDetail() // 重新获取文章详情以更新评论列表
    } else {
      ElMessage.error(response.msg || '评论发表失败')
    }
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
      getAuthorStats()
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
      getAuthorStats()
      // 更新文章的收藏状态和数量 
      item.isFavorited = !item.isFavorited
      isFavorited.value = item.isFavorited
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

// 获取作者统计数据的方法
const getAuthorStats = async () => {

  const uid = localStorage.getItem('uid')
  const id = localStorage.getItem('id')

  try {
    const response = await request.get(`/article/user/list/${discussion.value?.userId}`, {
    }) as any

    if (response.code === 200) {
      // 设置文章总数
      authorStats.articles = response.data.length

      // 计算总获赞数
      authorStats.totalLikes = response.data.reduce((sum: number, article: any) => {
        return sum + (article.likeNum || 0)
      }, 0)
      // console.log(response.data.length)
    }
    else {
      // 获取作者统计数据失败时，将文章总数和总获赞数设置为null
      authorStats.articles = "null"
      authorStats.totalLikes = "null"
      ElMessage.error(response.msg || '获取作者统计数据失败')
    }
  } catch (error) {
    console.error('获取作者统计数据失败:', error)
  }
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

// 处理删除评论
const handleDeleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await request.delete(`/article/comment/delete/${commentId}`, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      ElMessage.success('评论删除成功')
      await getDiscussionDetail() // 重新获取文章详情以更新评论列表
    } else {
      ElMessage.error(response.msg || '删除评论失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 响应式数据
const activeReplyId = ref<number | null>(null)
const replyContent = ref('')
const replyToUser = ref<string | null>(null)

// 修改显示回复输入框的方法
const showReplyInput = (comment: { id: number, userId: number | string }) => {
  activeReplyId.value = comment.id
  replyToUser.value = comment.userId.toString()
  replyContent.value = ''
}

// 修改取消回复的方法
const cancelReply = () => {
  activeReplyId.value = null
  replyToUser.value = null
  replyContent.value = ''
}

// 修改提交回复的方法
const submitReply = async (comment: Comment) => {
  if (!replyContent.value.trim()) return

  try {
    const replyData = {
      articleId: discussion.value?.id,
      rootId: comment.rootId === 0 ? comment.id : comment.rootId, // 如果回复一级评论，使用评论ID作为rootId
      parentId: comment.id,
      content: replyContent.value.trim()
    }

    const response = await request.post('/article/reply', replyData, {
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any

    if (response.code === 200) {
      ElMessage.success('回复成功')
      replyContent.value = ''
      activeReplyId.value = null
      await getDiscussionDetail() // 重新获取文章详情以更新评论列表
    } else {
      ElMessage.error(response.msg || '回复失败')
    }
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  }
}

// 响应式数据
const showRepliesMap = reactive<Record<number, boolean>>({})


const toggleReplies = (comment: { id: number }) => {
  showRepliesMap[comment.id] = !showRepliesMap[comment.id]
}

// 评论编辑器工具栏配置
const commentToolbars = {
  bold: true, // 粗体
  italic: true, // 斜体
  header: false, // 标题
  underline: true, // 下划线
  strikethrough: true, // 中划线
  mark: true, // 标记
  superscript: false, // 上角标
  subscript: false, // 下角标
  quote: true, // 引用
  ol: true, // 有序列表
  ul: true, // 无序列表
  link: true, // 链接
  imagelink: false, // 图片链接
  code: true, // 代码块
  table: false, // 表格
  fullscreen: false, // 全屏编辑
  readmodel: false, // 沉浸式阅读
  htmlcode: false, // HTML 源码
  help: false, // 帮助
  undo: true, // 上一步
  redo: true, // 下一步
  trash: true, // 清空
  navigation: false, // 导航目录
  alignleft: false, // 左对齐
  aligncenter: false, // 居中
  alignright: false, // 右对齐
  subfield: false, // 单双栏模式
  preview: true, // 预览
}

// 查找父评论用户的方法
const findParentCommentUser = (parentId: number): string => {
  // 在所有评论中查找（包括一级评论和回复）
  const findInComments = (comments: any[]): string => {
    for (const comment of comments) {
      if (comment.id === parentId) {
        return comment.userId
      }
      // 如果有子评论，递归查找
      if (comment.children && comment.children.length > 0) {
        const found = findInComments(comment.children)
        if (found) return found
      }
    }
    return ''
  }

  return findInComments(discussion.value?.comments || [])
}

// 异步执行来获取文章详情和用户信息
onMounted(async () => {
  await getDiscussionDetail()
  await getAuthorStats()
})
</script>
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
  /* max-width: 1500px; */
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
  justify-content: center;
}

.main-content {
  flex: 0.9;
  max-width: 1000px;
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
  max-width: 1000px;
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
  position: relative;
  width: 100%;
  justify-content: space-between;
}

.comment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
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

.article-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.article-type-tag {
  padding: 0 8px;
  height: 24px;
  width: 100px;
  line-height: 22px;
}

.problem-link {
  display: flex;
  align-items: center;
  gap: 4px;
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
  height: calc(100% - 40px) !important;
  /* 减去工具栏的高度 */
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

.delete-comment-btn {
  margin-left: auto;
  padding: 4px 8px;
}

.comment-actions {
  margin-top: 8px;
}

.reply-input {
  margin: 12px 0;
  padding-left: 20px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.reply-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.reply-list {
  margin-top: 12px;
  padding-left: 20px;
}

.reply-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  position: relative;
  width: 100%;
}

.reply-author {
  font-weight: 500;
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-content {
  font-size: 14px;
  color: #606266;
  padding-left: 32px;
}

.nested-reply-input {
  margin: 8px 0 8px 24px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.nested-reply-list {
  margin-left: 24px;
  margin-top: 8px;
}

.nested-reply-item {
  padding: 8px;
  margin-bottom: 4px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.reply-actions {
  margin-left: auto;
}

.reply-to {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.reply-to {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.reply-target {
  color: #409EFF;
  font-weight: 500;
}

/* 新增reply-header-actions样式 */
.reply-header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 调整删除按钮样式 */
.delete-comment-btn {
  padding: 4px 8px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.view-replies-button,
.create-reply-button {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.view-replies-button:hover,
.create-reply-button:hover {
  color: #409EFF;
}

.view-replies-button .el-icon {
  transition: transform 0.3s ease;
}

.view-replies-button .rotate {
  transform: rotate(180deg);
}

.reply-list {
  margin-top: 12px;
  margin-left: 40px;
  border-left: 2px solid #ebeef5;
  padding-left: 16px;
}

.reply-item {
  /* 次级回复背景颜色 */
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

/* 优化回复区域的视觉层次 */
.reply-content {
  margin: 8px 0;
  color: #606266;
}

.comment-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 12px 0;
}

/* 添加评论编辑器样式 */
.comment-editor {
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.comment-editor :deep(.v-note-wrapper) {
  min-height: 150px;
  max-height: 300px;
}

.reply-editor {
  margin: 8px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.reply-editor :deep(.v-note-wrapper) {
  min-height: 100px;
  max-height: 200px;
}

/* 确保markdown内容样式正确 */
.comment-content :deep(.v-note-wrapper),
.reply-content :deep(.v-note-wrapper) {
  min-height: auto !important;
  border: none;
}

.comment-content :deep(.v-note-panel),
.reply-content :deep(.v-note-panel) {
  border: none;
}

/* 修改评论内容的左边距 */
.comment-content :deep(.v-show-content),
.reply-content :deep(.v-show-content) {
  padding: 0 0 0 16px !important;
  /* 添加左边距 16px */
  background-color: transparent !important;
}
</style>
