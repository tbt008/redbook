<template>
  <div class="hot-statistics admin-theme-page">
    <div class="admin-hero">
      <div class="admin-hero__content">
        <div class="admin-hero__eyebrow">Admin Console</div>
        <h2 class="page-title">热门排行</h2>
        <p class="admin-hero__subtitle">聚合搜索关键词、地区热度和商旅资源排行榜。</p>
      </div>
    </div>

    <el-row :gutter="20" class="panel-row">
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>热门搜索关键词</span><el-tag type="primary">TOP 10</el-tag></div></template>
          <el-table :data="hotKeywords" v-loading="loadingKeywords" stripe>
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="keyword" label="关键词" />
            <el-table-column prop="count" label="搜索次数" width="120" align="right" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>地区分布</span></div></template>
          <el-table :data="regionDistribution" v-loading="loadingRegion" stripe>
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="region" label="地区" />
            <el-table-column prop="count" label="内容数" width="120" align="right" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="panel-row">
      <el-col :span="8">
        <el-card>
          <template #header><div class="card-header"><span>热门景点</span><el-tag type="success">TOP 10</el-tag></div></template>
          <div class="hot-list">
            <div v-for="(item, index) in hotAttractions" :key="item.id" class="hot-item"><div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div><div class="info"><div class="name">{{ item.name }}</div><div class="stats"><span>浏览 {{ item.viewCount }}</span><span>收藏 {{ item.collectCount }}</span></div></div></div>
            <el-empty v-if="hotAttractions.length === 0 && !loadingAttractions" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><div class="card-header"><span>热门美食</span><el-tag type="warning">TOP 10</el-tag></div></template>
          <div class="hot-list">
            <div v-for="(item, index) in hotFoods" :key="item.id" class="hot-item"><div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div><div class="info"><div class="name">{{ item.name }}</div><div class="stats"><span>浏览 {{ item.viewCount }}</span><span>收藏 {{ item.collectCount }}</span></div></div></div>
            <el-empty v-if="hotFoods.length === 0 && !loadingFoods" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><div class="card-header"><span>热门酒店</span><el-tag type="danger">TOP 10</el-tag></div></template>
          <div class="hot-list">
            <div v-for="(item, index) in hotHotels" :key="item.id" class="hot-item"><div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div><div class="info"><div class="name">{{ item.name }}</div><div class="stats"><span>浏览 {{ item.viewCount }}</span><span>收藏 {{ item.collectCount }}</span></div></div></div>
            <el-empty v-if="hotHotels.length === 0 && !loadingHotels" description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'

const loadingKeywords = ref(false)
const loadingRegion = ref(false)
const loadingAttractions = ref(false)
const loadingFoods = ref(false)
const loadingHotels = ref(false)
const hotKeywords = ref<any[]>([])
const regionDistribution = ref<any[]>([])
const hotAttractions = ref<any[]>([])
const hotFoods = ref<any[]>([])
const hotHotels = ref<any[]>([])

const loadHotKeywords = async () => {
  loadingKeywords.value = true
  try {
    const res: any = await request.get('/admin/statistics/hot-keywords', { params: { limit: 10 } })
    if (res.code === 200) hotKeywords.value = res.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loadingKeywords.value = false
  }
}

const loadRegionDistribution = async () => {
  loadingRegion.value = true
  try {
    const res: any = await request.get('/admin/statistics/region-distribution')
    if (res.code === 200) regionDistribution.value = (res.data || []).slice(0, 10)
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loadingRegion.value = false
  }
}

const loadHotAttractions = async () => {
  loadingAttractions.value = true
  try {
    const res: any = await request.get('/admin/statistics/hot-attractions', { params: { limit: 10 } })
    if (res.code === 200) hotAttractions.value = res.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loadingAttractions.value = false
  }
}

const loadHotFoods = async () => {
  loadingFoods.value = true
  try {
    const res: any = await request.get('/admin/statistics/hot-foods', { params: { limit: 10 } })
    if (res.code === 200) hotFoods.value = res.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loadingFoods.value = false
  }
}

const loadHotHotels = async () => {
  loadingHotels.value = true
  try {
    const res: any = await request.get('/admin/statistics/hot-hotels', { params: { limit: 10 } })
    if (res.code === 200) hotHotels.value = res.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loadingHotels.value = false
  }
}

onMounted(() => {
  loadHotKeywords()
  loadRegionDistribution()
  loadHotAttractions()
  loadHotFoods()
  loadHotHotels()
})
</script>

<style scoped lang="scss">
.hot-statistics {
  .panel-row { margin-bottom: 20px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
  .hot-list { min-height: 330px; }
  .hot-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f2f4f7; }
  .rank { width: 28px; height: 28px; border-radius: 10px; background: #e5e7eb; color: #475467; display: flex; align-items: center; justify-content: center; font-weight: 700;
    &.top { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; } }
  .info { flex: 1; min-width: 0; }
  .name { margin-bottom: 6px; color: #14213d; font-weight: 600; }
  .stats { display: flex; gap: 12px; color: #667085; font-size: 12px; }
}
</style>
