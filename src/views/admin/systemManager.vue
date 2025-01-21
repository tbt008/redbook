<template>
    <div class="system-management-container">
      <div class="system-wrapper">
        <el-table :data="systemList" class="system-table" v-loading="loading">
          <el-table-column prop="systemConfigId" label="权限ID" align="center" width="180" />
          <el-table-column prop="systemConfigName" label="权限名称" align="center" />
          <el-table-column label="状态" align="center" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import request from '@/util/request'
  
  interface SystemPermission {
    systemConfigId: string
    systemConfigName: string
    status: number
  }
  
  const loading = ref(false)
  const systemList = ref<SystemPermission[]>([])
  
  // 获取系统权限列表
  const getSystemList = async () => {
    loading.value = true
    try {
      const response = await request.get('/system/get') as any
      if (response.code === 200) {
        systemList.value = response.data
      } else {
        ElMessage.error(response.msg || '获取系统权限列表失败')
      }
    } catch (error) {
      ElMessage.error('获取系统权限列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 修改系统权限状态
  const handleStatusChange = async (row: SystemPermission) => {
    try {
      const response = await request.post('/system/modify', {
        systemConfigId: row.systemConfigId,
        status: row.status
      }) as any
      
      if (response.code === 200) {
        ElMessage.success('修改成功')
        getSystemList() // 刷新列表
      } else {
        ElMessage.error(response.msg || '修改失败')
        row.status = row.status === 1 ? 0 : 1 // 恢复状态
      }
    } catch (error) {
      ElMessage.error('修改失败')
      row.status = row.status === 1 ? 0 : 1 // 恢复状态
    }
  }
  
  onMounted(() => {
    getSystemList()
  })
  </script>
  
  <style scoped>
  .system-management-container {
    padding: 20px;
    min-height: 100vh;
    background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
  }
  
  .system-wrapper {
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  
  .system-table {
    width: 100%;
  }
  
  :deep(.el-table td) {
    border-bottom: 1px solid #e4e7ed;
  }
  </style>
  