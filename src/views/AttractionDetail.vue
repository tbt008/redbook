<template>
  <div class="attraction-detail">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <div class="header-inner">
        <div class="logo-section" @click="goHome">
          <span class="logo-icon">🏝️</span>
          <span class="logo-text">莆田文旅</span>
        </div>
        <div class="header-actions">
          <el-button class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 图片画廊 -->
      <section class="gallery-section">
        <div class="gallery-main">
          <el-carousel height="550px" indicator-position="none" arrow="always" :interval="5000">
            <el-carousel-item v-for="(image, index) in imageList" :key="index">
              <el-image :src="image" fit="cover" class="gallery-image" />
            </el-carousel-item>
          </el-carousel>
          <div class="gallery-overlay"></div>
        </div>
        <div class="gallery-thumbs">
          <div
            v-for="(image, index) in imageList.slice(0, 5)"
            :key="index"
            :class="['thumb-item', { active: index === 0 }]"
          >
            <el-image :src="image" fit="cover" />
          </div>
        </div>
      </section>

      <!-- 景点信息 -->
      <section class="info-section">
        <div class="info-container">
          <!-- 左侧信息 -->
          <div class="info-left">
            <div class="breadcrumb">
              <span class="breadcrumb-item" @click="goHome">首页</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item">景点</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ attraction.name }}</span>
            </div>

            <h1 class="attraction-title">{{ attraction.name }}</h1>

            <div class="attraction-tags">
              <span class="tag">
                <el-icon><Location /></el-icon>
                {{ attraction.region }}
              </span>
              <span class="tag" v-if="attraction.theme">
                <el-icon><Collection /></el-icon>
                {{ attraction.theme }}
              </span>
            </div>

            <div class="attraction-stats">
              <div class="stat-item">
                <el-rate
                  v-model="attraction.rating"
                  disabled
                  show-score
                  text-color="#e8a838"
                  score-template="{value}"
                />
                <span class="stat-label">评分</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ attraction.viewCount || 0 }}</div>
                <div class="stat-label">浏览量</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ commentList.length }}</div>
                <div class="stat-label">用户评价</div>
              </div>
            </div>

            <el-divider />

            <!-- 基本信息 -->
            <div class="info-cards">
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">景点地址</div>
                  <div class="card-value">{{ attraction.address }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">开放时间</div>
                  <div class="card-value">{{ attraction.openTime || '暂无信息' }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">联系电话</div>
                  <div class="card-value">{{ attraction.contactPhone || '暂无信息' }}</div>
                </div>
              </div>
            </div>

            <!-- 景点介绍 -->
            <div class="description-section">
              <h3 class="section-title">
                <span class="title-icon">📖</span>
                景点介绍
              </h3>
              <div class="description-content">
                <p>{{ attraction.description || '暂无详细介绍' }}</p>
              </div>
            </div>

            <!-- 地图 -->
            <div class="map-section">
              <h3 class="section-title">
                <span class="title-icon">🗺️</span>
                地理位置
              </h3>
              <div id="attraction-map" class="map-container"></div>
              <div class="map-address">
                <el-icon><Location /></el-icon>
                <span>{{ attraction.address }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧悬浮卡片 -->
          <div class="info-right">
            <div class="ticket-card">
              <div class="ticket-header">
                <div class="price-label">门票价格</div>
                <div class="price-value">
                  <span class="currency">¥</span>
                  <span class="amount">{{ attraction.ticketPrice }}</span>
                  <span class="unit">起</span>
                </div>
              </div>

              <div class="ticket-types">
                <div
                  v-for="ticket in ticketList.slice(0, 3)"
                  :key="ticket.id"
                  class="ticket-type-item"
                  @click="selectTicket(ticket)"
                >
                  <div class="ticket-info">
                    <div class="ticket-name">{{ ticket.ticketName }}</div>
                    <div class="ticket-desc">{{ ticket.description }}</div>
                    <div v-if="ticket.totalCount && ticket.totalCount > 0" class="ticket-stock">
                      <span class="stock-label">剩余:</span>
                      <span class="stock-count">{{ getRemainingTickets(ticket) }}</span>
                      <span class="stock-unit">张</span>
                    </div>
                  </div>
                  <div class="ticket-price">
                    <span class="price">¥{{ ticket.price }}</span>
                    <span class="buy-btn">购买</span>
                  </div>
                </div>
                <div v-if="ticketList.length === 0" class="no-ticket">
                  暂无可购门票
                </div>
              </div>

              <el-button type="primary" size="large" class="buy-btn-large" @click="showTicketDialog">
                <el-icon><Ticket /></el-icon>
                在线购票
              </el-button>

              <div class="action-buttons">
                <el-button
                  :class="['collect-btn', { collected: isCollected }]"
                  @click="toggleCollect"
                >
                  <el-icon><component :is="isCollected ? 'StarFilled' : 'Star'" /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }}
                </el-button>
                <el-button class="share-btn">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 门票列表 -->
      <section class="tickets-section" v-if="ticketList.length > 0">
        <div class="section-container">
          <h3 class="section-title">
            <span class="title-bar"></span>
            门票类型
          </h3>
          <div class="ticket-grid">
            <div v-for="ticket in ticketList" :key="ticket.id" class="ticket-card-item">
              <div class="ticket-card-header">
                <span class="ticket-name">{{ ticket.ticketName }}</span>
                <span class="ticket-tag">官方</span>
              </div>
              <div class="ticket-card-body">
                <p class="ticket-description">{{ ticket.description }}</p>
                <div class="ticket-validity">
                  <el-icon><Calendar /></el-icon>
                  有效期：{{ ticket.validDays }}天
                </div>
              </div>
              <div class="ticket-card-footer">
                <div class="price-info">
                  <span class="currency">¥</span>
                  <span class="amount">{{ ticket.price }}</span>
                </div>
                <el-button type="primary" round @click="selectTicket(ticket)">立即购买</el-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户评价 -->
      <section class="comments-section">
        <div class="section-container">
          <h3 class="section-title">
            <span class="title-bar"></span>
            用户评价
            <span class="comment-count">({{ commentList.length }})</span>
          </h3>

          <div v-if="commentList.length > 0" class="comment-list">
            <div v-for="comment in commentList" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <el-avatar :src="comment.userAvatar" :size="48" />
              </div>
              <div class="comment-body">
                <div class="comment-header">
                  <div class="comment-user">
                    <span class="username">{{ comment.userName }}</span>
                    <el-rate v-model="comment.rating" disabled size="small" />
                  </div>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div v-if="comment.images" class="comment-images">
                  <el-image
                    v-for="(img, idx) in comment.images.split(',')"
                    :key="idx"
                    :src="img"
                    fit="cover"
                    class="comment-img"
                    :preview-src-list="comment.images.split(',')"
                  />
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无评价，快来抢先评价吧" class="empty-comments" />
        </div>
      </section>
    </main>

    <!-- 购票对话框 -->
    <el-dialog
      v-model="ticketDialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
      class="ticket-dialog"
    >
      <div class="dialog-content">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step title="选择门票" />
          <el-step title="日期数量" />
          <el-step title="填写信息" />
          <el-step title="确认订单" />
          <el-step title="完成支付" />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1: 选择门票 -->
          <div v-show="currentStep === 0" class="step-panel">
            <div class="ticket-select-grid">
              <div
                v-for="ticket in ticketList"
                :key="ticket.id"
                :class="['ticket-select-card', { active: orderForm.ticketId === ticket.id }]"
                @click="selectTicketForOrder(ticket)"
              >
                <div class="card-check" v-if="orderForm.ticketId === ticket.id">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="ticket-select-name">{{ ticket.ticketName }}</div>
                <div class="ticket-select-desc">{{ ticket.description }}</div>
                <div class="ticket-select-price">
                  <span class="currency">¥</span>
                  <span class="amount">{{ ticket.price }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2: 日期和数量 -->
          <div v-show="currentStep === 1" class="step-panel">
            <el-form :model="orderForm" label-position="top" class="order-form">
              <el-form-item label="游玩日期" required>
                <el-date-picker
                  v-model="orderForm.visitDate"
                  type="date"
                  placeholder="选择游玩日期"
                  :disabled-date="disabledDate"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item label="购买数量" required>
                <div class="quantity-selector">
                  <el-button circle @click="orderForm.ticketCount > 1 && orderForm.ticketCount--">
                    <el-icon><Minus /></el-icon>
                  </el-button>
                  <span class="quantity">{{ orderForm.ticketCount }}</span>
                  <el-button circle @click="orderForm.ticketCount < 10 && orderForm.ticketCount++">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 填写信息 -->
          <div v-show="currentStep === 2" class="step-panel">
            <el-form :model="orderForm" label-position="top" class="order-form">
              <el-form-item label="游客姓名" required>
                <el-input v-model="orderForm.visitorName" placeholder="请输入真实姓名" />
              </el-form-item>
              <el-form-item label="身份证号" required>
                <el-input v-model="orderForm.visitorIdCard" placeholder="请输入身份证号" maxlength="18" />
              </el-form-item>
              <el-form-item label="联系电话" required>
                <el-input v-model="orderForm.visitorPhone" placeholder="用于接收电子票" />
              </el-form-item>
              <el-form-item label="特殊需求">
                <el-input
                  v-model="orderForm.specialRequest"
                  type="textarea"
                  :rows="3"
                  placeholder="如需要导游服务等"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤4: 确认订单 -->
          <div v-show="currentStep === 3" class="step-panel">
            <div class="order-confirm">
              <div class="confirm-section">
                <h4><el-icon><Ticket /></el-icon>订单信息</h4>
                <div class="confirm-item">
                  <span class="label">门票类型</span>
                  <span class="value">{{ selectedTicket?.ticketName }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">游玩日期</span>
                  <span class="value">{{ orderForm.visitDate }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">购买数量</span>
                  <span class="value">{{ orderForm.ticketCount }} 张</span>
                </div>
                <div class="confirm-item">
                  <span class="label">单价</span>
                  <span class="value">¥{{ selectedTicket?.price }}</span>
                </div>
                <div class="confirm-item total">
                  <span class="label">总金额</span>
                  <span class="value price">¥{{ totalAmount }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><User /></el-icon>游客信息</h4>
                <div class="confirm-item">
                  <span class="label">姓名</span>
                  <span class="value">{{ orderForm.visitorName }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">身份证号</span>
                  <span class="value">{{ orderForm.visitorIdCard }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">联系电话</span>
                  <span class="value">{{ orderForm.visitorPhone }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤5: 支付 -->
          <div v-show="currentStep === 4" class="step-panel">
            <div class="payment-panel">
              <div class="success-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <h3>订单创建成功</h3>
              <p class="order-no">订单号：{{ orderNo }}</p>
              <div class="payment-amount">
                <span class="label">应付金额</span>
                <span class="amount">¥{{ totalAmount }}</span>
              </div>
              <div v-if="payQrCodeUrl" class="pay-qrcode">
                <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
                <div class="payment-tip">请使用支付宝沙箱 App 扫描二维码完成支付</div>
              </div>
              <el-button type="primary" size="large" class="pay-btn" :loading="isGeneratingQrCode" @click="handlePay">
                {{ payQrCodeUrl ? '刷新二维码' : '立即支付' }}
              </el-button>
              <el-progress v-if="isPollingPay" :percentage="payPollProgress" :show-text="false" :stroke-width="6" />
              <p class="payment-tip">{{ payStatusMessage || '请在30分钟内完成支付' }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="currentStep > 0 && currentStep < 4" @click="prevStep">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-if="currentStep === 3" type="primary" @click="createOrder" :loading="creating">
            确认订单
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 支付成功对话框 -->
    <el-dialog v-model="paySuccessVisible" title="" width="450px" :close-on-click-modal="false" class="success-dialog">
      <div class="success-content">
        <div class="success-icon-large">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <h3>支付成功</h3>
        <p>电子票已生成</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="viewETicket">查看电子票</el-button>
        <el-button @click="paySuccessVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Location,
  Clock,
  Phone,
  Star,
  StarFilled,
  ArrowLeft,
  Collection,
  Share,
  Ticket,
  Calendar,
  MapLocation,
  Check,
  Minus,
  Plus,
  User,
  CircleCheck
} from '@element-plus/icons-vue'
import request from '@/util/request'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const attractionId = ref(Number(route.params.id))
const attraction = ref<any>({})
const imageList = ref<string[]>([])
const ticketList = ref<any[]>([])
const commentList = ref<any[]>([])
const isCollected = ref(false)
const ticketDialogVisible = ref(false)
const currentStep = ref(0)
const creating = ref(false)
const orderNo = ref('')
const paySuccessVisible = ref(false)
const selectedTicket = ref<any>(null)
const payQrCodeUrl = ref('')
const isGeneratingQrCode = ref(false)
const isPollingPay = ref(false)
const payPollProgress = ref(0)
const payStatusMessage = ref('')
let payPollingTimer: any = null

const dialogTitle = computed(() => currentStep.value === 4 ? '完成支付' : '在线购票')

const orderForm = reactive({
  ticketId: null as number | null,
  visitDate: '',
  ticketCount: 1,
  visitorName: '',
  visitorIdCard: '',
  visitorPhone: '',
  specialRequest: ''
})

const totalAmount = computed(() => {
  if (selectedTicket.value) {
    return (selectedTicket.value.price * orderForm.ticketCount).toFixed(2)
  }
  return '0.00'
})

// 获取剩余票数
const getRemainingTickets = (ticket: any) => {
  if (ticket.totalCount && ticket.soldCount !== undefined) {
    return ticket.totalCount - ticket.soldCount
  }
  return ticket.totalCount || '不限'
}

// 加载景点详情
const loadAttractionDetail = async () => {
  try {
    const res: any = await request.get(`/attraction/${attractionId.value}`)
    if (res && res.data) {
      attraction.value = res.data
      isCollected.value = res.data.isCollected === 1
      if (res.data.images) {
        const imagesStr = res.data.images
        if (imagesStr.startsWith('[')) {
          imageList.value = JSON.parse(imagesStr)
        } else {
          imageList.value = imagesStr.split(',')
        }
      }
      // 数据加载完成后初始化地图
      nextTick(() => {
        initMap()
      })
    }
  } catch (error) {
    console.error('加载景点详情失败', error)
  }
}

// 初始化地图
const initMap = () => {
  if (!attraction.value.longitude || !attraction.value.latitude) {
    console.log('景点无坐标信息')
    return
  }
  
  if (!window.AMap) {
    console.error('高德地图API未加载')
    return
  }
  
  const container = document.getElementById('attraction-map')
  if (!container) return
  
  // 创建地图实例
  const map = new window.AMap.Map('attraction-map', {
    zoom: 15,
    center: [attraction.value.longitude, attraction.value.latitude],
    mapStyle: 'amap://styles/normal'
  })
  
  // 添加标记
  const marker = new window.AMap.Marker({
    position: [attraction.value.longitude, attraction.value.latitude],
    title: attraction.value.name
  })
  map.add(marker)
  
  // 添加信息窗体
  const infoWindow = new window.AMap.InfoWindow({
    content: `<div style="padding: 8px; font-size: 14px;">
      <h4 style="margin: 0 0 8px 0;">${attraction.value.name}</h4>
      <p style="margin: 0; color: #666;">${attraction.value.address}</p>
    </div>`,
    offset: new window.AMap.Pixel(0, -30)
  })
  
  marker.on('click', () => {
    infoWindow.open(map, marker.getPosition())
  })
}

// 加载门票列表
const loadTicketList = async () => {
  try {
    const res: any = await request.get(`/ticket/attraction/${attractionId.value}`)
    if (res && res.data) {
      ticketList.value = res.data
    }
  } catch (error) {
    console.error('加载门票列表失败', error)
  }
}

// 加载评论列表
const loadCommentList = async () => {
  try {
    const res: any = await request.get('/comment/list', {
      params: {
        contentId: attractionId.value,
        contentType: 4,
        pageNum: 1,
        pageSize: 10
      }
    })
    if (res && res.data && res.data.list) {
      commentList.value = res.data.list
    }
  } catch (error) {
    console.error('加载评论失败', error)
  }
}

const selectTicket = (ticket: any) => {
  selectedTicket.value = ticket
  orderForm.ticketId = ticket.id
  ticketDialogVisible.value = true
  currentStep.value = 0
}

const selectTicketForOrder = (ticket: any) => {
  selectedTicket.value = ticket
  orderForm.ticketId = ticket.id
}

const showTicketDialog = () => {
  if (ticketList.value.length === 0) {
    ElMessage.warning('暂无可购买的门票')
    return
  }
  ticketDialogVisible.value = true
  currentStep.value = 0
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
}

const nextStep = () => {
  if (currentStep.value === 0 && !orderForm.ticketId) {
    ElMessage.warning('请选择门票类型')
    return
  }
  if (currentStep.value === 1) {
    if (!orderForm.visitDate) {
      ElMessage.warning('请选择游玩日期')
      return
    }
  }
  if (currentStep.value === 2) {
    if (!orderForm.visitorName || !orderForm.visitorIdCard || !orderForm.visitorPhone) {
      ElMessage.warning('请填写完整的游客信息')
      return
    }
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const createOrder = async () => {
  creating.value = true
  try {
    const res: any = await request.post('/order/create', {
      ticketId: orderForm.ticketId,
      ticketName: selectedTicket.value.ticketName,
      ticketCount: orderForm.ticketCount,
      unitPrice: selectedTicket.value.price,
      totalAmount: totalAmount.value,
      visitDate: orderForm.visitDate,
      visitorName: orderForm.visitorName,
      visitorIdCard: orderForm.visitorIdCard,
      visitorPhone: orderForm.visitorPhone,
      specialRequest: orderForm.specialRequest
    })
    if (res && res.data) {
      orderNo.value = res.data
      currentStep.value = 4
      ElMessage.success('订单创建成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    creating.value = false
  }
}

const handlePay = async () => {
  isGeneratingQrCode.value = true
  payStatusMessage.value = '正在生成支付宝支付二维码...'
  try {
    const res: any = await request.get(`/order/pay/qrcode/${orderNo.value}`)
    if (res && res.code === 200) {
      payQrCodeUrl.value = res.data.qrCodeUrl || ''
      if (!payQrCodeUrl.value) {
        throw new Error('未获取到支付宝支付二维码')
      }
      payStatusMessage.value = '请使用支付宝沙箱 App 扫码支付'
      startPayPolling(orderNo.value)
    }
  } catch (error: any) {
    payStatusMessage.value = error.message || '支付失败'
    ElMessage.error(error.message || '支付失败')
  } finally {
    isGeneratingQrCode.value = false
  }
}

const startPayPolling = (currentOrderNo: string) => {
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
      payStatusMessage.value = '支付超时，请重新生成二维码'
      return
    }

    payPollProgress.value = Math.min((pollCount / 60) * 100, 95)

    try {
      const res: any = await request.get(`/order/pay/status/${currentOrderNo}`)
      if (res && res.code === 200 && res.data && (res.data.paid || res.data.orderStatus === 1)) {
        stopPayPolling()
        payPollProgress.value = 100
        payStatusMessage.value = '支付成功！'
        ElMessage.success('支付成功')
        ticketDialogVisible.value = false
        paySuccessVisible.value = true
        resetOrderForm()
      }
    } catch (error) {
      console.error('轮询支付状态失败', error)
    }
  }, 3000)
}

const stopPayPolling = () => {
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
    payPollingTimer = null
  }
  isPollingPay.value = false
}

const viewETicket = () => {
  router.push(`/eticket/${orderNo.value}`)
}

const toggleCollect = async () => {
  try {
    if (isCollected.value) {
      await request.delete(`/attraction/collect/${attractionId.value}`)
      ElMessage.success('取消收藏成功')
      isCollected.value = false
    } else {
      await request.post(`/attraction/collect/${attractionId.value}`)
      ElMessage.success('收藏成功')
      isCollected.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const resetOrderForm = () => {
  stopPayPolling()
  orderForm.ticketId = null
  orderForm.visitDate = ''
  orderForm.ticketCount = 1
  orderForm.visitorName = ''
  orderForm.visitorIdCard = ''
  orderForm.visitorPhone = ''
  orderForm.specialRequest = ''
  selectedTicket.value = null
  currentStep.value = 0
  payQrCodeUrl.value = ''
  payPollProgress.value = 0
  payStatusMessage.value = ''
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadAttractionDetail()
  loadTicketList()
  loadCommentList()
})
</script>

<style scoped lang="scss">
// 主题色
$primary: #1a5f4a;
$primary-light: #2d8b6f;
$primary-dark: #0f3d2f;
$accent: #e8a838;
$text-primary: #1a1a1a;
$text-secondary: #666;
$text-muted: #999;
$border: #eee;
$bg-light: #f8f9fa;
$white: #fff;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 20px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.15);

.attraction-detail {
  min-height: 100vh;
  background: $bg-light;
}

// 顶部导航
.detail-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 40px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .logo-icon {
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: $primary;
    }
  }

  .back-btn {
    border-radius: 20px;
    padding: 8px 20px;

    .el-icon {
      margin-right: 4px;
    }
  }
}

// 画廊
.gallery-section {
  background: $white;
  padding: 24px 40px;

  .gallery-main {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: $shadow-md;

    :deep(.el-carousel__arrow) {
      width: 50px;
      height: 50px;
      font-size: 24px;
      background: rgba(255, 255, 255, 0.9);
      color: $text-primary;

      &:hover {
        background: $white;
      }
    }

    .gallery-image {
      width: 100%;
      height: 100%;
    }

    .gallery-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
    }
  }

  .gallery-thumbs {
    display: flex;
    gap: 12px;
    margin-top: 16px;

    .thumb-item {
      width: 100px;
      height: 70px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover,
      &.active {
        opacity: 1;
      }

      &.active {
        border-color: $primary;
      }

      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

// 信息区域
.info-section {
  padding: 32px 0;
}

.info-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
}

.info-left {
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 14px;

    .breadcrumb-item {
      color: $text-muted;
      cursor: pointer;

      &:hover {
        color: $primary;
      }

      &.current {
        color: $text-primary;
        font-weight: 500;
      }
    }

    .breadcrumb-separator {
      color: $border;
    }
  }

  .attraction-title {
    font-size: 36px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 16px;
    line-height: 1.3;
  }

  .attraction-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(26, 95, 74, 0.08);
      color: $primary;
      border-radius: 20px;
      font-size: 13px;

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .attraction-stats {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;
    background: $bg-light;
    border-radius: 12px;
    margin-bottom: 24px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: $text-primary;
      }

      .stat-label {
        font-size: 12px;
        color: $text-muted;
      }
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: $border;
    }
  }

  .description-section,
  .map-section {
    margin-top: 32px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 20px;

      .title-icon {
        font-size: 20px;
      }
    }

    .description-content {
      p {
        line-height: 1.8;
        color: $text-secondary;
        font-size: 15px;
      }
    }

    .map-container {
      height: 350px;
      background: $bg-light;
      border-radius: 12px;
      overflow: hidden;
    }

    .map-address {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background: $bg-light;
      border-radius: 8px;
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 18px;
      background: $white;
      border-radius: 12px;
      border: 1px solid $border;

      .card-icon {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, rgba(26, 95, 74, 0.1), rgba(26, 95, 74, 0.05));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 20px;
          color: $primary;
        }
      }

      .card-content {
        flex: 1;

        .card-label {
          font-size: 12px;
          color: $text-muted;
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 14px;
          color: $text-primary;
          font-weight: 500;
        }
      }
    }
  }
}

// 右侧悬浮卡片
.info-right {
  position: sticky;
  top: 80px;
  height: fit-content;

  .ticket-card {
    background: $white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: $shadow-md;

    .ticket-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid $border;
      margin-bottom: 20px;

      .price-label {
        font-size: 14px;
        color: $text-muted;
        margin-bottom: 8px;
      }

      .price-value {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 2px;

        .currency {
          font-size: 18px;
          color: #ff4d4f;
          font-weight: 600;
        }

        .amount {
          font-size: 42px;
          font-weight: 800;
          color: #ff4d4f;
        }

        .unit {
          font-size: 14px;
          color: $text-muted;
        }
      }
    }

    .ticket-types {
      margin-bottom: 20px;

      .ticket-type-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px;
        border: 1px solid $border;
        border-radius: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: $primary;
          background: rgba(26, 95, 74, 0.03);
        }

        .ticket-info {
          flex: 1;

          .ticket-name {
            font-size: 14px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 4px;
          }

          .ticket-desc {
            font-size: 12px;
            color: $text-muted;
          }

          .ticket-stock {
            margin-top: 6px;
            font-size: 12px;

            .stock-label {
              color: $text-muted;
            }

            .stock-count {
              color: $primary;
              font-weight: 700;
              font-size: 14px;
            }

            .stock-unit {
              color: $text-muted;
            }
          }
        }

        .ticket-price {
          text-align: right;

          .price {
            display: block;
            font-size: 18px;
            font-weight: 700;
            color: #ff4d4f;
            margin-bottom: 4px;
          }

          .buy-btn {
            font-size: 12px;
            color: $primary;
          }
        }
      }

      .no-ticket {
        text-align: center;
        padding: 20px;
        color: $text-muted;
      }
    }

    .buy-btn-large {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 24px;
      background: linear-gradient(135deg, $primary, $primary-light);
      border: none;
      margin-bottom: 16px;

      .el-icon {
        margin-right: 8px;
      }

      &:hover {
        background: linear-gradient(135deg, $primary-dark, $primary);
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;

      .el-button {
        flex: 1;
        border-radius: 20px;
      }

      .collect-btn {
        &.collected {
          color: $accent;
          border-color: $accent;
        }
      }

      .share-btn {
        background: $bg-light;
        border-color: $border;
      }
    }
  }
}

// 门票区域
.tickets-section {
  background: $white;
  padding: 40px 0;
  margin-top: 24px;

  .section-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 24px;

    .title-bar {
      width: 5px;
      height: 22px;
      background: linear-gradient(180deg, $primary, $primary-light);
      border-radius: 3px;
    }
  }

  .ticket-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .ticket-card-item {
      background: $bg-light;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-md;
      }

      .ticket-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: linear-gradient(135deg, $primary, $primary-light);
        color: $white;

        .ticket-name {
          font-size: 16px;
          font-weight: 600;
        }

        .ticket-tag {
          font-size: 12px;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      }

      .ticket-card-body {
        padding: 16px;

        .ticket-description {
          font-size: 14px;
          color: $text-secondary;
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .ticket-validity {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: $text-muted;
        }
      }

      .ticket-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-top: 1px solid $border;

        .price-info {
          .currency {
            font-size: 14px;
            color: #ff4d4f;
          }

          .amount {
            font-size: 28px;
            font-weight: 700;
            color: #ff4d4f;
          }
        }
      }
    }
  }
}

// 评论区
.comments-section {
  padding: 40px 0;
  margin-top: 24px;

  .section-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 24px;

    .title-bar {
      width: 5px;
      height: 22px;
      background: linear-gradient(180deg, $primary, $primary-light);
      border-radius: 3px;
    }

    .comment-count {
      font-size: 14px;
      color: $text-muted;
      font-weight: 400;
    }
  }

  .comment-list {
    .comment-item {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: $white;
      border-radius: 12px;
      margin-bottom: 16px;

      .comment-body {
        flex: 1;

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .comment-user {
            .username {
              font-weight: 600;
              color: $text-primary;
              margin-right: 12px;
            }
          }

          .comment-time {
            font-size: 13px;
            color: $text-muted;
          }
        }

        .comment-content {
          line-height: 1.7;
          color: $text-secondary;
          margin-bottom: 12px;
        }

        .comment-images {
          display: flex;
          gap: 10px;

          .comment-img {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            cursor: pointer;
          }
        }
      }
    }
  }

  .empty-comments {
    padding: 60px;
    background: $white;
    border-radius: 12px;
  }
}

// 购票对话框
.ticket-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;

    .el-dialog__header {
      background: linear-gradient(135deg, $primary, $primary-light);
      border-radius: 16px 16px 0 0;
      padding: 20px 24px;
      margin: 0;

      .el-dialog__title {
        color: $white;
        font-size: 18px;
        font-weight: 600;
      }

      .el-dialog__headerbtn {
        top: 20px;

        .el-dialog__close {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .dialog-content {
    padding: 24px;

    :deep(.el-steps) {
      margin-bottom: 32px;
    }

    .step-content {
      min-height: 300px;
    }

    .ticket-select-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .ticket-select-card {
        position: relative;
        padding: 20px;
        border: 2px solid $border;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: $primary-light;
        }

        &.active {
          border-color: $primary;
          background: rgba(26, 95, 74, 0.03);
        }

        .card-check {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 24px;
          height: 24px;
          background: $primary;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $white;
          font-size: 14px;
        }

        .ticket-select-name {
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
          margin-bottom: 8px;
        }

        .ticket-select-desc {
          font-size: 13px;
          color: $text-muted;
          margin-bottom: 12px;
        }

        .ticket-select-price {
          .currency {
            font-size: 14px;
            color: #ff4d4f;
          }

          .amount {
            font-size: 24px;
            font-weight: 700;
            color: #ff4d4f;
          }
        }
      }
    }

    .order-form {
      max-width: 400px;
      margin: 0 auto;

      .quantity-selector {
        display: flex;
        align-items: center;
        gap: 16px;

        .quantity {
          font-size: 20px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }
      }
    }

    .order-confirm {
      background: $bg-light;
      border-radius: 12px;
      padding: 24px;

      .confirm-section {
        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: $text-primary;
          margin: 0 0 16px;
        }

        .confirm-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;

          .label {
            color: $text-muted;
          }

          .value {
            color: $text-primary;
            font-weight: 500;

            &.price {
              color: #ff4d4f;
              font-size: 18px;
            }
          }

          &.total {
            border-top: 1px dashed $border;
            padding-top: 16px;
            margin-top: 8px;
          }
        }
      }
    }

    .payment-panel {
      text-align: center;
      padding: 40px;

      .success-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0.05));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;

        .el-icon {
          font-size: 40px;
          color: #52c41a;
        }
      }

      h3 {
        font-size: 22px;
        margin: 0 0 8px;
      }

      .order-no {
        color: $text-muted;
        margin-bottom: 24px;
      }

      .payment-amount {
        margin-bottom: 24px;

        .label {
          display: block;
          font-size: 14px;
          color: $text-muted;
          margin-bottom: 8px;
        }

        .amount {
          font-size: 42px;
          font-weight: 700;
          color: #ff4d4f;
        }
      }

      .pay-btn {
        width: 200px;
        height: 48px;
        font-size: 16px;
        border-radius: 24px;
        background: linear-gradient(135deg, $primary, $primary-light);
        border: none;
      }

      .payment-tip {
        margin-top: 16px;
        font-size: 13px;
        color: $text-muted;
      }
    }
  }

  .dialog-footer {
    padding: 16px 24px;
    border-top: 1px solid $border;

    .el-button {
      border-radius: 20px;
      padding: 10px 24px;
    }
  }
}

// 成功对话框
.success-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
  }

  .success-content {
    text-align: center;
    padding: 20px 0;

    .success-icon-large {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0.05));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;

      .el-icon {
        font-size: 40px;
        color: #52c41a;
      }
    }

    h3 {
      font-size: 22px;
      margin: 0 0 8px;
    }

    p {
      color: $text-muted;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .info-container {
    grid-template-columns: 1fr;
  }

  .info-right {
    position: static;
  }

  .tickets-section .ticket-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .detail-header .header-inner {
    padding: 14px 20px;
  }

  .gallery-section {
    padding: 16px;

    .gallery-main {
      border-radius: 12px;
    }

    .gallery-thumbs {
      display: none;
    }
  }

  .info-container {
    padding: 0 20px;
  }

  .info-left {
    .info-cards {
      grid-template-columns: 1fr;
    }

    .attraction-title {
      font-size: 26px;
    }
  }

  .tickets-section,
  .comments-section {
    .section-container {
      padding: 0 20px;
    }

    .ticket-grid {
      grid-template-columns: 1fr;
    }
  }

  .ticket-dialog .dialog-content .ticket-select-grid {
    grid-template-columns: 1fr;
  }
}
</style>
