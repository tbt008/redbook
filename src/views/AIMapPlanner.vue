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
      <div class="panels-container">
        <!-- 左侧：AI对话区 -->
        <div class="panel left-panel">
          <div class="left-panel-inner">
            <div class="panel-header">
              <h3>🤖 AI助手</h3>
            </div>
            <div class="chat-messages" ref="messagesRef">
              <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
                <div class="bubble" v-html="renderMarkdown(msg.content)"></div>
              </div>
              <!-- 加载动画 -->
              <div v-if="loading" class="message assistant">
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

      <!-- 右侧：行程编辑区 -->
      <div class="panel right-panel">
        <div class="right-panel-inner">
          <div class="panel-header">
            <h3>📅 我的行程</h3>
            <el-button size="small" @click="addDay">+ 添加一天</el-button>
          </div>

          <div class="itinerary-container" @dragover.prevent @drop="handleDrop">
            <div v-for="(day, dayIndex) in itinerary" :key="dayIndex" class="day-section">
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import request from '@/util/request'
import { marked } from 'marked'

const router = useRouter()

// 配置marked
marked.setOptions({
  breaks: true,  // 支持换行
  gfm: true      // 支持GitHub风格的markdown
})

// 渲染markdown
const renderMarkdown = (content: string) => {
  if (!content) return ''
  return marked(content)
}

// 地图标记数据（从API加载）
const markers = ref([])
const markersText = ref('') // 供AI使用的文本数据

// 筛选类型
const visibleTypes = ref(['attraction', 'food', 'hotel'])

// 默认使用真实地图
const useRealMap = ref(true)
const realMapInstance = ref<any>(null)
const realMapMarkers = ref<any[]>([])

// 过滤后的标记
const filteredMarkers = computed(() => {
  return markers.value.filter(m => visibleTypes.value.includes(m.type))
})

// 行程数据
const itinerary = ref([
  { day: 1, items: [] }
])

// 拖拽状态
const draggingId = ref(null)
const draggingMarker = ref(null)

// AI对话
const messages = ref([
  { role: 'assistant', content: '你好！我是小莆，你的AI旅游助手。告诉我你的需求，我来帮你规划行程！' }
])
const inputMessage = ref('')
const loading = ref(false)

// 标记详情
const showMarkerDialog = ref(false)
const selectedMarker = ref(null)
const hoveredMarkerId = ref(null)
const mapLoadError = ref(false)

// 消息容器引用
const messagesRef = ref<HTMLElement | null>(null)

// 路线连线
const routeLines = ref([])

// Splitter 面板尺寸变量（保留用于可能的未来需求）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const leftPanelSize = ref(20)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapPanelSize = ref(60)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rightPanelSize = ref(20)

// 监听真实地图开关
watch(useRealMap, async (newVal) => {
  if (newVal) {
    await nextTick()
    initRealMap()
  }
})

// 初始化真实地图
const initRealMap = () => {
  console.log('正在初始化地图, AMap对象:', !!window.AMap)
  
  if (!window.AMap) {
    console.error('AMap 对象不存在，API可能未加载成功')
    ElMessage.error('地图加载失败，已自动切换到示意图模式')
    useRealMap.value = false
    return
  }
  
  const container = document.getElementById('amap-container')
  if (!container) {
    console.error('地图容器不存在')
    return
  }
  
  // 如果地图已存在，直接返回
  if (realMapInstance.value) return
  
  try {
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
  const div = document.createElement('div')
  div.className = 'amap-small-marker ' + typeClass
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

// 放置到行程
const handleDrop = (event) => {
  event.preventDefault()
  if (draggingMarker.value) {
    addToItinerary(draggingMarker.value)
  }
}

// 添加到行程
const addToItinerary = (marker) => {
  const item = {
    id: Date.now(),
    type: marker.type,
    icon: marker.icon,
    name: marker.name,
    address: marker.address,
    price: marker.price,
    time: new Date(),
    coordinates: { x: marker.x, y: marker.y }
  }

  // 添加到最后一天
  itinerary.value[itinerary.value.length - 1].items.push(item)

  ElMessage.success(`已添加 ${marker.name} 到行程`)
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

// 加载地图数据
const loadMapData = async () => {
  try {
    const res: any = await request.get('/map/markers')
    if (res.code === 200 && res.data) {
      // 合并所有标记
      const allMarkers = [
        ...res.data.attractions,
        ...res.data.foods,
        ...res.data.hotels
      ]
      markers.value = allMarkers
      ElMessage.success(`已加载 ${allMarkers.length} 个地点`)
    }
  } catch (error) {
    console.error('加载地图数据失败', error)
    // 优先使用后端返回的错误消息，其次使用 axios error message
    const errorMsg = error?.response?.data?.message || error?.message || '加载地图数据失败'
    ElMessage.error(errorMsg)
  }
}

// 加载AI使用的文本数据
const loadMarkersText = async () => {
  try {
    const res: any = await request.get('/map/markers/text')
    if (res.code === 200 && res.data) {
      markersText.value = res.data
    }
  } catch (error) {
    console.error('加载文本数据失败', error)
    // 优先使用后端返回的错误消息
    const errorMsg = error?.response?.data?.message || error?.message || '加载文本数据失败'
    ElMessage.error(errorMsg)
  }
}

// 发送消息给AI（非流式）
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  messages.value.push({
    role: 'user',
    content: inputMessage.value
  })

  const question = inputMessage.value
  inputMessage.value = ''
  loading.value = true

  try {
    console.log('发送给AI的问题:', question)

    // 调用非流式API
    const res: any = await request.post('/ai/chat', {
      question: question
    })

    console.log('AI响应:', res)

    if (res.code === 200 && res.data) {
      messages.value.push({
        role: 'assistant',
        content: res.data
      })
    } else {
      throw new Error('AI响应失败')
    }

  } catch (error) {
    console.error('AI服务错误', error)

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
  await loadMapData()
  await loadMarkersText()
  nextTick(() => {
    initRealMap()
  })
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
          refId: item.id,
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
    display: flex;
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid rgba(26, 95, 74, 0.1);
  }

  .panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .left-panel {
    width: 20%;
    min-width: 200px;
    flex-shrink: 0;
    border-right: 1px solid #e5e7eb;
  }

  .map-panel-wrapper {
    flex: 1;
    min-width: 400px;
  }

  .right-panel {
    width: 20%;
    min-width: 250px;
    flex-shrink: 0;
    border-left: 1px solid #e5e7eb;
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

.left-panel,
.right-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.map-panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
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

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    h4 {
      margin: 0;
      color: white;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '📅';
        font-size: 18px;
      }
    }

    .day-budget {
      color: #fef3c7;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 4px;

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
  height: 80px;
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
        max-width: 5em;

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
  background: linear-gradient(to bottom, white, #f9fafb);

  .summary-item {
    text-align: center;
    padding: 12px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    min-width: 100px;
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
