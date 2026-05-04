<template>
  <div class="dashboard admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">{{ isMerchant ? '商家数据中心' : '数据看板' }}</h2>
        <p class="admin-hero__subtitle">
          {{ isMerchant ? '掌握门店经营概况与订单状态。' : '集中查看平台资源、内容与订单的核心数据。' }}
        </p>
      </div>
    </div>

    <template v-if="isMerchant">
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon order">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.todayOrders || 0 }}</div>
                <div class="stat-label">今日订单</div>
                <div class="stat-extra">总订单 {{ statistics.totalOrders || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon income">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ statistics.totalIncome || 0 }}</div>
                <div class="stat-label">总收入</div>
                <div class="stat-extra">已完成 {{ statistics.completedOrders || 0 }} 单</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon food">
                <el-icon><Food /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.foodActiveCount || 0 }} / {{ statistics.foodCount || 0 }}</div>
                <div class="stat-label">美食数量</div>
                <div class="stat-extra">上架 / 总数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon hotel">
                <el-icon><House /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.hotelActiveCount || 0 }} / {{ statistics.hotelCount || 0 }}</div>
                <div class="stat-label">酒店数量</div>
                <div class="stat-extra">上架 / 总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="resource-stats">
        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>待支付订单</span>
                <el-tag type="warning">{{ statistics.pendingOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon warning"><Clock /></el-icon>
              <div class="resource-desc">等待用户支付</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>已支付订单</span>
                <el-tag type="success">{{ statistics.paidOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon success"><CircleCheck /></el-icon>
              <div class="resource-desc">待核销或待使用</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>已完成订单</span>
                <el-tag type="info">{{ statistics.completedOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon info"><Finished /></el-icon>
              <div class="resource-desc">已结算订单统计</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>订单总数</span>
                <el-tag type="primary">{{ statistics.totalOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon primary"><List /></el-icon>
              <div class="resource-desc">全部订单汇总</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="quick-actions">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-button type="primary" @click="goTo('/admin/merchant-foods')" style="width: 100%">
              <el-icon><Food /></el-icon>
              <span>发布美食</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="success" @click="goTo('/admin/merchant-hotels')" style="width: 100%">
              <el-icon><House /></el-icon>
              <span>发布酒店</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="warning" @click="goTo('/admin/merchant-attractions')" style="width: 100%">
              <el-icon><Location /></el-icon>
              <span>发布景点</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="info" @click="goTo('/admin/merchant-orders')" style="width: 100%">
              <el-icon><ShoppingCart /></el-icon>
              <span>查看订单</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </template>

    <template v-else>
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon user">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardData.totalUsers || 0 }}</div>
                <div class="stat-label">用户总数</div>
                <div class="stat-extra">今日新增 {{ dashboardData.todayNewUsers || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon content">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardData.totalContents || 0 }}</div>
                <div class="stat-label">内容总数</div>
                <div class="stat-extra">今日新增 {{ dashboardData.todayNewContents || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardData.pendingContents || 0 }}</div>
                <div class="stat-label">待审核内容</div>
                <div class="stat-extra">待审核评论 {{ dashboardData.pendingComments || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardData.monthActiveUsers || 0 }}</div>
                <div class="stat-label">月活用户</div>
                <div class="stat-extra">总评论 {{ dashboardData.totalComments || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="resource-stats">
        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>景点统计</span>
                <el-tag type="success">{{ dashboardData.totalAttractions || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><Location /></el-icon>
              <div class="resource-desc">平台景点总量 {{ dashboardData.totalAttractions || 0 }}</div>
              <div class="resource-extra">门票订单 {{ dashboardData.ticketOrderCount || 0 }} 单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>美食统计</span>
                <el-tag type="warning">{{ dashboardData.totalFoods || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><Food /></el-icon>
              <div class="resource-desc">平台美食总量 {{ dashboardData.totalFoods || 0 }}</div>
              <div class="resource-extra">外卖订单 {{ dashboardData.takeoutOrderCount || 0 }} 单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>酒店统计</span>
                <el-tag type="danger">{{ dashboardData.totalHotels || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><House /></el-icon>
              <div class="resource-desc">平台酒店总量 {{ dashboardData.totalHotels || 0 }}</div>
              <div class="resource-extra">酒店订单 {{ dashboardData.hotelOrderCount || 0 }} 单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <span>订单统计</span>
                <el-tag type="info">{{ totalOrderCount }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><ShoppingCart /></el-icon>
              <div class="resource-desc">平台订单总量</div>
              <div class="resource-extra order-breakdown">
                <span>景点 {{ dashboardData.ticketOrderCount || 0 }}</span>
                <span>美食 {{ dashboardData.takeoutOrderCount || 0 }}</span>
                <span>酒店 {{ dashboardData.hotelOrderCount || 0 }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="quick-actions">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-button type="primary" @click="goTo('/admin/audit-content')" style="width: 100%">
              <el-icon><DocumentChecked /></el-icon>
              <span>内容审核</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="success" @click="goTo('/admin/users')" style="width: 100%">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="warning" @click="goTo('/admin/announcements')" style="width: 100%">
              <el-icon><Bell /></el-icon>
              <span>公告管理</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="info" @click="goTo('/admin/statistics-hot')" style="width: 100%">
              <el-icon><TrendCharts /></el-icon>
              <span>热度统计</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Document,
  Clock,
  TrendCharts,
  Location,
  Food,
  House,
  DocumentChecked,
  Bell,
  ShoppingCart,
  Money,
  CircleCheck,
  Finished,
  List
} from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()
const dashboardData = ref<any>({})
const statistics = ref<any>({})

const isMerchant = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    return userInfo.userType === 2
  }
  return false
})

const totalOrderCount = computed(() => {
  return (
    (dashboardData.value.ticketOrderCount || 0) +
    (dashboardData.value.hotelOrderCount || 0) +
    (dashboardData.value.takeoutOrderCount || 0)
  )
})

const loadMerchantStatistics = async () => {
  try {
    const res: any = await request.get('/admin/merchant/statistics')
    if (res.code === 200) {
      statistics.value = res.data || {}
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

const loadAdminDashboardData = async () => {
  try {
    const res: any = await request.get('/admin/statistics/dashboard')
    if (res.code === 200) {
      dashboardData.value = res.data || {}
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

const goTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  if (isMerchant.value) {
    loadMerchantStatistics()
  } else {
    loadAdminDashboardData()
  }
})
</script>

<style scoped lang="scss">
.dashboard {
  .stats-cards,
  .resource-stats {
    margin-bottom: 24px;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: #fff;

    &.user {
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    }

    &.content {
      background: linear-gradient(135deg, #d97706, #f59e0b);
    }

    &.pending {
      background: linear-gradient(135deg, #dc2626, #f97316);
    }

    &.active {
      background: linear-gradient(135deg, #0f766e, #14b8a6);
    }

    &.order {
      background: linear-gradient(135deg, #334155, #64748b);
    }

    &.income {
      background: linear-gradient(135deg, #15803d, #22c55e);
    }

    &.food {
      background: linear-gradient(135deg, #b45309, #f97316);
    }

    &.hotel {
      background: linear-gradient(135deg, #0369a1, #0ea5e9);
    }
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    margin-bottom: 6px;
    font-size: 28px;
    font-weight: 700;
    color: #14213d;
  }

  .stat-label {
    margin-bottom: 4px;
    color: #475467;
    font-size: 14px;
  }

  .stat-extra {
    color: #98a2b3;
    font-size: 12px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .resource-content {
    padding: 18px 0;
    text-align: center;
  }

  .resource-icon {
    margin-bottom: 12px;
    font-size: 42px;
    color: #2563eb;

    &.warning {
      color: #f59e0b;
    }

    &.success {
      color: #16a34a;
    }

    &.info {
      color: #64748b;
    }

    &.primary {
      color: #2563eb;
    }
  }

  .resource-desc {
    color: #475467;
    font-size: 14px;
  }

  .resource-extra {
    margin-top: 8px;
    color: #98a2b3;
    font-size: 12px;
  }

  .order-breakdown {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .quick-actions {
    .el-button {
      height: 48px;
      font-size: 15px;
    }

    .el-icon {
      margin-right: 8px;
    }
  }
}
</style>
