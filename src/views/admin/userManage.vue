<template>
  <div class="user-management-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div style="font-size: 12px;line-height: 32px; width: 60px;margin-left: 10px;">筛选条件</div>
      <el-select v-model="filterType" placeholder="所有" class="filter-item" @change="getUserList">
        <el-option label="所有" value="all" />
        <el-option label="超级管理员" value="superadmin" /> 
        <el-option label="管理员" value="admin" /> 
        <el-option label="用户" value="user" />
      </el-select>

      <!-- <el-input
        v-model="searchKeyword"
        placeholder="请输入用户姓名或用户账号"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input> -->

      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon>添加用户
      </el-button>
      
      <!-- 新增批量导入按钮 -->
      <el-upload
        class="upload-excel"
        :action="null"
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx,.xls"
        :on-change="handleExcelUpload"
      >
        <el-button type="success">
          <el-icon><Upload /></el-icon>批量导入
        </el-button>
      </el-upload>
    </div>

    <!-- 用户列表表格 -->
    <el-table
      :data="users"
      class="user-table"
      v-loading="loading"
    >
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" :size="40" />
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="姓名" align="center" />
      <el-table-column prop="uid" label="用户账号" align="center" />
      <el-table-column prop="className" label="班级" align="center" />
      <el-table-column label="用户角色" align="center">
        <template #default="{ row }">
          <el-tag :type="getTagType(row.roleId)">{{ getRoleName(row.roleId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="禁用" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.isDelete === '0'"
            @change="(val:any) => handleStatusToggle(row)"
          />
        </template>
      </el-table-column> 
      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
          <!-- <el-button type="danger" link @click="handleDelete(row)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogEditVisible"
      title="编辑用户"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="userFormEdit"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="userFormEdit.name" />
        </el-form-item>
        <el-form-item label="用户角色" prop="roleId">
          <el-select v-model="userFormEdit.roleId" style="width: 150px;">
            <el-option label="超级管理员" :value="10001" /> 
            <el-option label="管理员" :value="10002" /> 
            <el-option label="用户" :value="10003" />
          </el-select>
        </el-form-item> 
      </el-form>
      <template #footer>
        <el-button @click="dialogEditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定</el-button>
      </template>
    </el-dialog>
    <!-- 添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加用户"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户账号" prop="uid">
          <el-input v-model="userForm.uid" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <!-- <el-form-item label="用户角色" prop="roleId">
          <el-select v-model="userForm.roleId" style="width: 150px;">
            <el-option label="超级管理员" :value="10001" /> 
            <el-option label="管理员" :value="10002" /> 
            <el-option label="用户" :value="10003" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="班级" prop="className">
          <el-input v-model="userForm.className" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Upload } from '@element-plus/icons-vue'
import request from '@/util/request'

// 获取角色标签类型
const getTagType = (role: number) => {
  switch(role) {
    // case 'superadmin': return 'danger' 
    // case 'admin': return 'success'
    // default: return 'info'
    case 10001: return 'danger' 
    case 10002: return 'success'
    default: return 'info'
  }
}

// 获取角色名称
const getRoleName = (role: number) => {
  switch(role) {
    // case 'admin': return '管理员' 
    // case 'superadmin': return '超级管理员'
    // default: return '用户'
    case 10001: return '超级管理员' 
    case 10002: return '管理员'
    default: return '用户'
  }
}

// 状态变量
const loading = ref(false)
const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const filterType = ref('all')
const dialogVisible = ref(false)
const dialogEditVisible = ref(false)
const dialogTitle = ref('') 

// 表单相关
const formRef = ref()
const userForm = ref({
  uid: '',
  name: '', 
  isDelete: 0,
  className: ''
})
const userFormEdit = ref({
  uid: '',
  name: '',
  roleId: 10003
})
// 表单验证规则
const rules = {
  uid: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 12, message: '账号长度至少为12位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' }
  ],
  password: [
    { required: false, min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ]
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    let roleId = null  
    if(filterType.value === 'all'){
      roleId = null
    }else if(filterType.value === 'superadmin'){
      roleId = 10001
    }else if(filterType.value === 'admin'){
      roleId = 10002
    }else if(filterType.value === 'user'){
      roleId = 10003
    }
    
    const response = await request.post('/user/admin/list', {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
      roleId: roleId,
      // sortField: sortField.value,
      // sortOrder: sortOrder.value, 
      // key:"string" 
    })as any
    if (response.code === 200) {
      users.value = response.data.list
      total.value = response.data.total 
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 重置用户密码
const handleResetPassword = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要重置该用户的密码吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await request.post('/user/reset/password',{uid:row.uid}) as any
    if (response.code === 200) {
      ElMessage.success('密码重置成功')
    }else{
      ElMessage.error(response.msg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }
}
 

// 编辑用户
const handleEdit = async (row: any) => { 
  // 数据回显
  userFormEdit.value = {
    uid: row.uid,
    name: row.userName,
    roleId: row.roleId
  }
  dialogEditVisible.value = true
}

// 切换用户状态
const handleStatusToggle = async (row: any) => {
  try {
    const response = await request.post('/user/admin/disable',{uid:row.uid})as any
    if (response.code === 200) {
      ElMessage.success(row.isDelete ? '用户已停用' : '用户已启用')
      getUserList()
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}
 
 
const submitEditForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try { 
        const response = await request.post('/user/admin/update', {
          uid: userFormEdit.value.uid,
          userName: userFormEdit.value.name,
          roleId: userFormEdit.value.roleId
        }) as any
        
        if (response.code === 200) {
          ElMessage.success('更新成功')
          dialogEditVisible.value = false
          getUserList()
        }else{
          ElMessage.error(response.msg)
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}
// 添加用户
const handleAddUser = () => {
  userForm.value = {
    uid: '', 
    name: '', 
    isDelete: 0,
    className: ''
  }
  dialogTitle.value = '添加用户'
  dialogVisible.value = true
}
// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
         
        const response = await request.post('/user/admin/add', userForm.value) as any
        if (response.code === 200) {
          ElMessage.success(dialogTitle.value === '添加用户' ? '添加成功' : '更新成功')
          dialogVisible.value = false
          getUserList()
        }else{
          ElMessage.error(response.msg)
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  userForm.value = {
    uid: '', 
    name: '', 
    isDelete: 0,
    className: ''
  }
  userFormEdit.value = {
    uid: '', 
    name: '',
    roleId: 10003
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  getUserList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getUserList()
}



// Excel导入处理
const handleExcelUpload = async (file: any) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  
  try {
    const response = await request.post('/user/admin/addByExcel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as any
    
    if (response.code === 200) {
      ElMessage.success('批量导入成功')
      getUserList()
    } else {
      ElMessage.error(response.msg || '导入失败')
    }
  } catch (error) {
    console.error('批量导入失败:', error)
    ElMessage.error('批量导入失败')
  }
}

 
 

 

// 添加筛选和搜索逻辑
const filterUsers = computed(() => {
  let filteredList = [...users.value]
  
  // 按角色筛选
  // if (filterType.value !== 'all') {
  //   filteredList = filteredList.filter((user: any) => user.roleId === filterType.value)
  // }
  // console.log(filteredList)
  // // 按关键词搜索
  // if (searchKeyword.value) {
  //   const keyword = searchKeyword.value.toLowerCase()
  //   filteredList = filteredList.filter((user: any) => 
  //     String(user.userName).includes(keyword) || 
  //     String(user.uid).includes(keyword)
  //   )
  // }
  
  return filteredList
})

// 组件挂载时获取数据
onMounted(() => {
  getUserList() 
})
</script>

<style scoped>
.user-management-container {
  padding: 20px; 
  min-height: 100vh;
  border-radius: 20px; 
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 20px; 
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;  
}

.filter-item {
  width: 120px;
}

.search-input {
  width: 300px;
}

.user-table {
  background: white;
  /* border-radius: 8px; */ 
}

.pagination-container {
  margin-top: 20px;
  /* 居中 */
  display: flex;
  justify-content: center;
}

/* 分割线 */
:deep(.el-table td) {
  border-bottom: 1px solid #e4e7ed;
}

.upload-excel {
  display: inline-block;
}
</style> 