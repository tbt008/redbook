<template>
  <div class="merchant-publish-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <div class="user-info">
          <span>欢迎，{{ userInfo?.nickname || userInfo?.username }}</span>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <el-card class="publish-card">
        <template #header>
          <div class="card-header">
            <h2>商家中心 - 发布{{ publishType === 'attraction' ? '景点' : '酒店' }}</h2>
          </div>
        </template>

        <!-- 发布类型选择 -->
        <el-tabs v-model="publishType" @tab-change="handleTypeChange">
          <el-tab-pane label="发布景点" name="attraction" />
          <el-tab-pane label="发布酒店" name="hotel" />
          <el-tab-pane label="门票管理" name="ticket" />
        </el-tabs>

        <!-- 景点表单 -->
        <el-form v-if="publishType === 'attraction'" :model="attractionForm" :rules="attractionRules" ref="attractionFormRef" label-width="120px">
          <el-form-item label="景点名称" prop="name">
            <el-input v-model="attractionForm.name" placeholder="请输入景点名称" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="地区" prop="region">
            <el-select v-model="attractionForm.region" placeholder="请选择地区">
              <el-option label="荔城区" value="荔城区" />
              <el-option label="城厢区" value="城厢区" />
              <el-option label="涵江区" value="涵江区" />
              <el-option label="秀屿区" value="秀屿区" />
              <el-option label="湄洲岛" value="湄洲岛" />
              <el-option label="仙游县" value="仙游县" />
            </el-select>
          </el-form-item>

          <el-form-item label="详细地址" prop="address">
            <MapLocationPicker
              v-model:address="attractionForm.address"
              v-model:longitude="attractionForm.longitude"
              v-model:latitude="attractionForm.latitude"
              v-model:region="attractionForm.region"
            />
          </el-form-item>

          <el-form-item label="景点图片">
            <el-upload
              class="images-uploader"
              action="/api/file/upload?directory=attraction"
              list-type="picture-card"
              :file-list="attractionImageList"
              :on-success="handleAttractionImageSuccess"
              :on-remove="handleAttractionImageRemove"
              multiple
            >
              <el-icon class="uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议上传16:9比例的图片，最多9张</div>
          </el-form-item>

          <el-form-item label="景点描述" prop="description">
            <el-input
              v-model="attractionForm.description"
              type="textarea"
              :rows="5"
              placeholder="请输入景点描述"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="开放时间" prop="openTime">
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

          <el-form-item label="门票价格">
            <el-input v-model.number="attractionForm.ticketPrice" placeholder="请输入门票价格" type="number">
              <template #prepend>¥</template>
            </el-input>
          </el-form-item>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model="attractionForm.contactPhone"
              placeholder="请输入11位手机号"
              maxlength="11"
              show-word-limit
              inputmode="numeric"
              @input="attractionForm.contactPhone = normalizeMobilePhone($event)"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handlePublishAttraction" :loading="publishing">发布景点</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>

        <!-- 酒店表单 -->
        <el-form v-if="publishType === 'hotel'" :model="hotelForm" :rules="hotelRules" ref="hotelFormRef" label-width="120px">
          <el-form-item label="酒店名称" prop="name">
            <el-input v-model="hotelForm.name" placeholder="请输入酒店名称" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="地区" prop="region">
            <el-select v-model="hotelForm.region" placeholder="请选择地区">
              <el-option label="荔城区" value="荔城区" />
              <el-option label="城厢区" value="城厢区" />
              <el-option label="涵江区" value="涵江区" />
              <el-option label="秀屿区" value="秀屿区" />
              <el-option label="湄洲岛" value="湄洲岛" />
              <el-option label="仙游县" value="仙游县" />
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

          <el-form-item label="酒店图片">
            <el-upload
              class="images-uploader"
              action="/api/file/upload?directory=hotel"
              list-type="picture-card"
              :file-list="hotelImageList"
              :on-success="handleHotelImageSuccess"
              :on-remove="handleHotelImageRemove"
              multiple
            >
              <el-icon class="uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议上传16:9比例的图片，最多9张</div>
          </el-form-item>

          <el-form-item label="酒店描述" prop="description">
            <el-input
              v-model="hotelForm.description"
              type="textarea"
              :rows="5"
              placeholder="请输入酒店描述"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="酒店星级">
            <el-rate v-model="hotelForm.starLevel" :max="5" show-score />
          </el-form-item>

          <el-form-item label="参考价格">
            <el-input v-model.number="hotelForm.price" placeholder="请输入每晚价格" type="number">
              <template #prepend>¥</template>
              <template #append>/晚</template>
            </el-input>
          </el-form-item>

          <el-form-item label="酒店设施">
            <el-checkbox-group v-model="hotelForm.facilities">
              <el-checkbox label="wifi">WiFi</el-checkbox>
              <el-checkbox label="parking">停车场</el-checkbox>
              <el-checkbox label="breakfast">早餐</el-checkbox>
              <el-checkbox label="pool">游泳池</el-checkbox>
              <el-checkbox label="gym">健身房</el-checkbox>
              <el-checkbox label="restaurant">餐厅</el-checkbox>
              <el-checkbox label="room_service">客房服务</el-checkbox>
              <el-checkbox label="airport_pickup">接送机</el-checkbox>
            </el-checkbox-group>
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

          <el-form-item>
            <el-button type="primary" @click="handlePublishHotel" :loading="publishing">发布酒店</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>

        <!-- 门票管理表单 -->
        <el-form v-if="publishType === 'ticket'" :model="ticketForm" :rules="ticketRules" ref="ticketFormRef" label-width="120px">
          <el-form-item label="选择景点" prop="attractionId">
            <el-select v-model="ticketForm.attractionId" placeholder="请选择要添加门票的景点" filterable>
              <el-option v-for="item in attractionListForTicket" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="门票名称" prop="ticketName">
            <el-input v-model="ticketForm.ticketName" placeholder="如：成人票、儿童票、学生票" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="票种类型" prop="ticketType">
            <el-select v-model="ticketForm.ticketType" placeholder="请选择票种类型">
              <el-option label="成人票" :value="1" />
              <el-option label="儿童票" :value="2" />
              <el-option label="学生票" :value="3" />
              <el-option label="老人票" :value="4" />
              <el-option label="团体票" :value="5" />
              <el-option label="优惠票" :value="6" />
            </el-select>
          </el-form-item>

          <el-form-item label="价格" prop="price">
            <el-input v-model.number="ticketForm.price" placeholder="请输入价格" type="number">
              <template #prepend>¥</template>
            </el-input>
          </el-form-item>

          <el-form-item label="有效期(天)" prop="validDays">
            <el-input-number v-model="ticketForm.validDays" :min="1" :max="365" />
          </el-form-item>

          <el-form-item label="描述">
            <el-input v-model="ticketForm.description" type="textarea" :rows="3" placeholder="请输入门票描述" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleAddTicket" :loading="publishing">添加门票</el-button>
            <el-button @click="resetTicketForm">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 门票列表（当选择门票管理时显示） -->
        <div v-if="publishType === 'ticket'" class="ticket-list-section">
          <h3>已添加的门票</h3>
          <el-table :data="myTicketList" stripe>
            <el-table-column prop="ticketName" label="门票名称" />
            <el-table-column prop="ticketType" label="票种类型" width="100">
              <template #default="{ row }">
                <el-tag>{{ getTicketTypeName(row.ticketType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                ¥{{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="validDays" label="有效期" width="100">
              <template #default="{ row }">
                {{ row.validDays }}天
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '上架' : '下架' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="danger" link @click="handleDeleteTicket(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- 我发布的列表 -->
      <el-card class="my-list-card" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <h3>我发布的{{ publishType === 'attraction' ? '景点' : '酒店' }}</h3>
          </div>
        </template>

        <el-table :data="myList" stripe>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="region" label="地区" />
          <el-table-column prop="viewCount" label="浏览量" width="100" />
          <el-table-column prop="collectCount" label="收藏数" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">下架</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatOpenTimeRange, normalizeMobilePhone, parseOpenTimeRange, validateMobilePhone } from '@/utils/attractionForm'
import MapLocationPicker from '@/components/MapLocationPicker.vue'

const router = useRouter()

// 用户信息
const userInfo = ref<any>(null)

// 发布类型
const publishType = ref('attraction')

// 发布状态
const publishing = ref(false)

// 景点表单
const attractionFormRef = ref()
const attractionForm = reactive({
  name: '',
  region: '',
  address: '',
  longitude: null as number | null,
  latitude: null as number | null,
  images: [] as string[],
  description: '',
  openTime: '',
  ticketPrice: null as number | null,
  contactPhone: ''
})

// 景点表单验证规则
const attractionRules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  description: [{ required: true, message: '请输入景点描述', trigger: 'blur' }],
  openTime: [{ required: true, message: '请选择开放时间', trigger: 'change' }],
  contactPhone: [{ validator: validateMobilePhone, trigger: 'blur' }]
}

const attractionOpenTimeRange = computed({
  get: () => parseOpenTimeRange(attractionForm.openTime),
  set: (value: string[]) => {
    attractionForm.openTime = formatOpenTimeRange(value)
  }
})

// 酒店表单
const hotelFormRef = ref()
const hotelForm = reactive({
  name: '',
  region: '',
  address: '',
  longitude: null as number | null,
  latitude: null as number | null,
  images: [] as string[],
  description: '',
  starLevel: 3,
  price: null as number | null,
  facilities: [] as string[],
  contactPhone: ''
})

// 酒店表单验证规则
const hotelRules = {
  name: [{ required: true, message: '请输入酒店名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  description: [{ required: true, message: '请输入酒店描述', trigger: 'blur' }],
  contactPhone: [{ validator: validateMobilePhone, trigger: 'blur' }]
}

// 门票表单
const ticketFormRef = ref()
const ticketForm = reactive({
  attractionId: null as number | null,
  ticketName: '',
  ticketType: 1,
  price: null as number | null,
  validDays: 1,
  description: ''
})

// 门票表单验证规则
const ticketRules = {
  attractionId: [{ required: true, message: '请选择景点', trigger: 'change' }],
  ticketName: [{ required: true, message: '请输入门票名称', trigger: 'blur' }],
  ticketType: [{ required: true, message: '请选择票种类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  validDays: [{ required: true, message: '请输入有效期', trigger: 'blur' }]
}

// 景点列表（用于门票选择）
const attractionListForTicket = ref<any[]>([])

// 门票列表
const myTicketList = ref<any[]>([])

// 图片列表
const attractionImageList = ref<any[]>([])
const hotelImageList = ref<any[]>([])

// 我发布的列表
const myList = ref<any[]>([])

// 加载用户信息
const loadUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr)
    // 检查是否是商家
    if (userInfo.value.userType !== 2 && userInfo.value.userType !== 4) {
      ElMessage.error('只有商家才能发布景点或酒店')
      router.push('/')
      return
    }
  } else {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
}

// 加载我发布的列表
const loadMyList = async () => {
  try {
    let api = ''
    if (publishType.value === 'attraction') {
      api = '/attraction/my-list'
    } else if (publishType.value === 'hotel') {
      api = '/hotel/my-list'
    } else if (publishType.value === 'ticket') {
      // 加载门票列表
      await loadMyTickets()
      return
    }
    
    if (api) {
      const res: any = await request.get(api)
      if (res.code === 200) {
        myList.value = res.data || []
      }
    }
  } catch (error) {
    console.error('加载列表失败', error)
  }
}

// 加载我发布的门票列表
const loadMyTickets = async () => {
  try {
    const res: any = await request.get('/ticket/my-list')
    if (res.code === 200) {
      myTicketList.value = res.data || []
    }
  } catch (error) {
    console.error('加载门票列表失败', error)
  }
}

// 加载景点列表（用于门票选择）
const loadAttractionsForTicket = async () => {
  try {
    const res: any = await request.get('/attraction/my-list')
    if (res.code === 200) {
      attractionListForTicket.value = res.data || []
    }
  } catch (error) {
    console.error('加载景点列表失败', error)
  }
}

// 获取票种类型名称
const getTicketTypeName = (ticketType: number) => {
  const typeMap: any = {
    1: '成人票',
    2: '儿童票',
    3: '学生票',
    4: '老人票',
    5: '团体票',
    6: '优惠票'
  }
  return typeMap[ticketType] || '未知'
}

// 添加门票
const handleAddTicket = async () => {
  await ticketFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      publishing.value = true
      try {
        const res: any = await request.post('/ticket/add', ticketForm)
        if (res.code === 200) {
          ElMessage.success('添加门票成功')
          resetTicketForm()
          loadMyTickets()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '添加失败')
      } finally {
        publishing.value = false
      }
    }
  })
}

// 重置门票表单
const resetTicketForm = () => {
  ticketForm.attractionId = null
  ticketForm.ticketName = ''
  ticketForm.ticketType = 1
  ticketForm.price = null
  ticketForm.validDays = 1
  ticketForm.description = ''
}

// 删除门票
const handleDeleteTicket = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该门票吗？', '提示', { type: 'warning' })
    const res: any = await request.delete(`/ticket/delete/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadMyTickets()
    }
  } catch (error) {
    // 用户取消
  }
}

// 景点图片上传成功
const handleAttractionImageSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    attractionForm.images.push(response.data.url)
    attractionImageList.value.push({ url: response.data.url, name: file.name })
    ElMessage.success('上传成功')
  }
}

// 景点图片删除
const handleAttractionImageRemove = (file: any) => {
  const index = attractionForm.images.indexOf(file.url)
  if (index > -1) {
    attractionForm.images.splice(index, 1)
  }
}

// 酒店图片上传成功
const handleHotelImageSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    hotelForm.images.push(response.data.url)
    hotelImageList.value.push({ url: response.data.url, name: file.name })
    ElMessage.success('上传成功')
  }
}

// 酒店图片删除
const handleHotelImageRemove = (file: any) => {
  const index = hotelForm.images.indexOf(file.url)
  if (index > -1) {
    hotelForm.images.splice(index, 1)
  }
}

// 发布类型切换
const handleTypeChange = () => {
  if (publishType.value === 'ticket') {
    // 切换到门票管理时，加载景点列表和门票列表
    loadAttractionsForTicket()
    loadMyTickets()
  } else {
    loadMyList()
  }
}

// 发布景点
const handlePublishAttraction = async () => {
  await attractionFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (attractionForm.images.length === 0) {
        ElMessage.warning('请上传景点图片')
        return
      }
      publishing.value = true
      try {
        const data = {
          ...attractionForm,
          images: JSON.stringify(attractionForm.images)
        }
        const res: any = await request.post('/attraction/add', data)
        if (res.code === 200) {
          ElMessage.success('发布成功')
          // 重置表单
          attractionForm.name = ''
          attractionForm.region = ''
          attractionForm.address = ''
          attractionForm.longitude = null
          attractionForm.latitude = null
          attractionForm.images = []
          attractionForm.description = ''
          attractionForm.openTime = ''
          attractionForm.ticketPrice = null
          attractionForm.contactPhone = ''
          attractionImageList.value = []
          // 重新加载列表
          loadMyList()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '发布失败')
      } finally {
        publishing.value = false
      }
    }
  })
}

// 发布酒店
const handlePublishHotel = async () => {
  await hotelFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (hotelForm.images.length === 0) {
        ElMessage.warning('请上传酒店图片')
        return
      }
      publishing.value = true
      try {
        const data = {
          ...hotelForm,
          images: JSON.stringify(hotelForm.images),
          facilities: hotelForm.facilities.join(',')
        }
        const res: any = await request.post('/hotel/add', data)
        if (res.code === 200) {
          ElMessage.success('发布成功')
          // 重置表单
          hotelForm.name = ''
          hotelForm.region = ''
          hotelForm.address = ''
          hotelForm.longitude = null
          hotelForm.latitude = null
          hotelForm.images = []
          hotelForm.description = ''
          hotelForm.starLevel = 3
          hotelForm.price = null
          hotelForm.facilities = []
          hotelForm.contactPhone = ''
          hotelImageList.value = []
          // 重新加载列表
          loadMyList()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '发布失败')
      } finally {
        publishing.value = false
      }
    }
  })
}

// 编辑
const handleEdit = (row: any) => {
  if (publishType.value === 'attraction') {
    router.push(`/attraction/edit/${row.id}`)
  } else {
    router.push(`/hotel/edit/${row.id}`)
  }
}

// 删除（下架）
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要下架该' + (publishType.value === 'attraction' ? '景点' : '酒店') + '吗？', '提示', {
      type: 'warning'
    })
    const api = publishType.value === 'attraction' ? '/attraction/delete' : '/hotel/delete'
    const res: any = await request.delete(`${api}/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('下架成功')
      loadMyList()
    }
  } catch (error) {
    // 用户取消
  }
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadUserInfo()
  loadMyList()
})
</script>

<style scoped lang="scss">
.merchant-publish-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
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
      color: #ff6b6b;
      cursor: pointer;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.publish-card {
  .card-header {
    h2 {
      margin: 0;
      font-size: 20px;
    }
  }
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.images-uploader {
  :deep(.el-upload-list__item) {
    width: 148px;
    height: 148px;
  }

  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
  }

  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 148px;
    height: 148px;
    line-height: 148px;
    text-align: center;
  }
}

.my-list-card {
  .card-header {
    h3 {
      margin: 0;
      font-size: 18px;
    }
  }
}
</style>
