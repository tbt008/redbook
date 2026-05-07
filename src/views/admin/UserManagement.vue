<template>
  <div class="user-management admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">用户管理</h2>
        <p class="admin-hero__subtitle">统一处理用户筛选、状态管控与账号类型调整。</p>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="全部" clearable style="width: 150px">
            <el-option label="游客" :value="1" />
            <el-option label="商家" :value="2" />
            <el-option label="达人" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="禁用" :value="0" />
            <el-option label="正常" :value="1" />
            <el-option label="禁言" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="用户名/昵称/手机/邮箱" style="width: 220px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="userList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="260">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatar" :size="42">
                {{ (row.nickname || row.username || '?').slice(0, 1) }}
              </el-avatar>
              <div class="user-detail">
                <div class="username">{{ row.nickname || row.username }}</div>
                <div class="user-meta">{{ row.phone || row.email || '未绑定联系方式' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户类型" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.userType === 1" type="info">游客</el-tag>
            <el-tag v-else-if="row.userType === 2" type="warning">商家</el-tag>
            <el-tag v-else-if="row.userType === 3" type="success">达人</el-tag>
            <el-tag v-else-if="row.userType === 4" type="danger">管理员</el-tag>
            <el-tag v-else>未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.isCertified === 1" type="success">已认证</el-tag>
            <el-tag v-else type="info">未认证</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="danger">禁用</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="row.status === 2" type="warning">禁言</el-tag>
            <el-tag v-else>未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="常住地" width="140" show-overflow-tooltip />
        <el-table-column prop="createTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status !== 2 && row.userType !== 4"
              link
              type="warning"
              size="small"
              @click="handleStatusChange(row, 2)"
            >
              禁言
            </el-button>
            <el-button
              v-if="row.status !== 0 && row.userType !== 4"
              link
              type="danger"
              size="small"
              @click="handleStatusChange(row, 0)"
            >
              禁用
            </el-button>
            <el-button
              v-if="row.status === 0 && row.userType !== 4"
              link
              type="success"
              size="small"
              @click="handleStatusChange(row, 1)"
            >
              取消禁用
            </el-button>
            <el-button
              v-if="row.status === 2 && row.userType !== 4"
              link
              type="success"
              size="small"
              @click="handleStatusChange(row, 1)"
            >
              取消禁言
            </el-button>
            <el-button v-if="row.userType !== 4" link type="primary" size="small" @click="handleUserTypeChange(row)">
              <el-icon><Switch /></el-icon>
              调整类型
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
        @size-change="loadUserList"
        @current-change="loadUserList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="statusDialogVisible" title="修改用户状态" width="520px">
      <el-form :model="statusForm" label-width="90px">
        <el-form-item label="用户">
          <span>{{ currentUser?.nickname || currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="操作">
          <el-tag v-if="statusForm.status === 0" type="danger">禁用</el-tag>
          <el-tag v-else-if="statusForm.status === 1" type="success">{{ currentUser?.status === 0 ? '取消禁用' : '取消禁言' }}</el-tag>
          <el-tag v-else-if="statusForm.status === 2" type="warning">禁言</el-tag>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" placeholder="请输入操作原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmStatusChange">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="userTypeDialogVisible" title="修改用户类型" width="520px">
      <el-alert title="用户类型说明" type="info" :closable="false" style="margin-bottom: 20px">
        <template #default>
          <ul class="type-tips">
            <li><strong>游客</strong>：普通浏览用户。</li>
            <li><strong>商家</strong>：可发布酒店、景点和美食资源。</li>
            <li><strong>达人</strong>：可发布攻略和分享内容。</li>
          </ul>
        </template>
      </el-alert>
      <el-form :model="userTypeForm" label-width="90px">
        <el-form-item label="用户">
          <span>{{ currentUser?.nickname || currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="当前类型">
          <el-tag v-if="currentUser?.userType === 1" type="info">游客</el-tag>
          <el-tag v-else-if="currentUser?.userType === 2" type="warning">商家</el-tag>
          <el-tag v-else-if="currentUser?.userType === 3" type="success">达人</el-tag>
          <el-tag v-else-if="currentUser?.userType === 4" type="danger">管理员</el-tag>
        </el-form-item>
        <el-form-item label="修改为">
          <el-select v-model="userTypeForm.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="游客 - 普通浏览用户" :value="1" />
            <el-option label="商家 - 可发布酒店、景点和美食资源" :value="2" />
            <el-option label="达人 - 可发布攻略和分享内容" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userTypeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmUserTypeChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Switch } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'

const loading = ref(false)
const submitting = ref(false)
const userList = ref<any[]>([])
const statusDialogVisible = ref(false)
const userTypeDialogVisible = ref(false)
const currentUser = ref<any>(null)

const searchForm = reactive<{
  userType: number | null
  status: number | null
  keyword: string
}>({
  userType: null,
  status: null,
  keyword: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const statusForm = reactive<{
  userId: number | null
  status: number | null
  reason: string
}>({
  userId: null,
  status: null,
  reason: ''
})

const userTypeForm = reactive<{
  userId: number | null
  userType: number | null
}>({
  userId: null,
  userType: null
})

const loadUserList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/user/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        userType: searchForm.userType,
        status: searchForm.status,
        keyword: searchForm.keyword
      }
    })
    if (res.code === 200) {
      userList.value = res.data.list || res.data.records || []
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
  loadUserList()
}

const handleReset = () => {
  searchForm.userType = null
  searchForm.status = null
  searchForm.keyword = ''
  handleSearch()
}

const handleStatusChange = (user: any, status: number) => {
  currentUser.value = user
  statusForm.userId = user.id
  statusForm.status = status
  statusForm.reason = ''
  statusDialogVisible.value = true
}

const confirmStatusChange = async () => {
  if (!statusForm.reason.trim()) {
    ElMessage.warning('请输入操作原因')
    return
  }

  submitting.value = true
  try {
    const res: any = await request.put('/admin/user/status', null, {
      params: {
        userId: statusForm.userId,
        status: statusForm.status,
        reason: statusForm.reason
      }
    })
    if (res.code === 200) {
      ElMessage.success('操作成功')
      statusDialogVisible.value = false
      loadUserList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleUserTypeChange = (user: any) => {
  currentUser.value = user
  userTypeForm.userId = user.id
  userTypeForm.userType = null
  userTypeDialogVisible.value = true
}

const confirmUserTypeChange = async () => {
  if (!userTypeForm.userType) {
    ElMessage.warning('请选择用户类型')
    return
  }

  if (userTypeForm.userType === currentUser.value.userType) {
    ElMessage.warning('用户类型未变更')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将用户类型从“${getUserTypeName(currentUser.value.userType)}”修改为“${getUserTypeName(userTypeForm.userType)}”吗？`,
      '确认修改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    submitting.value = true
    const res: any = await request.put('/admin/user/type', null, {
      params: {
        userId: userTypeForm.userId,
        userType: userTypeForm.userType
      }
    })
    if (res.code === 200) {
      ElMessage.success('修改成功')
      userTypeDialogVisible.value = false
      loadUserList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '修改失败')
    }
  } finally {
    submitting.value = false
  }
}

const getUserTypeName = (type: number) => {
  switch (type) {
    case 1:
      return '游客'
    case 2:
      return '商家'
    case 3:
      return '达人'
    case 4:
      return '管理员'
    default:
      return '未知'
  }
}

const viewDetail = (user: any) => {
  ElMessageBox.alert(
    `<div style="line-height: 1.8;">
      <p><strong>用户ID：</strong>${user.id}</p>
      <p><strong>用户名：</strong>${user.username || '--'}</p>
      <p><strong>昵称：</strong>${user.nickname || '未设置'}</p>
      <p><strong>手机：</strong>${user.phone || '未绑定'}</p>
      <p><strong>邮箱：</strong>${user.email || '未绑定'}</p>
      <p><strong>性别：</strong>${user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知'}</p>
      <p><strong>常住地：</strong>${user.location || '未设置'}</p>
      <p><strong>个人简介：</strong>${user.bio || '未设置'}</p>
      <p><strong>注册时间：</strong>${user.createTime || '--'}</p>
    </div>`,
    '用户详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.user-management {
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

  .type-tips {
    margin: 10px 0 0;
    padding-left: 18px;
    line-height: 1.8;
  }
}
</style>
