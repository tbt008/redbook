<template>
  <div class="merchant-orders admin-theme-page">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
    </div>

    <!-- 订单号核销 -->
    <el-card class="verify-card">
      <div class="verify-panel">
        <div class="verify-title">
          <span class="verify-heading">订单号核销</span>
          <span class="verify-subtitle">输入用户提供的订单号，系统会校验支付状态和商家归属</span>
        </div>
        <div class="verify-action">
          <el-input
            v-model.trim="verifyOrderNo"
            placeholder="请输入订单号"
            clearable
            class="verify-input"
            @keyup.enter="handleConfirmByOrderNo"
          />
          <el-button type="success" :loading="verifyLoading" @click="handleConfirmByOrderNo">
            核销
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单类型">
          <el-select v-model="searchForm.orderType" placeholder="全部" clearable style="width: 120px">
            <el-option label="门票订单" :value="1" />
            <el-option label="酒店订单" :value="2" />
            <el-option label="美食订单" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.orderStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已使用" :value="2" />
            <el-option label="已取消" :value="3" />
            <el-option label="已退款" :value="4" />
            <el-option label="退款审核中" :value="5" />
            <el-option label="已拒绝退款" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="订单号/商品名称" style="width: 200px" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table :data="orderList" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="订单类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.orderType === 2" type="primary">酒店</el-tag>
            <el-tag v-else-if="row.orderType === 3" type="warning">美食</el-tag>
            <el-tag v-else type="info">门票</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="200">
          <template #default="{ row }">
            <div class="product-info">
              <span>{{ row.foodName || row.hotelName || row.ticketName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.orderStatus === 0" type="warning">待支付</el-tag>
            <el-tag v-else-if="row.orderStatus === 1" type="success">已支付</el-tag>
            <el-tag v-else-if="row.orderStatus === 2" type="info">已使用</el-tag>
            <el-tag v-else-if="row.orderStatus === 3" type="danger">已取消</el-tag>
            <el-tag v-else-if="row.orderStatus === 4">已退款</el-tag>
            <el-tag v-else-if="row.orderStatus === 5" type="warning">退款审核中</el-tag>
            <el-tag v-else-if="row.orderStatus === 6" type="info">已拒绝退款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="核销状态" width="100">
          <template #default="{ row }">
            <template v-if="hasVerifyStatus(row)">
              <el-tag v-if="row.verifyStatus === 1" type="success">已核销</el-tag>
              <el-tag v-else type="info">未核销</el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="发货状态" width="100">
          <template #default="{ row }">
            <template v-if="hasDeliveryStatus(row)">
              <el-tag v-if="row.deliveryStatus === 0" type="info">待发货</el-tag>
              <el-tag v-else-if="row.deliveryStatus === 1" type="warning">已发货</el-tag>
              <el-tag v-else-if="row.deliveryStatus === 2" type="success">已收货</el-tag>
              <el-tag v-else-if="row.deliveryStatus === 3" type="danger">已取消</el-tag>
              <span v-else>-</span>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <!-- 美食订单：显示发货按钮 -->
            <el-button link type="warning" size="small" @click="handleDelivery(row)" v-if="row.orderType === 3 && row.orderStatus === 1 && row.deliveryStatus === 0">
              发货
            </el-button>
            <!-- 门票和酒店订单：显示核销按钮 -->
            <el-button link type="success" size="small" @click="handleConfirm(row)" v-if="row.orderType !== 3 && row.orderStatus === 1 && row.verifyStatus !== 1">
              核销
            </el-button>
            <el-button link type="success" size="small" @click="handleApproveRefund(row)" v-if="row.orderStatus === 5">
              同意退款
            </el-button>
            <el-button link type="danger" size="small" @click="handleRejectRefund(row)" v-if="row.orderStatus === 5">
              拒绝退款
            </el-button>
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
        @size-change="loadOrderList"
        @current-change="loadOrderList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <el-tag v-if="currentOrder.orderType === 2" type="primary">酒店</el-tag>
          <el-tag v-else-if="currentOrder.orderType === 3" type="warning">美食</el-tag>
          <el-tag v-else type="info">门票</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.foodName || currentOrder.hotelName || currentOrder.ticketName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="price">¥{{ currentOrder.totalAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag v-if="currentOrder.orderStatus === 0" type="warning">待支付</el-tag>
          <el-tag v-else-if="currentOrder.orderStatus === 1" type="success">已支付</el-tag>
          <el-tag v-else-if="currentOrder.orderStatus === 2" type="info">已使用</el-tag>
          <el-tag v-else-if="currentOrder.orderStatus === 3" type="danger">已取消</el-tag>
          <el-tag v-else-if="currentOrder.orderStatus === 4">已退款</el-tag>
          <el-tag v-else-if="currentOrder.orderStatus === 5" type="warning">退款审核中</el-tag>
          <el-tag v-else-if="currentOrder.orderStatus === 6" type="info">已拒绝退款</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="核销状态">
          <template v-if="hasVerifyStatus(currentOrder)">
            <el-tag v-if="currentOrder.verifyStatus === 1" type="success">已核销</el-tag>
            <el-tag v-else type="info">未核销</el-tag>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="发货状态">
          <template v-if="hasDeliveryStatus(currentOrder)">
            <el-tag v-if="currentOrder.deliveryStatus === 0" type="info">待发货</el-tag>
            <el-tag v-else-if="currentOrder.deliveryStatus === 1" type="warning">已发货</el-tag>
            <el-tag v-else-if="currentOrder.deliveryStatus === 2" type="success">已收货</el-tag>
            <el-tag v-else-if="currentOrder.deliveryStatus === 3" type="danger">已取消</el-tag>
            <span v-else>-</span>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>

        <!-- 美食订单信息 -->
        <template v-if="currentOrder.orderType === 3">
          <el-descriptions-item label="预订日期">{{ currentOrder.bookingDate }}</el-descriptions-item>
          <el-descriptions-item label="用餐人数">{{ currentOrder.dinerCount }}人</el-descriptions-item>
          <el-descriptions-item label="预订桌号">{{ currentOrder.tableNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用餐时间">{{ currentOrder.mealTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentOrder.guestName || currentOrder.visitorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.guestPhone || currentOrder.visitorPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.deliveryAddress || '-' }}</el-descriptions-item>
        </template>

        <!-- 酒店订单信息 -->
        <template v-if="currentOrder.orderType === 2">
          <el-descriptions-item label="入住日期">{{ currentOrder.checkInDate }}</el-descriptions-item>
          <el-descriptions-item label="退房日期">{{ currentOrder.checkOutDate }}</el-descriptions-item>
          <el-descriptions-item label="房间数量">{{ currentOrder.roomCount }}间</el-descriptions-item>
          <el-descriptions-item label="入住人">{{ currentOrder.guestName || '-' }}</el-descriptions-item>
        </template>

        <!-- 门票订单信息 -->
        <template v-if="currentOrder.orderType === 1">
          <el-descriptions-item label="游玩日期">{{ formatDateTime(currentOrder.visitDate, 'YYYY-MM-DD', '-') }}</el-descriptions-item>
          <el-descriptions-item label="购买数量">{{ currentOrder.ticketCount }}张</el-descriptions-item>
          <el-descriptions-item label="游客姓名">{{ currentOrder.visitorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.visitorPhone || '-' }}</el-descriptions-item>
        </template>

        <el-descriptions-item label="下单时间">{{ formatDateTime(currentOrder.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ formatDateTime(currentOrder.payTime, 'YYYY-MM-DD HH:mm:ss', '-') }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <!-- 美食订单：显示发货按钮 -->
        <el-button type="warning" @click="handleDelivery" v-if="currentOrder && currentOrder.orderType === 3 && currentOrder.orderStatus === 1 && currentOrder.deliveryStatus === 0">
          发货
        </el-button>
        <!-- 门票和酒店订单：显示核销按钮 -->
        <el-button type="success" @click="handleConfirm" v-if="currentOrder && currentOrder.orderType !== 3 && currentOrder.orderStatus === 1 && currentOrder.verifyStatus !== 1">
          核销订单
        </el-button>
        <el-button type="success" @click="handleApproveRefund" v-if="currentOrder && currentOrder.orderStatus === 5">
          同意退款
        </el-button>
        <el-button type="danger" @click="handleRejectRefund" v-if="currentOrder && currentOrder.orderStatus === 5">
          拒绝退款
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'

const loading = ref(false)
const verifyLoading = ref(false)
const verifyOrderNo = ref('')
const orderList = ref<any[]>([])
const detailDialogVisible = ref(false)
const currentOrder = ref<any>({})

const searchForm = reactive({
  orderType: null as number | null,
  orderStatus: null as number | null,
  keyword: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const hasVerifyStatus = (order: any) => {
  return order?.orderType !== 3
}

const hasDeliveryStatus = (order: any) => {
  return order?.orderType === 3 && order.deliveryStatus !== null && order.deliveryStatus !== undefined
}

const loadOrderList = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/admin/merchant/orders', {
      params: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        orderType: searchForm.orderType || undefined,
        orderStatus: searchForm.orderStatus ?? undefined,
        keyword: searchForm.keyword || undefined,
        _t: Date.now()
      }
    })
    if (res.code === 200) {
      orderList.value = res.data.list || res.data.records || []
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
  loadOrderList()
}

const handleReset = () => {
  searchForm.orderType = null
  searchForm.orderStatus = null
  searchForm.keyword = ''
  handleSearch()
}

const handleView = async (row: any) => {
  try {
    const res: any = await request.get(`/admin/merchant/orders/${row.id}`)
    if (res.code === 200) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载详情失败')
  }
}

const handleConfirm = async (row?: any) => {
  const order = row || currentOrder.value
  if (!order) return

  try {
    await ElMessageBox.confirm('确定要核销此订单吗？核销后订单状态将变更为已使用。', '确认核销', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.post(`/admin/merchant/orders/${order.id}/confirm`)
    if (res.code === 200) {
      ElMessage.success('核销成功')
      detailDialogVisible.value = false
      setTimeout(() => {
        loadOrderList()
      }, 100)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '核销失败')
    }
  }
}

const handleConfirmByOrderNo = async () => {
  const orderNo = verifyOrderNo.value.trim()
  if (!orderNo) {
    ElMessage.warning('请输入订单号')
    return
  }

  try {
    await ElMessageBox.confirm(`确定核销订单 ${orderNo} 吗？`, '订单号核销', {
      confirmButtonText: '确定核销',
      cancelButtonText: '取消',
      type: 'warning'
    })

    verifyLoading.value = true
    const res: any = await request.post('/admin/merchant/orders/confirm-by-no', null, {
      params: { orderNo }
    })
    if (res.code === 200) {
      ElMessage.success('核销成功')
      verifyOrderNo.value = ''
      detailDialogVisible.value = false
      loadOrderList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '核销失败')
    }
  } finally {
    verifyLoading.value = false
  }
}

const handleDelivery = async (row?: any) => {
  const order = row || currentOrder.value
  if (!order) return

  try {
    await ElMessageBox.confirm('确定要对此订单进行发货吗？', '确认发货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    const res: any = await request.post(`/order/delivery/${order.orderNo}`)
    if (res.code === 200) {
      ElMessage.success('发货成功')
      detailDialogVisible.value = false
      setTimeout(() => {
        loadOrderList()
      }, 100)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发货失败')
    }
  }
}

const handleApproveRefund = async (row?: any) => {
  const order = row || currentOrder.value
  if (!order) return

  try {
    await ElMessageBox.confirm('确定同意该订单退款吗？同意后订单状态将变为已退款。', '同意退款', {
      confirmButtonText: '同意退款',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.post(`/admin/merchant/orders/${order.id}/refund/approve`)
    if (res.code === 200) {
      ElMessage.success('已同意退款')
      detailDialogVisible.value = false
      loadOrderList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '退款审核失败')
    }
  }
}

const handleRejectRefund = async (row?: any) => {
  const order = row || currentOrder.value
  if (!order) return

  try {
    await ElMessageBox.confirm('确定拒绝该订单退款吗？拒绝后订单状态将变为已拒绝退款。', '拒绝退款', {
      confirmButtonText: '拒绝退款',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.post(`/admin/merchant/orders/${order.id}/refund/reject`)
    if (res.code === 200) {
      ElMessage.success('已拒绝退款')
      detailDialogVisible.value = false
      loadOrderList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '退款审核失败')
    }
  }
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped lang="scss">
.merchant-orders {
  .page-header {
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

  .verify-card {
    margin-bottom: 20px;

    .verify-panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .verify-title {
      min-width: 240px;
    }

    .verify-heading {
      display: block;
      margin-bottom: 6px;
      color: #1f2937;
      font-size: 17px;
      font-weight: 600;
    }

    .verify-subtitle {
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }

    .verify-action {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      gap: 12px;
    }

    .verify-input {
      max-width: 360px;
    }
  }

  .table-card {
    .product-info {
      span {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .price {
      color: #ff6b00;
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .merchant-orders {
    .verify-card {
      .verify-panel,
      .verify-action {
        align-items: stretch;
        flex-direction: column;
      }

      .verify-input {
        max-width: none;
      }
    }
  }
}
</style>
