<template>
  <el-container class="layout-container">
    <!-- 左侧边栏 - 包含 AI 模型选择和主题切换 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <!-- 侧边栏头部 - 包含标题和折叠按钮 -->
      <div class="aside-header">
        <span v-show="!isCollapse" class="logo-text">AI Chat</span>
        <el-icon class="toggle-icon" @click="toggleCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- AI 模型选择菜单 -->
      <el-menu
        :default-active="selectedAI"
        class="el-menu-vertical"
        :collapse="isCollapse"
        @select="selectAI"
      >
        <el-menu-item index="智谱清言">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>智谱清言</template>
        </el-menu-item>
        <el-menu-item index="讯飞星火">
          <el-icon><ChatLineRound /></el-icon>
          <template #title>讯飞星火</template>
        </el-menu-item>
      </el-menu>

      <!-- 底部按钮区域 - 主题切换和信息按钮 -->
      <div class="aside-footer" v-show="!isCollapse">
        <el-dropdown trigger="click" @command="handleThemeChange" class="theme-dropdown">
          <el-button class="footer-button" :icon="isDarkMode ? Moon : Sunny" text />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="light" :class="{ 'is-active': !isDarkMode }">
                <el-icon><Sunny /></el-icon>
                <span>日间模式</span>
              </el-dropdown-item>
              <el-dropdown-item command="dark" :class="{ 'is-active': isDarkMode }">
                <el-icon><Moon /></el-icon>
                <span>夜间模式</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="footer-button" :icon="InfoFilled" @click="showInfo" text />
      </div>
    </el-aside>

    <!-- 主要内容区域 -->
    <el-container class="main-container">
      <!-- 顶部标题栏 - 显示当前 AI 和清空按钮 -->
      <el-header class="header">
        <span class="header-title">{{ selectedAI }}</span>
        <el-button type="danger" size="small" @click="deleteChat" :icon="Delete">
          清空聊天记录
        </el-button>
      </el-header>

      <!-- 聊天内容区域 -->
      <el-main class="main-content">
        <!-- 消息显示区域 - 分别为两种 AI 模型 -->
        <div v-if="selectedAI === '智谱清言'" class="messages" ref="messagesContainer">
          <div
            v-for="(message, index) in messages['智谱清言']"
            :key="index"
            :class="['message-item', message.role === 'user' ? 'message-user' : '']"
          >
            <!-- AI消息布局 -->
            <template v-if="message.role === 'ai'">
              <el-avatar :size="40" :src="aiAvatar" class="avatar" />
              <div class="message-bubble ai-bubble">
                {{ message.content }}
              </div>
            </template>

            <!-- 用户消息布局 -->
            <template v-else>
              <div class="message-content-wrapper">
                <div class="message-bubble user-bubble">
                  {{ message.content }}
                </div>
                <el-avatar :size="40" :src="userAvatar" class="avatar" />
              </div>
            </template>
          </div>

          <!-- 修改加载动画显示条件 -->
          <div v-if="isLoading && currentLoadingAI === '智谱清言'" class="message-item">
            <el-avatar :size="40" :src="aiAvatar" class="avatar" />
            <div class="message-bubble ai-bubble loading-bubble">
              <span class="loading-dots"> <i></i><i></i><i></i> </span>
            </div>
          </div>
        </div>

        <!-- 讯飞星火的消息区域 -->
        <div v-if="selectedAI === '讯飞星火'" class="messages" ref="messagesContainer">
          <div
            v-for="(message, index) in messages['讯飞星火']"
            :key="index"
            :class="['message-item', message.role === 'user' ? 'message-user' : '']"
          >
            <!-- AI消息布局 -->
            <template v-if="message.role === 'ai'">
              <el-avatar :size="40" :src="aiAvatar" class="avatar" />
              <div class="message-bubble ai-bubble">
                {{ message.content }}
              </div>
            </template>

            <!-- 用户消息布局 -->
            <template v-else>
              <div class="message-content-wrapper">
                <div class="message-bubble user-bubble">
                  {{ message.content }}
                </div>
                <el-avatar :size="40" :src="userAvatar" class="avatar" />
              </div>
            </template>
          </div>

          <!-- 修改加载动画显示条件 -->
          <div v-if="isLoading && currentLoadingAI === '讯飞星火'" class="message-item">
            <el-avatar :size="40" :src="aiAvatar" class="avatar" />
            <div class="message-bubble ai-bubble loading-bubble">
              <span class="loading-dots"> <i></i><i></i><i></i> </span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="input-wrapper">
            <el-input
              v-model="userMessage"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="请输入消息..."
              resize="none"
              @keyup.enter.exact="sendMessage"
              class="custom-input"
            />
            <el-button
              type="primary"
              :icon="Position"
              class="send-button"
              @click="sendMessage"
              :disabled="!userMessage.trim()"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import {
  ChatDotRound,
  ChatLineRound,
  Position,
  Fold,
  Expand,
  Delete,
  Moon,
  Sunny,
  InfoFilled
} from '@element-plus/icons-vue'
import request from '@/util/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const userAvatar = new URL('../assets/images/user.png', import.meta.url).href
const aiAvatar = new URL('../assets/images/b450806e36caa423.jpg', import.meta.url).href

const isCollapse = ref(false) // 侧边栏折叠状态
const userMessage = ref('') // 用户输入消息
const selectedAI = ref('智谱清言') // 当前选中的 AI
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false) // 加载状态
const currentLoadingAI = ref('') // 当前正在加载的 AI
const isDarkMode = ref(false) // 暗色模式状态

// 消息存储----为每个 AI 维护独立的消息列表
const messages = ref<{ [key: string]: { role: string; content: string; isNew?: boolean }[] }>({
  智谱清言: [],
  讯飞星火: []
})

// 初始化暗色模式
const initDarkMode = () => {
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode === 'true') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
    document.documentElement.style.setProperty('--el-bg-color', '#2c2c2c')
    document.documentElement.style.setProperty('--el-menu-bg-color', '#2c2c2c')
    document.documentElement.style.setProperty('--el-text-color-primary', '#E5EAF3')
    document.documentElement.style.setProperty('--messages-bg-color', '#141414')
  } else {
    document.documentElement.style.setProperty('--messages-bg-color', '#f5f5f5')
  }
}

// 切换侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 选择AI
const selectAI = (index: string) => {
  selectedAI.value = index
}

// 消息发送处理
const sendMessage = async (e?: KeyboardEvent) => {
  if (e?.shiftKey) return
  if (!userMessage.value.trim()) return

  const currentAI = selectedAI.value
  const messageContent = userMessage.value.trim()
  userMessage.value = ''

  // 添加用户消息
  messages.value[currentAI].push({
    role: 'user',
    content: messageContent,
    isNew: true
  })

  // 滚动到底部
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }

  isLoading.value = true
  currentLoadingAI.value = currentAI

  try {
    const response = await request.post('/AI/chat', {
      uid: 1,
      content: messageContent,
      ai: currentAI
    })

    if (response.data.code === 200) {
      messages.value[currentAI].push({
        role: 'ai',
        content: response.data.data,
        isNew: true
      })
    } else {
      messages.value[currentAI].push({
        role: 'ai',
        content: `错误: ${response.data.msg || '未知错误'}`,
        isNew: true
      })
      ElMessage.error(response.data.msg || '请求失败')
    }
  } catch (error) {
    messages.value[currentAI].push({
      role: 'ai',
      content: '错误: 网络请求失败，请稍后重试',
      isNew: true
    })
    ElMessage.error('网络请求失败')
  } finally {
    isLoading.value = false
    currentLoadingAI.value = ''
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
}

// 清空聊天记录
const deleteChat = async () => {
  const ai = selectedAI.value === '讯飞星火' ? 1 : 2
  try {
    const deleteDto = {
      uid: 1,
      ai: ai
    }

    const response = await request.delete('/AI/delete', {
      data: deleteDto
    })

    if (response.data.code === 200) {
      messages.value[selectedAI.value] = []
      ElMessage.success('聊天记录已清空')
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除请求失败')
  }
}

// 主题切换
const handleThemeChange = (command: string) => {
  isDarkMode.value = command === 'dark'
  const html = document.documentElement

  if (isDarkMode.value) {
    html.classList.add('dark')
    html.style.setProperty('--el-bg-color', '#2c2c2c')
    html.style.setProperty('--el-menu-bg-color', '#2c2c2c')
    html.style.setProperty('--el-text-color-primary', '#E5EAF3')
    html.style.setProperty('--messages-bg-color', '#141414')
  } else {
    html.classList.remove('dark')
    html.style.removeProperty('--el-bg-color')
    html.style.removeProperty('--el-menu-bg-color')
    html.style.removeProperty('--el-text-color-primary')
    html.style.setProperty('--messages-bg-color', '#f5f5f5')
  }

  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

// 在组件挂载时初始化主题
onMounted(() => {
  initDarkMode()
})

const showInfo = () => {
  ElMessageBox.alert(
    `欢迎使用 PTUCODE AI 聊天应用！<br><br>` +
      `使用指南：<br>` +
      `• 智谱清言和讯飞星火两种对话模型<br>` +
      `• 在左侧可以切换不同的 AI 模型<br>` +
      `• 按 Enter 键快速发送消息<br>` +
      `• Shift + Enter 换行<br>` +
      `• 支持清空聊天记录<br>` +
      `• 支持日间/夜间模式切换<br>` +
      `• <strong>有其他问题请联系管理员</strong> •`,
    '使用说明',
    {
      confirmButtonText: 'OK',
      // 确保 ElMessageBox.alert 支持 HTML 渲染。
      // 对于 Element Plus 的 MessageBox，
      //需要添加 dangerouslyUseHTMLString: true
      dangerouslyUseHTMLString: true
    }
  )
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  border: 1px solid var(--el-border-color-light);
}

.aside {
  background-color: var(--el-menu-bg-color);
  transition: background-color 0.3s ease;
  border-right: 1px solid var(--el-border-color-lighter);
  position: relative;
  display: flex;
  flex-direction: column;
}

.aside-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.toggle-icon {
  cursor: pointer;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
}

.main-container {
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease;
}

.header {
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.main-content {
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--messages-bg-color);
  transition: background-color 0.3s ease;
}

.message-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0 20px;
}

.message-user {
  justify-content: flex-end;
}

.message-content-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.user-bubble {
  background-color: var(--el-color-primary-light-5);
  color: var(--el-text-color-primary);
}

.ai-bubble {
  background-color: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  margin-left: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.avatar {
  flex-shrink: 0;
}

/* 加载动画样式 */
.loading-bubble {
  min-width: 60px;
  padding: 12px 16px;
}

.loading-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.loading-dots i {
  width: 6px;
  height: 6px;
  background-color: var(--el-text-color-secondary);
  border-radius: 50%;
  display: inline-block;
  animation: loadingDot 1.4s infinite;
}

.loading-dots i:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loadingDot {
  0% {
    transform: scale(0.3);
    opacity: 0.3;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.3);
    opacity: 0.3;
  }
}

.input-section {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  transition: background-color 0.3s ease;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.custom-input {
  flex: 1;
}

.custom-input :deep(.el-textarea__inner) {
  background-color: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  resize: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.custom-input :deep(.el-textarea__inner:focus) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.send-button {
  height: 40px;
  padding: 0 24px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.send-button:active {
  transform: translateY(0);
}

/* 消息动画 */
.message-bubble {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.aside-footer {
  position: absolute;
  bottom: 20px;
  width: 100%;
  padding: 10px 13px;
  border-top: 1px solid var(--el-border-color-light);
  background-color: var(--el-menu-bg-color);
  display: flex;
  justify-content: space-between;
  height: 40px;
  box-sizing: border-box;
  transition: background-color 0.3s ease;
}

.footer-button {
  width: 36px;
  height: 36px;
  padding: 8px;
  border-radius: 4px;
}

.footer-button :deep(.el-icon) {
  font-size: 20px;
}

/* 添加下拉菜单样式 */
.theme-dropdown :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.theme-dropdown :deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 4px;
}

/* 确保下拉菜单位置正确 */
.theme-dropdown {
  display: inline-flex;
  margin-right: auto;
  margin-left: 20%;
}

/* 添加选中状态的样式 */
.theme-dropdown :deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.footer-button:last-child {
  margin-left: auto;
  margin-right: 20%;
}
</style>
