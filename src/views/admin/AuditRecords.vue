<template>
  <div class="audit-records admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">审核记录</h2>
        <p class="admin-hero__subtitle">查看内容、评论和认证审核的历史处理记录。</p>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="审核类型">
          <el-select v-model="searchForm.auditType" placeholder="全部" clearable style="width: 150px">
            <el-option label="内容" :value="1" />
            <el-option label="评论" :value="2" />
            <el-option label="用户认证" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="通过" :value="1" />
            <el-option label="驳回" :value="2" />
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
          <span>审核记录列表</span>
          <el-tag>总计 {{ pagination.total }}</el-tag>
        </div>
      </template>

      <el-table :data="recordList" v-loading="loading" stripe>
        <el-table-column prop="id" label="记录ID" width="90" />
        <el-table-column label="审核类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.auditType === 1" type="success">内容</el-tag>
            <el-tag v-else-if="row.auditType === 2" type="warning">评论</el-tag>
            <el-tag v-else-if="row.auditType === 3" type="info">用户认证</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="目标ID" width="100" />
        <el-table-column label="审核状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.auditStatus === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.auditStatus === 1" type="success">通过</el-tag>
            <el-tag v-else-if="row.auditStatus === 2" type="danger">驳回</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="auditorId" label="审核人ID" width="110" />
        <el-table-column prop="auditComment" label="审核意见" min-width="220" show-overflow-tooltip />
        <el-table-column prop="auditTime" label="审核时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.auditTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRecordList"
        @current-change="loadRecordList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'

const loading = ref(false)
const recordList = ref<any[]>([])

const searchForm = reactive({
  auditType: null as number | null,
  auditStatus: null as number | null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const loadRecordList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/audit/records', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        auditType: searchForm.auditType,
        auditStatus: searchForm.auditStatus
      }
    })
    if (res.code === 200) {
      recordList.value = res.data.list || res.data.records || []
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
  loadRecordList()
}

const handleReset = () => {
  searchForm.auditType = null
  searchForm.auditStatus = null
  handleSearch()
}

onMounted(() => {
  loadRecordList()
})
</script>

<style scoped lang="scss">
.audit-records {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
