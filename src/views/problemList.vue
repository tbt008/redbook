<template>
  <div class="problem-list-container">
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <!-- elementplus el-select: 难度选择下拉框 -->
        <el-select v-model="difficulty" placeholder="难度" class="filter-item">
          <el-option label="全部" :value="null" />
          <el-option label="入门" :value="1" />
          <el-option label="简单" :value="2" />
          <el-option label="普及" :value="3" />
          <el-option label="提高" :value="4" />
          <el-option label="困难" :value="5" />
        </el-select>

        <!-- elementplus el-button: 标签选择按钮 -->
        <el-button class="filter-item" @click="showTagDialog = true">
          标签
          <template v-if="selectedTagIds.length">
            ({{ selectedTagIds.length }})
          </template>
        </el-button>

        <!-- elementplus el-input: 搜索输入框 -->
        <el-input v-model="searchKeyword" placeholder="搜索题目" class="filter-item" clearable>
          <template #prefix>
            <!-- elementplus el-icon: 搜索图标 -->
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 已选标签显示区域 -->
      <div v-if="selectedTagIds.length" class="selected-tags-bar">
        <!-- elementplus el-tag: 已选标签展示 -->
        <el-tag
          v-for="tagId in selectedTagIds"
          :key="tagId"
          closable
          type="primary"
          class="selected-tag"
          @close="handleTagChange(false, tagId)"
        >
          {{ allTags.find(tag => tag.id === tagId)?.name }}
        </el-tag>
      </div>

      <!-- elementplus el-table: 题目列表表格 -->
      <el-table :data="problems" style="width: 100%" v-loading="loading">
        <!-- 状态列 -->
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <div v-if="row.isPass === 1" class="status-icon success">
              <Check style="width: 12px; height: 12px" />
            </div>
            <div v-else-if="row.isPass === 2" class="status-icon pending">
              <div class="dash"></div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 题目列 -->
        <el-table-column label="题目" min-width="300">
          <template #default="{ row }">
            <router-link :to="`/question?id=${row.questionId}`" class="problem-title">
              {{ row.questionName }}
            </router-link>
            <div class="problem-tags">
              <!-- elementplus el-tag: 题目标签 -->
              <el-tag
                v-for="tag in row.tags"
                :key="tag"
                size="small"
                effect="plain"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <!-- 难度列 -->
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <span :class="[
              'difficulty-label',
              row.difficulty === 1 ? 'difficulty-entry' : '',
              row.difficulty === 2 ? 'difficulty-easy' : '',
              row.difficulty === 3 ? 'difficulty-medium' : '',
              row.difficulty === 4 ? 'difficulty-hard' : '',
              row.difficulty === 5 ? 'difficulty-expert' : ''
            ]">
              {{ row.difficultyName }}
            </span>
          </template>
        </el-table-column>
        
        <!-- 通过率列 -->
        <el-table-column label="通过率" width="180">
          <template #default="{ row }">
            <el-progress 
              :percentage="Number(row.passRate)" 
              text-inside
              :stroke-width="18"
              :color="getProgressColor(row.passRate)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- elementplus el-pagination: 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>

  <!-- elementplus el-dialog: 标签选择弹窗 -->
  <el-dialog
    v-model="showTagDialog"
    title="选择标签"
    width="50%"
    :close-on-click-modal="false"
  >
    <div class="tag-dialog-content">
      <!-- 已选标签区域 -->
      <div class="selected-tags-section">
        <div class="section-title">已选标签</div>
        <div class="tag-group-content">
          <template v-if="selectedTagIds.length">
            <!-- elementplus el-check-tag: 可选择的标签 -->
            <el-check-tag
              v-for="tagId in selectedTagIds"
              :key="tagId"
              :checked="true"
              class="tag-item"
              @change="() => handleTagChange(false, tagId)"
            >
              {{ allTags.find(tag => tag.id === tagId)?.name }}
            </el-check-tag>
          </template>
          <div v-else class="no-tags-selected">
            暂未选择标签
          </div>
        </div>
      </div>
      
      <!-- elementplus el-divider: 分割线 -->
      <el-divider />
      
      <!-- 标签分组 -->
      <div v-for="group in groupedTags" :key="group.superName" class="tag-group">
        <div class="tag-group-title">{{ group.superName }}</div>
        <div class="tag-group-content">
          <!-- elementplus el-check-tag: 可选择的标签 -->
          <el-check-tag
            v-for="tag in group.tags"
            :key="tag.id"
            :checked="selectedTagIds.includes(tag.id)"
            @change="(checked: boolean) => handleTagChange(checked, tag.id)"
            class="tag-item"
          >
            {{ tag.name }}
          </el-check-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <!-- elementplus el-button: 操作按钮 -->
        <el-button @click="clearTags">清空</el-button>
        <el-button type="primary" @click="showTagDialog = false">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
// Vue 相关
import { ref, computed, onMounted, watch } from 'vue'
// Element Plus 图标
import { Search, Check } from '@element-plus/icons-vue'
// 工具和类型
import request from '@/util/request'
import { type Problem } from '@/types/problem'
import { type Tag, type TagGroup } from '@/types/tag'

// 状态变量
const loading = ref(true)
const difficulty = ref<number | null>(null)
const selectedTagIds = ref<number[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const sortField = ref('createTime')
const sortOrder = ref('desc')
const problems = ref<Problem[]>([])
const allTags = ref<Tag[]>([])

// 根据通过率返回不同的颜色
const getProgressColor = (rate: number) => {
  if (rate >= 80) return '#67C23A'  // 深绿色
  if (rate >= 60) return '#E6A23C'  // 浅绿色
  return '#F56C6C'  // 最浅绿色
}

// 计算标签分组
const groupedTags = computed<TagGroup[]>(() => {
  const groups: { [key: string]: Tag[] } = {}
  
  allTags.value.forEach(tag => {
    if (!groups[tag.superName]) {
      groups[tag.superName] = []
    }
    groups[tag.superName].push(tag)
  })
  
  return Object.entries(groups).map(([superName, tags]) => ({
    superName,
    tags
  }))
})

// 获取题目列表
const getProblems = async () => {
  loading.value = true
  try {
    const response = (await request.post('/question/list', {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      difficulty: difficulty.value || undefined,
      tagNames: selectedTagIds.value.length > 0 ? selectedTagIds.value : undefined,
      title: searchKeyword.value || undefined
    })) as any

    if (response.code === 200) {
      problems.value = response.data.list
    }
  } catch (error) {
    console.error('获取���目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取所有标签
const getTags = async () => {
  try {
    const response = (await request.post('/tag/list', {})) as any
    if (response.code === 200) {
      allTags.value = response.data
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 分页大小改变处理
const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  await getTotalCount()
}

// 当前页改变处理
const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await getProblems()
}

// 获取题目总数
const getTotalCount = async () => {
  try {
    const response = (await request.post('/question/list', {
      pageStart: 1,
      difficulty: difficulty.value || undefined,
      tagNames: selectedTagIds.value.length > 0 ? selectedTagIds.value : undefined,
      title: searchKeyword.value || undefined
    })) as any

    if (response.code === 200) {
      total.value = response.data.total
      const allData = response.data.list
      const start = (currentPage.value - 1) * pageSize.value
      const end = Math.min(start + pageSize.value, allData.length)
      problems.value = allData.slice(start, end)
    }
  } catch (error) {
    console.error('获取题目���数失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch(
  [difficulty, selectedTagIds, searchKeyword],
  async () => {
    currentPage.value = 1
    await getTotalCount()
  },
  { deep: true }
)

// 组件挂载时初始化数据
onMounted(async () => {
  await getTags()
  await getTotalCount()
})

// 标签选择相关
const showTagDialog = ref(false)

// 标签选择处理
const handleTagChange = (checked: true | false | undefined, tagId: number) => {
  if (checked) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value = selectedTagIds.value.filter(id => id !== tagId)
  }
}

// 清空所有已选标签
const clearTags = () => {
  selectedTagIds.value = []
}
</script>

<style scoped>
/* 容器样式 */
.problem-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 筛选区域样式 */
.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
}

.filter-item {
  width: 200px;
}

/* 题目标题样式 */
.problem-title {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.problem-title:hover {
  text-decoration: underline;
}

/* 标��样式 */
.problem-tags {
  margin-top: 8px;
}

.tag-item {
  margin-right: 8px;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 状态图标样式 */
.status-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-left: 5px;
}

.status-icon.success {
  background-color: #00b8a3;
  color: white;
}

.status-icon.fail {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.status-icon.pending {
  background-color: #ffd591;
  position: relative;
}

.status-icon.pending .dash {
  width: 10px;
  height: 2px;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 标签对话框样式 */
.tag-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

.tag-group {
  margin-bottom: 20px;
}

.tag-group-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.tag-group-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  margin: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* element-plus组件样式覆盖 */
.el-check-tag {
  margin: 4px;
  padding: 0 8px;
  height: 28px;
  line-height: 26px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  background-color: #fff;
  color: #606266;
}

.el-check-tag.is-checked {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

/* 已选标签区域样式 */
.selected-tags-bar {
  margin: 0 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  margin: 0;
}

.selected-tags-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 12px;
}

.no-tags-selected {
  color: #909399;
  font-size: 14px;
}

/* 难度标签样式 */
.difficulty-label {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.difficulty-entry {
  background-color: #95D475;
  color: white;
}

.difficulty-easy {
  background-color: #67C23A;
  color: white;
}

.difficulty-medium {
  background-color: #E6A23C;
  color: white;
}

.difficulty-hard {
  background-color: #409EFF;
  color: white;
}

.difficulty-expert {
  background-color: #F56C6C;
  color: white;
}
</style>