<template>
  <div class="problem-list-container">
    <div class="content-wrapper">
      <div class="selected-tags-section">
        <div class="section-title">已选题目</div>
        <div class="tag-group-content">
          <template v-if="selectedQuestion.length">
            <el-check-tag v-for="(item, index) in selectedQuestion" :key="index" :checked="true" class="tag-item">
              {{ item }}
            </el-check-tag>
          </template>
          <div v-else class="no-tags-selected">暂未选择题目</div>
        </div>
      </div>
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
          <template v-if="selectedTagIds.length"> ({{ selectedTagIds.length }}) </template>
        </el-button>

        <!-- elementplus el-input: 搜索输入框 -->
        <el-input v-model="searchKeyword" placeholder="搜索题目" class="filter-item" clearable>
          <template #prefix>
            <!-- elementplus el-icon: 搜索图标 -->
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <!-- 已选标签显示区域 -->
      <div v-if="selectedTagIds.length" class="selected-tags-bar">
        <!-- elementplus el-tag: 已选标签展示 -->
        <el-tag v-for="tagId in selectedTagIds" :key="tagId" closable type="primary" class="selected-tag"
          @close="handleTagChange(false, tagId)">
          {{ allTags.find((tag) => tag.id === tagId)?.name }}
        </el-tag>
      </div>

      <!-- elementplus el-table: 题目列表表格 -->
      <el-table :data="problems" style="width: 100%" v-loading="loading">
        <!-- 状态列 -->
        <el-table-column label="选择" width="80">
          <template #default="{ row }">
            <el-checkbox v-model="row.isSelected" label="" size="large"
              @change="changeQuestion(row.isSelected, row.questionId)" />
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
              <el-tag v-for="tag in row.tags" :key="tag" size="small" effect="plain" class="tag-item">
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 难度列 -->
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            {{ row.difficultyName }}
          </template>
        </el-table-column>

        <!-- 通过率列 -->
        <el-table-column label="通过率" width="180">
          <template #default="{ row }">
            <el-progress :percentage="Number(row.passRate)" text-inside :stroke-width="18"
              :color="getProgressColor(row.passRate)" />
          </template>
        </el-table-column>
      </el-table>

      <!-- elementplus el-pagination: 分页器 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>

  <!-- elementplus el-dialog: 标签选择弹窗 -->
  <el-dialog v-model="showTagDialog" title="选择标签" width="50%" :close-on-click-modal="false">
    <div class="tag-dialog-content">
      <!-- 已选标签区域 -->
      <div class="selected-tags-section">
        <div class="section-title">已选标签</div>
        <div class="tag-group-content">
          <template v-if="selectedTagIds.length">
            <!-- elementplus el-check-tag: 可选择的标签 -->
            <el-check-tag v-for="tagId in selectedTagIds" :key="tagId" :checked="true" class="tag-item"
              @change="() => handleTagChange(false, tagId)">
              {{ allTags.find((tag) => tag.id === tagId)?.name }}
            </el-check-tag>
          </template>
          <div v-else class="no-tags-selected">暂未选择标签</div>
        </div>
      </div>

      <!-- elementplus el-divider: 分割线 -->
      <el-divider />

      <!-- 标签分组 -->
      <div v-for="group in groupedTags" :key="group.superName" class="tag-group">
        <div class="tag-group-title">{{ group.superName }}</div>
        <div class="tag-group-content">
          <!-- elementplus el-check-tag: 可选择的标签 -->
          <el-check-tag v-for="tag in group.tags" :key="tag.id" :checked="selectedTagIds.includes(tag.id)"
            @change="(checked) => handleTagChange(checked, tag.id)" class="tag-item">
            {{ tag.name }}
          </el-check-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <!-- elementplus el-button: 操作按钮 -->
        <el-button @click="clearTags">清空</el-button>
        <el-button type="primary" @click="showTagDialog = false"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="js" setup>
// Vue 相关
import { ref, computed, onMounted, watch } from 'vue'
// 工具和类型
import request from '@/util/request'
// 状态变量
const loading = ref(true)
const difficulty = ref(null)
const selectedTagIds = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const sortField = ref('createTime')
const sortOrder = ref('desc')
const problems = ref([])
const allTags = ref([])
const selectedQuestion = ref([])
const emit = defineEmits(['selectedQuestion'])

const props = defineProps({
  contestId: {
    type: Object
  }
})
onMounted(async () => {
  await getTags()
  if (props.contestId) {
    await getSelectedQuestion()
  }
  await getProblems()
})
// 根据通过率返回不同的颜色
const getProgressColor = (rate) => {
  if (rate >= 80) return '#67C23A' // 深绿色
  if (rate >= 60) return '#E6A23C' // 浅绿色
  return '#F56C6C' // 最浅绿色
}
const changeQuestion = (isSelected, id) => {
  if (isSelected == true) {
    selectedQuestion.value.push(id)
  } else {
    selectedQuestion.value = selectedQuestion.value.filter((item) => item != id)
  }
}
// 计算标签分组
const groupedTags = computed(() => {
  const groups = {}

  allTags.value.forEach((tag) => {
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
    const response = await request.get('/question/contest/get/list', {
      params: {
        pageStart: currentPage.value,
        pageSize: pageSize.value,
        difficulty: difficulty.value || undefined,
        tagNames: selectedTagIds.value.length > 0 ? selectedTagIds.value : undefined,
        title: searchKeyword.value || undefined
      }
    })

    if (response.code === 200) {
      problems.value = response.data.list
      total.value = response.data.total
      problems.value.forEach((problem) => {
        problem.isSelected = selectedQuestion.value.some(
          (questionId) => questionId === problem.questionId
        )
      })
      // console.log(problems.value)
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取所有标签
const getTags = async () => {
  try {
    const response = await request.post('/tag/list', {})
    if (response.code === 200) {
      allTags.value = response.data
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  await getProblems()
}
const getSelectedQuestion = async () => {
  try {
    if (!props.contestId) return
    const response = await request.get(`/root/contest/problem/${props.contestId}`)
    if (response.code === 200) {
      selectedQuestion.value = response.data
      // console.log(response.data)
    }
  } catch (error) {
    console.error('获取已选题目失败:', error)
  } finally {
    loading.value = false
  }
}
// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  await getProblems()
}

// 监听筛选条件变化
watch(
  [difficulty, selectedTagIds, searchKeyword],
  async () => {
    currentPage.value = 1
    await getProblems()
  },
  { deep: true }
)
// 监听 selectedQuestion 的变化
watch(
  selectedQuestion,
  (newValue) => {
    emit('selectedQuestion', newValue)
  },
  { deep: true }
)
// 组件挂载时初始化数据

// 标签选择相关
const showTagDialog = ref(false)

// 标签选择处理
const handleTagChange = (checked, tagId) => {
  if (checked) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value = selectedTagIds.value.filter((id) => id !== tagId)
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

/* 标签样式 */
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
</style>
