<template>
  <div class="question-editor-page">
    <div class="editor-container">
      <h2 class="page-title">{{ isEditMode ? '编辑题目' : '创建题目' }}</h2>
      <QuestionEditor :id="questionId" @primary="handleSave" @cancel="handleCancel" />
    </div>
    <RedbookFooter />
  </div>
</template>

<script lang="js" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import QuestionEditor from '@/components/questionEditor.vue'
import RedbookFooter from '@/components/RedbookFooter.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 从路由参数中获取题目ID，如果存在则为编辑模式
const questionId = ref(route.query.id || null)

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return questionId.value !== null && questionId.value !== undefined && questionId.value !== ''
})

// 处理保存成功
const handleSave = () => {
  // 保存成功后，可以根据需要跳转到题目列表或详情页
  ElMessage.success('题目' + (isEditMode.value ? '更新' : '创建') + '成功！')
  // 跳转到题目管理页面或题目列表页
  router.push('/admin/problem')
}

// 处理取消操作
const handleCancel = () => {
  // 取消后返回到上一页
  router.back()
}

// 监听路由参数变化
watch(
  () => route.query.id,
  (newId) => {
    questionId.value = newId || null
  }
)

onMounted(() => {
  // 页面加载时可以添加一些初始化逻辑
  console.log('题目编辑器页面已加载', { isEditMode: isEditMode.value, questionId: questionId.value })
})
</script>

<style scoped>
.question-editor-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.editor-container {
  flex: 1;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  width: 100%;
}

.page-title {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #007bff;
}

@media (max-width: 768px) {
  .editor-container {
    padding: 10px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>