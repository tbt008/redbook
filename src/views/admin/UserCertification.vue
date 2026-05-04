<template>
  <div class="user-certification admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Merchant Review</div>
        <h2 class="page-title">认证审核</h2>
        <p class="admin-hero__subtitle">集中处理游客提交的商家认证申请，查看资料并完成通过或驳回。</p>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.applyStatus" clearable placeholder="全部" style="width: 180px">
            <el-option label="待审核" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="用户名/昵称/商家名称/联系人/手机号" style="width: 280px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="applicationList" v-loading="loading" stripe>
        <el-table-column prop="id" label="用户ID" width="90" />
        <el-table-column label="申请用户" min-width="220">
          <template #default="{ row }">
            <div class="user-info">
                <el-avatar :src="row.avatar" :size="42">
                {{ (row.nickName || row.nickname || row.username || '?').slice(0, 1) }}
              </el-avatar>
              <div class="user-detail">
                <div class="username">{{ row.nickName || row.nickname || row.username }}</div>
                <div class="user-meta">{{ row.email || row.phone || '--' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="merchantName" label="商家名称" min-width="180" />
        <el-table-column prop="merchantCategory" label="经营类目" min-width="140" />
        <el-table-column prop="merchantContactName" label="联系人" width="110" />
        <el-table-column prop="merchantContactPhone" label="联系电话" width="140" />
        <el-table-column label="申请状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.merchantApplyStatus)">
              {{ getStatusText(row.merchantApplyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchantApplyTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.merchantApplyStatus === 1"
              link
              type="success"
              size="small"
              @click="openAuditDialog(row, 1)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.merchantApplyStatus === 1"
              link
              type="danger"
              size="small"
              @click="openAuditDialog(row, 2)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="loadApplications"
        @current-change="loadApplications"
      />
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="申请详情" width="720px">
      <div v-if="currentApplication" class="detail-grid">
        <div class="detail-item">
          <span class="label">申请用户</span>
          <span class="value">{{ currentApplication.nickName || currentApplication.nickname || currentApplication.username || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">账号</span>
          <span class="value">{{ currentApplication.username || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">商家名称</span>
          <span class="value">{{ currentApplication.merchantName || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">经营类目</span>
          <span class="value">{{ currentApplication.merchantCategory || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系人</span>
          <span class="value">{{ currentApplication.merchantContactName || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话</span>
          <span class="value">{{ currentApplication.merchantContactPhone || '--' }}</span>
        </div>
        <div class="detail-item full-width">
          <span class="label">商家地址</span>
          <span class="value">{{ currentApplication.merchantAddress || '--' }}</span>
        </div>
        <div class="detail-item full-width">
          <span class="label">申请说明</span>
          <span class="value multiline">{{ currentApplication.merchantApplyRemark || '未填写' }}</span>
        </div>
        <div class="detail-item full-width">
          <span class="label">资质图片</span>
          <div class="license-wrap">
            <el-image
              v-if="currentApplication.merchantLicenseImage"
              :src="currentApplication.merchantLicenseImage"
              fit="cover"
              :preview-src-list="[currentApplication.merchantLicenseImage]"
              class="license-image"
            />
            <span v-else class="value">未上传</span>
          </div>
        </div>
        <div class="detail-item">
          <span class="label">审核状态</span>
          <span class="value">{{ getStatusText(currentApplication.merchantApplyStatus) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">审核意见</span>
          <span class="value">{{ currentApplication.merchantAuditComment || '--' }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditDialogVisible" :title="auditForm.auditStatus === 1 ? '通过申请' : '驳回申请'" width="520px">
      <el-form :model="auditForm" label-width="88px">
          <el-form-item label="申请用户">
          <span>{{ currentApplication?.nickName || currentApplication?.nickname || currentApplication?.username }}</span>
          </el-form-item>
        <el-form-item label="商家名称">
          <span>{{ currentApplication?.merchantName || '--' }}</span>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.auditComment"
            type="textarea"
            :rows="4"
            :placeholder="auditForm.auditStatus === 1 ? '可填写通过说明' : '请填写驳回原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'

const loading = ref(false)
const submitting = ref(false)
const applicationList = ref<any[]>([])
const detailDialogVisible = ref(false)
const auditDialogVisible = ref(false)
const currentApplication = ref<any>(null)

const searchForm = reactive({
  applyStatus: null as number | null,
  keyword: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const auditForm = reactive({
  userId: null as number | null,
  auditStatus: 1,
  auditComment: ''
})

const loadApplications = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/user/certification-list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        applyStatus: searchForm.applyStatus,
        keyword: searchForm.keyword
      }
    })
    applicationList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载认证申请失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadApplications()
}

const handleReset = () => {
  searchForm.applyStatus = null
  searchForm.keyword = ''
  handleSearch()
}

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '待审核'
    case 2:
      return '已通过'
    case 3:
      return '已驳回'
    default:
      return '未申请'
  }
}

const getStatusTagType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

const viewDetail = (row: any) => {
  currentApplication.value = row
  detailDialogVisible.value = true
}

const openAuditDialog = (row: any, auditStatus: number) => {
  currentApplication.value = row
  auditForm.userId = row.id
  auditForm.auditStatus = auditStatus
  auditForm.auditComment = ''
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  if (auditForm.auditStatus === 2 && !auditForm.auditComment.trim()) {
    ElMessage.warning('驳回时请填写审核意见')
    return
  }

  submitting.value = true
  try {
    await request.post('/admin/user/audit-certification', null, {
      params: {
        userId: auditForm.userId,
        auditStatus: auditForm.auditStatus,
        auditComment: auditForm.auditComment
      }
    })
    ElMessage.success(auditForm.auditStatus === 1 ? '已通过该申请' : '已驳回该申请')
    auditDialogVisible.value = false
    loadApplications()
  } catch (error: any) {
    ElMessage.error(error.message || '审核失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadApplications()
})
</script>

<style scoped lang="scss">
.user-certification {
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-detail {
    min-width: 0;
  }

  .username {
    margin-bottom: 4px;
    font-weight: 600;
    color: #14213d;
  }

  .user-meta {
    font-size: 12px;
    color: #98a2b3;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    border-radius: 16px;
    background: #f8faf8;
    border: 1px solid #edf1ed;
  }

  .detail-item.full-width {
    grid-column: 1 / -1;
  }

  .label {
    font-size: 12px;
    color: #7b8b84;
  }

  .value {
    color: #18281f;
    line-height: 1.7;
    word-break: break-all;
  }

  .value.multiline {
    white-space: pre-wrap;
  }

  .license-wrap {
    display: flex;
    align-items: center;
  }

  .license-image {
    width: 240px;
    height: 160px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e4e9e4;
    background: #fff;
  }
}
</style>
