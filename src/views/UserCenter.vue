<template>
  <div class="user-center-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <div class="header-actions">
          <el-button v-if="isMerchant || isAdmin" type="primary" @click="goAdmin">
            <el-icon><Setting /></el-icon>
            <span>{{ isMerchant ? '商家中心' : '管理后台' }}</span>
          </el-button>
          <el-button @click="goHome">返回首页</el-button>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="user-profile">
        <div class="profile-header">
          <div class="profile-avatar-wrap">
            <el-avatar :src="userInfo.avatar" :size="100" />
          </div>
          <div class="profile-info">
            <div class="profile-meta-row">
              <h2>{{ userInfo.nickName || userInfo.userName }}</h2>
              <span class="profile-role">{{ profileRoleText }}</span>
            </div>
            <p class="description">{{ userInfo.description || '这个人很懒，什么都没留下' }}</p>
            <div class="stats stats-overview">
              <div class="stat-item stat-item-highlight">
                <div class="stat-value">{{ displayStats.contentCount }}</div>
                <div class="stat-label">内容</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ displayStats.likeCount }}</div>
                <div class="stat-label">获赞</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ displayStats.collectCount }}</div>
                <div class="stat-label">收藏</div>
              </div>
            </div>
          </div>
          <el-button class="profile-edit-button" type="primary" @click="showEditDialog">编辑资料</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="content-tabs">
        <el-tab-pane label="我的内容" name="content">
          <div class="content-grid">
            <div v-for="item in myContents" :key="item.id" class="content-card">
              <div class="card-wrapper" @click="goDetail(item)">
                <el-card :body-style="{ padding: '0px' }" shadow="hover">
                  <div class="card-image">
                    <el-image :src="item.coverImage" fit="cover" style="width: 100%; height: 200px" />
                    <div class="card-status">
                      <el-tag :type="getContentStatusType(item.status)" size="small">
                        {{ getContentStatusText(item.status) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="card-content">
                    <h3 class="title">{{ item.title }}</h3>
                    <div class="stats">
                      <span><el-icon><View /></el-icon> {{ item.viewCount }}</span>
                      <span><el-icon><Star /></el-icon> {{ item.likeCount }}</span>
                      <span><el-icon><Collection /></el-icon> {{ item.collectCount }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
              <div class="card-actions">
                <el-button type="primary" link size="small" @click.stop="editContent(item)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button v-if="item.status === 0" type="success" link size="small" @click.stop="publishContent(item)">
                  <el-icon><Promotion /></el-icon>发布
                </el-button>
                <el-button type="danger" link size="small" @click.stop="deleteContent(item)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="myContents.length === 0" class="empty">
            <el-empty description="还没有发布内容">
              <el-button type="primary" @click="router.push('/publish')">发布内容</el-button>
            </el-empty>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的收藏" name="collection">
          <div class="content-grid">
            <div v-for="item in myCollections" :key="item.id" class="content-card" @click="goDetail(item)">
              <el-card :body-style="{ padding: '0px' }" shadow="hover">
                <div class="card-image">
                  <el-image :src="item.coverImage" fit="cover" style="width: 100%; height: 200px" />
                </div>
                <div class="card-content">
                  <h3 class="title">{{ item.title }}</h3>
                  <div class="stats">
                    <span><el-icon><View /></el-icon> {{ item.viewCount || 0 }}</span>
                    <span><el-icon><Star /></el-icon> {{ item.likeCount || 0 }}</span>
                    <span><el-icon><Collection /></el-icon> {{ item.collectCount || 0 }}</span>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div v-if="myCollections.length === 0" class="empty">
            <el-empty description="还没有收藏内容" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="浏览历史" name="history">
          <div class="history-list">
            <div v-for="item in browseHistory" :key="item.id" class="history-item" @click="goDetail(item)">
              <el-image :src="item.coverImage" fit="cover" style="width: 120px; height: 90px; border-radius: 8px" />
              <div class="history-info">
                <h3 class="title">{{ item.title }}</h3>
                <p class="description">{{ item.description }}</p>
                <div class="history-stats">
                  <span><el-icon><View /></el-icon> {{ item.viewCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon> {{ item.likeCount || 0 }}</span>
                  <span><el-icon><Collection /></el-icon> {{ item.collectCount || 0 }}</span>
                </div>
                <div class="time">{{ formatTime(item.createTime) }}</div>
              </div>
            </div>
          </div>
          <div v-if="browseHistory.length === 0" class="empty">
            <el-empty description="还没有浏览记录" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的订单" name="orders">
          <!-- 订单筛选 - 第一行：订单类型 -->
          <div class="order-filter order-filter-card">
            <div class="filter-label">订单类型</div>
            <el-radio-group class="order-filter-group" v-model="orderTypeFilter" size="small" @change="handleOrderTypeChange">
              <el-radio-button :value="0">全部</el-radio-button>
              <el-radio-button :value="1">景点门票</el-radio-button>
              <el-radio-button :value="2">酒店预订</el-radio-button>
              <el-radio-button :value="3">美食预订</el-radio-button>
            </el-radio-group>
          </div>
          <!-- 订单筛选 - 第二行：订单状态 -->
          <div class="order-filter order-filter-card">
            <div class="filter-label">订单状态</div>
            <el-radio-group class="order-filter-group" v-model="orderStatusFilter" size="small" @change="handleOrderStatusChange">
              <el-radio-button :value="-1">全部状态</el-radio-button>
              <el-radio-button :value="0">待支付</el-radio-button>
              <el-radio-button :value="1">待使用/待发货</el-radio-button>
              <el-radio-button :value="2">已完成</el-radio-button>
              <el-radio-button :value="3">已取消</el-radio-button>
            </el-radio-group>
          </div>
          <div v-loading="orderLoading" class="order-list">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card">
              <div class="order-header">
                <div class="order-left">
                  <div class="order-no">订单号：{{ order.orderNo }}</div>
                  <div class="order-time">{{ order.createTime ? dayjs(order.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</div>
                </div>
                <el-tag :type="getOrderStatusType(order.orderStatus)" size="small">
                  {{ getOrderStatusText(order.orderStatus) }}
                </el-tag>
              </div>
              <div class="order-body" @click="showOrderDetail(order)">
                <div class="order-info">
                  <div class="order-type-badge">
                    <el-tag :type="getOrderTypeBadgeType(order)" size="small" effect="dark">
                      {{ getOrderTypeText(order) }}
                    </el-tag>
                  </div>
                  <!-- 酒店订单显示 -->
                  <div v-if="order.orderType === 2" class="order-detail">
                    <div class="order-title">{{ order.hotelName }}</div>
                    <div class="order-meta">
                      <span><el-icon><Calendar /></el-icon> 入住：{{ order.checkInDate ? dayjs(order.checkInDate).format('MM-DD') : '-' }}</span>
                      <span><el-icon><Calendar /></el-icon> 退房：{{ order.checkOutDate ? dayjs(order.checkOutDate).format('MM-DD') : '-' }}</span>
                    </div>
                    <div class="order-meta">
                      <span><el-icon><User /></el-icon> 入住人：{{ order.guestName || '-' }}</span>
                      <span><el-icon><House /></el-icon> 房间数：{{ order.roomCount || 1 }}</span>
                    </div>
                  </div>
                  <!-- 美食/外卖订单显示 -->
                  <div v-else-if="order.orderType === 3" class="order-detail">
                    <div class="order-title">{{ order.foodName }}</div>
                    <div class="order-meta">
                      <span><el-icon><Calendar /></el-icon> 预订日期：{{ order.bookingDate ? dayjs(order.bookingDate).format('YYYY-MM-DD') : '-' }}</span>
                      <span><el-icon><User /></el-icon> 用餐人数：{{ order.dinerCount || 1 }}人</span>
                    </div>
                    <!-- 外卖配送状态 -->
                    <div v-if="order.deliveryStatus !== null" class="delivery-status">
                      <el-divider direction="vertical" />
                      <el-tag :type="getDeliveryStatusType(order.deliveryStatus)" size="small">
                        {{ getDeliveryStatusText(order.deliveryStatus) }}
                      </el-tag>
                      <span v-if="order.deliveryTime" class="delivery-time">
                        {{ dayjs(order.deliveryTime).format('MM-DD HH:mm') }}
                      </span>
                    </div>
                  </div>
                  <!-- 门票订单显示 -->
                  <div v-else class="order-detail">
                    <div class="order-title">{{ order.ticketName }}</div>
                    <div class="order-meta">
                      <span><el-icon><Calendar /></el-icon> 游玩日期：{{ order.visitDate ? dayjs(order.visitDate).format('YYYY-MM-DD') : '-' }}</span>
                      <span><el-icon><Ticket /></el-icon> 数量：{{ order.ticketCount || 1 }}张</span>
                    </div>
                    <div class="order-meta">
                      <span><el-icon><User /></el-icon> 游客：{{ order.visitorName || '-' }}</span>
                    </div>
                  </div>
                </div>
                <div class="order-price">
                  <span class="price-label">总价</span>
                  <span class="price-value">¥{{ order.totalAmount }}</span>
                </div>
              </div>
              <div class="order-footer">
                <div class="order-left">
                  <span v-if="order.expireTime && order.orderStatus === 0" class="expire-tip">
                    <el-icon><Clock /></el-icon>
                    支付过期时间：{{ dayjs(order.expireTime).format('MM-DD HH:mm') }}
                  </span>
                </div>
                <div class="order-actions">
                  <!-- 待支付订单 - 显示支付按钮 -->
                  <el-button
                    v-if="order.orderStatus === 0"
                    type="warning"
                    size="small"
                    @click.stop="handlePay(order)"
                  >
                    <el-icon><Wallet /></el-icon>
                    立即支付
                  </el-button>
                  <el-button
                    v-if="order.orderStatus === 0"
                    type="info"
                    size="small"
                    plain
                    @click.stop="handleCancel(order)"
                  >
                    取消订单
                  </el-button>
                  <!-- 已支付/待使用订单 - 门票核销 -->
                  <el-button
                    v-if="order.orderStatus === 1 && order.orderType === 1"
                    type="success"
                    size="small"
                    @click.stop="verifyOrder(order.orderNo)"
                  >
                    <el-icon><Ticket /></el-icon>
                    核销
                  </el-button>
                  <!-- 已支付酒店订单 -->
                  <el-button
                    v-if="order.orderStatus === 1 && order.orderType === 2"
                    type="primary"
                    size="small"
                    @click.stop="viewETicket(order)"
                  >
                    <el-icon><Ticket /></el-icon>
                    查看电子票
                  </el-button>
                  <!-- 外卖订单 - 待发货 -->
                  <el-button
                    v-if="order.orderStatus === 1 && order.orderType === 3 && order.deliveryStatus === 0"
                    type="info"
                    size="small"
                    plain
                    disabled
                  >
                    等待发货
                  </el-button>
                  <!-- 外卖订单 - 已发货 -->
                  <el-button
                    v-if="order.orderStatus === 1 && order.orderType === 3 && order.deliveryStatus === 1"
                    type="success"
                    size="small"
                    @click.stop="handleReceive(order)"
                  >
                    <el-icon><Box /></el-icon>
                    确认收货
                  </el-button>
                  <!-- 外卖订单 - 已收货 -->
                  <el-tag v-if="order.orderStatus === 1 && order.orderType === 3 && order.deliveryStatus === 2" type="success" size="small">
                    已完成
                  </el-tag>
                  <!-- 已使用/已取消/已退款 - 显示查看详情 -->
                  <el-button
                    v-if="order.orderStatus === 2 || order.orderStatus === 3 || order.orderStatus === 4"
                    type="primary"
                    size="small"
                    plain
                    @click.stop="viewETicket(order)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="filteredOrders.length === 0 && !orderLoading" class="empty">
            <el-empty :description="orderFilter === 0 ? '还没有订单' : '该分类下暂无订单'">
              <el-button v-if="orderFilter === 0" type="primary" @click="router.push('/')">去选购</el-button>
            </el-empty>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账号设置" name="settings">
          <div v-if="!isMerchant && !isAdmin" class="merchant-apply-card">
            <div class="merchant-apply-card__content">
              <div>
                <div class="merchant-apply-card__title">商家认证</div>
                <div class="merchant-apply-card__desc">{{ merchantApplyDescription }}</div>
              </div>
              <div class="merchant-apply-card__actions">
                <el-tag :type="merchantApplyTagType">{{ merchantApplyStatusText }}</el-tag>
                <el-button type="primary" @click="openMerchantApplyDialog">
                  {{ merchantApplyButtonText }}
                </el-button>
              </div>
            </div>
            <div v-if="userInfo.merchantAuditComment" class="merchant-apply-card__comment">
              审核意见：{{ userInfo.merchantAuditComment }}
            </div>
          </div>
          <el-form :model="settingsForm" label-width="100px" class="settings-form">
            <el-form-item label="用户名">
              <el-input v-model="settingsForm.userName" disabled />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="settingsForm.nickName" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="settingsForm.email" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="settingsForm.phoneNumber" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="settingsForm.sex">
                <el-radio :label="0">保密</el-radio>
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="settingsForm.description" type="textarea" :rows="4" placeholder="介绍一下自己吧" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateUserInfo">保存修改</el-button>
              <el-button @click="showPasswordDialog">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="/api/file/upload?directory=avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <el-avatar v-if="editForm.avatar" :src="editForm.avatar" :size="100" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickName" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="merchantApplyDialogVisible" title="申请成为商家" width="620px">
      <el-form :model="merchantApplyForm" label-width="96px">
        <el-form-item label="商家名称">
          <el-input v-model="merchantApplyForm.merchantName" placeholder="请输入商家或店铺名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="merchantApplyForm.merchantContactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="merchantApplyForm.merchantContactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="商家地址">
          <el-input v-model="merchantApplyForm.merchantAddress" placeholder="请输入经营地址" />
        </el-form-item>
        <el-form-item label="经营类目">
          <el-select v-model="merchantApplyForm.merchantCategory" placeholder="请选择经营类目" style="width: 100%">
            <el-option label="酒店住宿" value="酒店住宿" />
            <el-option label="美食餐饮" value="美食餐饮" />
            <el-option label="景区景点" value="景区景点" />
            <el-option label="综合文旅" value="综合文旅" />
          </el-select>
        </el-form-item>
        <el-form-item label="资质图片">
          <el-upload
            action="/api/file/upload?directory=merchant"
            :show-file-list="false"
            :on-success="handleMerchantLicenseSuccess"
          >
            <el-image
              v-if="merchantApplyForm.merchantLicenseImage"
              :src="merchantApplyForm.merchantLicenseImage"
              fit="cover"
              class="merchant-license-preview"
            />
            <div v-else class="merchant-license-uploader">
              <el-icon><Plus /></el-icon>
              <span>上传营业执照/资质图</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input
            v-model="merchantApplyForm.merchantApplyRemark"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="可补充主营业务、服务特色、审核说明等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="merchantApplyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMerchantApplication">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 编辑内容对话框 -->
    <el-dialog v-model="contentEditDialogVisible" title="编辑内容" width="800px" destroy-on-close>
      <el-form :model="editingContent" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editingContent.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="editingContent.content" type="textarea" :rows="8" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="editingContent.summary" type="textarea" :rows="2" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="editingContent.region" placeholder="请输入地区" />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="editingContent.theme" placeholder="请输入主题" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="editingContent.location" placeholder="请输入位置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contentEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveContentEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 支付对话框 -->
    <el-dialog v-model="payDialogVisible" title="订单支付" width="420px" destroy-on-close :close-on-click-modal="false">
      <div class="pay-dialog-content">
        <div class="pay-order-info">
          <div class="pay-order-title">{{ payingOrder?.ticketName || payingOrder?.hotelName || payingOrder?.foodName || '订单支付' }}</div>
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

    <!-- 订单详情对话框 -->
    <el-dialog v-model="orderDetailDialogVisible" title="订单详情" width="600px" destroy-on-close>
      <div v-if="detailOrder" class="order-detail-content">
        <div class="detail-section">
          <div class="detail-header">
            <el-tag :type="getOrderStatusType(detailOrder.orderStatus)" size="large">
              {{ getOrderStatusText(detailOrder.orderStatus) }}
            </el-tag>
            <span class="detail-order-no">{{ detailOrder.orderNo }}</span>
          </div>
        </div>

        <el-divider content-position="left">订单信息</el-divider>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">订单类型</span>
            <span class="value">{{ getOrderTypeText(detailOrder) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">总价</span>
            <span class="value price">¥{{ detailOrder.totalAmount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间</span>
            <span class="value">{{ detailOrder.createTime ? dayjs(detailOrder.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</span>
          </div>
          <div class="detail-item" v-if="detailOrder.payTime">
            <span class="label">支付时间</span>
            <span class="value">{{ dayjs(detailOrder.payTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </div>
        </div>

        <!-- 门票订单详情 -->
        <template v-if="detailOrder.orderType === 1">
          <el-divider content-position="left">门票信息</el-divider>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">门票名称</span>
              <span class="value">{{ detailOrder.ticketName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">游玩日期</span>
              <span class="value">{{ detailOrder.visitDate ? dayjs(detailOrder.visitDate).format('YYYY-MM-DD') : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">购买数量</span>
              <span class="value">{{ detailOrder.ticketCount || 1 }}张</span>
            </div>
            <div class="detail-item">
              <span class="label">单价</span>
              <span class="value">¥{{ detailOrder.unitPrice }}</span>
            </div>
            <div class="detail-item">
              <span class="label">游客姓名</span>
              <span class="value">{{ detailOrder.visitorName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">联系电话</span>
              <span class="value">{{ detailOrder.visitorPhone || '-' }}</span>
            </div>
            <div class="detail-item full-width" v-if="detailOrder.specialRequest">
              <span class="label">特殊需求</span>
              <span class="value">{{ detailOrder.specialRequest }}</span>
            </div>
          </div>
        </template>

        <!-- 酒店订单详情 -->
        <template v-else-if="detailOrder.orderType === 2">
          <el-divider content-position="left">酒店信息</el-divider>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">酒店名称</span>
              <span class="value">{{ detailOrder.hotelName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">入住日期</span>
              <span class="value">{{ detailOrder.checkInDate ? dayjs(detailOrder.checkInDate).format('YYYY-MM-DD') : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">退房日期</span>
              <span class="value">{{ detailOrder.checkOutDate ? dayjs(detailOrder.checkOutDate).format('YYYY-MM-DD') : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">房间数量</span>
              <span class="value">{{ detailOrder.roomCount || 1 }}间</span>
            </div>
            <div class="detail-item">
              <span class="label">入住人</span>
              <span class="value">{{ detailOrder.guestName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">联系电话</span>
              <span class="value">{{ detailOrder.guestPhone || '-' }}</span>
            </div>
          </div>
        </template>

        <!-- 美食订单详情 -->
        <template v-else-if="detailOrder.orderType === 3">
          <el-divider content-position="left">美食信息</el-divider>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">餐厅名称</span>
              <span class="value">{{ detailOrder.foodName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预订日期</span>
              <span class="value">{{ detailOrder.bookingDate ? dayjs(detailOrder.bookingDate).format('YYYY-MM-DD') : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用餐时间</span>
              <span class="value">{{ detailOrder.mealTime || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">用餐人数</span>
              <span class="value">{{ detailOrder.dinerCount || 1 }}人</span>
            </div>
            <div class="detail-item">
              <span class="label">桌号</span>
              <span class="value">{{ detailOrder.tableNumber || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">联系人</span>
              <span class="value">{{ detailOrder.guestName || detailOrder.visitorName || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">联系电话</span>
              <span class="value">{{ detailOrder.guestPhone || detailOrder.visitorPhone || '-' }}</span>
            </div>
          </div>
          <!-- 外卖配送信息 -->
          <template v-if="detailOrder.deliveryStatus !== null">
            <el-divider content-position="left">配送信息</el-divider>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">配送状态</span>
                <el-tag :type="getDeliveryStatusType(detailOrder.deliveryStatus)" size="small">
                  {{ getDeliveryStatusText(detailOrder.deliveryStatus) }}
                </el-tag>
              </div>
              <div class="detail-item" v-if="detailOrder.deliveryTime">
                <span class="label">发货时间</span>
                <span class="value">{{ dayjs(detailOrder.deliveryTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
              <div class="detail-item" v-if="detailOrder.receiveTime">
                <span class="label">收货时间</span>
                <span class="value">{{ dayjs(detailOrder.receiveTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
            </div>
          </template>
        </template>

        <!-- 核销信息 -->
        <template v-if="detailOrder.verifyStatus === 1">
          <el-divider content-position="left">核销信息</el-divider>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">核销状态</span>
              <el-tag type="success" size="small">已核销</el-tag>
            </div>
            <div class="detail-item" v-if="detailOrder.verifyTime">
              <span class="label">核销时间</span>
              <span class="value">{{ dayjs(detailOrder.verifyTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="orderDetailDialogVisible = false">关闭</el-button>
        <el-button v-if="detailOrder?.orderStatus === 1" type="primary" @click="viewETicket(detailOrder)">
          查看电子票
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, Plus, Setting, Edit, Delete, Collection, Promotion, Shop, Calendar, User, House, Ticket, Wallet, Box, Clock, Picture } from '@element-plus/icons-vue'
import request from '@/util/request'
import dayjs from 'dayjs'
import { formatDateTime } from '@/utils/date'

const router = useRouter()

const activeTab = ref('content')
const userInfo = ref<any>({})
const stats = ref({ contentCount: 0, likeCount: 0, collectCount: 0, collectionCount: 0 })
const myContents = ref<any[]>([])
const myCollections = ref<any[]>([])
const browseHistory = ref<any[]>([])
const myOrders = ref<any[]>([])
const orderLoading = ref(false)
const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const contentEditDialogVisible = ref(false)
const merchantApplyDialogVisible = ref(false)

// 订单相关
const orderTypeFilter = ref(0) // 0-全部 1-景点门票 2-酒店 3-美食
const orderStatusFilter = ref(-1) // -1-全部 0-待支付 1-待使用/待发货 2-已完成 3-已取消
const orderFilter = orderTypeFilter
const payDialogVisible = ref(false)
const orderDetailDialogVisible = ref(false)
const payingOrder = ref<any>(null)
const detailOrder = ref<any>(null)
const payQrCodeUrl = ref('')
const isGeneratingQrCode = ref(false)
const isPollingPay = ref(false)
const payPollProgress = ref(0)
const payStatusMessage = ref('')
const payStatusSuccess = ref(false)
const paySuccess = ref(false)
let payPollingTimer: any = null

// 编辑中的内容
const editingContent = ref<any>({
  id: 0,
  title: '',
  summary: '',
  region: '',
  theme: '',
  location: ''
})

// 判断是否为管理员
const isAdmin = computed(() => userInfo.value.userType === 4)

// 判断是否为商家
const isMerchant = computed(() => userInfo.value.userType === 2)

// 订单筛选
const displayStats = computed(() => ({
  contentCount: Number(stats.value.contentCount || 0),
  likeCount: Number(stats.value.likeCount || 0),
  collectCount: Number(stats.value.collectCount ?? stats.value.collectionCount ?? 0)
}))

const profileRoleText = computed(() => {
  if (isAdmin.value) return 'ADMIN'
  if (isMerchant.value) return 'MERCHANT'
  return 'TRAVELER'
})

/*
const merchantApplyStatusText = computed(() => {
  switch (userInfo.value.merchantApplyStatus) {
    case 1:
      return '待审核'
    case 2:
      return '已通过'
    case 3:
      return '已驳回'
    default:
      return '未申请'
  }
})

const merchantApplyTagType = computed(() => {
  switch (userInfo.value.merchantApplyStatus) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
})

const merchantApplyDescription = computed(() => {
  switch (userInfo.value.merchantApplyStatus) {
    case 1:
      return '申请资料已提交，正在等待管理员审核。'
    case 2:
      return '您的商家认证已经通过，重新登录后即可进入商家中心。'
    case 3:
      return '申请已被驳回，您可以根据审核意见修改资料后重新提交。'
    default:
      return '提交商家资料后，审核通过即可发布酒店、美食和景点资源。'
  }
})

const merchantApplyButtonText = computed(() => {
  if (userInfo.value.merchantApplyStatus === 1) return '查看申请'
  if (userInfo.value.merchantApplyStatus === 3) return '重新申请'
  return '立即申请'
})

*/

const merchantApplyStatusText = computed(() => {
  switch (userInfo.value.merchantApplyStatus) {
    case 1:
      return 'Pending'
    case 2:
      return 'Approved'
    case 3:
      return 'Rejected'
    default:
      return 'Not Applied'
  }
})

const merchantApplyTagType = computed(() => {
  switch (userInfo.value.merchantApplyStatus) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
})

const merchantApplyDescription = computed(() => {
  switch (userInfo.value.merchantApplyStatus) {
    case 1:
      return 'Application submitted. Waiting for admin review.'
    case 2:
      return 'Approved. Please sign in again to enter the merchant center.'
    case 3:
      return 'Rejected. You can revise the information and submit again.'
    default:
      return 'Submit merchant information to unlock merchant publishing features.'
  }
})

const merchantApplyButtonText = computed(() => {
  if (userInfo.value.merchantApplyStatus === 1) return 'View'
  if (userInfo.value.merchantApplyStatus === 3) return 'Retry'
  return 'Apply'
})

const filteredOrders = computed(() => {
  let orders = myOrders.value

  // 按订单类型筛选
  if (orderTypeFilter.value !== 0) {
    orders = orders.filter(o => o.orderType === orderTypeFilter.value)
  }

  // 按订单状态筛选
  if (orderStatusFilter.value !== -1) {
    if (orderStatusFilter.value === 0) {
      // 待支付
      orders = orders.filter(o => o.orderStatus === 0)
    } else if (orderStatusFilter.value === 1) {
      // 待使用/待发货
      orders = orders.filter(o =>
        (o.orderStatus === 1 && (o.orderType === 1 || o.orderType === 2)) ||
        (o.orderStatus === 1 && o.orderType === 3 && (o.deliveryStatus === 0 || o.deliveryStatus === null))
      )
    } else if (orderStatusFilter.value === 2) {
      // 已完成
      orders = orders.filter(o =>
        o.orderStatus === 2 ||
        (o.orderStatus === 1 && o.orderType === 3 && o.deliveryStatus === 2)
      )
    } else if (orderStatusFilter.value === 3) {
      // 已取消
      orders = orders.filter(o => o.orderStatus === 3 || o.orderStatus === 4)
    }
  }

  return orders
})

// 处理订单类型筛选变化
const handleOrderTypeChange = () => {
  // 筛选变化时不需要额外处理，computed会自动更新
}

// 处理订单状态筛选变化
const handleOrderStatusChange = () => {
  // 筛选变化时不需要额外处理，computed会自动更新
}

const settingsForm = reactive({
  userName: '',
  nickName: '',
  email: '',
  phoneNumber: '',
  sex: 0,
  description: ''
})

const editForm = reactive({
  avatar: '',
  nickName: '',
  description: ''
})

const merchantApplyForm = reactive({
  merchantName: '',
  merchantContactName: '',
  merchantContactPhone: '',
  merchantAddress: '',
  merchantCategory: '',
  merchantLicenseImage: '',
  merchantApplyRemark: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordFormRef = ref()

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res: any = await request.get('/user/info')
    if (res.code === 200) {
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      Object.assign(settingsForm, res.data)
      Object.assign(editForm, {
        avatar: res.data.avatar,
        nickName: res.data.nickName,
        description: res.data.description
      })
      Object.assign(merchantApplyForm, {
        merchantName: res.data.merchantName || '',
        merchantContactName: res.data.merchantContactName || '',
        merchantContactPhone: res.data.merchantContactPhone || '',
        merchantAddress: res.data.merchantAddress || '',
        merchantCategory: res.data.merchantCategory || '',
        merchantLicenseImage: res.data.merchantLicenseImage || '',
        merchantApplyRemark: res.data.merchantApplyRemark || ''
      })
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res: any = await request.get('/user/stats')
    if (res && res.data) {
      stats.value = {
        contentCount: Number(res.data.contentCount || 0),
        likeCount: Number(res.data.likeCount || 0),
        collectCount: Number(res.data.collectCount ?? res.data.collectionCount ?? 0),
        collectionCount: Number(res.data.collectionCount ?? res.data.collectCount ?? 0)
      }
    }
  } catch (error) {
    // 请求拦截器已经处理了错误提示，这里只需要静默处理
    console.error('加载统计数据失败', error)
    // 设置默认值，避免页面显示异常
    stats.value = { contentCount: 0, likeCount: 0, collectCount: 0, collectionCount: 0 }
  }
}

// 加载我的内容
const loadMyContents = async () => {
  try {
    const res: any = await request.get('/content/my-list')
    if (res && res.code === 200 && res.data) {
      myContents.value = res.data.list || res.data || []
    }
  } catch (error) {
    // 请求拦截器已经处理了错误提示，这里只需要静默处理
    console.error('加载内容失败', error)
    myContents.value = []
  }
}

// 加载我的收藏
const loadMyCollections = async () => {
  try {
    const res: any = await request.get('/collection/my-list')
    if (res && res.code === 200 && res.data) {
      myCollections.value = res.data.list || res.data || []
    }
  } catch (error) {
    // 请求拦截器已经处理了错误提示，这里只需要静默处理
    console.error('加载收藏失败', error)
    myCollections.value = []
  }
}

// 加载浏览历史
const loadBrowseHistory = async () => {
  try {
    const res: any = await request.get('/browse-history/list')
    if (res && res.code === 200 && res.data) {
      browseHistory.value = res.data.list || res.data || []
    }
  } catch (error) {
    // 请求拦截器已经处理了错误提示，这里只需要静默处理
    console.error('加载历史失败', error)
    browseHistory.value = []
  }
}

// 加载我的订单
const loadMyOrders = async () => {
  orderLoading.value = true
  try {
    const res: any = await request.get('/order/list', {
      params: { pageNum: 1, pageSize: 50 }
    })
    if (res && res.code === 200 && res.data) {
      myOrders.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载订单失败', error)
    myOrders.value = []
  } finally {
    orderLoading.value = false
  }
}

// 核销订单
const verifyOrder = async (orderNo: string) => {
  try {
    const res: any = await request.post(`/order/verify/${orderNo}`)
    if (res && res.code === 200) {
      ElMessage.success('核销成功')
      loadMyOrders()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '核销失败')
  }
}

// 支付订单
const handlePay = async (order: any) => {
  payingOrder.value = order
  payDialogVisible.value = true
  payStatusMessage.value = ''
  payStatusSuccess.value = false
  payQrCodeUrl.value = ''
  payPollProgress.value = 0
  paySuccess.value = false

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

      // 开始轮询支付状态
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

    // 最多轮询60次（5分钟）
    if (pollCount >= 60) {
      stopPayPolling()
      payStatusMessage.value = '支付超时，请重新发起支付'
      payStatusSuccess.value = false
      return
    }

    // 更新进度条
    payPollProgress.value = Math.min((pollCount / 60) * 100, 95)

    try {
      const res: any = await request.get(`/order/pay/status/${orderNo}`)
      if (res && res.code === 200 && res.data) {
        if (res.data.paid || res.data.orderStatus === 1) {
          // 支付成功
          stopPayPolling()
          payPollProgress.value = 100
          payStatusMessage.value = '支付成功！'
          payStatusSuccess.value = true
          paySuccess.value = true

          // 刷新订单列表
          setTimeout(() => {
            loadMyOrders()
            closePayDialog()
          }, 1500)
        }
      }
    } catch (error) {
      console.error('轮询支付状态失败', error)
    }
  }, 3000) // 每3秒轮询一次
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

// 取消订单
const handleCancel = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该订单吗？取消后无法恢复。',
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '再想想',
        type: 'warning'
      }
    )

    const res: any = await request.post(`/order/cancel/${order.orderNo}`)
    if (res && res.code === 200) {
      ElMessage.success('订单已取消')
      loadMyOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消订单失败')
    }
  }
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
      loadMyOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认收货失败')
    }
  }
}

// 显示订单详情
const showOrderDetail = (order: any) => {
  detailOrder.value = order
  orderDetailDialogVisible.value = true
}

// 查看电子票
const viewETicket = (order: any) => {
  router.push(`/eticket/${order.orderNo}`)
}

// 获取订单类型文本
const getOrderTypeText = (order: any) => {
  if (order.orderType === 1) {
    return '门票'
  } else if (order.orderType === 2) {
    return '酒店'
  } else if (order.orderType === 3) {
    // 根据deliveryStatus判断是预订还是外卖
    if (order.deliveryStatus !== null && order.deliveryStatus !== undefined) {
      return '外卖'
    }
    return '美食预订'
  }
  return order.hotelId ? '酒店预订' : '门票购买'
}

// 获取订单类型徽章类型
const getOrderTypeBadgeType = (order: any) => {
  if (order.orderType === 1) return 'primary'
  if (order.orderType === 2) return 'warning'
  if (order.orderType === 3) {
    if (order.deliveryStatus !== null && order.deliveryStatus !== undefined) {
      return 'danger'
    }
    return 'success'
  }
  return 'info'
}

// 获取配送状态文本
const getDeliveryStatusText = (status: number) => {
  const statusMap: any = {
    0: '待发货',
    1: '已发货',
    2: '已收货',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取配送状态类型
const getDeliveryStatusType = (status: number) => {
  const typeMap: any = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
  const statusMap: any = {
    0: '待支付',
    1: '已支付',
    2: '已使用',
    3: '已取消',
    4: '已退款'
  }
  return statusMap[status] || '未知'
}

// 获取订单状态类型
const getOrderStatusType = (status: number) => {
  const typeMap: any = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger',
    4: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取内容状态文本
const getContentStatusText = (status: number) => {
  const statusMap: any = {
    0: '草稿',
    1: '待审核',
    2: '已发布',
    3: '已下架'
  }
  return statusMap[status] || '未知'
}

// 获取内容状态类型
const getContentStatusType = (status: number) => {
  const typeMap: any = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 编辑内容 - 先查询详情再回显
const editContent = async (item: any) => {
  try {
    // 先调用后端接口获取内容详情
    const res: any = await request.get(`/content/${item.id}`)
    if (res.code === 200 && res.data) {
      const content = res.data
      // 使用 Object.assign 确保响应式更新
      Object.assign(editingContent.value, {
        id: content.id,
        title: content.title || '',
        summary: content.summary || '',
        region: content.region || '',
        theme: content.theme || '',
        location: content.location || '',
        content: content.content || '',
        images: content.images || '',
        coverImage: content.coverImage || '',
        videoUrl: content.videoUrl || '',
        contentType: content.contentType || 1
      })
      contentEditDialogVisible.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取内容详情失败')
  }
}

// 保存内容编辑
const saveContentEdit = async () => {
  try {
    const res: any = await request.put('/content/update', editingContent.value)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      contentEditDialogVisible.value = false
      loadMyContents()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 删除内容
const deleteContent = async (item: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除内容"${item.title}"吗？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res: any = await request.delete(`/content/delete/${item.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadMyContents()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 发布内容（从草稿发布）
const publishContent = async (item: any) => {
  try {
    const res: any = await request.put('/content/update', {
      id: item.id,
      status: 1
    })
    if (res.code === 200) {
      ElMessage.success('已提交审核')
      loadMyContents()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '发布失败')
  }
}

// 显示编辑对话框
const showEditDialog = () => {
  editDialogVisible.value = true
}

// 头像上传成功
const handleAvatarSuccess = (response: any) => {
  if (response.code === 200) {
    editForm.avatar = response.data.url
    ElMessage.success('上传成功')
  }
}

const handleMerchantLicenseSuccess = (response: any) => {
  if (response.code === 200) {
    merchantApplyForm.merchantLicenseImage = response.data.url
    ElMessage.success('资质图片上传成功')
  }
}

const openMerchantApplyDialog = () => {
  merchantApplyDialogVisible.value = true
}

// 保存资料
const saveProfile = async () => {
  try {
    const res: any = await request.put('/user/update', editForm)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      loadUserInfo()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 更新用户信息
const updateUserInfo = async () => {
  try {
    const res: any = await request.put('/user/update', settingsForm)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      loadUserInfo()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

const submitMerchantApplication = async () => {
  if (!merchantApplyForm.merchantName.trim()) {
    ElMessage.warning('请输入商家名称')
    return
  }
  if (!merchantApplyForm.merchantContactName.trim()) {
    ElMessage.warning('请输入联系人')
    return
  }
  if (!merchantApplyForm.merchantContactPhone.trim()) {
    ElMessage.warning('请输入联系电话')
    return
  }
  if (!merchantApplyForm.merchantAddress.trim()) {
    ElMessage.warning('请输入商家地址')
    return
  }
  if (!merchantApplyForm.merchantCategory) {
    ElMessage.warning('请选择经营类目')
    return
  }
  if (!merchantApplyForm.merchantLicenseImage) {
    ElMessage.warning('请上传资质图片')
    return
  }

  try {
    const res: any = await request.post('/user/merchant/apply', merchantApplyForm)
    if (res.code === 200) {
      ElMessage.success('申请已提交，请等待管理员审核')
      merchantApplyDialogVisible.value = false
      await loadUserInfo()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交申请失败')
  }
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordDialogVisible.value = true
}

// 修改密码
const changePassword = async () => {
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const res: any = await request.post('/user/change-password', passwordForm)
        if (res.code === 200) {
          ElMessage.success('密码修改成功')
          passwordDialogVisible.value = false
          passwordForm.oldPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
        }
      } catch (error: any) {
        ElMessage.error(error.message || '修改失败')
      }
    }
  })
}

// 格式化时间
const formatTime = (time: string) => {
  return formatDateTime(time)
}

const goHome = () => router.push('/')

// 跳转商家发布页面
const goMerchantPublish = () => router.push('/merchant/publish')

// 跳转详情 - 根据dataType跳转到不同的详情页
const goDetail = (item: any) => {
  const id = item.id || item.contentId
  const dataType = item.dataType
  if (dataType === 1) {
    router.push(`/content/${id}`)
  } else if (dataType === 2) {
    router.push(`/attraction/${id}`)
  } else if (dataType === 3) {
    router.push(`/food/${id}`)
  } else if (dataType === 4) {
    router.push(`/hotel/${id}`)
  } else {
    router.push(`/content/${id}`)
  }
}
const goAdmin = () => router.push('/admin')

onMounted(() => {
  loadUserInfo()
  loadStats()
  loadMyContents()
  loadMyCollections()
  loadBrowseHistory()
  loadMyOrders()
})

onUnmounted(() => {
  // 清理支付轮询定时器
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
  }
})
</script>

<style scoped lang="scss">
.user-center-container {
  min-height: 100vh;
  background: #f5f7f4;
}

.header {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e7ece6;
  padding: 0;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 100%;

    .logo h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #1f513f;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '🏝️';
        -webkit-text-fill-color: initial;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;

      .el-button {
        border-radius: 999px;
        padding: 10px 18px;
        border-color: #d7dfd7;
        color: #355f50;
        background: #fff;
      }
    }
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.user-profile {
  background: #fff;
  border: 1px solid #e7ece6;
  border-radius: 20px;
  padding: 32px 32px 28px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  box-sizing: border-box;

  .profile-header {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 24px;
    row-gap: 16px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    outline: none !important;
    background: transparent !important;
    box-shadow: none !important;
    min-height: 0;

    .profile-avatar-wrap {
      width: 96px;
      height: 96px;
      padding: 0;
      border-radius: 999px;
      background: transparent;
      border: none;
      box-shadow: none;

      :deep(.el-avatar) {
        border: 2px solid #ffffff;
        border-radius: 999px;
        width: 100% !important;
        height: 100% !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
      }
    }

    .profile-info {
      min-width: 0;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;

      .profile-meta-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 8px;
        padding-top: 4px;
      }

      h2 {
        margin: 0;
        font-size: 30px;
        font-weight: 700;
        color: #18281f;
        line-height: 1.25;
        white-space: normal;
        word-break: break-word;
      }

      .profile-role {
        display: inline-flex;
        align-items: center;
        height: 30px;
        padding: 0 12px;
        border-radius: 999px;
        background: #f1f4f0;
        color: #51655a;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.12em;
      }

      .description {
        max-width: none;
        margin: 0 0 16px 0;
        color: #66756d;
        font-size: 14px;
        line-height: 1.65;
      }

      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .stat-item {
          min-width: 112px;
          padding: 14px 16px;
          border-radius: 16px;
          background: #f7f8f6;
          border: 1px solid #e9eeea;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #1f513f;
          }

          .stat-label {
            font-size: 13px;
            color: #6d7d74;
            margin-top: 6px;
          }
        }

        .stat-item-highlight {
          background: #f1f5f2;
          border-color: #dfe8e1;
        }
      }

      .stats-overview {
        .stat-item {
          text-align: left;
        }
      }
    }

    .profile-edit-button {
      justify-self: end;
      align-self: start;
      border-radius: 999px;
      padding: 11px 20px;
      background: #1f513f;
      border-color: #1f513f;
      box-shadow: none;
    }
  }
}

.content-tabs {
  background: #fff;
  border: 1px solid #e7ece6;
  border-radius: 20px;
  padding: 20px 24px 24px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      background-color: #edf1ec;
    }
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
    padding: 0 20px;
    color: #718178;

    &.is-active {
      color: #1f513f;
    }
  }

  :deep(.el-tabs__active-bar) {
    background: #1f513f;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;

  .content-card {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-3px);
    }

    .card-wrapper {
      cursor: pointer;
    }

    :deep(.el-card) {
      overflow: hidden;
      border: 1px solid rgba(15, 23, 42, 0.07);
      border-radius: 20px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    }

    .card-image {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 64px;
        background: linear-gradient(180deg, rgba(10, 21, 17, 0) 0%, rgba(10, 21, 17, 0.34) 100%);
      }
      
      .card-status {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
      }
    }

    .card-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 12px 14px 14px;
      background: #fcfcfb;
      border-top: 1px solid #eef1ec;
    }

    .card-content {
      padding: 16px 16px 18px;

      .title {
        font-size: 15px;
        line-height: 1.5;
        margin: 0 0 12px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #18372d;
      }

      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;
        color: #6a7c73;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #f3f5f2;
        }
      }
    }
  }
}

.history-list {
  .history-item {
    display: flex;
    gap: 16px;
    padding: 18px;
    background: #fcfcfb;
    border: 1px solid rgba(15, 23, 42, 0.06);
    border-radius: 20px;
    margin-bottom: 14px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(31, 81, 63, 0.16);
    }

    .history-info {
      flex: 1;

      .title {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 8px 0;
      }

      .description {
        font-size: 14px;
        color: #666;
        margin: 0 0 8px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .history-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
        font-size: 12px;
        color: #6a7c73;

        span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #f3f5f2;
        }
      }

      .time {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.settings-form {
  max-width: 600px;
}

.merchant-apply-card {
  margin-bottom: 20px;
  padding: 20px 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(31, 81, 63, 0.08), rgba(223, 191, 131, 0.12));
  border: 1px solid rgba(31, 81, 63, 0.1);
}

.merchant-apply-card__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.merchant-apply-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #173a2d;
}

.merchant-apply-card__desc {
  margin-top: 8px;
  color: #5d6d65;
  line-height: 1.7;
}

.merchant-apply-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.merchant-apply-card__comment {
  margin-top: 14px;
  color: #7a4e18;
  line-height: 1.7;
}

.empty {
  padding: 60px 0;
  text-align: center;
}

// 订单列表样式
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-filter {
  margin-bottom: 18px;
}

.order-filter-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  background: #fcfcfb;
  border: 1px solid #ebeeea;
  border-radius: 18px;
  box-shadow: none;
}

.filter-label {
  flex: 0 0 auto;
  min-width: 72px;
  font-size: 13px;
  font-weight: 700;
  color: #4f6157;
  letter-spacing: 0.08em;
}

.order-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.el-radio-button__original-radio) {
    display: none;
  }

  :deep(.el-radio-button__inner) {
    min-width: 88px;
    height: 36px;
    padding: 0 16px;
    border: 1px solid #dfe5df !important;
    border-radius: 999px !important;
    background: #fff;
    color: #5d6d65;
    font-size: 13px;
    font-weight: 600;
    line-height: 34px;
    box-shadow: none !important;
    transition: all 0.22s ease;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner),
  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 999px !important;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    border-color: #1f513f !important;
    background: #1f513f;
    color: #fff;
    box-shadow: none;
  }

  :deep(.el-radio-button:hover .el-radio-button__inner) {
    border-color: #97aa9f !important;
    color: #1f513f;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover) {
    color: #fff;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px 12px 28px;
  }

  .user-profile {
    padding: 24px 16px 20px;
  }

  .user-profile .profile-header {
    grid-template-columns: 1fr;
    align-items: start;
    width: 100%;
  }

  .user-profile .profile-header .profile-edit-button {
    justify-self: start;
  }

  .user-profile .profile-header .profile-info .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-tabs {
    padding: 16px;
  }

  .history-list .history-item {
    flex-direction: column;
  }

  .history-list .history-item :deep(.el-image) {
    width: 100% !important;
    height: 180px !important;
  }

  .order-filter-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-label {
    min-width: auto;
  }

  .order-filter-group {
    width: 100%;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .order-card .order-body,
  .order-card .order-footer,
  .header .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-card .order-body .order-price {
    border-left: none;
    border-top: 1px solid #e8ece7;
    padding-left: 0;
    padding-top: 12px;
    margin-top: 12px;
    text-align: left;
  }

  .header {
    height: auto;
  }

  .header .header-content {
    gap: 12px;
    padding: 12px 16px;
  }
}

.order-card {
  background: #fff;
  border: 1px solid #edf0ec;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: rgba(31, 81, 63, 0.16);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 16px;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 16px;

    .order-left {
      .order-no {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .order-time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .order-body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding: 12px;
    background: #fafafa;
    border-radius: 14px;

    &:hover {
      background: #f5f5f5;
    }

    .order-info {
      flex: 1;

      .order-type-badge {
        margin-bottom: 10px;
      }

      .order-detail {
        .order-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .order-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #666;
          margin-top: 6px;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .delivery-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;

          .delivery-time {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }

    .order-price {
      text-align: right;
      padding-left: 20px;
      border-left: 1px solid #e0e0e0;
      min-width: 100px;

      .price-label {
        display: block;
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .price-value {
        display: block;
        font-size: 22px;
        font-weight: 700;
        color: #ff6b6b;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;

    .order-left {
      .expire-tip {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #e6a23c;
      }
    }

    .order-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  }
}

.avatar-uploader {
  .el-avatar {
    cursor: pointer;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
    }
  }
}

.merchant-license-uploader {
  width: 220px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  border: 1px dashed #cbd5cf;
  background: #fafcfb;
  color: #6c7c74;
  cursor: pointer;
}

.merchant-license-preview {
  width: 220px;
  height: 140px;
  border-radius: 16px;
  border: 1px solid #e5ebe6;
  overflow: hidden;
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

// 订单详情对话框样式
.order-detail-content {
  .detail-section {
    margin-bottom: 16px;

    .detail-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .detail-order-no {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.full-width {
        grid-column: 1 / -1;
      }

      .label {
        font-size: 13px;
        color: #999;
      }

      .value {
        font-size: 14px;
        color: #333;

        &.price {
          font-size: 18px;
          font-weight: 600;
          color: #ff6b6b;
        }
      }
    }
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}
</style>
