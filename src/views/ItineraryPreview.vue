<template>
  <div class="itinerary-preview-page">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="router.push('/home')">
          <h1>莆田文旅</h1>
        </div>
        <div class="header-actions">
          <el-button v-if="itinerary?.id" type="primary" @click="editItinerary">编辑</el-button>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </div>
    </el-header>

    <main v-loading="loading" class="preview-container">
      <el-empty v-if="!loading && !itinerary" description="行程不存在或暂无权限查看" />

      <template v-else-if="itinerary">
        <section class="hero">
          <div>
            <p class="eyebrow">行程预览</p>
            <h2>{{ itinerary.title || '我的行程' }}</h2>
            <p v-if="itinerary.description" class="description">{{ itinerary.description }}</p>
          </div>
          <div class="summary">
            <span>{{ formatDateRange(itinerary.startDate, itinerary.endDate) }}</span>
            <span>{{ itinerary.daysCount || itinerary.days || dayList.length }} 天</span>
            <span>预算 ¥{{ itinerary.budget || itinerary.totalBudget || 0 }}</span>
          </div>
        </section>

        <section v-if="dayList.length" class="day-list">
          <article v-for="day in dayList" :key="day.id || day.dayNumber" class="day-section">
            <div class="day-header">
              <div>
                <h3>第 {{ day.dayNumber }} 天</h3>
                <p>{{ formatDate(day.date) }}</p>
              </div>
              <span>{{ day.items?.length || 0 }} 个项目</span>
            </div>

            <div v-if="day.items?.length" class="item-list">
              <div v-for="item in day.items" :key="item.id || `${day.dayNumber}-${item.name}`" class="item">
                <div class="item-time">{{ item.startTime || '--:--' }}</div>
                <div class="item-main">
                  <h4>{{ item.name }}</h4>
                  <p>{{ getTypeLabel(item.type) }} · {{ item.duration || 0 }} 分钟 · ¥{{ item.cost || 0 }}</p>
                  <p v-if="item.address" class="muted">{{ item.address }}</p>
                  <p v-if="item.notes" class="muted">{{ item.notes }}</p>
                </div>
              </div>
            </div>
            <el-empty v-else description="当天暂无安排" />
          </article>
        </section>

        <el-empty v-else description="暂无详细行程安排" />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { formatDateOnly, type DateInput } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const itinerary = ref<any>(null)

const itineraryId = computed(() => {
  const id = route.params.id || route.query.id
  return Array.isArray(id) ? id[0] : id
})
const dayList = computed(() => itinerary.value?.dayList || [])

const formatDate = (date?: DateInput) => formatDateOnly(date, '')

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return '时间待定'
  return `${formatDate(start)} - ${formatDate(end)}`
}

const getTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    attraction: '景点',
    food: '美食',
    hotel: '住宿'
  }
  return map[type || ''] || '安排'
}

const editItinerary = () => {
  router.push({ path: '/itinerary/editor', query: { id: itinerary.value.id } })
}

onMounted(async () => {
  if (!itineraryId.value) {
    ElMessage.error('缺少行程ID')
    return
  }

  loading.value = true
  try {
    const res: any = await request.get(`/itinerary/${itineraryId.value}`)
    itinerary.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载行程失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.itinerary-preview-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  max-width: 1180px;
  height: 60px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  cursor: pointer;

  h1 {
    margin: 0;
    color: #409eff;
    font-size: 22px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.preview-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}

.hero,
.day-section {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.hero {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;

  h2 {
    margin: 4px 0 10px;
    font-size: 28px;
    color: #303133;
  }
}

.eyebrow,
.description,
.muted,
.day-header p {
  color: #606266;
}

.eyebrow {
  margin: 0;
  font-size: 14px;
}

.description {
  margin: 0;
}

.summary {
  min-width: 260px;
  display: grid;
  gap: 10px;
  color: #303133;
}

.day-list {
  display: grid;
  gap: 16px;
}

.day-section {
  padding: 22px;
}

.day-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;

  h3,
  p {
    margin: 0;
  }
}

.item-list {
  display: grid;
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 14px;
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.item-time {
  color: #409eff;
  font-weight: 700;
}

.item-main {
  h4,
  p {
    margin: 0 0 6px;
  }
}

@media (max-width: 720px) {
  .hero {
    display: block;
  }

  .summary {
    margin-top: 18px;
  }

  .item {
    grid-template-columns: 1fr;
  }
}
</style>
