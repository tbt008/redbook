<template>
  <div class="hotel-detail">
    <TourismTopNav />

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 图片画廊 -->
      <section class="gallery-section">
        <div class="gallery-main">
          <el-carousel height="500px" indicator-position="none" arrow="never">
            <el-carousel-item v-for="(image, index) in imageList" :key="index">
              <el-image :src="image" fit="cover" class="gallery-image" />
            </el-carousel-item>
          </el-carousel>
          <div class="gallery-overlay"></div>
          <div class="gallery-badges">
            <span class="badge hotel-badge">
              <el-icon><OfficeBuilding /></el-icon>
              酒店
            </span>
          </div>
        </div>
      </section>

      <!-- 酒店信息 -->
      <section class="info-section">
        <div class="info-container">
          <!-- 左侧信息 -->
          <div class="info-left">
            <div class="breadcrumb">
              <span class="breadcrumb-item" @click="goHome">首页</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item">酒店</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ hotel.name }}</span>
            </div>

            <h1 class="hotel-title">{{ hotel.name }}</h1>

            <div class="hotel-tags">
              <span class="tag type-tag">
                酒店
              </span>
              <span class="tag">
                <el-icon><Location /></el-icon>
                {{ hotel.region }}
              </span>
              <span class="tag star" v-if="hotel.starLevel">
                <el-icon><Star /></el-icon>
                {{ hotel.starLevel }}星级
              </span>
              <span
                v-for="tag in hotelDisplayTags"
                :key="tag"
                class="tag extra-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="hotel-stats">
              <div class="stat-item">
                <el-rate
                  v-model="hotel.rating"
                  disabled
                  show-score
                  text-color="#e8a838"
                  score-template="{value}"
                />
                <span class="stat-label">评分</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ hotel.viewCount || 0 }}</div>
                <div class="stat-label">浏览量</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ hotel.collectCount || 0 }}</div>
                <div class="stat-label">收藏量</div>
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
                  <div class="card-label">酒店地址</div>
                  <div class="card-value">{{ hotel.address }}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">参考价格</div>
                  <div class="card-value price">¥{{ hotel.price }}/晚起</div>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-label">联系电话</div>
                  <div class="card-value">{{ hotel.contactPhone || '暂无信息' }}</div>
                </div>
              </div>
            </div>

            <!-- 房型与价格（对标 OTA：先选房型再谈日期） -->
            <div class="room-types-section" v-if="roomList.length > 0">
              <h3 class="section-title">
                <span class="title-icon">🛏️</span>
                房型与价格
              </h3>
              <p class="room-section-hint">不同房型价格、床型与可住人数不同，请选择合适的房型下单。</p>
              <div class="room-card-list">
                <div
                  v-for="room in roomList"
                  :key="room.id"
                  class="room-type-card"
                  :class="{ active: bookingForm.hotelRoomId === room.id, unavailable: isRoomUnavailableForSelectedRange(room) }"
                  @click="bookingForm.hotelRoomId = room.id"
                >
                  <div class="room-card-media" v-if="room.image">
                    <el-image :src="room.image" fit="cover" class="room-thumb" />
                  </div>
                  <div class="room-card-body">
                    <div class="room-card-head">
                      <span class="room-name">{{ room.roomName }}</span>
                      <el-tag v-if="room.roomType" size="small" type="info" effect="plain">
                        {{ roomTypeLabel(room.roomType) }}
                      </el-tag>
                    </div>
                    <div class="room-meta-line">
                      <span v-if="room.bedType">{{ room.bedType }}</span>
                      <span v-if="room.maxOccupancy" class="meta-dot">最多 {{ room.maxOccupancy }} 人</span>
                      <span v-if="room.roomArea" class="meta-dot">{{ room.roomArea }}</span>
                      <span v-if="room.floor" class="meta-dot">{{ room.floor }}</span>
                    </div>
                    <p class="room-desc" v-if="room.description">{{ room.description }}</p>
                    <div class="room-card-foot">
                      <div class="room-price-block">
                        <span class="rmb">¥</span>
                        <span class="num">{{ room.price }}</span>
                        <span class="per-night">/晚起</span>
                        <span v-if="room.originalPrice && Number(room.originalPrice) > Number(room.price)" class="strike">
                          ¥{{ room.originalPrice }}
                        </span>
                      </div>
                      <div class="room-stock-actions">
                        <div class="room-stock-info">
                          <button
                            v-if="room.remainingCount != null"
                            type="button"
                            class="remain"
                            @click.stop="openInventoryCalendar(room)"
                          >
                            {{ roomStockText(room) }}
                          </button>
                          <span v-if="roomUnavailableSummary(room)" class="unavailable-hint">
                            {{ roomUnavailableSummary(room) }}
                          </span>
                        </div>
                        <el-button
                          type="primary"
                          round
                          :disabled="isRoomUnavailableForSelectedRange(room)"
                          @click.stop="openBookingWithRoom(room.id)"
                        >
                          订此房型
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 酒店设施 -->
            <div class="facilities-section" v-if="hotel.facilities">
              <h3 class="section-title">
                <span class="title-icon">🏨</span>
                酒店设施
              </h3>
              <div class="facility-tags">
                <span
                  v-for="(facility, index) in hotel.facilities.split(',')"
                  :key="index"
                  class="facility-tag"
                >
                  <el-icon><Check /></el-icon>
                  {{ facility }}
                </span>
              </div>
            </div>

            <!-- 商家信息：必须来自真实绑定用户 -->
            <div v-if="hotel.merchantId" class="merchant-section">
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
                  <div class="merchant-name">{{ hotel.merchantName || '认证商家' }}</div>
                  <div class="merchant-meta">
                    <el-tag v-if="hotel.merchantCertified === 1" type="warning" size="small" effect="plain">
                      <el-icon><Check /></el-icon> 认证商家
                    </el-tag>
                    <span class="meta-text" v-if="hotel.merchantLocation">{{ hotel.merchantLocation }}</span>
                    <span class="meta-text" v-if="hotel.commentCount">{{ hotel.commentCount }}条评价</span>
                  </div>
                  <p class="merchant-desc" v-if="hotel.merchantBio">{{ hotel.merchantBio }}</p>
                </div>
                <div class="merchant-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>

            <!-- 酒店介绍 -->
            <div class="description-section">
              <h3 class="section-title">
                <span class="title-icon">📖</span>
                酒店介绍
              </h3>
              <div class="description-content">
                <p>{{ hotel.description || '暂无详细介绍' }}</p>
              </div>
            </div>

            <!-- 地图 -->
            <div class="map-section">
              <h3 class="section-title">
                <span class="title-icon">📍</span>
                酒店位置
              </h3>
              <div class="map-container" id="hotel-map-container">
              </div>
              <div class="map-address">
                <el-icon><Location /></el-icon>
                <span>{{ hotel.address }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧悬浮卡片 -->
          <div class="info-right">
            <div class="booking-card">
              <div class="booking-header">
                <div class="price-label">{{ roomList.length ? '起价（以所选房型为准）' : '参考价格' }}</div>
                <div class="price-value">
                  <span class="currency">¥</span>
                  <span class="amount">{{ sidebarDisplayPrice }}</span>
                  <span class="unit">/晚起</span>
                </div>
              </div>

              <div class="booking-features">
                <div class="feature-item">
                  <el-icon><Calendar /></el-icon>
                  <span>免费取消</span>
                </div>
                <div class="feature-item">
                  <el-icon><Clock /></el-icon>
                  <span>24小时入住</span>
                </div>
                <div class="feature-item">
                  <el-icon><Connection /></el-icon>
                  <span>免费WiFi</span>
                </div>
              </div>

              <el-button type="primary" size="large" class="booking-btn" @click="showBookingDialog">
                <el-icon><Calendar /></el-icon>
                立即预订
              </el-button>

              <div class="action-buttons">
                <el-button
                  :class="['collect-btn', { collected: isCollected }]"
                  @click="toggleCollect"
                >
                  <el-icon><component :is="isCollected ? 'StarFilled' : 'Star'" /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }} ({{ hotel.collectCount || 0 }})
                </el-button>
                <el-button class="share-btn" @click="showMap">
                  <el-icon><LocationInformation /></el-icon>
                  查看地图
                </el-button>
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

          <el-empty v-else description="暂无评价，快来抢先评价吧" class="empty-comments" />
        </div>
      </section>
    </main>

    <!-- 棰勮瀵硅瘽妗?-->
    <el-dialog v-model="bookingDialogVisible" title="预订酒店" width="750px" :close-on-click-modal="false" class="booking-dialog">
      <div class="dialog-content">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step title="选择日期" />
          <el-step title="填写信息" />
          <el-step title="确认订单" />
          <el-step title="完成支付" />
        </el-steps>

        <div class="step-content">
          <!-- 姝ラ1: 閫夋嫨鏃ユ湡鍜屾埧闂存暟閲?-->
          <div v-show="currentStep === 0" class="step-panel">
            <el-form :model="bookingForm" label-position="top" class="booking-form">
              <el-form-item v-if="roomList.length > 0" label="房型" required>
                <el-select
                  v-model="bookingForm.hotelRoomId"
                  placeholder="请选择房型"
                  style="width: 100%"
                  filterable
                >
                  <el-option
                    v-for="r in roomList"
                    :key="r.id"
                    :label="`${r.roomName}  ¥${r.price}/晚`"
                    :value="r.id"
                  />
                </el-select>
                <p class="form-hint">价格随房型变化，以下摘要与订单金额以所选房型为准。</p>
              </el-form-item>
              <div v-else class="basic-booking-card">
                <div class="basic-booking-main">
                  <el-icon><OfficeBuilding /></el-icon>
                  <div>
                    <div class="basic-booking-title">标准预订</div>
                    <div class="basic-booking-desc">该酒店暂未配置房型，可按酒店参考价格预订。</div>
                  </div>
                </div>
                <div class="basic-booking-price">¥{{ hotel.price || 0 }}/晚</div>
              </div>
              <div class="form-row">
                <el-form-item label="入住日期" required>
                  <el-date-picker
                    v-model="bookingForm.checkInDate"
                    type="date"
                    placeholder="选择入住日期"
                    :disabled-date="disabledDate"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="退房日期" required>
                  <el-date-picker
                    v-model="bookingForm.checkOutDate"
                    type="date"
                    placeholder="选择退房日期"
                    :disabled-date="disabledCheckOutDate"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </div>
              <el-form-item label="房间数量">
                <div class="quantity-selector">
                  <el-button circle @click="bookingForm.roomCount > 1 && bookingForm.roomCount--">
                    <el-icon><Minus /></el-icon>
                  </el-button>
                  <span class="quantity">{{ bookingForm.roomCount }} 间</span>
                  <el-button circle @click="bookingForm.roomCount < 10 && bookingForm.roomCount++">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </el-form-item>

              <div v-if="selectedRoomForBooking" class="inventory-panel" :class="{ warning: selectedRoomShortageDates.length > 0 }">
                <div class="inventory-title">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ selectedRoomInventoryTitle }}</span>
                </div>
                <div v-if="selectedRoomShortageDates.length > 0" class="inventory-warning">
                  {{ selectedRoomShortageDates.map(formatStockDate).join('、') }} 房量不足，请调整日期或房间数量。
                </div>
                <div v-if="selectedRoomForBooking.dateAvailability?.length" class="inventory-days">
                  <span
                    v-for="item in selectedRoomForBooking.dateAvailability"
                    :key="item.stayDate"
                    class="inventory-day"
                    :class="{ empty: Number(item.remainingCount || 0) < bookingForm.roomCount }"
                  >
                    {{ formatStockDate(item.stayDate) }}：剩余 {{ item.remainingCount || 0 }} 间
                  </span>
                </div>
              </div>

              <div class="price-summary" v-if="stayDays > 0">
                <div class="summary-row" v-if="selectedRoomForBooking">
                  <span>房型</span>
                  <span>{{ selectedRoomForBooking.roomName }}</span>
                </div>
                <div class="summary-row">
                  <span>房间单价</span>
                  <span>¥{{ unitPricePerNight }}/晚</span>
                </div>
                <div class="summary-row">
                  <span>入住天数</span>
                  <span>{{ stayDays }} 天</span>
                </div>
                <div class="summary-row">
                  <span>房间数量</span>
                  <span>{{ bookingForm.roomCount }} 间</span>
                </div>
                <el-divider />
                <div class="summary-row total">
                  <span>总计</span>
                  <span class="total-price">¥{{ totalAmount }}</span>
                </div>
              </div>
            </el-form>
          </div>

          <!-- 姝ラ2: 濉啓鍏ヤ綇浜轰俊鎭?-->
          <div v-show="currentStep === 1" class="step-panel">
            <el-form :model="bookingForm" label-position="top" class="booking-form">
              <el-form-item label="入住人姓名" required>
                <div class="guest-names-container">
                  <div v-for="(name, index) in bookingForm.guestNames" :key="index" class="guest-name-row">
                    <el-input
                      v-model="bookingForm.guestNames[index]"
                      placeholder="请输入真实姓名"
                      style="flex: 1"
                    />
                    <el-button
                      v-if="bookingForm.guestNames.length > 1"
                      type="danger"
                      circle
                      @click="removeGuestName(index)"
                      style="margin-left: 8px"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                    <el-button
                      v-if="index === bookingForm.guestNames.length - 1"
                      type="primary"
                      circle
                      @click="addGuestName"
                      style="margin-left: 8px"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="联系电话" required>
                <el-input
                  v-model="bookingForm.guestPhone"
                  placeholder="用于接收预订信息"
                  maxlength="11"
                  show-word-limit
                  inputmode="numeric"
                  @input="bookingForm.guestPhone = normalizeMobilePhone($event)"
                />
              </el-form-item>
              <el-form-item label="特殊需求">
                <el-input
                  v-model="bookingForm.specialRequest"
                  type="textarea"
                  :rows="2"
                  placeholder="如需加床、禁烟房等"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 确认订单 -->
          <div v-show="currentStep === 2" class="step-panel">
            <div class="order-summary">
              <div class="confirm-section">
                <h4><el-icon><Calendar /></el-icon>订单信息</h4>
                <div class="confirm-item">
                  <span class="label">酒店名称</span>
                  <span class="value">{{ hotel.name }}</span>
                </div>
                <div class="confirm-item" v-if="selectedRoomForBooking">
                  <span class="label">房型</span>
                  <span class="value">{{ selectedRoomForBooking.roomName }}</span>
                </div>
                <div class="confirm-item" v-else>
                  <span class="label">预订类型</span>
                  <span class="value">标准预订</span>
                </div>
                <div class="confirm-item">
                  <span class="label">入住日期</span>
                  <span class="value">{{ bookingForm.checkInDate }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">退房日期</span>
                  <span class="value">{{ bookingForm.checkOutDate }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">入住天数</span>
                  <span class="value">{{ stayDays }} 天</span>
                </div>
                <div class="confirm-item">
                  <span class="label">房间数量</span>
                  <span class="value">{{ bookingForm.roomCount }} 间</span>
                </div>
                <div class="confirm-item">
                  <span class="label">房间单价</span>
                  <span class="value">¥{{ unitPricePerNight }}/晚</span>
                </div>
                <div class="confirm-item total">
                  <span class="label">总金额</span>
                  <span class="value price">¥{{ totalAmount }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><User /></el-icon>入住人信息</h4>
                <div class="confirm-item">
                  <span class="label">姓名</span>
                  <span class="value">{{ bookingForm.guestNames.filter((n: string) => n.trim()).join(', ') || '-' }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">电话</span>
                  <span class="value">{{ bookingForm.guestPhone || '-' }}</span>
                </div>
                <div v-if="bookingForm.specialRequest" class="confirm-item">
                  <span class="label">特殊需求</span>
                  <span class="value">{{ bookingForm.specialRequest }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤4: 支付 -->
          <div v-show="currentStep === 3" class="step-panel">
            <div class="payment-panel">
              <div class="success-icon">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <h3>订单创建成功</h3>
              <p class="order-no">订单号：{{ orderNo }}</p>
              <div class="payment-amount">
                <span class="label">应付金额</span>
                <span class="amount">¥{{ totalAmount }}</span>
              </div>
              <div v-if="countdown > 0" class="countdown-tip">
                <el-icon><Clock /></el-icon>
                请在 <span class="countdown-time">{{ formatCountdown }}</span> 内完成支付
              </div>
              <PaymentMethodCard />
              <div v-if="payQrCodeUrl" class="pay-qrcode">
                <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
                <div class="payment-tip">请使用支付宝沙箱 App 扫描二维码完成支付</div>
              </div>
              <el-button type="primary" size="large" class="pay-btn" :loading="isGeneratingQrCode" @click="handlePay">
                {{ payQrCodeUrl ? '刷新二维码' : '立即支付' }}
              </el-button>
              <el-button size="large" @click="handleCancelOrder">取消订单</el-button>
              <el-progress v-if="isPollingPay" :percentage="payPollProgress" :show-text="false" :stroke-width="6" />
              <div v-if="payStatusMessage" class="payment-tip">{{ payStatusMessage }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeBookingDialog">取消</el-button>
        <el-button v-if="currentStep > 0 && currentStep < 3" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 2" type="primary" @click="createOrder" :loading="creating">
          确认订单
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="inventoryCalendarVisible"
      width="720px"
      class="inventory-calendar-dialog"
      custom-class="inventory-calendar-dialog"
      modal-class="inventory-calendar-modal"
      :title="inventoryCalendarTitle"
      :teleported="false"
    >
      <div class="calendar-summary">
        <div>
          <div class="calendar-room-name">{{ inventoryCalendarRoom?.roomName || '房型库存' }}</div>
          <div class="calendar-room-meta">
            {{ inventoryCalendarRoom ? roomTypeLabel(inventoryCalendarRoom.roomType) : '' }}
            <span v-if="inventoryCalendarRoom?.price">¥{{ inventoryCalendarRoom.price }}/晚起</span>
          </div>
        </div>
        <div class="calendar-legend">
          <span><i class="legend-dot enough"></i>有房</span>
          <span><i class="legend-dot low"></i>紧张</span>
          <span><i class="legend-dot empty"></i>无房</span>
        </div>
      </div>
      <div class="calendar-toolbar">
        <el-button class="month-nav" circle @click="shiftInventoryMonth(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="calendar-month-title">{{ inventoryMonthLabel }}</div>
        <el-button class="month-nav" circle @click="shiftInventoryMonth(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div v-loading="inventoryCalendarLoading" class="inventory-calendar">
        <div class="calendar-week" v-for="day in calendarWeekdays" :key="day">{{ day }}</div>
        <div
          v-for="day in inventoryCalendarDays"
          :key="day.key"
          class="calendar-day"
          :class="{ muted: !day.inMonth, today: day.isToday, low: day.inMonth && day.remainingCount > 0 && day.remainingCount <= 3, empty: day.inMonth && day.remainingCount <= 0 }"
        >
          <div class="day-number">
            <span>{{ day.date.date() }}</span>
            <em v-if="day.isToday && day.inMonth">今天</em>
          </div>
          <div v-if="day.inMonth" class="day-stock">
            {{ day.remainingCount > 0 ? `剩余 ${day.remainingCount} 间` : '无房' }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 支付成功对话框 -->
    <el-dialog v-model="paySuccessVisible" title="" width="450px" :close-on-click-modal="false" class="success-dialog">
      <div class="success-content">
        <div class="success-icon-large">
          <el-icon><SuccessFilled /></el-icon>
        </div>
        <h3>支付成功</h3>
        <p>订单已支付成功</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="viewETicket">查看详情</el-button>
        <el-button @click="paySuccessVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 璇勮瀵硅瘽妗?-->
    <el-dialog v-model="commentDialogVisible" :title="replyingTo ? '回复评价' : '写评价'" width="550px" class="comment-dialog">
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
          :placeholder="replyingTo ? `回复 ${replyingTo.userName}...` : '分享你的入住体验...'"
          maxlength="500"
          show-word-limit
        />
      </div>
      <template #footer>
        <el-button @click="closeCommentDialog">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="submittingComment">
          {{ replyingTo ? '提交回复' : '提交评价' }}
        </el-button>
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
  Money,
  Phone,
  Star,
  StarFilled,
  OfficeBuilding,
  Check,
  Shop,
  Calendar,
  Connection,
  LocationInformation,
  Edit,
  User,
  Minus,
  Plus,
  Delete,
  Clock,
  SuccessFilled,
  ArrowRight,
  ArrowLeft,
  ChatDotRound,
} from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateTime } from '@/util/datetime'
import { extractDisplayTags } from '@/utils/contentTags'
import { buildPayQrCodeUrl } from '@/utils/payQrCode'
import { normalizeMobilePhone } from '@/utils/attractionForm'
import { loadAMapScript } from '@/utils/amap'
import { normalizeImageUrl, parseImageList } from '@/utils/imageUrl'

import TourismTopNav from '@/components/TourismTopNav.vue'
import PaymentMethodCard from '@/components/PaymentMethodCard.vue'

const router = useRouter()
const route = useRoute()

const hotelId = ref(Number(route.params.id))
const hotel = ref<any>({})
const roomList = ref<any[]>([])
const imageList = ref<string[]>([])
const commentList = ref<any[]>([])
const isCollected = ref(false)
const bookingDialogVisible = ref(false)
const commentDialogVisible = ref(false)
const inventoryCalendarVisible = ref(false)
const inventoryCalendarLoading = ref(false)
const inventoryCalendarRoom = ref<any>(null)
const inventoryCalendarMonth = ref(dayjs().startOf('month'))
const inventoryCalendarAvailability = ref<Record<string, number>>({})
const submittingComment = ref(false)
const replyingTo = ref<any>(null)
const replyRoot = ref<any>(null)

// 步骤流程相关变量
const currentStep = ref(0)
const creating = ref(false)
const orderNo = ref('')
const paySuccessVisible = ref(false)
const countdown = ref(0)
let countdownTimer: any = null
const payQrCodeUrl = ref('')
const isGeneratingQrCode = ref(false)
const isPollingPay = ref(false)
const payPollProgress = ref(0)
const payStatusMessage = ref('')
let payPollingTimer: any = null
const hotelDisplayTags = computed(() => {
  const tags = extractDisplayTags(hotel.value, ['tags', 'tagList', 'tagNames', 'labels', 'keywords', 'facilities'])
  return tags.filter((tag) => tag !== hotel.value.region && tag !== `${hotel.value.starLevel}星级`)
})
const merchantAvatarUrl = computed(() => hotel.value.merchantAvatar ? normalizeImageUrl(hotel.value.merchantAvatar, '') : '')
const merchantInitial = computed(() => {
  const name = hotel.value.merchantName || hotel.value.name || '商'
  return String(name).trim().slice(0, 1)
})

const ROOM_TYPE_LABELS: Record<number, string> = {
  1: '单人房',
  2: '标准间',
  3: '双人间',
  4: '大床房',
  5: '套房',
  6: '家庭房',
}

const bookingForm = reactive({
  hotelRoomId: null as number | null,
  checkInDate: '',
  checkOutDate: '',
  roomCount: 1,
  guestNames: [''],
  guestPhone: '',
  specialRequest: '',
})

const roomTypeLabel = (t: number | null | undefined) => {
  if (t == null) return ''
  return ROOM_TYPE_LABELS[t] || '房型'
}

const selectedRoomForBooking = computed(() => {
  if (!bookingForm.hotelRoomId) return null
  return roomList.value.find((r) => r.id === bookingForm.hotelRoomId) || null
})

const hasFullDateRange = computed(() => Boolean(bookingForm.checkInDate && bookingForm.checkOutDate && stayDays.value > 0))

const formatStockDate = (date: string) => dayjs(date).format('M月D日')

const getShortageDates = (room: any, requiredCount = 1) => {
  if (!room || !Array.isArray(room.dateAvailability)) return []
  return room.dateAvailability
    .filter((item: any) => Number(item.remainingCount || 0) < requiredCount)
    .map((item: any) => item.stayDate)
}

const isRoomUnavailableForSelectedRange = (room: any) => {
  if (!hasFullDateRange.value) return false
  return getShortageDates(room, 1).length > 0
}

const roomStockText = (room: any) => {
  const remaining = Number(room.minRemainingCount ?? room.remainingCount ?? 0)
  if (hasFullDateRange.value) {
    return `该日期段最少剩余 ${remaining} 间`
  }
  const stockDate = bookingForm.checkInDate ? formatStockDate(bookingForm.checkInDate) : '今天'
  return `${stockDate}剩余 ${remaining} 间`
}

const roomUnavailableSummary = (room: any) => {
  if (!hasFullDateRange.value) return ''
  const dates = getShortageDates(room, 1)
  if (dates.length === 0) return ''
  if (dates.length === 1) return `${formatStockDate(dates[0])}无房`
  return `${formatStockDate(dates[0])}等${dates.length}天无房`
}

const selectedRoomShortageDates = computed(() => getShortageDates(selectedRoomForBooking.value, bookingForm.roomCount))

const selectedRoomInventoryTitle = computed(() => {
  if (!selectedRoomForBooking.value) return ''
  if (hasFullDateRange.value) {
    const remaining = Number(selectedRoomForBooking.value.minRemainingCount ?? selectedRoomForBooking.value.remainingCount ?? 0)
    return `该日期段最少剩余 ${remaining} 间`
  }
  const stockDate = bookingForm.checkInDate ? formatStockDate(bookingForm.checkInDate) : '今天'
  return `${stockDate}剩余 ${selectedRoomForBooking.value.remainingCount ?? 0} 间`
})

const calendarWeekdays = ['一', '二', '三', '四', '五', '六', '日']

const inventoryCalendarTitle = computed(() => {
  const roomName = inventoryCalendarRoom.value?.roomName || '房型'
  return `${roomName}库存日历`
})

const inventoryMonthLabel = computed(() => inventoryCalendarMonth.value.format('YYYY年M月'))

const inventoryCalendarDays = computed(() => {
  const monthStart = inventoryCalendarMonth.value.startOf('month')
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
      remainingCount: Number(inventoryCalendarAvailability.value[dateKey] ?? 0),
    }
  })
})

const unitPricePerNight = computed(() => {
  const r = selectedRoomForBooking.value
  if (r && r.price != null) return Number(r.price)
  if (hotel.value.price != null) return Number(hotel.value.price)
  return 0
})

const sidebarDisplayPrice = computed(() => {
  if (roomList.value.length === 0) {
    return hotel.value.price ?? '--'
  }
  const prices = roomList.value.map((r) => Number(r.price)).filter((n) => !Number.isNaN(n))
  if (!prices.length) return hotel.value.price ?? '--'
  return Math.min(...prices)
})

const commentForm = reactive({
  rating: 5,
  content: ''
})

// 计算入住天数
const stayDays = computed(() => {
  if (bookingForm.checkInDate && bookingForm.checkOutDate) {
    const checkIn = dayjs(bookingForm.checkInDate)
    const checkOut = dayjs(bookingForm.checkOutDate)
    return checkOut.diff(checkIn, 'day')
  }
  return 0
})

// 璁＄畻鎬婚噾棰濓紙灞曠ず鐢紱鏈嶅姟绔細鍐嶆鎸夋埧鍨?澶╂暟閲嶇畻锛?
const totalAmount = computed(() => {
  const unit = unitPricePerNight.value
  if (unit > 0 && stayDays.value > 0) {
    return (unit * stayDays.value * bookingForm.roomCount).toFixed(2)
  }
  return '0.00'
})

const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 加载酒店详情
const loadHotelDetail = async () => {
  try {
    const res: any = await request.get(`/hotel/${hotelId.value}`)
    if (res && res.data) {
      hotel.value = res.data
      isCollected.value = res.data.isCollected === 1
      imageList.value = parseImageList(res.data.images)
      addBrowseHistory()
      loadHotelRooms()
      // 数据加载完成后初始化地图
      nextTick(() => {
        initMap()
      })
    }
  } catch (error) {
    console.error('加载酒店详情失败', error)
    ElMessage.error('加载酒店详情失败')
  }
}

const loadHotelRooms = async () => {
  try {
    const params: Record<string, string> = {}
    if (bookingForm.checkInDate) params.checkInDate = bookingForm.checkInDate
    if (bookingForm.checkOutDate) params.checkOutDate = bookingForm.checkOutDate
    const res: any = await request.get(`/hotel/${hotelId.value}/rooms`, { params })
    if (res && res.data) {
      roomList.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (e) {
    console.error('加载房型失败', e)
    roomList.value = []
  }
}

const openInventoryCalendar = async (room: any) => {
  inventoryCalendarRoom.value = room
  const baseDate = bookingForm.checkInDate ? dayjs(bookingForm.checkInDate) : dayjs()
  inventoryCalendarMonth.value = baseDate.startOf('month')
  inventoryCalendarVisible.value = true
  await loadInventoryCalendar()
}

const shiftInventoryMonth = async (offset: number) => {
  inventoryCalendarMonth.value = inventoryCalendarMonth.value.add(offset, 'month').startOf('month')
  await loadInventoryCalendar()
}

const loadInventoryCalendar = async () => {
  if (!inventoryCalendarRoom.value?.id) return
  inventoryCalendarLoading.value = true
  try {
    const startDate = inventoryCalendarMonth.value.startOf('month')
    const endDate = startDate.add(1, 'month')
    const res: any = await request.get(`/hotel/${hotelId.value}/rooms`, {
      params: {
        checkInDate: startDate.format('YYYY-MM-DD'),
        checkOutDate: endDate.format('YYYY-MM-DD'),
      }
    })
    const rooms = Array.isArray(res?.data) ? res.data : []
    const room = rooms.find((item: any) => item.id === inventoryCalendarRoom.value.id)
    const availability: Record<string, number> = {}
    if (room && Array.isArray(room.dateAvailability)) {
      room.dateAvailability.forEach((item: any) => {
        availability[item.stayDate] = Number(item.remainingCount || 0)
      })
    }
    inventoryCalendarAvailability.value = availability
  } catch (error) {
    console.error('加载库存日历失败', error)
    inventoryCalendarAvailability.value = {}
    ElMessage.error('加载库存日历失败')
  } finally {
    inventoryCalendarLoading.value = false
  }
}

watch(
  () => [bookingForm.checkInDate, bookingForm.checkOutDate],
  () => {
    loadHotelRooms()
  }
)

// 鍒濆鍖栧湴鍥?
const initMap = async () => {
  if (!hotel.value.longitude || !hotel.value.latitude) {
    console.log('酒店无坐标信息')
    return
  }
  
  const container = document.getElementById('hotel-map-container')
  if (!container) return
  
  try {
    await loadAMapScript()
    container.innerHTML = ''

    const map = new window.AMap.Map('hotel-map-container', {
      zoom: 15,
      center: [hotel.value.longitude, hotel.value.latitude],
      mapStyle: 'amap://styles/normal'
    })

    const marker = new window.AMap.Marker({
      position: [hotel.value.longitude, hotel.value.latitude],
      title: hotel.value.name
    })
    map.add(marker)

    const infoWindow = new window.AMap.InfoWindow({
      content: `<div style="padding: 8px; font-size: 14px;">
        <h4 style="margin: 0 0 8px 0;">${hotel.value.name}</h4>
        <p style="margin: 0; color: #666;">${hotel.value.address}</p>
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

// 添加浏览历史
const addBrowseHistory = async () => {
  try {
    const token = localStorage.getItem('auth-token')
    if (!token) return
    await request.post('/browse-history/add', null, {
      params: {
        contentId: hotelId.value,
        contentType: 6
      }
    })
  } catch (error) {
    console.error('添加浏览历史失败', error)
  }
}

// 加载评论列表
const loadCommentList = async () => {
  try {
    const res: any = await request.get('/comment/list', {
      params: {
        contentId: hotelId.value,
        contentType: 6,
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
    const token = localStorage.getItem('auth-token')
    if (!token) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    if (isCollected.value) {
      await request({
        method: 'delete',
        url: '/collection/remove',
        params: {
          contentId: hotelId.value,
          contentType: 6
        }
      })
      ElMessage.success('取消收藏成功')
      isCollected.value = false
      hotel.value.collectCount = Math.max(0, (hotel.value.collectCount || 0) - 1)
    } else {
      await request({
        method: 'post',
        url: '/collection/add',
        params: {
          contentId: hotelId.value,
          contentType: 6
        }
      })
      ElMessage.success('收藏成功')
      isCollected.value = true
      hotel.value.collectCount = (hotel.value.collectCount || 0) + 1
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const goToMerchantHome = () => {
  if (hotel.value.merchantId) router.push(`/user/${hotel.value.merchantId}`)
}

/** 浠庢埧鍨嬪垪琛ㄧ偣鍑汇€岃姝ゆ埧鍨嬨€?*/
const openBookingWithRoom = (roomId: number) => {
  bookingForm.hotelRoomId = roomId
  showBookingDialog()
}

// 鏄剧ず棰勮瀵硅瘽妗?
const showBookingDialog = () => {
  const token = localStorage.getItem('auth-token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (roomList.value.length > 0) {
    const exists = roomList.value.some((r) => r.id === bookingForm.hotelRoomId)
    if (!exists) {
      bookingForm.hotelRoomId = roomList.value[0].id
    }
  } else {
    bookingForm.hotelRoomId = null
  }
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
  bookingDialogVisible.value = true
}

// 鍏抽棴棰勮瀵硅瘽妗?
const closeBookingDialog = () => {
  bookingDialogVisible.value = false
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  stopPayPolling()
  countdown.value = 0
  currentStep.value = 0
  orderNo.value = ''
  resetBookingForm()
}

// 涓婁竴姝?
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 涓嬩竴姝?
const nextStep = () => {
  if (currentStep.value === 0) {
    if (roomList.value.length > 0 && !bookingForm.hotelRoomId) {
      ElMessage.warning('请选择房型')
      return
    }
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate) {
      ElMessage.warning('请选择入住和退房日期')
      return
    }
    if (stayDays.value <= 0) {
      ElMessage.warning('退房日期必须晚于入住日期')
      return
    }
    if (selectedRoomShortageDates.value.length > 0) {
      ElMessage.warning(`${selectedRoomShortageDates.value.map(formatStockDate).join('、')} 房量不足，请调整日期或房间数量`)
      return
    }
  }
  if (currentStep.value === 1) {
    const validGuestNames = bookingForm.guestNames.filter((name: string) => name.trim() !== '')
    if (validGuestNames.length === 0 || !bookingForm.guestPhone) {
      ElMessage.warning('请填写入住人信息')
      return
    }
    if (bookingForm.guestPhone.length !== 11) {
      ElMessage.warning('请输入11位手机号')
      return
    }
  }
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

// 创建订单
const createOrder = async () => {
  if (selectedRoomShortageDates.value.length > 0) {
    ElMessage.warning(`${selectedRoomShortageDates.value.map(formatStockDate).join('、')} 房量不足，请调整日期或房间数量`)
    return
  }
  const validGuestNames = bookingForm.guestNames.filter((name: string) => name.trim() !== '')

  creating.value = true
  try {
    const res: any = await request.post('/order/create', {
      hotelId: hotelId.value,
      hotelName: hotel.value.name,
      hotelRoomId: bookingForm.hotelRoomId ?? undefined,
      checkInDate: bookingForm.checkInDate,
      checkOutDate: bookingForm.checkOutDate,
      roomCount: bookingForm.roomCount,
      unitPrice: unitPricePerNight.value,
      totalAmount: totalAmount.value,
      guestName: validGuestNames.join(','),
      guestPhone: bookingForm.guestPhone,
      specialRequest: bookingForm.specialRequest,
      orderType: 2,
    })
    if (res && res.code === 200) {
      orderNo.value = res.data
      currentStep.value = 3
      ElMessage.success('订单创建成功')
      startCountdown()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    creating.value = false
  }
}

// 鍚姩鍊掕鏃?
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

// 取消订单
const handleCancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.post(`/order/cancel/${orderNo.value}`)
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

// 支付
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
        if (countdownTimer) {
          clearInterval(countdownTimer)
        }
        countdown.value = 0
        bookingDialogVisible.value = false
        paySuccessVisible.value = true
        resetBookingForm()
        currentStep.value = 0
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

// 鏌ョ湅鐢靛瓙绁?
const viewETicket = () => {
  router.push(`/eticket/${orderNo.value}`)
}

// 鏄剧ず璇勮瀵硅瘽妗?
const showCommentDialog = () => {
  const token = localStorage.getItem('auth-token')
  if (!token) {
    ElMessage.warning('请先登录')
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
  const token = localStorage.getItem('auth-token')
  if (!token) {
    ElMessage.warning('请先登录后再回复')
    router.push('/login')
    return
  }
  replyingTo.value = comment
  replyRoot.value = rootComment
  commentForm.content = `@${comment.userName} `
  commentDialogVisible.value = true
}

// 提交评论
const submitComment = async () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }

  submittingComment.value = true
  try {
    const res: any = await request.post('/comment/add', {
      contentId: hotelId.value,
      contentType: 6,
      content: commentForm.content,
      rating: replyingTo.value ? null : commentForm.rating,
      parentId: replyRoot.value?.id || null
    })
    if (res && res.code === 200) {
      ElMessage.success(replyingTo.value ? '回复成功' : '评价成功')
      closeCommentDialog()
      loadCommentList()
    }
  } catch (error: any) {
    if (!error.messageShown) ElMessage.error(error.message || '评价失败')
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

// 显示地图
const showMap = () => {
  ElMessage.info('地图功能开发中')
}

// 绂佺敤杩囧幓鐨勬棩鏈?
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 绂佺敤閫€鎴挎棩鏈?
const disabledCheckOutDate = (time: Date) => {
  if (!bookingForm.checkInDate) {
    return time.getTime() < Date.now() - 8.64e7
  }
  return time.getTime() <= new Date(bookingForm.checkInDate).getTime()
}

// 鏍煎紡鍖栨椂闂?
const formatTime = (time: string | number | string[] | number[]) => {
  return formatDateTime(time, 'YYYY-MM-DD HH:mm')
}

// 重置预订表单
const resetBookingForm = () => {
  bookingForm.hotelRoomId = roomList.value.length > 0 ? roomList.value[0].id : null
  bookingForm.checkInDate = ''
  bookingForm.checkOutDate = ''
  bookingForm.roomCount = 1
  bookingForm.guestNames = ['']
  bookingForm.guestPhone = ''
  bookingForm.specialRequest = ''
}

// 娣诲姞鍏ヤ綇浜?
const addGuestName = () => {
  bookingForm.guestNames.push('')
}

// 鍒犻櫎鍏ヤ綇浜?
const removeGuestName = (index: number) => {
  bookingForm.guestNames.splice(index, 1)
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadHotelDetail()
  loadCommentList()
})
</script>

<style scoped lang="scss">
// 涓婚鑹?
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

.hotel-detail {
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

// 鐢诲粖
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

        &.hotel-badge {
          color: $primary;
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

  .hotel-title {
    font-size: 36px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 16px;
  }

  .hotel-tags {
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

      &.star {
        background: linear-gradient(135deg, rgba(232, 168, 56, 0.1), rgba(232, 168, 56, 0.05));
        color: $accent;
      }

      &.type-tag {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: $white;
        font-weight: 600;
      }

      &.extra-tag {
        background: rgba(59, 130, 246, 0.1);
        color: #2456c9;
      }
    }
  }

  .hotel-stats {
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

  .room-types-section {
    margin-top: 32px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 12px;

      .title-icon {
        font-size: 20px;
      }
    }

    .room-section-hint {
      font-size: 13px;
      color: $text-muted;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    .room-card-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .room-type-card {
      display: flex;
      gap: 18px;
      padding: 18px;
      background: $white;
      border: 2px solid $border;
      border-radius: 14px;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        box-shadow: $shadow-sm;
      }

      &.active {
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.12);
      }

      &.unavailable {
        border-color: #f0d5d5;
        background: #fffafa;
      }

      .room-card-media {
        flex-shrink: 0;
        width: 160px;
        height: 120px;
        border-radius: 10px;
        overflow: hidden;
        background: $bg-light;

        .room-thumb {
          width: 100%;
          height: 100%;
        }
      }

      .room-card-body {
        flex: 1;
        min-width: 0;
      }

      .room-card-head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;

        .room-name {
          font-size: 17px;
          font-weight: 600;
          color: $text-primary;
        }
      }

      .room-meta-line {
        font-size: 13px;
        color: $text-secondary;
        margin-bottom: 8px;

        .meta-dot::before {
          content: '路';
          margin: 0 6px;
          color: $border;
        }
      }

      .room-desc {
        font-size: 13px;
        color: $text-muted;
        line-height: 1.5;
        margin: 0 0 12px;
      }

      .room-card-foot {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
      }

      .room-price-block {
        .rmb {
          font-size: 14px;
          color: #ff4d4f;
          font-weight: 600;
        }
        .num {
          font-size: 26px;
          font-weight: 800;
          color: #ff4d4f;
        }
        .per-night {
          font-size: 13px;
          color: $text-muted;
          margin-left: 2px;
        }
        .strike {
          margin-left: 10px;
          font-size: 13px;
          color: $text-muted;
          text-decoration: line-through;
        }
      }

      .room-stock-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .room-stock-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;

          .remain {
            padding: 0;
            border: 0;
            background: transparent;
            font-size: 12px;
            color: $text-muted;
            cursor: pointer;

            &:hover {
              color: $primary;
              text-decoration: underline;
              text-underline-offset: 3px;
            }
          }

          .unavailable-hint {
            font-size: 12px;
            color: #d93026;
            font-weight: 600;
          }
        }
      }
    }
  }

  .inventory-panel {
    margin: 4px 0 18px;
    padding: 12px 14px;
    border: 1px solid rgba(26, 95, 74, 0.18);
    border-radius: 8px;
    background: #f7fbf9;

    &.warning {
      border-color: #f0c7c7;
      background: #fff8f8;
    }

    .inventory-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8px;
    }

    .inventory-warning {
      font-size: 13px;
      color: #d93026;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .inventory-days {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .inventory-day {
      padding: 4px 8px;
      border-radius: 6px;
      background: $white;
      color: $text-secondary;
      font-size: 12px;
      border: 1px solid $border;

      &.empty {
        border-color: #f0c7c7;
        background: #fff1f0;
        color: #d93026;
      }
    }
  }

  .inventory-calendar-dialog {
    :deep(.el-dialog) {
      border-radius: 12px;
      overflow: hidden;
    }

    :deep(.el-dialog__header) {
      padding: 22px 26px 12px;
      margin-right: 0;
      border-bottom: 0;
    }

    :deep(.el-dialog__title) {
      font-size: 18px;
      font-weight: 800;
      color: $text-primary;
    }

    :deep(.el-dialog__body) {
      padding: 0 26px 26px;
      background: linear-gradient(180deg, #ffffff 0%, #f7fbf9 100%);
    }
  }

  .calendar-summary {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(26, 95, 74, 0.12);
    border-radius: 8px;
    background: $white;
    box-shadow: 0 8px 22px rgba(26, 95, 74, 0.06);
  }

  .calendar-room-name {
    font-size: 17px;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 6px;
  }

  .calendar-room-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 13px;
    color: $text-muted;
  }

  .calendar-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    font-size: 12px;
    color: $text-secondary;

    span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.enough {
      background: $primary;
    }

    &.low {
      background: #e8a838;
    }

    &.empty {
      background: #d93026;
    }
  }

  .calendar-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    margin-bottom: 18px;

    .month-nav {
      border-color: rgba(26, 95, 74, 0.18);
      color: $primary;
      background: $white;

      &:hover {
        border-color: $primary;
        background: #eef8f4;
      }
    }
  }

  .calendar-month-title {
    min-width: 120px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
  }

  .inventory-calendar {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
    padding: 12px;
    border: 1px solid rgba(26, 95, 74, 0.12);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .calendar-week {
    padding: 4px 0 8px;
    background: transparent;
    color: $text-secondary;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
  }

  .calendar-day {
    min-height: 82px;
    padding: 10px 9px;
    border: 1px solid #edf1ef;
    border-radius: 8px;
    background: $white;
    transition: transform 0.16s, box-shadow 0.16s, border-color 0.16s;

    &:hover:not(.muted) {
      transform: translateY(-2px);
      border-color: rgba(26, 95, 74, 0.24);
      box-shadow: 0 10px 22px rgba(26, 95, 74, 0.1);
    }

    &.muted {
      background: transparent;
      border-color: transparent;
      color: #c0c4cc;
    }

    &.today {
      border-color: rgba(26, 95, 74, 0.48);
      box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
    }

    &.low {
      background: #fffaf0;
      border-color: #f4dfaa;

      .day-stock {
        color: #9a6500;
        background: #fff0c2;
      }
    }

    &.empty {
      background: #fff7f7;
      border-color: #f4caca;

      .day-stock {
        color: #d93026;
        background: #fff1f0;
      }
    }
  }

  .day-number {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 8px;

    em {
      padding: 1px 5px;
      border-radius: 999px;
      background: #eef8f4;
      color: $primary;
      font-size: 10px;
      font-style: normal;
      font-weight: 700;
    }
  }

  .day-stock {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 7px;
    border-radius: 999px;
    background: #eef8f4;
    color: $primary;
    font-size: 12px;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .room-type-card {
      flex-direction: column;
      .room-card-media {
        width: 100% !important;
        height: 180px !important;
      }
    }
  }

  .merchant-section {
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

        .merchant-name {
          font-size: 16px;
          font-weight: 600;
          color: #d46b08;
          margin-bottom: 6px;
        }

        .merchant-meta {
          display: flex;
          align-items: center;
          gap: 8px;
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

      }

      .merchant-arrow {
        color: #d46b08;
        font-size: 18px;
      }

      &.is-platform {
        background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
        border-color: #adc6ff;

        .merchant-avatar {
          background: linear-gradient(135deg, #597ef7 0%, #2f54eb 100%);
        }

        .merchant-name {
          color: #1d39c4;
        }
      }
    }
  }

  .facilities-section,
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

    .facility-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .facility-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: $white;
        border: 1px solid $border;
        border-radius: 20px;
        font-size: 13px;
        color: $text-secondary;

        .el-icon {
          color: $primary;
          font-size: 14px;
        }
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
          font-weight: 500;

          &.price {
            color: #ff4d4f;
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

    .booking-btn {
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

// 璇勮鍖?
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

        .comment-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .reply-list {
          margin-top: 12px;
          padding: 12px;
          background: $white;
          border-radius: 10px;
          border: 1px solid $border;

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
          }
        }
      }
    }
  }

  .empty-comments {
    padding: 60px;
  }
}

// 瀵硅瘽妗嗘牱寮?
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

    .reply-tip {
      color: $text-secondary;
      margin-bottom: 16px;
      font-size: 14px;
    }
  }
}

.booking-dialog {
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

    .booking-form {
      .form-hint {
        margin: 6px 0 0;
        font-size: 12px;
        color: $text-muted;
        line-height: 1.4;
      }

      .basic-booking-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px;
        margin-bottom: 18px;
        border: 2px solid $primary;
        border-radius: 12px;
        background: rgba(26, 95, 74, 0.03);

        .basic-booking-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;

          .el-icon {
            flex: 0 0 auto;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(26, 95, 74, 0.1);
            color: $primary;
          }
        }

        .basic-booking-title {
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
        }

        .basic-booking-desc {
          margin-top: 4px;
          font-size: 13px;
          line-height: 1.4;
          color: $text-muted;
        }

        .basic-booking-price {
          flex: 0 0 auto;
          font-size: 18px;
          font-weight: 700;
          color: #ff4d4f;
        }
      }

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

      .price-summary {
        background: $bg-light;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: $text-secondary;

          &.total {
            padding-top: 16px;
            border-top: 1px dashed $border;
            margin-top: 8px;
            font-weight: 600;
            color: $text-primary;

            .total-price {
              font-size: 24px;
              color: #ff4d4f;
              font-weight: 700;
            }
          }
        }
      }
    }

    .guest-names-container {
      width: 100%;

      .guest-name-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
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
          color: #ff4d4f;
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
        background: linear-gradient(135deg, $primary, $primary-light);
        border: none;
      }
    }
  }
}

// 鎴愬姛瀵硅瘽妗?
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

// 鍝嶅簲寮?
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

    .hotel-title {
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

:global(.inventory-calendar-dialog.el-dialog) {
  border-radius: 14px;
  overflow: hidden;
}

:global(.inventory-calendar-dialog .el-dialog__header) {
  padding: 22px 26px 12px;
  margin-right: 0;
}

:global(.inventory-calendar-dialog .el-dialog__title) {
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 800;
}

:global(.inventory-calendar-dialog .el-dialog__body) {
  padding: 0 26px 26px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbf9 100%);
}

:global(.inventory-calendar-dialog .calendar-summary) {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(26, 95, 74, 0.12);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(26, 95, 74, 0.06);
}

:global(.inventory-calendar-dialog .calendar-room-name) {
  margin-bottom: 6px;
  color: #1a1a1a;
  font-size: 17px;
  font-weight: 800;
}

:global(.inventory-calendar-dialog .calendar-room-meta) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #999;
  font-size: 13px;
}

:global(.inventory-calendar-dialog .calendar-legend) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  color: #666;
  font-size: 12px;
}

:global(.inventory-calendar-dialog .calendar-legend span) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

:global(.inventory-calendar-dialog .legend-dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

:global(.inventory-calendar-dialog .legend-dot.enough) {
  background: #1a5f4a;
}

:global(.inventory-calendar-dialog .legend-dot.low) {
  background: #e8a838;
}

:global(.inventory-calendar-dialog .legend-dot.empty) {
  background: #d93026;
}

:global(.inventory-calendar-dialog .calendar-toolbar) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  margin-bottom: 18px;
}

:global(.inventory-calendar-dialog .month-nav) {
  color: #1a5f4a;
  border-color: rgba(26, 95, 74, 0.18);
  background: #ffffff;
}

:global(.inventory-calendar-dialog .calendar-month-title) {
  min-width: 120px;
  color: #1a1a1a;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}

:global(.inventory-calendar-dialog .inventory-calendar) {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(26, 95, 74, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.86);
}

:global(.inventory-calendar-dialog .calendar-week) {
  padding: 4px 0 8px;
  color: #666;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}

:global(.inventory-calendar-dialog .calendar-day) {
  min-height: 82px;
  padding: 10px 9px;
  border: 1px solid #edf1ef;
  border-radius: 8px;
  background: #ffffff;
}

:global(.inventory-calendar-dialog .calendar-day.muted) {
  background: transparent;
  border-color: transparent;
  color: #c0c4cc;
}

:global(.inventory-calendar-dialog .calendar-day.today) {
  border-color: rgba(26, 95, 74, 0.48);
  box-shadow: 0 0 0 3px rgba(26, 95, 74, 0.1);
}

:global(.inventory-calendar-dialog .calendar-day.low) {
  background: #fffaf0;
  border-color: #f4dfaa;
}

:global(.inventory-calendar-dialog .calendar-day.empty) {
  background: #fff7f7;
  border-color: #f4caca;
}

:global(.inventory-calendar-dialog .day-number) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
}

:global(.inventory-calendar-dialog .day-number em) {
  padding: 1px 5px;
  border-radius: 999px;
  background: #eef8f4;
  color: #1a5f4a;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
}

:global(.inventory-calendar-dialog .day-stock) {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 7px;
  border-radius: 999px;
  background: #eef8f4;
  color: #1a5f4a;
  font-size: 12px;
  font-weight: 600;
}

:global(.inventory-calendar-dialog .calendar-day.low .day-stock) {
  color: #9a6500;
  background: #fff0c2;
}

:global(.inventory-calendar-dialog .calendar-day.empty .day-stock) {
  color: #d93026;
  background: #fff1f0;
}
</style>
