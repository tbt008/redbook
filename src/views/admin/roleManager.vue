<template>
  <div class="permission-management-container">
    <div class="permission-wrapper">
      <el-row :gutter="20">
        <!-- 左侧角色列表 -->
        <el-col :span="6">
          <div class="role-section">
            <div class="section-header">
              <h3>角色列表</h3>
            </div>
            <el-menu :default-active="activeRoleId.toString()" class="role-menu" @select="handleRoleSelect">
              <el-menu-item v-for="role in roles" :key="role.roleId" :index="role.roleId.toString()">
                <span>{{ role.roleName }}</span>
              </el-menu-item>
            </el-menu>

            <!-- 添加角色按钮 -->
            <div class="add-role-section">
              <el-button type="primary" @click="showAddRoleDialog">
                <el-icon>
                  <Plus />
                </el-icon>新增角色
              </el-button>
            </div>
          </div>
        </el-col>

        <!-- 右侧权限设置 -->
        <el-col :span="18">
          <div class="permission-section" v-loading="loading">
            <div class="section-header">
              <h3>权限设置</h3>
              <!-- <div class="header-actions">
                <el-button type="primary" @click="showAddPermissionDialog">
                  <el-icon>
                    <Plus />
                  </el-icon>新增权限
                </el-button>
              </div> -->
            </div>

            <template v-if="activeRoleId">
              <!-- 添加超级管理员判断 -->
              <template v-if="isAdmin">
                <div class="admin-notice">
                  <el-alert title="超级管理员拥有所有权限" type="info" :closable="false" show-icon />
                </div>
              </template>
              <template v-else>
                <div class="permission-list">
                  <el-tree ref="permissionTree" :data="permissions" show-checkbox node-key="id" default-expand-all
                    :props="{
                      children: 'children',
                      label: 'name'
                    }" :default-checked-keys="checkedPermissions" @check="handlePermissionCheck">
                  </el-tree>
                </div>

                <div class="action-buttons">
                  <el-button @click="resetPermissions">重置</el-button>
                  <el-button type="primary" @click="savePermissions">更新</el-button>
                </div>
              </template>
            </template>

            <template v-else>
              <el-empty description="请选择左侧角色"></el-empty>
            </template>
          </div>
        </el-col>
      </el-row>

      <!-- 添加角色对话框 -->
      <el-dialog v-model="addRoleDialogVisible" title="新增角色" width="500px">
        <el-form ref="addRoleFormRef" :model="addRoleForm" :rules="addRoleRules" label-width="80px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="addRoleForm.name" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="addRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddRole">确定</el-button>
        </template>
      </el-dialog>

      <!-- 添加权限对话框 -->
      <el-dialog v-model="addPermissionDialogVisible" title="新增权限" width="500px">
        <el-form ref="addPermissionFormRef" :model="addPermissionForm" :rules="addPermissionRules" label-width="80px">
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="addPermissionForm.name" />
          </el-form-item>
          <el-form-item label="权限标识" prop="identifier">
            <el-input v-model="addPermissionForm.identifier" />
          </el-form-item>

        </el-form>
        <template #footer>
          <el-button @click="addPermissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddPermission">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/util/request'
import type { ElTree } from 'element-plus'

// 状态变量
const loading = ref(false)
const roles = ref<Array<{ roleId: string; roleName: string }>>([])
const permissions = ref<any[]>([])
const activeRoleId = ref('')
const checkedPermissions = ref<string[]>([])
const originalCheckedPermissions = ref<string[]>([])
const permissionTree = ref<InstanceType<typeof ElTree> | null>(null)

// 对话框控制
const addRoleDialogVisible = ref(false)
const addPermissionDialogVisible = ref(false)

// 表单引用
const addRoleFormRef = ref()
const addPermissionFormRef = ref()

// 表单数据
const addRoleForm = ref({
  name: '',
  description: ''
})

const addPermissionForm = ref({
  name: '',
  identifier: '',
  parentId: null
})

// 表单验证规则
const addRoleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const addPermissionRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  identifier: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
}

// 类型定义
interface RolePermission {
  permissionId: number;
  roleName: string;
  isOwner: number;
}

// 添加是否为超级管理员的状态
const isAdmin = ref(false)
// 添加请求取消标记
const controller = ref<AbortController | null>(null)

// 获取所有角色
const getRoles = async () => {
  try {
    const response = await request.get('/role/get') as any
    if (response.code === 200) {
      roles.value = response.data
      // 如果需要，可以设置默认选中第一个角色
      if (roles.value.length > 0 && !activeRoleId.value) {
        handleRoleSelect(roles.value[0].roleId)
      }
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  }
}

// 获取角色权限
const getRolePermissions = async (roleId: string) => {
  loading.value = true

  // 在开始新的请求前，先清空权限列表
  permissions.value = []
  checkedPermissions.value = []
  originalCheckedPermissions.value = []

  // 修改判断条件，使用数字 10001 进行比较
  if (Number(roleId) === 10001) {
    isAdmin.value = true
    loading.value = false
    return
  }

  isAdmin.value = false

  // 如果存在之前的请求，则取消它
  if (controller.value) {
    controller.value.abort()
  }

  // 创建新的 AbortController
  controller.value = new AbortController()

  try {
    const response = await request.post('/role/permissions', {
      roleId: roleId
    }, {
      signal: controller.value.signal
    }) as any

    if (response.code === 200) {
      const rolePermissions: RolePermission[] = response.data;
      const checkedPerms = rolePermissions
        .filter(perm => perm.isOwner === 1)
        .map(perm => perm.permissionId.toString());

      permissions.value = rolePermissions.map(perm => ({
        id: perm.permissionId.toString(),
        name: perm.roleName
      }));

      checkedPermissions.value = checkedPerms;
      originalCheckedPermissions.value = [...checkedPerms];
    } else {
      ElMessage.warning(response.msg)
    }
  } catch (error: any) {
    // 如果不是取消请求导致的错误，才显示错误信息
    if (error.name !== 'AbortError') {
      ElMessage.error('获取角色权限失败')
    }
  } finally {
    loading.value = false
  }
}

// 选择角色
const handleRoleSelect = (roleId: string) => {
  activeRoleId.value = roleId
  getRolePermissions(roleId)
}

// 权限选择变更
const handlePermissionCheck = () => {
  // Tree 组件会自动处理选中状态
}

// 重置权限
const resetPermissions = () => {
  checkedPermissions.value = [...originalCheckedPermissions.value]
  if (permissionTree.value) {
    permissionTree.value.setCheckedKeys(checkedPermissions.value)
  }
}

// 保存权限
const savePermissions = async () => {
  if (!permissionTree.value) return

  const checkedKeys = permissionTree.value.getCheckedKeys().map(String)
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys().map(String)
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

  try {
    const response = await request.post('/role/update', {
      roleId: Number(activeRoleId.value),
      permissionIds: allCheckedKeys
    }) as any

    if (response.code === 200) {
      ElMessage.success('保存成功')
      originalCheckedPermissions.value = [...allCheckedKeys]
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 显示添加角色对话框
const showAddRoleDialog = () => {
  addRoleForm.value = {
    name: '',
    description: ''
  }
  addRoleDialogVisible.value = true
}

// 提交添加角色
const submitAddRole = async () => {
  if (!addRoleFormRef.value) return

  await addRoleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const response = await request.post('/role/add', {
          roleName: addRoleForm.value.name
        }) as any
        if (response.code === 200) {
          ElMessage.success('添加角色成功')
          addRoleDialogVisible.value = false
          getRoles()
        }
        else {
          ElMessage.error(response.msg)
        }
      } catch (error) {
        ElMessage.error('添加角色失败')
      }
    }
  })
}

// 显示添加权限对话框
const showAddPermissionDialog = () => {
  addPermissionForm.value = {
    name: '',
    identifier: '',
    parentId: null
  }
  addPermissionDialogVisible.value = true
}

// 提交添加权限
const submitAddPermission = async () => {
  if (!addPermissionFormRef.value) return

  await addPermissionFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const response = await request.post('/permission/add', addPermissionForm.value) as any
        if (response.code === 200) {
          ElMessage.success('添加权限成功')
          addPermissionDialogVisible.value = false
          if (activeRoleId.value) {
            getRolePermissions(activeRoleId.value)
          }
        }
      } catch (error) {
        ElMessage.error('添加权限失败')
      }
    }
  })
}

// 组件挂载时获取角色列表
onMounted(() => {
  getRoles()
})
</script>

<style scoped>
.permission-management-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.permission-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.role-section {
  border-right: 1px solid #e6e6e6;
}

.role-section,
.permission-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
}

.role-menu {
  flex: 1;
  border-right: none;
}

.permission-list {
  flex: 1;
  overflow-y: auto;
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.add-role-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.admin-notice {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>