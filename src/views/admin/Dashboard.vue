<template>
  <div class="dashboard">
    <h2 class="page-title">{{ isMerchant ? '商家数据中心' : '数据看板' }}</h2>

    <!-- 商家数据看板 -->
    <template v-if="isMerchant">
      <!-- 核心数据卡片 -->
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
                <div class="stat-extra">总订单: {{ statistics.totalOrders || 0 }}</div>
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
                <div class="stat-extra">已完成: {{ statistics.completedOrders || 0 }} 单</div>
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
                <div class="stat-extra">上架/总数</div>
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
                <div class="stat-extra">上架/总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 订单状态统计 -->
      <el-row :gutter="20" class="resource-stats">
        <el-col :span="6">
          <el-card>
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
          <el-card>
            <template #header>
              <div class="card-header">
                <span>已支付订单</span>
                <el-tag type="success">{{ statistics.paidOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon success"><CircleCheck /></el-icon>
              <div class="resource-desc">待核销/使用</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>已完成订单</span>
                <el-tag type="info">{{ statistics.completedOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon info"><Finished /></el-icon>
              <div class="resource-desc">已完成的订单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>订单总数</span>
                <el-tag type="primary">{{ statistics.totalOrders || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon primary"><List /></el-icon>
              <div class="resource-desc">所有订单统计</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
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
            <el-button type="warning" @click="goTo('/admin/merchant-orders')" style="width: 100%">
              <el-icon><ShoppingCart /></el-icon>
              <span>查看订单</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </template>

    <!-- 管理员数据看板 -->
    <template v-else>
      <!-- 核心数据卡片 -->
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon user">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardData.totalUsers || 0 }}</div>
                <div class="stat-label">总用户数</div>
                <div class="stat-extra">今日新增: {{ dashboardData.todayNewUsers || 0 }}</div>
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
                <div class="stat-label">总内容数</div>
                <div class="stat-extra">今日新增: {{ dashboardData.todayNewContents || 0 }}</div>
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
                <div class="stat-extra">待审核评论: {{ dashboardData.pendingComments || 0 }}</div>
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
                <div class="stat-extra">总评论: {{ dashboardData.totalComments || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 资源统计 -->
      <el-row :gutter="20" class="resource-stats">
        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>景点统计</span>
                <el-tag type="success">{{ dashboardData.totalAttractions || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><Location /></el-icon>
              <div class="resource-desc">平台共有 {{ dashboardData.totalAttractions || 0 }} 个景点</div>
              <div class="resource-extra">门票预订量: {{ dashboardData.ticketOrderCount || 0 }} 单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>美食统计</span>
                <el-tag type="warning">{{ dashboardData.totalFoods || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><Food /></el-icon>
              <div class="resource-desc">平台共有 {{ dashboardData.totalFoods || 0 }} 个美食</div>
              <div class="resource-extra">外卖订单量: {{ dashboardData.takeoutOrderCount || 0 }} 单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>酒店统计</span>
                <el-tag type="danger">{{ dashboardData.totalHotels || 0 }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><House /></el-icon>
              <div class="resource-desc">平台共有 {{ dashboardData.totalHotels || 0 }} 个酒店</div>
              <div class="resource-extra">酒店预订量: {{ dashboardData.hotelOrderCount || 0 }} 单</div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>订单统计</span>
                <el-tag type="info">{{ (dashboardData.ticketOrderCount || 0) + (dashboardData.hotelOrderCount || 0) + (dashboardData.takeoutOrderCount || 0) }}</el-tag>
              </div>
            </template>
            <div class="resource-content">
              <el-icon class="resource-icon"><ShoppingCart /></el-icon>
              <div class="resource-desc">总订单量</div>
              <div class="resource-extra">
                <span>景点: {{ dashboardData.ticketOrderCount || 0 }}</span>
                <span>美食: {{ dashboardData.takeoutOrderCount || 0 }}</span>
                <span>酒店: {{ dashboardData.hotelOrderCount || 0 }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
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
              <span>发布公告</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="info" @click="goTo('/admin/statistics-hot')" style="width: 100%">
              <el-icon><TrendCharts /></el-icon>
              <span>数据统计</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Document, Clock, TrendCharts, Location, Food, House, DocumentChecked, Bell, ShoppingCart, Money, CircleCheck, Finished, List, Grid } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()
const dashboardData = ref<any>({})
const statistics = ref<any>({})

// 判断是否是商家
const isMerchant = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    return userInfo.userType === 2
  }
  return false
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
      dashboardData.value = res.data
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
  .page-title {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .stats-cards {
    margin-bottom: 24px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;

          &.user {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
          }

          &.content {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #fff;
          }

          &.pending {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            color: #fff;
          }

          &.active {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #fff;
          }

          &.order {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
          }

          &.income {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: #fff;
          }

          &.food {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #fff;
          }

          &.hotel {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #fff;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }

          .stat-extra {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }

  .resource-stats {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .resource-content {
      text-align: center;
      padding: 20px 0;

      .resource-icon {
        font-size: 48px;
        color: #1890ff;
        margin-bottom: 12px;

        &.warning {
          color: #e6a23c;
        }

        &.success {
          color: #67c23a;
        }

        &.info {
          color: #909399;
        }

        &.primary {
          color: #409eff;
        }
      }

      .resource-desc {
        font-size: 14px;
        color: #666;
      }

      .resource-extra {
        margin-top: 8px;
        font-size: 12px;
        color: #999;

        span {
          margin-right: 12px;
        }
      }
    }
  }

  .quick-actions {
    .card-header {
      font-weight: 600;
    }

    .el-button {
      height: 48px;
      font-size: 16px;

      .el-icon {
        margin-right: 8px;
      }
    }
  }
}
</style>
