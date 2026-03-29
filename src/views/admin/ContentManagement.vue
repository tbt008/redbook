<template>
  <div class="content-management">
    <h2 class="page-title">内容管理</h2>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="内容标题">
          <el-input v-model="searchForm.keyword" placeholder="请输入内容标题" style="width: 200px" clearable />
        </el-form-item>
        <el-form-item label="内容类型">
          <el-select v-model="searchForm.contentType" placeholder="全部" clearable style="width: 120px">
            <el-option label="纯文字" :value="1" />
            <el-option label="图文" :value="2" />
            <el-option label="视频" :value="3" />
            <el-option label="图文+视频" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="已发布" :value="2" />
            <el-option label="已下架" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="searchForm.region" placeholder="全部地区" clearable style="width: 150px">
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 内容列表 -->
    <el-card class="table-card">
      <el-table :data="contentList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="内容信息" width="350">
          <template #default="{ row }">
            <div class="content-info">
              <el-image v-if="row.coverImage" :src="row.coverImage" fit="cover" style="width: 80px; height: 60px; border-radius: 4px">
                <template #error>
                  <div class="image-slot"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div v-else class="image-slot" style="width: 80px; height: 60px">
                <el-icon><Document /></el-icon>
              </div>
              <div class="content-detail">
                <div class="title">{{ row.title }}</div>
                <div class="summary">{{ row.summary || row.content?.substring(0, 30) }}...</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.contentType === 1" type="info">文字</el-tag>
            <el-tag v-else-if="row.contentType === 2">图文</el-tag>
            <el-tag v-else-if="row.contentType === 3" type="warning">视频</el-tag>
            <el-tag v-else-if="row.contentType === 4" type="success">混合</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览" width="60" />
        <el-table-column prop="likeCount" label="点赞" width="60" />
        <el-table-column prop="collectCount" label="收藏" width="60" />
        <el-table-column prop="commentCount" label="评论" width="60" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 1" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 2" type="success">已发布</el-tag>
            <el-tag v-else-if="row.status === 3" type="danger">已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.isRecommend === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            <el-button link type="success" size="small" @click="handleStatusChange(row, 2)" v-if="row.status !== 2">发布</el-button>
            <el-button link type="warning" size="small" @click="handleStatusChange(row, 3)" v-if="row.status === 2">下架</el-button>
            <el-button link type="primary" size="small" @click="handleRecommend(row)" v-if="row.isRecommend !== 1">推荐</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadContentList"
        @current-change="loadContentList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="内容详情" width="800px">
      <div v-if="currentContent" class="content-detail">
        <h3>{{ currentContent.title }}</h3>
        <div class="meta">
          <span>类型: {{ getContentTypeName(currentContent.contentType) }}</span>
          <span>浏览: {{ currentContent.viewCount }}</span>
          <span>点赞: {{ currentContent.likeCount }}</span>
          <span>收藏: {{ currentContent.collectCount }}</span>
          <span>评论: {{ currentContent.commentCount }}</span>
        </div>
        <div class="images" v-if="currentContent.images">
          <el-image v-for="(img, idx) in JSON.parse(currentContent.images)" :key="idx" :src="img" :preview-src-list="JSON.parse(currentContent.images)" fit="cover" style="width: 150px; height: 150px; margin-right: 10px; border-radius: 4px" />
        </div>
        <div class="video" v-if="currentContent.video_url">
          <video :src="currentContent.video_url" controls style="width: 100%; max-height: 300px" />
        </div>
        <div class="text-content" v-html="currentContent.content"></div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="contentForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="contentForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="contentForm.summary" type="textarea" :rows="2" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="contentForm.region" placeholder="请选择地区" style="width: 100%">
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
        </el-form-item>
        <el-form-item label="主题" prop="theme">
          <el-input v-model="contentForm.theme" placeholder="如：文化、自然、美食、购物" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="contentForm.location" placeholder="请输入位置信息" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="contentForm.content" type="textarea" :rows="6" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="contentForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="已发布" :value="2" />
            <el-option label="已下架" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Picture, Document } from '@element-plus/icons-vue'
import request from '@/util/request'

const loading = ref(false)
const submitting = ref(false)
const contentList = ref<any[]>([])
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const dialogTitle = ref('编辑内容')
const formRef = ref<FormInstance>()
const currentContent = ref<any>(null)

const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  contentType: null as number | null,
  status: null as number | null,
  region: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const contentForm = reactive({
  id: null as number | null,
  title: '',
  summary: '',
  content: '',
  region: '',
  theme: '',
  location: '',
  status: 2
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const getContentTypeName = (type: number) => {
  switch (type) {
    case 1: return '纯文字'
    case 2: return '图文'
    case 3: return '视频'
    case 4: return '图文+视频'
    default: return '未知'
  }
}

const loadContentList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/content/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
        contentType: searchForm.contentType,
        status: searchForm.status,
        region: searchForm.region
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
  searchForm.keyword = ''
  searchForm.contentType = null
  searchForm.status = null
  searchForm.region = ''
  handleSearch()
}

const handleView = (row: any) => {
  currentContent.value = row
  viewDialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑内容'
  contentForm.id = row.id
  contentForm.title = row.title
  contentForm.summary = row.summary || ''
  contentForm.content = row.content
  contentForm.region = row.region || ''
  contentForm.theme = row.theme || ''
  contentForm.location = row.location || ''
  contentForm.status = row.status

  editDialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除内容"${row.title}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/content/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadContentList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleStatusChange = async (row: any, status: number) => {
  const action = status === 2 ? '发布' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}内容"${row.title}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.put(`/admin/content/status`, null, {
      params: { id: row.id, status }
    })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      loadContentList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleRecommend = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要推荐内容"${row.title}"吗？`, '确认推荐', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.put(`/admin/content/recommend`, null, {
      params: { id: row.id, isRecommend: 1 }
    })
    if (res.code === 200) {
      ElMessage.success('推荐成功')
      loadContentList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res: any = await request.put('/admin/content/update', contentForm)
        if (res.code === 200) {
          ElMessage.success('更新成功')
          editDialogVisible.value = false
          loadContentList()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadContentList()
})
</script>

<style scoped lang="scss">
.content-management {
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
    .content-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .content-detail {
        .title {
          font-weight: 600;
          margin-bottom: 4px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .summary {
          font-size: 12px;
          color: #999;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .content-detail {
    h3 {
      margin-bottom: 16px;
    }

    .meta {
      margin-bottom: 16px;
      color: #666;
      font-size: 14px;

      span {
        margin-right: 20px;
      }
    }

    .images {
      margin-bottom: 16px;
    }

    .video {
      margin-bottom: 16px;
    }

    .text-content {
      line-height: 1.8;
      color: #333;
    }
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f7fa;
    color: #909399;
    border-radius: 4px;
  }
}
</style>

