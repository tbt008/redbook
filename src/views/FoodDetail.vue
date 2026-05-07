<template>
  <div class="food-detail">
    <TourismTopNav />

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 图片画廊 -->
      <section class="gallery-section">
        <div class="gallery-main">
          <el-carousel height="480px" indicator-position="none" arrow="always">
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
            <span v-if="food.packageCount && food.packageCount > 0" class="badge combo-badge">
              <el-icon><Tickets /></el-icon>
              {{ food.packageCount }}个套餐
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
              <span class="tag type-tag">
                美食
              </span>
              <span class="tag">
                <el-icon><Location /></el-icon>
                {{ food.region }}
              </span>
              <span
                v-for="tag in foodDisplayTags"
                :key="tag"
                class="tag extra-tag"
              >
                {{ tag }}
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
                <div class="stat-value">{{ food.collectCount || 0 }}</div>
                <div class="stat-label">收藏量</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">{{ commentList.length }}</div>
                <div class="stat-label">用户评价</div>
              </div>
            </div>

            <el-divider />

            <!-- 基本信息卡片 -->
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
                  <div class="card-value phone-value">{{ merchantPhone || '暂无信息' }}</div>
                </div>
              </div>
            </div>

            <!-- 商家信息（增强版） -->
            <div v-if="food.merchantId" class="merchant-section">
              <h3 class="section-title">
                <span class="title-icon">🏪</span>
                商家信息
              </h3>
              <div class="merchant-card">
                <div class="merchant-avatar" title="进入个人主页" @click="goToMerchantHome">
                  <el-image
                    v-if="merchantInfo.avatar"
                    :src="merchantInfo.avatar"
                    fit="cover"
                    class="merchant-avatar-img"
                  >
                    <template #error>
                      <span class="merchant-avatar-text">{{ merchantInitial }}</span>
                    </template>
                  </el-image>
                  <span v-else class="merchant-avatar-text">{{ merchantInitial }}</span>
                </div>
                <div class="merchant-info">
                  <div class="merchant-name">{{ merchantInfo.nickname || merchantInfo.username || '商家' }}</div>
                  <div class="merchant-meta">
                    <el-tag v-if="merchantInfo.isCertified === 1" type="warning" size="small" effect="plain">
                      <el-icon><CircleCheck /></el-icon> 认证商家
                    </el-tag>
                    <span class="meta-text" v-if="merchantInfo.category">{{ merchantInfo.category }}</span>
                    <span class="meta-text" v-if="merchantInfo.location">{{ merchantInfo.location }}</span>
                    <span class="meta-text">{{ food.commentCount || commentList.length || 0 }}条评价</span>
                  </div>
                  <div class="merchant-desc">
                    {{ merchantInfo.bio || merchantInfo.address || '提供本地特色餐饮服务，支持套餐预订与到店用餐。' }}
                  </div>
                  <div class="merchant-contact">
                    <span class="contact-label">商家电话</span>
                    <span class="contact-phone">{{ merchantPhone || '暂无信息' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 套餐专区 -->
            <div class="packages-section" v-if="packageList.length > 0">
              <h3 class="section-title">
                <span class="title-icon">🎁</span>
                推荐套餐
                <span class="package-count">{{ packageList.length }}个套餐可选</span>
              </h3>
              <div class="package-tabs">
                <template v-for="tab in packageTabs" :key="tab.value">
                  <div
                    v-if="getPackagesByType(tab.value).length > 0"
                    :class="['package-tab', { active: activePackageTab === tab.value }]"
                    @click="activePackageTab = tab.value"
                  >
                    {{ tab.label }}
                  </div>
                </template>
              </div>
              <div class="package-grid">
                <div
                  v-for="pkg in filteredPackages"
                  :key="pkg.id"
                  :class="['package-card', { selected: selectedPackageId === pkg.id }]"
                  @click="selectPackage(pkg)"
                >
                  <div class="package-image" v-if="pkg.image">
                    <el-image :src="pkg.image" fit="cover" />
                  </div>
                  <div class="package-no-image" v-else>
                    <el-icon><Food /></el-icon>
                  </div>
                  <div class="package-info">
                    <div class="package-header">
                      <el-tag v-if="pkg.packageType === 1" type="primary" size="small">单人</el-tag>
                      <el-tag v-else-if="pkg.packageType === 2" type="success" size="small">双人</el-tag>
                      <el-tag v-else-if="pkg.packageType === 3" type="warning" size="small">家庭</el-tag>
                      <el-tag v-else-if="pkg.packageType === 4" type="danger" size="small">豪华</el-tag>
                      <span class="package-name">{{ pkg.packageName }}</span>
                    </div>
                    <div class="package-desc" v-if="pkg.description">{{ pkg.description }}</div>
                    <div class="package-price-row">
                      <div class="package-price">
                        <span class="currency">¥</span>
                        <span class="amount">{{ pkg.price }}</span>
                        <span v-if="pkg.originalPrice" class="original">¥{{ pkg.originalPrice }}</span>
                      </div>
                      <el-button
                        v-if="selectedPackageId === pkg.id"
                        type="primary"
                        size="small"
                        round
                        @click.stop="quickOrder(pkg)"
                      >
                        立即购买
                      </el-button>
                      <el-button
                        v-else
                        size="small"
                        round
                        @click.stop="selectPackage(pkg)"
                      >
                        选择
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 店铺介绍 -->
            <div class="description-section">
              <h3 class="section-title">
                <span class="title-icon">🍴</span>
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
              <div id="food-map" class="map-container"></div>
              <div class="map-address">
                <el-icon><Location /></el-icon>
                <span>{{ food.address }}</span>
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

              <div class="order-type-tabs">
                <div
                  :class="['order-tab', { active: orderType === 'dinein' }]"
                  @click="orderType = 'dinein'"
                >
                  <el-icon><Food /></el-icon>
                  <span>到店用餐</span>
                </div>
                <div
                  :class="['order-tab', { active: orderType === 'takeout' }]"
                  @click="orderType = 'takeout'"
                  v-if="food.isTakeout === 1"
                >
                  <el-icon><ShoppingBag /></el-icon>
                  <span>外卖配送</span>
                </div>
              </div>

              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  class="order-btn"
                  @click="handleMainOrder"
                >
                  {{ orderType === 'dinein' ? '去下单' : '外卖下单' }}
                </el-button>
                <el-button
                  :class="['collect-btn', { collected: isCollected }]"
                  @click="toggleCollect"
                >
                  <el-icon><component :is="isCollected ? 'StarFilled' : 'Star'" /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }} ({{ food.collectCount || 0 }})
                </el-button>
              </div>

              <div class="booking-features">
                <div class="feature-item">
                  <el-icon><Clock /></el-icon>
                  <span>营业中</span>
                </div>
                <div class="feature-item">
                  <el-icon><Tickets /></el-icon>
                  <span>多套餐</span>
                </div>
                <div class="feature-item">
                  <el-icon><Present /></el-icon>
                  <span>优惠大</span>
                </div>
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

            <!-- 座位信息 -->
            <div class="table-card" v-if="food.totalTables && food.totalTables > 0">
              <h4><el-icon><Tickets /></el-icon>座位信息</h4>
              <div class="table-status">
                <span class="available">{{ food.totalTables - (food.reservedTables || 0) }}个可用</span>
                <span class="total">共 {{ food.totalTables }} 桌</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户评价 -->
      <section class="comments-section">
        <div class="section-container">
          <div class="section-header">
            <h3 class="section-title-bar">
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
                    v-for="(img, idx) in comment.images.split(',')"
                    :key="idx"
                    :src="img"
                    fit="cover"
                    class="comment-img"
                    :preview-src-list="comment.images.split(',')"
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
          :placeholder="replyingTo ? `回复 ${replyingTo.userName}...` : '分享你的用餐体验...'"
          maxlength="500"
          show-word-limit
        />
      </div>
      <template #footer>
        <el-button @click="closeCommentDialog">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="submitting">
          {{ replyingTo ? '提交回复' : '提交评价' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 鍒板簵鐢ㄩ涓嬪崟瀵硅瘽妗?========== -->
    <el-dialog
      v-model="dineinDialogVisible"
      title="到店用餐下单"
      width="800px"
      :close-on-click-modal="false"
      class="order-dialog dinein-dialog"
    >
      <div class="dialog-content">
        <el-steps :active="dineinStep" align-center finish-status="success">
          <el-step title="选择套餐" />
          <el-step title="预约信息" />
          <el-step title="确认订单" />
          <el-step title="完成下单" />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1: 选择套餐 -->
          <div v-show="dineinStep === 0" class="step-panel">
            <div class="package-choose-list">
              <div
                v-for="pkg in packageList"
                :key="pkg.id"
                :class="['package-choose-item', { selected: dineinForm.packageId === pkg.id }]"
                @click="dineinForm.packageId = pkg.id"
              >
                <div class="pkg-radio">
                  <el-radio :model-value="dineinForm.packageId === pkg.id" />
                </div>
                <div class="pkg-image" v-if="pkg.image">
                  <el-image :src="pkg.image" fit="cover" />
                </div>
                <div class="pkg-no-image" v-else>
                  <el-icon><Food /></el-icon>
                </div>
                <div class="pkg-info">
                  <div class="pkg-type-row">
                    <el-tag v-if="pkg.packageType === 1" size="small" type="primary">单人</el-tag>
                    <el-tag v-else-if="pkg.packageType === 2" size="small" type="success">双人</el-tag>
                    <el-tag v-else-if="pkg.packageType === 3" size="small" type="warning">家庭</el-tag>
                    <el-tag v-else-if="pkg.packageType === 4" size="small" type="danger">豪华</el-tag>
                  </div>
                  <div class="pkg-name">{{ pkg.packageName }}</div>
                  <div class="pkg-desc" v-if="pkg.description">{{ pkg.description }}</div>
                </div>
                <div class="pkg-price">
                  <div class="current-price">¥{{ pkg.price }}</div>
                  <div v-if="pkg.originalPrice" class="original-price">¥{{ pkg.originalPrice }}</div>
                </div>
              </div>
              <el-empty v-if="packageList.length === 0" description="该商家暂时没有可选套餐" />
            </div>
          </div>

          <!-- 步骤2: 预约信息 -->
          <div v-show="dineinStep === 1" class="step-panel">
            <el-form :model="dineinForm" label-position="top" class="dinein-form">
              <el-form-item label="用餐日期" required>
                <el-date-picker
                  v-model="dineinForm.bookingDate"
                  type="date"
                  placeholder="请选择用餐日期"
                  :disabled-date="disablePastDate"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item label="用餐时段" required>
                <el-radio-group v-model="dineinForm.mealTime">
                  <el-radio-button label="午餐" />
                  <el-radio-button label="晚餐" />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="用餐人数" required>
                <el-select v-model="dineinForm.dinerCount" placeholder="请选择人数" style="width: 100%">
                  <el-option v-for="n in 12" :key="n" :label="`${n}人`" :value="n" />
                </el-select>
              </el-form-item>
              <el-form-item label="预约桌位" v-if="tableList.length > 0">
                <el-select v-model="dineinForm.tableId" placeholder="请选择桌位（可选）" clearable style="width: 100%">
                  <el-option
                    v-for="t in tableList"
                    :key="t.id"
                    :label="`${t.tableName || ''} - ${t.tableNumber}桌 (${t.capacity}人位)`"
                    :value="t.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="dineinForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="口味要求、忌口、特殊需求等"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 确认订单 -->
          <div v-show="dineinStep === 2" class="step-panel">
            <div class="order-confirm">
              <div class="confirm-section">
                <h4><el-icon><Food /></el-icon>套餐信息</h4>
                <div class="confirm-item" v-if="selectedPackage">
                  <span class="label">套餐名称</span>
                  <span class="value">{{ selectedPackage.packageName }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">单价</span>
                  <span class="value">¥{{ selectedPackage ? selectedPackage.price : food.avgPrice }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><Calendar /></el-icon>预约信息</h4>
                <div class="confirm-item">
                  <span class="label">用餐日期</span>
                  <span class="value">{{ dineinForm.bookingDate }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">用餐时段</span>
                  <span class="value">{{ dineinForm.mealTime }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">用餐人数</span>
                  <span class="value">{{ dineinForm.dinerCount }}人</span>
                </div>
                <div class="confirm-item" v-if="dineinForm.tableId">
                  <span class="label">预约桌位</span>
                  <span class="value">{{ getTableLabel(dineinForm.tableId) }}</span>
                </div>
                <div class="confirm-item" v-if="dineinForm.remark">
                  <span class="label">备注</span>
                  <span class="value">{{ dineinForm.remark }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-section">
                <h4><el-icon><Shop /></el-icon>商家信息</h4>
                <div class="confirm-item">
                  <span class="label">商家名称</span>
                  <span class="value">{{ food.name }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">商家地址</span>
                  <span class="value">{{ food.address }}</span>
                </div>
              </div>
              <el-divider />
              <div class="confirm-total">
                <span class="total-label">应付金额</span>
                <span class="total-amount">¥{{ selectedPackage ? selectedPackage.price : food.avgPrice }}</span>
              </div>
            </div>
          </div>

          <!-- 步骤4: 完成 -->
          <div v-show="dineinStep === 3" class="step-panel">
            <div class="payment-panel">
              <div class="success-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <h3>订单创建成功</h3>
              <p class="order-no">订单号：{{ orderNo }}</p>
              <div class="payment-amount">
                <span class="label">应付金额</span>
                <span class="amount">¥{{ dineinTotalAmount }}</span>
              </div>
              <PaymentMethodCard />
              <div v-if="payQrCodeUrl" class="pay-qrcode">
                <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
                <div class="pay-tip">请使用支付宝沙箱 App 扫描二维码完成支付</div>
              </div>
              <el-button type="primary" size="large" class="pay-btn" :loading="isGeneratingQrCode" @click="handleDineinPay">
                {{ payQrCodeUrl ? '刷新二维码' : '立即支付' }}
              </el-button>
              <el-progress v-if="isPollingPay" :percentage="payPollProgress" :show-text="false" :stroke-width="6" />
              <p class="pay-tip">{{ payStatusMessage || '支付成功后，请按时到店消费，凭订单核销' }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="dineinDialogVisible = false">取消</el-button>
        <el-button v-if="dineinStep > 0 && dineinStep < 3" @click="prevDineinStep">上一步</el-button>
        <el-button v-if="dineinStep < 2" type="primary" @click="nextDineinStep">下一步</el-button>
        <el-button v-if="dineinStep === 2" type="primary" @click="createDineinOrder" :loading="creating">
          确认下单
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 澶栧崠涓嬪崟瀵硅瘽妗?========== -->
    <el-dialog
      v-model="takeoutDialogVisible"
      title="外卖下单"
      width="800px"
      :close-on-click-modal="false"
      class="order-dialog takeout-dialog"
    >
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
            <div class="package-tabs-small">
              <template v-for="tab in packageTabs" :key="tab.value">
                <div
                  v-if="getPackagesByType(tab.value).length > 0"
                  :class="['pkg-tab-small', { active: activePackageTab === tab.value }]"
                  @click="activePackageTab = tab.value"
                >
                  {{ tab.label }}
                </div>
              </template>
            </div>
            <div class="package-choose-list">
              <div
                v-for="pkg in filteredPackages"
                :key="pkg.id"
                :class="['package-choose-item', { selected: takeoutForm.packageId === pkg.id }]"
                @click="takeoutForm.packageId = pkg.id"
              >
                <div class="pkg-radio">
                  <el-radio :model-value="takeoutForm.packageId === pkg.id" />
                </div>
                <div class="pkg-image" v-if="pkg.image">
                  <el-image :src="pkg.image" fit="cover" />
                </div>
                <div class="pkg-no-image" v-else>
                  <el-icon><Food /></el-icon>
                </div>
                <div class="pkg-info">
                  <div class="pkg-type-row">
                    <el-tag v-if="pkg.packageType === 1" size="small" type="primary">单人</el-tag>
                    <el-tag v-else-if="pkg.packageType === 2" size="small" type="success">双人</el-tag>
                    <el-tag v-else-if="pkg.packageType === 3" size="small" type="warning">家庭</el-tag>
                    <el-tag v-else-if="pkg.packageType === 4" size="small" type="danger">豪华</el-tag>
                  </div>
                  <div class="pkg-name">{{ pkg.packageName }}</div>
                  <div class="pkg-desc" v-if="pkg.description">{{ pkg.description }}</div>
                </div>
                <div class="pkg-price">
                  <div class="current-price">¥{{ pkg.price }}</div>
                  <div v-if="pkg.originalPrice" class="original-price">¥{{ pkg.originalPrice }}</div>
                </div>
              </div>
              <el-empty v-if="filteredPackages.length === 0" description="该分类暂时没有套餐" />
            </div>
          </div>

          <!-- 步骤2: 填写地址 -->
          <div v-show="takeoutStep === 1" class="step-panel">
            <div class="address-select-head">
              <div>
                <div class="address-select-title">选择收货地址</div>
                <div class="address-select-desc">收货地址需要先在个人中心配置，可通过地图点击获取详细地址。</div>
              </div>
              <el-button type="primary" plain @click="goAddressSettings">管理地址</el-button>
            </div>
            <div v-loading="addressLoading" class="delivery-address-list">
              <div
                v-for="address in addressList"
                :key="address.id"
                :class="['delivery-address-card', { selected: selectedAddressId === address.id }]"
                @click="selectDeliveryAddress(address)"
              >
                <div class="delivery-address-radio">
                  <el-radio :model-value="selectedAddressId === address.id" />
                </div>
                <div class="delivery-address-main">
                  <div class="delivery-address-head">
                    <strong>{{ address.contactName }}</strong>
                    <span>{{ address.contactPhone }}</span>
                    <el-tag v-if="address.isDefault === 1" size="small" type="success" effect="plain">默认</el-tag>
                  </div>
                  <div class="delivery-address-text">{{ address.address }}</div>
                  <div v-if="address.remark" class="delivery-address-remark">{{ address.remark }}</div>
                </div>
              </div>
              <el-empty v-if="addressList.length === 0 && !addressLoading" description="还没有配置收货地址">
                <el-button type="primary" @click="goAddressSettings">去个人中心配置</el-button>
              </el-empty>
            </div>
            <el-form :model="takeoutForm" label-position="top" class="takeout-form takeout-remark-form">
              <el-form-item label="备注">
                <el-input
                  v-model="takeoutForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="口味要求、忌口等"
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 确认订单 -->
          <div v-show="takeoutStep === 2" class="step-panel">
            <div class="order-confirm">
              <div class="confirm-section">
                <h4><el-icon><Food /></el-icon>商品信息</h4>
                <div class="confirm-item" v-if="takeoutSelectedPackage">
                  <span class="label">套餐名称</span>
                  <span class="value">{{ takeoutSelectedPackage.packageName }}</span>
                </div>
                <div class="confirm-item" v-else>
                  <span class="label">美食名称</span>
                  <span class="value">{{ food.name }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">单价</span>
                  <span class="value">¥{{ takeoutSelectedPackage ? takeoutSelectedPackage.price : food.avgPrice }}</span>
                </div>
                <div class="confirm-item">
                  <span class="label">配送费</span>
                  <span class="value">¥{{ deliveryFee }}</span>
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
              <PaymentMethodCard />
              <div v-if="payQrCodeUrl" class="pay-qrcode">
                <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
                <div class="pay-tip">请使用支付宝沙箱 App 扫描二维码完成支付</div>
              </div>
              <el-button type="primary" size="large" class="pay-btn" :loading="isGeneratingQrCode" @click="handleTakeoutPay">
                {{ payQrCodeUrl ? '刷新二维码' : '立即支付' }}
              </el-button>
              <el-progress v-if="isPollingPay" :percentage="payPollProgress" :show-text="false" :stroke-width="6" />
              <p class="pay-tip">{{ payStatusMessage || '支付成功后，等待商家发货配送' }}</p>
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
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Location, Money, Phone, Star, StarFilled,
  Clock, Ticket, Present, Edit, User,
  CircleCheck,
  Food, Grid, Shop, ShoppingBag,
  Ticket as Tickets, Calendar, ChatDotRound, Delete
} from '@element-plus/icons-vue'
import request from '@/util/request'
import { extractDisplayTags } from '@/utils/contentTags'
import { buildPayQrCodeUrl } from '@/utils/payQrCode'
import { loadAMapScript } from '@/utils/amap'
import { formatDateTime, type DateInput } from '@/utils/date'
import { normalizeImageUrl, parseImageList } from '@/utils/imageUrl'

import TourismTopNav from '@/components/TourismTopNav.vue'
import PaymentMethodCard from '@/components/PaymentMethodCard.vue'

const router = useRouter()
const route = useRoute()

const foodId = ref(Number(route.params.id))
const food = ref<any>({})
const imageList = ref<string[]>([])
const commentList = ref<any[]>([])
const isCollected = ref(false)
const commentDialogVisible = ref(false)
const submitting = ref(false)
const replyingTo = ref<any>(null)
const replyRoot = ref<any>(null)
const foodDisplayTags = computed(() => {
  const tags = extractDisplayTags(food.value)
  return tags.filter((tag) => tag !== food.value.region)
})

// 商家信息（直接从 food 详情获取）
const merchantInfo = computed(() => ({
  nickname: food.value.merchantName,
  username: food.value.merchantName,
  avatar: food.value.merchantAvatar ? normalizeImageUrl(food.value.merchantAvatar, '') : '',
  bio: food.value.merchantBio,
  location: food.value.merchantLocation,
  address: food.value.merchantAddress,
  category: food.value.merchantCategory,
  isCertified: food.value.merchantCertified
}))

const merchantPhone = computed(() => food.value.merchantContactPhone || food.value.contactPhone || '')

const merchantInitial = computed(() => {
  const name = merchantInfo.value.nickname || merchantInfo.value.username || food.value.name || '商'
  return String(name).trim().slice(0, 1)
})

// 套餐相关
const packageList = ref<any[]>([])
const activePackageTab = ref(1)
const selectedPackageId = ref<number | null>(null)

const packageTabs = [
  { label: '全部', value: 0 },
  { label: '单人套餐', value: 1 },
  { label: '双人套餐', value: 2 },
  { label: '家庭套餐', value: 3 },
  { label: '豪华套餐', value: 4 }
]

const filteredPackages = computed(() => {
  if (activePackageTab.value === 0) return packageList.value
  return packageList.value.filter(p => p.packageType === activePackageTab.value)
})

const getPackagesByType = (type: number) => {
  if (type === 0) return packageList.value
  return packageList.value.filter(p => p.packageType === type)
}

const selectPackage = (pkg: any) => {
  selectedPackageId.value = pkg.id
}

// 座位列表
const tableList = ref<any[]>([])

// 下单类型
const orderType = ref<'dinein' | 'takeout'>('dinein')

// ===== 到店用餐 =====
const dineinDialogVisible = ref(false)
const dineinStep = ref(0)
const creating = ref(false)
const orderNo = ref('')
const payQrCodeUrl = ref('')
const isGeneratingQrCode = ref(false)
const isPollingPay = ref(false)
const payPollProgress = ref(0)
const payStatusMessage = ref('')
let payPollingTimer: any = null

const dineinForm = reactive({
  packageId: null as number | null,
  bookingDate: '',
  mealTime: '午餐',
  dinerCount: 2,
  tableId: null as number | null,
  remark: ''
})

const selectedPackage = computed(() => packageList.value.find(p => p.id === dineinForm.packageId))
const dineinTotalAmount = computed(() => {
  if (selectedPackage.value) return selectedPackage.value.price
  return food.value.avgPrice
})

const getTableLabel = (tableId: number) => {
  const t = tableList.value.find(t => t.id === tableId)
  if (!t) return ''
  return `${t.tableName || ''} - ${t.tableNumber}桌 (${t.capacity}人位)`
}

const disablePastDate = (date: Date) => {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

const handleMainOrder = () => {
  if (orderType.value === 'dinein') {
    openDineinDialog()
  } else {
    openTakeoutDialog()
  }
}

const openDineinDialog = async () => {
  dineinDialogVisible.value = true
  dineinStep.value = 0
  orderNo.value = ''
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
  dineinForm.packageId = selectedPackageId.value
// 如果只有一个套餐，直接选中
  if (packageList.value.length === 1 && !dineinForm.packageId) {
    dineinForm.packageId = packageList.value[0].id
  }
  await loadTables()
}

const loadTables = async () => {
  try {
    const res: any = await request.get(`/food/table/list/${foodId.value}`)
    if (res && res.code === 200) {
      tableList.value = res.data || []
    }
  } catch (e) {
    tableList.value = []
  }
}

const prevDineinStep = () => {
  if (dineinStep.value > 0) dineinStep.value--
}

const nextDineinStep = () => {
  if (dineinStep.value === 0 && !dineinForm.packageId && packageList.value.length > 0) {
    ElMessage.warning('请选择一个套餐')
    return
  }
  if (dineinStep.value === 1) {
    if (!dineinForm.bookingDate) { ElMessage.warning('请选择用餐日期'); return }
    if (!dineinForm.mealTime) { ElMessage.warning('请选择用餐时段'); return }
    if (!dineinForm.dinerCount) { ElMessage.warning('请选择用餐人数'); return }
  }
  dineinStep.value++
}

const createDineinOrder = async () => {
  creating.value = true
  try {
    const tableInfo = dineinForm.tableId ? tableList.value.find(t => t.id === dineinForm.tableId) : null
    const res: any = await request.post('/order/create', {
      orderType: 3,
      foodId: foodId.value,
      foodName: food.value.name,
      foodPackageId: dineinForm.packageId,
      foodPackageName: selectedPackage.value ? selectedPackage.value.packageName : null,
      bookingDate: dineinForm.bookingDate,
      mealTime: dineinForm.mealTime,
      dinerCount: dineinForm.dinerCount,
      tableId: dineinForm.tableId,
      tableNumber: tableInfo ? tableInfo.tableNumber : null,
      totalAmount: dineinTotalAmount.value,
      specialRequest: dineinForm.remark
    })
    if (res && res.code === 200) {
      orderNo.value = res.data
      dineinStep.value = 3
      ElMessage.success('订单创建成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    creating.value = false
  }
}

const handleDineinPay = async () => {
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
      startPayPolling(orderNo.value, 'dinein')
    }
  } catch (error: any) {
    payStatusMessage.value = error.message || '支付失败'
    ElMessage.error(error.message || '支付失败')
  } finally {
    isGeneratingQrCode.value = false
  }
}

const resetDineinForm = () => {
  stopPayPolling()
  dineinForm.packageId = null
  dineinForm.bookingDate = ''
  dineinForm.mealTime = '午餐'
  dineinForm.dinerCount = 2
  dineinForm.tableId = null
  dineinForm.remark = ''
  dineinStep.value = 0
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
}

// ===== 外卖下单 =====
const takeoutDialogVisible = ref(false)
const takeoutStep = ref(0)
const takeoutForm = reactive({
  packageId: null as number | null,
  receiverName: '',
  receiverPhone: '',
  address: '',
  remark: ''
})

const deliveryFee = ref(5)
const addressLoading = ref(false)
const addressList = ref<any[]>([])
const selectedAddressId = ref<number | null>(null)
const takeoutSelectedPackage = computed(() => packageList.value.find(p => p.id === takeoutForm.packageId))
const takeoutTotalAmount = computed(() => {
  const pkgPrice = takeoutSelectedPackage.value ? takeoutSelectedPackage.value.price : (food.value.avgPrice || 0)
  return (Number(pkgPrice) + deliveryFee.value).toFixed(2)
})

const applyDeliveryAddress = (address: any) => {
  if (!address) return
  selectedAddressId.value = address.id
  takeoutForm.receiverName = address.contactName || ''
  takeoutForm.receiverPhone = address.contactPhone || ''
  takeoutForm.address = address.address || ''
}

const selectDeliveryAddress = (address: any) => {
  applyDeliveryAddress(address)
}

const loadUserAddresses = async () => {
  addressLoading.value = true
  try {
    const res: any = await request.get('/user/address/list')
    if (res && res.code === 200) {
      addressList.value = res.data || []
      const preferred = addressList.value.find(address => address.isDefault === 1) || addressList.value[0]
      if (preferred && !selectedAddressId.value) {
        applyDeliveryAddress(preferred)
      }
    }
  } catch (error) {
    console.error('加载收货地址失败', error)
    addressList.value = []
  } finally {
    addressLoading.value = false
  }
}

const goAddressSettings = () => {
  router.push('/user/center?tab=addresses')
}

const openTakeoutDialog = async () => {
  takeoutDialogVisible.value = true
  takeoutStep.value = 0
  orderNo.value = ''
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
  takeoutForm.packageId = selectedPackageId.value
  if (packageList.value.length === 1 && !takeoutForm.packageId) {
    takeoutForm.packageId = packageList.value[0].id
  }
  await loadUserAddresses()
}

const prevTakeoutStep = () => {
  if (takeoutStep.value > 0) takeoutStep.value--
}

const nextTakeoutStep = () => {
  if (takeoutStep.value === 0 && !takeoutForm.packageId && packageList.value.length > 0) {
    ElMessage.warning('请选择一个套餐')
    return
  }
  if (takeoutStep.value === 1) {
    if (!selectedAddressId.value) { ElMessage.warning('请选择收货地址'); return }
    if (!takeoutForm.receiverName) { ElMessage.warning('请输入收货人姓名'); return }
    if (!takeoutForm.receiverPhone) { ElMessage.warning('请输入联系电话'); return }
    if (takeoutForm.receiverPhone.length !== 11) { ElMessage.warning('请输入11位手机号'); return }
    if (!takeoutForm.address) { ElMessage.warning('请输入收货地址'); return }
  }
  takeoutStep.value++
}

const createTakeoutOrder = async () => {
  creating.value = true
  try {
    const res: any = await request.post('/order/create', {
      orderType: 3,
      foodId: foodId.value,
      foodName: food.value.name,
      foodPackageId: takeoutForm.packageId,
      foodPackageName: takeoutSelectedPackage.value ? takeoutSelectedPackage.value.packageName : null,
      totalAmount: takeoutTotalAmount.value,
      visitorName: takeoutForm.receiverName,
      visitorPhone: takeoutForm.receiverPhone,
      guestName: takeoutForm.receiverName,
      guestPhone: takeoutForm.receiverPhone,
      deliveryAddress: takeoutForm.address,
      visitorIdCard: '',
      specialRequest: takeoutForm.remark,
      deliveryStatus: 0
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

const handleTakeoutPay = async () => {
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
      startPayPolling(orderNo.value, 'takeout')
    }
  } catch (error: any) {
    payStatusMessage.value = error.message || '支付失败'
    ElMessage.error(error.message || '支付失败')
  } finally {
    isGeneratingQrCode.value = false
  }
}

const resetTakeoutForm = () => {
  stopPayPolling()
  takeoutForm.packageId = null
  takeoutForm.receiverName = ''
  takeoutForm.receiverPhone = ''
  takeoutForm.address = ''
  selectedAddressId.value = null
  takeoutForm.remark = ''
  takeoutStep.value = 0
  payQrCodeUrl.value = ''
  payStatusMessage.value = ''
  payPollProgress.value = 0
}

const startPayPolling = (currentOrderNo: string, mode: 'dinein' | 'takeout') => {
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
        if (mode === 'dinein') {
          dineinDialogVisible.value = false
          ElMessage.info('您已下单成功，请按时到店消费并凭订单核销')
          resetDineinForm()
        } else {
          takeoutDialogVisible.value = false
          ElMessage.info('您的外卖订单已下单，等待商家发货')
          resetTakeoutForm()
        }
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

// 快捷下单
const quickOrder = (pkg: any) => {
  selectedPackageId.value = pkg.id
  if (orderType.value === 'dinein') {
    dineinForm.packageId = pkg.id
    openDineinDialog()
  } else {
    takeoutForm.packageId = pkg.id
    openTakeoutDialog()
  }
}

// ===== 加载数据 =====
const loadFoodDetail = async () => {
  try {
    const res: any = await request.get(`/food/${foodId.value}`)
    if (res && res.code === 200 && res.data) {
      food.value = res.data
      isCollected.value = res.data.isCollected === 1
      imageList.value = parseImageList(res.data.images)
      nextTick(() => initMap())
    }
  } catch (error) {
    console.error('加载美食详情失败', error)
  }
}

const loadPackages = async () => {
  try {
    const res: any = await request.get(`/food/${foodId.value}/packages`)
    if (res && res.code === 200) {
      packageList.value = res.data || []
    }
  } catch (e) {
    packageList.value = []
  }
}

const initMap = async () => {
  if (!food.value.longitude || !food.value.latitude) return
  const container = document.getElementById('food-map')
  if (!container) return
  try {
    await loadAMapScript()
    container.innerHTML = ''
    const map = new window.AMap.Map('food-map', {
      zoom: 15,
      center: [food.value.longitude, food.value.latitude],
      mapStyle: 'amap://styles/normal'
    })
    const marker = new window.AMap.Marker({
      position: [food.value.longitude, food.value.latitude],
      title: food.value.name
    })
    map.add(marker)
    const infoWindow = new window.AMap.InfoWindow({
      content: `<div style="padding:8px;font-size:14px;"><h4 style="margin:0 0 8px 0;">${food.value.name}</h4><p style="margin:0;color:#666;">${food.value.address}</p></div>`,
      offset: new window.AMap.Pixel(0, -30)
    })
    marker.on('click', () => infoWindow.open(map, marker.getPosition()))
  } catch (error) {
    console.error('高德地图加载失败:', error)
  }
}

const loadCommentList = async () => {
  try {
    const res: any = await request.get('/comment/list', {
      params: { contentId: foodId.value, contentType: 5, pageNum: 1, pageSize: 10 }
    })
    if (res && res.code === 200 && res.data && res.data.list) {
      commentList.value = res.data.list
    }
  } catch (error) {
    console.error('加载评论失败', error)
  }
}

// 收藏
const toggleCollect = async () => {
  try {
    if (isCollected.value) {
      await request.delete(`/food/collect/${foodId.value}`)
      ElMessage.success('取消收藏成功')
      isCollected.value = false
      food.value.collectCount = Math.max(0, (food.value.collectCount || 0) - 1)
    } else {
      await request.post(`/food/collect/${foodId.value}`)
      ElMessage.success('收藏成功')
      isCollected.value = true
      food.value.collectCount = (food.value.collectCount || 0) + 1
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 评论
const commentForm = reactive({ rating: 5, content: '' })

const showCommentDialog = () => {
  if (!localStorage.getItem('auth-token')) {
    ElMessage.warning('请先登录后再评价')
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
  if (!commentForm.content.trim()) { ElMessage.warning('请输入评价内容'); return }
  submitting.value = true
  try {
    const res: any = await request.post('/comment/add', {
      contentId: foodId.value,
      contentType: 5,
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
    submitting.value = false
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

const formatTime = (time: DateInput) => formatDateTime(time, '-', 'YYYY-MM-DD HH:mm')

const goHome = () => router.push('/')
const goBack = () => router.back()
const goToMerchantHome = () => {
  if (food.value.merchantId) router.push(`/user/${food.value.merchantId}`)
}
onMounted(() => {
  loadFoodDetail()
  loadPackages()
  loadCommentList()
})
</script>

<style scoped lang="scss">
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

.food-detail { min-height: 100vh; background: $bg-light; }
.detail-header { background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); box-shadow: $shadow-sm; position: sticky; top: 0; z-index: 100; }
.header-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 14px 40px; }
.logo-section { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo-icon { font-size: 28px; }
.logo-text { font-size: 20px; font-weight: 700; color: $primary; }
.back-btn { border-radius: 20px; padding: 8px 20px; }
.gallery-section { background: $white; }
.gallery-main { position: relative; max-width: 1400px; margin: 0 auto; }
.gallery-image { width: 100%; height: 100%; }
.gallery-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(transparent, rgba(0,0,0,0.4)); }
.gallery-badges { position: absolute; bottom: 20px; left: 40px; display: flex; gap: 10px; }
.gallery-badges .badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(255,255,255,0.95); border-radius: 20px; font-size: 14px; font-weight: 600; }
.gallery-badges .food-badge { color: #f5576c; }
.gallery-badges .combo-badge { color: $primary; }
.gallery-main :deep(.el-carousel__arrow) { width: 50px; height: 50px; font-size: 24px; background: rgba(255,255,255,0.9); }
.gallery-main :deep(.el-carousel__arrow:hover) { background: $white; }
.info-section { padding: 32px 0; }
.info-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; }
.breadcrumb-item { color: $text-muted; cursor: pointer; }
.breadcrumb-item:hover { color: $primary; }
.breadcrumb-item.current { color: $text-primary; font-weight: 500; }
.breadcrumb-separator { color: $border; }
.food-title { font-size: 36px; font-weight: 700; color: $text-primary; margin: 0 0 16px; }
.food-tags { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.food-tags .tag { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(245,87,108,0.08); color: #f5576c; border-radius: 20px; font-size: 13px; }
.food-tags .tag.type-tag { background: linear-gradient(135deg, #f5576c 0%, #ff8a65 100%); color: #fff; font-weight: 600; }
.food-tags .tag.extra-tag { background: rgba(255, 169, 64, 0.12); color: #c46a10; }
.food-stats { display: flex; align-items: center; gap: 24px; padding: 20px 24px; background: $bg-light; border-radius: 12px; margin-bottom: 24px; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-value { font-size: 24px; font-weight: 700; color: $text-primary; }
.stat-label { font-size: 12px; color: $text-muted; }
.stat-divider { width: 1px; height: 40px; background: $border; }
.merchant-section { margin-top: 32px; }
.section-title { font-size: 18px; font-weight: 600; color: $text-primary; display: flex; align-items: center; gap: 10px; margin: 0 0 20px; }
.section-title .title-icon { font-size: 20px; }
.section-title .package-count { font-size: 13px; font-weight: 400; color: $text-muted; margin-left: 8px; }
.merchant-card { display: grid; grid-template-columns: 72px minmax(0, 1fr); align-items: center; gap: 18px; padding: 20px; background: linear-gradient(135deg,#fffaf0 0%,#fff7e3 100%); border-radius: 12px; border: 1px solid #ffd666; transition: all 0.3s; }
.merchant-card:hover { box-shadow: 0 8px 24px rgba(255,169,64,0.18); transform: translateY(-2px); }
.merchant-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg,#ffa940 0%,#fa541c 100%); display: flex; align-items: center; justify-content: center; color: #fff; overflow: hidden; box-shadow: 0 8px 20px rgba(250,84,28,0.18); flex-shrink: 0; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.merchant-avatar:hover { transform: translateY(-1px) scale(1.03); box-shadow: 0 10px 24px rgba(250,84,28,0.24); }
.merchant-avatar-img { width: 100%; height: 100%; border-radius: 50%; }
.merchant-avatar-text { font-size: 28px; font-weight: 700; line-height: 1; }
.merchant-info { min-width: 0; }
.merchant-name { font-size: 19px; font-weight: 700; color: #ad4e00; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.merchant-badge { display: flex; gap: 8px; }
.merchant-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.meta-text { font-size: 12px; color: $text-muted; }
.merchant-desc { max-width: 680px; color: $text-secondary; font-size: 13px; line-height: 1.6; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.merchant-contact { display: inline-flex; align-items: center; gap: 10px; padding: 7px 12px; background: rgba(255,255,255,0.78); border: 1px solid rgba(255,214,102,0.72); border-radius: 8px; }
.contact-label { color: $text-muted; font-size: 12px; }
.contact-phone { color: $text-primary; font-size: 15px; font-weight: 700; }
.packages-section { margin-top: 32px; }
.package-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.package-tab { padding: 8px 18px; background: $white; border: 1px solid $border; border-radius: 20px; font-size: 13px; color: $text-secondary; cursor: pointer; transition: all 0.2s; }
.package-tab:hover { border-color: $primary; color: $primary; }
.package-tab.active { background: $primary; color: $white; border-color: $primary; }
.package-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.package-card { background: $white; border: 2px solid $border; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.package-card:hover { border-color: $primary; box-shadow: 0 4px 16px rgba(26,95,74,0.1); }
.package-card.selected { border-color: $primary; background: rgba(26,95,74,0.02); }
.package-image { height: 140px; overflow: hidden; }
.package-image .el-image { width: 100%; height: 100%; }
.package-no-image { height: 140px; background: linear-gradient(135deg,$bg-light 0%,#e8e8e8 100%); display: flex; align-items: center; justify-content: center; font-size: 48px; color: $text-muted; }
.package-info { padding: 14px; }
.package-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.package-name { font-size: 15px; font-weight: 600; color: $text-primary; }
.package-desc { font-size: 12px; color: $text-muted; margin-bottom: 10px; line-height: 1.4; }
.package-price-row { display: flex; align-items: center; justify-content: space-between; }
.package-price { display: flex; align-items: baseline; gap: 2px; }
.package-price .currency { font-size: 14px; color: #f5576c; }
.package-price .amount { font-size: 22px; font-weight: 700; color: #f5576c; }
.package-price .original { font-size: 12px; color: $text-muted; text-decoration: line-through; margin-left: 4px; }
.description-section { margin-top: 32px; }
.description-content p { line-height: 1.8; color: $text-secondary; font-size: 15px; }
.map-section { margin-top: 32px; }
.map-container { height: 300px; background: $bg-light; border-radius: 12px; overflow: hidden; }
.map-address { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 12px; background: $bg-light; border-radius: 8px; color: $text-secondary; font-size: 14px; }
.info-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.info-card { display: flex; align-items: flex-start; gap: 14px; padding: 18px; background: $white; border-radius: 12px; border: 1px solid $border; }
.card-icon { width: 44px; height: 44px; background: linear-gradient(135deg,rgba(245,87,108,0.1),rgba(245,87,108,0.05)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #f5576c; }
.card-content { flex: 1; }
.card-label { font-size: 12px; color: $text-muted; margin-bottom: 4px; }
.card-value { font-size: 14px; font-weight: 500; }
.card-value.phone-value { font-size: 17px; font-weight: 700; color: $text-primary; }
.card-value.price { color: #f5576c; font-size: 18px; font-weight: 700; }
.info-right { position: sticky; top: 80px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
.booking-card { background: $white; border-radius: 16px; padding: 24px; box-shadow: $shadow-md; }
.booking-header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid $border; margin-bottom: 16px; }
.price-label { font-size: 14px; color: $text-muted; margin-bottom: 8px; }
.price-value { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.price-value .currency { font-size: 18px; color: #f5576c; font-weight: 600; }
.price-value .amount { font-size: 42px; font-weight: 800; color: #f5576c; }
.price-value .unit { font-size: 14px; color: $text-muted; }
.order-type-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.order-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: $bg-light; border: 2px solid $border; border-radius: 10px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.order-tab.active { background: rgba(26,95,74,0.08); border-color: $primary; color: $primary; }
.action-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.order-btn { width: 100%; height: 48px; font-size: 16px; border-radius: 24px; background: linear-gradient(135deg,$primary 0%,$primary-light 100%); border: none; }
.collect-btn { width: 100%; border-radius: 24px; }
.collect-btn.collected { color: $accent; border-color: $accent; }
.booking-features { display: flex; justify-content: space-around; }
.feature-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: $text-muted; }
.feature-item .el-icon { font-size: 22px; color: $primary; }
.hours-card { background: $white; border-radius: 16px; padding: 20px; box-shadow: $shadow-sm; }
.hours-card h4 { display: flex; align-items: center; gap: 8px; font-size: 15px; margin: 0 0 16px; color: $text-primary; }
.hours-card h4 .el-icon { color: $primary; }
.hours-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid $border; }
.hours-item:last-child { border-bottom: none; }
.hours-item .day { color: $text-secondary; font-size: 14px; }
.hours-item .time { color: $text-primary; font-weight: 500; font-size: 14px; }
.table-card { background: $white; border-radius: 16px; padding: 20px; box-shadow: $shadow-sm; }
.table-card h4 { display: flex; align-items: center; gap: 8px; font-size: 15px; margin: 0 0 16px; color: $text-primary; }
.table-card h4 .el-icon { color: $primary; }
.table-status { display: flex; justify-content: space-between; align-items: center; }
.table-status .available { font-size: 16px; font-weight: 600; color: $primary; }
.table-status .total { font-size: 13px; color: $text-muted; }
.comments-section { padding: 40px 0; margin-top: 24px; background: $white; }
.section-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title-bar { font-size: 20px; font-weight: 600; color: $text-primary; margin: 0; }
.section-title-bar .comment-count { font-size: 14px; color: $text-muted; font-weight: 400; }
.comment-item { display: flex; gap: 16px; padding: 20px; background: $bg-light; border-radius: 12px; margin-bottom: 16px; }
.comment-body { flex: 1; }
.comment-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.username { font-weight: 600; color: $text-primary; margin-right: 12px; }
.comment-time { font-size: 13px; color: $text-muted; }
.comment-content { line-height: 1.7; color: $text-secondary; margin-bottom: 12px; }
.comment-actions { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.reply-list { margin-top: 12px; padding: 12px; background: $white; border-radius: 10px; border: 1px solid $border; }
.reply-item { display: flex; gap: 10px; padding: 10px 0; }
.reply-item:not(:last-child) { border-bottom: 1px solid $border; }
.reply-body { flex: 1; min-width: 0; }
.reply-tip { color: $text-secondary; margin-bottom: 16px; font-size: 14px; }
.comment-images { display: flex; gap: 10px; }
.comment-img { width: 80px; height: 80px; border-radius: 8px; }
.empty-comments { padding: 60px; }
.comment-dialog .comment-form .rating-select { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.comment-dialog .comment-form .label { font-weight: 500; color: $text-secondary; }
.order-dialog :deep(.el-dialog) { border-radius: 16px; max-width: 800px; }
.order-dialog :deep(.el-dialog__header) { background: linear-gradient(135deg, $primary 0%, $primary-light 100%); border-radius: 16px 16px 0 0; padding: 20px 24px; margin: 0; }
.order-dialog :deep(.el-dialog__title) { color: $white; font-size: 18px; font-weight: 600; }
.order-dialog :deep(.el-dialog__headerbtn .el-dialog__close) { color: rgba(255,255,255,0.8); }
.dialog-content { padding: 24px; }
.dialog-content :deep(.el-steps) { margin-bottom: 28px; }
.step-content { min-height: 320px; }
.package-choose-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; }
.package-choose-item { display: flex; align-items: center; gap: 14px; padding: 16px; background: $bg-light; border: 2px solid $border; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.package-choose-item:hover { border-color: $primary-light; }
.package-choose-item.selected { border-color: $primary; background: rgba(26,95,74,0.04); }
.pkg-radio { flex-shrink: 0; }
.pkg-image { width: 72px; height: 72px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.pkg-image .el-image { width: 100%; height: 100%; }
.pkg-no-image { width: 72px; height: 72px; border-radius: 8px; background: #e8e8e8; display: flex; align-items: center; justify-content: center; font-size: 28px; color: $text-muted; flex-shrink: 0; }
.pkg-info { flex: 1; min-width: 0; }
.pkg-type-row { margin-bottom: 4px; }
.pkg-name { font-size: 15px; font-weight: 600; color: $text-primary; margin-bottom: 4px; }
.pkg-desc { font-size: 12px; color: $text-muted; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pkg-price { text-align: right; flex-shrink: 0; }
.pkg-price .current-price { font-size: 18px; font-weight: 700; color: #f5576c; }
.pkg-price .original-price { font-size: 12px; color: $text-muted; text-decoration: line-through; }
.dinein-form { padding: 8px 0; }
.takeout-form { padding: 8px 0; }
.takeout-remark-form { padding-bottom: 0; }
.address-select-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 14px; padding: 14px 16px; background: #f7fbf9; border: 1px solid #e5ede8; border-radius: 12px; }
.address-select-title { font-size: 16px; font-weight: 700; color: $text-primary; }
.address-select-desc { margin-top: 4px; color: $text-muted; font-size: 13px; line-height: 1.5; }
.delivery-address-list { display: flex; flex-direction: column; gap: 12px; min-height: 160px; max-height: 300px; overflow-y: auto; margin-bottom: 12px; }
.delivery-address-card { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: $bg-light; border: 2px solid $border; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.delivery-address-card:hover { border-color: $primary-light; }
.delivery-address-card.selected { border-color: $primary; background: rgba(26,95,74,0.05); }
.delivery-address-radio { flex-shrink: 0; padding-top: 2px; }
.delivery-address-main { min-width: 0; flex: 1; }
.delivery-address-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; color: $text-primary; }
.delivery-address-head strong { font-size: 15px; }
.delivery-address-head span { color: $text-secondary; font-size: 13px; }
.delivery-address-text { color: $text-primary; font-size: 14px; line-height: 1.6; word-break: break-word; }
.delivery-address-remark { margin-top: 6px; color: #a06a16; font-size: 12px; }
.package-tabs-small { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.pkg-tab-small { padding: 6px 14px; background: $white; border: 1px solid $border; border-radius: 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.pkg-tab-small.active { background: $primary; color: $white; border-color: $primary; }
.order-confirm { background: $bg-light; border-radius: 12px; padding: 20px; }
.confirm-section h4 { display: flex; align-items: center; gap: 8px; font-size: 15px; color: $text-primary; margin: 0 0 16px; }
.confirm-item { display: flex; justify-content: space-between; padding: 8px 0; }
.confirm-item .label { color: $text-muted; }
.confirm-item .value { color: $text-primary; font-weight: 500; }
.confirm-item.total { border-top: 1px dashed $border; padding-top: 16px; margin-top: 8px; }
.confirm-item .value.price { color: #f5576c; font-size: 18px; }
.confirm-total { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; }
.total-label { font-size: 15px; font-weight: 600; }
.total-amount { font-size: 28px; font-weight: 800; color: #f5576c; }
.payment-panel { text-align: center; padding: 40px 20px; }
.success-icon { width: 80px; height: 80px; background: linear-gradient(135deg,rgba(82,196,26,0.1),rgba(82,196,26,0.05)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; color: #52c41a; }
.payment-panel h3 { font-size: 22px; margin: 0 0 8px; }
.payment-panel .order-no { color: $text-muted; margin-bottom: 24px; }
.payment-amount { margin-bottom: 24px; }
.payment-amount .label { display: block; font-size: 14px; color: $text-muted; margin-bottom: 8px; }
.payment-amount .amount { font-size: 42px; font-weight: 700; color: #f5576c; }
.pay-btn { width: 200px; height: 48px; font-size: 16px; border-radius: 24px; background: linear-gradient(135deg,#ff9a56,#ff6b6b); border: none; }
.pay-tip { font-size: 13px; color: $text-muted; margin-top: 12px; }

@media (max-width: 1200px) {
  .info-container { grid-template-columns: 1fr; }
  .info-right { position: static; }
}
@media (max-width: 768px) {
  .header-inner { padding: 14px 20px; }
  .gallery-badges { left: 20px; }
  .info-container { padding: 0 20px; }
  .info-cards { grid-template-columns: 1fr; }
  .merchant-card { grid-template-columns: 56px minmax(0, 1fr); align-items: flex-start; padding: 16px; }
  .merchant-avatar { width: 56px; height: 56px; }
  .merchant-avatar-text { font-size: 22px; }
  .merchant-name { font-size: 16px; }
  .merchant-contact { width: 100%; justify-content: space-between; }
  .food-title { font-size: 26px; }
  .package-grid { grid-template-columns: 1fr; }
  .section-container { padding: 0 20px; }
}
</style>
