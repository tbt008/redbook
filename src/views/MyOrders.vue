<template>
  <div class="my-orders">
    <el-header class="header app-topbar">
      <div class="header-content app-topbar__inner">
        <div class="brand-block" @click="goHome">
          <div class="brand-mark">PT</div>
          <div>
            <div class="brand-name">莆田文旅</div>
            <div class="brand-subtitle">订单中心</div>
          </div>
        </div>
        <el-button class="app-soft-button topbar-button" @click="goBack">返回上页</el-button>
      </div>
    </el-header>

    <el-main class="main-content app-main">
      <section class="orders-hero app-page-card">
        <div class="hero-copy">
          <p class="eyebrow">Travel Console</p>
          <h1 class="hero-title">我的订单</h1>
          <p class="hero-subtitle">
            统一管理景点门票、酒店预订和美食订单，关键信息优先展示，状态、时间和金额一眼就能看清。
          </p>

          <div class="hero-pills">
            <span class="hero-pill">本地化时间格式</span>
            <span class="hero-pill">更清晰的状态层级</span>
            <span class="hero-pill">移动端自适应布局</span>
          </div>
        </div>

        <div class="hero-aside">
          <div class="hero-stat primary">
            <span class="stat-label">订单总数</span>
            <strong class="stat-value">{{ total }}</strong>
            <span class="stat-note">已按当前筛选条件统计</span>
          </div>

          <div class="hero-stat">
            <span class="stat-label">当前视图</span>
            <strong class="stat-value stat-value--small">{{ getTabLabel(activeTab) }}</strong>
            <span class="stat-note">{{ activeDescription }}</span>
          </div>
        </div>
      </section>

      <section class="orders-shell app-page-card">
        <div class="tabs-wrap">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="全部订单" name="all" />
            <el-tab-pane label="景点门票" name="type-1" />
            <el-tab-pane label="酒店预订" name="type-2" />
            <el-tab-pane label="美食预订" name="type-3" />
            <el-tab-pane label="待支付" name="status-0" />
            <el-tab-pane label="已支付" name="status-1" />
            <el-tab-pane label="已使用" name="status-2" />
            <el-tab-pane label="已取消" name="status-3" />
            <el-tab-pane label="已退款" name="status-4" />
            <el-tab-pane label="退款审核中" name="status-5" />
            <el-tab-pane label="已拒绝退款" name="status-6" />
          </el-tabs>
        </div>

        <div v-if="orderList.length" class="order-list">
          <article
            v-for="order in orderList"
            :key="order.id"
            class="order-card"
            :class="`order-card--type-${order.orderType || 0}`"
          >
            <div class="order-card__accent" />

            <div class="order-card__head">
              <div class="order-head-main">
                <div class="order-meta-top">
                  <span class="order-no">订单号 {{ order.orderNo }}</span>
                  <span class="order-time">创建于 {{ formatTime(order.createTime) }}</span>
                </div>
                <button
                  v-if="canViewContentHome(order)"
                  type="button"
                  class="order-title order-title-button"
                  :title="`进入${getOrderTypeText(order.orderType)}主页`"
                  @click="viewContentHome(order)"
                >
                  {{ getOrderTitle(order) }}
                </button>
                <h3 v-else class="order-title">{{ getOrderTitle(order) }}</h3>
                <p class="order-summary">{{ getOrderSummary(order) }}</p>
              </div>

              <div class="order-badges">
                <el-tag :type="getOrderTypeTag(order.orderType)" effect="light" round>
                  {{ getOrderTypeText(order.orderType) }}
                </el-tag>
                <el-tag :type="getStatusType(order.orderStatus)" effect="light" round>
                  {{ getStatusText(order.orderStatus) }}
                </el-tag>
              </div>
            </div>

            <div class="order-card__body">
              <div class="order-details">
                <div v-for="item in getOrderDetails(order)" :key="item.label" class="detail-chip">
                  <span class="detail-chip__label">{{ item.label }}</span>
                  <span class="detail-chip__value">{{ item.value }}</span>
                </div>
              </div>

              <aside class="order-side">
                <div class="order-side__panel">
                  <span class="amount-label">订单金额</span>
                  <strong class="amount-value">¥{{ formatAmount(order.totalAmount) }}</strong>
                  <span class="amount-caption">{{ getAmountCaption(order) }}</span>
                </div>

                <div v-if="order.expireTime && order.orderStatus === 0" class="expire-banner">
                  <el-icon><Clock /></el-icon>
                  <span>支付截止 {{ formatTime(order.expireTime) }}</span>
                </div>
              </aside>
            </div>

            <div class="order-card__foot">
              <div class="foot-tip">{{ getOrderFootnote(order) }}</div>

              <div class="order-actions">
                <el-button v-if="order.orderStatus === 0" type="primary" class="app-soft-button" @click="handlePay(order)">
                  立即支付
                </el-button>
                <el-button v-if="order.orderStatus === 0" class="app-soft-button" @click="handleCancel(order)">
                  取消订单
                </el-button>
                <el-button
                  v-if="order.orderStatus === 1 && order.orderType === 1"
                  type="success"
                  plain
                  class="app-soft-button"
                  @click="viewETicket(order)"
                >
                  查看详情
                </el-button>
                <el-button
                  v-if="order.orderStatus === 1 && order.orderType === 2"
                  type="success"
                  plain
                  class="app-soft-button"
                  @click="viewHotelDetail(order)"
                >
                  查看酒店
                </el-button>
                <el-button
                  v-if="order.orderStatus === 1 && order.orderType === 3 && order.deliveryStatus === 1"
                  type="success"
                  plain
                  class="app-soft-button"
                  @click="handleReceive(order)"
                >
                  确认收货
                </el-button>
                <el-button
                  v-if="order.orderStatus === 1"
                  type="warning"
                  plain
                  class="app-soft-button"
                  @click="handleRefund(order)"
                >
                  申请退款
                </el-button>
                <el-button class="app-soft-button" @click="viewDetail(order)">
                  查看详情
                </el-button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <el-empty description="暂无订单数据" />
        </div>

        <div v-if="total > 0" class="pagination-wrap">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadOrders"
          />
        </div>
      </section>
    </el-main>

    <el-dialog v-model="payDialogVisible" title="订单支付" width="420px" destroy-on-close :close-on-click-modal="false">
      <div class="pay-dialog-content">
        <div class="pay-order-info">
          <div class="pay-order-title">{{ payingOrder ? getOrderTitle(payingOrder) : '订单支付' }}</div>
          <div class="pay-order-no">订单号：{{ payingOrder?.orderNo }}</div>
        </div>

        <div class="pay-amount">
          <span class="label">支付金额</span>
          <span class="amount">¥{{ formatAmount(payingOrder?.totalAmount) }}</span>
        </div>

        <PaymentMethodCard />

        <div v-if="payQrCodeUrl" class="pay-qrcode">
          <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
          <div class="qrcode-tip">请使用支付宝沙箱 App 扫码完成支付</div>
        </div>

        <div v-if="payingOrder?.expireTime" class="pay-expire">
          <el-icon><Clock /></el-icon>
          <span>支付截止时间：{{ formatTime(payingOrder.expireTime) }}</span>
        </div>

        <el-progress v-if="isPollingPay" :percentage="payPollProgress" :show-text="false" :stroke-width="6" />

        <div v-if="payStatusMessage" class="pay-status-message" :class="{ success: payStatusSuccess, error: !payStatusSuccess }">
          {{ payStatusMessage }}
        </div>
      </div>

      <template #footer>
        <el-button class="app-soft-button" @click="closePayDialog">关闭</el-button>
        <el-button
          v-if="!paySuccess"
          type="primary"
          class="app-soft-button"
          :loading="isGeneratingQrCode"
          @click="refreshPayQrCode"
        >
          刷新二维码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateOnly, formatDateTime, type DateInput } from '@/utils/date'
import { buildPayQrCodeUrl } from '@/utils/payQrCode'
import PaymentMethodCard from '@/components/PaymentMethodCard.vue'

type OrderRecord = {
  id?: number | string
  orderNo: string
  orderType: number
  orderStatus: number
  totalAmount?: number | string
  createTime?: DateInput
  expireTime?: DateInput
  deliveryStatus?: number
  deliveryAddress?: string
  ticketName?: string
  ticketId?: number | string
  attractionId?: number | string
  hotelName?: string
  foodName?: string
  hotelId?: number | string
  foodId?: number | string
  checkInDate?: DateInput
  checkOutDate?: DateInput
  guestName?: string
  guestPhone?: string
  roomName?: string
  roomCount?: number
  bookingDate?: DateInput
  mealTime?: string
  dinerCount?: number
  visitDate?: DateInput
  ticketCount?: number
  visitorName?: string
  visitorPhone?: string
}

const router = useRouter()

const activeTab = ref('all')
const orderList = ref<OrderRecord[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const payDialogVisible = ref(false)
const payingOrder = ref<OrderRecord | null>(null)
const payQrCodeUrl = ref('')
const isGeneratingQrCode = ref(false)
const isPollingPay = ref(false)
const payPollProgress = ref(0)
const payStatusMessage = ref('')
const payStatusSuccess = ref(false)
const paySuccess = ref(false)
let payPollingTimer: ReturnType<typeof setInterval> | null = null

const tabLabelMap: Record<string, string> = {
  all: '全部订单',
  'type-1': '景点门票',
  'type-2': '酒店预订',
  'type-3': '美食预订',
  'status-0': '待支付',
  'status-1': '已支付',
  'status-2': '已使用',
  'status-3': '已取消',
  'status-4': '已退款',
  'status-5': '退款审核中',
  'status-6': '已拒绝退款'
}

const activeDescription = computed(() => {
  const descriptionMap: Record<string, string> = {
    all: '查看你所有的旅游消费记录',
    'type-1': '门票订单会优先展示游玩日期和订单详情入口',
    'type-2': '酒店订单会突出入住与离店信息',
    'type-3': '美食订单会展示预订时间与联系人信息',
    'status-0': '优先处理未完成支付的订单',
    'status-1': '已完成支付，等待消费或履约',
    'status-2': '订单已经使用或完成核销',
    'status-3': '已取消订单仅保留查看记录',
    'status-4': '商家已同意退款',
    'status-5': '退款申请已提交，等待商家审核',
    'status-6': '商家已拒绝退款'
  }
  return descriptionMap[activeTab.value] || descriptionMap.all
})

const getTabLabel = (tab: string) => tabLabelMap[tab] || '全部订单'

const loadOrders = async () => {
  const typeStatusMap: Record<string, { type?: number; status?: number }> = {
    all: {},
    'type-1': { type: 1 },
    'type-2': { type: 2 },
    'type-3': { type: 3 },
    'status-0': { status: 0 },
    'status-1': { status: 1 },
    'status-2': { status: 2 },
    'status-3': { status: 3 },
    'status-4': { status: 4 },
    'status-5': { status: 5 },
    'status-6': { status: 6 }
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

    if (res?.data) {
      orderList.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      orderList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载订单失败', error)
    ElMessage.error('订单数据加载失败')
  }
}

const handleTabChange = () => {
  pageNum.value = 1
  loadOrders()
}

const formatAmount = (amount?: number | string) => {
  if (amount === undefined || amount === null || amount === '') return '--'
  const numericAmount = Number(amount)
  return Number.isNaN(numericAmount) ? String(amount) : numericAmount.toFixed(2)
}

const formatTime = (time?: DateInput) => formatDateTime(time, '时间待确认')
const formatDate = (time?: DateInput) => formatDateOnly(time, '待确认')

const getOrderTitle = (order: OrderRecord) => {
  if (order.orderType === 2) return order.hotelName || '酒店订单'
  if (order.orderType === 3) return order.foodName || '美食订单'
  return order.ticketName || '门票订单'
}

const getContentHomePath = (order: OrderRecord) => {
  if (order.orderType === 2 && order.hotelId) return `/hotel/${order.hotelId}`
  if (order.orderType === 3 && order.foodId) return `/food/${order.foodId}`
  if (order.orderType === 1 && order.attractionId) return `/attraction/${order.attractionId}`
  return ''
}

const canViewContentHome = (order: OrderRecord) =>
  Boolean(getContentHomePath(order) || (order.orderType === 1 && order.ticketId))

const viewContentHome = async (order: OrderRecord) => {
  const path = getContentHomePath(order)
  if (path) {
    router.push(path)
    return
  }

  if (order.orderType === 1 && order.ticketId) {
    try {
      const res: any = await request.get(`/ticket/${order.ticketId}`)
      const attractionId = res?.data?.attractionId
      if (attractionId) {
        order.attractionId = attractionId
        router.push(`/attraction/${attractionId}`)
        return
      }
    } catch (error) {
      console.error('加载门票关联景点失败', error)
    }
  }

  ElMessage.info('暂未找到对应内容主页')
}

const getOrderSummary = (order: OrderRecord) => {
  if (order.orderType === 2) {
    return `入住时间 ${formatDate(order.checkInDate)} 至 ${formatDate(order.checkOutDate)}`
  }
  if (order.orderType === 3) {
    return `预订日期 ${formatDate(order.bookingDate)}，用餐时间 ${order.mealTime || '待确认'}`
  }
  return `游玩日期 ${formatDate(order.visitDate)}，出行人 ${order.visitorName || '待补充'}`
}

const getOrderDetails = (order: OrderRecord) => {
  if (order.orderType === 2) {
    return [
      { label: '入住日期', value: formatDate(order.checkInDate) },
      { label: '离店日期', value: formatDate(order.checkOutDate) },
      { label: '入住人', value: order.guestName || '-' },
      { label: '房型信息', value: order.roomName || `${order.roomCount || 1} 间客房` },
      { label: '联系电话', value: order.guestPhone || '-' }
    ]
  }

  if (order.orderType === 3) {
    return [
      { label: '预订日期', value: formatDate(order.bookingDate) },
      { label: '用餐时间', value: order.mealTime || '-' },
      { label: '用餐人数', value: order.dinerCount ? `${order.dinerCount} 人` : '-' },
      { label: '联系人', value: order.guestName || order.visitorName || '-' },
      { label: '联系电话', value: order.guestPhone || order.visitorPhone || '-' },
      { label: '收货地址', value: order.deliveryAddress || '-' }
    ]
  }

  return [
    { label: '游玩日期', value: formatDate(order.visitDate) },
    { label: '购票数量', value: order.ticketCount ? `${order.ticketCount} 张` : '-' },
    { label: '出行人', value: order.visitorName || '-' },
    { label: '联系电话', value: order.visitorPhone || '-' }
  ]
}

const getOrderFootnote = (order: OrderRecord) => {
  if (order.orderType === 2) return '酒店订单建议在出行前再次核对入住日期、入住人和联系电话。'
  if (order.orderType === 3) return '美食订单可在商家发货后确认收货，也可随时返回查看预订信息。'
  return '门票订单支付完成后可查看订单详情，出行前请核对游玩日期和联系人信息。'
}

const getAmountCaption = (order: OrderRecord) => {
  if (order.orderStatus === 0) return '订单尚未完成支付'
  if (order.orderStatus === 1) return '订单已支付，等待使用'
  if (order.orderStatus === 2) return '订单已完成核销'
  if (order.orderStatus === 3) return '该订单已取消'
  if (order.orderStatus === 4) return '商家已同意退款'
  if (order.orderStatus === 5) return '退款申请已提交，等待商家审核'
  if (order.orderStatus === 6) return '商家已拒绝退款'
  return '查看订单状态详情'
}

const handlePay = async (order: OrderRecord) => {
  payingOrder.value = order
  payDialogVisible.value = true
  payStatusMessage.value = ''
  payStatusSuccess.value = false
  paySuccess.value = false
  payQrCodeUrl.value = ''
  payPollProgress.value = 0
  await generatePayQrCode(order.orderNo)
}

const generatePayQrCode = async (orderNo: string) => {
  isGeneratingQrCode.value = true
  payStatusMessage.value = '正在生成支付二维码...'
  payStatusSuccess.value = false

  try {
    const res: any = await request.get(`/order/pay/qrcode/${orderNo}`)

    if (res?.code === 200) {
      payQrCodeUrl.value = await buildPayQrCodeUrl(res.data)
      if (!payQrCodeUrl.value) {
        throw new Error('未获取到支付二维码')
      }
      payStatusMessage.value = res.data?.scanTip || '请使用支付宝沙箱 App 和沙箱买家账号扫码，普通支付宝会提示订单不存在'
      startPayPolling(orderNo)
    } else {
      payStatusMessage.value = res?.message || '生成支付二维码失败'
    }
  } catch (error: any) {
    payStatusMessage.value = error?.message || '生成支付二维码失败'
  } finally {
    isGeneratingQrCode.value = false
  }
}

const refreshPayQrCode = async () => {
  if (payingOrder.value) {
    await generatePayQrCode(payingOrder.value.orderNo)
  }
}

const stopPayPolling = () => {
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
    payPollingTimer = null
  }
  isPollingPay.value = false
}

const startPayPolling = (orderNo: string) => {
  stopPayPolling()
  isPollingPay.value = true
  payPollProgress.value = 0
  let pollCount = 0
  let requestPending = false
  let successHandled = false

  payPollingTimer = setInterval(async () => {
    if (requestPending || successHandled) return

    pollCount += 1

    if (pollCount >= 60) {
      stopPayPolling()
      payStatusMessage.value = '支付超时，请重新发起支付'
      payStatusSuccess.value = false
      return
    }

    payPollProgress.value = Math.min((pollCount / 60) * 100, 95)

    try {
      requestPending = true
      const res: any = await request.get(`/order/pay/status/${orderNo}`)
      if (res?.code === 200 && res.data && (res.data.paid || res.data.orderStatus === 1)) {
        successHandled = true
        stopPayPolling()
        payPollProgress.value = 100
        payStatusMessage.value = '支付成功'
        payStatusSuccess.value = true
        paySuccess.value = true

        setTimeout(() => {
          loadOrders()
          closePayDialog()
        }, 1500)
      }
    } catch (error) {
      console.error('轮询支付状态失败', error)
    } finally {
      requestPending = false
    }
  }, 3000)
}

const closePayDialog = () => {
  stopPayPolling()
  payDialogVisible.value = false
  payQrCodeUrl.value = ''
  paySuccess.value = false
  payingOrder.value = null
}

const handleReceive = async (order: OrderRecord) => {
  try {
    await ElMessageBox.confirm('确认已经收到该订单商品了吗？', '确认收货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    })

    const res: any = await request.post(`/order/receive/${order.orderNo}`)
    if (res?.code === 200) {
      ElMessage.success('确认收货成功')
      loadOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '确认收货失败')
    }
  }
}

const handleCancel = async (order: OrderRecord) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.post(`/order/cancel/${order.orderNo}`)
    if (res?.code === 200) {
      ElMessage.success('订单已取消')
      loadOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '取消订单失败')
    }
  }
}

const handleRefund = async (order: OrderRecord) => {
  try {
    await ElMessageBox.confirm('确定要申请退货退款吗？提交后需要等待商家审核。', '申请退款', {
      confirmButtonText: '提交申请',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res: any = await request.post(`/order/refund/request/${order.orderNo}`)
    if (res?.code === 200) {
      ElMessage.success('退款申请已提交，等待商家审核')
      loadOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '申请退款失败')
    }
  }
}

const viewETicket = (order: OrderRecord) => {
  router.push(`/eticket/${order.orderNo}`)
}

const viewHotelDetail = (order: OrderRecord) => {
  router.push(`/hotel/${order.hotelId}`)
}

const viewDetail = (order: OrderRecord) => {
  const contentHomePath = getContentHomePath(order)
  if (contentHomePath) {
    router.push(contentHomePath)
    return
  }
  if (order.orderType === 1) {
    viewETicket(order)
    return
  }
  ElMessage.info('该订单暂未配置详情页')
}

const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger',
    4: 'danger',
    5: 'warning',
    6: 'info'
  }
  return types[status] || 'info'
}

const getOrderTypeTag = (type: number) => {
  const types: Record<number, string> = {
    1: 'primary',
    2: 'warning',
    3: 'success'
  }
  return types[type] || 'info'
}

const getOrderTypeText = (type: number) => {
  const texts: Record<number, string> = {
    1: '门票',
    2: '酒店',
    3: '美食'
  }
  return texts[type] || '订单'
}

const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已使用',
    3: '已取消',
    4: '已退款',
    5: '退款审核中',
    6: '已拒绝退款'
  }
  return texts[status] || '未知状态'
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadOrders()
})

onUnmounted(() => {
  stopPayPolling()
})
</script>

<style scoped lang="scss">
.my-orders {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(31, 111, 95, 0.18), transparent 24%),
    radial-gradient(circle at 85% 12%, rgba(226, 162, 78, 0.18), transparent 18%),
    linear-gradient(180deg, #f5f7f1 0%, #edf2ec 46%, #eef1ea 100%);
}

.header {
  padding: 0;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.16em;
  background: linear-gradient(135deg, #17594d 0%, #2f8a75 100%);
  box-shadow: 0 14px 30px rgba(31, 111, 95, 0.25);
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #18362e;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7b8a86;
}

.topbar-button {
  padding-inline: 20px;
}

.orders-hero,
.orders-shell {
  overflow: hidden;
}

.orders-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(300px, 420px);
  gap: 28px;
  padding: 32px;
  margin-bottom: 22px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 249, 246, 0.98) 60%, rgba(234, 244, 239, 0.96) 100%);
}

.orders-hero::after {
  content: '';
  position: absolute;
  inset: auto -40px -60px auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(31, 111, 95, 0.12), transparent 68%);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7d8d88;
}

.hero-title {
  margin: 0;
  font-size: 38px;
  line-height: 1.05;
  color: #18362e;
}

.hero-subtitle {
  max-width: 680px;
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: #617571;
}

.hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.hero-pill {
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #1f6f5f;
  background: rgba(31, 111, 95, 0.1);
  border: 1px solid rgba(31, 111, 95, 0.1);
}

.hero-aside {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 14px;
}

.hero-stat {
  padding: 20px 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.hero-stat.primary {
  color: #fff;
  background: linear-gradient(135deg, #1a6657 0%, #2d8c74 100%);
  box-shadow: 0 22px 36px rgba(31, 111, 95, 0.22);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: inherit;
  opacity: 0.72;
}

.stat-value {
  display: block;
  margin-top: 10px;
  font-size: 32px;
  line-height: 1;
  color: inherit;
}

.stat-value--small {
  font-size: 22px;
  line-height: 1.3;
}

.stat-note {
  display: block;
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: inherit;
  opacity: 0.82;
}

.orders-shell {
  padding: 24px;
}

.tabs-wrap {
  margin-bottom: 20px;

  :deep(.el-tabs__header) {
    margin-bottom: 14px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background: rgba(15, 23, 42, 0.07);
  }

  :deep(.el-tabs__item) {
    height: 44px;
    padding: 0 18px;
    font-weight: 600;
    color: #6f7e7c;
  }

  :deep(.el-tabs__item.is-active) {
    color: #1f6f5f;
  }

  :deep(.el-tabs__active-bar) {
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, #1f6f5f, #2f8a75);
  }
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.order-card {
  position: relative;
  border-radius: 28px;
  padding: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 250, 0.98));
  border: 1px solid rgba(15, 23, 42, 0.07);
  box-shadow: 0 20px 42px rgba(18, 28, 45, 0.06);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 48px rgba(18, 28, 45, 0.1);
}

.order-card__accent {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 72px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #1f6f5f, #58a38f);
}

.order-card--type-2 .order-card__accent {
  background: linear-gradient(90deg, #c98621, #e2b055);
}

.order-card--type-3 .order-card__accent {
  background: linear-gradient(90deg, #24775b, #57b185);
}

.order-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-top: 12px;
}

.order-head-main {
  min-width: 0;
}

.order-meta-top {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-bottom: 10px;
}

.order-no,
.order-time {
  font-size: 13px;
  color: #80908b;
}

.order-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  color: #18362e;
}

.order-title-button {
  display: inline;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.order-title-button:hover,
.order-title-button:focus-visible {
  color: #1f6f5f;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.order-title-button:focus-visible {
  outline: 2px solid rgba(31, 111, 95, 0.35);
  outline-offset: 4px;
  border-radius: 6px;
}

.order-summary {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #637672;
}

.order-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.order-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 20px;
  margin-top: 22px;
}

.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.detail-chip {
  padding: 15px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(247, 250, 248, 0.96), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.detail-chip__label {
  display: block;
  font-size: 12px;
  color: #879692;
}

.detail-chip__value {
  display: block;
  margin-top: 7px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  color: #24312e;
}

.order-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-side__panel {
  height: 100%;
  min-height: 146px;
  padding: 18px 18px 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, #18362e 0%, #21473d 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.amount-label {
  display: block;
  font-size: 12px;
  opacity: 0.72;
}

.amount-value {
  display: block;
  margin-top: 12px;
  font-size: 34px;
  line-height: 1;
  font-weight: 800;
}

.amount-caption {
  display: block;
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.8;
}

.expire-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: #9a6417;
  background: rgba(226, 162, 78, 0.12);
}

.order-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.foot-tip {
  max-width: 520px;
  font-size: 13px;
  line-height: 1.7;
  color: #74837f;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.empty-state {
  padding: 50px 0 24px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.pay-dialog-content {
  padding: 16px 0;
  text-align: center;
}

.pay-order-info {
  padding-bottom: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.pay-order-title {
  font-size: 18px;
  font-weight: 700;
  color: #18362e;
}

.pay-order-no {
  margin-top: 8px;
  font-size: 13px;
  color: #7e8d8a;
}

.pay-amount {
  margin-bottom: 22px;
}

.pay-amount .label {
  margin-right: 12px;
  font-size: 14px;
  color: #667a77;
}

.pay-amount .amount {
  font-size: 30px;
  font-weight: 800;
  color: var(--app-primary);
}

.pay-qrcode {
  display: inline-block;
  margin: 0 auto 18px;
  padding: 20px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 32px rgba(17, 24, 39, 0.06);
}

.qrcode-tip {
  margin-top: 12px;
  font-size: 14px;
  color: #667a77;
}

.pay-expire {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #9a6417;
}

.pay-status-message {
  margin-top: 16px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
}

.pay-status-message.success {
  color: #67c23a;
  background: #f0f9eb;
}

.pay-status-message.error {
  color: #f56c6c;
  background: #fef0f0;
}

@media (max-width: 980px) {
  .orders-hero {
    grid-template-columns: 1fr;
  }

  .order-card__body {
    grid-template-columns: 1fr;
  }

  .order-side__panel {
    min-height: unset;
  }
}

@media (max-width: 768px) {
  .orders-hero,
  .orders-shell,
  .order-card {
    padding: 20px;
  }

  .hero-title {
    font-size: 30px;
  }

  .order-title {
    font-size: 24px;
  }

  .order-card__head,
  .order-card__foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-badges,
  .order-actions {
    justify-content: flex-start;
  }

  .foot-tip {
    max-width: none;
  }
}

@media (max-width: 560px) {
  .brand-name {
    font-size: 20px;
  }

  .hero-pills {
    gap: 8px;
  }

  .hero-pill {
    width: 100%;
    text-align: center;
  }

  .order-details {
    grid-template-columns: 1fr;
  }

  .amount-value {
    font-size: 30px;
  }
}
</style>
