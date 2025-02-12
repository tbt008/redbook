<template>
  <div class="discussion-management-container">
    <div class="discussion-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div style="font-size: 12px; line-height: 32px; width: 60px; margin-left: 10px">
          筛选条件
        </div>
        <el-select v-model="filterType" placeholder="所有" class="filter-item" @change="getArticleList">
          <el-option label="所有" value="all" />
          <el-option v-for="type in articleTypes" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>

        <!-- <el-input v-model="searchKeyword" placeholder="请输入文章标题" class="search-input" clearable>
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
</el-input> -->
      </div>

      <!-- 文章列表表格 -->
      <el-table :data="articles" class="article-table" v-loading="loading">
        <el-table-column prop="title" label="标题" align="center" />
        <el-table-column prop="userId" label="作者" align="center" width="150" />
        <el-table-column label="文章类型" align="center">
          <template #default="{ row }">
            <el-tag :type="getArticleTypeTag(row.articleType)">
              {{ getArticleTypeLabel(row.articleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" align="center" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="articleReads" label="阅读量" align="center" />
        <el-table-column prop="likeNum" label="点赞数" align="center" />
        <el-table-column prop="favourNum" label="收藏数" align="center"></el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()
const loading = ref(false)
const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const filterType = ref('all')

// 文章类型列表
const articleTypes = [
  { value: 0, label: '算法文章' },
  { value: 1, label: '题解文章' },
  { value: 2, label: '经验分享' },
  { value: 3, label: '杂谈' },
  { value: 4, label: '竞赛' },
  { value: 5, label: '算法模板' },
]

// 获取文章类型标签样式
const getArticleTypeTag = (type: number) => {
  const types: Record<number, string> = {
    0: 'success',
    1: 'warning',
    2: 'info',
    3: 'default',
    4: 'danger',
    5: 'primary'
  }
  return types[type] || ''
}

// 获取文章类型标签文本
const getArticleTypeLabel = (type: number) => {
  return articleTypes.find(t => t.value === type)?.label || '未知类型'
}

// 格式化日期
const formatDate = (dateArray: number[]) => {
  if (!dateArray) return 'error'
  const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2])
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 获取文章列表
const getArticleList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
    }

    if (filterType.value !== 'all') {
      params.articleType = Number(filterType.value)
    }

    if (searchKeyword.value) {
      params.key = searchKeyword.value
    }

    const response = await request.post('/article/list', params) as any
    if (response.code === 200) {
      articles.value = response.data.list
      total.value = response.data.total
    } else {
      ElMessage.error(response.msg || '获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 查看文章
const handleView = (row: any) => {
  router.push(`/discuss/${row.id}`)
}

// 删除文章
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该文章吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await request.delete(`/article/delete/${row.id}`) as any
    if (response.code === 200) {
      ElMessage.success('删除成功')
      getArticleList()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error('删除文章失败')
    }
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  getArticleList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getArticleList()
}

onMounted(() => {
  getArticleList()
})
</script>

<style scoped>
.discussion-management-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.discussion-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-item {
  width: 120px;
}

.search-input {
  width: 300px;
}

.article-table {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-table td) {
  border-bottom: 1px solid #e4e7ed;
}
</style>
