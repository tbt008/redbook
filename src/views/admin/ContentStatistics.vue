<template>
  <div class="content-statistics admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">内容统计</h2>
        <p class="admin-hero__subtitle">查看内容发布趋势、类型分布与地区热度表现。</p>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon total"><el-icon><Document /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.totalContents }}</div><div class="stat-label">内容总数</div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon today"><el-icon><Plus /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.todayNewContents }}</div><div class="stat-label">今日新增</div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon pending"><el-icon><Clock /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.pendingContents }}</div><div class="stat-label">待审核</div></div></el-card></el-col>
      <el-col :span="6"><el-card class="stat-card"><div class="stat-icon comments"><el-icon><ChatDotRound /></el-icon></div><div class="stat-content"><div class="stat-value">{{ stats.totalComments }}</div><div class="stat-label">评论总数</div></div></el-card></el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>内容发布趋势</span><el-radio-group v-model="timeRange" size="small" @change="loadContentTrend"><el-radio-button label="week">近7天</el-radio-button><el-radio-button label="month">近30天</el-radio-button></el-radio-group></div></template>
          <div ref="contentTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>内容类型分布</span></div></template>
          <div ref="contentTypeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header><div class="card-header"><span>内容地区分布 TOP 10</span></div></template>
          <el-table :data="regionData" v-loading="loadingRegion" stripe>
            <el-table-column type="index" label="排名" width="70"><template #default="{ $index }"><span class="rank" :class="{ top: $index < 3 }">{{ $index + 1 }}</span></template></el-table-column>
            <el-table-column prop="region" label="地区" />
            <el-table-column prop="count" label="内容数量" width="120" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Document, Plus, Clock, ChatDotRound } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/util/request'

const timeRange = ref('week')
const stats = ref({ totalContents: 0, todayNewContents: 0, pendingContents: 0, totalComments: 0 })
const regionData = ref<any[]>([])
const loadingRegion = ref(false)

const contentTrendChart = ref<HTMLDivElement>()
const contentTypeChart = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const contentTypeNames: Record<number, string> = { 1: '图文', 2: '问答', 3: '视频' }

const loadStats = async () => {
  const res: any = await request.get('/admin/statistics/dashboard')
  if (res.code === 200) {
    stats.value = {
      totalContents: res.data?.totalContents || 0,
      todayNewContents: res.data?.todayNewContents || 0,
      pendingContents: res.data?.pendingContents || 0,
      totalComments: res.data?.totalComments || 0
    }
  }
}

const loadContentStatistics = async () => {
  const days = timeRange.value === 'week' ? 7 : 30
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res: any = await request.get('/admin/statistics/content', { params: { startDate, endDate } })
  if (res.code === 200) {
    const contentTypeDistribution = res.data?.contentTypeDistribution || {}
    typeChart?.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: '0', left: 'center' }, series: [{ name: '内容类型', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } }, data: Object.entries(contentTypeDistribution).map(([key, value]) => ({ value: value as number, name: contentTypeNames[parseInt(key)] || `类型${key}` })) }] })
  }
}

const loadContentTrend = async () => {
  if (!trendChart) return
  const days = timeRange.value === 'week' ? 7 : 30
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res: any = await request.get('/admin/statistics/content', { params: { startDate, endDate } })
  if (res.code === 200) {
    const dailyNewContents = res.data?.dailyNewContents || {}
    const dates = Object.keys(dailyNewContents).sort()
    const counts = dates.map((date) => dailyNewContents[date])
    trendChart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: dates }, yAxis: { type: 'value' }, series: [{ name: '发布量', type: 'bar', data: counts, itemStyle: { color: '#2563eb' } }] })
  }
}

const loadRegionDistribution = async () => {
  loadingRegion.value = true
  try {
    const res: any = await request.get('/admin/statistics/region-distribution')
    if (res.code === 200) regionData.value = (res.data || []).slice(0, 10)
  } finally {
    loadingRegion.value = false
  }
}

const initCharts = () => {
  if (contentTrendChart.value) trendChart = echarts.init(contentTrendChart.value)
  if (contentTypeChart.value) typeChart = echarts.init(contentTypeChart.value)
}

onMounted(() => {
  loadStats()
  loadRegionDistribution()
  setTimeout(() => {
    initCharts()
    loadContentTrend()
    loadContentStatistics()
  }, 100)
})
</script>

<style scoped lang="scss">
.content-statistics {
  .stats-row, .chart-row { margin-bottom: 20px; }
  .stat-card { display: flex; align-items: center; gap: 16px; }
  .stat-icon { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px;
    &.total { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
    &.today { background: linear-gradient(135deg, #f97316, #f59e0b); }
    &.pending { background: linear-gradient(135deg, #dc2626, #f97316); }
    &.comments { background: linear-gradient(135deg, #0f766e, #14b8a6); } }
  .stat-value { font-size: 28px; font-weight: 700; color: #14213d; }
  .stat-label { margin-top: 4px; color: #667085; font-size: 14px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
  .rank { display: inline-flex; width: 26px; height: 26px; align-items: center; justify-content: center; border-radius: 8px; background: #e5e7eb; color: #475467; font-weight: 700;
    &.top { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; } }
}
</style>
