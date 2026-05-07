<template>
  <div class="order-detail-view">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <div v-loading="loading" class="detail-container">
        <div class="detail-card">
          <div class="detail-header">
            <div>
              <h2>订单详情</h2>
              <p>{{ order.orderNo || orderNo }}</p>
            </div>
            <el-tag :type="getOrderStatusType(order.orderStatus)" size="large">
              {{ getOrderStatusText(order.orderStatus) }}
            </el-tag>
          </div>

          <div v-if="order.orderNo" class="detail-body">
            <div class="summary-panel">
              <div class="summary-main">
                <span class="summary-label">{{ getOrderTypeText(order) }}</span>
                <strong>{{ getOrderTitle(order) }}</strong>
              </div>
              <div class="summary-amount">
                <span>实付金额</span>
                <strong>¥{{ formatAmount(order.totalAmount) }}</strong>
              </div>
            </div>

            <section class="info-section">
              <h3>订单信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">订单号</span>
                  <span class="value">{{ order.orderNo }}</span>
                </div>
                <div class="info-item">
                  <span class="label">订单类型</span>
                  <span class="value">{{ getOrderTypeText(order) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">订单状态</span>
                  <span class="value">{{ getOrderStatusText(order.orderStatus) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间</span>
                  <span class="value">{{ formatTime(order.createTime) }}</span>
                </div>
                <div v-if="order.payTime" class="info-item">
                  <span class="label">支付时间</span>
                  <span class="value">{{ formatTime(order.payTime) }}</span>
                </div>
                <div v-if="order.expireTime && order.orderStatus === 0" class="info-item">
                  <span class="label">支付截止</span>
                  <span class="value">{{ formatTime(order.expireTime) }}</span>
                </div>
              </div>
            </section>

            <section class="info-section">
              <h3>{{ getProductSectionTitle(order) }}</h3>
              <div class="info-grid">
                <div v-for="item in productDetails" :key="item.label" class="info-item" :class="{ wide: item.wide }">
                  <span class="label">{{ item.label }}</span>
                  <span class="value">{{ item.value }}</span>
                </div>
              </div>
            </section>

            <section class="info-section">
              <h3>购买信息</h3>
              <div class="info-grid">
                <div v-for="item in purchaseDetails" :key="item.label" class="info-item" :class="{ wide: item.wide }">
                  <span class="label">{{ item.label }}</span>
                  <span class="value" :class="{ amount: item.isAmount }">{{ item.value }}</span>
                </div>
              </div>
            </section>

            <section v-if="deliveryDetails.length" class="info-section">
              <h3>配送信息</h3>
              <div class="info-grid">
                <div v-for="item in deliveryDetails" :key="item.label" class="info-item" :class="{ wide: item.wide }">
                  <span class="label">{{ item.label }}</span>
                  <span class="value">{{ item.value }}</span>
                </div>
              </div>
            </section>

            <section v-if="verifyDetails.length" class="info-section">
              <h3>核销信息</h3>
              <div class="info-grid">
                <div v-for="item in verifyDetails" :key="item.label" class="info-item">
                  <span class="label">{{ item.label }}</span>
                  <span class="value">{{ item.value }}</span>
                </div>
              </div>
            </section>
          </div>

          <el-empty v-else-if="!loading" description="未找到订单信息" />
        </div>

        <div v-if="order.orderNo" class="tips-card">
          <h3>温馨提示</h3>
          <ul>
            <li>{{ getOrderTip(order) }}</li>
            <li>请核对订单号、联系人和日期信息，出行或到店前建议再次确认。</li>
            <li>如有疑问，请联系客服：400-123-4567</li>
          </ul>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { formatDateOnly, formatDateTime, type DateInput } from '@/utils/date'

type DetailItem = {
  label: string
  value: string
  wide?: boolean
  isAmount?: boolean
}

const router = useRouter()
const route = useRoute()

const orderNo = ref(route.params.orderNo as string)
const order = ref<any>({})
const loading = ref(false)

const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderRes: any = await request.get(`/order/${orderNo.value}`)
    order.value = orderRes?.data || {}
  } catch (error) {
    console.error('加载订单详情失败', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const productDetails = computed<DetailItem[]>(() => {
  const current = order.value

  if (current.orderType === 2) {
    return [
      { label: '酒店名称', value: current.hotelName || '-' },
      { label: '房型信息', value: current.roomName || '-' },
      { label: '入住日期', value: formatDate(current.checkInDate) },
      { label: '退房日期', value: formatDate(current.checkOutDate) },
      { label: '房间数量', value: current.roomCount ? `${current.roomCount} 间` : '-' }
    ]
  }

  if (current.orderType === 3) {
    return [
      { label: '餐厅名称', value: current.foodName || '-' },
      { label: '套餐名称', value: current.foodPackageName || '-' },
      { label: '预订日期', value: formatDate(current.bookingDate) },
      { label: '用餐时间', value: current.mealTime || '-' },
      { label: '用餐人数', value: current.dinerCount ? `${current.dinerCount} 人` : '-' },
      { label: '桌号', value: current.tableNumber || '-' }
    ]
  }

  return [
    { label: '门票名称', value: current.ticketName || '-' },
    { label: '游玩日期', value: formatDate(current.visitDate) },
    { label: '购买数量', value: current.ticketCount ? `${current.ticketCount} 张` : '-' },
    { label: '单价', value: `¥${formatAmount(current.unitPrice)}` }
  ]
})

const purchaseDetails = computed<DetailItem[]>(() => {
  const current = order.value
  const contactName = current.guestName || current.visitorName || '-'
  const contactPhone = current.guestPhone || current.visitorPhone || '-'
  const details: DetailItem[] = [
    { label: '联系人', value: contactName },
    { label: '联系电话', value: contactPhone },
    { label: '订单总额', value: `¥${formatAmount(current.totalAmount)}`, isAmount: true }
  ]

  if (current.visitorIdCard) {
    details.splice(2, 0, { label: '身份证号', value: maskIdCard(current.visitorIdCard) })
  }

  if (current.specialRequest) {
    details.push({ label: '特殊需求', value: current.specialRequest, wide: true })
  }

  return details
})

const deliveryDetails = computed<DetailItem[]>(() => {
  const current = order.value
  if (current.orderType !== 3 || current.deliveryStatus === null || current.deliveryStatus === undefined) {
    return []
  }

  return [
    { label: '配送状态', value: getDeliveryStatusText(current.deliveryStatus) },
    { label: '收货地址', value: current.deliveryAddress || '-', wide: true },
    { label: '发货时间', value: formatTime(current.deliveryTime) },
    { label: '收货时间', value: formatTime(current.receiveTime) }
  ]
})

const verifyDetails = computed<DetailItem[]>(() => {
  const current = order.value
  if (current.verifyStatus !== 1 && current.orderStatus !== 2) {
    return []
  }

  return [
    { label: '核销状态', value: '已核销' },
    { label: '核销时间', value: formatTime(current.verifyTime) }
  ]
})

const getOrderTitle = (current: any) => {
  if (current.orderType === 2) return current.hotelName || '酒店订单'
  if (current.orderType === 3) return current.foodName || '美食订单'
  return current.ticketName || '门票订单'
}

const getProductSectionTitle = (current: any) => {
  if (current.orderType === 2) return '酒店信息'
  if (current.orderType === 3) return '美食信息'
  return '门票信息'
}

const getOrderTypeText = (current: any) => {
  if (current.orderType === 1) return '门票'
  if (current.orderType === 2) return '酒店'
  if (current.orderType === 3) {
    return current.deliveryStatus !== null && current.deliveryStatus !== undefined ? '外卖' : '美食预订'
  }
  return current.hotelId ? '酒店预订' : '订单'
}

const getOrderStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已使用',
    3: '已取消',
    4: '已退款'
  }
  return statusMap[status] || '未知'
}

const getOrderStatusType = (status: number) => {
  const typeMap: Record<number, 'success' | 'warning' | 'info' | 'danger'> = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger',
    4: 'danger'
  }
  return typeMap[status] || 'info'
}

const getDeliveryStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待发货',
    1: '已发货',
    2: '已收货',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

const getOrderTip = (current: any) => {
  if (current.orderType === 2) return '酒店订单请留意入住日期、退房日期、入住人和联系电话。'
  if (current.orderType === 3) return '美食订单请留意预订日期、用餐时间、联系人和配送状态。'
  return '门票订单请留意游玩日期、购买数量、游客姓名和联系电话。'
}

const formatAmount = (amount?: number | string) => {
  if (amount === undefined || amount === null || amount === '') return '--'
  const numericAmount = Number(amount)
  return Number.isNaN(numericAmount) ? String(amount) : numericAmount.toFixed(2)
}

const formatTime = (time?: DateInput) => formatDateTime(time, '-')
const formatDate = (time?: DateInput) => formatDateOnly(time, '-')

const maskIdCard = (idCard: string) => {
  if (!idCard) return ''
  return idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2')
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail-view {
  min-height: 100vh;
  background: #f5f7fb;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 360px;
}

.detail-card,
.tips-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.08);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #2bb3a3 0%, #4f7fd8 100%);
  color: #fff;

  h2 {
    margin: 0;
    font-size: 24px;
  }

  p {
    margin: 8px 0 0;
    opacity: 0.88;
    word-break: break-all;
  }
}

.detail-body {
  padding: 32px;
}

.summary-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  background: #f8fafc;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  margin-bottom: 32px;

  .summary-main,
  .summary-amount {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .summary-label,
  .summary-amount span {
    color: #909399;
    font-size: 14px;
  }

  strong {
    color: #303133;
    font-size: 22px;
    line-height: 1.4;
  }

  .summary-amount {
    text-align: right;

    strong {
      color: #ff6b6b;
    }
  }
}

.info-section {
  margin-bottom: 32px;

  h3 {
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f2f5;
    color: #303133;
    font-size: 18px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 28px;
}

.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &.wide {
    grid-column: 1 / -1;
  }

  .label {
    flex: 0 0 96px;
    color: #909399;
  }

  .value {
    flex: 1;
    min-width: 0;
    color: #303133;
    font-weight: 500;
    word-break: break-word;

    &.amount {
      color: #ff6b6b;
      font-size: 18px;
    }
  }
}

.tips-card {
  padding: 24px 32px;

  h3 {
    margin: 0 0 16px;
    color: #ff6b6b;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      line-height: 2;
      color: #666;
    }
  }
}

@media (max-width: 720px) {
  .main-content {
    padding: 12px;
  }

  .detail-header,
  .summary-panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-body {
    padding: 20px;
  }

  .summary-panel .summary-amount {
    text-align: left;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
