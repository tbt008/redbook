<template>
  <div class="ai-assistant-page">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <div class="chat-wrapper">
      <div class="chat-container">
        <div class="chat-header">
          <div class="avatar-large">🤖</div>
          <div class="info">
            <h2>小莆 - AI旅游助手</h2>
            <p>我可以帮你规划行程、推荐景点美食哦~</p>
          </div>
        </div>

        <div class="chat-messages" ref="messagesRef">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
            <div class="message-content">
              <div v-if="msg.role === 'assistant'" class="avatar">🤖</div>
              <div class="bubble">
                <div class="text" v-html="formatMessage(msg.content)"></div>
                <div class="time">{{ msg.time }}</div>
              </div>
              <div v-if="msg.role === 'user'" class="avatar">👤</div>
            </div>
          </div>

          <div v-if="loading" class="message assistant">
            <div class="message-content">
              <div class="avatar">🤖</div>
              <div class="bubble">
                <div class="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="suggestions" v-if="showSuggestions">
          <div class="suggestion-title">💡 你可以这样问我：</div>
          <div class="suggestion-grid">
            <div
              v-for="(sug, index) in suggestions"
              :key="index"
              @click="sendMessage(sug)"
              class="suggestion-card"
            >
              <el-icon class="icon">
                <component :is="getSuggestionIcon(index)" />
              </el-icon>
              <span>{{ sug }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input-wrapper">
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              placeholder="问我任何关于莆田旅游的问题..."
              @keyup.enter="handleSend"
              :disabled="loading"
              type="textarea"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
            />
            <el-button
              type="primary"
              circle
              @click="handleSend"
              :loading="loading"
              :disabled="!inputMessage.trim()"
              class="send-btn"
            >
              <el-icon v-if="!loading"><Promotion /></el-icon>
            </el-button>
          </div>
          <div class="quick-actions">
            <el-button size="small" @click="clearChat" :disabled="messages.length <= 1">
              <el-icon><Delete /></el-icon>
              清空对话
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Promotion,
  Delete,
  Location,
  Food,
  Calendar,
  Money,
  User,
  ShoppingBag
} from '@element-plus/icons-vue'
import request from '@/util/request'
import dayjs from 'dayjs'

const router = useRouter()

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesRef = ref()
const suggestions = ref<string[]>([])

const showSuggestions = computed(() => messages.value.length <= 1)

// 建议问题图标
const getSuggestionIcon = (index: number) => {
  const icons = [Location, Food, Calendar, Money, User, ShoppingBag]
  return icons[index % icons.length]
}

// 加载建议问题
onMounted(async () => {
  try {
    const res: any = await request.get('/ai/suggestions')
    if (res && res.data) {
      suggestions.value = res.data
    }
  } catch (error) {
    // 使用默认建议
    suggestions.value = [
      '附近有哪些好玩的景点？',
      '推荐一些莆田特色美食',
      '两天一夜怎么玩比较好？',
      '预算1000元能去哪些地方？',
      '适合亲子游的景点有哪些？',
      '莆田有什么特产可以带回家？'
    ]
  }

  // 欢迎消息
  addMessage('assistant', `你好！我是小莆，你的AI旅游助手 🎉

我可以帮你：
✨ 推荐景点和美食
✨ 规划旅游行程
✨ 解答旅游问题
✨ 预算建议

快来问我吧！`)
})

// 添加消息
const addMessage = (role: 'user' | 'assistant', content: string) => {
  messages.value.push({
    role,
    content,
    time: dayjs().format('HH:mm')
  })
  scrollToBottom()
}

// 发送消息
const handleSend = () => {
  if (!inputMessage.value.trim()) return
  sendMessage(inputMessage.value)
  inputMessage.value = ''
}

const sendMessage = async (question: string) => {
  // 添加用户消息
  addMessage('user', question)

  loading.value = true

  try {
    const res: any = await request.post('/ai/chat', { question })

    if (res && res.data) {
      // 添加AI回答
      addMessage('assistant', res.data)
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'AI服务暂时不可用')
    addMessage('assistant', '抱歉，我现在有点忙，请稍后再试 😅')
  } finally {
    loading.value = false
  }
}

// 清空对话
const clearChat = () => {
  messages.value = []
  addMessage('assistant', '对话已清空，有什么可以帮你的吗？')
}

// 格式化消息
const formatMessage = (content: string) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const goHome = () => router.push('/')
const goBack = () => router.back()
</script>

<style scoped lang="scss">
.ai-assistant-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
  line-height: 60px;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .logo h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      cursor: pointer;
    }
  }
}

.chat-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.chat-container {
  width: 100%;
  max-width: 900px;
  height: 85vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  .avatar-large {
    font-size: 56px;
    animation: bounce 2s infinite;
  }

  .info {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }

    p {
      margin: 0;
      opacity: 0.95;
      font-size: 15px;
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8f9fa;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
}

.message {
  margin-bottom: 24px;
  animation: fadeIn 0.4s ease-out;

  .message-content {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }

  .avatar {
    font-size: 36px;
    flex-shrink: 0;
  }

  .bubble {
    max-width: 65%;
    display: flex;
    flex-direction: column;
  }

  .text {
    padding: 14px 18px;
    border-radius: 16px;
    line-height: 1.6;
    word-wrap: break-word;
    font-size: 15px;
  }

  .time {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    padding: 0 8px;
  }

  &.user {
    .message-content {
      flex-direction: row-reverse;
    }

    .bubble {
      align-items: flex-end;
    }

    .text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
  }

  &.assistant {
    .text {
      background: #fff;
      color: #333;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
  }
}

.typing {
  display: flex;
  gap: 6px;
  padding: 20px;

  span {
    width: 10px;
    height: 10px;
    background: #999;
    border-radius: 50%;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.suggestions {
  padding: 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;

  .suggestion-title {
    margin-bottom: 16px;
    font-weight: 600;
    color: #666;
    font-size: 15px;
  }

  .suggestion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .suggestion-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;

    .icon {
      font-size: 20px;
      color: #667eea;
    }

    span {
      font-size: 14px;
      color: #333;
    }

    &:hover {
      background: #fff;
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }
  }
}

.chat-input-wrapper {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;

  .chat-input {
    display: flex;
    gap: 12px;
    align-items: flex-end;

    .el-textarea {
      flex: 1;
    }

    .send-btn {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      font-size: 20px;

      &:hover {
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .quick-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-12px);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>

