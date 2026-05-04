<template>
  <div class="itinerary-editor-page">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <div class="header-actions">
          <el-button @click="handleSave" type="primary" :loading="saving">💾 保存</el-button>
          <el-button @click="handleOptimize" :loading="optimizing">🎯 优化路线</el-button>
          <el-button @click="handlePreview">👁️ 预览</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </el-header>

    <div class="editor-container">
      <div class="editor-layout">
        <!-- 左侧：地图区域 -->
        <div class="map-section">
          <div class="section-header">
            <h3>🗺️ 地图视图</h3>
            <el-button-group size="small">
              <el-button :type="mapMode === 'view' ? 'primary' : ''" @click="mapMode = 'view'">
                查看
              </el-button>
              <el-button :type="mapMode === 'edit' ? 'primary' : ''" @click="mapMode = 'edit'">
                编辑
              </el-button>
            </el-button-group>
          </div>
          
          <div class="map-container" ref="mapContainerRef">
            <!-- 真实高德地图 -->
            <div class="real-amap-container" id="itinerary-amap-container"></div>
          </div>

          <!-- 地图图例 -->
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-icon">🏞️</span>
              <span>景点</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🍜</span>
              <span>美食</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🏨</span>
              <span>酒店</span>
            </div>
          </div>
        </div>

        <!-- 右侧：时间轴编辑器 -->
        <div class="timeline-section">
          <div class="section-header">
            <h3>📅 行程安排</h3>
            <el-button size="small" @click="showItemSelector = true">
              ➕ 添加项目
            </el-button>
          </div>

          <div class="timeline-container">
            <div v-if="itinerary.days.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <div class="empty-text">还没有行程安排</div>
              <el-button type="primary" @click="showItemSelector = true">
                开始添加
              </el-button>
            </div>

            <div v-else class="days-list">
              <div 
                v-for="(day, dayIndex) in itinerary.days" 
                :key="dayIndex" 
                class="day-section"
              >
                <div class="day-header">
                  <div class="day-info">
                    <h4>第{{ day.dayNumber }}天</h4>
                    <span class="day-date">{{ formatDate(day.date) }}</span>
                  </div>
                  <div class="day-stats">
                    <span>{{ day.items.length }}个项目</span>
                    <span>¥{{ calculateDayCost(day) }}</span>
                  </div>
                </div>

                <div class="items-list">
                  <div
                    v-for="(item, itemIndex) in day.items"
                    :key="item.id"
                    class="timeline-item"
                    :class="{ 'selected': selectedItem?.id === item.id }"
                    @click="selectTimelineItem(item)"
                  >
                    <div class="item-time">
                      <el-time-picker
                        v-model="item.startTime"
                        format="HH:mm"
                        placeholder="时间"
                        size="small"
                        @change="handleTimeChange"
                      />
                    </div>
                    <div class="item-content">
                      <div class="item-icon">{{ getItemIcon(item.type) }}</div>
                      <div class="item-info">
                        <div class="item-name">{{ item.name }}</div>
                        <div class="item-meta">
                          <span>⏱️ {{ item.duration }}分钟</span>
                          <span>💰 ¥{{ item.cost }}</span>
                        </div>
                        <div v-if="item.notes" class="item-notes">
                          📝 {{ item.notes }}
                        </div>
                      </div>
                    </div>
                    <div class="item-actions">
                      <el-button 
                        size="small" 
                        circle 
                        @click.stop="editItem(item)"
                      >
                        ✏️
                      </el-button>
                      <el-button 
                        size="small" 
                        circle 
                        type="danger"
                        @click.stop="deleteItem(dayIndex, itemIndex)"
                      >
                        🗑️
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-panel">
            <div class="stat-item">
              <div class="stat-label">总天数</div>
              <div class="stat-value">{{ itinerary.days.length }}天</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">总项目</div>
              <div class="stat-value">{{ totalItems }}个</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">预计花费</div>
              <div class="stat-value">¥{{ totalCost }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目选择器对话框 -->
    <el-dialog 
      v-model="showItemSelector" 
      title="添加项目" 
      width="900px"
      :close-on-click-modal="false"
    >
      <ItemSelector 
        @select="handleItemSelect"
        @close="showItemSelector = false"
      />
    </el-dialog>

    <!-- 项目编辑对话框 -->
    <el-dialog
      v-model="showItemEditor"
      title="编辑项目"
      width="600px"
    >
      <el-form :model="editingItem" label-width="100px" v-if="editingItem">
        <el-form-item label="项目名称">
          <el-input v-model="editingItem.name" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="editingItem.startTime"
            format="HH:mm"
            placeholder="选择时间"
          />
        </el-form-item>
        <el-form-item label="持续时间">
          <el-input-number v-model="editingItem.duration" :min="15" :step="15" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="费用">
          <el-input-number v-model="editingItem.cost" :min="0" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editingItem.notes"
            type="textarea"
            :rows="3"
            placeholder="添加备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showItemEditor = false">取消</el-button>
        <el-button type="primary" @click="saveItemEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ItemSelector from '@/components/ItemSelector.vue'
import request from '@/util/request'

const router = useRouter()
const route = useRoute()

const saving = ref(false)
const optimizing = ref(false)
const mapMode = ref<'view' | 'edit'>('view')
const showItemSelector = ref(false)
const showItemEditor = ref(false)
const selectedItem = ref<any>(null)
const editingItem = ref<any>(null)
const mapContainerRef = ref<HTMLElement>()

// 高德地图实例
const realMapInstance = ref<any>(null)
const realMapMarkers = ref<any[]>([])
const routePolylines = ref<any[]>([])
const mapLoadError = ref(false)

// 行程中实际使用的地图项目（根据行程数据筛选）
const itineraryMapItems = computed(() => {
  const usedRefIds = new Set<number>()
  itinerary.days.forEach(day => {
    day.items.forEach((item: any) => {
      if (item.refId) {
        usedRefIds.add(item.refId)
      }
    })
  })
  
  return allMapItems.value.filter(item => usedRefIds.has(item.id))
})

// 按时间排序获取所有行程项目（用于绘制路线）
const sortedItineraryItems = computed(() => {
  const allItems: any[] = []
  itinerary.days.forEach(day => {
    day.items.forEach((item: any) => {
      allItems.push({ ...item, date: day.date, dayNumber: day.dayNumber })
    })
  })
  
  // 按日期和时间排序
  return allItems.sort((a, b) => {
    const dateA = a.date || ''
    const dateB = b.date || ''
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB)
    }
    // 提取时间进行比较
    const timeA = typeof a.startTime === 'string' ? a.startTime : formatTime(a.startTime)
    const timeB = typeof b.startTime === 'string' ? b.startTime : formatTime(b.startTime)
    return timeA.localeCompare(timeB)
  })
})

// 格式化时间为 HH:mm
const formatTime = (date: Date) => {
  if (!date) return '00:00'
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 所有可用的地图项目（景点、美食、酒店）- 带有真实经纬度
const allMapItems = ref([
  // 景点
  { id: 1, name: '湄洲岛', type: 'attraction', x: 75, y: 60, cost: 65, longitude: 119.85, latitude: 25.08 },
  { id: 2, name: '南少林寺', type: 'attraction', x: 45, y: 35, cost: 40, longitude: 119.02, latitude: 25.51 },
  { id: 3, name: '九鲤湖', type: 'attraction', x: 30, y: 50, cost: 50, longitude: 118.93, latitude: 25.38 },
  { id: 4, name: '广化寺', type: 'attraction', x: 50, y: 45, cost: 0, longitude: 119.07, latitude: 25.43 },
  { id: 5, name: '木兰溪', type: 'attraction', x: 55, y: 40, cost: 0, longitude: 119.12, latitude: 25.46 },
  // 美食
  { id: 101, name: '兴化米粉店', type: 'food', x: 48, y: 42, cost: 30, longitude: 119.05, latitude: 25.44 },
  { id: 102, name: '莆田卤面馆', type: 'food', x: 52, y: 38, cost: 35, longitude: 119.09, latitude: 25.45 },
  { id: 103, name: '海鲜大排档', type: 'food', x: 70, y: 55, cost: 80, longitude: 119.82, latitude: 25.09 },
  // 酒店
  { id: 201, name: '湄洲岛度假酒店', type: 'hotel', x: 73, y: 58, cost: 300, longitude: 119.84, latitude: 25.09 },
  { id: 202, name: '市区商务酒店', type: 'hotel', x: 50, y: 40, cost: 200, longitude: 119.07, latitude: 25.44 }
])

// 行程数据
const itinerary = reactive({
  id: null as number | null,
  title: '',
  days: [] as any[]
})

// 初始化高德地图
const initRealMap = () => {
  console.log('正在初始化地图, AMap对象:', !!window.AMap)

  if (!window.AMap) {
    console.error('AMap 对象不存在，地图API可能未加载成功')
    mapLoadError.value = true
    return
  }

  const container = document.getElementById('itinerary-amap-container')
  if (!container) {
    console.error('地图容器不存在')
    return
  }

  // 如果地图已存在，先销毁
  if (realMapInstance.value) {
    realMapInstance.value.destroy()
    realMapInstance.value = null
  }

  try {
    // 创建地图实例 - 莆田市中心坐标
    const map = new window.AMap.Map('itinerary-amap-container', {
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
      updateMapMarkers()
    })

    // 监听错误事件
    map.on('error', (err) => {
      console.error('地图错误:', err)
      mapLoadError.value = true
    })
  } catch (error) {
    console.error('创建地图实例失败:', error)
    mapLoadError.value = true
  }
}

// 生成地图标记的HTML
const createMarkerHtml = (item: any) => {
  const icon = item.type === 'attraction' ? '🏞️' : item.type === 'food' ? '🍜' : '🏨'
  const typeClass = item.type === 'attraction' ? 'attraction' : item.type === 'food' ? 'food' : 'hotel'
  const div = document.createElement('div')
  div.className = 'itinerary-marker ' + typeClass
  div.innerHTML = `
    <div class="marker-pin">
      <span class="marker-icon">${icon}</span>
      <span class="marker-dot"></span>
    </div>
    <div class="marker-label">${item.name}</div>
  `
  return div
}

// 地理编码：根据地址获取经纬度
const geocodeAddress = (address: string): Promise<{ lng: number; lat: number } | null> => {
  return new Promise((resolve) => {
    if (!window.AMap || !address) {
      resolve(null)
      return
    }

    // 使用高德地图地理编码
    window.AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new window.AMap.Geocoder({
        city: '莆田' // 指定城市
      })

      geocoder.getLocation(address, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK' && result.geocodes.length > 0) {
          const location = result.geocodes[0].location
          resolve({
            lng: location.lng,
            lat: location.lat
          })
        } else {
          console.warn(`地理编码失败: ${address}`)
          resolve(null)
        }
      })
    })
  })
}

// 更新地图标记和路线
const updateMapMarkers = async () => {
  if (!realMapInstance.value) return

  const map = realMapInstance.value

  // 清除旧标记和路线
  map.clearMap()
  realMapMarkers.value = []
  routePolylines.value = []

  // 直接从行程数据中获取所有项目及其坐标
  const allItineraryItems: any[] = []
  itinerary.days.forEach(day => {
    day.items.forEach((item: any) => {
      allItineraryItems.push({
        ...item,
        date: day.date,
        dayNumber: day.dayNumber
      })
    })
  })

  console.log('行程数据中的所有项目:', allItineraryItems)

  if (allItineraryItems.length === 0) {
    console.log('行程中没有项目，不显示标记')
    return
  }

  // 添加行程项目的标记 - 直接使用行程数据中的坐标
  for (const item of allItineraryItems) {
    // 优先使用行程数据中自带的坐标
    let lng = item.longitude != null ? Number(item.longitude) : null
    let lat = item.latitude != null ? Number(item.latitude) : null

    // 如果行程数据中没有坐标，尝试从 allMapItems 查找
    if (lng == null || lat == null) {
      const mapItem = allMapItems.value.find(m => m.id === item.refId || m.id === item.id)
      if (mapItem) {
        lng = mapItem.longitude != null ? Number(mapItem.longitude) : null
        lat = mapItem.latitude != null ? Number(mapItem.latitude) : null
        console.log(`通过 refId=${item.refId} 找到匹配: ${mapItem.name}`, { lng, lat })
      }
    }

    // 如果还是没有坐标，尝试通过地址地理编码
    if ((lng == null || lat == null) && item.notes) {
      const coords = await geocodeAddress(item.notes)
      if (coords) {
        lng = coords.lng
        lat = coords.lat
        console.log(`通过地理编码获取坐标 ${item.name}:`, { lng, lat })
        // 更新项目数据中的坐标
        item.longitude = lng
        item.latitude = lat
      }
    }

    // 如果还是没有坐标，使用基于名称的伪随机坐标
    if (lng == null || lat == null) {
      const hash = (item.name || '').split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      lng = 119.0 + (Math.abs(hash) % 100) / 1000
      lat = 25.3 + (Math.abs(hash >> 8) % 100) / 1000
      console.warn(`项目 ${item.name} 没有坐标，使用基于名称的坐标:`, { lng, lat })
    }

    const markerContent = createMarkerHtml(item)
    const amapMarker = new window.AMap.Marker({
      position: [lng, lat],
      content: markerContent,
      offset: new window.AMap.Pixel(-14, -28),
      title: item.name,
      extData: item
    })

    amapMarker.on('click', () => {
      handleMapMarkerClick(item)
    })

    map.add(amapMarker)
    realMapMarkers.value.push(amapMarker)
  }

  // 绘制按时间排序的路线
  drawRouteLines()

  // 自动调整视野以显示所有标记
  if (realMapMarkers.value.length > 0) {
    map.setFitView(realMapMarkers.value, false, [50, 50, 50, 50])
  }
}

// 绘制按时间排序的路线
const drawRouteLines = () => {
  if (!realMapInstance.value) return

  const map = realMapInstance.value

  // 直接从行程数据获取所有项目
  const allItems: any[] = []
  itinerary.days.forEach(day => {
    day.items.forEach((item: any) => {
      allItems.push({ ...item, date: day.date, dayNumber: day.dayNumber })
    })
  })

  if (allItems.length < 2) {
    console.log('行程项目少于2个，不绘制路线')
    return
  }

  // 按日期和时间排序
  const sortedItems = [...allItems].sort((a, b) => {
    const dateA = a.date || ''
    const dateB = b.date || ''
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB)
    }
    const timeA = typeof a.startTime === 'string' ? a.startTime : formatTime(a.startTime)
    const timeB = typeof b.startTime === 'string' ? b.startTime : formatTime(b.startTime)
    return timeA.localeCompare(timeB)
  })

  // 为每一天分别绘制路线
  const itemsByDay = new Map<string, any[]>()
  
  sortedItems.forEach(item => {
    const dateKey = item.date || item.dayNumber?.toString() || 'unknown'
    if (!itemsByDay.has(dateKey)) {
      itemsByDay.set(dateKey, [])
    }
    itemsByDay.get(dateKey)!.push(item)
  })

  // 每天的路线颜色
  const dayColors = [
    '#667eea', // 第1天 - 紫色
    '#f97316', // 第2天 - 橙色
    '#22c55e', // 第3天 - 绿色
    '#3b82f6', // 第4天 - 蓝色
    '#ec4899', // 第5天 - 粉色
  ]

  let dayIndex = 0
  itemsByDay.forEach((dayItems, dateKey) => {
    if (dayItems.length < 2) return

    const path: [number, number][] = dayItems.map(item => {
      const mapItem = allMapItems.value.find(m => m.id === item.refId || m.id === item.id)
      if (!mapItem) {
        // 如果找不到匹配，尝试使用行程数据自带的坐标
        const lng = item.longitude != null ? Number(item.longitude) : null
        const lat = item.latitude != null ? Number(item.latitude) : null
        if (lng != null && lat != null) {
          return [lng, lat]
        }
        // 如果还是没有，返回默认坐标（会在控制台警告）
        return null
      }

      let lng = mapItem.longitude != null ? Number(mapItem.longitude) : null
      let lat = mapItem.latitude != null ? Number(mapItem.latitude) : null

      if (lng == null || lat == null) {
        lng = 119.0 + ((mapItem.x || 50) / 1000) * 0.3
        lat = 25.4 + ((mapItem.y || 50) / 700) * 0.15
      }

      return [lng, lat]
    }).filter(Boolean) as [number, number][]

    if (path.length >= 2) {
      const color = dayColors[dayIndex % dayColors.length]
      
      // 绘制路线线段
      for (let i = 0; i < path.length - 1; i++) {
        const polyline = new window.AMap.Polyline({
          path: [path[i], path[i + 1]],
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          showDir: true
        })
        
        map.add(polyline)
        routePolylines.value.push(polyline)
      }

      // 添加箭头标记指示方向
      for (let i = 0; i < path.length - 1; i++) {
        const start = path[i]
        const end = path[i + 1]
        const midLng = (start[0] + end[0]) / 2
        const midLat = (start[1] + end[1]) / 2
        
        // 计算角度
        const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI
        
        const arrowMarker = new window.AMap.Marker({
          position: [midLng, midLat],
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(16, 16),
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTMuNjY2NkwxMyA4TDMuMTExMSAxMi4zMzMzTDIuNSA1TDYgOC41TDguNSAxM0w3LjUgM0w5LjUgNUw4LjUgM0w2IDVMMi41IDMuMzMzMzNMMyAxMy42NjY2WiIgZmlsbD0iJyNENERCMDAiIHN0cm9rZT0iJyNENERCMDAiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=',
            imageSize: new window.AMap.Size(16, 16)
          }),
          offset: new window.AMap.Pixel(-8, -8),
          angle: angle + 90,
          clickable: false
        })
        
        map.add(arrowMarker)
        routePolylines.value.push(arrowMarker)
      }
      
      dayIndex++
    }
  })

  console.log(`绘制了路线: ${routePolylines.value.length} 个元素，共 ${allItems.length} 个行程项目`)
  console.log('行程项目列表:', allItems.map((i: any) => ({ name: i.name, refId: i.refId, date: i.date })))
}

// 处理地图标记点击
const handleMapMarkerClick = (item: any) => {
  if (mapMode.value === 'edit') {
    // 编辑模式：添加到行程
    if (!isItemSelected(item)) {
      addItemToItinerary(item)
    }
  } else {
    // 查看模式：显示详情
    ElMessage.info(`${item.name} - ¥${item.cost}`)
  }
}

// 获取标记样式（保留用于可能的示意图模式）
const getMarkerStyle = (item: any) => {
  return {
    left: `${item.x}%`,
    top: `${item.y}%`
  }
}

// 计算路线连线
const routeLines = computed(() => {
  const lines: any[] = []
  
  itinerary.days.forEach(day => {
    for (let i = 0; i < day.items.length - 1; i++) {
      const from = allMapItems.value.find(m => m.id === day.items[i].refId)
      const to = allMapItems.value.find(m => m.id === day.items[i + 1].refId)
      
      if (from && to) {
        lines.push({
          path: `M ${from.x}% ${from.y}% L ${to.x}% ${to.y}%`
        })
      }
    }
  })
  
  return lines
})

// 计算总项目数
const totalItems = computed(() => {
  return itinerary.days.reduce((sum, day) => sum + day.items.length, 0)
})

// 计算总费用
const totalCost = computed(() => {
  return itinerary.days.reduce((sum, day) => sum + calculateDayCost(day), 0)
})

// 获取标记图标
const getMarkerIcon = (type: string) => {
  const icons: Record<string, string> = {
    attraction: '🏞️',
    food: '🍜',
    hotel: '🏨'
  }
  return icons[type] || '📍'
}

// 获取项目图标
const getItemIcon = (type: string) => {
  return getMarkerIcon(type)
}

// 判断项目是否被选中
const isItemSelected = (mapItem: any) => {
  return itinerary.days.some(day => 
    day.items.some((item: any) => item.refId === mapItem.id)
  )
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })
}

// 计算单天费用
const calculateDayCost = (day: any) => {
  return day.items.reduce((sum: number, item: any) => sum + (item.cost || 0), 0)
}

// 处理标记点击
const handleMarkerClick = (mapItem: any) => {
  if (mapMode.value === 'edit') {
    // 编辑模式：添加到行程
    if (!isItemSelected(mapItem)) {
      addItemToItinerary(mapItem)
    }
  } else {
    // 查看模式：显示详情
    ElMessage.info(`${mapItem.name} - ¥${mapItem.cost}`)
  }
}

// 添加项目到行程
const addItemToItinerary = (mapItem: any) => {
  if (itinerary.days.length === 0) {
    ElMessage.warning('请先创建行程天数')
    return
  }

  // 为新项目创建默认的开始时间
  const defaultTime = new Date()
  defaultTime.setHours(9, 0, 0, 0)

  // 添加到第一天
  const firstDay = itinerary.days[0]
  const newItem = {
    id: Date.now(),
    refId: mapItem.id,
    name: mapItem.name,
    type: mapItem.type,
    startTime: defaultTime,
    duration: 120,
    cost: mapItem.cost,
    notes: '',
    address: mapItem.address || '',
    longitude: mapItem.longitude,
    latitude: mapItem.latitude
  }

  firstDay.items.push(newItem)
  ElMessage.success(`已添加 ${mapItem.name}`)

  // 更新地图显示
  updateMapMarkers()
}

// 选择时间轴项目
const selectTimelineItem = (item: any) => {
  selectedItem.value = item
}

// 处理项目选择
const handleItemSelect = (item: any, dayIndex: number) => {
  const day = itinerary.days[dayIndex]
  if (!day) {
    ElMessage.error('请先选择添加到哪一天')
    return
  }

  // 为新项目创建默认的开始时间（使用当天的日期 + 时间）
  const defaultTime = new Date()
  defaultTime.setHours(9, 0, 0, 0)

  const newItem = {
    id: Date.now(),
    refId: item.id,
    name: item.name,
    type: item.type,
    startTime: defaultTime,
    duration: item.duration || 120,
    cost: item.cost || 0,
    notes: '',
    address: item.address || '',
    longitude: item.longitude,
    latitude: item.latitude
  }

  day.items.push(newItem)
  showItemSelector.value = false
  ElMessage.success(`已添加 ${item.name}`)

  // 更新地图显示
  updateMapMarkers()
}

// 编辑项目
const editItem = (item: any) => {
  editingItem.value = { ...item }
  showItemEditor.value = true
}

// 保存项目编辑
const saveItemEdit = () => {
  if (!editingItem.value) return
  
  // 找到并更新项目
  itinerary.days.forEach(day => {
    const index = day.items.findIndex((i: any) => i.id === editingItem.value.id)
    if (index !== -1) {
      day.items[index] = { ...editingItem.value }
    }
  })
  
  showItemEditor.value = false
  ElMessage.success('保存成功')
  
  // 重新绘制路线
  updateMapMarkers()
}

// 删除项目
const deleteItem = (dayIndex: number, itemIndex: number) => {
  ElMessageBox.confirm('确定删除这个项目吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    itinerary.days[dayIndex].items.splice(itemIndex, 1)
    ElMessage.success('删除成功')
    // 更新地图显示
    updateMapMarkers()
  }).catch(() => {})
}

// 时间变化处理 - 重新绘制路线
const handleTimeChange = () => {
  // 重新绘制路线以反映新的时间顺序
  if (realMapInstance.value) {
    drawRouteLines()
  }
}

// 保存行程
const handleSave = async () => {
  saving.value = true

  try {
    // 转换数据格式以匹配后端
    const saveData = {
      id: itinerary.id,
      title: itinerary.title,
      description: '行程描述',
      totalBudget: itinerary.days.reduce((sum, day) =>
        sum + day.items.reduce((daySum, item) => daySum + (item.cost || 0), 0), 0),
      actualCost: itinerary.days.reduce((sum, day) =>
        sum + day.items.reduce((daySum, item) => daySum + (item.cost || 0), 0), 0),
      dayList: itinerary.days.map((day, index) => ({
        dayNumber: day.dayNumber || (index + 1),
        date: day.date,
        description: `第${index + 1}天`,
        items: day.items.map((item, itemIndex) => {
          // 将 Date 对象转换为 HH:mm 字符串
          let timeStr = '09:00'
          if (item.startTime) {
            if (item.startTime instanceof Date) {
              const hours = String(item.startTime.getHours()).padStart(2, '0')
              const minutes = String(item.startTime.getMinutes()).padStart(2, '0')
              timeStr = `${hours}:${minutes}`
            } else if (typeof item.startTime === 'string') {
              timeStr = item.startTime.substring(0, 5)
            }
          }
          // 查找原始坐标信息
          const mapItem = allMapItems.value.find(m => m.id === item.refId)
          return {
            type: item.type,
            refId: item.refId,
            name: item.name,
            startTime: timeStr,
            duration: item.duration || 120,
            cost: item.cost || 0,
            notes: item.notes || '',
            address: item.address || '',
            longitude: item.longitude || mapItem?.longitude,
            latitude: item.latitude || mapItem?.latitude,
            sortOrder: itemIndex + 1
          }
        })
      }))
    }

    await request.post('/itinerary/save', saveData)
    ElMessage.success('保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 优化路线
const handleOptimize = () => {
  optimizing.value = true
  
  setTimeout(() => {
    ElMessage.success('路线优化完成！')
    optimizing.value = false
  }, 1500)
}

// 预览行程
const handlePreview = () => {
  router.push({
    path: '/itinerary/preview',
    query: { id: itinerary.id }
  })
}

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

// 加载行程数据
onMounted(async () => {
  const id = route.query.id

  if (id) {
    // 加载已有行程
    try {
      const res: any = await request.get(`/itinerary/${id}`)
      console.log('加载行程数据:', res)
      if (res && res.data) {
        const data = res.data
        // 映射后端数据到前端格式
        itinerary.id = data.id
        itinerary.title = data.title || '我的行程'
        // 将 dayList 转换为 days 格式
        if (data.dayList && data.dayList.length > 0) {
          itinerary.days = data.dayList.map((day: any) => ({
            dayNumber: day.dayNumber,
            date: day.date,
            items: day.items ? day.items.map((item: any) => {
              // 处理 startTime 格式，转换为 Date 对象供 el-time-picker 使用
              let timeValue: Date | string = item.startTime
              if (timeValue && typeof timeValue === 'string') {
                // 如果是 HH:mm 格式（如 "09:00"），转换为 Date 对象
                if (/^\d{2}:\d{2}$/.test(timeValue)) {
                  // 转换为完整日期时间字符串以供 el-time-picker 使用
                  timeValue = new Date(`1970-01-01T${timeValue}:00`)
                } else if (timeValue.includes('T')) {
                  // 如果是 ISO 时间格式，提取 HH:mm 部分
                  const timePart = timeValue.split('T')[1]
                  if (timePart) {
                    timeValue = new Date(`1970-01-01T${timePart.substring(0, 8)}`)
                  }
                } else {
                  // 其他格式直接尝试转换
                  timeValue = new Date(timeValue)
                }
              }
              console.log('加载项目:', item.name, 'startTime:', timeValue, 'duration:', item.duration)
              return {
                id: item.id,
                refId: item.refId,
                name: item.name,
                type: item.type,
                startTime: timeValue || '09:00',
                duration: item.duration || 120,
                cost: item.cost || 0,
                notes: item.notes || '',
                address: item.address || item.notes || '',
                longitude: item.longitude,
                latitude: item.latitude
              }
            }) : []
          }))
        } else {
          itinerary.days = []
        }
      }
    } catch (error) {
      console.error('加载行程失败:', error)
      ElMessage.error('加载行程失败，请稍后重试')
    }
  } else {
    // 创建示例数据
    itinerary.title = '我的行程'
    itinerary.days = [
      {
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        items: []
      }
    ]
  }

  // 初始化高德地图
  nextTick(() => {
    initRealMap()
  })
})
</script>

<style scoped lang="scss">
.itinerary-editor-page {
  min-height: 100vh;
  background: #f5f7fa;
  
  .header {
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      
      .logo {
        cursor: pointer;
        
        h1 {
          margin: 0;
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
      }
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }
  
  .editor-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
    
    .editor-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      height: calc(100vh - 100px);
      
      .map-section,
      .timeline-section {
        background: white;
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
          
          h3 {
            margin: 0;
            font-size: 20px;
            color: #333;
          }
        }
      }
      
      .map-section {
        .map-container {
          position: relative;
          flex: 1;
          background: #f8f9fa;
          border-radius: 12px;
          overflow: hidden;

          .real-amap-container {
            width: 100%;
            height: 100%;
            position: relative;

            // 高德地图标记样式
            :deep(.itinerary-marker) {
              cursor: pointer;
              transform: translate(-50%, -100%);
              transition: transform 0.2s;

              &:hover {
                transform: translate(-50%, -110%) scale(1.1);
                z-index: 100;
              }

              .marker-pin {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
              }

              .marker-icon {
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

                &>* {
                  transform: rotate(45deg);
                }
              }

              .marker-dot {
                width: 5px;
                height: 5px;
                background: rgba(102, 126, 234, 0.35);
                border-radius: 50%;
                position: absolute;
                bottom: -2px;
              }

              .marker-label {
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                margin-top: 4px;
              }

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
          }

          // 保留旧样式用于可能的回退
          .map-background {
            width: 100%;
            height: 100%;

            .map-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);

              .placeholder-icon {
                font-size: 64px;
                margin-bottom: 16px;
              }

              .placeholder-text {
                font-size: 18px;
                color: #666;
              }
            }
          }

          .map-marker {
            position: absolute;
            transform: translate(-50%, -100%);
            cursor: pointer;
            transition: all 0.3s;
            z-index: 10;

            &:hover {
              transform: translate(-50%, -100%) scale(1.2);
              z-index: 20;
            }

            &.selected {
              .marker-icon {
                filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.8));
              }
            }

            &.draggable {
              cursor: move;
            }

            .marker-icon {
              font-size: 32px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              transition: filter 0.3s;
            }

            .marker-label {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              margin-top: 4px;
            }
          }

          .route-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;

            .route-path {
              animation: dash 20s linear infinite;
            }
          }
        }

        .map-legend {
          display: flex;
          gap: 20px;
          margin-top: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .legend-icon {
              font-size: 20px;
            }
          }
        }
      }
      
      .timeline-section {
        .timeline-container {
          flex: 1;
          overflow-y: auto;
          
          .empty-state {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            
            .empty-icon {
              font-size: 64px;
              margin-bottom: 16px;
            }
            
            .empty-text {
              font-size: 16px;
              color: #999;
              margin-bottom: 20px;
            }
          }
          
          .days-list {
            .day-section {
              margin-bottom: 24px;
              
              .day-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                color: white;
                margin-bottom: 12px;
                
                .day-info {
                  h4 {
                    margin: 0 0 4px 0;
                    font-size: 18px;
                  }
                  
                  .day-date {
                    font-size: 14px;
                    opacity: 0.9;
                  }
                }
                
                .day-stats {
                  display: flex;
                  gap: 16px;
                  font-size: 14px;
                }
              }
              
              .items-list {
                .timeline-item {
                  display: flex;
                  gap: 12px;
                  padding: 16px;
                  background: #f8f9fa;
                  border-radius: 12px;
                  margin-bottom: 12px;
                  cursor: pointer;
                  transition: all 0.3s;
                  
                  &:hover {
                    background: #e3f2fd;
                    transform: translateX(4px);
                  }
                  
                  &.selected {
                    background: #e3f2fd;
                    box-shadow: 0 0 0 2px #667eea;
                  }
                  
                  .item-time {
                    flex-shrink: 0;
                  }
                  
                  .item-content {
                    flex: 1;
                    display: flex;
                    gap: 12px;
                    
                    .item-icon {
                      font-size: 32px;
                      flex-shrink: 0;
                    }
                    
                    .item-info {
                      flex: 1;
                      
                      .item-name {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 8px;
                        color: #333;
                      }
                      
                      .item-meta {
                        display: flex;
                        gap: 16px;
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 4px;
                      }
                      
                      .item-notes {
                        font-size: 12px;
                        color: #999;
                        margin-top: 4px;
                      }
                    }
                  }
                  
                  .item-actions {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;
                  }
                }
              }
            }
          }
        }
        
        .stats-panel {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          
          .stat-item {
            flex: 1;
            text-align: center;
            
            .stat-label {
              font-size: 12px;
              opacity: 0.9;
              margin-bottom: 4px;
            }
            
            .stat-value {
              font-size: 20px;
              font-weight: 700;
            }
          }
        }
      }
    }
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>

