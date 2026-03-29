<template>
  <div class="attraction-management">
    <!-- 顶部区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="title-text">
            <h1 class="page-title">景点管理</h1>
            <p class="page-subtitle">Manage Tourist Attractions</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="add-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增景点
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-box">
        <div class="search-input-wrapper">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="searchForm.keyword"
            type="text"
            placeholder="搜索景点名称..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <span class="search-shortcut">Enter 搜索</span>
        </div>
        <div class="filter-group">
          <el-select
            v-model="searchForm.region"
            placeholder="全部地区"
            clearable
            class="filter-select"
          >
            <template #prefix>
              <el-icon><Location /></el-icon>
            </template>
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            class="filter-select"
          >
            <template #prefix>
              <el-icon><SwitchButton /></el-icon>
            </template>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
          <el-button class="reset-btn" @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Collection /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pagination.total }}</div>
          <div class="stat-label">景点总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon online">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ onlineCount }}</div>
          <div class="stat-label">在售景点</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon views">
          <el-icon><View /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalViews }}</div>
          <div class="stat-label">总浏览量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon comments">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalComments }}</div>
          <div class="stat-label">总评论数</div>
        </div>
      </div>
    </div>

    <!-- 景点列表 -->
    <div class="content-section">
      <div class="table-header">
        <h3 class="section-title">
          <span class="title-bar"></span>
          景点列表
        </h3>
        <div class="table-actions">
          <span class="data-info">共 {{ pagination.total }} 条记录</span>
        </div>
      </div>

      <el-table
        :data="attractionList"
        v-loading="loading"
        class="attraction-table"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="编号" width="80">
          <template #default="{ row, $index }">
            <span class="row-index">{{ $index + 1 + (pagination.pageNum - 1) * pagination.pageSize }}</span>
          </template>
        </el-table-column>

        <el-table-column label="景点信息" min-width="320">
          <template #default="{ row }">
            <div class="attraction-info">
              <div class="image-wrapper">
                <el-image
                  :src="row.images ? JSON.parse(row.images)[0] : ''"
                  :preview-src-list="row.images ? JSON.parse(row.images) : []"
                  fit="cover"
                  class="attraction-image"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="image-badge" v-if="row.status === 1">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
              <div class="attraction-detail">
                <div class="name">{{ row.name }}</div>
                <div class="location">
                  <el-icon><Location /></el-icon>
                  <span>{{ row.region }}</span>
                  <span class="divider">|</span>
                  <span>{{ row.address }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ticketPrice" label="门票价格" width="120" align="center">
          <template #default="{ row }">
            <div class="price-wrapper">
              <span class="currency">¥</span>
              <span class="price">{{ row.ticketPrice }}</span>
              <span class="unit">/人</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="rating" label="评分" width="100" align="center">
          <template #default="{ row }">
            <div class="rating-wrapper">
              <el-rate
                v-model="row.rating"
                disabled
                :max="5"
                :colors="['#FFD700', '#FFD700', '#FFD700']"
                :show-score="true"
                score-template="{value}"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="数据统计" width="160" align="center">
          <template #default="{ row }">
            <div class="stats-wrapper">
              <div class="stat-item">
                <el-icon><View /></el-icon>
                <span>{{ row.viewCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ row.commentCount || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <div :class="['status-badge', row.status === 1 ? 'online' : 'offline']">
              <span class="status-dot"></span>
              {{ row.status === 1 ? '已上架' : '已下架' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="170" />

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="编辑" placement="top">
                <button class="action-btn edit" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip :content="row.status === 1 ? '下架' : '上架'" placement="top">
                <button
                  :class="['action-btn', row.status === 1 ? 'down' : 'up']"
                  @click="handleStatusChange(row, row.status === 1 ? 0 : 1)"
                >
                  <el-icon><SwitchButton /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <button class="action-btn delete" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :pager-count="5"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadAttractionList"
          @current-change="loadAttractionList"
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="750px"
      destroy-on-close
      :show-close="true"
      class="attraction-dialog"
    >
      <div class="dialog-content">
        <el-form :model="attractionForm" :rules="formRules" ref="formRef" label-position="top">
          <div class="form-header">
            <h3>{{ isEdit ? '编辑景点信息' : '新增景点' }}</h3>
            <p>{{ isEdit ? '修改景点详细信息' : '填写景点基本信息' }}</p>
          </div>

          <div class="form-grid">
            <el-form-item label="景点名称" prop="name" class="form-item">
              <el-input
                v-model="attractionForm.name"
                placeholder="请输入景点名称"
                maxlength="50"
                show-word-limit
              >
                <template #prefix>
                  <el-icon><EditPen /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="所在地区" prop="region" class="form-item">
              <el-select v-model="attractionForm.region" placeholder="请选择地区" style="width: 100%">
                <template #prefix>
                  <el-icon><Location /></el-icon>
                </template>
                <el-option label="荔城区" value="荔城区" />
                <el-option label="城厢区" value="城厢区" />
                <el-option label="涵江区" value="涵江区" />
                <el-option label="秀屿区" value="秀屿区" />
                <el-option label="湄洲岛" value="湄洲岛" />
              </el-select>
            </el-form-item>

            <el-form-item label="详细地址" prop="address" class="form-item full-width">
              <el-input v-model="attractionForm.address" placeholder="请输入详细地址">
                <template #prefix>
                  <el-icon><Place /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="门票价格" prop="ticketPrice" class="form-item">
              <el-input-number
                v-model="attractionForm.ticketPrice"
                :min="0"
                :precision="2"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="开放时间" prop="openTime" class="form-item">
              <el-input v-model="attractionForm.openTime" placeholder="如：08:00-18:00">
                <template #prefix>
                  <el-icon><Clock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="联系电话" prop="contactPhone" class="form-item">
              <el-input v-model="attractionForm.contactPhone" placeholder="请输入联系电话">
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="经纬度定位" class="form-item full-width">
              <div class="location-picker">
                <div class="location-inputs">
                  <el-input v-model.number="attractionForm.longitude" placeholder="经度" readonly style="width: 140px">
                    <template #prefix>经度</template>
                  </el-input>
                  <el-input v-model.number="attractionForm.latitude" placeholder="纬度" readonly style="width: 140px">
                    <template #prefix>纬度</template>
                  </el-input>
                  <el-button type="primary" @click="toggleMapPicker" :icon="showMapPicker ? 'Close' : 'MapLocation'">
                    {{ showMapPicker ? '关闭地图' : '点击地图选点' }}
                  </el-button>
                </div>
                <div v-if="showMapPicker" class="map-picker-container">
                  <div id="attraction-map-picker" class="map-container" v-show="!mapLoadFailed"></div>
                  <div v-if="mapLoadFailed" class="map-error">
                    <el-icon class="error-icon"><Warning /></el-icon>
                    <p>地图加载失败</p>
                    <p class="error-tip">请检查网络连接后，点击"关闭地图"再重新打开</p>
                    <el-button size="small" type="primary" @click="toggleMapPicker">重试</el-button>
                  </div>
                  <div class="map-tips" v-if="!mapLoadFailed">
                    <el-icon><InfoFilled /></el-icon>
                    <span>点击地图选择景点位置，系统将自动获取经纬度</span>
                  </div>
                </div>
              </div>
            </el-form-item>
          </div>

          <el-form-item label="景点描述" prop="description" class="form-item full-width">
            <el-input
              v-model="attractionForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入景点描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="景点图片" class="form-item full-width">
            <div class="image-upload-area">
              <div class="upload-tips">
                <el-icon><Picture /></el-icon>
                <span>支持 jpg、png 格式，建议尺寸 1200x800</span>
              </div>
              <div class="image-grid" v-if="parsedImages.length > 0">
                <div v-for="(img, index) in parsedImages" :key="index" class="uploaded-image">
                  <el-image :src="img" fit="cover" />
                  <div class="image-overlay">
                    <button class="preview-btn" @click="previewImage(index)">
                      <el-icon><ZoomIn /></el-icon>
                    </button>
                    <button class="delete-btn" @click="removeImage(index)">
                      <el-icon><Delete /></el-icon>
                    </button>
                  </div>
                </div>
              </div>
              <div class="upload-button" @click="triggerImageUpload">
                <el-icon><Plus /></el-icon>
                <span>点击上传图片</span>
              </div>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                multiple
                style="display: none"
                @change="handleImageChange"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting" class="submit-btn">
            {{ isEdit ? '保存修改' : '立即添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Location,
  Plus,
  Search,
  SwitchButton,
  RefreshRight,
  Collection,
  CircleCheck,
  View,
  ChatDotRound,
  Picture,
  Check,
  Edit,
  Delete,
  EditPen,
  Place,
  Clock,
  Phone,
  ZoomIn,
  MapLocation,
  InfoFilled,
  Warning
} from '@element-plus/icons-vue'
import request from '@/util/request'

const loading = ref(false)
const submitting = ref(false)
const attractionList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('编辑景点')
const formRef = ref()
const fileInput = ref<HTMLInputElement>()

const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  region: '',
  status: null as number | null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const attractionForm = reactive({
  id: null as number | null,
  name: '',
  region: '',
  address: '',
  ticketPrice: 0,
  openTime: '',
  contactPhone: '',
  description: '',
  images: '[]',
  longitude: null as number | null,
  latitude: null as number | null
})

const formRules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  ticketPrice: [{ required: true, message: '请输入门票价格', trigger: 'blur' }]
}

const parsedImages = computed(() => {
  try {
    return JSON.parse(attractionForm.images || '[]')
  } catch {
    return []
  }
})

// 地图选点相关
const showMapPicker = ref(false)
let mapPickerInstance: any = null
let mapPickerMarker: any = null
let mapLoadFailed = ref(false)

// 动态加载高德地图API
const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果已经加载，直接成功
    if (window.AMap) {
      resolve()
      return
    }

    // 如果正在加载，等待完成
    if ((window as any)._amapLoading) {
      const checkInterval = setInterval(() => {
        if (window.AMap) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    ;(window as any)._amapLoading = true

    // 设置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: '1b5870e9227ca6f29ae1d37bee644626'
    }

    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=a7b3327e03aded1d1c991632d50f0d51&plugin=AMap.Tooltip'
    script.async = false
    script.onload = () => {
      ;(window as any)._amapLoading = false
      if (window.AMap) {
        resolve()
      } else {
        reject(new Error('AMap API loaded but window.AMap not available'))
      }
    }
    script.onerror = () => {
      ;(window as any)._amapLoading = false
      reject(new Error('Failed to load AMap script'))
    }
    document.head.appendChild(script)
  })
}

// 等待元素可见并有尺寸
const waitForContainerVisible = (element: HTMLElement, maxAttempts = 20): Promise<void> => {
  return new Promise((resolve) => {
    const check = (attempt: number) => {
      if (attempt >= maxAttempts) {
        resolve()
        return
      }
      const rect = element.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        resolve()
      } else {
        setTimeout(() => check(attempt + 1), 50)
      }
    }
    check(0)
  })
}

// 重置地图选点状态
const resetMapPicker = () => {
  showMapPicker.value = false
  mapLoadFailed.value = false
  if (mapPickerInstance) {
    mapPickerInstance.destroy()
    mapPickerInstance = null
  }
  mapPickerMarker = null
}

const toggleMapPicker = async () => {
  if (showMapPicker.value) {
    resetMapPicker()
    return
  }

  showMapPicker.value = true
  mapLoadFailed.value = false

  await nextTick()

  // 等待元素可见（dialog动画可能需要时间）
  await new Promise(resolve => setTimeout(resolve, 150))

  const container = document.getElementById('attraction-map-picker')
  if (container) {
    await waitForContainerVisible(container)
  }

  initMapPicker()
}

const initMapPicker = () => {
  mapLoadFailed.value = false
  const container = document.getElementById('attraction-map-picker')
  if (!container) {
    console.error('地图容器不存在')
    return
  }

  // 等待容器有尺寸
  const rect = container.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    console.warn('地图容器尺寸为0，延迟初始化')
    waitForContainerVisible(container).then(() => {
      if (showMapPicker.value) {
        initMapPickerInternal()
      }
    })
    return
  }

  initMapPickerInternal()
}

const initMapPickerInternal = () => {
  const container = document.getElementById('attraction-map-picker')
  if (!container) return

  // 如果地图已初始化，清除并重建
  if (mapPickerInstance) {
    mapPickerInstance.destroy()
    mapPickerInstance = null
    mapPickerMarker = null
    container.innerHTML = ''
  }

  if (!window.AMap) {
    console.error('高德地图API未加载')
    mapLoadFailed.value = true
    return
  }

  try {
    // 莆田市的中心坐标
    const defaultCenter = [119.007718, 25.454] as [number, number]
    const center = attractionForm.longitude && attractionForm.latitude
      ? [attractionForm.longitude, attractionForm.latitude] as [number, number]
      : defaultCenter

    mapPickerInstance = new window.AMap.Map('attraction-map-picker', {
      zoom: 13,
      center: center,
      mapStyle: 'amap://styles/normal'
    })

    // 如果已有坐标，添加标记
    if (attractionForm.longitude && attractionForm.latitude) {
      addMarkerToPicker(attractionForm.longitude, attractionForm.latitude)
    }

    // 点击地图选点
    mapPickerInstance.on('click', (e: any) => {
      const lng = e.lnglat.getLng()
      const lat = e.lnglat.getLat()
      attractionForm.longitude = lng
      attractionForm.latitude = lat
      addMarkerToPicker(lng, lat)
    })

    // 监听地图错误
    mapPickerInstance.on('error', () => {
      mapLoadFailed.value = true
    })
  } catch (err) {
    console.error('初始化地图失败:', err)
    mapLoadFailed.value = true
  }
}

const addMarkerToPicker = (lng: number, lat: number) => {
  if (!mapPickerInstance) return

  if (mapPickerMarker) {
    mapPickerInstance.remove(mapPickerMarker)
  }

  mapPickerMarker = new window.AMap.Marker({
    position: [lng, lat],
    draggable: true,
    cursor: 'move'
  })

  mapPickerMarker.on('dragend', (e: any) => {
    const lng = e.lnglat.getLng()
    const lat = e.lnglat.getLat()
    attractionForm.longitude = lng
    attractionForm.latitude = lat
  })

  mapPickerInstance.add(mapPickerMarker)
  mapPickerInstance.setFitView()
}

const onlineCount = computed(() => {
  return attractionList.value.filter(item => item.status === 1).length
})

const totalViews = computed(() => {
  return attractionList.value.reduce((sum, item) => sum + (item.viewCount || 0), 0)
})

const totalComments = computed(() => {
  return attractionList.value.reduce((sum, item) => sum + (item.commentCount || 0), 0)
})

const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  if (rowIndex % 2 === 1) return 'striped-row'
  return ''
}

const loadAttractionList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/attraction/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
        region: searchForm.region,
        status: searchForm.status,
        _t: Date.now() // 防止浏览器缓存
      }
    })
    if (res.code === 200) {
      attractionList.value = res.data.list || res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadAttractionList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.region = ''
  searchForm.status = null
  pagination.pageNum = 1
  loadAttractionList()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增景点'
  attractionForm.id = null
  attractionForm.name = ''
  attractionForm.region = ''
  attractionForm.address = ''
  attractionForm.ticketPrice = 0
  attractionForm.openTime = ''
  attractionForm.contactPhone = ''
  attractionForm.description = ''
  attractionForm.images = '[]'
  attractionForm.longitude = null
  attractionForm.latitude = null
  resetMapPicker()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑景点'
  attractionForm.id = row.id
  attractionForm.name = row.name
  attractionForm.region = row.region
  attractionForm.address = row.address
  attractionForm.ticketPrice = row.ticketPrice
  attractionForm.openTime = row.openTime || ''
  attractionForm.contactPhone = row.contactPhone || ''
  attractionForm.description = row.description || ''
  attractionForm.images = row.images || '[]'
  attractionForm.longitude = row.longitude || null
  attractionForm.latitude = row.latitude || null
  resetMapPicker()
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `<div class="delete-confirm">
        <el-icon><WarningFilled /></el-icon>
        <div>
          <p>确定要删除景点 <strong>${row.name}</strong> 吗？</p>
          <p class="warning-text">此操作不可恢复，请谨慎操作</p>
        </div>
      </div>`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    const res: any = await request.delete(`/admin/attraction/${row.id}`, {
      params: { _t: Date.now() }
    })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // 使用 nextTick 确保 DOM 更新
      setTimeout(() => {
        loadAttractionList()
      }, 100)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleStatusChange = async (row: any, status: number) => {
  const action = status === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(
      `确定要${action}景点"${row.name}"吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res: any = await request.put(`/admin/attraction/status`, null, {
      params: { id: row.id, status, _t: Date.now() }
    })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      // 使用 setTimeout 确保 DOM 更新
      setTimeout(() => {
        loadAttractionList()
      }, 100)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const images = JSON.parse(attractionForm.images || '[]')
      images.push(e.target?.result as string)
      attractionForm.images = JSON.stringify(images)
    }
    reader.readAsDataURL(file)
  })

  target.value = ''
}

const removeImage = (index: number) => {
  const images = JSON.parse(attractionForm.images || '[]')
  images.splice(index, 1)
  attractionForm.images = JSON.stringify(images)
}

const previewImage = (index: number) => {
  const images = JSON.parse(attractionForm.images || '[]')
  const img = new Image()
  img.src = images[index]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const url = isEdit.value ? '/admin/attraction/update' : '/admin/attraction/add'
        const res: any = await request.post(url, attractionForm)
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadAttractionList()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadAttractionList()
})
</script>

<style scoped lang="scss">
// 主题色定义
$primary-color: #1a5f4a;
$primary-light: #2d8b6f;
$primary-dark: #0f3d2f;
$accent-color: #e8a838;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$text-primary: #1f2d3d;
$text-secondary: #596c76;
$text-muted: #8c9aa3;
$border-color: #e6e8eb;
$bg-light: #f8faf9;
$bg-card: #ffffff;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);

.attraction-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f5f3 0%, #e8f0ec 100%);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

// 顶部区域
.page-header {
  margin-bottom: 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    padding: 28px 32px;
    border-radius: 16px;
    box-shadow: $shadow-lg;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: 5%;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .title-icon {
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      font-size: 28px;
      color: #fff;
    }
  }

  .title-text {
    .page-title {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
    }

    .page-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  }

  .header-actions {
    position: relative;
    z-index: 1;

    .add-btn {
      background: linear-gradient(135deg, $accent-color 0%, #d4922a 100%);
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(232, 168, 56, 0.4);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(232, 168, 56, 0.5);
      }

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

// 搜索区域
.search-section {
  margin-bottom: 20px;

  .search-box {
    background: $bg-card;
    border-radius: 14px;
    padding: 20px 24px;
    box-shadow: $shadow-sm;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .search-input-wrapper {
    flex: 1;
    min-width: 280px;
    position: relative;
    display: flex;
    align-items: center;
    background: $bg-light;
    border-radius: 10px;
    padding: 0 16px;
    border: 1px solid transparent;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: $primary-light;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
    }

    .search-icon {
      color: $text-muted;
      font-size: 18px;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px;
      font-size: 14px;
      color: $text-primary;
      outline: none;

      &::placeholder {
        color: $text-muted;
      }
    }

    .search-shortcut {
      font-size: 12px;
      color: $text-muted;
      background: rgba(0, 0, 0, 0.05);
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .filter-group {
    display: flex;
    gap: 12px;
    align-items: center;

    .filter-select {
      width: 150px;

      :deep(.el-select__wrapper) {
        border-radius: 10px;
        background: $bg-light;
        border: 1px solid transparent;
        box-shadow: none;

        &:hover {
          border-color: $primary-light;
        }

        &.is-focused {
          border-color: $primary-light;
          box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
        }
      }
    }

    .reset-btn {
      border-radius: 10px;
      background: $bg-light;
      border: 1px solid $border-color;
      color: $text-secondary;
      padding: 10px 16px;

      &:hover {
        border-color: $primary-light;
        color: $primary-color;
      }

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    background: $bg-card;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: $shadow-sm;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-md;
    }

    &.total::before { background: linear-gradient(180deg, $primary-color, $primary-light); }
    &.online::before { background: linear-gradient(180deg, $success-color, #73d13d); }
    &.views::before { background: linear-gradient(180deg, #3b82f6, #60a5fa); }
    &.comments::before { background: linear-gradient(180deg, $accent-color, #f0b954); }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.total {
        background: linear-gradient(135deg, rgba(26, 95, 74, 0.1), rgba(26, 95, 74, 0.05));
        color: $primary-color;
      }
      &.online {
        background: linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0.05));
        color: $success-color;
      }
      &.views {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
        color: #3b82f6;
      }
      &.comments {
        background: linear-gradient(135deg, rgba(232, 168, 56, 0.1), rgba(232, 168, 56, 0.05));
        color: $accent-color;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: $text-primary;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 13px;
        color: $text-muted;
        margin-top: 4px;
      }
    }
  }
}

// 内容区域
.content-section {
  background: $bg-card;
  border-radius: 14px;
  padding: 24px;
  box-shadow: $shadow-sm;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;

      .title-bar {
        width: 4px;
        height: 18px;
        background: linear-gradient(180deg, $primary-color, $primary-light);
        border-radius: 2px;
      }
    }

    .data-info {
      font-size: 13px;
      color: $text-muted;
    }
  }
}

// 表格样式
.attraction-table {
  :deep(.el-table__header-wrapper) {
    th {
      background: $bg-light;
      color: $text-secondary;
      font-weight: 600;
      font-size: 13px;
      padding: 14px 0;
    }
  }

  :deep(.el-table__body-wrapper) {
    td {
      padding: 16px 0;
    }
  }

  :deep(.striped-row) {
    background: rgba(26, 95, 74, 0.02);
  }

  :deep(.el-table__row) {
    transition: all 0.3s ease;

    &:hover > td {
      background: rgba(26, 95, 74, 0.04) !important;
    }
  }

  .row-index {
    color: $text-muted;
    font-size: 13px;
  }
}

.attraction-info {
  display: flex;
  align-items: center;
  gap: 14px;

  .image-wrapper {
    position: relative;
    width: 90px;
    height: 70px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;

    .attraction-image {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.08);
      }
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #e8f0ec, #d4e4db);
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 24px;
        color: $text-muted;
      }
    }

    .image-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 20px;
      height: 20px;
      background: $success-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 12px;
        color: #fff;
      }
    }
  }

  .attraction-detail {
    .name {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 6px;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: $text-muted;

      .el-icon {
        color: $primary-light;
      }

      .divider {
        margin: 0 6px;
        color: $border-color;
      }
    }
  }
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;

  .currency {
    font-size: 13px;
    color: $danger-color;
    font-weight: 600;
  }

  .price {
    font-size: 20px;
    font-weight: 700;
    color: $danger-color;
    margin: 0 2px;
  }

  .unit {
    font-size: 12px;
    color: $text-muted;
  }
}

.rating-wrapper {
  :deep(.el-rate) {
    justify-content: center;

    .el-rate__icon {
      font-size: 14px !important;
      margin-right: 2px !important;
    }

    .el-rate__text {
      font-size: 13px;
      font-weight: 600;
      color: $accent-color;
      margin-left: 4px;
    }
  }
}

.stats-wrapper {
  display: flex;
  justify-content: center;
  gap: 16px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: $text-muted;

    .el-icon {
      font-size: 14px;
      color: $primary-light;
    }
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &.online {
    background: rgba(82, 196, 26, 0.1);
    color: $success-color;
  }

  &.offline {
    background: rgba(255, 77, 79, 0.1);
    color: $danger-color;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: $bg-light;

    .el-icon {
      font-size: 14px;
    }

    &.edit {
      color: $primary-color;

      &:hover {
        background: rgba(26, 95, 74, 0.1);
        transform: scale(1.1);
      }
    }

    &.up {
      color: $success-color;

      &:hover {
        background: rgba(82, 196, 26, 0.1);
        transform: scale(1.1);
      }
    }

    &.down {
      color: $warning-color;

      &:hover {
        background: rgba(250, 173, 20, 0.1);
        transform: scale(1.1);
      }
    }

    &.delete {
      color: $danger-color;

      &:hover {
        background: rgba(255, 77, 79, 0.1);
        transform: scale(1.1);
      }
    }
  }
}

// 分页
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    --el-pagination-bg-color: #fff;
    --el-pagination-text-color: $text-secondary;
    --el-pagination-button-color: $text-secondary;
    --el-pagination-button-disabled-color: $border-color;

    .el-pager li {
      border-radius: 8px;
      margin: 0 3px;

      &.is-active {
        background: $primary-color;
        color: #fff;
      }
    }

    .btn-prev,
    .btn-next {
      border-radius: 8px;
    }

    .el-pagination__total {
      color: $text-muted;
    }

    .el-pagination__jump {
      color: $text-muted;
    }
  }
}

// 对话框样式
.attraction-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;

    .el-dialog__header {
      background: linear-gradient(135deg, $primary-color, $primary-light);
      padding: 20px 24px;
      margin: 0;

      .el-dialog__title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }

      .el-dialog__headerbtn {
        top: 20px;

        .el-dialog__close {
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            color: #fff;
          }
        }
      }
    }
  }

  .dialog-content {
    padding: 24px;

    .form-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid $border-color;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
      }

      p {
        margin: 6px 0 0;
        font-size: 13px;
        color: $text-muted;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .form-item {
        &.full-width {
          grid-column: span 2;
        }
      }
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: $text-secondary;
    }

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      box-shadow: none;
      border: 1px solid $border-color;

      &:hover {
        border-color: $primary-light;
      }

      &.is-focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
      }
    }

    :deep(.el-select) {
      width: 100%;
    }

    .location-picker {
      .location-inputs {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .map-picker-container {
        margin-top: 12px;
        border: 2px solid $primary-light;
        border-radius: 10px;
        overflow: hidden;

        .map-container {
          width: 100%;
          height: 300px;
          min-height: 300px;
        }

        .map-error {
          width: 100%;
          height: 300px;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(26, 95, 74, 0.03), rgba(26, 95, 74, 0.06));
          color: $text-secondary;

          .error-icon {
            font-size: 48px;
            color: $danger-color;
            margin-bottom: 12px;
          }

          p {
            margin: 4px 0;
            font-size: 15px;
            font-weight: 500;
          }

          .error-tip {
            font-size: 12px !important;
            color: $text-muted;
            margin-bottom: 12px !important;
          }
        }

        .map-tips {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(26, 95, 74, 0.05);
          font-size: 12px;
          color: $text-secondary;

          .el-icon {
            color: $primary-light;
          }
        }
      }
    }

    .image-upload-area {
      .upload-tips {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $text-muted;
        margin-bottom: 12px;

        .el-icon {
          color: $primary-light;
        }
      }

      .image-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 12px;

        .uploaded-image {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;

          .el-image {
            width: 100%;
            height: 100%;
          }

          .image-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;

            button {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;

              &.preview-btn {
                background: #3b82f6;
                color: #fff;

                &:hover {
                  background: #2563eb;
                  transform: scale(1.1);
                }
              }

              &.delete-btn {
                background: $danger-color;
                color: #fff;

                &:hover {
                  background: #dc2626;
                  transform: scale(1.1);
                }
              }
            }
          }

          &:hover .image-overlay {
            opacity: 1;
          }
        }
      }

      .upload-button {
        width: 100%;
        height: 100px;
        border: 2px dashed $border-color;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: $text-muted;

        .el-icon {
          font-size: 28px;
        }

        span {
          font-size: 13px;
        }

        &:hover {
          border-color: $primary-color;
          color: $primary-color;
          background: rgba(26, 95, 74, 0.03);
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid $border-color;
    background: $bg-light;

    .cancel-btn {
      border-radius: 8px;
      padding: 10px 20px;
    }

    .submit-btn {
      background: linear-gradient(135deg, $primary-color, $primary-light);
      border: none;
      border-radius: 8px;
      padding: 10px 24px;
      font-weight: 500;

      &:hover {
        background: linear-gradient(135deg, $primary-dark, $primary-color);
      }
    }
  }
}

// 删除确认框样式
:deep(.delete-confirm) {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .el-icon {
    font-size: 20px;
    color: $warning-color;
    margin-top: 2px;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  .warning-text {
    font-size: 12px;
    color: $text-muted;
    margin-top: 4px;
  }
}

// 响应式
@media (max-width: 768px) {
  .attraction-management {
    padding: 16px;
  }

  .page-header {
    .header-content {
      flex-direction: column;
      gap: 16px;
      padding: 20px;
    }

    .header-actions {
      width: 100%;

      .add-btn {
        width: 100%;
      }
    }
  }

  .search-section {
    .search-box {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input-wrapper {
      min-width: auto;
    }

    .filter-group {
      flex-wrap: wrap;

      .filter-select {
        flex: 1;
        min-width: 120px;
      }
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: 16px;
    overflow-x: auto;
  }

  .attraction-dialog {
    .dialog-content {
      .form-grid {
        grid-template-columns: 1fr;

        .form-item.full-width {
          grid-column: span 1;
        }
      }
    }
  }
}
</style>
