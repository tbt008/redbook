<template>
  <div class="merchant-hotels admin-theme-page">
    <div class="page-header">
      <h2 class="page-title">酒店管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        发布酒店
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="酒店名称">
          <el-input v-model="searchForm.name" placeholder="请输入酒店名称" style="width: 200px" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="下架" :value="0" />
            <el-option label="上架" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 酒店列表 -->
    <el-card class="table-card">
      <el-table :data="hotelList" v-loading="loading" stripe class="hotel-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="酒店信息" width="300">
          <template #default="{ row }">
            <div class="hotel-info">
              <el-image :src="getFirstImage(row.images)" :preview-src-list="parseResourceImages(row.images)" fit="cover" class="hotel-cover">
                <template #error>
                  <div class="image-slot"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div class="merchant-hotel-meta">
                <div class="name">{{ row.name }}</div>
                <div class="address">{{ row.region }} - {{ row.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="starLevel" label="星级" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.starLevel" disabled :max="5" />
          </template>
        </el-table-column>
        <el-table-column label="房型" width="100">
          <template #default="{ row }">
            <el-tag type="info" v-if="row.roomCount">{{ row.roomCount }}种</el-tag>
            <span v-else class="no-data">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="起价" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.rating || '0.0' }}</el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" size="small" @click="handleManageRooms(row)">房型管理</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              <el-button link type="success" size="small" @click="handleStatusChange(row)" v-if="row.status === 0">上架</el-button>
              <el-button link type="info" size="small" @click="handleStatusChange(row)" v-if="row.status === 1">下架</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="750px">
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
        <el-form-item label="酒店描述" prop="description">
          <el-input v-model="hotelForm.description" type="textarea" :rows="3" placeholder="请输入酒店描述" />
        </el-form-item>
        <el-form-item label="酒店图片">
          <div class="image-upload-list" v-if="imageList.length > 0">
            <div v-for="(img, index) in imageList" :key="index" class="image-item">
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
    <el-dialog v-model="roomDialogVisible" :title="`${currentHotelName} - 房型管理`" width="1000px">
      <div class="room-header">
        <el-button type="primary" @click="handleAddRoom">
          <el-icon><Plus /></el-icon> 添加房型
        </el-button>
      </div>

      <el-table :data="roomList" v-loading="roomLoading" stripe style="margin-top: 15px">
        <el-table-column prop="roomName" label="房型名称" min-width="120" />
        <el-table-column label="房型类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.roomType === 1" type="primary">单人房</el-tag>
            <el-tag v-else-if="row.roomType === 2" type="success">标准间</el-tag>
            <el-tag v-else-if="row.roomType === 3" type="warning">双人间</el-tag>
            <el-tag v-else-if="row.roomType === 4" type="danger">大床房</el-tag>
            <el-tag v-else-if="row.roomType === 5" type="info">套房</el-tag>
            <el-tag v-else-if="row.roomType === 6" type="info">家庭房</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bedType" label="床型" width="140" />
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
            <span>{{ row.totalCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="maxOccupancy" label="入住人数" width="80" />
        <el-table-column prop="roomArea" label="面积" width="80" />
        <el-table-column prop="description" label="描述" min-width="120" show-overflow-tooltip />
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
    <el-dialog v-model="roomFormDialogVisible" :title="roomFormTitle" width="650px">
      <el-form :model="roomForm" :rules="roomFormRules" ref="roomFormRef" label-width="100px">
        <el-form-item label="房型名称" prop="roomName">
          <el-input v-model="roomForm.roomName" placeholder="请输入房型名称" />
        </el-form-item>
        <el-form-item label="房型类型" prop="roomType">
          <el-select v-model="roomForm.roomType" placeholder="请选择房型类型" style="width: 100%">
            <el-option label="单人房" :value="1" />
            <el-option label="标准间" :value="2" />
            <el-option label="双人间" :value="3" />
            <el-option label="大床房" :value="4" />
            <el-option label="套房" :value="5" />
            <el-option label="家庭房" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="床型" prop="bedType">
          <el-input v-model="roomForm.bedType" placeholder="如：1.8m大床、2张1.2m单人床" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="roomForm.price" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元/晚</span>
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="roomForm.originalPrice" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元/晚</span>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间数量">
              <el-input-number v-model="roomForm.totalCount" :min="0" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入住人数">
              <el-input-number v-model="roomForm.maxOccupancy" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间面积">
              <el-input v-model="roomForm.roomArea" placeholder="如：25㎡">
                <template #append>㎡</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼层">
              <el-input v-model="roomForm.floor" placeholder="如：3-5层" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="房型描述">
          <el-input v-model="roomForm.description" type="textarea" :rows="3" placeholder="请输入房型描述" />
        </el-form-item>
        <el-form-item label="房型图片">
          <div v-if="roomForm.image" class="room-image-preview">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Picture, Delete, Plus } from '@element-plus/icons-vue'
import request from '@/util/request'
import MapLocationPicker from '@/components/MapLocationPicker.vue'
import { normalizeMobilePhone, validateMobilePhone } from '@/utils/attractionForm'
import { formatDateTime } from '@/util/datetime'
import { getFirstImageUrl, parseImageList } from '@/utils/imageUrl'

const loading = ref(false)
const submitting = ref(false)
const hotelList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('发布酒店')
const formRef = ref<FormInstance>()
const fileInput = ref<HTMLInputElement>()
const isEdit = ref(false)

const parseResourceImages = (images?: string | string[]) => parseImageList(images)
const getFirstImage = (images?: string | string[]) => getFirstImageUrl(images)

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
  name: '',
  status: null as number | null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const hotelForm = reactive({
  id: null as number | null,
  name: '',
  region: '',
  address: '',
  longitude: null as number | null,
  latitude: null as number | null,
  price: 0,
  starLevel: 3,
  contactPhone: '',
  description: '',
  images: '[]'
})

const imageList = computed(() => {
  try {
    return JSON.parse(hotelForm.images || '[]')
  } catch {
    return []
  }
})

const formRules = {
  name: [{ required: true, message: '请输入酒店名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  contactPhone: [{ validator: validateMobilePhone, trigger: 'blur' }]
}

// 房型表单
const roomForm = reactive({
  id: null as number | null,
  hotelId: null as number | null,
  roomName: '',
  roomType: 2,
  price: 0,
  originalPrice: null as number | null,
  bedType: '',
  maxOccupancy: 2,
  roomArea: '',
  floor: '',
  description: '',
  image: '',
  totalCount: 0,
  remainingCount: 0
})

const roomFormRules = {
  roomName: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  roomType: [{ required: true, message: '请选择房型类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  bedType: [{ required: true, message: '请输入床型', trigger: 'blur' }]
}

const loadHotelList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/merchant/hotels', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        name: searchForm.name || undefined,
        status: searchForm.status,
        _t: Date.now()
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
  searchForm.name = ''
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
  hotelForm.price = 0
  hotelForm.starLevel = 3
  hotelForm.contactPhone = ''
  hotelForm.description = ''
  hotelForm.images = '[]'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑酒店'
  hotelForm.id = row.id
  hotelForm.name = row.name
  hotelForm.region = row.region
  hotelForm.address = row.address
  hotelForm.longitude = row.longitude || null
  hotelForm.latitude = row.latitude || null
  hotelForm.price = row.price
  hotelForm.starLevel = row.starLevel || 3
  hotelForm.contactPhone = normalizeMobilePhone(row.contactPhone)
  hotelForm.description = row.description || ''
  hotelForm.images = row.images || '[]'

  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除酒店"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/merchant/hotels/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      setTimeout(() => {
        loadHotelList()
      }, 100)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleStatusChange = async (row: any) => {
  const action = row.status === 1 ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${action}酒店"${row.name}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/merchant/hotels/${row.id}`)
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      setTimeout(() => {
        loadHotelList()
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
      const images = JSON.parse(hotelForm.images || '[]')
      images.push(e.target?.result as string)
      hotelForm.images = JSON.stringify(images)
    }
    reader.readAsDataURL(file)
  })

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
        const method = isEdit.value ? 'put' : 'post'
        const res: any = await request({
          method,
          url: '/admin/merchant/hotels',
          data: hotelForm
        })
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
          dialogVisible.value = false
          setTimeout(() => {
            loadHotelList()
          }, 100)
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
    const res: any = await request.get(`/admin/merchant/hotels/${currentHotelId.value}/rooms`)
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
  roomForm.roomType = 2
  roomForm.price = 0
  roomForm.originalPrice = null
  roomForm.bedType = ''
  roomForm.maxOccupancy = 2
  roomForm.roomArea = ''
  roomForm.floor = ''
  roomForm.description = ''
  roomForm.image = ''
  roomForm.totalCount = 0
  roomForm.remainingCount = 0
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
  roomForm.bedType = row.bedType || ''
  roomForm.maxOccupancy = row.maxOccupancy || 2
  roomForm.roomArea = row.roomArea || ''
  roomForm.floor = row.floor || ''
  roomForm.description = row.description || ''
  roomForm.image = row.image || ''
  roomForm.totalCount = row.totalCount || 0
  roomForm.remainingCount = row.remainingCount || 0
  roomFormDialogVisible.value = true
}

const handleDeleteRoom = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除房型"${row.roomName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/merchant/hotels/rooms/${row.id}`)
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
          const res: any = await request.put('/admin/merchant/hotels/rooms', payload)
          if (res.code === 200) {
            ElMessage.success('更新成功')
            roomFormDialogVisible.value = false
            await loadRooms()
          }
        } else {
          const res: any = await request.post('/admin/merchant/hotels/rooms', payload)
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
.merchant-hotels {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
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
    }

    .hotel-info {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 68px;
      min-height: 60px;
      overflow: hidden;

      .hotel-cover {
        flex: 0 0 80px;
        width: 80px;
        height: 60px !important;
        max-height: 60px;
        border-radius: 4px;
        overflow: hidden;
      }

      .merchant-hotel-meta {
        min-width: 0;

        .name {
          font-weight: 600;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .address {
          font-size: 12px;
          color: #999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .price {
      color: #ff6b00;
      font-weight: 600;
    }

    .original-price {
      color: #999;
      text-decoration: line-through;
      font-size: 12px;
    }

    .no-data {
      color: #999;
      font-size: 12px;
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

  .room-header {
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .room-image-preview {
    position: relative;
    display: inline-block;
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
    background: #f5f7fa;
    color: #909399;
  }
}
</style>
