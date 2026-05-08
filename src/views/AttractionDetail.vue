<template>
  <div class="attraction-detail">
    <TourismTopNav />

    <!-- 主内容区域 -->
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
              <span class="tag type-tag">
                景点
              </span>
              <span class="tag">
                <el-icon><Location /></el-icon>
                {{ attraction.region }}
              </span>
              <span class="tag" v-if="attraction.theme">
                <el-icon><Collection /></el-icon>
                {{ attraction.theme }}
              </span>
              <span
                v-for="tag in attractionDisplayTags"
                :key="tag"
                class="tag extra-tag"
              >
                {{ tag }}
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
                <div class="stat-value">{{ attraction.collectCount || 0 }}</div>
                <div class="stat-label">收藏量</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ commentList.length }}</div>
                <div class="stat-label">用户评论</div>
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

            <!-- 商家信息：必须来自真实绑定用户 -->
            <div v-if="attraction.merchantId" class="merchant-section">
              <h3 class="section-title">
                <span class="title-icon">🏪</span>
                商家信息
              </h3>
              <div class="merchant-card">
                <div class="merchant-avatar" title="进入个人主页" @click="goToMerchantHome">
                  <el-image v-if="merchantAvatarUrl" :src="merchantAvatarUrl" fit="cover" class="merchant-avatar-image">
                    <template #error>
                      <span class="merchant-avatar-text">{{ merchantInitial }}</span>
                    </template>
                  </el-image>
                  <el-icon v-else><Shop /></el-icon>
                </div>
                <div class="merchant-info">
                  <div class="merchant-name">{{ attraction.merchantName || '认证商家' }}</div>
                  <div class="merchant-meta">
                    <el-tag v-if="attraction.merchantCertified === 1" type="warning" size="small" effect="plain">
                      <el-icon><Check /></el-icon> 认证商家
                    </el-tag>
                    <span class="meta-text" v-if="attraction.merchantLocation">{{ attraction.merchantLocation }}</span>
                    <span class="meta-text" v-if="attraction.commentCount">{{ attraction.commentCount }}条评论</span>
                  </div>
                  <p class="merchant-desc" v-if="attraction.merchantBio">{{ attraction.merchantBio }}</p>
                </div>
                <div class="merchant-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>

            <!-- 景点介绍 -->
            <div class="description-section">
              <h3 class="section-title">
                <span class="title-icon">📝</span>
                景点介绍
              </h3>
              <div class="description-content">
                <p>{{ attraction.description || '暂无详细介绍' }}</p>
              </div>
            </div>

            <!-- 地图 -->
            <div class="map-section">
              <h3 class="section-title">
                <span class="title-icon">📍</span>
                地理位置
              </h3>
              <div id="attraction-map" class="map-container"></div>
              <div class="map-address">
                <el-icon><Location /></el-icon>
                <span>{{ attraction.address }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧悬浮信息卡片 -->
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
                      <span class="stock-label">剩余：</span>
                      <span class="stock-count">{{ getRemainingTickets(ticket) }}</span>
                      <span class="stock-unit">张</span>
                    </div>
                  </div>
                  <div class="ticket-price">
                    <span class="price">¥{{ ticket.price }}</span>
                    <span class="buy-btn calendar-btn" @click.stop="openTicketInventoryCalendar(ticket)">日历</span>
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
                  {{ isCollected ? '已收藏' : '收藏' }} ({{ attraction.collectCount || 0 }})
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
                  有效期：{{ ticket.validDays }}天                </div>
              </div>
              <div class="ticket-card-footer">
                <div class="price-info">
                    <span class="currency">¥</span>
                  <span class="amount">{{ ticket.price }}</span>
                </div>
                <div class="ticket-card-actions">
                  <el-button round @click="openTicketInventoryCalendar(ticket)">库存日历</el-button>
                  <el-button type="primary" round @click="selectTicket(ticket)">立即购买</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户评论 -->
      <section class="comments-section">
        <div class="section-container">
          <div class="comments-header">
            <h3 class="section-title">
              <span class="title-bar"></span>
              用户评论
              <span class="comment-count">({{ commentList.length }})</span>
            </h3>
            <el-button type="primary" round @click="showCommentDialog">立即评论</el-button>
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
                <div class="comment-actions">
                  <el-button text size="small" :icon="ChatDotRound" @click="replyComment(comment, comment)">回复</el-button>
                  <el-button
                    v-if="comment.canDelete"
                    text
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="deleteComment(comment)"
                  >
                    删除
                  </el-button>
                </div>
                <div v-if="comment.images" class="comment-images">
                  <el-image
                    v-for="(img, idx) in parseImageList(comment.images)"
                    :key="idx"
                    :src="img"
                    fit="cover"
                    class="comment-img"
                    :preview-src-list="parseImageList(comment.images)"
                  />
                </div>
                <div v-if="comment.replies?.length" class="reply-list">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <el-avatar :src="reply.userAvatar" :size="32" />
                    <div class="reply-body">
                      <div class="comment-header">
                        <div class="comment-user">
                          <span class="username">{{ reply.userName }}</span>
                        </div>
                        <span class="comment-time">{{ formatTime(reply.createTime) }}</span>
                      </div>
                      <div class="comment-content">{{ reply.content }}</div>
                      <div class="comment-actions">
                        <el-button text size="small" :icon="ChatDotRound" @click="replyComment(reply, comment)">回复</el-button>
                        <el-button
                          v-if="reply.canDelete"
                          text
                          size="small"
                          type="danger"
                          :icon="Delete"
                          @click="deleteComment(reply)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无评论，快来抢先评论吧" class="empty-comments" />
        </div>
      </section>
    </main>

    <el-dialog v-model="commentDialogVisible" :title="replyingTo ? '回复评论' : '立即评论'" width="550px" class="comment-dialog">
      <div class="comment-form">
        <div v-if="replyingTo" class="reply-tip">正在回复 {{ replyingTo.userName }}</div>
        <div v-else class="rating-select">
          <span class="label">评分</span>
          <el-rate v-model="commentForm.rating" size="large" />
        </div>
        <el-input
          v-model="commentForm.content"
          type="textarea"
          :rows="5"
          :placeholder="replyingTo ? `回复 ${replyingTo.userName}...` : '分享你的游玩体验...'"
          maxlength="500"
          show-word-limit
        />
      </div>
      <template #footer>
        <el-button @click="closeCommentDialog">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="submittingComment">
          {{ replyingTo ? '提交回复' : '提交评论' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 门票购买弹窗 -->
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
          <!-- 步骤1：选择门票 -->
          <div v-show="currentStep === 0" class="step-panel">
            <div v-if="ticketList.length > 0" class="ticket-select-grid">
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
            <div v-else class="ticket-select-grid">
              <div class="ticket-select-card active" @click="orderForm.ticketId = null">
                <div class="card-check">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="ticket-select-name">{{ fallbackTicketName }}</div>
                <div class="ticket-select-desc">该景区暂未配置票种，可按景区基础票价下单。</div>
                <div class="ticket-select-price">
                  <span class="currency">¥</span>
                  <span class="amount">{{ fallbackTicketPrice }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2：选择日期和数量 -->
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
	                  @change="handleVisitDateChange"
	                />
	              </el-form-item>
	              <el-form-item label="购买数量" required>
	                <div class="quantity-selector">
	                  <el-button circle @click="orderForm.ticketCount > 1 && orderForm.ticketCount--">
	                    <el-icon><Minus /></el-icon>
	                  </el-button>
	                  <span class="quantity">{{ orderForm.ticketCount }}</span>
	                  <el-button circle :disabled="orderForm.ticketCount >= maxSelectableTicketCount" @click="orderForm.ticketCount < maxSelectableTicketCount && orderForm.ticketCount++">
	                    <el-icon><Plus /></el-icon>
	                  </el-button>
	                </div>
	                <div v-if="orderForm.visitDate && selectedTicket" class="inventory-inline-tip">
	                  {{ orderForm.visitDate }} 剩余 {{ selectedVisitDateRemaining }} 张
	                </div>
	              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3：填写信息 -->
          <div v-show="currentStep === 2" class="step-panel">
            <el-form :model="orderForm" label-position="top" class="order-form visitor-order-form">
              <div class="visitor-list">
                <div v-for="(visitor, index) in visitorList" :key="index" class="visitor-card">
                  <div class="visitor-card-title">游客 {{ index + 1 }}</div>
                  <el-form-item label="游客姓名" required>
                    <el-input v-model="visitor.name" placeholder="请输入真实姓名" />
                  </el-form-item>
                  <el-form-item label="身份证号" required>
                    <el-input v-model="visitor.idCard" placeholder="请输入身份证号" maxlength="18" />
                  </el-form-item>
                </div>
              </div>
              <el-form-item label="联系电话" required>
                <el-input
                  v-model="orderForm.visitorPhone"
                  placeholder="用于接收订单通知"
                  maxlength="11"
                  show-word-limit
                  inputmode="numeric"
                  @input="orderForm.visitorPhone = normalizeMobilePhone($event)"
                />
              </el-form-item>
              <el-form-item label="特殊需求">
                <el-input
                  v-model="orderForm.specialRequest"
                  type="textarea"
                  :rows="3"
                  placeholder="如需导游服务等可填写"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤4：确认订单 -->
          <div v-show="currentStep === 3" class="step-panel">
            <div class="order-confirm">
              <div class="confirm-section">
                <h4><el-icon><Ticket /></el-icon>订单信息</h4>
                <div class="confirm-item">
                  <span class="label">门票类型</span>
                  <span class="value">{{ selectedTicket?.ticketName || fallbackTicketName }}</span>
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
                  <span class="value">¥{{ ticketUnitPrice }}</span>
                </div>
                <div class="confirm-item total">
                  <span class="label">总金额</span>
                  <span class="value price">¥{{ totalAmount }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><User /></el-icon>游客信息</h4>
                <div v-for="(visitor, index) in visitorList" :key="index" class="confirm-item visitor-confirm-item">
                  <span class="label">游客 {{ index + 1 }}</span>
                  <span class="value">{{ visitor.name }} / {{ visitor.idCard }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">联系电话</span>
                  <span class="value">{{ orderForm.visitorPhone }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤5：支付 -->
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
              <PaymentMethodCard />
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

    <el-dialog
      v-model="ticketCalendarVisible"
      width="720px"
      class="inventory-calendar-dialog"
      custom-class="inventory-calendar-dialog"
      :title="ticketCalendarTitle"
      :teleported="false"
    >
      <div class="calendar-summary">
        <div>
          <div class="calendar-item-name">{{ ticketCalendarTicket?.ticketName || '门票库存' }}</div>
          <div class="calendar-item-meta">
            每日总票数 {{ ticketCalendarTicket?.totalCount || 0 }} 张
            <span v-if="ticketCalendarTicket?.price">¥{{ ticketCalendarTicket.price }}/张</span>
          </div>
        </div>
        <div class="calendar-legend">
          <span><i class="legend-dot enough"></i>有票</span>
          <span><i class="legend-dot low"></i>紧张</span>
          <span><i class="legend-dot empty"></i>售罄</span>
        </div>
      </div>
      <div class="calendar-toolbar">
        <el-button class="month-nav" circle @click="shiftTicketCalendarMonth(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="calendar-month-title">{{ ticketCalendarMonthLabel }}</div>
        <el-button class="month-nav" circle @click="shiftTicketCalendarMonth(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div v-loading="ticketCalendarLoading" class="inventory-calendar">
        <div class="calendar-week" v-for="day in calendarWeekdays" :key="day">{{ day }}</div>
        <div
          v-for="day in ticketCalendarDays"
          :key="day.key"
          class="calendar-day"
          :class="{ muted: !day.inMonth, today: day.isToday, low: day.inMonth && day.remainingCount > 0 && day.remainingCount <= 10, empty: day.inMonth && day.remainingCount <= 0 }"
        >
          <div class="day-number">
            <span>{{ day.date.date() }}</span>
            <em v-if="day.isToday && day.inMonth">今天</em>
          </div>
          <div v-if="day.inMonth" class="day-stock">
            {{ day.remainingCount > 0 ? `剩余 ${day.remainingCount} 张` : '售罄' }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 支付成功弹窗 -->
    <el-dialog v-model="paySuccessVisible" title="" width="450px" :close-on-click-modal="false" class="success-dialog">
      <div class="success-content">
        <div class="success-icon-large">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <h3>支付成功</h3>
        <p>订单已支付成功</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="viewETicket">查看详情</el-button>
        <el-button @click="paySuccessVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  Location,
  Clock,
  Phone,
  Star,
  StarFilled,
  Collection,
  Share,
  Ticket,
  Calendar,
  MapLocation,
  Check,
  Minus,
  Plus,
  User,
  CircleCheck,
  Shop,
  ArrowLeft,
  ArrowRight,
  ChatDotRound,
  Delete
} from '@element-plus/icons-vue'
import request from '@/util/request'
import { extractDisplayTags } from '@/utils/contentTags'
import { buildPayQrCodeUrl } from '@/utils/payQrCode'
import { formatDateTime, type DateInput } from '@/utils/date'
import { normalizeMobilePhone } from '@/utils/attractionForm'
import { loadAMapScript } from '@/utils/amap'
import { normalizeImageUrl, parseImageList } from '@/utils/imageUrl'

import TourismTopNav from '@/components/TourismTopNav.vue'
import PaymentMethodCard from '@/components/PaymentMethodCard.vue'

const router = useRouter()
const route = useRoute()

const attractionId = ref(Number(route.params.id))
const attraction = ref<any>({})
const imageList = ref<string[]>([])
const ticketList = ref<any[]>([])
const commentList = ref<any[]>([])
const isCollected = ref(false)
const ticketDialogVisible = ref(false)
const commentDialogVisible = ref(false)
const submittingComment = ref(false)
const replyingTo = ref<any>(null)
const replyRoot = ref<any>(null)
const attractionDisplayTags = computed(() => {
  const tags = extractDisplayTags(attraction.value)
  return tags.filter((tag) => tag !== attraction.value.region && tag !== attraction.value.theme)
})
const merchantAvatarUrl = computed(() => attraction.value.merchantAvatar ? normalizeImageUrl(attraction.value.merchantAvatar, '') : '')
const merchantInitial = computed(() => {
  const name = attraction.value.merchantName || attraction.value.name || '商'
  return String(name).trim().slice(0, 1)
})
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
const calendarWeekdays = ['一', '二', '三', '四', '五', '六', '日']
const ticketCalendarVisible = ref(false)
const ticketCalendarLoading = ref(false)
const ticketCalendarTicket = ref<any>(null)
const ticketCalendarMonth = ref(dayjs().startOf('month'))
const ticketCalendarAvailability = ref<Record<string, number>>({})

const dialogTitle = computed(() => currentStep.value === 4 ? '完成支付' : '在线购票')
const ticketCalendarTitle = computed(() => `${ticketCalendarTicket.value?.ticketName || '门票'}库存日历`)
const ticketCalendarMonthLabel = computed(() => ticketCalendarMonth.value.format('YYYY年M月'))
const ticketCalendarDays = computed(() => {
  const monthStart = ticketCalendarMonth.value.startOf('month')
  const firstDayOffset = (monthStart.day() + 6) % 7
  const gridStart = monthStart.subtract(firstDayOffset, 'day')
  return Array.from({ length: 42 }, (_, index) => {
    const date = gridStart.add(index, 'day')
    const dateKey = date.format('YYYY-MM-DD')
    return {
      key: dateKey,
      date,
      inMonth: date.month() === monthStart.month(),
      isToday: date.isSame(dayjs(), 'day'),
      remainingCount: Number(ticketCalendarAvailability.value[dateKey] ?? 0)
    }
  })
})

const orderForm = reactive({
  ticketId: null as number | null,
  visitDate: '',
  ticketCount: 1,
  visitorName: '',
  visitorIdCard: '',
  visitorPhone: '',
  specialRequest: ''
})

type VisitorInfo = {
  name: string
  idCard: string
}

const visitorList = reactive<VisitorInfo[]>([
  { name: '', idCard: '' }
])

const commentForm = reactive({
  rating: 5,
  content: ''
})

const fallbackTicketName = computed(() => `${attraction.value.name || '景区'}基础门票`)
const fallbackTicketPrice = computed(() => Number(attraction.value.ticketPrice || 0))
const ticketUnitPrice = computed(() => {
  if (selectedTicket.value) return Number(selectedTicket.value.price || 0)
  return fallbackTicketPrice.value
})
const totalAmount = computed(() => {
  return (ticketUnitPrice.value * orderForm.ticketCount).toFixed(2)
})

const normalizedVisitors = computed(() => {
  return visitorList.slice(0, Math.max(1, orderForm.ticketCount)).map((visitor) => ({
    name: visitor.name.trim(),
    idCard: visitor.idCard.trim()
  }))
})
const selectedVisitDateRemaining = computed(() => {
  if (!selectedTicket.value || !orderForm.visitDate) {
    return selectedTicket.value?.remainingCount ?? selectedTicket.value?.totalCount ?? 0
  }
  const stock = Array.isArray(selectedTicket.value.dateAvailability)
    ? selectedTicket.value.dateAvailability.find((item: any) => (item.inventoryDate || item.stayDate) === orderForm.visitDate)
    : null
  return Number(stock?.remainingCount ?? selectedTicket.value.remainingCount ?? selectedTicket.value.totalCount ?? 0)
})
const maxSelectableTicketCount = computed(() => {
  const remaining = selectedVisitDateRemaining.value
  return Math.max(0, Math.min(10, remaining || 0))
})

const syncVisitorListWithTicketCount = () => {
  const targetCount = Math.max(1, Math.min(10, Number(orderForm.ticketCount) || 1))
  while (visitorList.length < targetCount) {
    visitorList.push({ name: '', idCard: '' })
  }
  while (visitorList.length > targetCount) {
    visitorList.pop()
  }
}

watch(() => orderForm.ticketCount, syncVisitorListWithTicketCount, { immediate: true })

const buildSpecialRequestForTicketOrder = () => {
  const visitorText = normalizedVisitors.value
    .map((visitor, index) => `游客${index + 1}: ${visitor.name} ${visitor.idCard}`)
    .join('；')
  const requestText = orderForm.specialRequest.trim()
  return requestText ? `${visitorText}\n特殊需求: ${requestText}` : visitorText
}

// 获取剩余票数
const getRemainingTickets = (ticket: any) => {
  const todayKey = dayjs().format('YYYY-MM-DD')
  const todayStock = Array.isArray(ticket.dateAvailability)
    ? ticket.dateAvailability.find((item: any) => (item.inventoryDate || item.stayDate) === todayKey)
    : null
  if (todayStock) {
    return todayStock.remainingCount
  }
  return ticket.remainingCount ?? ticket.totalCount ?? '不限'
}

// 加载景点详情
const loadAttractionDetail = async () => {
  try {
    const res: any = await request.get(`/attraction/${attractionId.value}`)
    if (res && res.data) {
      attraction.value = res.data
      isCollected.value = res.data.isCollected === 1
      imageList.value = parseImageList(res.data.images)
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
const initMap = async () => {
  if (!attraction.value.longitude || !attraction.value.latitude) {
    console.log('景点无坐标信息')
    return
  }
  
  const container = document.getElementById('attraction-map')
  if (!container) return
  
  try {
    await loadAMapScript()
    container.innerHTML = ''

    const map = new window.AMap.Map('attraction-map', {
      zoom: 15,
      center: [attraction.value.longitude, attraction.value.latitude],
      mapStyle: 'amap://styles/normal'
    })

    const marker = new window.AMap.Marker({
      position: [attraction.value.longitude, attraction.value.latitude],
      title: attraction.value.name
    })
    map.add(marker)

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
  } catch (error) {
    console.error('高德地图加载失败:', error)
  }
}

// 加载门票列表
const loadTicketList = async () => {
  try {
    const params: Record<string, string> = {}
    if (orderForm.visitDate) {
      params.startDate = orderForm.visitDate
      params.endDate = dayjs(orderForm.visitDate).add(1, 'day').format('YYYY-MM-DD')
    }
    const res: any = await request.get(`/ticket/attraction/${attractionId.value}`, { params })
    if (res && res.data) {
      ticketList.value = res.data
      if (selectedTicket.value?.id) {
        const refreshed = ticketList.value.find((item: any) => item.id === selectedTicket.value.id)
        if (refreshed) selectedTicket.value = refreshed
      }
    }
  } catch (error) {
    console.error('加载门票列表失败', error)
  }
}

const handleVisitDateChange = async () => {
  await loadTicketList()
  if (orderForm.ticketCount > maxSelectableTicketCount.value) {
    orderForm.ticketCount = maxSelectableTicketCount.value
  }
}

const openTicketInventoryCalendar = async (ticket: any) => {
  ticketCalendarTicket.value = ticket
  const baseDate = orderForm.visitDate ? dayjs(orderForm.visitDate) : dayjs()
  ticketCalendarMonth.value = baseDate.startOf('month')
  ticketCalendarVisible.value = true
  await loadTicketInventoryCalendar()
}

const shiftTicketCalendarMonth = async (offset: number) => {
  ticketCalendarMonth.value = ticketCalendarMonth.value.add(offset, 'month').startOf('month')
  await loadTicketInventoryCalendar()
}

const loadTicketInventoryCalendar = async () => {
  if (!ticketCalendarTicket.value?.id) return
  ticketCalendarLoading.value = true
  try {
    const startDate = ticketCalendarMonth.value.startOf('month')
    const endDate = startDate.add(1, 'month')
    const res: any = await request.get(`/ticket/attraction/${attractionId.value}`, {
      params: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      }
    })
    const tickets = Array.isArray(res?.data) ? res.data : []
    const ticket = tickets.find((item: any) => item.id === ticketCalendarTicket.value.id)
    const availability: Record<string, number> = {}
    if (ticket && Array.isArray(ticket.dateAvailability)) {
      ticket.dateAvailability.forEach((item: any) => {
        availability[item.inventoryDate || item.stayDate] = Number(item.remainingCount || 0)
      })
    }
    ticketCalendarAvailability.value = availability
  } catch (error) {
    console.error('加载门票库存日历失败', error)
    ticketCalendarAvailability.value = {}
    ElMessage.error('加载门票库存日历失败')
  } finally {
    ticketCalendarLoading.value = false
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

const showCommentDialog = () => {
  if (!localStorage.getItem('auth-token')) {
    ElMessage.warning('请先登录后再评论')
    router.push('/login')
    return
  }
  replyingTo.value = null
  replyRoot.value = null
  commentForm.content = ''
  commentDialogVisible.value = true
}

const closeCommentDialog = () => {
  commentDialogVisible.value = false
  replyingTo.value = null
  replyRoot.value = null
  commentForm.content = ''
  commentForm.rating = 5
}

const replyComment = (comment: any, rootComment: any) => {
  if (!localStorage.getItem('auth-token')) {
    ElMessage.warning('请先登录后再回复')
    router.push('/login')
    return
  }
  replyingTo.value = comment
  replyRoot.value = rootComment
  commentForm.content = `@${comment.userName} `
  commentDialogVisible.value = true
}

const submitComment = async () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submittingComment.value = true
  try {
    const res: any = await request.post('/comment/add', {
      contentId: attractionId.value,
      contentType: 4,
      content: commentForm.content,
      rating: replyingTo.value ? null : commentForm.rating,
      parentId: replyRoot.value?.id || null
    })
    if (res && res.code === 200) {
      ElMessage.success(replyingTo.value ? '回复成功' : '评论成功')
      closeCommentDialog()
      loadCommentList()
    }
  } catch (error: any) {
    if (!error.messageShown) ElMessage.error(error.message || '评论失败')
  } finally {
    submittingComment.value = false
  }
}

const deleteComment = async (comment: any) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？', '删除评论', { type: 'warning' })
    const res: any = await request.delete(`/comment/delete/${comment.id}`)
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      loadCommentList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
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
  ticketDialogVisible.value = true
  currentStep.value = 0
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
}

const nextStep = () => {
  if (currentStep.value === 0 && ticketList.value.length > 0 && !orderForm.ticketId) {
    ElMessage.warning('请选择门票类型')
    return
  }
  if (currentStep.value === 1) {
    if (!orderForm.visitDate) {
      ElMessage.warning('请选择游玩日期')
      return
    }
    if (selectedTicket.value && selectedVisitDateRemaining.value <= 0) {
      ElMessage.warning('所选日期暂无余票')
      return
    }
    if (selectedTicket.value && orderForm.ticketCount > selectedVisitDateRemaining.value) {
      ElMessage.warning(`所选日期仅剩${selectedVisitDateRemaining.value}张票`)
      return
    }
  }
  if (currentStep.value === 2) {
    const missingIndex = normalizedVisitors.value.findIndex((visitor) => !visitor.name || !visitor.idCard)
    if (missingIndex >= 0) {
      ElMessage.warning(`请填写游客${missingIndex + 1}的姓名和身份证号`)
      return
    }
    if (!orderForm.visitorPhone) {
      ElMessage.warning('请填写联系电话')
      return
    }
    if (orderForm.visitorPhone.length !== 11) {
      ElMessage.warning('请输入11位手机号')
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
    const primaryVisitor = normalizedVisitors.value[0]
    const res: any = await request.post('/order/create', {
      orderType: 1,
      ticketId: orderForm.ticketId ?? undefined,
      ticketName: selectedTicket.value ? selectedTicket.value.ticketName : fallbackTicketName.value,
      ticketCount: orderForm.ticketCount,
      unitPrice: ticketUnitPrice.value,
      totalAmount: totalAmount.value,
      visitDate: orderForm.visitDate,
      visitorName: orderForm.ticketCount > 1 ? `${primaryVisitor.name}等${orderForm.ticketCount}人` : primaryVisitor.name,
      visitorIdCard: primaryVisitor.idCard,
      visitorPhone: orderForm.visitorPhone,
      specialRequest: buildSpecialRequestForTicketOrder()
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
      payQrCodeUrl.value = await buildPayQrCodeUrl(res.data)
      if (!payQrCodeUrl.value) {
        throw new Error('未获取到支付宝支付二维码')
      }
      payStatusMessage.value = res.data?.scanTip || '请使用支付宝沙箱 App 和沙箱买家账号扫码，普通支付宝会提示订单不存在'
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
  let requestPending = false
  let successHandled = false

  payPollingTimer = setInterval(async () => {
    if (requestPending || successHandled) return

    pollCount++
    if (pollCount >= 60) {
      stopPayPolling()
      payStatusMessage.value = '支付超时，请重新生成二维码'
      return
    }

    payPollProgress.value = Math.min((pollCount / 60) * 100, 95)

    try {
      requestPending = true
      const res: any = await request.get(`/order/pay/status/${currentOrderNo}`)
      if (res && res.code === 200 && res.data && (res.data.paid || res.data.orderStatus === 1)) {
        successHandled = true
        stopPayPolling()
        payPollProgress.value = 100
        payStatusMessage.value = '支付成功'
        ElMessage.success('支付成功')
        ticketDialogVisible.value = false
        paySuccessVisible.value = true
        resetOrderForm()
      }
    } catch (error) {
      console.error('轮询支付状态失败', error)
    } finally {
      requestPending = false
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
      attraction.value.collectCount = Math.max(0, (attraction.value.collectCount || 0) - 1)
    } else {
      await request.post(`/attraction/collect/${attractionId.value}`)
      ElMessage.success('收藏成功')
      isCollected.value = true
      attraction.value.collectCount = (attraction.value.collectCount || 0) + 1
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const formatTime = (time: DateInput) => formatDateTime(time, '-', 'YYYY-MM-DD HH:mm')

const resetOrderForm = () => {
  stopPayPolling()
  orderForm.ticketId = null
  orderForm.visitDate = ''
  orderForm.ticketCount = 1
  orderForm.visitorName = ''
  orderForm.visitorIdCard = ''
  orderForm.visitorPhone = ''
  orderForm.specialRequest = ''
  visitorList.splice(0, visitorList.length, { name: '', idCard: '' })
  selectedTicket.value = null
  currentStep.value = 0
  payQrCodeUrl.value = ''
  payPollProgress.value = 0
  payStatusMessage.value = ''
}

const goHome = () => router.push('/')
const goBack = () => router.back()
const goToMerchantHome = () => {
  if (attraction.value.merchantId) router.push(`/user/${attraction.value.merchantId}`)
}

onMounted(() => {
  loadAttractionDetail()
  loadTicketList()
  loadCommentList()
})
</script>

<style scoped lang="scss">
// 颜色变量
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

// 图片区域
.gallery-section {

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
    flex-wrap: wrap;

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

      &.type-tag {
        background: linear-gradient(135deg, $primary, #2f8668);
        color: $white;
        font-weight: 600;
      }

      &.extra-tag {
        background: rgba(232, 168, 56, 0.12);
        color: #8a6116;
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

  .merchant-section,
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

    .merchant-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
      border-radius: 12px;
      border: 1px solid #ffe58f;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 16px rgba(255, 169, 64, 0.2);
        transform: translateY(-2px);
      }

      .merchant-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 24px;
        overflow: hidden;
        flex: 0 0 56px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-1px) scale(1.04);
          box-shadow: 0 8px 18px rgba(250, 140, 22, 0.24);
        }

        .merchant-avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .merchant-avatar-text {
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }
      }

      .merchant-info {
        flex: 1;
        min-width: 0;
      }

      .merchant-name {
        font-size: 16px;
        font-weight: 600;
        color: #d46b08;
        margin-bottom: 6px;
      }

      .merchant-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .meta-text {
        font-size: 12px;
        color: $text-muted;
      }

      .merchant-desc {
        font-size: 13px;
        color: $text-secondary;
        line-height: 1.6;
        margin: 10px 0 0;
      }

      .merchant-arrow {
        color: #d46b08;
        font-size: 18px;
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

// 评论区域
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

  .comments-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;

    .section-title {
      margin: 0;
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

        .comment-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .reply-list {
          margin-top: 12px;
          padding: 12px;
          background: $bg-light;
          border-radius: 10px;

          .reply-item {
            display: flex;
            gap: 10px;
            padding: 10px 0;

            &:not(:last-child) {
              border-bottom: 1px solid $border;
            }

            .reply-body {
              flex: 1;
              min-width: 0;
            }
          }
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

.comment-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
  }

  .comment-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .rating-select {
    display: flex;
    align-items: center;
    gap: 12px;

    .label {
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .reply-tip {
    color: $text-secondary;
    font-size: 14px;
  }
}

// 门票弹窗
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

      &.visitor-order-form {
        max-width: 560px;
      }

      .visitor-list {
        display: grid;
        gap: 14px;
      }

      .visitor-card {
        padding: 16px 16px 4px;
        border: 1px solid $border;
        border-radius: 12px;
        background: #fff;
      }

      .visitor-card-title {
        margin-bottom: 12px;
        font-size: 15px;
        font-weight: 700;
        color: $text-primary;
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
          gap: 24px;
          padding: 10px 0;

          .label {
            color: $text-muted;
            flex: 0 0 auto;
          }

          .value {
            color: $text-primary;
            font-weight: 500;
            text-align: right;
            word-break: break-all;

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

          &.visitor-confirm-item {
            align-items: flex-start;
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

// 支付成功弹窗
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

// 响应式适配
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

.ticket-card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.calendar-btn {
  margin-right: 8px;
  background: rgba(49, 130, 206, 0.1);
  color: #2563eb;
}

.inventory-inline-tip {
  margin-top: 8px;
  color: $text-muted;
  font-size: 13px;
}

.inventory-calendar-dialog {
  .calendar-summary {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid #edf2f7;
  }

  .calendar-item-name {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
  }

  .calendar-item-meta {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    color: $text-muted;
    font-size: 13px;
  }

  .calendar-legend {
    display: flex;
    align-items: center;
    gap: 12px;
    color: $text-muted;
    font-size: 13px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #16a34a;

    &.low { background: #f59e0b; }
    &.empty { background: #ef4444; }
  }

  .calendar-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin: 18px 0;
  }

  .month-nav {
    width: 34px;
    height: 34px;
  }

  .calendar-month-title {
    min-width: 120px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
  }

  .inventory-calendar {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
  }

  .calendar-week {
    text-align: center;
    color: $text-muted;
    font-size: 13px;
    padding: 6px 0;
  }

  .calendar-day {
    min-height: 76px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    padding: 8px;
    background: #f8fffb;

    &.muted {
      opacity: 0.35;
      background: #f8fafc;
    }

    &.today {
      border-color: $primary;
    }

    &.low {
      background: #fffbeb;
      border-color: #facc15;
    }

    &.empty {
      background: #fff1f2;
      border-color: #fecdd3;
    }
  }

  .day-number {
    display: flex;
    justify-content: space-between;
    font-weight: 700;

    em {
      font-style: normal;
      color: $primary;
      font-size: 12px;
    }
  }

  .day-stock {
    margin-top: 12px;
    font-size: 13px;
    color: #166534;
  }

  .calendar-day.low .day-stock {
    color: #92400e;
  }

  .calendar-day.empty .day-stock {
    color: #be123c;
  }
}
</style>
