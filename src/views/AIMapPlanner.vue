<template>
  <div class="ai-map-planner">
    <el-header class="header">
      <div class="header-inner">
        <h1><span class="header-icon">🗺️</span> AI智能行程规划</h1>
        <div class="header-actions">
          <el-button @click="saveItinerary" type="primary">💾 保存行程</el-button>
          <el-button @click="goToMyItinerary">📋 我的行程</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </el-header>

    <div class="main-container">
      <div
        class="panels-container"
        ref="panelsContainerRef"
        :class="{ 'is-resizing': resizingPanel }"
        :style="panelGridStyle"
      >
        <!-- 左侧：AI对话区 -->
        <div class="panel left-panel">
          <div class="left-panel-inner">
            <div class="panel-header">
              <h3>🤖 AI助手</h3>
              <div class="chat-session-actions">
                <el-button size="small" type="primary" plain @click="startNewSession">+ 新会话</el-button>
              </div>
            </div>
            <div class="chat-session-bar">
              <el-select
                v-model="selectedSessionId"
                size="small"
                class="session-select"
                placeholder="选择历史会话"
                @change="switchSession"
              >
                <el-option
                  v-for="session in chatSessions"
                  :key="session.id"
                  :label="session.title"
                  :value="session.id"
                >
                  <div class="session-option">
                    <span>{{ session.title }}</span>
                    <small>{{ formatSessionTime(session.updatedAt) }}</small>
                  </div>
                </el-option>
              </el-select>
              <el-button size="small" text type="danger" @click="deleteCurrentSession">删除</el-button>
            </div>
            <div class="chat-messages" ref="messagesRef">
              <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
                <div class="bubble" v-html="renderMarkdown(msg.content)"></div>
              </div>
              <!-- 加载动画 -->
              <div v-if="loading && !hasStreamingContent" class="message assistant">
                <div class="bubble loading-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input v-model="inputMessage" placeholder="告诉我你的需求..." @keyup.enter="sendMessage" />
              <el-button type="primary" @click="sendMessage" :loading="loading">
                发送
              </el-button>
            </div>
          </div>
        </div>

        <div
          class="panel-resizer"
          role="separator"
          aria-label="调整AI助手和地图区域宽度"
          title="拖动调整左右宽度"
          @pointerdown="startPanelResize('left', $event)"
        ></div>

        <!-- 中间：地图区 -->
        <div class="panel map-panel-wrapper">
          <div class="map-panel">
            <div class="panel-header">
              <h3>🗺️ 莆田地图</h3>
              <div class="map-filters">
                <el-checkbox-group v-model="visibleTypes" size="small">
                  <el-checkbox-button label="attraction">🏞️ 景点</el-checkbox-button>
                  <el-checkbox-button label="food">🍜 美食</el-checkbox-button>
                  <el-checkbox-button label="hotel">🏨 酒店</el-checkbox-button>
                </el-checkbox-group>
              </div>
            </div>

            <div class="map-search">
              <el-input
                v-model="searchKeyword"
                clearable
                placeholder="搜索景点、美食、酒店、区域或地址"
                @keyup.enter="focusFirstSearchResult"
              />
              <div class="search-meta">
                <span>当前显示 {{ filteredMarkers.length }} / {{ markers.length }} 个资源</span>
                <el-button v-if="searchKeyword" text size="small" @click="clearMapSearch">清空</el-button>
              </div>
              <div v-if="searchKeyword" class="search-results">
                <div
                  v-for="marker in searchResults"
                  :key="buildMarkerKey(marker)"
                  :class="['search-result-item', marker.type, { active: selectedLocatedMarkerKey === buildMarkerKey(marker) }]"
                  role="button"
                  tabindex="0"
                  @click="locateMarker(marker, true)"
                  @keyup.enter="locateMarker(marker, true)"
                >
                  <span class="result-icon">{{ marker.icon }}</span>
                  <span class="result-content">
                    <strong>{{ marker.name }}</strong>
                    <small>{{ getTypeLabel(marker.type) }} · {{ marker.region || marker.address || '暂无位置' }}</small>
                  </span>
                  <el-button size="small" type="primary" @click.stop="addToItinerary(marker)">
                    加入
                  </el-button>
                </div>
                <div v-if="searchResults.length === 0" class="search-empty">
                  没有匹配资源
                </div>
              </div>
            </div>

            <div class="map-container" ref="mapContainer">
              <!-- 真实地图 -->
              <div class="real-amap-container" id="amap-container">
              </div>
            </div>
          </div>

          <div class="map-legend">
            <span>💡 从地图上拖拽标记到右侧行程区域</span>
          </div>
        </div>

        <div
          class="panel-resizer"
          role="separator"
          aria-label="调整地图和我的行程区域宽度"
          title="拖动调整左右宽度"
          @pointerdown="startPanelResize('right', $event)"
        ></div>

        <!-- 右侧：行程编辑区 -->
        <div class="panel right-panel">
          <div class="right-panel-inner">
            <div class="panel-header">
              <h3>📅 我的行程</h3>
              <div class="day-actions">
                <el-select
                  v-model="selectedDayIndex"
                  size="small"
                  style="width: 108px"
                  aria-label="选择添加到哪一天"
                >
                  <el-option
                    v-for="option in dayOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-button size="small" @click="addDay">+ 添加一天</el-button>
              </div>
            </div>

            <div class="itinerary-container" @dragover.prevent @drop="handleDrop">
              <div
                v-for="(day, dayIndex) in itinerary"
                :key="dayIndex"
                :class="['day-section', { active: selectedDayIndex === dayIndex }]"
                @click="selectDay(dayIndex)"
                @dragover.prevent
                @drop.stop="handleDrop($event, dayIndex)"
              >
                <div class="day-header">
                  <h4>第{{ dayIndex + 1 }}天</h4>
                  <span class="day-budget">预算: ¥{{ calculateDayBudget(day) }}</span>
                </div>

                <draggable v-model="day.items" group="itinerary" item-key="id" class="day-items" @change="updateRoute">
                  <template #item="{ element: item }">
                    <div class="itinerary-item">
                      <div class="drag-handle">⋮⋮</div>
                      <div class="item-time">
                        <el-time-picker v-model="item.time" format="HH:mm" size="small" style="width: 80px" />
                      </div>
                      <div class="item-content">
                        <span class="item-icon">{{ item.icon }}</span>
                        <div class="item-info">
                          <div class="item-name">{{ item.name }}</div>
                          <div class="item-address">{{ item.address }}</div>
                        </div>
                        <span class="item-price">¥{{ item.price }}</span>
                      </div>
                      <el-button icon="Delete" circle size="small" @click="removeItem(dayIndex, item.id)" />
                    </div>
                  </template>
                </draggable>

                <div v-if="day.items.length === 0" class="empty-day">
                  拖拽地图标记到这里
                </div>
              </div>
            </div>

            <div class="itinerary-summary">
              <div class="summary-item">
                <span>总天数</span>
                <strong>{{ itinerary.length }}天</strong>
              </div>
              <div class="summary-item">
                <span>总预算</span>
                <strong>¥{{ totalBudget }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标记详情弹窗 -->
      <el-dialog v-model="showMarkerDialog" title="详情" width="400px">
        <div v-if="selectedMarker" class="marker-detail">
          <div class="detail-icon">{{ selectedMarker.icon }}</div>
          <h3>{{ selectedMarker.name }}</h3>
          <p>📍 {{ selectedMarker.address }}</p>
          <p>💰 {{ selectedMarker.priceLabel }}</p>
          <p>⭐ 评分 {{ selectedMarker.rating }}</p>
          <p class="description">{{ selectedMarker.description }}</p>
          <div class="dialog-day-selector">
            <span>添加到</span>
            <el-select v-model="selectedDayIndex" size="small" style="width: 120px">
              <el-option
                v-for="option in dayOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>
        <template #footer>
          <el-button @click="showMarkerDialog = false">取消</el-button>
          <el-button type="primary" @click="addMarkerToItinerary">
            添加到行程
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onBeforeUnmount, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import request from '@/util/request'
import { marked } from 'marked'
import { loadAMapScript } from '@/utils/amap'

const router = useRouter()

// 配置marked
marked.setOptions({
  breaks: true,  // 支持换行
  gfm: true      // 支持GitHub风格的markdown
})

// 渲染markdown
const normalizeAiMarkdown = (content: string) => {
  return String(content || '')
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])\s*(#{2,6}\s*)/g, '$1\n\n$2')
    .replace(/(#{2,6}\s*(?:第\s*\d+\s*天|上午|中午|下午|晚上|住宿|交通|预算|小贴士|建议)[^\n#-—–]*)\s*[-—–]\s*/g, '$1\n\n- ')
    .replace(/\s*[-—–]\s*(区域|费用|价格|评分|交通|理由|建议|预算|住宿|备注|特色|用时|地址)[:：]/g, '\n  - $1：')
    .replace(/(第\s*\d+\s*天)\s*(#{2,6})/g, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const renderMarkdown = (content: string) => {
  if (!content) return ''
  return marked(normalizeAiMarkdown(content))
}

// 地图标记数据（从API加载）
const markers = ref([])
// 筛选类型
const visibleTypes = ref(['attraction', 'food', 'hotel'])
const searchKeyword = ref('')
const selectedLocatedMarkerKey = ref('')

// 默认使用真实地图
const useRealMap = ref(true)
const realMapInstance = ref<any>(null)
const realMapMarkers = ref<any[]>([])

const buildMarkerKey = (marker) => `${marker?.type || 'unknown'}-${marker?.id || ''}`

const normalizeSearchText = (value: any) => String(value || '').trim().toLowerCase()

// 过滤后的标记
const filteredMarkers = computed(() => {
  const keyword = normalizeSearchText(searchKeyword.value)
  return markers.value.filter(m => {
    if (!visibleTypes.value.includes(m.type)) return false
    if (!keyword) return true
    return [
      m.name,
      m.address,
      m.region,
      m.description,
      getTypeLabel(m.type)
    ].some(value => normalizeSearchText(value).includes(keyword))
  })
})

const searchResults = computed(() => filteredMarkers.value.slice(0, 8))

// 行程数据
const itinerary = ref([
  { day: 1, items: [] }
])
const selectedDayIndex = ref(0)
const dayOptions = computed(() => itinerary.value.map((_, index) => ({
  label: `第${index + 1}天`,
  value: index
})))

// 拖拽状态
const draggingId = ref(null)
const draggingMarker = ref(null)

// AI对话
const CHAT_SESSION_STORAGE_KEY = 'ai-map-planner-chat-sessions'
const ACTIVE_CHAT_SESSION_STORAGE_KEY = 'ai-map-planner-active-chat-session'
const MAX_CHAT_SESSION_COUNT = 30
const createDefaultMessages = () => [
  { role: 'assistant', content: '你好！我是小莆，你的AI旅游助手。告诉我你的需求，我来帮你规划行程！' }
]
const messages = ref(createDefaultMessages())
const chatSessions = ref([])
const activeSessionId = ref('')
const selectedSessionId = ref('')
const isRestoringSession = ref(false)
const inputMessage = ref('')
const loading = ref(false)
const hasStreamingContent = computed(() => {
  const lastMessage = messages.value[messages.value.length - 1]
  return loading.value && lastMessage?.role === 'assistant' && Boolean(lastMessage.content)
})

// 标记详情
const showMarkerDialog = ref(false)
const selectedMarker = ref(null)
const hoveredMarkerId = ref(null)
const mapLoadError = ref(false)

// 消息容器引用
const messagesRef = ref<HTMLElement | null>(null)
const panelsContainerRef = ref<HTMLElement | null>(null)

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    attraction: '景点',
    food: '美食',
    hotel: '酒店'
  }
  return labelMap[type] || '资源'
}

// 路线连线
const routeLines = ref([])

const leftPanelSize = ref(20)
const rightPanelSize = ref(20)
const resizingPanel = ref<'left' | 'right' | null>(null)
const MIN_LEFT_PANEL_WIDTH = 260
const MIN_MAP_PANEL_WIDTH = 320
const MIN_RIGHT_PANEL_WIDTH = 300

const panelGridStyle = computed(() => {
  const left = leftPanelSize.value
  const right = rightPanelSize.value
  const map = 100 - left - right
  return {
    gridTemplateColumns: `minmax(${MIN_LEFT_PANEL_WIDTH}px, ${left}fr) 4px minmax(${MIN_MAP_PANEL_WIDTH}px, ${map}fr) 4px minmax(${MIN_RIGHT_PANEL_WIDTH}px, ${right}fr)`
  }
})

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

let resizeFrameId = 0
const refreshMapSize = () => {
  window.cancelAnimationFrame(resizeFrameId)
  resizeFrameId = window.requestAnimationFrame(() => {
    realMapInstance.value?.resize?.()
  })
}

const updatePanelSize = (event: PointerEvent) => {
  if (!resizingPanel.value || !panelsContainerRef.value) return

  const rect = panelsContainerRef.value.getBoundingClientRect()
  const pointerX = clamp(event.clientX - rect.left, 0, rect.width)
  const minLeft = MIN_LEFT_PANEL_WIDTH / rect.width * 100
  const minMap = MIN_MAP_PANEL_WIDTH / rect.width * 100
  const minRight = MIN_RIGHT_PANEL_WIDTH / rect.width * 100

  if (resizingPanel.value === 'left') {
    leftPanelSize.value = clamp(pointerX / rect.width * 100, minLeft, 100 - rightPanelSize.value - minMap)
  } else {
    rightPanelSize.value = clamp((rect.width - pointerX) / rect.width * 100, minRight, 100 - leftPanelSize.value - minMap)
  }

  refreshMapSize()
}

const stopPanelResize = () => {
  if (!resizingPanel.value) return
  resizingPanel.value = null
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('pointermove', updatePanelSize)
  window.removeEventListener('pointerup', stopPanelResize)
  refreshMapSize()
}

const startPanelResize = (panel: 'left' | 'right', event: PointerEvent) => {
  resizingPanel.value = panel
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  event.preventDefault()
  window.addEventListener('pointermove', updatePanelSize)
  window.addEventListener('pointerup', stopPanelResize)
}

// 监听真实地图开关
watch(useRealMap, async (newVal) => {
  if (newVal) {
    await nextTick()
    initRealMap()
  }
})

// 初始化真实地图
const initRealMap = async () => {
  const container = document.getElementById('amap-container')
  if (!container) {
    console.error('地图容器不存在')
    return
  }
  
  // 如果地图已存在，直接返回
  if (realMapInstance.value) return
  
  try {
    await loadAMapScript()

    // 创建地图实例 - 莆田市中心坐标
    const map = new window.AMap.Map('amap-container', {
      zoom: 11,
      center: [119.007556, 25.4540], // 莆田市政府附近
      mapStyle: 'amap://styles/normal',
      viewMode: '2D'
    })
    
    realMapInstance.value = map
    console.log('地图实例创建成功')
    
    // 地图加载完成后添加标记
    map.on('complete', () => {
      console.log('地图加载完成')
      updateRealMapMarkers()
    })
    
    // 监听错误事件
    map.on('error', (err) => {
      console.error('地图错误:', err)
      ElMessage.error('地图加载出错，已自动切换到示意图模式')
      useRealMap.value = false
    })
  } catch (error) {
    console.error('创建地图实例失败:', error)
    ElMessage.error('地图初始化失败，已自动切换到示意图模式')
    useRealMap.value = false
  }
}

// 更新真实地图标记（使用真实经纬度 + 小图标）
const updateRealMapMarkers = () => {
  if (!realMapInstance.value) return
  
  realMapInstance.value.clearMap()
  realMapMarkers.value = []
  const map = realMapInstance.value
  
  filteredMarkers.value.forEach(marker => {
    // 优先使用后端返回的真实经纬度
    let lng = marker.longitude != null ? Number(marker.longitude) : null
    let lat = marker.latitude != null ? Number(marker.latitude) : null
    if (lng == null || lat == null) {
      // 无真实坐标时用示意图坐标转换（兜底）
      lng = 119.0 + (marker.x / 1000) * 0.3
      lat = 25.4 + (marker.y / 700) * 0.15
    }
    
    const iconHtml = createSmallMarkerHtml(marker)
    const amapMarker = new window.AMap.Marker({
      position: [lng, lat],
      content: iconHtml,
      offset: new window.AMap.Pixel(-14, -28),
      title: marker.name
    })
    
    amapMarker.on('click', () => {
      showMarkerInfo(marker)
    })
    
    map.add(amapMarker)
    realMapMarkers.value.push(amapMarker)
  })
}

// 生成真实地图上的小图标 DOM 字符串（与示意图风格一致）
const createSmallMarkerHtml = (marker) => {
  const icon = marker.icon || (marker.type === 'food' ? '🍜' : marker.type === 'hotel' ? '🏨' : '🏞️')
  const typeClass = marker.type === 'attraction' ? 'attraction' : marker.type === 'food' ? 'food' : 'hotel'
  const activeClass = selectedLocatedMarkerKey.value === buildMarkerKey(marker) ? ' is-active' : ''
  const div = document.createElement('div')
  div.className = 'amap-small-marker ' + typeClass + activeClass
  div.innerHTML = `
    <div class="amap-small-marker-pin">
      <span class="amap-small-marker-icon">${icon}</span>
      <span class="amap-small-marker-dot"></span>
    </div>
  `
  return div
}

// 监听标记变化
watch(filteredMarkers, () => {
  if (useRealMap.value && realMapInstance.value) {
    updateRealMapMarkers()
  }
}, { deep: true })

watch(selectedLocatedMarkerKey, () => {
  if (useRealMap.value && realMapInstance.value) {
    updateRealMapMarkers()
  }
})

const clearMapSearch = () => {
  searchKeyword.value = ''
  selectedLocatedMarkerKey.value = ''
}

const focusFirstSearchResult = () => {
  const first = searchResults.value[0]
  if (first) {
    locateMarker(first, true)
  } else {
    ElMessage.warning('没有匹配资源')
  }
}

const resolveMarkerLngLat = (marker) => {
  let lng = marker.longitude != null ? Number(marker.longitude) : null
  let lat = marker.latitude != null ? Number(marker.latitude) : null
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    lng = 119.0 + (marker.x / 1000) * 0.3
    lat = 25.4 + (marker.y / 700) * 0.15
  }
  return [lng, lat]
}

const locateMarker = (marker, openDetail = false) => {
  if (!marker) return
  selectedLocatedMarkerKey.value = buildMarkerKey(marker)
  const [lng, lat] = resolveMarkerLngLat(marker)
  if (useRealMap.value && realMapInstance.value && Number.isFinite(lng) && Number.isFinite(lat)) {
    if (typeof realMapInstance.value.setZoomAndCenter === 'function') {
      realMapInstance.value.setZoomAndCenter(15, [lng, lat])
    } else {
      realMapInstance.value.setZoom?.(15)
      realMapInstance.value.setCenter?.([lng, lat])
    }
  }
  if (openDetail) {
    showMarkerInfo(marker)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(() => messages.value.length, () => {
  scrollToBottom()
})

// 监听消息内容变化（流式更新时）
watch(() => messages.value[messages.value.length - 1]?.content, () => {
  scrollToBottom()
}, { deep: true })

watch(messages, () => {
  if (!isRestoringSession.value) {
    saveCurrentSession()
  }
}, { deep: true })

const createSessionId = () => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const cloneMessages = (value) => JSON.parse(JSON.stringify(value || []))

const getSessionTitle = (sessionMessages) => {
  const firstUserMessage = sessionMessages.find(message => message.role === 'user' && message.content?.trim())
  if (!firstUserMessage) return '新会话'
  const text = firstUserMessage.content.trim().replace(/\s+/g, ' ')
  return text.length > 18 ? `${text.slice(0, 18)}...` : text
}

const normalizeSession = (session) => ({
  id: session?.id || createSessionId(),
  title: session?.title || getSessionTitle(session?.messages || createDefaultMessages()),
  messages: Array.isArray(session?.messages) && session.messages.length > 0
    ? session.messages
    : createDefaultMessages(),
  createdAt: session?.createdAt || Date.now(),
  updatedAt: session?.updatedAt || Date.now()
})

const persistSessions = () => {
  localStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(chatSessions.value))
  localStorage.setItem(ACTIVE_CHAT_SESSION_STORAGE_KEY, activeSessionId.value)
}

const createSessionRecord = (sessionMessages = createDefaultMessages()) => {
  const now = Date.now()
  return {
    id: createSessionId(),
    title: getSessionTitle(sessionMessages),
    messages: cloneMessages(sessionMessages),
    createdAt: now,
    updatedAt: now
  }
}

const loadChatSessions = () => {
  try {
    const savedSessions = JSON.parse(localStorage.getItem(CHAT_SESSION_STORAGE_KEY) || '[]')
    chatSessions.value = Array.isArray(savedSessions)
      ? savedSessions.map(normalizeSession).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_CHAT_SESSION_COUNT)
      : []
  } catch (error) {
    console.error('读取AI会话记录失败', error)
    chatSessions.value = []
  }

  if (chatSessions.value.length === 0) {
    chatSessions.value = [createSessionRecord()]
  }

  const savedActiveId = localStorage.getItem(ACTIVE_CHAT_SESSION_STORAGE_KEY)
  const activeSession = chatSessions.value.find(session => session.id === savedActiveId) || chatSessions.value[0]
  activeSessionId.value = activeSession.id
  selectedSessionId.value = activeSession.id
  isRestoringSession.value = true
  messages.value = cloneMessages(activeSession.messages)
  nextTick(() => {
    isRestoringSession.value = false
    scrollToBottom()
  })
  persistSessions()
}

const saveCurrentSession = () => {
  if (!activeSessionId.value) return
  const index = chatSessions.value.findIndex(session => session.id === activeSessionId.value)
  const now = Date.now()
  const nextSession = {
    ...(index >= 0 ? chatSessions.value[index] : createSessionRecord()),
    id: activeSessionId.value,
    title: getSessionTitle(messages.value),
    messages: cloneMessages(messages.value),
    updatedAt: now
  }

  if (index >= 0) {
    chatSessions.value.splice(index, 1, nextSession)
  } else {
    chatSessions.value.unshift(nextSession)
  }
  chatSessions.value = chatSessions.value
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CHAT_SESSION_COUNT)
  persistSessions()
}

const startNewSession = () => {
  if (loading.value) {
    ElMessage.warning('AI回复中，请稍后再新建会话')
    return
  }
  saveCurrentSession()
  const session = createSessionRecord()
  chatSessions.value.unshift(session)
  activeSessionId.value = session.id
  selectedSessionId.value = session.id
  isRestoringSession.value = true
  messages.value = cloneMessages(session.messages)
  inputMessage.value = ''
  nextTick(() => {
    isRestoringSession.value = false
    scrollToBottom()
  })
  persistSessions()
  ElMessage.success('已新建会话')
}

const switchSession = (sessionId) => {
  if (loading.value) {
    ElMessage.warning('AI回复中，请稍后再切换会话')
    selectedSessionId.value = activeSessionId.value
    return
  }
  saveCurrentSession()
  const session = chatSessions.value.find(item => item.id === sessionId)
  if (!session) {
    selectedSessionId.value = activeSessionId.value
    return
  }
  activeSessionId.value = session.id
  selectedSessionId.value = session.id
  isRestoringSession.value = true
  messages.value = cloneMessages(session.messages)
  inputMessage.value = ''
  nextTick(() => {
    isRestoringSession.value = false
    scrollToBottom()
  })
  persistSessions()
}

const deleteCurrentSession = async () => {
  if (loading.value) {
    ElMessage.warning('AI回复中，请稍后再删除会话')
    return
  }
  try {
    await ElMessageBox.confirm('确定删除当前会话记录吗？', '删除会话', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (error) {
    return
  }

  chatSessions.value = chatSessions.value.filter(session => session.id !== activeSessionId.value)
  if (chatSessions.value.length === 0) {
    chatSessions.value = [createSessionRecord()]
  }
  const nextSession = chatSessions.value[0]
  activeSessionId.value = nextSession.id
  selectedSessionId.value = nextSession.id
  isRestoringSession.value = true
  messages.value = cloneMessages(nextSession.messages)
  nextTick(() => {
    isRestoringSession.value = false
    scrollToBottom()
  })
  persistSessions()
  ElMessage.success('会话已删除')
}

const formatSessionTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 格式化价格
const formatPrice = (marker) => {
  if (marker.type === 'hotel') return `¥${marker.price}/晚`
  if (marker.type === 'food') return `¥${marker.price}/人`
  return marker.price === 0 ? '免费' : `¥${marker.price}`
}

// 地图加载失败处理
const handleMapError = () => {
  mapLoadError.value = true
}

// 拖拽开始
const handleDragStart = (marker, event) => {
  draggingId.value = marker.id
  draggingMarker.value = marker
  event.dataTransfer.effectAllowed = 'copy'
}

// 拖拽结束
const handleDragEnd = () => {
  draggingId.value = null
  draggingMarker.value = null
}

const normalizeDayIndex = (dayIndex = selectedDayIndex.value) => {
  if (!itinerary.value.length) return 0
  const index = Number(dayIndex)
  return Number.isInteger(index) && index >= 0 && index < itinerary.value.length
    ? index
    : itinerary.value.length - 1
}

const selectDay = (dayIndex) => {
  selectedDayIndex.value = normalizeDayIndex(dayIndex)
}

const normalizeResourceId = (value) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return null
  if (/^\d+$/.test(value)) return Number(value)
  const match = value.match(/^[a-zA-Z]+-(\d+)(?:-.+)?$/)
  return match ? Number(match[1]) : null
}

// 放置到行程
const handleDrop = (event, dayIndex = selectedDayIndex.value) => {
  event.preventDefault()
  if (draggingMarker.value) {
    addToItinerary(draggingMarker.value, dayIndex)
  }
}

// 添加到行程
const addToItinerary = (marker, dayIndex = selectedDayIndex.value) => {
  const targetDayIndex = normalizeDayIndex(dayIndex)
  const refId = normalizeResourceId(marker.id)
  const item = {
    id: `${marker.type || 'item'}-${marker.id || Date.now()}-${Date.now()}`,
    refId,
    type: marker.type,
    icon: marker.icon,
    name: marker.name,
    address: marker.address,
    price: marker.price,
    time: new Date(),
    coordinates: { x: marker.x, y: marker.y }
  }

  itinerary.value[targetDayIndex].items.push(item)
  selectedDayIndex.value = targetDayIndex

  ElMessage.success(`已添加 ${marker.name} 到第${targetDayIndex + 1}天`)
  updateRoute()
}

// 显示标记详情
const showMarkerInfo = (marker) => {
  selectedMarker.value = {
    ...marker,
    priceLabel: marker.type === 'hotel' ? `¥${marker.price}/晚` :
      marker.type === 'food' ? `¥${marker.price}/人` :
        marker.price === 0 ? '免费' : `¥${marker.price}`
  }
  showMarkerDialog.value = true
}

// 从弹窗添加到行程
const addMarkerToItinerary = () => {
  if (selectedMarker.value) {
    addToItinerary(selectedMarker.value)
    showMarkerDialog.value = false
  }
}

// 删除项目
const removeItem = (dayIndex, itemId) => {
  const day = itinerary.value[dayIndex]
  day.items = day.items.filter(item => item.id !== itemId)
  updateRoute()
}

// 添加一天
const addDay = () => {
  itinerary.value.push({
    day: itinerary.value.length + 1,
    items: []
  })
  selectedDayIndex.value = itinerary.value.length - 1
}

// 计算每天预算
const calculateDayBudget = (day) => {
  return day.items.reduce((sum, item) => sum + item.price, 0)
}

// 总预算
const totalBudget = computed(() => {
  return itinerary.value.reduce((sum, day) => sum + calculateDayBudget(day), 0)
})

// 更新路线
const updateRoute = () => {
  const lines = []
  itinerary.value.forEach(day => {
    for (let i = 0; i < day.items.length - 1; i++) {
      const from = day.items[i].coordinates
      const to = day.items[i + 1].coordinates
      lines.push({
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y
      })
    }
  })
  routeLines.value = lines
}

const toNumber = (value: any, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const convertLongitudeToX = (longitude: any) => {
  const lon = Number(longitude)
  if (!Number.isFinite(lon)) return 500
  return clamp(Math.round(((lon - 118.65) / (119.15 - 118.65)) * 600 + 250), 250, 850)
}

const convertLatitudeToY = (latitude: any) => {
  const lat = Number(latitude)
  if (!Number.isFinite(lat)) return 350
  return clamp(Math.round(((25.55 - lat) / (25.55 - 25.05)) * 340 + 180), 180, 520)
}

const getAttractionIcon = (name = '') => {
  if (name.includes('寺') || name.includes('庙')) return '🏛️'
  if (name.includes('岛')) return '🏝️'
  if (name.includes('湖') || name.includes('溪')) return '🌊'
  if (name.includes('山')) return '⛰️'
  if (name.includes('公园')) return '🌳'
  if (name.includes('博物馆')) return '🎭'
  return '🏞️'
}

const getFoodIcon = (name = '') => {
  if (name.includes('海鲜')) return '🦞'
  if (name.includes('面')) return '🍜'
  if (name.includes('米粉')) return '🥘'
  if (name.includes('素')) return '🥗'
  if (name.includes('肉')) return '🍖'
  if (name.includes('糕') || name.includes('团')) return '🍲'
  if (name.includes('扁食')) return '🥟'
  return '🍜'
}

const createMapMarker = (item: any, type: 'attraction' | 'food' | 'hotel') => {
  const name = item.name || item.title || ''
  const longitude = item.longitude
  const latitude = item.latitude
  return {
    id: item.id,
    type,
    icon: type === 'attraction' ? getAttractionIcon(name) : type === 'food' ? getFoodIcon(name) : '🏨',
    name,
    address: item.address || '',
    region: item.region || '',
    price: toNumber(type === 'attraction' ? item.ticketPrice : item.avgPrice ?? item.price, 0),
    rating: toNumber(item.rating, 4.5),
    description: item.description || '',
    latitude,
    longitude,
    x: convertLongitudeToX(longitude),
    y: convertLatitudeToY(latitude)
  }
}

// 加载地图数据
const loadMapData = async () => {
  try {
    const res: any = await request.get('/map/markers')
    if (res.code !== 200 || !res.data) {
      throw new Error(res.message || '加载地图数据失败')
    }

    const attractions = res.data.attractions || []
    const foods = res.data.foods || []
    const hotels = res.data.hotels || []

    markers.value = [...attractions, ...foods, ...hotels]
    visibleTypes.value = ['attraction', 'food', 'hotel']
    ElMessage.success(`已加载 ${attractions.length} 个景点、${foods.length} 个美食、${hotels.length} 个酒店`)
  } catch (error) {
    console.error('加载地图数据失败', error)
    // 优先使用后端返回的错误消息，其次使用 axios error message
    const errorMsg = error?.response?.data?.message || error?.message || '加载地图数据失败'
    ElMessage.error(errorMsg)
  }
}

const buildChatHistory = () => {
  return messages.value
    .filter(message => message.content.trim())
    .slice(-8)
    .map(message => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content
    }))
}

const appendMessage = (index: number, content: string) => {
  const target = messages.value[index]
  if (!target) return
  target.content += content
  scrollToBottom()
}

const consumeSseBuffer = (buffer: string, onMessage: (data: string) => void, flush = false) => {
  const normalized = buffer.replace(/\r\n/g, '\n')
  const events = normalized.split('\n\n')
  const rest = flush ? '' : events.pop() || ''

  for (const eventText of events) {
    const lines = eventText.split('\n')
    const eventName = lines
      .find(line => line.startsWith('event:'))
      ?.slice(6)
      .trim()
    const data = lines
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).replace(/^ /, ''))
      .join('\n')

    if (!data || data === '[DONE]' || eventName === 'done') {
      continue
    }
    if (eventName === 'error') {
      throw new Error(decodeSseData(data) || 'AI服务错误')
    }
    onMessage(decodeSseData(data))
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

// 发送消息给AI（SSE流式）
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const history = buildChatHistory()
  const question = inputMessage.value.trim()
  messages.value.push({
    role: 'user',
    content: question
  })

  inputMessage.value = ''
  loading.value = true
  const assistantIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: ''
  })
  scrollToBottom()

  try {
    console.log('发送给AI的问题:', question)

    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token') || ''
      },
      body: JSON.stringify({ question, history })
    })

    if (!response.ok || !response.body) {
      throw new Error('AI响应失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      buffer = consumeSseBuffer(buffer, data => {
        appendMessage(assistantIndex, data)
      })
    }

    buffer += decoder.decode()
    consumeSseBuffer(buffer, data => {
      appendMessage(assistantIndex, data)
    }, true)

  } catch (error) {
    console.error('AI服务错误', error)
    messages.value.splice(assistantIndex, 1)

    // 降级：使用简单的规则回复
    const attractionNames = markers.value.filter(m => m.type === 'attraction').slice(0, 3).map(m => m.name).join('、')
    const foodNames = markers.value.filter(m => m.type === 'food').slice(0, 2).map(m => m.name).join('、')
    const hotelNames = markers.value.filter(m => m.type === 'hotel').slice(0, 2).map(m => m.name).join('、')

    messages.value.push({
      role: 'assistant',
      content: `我已经了解您的需求。根据数据库中的信息，我为您推荐：\n\n【景点】${attractionNames}\n【美食】${foodNames}\n【住宿】${hotelNames}\n\n您可以在地图上拖拽这些标记到右侧行程中！`
    })
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据并初始化地图
onMounted(async () => {
  loadChatSessions()
  nextTick(() => {
    initRealMap()
  })
  await loadMapData()
})

onBeforeUnmount(() => {
  stopPanelResize()
  window.cancelAnimationFrame(resizeFrameId)
})

// 保存行程
const saveItinerary = async () => {
  // 检查是否登录
  const token = localStorage.getItem('auth-token')
  if (!token) {
    ElMessageBox.confirm('保存行程需要登录，是否前往登录？', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    }).catch(() => {
      // 用户取消
    })
    return
  }

  if (itinerary.value.every(day => day.items.length === 0)) {
    ElMessage.warning('请先添加行程内容')
    return
  }

  try {
    // 弹出对话框让用户输入行程标题
    const title = await ElMessageBox.prompt('请输入行程标题', '保存行程', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '标题不能为空',
      inputValue: '我的莆田之旅'
    })

    if (!title.value) {
      return
    }

    // 计算开始和结束日期
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getTime() + (itinerary.value.length - 1) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // 先创建行程
    const createRes: any = await request.post('/itinerary/create', {
      title: title.value,
      description: '通过AI智能规划生成',
      startDate: startDate,
      endDate: endDate,
      daysCount: itinerary.value.length,
      totalBudget: totalBudget.value,
      interests: '旅游,美食,文化'
    })

    if (createRes.code !== 200 || !createRes.data?.id) {
      throw new Error('创建行程失败')
    }

    const itineraryId = createRes.data.id

    // 构建保存数据
    const dayList = itinerary.value.map((day, index) => {
      const dayDate = new Date(today.getTime() + index * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
      
      return {
        dayNumber: day.day,
        date: dayDate,
        description: `第${day.day}天`,
        items: day.items.map((item, itemIndex) => ({
          type: item.type,
          refId: item.refId || normalizeResourceId(item.id),
          name: item.name,
          startTime: item.time ? new Date(item.time).toTimeString().split(' ')[0].substring(0, 5) : '09:00',
          duration: 120, // 默认2小时
          cost: item.price,
          notes: item.address || '',
          sortOrder: itemIndex + 1
        }))
      }
    })

    // 保存详细内容
    const saveRes: any = await request.post('/itinerary/save', {
      id: itineraryId,
      title: title.value,
      description: '通过AI智能规划生成',
      totalBudget: totalBudget.value,
      actualCost: totalBudget.value,
      dayList: dayList
    })

    if (saveRes.code === 200) {
      ElMessage.success('行程保存成功！')
      
      // 询问是否跳转到我的行程
      ElMessageBox.confirm('行程已保存，是否查看我的行程？', '提示', {
        confirmButtonText: '查看',
        cancelButtonText: '继续规划',
        type: 'success'
      }).then(() => {
        router.push('/itinerary/list')
      }).catch(() => {
        // 用户选择继续规划
      })
    } else {
      throw new Error(saveRes.message || '保存失败')
    }

  } catch (error) {
    if (error === 'cancel') {
      // 用户取消
      return
    }
    console.error('保存行程失败', error)
    ElMessage.error(error.message || '保存行程失败，请重试')
  }
}

const goToMyItinerary = () => router.push('/itinerary/list')
const goBack = () => router.back()
</script>

<style scoped lang="scss">
.ai-map-planner {
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 0;
  height: 64px;
  flex-shrink: 0;

  .header-inner {
    max-width: 1800px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;

    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(135deg, #1a5f4a 0%, #2d8b6f 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 10px;

      .header-icon {
        font-size: 26px;
        -webkit-text-fill-color: initial;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;

      .el-button {
        border-radius: 20px;
        padding: 10px 20px;
        font-weight: 500;

        &:first-child {
          background: linear-gradient(135deg, #1a5f4a 0%, #2d8b6f 100%);
          border: none;
        }
      }
    }
  }
}

.main-container {
  flex: 1;
  display: block;
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 92px);
  box-sizing: border-box;
  background: linear-gradient(135deg, #f0f5f3 0%, #e8f0ec 100%);

  .panels-container {
    width: 100%;
    height: 100%;
    display: grid;
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid rgba(26, 95, 74, 0.1);

    &.is-resizing {
      cursor: col-resize;
    }
  }

  .panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .left-panel {
    min-width: 0;
    border-right: 1px solid #e5e7eb;
  }

  .map-panel-wrapper {
    min-width: 0;
  }

  .right-panel {
    min-width: 0;
    border-left: 1px solid #e5e7eb;
  }

  .panel-resizer {
    position: relative;
    height: 100%;
    cursor: col-resize;
    background: #e5e7eb;
    touch-action: none;
    transition: background 0.2s ease;
    z-index: 2;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 28px;
      height: 100%;
      border-radius: 999px;
      background: transparent;
      transform: translate(-50%, -50%);
      transition: background 0.2s ease;
    }

    &:hover,
    &:active {
      background: #2d8b6f;

      &::before {
        background: rgba(45, 139, 111, 0.12);
      }
    }
  }
}

.left-panel-inner,
.right-panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: white;
  border-radius: 12px;
}

.left-panel-inner {
  border-radius: 12px 0 0 12px;
}

.right-panel-inner {
  border-radius: 0 12px 12px 0;
}

.right-panel {
  .panel-header {
    align-items: flex-start;
    flex-wrap: wrap;

    .day-actions {
      width: 100%;

      .el-select {
        flex: 1;
        min-width: 108px;
      }

      .el-button {
        flex-shrink: 0;
      }
    }
  }
}

.map-panel-wrapper {
  display: flex;
  flex-direction: column;
}

.left-panel,
.right-panel {
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.map-panel {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 900px) {
  .main-container {
    height: auto;
    overflow: auto;

    .panels-container {
      display: flex;
      flex-direction: column;
      overflow: visible;
    }

    .panel {
      min-height: 420px;
    }

    .panel-resizer {
      display: none;
    }

    .left-panel,
    .map-panel-wrapper,
    .right-panel {
      width: 100%;
      min-width: 0;
      border: 0;
    }
  }
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .day-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
}

.chat-session-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chat-session-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid #eef2f7;
  background: #fbfdff;

  .session-select {
    flex: 1;
    min-width: 0;
  }
}

.session-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: #94a3b8;
    flex-shrink: 0;
  }
}

// AI对话区
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }

  .message {
    margin-bottom: 12px;
    display: flex;

    .bubble {
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 90%;
      word-wrap: break-word;

      // Markdown样式
      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4) {
        margin: 12px 0 8px 0;
        font-weight: 600;
      }

      :deep(h1) {
        font-size: 18px;
      }

      :deep(h2) {
        font-size: 16px;
      }

      :deep(h3) {
        font-size: 15px;
      }

      :deep(h4) {
        font-size: 14px;
      }

      :deep(p) {
        margin: 8px 0;
        line-height: 1.6;
      }

      :deep(ul),
      :deep(ol) {
        margin: 8px 0;
        padding-left: 20px;
      }

      :deep(li) {
        margin: 4px 0;
        line-height: 1.5;
      }

      :deep(strong) {
        font-weight: 600;
        color: #1e293b;
      }

      :deep(em) {
        font-style: italic;
      }

      :deep(code) {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }

      :deep(pre) {
        background: rgba(0, 0, 0, 0.05);
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 8px 0;

        code {
          background: none;
          padding: 0;
        }
      }

      :deep(blockquote) {
        border-left: 3px solid #667eea;
        padding-left: 12px;
        margin: 8px 0;
        color: #64748b;
      }

      :deep(a) {
        color: #667eea;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &.user {
      justify-content: flex-end;

      .bubble {
        background: #667eea;
        color: white;

        :deep(strong) {
          color: white;
        }

        :deep(code) {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }

    &.assistant .bubble {
      background: #f3f4f6;
      color: #333;
    }
  }

  // 加载动画
  .loading-bubble {
    background: #f3f4f6 !important;
    padding: 16px 20px !important;
  }

  .typing-indicator {
    display: flex;
    gap: 6px;
    align-items: center;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
      animation: typing 1.4s infinite;

      &:nth-child(1) {
        animation-delay: 0s;
      }

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }

  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

// 地图区
.map-filters {
  display: flex;
  gap: 8px;
}

.map-search {
  padding: 10px 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;

  .search-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 24px;
    color: #64748b;
    font-size: 12px;
  }

  .search-results {
    display: grid;
    gap: 8px;
    max-height: 230px;
    overflow: auto;
    padding-top: 6px;
  }

  .search-result-item {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f8fafc;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;

    &:hover,
    &.active {
      border-color: #4f46e5;
      background: #eef2ff;
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.12);
    }

    .result-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: #ffffff;
      font-size: 16px;
    }

    .result-content {
      min-width: 0;
      display: grid;
      gap: 3px;

      strong,
      small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      strong {
        color: #111827;
        font-size: 13px;
      }

      small {
        color: #64748b;
        font-size: 12px;
      }
    }
  }

  .search-empty {
    padding: 12px;
    color: #94a3b8;
    text-align: center;
    font-size: 13px;
  }
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #e5e7eb;

  .map-background {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .real-amap-container {
    width: 100%;
    height: 100%;
    position: relative;

    :deep(.amap-small-marker) {
      cursor: grab;
      transform: translate(-50%, -100%);
      transition: transform 0.2s;
      &:hover {
        transform: translate(-50%, -110%) scale(1.15);
      }
      &.is-active {
        transform: translate(-50%, -118%) scale(1.22);
        z-index: 20;
        .amap-small-marker-icon {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.18), 0 8px 18px rgba(0, 0, 0, 0.25);
        }
      }
      &:active {
        cursor: grabbing;
      }
      .amap-small-marker-pin {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .amap-small-marker-icon {
        font-size: 14px;
        background: white;
        width: 22px;
        height: 22px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        border: 2px solid #fff;
      }
      .amap-small-marker-dot {
        width: 5px;
        height: 5px;
        background: rgba(102, 126, 234, 0.35);
        border-radius: 50%;
        position: absolute;
        bottom: -2px;
      }
      &.attraction .amap-small-marker-icon {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      }
      &.food .amap-small-marker-icon {
        background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
      }
      &.hotel .amap-small-marker-icon {
        background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
      }
    }
    
    .map-markers-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      
      .map-marker {
        position: absolute;
        pointer-events: auto;
        cursor: pointer;
        transform: translate(-50%, -100%);
        transition: transform 0.2s;
        
        &:hover {
          transform: translate(-50%, -110%) scale(1.1);
        }
        
        &.dragging {
          opacity: 0.5;
        }
      }
    }
  }

    .realistic-map {
      width: 100%;
      height: 100%;

      svg {
        display: block;
      }
    }
  }

  .map-marker {
    position: absolute;
    transform: translate(-50%, -100%);
    cursor: grab;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 5;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      transform: translate(-50%, -100%) scale(1.2);
      z-index: 100;

      .marker-pin {
        animation: bounce 0.6s ease;
      }
    }

    &.dragging {
      opacity: 0.6;
      transform: translate(-50%, -100%) scale(0.9);
    }

    .marker-pin {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;

      .marker-icon {
        font-size: 16px;
        background: white;
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        border: 2px solid #fff;
        position: relative;
        z-index: 2;

        &::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50% 50% 50% 0;
          padding: 2px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        // 图标本身需要反向旋转
        &>* {
          transform: rotate(45deg);
        }
      }

      .marker-dot {
        width: 6px;
        height: 6px;
        background: rgba(102, 126, 234, 0.3);
        border-radius: 50%;
        position: absolute;
        bottom: -3px;
        animation: pulse 2s ease-in-out infinite;
      }
    }

    .marker-tooltip {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%) translateY(-100%);
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      z-index: 1000;

      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
      }

      .tooltip-name {
        font-weight: 600;
        margin-bottom: 3px;
        font-size: 13px;
      }

      .tooltip-price {
        color: #fbbf24;
        font-size: 11px;
        margin-bottom: 2px;
      }

      .tooltip-rating {
        font-size: 10px;
        color: #fcd34d;
      }
    }

    // 不同类型的标记颜色
    &.attraction .marker-icon {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    }

    &.food .marker-icon {
      background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
    }

    &.hotel .marker-icon {
      background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
    }
  }

  .route-lines {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
  }


// 动画
@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }

  50% {
    transform: scale(2.5);
    opacity: 0;
  }
}

// Tooltip过渡动画
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-90%);
}

.map-legend {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(to right, #f9fafb, #f3f4f6, #f9fafb);
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '👆';
      font-size: 18px;
      animation: pointDown 1.5s ease-in-out infinite;
    }
  }
}

@keyframes pointDown {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(5px);
  }
}

// 行程区
.itinerary-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
}

.day-section {
  margin-bottom: 24px;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 2px;
  transition: border-color 0.2s ease, background 0.2s ease;

  &.active {
    border-color: #2d8b6f;
    background: rgba(45, 139, 111, 0.06);
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    cursor: pointer;

    h4 {
      margin: 0;
      color: white;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;

      &::before {
        content: '📅';
        font-size: 18px;
        flex-shrink: 0;
      }
    }

    .day-budget {
      color: #fef3c7;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      white-space: nowrap;

      &::before {
        content: '💰';
      }
    }
  }

  .day-items {
    min-height: 80px;
    background: #f8fafc;
    border-radius: 8px;
    padding: 8px;
  }

  .empty-day {
    padding: 40px 20px;
    text-align: center;
    color: #94a3b8;
    border: 3px dashed #cbd5e1;
    border-radius: 12px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;

    &::before {
      content: '🎯';
      display: block;
      font-size: 32px;
      margin-bottom: 8px;
    }

    &:hover {
      border-color: #667eea;
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      color: #667eea;
    }
  }
}

.itinerary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 80px;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: move;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
    transform: translateY(-2px);
    border-color: #667eea;
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.98);
  }

  .drag-handle {
    color: #cbd5e1;
    cursor: grab;
    font-size: 16px;
    transition: color 0.2s;

    &:hover {
      color: #667eea;
    }

    &:active {
      cursor: grabbing;
    }
  }

  .item-time {
    flex-shrink: 0;
  }

  .item-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    .item-icon {
      font-size: 24px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .item-info {
      flex: 1;
      min-width: 0;

      .item-name {
        font-weight: 600;
        color: #1e293b;
        font-size: 14px;
        margin-bottom: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-address {
        font-size: 11px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;

        &::before {
          content: '📍';
          font-size: 10px;
          flex-shrink: 0;
        }
      }
    }

    .item-price {
      color: #f59e0b;
      font-weight: 700;
      font-size: 14px;
      white-space: nowrap;
    }
  }

  .el-button {
    flex-shrink: 0;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.itinerary-summary {
  padding: 20px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  gap: 16px;
  background: linear-gradient(to bottom, white, #f9fafb);

  .summary-item {
    flex: 1;
    text-align: center;
    padding: 12px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    min-width: 0;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
    }

    span {
      display: block;
      color: #64748b;
      font-size: 13px;
      margin-bottom: 6px;
      font-weight: 500;
    }

    strong {
      font-size: 22px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }
  }
}

// 标记详情
.marker-detail {
  text-align: center;
  padding: 10px;

  .detail-icon {
    font-size: 72px;
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;
  }

  h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 22px;
    font-weight: 700;
  }

  p {
    margin: 12px 0;
    color: #64748b;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .description {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
  }

  .dialog-day-selector {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: #4b5563;
    font-weight: 600;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>
