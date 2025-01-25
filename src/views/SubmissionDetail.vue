<template>
  <div class="submission-detail">
    <!-- 测试用例结果展示 -->
    <div class="test-case-section">
      <testCase :test="submissionData"></testCase>
      <div class="author-info">
        <el-tag size="small" type="info" effect="plain">
          作者：{{ submissionData.userName }}
        </el-tag>
      </div>
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
        <div class="info-item">
          <span class="label">运行状态：</span>
          <span class="value">
            <el-tag v-if="submissionData.result == 100" type="success">答案正确</el-tag>
            <el-tag v-else-if="submissionData.result < 100 && submissionData.result > 0" type="primary">部分正确</el-tag>
            <el-tag v-if="submissionData.result == 0" type="danger">答案错误</el-tag>
            <el-tag v-if="submissionData.result == -1" type="danger">等待判题</el-tag>
            <el-tag v-if="submissionData.result == -2" type="warning">编译错误</el-tag>
          </span>
        </div>
      </div>
    </el-card>

    <!-- 代码展示区域 -->
    <el-card class="code-section">
      <div class="code-header">
        <span class="code-title">提交的代码</span>
        <el-button type="primary" size="small" @click="copyCode" :icon="Document">
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
    const response = (await request.post('/record/submission', {
      submissionId: submissionId
    })) as any

    if (response.code === 200) {
      submissionData.value = response.data

      // // 获取测试结果
      // const testResponse = await request.get(`/record/get/one/${submissionId}`) as any
      // if (testResponse.code === 200) {
      //   testResult.value = testResponse.data.test
      // }

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
    const response = (await request.get(`/record/get/one/${submissionId}`)) as any
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
    4: 'Python'
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
  const code = submissionData?.value?.code

  if (!code) {
    ElMessage.error('代码为空，无法复制')
    return
  }
  //解决 浏览器禁用了非安全域 (非 HTTPS) 的 navigator.clipboard API
  // 创建临时的文本区域用于复制
  const textArea = document.createElement('textarea')
  textArea.value = code
  textArea.style.position = 'absolute'
  textArea.style.left = '-9999px' // 确保元素不可见
  document.body.appendChild(textArea)

  // 选中并复制
  textArea.select()
  try {
    const success = document.execCommand('copy')
    if (success) {
      ElMessage.success('代码已成功复制到剪贴板')
    } else {
      ElMessage.error('复制失败，请手动复制')
    }
  } catch (err) {
    ElMessage.error('复制失败，请检查浏览器设置')
    console.error('复制失败:', err)
  }

  // 移除临时文本区域
  document.body.removeChild(textArea)
}

onMounted(() => {
  getSubmissionDetail()
  // getTestResult()
})
</script>

<style scoped>
.submission-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-case-section {
  position: relative;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.author-info {
  position: absolute;
  bottom: 16px;
  right: 80px;
}

:deep(.el-tag) {
  border-radius: 16px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  border: 1px solid #e9e9eb;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  /* 背景模糊效果 */
  /* 字体加粗 */
  font-weight: 600;
}

.submission-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 1fr 1fr 1fr;
  gap: 8px 16px;
}

.info-item:last-child {
  grid-column: 1 / -1;
  /* 运行状态占据整行 */
  margin-top: 16px;
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
