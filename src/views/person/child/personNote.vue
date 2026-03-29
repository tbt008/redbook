<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/util/request'

const router = useRouter()

// 数据列表
const contentList = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 筛选状态
const statusFilter = ref(null)

// 编辑弹窗
const editDialogVisible = ref(false)
const editingContent = ref({})

// 内容类型映射
const contentTypeMap = {
  1: '纯文字',
  2: '图文',
  3: '视频',
  4: '图文+视频'
}

// 状态映射
const statusMap = {
  0: { label: '草稿', type: 'info' },
  1: { label: '待审核', type: 'warning' },
  2: { label: '已发布', type: 'success' },
  3: { label: '已下架', type: 'danger' }
}

// 设置侧边栏选中状态
onMounted(() => {
  const obj = document.getElementsByClassName('sonstyle')[1]
  if (obj) {
    obj.style.backgroundColor = '#EDEEF0'
    obj.style.color = '#0A84FF'
  }
  loadContentList()
})

// 加载内容列表
const loadContentList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (statusFilter.value !== null) {
      params.contentType = statusFilter.value
    }
    
    const res = await request.get('/content/my-list', { params })
    if (res.code === 200) {
      contentList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载内容列表失败', error)
  } finally {
    loading.value = false
  }
}

// 分页变化
const handlePageChange = (page) => {
  pageNum.value = page
  loadContentList()
}

// 每页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadContentList()
}

// 筛选状态
const handleStatusFilter = (status) => {
  statusFilter.value = status
  pageNum.value = 1
  loadContentList()
}

// 查看详情
const viewContent = (item) => {
  router.push(`/content/${item.id}`)
}

// 编辑内容
const editContent = (item) => {
  editingContent.value = { ...item }
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  try {
    const res = await request.put('/content/update', editingContent.value)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadContentList()
    }
  } catch (error) {
    console.error('更新失败', error)
  }
}

// 删除内容
const deleteContent = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除内容"${item.title}"吗？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await request.delete(`/content/delete/${item.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadContentList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

// 发布内容（从草稿发布）
const publishContent = async (item) => {
  try {
    const res = await request.put('/content/update', {
      id: item.id,
      status: 1
    })
    if (res.code === 200) {
      ElMessage.success('已提交审核')
      loadContentList()
    }
  } catch (error) {
    console.error('发布失败', error)
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取状态标签
const getStatusTag = (status) => {
  return statusMap[status] || { label: '未知', type: 'info' }
}

// 获取类型标签
const getTypeTag = (type) => {
  return contentTypeMap[type] || '未知'
}
</script>

<template>
  <div class="content-management">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <div class="filter-buttons">
        <el-button 
          :type="statusFilter === null ? 'primary' : 'default'" 
          @click="handleStatusFilter(null)"
          size="small"
        >
          全部
        </el-button>
        <el-button 
          :type="statusFilter === 0 ? 'primary' : 'default'" 
          @click="handleStatusFilter(0)"
          size="small"
        >
          草稿
        </el-button>
        <el-button 
          :type="statusFilter === 1 ? 'primary' : 'default'" 
          @click="handleStatusFilter(1)"
          size="small"
        >
          待审核
        </el-button>
        <el-button 
          :type="statusFilter === 2 ? 'primary' : 'default'" 
          @click="handleStatusFilter(2)"
          size="small"
        >
          已发布
        </el-button>
      </div>
      <el-button type="primary" @click="router.push('/publish')">
        <el-icon><Plus /></el-icon>
        发布新内容
      </el-button>
    </div>

    <!-- 内容列表 -->
    <div class="content-list" v-loading="loading">
      <div v-if="contentList.length === 0" class="empty-state">
        <el-empty description="还没有发布任何内容">
          <el-button type="primary" @click="router.push('/publish')">开始发布</el-button>
        </el-empty>
      </div>
      
      <div v-else class="list-container">
        <div v-for="item in contentList" :key="item.id" class="content-item">
          <!-- 封面图 -->
          <div class="item-cover" @click="viewContent(item)">
            <el-image 
              :src="item.coverImage || item.images?.split(',')[0] || '/src/views/imgs/1.jpg'" 
              fit="cover"
              style="width: 100%; height: 100%"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <!-- 内容信息 -->
          <div class="item-info">
            <div class="item-header">
              <h3 class="item-title" @click="viewContent(item)">{{ item.title }}</h3>
              <el-tag :type="getStatusTag(item.status).type" size="small">
                {{ getStatusTag(item.status).label }}
              </el-tag>
            </div>
            
            <div class="item-meta">
              <el-tag size="small" type="info">{{ getTypeTag(item.contentType) }}</el-tag>
              <span class="item-location" v-if="item.location">
                <el-icon><Location /></el-icon>
                {{ item.location }}
              </span>
            </div>
            
            <p class="item-summary">{{ item.summary || item.content?.substring(0, 100) || '暂无描述' }}</p>
            
            <div class="item-stats">
              <span><el-icon><View /></el-icon> {{ item.viewCount || 0 }}</span>
              <span><el-icon><Star /></el-icon> {{ item.likeCount || 0 }}</span>
              <span><el-icon><Collection /></el-icon> {{ item.collectCount || 0 }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ item.commentCount || 0 }}</span>
            </div>
            
            <div class="item-time">
              创建时间：{{ formatTime(item.createTime) }}
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="item-actions">
            <el-button type="primary" link @click="viewContent(item)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" link @click="editContent(item)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              v-if="item.status === 0" 
              type="success" 
              link 
              @click="publishContent(item)"
            >
              <el-icon><Promotion /></el-icon>
              发布
            </el-button>
            <el-button type="danger" link @click="deleteContent(item)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑内容"
      width="700px"
      destroy-on-close
    >
      <el-form :model="editingContent" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editingContent.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input 
            v-model="editingContent.summary" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入摘要" 
          />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="editingContent.region" placeholder="请输入地区" />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="editingContent.theme" placeholder="请输入主题" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="editingContent.location" placeholder="请输入位置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.content-management {
  padding: 10px;
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    
    .filter-buttons {
      display: flex;
      gap: 10px;
    }
  }
  
  .empty-state {
    padding: 60px 0;
  }
  
  .list-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .content-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: #fafafa;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      background: #f5f5f5;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .item-cover {
      width: 160px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;
      
      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e8e8e8;
        color: #999;
        font-size: 30px;
      }
    }
    
    .item-info {
      flex: 1;
      min-width: 0;
      
      .item-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        
        .item-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0;
          cursor: pointer;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          
          &:hover {
            color: #0A84FF;
          }
        }
      }
      
      .item-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        
        .item-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 12px;
        }
      }
      
      .item-summary {
        font-size: 13px;
        color: #666;
        margin: 0 0 8px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .item-stats {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #999;
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .item-time {
        font-size: 12px;
        color: #999;
        margin-top: 8px;
      }
    }
    
    .item-actions {
      display: flex;
      flex-direction: column;
      gap: 5px;
      justify-content: center;
      padding: 0 10px;
      border-left: 1px solid #eee;
    }
  }
  
  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
