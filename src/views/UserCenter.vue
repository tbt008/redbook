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
              <div class="card-wrapper" @click="goContentDetail(item)">
                <el-card :body-style="{ padding: '0px' }" shadow="hover">
                  <div class="card-image">
                    <el-image :src="getItemCover(item)" fit="cover" style="width: 100%; height: 200px" />
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
                  <el-image :src="getItemCover(item)" fit="cover" style="width: 100%; height: 200px" />
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
              <el-image :src="getItemCover(item)" fit="cover" style="width: 120px; height: 90px; border-radius: 8px" />
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

        <el-tab-pane v-if="isMerchant || isAdmin" label="商家资源" name="merchant-resources">
          <div class="merchant-resource-panel">
            <div class="merchant-resource-toolbar">
              <div>
                <div class="merchant-resource-title">{{ currentMerchantResource.title }}</div>
                <div class="merchant-resource-desc">管理你发布在平台上的景点、美食和酒店资源。</div>
              </div>
              <div class="merchant-resource-actions">
                <el-button @click="loadMerchantResources">
                  刷新
                </el-button>
                <el-button type="primary" @click="goMerchantResourceManage(currentMerchantResource.key)">
                  <el-icon><Plus /></el-icon>
                  {{ currentMerchantResource.publishText }}
                </el-button>
              </div>
            </div>

            <el-tabs v-model="merchantResourceType" class="merchant-resource-tabs">
              <el-tab-pane label="我的景点" name="attractions" />
              <el-tab-pane label="我的美食" name="foods" />
              <el-tab-pane label="我的酒店" name="hotels" />
            </el-tabs>

            <el-table
              v-loading="merchantResourceLoading"
              :data="currentMerchantResource.list"
              class="merchant-resource-table"
              stripe
            >
              <el-table-column label="资源信息" min-width="300">
                <template #default="{ row }">
                  <div class="merchant-resource-info">
                    <el-image :src="getResourceCover(row)" fit="cover" class="merchant-resource-cover">
                      <template #error>
                        <div class="merchant-resource-cover-error">暂无图片</div>
                      </template>
                    </el-image>
                    <div class="merchant-resource-meta">
                      <div class="merchant-resource-name">{{ row.name }}</div>
                      <div class="merchant-resource-address">{{ row.region || '-' }} · {{ row.address || '-' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="currentMerchantResource.priceLabel" width="110">
                <template #default="{ row }">
                  <span class="merchant-resource-price">¥{{ getResourcePrice(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="浏览" width="90">
                <template #default="{ row }">{{ row.viewCount || 0 }}</template>
              </el-table-column>
              <el-table-column label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '上架' : '下架' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" width="170">
                <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="230" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="goMerchantResourceDetail(row)">查看</el-button>
                  <el-button link type="primary" @click="goMerchantResourceManage(currentMerchantResource.key)">
                    编辑
                  </el-button>
                  <el-button link type="danger" @click="deleteMerchantResource(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty
              v-if="currentMerchantResource.list.length === 0 && !merchantResourceLoading"
              :description="`还没有发布${currentMerchantResource.shortTitle}`"
            >
              <el-button type="primary" @click="goMerchantResourceManage(currentMerchantResource.key)">
                {{ currentMerchantResource.publishText }}
              </el-button>
            </el-empty>
          </div>
        </el-tab-pane>

        <el-tab-pane label="推荐画像" name="recommend-profile">
          <div v-loading="recommendationLoading" class="recommend-profile-panel">
            <div v-if="recommendationProfile" class="recommend-profile-content">
              <div class="profile-overview-row">
                <div class="profile-completeness">
                  <div class="profile-panel-title">兴趣画像完整度</div>
                  <el-progress
                    type="dashboard"
                    :percentage="recommendationCompleteness"
                    :width="132"
                    color="#1f513f"
                  />
                  <div class="profile-panel-desc">系统会根据你的实时行为持续更新推荐权重</div>
                </div>
                <div class="profile-signal-grid">
                  <div v-for="stat in recommendationStats" :key="stat.label" class="profile-signal-item">
                    <div class="signal-value">{{ stat.value }}</div>
                    <div class="signal-label">{{ stat.label }}</div>
                  </div>
                </div>
              </div>

              <div v-if="recommendationSignals.length" class="profile-section">
                <div class="profile-section-title">当前推荐信号</div>
                <div class="profile-tag-list">
                  <el-tag
                    v-for="signal in recommendationSignals"
                    :key="signal"
                    type="success"
                    effect="plain"
                    round
                  >
                    {{ signal }}
                  </el-tag>
                </div>
              </div>

              <div class="profile-detail-grid">
                <div class="profile-section">
                  <div class="profile-section-title">兴趣标签权重</div>
                  <div v-if="recommendationTopTags.length" class="tag-weight-list">
                    <div v-for="tag in recommendationTopTags" :key="tag.tagName" class="tag-weight-item">
                      <div class="tag-weight-head">
                        <span>{{ tag.tagName }}</span>
                        <strong>{{ tag.weight }}</strong>
                      </div>
                      <el-progress
                        :percentage="getTagPercent(tag.weight)"
                        :show-text="false"
                        color="#1f513f"
                      />
                    </div>
                  </div>
                  <el-empty v-else description="还没有形成明显兴趣标签" :image-size="80" />
                </div>

                <div class="profile-section">
                  <div class="profile-section-title">最近搜索关键词</div>
                  <div v-if="recommendationKeywords.length" class="profile-tag-list">
                    <el-tag v-for="keyword in recommendationKeywords" :key="keyword" effect="plain" round>
                      {{ keyword }}
                    </el-tag>
                  </div>
                  <el-empty v-else description="还没有搜索记录" :image-size="80" />
                </div>

                <div class="profile-section profile-section-wide">
                  <div class="profile-section-title">偏好地区</div>
                  <div v-if="recommendationRegions.length" class="profile-tag-list">
                    <el-tag
                      v-for="region in recommendationRegions"
                      :key="region"
                      type="warning"
                      effect="plain"
                      round
                    >
                      {{ region }}
                    </el-tag>
                  </div>
                  <el-empty v-else description="偏好地区仍在学习中" :image-size="80" />
                </div>

                <div class="profile-section profile-section-wide">
                  <div class="profile-section-header">
                    <div>
                      <div class="profile-section-title">不感兴趣列表</div>
                      <div class="profile-section-subtitle">删除后，该内容将重新参与后续推荐筛选</div>
                    </div>
                    <el-button size="small" :loading="recommendationDislikeLoading" @click="loadRecommendationDislikes">
                      刷新
                    </el-button>
                  </div>
                  <div v-loading="recommendationDislikeLoading" class="dislike-list">
                    <div
                      v-for="item in recommendationDislikes"
                      :key="item.id"
                      class="dislike-list-item"
                      @click="goDetail(item)"
                    >
                      <el-image class="dislike-cover" :src="getItemCover(item)" fit="cover">
                        <template #error>
                          <div class="dislike-cover-error">无图</div>
                        </template>
                      </el-image>
                      <div class="dislike-info">
                        <div class="dislike-title">{{ item.title || '内容已不可用' }}</div>
                        <div class="dislike-meta">
                          <el-tag size="small" effect="plain">{{ getDislikeTypeText(item) }}</el-tag>
                          <span v-if="item.region">{{ item.region }}</span>
                          <span>{{ formatTime(item.createTime) }}</span>
                        </div>
                        <div v-if="item.reason" class="dislike-reason">{{ item.reason }}</div>
                      </div>
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click.stop="deleteRecommendationDislike(item)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </div>
                    <el-empty
                      v-if="!recommendationDislikes.length && !recommendationDislikeLoading"
                      description="还没有设置不感兴趣"
                      :image-size="80"
                    />
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="推荐画像暂不可用" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的订单" name="orders">
          <!-- 订单筛选 - 第一行：订单类型 -->
          <div class="order-filter order-filter-card">
            <div class="filter-label">订单类型</div>
            <el-radio-group class="order-filter-group" v-model="orderTypeFilter" size="small" @change="handleOrderTypeChange">
              <el-radio-button :label="0" :value="0">全部</el-radio-button>
              <el-radio-button :label="1" :value="1">景点门票</el-radio-button>
              <el-radio-button :label="2" :value="2">酒店预订</el-radio-button>
              <el-radio-button :label="3" :value="3">美食预订</el-radio-button>
            </el-radio-group>
          </div>
          <!-- 订单筛选 - 第二行：订单状态 -->
          <div class="order-filter order-filter-card">
            <div class="filter-label">订单状态</div>
            <el-radio-group class="order-filter-group" v-model="orderStatusFilter" size="small" @change="handleOrderStatusChange">
              <el-radio-button :label="-1" :value="-1">全部状态</el-radio-button>
              <el-radio-button :label="0" :value="0">待支付</el-radio-button>
              <el-radio-button :label="1" :value="1">待使用/待发货</el-radio-button>
              <el-radio-button :label="2" :value="2">已完成</el-radio-button>
              <el-radio-button :label="3" :value="3">已取消</el-radio-button>
              <el-radio-button :label="4" :value="4">已退款</el-radio-button>
              <el-radio-button :label="5" :value="5">退款审核中</el-radio-button>
              <el-radio-button :label="6" :value="6">已拒绝退款</el-radio-button>
            </el-radio-group>
          </div>
          <div v-loading="orderLoading" class="order-list">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card">
              <div class="order-header">
                <div class="order-left">
                  <div class="order-no">订单号：{{ order.orderNo }}</div>
                  <div class="order-time">{{ formatTime(order.createTime) }}</div>
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
                      <span><el-icon><Calendar /></el-icon> 入住：{{ formatTime(order.checkInDate, 'MM-DD') }}</span>
                      <span><el-icon><Calendar /></el-icon> 退房：{{ formatTime(order.checkOutDate, 'MM-DD') }}</span>
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
                      <span><el-icon><Calendar /></el-icon> 预订日期：{{ formatDate(order.bookingDate) }}</span>
                      <span><el-icon><User /></el-icon> 用餐人数：{{ order.dinerCount || 1 }}人</span>
                    </div>
                    <!-- 外卖配送状态 -->
                    <div v-if="order.deliveryStatus !== null" class="delivery-status">
                      <el-divider direction="vertical" />
                      <el-tag :type="getDeliveryStatusType(order.deliveryStatus)" size="small">
                        {{ getDeliveryStatusText(order.deliveryStatus) }}
                      </el-tag>
                      <span v-if="order.deliveryTime" class="delivery-time">
                        {{ formatTime(order.deliveryTime, 'MM-DD HH:mm') }}
                      </span>
                    </div>
                  </div>
                  <!-- 门票订单显示 -->
                  <div v-else class="order-detail">
                    <div class="order-title">{{ order.ticketName }}</div>
                    <div class="order-meta">
                      <span><el-icon><Calendar /></el-icon> 游玩日期：{{ formatDate(order.visitDate) }}</span>
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
                    支付过期时间：{{ formatTime(order.expireTime, 'MM-DD HH:mm') }}
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
                    查看详情
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
                  <el-button
                    v-if="order.orderStatus === 1"
                    type="warning"
                    size="small"
                    plain
                    @click.stop="handleRefund(order)"
                  >
                    申请退款
                  </el-button>
                  <!-- 已使用/已取消/已退款 - 显示查看详情 -->
                  <el-button
                    v-if="order.orderStatus === 2 || order.orderStatus === 3 || order.orderStatus === 4 || order.orderStatus === 5 || order.orderStatus === 6"
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

        <el-tab-pane label="收货地址" name="addresses">
          <div class="address-panel">
            <div class="address-toolbar">
              <div>
                <div class="address-toolbar__title">收货地址</div>
                <div class="address-toolbar__desc">外卖下单会优先使用默认地址，也可以在下单时切换。</div>
              </div>
              <el-button type="primary" @click="openAddressDialog()">
                <el-icon><Plus /></el-icon>
                新增地址
              </el-button>
            </div>

            <div v-loading="addressLoading" class="address-list">
              <div v-for="address in addressList" :key="address.id" class="address-card">
                <div class="address-card__main">
                  <div class="address-card__head">
                    <strong>{{ address.contactName }}</strong>
                    <span>{{ address.contactPhone }}</span>
                    <el-tag v-if="address.isDefault === 1" type="success" effect="plain" size="small">默认</el-tag>
                  </div>
                  <div class="address-card__location">
                    <el-icon><Location /></el-icon>
                    <span>{{ address.address }}</span>
                  </div>
                  <div v-if="address.remark" class="address-card__remark">{{ address.remark }}</div>
                </div>
                <div class="address-card__actions">
                  <el-button v-if="address.isDefault !== 1" link type="primary" @click="setDefaultAddress(address)">设为默认</el-button>
                  <el-button link type="primary" @click="openAddressDialog(address)">编辑</el-button>
                  <el-button link type="danger" @click="deleteAddress(address)">删除</el-button>
                </div>
              </div>
              <el-empty v-if="addressList.length === 0 && !addressLoading" description="还没有配置收货地址">
                <el-button type="primary" @click="openAddressDialog()">新增地址</el-button>
              </el-empty>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账号设置" name="settings">
          <div class="settings-panel">
            <div class="settings-summary">
              <el-avatar :src="userInfo.avatar" :size="72" />
              <div class="settings-summary__name">{{ displayName }}</div>
              <div class="settings-summary__email">{{ settingsForm.email || '未绑定邮箱' }}</div>
              <el-tag class="settings-summary__role" effect="plain">{{ profileRoleText }}</el-tag>
              <el-button type="primary" plain @click="showEditDialog">更换头像</el-button>
            </div>

            <div class="settings-main">
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

              <el-form :model="settingsForm" label-width="86px" class="settings-form">
                <div class="settings-form__grid">
                  <el-form-item label="用户名">
                    <el-input v-model="settingsForm.userName" disabled placeholder="系统账号" />
                  </el-form-item>
                  <el-form-item label="昵称">
                    <el-input v-model="settingsForm.nickName" placeholder="请输入昵称" maxlength="24" show-word-limit />
                  </el-form-item>
                  <el-form-item label="邮箱">
                    <el-input v-model="settingsForm.email" disabled placeholder="未绑定邮箱" />
                  </el-form-item>
                  <el-form-item label="手机号">
                    <el-input
                      v-model="settingsForm.phoneNumber"
                      placeholder="请输入11位手机号"
                      maxlength="11"
                      show-word-limit
                      inputmode="numeric"
                      @input="settingsForm.phoneNumber = normalizeMobilePhone($event)"
                    />
                  </el-form-item>
                </div>
                <el-form-item label="性别">
                  <el-radio-group v-model="settingsForm.sex">
                    <el-radio :value="0">保密</el-radio>
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input
                    v-model="settingsForm.description"
                    type="textarea"
                    :rows="5"
                    maxlength="160"
                    show-word-limit
                    placeholder="介绍一下自己吧"
                  />
                </el-form-item>
                <el-form-item class="settings-actions">
                  <el-button type="primary" @click="updateUserInfo">保存修改</el-button>
                  <el-button @click="showPasswordDialog">修改密码</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <el-dialog
      v-model="addressDialogVisible"
      :title="addressForm.id ? '编辑收货地址' : '新增收货地址'"
      width="760px"
      destroy-on-close
      @opened="initAddressMap"
    >
      <el-form :model="addressForm" label-width="92px" class="address-edit-form">
        <div class="address-edit-grid">
          <el-form-item label="联系人" required>
            <el-input v-model="addressForm.contactName" placeholder="请输入联系人姓名" />
          </el-form-item>
          <el-form-item label="联系电话" required>
            <el-input
              v-model="addressForm.contactPhone"
              placeholder="请输入11位手机号"
              maxlength="11"
              show-word-limit
              inputmode="numeric"
              @input="addressForm.contactPhone = normalizeMobilePhone($event)"
            />
          </el-form-item>
        </div>
        <el-form-item label="收货地址" required>
          <el-input v-model="addressForm.address" placeholder="可手动输入，也可点击下方地图自动获取" />
        </el-form-item>
        <el-form-item label="地图定位">
          <div class="address-map-wrap">
            <div id="address-picker-map" class="address-map"></div>
            <div class="address-map-tip">
              <el-icon><Location /></el-icon>
              <span>点击地图选择配送位置，系统会自动反查详细地址。</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="addressForm.remark" type="textarea" :rows="3" placeholder="如门牌号、取餐备注等" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addressSaving" @click="saveAddress">保存地址</el-button>
      </template>
    </el-dialog>

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
          <el-input
            v-model="merchantApplyForm.merchantContactPhone"
            placeholder="请输入11位手机号"
            maxlength="11"
            show-word-limit
            inputmode="numeric"
            @input="merchantApplyForm.merchantContactPhone = normalizeMobilePhone($event)"
          />
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
    <el-dialog
      v-model="contentEditDialogVisible"
      title="编辑内容"
      width="760px"
      class="content-edit-dialog"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="content-edit-body">
        <div class="content-edit-head">
          <h3>编辑发布内容</h3>
          <p>调整内容的标题、摘要、地区和位置，保存后会同步到个人中心与详情页展示。</p>
        </div>

        <el-form :model="editingContent" label-position="top" class="content-edit-form">
          <div class="content-edit-grid">
            <el-form-item label="标题" class="full">
              <el-input v-model="editingContent.title" placeholder="请输入标题" maxlength="60" show-word-limit />
            </el-form-item>
            <el-form-item label="内容" class="full">
              <el-input
                v-model="editingContent.content"
                type="textarea"
                :rows="8"
                placeholder="请输入内容"
                maxlength="3000"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="摘要" class="full">
              <el-input
                v-model="editingContent.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入摘要"
                maxlength="150"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="地区">
              <el-select v-model="editingContent.region" placeholder="请选择地区" clearable style="width: 100%">
                <el-option label="荔城区" value="荔城区" />
                <el-option label="城厢区" value="城厢区" />
                <el-option label="涵江区" value="涵江区" />
                <el-option label="秀屿区" value="秀屿区" />
                <el-option label="湄洲岛" value="湄洲岛" />
              </el-select>
            </el-form-item>
            <el-form-item label="主题">
              <el-input v-model="editingContent.theme" placeholder="例如：住宿、美食、海岛" />
            </el-form-item>
            <el-form-item label="位置" class="full">
              <MapLocationPicker
                v-model:address="editingContent.location"
                v-model:longitude="contentEditLocation.longitude"
                v-model:latitude="contentEditLocation.latitude"
                v-model:region="editingContent.region"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="content-edit-footer">
          <el-button class="content-edit-cancel" @click="contentEditDialogVisible = false">取消</el-button>
          <el-button type="primary" class="content-edit-submit" :loading="contentEditSaving" @click="saveContentEdit">
            保存修改
          </el-button>
        </div>
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
        <PaymentMethodCard />
        <div class="pay-qrcode" v-if="payQrCodeUrl">
          <el-image :src="payQrCodeUrl" fit="contain" style="width: 220px; height: 220px" />
          <div class="qrcode-tip">请使用支付宝沙箱 App 扫描二维码完成支付。</div>
        </div>
        <div v-if="payingOrder?.expireTime" class="pay-expire">
          <el-icon><Clock /></el-icon>
          支付过期时间：{{ formatTime(payingOrder.expireTime) }}
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
            <span class="value">{{ formatTime(detailOrder.createTime) }}</span>
          </div>
          <div class="detail-item" v-if="detailOrder.payTime">
            <span class="label">支付时间</span>
            <span class="value">{{ formatTime(detailOrder.payTime) }}</span>
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
              <span class="value">{{ formatDate(detailOrder.visitDate) }}</span>
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
              <span class="value">{{ formatDate(detailOrder.checkInDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">退房日期</span>
              <span class="value">{{ formatDate(detailOrder.checkOutDate) }}</span>
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
              <span class="value">{{ formatDate(detailOrder.bookingDate) }}</span>
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
                <span class="value">{{ formatTime(detailOrder.deliveryTime) }}</span>
              </div>
              <div class="detail-item" v-if="detailOrder.receiveTime">
                <span class="label">收货时间</span>
                <span class="value">{{ formatTime(detailOrder.receiveTime) }}</span>
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
              <span class="value">{{ formatTime(detailOrder.verifyTime) }}</span>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="orderDetailDialogVisible = false">关闭</el-button>
        <el-button v-if="detailOrder?.orderStatus === 1" type="primary" @click="viewETicket(detailOrder)">
          查看详情
        </el-button>
        <el-button v-if="detailOrder?.orderStatus === 1" type="warning" plain @click="handleRefund(detailOrder)">
          申请退款
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, Plus, Setting, Edit, Delete, Collection, Promotion, Shop, Calendar, User, House, Ticket, Wallet, Box, Clock, Location } from '@element-plus/icons-vue'
import request from '@/util/request'
import { formatDateOnly, formatDateTime, type DateInput } from '@/utils/date'
import { buildPayQrCodeUrl } from '@/utils/payQrCode'
import { normalizeMobilePhone } from '@/utils/attractionForm'
import { loadAMapScript, reverseGeocodeLocation, waitForContainerVisible } from '@/utils/amap'
import { getFirstImageUrl } from '@/utils/imageUrl'
import MapLocationPicker from '@/components/MapLocationPicker.vue'
import PaymentMethodCard from '@/components/PaymentMethodCard.vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref(typeof route.query.tab === 'string' ? route.query.tab : 'content')
const userInfo = ref<any>({})
const stats = ref({ contentCount: 0, likeCount: 0, collectCount: 0, collectionCount: 0 })
const myContents = ref<any[]>([])
const myCollections = ref<any[]>([])
const browseHistory = ref<any[]>([])
const myOrders = ref<any[]>([])
const recommendationProfile = ref<any>(null)
const recommendationDislikes = ref<any[]>([])
const recommendationLoading = ref(false)
const recommendationDislikeLoading = ref(false)
const orderLoading = ref(false)
const merchantResourceLoading = ref(false)
const merchantResourceType = ref<'attractions' | 'foods' | 'hotels'>('attractions')
const merchantResources = reactive({
  attractions: [] as any[],
  foods: [] as any[],
  hotels: [] as any[]
})
const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const contentEditDialogVisible = ref(false)
const contentEditSaving = ref(false)
const contentEditLocation = reactive({
  longitude: null as number | null,
  latitude: null as number | null
})
const merchantApplyDialogVisible = ref(false)
const addressDialogVisible = ref(false)
const addressLoading = ref(false)
const addressSaving = ref(false)
const addressList = ref<any[]>([])
let addressMap: any = null
let addressMarker: any = null

// 订单相关
const orderTypeFilter = ref(0) // 0-全部 1-景点门票 2-酒店 3-美食
const orderStatusFilter = ref(-1) // -1-全部 0-待支付 1-待使用/待发货 2-已完成 3-已取消 4-已退款 5-退款审核中 6-已拒绝退款
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
  if (isAdmin.value) return '管理员'
  if (isMerchant.value) return '商家'
  return '游客'
})

const displayName = computed(() => (
  userInfo.value.nickName ||
  userInfo.value.nickname ||
  userInfo.value.userName ||
  userInfo.value.username ||
  '未命名用户'
))

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

const toNumber = (value: any, fallback = 0) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

const filteredOrders = computed(() => {
  let orders = myOrders.value
  const selectedOrderType = toNumber(orderTypeFilter.value)
  const selectedOrderStatus = toNumber(orderStatusFilter.value, -1)

  // 按订单类型筛选
  if (selectedOrderType !== 0) {
    orders = orders.filter(o => toNumber(o.orderType, -1) === selectedOrderType)
  }

  // 按订单状态筛选
  if (selectedOrderStatus !== -1) {
    if (selectedOrderStatus === 0) {
      // 待支付
      orders = orders.filter(o => toNumber(o.orderStatus, -1) === 0)
    } else if (selectedOrderStatus === 1) {
      // 待使用/待发货
      orders = orders.filter(o => {
        const orderStatus = toNumber(o.orderStatus, -1)
        const orderType = toNumber(o.orderType, -1)
        const deliveryStatus = o.deliveryStatus === null || o.deliveryStatus === undefined
          ? null
          : toNumber(o.deliveryStatus, -1)

        return (
          (orderStatus === 1 && (orderType === 1 || orderType === 2)) ||
          (orderStatus === 1 && orderType === 3 && (deliveryStatus === 0 || deliveryStatus === null))
        )
      })
    } else if (selectedOrderStatus === 2) {
      // 已完成
      orders = orders.filter(o => {
        const orderStatus = toNumber(o.orderStatus, -1)
        const orderType = toNumber(o.orderType, -1)
        const deliveryStatus = toNumber(o.deliveryStatus, -1)

        return orderStatus === 2 || (orderStatus === 1 && orderType === 3 && deliveryStatus === 2)
      })
    } else if (selectedOrderStatus === 3) {
      // 已取消
      orders = orders.filter(o => {
        const orderStatus = toNumber(o.orderStatus, -1)
        return orderStatus === 3
      })
    } else if ([4, 5, 6].includes(selectedOrderStatus)) {
      orders = orders.filter(o => toNumber(o.orderStatus, -1) === selectedOrderStatus)
    }
  }

  return orders
})

const recommendationCompleteness = computed(() => {
  const completeness = Number(recommendationProfile.value?.profileCompleteness || 0)
  return Math.max(0, Math.min(100, Math.round(completeness)))
})

const recommendationTopTags = computed(() => recommendationProfile.value?.topTags || [])

const recommendationKeywords = computed(() => recommendationProfile.value?.recentSearchKeywords || [])

const recommendationRegions = computed(() => recommendationProfile.value?.preferredRegions || [])

const recommendationSignals = computed(() => recommendationProfile.value?.behaviorSignals || [])

const recommendationStats = computed(() => [
  { label: '浏览', value: Number(recommendationProfile.value?.browseCount || 0) },
  { label: '点赞', value: Number(recommendationProfile.value?.likeCount || 0) },
  { label: '收藏', value: Number(recommendationProfile.value?.collectCount || 0) },
  { label: '搜索', value: Number(recommendationProfile.value?.searchCount || 0) },
  { label: '不感兴趣', value: Number(recommendationProfile.value?.dislikeCount || 0) },
  { label: '标签', value: Number(recommendationProfile.value?.interestTagCount || 0) }
])

const merchantResourceConfig = {
  attractions: {
    key: 'attractions',
    title: '我的景点',
    shortTitle: '景点',
    publishText: '发布景点',
    priceLabel: '门票价',
    detailPath: '/attraction',
    managePath: '/admin/merchant-attractions',
    apiPath: '/admin/merchant/attractions'
  },
  foods: {
    key: 'foods',
    title: '我的美食',
    shortTitle: '美食',
    publishText: '发布美食',
    priceLabel: '人均',
    detailPath: '/food',
    managePath: '/admin/merchant-foods',
    apiPath: '/admin/merchant/foods'
  },
  hotels: {
    key: 'hotels',
    title: '我的酒店',
    shortTitle: '酒店',
    publishText: '发布酒店',
    priceLabel: '起价',
    detailPath: '/hotel',
    managePath: '/admin/merchant-hotels',
    apiPath: '/admin/merchant/hotels'
  }
} as const

const currentMerchantResource = computed(() => {
  const config = merchantResourceConfig[merchantResourceType.value]
  return {
    ...config,
    list: merchantResources[merchantResourceType.value]
  }
})

const maxTagWeight = computed(() => {
  const weights = recommendationTopTags.value.map((item: any) => Number(item.weight || 0))
  return Math.max(...weights, 1)
})

const getTagPercent = (weight: number) => {
  const percent = (Number(weight || 0) / maxTagWeight.value) * 100
  return Math.max(4, Math.min(100, Math.round(percent)))
}

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

const addressForm = reactive({
  id: null as number | null,
  contactName: '',
  contactPhone: '',
  address: '',
  region: '',
  longitude: null as number | null,
  latitude: null as number | null,
  isDefault: 0,
  remark: ''
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
      Object.assign(settingsForm, {
        userName: res.data.userName || res.data.username || '',
        nickName: res.data.nickName || res.data.nickname || '',
        email: res.data.email || '',
        phoneNumber: res.data.phoneNumber || res.data.phone || '',
        sex: Number(res.data.sex ?? res.data.gender ?? 0),
        description: res.data.description || res.data.bio || ''
      })
      Object.assign(editForm, {
        avatar: res.data.avatar,
        nickName: res.data.nickName || res.data.nickname || '',
        description: res.data.description || res.data.bio || ''
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

const loadMerchantResourceList = async (type: 'attractions' | 'foods' | 'hotels') => {
  const config = merchantResourceConfig[type]
  const res: any = await request.get(config.apiPath, {
    params: { pageNum: 1, pageSize: 100 }
  })
  if (res && res.code === 200) {
    merchantResources[type] = res.data?.list || []
  }
}

const loadMerchantResources = async () => {
  if (!isMerchant.value && !isAdmin.value) return

  merchantResourceLoading.value = true
  try {
    await Promise.all([
      loadMerchantResourceList('attractions'),
      loadMerchantResourceList('foods'),
      loadMerchantResourceList('hotels')
    ])
  } catch (error) {
    console.error('加载商家资源失败', error)
    ElMessage.error('加载商家资源失败')
  } finally {
    merchantResourceLoading.value = false
  }
}

// 加载推荐画像
const loadRecommendationProfile = async () => {
  recommendationLoading.value = true
  try {
    const [profileRes]: any[] = await Promise.all([
      request.get('/content/recommend/profile'),
      loadRecommendationDislikes()
    ])
    if (profileRes && profileRes.code === 200) {
      recommendationProfile.value = profileRes.data || null
    }
  } catch (error) {
    console.error('加载推荐画像失败', error)
    recommendationProfile.value = null
  } finally {
    recommendationLoading.value = false
  }
}

const loadRecommendationDislikes = async () => {
  recommendationDislikeLoading.value = true
  try {
    const res: any = await request.get('/content/recommend/dislikes')
    if (res && res.code === 200) {
      recommendationDislikes.value = res.data || []
    }
    return res
  } catch (error) {
    console.error('加载不感兴趣列表失败', error)
    recommendationDislikes.value = []
    return null
  } finally {
    recommendationDislikeLoading.value = false
  }
}

const deleteRecommendationDislike = async (item: any) => {
  try {
    await ElMessageBox.confirm(
      `确定从不感兴趣列表中删除「${item.title || '该内容'}」吗？删除后它可能再次出现在推荐里。`,
      '删除不感兴趣',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res: any = await request.delete(`/content/recommend/dislike/${item.id}`)
    if (res && res.code === 200) {
      ElMessage.success('已删除')
      await loadRecommendationProfile()
    }
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 加载我的订单
const loadMyOrders = async () => {
  orderLoading.value = true
  try {
    const res: any = await request.get('/order/list', {
      params: { pageNum: 1, pageSize: 1000 }
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

const loadAddressList = async () => {
  addressLoading.value = true
  try {
    const res: any = await request.get('/user/address/list')
    if (res && res.code === 200) {
      addressList.value = res.data || []
    }
  } catch (error) {
    console.error('加载收货地址失败', error)
    addressList.value = []
  } finally {
    addressLoading.value = false
  }
}

const resetAddressForm = () => {
  Object.assign(addressForm, {
    id: null,
    contactName: '',
    contactPhone: settingsForm.phoneNumber || '',
    address: '',
    region: '',
    longitude: null,
    latitude: null,
    isDefault: addressList.value.length === 0 ? 1 : 0,
    remark: ''
  })
}

const openAddressDialog = (address?: any) => {
  if (address) {
    Object.assign(addressForm, {
      id: address.id,
      contactName: address.contactName || '',
      contactPhone: address.contactPhone || '',
      address: address.address || '',
      region: address.region || '',
      longitude: address.longitude === null || address.longitude === undefined ? null : Number(address.longitude),
      latitude: address.latitude === null || address.latitude === undefined ? null : Number(address.latitude),
      isDefault: Number(address.isDefault || 0),
      remark: address.remark || ''
    })
  } else {
    resetAddressForm()
  }
  addressDialogVisible.value = true
}

const initAddressMap = async () => {
  await nextTick()
  const container = document.getElementById('address-picker-map')
  if (!container) return

  try {
    await loadAMapScript()
    await waitForContainerVisible(container)
    container.innerHTML = ''

    const lng = addressForm.longitude || 119.007558
    const lat = addressForm.latitude || 25.454085
    addressMap = new window.AMap.Map(container, {
      zoom: addressForm.longitude && addressForm.latitude ? 16 : 12,
      center: [lng, lat],
      mapStyle: 'amap://styles/normal'
    })
    addressMarker = new window.AMap.Marker({
      position: [lng, lat],
      title: '收货地址'
    })
    addressMap.add(addressMarker)
    addressMap.on('click', handleAddressMapClick)
  } catch (error) {
    console.error('地址地图加载失败', error)
    ElMessage.warning('地图加载失败，可先手动输入地址')
  }
}

const handleAddressMapClick = async (event: any) => {
  const lng = Number(event.lnglat?.lng)
  const lat = Number(event.lnglat?.lat)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return

  addressForm.longitude = Number(lng.toFixed(6))
  addressForm.latitude = Number(lat.toFixed(6))
  if (addressMarker) {
    addressMarker.setPosition([addressForm.longitude, addressForm.latitude])
  }

  try {
    const location = await reverseGeocodeLocation(addressForm.longitude, addressForm.latitude)
    addressForm.address = location.address
    addressForm.region = location.region
    ElMessage.success('已根据地图位置获取地址')
  } catch (error) {
    ElMessage.warning('未能自动获取地址，请手动补充详细地址')
  }
}

const validateAddressForm = () => {
  if (!addressForm.contactName.trim()) {
    ElMessage.warning('请输入联系人')
    return false
  }
  if (!addressForm.contactPhone.trim()) {
    ElMessage.warning('请输入联系电话')
    return false
  }
  if (addressForm.contactPhone.length !== 11) {
    ElMessage.warning('请输入11位手机号')
    return false
  }
  if (!addressForm.address.trim()) {
    ElMessage.warning('请输入收货地址')
    return false
  }
  return true
}

const saveAddress = async () => {
  if (!validateAddressForm()) return

  addressSaving.value = true
  try {
    const payload = {
      id: addressForm.id,
      contactName: addressForm.contactName,
      contactPhone: addressForm.contactPhone,
      address: addressForm.address,
      region: addressForm.region,
      longitude: addressForm.longitude,
      latitude: addressForm.latitude,
      isDefault: addressForm.isDefault,
      remark: addressForm.remark
    }
    const res: any = addressForm.id
      ? await request.put('/user/address/update', payload)
      : await request.post('/user/address/save', payload)
    if (res && res.code === 200) {
      ElMessage.success('地址保存成功')
      addressDialogVisible.value = false
      await loadAddressList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存地址失败')
  } finally {
    addressSaving.value = false
  }
}

const setDefaultAddress = async (address: any) => {
  try {
    const res: any = await request.put(`/user/address/${address.id}/default`)
    if (res && res.code === 200) {
      ElMessage.success('已设为默认地址')
      await loadAddressList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '设置默认地址失败')
  }
}

const deleteAddress = async (address: any) => {
  try {
    await ElMessageBox.confirm('确定删除这个收货地址吗？', '删除地址', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.delete(`/user/address/${address.id}`)
    if (res && res.code === 200) {
      ElMessage.success('地址已删除')
      await loadAddressList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除地址失败')
    }
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
      payQrCodeUrl.value = await buildPayQrCodeUrl(res.data)
      if (!payQrCodeUrl.value) {
        throw new Error('未获取到支付宝支付二维码')
      }
      payStatusMessage.value = res.data?.scanTip || '请使用支付宝沙箱 App 和沙箱买家账号扫码，普通支付宝会提示订单不存在'

      // 开始轮询支付状态
      startPayPolling(orderNo)
    } else {
      payStatusMessage.value = res.msg || res.message || '生成支付二维码失败'
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
  let requestPending = false
  let successHandled = false

  payPollingTimer = setInterval(async () => {
    if (requestPending || successHandled) return

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
      requestPending = true
      const res: any = await request.get(`/order/pay/status/${orderNo}`)
      if (res && res.code === 200 && res.data) {
        if (res.data.paid || res.data.orderStatus === 1) {
          successHandled = true
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
    } finally {
      requestPending = false
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

// 申请退货退款
const handleRefund = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要申请退货退款吗？提交后商家会进行审核。',
      '申请退款',
      {
        confirmButtonText: '提交申请',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res: any = await request.post(`/order/refund/request/${order.orderNo}`)
    if (res && res.code === 200) {
      ElMessage.success('退款申请已提交，等待商家审核')
      loadMyOrders()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '申请退款失败')
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

// 查看订单详情
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
    4: '已退款',
    5: '退款审核中',
    6: '已拒绝退款'
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
    4: 'danger',
    5: 'warning',
    6: 'info'
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
      contentEditLocation.longitude = content.longitude === null || content.longitude === undefined ? null : Number(content.longitude)
      contentEditLocation.latitude = content.latitude === null || content.latitude === undefined ? null : Number(content.latitude)
      contentEditDialogVisible.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取内容详情失败')
  }
}

// 保存内容编辑
const saveContentEdit = async () => {
  contentEditSaving.value = true
  try {
    const res: any = await request.put('/content/update', editingContent.value)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      contentEditDialogVisible.value = false
      loadMyContents()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    contentEditSaving.value = false
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
    const res: any = await request.put('/user/update', {
      avatar: editForm.avatar,
      nickName: editForm.nickName,
      description: editForm.description
    })
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
    if (settingsForm.phoneNumber && settingsForm.phoneNumber.length !== 11) {
      ElMessage.warning('请输入11位手机号')
      return
    }

    const res: any = await request.put('/user/update', {
      nickName: settingsForm.nickName,
      phoneNumber: settingsForm.phoneNumber,
      phone: settingsForm.phoneNumber,
      sex: settingsForm.sex,
      gender: settingsForm.sex,
      description: settingsForm.description
    })
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
  if (merchantApplyForm.merchantContactPhone.length !== 11) {
    ElMessage.warning('请输入11位手机号')
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
        const res: any = await request.put('/user/change-password', null, {
          params: {
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
          }
        })
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
const formatTime = (time: DateInput, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  const fallback = pattern === 'MM-DD' || pattern === 'MM-DD HH:mm' ? '--' : '-'
  return formatDateTime(time, fallback, pattern)
}

const formatDate = (time: DateInput) => formatDateOnly(time, '-')

const goHome = () => router.push('/')

// 跳转商家发布页面
const goMerchantPublish = () => router.push('/merchant/publish')

const getResourceCover = (row: any) => {
  return getFirstImageUrl(row.coverImage, row.image, row.images)
}

const getItemCover = (item: any) => getFirstImageUrl(item.coverImage, item.image, item.images)

const getDislikeTypeText = (item: any) => {
  if (item.dataType !== undefined && item.dataType !== null) {
    const dataTypeMap: Record<number, string> = {
      1: '攻略',
      2: '景点',
      3: '美食',
      4: '酒店'
    }
    return dataTypeMap[Number(item.dataType)] || '内容'
  }
  const contentTypeMap: Record<number, string> = {
    1: '攻略',
    4: '景点',
    5: '美食',
    6: '酒店'
  }
  return contentTypeMap[Number(item.contentType)] || '内容'
}

const getResourcePrice = (row: any) => {
  if (merchantResourceType.value === 'attractions') return row.ticketPrice || 0
  if (merchantResourceType.value === 'foods') return row.avgPrice || row.price || 0
  return row.price || row.avgPrice || 0
}

const goMerchantResourceDetail = (row: any) => {
  router.push(`${currentMerchantResource.value.detailPath}/${row.id}`)
}

const goMerchantResourceManage = (type: 'attractions' | 'foods' | 'hotels') => {
  router.push(merchantResourceConfig[type].managePath)
}

const deleteMerchantResource = async (row: any) => {
  const config = currentMerchantResource.value
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？删除后将从列表下架。`, `删除${config.shortTitle}`, {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request.delete(`${config.apiPath}/${row.id}`)
    if (res && res.code === 200) {
      ElMessage.success('删除成功')
      await loadMerchantResourceList(merchantResourceType.value)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const goContentDetail = (item: any) => {
  router.push(`/content/${item.id}`)
}

// 跳转详情 - 个人中心的收藏/浏览历史使用内容表类型：1内容、4景点、5美食、6酒店
const goDetail = (item: any) => {
  const id = item.contentId || item.id
  const dataType = Number(item.dataType ?? (item.contentId ? item.contentType : undefined) ?? 1)
  const isHomeHotelType = dataType === 4 && (item.starLevel !== undefined || item.facilities !== undefined)
  const routeMap: Record<number, string> = {
    1: `/content/${id}`,
    2: `/attraction/${id}`,
    3: `/food/${id}`,
    4: isHomeHotelType ? `/hotel/${id}` : `/attraction/${id}`,
    5: `/food/${id}`,
    6: `/hotel/${id}`
  }

  router.push(routeMap[dataType] || `/content/${id}`)
}
const goAdmin = () => router.push('/admin')

onMounted(async () => {
  await loadUserInfo()
  loadStats()
  loadMyContents()
  loadMyCollections()
  loadBrowseHistory()
  loadRecommendationProfile()
  loadMyOrders()
  loadAddressList()
  loadMerchantResources()
})

onUnmounted(() => {
  // 清理支付轮询定时器
  if (payPollingTimer) {
    clearInterval(payPollingTimer)
  }
  if (addressMap) {
    addressMap.destroy()
    addressMap = null
    addressMarker = null
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

.recommend-profile-panel {
  min-height: 360px;
}

.merchant-resource-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.merchant-resource-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid #e7ece6;
  border-radius: 16px;
  background: #fcfcfb;
}

.merchant-resource-title {
  color: #18372d;
  font-size: 18px;
  font-weight: 700;
}

.merchant-resource-desc {
  margin-top: 6px;
  color: #6d7d74;
  font-size: 13px;
}

.merchant-resource-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.merchant-resource-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}

.merchant-resource-table {
  border: 1px solid #eef1ec;
  border-radius: 16px;
  overflow: hidden;
}

.merchant-resource-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.merchant-resource-cover,
.merchant-resource-cover-error {
  width: 88px;
  height: 64px;
  border-radius: 10px;
  background: #f1f5f2;
  flex: 0 0 auto;
}

.merchant-resource-cover-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa7a0;
  font-size: 12px;
}

.merchant-resource-meta {
  min-width: 0;
}

.merchant-resource-name {
  color: #17251e;
  font-weight: 700;
  line-height: 1.4;
}

.merchant-resource-address {
  margin-top: 6px;
  color: #6f7d75;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-resource-price {
  color: #b45309;
  font-weight: 700;
}

.recommend-profile-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-overview-row {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
}

.profile-completeness,
.profile-section,
.profile-signal-item {
  border: 1px solid #e7ece6;
  border-radius: 16px;
  background: #fcfcfb;
}

.profile-completeness {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 20px;
  text-align: center;
}

.profile-panel-title,
.profile-section-title {
  color: #18372d;
  font-size: 16px;
  font-weight: 700;
}

.profile-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.profile-section-subtitle {
  margin-top: 6px;
  color: #6d7d74;
  font-size: 13px;
  line-height: 1.5;
}

.profile-panel-desc {
  max-width: 190px;
  margin-top: 8px;
  color: #6d7d74;
  font-size: 13px;
  line-height: 1.6;
}

.profile-signal-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(96px, 1fr));
  gap: 12px;
}

.profile-signal-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 104px;
  padding: 18px;

  .signal-value {
    color: #1f513f;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }

  .signal-label {
    margin-top: 8px;
    color: #6a7c73;
    font-size: 13px;
  }
}

.profile-section {
  padding: 20px;
}

.profile-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.profile-section-wide {
  grid-column: 1 / -1;
}

.profile-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.tag-weight-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
}

.tag-weight-item {
  .tag-weight-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    color: #52645b;
    font-size: 13px;

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: #1f513f;
      font-weight: 700;
    }
  }
}

.dislike-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
  margin-top: 16px;
}

.dislike-list-item {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid #edf1eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dislike-list-item:hover {
  border-color: #cad8d0;
  box-shadow: 0 8px 24px rgba(31, 81, 63, 0.08);
}

.dislike-cover,
.dislike-cover-error {
  width: 92px;
  height: 68px;
  border-radius: 10px;
  background: #f1f5f2;
  flex: 0 0 auto;
}

.dislike-cover-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b9a92;
  font-size: 12px;
}

.dislike-info {
  min-width: 0;
}

.dislike-title {
  color: #17251e;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dislike-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  color: #7a897f;
  font-size: 12px;
}

.dislike-reason {
  margin-top: 8px;
  color: #6d7d74;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-panel {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.settings-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 360px;
  padding: 28px 20px;
  border: 1px solid #e7ece6;
  border-radius: 16px;
  background: #fcfcfb;
  text-align: center;
}

.settings-summary__name {
  max-width: 100%;
  margin-top: 16px;
  color: #18281f;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.settings-summary__email {
  max-width: 100%;
  margin-top: 6px;
  color: #7a887f;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.settings-summary__role {
  margin: 18px 0 22px;
}

.settings-main {
  min-width: 0;
}

.settings-form {
  max-width: 860px;
  padding: 28px 28px 18px;
  border: 1px solid #e7ece6;
  border-radius: 16px;
  background: #fff;

  :deep(.el-form-item__label) {
    color: #52645b;
    font-weight: 600;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 12px;
    box-shadow: 0 0 0 1px #dfe6df inset;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background: #f7f8f6;
    box-shadow: 0 0 0 1px #e4e9e4 inset;
  }
}

.settings-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 18px;
}

.settings-actions {
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    gap: 12px;
  }

  .el-button {
    min-width: 112px;
    border-radius: 12px;
  }
}

.merchant-apply-card {
  margin-bottom: 18px;
  padding: 20px 22px;
  border-radius: 16px;
  background: #fbfaf6;
  border: 1px solid #e8dfc8;
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

.address-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.address-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 22px;
  border: 1px solid #e7ece6;
  border-radius: 16px;
  background: #fcfcfb;

  .el-button {
    border-radius: 12px;
  }
}

.address-toolbar__title {
  color: #18372d;
  font-size: 18px;
  font-weight: 700;
}

.address-toolbar__desc {
  margin-top: 6px;
  color: #6d7d74;
  font-size: 13px;
  line-height: 1.6;
}

.address-list {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.address-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid #e7ece6;
  border-radius: 16px;
  background: #fff;
}

.address-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #18372d;

  strong {
    font-size: 16px;
  }

  span {
    color: #5f7168;
    font-size: 14px;
  }
}

.address-card__location {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  color: #42564c;
  line-height: 1.65;

  .el-icon {
    flex: 0 0 auto;
    margin-top: 4px;
    color: #1f513f;
  }
}

.address-card__remark {
  margin-top: 8px;
  color: #8a6a28;
  font-size: 13px;
}

.address-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.address-edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.address-map-wrap {
  width: 100%;
  border: 1px solid #dfe6df;
  border-radius: 14px;
  overflow: hidden;
  background: #f7f8f6;
}

.address-map {
  width: 100%;
  height: 280px;
}

.address-map-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: #617268;
  font-size: 13px;
  line-height: 1.5;
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

:global(.content-edit-dialog.el-dialog) {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
}

:global(.content-edit-dialog .el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1f6f5c, #2f8a72);
}

:global(.content-edit-dialog .el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

:global(.content-edit-dialog .el-dialog__headerbtn) {
  top: 20px;
}

:global(.content-edit-dialog .el-dialog__close) {
  color: rgba(255, 255, 255, 0.86);
}

:global(.content-edit-dialog .el-dialog__close:hover) {
  color: #fff;
}

:global(.content-edit-dialog .el-dialog__body),
:global(.content-edit-dialog .el-dialog__footer) {
  padding: 0;
}

.content-edit-body {
  padding: 24px;
}

.content-edit-head {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5ebe6;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #183153;
  }

  p {
    margin: 6px 0 0;
    color: #64756d;
    font-size: 14px;
    line-height: 1.6;
  }
}

.content-edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  .full {
    grid-column: 1 / -1;
  }
}

.content-edit-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    color: #43534d;
    font-weight: 600;
    line-height: 1;
    margin-bottom: 10px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 12px;
    box-shadow: 0 0 0 1px #d7e0db inset;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-textarea__inner:focus) {
    box-shadow: 0 0 0 1px #1f6f5c inset;
  }
}

.content-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5ebe6;
  background: #f8faf9;
}

.content-edit-cancel,
.content-edit-submit {
  border-radius: 10px;
  padding: 10px 22px;
}

.content-edit-submit {
  border: none;
  background: linear-gradient(135deg, #1f6f5c, #2f8a72);
  font-weight: 600;
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

  .address-toolbar,
  .address-card {
    grid-template-columns: 1fr;
  }

  .merchant-resource-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .merchant-resource-actions {
    justify-content: flex-start;
  }

  .address-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .address-card__actions {
    justify-content: flex-start;
  }

  .address-edit-grid {
    grid-template-columns: 1fr;
  }

  .settings-panel {
    grid-template-columns: 1fr;
  }

  .settings-summary {
    min-height: 0;
  }

  .settings-form {
    padding: 20px 16px 12px;
  }

  .settings-form__grid {
    grid-template-columns: 1fr;
  }

  .merchant-apply-card__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .history-list .history-item {
    flex-direction: column;
  }

  .history-list .history-item :deep(.el-image) {
    width: 100% !important;
    height: 180px !important;
  }

  .profile-overview-row,
  .profile-detail-grid {
    grid-template-columns: 1fr;
  }

  .profile-signal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-section-wide {
    grid-column: auto;
  }

  .profile-section-header {
    flex-direction: column;
  }

  .dislike-list-item {
    grid-template-columns: 76px minmax(0, 1fr);
  }

  .dislike-list-item .el-button {
    grid-column: 1 / -1;
    justify-self: flex-start;
  }

  .dislike-cover,
  .dislike-cover-error {
    width: 76px;
    height: 58px;
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

  .content-edit-grid {
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
