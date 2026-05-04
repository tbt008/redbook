<template>
  <div class="user-statistics admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">用户统计</h2>
        <p class="admin-hero__subtitle">观察用户增长、类型分布与账号状态变化。</p>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon total"><el-icon><User /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.totalUsers }}</div><div class="stat-label">用户总数</div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon new"><el-icon><UserFilled /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.todayNewUsers }}</div><div class="stat-label">今日新增</div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.monthActiveUsers }}</div><div class="stat-label">近30天活跃</div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon certified"><el-icon><Medal /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.userType4 }}</div><div class="stat-label">管理员账号</div></div></el-card></el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>用户增长趋势</span><el-radio-group v-model="timeRange" size="small" @change="loadUserTrend"><el-radio-button label="week">近7天</el-radio-button><el-radio-button label="month">近30天</el-radio-button></el-radio-group></div></template>
          <div ref="userTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>用户类型分布</span></div></template>
          <div ref="userTypeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header><div class="card-header"><span>用户状态分布</span></div></template>
          <div ref="userStatusChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { User, UserFilled, CircleCheck, Medal } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/util/request'

const timeRange = ref('week')
const stats = ref({ totalUsers: 0, todayNewUsers: 0, monthActiveUsers: 0, userType4: 0 })

const userTrendChart = ref<HTMLDivElement>()
const userTypeChart = ref<HTMLDivElement>()
const userStatusChart = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

const userTypeNames: Record<number, string> = { 1: '游客', 2: '商家', 3: '达人', 4: '管理员' }
const userStatusNames: Record<number, string> = { 0: '正常', 1: '禁用', 2: '禁言' }

const loadStats = async () => {
  const res: any = await request.get('/admin/statistics/dashboard')
  if (res.code === 200) {
    stats.value = {
      totalUsers: res.data?.totalUsers || 0,
      todayNewUsers: res.data?.todayNewUsers || 0,
      monthActiveUsers: res.data?.monthActiveUsers || 0,
      userType4: 0
    }
  }
}

const loadUserStatistics = async () => {
  const days = timeRange.value === 'week' ? 7 : 30
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res: any = await request.get('/admin/statistics/user', { params: { startDate, endDate } })
  if (res.code === 200) {
    const userTypeDistribution = res.data?.userTypeDistribution || {}
    const userStatusDistribution = res.data?.userStatusDistribution || {}
    stats.value.userType4 = userTypeDistribution[4] || 0
    typeChart?.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: '0', left: 'center' }, series: [{ name: '用户类型', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } }, data: Object.entries(userTypeDistribution).map(([key, value]) => ({ value: value as number, name: userTypeNames[parseInt(key)] || `类型${key}` })) }] })
    statusChart?.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: '0', left: 'center' }, series: [{ name: '用户状态', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } }, data: Object.entries(userStatusDistribution).map(([key, value]) => ({ value: value as number, name: userStatusNames[parseInt(key)] || `状态${key}` })) }] })
  }
}

const loadUserTrend = async () => {
  if (!trendChart) return
  const days = timeRange.value === 'week' ? 7 : 30
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res: any = await request.get('/admin/statistics/user', { params: { startDate, endDate } })
  if (res.code === 200) {
    const dailyNewUsers = res.data?.dailyNewUsers || {}
    const dates = Object.keys(dailyNewUsers).sort()
    const counts = dates.map((date) => dailyNewUsers[date])
    trendChart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: dates }, yAxis: { type: 'value' }, series: [{ name: '新增用户', type: 'line', data: counts, smooth: true, areaStyle: { opacity: 0.25 }, itemStyle: { color: '#2563eb' } }] })
  }
}

const initCharts = () => {
  if (userTrendChart.value) trendChart = echarts.init(userTrendChart.value)
  if (userTypeChart.value) typeChart = echarts.init(userTypeChart.value)
  if (userStatusChart.value) statusChart = echarts.init(userStatusChart.value)
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
  .stats-row, .chart-row { margin-bottom: 20px; }
  .stat-card { display: flex; align-items: center; gap: 16px; }
  .stat-icon { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px;
    &.total { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
    &.new { background: linear-gradient(135deg, #ea580c, #f59e0b); }
    &.active { background: linear-gradient(135deg, #0f766e, #14b8a6); }
    &.certified { background: linear-gradient(135deg, #7c3aed, #a855f7); } }
  .stat-value { font-size: 28px; font-weight: 700; color: #14213d; }
  .stat-label { margin-top: 4px; color: #667085; font-size: 14px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
}
</style>
