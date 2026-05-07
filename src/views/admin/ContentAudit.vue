<template>
  <div class="content-audit admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">内容审核</h2>
        <p class="admin-hero__subtitle">集中处理用户投稿，快速完成通过与驳回操作。</p>
      </div>
      <div class="admin-hero__meta">
        <div class="hero-metric">
          <span class="hero-metric__label">待审核内容</span>
          <strong class="hero-metric__value">{{ pagination.total }}</strong>
        </div>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="内容类型">
          <el-select v-model="searchForm.contentType" placeholder="全部" clearable style="width: 160px">
            <el-option label="图文" :value="1" />
            <el-option label="问答" :value="2" />
            <el-option label="视频" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>待审核内容列表</span>
          <el-tag type="warning">待审核 {{ pagination.total }}</el-tag>
        </div>
      </template>

      <el-table :data="contentList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="getAuditCover(row)"
              :src="getAuditCover(row)"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 8px"
              :preview-src-list="[getAuditCover(row)]"
            />
            <span v-else class="empty-cover">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.contentType === 1" type="success">图文</el-tag>
            <el-tag v-else-if="row.contentType === 2" type="warning">问答</el-tag>
            <el-tag v-else-if="row.contentType === 3" type="danger">视频</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ getRelatedDisplay(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ getTagDisplay(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewContent(row)">查看</el-button>
            <el-button link type="success" size="small" @click="handleAudit(row, 1)">通过</el-button>
            <el-button link type="danger" size="small" @click="handleAudit(row, 2)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadContentList"
        @current-change="loadContentList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="auditDialogVisible" :title="auditForm.status === 1 ? '审核通过' : '审核驳回'" width="600px">
      <el-form :model="auditForm" label-width="88px">
        <el-form-item label="内容标题">
          <span>{{ currentContent?.title }}</span>
        </el-form-item>
        <el-form-item label="审核结果">
          <el-tag v-if="auditForm.status === 1" type="success">通过</el-tag>
          <el-tag v-else type="danger">驳回</el-tag>
        </el-form-item>
        <el-form-item v-if="auditForm.status === 2" label="审核意见">
          <el-input
            v-model="auditForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因（必填）"
          />
        </el-form-item>
        <el-form-item v-else label="备注">
          <el-input
            v-model="auditForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmAudit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="内容详情" width="860px">
      <div class="content-detail">
        <h3>{{ currentContentView.title }}</h3>
        <div class="content-meta">
          <span>关联：{{ getRelatedDisplay(currentContentView) }}</span>
          <span>标签：{{ getTagDisplay(currentContentView) }}</span>
          <span>提交时间：{{ formatDateTime(currentContentView.createTime) }}</span>
        </div>
        <div v-if="parseImages(currentContentView.images).length" class="content-images">
          <el-image
            v-for="(img, index) in parseImages(currentContentView.images)"
            :key="index"
            :src="img"
            fit="cover"
            style="width: 150px; height: 150px; margin: 5px; border-radius: 8px"
            :preview-src-list="parseImages(currentContentView.images)"
          />
        </div>
        <div class="content-body" v-html="currentContentView.content || '暂无内容'" />
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="success" @click="handleAudit(currentContent, 1)">通过</el-button>
        <el-button type="danger" @click="handleAudit(currentContent, 2)">驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { extractDisplayTags } from '@/utils/contentTags'
import { formatDateTime as formatDateTimeValue, type DateInput } from '@/utils/date'
import { getFirstImageUrl, parseImageList } from '@/utils/imageUrl'

const loading = ref(false)
const submitting = ref(false)
const contentList = ref<any[]>([])
const auditDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentContent = ref<any>(null)
const currentContentView = computed(() => currentContent.value || {})

const RELATED_FIELD_GROUPS = [
  { prefix: '关联景点', fields: ['attractionName', 'attractionTitle', 'attraction'] },
  { prefix: '关联美食', fields: ['foodName', 'foodTitle', 'food'] },
  { prefix: '关联酒店', fields: ['hotelName', 'hotelTitle', 'hotel'] }
]

const searchForm = reactive<{
  contentType: number | null
}>({
  contentType: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const auditForm = reactive<{
  contentId: number | null
  status: number | null
  comment: string
}>({
  contentId: null,
  status: null,
  comment: ''
})

const normalizeTextList = (value: unknown): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return [String(item)]
        }
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>
          return [record.name, record.title, record.label, record.value]
            .filter((entry): entry is string | number => typeof entry === 'string' || typeof entry === 'number')
            .map((entry) => String(entry))
        }
        return []
      })
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return []

    if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
      try {
        return normalizeTextList(JSON.parse(raw))
      } catch {
        // Fallback to delimiter parsing.
      }
    }

    return raw
      .split(/[，,、/|]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return [String(value).trim()].filter(Boolean)
}

const formatDateTime = (value: DateInput) => formatDateTimeValue(value, '--')
const getAuditCover = (row: any) => getFirstImageUrl(row.coverImage, row.image, row.images)

const getRelatedDisplayList = (content: Record<string, any>) => {
  if (!content) return []

  const relatedItems = RELATED_FIELD_GROUPS.flatMap(({ prefix, fields }) =>
    fields.flatMap((field) => normalizeTextList(content[field]).map((item) => `${prefix}：${item}`))
  )

  if (relatedItems.length) {
    return [...new Set(relatedItems)]
  }

  const fallbackRelated = normalizeTextList(content.region)
  return fallbackRelated.map((item) => `关联地区：${item}`)
}

const getRelatedDisplay = (content: Record<string, any>) => {
  const list = getRelatedDisplayList(content)
  return list.length ? list.join(' / ') : '未设置关联'
}

const getTagDisplay = (content: Record<string, any>) => {
  const tags = extractDisplayTags(content, ['tags', 'tagList', 'tagNames', 'labels', 'keywords', 'theme', 'themes'])
  return tags.length ? tags.join(' / ') : '未设置标签'
}

const loadContentList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/audit/content/pending', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        contentType: searchForm.contentType
      }
    })
    if (res.code === 200) {
      contentList.value = res.data.list || res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadContentList()
}

const handleReset = () => {
  searchForm.contentType = null
  handleSearch()
}

const handleAudit = (content: any, status: number) => {
  if (!content) return
  currentContent.value = content
  auditForm.contentId = content.id
  auditForm.status = status
  auditForm.comment = ''
  detailDialogVisible.value = false
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
  if (auditForm.status === 2 && !auditForm.comment.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  submitting.value = true
  try {
    const res: any = await request.post('/admin/audit/content', null, {
      params: {
        contentId: auditForm.contentId,
        auditStatus: auditForm.status,
        auditComment: auditForm.comment
      }
    })
    if (res.code === 200) {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      loadContentList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '审核失败')
  } finally {
    submitting.value = false
  }
}

const viewContent = (content: any) => {
  currentContent.value = content
  detailDialogVisible.value = true
}

const parseImages = (images: string | string[] | null | undefined) => {
  return parseImageList(images)
}

onMounted(() => {
  loadContentList()
})
</script>

<style scoped lang="scss">
.content-audit {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hero-metric {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 120px;
  }

  .hero-metric__label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .hero-metric__value {
    font-size: 30px;
    line-height: 1;
    color: #fff;
  }

  .empty-cover {
    color: #9ca3af;
  }

  .content-detail {
    h3 {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 700;
      color: #14213d;
    }
  }

  .content-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 18px;
    color: #667085;
    font-size: 14px;
  }

  .content-images {
    margin-bottom: 20px;
  }

  .content-body {
    line-height: 1.8;
    color: #344054;
  }
}
</style>
