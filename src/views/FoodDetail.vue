<template>
  <div class="food-detail">
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
          <el-carousel height="500px" indicator-position="none" arrow="always">
            <el-carousel-item v-for="(image, index) in imageList" :key="index">
              <el-image :src="image" fit="cover" class="gallery-image" />
            </el-carousel-item>
          </el-carousel>
          <div class="gallery-overlay"></div>
          <div class="gallery-badges">
            <span class="badge food-badge">
              <el-icon><Food /></el-icon>
              美食
            </span>
          </div>
        </div>
      </section>

      <!-- 美食信息 -->
      <section class="info-section">
        <div class="info-container">
          <!-- 左侧信息 -->
          <div class="info-left">
            <div class="breadcrumb">
              <span class="breadcrumb-item" @click="goHome">首页</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item">美食</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ food.name }}</span>
            </div>

            <h1 class="food-title">{{ food.name }}</h1>

            <div class="food-tags">
              <span class="tag">
                <el-icon><Location /></el-icon>
                {{ food.region }}
              </span>
              <span class="tag" v-if="food.category">
                <el-icon><Grid /></el-icon>
                {{ food.category }}
              </span>
            </div>

            <div class="food-stats">
              <div class="stat-item">
                <el-rate
                  v-model="food.rating"
                  disabled
                  show-score
                  text-color="#e8a838"
                  score-template="{value}"
                />
                <span class="stat-label">评分</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ food.viewCount || 0 }}</div>
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
                  <div class="card-label">店铺地址</div>
                  <div class="card-value">{{ food.address }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">人均消费</div>
                  <div class="card-value price">¥{{ food.avgPrice }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">联系电话</div>
                  <div class="card-value">{{ food.contactPhone || '暂无信息' }}</div>
                </div>
              </div>
            </div>

            <!-- 店铺介绍 -->
            <div class="description-section">
              <h3 class="section-title">
                <span class="title-icon">🍽️</span>
                店铺介绍
              </h3>
              <div class="description-content">
                <p>{{ food.description || '暂无详细介绍' }}</p>
              </div>
            </div>

            <!-- 地图 -->
            <div class="map-section">
              <h3 class="section-title">
                <span class="title-icon">🗺️</span>
                店铺位置
              </h3>
              <div id="map" class="map-container">
                <div class="map-placeholder">
                  <el-icon><MapLocation /></el-icon>
                  <span>地图加载中...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧悬浮卡片 -->
          <div class="info-right">
            <div class="booking-card">
              <div class="booking-header">
                <div class="price-label">人均消费</div>
                <div class="price-value">
                  <span class="currency">¥</span>
                  <span class="amount">{{ food.avgPrice }}</span>
                  <span class="unit">/人</span>
                </div>
              </div>

              <div class="booking-features">
                <div class="feature-item">
                  <el-icon><Calendar /></el-icon>
                  <span>在线预订</span>
                </div>
                <div class="feature-item">
                  <el-icon><Ticket /></el-icon>
                  <span>优惠活动</span>
                </div>
                <div class="feature-item">
                  <el-icon><Present /></el-icon>
                  <span>会员专享</span>
                </div>
              </div>

              <!-- 剩余座位显示 -->
              <div v-if="food.totalTables && food.totalTables > 0" class="seats-info">
                <el-icon><OfficeBuilding /></el-icon>
                <span>剩余座位: <strong>{{ remainingTables }}</strong> / {{ food.totalTables }}座</span>
              </div>

              <!-- 外卖功能入口 -->
              <div v-if="food.isTakeout === 1" class="takeout-info">
                <el-icon><ShoppingBag /></el-icon>
                <span>支持外卖配送</span>
                <el-button size="small" type="warning" @click="showTakeoutDialog">
                  立即下单
                </el-button>
              </div>

              <el-button type="primary" size="large" class="booking-btn" @click="showBookingDialog">
                <el-icon><Calendar /></el-icon>
                预订座位
              </el-button>

              <div class="action-buttons">
                <el-button
                  :class="['collect-btn', { collected: isCollected }]"
                  @click="toggleCollect"
                >
                  <el-icon><component :is="isCollected ? 'StarFilled' : 'Star'" /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }}
                </el-button>
                <el-button class="share-btn" @click="showMap">
                  <el-icon><Position /></el-icon>
                  查看地图
                </el-button>
              </div>
            </div>

            <!-- 营业信息 -->
            <div class="hours-card">
              <h4><el-icon><Clock /></el-icon>营业时间</h4>
              <div class="hours-list">
                <div class="hours-item">
                  <span class="day">周一至周五</span>
                  <span class="time">10:00 - 21:00</span>
                </div>
                <div class="hours-item">
                  <span class="day">周末节假日</span>
                  <span class="time">09:00 - 22:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户评价 -->
      <section class="comments-section">
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-bar"></span>
              用户评价
              <span class="comment-count">({{ commentList.length }})</span>
            </h3>
            <el-button type="primary" @click="showCommentDialog">
              <el-icon><Edit /></el-icon>
              写评价
            </el-button>
          </div>

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

    <!-- 评论对话框 -->
    <el-dialog v-model="commentDialogVisible" title="写评价" width="550px" class="comment-dialog">
      <div class="comment-form">
        <div class="rating-select">
          <span class="label">评分</span>
          <el-rate v-model="commentForm.rating" size="large" />
        </div>
        <el-input
          v-model="commentForm.content"
          type="textarea"
          :rows="5"
          placeholder="分享你的用餐体验..."
          maxlength="500"
          show-word-limit
        />
      </div>
      <template #footer>
        <el-button @click="commentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="submitting">提交评价</el-button>
      </template>
    </el-dialog>

    <!-- 预订对话框 -->
    <el-dialog v-model="bookingDialogVisible" title="预订座位" width="700px" :close-on-click-modal="false" class="booking-dialog">
      <div class="dialog-content">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step title="填写信息" />
          <el-step title="确认订单" />
          <el-step title="完成支付" />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1: 填写预订信息 -->
          <div v-show="currentStep === 0" class="step-panel">
            <el-form :model="bookingForm" label-position="top" class="booking-form">
              <div class="form-row">
                <el-form-item label="预订日期" required>
                  <el-date-picker
                    v-model="bookingForm.bookingDate"
                    type="date"
                    placeholder="选择预订日期"
                    :disabled-date="disabledDate"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="用餐时间" required>
                  <el-select v-model="bookingForm.mealTime" placeholder="选择用餐时间" style="width: 100%">
                    <el-option label="早餐" value="早餐" />
                    <el-option label="午餐" value="午餐" />
                    <el-option label="晚餐" value="晚餐" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="用餐人数" required>
                  <div class="quantity-selector">
                    <el-button circle @click="bookingForm.dinerCount > 1 && bookingForm.dinerCount--">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <span class="quantity">{{ bookingForm.dinerCount }} 人</span>
                    <el-button circle @click="bookingForm.dinerCount < 20 && bookingForm.dinerCount++">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </el-form-item>
              </div>

              <!-- 桌位选择 -->
              <div v-if="availableTables.length > 0" class="table-selection">
                <el-form-item label="选择桌位" required>
                  <div class="table-grid">
                    <div
                      v-for="table in availableTables"
                      :key="table.id"
                      :class="['table-item', { selected: bookingForm.tableId === table.id }]"
                      @click="selectTable(table)"
                    >
                      <div class="table-number">{{ table.tableNumber }}</div>
                      <div class="table-name">{{ table.tableName || table.tableNumber }}</div>
                      <div class="table-capacity">容纳{{ table.capacity }}人</div>
                    </div>
                  </div>
                </el-form-item>
              </div>

              <el-form-item label="联系人姓名" required>
                <el-input v-model="bookingForm.contactName" placeholder="请输入联系人姓名" />
              </el-form-item>
              <el-form-item label="联系电话" required>
                <el-input v-model="bookingForm.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="特殊要求">
                <el-input
                  v-model="bookingForm.specialRequest"
                  type="textarea"
                  :rows="2"
                  placeholder="如需要包间、婴儿椅等"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤2: 确认订单 -->
          <div v-show="currentStep === 1" class="step-panel">
            <div class="order-summary">
              <div class="confirm-section">
                <h4><el-icon><Calendar /></el-icon>预订信息</h4>
                <div class="confirm-item">
                  <span class="label">餐厅名称</span>
                  <span class="value">{{ food.name }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">预订日期</span>
                  <span class="value">{{ bookingForm.bookingDate }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">用餐时间</span>
                  <span class="value">{{ bookingForm.mealTime }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">用餐人数</span>
                  <span class="value">{{ bookingForm.dinerCount }} 人</span>
                </div>
                <div class="confirm-item">
                  <span class="label">人均消费</span>
                  <span class="value">¥{{ food.avgPrice }}</span>
                </div>
                <div class="confirm-item total">
                  <span class="label">预计消费</span>
                  <span class="value price">¥{{ estimatedAmount }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><User /></el-icon>联系人信息</h4>
                <div class="confirm-item">
                  <span class="label">姓名</span>
                  <span class="value">{{ bookingForm.contactName }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">电话</span>
                  <span class="value">{{ bookingForm.contactPhone }}</span>
                </div>
                <div v-if="bookingForm.specialRequest" class="confirm-item">
                  <span class="label">特殊要求</span>
                  <span class="value">{{ bookingForm.specialRequest }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤3: 支付 -->
          <div v-show="currentStep === 2" class="step-panel">
            <div class="payment-panel">
              <div class="success-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <h3>订单创建成功</h3>
              <p class="order-no">订单号：{{ orderNo }}</p>
              <div class="payment-amount">
                <span class="label">应付金额</span>
                <span class="amount">¥{{ estimatedAmount }}</span>
              </div>
              <div v-if="countdown > 0" class="countdown-tip">
                <el-icon><Clock /></el-icon>
                请在 <span class="countdown-time">{{ formatCountdown }}</span> 内完成支付
              </div>
              <el-button type="primary" size="large" class="pay-btn" @click="handlePay">
                立即支付
              </el-button>
              <el-button size="large" @click="handleCancelOrder">取消订单</el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeBookingDialog">取消</el-button>
        <el-button v-if="currentStep > 0 && currentStep < 2" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 1" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 1" type="primary" @click="createOrder" :loading="creating">
          确认订单
        </el-button>
      </template>
    </el-dialog>

    <!-- 外卖对话框 -->
    <el-dialog v-model="takeoutDialogVisible" title="外卖下单" width="700px" :close-on-click-modal="false" class="takeout-dialog">
      <div class="dialog-content">
        <el-steps :active="takeoutStep" align-center finish-status="success">
          <el-step title="选择商品" />
          <el-step title="填写地址" />
          <el-step title="确认订单" />
          <el-step title="完成下单" />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1: 选择商品 -->
          <div v-show="takeoutStep === 0" class="step-panel">
            <el-form :model="takeoutForm" label-position="top" class="takeout-form">
              <el-form-item label="选择商品">
                <div class="food-menu">
                  <div class="menu-item">
                    <div class="menu-info">
                      <div class="menu-name">{{ food.name }} - 标准套餐</div>
                      <div class="menu-desc">经典美食组合</div>
                    </div>
                    <div class="menu-price">¥{{ food.avgPrice }}</div>
                    <div class="menu-quantity">
                      <el-button circle size="small" @click="takeoutForm.quantity > 1 && takeoutForm.quantity--">
                        <el-icon><Minus /></el-icon>
                      </el-button>
                      <span>{{ takeoutForm.quantity }}</span>
                      <el-button circle size="small" @click="takeoutForm.quantity++">
                        <el-icon><Plus /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤2: 填写地址 -->
          <div v-show="takeoutStep === 1" class="step-panel">
            <el-form :model="takeoutForm" label-position="top" class="takeout-form">
              <el-form-item label="收货人姓名" required>
                <el-input v-model="takeoutForm.receiverName" placeholder="请输入收货人姓名" />
              </el-form-item>
              <el-form-item label="联系电话" required>
                <el-input v-model="takeoutForm.receiverPhone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="收货地址" required>
                <el-input v-model="takeoutForm.address" placeholder="请输入详细收货地址" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="takeoutForm.remark" type="textarea" :rows="2" placeholder="口味要求、忌口等" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 确认订单 -->
          <div v-show="takeoutStep === 2" class="step-panel">
            <div class="order-summary">
              <div class="confirm-section">
                <h4><el-icon><ShoppingBag /></el-icon>订单信息</h4>
                <div class="confirm-item">
                  <span class="label">商品</span>
                  <span class="value">{{ food.name }} - 标准套餐 x {{ takeoutForm.quantity }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">单价</span>
                  <span class="value">¥{{ food.avgPrice }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">配送费</span>
                  <span class="value">¥5</span>
                </div>
                <div class="confirm-item total">
                  <span class="label">总计</span>
                  <span class="value price">¥{{ takeoutTotalAmount }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><Location /></el-icon>配送信息</h4>
                <div class="confirm-item">
                  <span class="label">收货人</span>
                  <span class="value">{{ takeoutForm.receiverName }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">电话</span>
                  <span class="value">{{ takeoutForm.receiverPhone }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">地址</span>
                  <span class="value">{{ takeoutForm.address }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤4: 完成 -->
          <div v-show="takeoutStep === 3" class="step-panel">
            <div class="payment-panel">
              <div class="success-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <h3>订单创建成功</h3>
              <p class="order-no">订单号：{{ orderNo }}</p>
              <div class="payment-amount">
                <span class="label">应付金额</span>
                <span class="amount">¥{{ takeoutTotalAmount }}</span>
              </div>
              <el-button type="primary" size="large" class="pay-btn" @click="handleTakeoutPay">
                立即支付
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="takeoutDialogVisible = false">取消</el-button>
        <el-button v-if="takeoutStep > 0 && takeoutStep < 3" @click="prevTakeoutStep">上一步</el-button>
        <el-button v-if="takeoutStep < 2" type="primary" @click="nextTakeoutStep">下一步</el-button>
        <el-button v-if="takeoutStep === 2" type="primary" @click="createTakeoutOrder" :loading="creating">
          确认订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Location,
  Money,
  Phone,
  Star,
  StarFilled,
  MapLocation,
  Calendar,
  ArrowLeft,
  Food,
  Grid,
  Clock,
  Ticket,
  Present,
  Position,
  Edit,
  User,
  Minus,
  Plus,
  CircleCheck,
  OfficeBuilding,
  ShoppingBag
} from '@element-plus/icons-vue'
import request from '@/util/request'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const foodId = ref(Number(route.params.id))
const food = ref<any>({})
const imageList = ref<string[]>([])
const commentList = ref<any[]>([])
const isCollected = ref(false)
const commentDialogVisible = ref(false)
const submitting = ref(false)

// 预订相关变量
const bookingDialogVisible = ref(false)
const currentStep = ref(0)
const creating = ref(false)
const orderNo = ref('')
const countdown = ref(0)
let countdownTimer: any = null

// 外卖相关变量
const takeoutDialogVisible = ref(false)
const takeoutStep = ref(0)
const takeoutForm = reactive({
  quantity: 1,
  receiverName: '',
  receiverPhone: '',
  address: '',
  remark: ''
})

const bookingForm = reactive({
  bookingDate: '',
  mealTime: '午餐',
  dinerCount: 2,
  tableId: null as number | null,
  contactName: '',
  contactPhone: '',
  specialRequest: ''
})

const commentForm = reactive({
  rating: 5,
  content: ''
})

const estimatedAmount = computed(() => {
  if (food.value.avgPrice && bookingForm.dinerCount) {
    return (food.value.avgPrice * bookingForm.dinerCount).toFixed(2)
  }
  return '0.00'
})

// 剩余座位数
const remainingTables = computed(() => {
  if (food.value.totalTables && food.value.reservedTables !== undefined) {
    return food.value.totalTables - food.value.reservedTables
  }
  return 0
})

// 外卖总金额
const takeoutTotalAmount = computed(() => {
  if (food.value.avgPrice && takeoutForm.quantity) {
    return ((food.value.avgPrice * takeoutForm.quantity) + 5).toFixed(2)
  }
  return '0.00'
})

const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 加载美食详情
const loadFoodDetail = async () => {
  try {
    const res: any = await request.get(`/food/${foodId.value}`)
    if (res && res.data) {
      food.value = res.data
      isCollected.value = res.data.isCollected === 1
      if (res.data.images) {
        imageList.value = res.data.images.split(',')
      }
      // 加载可用桌位
      if (res.data.totalTables && res.data.totalTables > 0) {
        loadAvailableTables()
      }
    }
  } catch (error) {
    console.error('加载美食详情失败', error)
  }
}

// 可用桌位列表
const availableTables = ref<any[]>([])
const loadAvailableTables = async () => {
  if (!bookingForm.bookingDate || !bookingForm.mealTime) return
  try {
    const res: any = await request.get('/food/table/available', {
      params: {
        foodId: foodId.value,
        bookingDate: bookingForm.bookingDate,
        mealTime: bookingForm.mealTime,
        dinerCount: bookingForm.dinerCount
      }
    })
    if (res && res.data) {
      availableTables.value = res.data
    }
  } catch (error) {
    console.error('加载可用桌位失败', error)
  }
}

// 加载评论列表
const loadCommentList = async () => {
  try {
    const res: any = await request.get('/comment/list', {
      params: {
        contentId: foodId.value,
        contentType: 5,
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

// 收藏/取消收藏
const toggleCollect = async () => {
  try {
    if (isCollected.value) {
      await request.delete(`/food/collect/${foodId.value}`)
      ElMessage.success('取消收藏成功')
      isCollected.value = false
    } else {
      await request.post(`/food/collect/${foodId.value}`)
      ElMessage.success('收藏成功')
      isCollected.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 显示评论对话框
const showCommentDialog = () => {
  commentDialogVisible.value = true
}

// 提交评论
const submitComment = async () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }

  submitting.value = true
  try {
    const res: any = await request.post('/comment/add', {
      contentId: foodId.value,
      contentType: 5,
      content: commentForm.content,
      rating: commentForm.rating
    })
    if (res && res.code === 200) {
      ElMessage.success('评价成功')
      commentDialogVisible.value = false
      commentForm.content = ''
      commentForm.rating = 5
      loadCommentList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '评价失败')
  } finally {
    submitting.value = false
  }
}

// 显示地图
const showMap = () => {
  ElMessage.info('地图功能开发中')
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 禁用今天之前的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 显示预订对话框
const showBookingDialog = () => {
  bookingDialogVisible.value = true
  currentStep.value = 0
  orderNo.value = ''
  countdown.value = 0
}

// 预订日期变化时重新加载可用桌位
const handleDateChange = () => {
  if (food.value.totalTables && food.value.totalTables > 0 && bookingForm.bookingDate && bookingForm.mealTime) {
    loadAvailableTables()
  }
}

// 选择桌位
const selectTable = (table: any) => {
  bookingForm.tableId = table.id
}

// 关闭预订对话框
const closeBookingDialog = () => {
  bookingDialogVisible.value = false
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdown.value = 0
  currentStep.value = 0
  orderNo.value = ''
  bookingForm.bookingDate = ''
  bookingForm.mealTime = '午餐'
  bookingForm.dinerCount = 2
  bookingForm.contactName = ''
  bookingForm.contactPhone = ''
  bookingForm.specialRequest = ''
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value === 0) {
    if (!bookingForm.bookingDate) {
      ElMessage.warning('请选择预订日期')
      return
    }
    if (!bookingForm.mealTime) {
      ElMessage.warning('请选择用餐时间')
      return
    }
    if (!bookingForm.contactName || !bookingForm.contactPhone) {
      ElMessage.warning('请填写联系人信息')
      return
    }
    currentStep.value = 1
  }
}

// 创建订单
const createOrder = async () => {
  creating.value = true
  try {
    const res: any = await request.post('/order/create', {
      foodId: foodId.value,
      foodName: food.value.name,
      bookingDate: bookingForm.bookingDate,
      mealTime: bookingForm.mealTime,
      dinerCount: bookingForm.dinerCount,
      unitPrice: food.value.avgPrice,
      totalAmount: estimatedAmount.value,
      guestName: bookingForm.contactName,
      guestPhone: bookingForm.contactPhone,
      specialRequest: bookingForm.specialRequest,
      orderType: 3
    })
    if (res && res.code === 200) {
      orderNo.value = res.data
      currentStep.value = 2
      ElMessage.success('订单创建成功')
      startCountdown()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    creating.value = false
  }
}

// 启动倒计时
const startCountdown = () => {
  countdown.value = 15 * 60
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      ElMessage.warning('订单已超时自动取消')
      currentStep.value = 0
      orderNo.value = ''
      closeBookingDialog()
    }
  }, 1000)
}

// 支付
const handlePay = async () => {
  try {
    const res: any = await request.post(`/api/order/pay/${orderNo.value}`)
    if (res && res.code === 200) {
      ElMessage.success('支付成功')
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
      countdown.value = 0
      bookingDialogVisible.value = false
      closeBookingDialog()
      ElMessage.info('您的预订已成功！')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '支付失败')
  }
}

// 取消订单
const handleCancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.post(`/api/order/cancel/${orderNo.value}`)
    if (res && res.code === 200) {
      ElMessage.success('订单已取消')
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
      currentStep.value = 0
      orderNo.value = ''
      closeBookingDialog()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消订单失败')
    }
  }
}

// 显示外卖对话框
const showTakeoutDialog = () => {
  takeoutDialogVisible.value = true
  takeoutStep.value = 0
  orderNo.value = ''
}

// 外卖上一步
const prevTakeoutStep = () => {
  if (takeoutStep.value > 0) {
    takeoutStep.value--
  }
}

// 外卖下一步
const nextTakeoutStep = () => {
  if (takeoutStep.value === 1) {
    if (!takeoutForm.receiverName || !takeoutForm.receiverPhone || !takeoutForm.address) {
      ElMessage.warning('请填写完整的配送信息')
      return
    }
  }
  takeoutStep.value++
}

// 创建外卖订单
const createTakeoutOrder = async () => {
  creating.value = true
  try {
    const res: any = await request.post('/order/create', {
      foodId: foodId.value,
      foodName: food.value.name,
      quantity: takeoutForm.quantity,
      unitPrice: food.value.avgPrice,
      totalAmount: takeoutTotalAmount.value,
      receiverName: takeoutForm.receiverName,
      receiverPhone: takeoutForm.receiverPhone,
      address: takeoutForm.address,
      remark: takeoutForm.remark,
      orderType: 3,
      isTakeout: 1
    })
    if (res && res.code === 200) {
      orderNo.value = res.data
      takeoutStep.value = 3
      ElMessage.success('订单创建成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    creating.value = false
  }
}

// 外卖支付
const handleTakeoutPay = async () => {
  try {
    const res: any = await request.post(`/api/order/pay/${orderNo.value}`)
    if (res && res.code === 200) {
      ElMessage.success('支付成功')
      takeoutDialogVisible.value = false
      ElMessage.info('您的外卖订单已下单，等待商家发货！')
      resetTakeoutForm()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '支付失败')
  }
}

// 重置外卖表单
const resetTakeoutForm = () => {
  takeoutForm.quantity = 1
  takeoutForm.receiverName = ''
  takeoutForm.receiverPhone = ''
  takeoutForm.address = ''
  takeoutForm.remark = ''
  takeoutStep.value = 0
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadFoodDetail()
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

.food-detail {
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

  .gallery-main {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;

    :deep(.el-carousel__arrow) {
      width: 50px;
      height: 50px;
      font-size: 24px;
      background: rgba(255, 255, 255, 0.9);

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
      height: 100px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
    }

    .gallery-badges {
      position: absolute;
      bottom: 20px;
      left: 40px;

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;

        &.food-badge {
          color: #f5576c;
        }
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

  .food-title {
    font-size: 36px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 16px;
  }

  .food-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(245, 87, 108, 0.08);
      color: #f5576c;
      border-radius: 20px;
      font-size: 13px;
    }
  }

  .food-stats {
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

    .description-content p {
      line-height: 1.8;
      color: $text-secondary;
      font-size: 15px;
    }

    .map-container {
      height: 300px;
      background: $bg-light;
      border-radius: 12px;

      .map-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: $text-muted;

        .el-icon {
          font-size: 40px;
        }
      }
    }
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

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
        background: linear-gradient(135deg, rgba(245, 87, 108, 0.1), rgba(245, 87, 108, 0.05));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 20px;
          color: #f5576c;
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
          font-weight: 500;

          &.price {
            color: #f5576c;
            font-size: 18px;
            font-weight: 700;
          }
        }
      }
    }
  }
}

// 右侧卡片
.info-right {
  position: sticky;
  top: 80px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .booking-card {
    background: $white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: $shadow-md;

    .booking-header {
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
          color: #f5576c;
          font-weight: 600;
        }

        .amount {
          font-size: 42px;
          font-weight: 800;
          color: #f5576c;
        }

        .unit {
          font-size: 14px;
          color: $text-muted;
        }
      }
    }

    .booking-features {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;

      .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $text-muted;

        .el-icon {
          font-size: 24px;
          color: $primary;
        }
      }
    }

    .seats-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(26, 95, 74, 0.1), rgba(26, 95, 74, 0.05));
      border-radius: 10px;
      margin-bottom: 16px;
      color: $primary;

      .el-icon {
        font-size: 20px;
      }

      strong {
        font-size: 18px;
        color: $primary;
      }
    }

    .takeout-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(245, 87, 108, 0.1), rgba(245, 87, 108, 0.05));
      border-radius: 10px;
      margin-bottom: 16px;
      color: #f5576c;

      .el-icon {
        font-size: 20px;
      }
    }

    .booking-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 24px;
      background: linear-gradient(135deg, #f5576c, #f093fb);
      border: none;
      margin-bottom: 16px;

      .el-icon {
        margin-right: 8px;
      }

      &:hover {
        opacity: 0.9;
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

  .hours-card {
    background: $white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: $shadow-sm;

    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      margin: 0 0 16px;
      color: $text-primary;

      .el-icon {
        color: $primary;
      }
    }

    .hours-list {
      .hours-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid $border;

        &:last-child {
          border-bottom: none;
        }

        .day {
          color: $text-secondary;
          font-size: 14px;
        }

        .time {
          color: $text-primary;
          font-weight: 500;
          font-size: 14px;
        }
      }
    }
  }
}

// 评论区
.comments-section {
  padding: 40px 0;
  margin-top: 24px;
  background: $white;

  .section-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;

    .title-bar {
      width: 5px;
      height: 22px;
      background: linear-gradient(180deg, #f5576c, #f093fb);
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
      background: $bg-light;
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
          }
        }
      }
    }
  }

  .empty-comments {
    padding: 60px;
  }
}

// 对话框样式
.comment-dialog {
  .comment-form {
    .rating-select {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;

      .label {
        font-weight: 500;
        color: $text-secondary;
      }
    }
  }
}

.booking-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;

    .el-dialog__header {
      background: linear-gradient(135deg, #f5576c, #f093fb);
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

    .booking-form {
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        gap: 16px;

        .quantity {
          font-size: 18px;
          font-weight: 600;
          min-width: 80px;
          text-align: center;
        }
      }

      .table-selection {
        margin-bottom: 20px;

        .table-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .table-item {
          padding: 12px;
          border: 2px solid $border;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #f5576c;
          }

          &.selected {
            border-color: #f5576c;
            background: rgba(245, 87, 108, 0.1);
          }

          .table-number {
            font-size: 18px;
            font-weight: 700;
            color: #f5576c;
          }

          .table-name {
            font-size: 12px;
            color: $text-secondary;
            margin: 4px 0;
          }

          .table-capacity {
            font-size: 11px;
            color: $text-muted;
          }
        }
      }
    }

    .order-summary {
      background: $bg-light;
      border-radius: 12px;
      padding: 24px;

      .confirm-section {
        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
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
            font-weight: 500;

            &.price {
              color: #f5576c;
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
        margin-bottom: 16px;

        .label {
          display: block;
          font-size: 14px;
          color: $text-muted;
          margin-bottom: 8px;
        }

        .amount {
          font-size: 42px;
          font-weight: 700;
          color: #f5576c;
        }
      }

      .countdown-tip {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 24px;
        color: $accent;

        .countdown-time {
          font-size: 20px;
          font-weight: 700;
        }
      }

      .pay-btn {
        width: 200px;
        height: 48px;
        font-size: 16px;
        border-radius: 24px;
        background: linear-gradient(135deg, #f5576c, #f093fb);
        border: none;
      }
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
}

@media (max-width: 768px) {
  .detail-header .header-inner {
    padding: 14px 20px;
  }

  .gallery-section .gallery-main .gallery-badges {
    left: 20px;
  }

  .info-container {
    padding: 0 20px;
  }

  .info-left {
    .info-cards {
      grid-template-columns: 1fr;
    }

    .food-title {
      font-size: 26px;
    }
  }

  .comments-section .section-container {
    padding: 0 20px;
  }

  .booking-dialog .dialog-content .booking-form .form-row {
    grid-template-columns: 1fr;
  }
}

// 外卖对话框样式
.takeout-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;

    .el-dialog__header {
      background: linear-gradient(135deg, #ff9a56, #ff6b6b);
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

    .takeout-form {
      .food-menu {
        .menu-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: $bg-light;
          border-radius: 12px;

          .menu-info {
            flex: 1;

            .menu-name {
              font-size: 16px;
              font-weight: 600;
              color: $text-primary;
              margin-bottom: 4px;
            }

            .menu-desc {
              font-size: 13px;
              color: $text-muted;
            }
          }

          .menu-price {
            font-size: 18px;
            font-weight: 700;
            color: #f5576c;
            margin-right: 16px;
          }

          .menu-quantity {
            display: flex;
            align-items: center;
            gap: 12px;

            span {
              font-size: 16px;
              font-weight: 600;
              min-width: 30px;
              text-align: center;
            }
          }
        }
      }
    }

    .order-summary {
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
              color: #f5576c;
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
          color: #f5576c;
        }
      }

      .pay-btn {
        width: 200px;
        height: 48px;
        font-size: 16px;
        border-radius: 24px;
        background: linear-gradient(135deg, #ff9a56, #ff6b6b);
        border: none;
      }
    }
  }
}
</style>
