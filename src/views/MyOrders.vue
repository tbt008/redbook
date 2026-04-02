<template>
  <div class="my-orders">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="orders-container">
        <h2>我的订单</h2>
        
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部订单" name="all" />
          <el-tab-pane label="景点门票" name="type-1" />
          <el-tab-pane label="酒店预订" name="type-2" />
          <el-tab-pane label="美食预订" name="type-3" />
          <el-tab-pane label="待支付" name="status-0" />
          <el-tab-pane label="已支付" name="status-1" />
          <el-tab-pane label="已使用" name="status-2" />
          <el-tab-pane label="已取消" name="status-3" />
        </el-tabs>

        <div class="order-list">
          <div v-for="order in orderList" :key="order.id" class="order-card">
            <div class="order-header">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <div class="header-tags">
                <el-tag :type="getOrderTypeTag(order.orderType)" size="small">
                  {{ getOrderTypeText(order.orderType) }}
                </el-tag>
                <el-tag :type="getStatusType(order.orderStatus)" size="small">
                  {{ getStatusText(order.orderStatus) }}
                </el-tag>
              </div>
            </div>

            <div class="order-body">
              <div class="order-info">
                <!-- 门票订单 -->
                <template v-if="order.orderType === 1 || !order.orderType">
                  <h4>{{ order.ticketName }}</h4>
                  <div class="info-row">
                    <span>游玩日期：{{ order.visitDate }}</span>
                    <span>数量：{{ order.ticketCount }} 张</span>
                  </div>
                  <div class="info-row">
                    <span>游客：{{ order.visitorName }}</span>
                    <span>手机：{{ order.visitorPhone }}</span>
                  </div>
                </template>
                <!-- 酒店订单 -->
                <template v-else-if="order.orderType === 2">
                  <h4>🏨 {{ order.hotelName }}</h4>
                  <div class="info-row">
                    <span v-if="order.roomName">房型：{{ order.roomName }}</span>
                    <span v-else>房间数量：{{ order.roomCount }}间</span>
                    <span>入住日期：{{ formatDate(order.checkInDate) }}</span>
                  </div>
                  <div class="info-row">
                    <span>退房日期：{{ formatDate(order.checkOutDate) }}</span>
                    <span>入住人：{{ order.guestName }}</span>
                  </div>
                  <div class="info-row">
                    <span>电话：{{ order.guestPhone }}</span>
                  </div>
                </template>
                <!-- 美食订单 -->
                <template v-else-if="order.orderType === 3">
                  <h4>🍜 {{ order.foodName }}</h4>
                  <div v-if="order.foodPackageName" class="info-row package-info">
                    <el-tag type="warning" size="small">套餐：{{ order.foodPackageName }}</el-tag>
                  </div>
                  <div class="info-row">
                    <span>预订日期：{{ formatDate(order.bookingDate) }}</span>
                    <span>用餐时间：{{ order.mealTime }}</span>
                  </div>
                  <div class="info-row">
                    <span>用餐人数：{{ order.dinerCount }}人</span>
                    <span>联系人：{{ order.guestName }}</span>
                  </div>
                  <div class="info-row">
                    <span>电话：{{ order.guestPhone }}</span>
                    <span>配送状态：
                      <el-tag v-if="order.deliveryStatus === 0" type="info" size="small">待发货</el-tag>
                      <el-tag v-else-if="order.deliveryStatus === 1" type="warning" size="small">已发货</el-tag>
                      <el-tag v-else-if="order.deliveryStatus === 2" type="success" size="small">已收货</el-tag>
                      <el-tag v-else-if="order.deliveryStatus === 3" type="danger" size="small">已取消</el-tag>
                    </span>
                  </div>
                </template>
              </div>
              <div class="order-amount">
                <div class="amount">¥{{ order.totalAmount }}</div>
                <div class="time">{{ formatTime(order.createTime) }}</div>
              </div>
            </div>

            <div class="order-footer">
              <el-button v-if="order.orderStatus === 0" type="primary" @click="handlePay(order)">
                立即支付
              </el-button>
              <el-button v-if="order.orderStatus === 0" @click="handleCancel(order)">
                取消订单
              </el-button>
              <el-button v-if="order.orderStatus === 1 && order.orderType === 1" type="success" @click="viewETicket(order)">
                查看电子票
              </el-button>
              <el-button v-if="order.orderStatus === 1 && order.orderType === 2" type="success" @click="viewHotelDetail(order)">
                查看酒店
              </el-button>
              <el-button v-if="order.orderStatus === 1 && order.orderType === 3 && order.deliveryStatus === 1" type="success" @click="handleReceive(order)">
                确认收货
              </el-button>
              <el-button v-if="order.orderStatus === 1 && order.orderType === 3 && order.deliveryStatus === 2" type="info" disabled>
                已完成
              </el-button>
              <el-button @click="viewDetail(order)">订单详情</el-button>
            </div>
          </div>

          <div v-if="orderList.length === 0" class="empty">
            <el-empty description="暂无订单" />
          </div>
        </div>

        <el-pagination
          v-if="total > 0"
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </el-main>

    <!-- 支付对话框 -->
    <el-dialog v-model="payDialogVisible" title="订单支付" width="420px" destroy-on-close :close-on-click-modal="false">
      <div class="pay-dialog-content">
        <div class="pay-order-info">
          <div class="pay-order-title">
            {{ payingOrder?.ticketName || payingOrder?.roomName || payingOrder?.hotelName || payingOrder?.foodName || '订单支付' }}
          </div>
          <div class="pay-order-no">订单号：{{ payingOrder?.orderNo }}</div>
        </div>
        <div class="pay-amount">
          <span class="label">支付金额</span>
          <span class="amount">¥{{ payingOrder?.totalAmount }}</span>
        </div>
        <div class="pay-qrcode" v-if="payQrCodeUrl">
          <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
          <div class="qrcode-tip">请使用支付宝沙箱 App 扫描二维码完成支付。</div>
        </div>
        <div v-if="payingOrder?.expireTime" class="pay-expire">
          <el-icon><Clock /></el-icon>
          支付过期时间：{{ dayjs(payingOrder.expireTime).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
        <el-progress v-if="isPollingPay" :percentage="payPollProgress" :show-text="false" :stroke-width="6" />
        <div v-if="payStatusMessage" class="pay-status-message" :class="{ success: payStatusSuccess, error: !payStatusSuccess }">
          {{ payStatusMessage }}
        </div>
      </div>
      <template #footer>
        <el-button @click="closePayDialog">关闭</el-button>
        <el-button v-if="!paySuccess" type="primary" :loading="isGeneratingQrCode" @click="refreshPayQrCode">
          刷新二维码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import request from '@/util/request'
import dayjs from 'dayjs'

const router = useRouter()

const activeTab = ref('all')
const orderList = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 支付相关
const payDialogVisible = ref(false)
const payingOrder = ref<any>(null)
const payQrCodeUrl = ref('')
const isGeneratingQrCode = ref(false)
const isPollingPay = ref(false)
const payPollProgress = ref(0)
const payStatusMessage = ref('')
const payStatusSuccess = ref(false)
const paySuccess = ref(false)
let payPollingTimer: any = null

// 加载订单列表
const loadOrders = async () => {
  // 订单类型：1-门票，2-酒店，3-美食
  // 订单状态：0-待支付，1-已支付，2-已使用，3-已取消
  const typeStatusMap: Record<string, { type?: number; status?: number }> = {
    'all': {},
    'type-1': { type: 1 },
    'type-2': { type: 2 },
    'type-3': { type: 3 },
    'status-0': { status: 0 },
    'status-1': { status: 1 },
    'status-2': { status: 2 },
    'status-3': { status: 3 }
  }

  const filter = typeStatusMap[activeTab.value] || {}

  try {
    const res: any = await request.get('/order/list', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        orderType: filter.type,
        orderStatus: filter.status
      }
    })
    if (res && res.data) {
      orderList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载订单失败', error)
  }
}

// 切换标签
const handleTabChange = (tab: string) => {
  pageNum.value = 1
  loadOrders()
}

// 支付订单
const handlePay = async (order: any) => {
  payingOrder.value = order
  payDialogVisible.value = true
  payStatusMessage.value = ''
  payStatusSuccess.value = false
  paySuccess.value = false
  payQrCodeUrl.value = ''
  payPollProgress.value = 0

  await generatePayQrCode(order.orderNo)
}

// 生成支付宝支付二维码
const generatePayQrCode = async (orderNo: string) => {
  isGeneratingQrCode.value = true
  payStatusMessage.value = '正在生成支付宝支付二维码...'

  try {
    const res: any = await request.get(`/order/pay/qrcode/${orderNo}`)
    if (res && res.code === 200) {
      payQrCodeUrl.value = res.data.qrCodeUrl || ''
      if (!payQrCodeUrl.value) {
        throw new Error('未获取到支付宝支付二维码')
      }
      payStatusMessage.value = '请使用支付宝沙箱 App 扫码支付'
      startPayPolling(orderNo)
    } else {
      payStatusMessage.value = res.message || '生成支付二维码失败'
      payStatusSuccess.value = false
    }
  } catch (error: any) {
    payStatusMessage.value = error.message || '生成支付二维码失败'
    payStatusSuccess.value = false
  } finally {
    isGeneratingQrCode.value = false
  }
}

// 刷新支付二维码
const refreshPayQrCode = async () => {
  if (payingOrder.value) {
    await generatePayQrCode(payingOrder.value.orderNo)
  }
}

// 开始轮询支付状态
const startPayPolling = (orderNo: string) => {
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
  }

  isPollingPay.value = true
  payPollProgress.value = 0
  let pollCount = 0

  payPollingTimer = setInterval(async () => {
    pollCount++

    if (pollCount >= 60) {
      stopPayPolling()
      payStatusMessage.value = '支付超时，请重新发起支付'
      payStatusSuccess.value = false
      return
    }

    payPollProgress.value = Math.min((pollCount / 60) * 100, 95)

    try {
      const res: any = await request.get(`/order/pay/status/${orderNo}`)
      if (res && res.code === 200 && res.data) {
        if (res.data.paid || res.data.orderStatus === 1) {
          stopPayPolling()
          payPollProgress.value = 100
          payStatusMessage.value = '支付成功！'
          payStatusSuccess.value = true
          paySuccess.value = true

          setTimeout(() => {
            loadOrders()
            closePayDialog()
          }, 1500)
        }
      }
    } catch (error) {
      console.error('轮询支付状态失败', error)
    }
  }, 3000)
}

// 停止轮询
const stopPayPolling = () => {
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
    payPollingTimer = null
  }
  isPollingPay.value = false
}

// 关闭支付对话框
const closePayDialog = () => {
  stopPayPolling()
  payDialogVisible.value = false
  payQrCodeUrl.value = ''
  paySuccess.value = false
  payingOrder.value = null
}

// 确认收货
const handleReceive = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      '确定已收到外卖吗？',
      '确认收货',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const res: any = await request.post(`/order/receive/${order.orderNo}`)
    if (res && res.code === 200) {
      ElMessage.success('确认收货成功')
      loadOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认收货失败')
    }
  }
}

// 取消订单
const handleCancel = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res: any = await request.post(`/order/cancel/${order.orderNo}`)
    if (res && res.code === 200) {
      ElMessage.success('订单已取消')
      loadOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 查看电子票
const viewETicket = (order: any) => {
  router.push(`/eticket/${order.orderNo}`)
}

// 查看详情
const viewDetail = (order: any) => {
  ElMessage.info('订单详情功能开发中')
}

// 获取状态类型
const getStatusType = (status: number) => {
  const types: any = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'info',
    4: 'danger'
  }
  return types[status] || 'info'
}

// 获取订单类型标签类型
const getOrderTypeTag = (type: number) => {
  const types: any = {
    1: '',      // 门票 - 默认
    2: 'info',  // 酒店 - 灰色
    3: 'warning' // 美食 - 橙色
  }
  return types[type] || ''
}

// 获取订单类型文本
const getOrderTypeText = (type: number) => {
  const texts: any = {
    1: '门票',
    2: '酒店',
    3: '美食'
  }
  return texts[type] || '门票'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const texts: any = {
    0: '待支付',
    1: '已支付',
    2: '已使用',
    3: '已取消',
    4: '已退款'
  }
  return texts[status] || '未知'
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 格式化日期
const formatDate = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD')
}

// 查看酒店详情
const viewHotelDetail = (order: any) => {
  router.push(`/hotel/${order.hotelId}`)
}

// 查看餐厅详情
const viewFoodDetail = (order: any) => {
  router.push(`/food/${order.foodId}`)
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadOrders()
})

onUnmounted(() => {
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
  }
})
</script>

<style scoped lang="scss">
.my-orders {
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
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.orders-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  h2 {
    margin: 0 0 24px 0;
  }
}

.order-list {
  margin: 24px 0;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #f9f9f9;
    border-bottom: 1px solid #eee;

    .order-no {
      font-size: 14px;
      color: #666;
    }

    .header-tags {
      display: flex;
      gap: 8px;
    }
  }

  .order-body {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .order-info {
      flex: 1;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
      }

      .info-row {
        display: flex;
        gap: 32px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #666;
      }
    }

    .order-amount {
      text-align: right;

      .amount {
        font-size: 24px;
        font-weight: bold;
        color: #ff6b6b;
        margin-bottom: 8px;
      }

      .time {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    background: #f9f9f9;
    border-top: 1px solid #eee;
  }
}

.empty {
  padding: 60px 0;
  text-align: center;
}

.el-pagination {
  margin-top: 24px;
  justify-content: center;
}

// 支付对话框样式
.pay-dialog-content {
  text-align: center;
  padding: 20px 0;

  .pay-order-info {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;

    .pay-order-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .pay-order-no {
      font-size: 13px;
      color: #999;
    }
  }

  .pay-amount {
    margin-bottom: 24px;

    .label {
      font-size: 14px;
      color: #666;
      margin-right: 12px;
    }

    .amount {
      font-size: 28px;
      font-weight: 700;
      color: #ff6b6b;
    }
  }

  .pay-qrcode {
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    display: inline-block;

    .qrcode-tip {
      margin-top: 12px;
      font-size: 14px;
      color: #666;
    }
  }

  .pay-expire {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    color: #e6a23c;
    margin-bottom: 16px;
  }

  .pay-status-message {
    margin-top: 16px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;

    &.success {
      background: #f0f9eb;
      color: #67c23a;
    }

    &.error {
      background: #fef0f0;
      color: #f56c6c;
    }
  }

  :deep(.el-progress) {
    margin-top: 16px;
  }
}
</style>
