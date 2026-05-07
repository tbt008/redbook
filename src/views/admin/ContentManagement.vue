<template>
  <div class="content-management admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">内容管理</h2>
        <p class="admin-hero__subtitle">统一管理图文、问答和视频内容，支持上下架、推荐和编辑。</p>
      </div>
      <div class="admin-hero__actions">
        <el-button type="primary" @click="loadContentList">
          <el-icon><RefreshRight /></el-icon>
          刷新列表
        </el-button>
      </div>
    </div>

    <el-card class="search-card">
      <div class="search-grid">
        <el-input v-model="searchForm.keyword" placeholder="搜索标题或正文关键词" clearable @keyup.enter="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="searchForm.contentType" clearable placeholder="全部类型">
          <el-option v-for="item in contentTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="searchForm.status" clearable placeholder="全部状态">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="searchForm.region" clearable placeholder="全部地区">
          <el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </el-card>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total"><el-icon><Files /></el-icon></div>
        <div><strong>{{ pagination.total }}</strong><span>内容总数</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon published"><el-icon><CircleCheck /></el-icon></div>
        <div><strong>{{ publishedCount }}</strong><span>已发布内容</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon views"><el-icon><View /></el-icon></div>
        <div><strong>{{ totalViews }}</strong><span>总浏览量</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon comments"><el-icon><ChatDotRound /></el-icon></div>
        <div><strong>{{ totalComments }}</strong><span>总评论数</span></div>
      </div>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="panel-head">
          <h3>内容列表</h3>
          <em>共 {{ pagination.total }} 条记录</em>
        </div>
      </template>

      <el-table class="content-table" :data="contentList" v-loading="loading" :row-class-name="tableRowClassName">
        <el-table-column label="#" width="70">
          <template #default="{ $index }">
            <span class="row-index">{{ $index + 1 + (pagination.pageNum - 1) * pagination.pageSize }}</span>
          </template>
        </el-table-column>

        <el-table-column label="内容信息" min-width="360">
          <template #default="{ row }">
            <div class="content-info">
              <div class="cover">
                <el-image
                  v-if="getCoverImage(row)"
                  :src="getCoverImage(row)"
                  fit="cover"
                  :preview-src-list="getPreviewImages(row)"
                />
                <div v-else class="cover-placeholder"><el-icon><Document /></el-icon></div>
              </div>
              <div class="info-body">
                <div class="title-line">
                  <strong>{{ row.title || '未命名内容' }}</strong>
                  <span v-if="row.isRecommend === 1" class="recommend-flag">推荐</span>
                </div>
                <p>{{ getSummary(row) }}</p>
                <small>{{ row.region || '未设置地区' }} / {{ row.theme || '未设置主题' }}<template v-if="row.location"> / {{ row.location }}</template></small>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <span :class="['tag-pill', getContentTypeClass(row.contentType)]">{{ getContentTypeName(row.contentType) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数据统计" width="220" align="center">
          <template #default="{ row }">
            <div class="stats-row">
              <span><el-icon><View /></el-icon>{{ row.viewCount || 0 }}</span>
              <span><el-icon><Pointer /></el-icon>{{ row.likeCount || 0 }}</span>
              <span><el-icon><Star /></el-icon>{{ row.collectCount || 0 }}</span>
              <span><el-icon><ChatDotRound /></el-icon>{{ row.commentCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <span :class="['status-pill', getStatusClass(row.status)]"><i></i>{{ getStatusName(row.status) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="170" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <button class="icon-btn preview" @click="handleView(row)"><el-icon><View /></el-icon></button>
              <button class="icon-btn comments" @click="handleManageComments(row)"><el-icon><ChatDotRound /></el-icon></button>
              <button class="icon-btn edit" @click="handleEdit(row)"><el-icon><Edit /></el-icon></button>
              <button class="icon-btn toggle" @click="handleStatusChange(row, row.status === 2 ? 3 : 2)"><el-icon><SwitchButton /></el-icon></button>
              <button class="icon-btn delete" @click="handleDelete(row)"><el-icon><Delete /></el-icon></button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :pager-count="5"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadContentList"
          @current-change="loadContentList"
        />
      </div>
    </el-card>

    <el-dialog v-model="viewDialogVisible" title="内容详情" width="880px" class="content-dialog">
      <div class="detail-view">
        <div class="detail-head">
          <div>
            <h3>{{ currentContentView.title }}</h3>
            <div class="detail-tags">
              <span :class="['tag-pill', getContentTypeClass(currentContentView.contentType)]">{{ getContentTypeName(currentContentView.contentType) }}</span>
              <span :class="['status-pill', getStatusClass(currentContentView.status)]"><i></i>{{ getStatusName(currentContentView.status) }}</span>
            </div>
          </div>
          <div class="detail-meta">
            <span>浏览 {{ currentContentView.viewCount || 0 }}</span>
            <span>点赞 {{ currentContentView.likeCount || 0 }}</span>
            <span>收藏 {{ currentContentView.collectCount || 0 }}</span>
            <span>评论 {{ currentContentView.commentCount || 0 }}</span>
          </div>
        </div>
        <div class="detail-meta secondary">
          <span>地区：{{ currentContentView.region || '--' }}</span>
          <span>主题：{{ currentContentView.theme || '--' }}</span>
          <span>位置：{{ currentContentView.location || '--' }}</span>
          <span>发布时间：{{ formatDateTime(currentContentView.createTime) }}</span>
        </div>
        <div v-if="parseImageList(currentContentView.images).length" class="detail-images">
          <el-image v-for="(img, index) in parseImageList(currentContentView.images)" :key="`${img}-${index}`" :src="img" fit="cover" :preview-src-list="parseImageList(currentContentView.images)" />
        </div>
        <div v-if="currentContentView.videoUrl" class="detail-video"><video :src="currentContentView.videoUrl" controls /></div>
        <div class="detail-content">
          <h4>内容正文</h4>
          <p>{{ currentContentView.content || '暂无内容' }}</p>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" :title="dialogTitle" width="760px" class="content-dialog">
      <el-form ref="formRef" :model="contentForm" :rules="formRules" label-position="top" class="edit-form">
        <div class="form-grid">
          <el-form-item label="标题" prop="title" class="full"><el-input v-model="contentForm.title" maxlength="60" show-word-limit placeholder="请输入内容标题" /></el-form-item>
          <el-form-item label="摘要" prop="summary" class="full"><el-input v-model="contentForm.summary" type="textarea" :rows="3" maxlength="150" show-word-limit placeholder="请输入内容摘要" /></el-form-item>
          <el-form-item label="内容类型" prop="contentType"><el-select v-model="contentForm.contentType" placeholder="请选择内容类型"><el-option v-for="item in contentTypeOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="状态" prop="status"><el-select v-model="contentForm.status" placeholder="请选择状态"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="地区"><el-select v-model="contentForm.region" placeholder="请选择地区" clearable><el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="推荐状态"><el-select v-model="contentForm.isRecommend" placeholder="请选择推荐状态"><el-option label="普通内容" :value="0" /><el-option label="推荐内容" :value="1" /></el-select></el-form-item>
          <el-form-item label="主题"><el-input v-model="contentForm.theme" placeholder="例如：海岛、文化、美食" /></el-form-item>
          <el-form-item label="位置"><el-input v-model="contentForm.location" placeholder="请输入位置描述" /></el-form-item>
          <el-form-item label="正文内容" prop="content" class="full"><el-input v-model="contentForm.content" type="textarea" :rows="8" maxlength="3000" show-word-limit placeholder="请输入内容正文" /></el-form-item>
        </div>
      </el-form>
      <template #footer><div class="dialog-footer"><el-button @click="editDialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="handleSubmit">保存修改</el-button></div></template>
    </el-dialog>

    <AdminCommentDrawer ref="commentDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, CircleCheck, Delete, Document, Edit, Files, Pointer, RefreshLeft, RefreshRight, Search, Star, SwitchButton, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'
import AdminCommentDrawer from '@/components/admin/AdminCommentDrawer.vue'

const contentTypeOptions = [{ label: '纯文字', value: 1 }, { label: '图文', value: 2 }, { label: '视频', value: 3 }, { label: '图文+视频', value: 4 }]
const statusOptions = [{ label: '草稿', value: 0 }, { label: '待审核', value: 1 }, { label: '已发布', value: 2 }, { label: '已下架', value: 3 }]
const regionOptions = ['荔城区', '城厢区', '涵江区', '秀屿区', '湄洲岛']

const loading = ref(false)
const submitting = ref(false)
const contentList = ref<any[]>([])
const currentContent = ref<any>(null)
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const dialogTitle = ref('编辑内容')
const formRef = ref<FormInstance>()
const commentDrawerRef = ref<InstanceType<typeof AdminCommentDrawer>>()

const searchForm = reactive({ keyword: '', contentType: null as number | null, status: null as number | null, region: '' })
const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })
const contentForm = reactive({ id: null as number | null, title: '', summary: '', content: '', contentType: 2, region: '', theme: '', location: '', status: 2, isRecommend: 0 })

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
  contentType: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const publishedCount = computed(() => contentList.value.filter((item) => item.status === 2).length)
const totalViews = computed(() => contentList.value.reduce((total, item) => total + Number(item.viewCount || 0), 0))
const totalComments = computed(() => contentList.value.reduce((total, item) => total + Number(item.commentCount || 0), 0))
const currentContentView = computed(() => currentContent.value || {})

const parseImageList = (images?: string) => {
  if (!images) return []
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const getCoverImage = (row: any) => row.coverImage || parseImageList(row.images)[0] || ''
const getPreviewImages = (row: any) => (parseImageList(row.images).length ? parseImageList(row.images) : getCoverImage(row) ? [getCoverImage(row)] : [])
const getSummary = (row: any) => row.summary || (row.content ? `${String(row.content).slice(0, 42)}...` : '暂无摘要')
const getContentTypeName = (type: number) => contentTypeOptions.find((item) => item.value === type)?.label || '未知'
const getStatusName = (status: number) => statusOptions.find((item) => item.value === status)?.label || '未知'
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => (rowIndex % 2 === 1 ? 'striped-row' : '')
const getContentTypeClass = (type: number) => ({ 1: 'text', 2: 'image', 3: 'video', 4: 'mixed' }[type] || 'text')
const getStatusClass = (status: number) => ({ 0: 'draft', 1: 'pending', 2: 'published', 3: 'offline' }[status] || 'draft')

const loadContentList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/content/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        contentType: searchForm.contentType ?? undefined,
        status: searchForm.status ?? undefined,
        region: searchForm.region || undefined,
        _t: Date.now()
      }
    })
    contentList.value = res.data.list || res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载内容列表失败')
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
  pagination.pageNum = 1
  loadContentList()
}

const handleView = (row: any) => {
  currentContent.value = row
  viewDialogVisible.value = true
}

const handleManageComments = (row: any) => {
  commentDrawerRef.value?.open({
    id: row.id,
    title: row.title || '未命名内容',
    type: 1
  })
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑内容'
  contentForm.id = row.id
  contentForm.title = row.title || ''
  contentForm.summary = row.summary || ''
  contentForm.content = row.content || ''
  contentForm.contentType = row.contentType || 2
  contentForm.region = row.region || ''
  contentForm.theme = row.theme || ''
  contentForm.location = row.location || ''
  contentForm.status = row.status ?? 2
  contentForm.isRecommend = row.isRecommend ?? 0
  editDialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除内容“${row.title}”吗？删除后不会再出现在后台列表。`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/admin/content/${row.id}`, { params: { _t: Date.now() } })
    ElMessage.success('删除成功')
    loadContentList()
  } catch (error: any) {
    if (error !== 'cancel' && error?.message !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleStatusChange = async (row: any, status: number) => {
  const action = status === 2 ? '发布' : '下架'
  try {
    await ElMessageBox.confirm(`确定${action}内容“${row.title}”吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.put('/admin/content/status', null, { params: { id: row.id, status, _t: Date.now() } })
    ElMessage.success(`${action}成功`)
    loadContentList()
  } catch (error: any) {
    if (error !== 'cancel' && error?.message !== 'cancel') ElMessage.error(error.message || '状态更新失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await request.put('/admin/content/update', { ...contentForm })
    ElMessage.success('内容更新成功')
    editDialogVisible.value = false
    loadContentList()
  } catch (error: any) {
    ElMessage.error(error.message || '内容更新失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadContentList)
</script>

<style scoped lang="scss">
.content-management {
  .search-grid {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr) auto auto;
    gap: 12px;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin: 22px 0;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 22px;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 14px 34px rgba(31, 111, 92, 0.08);
  }

  .stat-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-icon.total { color: #1f6f5c; background: rgba(31, 111, 92, 0.1); }
  .stat-icon.published { color: #67c23a; background: rgba(103, 194, 58, 0.12); }
  .stat-icon.views { color: #4285f4; background: rgba(66, 133, 244, 0.12); }
  .stat-icon.comments { color: #f0ab2d; background: rgba(240, 171, 45, 0.12); }

  .stat-card strong {
    display: block;
    font-size: 30px;
    line-height: 1.1;
    color: #183153;
  }

  .stat-card span {
    font-size: 13px;
    color: #8ea0b3;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-head h3 {
    margin: 0;
    font-size: 18px;
    color: #183153;
  }

  .panel-head em {
    font-style: normal;
    color: #8ea0b3;
    font-size: 13px;
  }

  .row-index { color: #8ea0b3; font-size: 13px; }
  .content-info { display: flex; gap: 14px; align-items: center; }
  .cover { width: 92px; height: 72px; overflow: hidden; border-radius: 12px; background: #eef4f1; flex-shrink: 0; }
  .cover .el-image, .cover-placeholder { width: 100%; height: 100%; }
  .cover-placeholder { display: flex; align-items: center; justify-content: center; color: #8ea0b3; font-size: 26px; background: linear-gradient(135deg, #ebf3ef, #dfece6); }
  .info-body { min-width: 0; }
  .title-line { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .title-line strong { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px; color: #183153; }
  .recommend-flag { padding: 4px 10px; border-radius: 999px; background: rgba(240, 171, 45, 0.14); color: #c88412; font-size: 12px; font-weight: 600; }
  .info-body p { margin: 0; max-width: 360px; color: #4d647d; font-size: 13px; line-height: 1.6; display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .info-body small { display: block; margin-top: 6px; color: #8ea0b3; font-size: 12px; }

  .tag-pill, .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }

  .tag-pill.text, .status-pill.draft { color: #6b7280; background: rgba(107, 114, 128, 0.12); }
  .tag-pill.image { color: #2f8a72; background: rgba(47, 138, 114, 0.12); }
  .tag-pill.video, .status-pill.pending { color: #d97706; background: rgba(245, 158, 11, 0.14); }
  .tag-pill.mixed { color: #2563eb; background: rgba(37, 99, 235, 0.12); }
  .status-pill.published { color: #67c23a; background: rgba(103, 194, 58, 0.14); }
  .status-pill.offline { color: #f56c6c; background: rgba(245, 108, 108, 0.12); }
  .status-pill i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

  .stats-row, .detail-tags, .detail-meta { display: flex; flex-wrap: wrap; gap: 10px; }
  .stats-row { justify-content: center; }
  .stats-row span, .detail-meta span { display: inline-flex; align-items: center; gap: 4px; color: #4d647d; font-size: 13px; }
  .content-table :deep(.el-table-fixed-column--right),
  .content-table :deep(.el-table__fixed-right),
  .content-table :deep(.el-table__fixed-right-patch) {
    background: #fff;
  }

  .content-table :deep(.el-table__body td.el-table-fixed-column--right) {
    z-index: 3;
  }

  .table-actions {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
    min-width: 176px;
  }

  .icon-btn {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border: none;
    border-radius: 10px;
    background: #f5faf7;
    cursor: pointer;
    transition: .2s;
  }

  .icon-btn:hover { transform: translateY(-1px) scale(1.03); }
  .icon-btn.preview { color: #3b82f6; }
  .icon-btn.comments { color: #8b5cf6; }
  .icon-btn.edit { color: #1f6f5c; }
  .icon-btn.toggle { color: #67c23a; }
  .icon-btn.delete { color: #f56c6c; }

  .pagination-wrap { margin-top: 24px; display: flex; justify-content: flex-end; }
  .pagination-wrap :deep(.el-pager li.is-active) { background: #1f6f5c; color: #fff; }
  .table-card :deep(.striped-row) { background: rgba(31, 111, 92, 0.02); }

  .content-dialog :deep(.el-dialog) { border-radius: 18px; overflow: hidden; }
  .content-dialog :deep(.el-dialog__header) { margin: 0; padding: 20px 24px; background: linear-gradient(135deg, #1f6f5c, #2f8a72); }
  .content-dialog :deep(.el-dialog__title), .content-dialog :deep(.el-dialog__close) { color: #fff; }

  .detail-view { padding: 8px 8px 0; }
  .detail-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  .detail-head h3 { margin: 0 0 10px; font-size: 24px; color: #183153; }
  .detail-meta.secondary { margin: 18px 0; }
  .detail-images { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 18px; }
  .detail-images .el-image { width: 100%; height: 140px; border-radius: 12px; }
  .detail-video { margin-bottom: 18px; }
  .detail-video video { width: 100%; max-height: 360px; border-radius: 14px; background: #000; }
  .detail-content { padding: 18px; border-radius: 14px; background: #f7fbf9; }
  .detail-content h4 { margin: 0 0 10px; color: #183153; }
  .detail-content p { margin: 0; line-height: 1.8; color: #4d647d; white-space: pre-wrap; }

  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .full { grid-column: 1 / -1; }
  .dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }

  @media (max-width: 1200px) {
    .stats-section { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .search-grid, .stats-section, .form-grid { grid-template-columns: 1fr; }
    .detail-head { flex-direction: column; align-items: flex-start; }
  }
}
</style>
