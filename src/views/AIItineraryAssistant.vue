<template>
  <div class="ai-itinerary-page">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>🤖 AI行程规划助手</h1>
        </div>
        <div class="header-actions">
          <el-button @click="goToMyItinerary">我的行程</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </el-header>

    <div class="main-container">
      <!-- 左侧：AI对话区 -->
      <div class="chat-section">
        <div class="chat-header">
          <div class="avatar-large">🤖</div>
          <div class="info">
            <h2>小莆 - AI旅游规划师</h2>
            <p>告诉我你的需求，我来帮你规划完美行程</p>
          </div>
        </div>

        <div class="chat-messages" ref="messagesRef">
          <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
            <div class="message-content">
              <div v-if="msg.role === 'assistant'" class="avatar">🤖</div>
              <div class="bubble">
                <div class="text" v-html="formatMessage(msg.content)"></div>
                <div class="time">{{ msg.time }}</div>
                <!-- 如果AI回复包含行程，显示生成按钮 -->
                <div v-if="msg.hasItinerary" class="action-btns">
                  <el-button type="primary" size="small" @click="generateItinerary(msg.content)">
                    ✨ 生成行程
                  </el-button>
                </div>
              </div>
              <div v-if="msg.role === 'user'" class="avatar">👤</div>
            </div>
          </div>

          <!-- 流式输出中的消息 -->
          <div v-if="streaming" class="message assistant">
            <div class="message-content">
              <div class="avatar">🤖</div>
              <div class="bubble">
                <div class="text" v-html="formatMessage(streamingMessage)"></div>
                <span class="cursor">|</span>
              </div>
            </div>
          </div>

          <div v-if="loading && !streaming" class="message assistant">
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
          <div class="suggestion-title">💡 快速开始：</div>
          <div class="suggestion-grid">
            <div
              v-for="(sug, index) in suggestions"
              :key="index"
              @click="sendMessage(sug)"
              class="suggestion-card"
            >
              <span class="icon">{{ getSuggestionIcon(index) }}</span>
              <span>{{ sug }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input-wrapper">
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              placeholder="告诉我你的旅行需求，如：我想去莆田玩3天，预算2000元..."
              @keyup.enter="handleSend"
              :disabled="loading || streaming"
              type="textarea"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
            />
            <el-button
              type="primary"
              circle
              @click="handleSend"
              :loading="loading || streaming"
              :disabled="!inputMessage.trim()"
              class="send-btn"
            >
              <el-icon v-if="!loading && !streaming"><Promotion /></el-icon>
            </el-button>
          </div>
          <div class="quick-actions">
            <el-button size="small" @click="clearChat" :disabled="messages.length <= 1">
              <el-icon><Delete /></el-icon>
              清空对话
            </el-button>
            <el-button size="small" type="primary" @click="showCreateForm = true">
              <el-icon><Plus /></el-icon>
              手动创建行程
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：行程预览区 -->
      <div class="itinerary-section" v-if="currentItinerary">
        <div class="itinerary-header">
          <h3>📋 生成的行程</h3>
          <el-button type="primary" @click="saveItinerary" :loading="saving">
            保存行程
          </el-button>
        </div>
        
        <div class="itinerary-preview">
          <div class="summary">
            <h2>{{ currentItinerary.title }}</h2>
            <div class="meta">
              <el-tag>{{ currentItinerary.days }}天</el-tag>
              <el-tag type="success">¥{{ currentItinerary.budget }}</el-tag>
              <el-tag type="warning">{{ currentItinerary.peopleCount }}人</el-tag>
            </div>
          </div>

          <el-scrollbar height="calc(100vh - 300px)">
            <div class="day-list">
              <div v-for="(day, index) in currentItinerary.dayList" :key="index" class="day-card">
                <div class="day-header">
                  <h4>第{{ day.dayNumber }}天 {{ day.theme }}</h4>
                  <span class="budget">¥{{ day.budget }}</span>
                </div>
                <div class="day-items">
                  <div v-for="item in day.items" :key="item.sortOrder" class="item">
                    <div class="item-time">{{ item.startTime }} - {{ item.endTime }}</div>
                    <div class="item-content">
                      <el-tag :type="getItemTypeTag(item.itemType)" size="small">
                        {{ getItemTypeName(item.itemType) }}
                      </el-tag>
                      <span class="item-name">{{ item.itemName }}</span>
                      <span class="item-cost">¥{{ item.cost }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- 手动创建行程对话框 -->
    <el-dialog v-model="showCreateForm" title="创建行程" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="行程标题">
          <el-input v-model="createForm.title" placeholder="给你的行程起个名字" />
        </el-form-item>
        <el-form-item label="旅行时间">
          <el-date-picker
            v-model="createForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="出行人数">
          <el-input-number v-model="createForm.peopleCount" :min="1" />
        </el-form-item>
        <el-form-item label="预算">
          <el-input-number v-model="createForm.budget" :min="0" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateForm = false">取消</el-button>
        <el-button type="primary" @click="handleManualCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Promotion, Delete, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { authHeaders, parseResultResponse } from '@/util/fetchResult'
import request from '@/util/request'

const router = useRouter()

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
  hasItinerary?: boolean
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const streaming = ref(false)
const streamingMessage = ref('')
const messagesRef = ref()
const suggestions = ref<string[]>([])
const currentItinerary = ref<any>(null)
const saving = ref(false)
const showCreateForm = ref(false)
const createForm = ref({
  title: '',
  dateRange: [],
  peopleCount: 2,
  budget: 1500
})

const showSuggestions = computed(() => messages.value.length <= 1)

// 建议问题图标
const getSuggestionIcon = (index: number) => {
  const icons = ['🏞️', '🍜', '📅', '💰', '👨‍👩‍👧', '🎒']
  return icons[index % icons.length]
}

// 加载建议问题
onMounted(() => {
  suggestions.value = [
    '我想去莆田玩3天，预算2000元，有什么推荐？',
    '推荐一个适合周末的2日游行程',
    '带孩子去莆田，有哪些亲子景点？',
    '预算1000元，怎么玩莆田？',
    '莆田有哪些必吃的美食？',
    '湄洲岛一日游怎么安排？'
  ]

  // 欢迎消息
  addMessage('assistant', `你好！我是小莆，你的AI旅游规划师 🎉

我可以帮你：
✨ 智能规划旅游行程
✨ 推荐景点和美食
✨ 预算分配建议
✨ 解答旅游问题

告诉我你的需求，我来为你定制专属行程！`)
})

// 添加消息
const addMessage = (role: 'user' | 'assistant', content: string, hasItinerary = false) => {
  messages.value.push({
    role,
    content,
    time: dayjs().format('HH:mm'),
    hasItinerary
  })
  scrollToBottom()
}

const buildChatHistory = () => {
  return messages.value
    .filter((message) => message.content.trim())
    .slice(-8)
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content
    }))
}

// 发送消息（流式）
const handleSend = () => {
  if (!inputMessage.value.trim()) return
  sendMessage(inputMessage.value)
  inputMessage.value = ''
}

const sendMessage = async (question: string) => {
  const history = buildChatHistory()
  // 添加用户消息
  addMessage('user', question)

  loading.value = true
  streaming.value = true
  streamingMessage.value = ''

  try {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token') || ''
      },
      body: JSON.stringify({ question, history })
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      buffer = consumeSseBuffer(buffer)
    }

    buffer += decoder.decode()
    consumeSseBuffer(buffer, true)
    if (streaming.value && streamingMessage.value) {
      streaming.value = false
      const hasItinerary = detectItinerary(streamingMessage.value)
      addMessage('assistant', streamingMessage.value, hasItinerary)
      streamingMessage.value = ''
    }
  } catch (error: any) {
    console.error('流式调用失败:', error)
    streaming.value = false
    streamingMessage.value = ''
    ElMessage.error(error.message || 'AI服务暂时不可用')
    addMessage('assistant', '抱歉，我现在有点忙，请稍后再试 😅')
  } finally {
    loading.value = false
  }
}

const consumeSseBuffer = (buffer: string, flush = false) => {
  const normalized = buffer.replace(/\r\n/g, '\n')
  const events = normalized.split('\n\n')
  const rest = flush ? '' : events.pop() || ''

  for (const eventText of events) {
    const lines = eventText.split('\n')
    const eventName = lines
      .find((line) => line.startsWith('event:'))
      ?.slice(6)
      .trim()
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n')

    if (data === '[DONE]' || eventName === 'done') {
      streaming.value = false
      const hasItinerary = detectItinerary(streamingMessage.value)
      addMessage('assistant', streamingMessage.value, hasItinerary)
      streamingMessage.value = ''
      return ''
    }
    if (eventName === 'error') {
      throw new Error(decodeSseData(data) || 'AI服务错误')
    }
    if (data) {
      streamingMessage.value += decodeSseData(data)
      scrollToBottom()
    }
  }

  return rest
}

const decodeSseData = (data: string) => {
  try {
    const parsed = JSON.parse(data)
    return typeof parsed === 'string' ? parsed : data
  } catch (error) {
    return data
  }
}

// 检测回复中是否包含行程信息
const detectItinerary = (content: string): boolean => {
  const keywords = ['第一天', '第二天', '第三天', '行程', '景点', '住宿', '早餐', '午餐', '晚餐']
  return keywords.some(keyword => content.includes(keyword))
}

// 生成行程
const generateItinerary = async (aiResponse: string) => {
  loading.value = true
  try {
    // 解析AI回复，提取行程信息
    const itineraryData = parseAIResponse(aiResponse)
    
    // 调用后端生成行程
    const response = await fetch('/api/itinerary/generate-itinerary', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(itineraryData)
    })

    const result = await parseResultResponse<{ id: number }>(response)
    const detail: any = await request.get(`/itinerary/${result.id}`)
    currentItinerary.value = {
      ...detail.data,
      days: detail.data?.daysCount || detail.data?.days || itineraryData.days,
      budget: detail.data?.budget || detail.data?.totalBudget || itineraryData.budget,
      peopleCount: detail.data?.peopleCount || 2
    }
    ElMessage.success('行程生成成功！')
  } catch (error: any) {
    console.error('生成行程失败:', error)
    ElMessage.error(error.message || '生成失败，请重试')
  } finally {
    loading.value = false
  }
}

// 解析AI回复
const parseAIResponse = (content: string) => {
  // 简单的解析逻辑，实际应该更复杂
  const days = (content.match(/第(\d+)天/g) || []).length
  const budget = content.match(/预算[：:]\s*¥?(\d+)/)?.[1] || '1500'
  
  return {
    title: `莆田${days}日游`,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add((days || 2) - 1, 'day').format('YYYY-MM-DD'),
    days: days || 2,
    budget: parseInt(budget),
    interests: [],
    aiContent: content
  }
}

// 保存行程
const saveItinerary = async () => {
  if (!currentItinerary.value) return
  
  saving.value = true
  try {
    const response = await fetch('/api/itinerary/save', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(currentItinerary.value)
    })

    await parseResultResponse<string>(response)
    ElMessage.success('行程保存成功！')
    router.push('/itinerary/list')
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 手动创建行程
const handleManualCreate = () => {
  router.push('/itinerary/create')
}

// 清空对话
const clearChat = () => {
  messages.value = []
  currentItinerary.value = null
  addMessage('assistant', '对话已清空，有什么可以帮你的吗？')
}

// 格式化消息
const formatMessage = (content: string) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/第(\d+)天/g, '<strong style="color: #667eea;">第$1天</strong>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 获取项目类型名称
const getItemTypeName = (type: number) => {
  const names: any = { 1: '景点', 2: '餐饮', 3: '住宿', 4: '交通', 5: '其他' }
  return names[type] || '未知'
}

// 获取项目类型标签颜色
const getItemTypeTag = (type: number) => {
  const tags: any = { 1: 'primary', 2: 'success', 3: 'warning', 4: 'info', 5: '' }
  return tags[type] || ''
}

const goHome = () => router.push('/')
const goBack = () => router.back()
const goToMyItinerary = () => router.push('/itinerary/list')
</script>

<style scoped lang="scss">
.ai-itinerary-page {
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
    max-width: 1600px;
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

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.chat-section {
  flex: 1;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 600px;
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
    max-width: 75%;
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

  .action-btns {
    margin-top: 12px;
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

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #667eea;
  margin-left: 2px;
  animation: blink 1s infinite;
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
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.itinerary-section {
  width: 500px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .itinerary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    h3 {
      margin: 0;
      font-size: 20px;
    }
  }

  .itinerary-preview {
    flex: 1;
    padding: 20px;
    overflow: hidden;

    .summary {
      margin-bottom: 20px;

      h2 {
        margin: 0 0 12px 0;
        font-size: 22px;
      }

      .meta {
        display: flex;
        gap: 8px;
      }
    }

    .day-list {
      .day-card {
        margin-bottom: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 12px;

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e0e0e0;

          h4 {
            margin: 0;
            font-size: 16px;
            color: #667eea;
          }

          .budget {
            color: #ff6b6b;
            font-weight: bold;
          }
        }

        .day-items {
          .item {
            margin-bottom: 8px;
            padding: 8px;
            background: #fff;
            border-radius: 8px;

            .item-time {
              font-size: 12px;
              color: #999;
              margin-bottom: 4px;
            }

            .item-content {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;

              .item-name {
                flex: 1;
              }

              .item-cost {
                color: #ff6b6b;
                font-weight: bold;
              }
            }
          }
        }
      }
    }
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

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
</style>
