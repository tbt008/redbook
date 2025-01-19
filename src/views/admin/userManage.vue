<template>
  <div class="user-management-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div style="font-size: 12px;line-height: 32px;">筛选条件</div>
      <el-select v-model="filterType" placeholder="所有" class="filter-item">
        <el-option label="所有" value="all" />
        <el-option label="超级管理员" value="superadmin" /> 
        <el-option label="管理员" value="admin" /> 
        <el-option label="用户" value="user" />
      </el-select>

      <el-input
        v-model="searchKeyword"
        placeholder="请输入用户姓名或用户账号"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon>添加用户
      </el-button>
    </div>

    <!-- 用户列表表格 -->
    <el-table
      :data="filterUsers"
      class="user-table"
      v-loading="loading"
    >
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" :size="40" />
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="姓名" />
      <el-table-column prop="uid" label="用户账号" />
      <el-table-column prop="class" label="班级" />
      <el-table-column label="用户角色">
        <template #default="{ row }">
          <el-tag :type="getTagType(row.role)">{{ getRoleName(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="禁用">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            @change="(val:any) => handleStatusToggle(row)"
          />
        </template>
      </el-table-column> 
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
          <!-- <el-button type="danger" link @click="handleDelete(row)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="用户角色" prop="role">
          <el-select v-model="userForm.role" style="width: 150px;">
            <el-option label="超级管理员" value="superadmin" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
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
import { Search, Plus } from '@element-plus/icons-vue'
import request from '@/util/request'

// 获取角色标签类型
const getTagType = (role: string) => {
  switch(role) {
    case 'superadmin': return 'danger' 
    case 'admin': return 'success'
    default: return 'info'
  }
}

// 获取角色名称
const getRoleName = (role: string) => {
  switch(role) {
    case 'admin': return '管理员' 
    case 'superadmin': return '超级管理员'
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
const dialogTitle = ref('')
const sortField = ref('string')
const sortOrder = ref('desc')
const globalRegisterStatus = ref(0)

// 表单相关
const formRef = ref()
const userForm = ref({
  uid: '',
  name: '',
  role: 'user',
  status: 1
})
// 表单验证规则
const rules = {
  uid: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 3, message: '账号长度至少为3位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' }
  ],
  password: [
    { required: false, min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    // 模拟后端响应数据
    // const mockResponse = {
    //   code: 200,
    //   data: {
    //     list: [
    //       {
    //         uid: '10001',
    //         nickname: '张三',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '智能223',
    //         role: 'superadmin',
    //         status: true
    //       },
    //       {
    //         uid: '10002',
    //         nickname: '李四',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '软工227',
    //         role: 'admin',
    //         status: false
    //       },
    //       {
    //         uid: '10003',
    //         nickname: '王五',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10004',
    //         nickname: '赵六',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10005',
    //         nickname: '孙七',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10006',
    //         nickname: '周八',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10007',
    //         nickname: '吴九',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10008',
    //         nickname: '郑十',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10009',
    //         nickname: '陈十一',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10010',
    //         nickname: '赵十二',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10011',
    //         nickname: '赵十三',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       },
    //       {
    //         uid: '10012',
    //         nickname: '赵十四',
    //         avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    //         class: '计科221',
    //         role: 'user',
    //         status: true
    //       }

    //     ],
    //     total: 12
    //   }
    // }

    // // 使用模拟数据
    // users.value = mockResponse.data.list as any
    // total.value = mockResponse.data.total

    // 当后端接口准备好后，替换为实际的API调用
    const response = await request.post('/user/admin/list', {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value, 
      key:"string" 
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

// 获取用户详情
const getUserDetail = async (id: string) => {
  try {
    const response = await request.get(`/root/user/get/${id}`)as any
    if (response.code === 200) {
      return response.data
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 编辑用户
const handleEdit = async (row: any) => {
  dialogVisible.value = true
  const userDetail = await getUserDetail(row.uid)
  if (userDetail) {
    userForm.value = {
      uid: userDetail.uid, 
      name: userDetail.name,
      role: userDetail.role,
      status: userDetail.status
    }
    dialogTitle.value = '编辑用户'
    dialogVisible.value = true
  }
}

// 切换用户状态
const handleStatusToggle = async (row: any) => {
  try {
    const response = await request.get(`/root/user/stop/${row.uid}`)as any
    if (response.code === 200) {
      ElMessage.success(row.status ? '用户已停用' : '用户已启用')
      getUserList()
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request.post(`/root/user/delete/${row.uid}`)as any
      if (response.code === 200) {
        ElMessage.success('删除成功')
        getUserList()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const url = dialogTitle.value === '添加用户' ? '/root/user/add' : '/root/user/update'
        const response = await request.post(url, userForm.value) as any
        if (response.code === 200) {
          ElMessage.success(dialogTitle.value === '添加用户' ? '添加成功' : '更新成功')
          dialogVisible.value = false
          getUserList()
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
    role: 'user',
    status: 1
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

// 添加用户
const handleAddUser = () => {
  userForm.value = {
    uid: '', 
    name: '',
    role: 'user',
    status: 1
  }
  dialogTitle.value = '添加用户'
  dialogVisible.value = true
}

// Excel导入处理
const handleExcelUpload = (file: any) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  // TODO: 实现Excel导入逻辑
  ElMessage.warning('Excel导入功能尚未实现')
}

// 获取全局注册状态
const getGlobalRegisterStatus = async () => {
  try {
    //TODO
    return 
  } catch (error) {
    console.error('获取注册状态失败:', error)
  }
}

// 切换全局注册状态
const handleGlobalStatusChange = async (value: number) => {
  try {
    //TODO
    return
  } catch (error) {
    console.error('修改注册状态失败:', error)
    globalRegisterStatus.value = value ? 0 : 1
  }
}

// 切换用户角色
const handleRoleToggle = async (row: any) => {
  try {
    //TODO
    return
  } catch (error) {
    console.error('修改角色失败:', error)
    ElMessage.error('操作失败')
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
    
    const response = await request.post(`/root/user/reset-password/${row.uid}`) as any
    if (response.code === 200) {
      ElMessage.success('密码重置成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }
}

// 添加筛选和搜索逻辑
const filterUsers = computed(() => {
  let filteredList = [...users.value]
  
  // 按角色筛选
  if (filterType.value !== 'all') {
    filteredList = filteredList.filter((user: any) => user.role === filterType.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filteredList = filteredList.filter((user: any) => 
      user.nickname.toLowerCase().includes(keyword) || 
      user.uid.toLowerCase().includes(keyword)
    )
  }
  
  return filteredList
})

// 组件挂载时获取数据
onMounted(() => {
  getUserList()
  getGlobalRegisterStatus()
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
  border-radius: 8px;
  padding: 20px; 
}

 
 

 

 
/* 分割线 */
 

:deep(.el-table td) {
  border-bottom: 1px solid #e4e7ed;
}
</style> 