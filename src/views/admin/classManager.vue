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
            </el-table>

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
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import request from '@/util/request'

interface ClassItem {
    id: number
    className: string
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

// 获取班级列表
const getClassList = async () => {
    loading.value = true
    try {
        const response = await request.get('/classic/list') as any
        if (response.code === 200) {
            classList.value = response.data
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
</style>