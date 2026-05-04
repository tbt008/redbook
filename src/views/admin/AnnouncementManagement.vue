<template>
  <div class="announcement-management admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">公告管理</h2>
        <p class="admin-hero__subtitle">维护平台公告的创建、发布、下架和删除流程。</p>
      </div>
    </div>

    <el-card class="action-card">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        发布公告
      </el-button>
    </el-card>

    <el-card class="table-card">
      <el-table :data="announcementList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" type="info">系统维护</el-tag>
            <el-tag v-else-if="row.type === 2" type="success">平台活动</el-tag>
            <el-tag v-else-if="row.type === 3" type="warning">政策提醒</el-tag>
            <el-tag v-else>其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.priority === 1" type="info">低</el-tag>
            <el-tag v-else-if="row.priority === 2">中</el-tag>
            <el-tag v-else-if="row.priority === 3" type="danger">高</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已发布</el-tag>
            <el-tag v-else type="warning">已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.publishTime, 'YYYY-MM-DD HH:mm:ss', '未发布') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status !== 1" link type="success" size="small" @click="handlePublish(row)">发布</el-button>
            <el-button v-if="row.status === 1" link type="info" size="small" @click="handleUnpublish(row)">下架</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadAnnouncementList"
        @current-change="loadAnnouncementList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '发布公告' : '编辑公告'" width="720px">
      <el-form ref="formRef" :model="announcementForm" :rules="rules" label-width="90px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="announcementForm.type" placeholder="请选择公告类型" style="width: 100%">
            <el-option label="系统维护" :value="1" />
            <el-option label="平台活动" :value="2" />
            <el-option label="政策提醒" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="announcementForm.priority">
            <el-radio :label="1">低</el-radio>
            <el-radio :label="2">中</el-radio>
            <el-radio :label="3">高</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="announcementForm.content" type="textarea" :rows="8" placeholder="请输入公告内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="公告详情" width="720px">
      <div v-if="currentAnnouncement" class="announcement-detail">
        <h3>{{ currentAnnouncement.title }}</h3>
        <div class="announcement-meta">
          <el-tag v-if="currentAnnouncement.type === 1" type="info">系统维护</el-tag>
          <el-tag v-else-if="currentAnnouncement.type === 2" type="success">平台活动</el-tag>
          <el-tag v-else-if="currentAnnouncement.type === 3" type="warning">政策提醒</el-tag>
          <el-tag v-else>其他</el-tag>
          <span>发布时间：{{ formatDateTime(currentAnnouncement.publishTime, 'YYYY-MM-DD HH:mm:ss', '未发布') }}</span>
        </div>
        <div class="announcement-content">{{ currentAnnouncement.content }}</div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const announcementList = ref<any[]>([])
const currentAnnouncement = ref<any>(null)
const formRef = ref()

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const announcementForm = reactive({
  id: null as number | null,
  title: '',
  content: '',
  type: 4,
  priority: 2
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const loadAnnouncementList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/announcement/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      }
    })
    if (res.code === 200) {
      announcementList.value = res.data.list || res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  announcementForm.id = null
  announcementForm.title = ''
  announcementForm.content = ''
  announcementForm.type = 4
  announcementForm.priority = 2
}

const handleCreate = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (announcement: any) => {
  dialogMode.value = 'edit'
  announcementForm.id = announcement.id
  announcementForm.title = announcement.title
  announcementForm.content = announcement.content
  announcementForm.type = announcement.type
  announcementForm.priority = announcement.priority
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitting.value = true
  try {
    const method = dialogMode.value === 'create' ? 'post' : 'put'
    const url = dialogMode.value === 'create' ? '/announcement/create' : '/announcement/update'
    const res: any = await request[method](url, announcementForm)
    if (res.code === 200) {
      ElMessage.success(dialogMode.value === 'create' ? '创建成功' : '更新成功')
      dialogVisible.value = false
      loadAnnouncementList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handlePublish = async (announcement: any) => {
  try {
    await ElMessageBox.confirm('确定要发布这条公告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.post(`/announcement/publish/${announcement.id}`)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      loadAnnouncementList()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '发布失败')
  }
}

const handleUnpublish = async (announcement: any) => {
  try {
    await ElMessageBox.confirm('确定要下架这条公告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.post(`/announcement/unpublish/${announcement.id}`)
    if (res.code === 200) {
      ElMessage.success('下架成功')
      loadAnnouncementList()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '下架失败')
  }
}

const handleDelete = async (announcement: any) => {
  try {
    await ElMessageBox.confirm('确定删除这条公告吗？删除后无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    const res: any = await request.delete(`/announcement/delete/${announcement.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadAnnouncementList()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleView = (announcement: any) => {
  currentAnnouncement.value = announcement
  viewDialogVisible.value = true
}

onMounted(() => {
  loadAnnouncementList()
})
</script>

<style scoped lang="scss">
.announcement-management {
  .action-card {
    margin-bottom: 20px;
  }

  .announcement-detail {
    h3 {
      margin: 0 0 16px;
      font-size: 22px;
      font-weight: 700;
      color: #14213d;
    }
  }

  .announcement-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
    color: #667085;
    font-size: 14px;
  }

  .announcement-content {
    line-height: 1.8;
    white-space: pre-wrap;
    color: #344054;
  }
}
</style>
