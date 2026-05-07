<template>
  <div class="attraction-management admin-theme-page">
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
            @change="handleSearch"
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
            @change="handleSearch"
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
                  :src="getFirstImage(row.images)"
                  :preview-src-list="parseImageList(row.images)"
                  lazy
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
              <div class="attraction-meta">
                <div class="name">{{ row.name }}</div>
                <div class="meta-location">
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

        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div class="attraction-actions">
              <el-tooltip content="评论管理" placement="top">
                <button class="action-btn comments" @click="handleManageComments(row)">
                  <el-icon><ChatDotRound /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <button class="action-btn edit" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip content="门票管理" placement="top">
                <button class="action-btn ticket" @click="handleManageTickets(row)">
                  <el-icon><Ticket /></el-icon>
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
              <MapLocationPicker
                v-model:address="attractionForm.address"
                v-model:longitude="attractionForm.longitude"
                v-model:latitude="attractionForm.latitude"
                v-model:region="attractionForm.region"
              />
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
              <el-time-picker
                v-model="attractionOpenTimeRange"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="联系电话" prop="contactPhone" class="form-item">
              <el-input
                v-model="attractionForm.contactPhone"
                placeholder="请输入11位手机号"
                maxlength="11"
                show-word-limit
                inputmode="numeric"
                @input="attractionForm.contactPhone = normalizeMobilePhone($event)"
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
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

    <!-- 门票套餐管理对话框 -->
    <el-dialog v-model="ticketDialogVisible" :title="`${currentAttractionName} - 门票套餐`" width="900px">
      <div class="ticket-header">
        <el-button type="primary" @click="handleAddTicket">
          <el-icon><Plus /></el-icon>
          添加票种
        </el-button>
      </div>

      <el-table :data="ticketList" v-loading="ticketLoading" stripe style="margin-top: 15px">
        <el-table-column prop="ticketName" label="票种名称" min-width="120" />
        <el-table-column label="票种类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.ticketType === 1" type="primary">成人票</el-tag>
            <el-tag v-else-if="row.ticketType === 2" type="success">儿童票</el-tag>
            <el-tag v-else-if="row.ticketType === 3" type="warning">学生票</el-tag>
            <el-tag v-else-if="row.ticketType === 4" type="info">老人票</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="ticket-price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="validDays" label="有效期" width="90">
          <template #default="{ row }">
            <span>{{ row.validDays || 1 }}天</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="120">
          <template #default="{ row }">
            <span>{{ getTicketStockText(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else type="danger">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEditTicket(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteTicket(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="ticketDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑票种对话框 -->
    <el-dialog v-model="ticketFormDialogVisible" :title="ticketFormTitle" width="600px">
      <el-form :model="ticketForm" :rules="ticketFormRules" ref="ticketFormRef" label-width="100px">
        <el-form-item label="票种名称" prop="ticketName">
          <el-input v-model="ticketForm.ticketName" placeholder="如：成人票、学生票、老人票" />
        </el-form-item>
        <el-form-item label="票种类型" prop="ticketType">
          <el-select v-model="ticketForm.ticketType" placeholder="请选择票种类型" style="width: 100%">
            <el-option label="成人票" :value="1" />
            <el-option label="儿童票" :value="2" />
            <el-option label="学生票" :value="3" />
            <el-option label="老人票" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="ticketForm.price" :min="0" :precision="2" style="width: 220px" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="有效期">
          <el-input-number v-model="ticketForm.validDays" :min="1" :max="365" style="width: 220px" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="总票数">
          <el-input-number v-model="ticketForm.totalCount" :min="0" :max="100000" style="width: 220px" />
          <span style="margin-left: 10px">张（0表示不限量）</span>
        </el-form-item>
        <el-form-item label="票种描述">
          <el-input v-model="ticketForm.description" type="textarea" :rows="3" placeholder="请输入购买说明或适用人群" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ticketFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTicketSubmit" :loading="ticketSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <AdminCommentDrawer ref="commentDrawerRef" />
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
  Phone,
  ZoomIn,
  MapLocation,
  InfoFilled,
  Warning,
  Ticket
} from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'
import { formatOpenTimeRange, normalizeMobilePhone, parseOpenTimeRange, validateMobilePhone } from '@/utils/attractionForm'
import MapLocationPicker from '@/components/MapLocationPicker.vue'
import { loadAMapScript, waitForContainerVisible } from '@/utils/amap'
import AdminCommentDrawer from '@/components/admin/AdminCommentDrawer.vue'

const loading = ref(false)
const submitting = ref(false)
const attractionList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('编辑景点')
const formRef = ref()
const fileInput = ref<HTMLInputElement>()
const commentDrawerRef = ref<InstanceType<typeof AdminCommentDrawer>>()

const isEdit = ref(false)

const handleManageComments = (row: any) => {
  commentDrawerRef.value?.open({
    id: row.id,
    title: row.name || '未命名景点',
    type: 4
  })
}

// 门票套餐相关
const ticketDialogVisible = ref(false)
const ticketFormDialogVisible = ref(false)
const ticketLoading = ref(false)
const ticketSubmitting = ref(false)
const ticketFormRef = ref()
const ticketList = ref<any[]>([])
const ticketFormTitle = ref('添加票种')
const currentAttractionId = ref<number | null>(null)
const currentAttractionName = ref('')
const isTicketEdit = ref(false)

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
  ticketPrice: [{ required: true, message: '请输入门票价格', trigger: 'blur' }],
  openTime: [{ required: true, message: '请选择开放时间', trigger: 'change' }],
  contactPhone: [{ validator: validateMobilePhone, trigger: 'blur' }]
}

const ticketForm = reactive({
  id: null as number | null,
  attractionId: null as number | null,
  ticketName: '',
  ticketType: 1,
  price: 0,
  validDays: 1,
  description: '',
  totalCount: 0,
  soldCount: 0
})

const ticketFormRules = {
  ticketName: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  ticketType: [{ required: true, message: '请选择票种类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入票种价格', trigger: 'blur' }]
}

const attractionOpenTimeRange = computed({
  get: () => parseOpenTimeRange(attractionForm.openTime),
  set: (value: string[]) => {
    attractionForm.openTime = formatOpenTimeRange(value)
  }
})

const parsedImages = computed(() => {
  return parseImageList(attractionForm.images)
})

// 地图选点相关
const showMapPicker = ref(false)
let mapPickerInstance: any = null
let mapPickerMarker: any = null
let mapLoadFailed = ref(false)

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

  try {
    await loadAMapScript()
    initMapPicker()
  } catch (error) {
    console.error('高德地图加载失败:', error)
    mapLoadFailed.value = true
  }
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

  const AMap = (window as any).AMap
  if (!AMap) {
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

    mapPickerInstance = new AMap.Map('attraction-map-picker', {
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

  const AMap = (window as any).AMap
  mapPickerMarker = new AMap.Marker({
    position: [lng, lat],
    draggable: true,
    cursor: 'move'
  } as any)

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

const parseImageList = (images?: string | string[]) => {
  if (!images) return []
  if (Array.isArray(images)) return images.filter(Boolean)
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return images ? [images] : []
  }
}

const getFirstImage = (images?: string | string[]) => {
  return parseImageList(images)[0] || ''
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

const handleEdit = async (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑景点'
  loading.value = true
  try {
    const res: any = await request.get(`/attraction/${row.id}`)
    const detail = res.code === 200 && res.data ? res.data : row
    attractionForm.id = detail.id
    attractionForm.name = detail.name
    attractionForm.region = detail.region
    attractionForm.address = detail.address
    attractionForm.ticketPrice = detail.ticketPrice
    attractionForm.openTime = detail.openTime || ''
    attractionForm.contactPhone = normalizeMobilePhone(detail.contactPhone)
    attractionForm.description = detail.description || ''
    attractionForm.images = detail.images || '[]'
    attractionForm.longitude = detail.longitude || null
    attractionForm.latitude = detail.latitude || null
    resetMapPicker()
    dialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载景点详情失败')
  } finally {
    loading.value = false
  }
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

const getTicketStockText = (ticket: any) => {
  const total = Number(ticket.totalCount || 0)
  if (total <= 0) return '不限量'
  const sold = Number(ticket.soldCount || 0)
  return `${Math.max(total - sold, 0)}/${total}`
}

const handleManageTickets = async (row: any) => {
  currentAttractionId.value = row.id
  currentAttractionName.value = row.name
  ticketDialogVisible.value = true
  await loadTickets()
}

const loadTickets = async () => {
  if (!currentAttractionId.value) return
  ticketLoading.value = true
  try {
    const res: any = await request.get(`/admin/attractions/${currentAttractionId.value}/tickets`)
    if (res.code === 200) {
      ticketList.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载票种失败')
  } finally {
    ticketLoading.value = false
  }
}

const handleAddTicket = () => {
  isTicketEdit.value = false
  ticketFormTitle.value = '添加票种'
  ticketForm.id = null
  ticketForm.attractionId = currentAttractionId.value
  ticketForm.ticketName = ''
  ticketForm.ticketType = 1
  ticketForm.price = 0
  ticketForm.validDays = 1
  ticketForm.description = ''
  ticketForm.totalCount = 0
  ticketForm.soldCount = 0
  ticketFormDialogVisible.value = true
}

const handleEditTicket = (row: any) => {
  isTicketEdit.value = true
  ticketFormTitle.value = '编辑票种'
  ticketForm.id = row.id
  ticketForm.attractionId = row.attractionId || currentAttractionId.value
  ticketForm.ticketName = row.ticketName
  ticketForm.ticketType = row.ticketType || 1
  ticketForm.price = row.price
  ticketForm.validDays = row.validDays || 1
  ticketForm.description = row.description || ''
  ticketForm.totalCount = row.totalCount || 0
  ticketForm.soldCount = row.soldCount || 0
  ticketFormDialogVisible.value = true
}

const handleDeleteTicket = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除票种"${row.ticketName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/attractions/tickets/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await loadTickets()
      await loadAttractionList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleTicketSubmit = async () => {
  if (!ticketFormRef.value) return

  await ticketFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      ticketSubmitting.value = true
      try {
        const payload = {
          ...ticketForm,
          attractionId: ticketForm.attractionId || currentAttractionId.value
        }
        const res: any = isTicketEdit.value
          ? await request.put('/admin/attractions/tickets', payload)
          : await request.post('/admin/attractions/tickets', payload)

        if (res.code === 200) {
          ElMessage.success(isTicketEdit.value ? '更新成功' : '添加成功')
          ticketFormDialogVisible.value = false
          await loadTickets()
          await loadAttractionList()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        ticketSubmitting.value = false
      }
    }
  })
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

  await formRef.value.validate(async (valid: boolean) => {
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
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__body-wrapper),
  :deep(.el-scrollbar__view),
  :deep(.el-table__body),
  :deep(.el-table__body tbody),
  :deep(.el-table__fixed-body-wrapper tbody) {
    height: auto !important;
  }

  :deep(.el-table__body) {
    table-layout: fixed;
  }

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
      height: 102px !important;
      padding: 12px 0 !important;
      vertical-align: middle;
    }
  }

  :deep(.el-table__fixed-body-wrapper td) {
    height: 102px !important;
    padding: 12px 0 !important;
    vertical-align: middle;
  }

  :deep(.el-table__body .el-table__cell) {
    height: 102px !important;
    vertical-align: middle;
  }

  :deep(.el-table__body .cell) {
    display: flex;
    align-items: center;
    min-height: 78px;
    overflow: hidden;
  }

  :deep(.el-table__row),
  :deep(.el-table__row .el-table__cell) {
    height: 102px !important;
    max-height: 102px !important;
  }

  :deep(.el-table-fixed-column--right),
  :deep(.el-table__fixed-right),
  :deep(.el-table__fixed-right-patch) {
    background: #fff;
    z-index: 3;
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
  width: 100%;
  height: 78px;
  overflow: hidden;

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

  .attraction-meta {
    min-width: 0;

    .name {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: $text-muted;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;

      .el-icon {
        color: $primary-light;
      }

      .divider {
        margin: 0 6px;
        color: $border-color;
        flex: 0 0 auto;
      }

      span:not(.divider) {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
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

.attraction-actions {
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

    &.ticket {
      color: $primary-light;

      &:hover {
        background: rgba(45, 139, 111, 0.1);
        transform: scale(1.1);
      }
    }

    &.comments {
      color: #8b5cf6;

      &:hover {
        background: rgba(139, 92, 246, 0.1);
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

.ticket-header {
  display: flex;
  justify-content: flex-end;
}

.ticket-price {
  color: $danger-color;
  font-weight: 700;
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
