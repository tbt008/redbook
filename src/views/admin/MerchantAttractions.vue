<template>
  <div class="merchant-attractions admin-theme-page">
    <div class="page-header">
      <h2 class="page-title">景点管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        发布景点
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="景点名称">
          <el-input v-model="searchForm.name" placeholder="请输入景点名称" style="width: 200px" clearable />
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

    <!-- 景点列表 -->
    <el-card class="table-card">
      <el-table :data="attractionList" v-loading="loading" stripe class="attraction-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="景点信息" width="300">
          <template #default="{ row }">
            <div class="attraction-info">
              <el-image :src="row.images ? JSON.parse(row.images)[0] : ''" :preview-src-list="row.images ? JSON.parse(row.images) : []" fit="cover" class="attraction-cover">
                <template #error>
                  <div class="image-slot"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div class="merchant-attraction-meta">
                <div class="name">{{ row.name }}</div>
                <div class="address">{{ row.region }} - {{ row.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="票种" width="100">
          <template #default="{ row }">
            <el-tag type="info" v-if="row.ticketCount">{{ row.ticketCount }}种</el-tag>
            <span v-else class="no-data">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="ticketPrice" label="门票价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.ticketPrice || '0' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled :max="5" />
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" size="small" @click="handleManageTickets(row)">票种管理</el-button>
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
        @size-change="loadAttractionList"
        @current-change="loadAttractionList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="750px">
      <el-form :model="attractionForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="景点名称" prop="name">
          <el-input v-model="attractionForm.name" placeholder="请输入景点名称" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="attractionForm.region" placeholder="请选择地区" style="width: 100%">
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
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
        <el-form-item label="景点描述" prop="description">
          <el-input v-model="attractionForm.description" type="textarea" :rows="3" placeholder="请输入景点描述" />
        </el-form-item>
        <el-form-item label="景点图片">
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

    <!-- 票种管理对话框 -->
    <el-dialog v-model="ticketDialogVisible" :title="`${currentAttractionName} - 票种管理`" width="900px">
      <div class="ticket-header">
        <el-button type="primary" @click="handleAddTicket">
          <el-icon><Plus /></el-icon> 添加票种
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
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="validDays" label="有效期" width="80">
          <template #default="{ row }">
            <span>{{ row.validDays }}天</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="100">
          <template #default="{ row }">
            <span>{{ (row.totalCount || 0) - (row.soldCount || 0) }}/{{ row.totalCount || '无限' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else type="danger">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
          <el-input v-model="ticketForm.ticketName" placeholder="请输入票种名称" />
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
          <el-input-number v-model="ticketForm.price" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="有效期">
          <el-input-number v-model="ticketForm.validDays" :min="1" :max="365" style="width: 200px" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="总票数">
          <el-input-number v-model="ticketForm.totalCount" :min="0" :max="100000" style="width: 200px" />
          <span style="margin-left: 10px">张（0表示无限制）</span>
        </el-form-item>
        <el-form-item label="票种描述">
          <el-input v-model="ticketForm.description" type="textarea" :rows="3" placeholder="请输入票种描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ticketFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTicketSubmit" :loading="ticketSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Picture, Delete, Plus } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatOpenTimeRange, normalizeMobilePhone, parseOpenTimeRange, validateMobilePhone } from '@/utils/attractionForm'
import MapLocationPicker from '@/components/MapLocationPicker.vue'
import { formatDateTime } from '@/util/datetime'

const loading = ref(false)
const submitting = ref(false)
const attractionList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('发布景点')
const formRef = ref<FormInstance>()
const fileInput = ref<HTMLInputElement>()
const isEdit = ref(false)

// 票种相关
const ticketDialogVisible = ref(false)
const ticketFormDialogVisible = ref(false)
const ticketLoading = ref(false)
const ticketSubmitting = ref(false)
const ticketFormRef = ref<FormInstance>()
const ticketList = ref<any[]>([])
const ticketFormTitle = ref('添加票种')
const currentAttractionId = ref<number | null>(null)
const currentAttractionName = ref('')
const isTicketEdit = ref(false)

const searchForm = reactive({
  name: '',
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
  longitude: null as number | null,
  latitude: null as number | null,
  openTime: '',
  contactPhone: '',
  description: '',
  images: '[]'
})

const imageList = computed(() => {
  try {
    return JSON.parse(attractionForm.images || '[]')
  } catch {
    return []
  }
})

const formRules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  openTime: [{ required: true, message: '请选择开放时间', trigger: 'change' }],
  contactPhone: [{ validator: validateMobilePhone, trigger: 'blur' }]
}

const attractionOpenTimeRange = computed({
  get: () => parseOpenTimeRange(attractionForm.openTime),
  set: (value: string[]) => {
    attractionForm.openTime = formatOpenTimeRange(value)
  }
})

// 票种表单
const ticketForm = reactive({
  id: null as number | null,
  attractionId: null as number | null,
  ticketName: '',
  ticketType: 1,
  price: 0,
  validDays: 1,
  description: '',
  totalCount: 0
})

const ticketFormRules = {
  ticketName: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  ticketType: [{ required: true, message: '请选择票种类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const loadAttractionList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/merchant/attractions', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        name: searchForm.name || undefined,
        status: searchForm.status,
        _t: Date.now()
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
  searchForm.name = ''
  searchForm.status = null
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '发布景点'
  attractionForm.id = null
  attractionForm.name = ''
  attractionForm.region = ''
  attractionForm.address = ''
  attractionForm.longitude = null
  attractionForm.latitude = null
  attractionForm.openTime = ''
  attractionForm.contactPhone = ''
  attractionForm.description = ''
  attractionForm.images = '[]'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑景点'
  attractionForm.id = row.id
  attractionForm.name = row.name
  attractionForm.region = row.region
  attractionForm.address = row.address
  attractionForm.longitude = row.longitude || null
  attractionForm.latitude = row.latitude || null
  attractionForm.openTime = row.openTime || ''
  attractionForm.contactPhone = normalizeMobilePhone(row.contactPhone)
  attractionForm.description = row.description || ''
  attractionForm.images = row.images || '[]'

  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除景点"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/merchant/attractions/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
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

const handleStatusChange = async (row: any) => {
  const action = row.status === 1 ? '下架' : '上架'
  const targetStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定要${action}景点"${row.name}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.put('/admin/merchant/attractions/status', null, {
      params: {
        id: row.id,
        status: targetStatus,
        _t: Date.now()
      }
    })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
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

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const method = isEdit.value ? 'put' : 'post'
        const res: any = await request({
          method,
          url: '/admin/merchant/attractions',
          data: attractionForm
        })
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
          dialogVisible.value = false
          setTimeout(() => {
            loadAttractionList()
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

// 票种管理相关方法
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
    const res: any = await request.get(`/admin/merchant/attractions/${currentAttractionId.value}/tickets`)
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
  ticketFormDialogVisible.value = true
}

const handleEditTicket = (row: any) => {
  isTicketEdit.value = true
  ticketFormTitle.value = '编辑票种'
  ticketForm.id = row.id
  ticketForm.attractionId = currentAttractionId.value
  ticketForm.ticketName = row.ticketName
  ticketForm.ticketType = row.ticketType
  ticketForm.price = row.price
  ticketForm.validDays = row.validDays || 1
  ticketForm.description = row.description || ''
  ticketForm.totalCount = row.totalCount || 0
  ticketFormDialogVisible.value = true
}

const handleDeleteTicket = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除票种"${row.ticketName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/merchant/attractions/tickets/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await loadTickets()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleTicketSubmit = async () => {
  if (!ticketFormRef.value) return

  await ticketFormRef.value.validate(async (valid) => {
    if (valid) {
      ticketSubmitting.value = true
      try {
        if (isTicketEdit.value) {
          const res: any = await request.put('/admin/merchant/attractions/tickets', ticketForm)
          if (res.code === 200) {
            ElMessage.success('更新成功')
            ticketFormDialogVisible.value = false
            await loadTickets()
          }
        } else {
          const res: any = await request.post('/admin/merchant/attractions/tickets', ticketForm)
          if (res.code === 200) {
            ElMessage.success('添加成功')
            ticketFormDialogVisible.value = false
            await loadTickets()
          }
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        ticketSubmitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadAttractionList()
})
</script>

<style scoped lang="scss">
.merchant-attractions {
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

      :deep(.el-rate) {
        height: 24px;
        line-height: 24px;
        overflow: hidden;
      }

      :deep(.el-table-fixed-column--right),
      :deep(.el-table__fixed-right),
      :deep(.el-table__fixed-right-patch) {
        background: #fff;
        z-index: 3;
      }
    }

    .attraction-info {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 68px;
      min-height: 60px;
      overflow: hidden;

      .attraction-cover {
        flex: 0 0 80px;
        width: 80px;
        height: 60px !important;
        max-height: 60px;
        border-radius: 4px;
        overflow: hidden;
      }

      .merchant-attraction-meta {
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

  .ticket-header {
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
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
