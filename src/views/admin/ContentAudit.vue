<template>
  <div class="content-audit">
    <h2 class="page-title">内容审核</h2>

    <!-- 筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="内容类型">
          <el-select v-model="searchForm.contentType" placeholder="全部" clearable style="width: 150px">
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

    <!-- 待审核列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>待审核内容列表</span>
          <el-tag type="warning">待审核: {{ pagination.total }}</el-tag>
        </div>
      </template>

      <el-table :data="contentList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.coverImage]"
            />
            <span v-else style="color: #999">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.contentType === 1" type="success">图文</el-tag>
            <el-tag v-else-if="row.contentType === 2" type="warning">问答</el-tag>
            <el-tag v-else-if="row.contentType === 3" type="danger">视频</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="theme" label="主题" width="100" />
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewContent(row)">查看</el-button>
            <el-button link type="success" size="small" @click="handleAudit(row, 1)">通过</el-button>
            <el-button link type="danger" size="small" @click="handleAudit(row, 2)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="auditForm.status === 1 ? '审核通过' : '审核驳回'" width="600px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="内容标题">
          <span>{{ currentContent?.title }}</span>
        </el-form-item>
        <el-form-item label="审核结果">
          <el-tag v-if="auditForm.status === 1" type="success">通过</el-tag>
          <el-tag v-else type="danger">驳回</el-tag>
        </el-form-item>
        <el-form-item label="审核意见" v-if="auditForm.status === 2">
          <el-input
            v-model="auditForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因（必填）"
          />
        </el-form-item>
        <el-form-item label="备注" v-else>
          <el-input
            v-model="auditForm.comment"
            type="textarea"
            :rows="3"
            placeholder="审核备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 内容详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="内容详情" width="800px">
      <div v-if="currentContent" class="content-detail">
        <h3>{{ currentContent.title }}</h3>
        <div class="content-meta">
          <span>地区：{{ currentContent.region || '未设置' }}</span>
          <span>主题：{{ currentContent.theme || '未设置' }}</span>
          <span>提交时间：{{ currentContent.createTime }}</span>
        </div>
        <div class="content-images" v-if="currentContent.images">
          <el-image
            v-for="(img, index) in parseImages(currentContent.images)"
            :key="index"
            :src="img"
            fit="cover"
            style="width: 150px; height: 150px; margin: 5px; border-radius: 4px"
            :preview-src-list="parseImages(currentContent.images)"
          />
        </div>
        <div class="content-body" v-html="currentContent.content"></div>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'

const loading = ref(false)
const submitting = ref(false)
const contentList = ref<any[]>([])
const auditDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentContent = ref<any>(null)

const searchForm = reactive({
  contentType: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const auditForm = reactive({
  contentId: null,
  status: null,
  comment: ''
})

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
  currentContent.value = content
  auditForm.contentId = content.id
  auditForm.status = status
  auditForm.comment = ''
  detailDialogVisible.value = false
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
  if (auditForm.status === 2 && !auditForm.comment) {
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

const parseImages = (images: string) => {
  try {
    return JSON.parse(images)
  } catch {
    return []
  }
}

onMounted(() => {
  loadContentList()
})
</script>

<style scoped lang="scss">
.content-audit {
  .page-title {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .content-detail {
    h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .content-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #666;
    }

    .content-images {
      margin-bottom: 16px;
    }

    .content-body {
      line-height: 1.8;
      color: #333;
    }
  }
}
</style>

