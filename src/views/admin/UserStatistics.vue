<template>
  <div class="user-statistics">
    <h2 class="page-title">用户统计</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon total">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon new">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayNewUsers }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon active">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.monthActiveUsers }}</div>
            <div class="stat-label">近30天活跃</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon certified">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.userType4 }}</div>
            <div class="stat-label">认证用户</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="timeRange" size="small" @change="loadUserTrend">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户类型分布</span>
            </div>
          </template>
          <div ref="userTypeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户状态分布 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户状态分布</span>
            </div>
          </template>
          <div ref="userStatusChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, UserFilled, CircleCheck, Medal } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/util/request'

const timeRange = ref('week')

const stats = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  monthActiveUsers: 0,
  userType4: 0
})

const userTrendChart = ref<HTMLDivElement>()
const userTypeChart = ref<HTMLDivElement>()
const userStatusChart = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

const userTypeNames: Record<number, string> = {
  1: '普通用户',
  2: 'VIP用户',
  3: '创作者',
  4: '管理员'
}

const userStatusNames: Record<number, string> = {
  0: '正常',
  1: '禁用',
  2: '待审核'
}

const loadStats = async () => {
  try {
    const res: any = await request.get('/admin/statistics/dashboard')
    if (res.code === 200) {
      stats.value = {
        totalUsers: res.data?.totalUsers || 0,
        todayNewUsers: res.data?.todayNewUsers || 0,
        monthActiveUsers: res.data?.monthActiveUsers || 0,
        userType4: 0
      }
    }
  } catch (error: any) {
    console.error('加载dashboard失败:', error)
  }
}

const loadUserStatistics = async () => {
  try {
    const days = timeRange.value === 'week' ? 7 : 30
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const res: any = await request.get('/admin/statistics/user', {
      params: { startDate, endDate }
    })
    
    if (res.code === 200) {
      // 用户类型分布
      const userTypeDistribution = res.data?.userTypeDistribution || {}
      stats.value.userType4 = userTypeDistribution[4] || 0
      
      if (typeChart) {
        typeChart.setOption({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', left: 'center' },
          series: [{
            name: '用户类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
            data: Object.entries(userTypeDistribution).map(([key, value]) => ({
              value: value as number,
              name: userTypeNames[parseInt(key)] || `类型${key}`
            }))
          }]
        })
      }

      // 用户状态分布
      const userStatusDistribution = res.data?.userStatusDistribution || {}
      if (statusChart) {
        statusChart.setOption({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', left: 'center' },
          series: [{
            name: '用户状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
            data: Object.entries(userStatusDistribution).map(([key, value]) => ({
              value: value as number,
              name: userStatusNames[parseInt(key)] || `状态${key}`
            }))
          }]
        })
      }
    }
  } catch (error: any) {
    console.error('加载用户统计失败:', error)
  }
}

const loadUserTrend = async () => {
  if (!trendChart) return
  
  try {
    const days = timeRange.value === 'week' ? 7 : 30
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const res: any = await request.get('/admin/statistics/user', {
      params: { startDate, endDate }
    })
    
    if (res.code === 200) {
      const dailyNewUsers = res.data?.dailyNewUsers || {}
      const dates = Object.keys(dailyNewUsers).sort()
      const counts = dates.map(date => dailyNewUsers[date])
      
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value' },
        series: [{
          name: '新增用户',
          type: 'line',
          data: counts,
          smooth: true,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#409eff' }
        }]
      })
    }
  } catch (error: any) {
    console.error('加载用户趋势失败:', error)
  }
}

const initCharts = () => {
  if (userTrendChart.value) {
    trendChart = echarts.init(userTrendChart.value)
  }
  if (userTypeChart.value) {
    typeChart = echarts.init(userTypeChart.value)
  }
  if (userStatusChart.value) {
    statusChart = echarts.init(userStatusChart.value)
  }
}

onMounted(() => {
  loadStats()
  
  setTimeout(() => {
    initCharts()
    loadUserTrend()
    loadUserStatistics()
  }, 100)
})
</script>

<style scoped lang="scss">
.user-statistics {
  .page-title {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;

      &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.new { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.active { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.certified { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    }

    .stat-content {
      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #333;
      }
      .stat-label {
        font-size: 14px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .rank {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 4px;
    background: #f0f0f0;
    color: #666;
    font-weight: 600;

    &.top {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #fff;
    }
  }
}
</style>
