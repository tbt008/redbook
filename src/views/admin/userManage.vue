<template>
  <div class="user-management-container">
    <div class="user-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div style="font-size: 12px; line-height: 32px; width: 60px; margin-left: 10px">
          筛选条件
        </div>
        <el-select
          v-model="filterType"
          placeholder="所有"
          class="filter-item"
          @change="getUserList"
        >
          <el-option label="所有" value="all" />
          <el-option
            v-for="role in roleList"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
          />
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
          <el-icon>
            <Plus /> </el-icon
          >添加用户
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
            <el-icon>
              <Upload /> </el-icon
            >批量导入
          </el-button>
        </el-upload>
      </div>

      <!-- 用户列表表格 -->
      <el-table :data="users" class="user-table" v-loading="loading">
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
              :model-value="row.isDelete === '1'"
              @change="(val: any) => handleStatusToggle(row)"
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
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 编辑对话框 -->
      <el-dialog v-model="dialogEditVisible" title="编辑用户" width="500px" @close="resetForm">
        <el-form ref="formRef" :model="userFormEdit" :rules="rules" label-width="80px">
          <el-form-item label="用户姓名" prop="name">
            <el-input v-model="userFormEdit.name" />
          </el-form-item>
          <el-form-item label="班级" prop="className">
            <el-select v-model="userFormEdit.classic" style="width: 150px">
              <el-option
                v-for="item in classicList"
                :key="item.id"
                :label="item.className"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户角色" prop="roleId">
            <el-select v-model="userFormEdit.roleId" style="width: 150px">
              <el-option
                v-for="role in roleList"
                :key="role.roleId"
                :label="role.roleName"
                :value="role.roleId"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogEditVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确定</el-button>
        </template>
      </el-dialog>
      <!-- 添加对话框 -->
      <el-dialog v-model="dialogVisible" title="添加用户" width="500px" @close="resetForm">
        <el-form ref="formRef" :model="userForm" :rules="rules" label-width="80px">
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
            <el-select v-model="userForm.classic" style="width: 150px">
              <el-option
                v-for="item in classicList"
                :key="item.id"
                :label="item.className"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="班级" prop="className">
          <el-input v-model="userForm.className" />
        </el-form-item> -->
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Upload } from '@element-plus/icons-vue'
import request from '@/util/request'

interface ClassItem {
  id: number
  className: string
}

const classicList = ref<ClassItem[]>([])

// 添加角色相关接口
interface RoleItem {
  roleId: number
  roleName: string
}

const roleList = ref<RoleItem[]>([])

// 获取角色列表
const getRoleList = async () => {
  try {
    const response = (await request.get('/role/get')) as any
    if (response.code === 200) {
      roleList.value = response.data
    } else {
      ElMessage.error('获取角色列表失败')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  }
}

// 获取角色标签类型的方法
const getTagType = (roleId: number) => {
  const role = roleList.value.find((r) => r.roleId === roleId)
  if (!role) return 'info'
  // 这里可以根据实际需求设置不同角色的标签类型
  if (role.roleName.includes('超级管理员')) return 'danger'
  if (role.roleName.includes('管理员')) return 'success'
  return 'info'
}

// 获取角色名称的方法
const getRoleName = (roleId: number) => {
  const role = roleList.value.find((r) => r.roleId === roleId)
  return role ? role.roleName : '未知角色'
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
  classic: 4001,
  className: ''
})
const userFormEdit = ref({
  uid: '',
  name: '',
  roleId: 10003,
  classic: 0,
  className: ''
})
// 表单验证规则
const rules = {
  uid: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 12, message: '账号长度至少为12位', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  password: [{ required: false, min: 6, message: '密码长度至少为6位', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }]
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    let roleId = null
    if (filterType.value === 'all') {
      roleId = null
    } else {
      roleId = filterType.value
    }

    const response = (await request.post('/user/admin/list', {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
      roleId: roleId
      // sortField: sortField.value,
      // sortOrder: sortOrder.value,
      // key:"string"
    })) as any
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
    await ElMessageBox.confirm('确定要重置该用户的密码吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = (await request.post('/user/reset/password', { uid: row.uid })) as any
    if (response.code === 200) {
      ElMessage.success('密码重置成功')
    } else {
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
  userFormEdit.value = {
    uid: row.uid,
    name: row.userName,
    roleId: row.roleId,
    className: row.className,
    classic: row.classic
  }
  dialogEditVisible.value = true
}

// 切换用户状态
const handleStatusToggle = async (row: any) => {
  try {
    const response = (await request.post('/user/admin/disable', { uid: row.uid })) as any
    if (response.code === 200) {
      ElMessage.success(Number(row.isDelete) ? '用户已启用' : '用户已停用')
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
        const response = (await request.post('/user/admin/update', {
          uid: userFormEdit.value.uid,
          userName: userFormEdit.value.name,
          roleId: userFormEdit.value.roleId,
          classic: userFormEdit.value.classic
        })) as any

        if (response.code === 200) {
          ElMessage.success('更新成功')
          dialogEditVisible.value = false
          getUserList()
        } else {
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
    className: '',
    classic: 4001
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
        const response = (await request.post('/user/admin/add', userForm.value)) as any
        if (response.code === 200) {
          ElMessage.success(dialogTitle.value === '添加用户' ? '添加成功' : '更新成功')
          dialogVisible.value = false
          getUserList()
        } else {
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
    className: '',
    classic: 4001
  }
  userFormEdit.value = {
    uid: '',
    name: '',
    roleId: 10003,
    className: '',
    classic: 0
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
    const response = (await request.post('/user/admin/addByExcel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })) as any

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
const pageInfo = ref({
  pageStart: 1,
  pageSize: 1000000 // 获取所有班级，设置一个较大的数值
})
// 获取班级列表
const getClassicList = async () => {
  try {
    const res = (await request.post('/classic/list', pageInfo.value)) as any
    if (res.code === 200) {
      classicList.value = res.data.list
    } else {
      ElMessage.error('获取班级列表失败')
    }
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  }
}
// 组件挂载时获取数据
onMounted(() => {
  getRoleList()
  getClassicList()
  getUserList()
})
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.user-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
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
