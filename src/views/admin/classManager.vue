<template>
    <div class="class-management-container">
        <div class="class-wrapper">
            <!-- 操作区域 -->
            <div class="action-section">
                <div style="font-size: 12px;line-height: 32px; width: 60px;margin-left: 10px;">筛选条件</div>

                <el-button type="primary" @click="handleAddClass">
                    <el-icon>
                        <Plus />
                    </el-icon>添加班级
                </el-button>
            </div>

            <!-- 班级列表表格 -->
            <el-table :data="classList" class="class-table" v-loading="loading">
                <el-table-column prop="id" label="班级ID" align="center" />
                <el-table-column prop="className" label="班级名称" align="center" />
                <el-table-column label="操作" align="center" width="200">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleViewMembers(row)">
                            <el-icon>
                                <User />
                            </el-icon>
                            查看成员
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 添加分页组件 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="pageInfo.pageStart" v-model:page-size="pageInfo.pageSize"
                    :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>

            <!-- 添加班级对话框 -->
            <el-dialog v-model="dialogVisible" title="添加班级" width="500px" @close="resetForm">
                <el-form ref="formRef" :model="classForm" :rules="rules" label-width="80px">
                    <el-form-item v-for="(className, index) in classForm.classNameList" :key="index" :label="'班级名称'"
                        :prop="'classNameList.' + index" :rules="{
                            required: true,
                            message: '请输入班级名称',
                            trigger: 'blur'
                        }">
                        <div style="display: flex; gap: 10px;">
                            <el-input v-model="classForm.classNameList[index]" />
                            <el-button type="danger" circle @click="removeClass(index)"
                                v-if="classForm.classNameList.length > 1">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </div>
                    </el-form-item>
                </el-form>
                <div style="margin-bottom: 20px;">
                    <el-button type="primary" link @click="addClass">
                        <el-icon>
                            <Plus />
                        </el-icon>添加更多班级
                    </el-button>
                </div>
                <template #footer>
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                </template>
            </el-dialog>

            <!-- 添加成员查看对话框 -->
            <el-dialog v-model="memberDialogVisible" :title="`${currentClassName}成员列表`" width="800px">
                <el-table :data="memberList" v-loading="memberLoading" class="member-table">
                    <el-table-column label="头像" align="center" width="80">
                        <template #default="{ row }">
                            <el-avatar :size="40" :src="row.avatar" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="uid" label="学号" align="center" />
                    <el-table-column prop="userName" label="姓名" align="center" />
                </el-table>

                <div class="pagination-container">
                    <el-pagination v-model:current-page="memberPageInfo.pageStart"
                        v-model:page-size="memberPageInfo.pageSize" :page-sizes="[10, 20, 30, 50]"
                        layout="total, sizes, prev, pager, next" :total="memberTotal"
                        @size-change="handleMemberSizeChange" @current-change="handleMemberCurrentChange" />
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, User } from '@element-plus/icons-vue'
import request from '@/util/request'

interface ClassItem {
    id: number
    className: string
}

interface MemberItem {
    avatar: string
    userName: string
    uid: string
}

// 状态变量
const loading = ref(false)
const classList = ref<ClassItem[]>([])
const dialogVisible = ref(false)

// 表单相关
const formRef = ref()
const classForm = ref({
    classNameList: ['']
})

// 表单验证规则
const rules = {
    classNameList: [
        { required: true, message: '请输入班级名称', trigger: 'blur' }
    ]
}

// 分页相关状态
const pageInfo = ref({
    pageStart: 1,
    pageSize: 10,
    classic: 0
})
const total = ref(0)

// 成员管理相关状态
const memberDialogVisible = ref(false)
const memberLoading = ref(false)
const memberList = ref<MemberItem[]>([])
const currentClassName = ref('')
const currentClassId = ref(0)
const memberTotal = ref(0)
const memberPageInfo = ref({
    pageStart: 1,
    pageSize: 10,
    classic: 0
})

// 获取班级列表
const getClassList = async () => {
    loading.value = true
    try {
        const response = await request.post('/classic/list', pageInfo.value) as any
        if (response.code === 200) {
            classList.value = response.data.list || []
            total.value = response.data.total || 0
        } else {
            ElMessage.error('获取班级列表失败')
        }
    } catch (error) {
        console.error('获取班级列表失败:', error)
        ElMessage.error('获取班级列表失败')
    } finally {
        loading.value = false
    }
}

// 添加班级
const handleAddClass = () => {
    classForm.value = {
        classNameList: ['']
    }
    dialogVisible.value = true
}

// 添加更多班级输入框
const addClass = () => {
    classForm.value.classNameList.push('')
}

// 移除班级输入框
const removeClass = (index: number) => {
    classForm.value.classNameList.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            try {
                const response = await request.post('/classic/add', {
                    classNameList: classForm.value.classNameList
                }) as any

                if (response.code === 200) {
                    ElMessage.success('添加班级成功')
                    dialogVisible.value = false
                    getClassList()
                } else {
                    ElMessage.error(response.msg || '添加班级失败')
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
    classForm.value = {
        classNameList: ['']
    }
}

// 处理页码改变
const handleCurrentChange = (page: number) => {
    pageInfo.value.pageStart = page
    getClassList()
}

// 处理每页条数改变
const handleSizeChange = (size: number) => {
    pageInfo.value.pageSize = size
    pageInfo.value.pageStart = 1
    getClassList()
}

// 查看成员
const handleViewMembers = (row: ClassItem) => {
    currentClassName.value = row.className
    currentClassId.value = row.id
    memberPageInfo.value.classic = row.id
    memberDialogVisible.value = true
    getMemberList()
}

// 获取成员列表
const getMemberList = async () => {
    memberLoading.value = true
    try {
        const response = await request.post('/classic/user', memberPageInfo.value) as any
        if (response.code === 200) {
            memberList.value = response.data.list || []
            memberTotal.value = response.data.total || 0
        } else {
            ElMessage.error('获取成员列表失败')
        }
    } catch (error) {
        console.error('获取成员列表失败:', error)
        ElMessage.error('获取成员列表失败')
    } finally {
        memberLoading.value = false
    }
}

// 处理成员列表分页
const handleMemberSizeChange = (size: number) => {
    memberPageInfo.value.pageSize = size
    memberPageInfo.value.pageStart = 1
    getMemberList()
}

const handleMemberCurrentChange = (page: number) => {
    memberPageInfo.value.pageStart = page
    getMemberList()
}

// 组件挂载时获取数据
onMounted(() => {
    getClassList()
})
</script>

<style scoped>
.class-management-container {
    padding: 20px;
    min-height: 100vh;
    background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.class-wrapper {
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.action-section {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.class-table {
    background: white;
}

:deep(.el-table td) {
    border-bottom: 1px solid #e4e7ed;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.member-table {
    margin-bottom: 20px;
}

:deep(.el-dialog__body) {
    padding-top: 20px;
}

:deep(.el-avatar) {
    border-radius: 50%;
    object-fit: cover;
}
</style>