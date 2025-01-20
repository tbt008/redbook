<template>
  <div class="excel-manage">
    <div class="header-operations">
      <el-button type="primary" @click="handleErrorLog">
        异常导入日志
      </el-button>
      <el-button type="success" @click="handleExport">
        导出数据
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="fileName" label="文件名" />
      <!-- <el-table-column prop="createTime" label="创建时间" /> -->
      <!-- <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button :type="scope.row.type === 1 ? 'primary' : 'success'" link @click="handleDownload(scope.row)">
            下载
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'

const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentType = ref(1)

// 获取表格数据
const getTableData = async () => {
    loading.value = true
    try {
        const res = await request.post('/excel/get', {
            type: currentType.value,
            pageStart: currentPage.value,
            pageSize: pageSize.value
        }) as any
        
        if (res.code === 200) {
            tableData.value = res.data.list
            total.value = res.data.total
        } else {
            ElMessage.error(res.msg || '获取数据失败')
        }
    } catch (error) {
        console.error('获取数据失败:', error)
        ElMessage.error('获取数据失败')
    } finally {
        loading.value = false
    }
}

// 异常导入日志
const handleErrorLog = async () => {
    currentPage.value = 1
    currentType.value = 1
    getTableData()
}

// 导出数据
const handleExport = async () => {
    currentPage.value = 1
    currentType.value = 2
    getTableData()
}

// 下载单个文件
const handleDownload = (row: any) => {
    if (row.url) {
        window.open(row.url)
    } else {
        ElMessage.error('下载链接不存在')
    }
}

// 处理页码改变
const handleCurrentChange = (val: number) => {
    currentPage.value = val
    getTableData()
}

// 处理每页条数改变
const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    getTableData()
}

onMounted(() => {
    getTableData()
})
</script>

<style scoped>
.excel-manage {
  padding: 20px;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>