<template>
  <div class="my-itineraries-page">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h2>📋 我的行程</h2>
          <p>管理你的所有旅行计划</p>
        </div>
        <el-button type="primary" size="large" @click="createNew">
          ➕ 创建新行程
        </el-button>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索行程..."
          prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="进行中" value="ongoing" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px">
          <el-option label="最新创建" value="createTime" />
          <el-option label="出发时间" value="startDate" />
          <el-option label="最近修改" value="updateTime" />
        </el-select>
      </div>

      <!-- 行程列表 -->
      <div v-loading="loading" class="itineraries-container">
        <div v-if="filteredItineraries.length === 0" class="empty-state">
          <div class="empty-icon">🗺️</div>
          <div class="empty-text">还没有行程</div>
          <el-button type="primary" @click="createNew">创建第一个行程</el-button>
        </div>

        <div v-else class="itineraries-grid">
          <div
            v-for="itinerary in filteredItineraries"
            :key="itinerary.id"
            class="itinerary-card"
          >
            <div class="card-cover">
              <img :src="itinerary.coverImage || '/src/views/imgs/1.jpg'" :alt="itinerary.title" />
              <div class="card-status" :class="itinerary.statusText || itinerary.status">
                {{ getStatusText(itinerary.statusText || itinerary.status) }}
              </div>
            </div>

            <div class="card-content">
              <h3 class="card-title">{{ itinerary.title }}</h3>
              
              <div class="card-info">
                <div class="info-item">
                  <span class="icon">📅</span>
                  <span>{{ formatDateRange(itinerary.startDate, itinerary.endDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="icon">⏱️</span>
                  <span>{{ itinerary.days }}天{{ itinerary.days - 1 }}晚</span>
                </div>
                <div class="info-item">
                  <span class="icon">💰</span>
                  <span>预算 ¥{{ itinerary.budget }}</span>
                </div>
              </div>

              <div class="card-tags" v-if="itinerary.interests">
                <el-tag
                  v-for="tag in itinerary.interests.split(',').slice(0, 3)"
                  :key="tag"
                  size="small"
                  effect="plain"
                >
                  {{ getInterestLabel(tag) }}
                </el-tag>
              </div>

              <div class="card-stats">
                <span>{{ itinerary.totalItems || 0 }}个项目</span>
                <span>{{ itinerary.totalCost || 0 }}元</span>
              </div>

              <div class="card-footer">
                <div class="footer-time">
                  更新于 {{ formatTime(itinerary.updateTime) }}
                </div>
                <div class="footer-actions">
                  <el-button size="small" @click="viewItinerary(itinerary)">
                    👁️ 查看
                  </el-button>
                  <el-button size="small" type="primary" @click="editItinerary(itinerary)">
                    ✏️ 编辑
                  </el-button>
                  <el-dropdown @command="handleCommand($event, itinerary)">
                    <el-button size="small" circle>
                      ⋯
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="export">
                          📥 导出
                        </el-dropdown-item>
                        <el-dropdown-item command="status" divided>
                          📌 修改状态
                        </el-dropdown-item>
                        <el-dropdown-item command="delete">
                          <span style="color: #f56c6c">🗑️ 删除</span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[6, 12, 24]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 修改状态对话框 -->
    <el-dialog v-model="showStatusDialog" title="修改行程状态" width="400px">
      <div class="status-dialog-content">
        <p>选择行程 "<strong>{{ selectedItinerary?.title }}</strong>" 的新状态：</p>
        <el-radio-group v-model="newStatus">
          <el-radio value="0">📝 草稿</el-radio>
          <el-radio value="1">🚶 进行中</el-radio>
          <el-radio value="2">✅ 已完成</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authHeaders, parseResultResponse } from '@/util/fetchResult'

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const sortBy = ref('createTime')
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const showStatusDialog = ref(false)
const selectedItinerary = ref<any>(null)
const newStatus = ref('0')

// 行程列表
const itineraries = ref<any[]>([])

// 兴趣标签映射
const interestMap: Record<string, string> = {
  nature: '自然风光',
  culture: '历史文化',
  food: '美食探店',
  religion: '宗教朝圣',
  beach: '海滨度假',
  family: '亲子游玩',
  photo: '摄影打卡',
  outdoor: '户外运动'
}

// 过滤后的行程列表
const filteredItineraries = computed(() => {
  let result = [...itineraries.value]

  // 搜索过滤
  if (searchKeyword.value) {
    result = result.filter(item =>
      item.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    // 将整数状态转换为字符串进行比较: 0->draft, 1->ongoing, 2->completed
    const intToStatus: Record<number, string> = { 0: 'draft', 1: 'ongoing', 2: 'completed' }
    result = result.filter(item => {
      const itemStatus = item.statusText || intToStatus[item.status] || String(item.status)
      return itemStatus === filterStatus.value
    })
  }

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'createTime') {
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    } else if (sortBy.value === 'startDate') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    } else if (sortBy.value === 'updateTime') {
      return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    }
    return 0
  })

  return result
})

// 获取状态文本
const getStatusText = (status: string | number) => {
  // 先将整数转换为字符串
  const intToStr: Record<number, string> = { 0: 'draft', 1: 'ongoing', 2: 'completed' }
  const statusStr = typeof status === 'number' ? intToStr[status] : status

  const statusMap: Record<string, string> = {
    draft: '草稿',
    ongoing: '进行中',
    completed: '已完成'
  }
  return statusMap[statusStr] || '草稿'
}

// 获取兴趣标签
const getInterestLabel = (value: string) => {
  return interestMap[value] || value
}

// 格式化日期范围
const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 创建新行程
const createNew = () => {
  router.push('/ai-map')
}

// 查看行程
const viewItinerary = (itinerary: any) => {
  router.push({
    path: '/itinerary/preview',
    query: { id: itinerary.id }
  })
}

// 编辑行程
const editItinerary = (itinerary: any) => {
  router.push({
    path: '/itinerary/editor',
    query: { id: itinerary.id }
  })
}

// 处理下拉菜单命令
const handleCommand = (command: string, itinerary: any) => {
  switch (command) {
    case 'export':
      exportItinerary(itinerary)
      break
    case 'status':
      openStatusDialog(itinerary)
      break
    case 'delete':
      deleteItinerary(itinerary)
      break
  }
}

// 导出行程
const exportItinerary = async (itinerary: any) => {
  try {
    const response = await fetch(`/api/itinerary/export/${itinerary.id}`, {
      headers: authHeaders()
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${itinerary.title || '行程'}.txt`
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功！')
    } else {
      throw new Error('导出失败')
    }
  } catch (error: any) {
    console.error('导出失败:', error)
    ElMessage.error(error.message || '导出失败，请稍后重试')
  }
}

// 删除行程
const deleteItinerary = (itinerary: any) => {
  ElMessageBox.confirm(
    `确定删除行程"${itinerary.title}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const response = await fetch(`/api/itinerary/${itinerary.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })

      await parseResultResponse(response)
      ElMessage.success('删除成功！')
      loadItineraries()
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 打开状态修改对话框
const openStatusDialog = (itinerary: any) => {
  selectedItinerary.value = itinerary
  // 使用整数状态：0-草稿，1-进行中，2-已完成
  newStatus.value = String(itinerary.status !== undefined ? itinerary.status : 0)
  showStatusDialog.value = true
}

// 确认修改状态
const confirmUpdateStatus = async () => {
  if (!selectedItinerary.value) return

  try {
    const response = await fetch('/api/itinerary/status', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: selectedItinerary.value.id,
        status: parseInt(newStatus.value)
      })
    })

    await parseResultResponse(response)
    ElMessage.success('状态更新成功！')
    showStatusDialog.value = false
    loadItineraries()
  } catch (error: any) {
    console.error('更新状态失败:', error)
    ElMessage.error(error.message || '更新失败，请稍后重试')
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadItineraries()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadItineraries()
}

// 加载行程列表
const loadItineraries = async () => {
  loading.value = true

  try {
    const response = await fetch('/api/itinerary/list', {
      headers: authHeaders()
    })

    const list = await parseResultResponse<any[]>(response)
    itineraries.value = (list || []).map((item) => ({
      ...item,
      days: item.days ?? item.daysCount ?? 0,
      budget: item.budget ?? item.totalBudget ?? 0
    }))
    total.value = itineraries.value.length
  } catch (error: any) {
    console.error('加载行程列表失败:', error)
    // 使用模拟数据
    itineraries.value = [
      {
        id: 1,
        title: '湄洲岛朝圣之旅',
        startDate: '2024-12-20',
        endDate: '2024-12-21',
        days: 2,
        budget: 800,
        interests: 'religion,beach,culture',
        status: 'draft',
        totalItems: 8,
        totalCost: 750,
        coverImage: '/src/views/imgs/1.jpg',
        createTime: '2024-12-01T10:00:00',
        updateTime: '2024-12-01T15:30:00'
      },
      {
        id: 2,
        title: '莆田美食探索',
        startDate: '2024-12-25',
        endDate: '2024-12-27',
        days: 3,
        budget: 1200,
        interests: 'food,culture',
        status: 'ongoing',
        totalItems: 12,
        totalCost: 1150,
        coverImage: '/src/views/imgs/2.jpg',
        createTime: '2024-11-28T14:00:00',
        updateTime: '2024-12-02T09:20:00'
      },
      {
        id: 3,
        title: '仙游山水游',
        startDate: '2024-11-15',
        endDate: '2024-11-16',
        days: 2,
        budget: 1000,
        interests: 'nature,outdoor,photo',
        status: 'completed',
        totalItems: 10,
        totalCost: 980,
        coverImage: '/src/views/imgs/3.jpg',
        createTime: '2024-11-10T08:00:00',
        updateTime: '2024-11-16T20:00:00'
      }
    ]
    total.value = itineraries.value.length
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadItineraries()
})
</script>

<style scoped lang="scss">
.my-itineraries-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;

      .logo {
        cursor: pointer;

        h1 {
          margin: 0;
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
      }
    }
  }

  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;

      .header-left {
        h2 {
          margin: 0 0 8px 0;
          font-size: 32px;
          color: white;
        }

        p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
        }
      }
    }

    .filter-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .itineraries-container {
      min-height: 400px;

      .empty-state {
        background: white;
        border-radius: 16px;
        padding: 80px 20px;
        text-align: center;

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-text {
          font-size: 18px;
          color: #999;
          margin-bottom: 24px;
        }
      }

      .itineraries-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 24px;

        .itinerary-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;

          &:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          }

          .card-cover {
            position: relative;
            height: 200px;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s;
            }

            &:hover img {
              transform: scale(1.1);
            }

            .card-status {
              position: absolute;
              top: 12px;
              right: 12px;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              background: rgba(255, 255, 255, 0.95);

              &.draft {
                color: #909399;
              }

              &.ongoing {
                color: #67c23a;
              }

              &.completed {
                color: #409eff;
              }
            }
          }

          .card-content {
            padding: 20px;

            .card-title {
              margin: 0 0 16px 0;
              font-size: 20px;
              color: #333;
              font-weight: 600;
            }

            .card-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 16px;

              .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #666;

                .icon {
                  font-size: 16px;
                }
              }
            }

            .card-tags {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
              margin-bottom: 16px;
            }

            .card-stats {
              display: flex;
              gap: 16px;
              padding: 12px;
              background: #f8f9fa;
              border-radius: 8px;
              font-size: 14px;
              color: #666;
              margin-bottom: 16px;
            }

            .card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 16px;
              border-top: 1px solid #f0f0f0;

              .footer-time {
                font-size: 12px;
                color: #999;
              }

              .footer-actions {
                display: flex;
                gap: 8px;
              }
            }
          }
        }
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 32px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
    }
  }

  .status-dialog-content {
    padding: 20px 0;

    p {
      margin-bottom: 20px;
      font-size: 14px;
      color: #333;
    }

    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .el-radio {
        padding: 10px 16px;
        border-radius: 8px;
        border: 1px solid #dcdfe6;
        margin-right: 0;

        &:hover {
          border-color: #409eff;
        }
      }
    }
  }
}
</style>
