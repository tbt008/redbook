<template>
  <div class="submission-detail">
    <!-- 测试用例结果展示 -->
    <div class="test-case-section">
      <testCase :test="testResult"></testCase>
    </div>

    <!-- 提交信息卡片 -->
    <el-card class="submission-info">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">提交时间：</span>
          <span class="value">{{ submissionData.createTime }}</span>
        </div>
        <div class="info-item">
          <span class="label">语言：</span>
          <span class="value">{{ getLanguageName(submissionData.language) }}</span>
        </div>
        <div class="info-item">
          <span class="label">代码长度：</span>
          <span class="value">{{ getCodeLength(submissionData.code) }} 字节</span>
        </div>
        <div class="info-item">
          <span class="label">运行时间：</span>
          <span class="value">{{ submissionData.runtime }} ms</span>
        </div>
        <div class="info-item">
          <span class="label">占用内存：</span>
          <span class="value">{{ formatMemory(submissionData.memory) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 代码展示区域 -->
    <el-card class="code-section">
      <div class="code-header">
        <span class="code-title">提交的代码</span>
        <el-button 
          type="primary" 
          size="small" 
          @click="copyCode"
          :icon="Document"
        >
          复制代码
        </el-button>
      </div>
      <div class="code-container">
        <div class="line-numbers">
          <span v-for="i in submissionData.code.split('\n').length" :key="i">{{ i }}</span>
        </div>
        <pre><code class="language-cpp">{{ submissionData.code }}</code></pre>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import request from '@/util/request'
import testCase from '@/components/testCase.vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'highlight.js/lib/languages/cpp'

const route = useRoute()
const submissionData = ref({
  userName: '',
  language: 0,
  result: 0,
  code: '',
  runtime: 0,
  memory: 0,
  createTime: ''
})

const testResult = ref({
  result: 0,
  memory: 0,
  time: 0
})

// 获取提交详情
const getSubmissionDetail = async () => {
  try {
    const submissionId = route.params.id
    const response = await request.post('/record/submission', {
      submissionId: submissionId
    }) as any
    
    if (response.code === 200) {
      submissionData.value = response.data
      
      // 获取测试结果
      const testResponse = await request.get(`/record/get/one/${submissionId}`) as any
      if (testResponse.code === 200) {
        testResult.value = testResponse.data.test
      }
      
      // 代码高亮
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement)
        })
      }, 0)
    }
  } catch (error) {
    ElMessage.error('获取提交详情失败')
  }
}

// 获取测试结果
const getTestResult = async () => {
  try {
    const submissionId = route.params.id
    const response = await request.get(`/record/get/one/${submissionId}`) as any
    if (response.code === 200) {
      testResult.value = response.data.test
    }
  } catch (error) {
    ElMessage.error('获取测试结果失败')
  }
}

// 获取编程语言
const getLanguageName = (languageId: number) => {
  const languages: { [key: number]: string } = {
    1: 'C',
    2: 'C++',
    3: 'Java',
    4: 'Python', 
  }
  return languages[languageId] || '未知语言'
}

// 格式化内存大小
const formatMemory = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 获取代码长度
const getCodeLength = (code: string) => {
  return new Blob([code]).size
}

// 复制代码
const copyCode = () => {
  navigator.clipboard.writeText(submissionData.value.code)
    .then(() => {
      ElMessage.success('代码已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

onMounted(() => {
  getSubmissionDetail()
  getTestResult()
})
</script>

<style scoped>
.submission-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-case-section {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.submission-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  color: #303133;
  font-weight: 500;
}

.code-section {
  margin-top: 20px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.code-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.code-container {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.line-numbers {
  padding: 16px 8px;
  border-right: 1px solid #ddd;
  background-color: #f1f1f1;
  color: #999;
  text-align: right;
  user-select: none;
  min-width: 40px;
}

.line-numbers span {
  display: block;
}

pre {
  margin: 0;
  padding: 16px 0 16px 16px;
  flex: 1;
  overflow-x: auto;
}

code {
  font-family: inherit;
}

/* 代码高亮主题自定义 */
:deep(.hljs) {
  background: #f8f9fa;
  padding: 0;
}

/* 为所有 el-card 添加统一的圆角样式 */
:deep(.el-card) {
  border-radius: 18px;
  overflow: hidden;
}
</style> 