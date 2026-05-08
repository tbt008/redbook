<template>
  <div class="hotel-management admin-theme-page">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="title-text">
            <h1 class="page-title">酒店管理</h1>
            <p class="page-subtitle">Manage Hotels And Rooms</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="add-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            发布酒店
          </el-button>
        </div>
      </div>
    </div>

    <div class="search-section">
      <div class="search-box">
        <div class="search-input-wrapper">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="searchForm.keyword"
            type="text"
            placeholder="搜索酒店名称..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <span class="search-shortcut">Enter 搜索</span>
        </div>
        <div class="filter-group">
          <el-select v-model="searchForm.region" placeholder="全部地区" clearable class="filter-select" @change="handleSearch">
            <template #prefix>
              <el-icon><Location /></el-icon>
            </template>
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="filter-select" @change="handleSearch">
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

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total"><el-icon><Collection /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ pagination.total }}</div>
          <div class="stat-label">酒店总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon online"><el-icon><CircleCheck /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ onlineCount }}</div>
          <div class="stat-label">上架酒店</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon views"><el-icon><View /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ totalViews }}</div>
          <div class="stat-label">总浏览量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon comments"><el-icon><ChatDotRound /></el-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ hotelList.length }}</div>
          <div class="stat-label">当前页数据</div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="table-header table-header--panel">
        <h3 class="section-title">
          <span class="title-bar"></span>
          酒店列表
        </h3>
        <div class="table-actions">
          <span class="data-info">共 {{ pagination.total }} 条记录</span>
        </div>
      </div>

      <el-table :data="hotelList" v-loading="loading" stripe class="hotel-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="酒店信息" width="300">
          <template #default="{ row }">
            <div class="hotel-info">
              <el-image :src="getFirstImage(row.images)" :preview-src-list="parseImageList(row.images)" lazy fit="cover" style="width: 80px; height: 60px; border-radius: 4px">
                <template #error>
                  <div class="image-slot"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div class="hotel-meta">
                <div class="name">{{ row.name }}</div>
                <div class="address">{{ row.region }} - {{ row.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="starLevel" label="星级" width="80">
          <template #default="{ row }">
            <el-rate v-model="row.starLevel" disabled :max="5" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.rating || '0.0' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="房型" width="100">
          <template #default="{ row }">
            <el-tag type="info" v-if="row.roomCount">{{ row.roomCount }}种</el-tag>
            <span v-else class="no-data">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else type="danger">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" size="small" @click="handleManageComments(row)">评论</el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" size="small" @click="handleManageRooms(row)">房型管理</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)" v-if="row.status !== 4">删除</el-button>
              <el-button link type="success" size="small" @click="handleStatusChange(row, 1)" v-if="row.status === 0">上架</el-button>
              <el-button link type="warning" size="small" @click="handleStatusChange(row, 0)" v-if="row.status === 1">下架</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadHotelList"
        @current-change="loadHotelList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="hotelForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="酒店名称" prop="name">
          <el-input v-model="hotelForm.name" placeholder="请输入酒店名称" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="hotelForm.region" placeholder="请选择地区" style="width: 100%">
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <MapLocationPicker
            v-model:address="hotelForm.address"
            v-model:longitude="hotelForm.longitude"
            v-model:latitude="hotelForm.latitude"
            v-model:region="hotelForm.region"
          />
        </el-form-item>
        <el-form-item label="酒店星级" prop="starLevel">
          <el-rate v-model="hotelForm.starLevel" :max="5" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="hotelForm.price" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元/晚</span>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="hotelForm.contactPhone"
            placeholder="请输入11位手机号"
            maxlength="11"
            show-word-limit
            inputmode="numeric"
            @input="hotelForm.contactPhone = normalizeMobilePhone($event)"
          />
        </el-form-item>
        <el-form-item label="酒店设施">
          <el-checkbox-group v-model="facilitiesList">
            <el-checkbox label="wifi">WiFi</el-checkbox>
            <el-checkbox label="停车场">停车场</el-checkbox>
            <el-checkbox label="游泳池">游泳池</el-checkbox>
            <el-checkbox label="健身房">健身房</el-checkbox>
            <el-checkbox label="餐厅">餐厅</el-checkbox>
            <el-checkbox label="会议室">会议室</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="酒店描述" prop="description">
          <el-input v-model="hotelForm.description" type="textarea" :rows="4" placeholder="请输入酒店描述" />
        </el-form-item>
        <el-form-item label="酒店图片">
          <div class="image-upload-list" v-if="parsedHotelImages.length">
            <div v-for="(img, index) in parsedHotelImages" :key="index" class="image-item">
              <el-image :src="img" fit="cover" style="width: 100px; height: 100px" />
              <div class="image-actions">
                <el-button type="danger" size="small" circle @click="removeImage(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <el-button type="primary" @click="triggerImageUpload">
            <el-icon><Plus /></el-icon> 添加图片
          </el-button>
          <input type="file" ref="fileInput" accept="image/*" multiple style="display: none" @change="handleImageChange" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 房型管理对话框 -->
    <el-dialog v-model="roomDialogVisible" :title="`${currentHotelName} - 房型管理`" width="900px">
      <div class="package-header">
        <el-button type="primary" @click="handleAddRoom">
          <el-icon><Plus /></el-icon> 添加房型
        </el-button>
      </div>

      <el-table :data="roomList" v-loading="roomLoading" stripe style="margin-top: 15px">
        <el-table-column prop="roomName" label="房型名称" min-width="120" />
        <el-table-column label="房型类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.roomType === 1" type="primary">标准间</el-tag>
            <el-tag v-else-if="row.roomType === 2" type="success">大床房</el-tag>
            <el-tag v-else-if="row.roomType === 3" type="warning">双床房</el-tag>
            <el-tag v-else-if="row.roomType === 4" type="danger">套房</el-tag>
            <el-tag v-else-if="row.roomType === 5" type="info">豪华套房</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="originalPrice" label="原价" width="100">
          <template #default="{ row }">
            <span v-if="row.originalPrice" class="original-price">¥{{ row.originalPrice }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="100">
          <template #default="{ row }">
            <span>{{ row.totalCount ?? 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" fit="cover" style="width: 50px; height: 50px; border-radius: 4px" />
            <span v-else class="no-data">无</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else type="danger">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEditRoom(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteRoom(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="roomDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑房型对话框 -->
    <el-dialog v-model="roomFormDialogVisible" :title="roomFormTitle" width="600px">
      <el-form :model="roomForm" :rules="roomFormRules" ref="roomFormRef" label-width="100px">
        <el-form-item label="房型名称" prop="roomName">
          <el-input v-model="roomForm.roomName" placeholder="请输入房型名称" />
        </el-form-item>
        <el-form-item label="房型类型" prop="roomType">
          <el-select v-model="roomForm.roomType" placeholder="请选择房型类型" style="width: 100%">
            <el-option label="标准间" :value="1" />
            <el-option label="大床房" :value="2" />
            <el-option label="双床房" :value="3" />
            <el-option label="套房" :value="4" />
            <el-option label="豪华套房" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="roomForm.price" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元/晚</span>
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="roomForm.originalPrice" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元/晚</span>
        </el-form-item>
        <el-form-item label="房间数量" prop="totalCount">
          <el-input-number v-model="roomForm.totalCount" :min="0" :max="999" style="width: 200px" />
          <span style="margin-left: 10px">间</span>
        </el-form-item>
        <el-form-item label="房型描述">
          <el-input v-model="roomForm.description" type="textarea" :rows="3" placeholder="请输入房型描述" />
        </el-form-item>
        <el-form-item label="房型图片">
          <div v-if="roomForm.image" class="package-image-preview">
            <el-image :src="roomForm.image" fit="cover" style="width: 100px; height: 100px" />
            <el-button type="danger" size="small" circle @click="roomForm.image = ''" style="position: absolute; top: -5px; right: -5px">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" @click="triggerRoomImageUpload" v-else>
            <el-icon><Plus /></el-icon> 上传图片
          </el-button>
          <input type="file" ref="roomImageInput" accept="image/*" style="display: none" @change="handleRoomImageChange" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roomFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoomSubmit" :loading="roomSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <AdminCommentDrawer ref="commentDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Picture,
  Delete,
  Plus,
  Search,
  Location,
  SwitchButton,
  RefreshRight,
  Collection,
  CircleCheck,
  View,
  ChatDotRound
} from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'
import { normalizeMobilePhone, validateMobilePhone } from '@/utils/attractionForm'
import MapLocationPicker from '@/components/MapLocationPicker.vue'
import AdminCommentDrawer from '@/components/admin/AdminCommentDrawer.vue'
import { parseImageList as parseStoredImageList } from '@/utils/imageUrl'

const loading = ref(false)
const submitting = ref(false)
const hotelList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('编辑酒店')
const formRef = ref<FormInstance>()
const fileInput = ref<HTMLInputElement>()
const commentDrawerRef = ref<InstanceType<typeof AdminCommentDrawer>>()

const isEdit = ref(false)

const handleManageComments = (row: any) => {
  commentDrawerRef.value?.open({
    id: row.id,
    title: row.name || '未命名酒店',
    type: 6
  })
}

// 房型相关
const roomDialogVisible = ref(false)
const roomFormDialogVisible = ref(false)
const roomLoading = ref(false)
const roomSubmitting = ref(false)
const roomFormRef = ref<FormInstance>()
const roomImageInput = ref<HTMLInputElement>()
const roomList = ref<any[]>([])
const roomFormTitle = ref('添加房型')
const currentHotelId = ref<number | null>(null)
const currentHotelName = ref('')
const isRoomEdit = ref(false)

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

const onlineCount = computed(() => hotelList.value.filter((item) => item.status === 1).length)
const totalViews = computed(() => hotelList.value.reduce((sum, item) => sum + Number(item.viewCount || 0), 0))
const parsedHotelImages = computed(() => parseImageList(hotelForm.images))

const hotelForm = reactive({
  id: null as number | null,
  name: '',
  region: '',
  address: '',
  longitude: null as number | null,
  latitude: null as number | null,
  starLevel: 3,
  price: 0,
  contactPhone: '',
  facilities: '',
  description: '',
  images: '[]'
})

const facilitiesList = ref<string[]>([])

const formRules = {
  name: [{ required: true, message: '请输入酒店名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  contactPhone: [{ validator: validateMobilePhone, trigger: 'blur' }]
}

// 房型表单
const roomForm = reactive({
  id: null as number | null,
  hotelId: null as number | null,
  roomName: '',
  roomType: 1,
  price: 0,
  originalPrice: null as number | null,
  totalCount: 0,
  remainingCount: 0,
  description: '',
  image: ''
})

const roomFormRules = {
  roomName: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  roomType: [{ required: true, message: '请选择房型类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  totalCount: [{ required: true, message: '请输入房间数量', trigger: 'blur' }]
}

const parseImageList = (images?: string | string[]) => {
  return parseStoredImageList(images)
}

const getFirstImage = (images?: string | string[]) => {
  return parseImageList(images)[0] || ''
}

const loadHotelList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/hotel/list', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
        region: searchForm.region,
        status: searchForm.status
      }
    })
    if (res.code === 200) {
      hotelList.value = res.data.list || res.data.records || []
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
  loadHotelList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.region = ''
  searchForm.status = null
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '发布酒店'
  hotelForm.id = null
  hotelForm.name = ''
  hotelForm.region = ''
  hotelForm.address = ''
  hotelForm.longitude = null
  hotelForm.latitude = null
  hotelForm.starLevel = 3
  hotelForm.price = 0
  hotelForm.contactPhone = ''
  hotelForm.facilities = ''
  hotelForm.description = ''
  hotelForm.images = '[]'
  facilitiesList.value = []

  dialogVisible.value = true
}

const handleEdit = async (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑酒店'
  loading.value = true
  try {
    const res: any = await request.get(`/hotel/${row.id}`)
    const detail = res.code === 200 && res.data ? res.data : row
    hotelForm.id = detail.id
    hotelForm.name = detail.name
    hotelForm.region = detail.region
    hotelForm.address = detail.address
    hotelForm.longitude = detail.longitude || null
    hotelForm.latitude = detail.latitude || null
    hotelForm.starLevel = detail.starLevel || 3
    hotelForm.price = detail.price
    hotelForm.contactPhone = normalizeMobilePhone(detail.contactPhone)
    hotelForm.facilities = detail.facilities || ''
    hotelForm.description = detail.description || ''
    hotelForm.images = detail.images || '[]'

    if (detail.facilities) {
      facilitiesList.value = detail.facilities.split(',')
    } else {
      facilitiesList.value = []
    }

    dialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载酒店详情失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除酒店"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/hotel/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadHotelList()
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
    await ElMessageBox.confirm(`确定要${action}酒店"${row.name}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.put(`/admin/hotel/status`, null, {
      params: { id: row.id, status }
    })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      loadHotelList()
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

  // 模拟上传，这里直接将本地图片转为base64
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const images = JSON.parse(hotelForm.images || '[]')
      images.push(e.target?.result as string)
      hotelForm.images = JSON.stringify(images)
    }
    reader.readAsDataURL(file)
  })

  // 清空input以允许重复选择同一文件
  target.value = ''
}

const removeImage = (index: number) => {
  const images = JSON.parse(hotelForm.images || '[]')
  images.splice(index, 1)
  hotelForm.images = JSON.stringify(images)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 处理设施
        hotelForm.facilities = facilitiesList.value.join(',')

        const url = isEdit.value ? '/admin/hotel/update' : '/admin/hotel/add'
        const res: any = await request.post(url, hotelForm)
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadHotelList()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 房型管理相关方法
const handleManageRooms = async (row: any) => {
  currentHotelId.value = row.id
  currentHotelName.value = row.name
  roomDialogVisible.value = true
  await loadRooms()
}

const loadRooms = async () => {
  if (!currentHotelId.value) return
  roomLoading.value = true
  try {
    const res: any = await request.get(`/admin/hotels/${currentHotelId.value}/rooms`)
    if (res.code === 200) {
      roomList.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载房型失败')
  } finally {
    roomLoading.value = false
  }
}

const handleAddRoom = () => {
  isRoomEdit.value = false
  roomFormTitle.value = '添加房型'
  roomForm.id = null
  roomForm.hotelId = currentHotelId.value
  roomForm.roomName = ''
  roomForm.roomType = 1
  roomForm.price = 0
  roomForm.originalPrice = null
  roomForm.totalCount = 0
  roomForm.remainingCount = 0
  roomForm.description = ''
  roomForm.image = ''
  roomFormDialogVisible.value = true
}

const handleEditRoom = (row: any) => {
  isRoomEdit.value = true
  roomFormTitle.value = '编辑房型'
  roomForm.id = row.id
  roomForm.hotelId = currentHotelId.value
  roomForm.roomName = row.roomName
  roomForm.roomType = row.roomType
  roomForm.price = row.price
  roomForm.originalPrice = row.originalPrice
  roomForm.totalCount = row.totalCount ?? row.stock ?? 0
  roomForm.remainingCount = row.remainingCount ?? roomForm.totalCount
  roomForm.description = row.description || ''
  roomForm.image = row.image || ''
  roomFormDialogVisible.value = true
}

const handleDeleteRoom = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除房型"${row.roomName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/hotels/rooms/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await loadRooms()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const triggerRoomImageUpload = () => {
  roomImageInput.value?.click()
}

const handleRoomImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    roomForm.image = e.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

const handleRoomSubmit = async () => {
  if (!roomFormRef.value) return

  await roomFormRef.value.validate(async (valid) => {
    if (valid) {
      roomSubmitting.value = true
      try {
        const payload = {
          ...roomForm,
          remainingCount: isRoomEdit.value ? roomForm.remainingCount : roomForm.totalCount
        }
        if (isRoomEdit.value) {
          const res: any = await request.put('/admin/hotels/rooms', payload)
          if (res.code === 200) {
            ElMessage.success('更新成功')
            roomFormDialogVisible.value = false
            await loadRooms()
          }
        } else {
          const res: any = await request.post('/admin/hotels/rooms', payload)
          if (res.code === 200) {
            ElMessage.success('添加成功')
            roomFormDialogVisible.value = false
            await loadRooms()
          }
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        roomSubmitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadHotelList()
})
</script>

<style scoped lang="scss">
.hotel-management {
  $primary-color: #1a5f4a;
  $primary-light: #2d7a5f;
  $primary-dark: #134535;
  $accent-color: #e8a838;
  $success-color: #52c41a;
  $warning-color: #faad14;
  $danger-color: #ff4d4f;
  $text-primary: #1f2937;
  $text-secondary: #4b5563;
  $text-muted: #9ca3af;
  $bg-light: #f8faf9;
  $bg-card: #ffffff;
  $border-color: #e5e7eb;
  $shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.05);
  $shadow-md: 0 8px 30px rgba(26, 95, 74, 0.12);
  $shadow-lg: 0 15px 40px rgba(26, 95, 74, 0.15);

  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28px 32px;
      background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
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
    }
  }

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
    }
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
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

    &:nth-child(1)::before { background: linear-gradient(180deg, $primary-color, $primary-light); }
    &:nth-child(2)::before { background: linear-gradient(180deg, $success-color, #73d13d); }
    &:nth-child(3)::before { background: linear-gradient(180deg, #3b82f6, #60a5fa); }
    &:nth-child(4)::before { background: linear-gradient(180deg, $accent-color, #f0b954); }
  }

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

  .content-section {
    background: $bg-card;
    border-radius: 14px;
    padding: 24px;
    box-shadow: $shadow-sm;
  }

  .table-header--panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

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

  .hotel-table {
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

    :deep(.el-table__header-wrapper th) {
      background: $bg-light;
      color: $text-secondary;
      font-weight: 600;
      font-size: 13px;
      padding: 14px 0;
    }

    :deep(.el-table__body-wrapper td),
    :deep(.el-table__fixed-body-wrapper td) {
      height: 92px !important;
      padding: 12px 0 !important;
      vertical-align: middle;
    }

    :deep(.el-table__body .el-table__cell) {
      height: 92px !important;
      vertical-align: middle;
    }

    :deep(.el-table__body .cell) {
      display: flex;
      align-items: center;
      min-height: 68px;
      overflow: hidden;
    }

    :deep(.el-table__row),
    :deep(.el-table__row .el-table__cell) {
      height: 92px !important;
      max-height: 92px !important;
    }

    :deep(.el-table-fixed-column--right),
    :deep(.el-table__fixed-right),
    :deep(.el-table__fixed-right-patch) {
      background: #fff;
      z-index: 3;
    }

    :deep(.el-table__row) {
      transition: all 0.3s ease;

      &:hover > td {
        background: rgba(26, 95, 74, 0.04) !important;
      }
    }

    .hotel-info {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 68px;
      overflow: hidden;

      .hotel-meta {
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

        .address {
          font-size: 12px;
          color: $text-muted;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .price {
      color: $danger-color;
      font-weight: 700;
    }

    .row-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      white-space: nowrap;

      :deep(.el-button) {
        margin-left: 0;
      }
    }
  }

  .image-upload-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;

    .image-item {
      position: relative;

      .image-actions {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: none;
      }

      &:hover .image-actions {
        display: block;
      }
    }
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 60px;
    background: linear-gradient(135deg, #e8f0ec, #d4e4db);
    color: $text-muted;
  }

  .package-header {
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .package-image-preview {
    position: relative;
    display: inline-block;
  }

  .no-data {
    color: $text-muted;
    font-size: 12px;
  }

  .original-price {
    color: $text-muted;
    text-decoration: line-through;
    font-size: 12px;
  }

  @media (max-width: 768px) {
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
    }

    .filter-group {
      flex-wrap: wrap;

      .filter-select {
        flex: 1;
        min-width: 120px;
      }
    }

    .stats-section {
      grid-template-columns: 1fr;
    }

    .content-section {
      padding: 16px;
      overflow-x: auto;
    }
  }
}
</style>
