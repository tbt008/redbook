<template>
  <div class="food-management">
    <h2 class="page-title">美食管理</h2>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="美食名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入美食名称" style="width: 200px" clearable />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="searchForm.region" placeholder="全部地区" clearable style="width: 150px">
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
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

    <!-- 操作栏 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 发布美食
          </el-button>
        </div>
      </template>

      <!-- 美食列表 -->
      <el-table :data="foodList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="美食信息" width="300">
          <template #default="{ row }">
            <div class="food-info">
              <el-image :src="row.images ? JSON.parse(row.images)[0] : ''" :preview-src-list="row.images ? JSON.parse(row.images) : []" fit="cover" style="width: 80px; height: 60px; border-radius: 4px">
                <template #error>
                  <div class="image-slot"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div class="food-detail">
                <div class="name">{{ row.name }}</div>
                <div class="address">{{ row.region }} - {{ row.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="人均消费" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.avgPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.rating || '0.0' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="80" />
        <el-table-column prop="commentCount" label="评论数" width="80" />
        <el-table-column label="外卖" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isTakeout === 1" type="success">支持</el-tag>
            <el-tag v-else type="info">不支持</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="100">
          <template #default="{ row }">
            <el-tag type="info" v-if="row.packageCount">{{ row.packageCount }}个</el-tag>
            <span v-else class="no-data">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else type="danger">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleManagePackages(row)">套餐管理</el-button>
            <el-button link type="info" size="small" @click="handleTakeoutToggle(row)">
              {{ row.isTakeout === 1 ? '关闭外卖' : '开启外卖' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            <el-button link type="warning" size="small" @click="handleStatusChange(row, 1)" v-if="row.status === 0">上架</el-button>
            <el-button link type="warning" size="small" @click="handleStatusChange(row, 0)" v-if="row.status === 1">下架</el-button>
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
        @size-change="loadFoodList"
        @current-change="loadFoodList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="foodForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="美食名称" prop="name">
          <el-input v-model="foodForm.name" placeholder="请输入美食名称" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="foodForm.region" placeholder="请选择地区" style="width: 100%">
            <el-option label="荔城区" value="荔城区" />
            <el-option label="城厢区" value="城厢区" />
            <el-option label="涵江区" value="涵江区" />
            <el-option label="秀屿区" value="秀屿区" />
            <el-option label="湄洲岛" value="湄洲岛" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="foodForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="人均消费" prop="avgPrice">
          <el-input-number v-model="foodForm.avgPrice" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元/人</span>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="foodForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="美食描述" prop="description">
          <el-input v-model="foodForm.description" type="textarea" :rows="4" placeholder="请输入美食描述" />
        </el-form-item>
        <el-form-item label="美食图片">
          <div class="image-upload-list" v-if="foodForm.images">
            <div v-for="(img, index) in JSON.parse(foodForm.images)" :key="index" class="image-item">
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

    <!-- 套餐管理对话框 -->
    <el-dialog v-model="packageDialogVisible" :title="`${currentFoodName} - 套餐管理`" width="900px" destroy-on-close>
      <div class="package-header">
        <el-button type="primary" @click="handleAddPackage">
          <el-icon><Plus /></el-icon> 添加套餐
        </el-button>
      </div>

      <el-table :data="packageList" v-loading="packageLoading" stripe style="margin-top: 15px">
        <el-table-column prop="packageName" label="套餐名称" min-width="120" />
        <el-table-column label="套餐类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.packageType === 1" type="primary">单人套餐</el-tag>
            <el-tag v-else-if="row.packageType === 2" type="success">双人套餐</el-tag>
            <el-tag v-else-if="row.packageType === 3" type="warning">家庭套餐</el-tag>
            <el-tag v-else-if="row.packageType === 4" type="danger">豪华套餐</el-tag>
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
            <el-button link type="primary" size="small" @click="handleEditPackage(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDeletePackage(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="packageDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑套餐对话框 -->
    <el-dialog v-model="packageFormDialogVisible" :title="packageFormTitle" width="600px" destroy-on-close>
      <el-form :model="packageForm" :rules="packageFormRules" ref="packageFormRef" label-width="100px">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input v-model="packageForm.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐类型" prop="packageType">
          <el-select v-model="packageForm.packageType" placeholder="请选择套餐类型" style="width: 100%">
            <el-option label="单人套餐" :value="1" />
            <el-option label="双人套餐" :value="2" />
            <el-option label="家庭套餐" :value="3" />
            <el-option label="豪华套餐" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="packageForm.price" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="packageForm.originalPrice" :min="0" :precision="2" style="width: 200px" />
          <span style="margin-left: 10px">元</span>
        </el-form-item>
        <el-form-item label="套餐描述">
          <el-input v-model="packageForm.description" type="textarea" :rows="3" placeholder="请输入套餐描述" />
        </el-form-item>
        <el-form-item label="套餐图片">
          <div v-if="packageForm.image" class="package-image-preview">
            <el-image :src="packageForm.image" fit="cover" style="width: 100px; height: 100px" />
            <el-button type="danger" size="small" circle @click="packageForm.image = ''" style="position: absolute; top: -5px; right: -5px">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" @click="triggerPackageImageUpload" v-else>
            <el-icon><Plus /></el-icon> 上传图片
          </el-button>
          <input type="file" ref="packageImageInput" accept="image/*" style="display: none" @change="handlePackageImageChange" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="packageFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePackageSubmit" :loading="packageSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Picture, Delete, Plus } from '@element-plus/icons-vue'
import request from '@/util/request'

const loading = ref(false)
const submitting = ref(false)
const foodList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('编辑美食')
const formRef = ref<FormInstance>()
const fileInput = ref<HTMLInputElement>()

const isEdit = ref(false)

// 套餐相关
const packageDialogVisible = ref(false)
const packageFormDialogVisible = ref(false)
const packageLoading = ref(false)
const packageSubmitting = ref(false)
const packageFormRef = ref<FormInstance>()
const packageImageInput = ref<HTMLInputElement>()
const packageList = ref<any[]>([])
const packageFormTitle = ref('添加套餐')
const currentFoodId = ref<number | null>(null)
const currentFoodName = ref('')
const isPackageEdit = ref(false)

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

const foodForm = reactive({
  id: null as number | null,
  name: '',
  region: '',
  address: '',
  avgPrice: 0,
  contactPhone: '',
  description: '',
  images: '[]'
})

const formRules = {
  name: [{ required: true, message: '请输入美食名称', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  avgPrice: [{ required: true, message: '请输入人均消费', trigger: 'blur' }]
}

// 套餐表单
const packageForm = reactive({
  id: null as number | null,
  foodId: null as number | null,
  packageName: '',
  packageType: 1,
  price: 0,
  originalPrice: null as number | null,
  description: '',
  image: ''
})

const packageFormRules = {
  packageName: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  packageType: [{ required: true, message: '请选择套餐类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const loadFoodList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/food/list', {
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
      foodList.value = res.data.list || res.data.records || []
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
  loadFoodList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.region = ''
  searchForm.status = null
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '发布美食'
  foodForm.id = null
  foodForm.name = ''
  foodForm.region = ''
  foodForm.address = ''
  foodForm.avgPrice = 0
  foodForm.contactPhone = ''
  foodForm.description = ''
  foodForm.images = '[]'

  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑美食'
  foodForm.id = row.id
  foodForm.name = row.name
  foodForm.region = row.region
  foodForm.address = row.address
  foodForm.avgPrice = row.avgPrice
  foodForm.contactPhone = row.contactPhone || ''
  foodForm.description = row.description || ''
  foodForm.images = row.images || '[]'

  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除美食"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/food/${row.id}`, {
      params: { _t: Date.now() }
    })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // 使用 setTimeout 确保 DOM 更新
      setTimeout(() => {
        loadFoodList()
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
    await ElMessageBox.confirm(`确定要${action}美食"${row.name}"吗？`, `确认${action}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.put(`/admin/food/status`, null, {
      params: { id: row.id, status, _t: Date.now() }
    })
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      // 使用 setTimeout 确保 DOM 更新
      setTimeout(() => {
        loadFoodList()
      }, 100)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 外卖开关
const handleTakeoutToggle = async (row: any) => {
  const action = row.isTakeout === 1 ? '关闭' : '开启'
  try {
    await ElMessageBox.confirm(`确定要${action}外卖功能吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.put('/admin/food/takeout', null, {
      params: { id: row.id, isTakeout: row.isTakeout === 1 ? 0 : 1, _t: Date.now() }
    })
    if (res.code === 200) {
      ElMessage.success(`${action}外卖成功`)
      // 使用 setTimeout 确保 DOM 更新
      setTimeout(() => {
        loadFoodList()
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
      const images = JSON.parse(foodForm.images || '[]')
      images.push(e.target?.result as string)
      foodForm.images = JSON.stringify(images)
    }
    reader.readAsDataURL(file)
  })

  target.value = ''
}

const removeImage = (index: number) => {
  const images = JSON.parse(foodForm.images || '[]')
  images.splice(index, 1)
  foodForm.images = JSON.stringify(images)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const url = isEdit.value ? '/admin/food/update' : '/admin/food/add'
        const res: any = await request.post(url, foodForm)
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          // 使用 setTimeout 确保 DOM 更新
          setTimeout(() => {
            loadFoodList()
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

// 套餐管理相关方法
const handleManagePackages = async (row: any) => {
  currentFoodId.value = row.id
  currentFoodName.value = row.name
  packageDialogVisible.value = true
  await loadPackages()
}

const loadPackages = async () => {
  if (!currentFoodId.value) return
  packageLoading.value = true
  try {
    const res: any = await request.get(`/admin/foods/${currentFoodId.value}/packages`)
    if (res.code === 200) {
      packageList.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载套餐失败')
  } finally {
    packageLoading.value = false
  }
}

const handleAddPackage = () => {
  isPackageEdit.value = false
  packageFormTitle.value = '添加套餐'
  packageForm.id = null
  packageForm.foodId = currentFoodId.value
  packageForm.packageName = ''
  packageForm.packageType = 1
  packageForm.price = 0
  packageForm.originalPrice = null
  packageForm.description = ''
  packageForm.image = ''
  packageFormDialogVisible.value = true
}

const handleEditPackage = (row: any) => {
  isPackageEdit.value = true
  packageFormTitle.value = '编辑套餐'
  packageForm.id = row.id
  packageForm.foodId = currentFoodId.value
  packageForm.packageName = row.packageName
  packageForm.packageType = row.packageType
  packageForm.price = row.price
  packageForm.originalPrice = row.originalPrice
  packageForm.description = row.description || ''
  packageForm.image = row.image || ''
  packageFormDialogVisible.value = true
}

const handleDeletePackage = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除套餐"${row.packageName}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.delete(`/admin/foods/packages/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await loadPackages()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const triggerPackageImageUpload = () => {
  packageImageInput.value?.click()
}

const handlePackageImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    packageForm.image = e.target?.result as string
  }
  reader.readAsDataURL(file)
  target.value = ''
}

const handlePackageSubmit = async () => {
  if (!packageFormRef.value) return

  await packageFormRef.value.validate(async (valid) => {
    if (valid) {
      packageSubmitting.value = true
      try {
        if (isPackageEdit.value) {
          const res: any = await request.put('/admin/foods/packages', packageForm)
          if (res.code === 200) {
            ElMessage.success('更新成功')
            packageFormDialogVisible.value = false
            await loadPackages()
          }
        } else {
          const res: any = await request.post('/admin/foods/packages', packageForm)
          if (res.code === 200) {
            ElMessage.success('添加成功')
            packageFormDialogVisible.value = false
            await loadPackages()
          }
        }
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        packageSubmitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadFoodList()
})
</script>

<style scoped lang="scss">
.food-management {
  .page-title {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: flex-end;
    }

    .food-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .food-detail {
        .name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .address {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .price {
      color: #ff6b00;
      font-weight: 600;
    }

    .table-info {
      .total {
        font-weight: 600;
        color: #1a5f4a;
      }

      .reserved {
        color: #999;
        font-size: 12px;
      }
    }

    .no-table {
      color: #999;
      font-size: 12px;
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
    background: #f5f7fa;
    color: #909399;
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
    color: #999;
    font-size: 12px;
  }

  .original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 12px;
  }
}
</style>

