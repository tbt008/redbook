<template>
  <div class="problem-list-container">
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-select v-model="difficulty" placeholder="难度" class="filter-item">
          <el-option label="全部" :value="null" />
          <el-option label="入门" :value="1" />
          <el-option label="简单" :value="2" />
          <el-option label="普及" :value="3" />
          <el-option label="提高" :value="4" />
          <el-option label="困难" :value="5" />
        </el-select>

        <el-select
          v-model="selectedTagIds"
          multiple
          placeholder="标签"
          class="filter-item"
          @change="(val: number[]) => console.log('标签选择改变:', val)"
        >
          <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>

        <el-input v-model="searchKeyword" placeholder="搜索题目" class="filter-item" clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 题目列表 -->
      <el-table :data="problems" style="width: 100%" v-loading="loading">
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
        <el-table-column label="题目" min-width="300">
          <template #default="{ row }">
            <router-link :to="`/question?id=${row.questionId}`" class="problem-title">
              {{ row.questionName }}
            </router-link>
            <div class="problem-tags">
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
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            {{ row.difficultyName }}
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="通过率" width="100">
          <template #default="{ row }"> {{ row.passRate }}% </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Check } from '@element-plus/icons-vue'
import request from '@/util/request'
import { type Problem } from '@/types/problem'
import { type Tag } from '@/types/tag'

const loading = ref(false)
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
    console.error('获取题目列表失败:', error)
  } finally {
    loading.value = false
  }
}

const getTags = async () => {
  try {
    const response = (await request.post('/tag/list', {})) as any
    if (response.code === 200) {
      allTags.value = response.data.records
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  await getTotalCount()
  await getProblems()
}

const handleCurrentChange = async (val: number) => {
  currentPage.value = val
  await getProblems()
}

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
    }
  } catch (error) {
    console.error('获取题目总数失败:', error)
  }
}

// 监听器
watch(
  [difficulty, selectedTagIds, searchKeyword],
  async () => {
    currentPage.value = 1
    await getTotalCount()
    await getProblems()
  },
  { deep: true }
)

// 生命周期钩子
onMounted(async () => {
  await getTags()
  await getTotalCount()
  await getProblems()
})
</script>

<style scoped>
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

.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
}

.filter-item {
  width: 200px;
}

.problem-title {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.problem-title:hover {
  text-decoration: underline;
}

.problem-tags {
  margin-top: 8px;
}

.tag-item {
  margin-right: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

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
</style>
