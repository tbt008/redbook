<template>
  <div class="content-statistics">
    <h2 class="page-title">内容统计</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon total">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalContents }}</div>
            <div class="stat-label">总内容数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon today">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayNewContents }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingContents }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon comments">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalComments }}</div>
            <div class="stat-label">总评论数</div>
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
              <span>内容发布趋势</span>
              <el-radio-group v-model="timeRange" size="small" @change="loadContentTrend">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="contentTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>内容类型分布</span>
            </div>
          </template>
          <div ref="contentTypeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地区分布 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>内容地区分布 TOP 10</span>
            </div>
          </template>
          <el-table :data="regionData" v-loading="loadingRegion" stripe>
            <el-table-column type="index" label="排名" width="60">
              <template #default="{ $index }">
                <span class="rank" :class="{ top: $index < 3 }">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="region" label="地区" />
            <el-table-column prop="count" label="内容数量" width="120" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Plus, Clock, ChatDotRound } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '@/util/request'

const timeRange = ref('week')

const stats = ref({
  totalContents: 0,
  todayNewContents: 0,
  pendingContents: 0,
  totalComments: 0
})

const regionData = ref<any[]>([])
const loadingRegion = ref(false)

const contentTrendChart = ref<HTMLDivElement>()
const contentTypeChart = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const contentTypeNames: Record<number, string> = {
  1: '图文',
  2: '问答',
  3: '视频'
}

const loadStats = async () => {
  try {
    const res: any = await request.get('/admin/statistics/dashboard')
    if (res.code === 200) {
      stats.value = {
        totalContents: res.data?.totalContents || 0,
        todayNewContents: res.data?.todayNewContents || 0,
        pendingContents: res.data?.pendingContents || 0,
        totalComments: res.data?.totalComments || 0
      }
    }
  } catch (error: any) {
    console.error('加载dashboard失败:', error)
  }
}

const loadContentStatistics = async () => {
  try {
    const days = timeRange.value === 'week' ? 7 : 30
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const res: any = await request.get('/admin/statistics/content', {
      params: { startDate, endDate }
    })
    
    if (res.code === 200) {
      // 内容类型分布
      const contentTypeDistribution = res.data?.contentTypeDistribution || {}
      
      if (typeChart) {
        typeChart.setOption({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', left: 'center' },
          series: [{
            name: '内容类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
            data: Object.entries(contentTypeDistribution).map(([key, value]) => ({
              value: value as number,
              name: contentTypeNames[parseInt(key)] || `类型${key}`
            }))
          }]
        })
      }
    }
  } catch (error: any) {
    console.error('加载内容统计失败:', error)
  }
}

const loadContentTrend = async () => {
  if (!trendChart) return
  
  try {
    const days = timeRange.value === 'week' ? 7 : 30
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const res: any = await request.get('/admin/statistics/content', {
      params: { startDate, endDate }
    })
    
    if (res.code === 200) {
      const dailyNewContents = res.data?.dailyNewContents || {}
      const dates = Object.keys(dailyNewContents).sort()
      const counts = dates.map(date => dailyNewContents[date])
      
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value' },
        series: [{
          name: '发布量',
          type: 'bar',
          data: counts,
          itemStyle: { color: '#409eff' }
        }]
      })
    }
  } catch (error: any) {
    console.error('加载内容趋势失败:', error)
  }
}

const loadRegionDistribution = async () => {
  loadingRegion.value = true
  try {
    const res: any = await request.get('/admin/statistics/region-distribution')
    if (res.code === 200) {
      regionData.value = (res.data || []).slice(0, 10)
    }
  } catch (error: any) {
    console.error('加载地区分布失败:', error)
  } finally {
    loadingRegion.value = false
  }
}

const initCharts = () => {
  if (contentTrendChart.value) {
    trendChart = echarts.init(contentTrendChart.value)
  }
  if (contentTypeChart.value) {
    typeChart = echarts.init(contentTypeChart.value)
  }
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
      &.today { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.pending { background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); }
      &.comments { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
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
