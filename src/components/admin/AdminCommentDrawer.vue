<template>
  <el-drawer v-model="visible" :title="drawerTitle" size="620px" class="admin-comment-drawer" destroy-on-close>
    <div class="comment-toolbar">
      <div>
        <strong>{{ currentContent.title || '未选择内容' }}</strong>
        <p>{{ contentTypeName }}评论管理</p>
      </div>
      <el-button :icon="RefreshRight" :loading="loading" @click="loadComments">刷新</el-button>
    </div>

    <el-table :data="flatComments" v-loading="loading" class="comment-table" row-key="id">
      <el-table-column label="评论内容" min-width="280">
        <template #default="{ row }">
          <div class="comment-content" :style="{ paddingLeft: `${row.level * 18}px` }">
            <div class="comment-meta">
              <el-tag v-if="row.level > 0" size="small" type="info">回复</el-tag>
              <span>{{ row.userName || `用户${row.userId || ''}` }}</span>
              <em>{{ formatDateTime(row.createTime) }}</em>
            </div>
            <p>{{ row.content || '无内容' }}</p>
            <el-rate v-if="row.rating" :model-value="row.rating" disabled size="small" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞" width="80" align="center" />
      <el-table-column label="操作" width="90" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && flatComments.length === 0" description="暂无评论" />

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, prev, pager, next"
        @current-change="loadComments"
        @size-change="loadComments"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'

type CommentItem = {
  id: number
  userId?: number
  userName?: string
  content?: string
  rating?: number
  likeCount?: number
  createTime?: string
  replies?: CommentItem[]
  level?: number
}

const visible = ref(false)
const loading = ref(false)
const comments = ref<CommentItem[]>([])
const currentContent = reactive({
  id: null as number | null,
  title: '',
  type: 1
})
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 })

const contentTypeMap: Record<number, string> = {
  1: '内容',
  4: '景点',
  5: '美食',
  6: '酒店'
}

const contentTypeName = computed(() => contentTypeMap[currentContent.type] || '内容')
const drawerTitle = computed(() => `${contentTypeName.value}评论`)

const flattenComments = (list: CommentItem[], level = 0): CommentItem[] => {
  return list.flatMap((item) => [
    { ...item, level },
    ...flattenComments(item.replies || [], level + 1)
  ])
}

const flatComments = computed(() => flattenComments(comments.value))

const open = (content: { id: number; title: string; type: number }) => {
  currentContent.id = content.id
  currentContent.title = content.title
  currentContent.type = content.type
  pagination.pageNum = 1
  visible.value = true
  loadComments()
}

const loadComments = async () => {
  if (!currentContent.id) return
  loading.value = true
  try {
    const res: any = await request.get('/comment/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        contentId: currentContent.id,
        contentType: currentContent.type,
        _t: Date.now()
      }
    })
    comments.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载评论失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (comment: CommentItem) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？如果包含回复，回复也会一并删除。', '删除评论', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.delete(`/comment/admin/delete/${comment.id}`)
    if (res.code === 200) {
      ElMessage.success('评论已删除')
      loadComments()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除评论失败')
    }
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.comment-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;

  strong {
    color: #1f2f2a;
    font-size: 16px;
  }

  p {
    margin: 4px 0 0;
    color: #7a8680;
    font-size: 13px;
  }
}

.comment-table {
  width: 100%;
}

.comment-content {
  .comment-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6f7b75;
    font-size: 12px;

    span {
      color: #30423b;
      font-weight: 600;
    }

    em {
      font-style: normal;
    }
  }

  p {
    margin: 6px 0;
    color: #1f2f2a;
    line-height: 1.6;
    word-break: break-word;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
