<template>
  <div class="contest-editor-container">
    <div class="editor-header">
      <h2>{{ isEditMode ? '编辑竞赛' : '创建竞赛' }}</h2>
    </div>
    <div class="editor-content">
      <ContestEditor @cancel="handleCancel" @next="handleSave" :id="contestId"></ContestEditor>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContestEditor from '@/components/contestEditor.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 从路由参数中获取竞赛ID
const contestId = ref(route.query.id || null)

// 判断是编辑模式还是创建模式
const isEditMode = computed(() => {
  return contestId.value !== null && contestId.value !== undefined && contestId.value !== ''
})

// 处理保存后的操作（完成按钮）
const handleSave = () => {
  ElMessage.success(isEditMode.value ? '竞赛更新成功' : '竞赛创建成功')
  // 保存完成后跳转到竞赛管理页面
  router.push('/admin/contest')
}

// 处理取消操作
const handleCancel = () => {
  // 返回到竞赛管理页面
  router.push('/admin/contest')
}
</script>

<style scoped>
.contest-editor-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.editor-header {
  margin-bottom: 20px;
  text-align: center;
}

.editor-header h2 {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.editor-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contest-editor-container {
    padding: 10px;
  }
  
  .editor-content {
    padding: 15px;
    border-radius: 10px;
  }
  
  .editor-header h2 {
    font-size: 20px;
  }
}
</style>