<template>
  <div class="constest">
    <div class="constest-main">
      <div class="contest-layout">
        <!-- 左侧比赛列表 -->
        <div class="contest-content">
          <!-- 顶部搜索和筛选栏 -->
          <div class="contest-toolbar">
            <div class="search-filter-bar">
              <el-select v-model="statusFilter" placeholder="全部" style="width: 120px; margin-right: 10px;">
                <el-option label="全部" value="all"></el-option>
                <el-option label="进行中" value="ongoing"></el-option>
                <el-option label="已结束" value="ended"></el-option>
              </el-select>
              <el-select v-model="searchType" placeholder="赛制" style="width: 100px; margin-right: 10px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="IOI" value="1"></el-option>
                <el-option label="ACM" value="2"></el-option>
              </el-select>
              <el-input v-model="searchKeyword" placeholder="搜索比赛" clearable style="flex: 1;">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>
          
          <!-- 合并的比赛列表容器 -->
          <div class="contest-container" v-if="combinedContestList.length">
            <div class="contest-list">
              <div class="contest-section">
                <span class="contest-title">{{ statusFilter === 'all' ? '所有比赛' : statusFilter === 'ongoing' ? '进行中的比赛' : '已结束的比赛' }}</span>
                <div class="contest-item" v-for="(item, index) in combinedContestList" :key="index">
                  <img :src="item.cover" alt="" class="contest-item-img" />
                  <div style="width: 100%; margin-left: 20px">
                    <div class="contest-item-title">
                      {{ item.title }}
                      <el-tag v-if="item.isPassword" :type="'primary'" effect="dark"><el-icon>
                          <Lock />
                        </el-icon>密码</el-tag>
                      <el-tag style="margin-left: 10px" v-if="item.isInvite" :type="'success'" effect="dark"><el-icon>
                          <key />
                        </el-icon>邀请</el-tag>
                      <el-tag style="margin-left: 10px" v-if="item.type == 1" :type="'primary'" effect="dark">IOI</el-tag>
                      <el-tag style="margin-left: 10px" v-else :type="'primary'" effect="dark">ACM</el-tag>
                      <el-tag style="margin-left: 10px" :type="getStatus(item).type" effect="dark">
                        {{ getStatus(item).label }}
                      </el-tag>
                    </div>

                    <div class="contest-item-info">
                      <el-icon>
                        <BellFilled />
                      </el-icon>比赛时间 : {{ formatDate(item.startTime) }} 至 {{ formatDate(item.endTime) }}
                    </div>
                    <div class="contest-item-info" style="display: flex; justify-content: flex-start; gap: 40px;">
                      <div>
                        <el-icon>
                          <Promotion />
                        </el-icon> 主办方 : {{ item.organizer || 'cubecode.cn' }}
                      </div>
                      <div>
                        <el-icon>
                          <UserFilled />
                        </el-icon> 参与人数 ：{{ item.participationNumber }}
                      </div>
                    </div>
                    <div class="contest-item-info">
                      语言 : {{ item.language }}
                      <template v-if="getStatus(item).label === '待开始'">
                        ｜ 距开始：{{ countdownToStart(item) }}
                      </template>
                    </div>
                  </div>
                  <div class="apply-button">
                    <el-button :type="getStatus(item).label === '已结束' ? 'info' : 'success'" round style="width: 100px; height: 50px"
                      @click="inputInfo(item.contestId)">{{ getStatus(item).label === '已结束' ? '回顾比赛' : '进入' }}</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页器 -->
            <div class="pagination-container">
              <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
            </div>
          </div>
          
          <!-- 无比赛时显示 -->
          <div v-else class="no-contest">
            暂无符合条件的比赛
          </div>
        </div>

        <!-- 右侧区域 - 只保留进行中的比赛列表 -->
        <div class="contest-sidebar">
          <div class="ongoing-contests">
            <h3 class="sidebar-title">进行中的比赛</h3>
            <div class="contest-links">
              <div v-for="(item, index) in activeContests" :key="index" class="contest-link"
                @click="inputInfo(item.contestId)">
                <span class="contest-name">{{ item.title }}</span>
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
              <div v-if="!activeContests.length" class="no-contests">
                暂无进行中的比赛
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- AI助手按钮 -->
  <GoAi />
</template>

<style>
.constest {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.constest-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.contest-layout {
  display: flex;
  gap: 24px;
}

.contest-content {
  flex: 1;
}

.contest-toolbar {
  background-color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.status-toggle {
  display: flex;
  gap: 8px;
}

.contest-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}



.filter-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.filter-section {
  margin-top: 16px;
}

.filter-item {
  margin-bottom: 16px;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1f2937;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

.no-contest {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
}

.contest-title {
  display: inline-block;
  margin: 0px 0 30px 0;
  font-size: 28px;
  font-weight: 600;
  position: relative;
  background: linear-gradient(135deg, #1a73e8 0%, #8c54ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-bottom: 8px;
}

.contest-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(135deg, #1a73e8 0%, #8c54ff 100%);
  border-radius: 2px;
}

.contest-item {
  background-color: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
  border: 1px solid #e6e8eb;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.contest-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.contest-item-img {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
}

.contest-item-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.4;
}

.contest-item-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: #64748b;
}

.contest-item-info .el-icon {
  margin-right: 4px;
}

.apply-button {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.apply-button .el-button {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  height: auto;
}

.pagination-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 搜索和筛选栏样式 */
.search-filter-bar {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 左侧容器样式 */
.contest-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.contest-section {
  margin-bottom: 0;
}

/* 右侧比赛列表样式 */
.ongoing-contests {
  background-color: #fff;
  border-radius: 12px;
  padding: 10px 20px 10px 20px;
  margin-bottom: 0px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.contest-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contest-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contest-link:hover {
  background-color: #f3f4f6;
}

.contest-name {
  flex: 1;
  font-size: 14px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-contests {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .contest-layout {
    flex-direction: column;
  }

  .contest-sidebar {
    width: 100%;
    order: -1;
  }

  .contest-container {
    margin-bottom: 24px;
  }
}
</style>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import request from '@/util/request.ts'
import { useRouter, useRoute } from 'vue-router'
import GoAi from '@/components/goAi.vue'
import { formatDateTime } from '@/utils/date'
const router = useRouter()
const route = useRoute()
const constestList = ref([]) // 进行中的比赛
const oldConstestList = ref([]) // 已结束的比赛
const searchType = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const now = ref(Date.now())
let timer = null
const statusFilter = ref('all') // all | ongoing | ended

// 合并的比赛列表
const combinedContestList = computed(() => {
  if (statusFilter.value === 'ongoing') {
    return constestList.value
  } else if (statusFilter.value === 'ended') {
    return oldConstestList.value
  } else {
    // 全部 - 进行中的比赛在前，已结束的比赛在后
    return [...constestList.value, ...oldConstestList.value]
  }
})

// 活跃的比赛（进行中和待开始）
const activeContests = computed(() => {
  return constestList.value.filter(item => {
    const status = getStatus(item).label
    return status === '进行中' || status === '待开始'
  })
})

const getConstestList = async () => {
  // 获取进行中的比赛
  let ongoingObj = {
    status: 0,
    title: searchKeyword.value || undefined,
    type: searchType.value || undefined,
    pageStart: 1,
    pageSize: 10000
  }
  
  // 获取已结束的比赛
  let endedObj = {
    status: 1,
    title: searchKeyword.value || undefined,
    type: searchType.value || undefined,
    pageStart: currentPage.value,
    pageSize: pageSize.value
  }
  
  // 并行请求数据
  const [ongoingRes, endedRes] = await Promise.all([
    request.post(`/contest/list`, ongoingObj),
    (statusFilter.value === 'all' || statusFilter.value === 'ended') ? request.post(`/contest/list`, endedObj) : Promise.resolve({ code: 200, data: { list: [], total: 0 } })
  ])
  
  // 处理进行中的比赛数据
  if (ongoingRes.code == 200) {
    constestList.value = ongoingRes.data.list
  } else {
    ElMessage.error(ongoingRes.msg)
  }
  
  // 处理已结束的比赛数据
  if (endedRes.code == 200) {
    oldConstestList.value = endedRes.data.list
    total.value = endedRes.data.total
  } else {
    ElMessage.error(endedRes.msg)
  }
}


onMounted(async () => {
  initFromRoute()
  await Promise.all([getConstestList()])
  // 启动1秒刷新一次的计时器用于倒计时
  timer = setInterval(() => (now.value = Date.now()), 1000)
})

// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  await getConstestList()
}

// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  await getConstestList()
}

watch(
  [searchType, searchKeyword],
  async () => {
    getConstestList()
  },
  { deep: true }
)
const inputInfo = (id) => {
  // 进入该比赛详情页
  router.push(`/contest/detail/${id}`)
}

// 工具：格式化时间
const formatDate = (ts) => formatDateTime(ts, '时间待确认', 'YYYY-MM-DD HH:mm')

// 比赛状态
const getStatus = (c) => {
  const start = new Date(c.startTime).getTime()
  const end = new Date(c.endTime).getTime()
  if (now.value < start) return { label: '待开始', type: 'warning' }
  if (now.value <= end) return { label: '进行中', type: 'success' }
  return { label: '已结束', type: 'info' }
}

// 距离开始倒计时
const countdownToStart = (c) => {
  const start = new Date(c.startTime).getTime()
  const diff = Math.max(0, start - now.value)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}小时${m}分${s}秒`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}

// 清理计时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// URL 同步
const updateQuery = () => {
  router.replace({
    path: '/contest',
    query: {
      status: statusFilter.value,
      type: searchType.value || undefined,
      q: searchKeyword.value || undefined,
      pageStart: currentPage.value,
      pageSize: pageSize.value
    }
  })
}

const initFromRoute = () => {
  const q = route.query
  if (q.status && (q.status === 'all' || q.status === 'ongoing' || q.status === 'ended')) {
    statusFilter.value = String(q.status)
  }
  if (q.type) searchType.value = String(q.type)
  if (q.q) searchKeyword.value = String(q.q)
  if (q.pageStart) currentPage.value = Number(q.pageStart)
  if (q.pageSize) pageSize.value = Number(q.pageSize)
}

// 监听筛选条件变化
watch([statusFilter, searchType, searchKeyword], async () => {
  currentPage.value = 1
  updateQuery()
  await getConstestList()
}, { deep: true })

watch([currentPage, pageSize], async () => {
  updateQuery()
  await getConstestList()
})
</script>
