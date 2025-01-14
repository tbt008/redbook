<template>
  <div class="problem-list-container">
    <!-- 修改布局结构 -->
    <div class="page-layout">
      <!-- 左侧主要内容区 -->
      <div class="content-wrapper">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <div style="font-size: 12px;line-height: 32px;">筛选条件</div>
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
            算法标签
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
          <div style="font-size: 12px;line-height: 24px;">已选择：</div>
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
        <el-table 
          :data="problems" 
          style="width: 100%" 
          v-loading="loading"
          @cell-mouse-enter="handleMouseEnter"
          @cell-mouse-leave="handleMouseLeave"
        >
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
              <a 
                :href="`/question?id=${row.questionId}`" 
                class="problem-title" 
                @click.prevent="handleQuestionClick(row.questionId)"
              >
                {{ row.questionName }}
              </a>  
              <!-- <router-link :to="`/question?id=${row.questionId}`" class="problem-title">
                {{ row.questionName }}
              </router-link> -->
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

          <!-- 提交次数列 -->
          <el-table-column label="提交次数" width="200" align="center">
            <template #header>
              <span class="submission-count-header">提交次数</span>
            </template>
            <template #default="{ row }">
              {{ row.tryPerson }}
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

      <!-- 右侧统计面板 -->
      <div class="side-panel">
        <!-- 添加日历卡片 -->
        <el-card class="side-card calendar-card">
          <!-- 添加每日一题显示区域 -->
          <div class="daily-question-header">
            <div class="daily-title">每日一题</div>
            <div class="daily-content">
              <template v-if="selectedDailyQuestion && selectedDailyQuestion.questionTitle !== '今日暂无题目' && selectedDailyQuestion.questionTitle !== '当日暂无题目'">
                <div class="question-name"> 
                  <a 
                    :href="`/question?id=${selectedDailyQuestion.questionId}`" 
                    class="daily-question-link" 
                    @click.prevent="handleQuestionClick(selectedDailyQuestion.questionId)"
                  >
                    {{ selectedDailyQuestion.questionTitle }}
                  </a> 
                  <!-- <router-link 
                    :to="`/question?id=${selectedDailyQuestion.questionId}`"
                    class="daily-question-link"
                  >
                    {{ selectedDailyQuestion.questionTitle }}
                  </router-link> -->
                </div>
                <div class="question-status">
                  <el-tag :type="selectedDailyQuestion.completed ? 'success' : 'info'" size="small">
                    {{ selectedDailyQuestion.completed ? '已完成' : '未完成' }}
                  </el-tag>
                </div>
              </template>
              <template v-else-if="selectedDailyQuestion">
                <div class="no-daily">{{ selectedDailyQuestion.questionTitle }}</div>
              </template>
              <template v-else>
                <div class="no-daily">今日暂无题目</div>
              </template>
            </div>
          </div>
          
          <el-divider />
          
          <div class="custom-calendar">
            <div class="calendar-header">
              <div class="calendar-nav">
                <el-button text @click="changeMonth(-1)">
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <div class="calendar-title">
                  <span>{{ currentMonth }}</span>
                  <el-button 
                    class="today-btn"
                    type="primary" 
                    text
                    size="small"
                    @click="backToToday"
                  >
                    <el-icon><Calendar /></el-icon>
                    今日
                  </el-button>
                </div>
                <el-button text @click="changeMonth(1)">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
            
            <!-- 添加星期标题行 -->
            <div class="weekday-header">
              <div class="weekday-cell">日</div>
              <div class="weekday-cell">一</div>
              <div class="weekday-cell">二</div>
              <div class="weekday-cell">三</div>
              <div class="weekday-cell">四</div>
              <div class="weekday-cell">五</div>
              <div class="weekday-cell">六</div>
            </div>

            <!-- 修改日历网格，添加空白日期填充 -->
            <div class="calendar-grid">
              <!-- 添加空白填充单元格 -->
              <div 
                v-for="n in firstDayOfMonth" 
                :key="'empty-' + n" 
                class="calendar-cell empty"
              ></div>
              <!-- 现有的日期单元格 -->
              <div
                v-for="day in calendarDays"
                :key="day.date"
                class="calendar-cell"
                :class="{
                  'completed': isDailyQuestionCompleted(day.date),
                  'future': isFutureDate(day.date),
                  'has-question': hasDailyQuestion(day.date),
                  'selected': isSelectedDate(day.date)
                }"
                @click="handleDateClick(day.date)"
              >
                <span>{{ day.dayOfMonth }}</span>
                <div v-if="isDailyQuestionCompleted(day.date)" class="check-icon">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 统计图表卡片 -->
        <!-- <el-card class="side-card stats-card">
          <div class="stats-content"> -->
            <!-- TODO 未来会传更多数据 -->
            <!-- <ProblemStatsPie
              :title="hoveredProblem?.questionName"
              :pass-person="hoveredProblem?.passPerson"
              :try-person="hoveredProblem?.tryPerson"
            />
          </div>
        </el-card> -->
        <!-- 悬浮 如果要原来的就用上面的 -->
         <!-- 如果希望鼠标移走还在就去掉 handleMouseLeave -->
        <div 
          v-if="hoveredProblem" 
          class="floating-stats-card"
        >
          <ProblemStatsPie
            :title="hoveredProblem?.questionName"
            :pass-person="hoveredProblem?.passPerson"
            :try-person="hoveredProblem?.tryPerson"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- elementplus el-dialog: 标签选择弹窗 -->
  <el-dialog
    v-model="showTagDialog"
    title="选择标签"
    width="45%"
    :close-on-click-modal="false"
    style="border-radius: 20px;font-weight: 600;"
  >
    <div class="tag-dialog-content">
      <!-- 添加搜索输入框 -->
      <el-input
        v-model="tagSearchKeyword"
        placeholder="搜索标签"
        class="tag-search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

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

      <!-- 修改标签分组显示逻辑 -->
      <div v-for="group in filteredGroupedTags" :key="group.superName" class="tag-group">
        <div class="tag-group-title">{{ group.superName }}</div>
        <div class="tag-group-content">
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
// 添加 ElLoading 导入
import { ElLoading } from 'element-plus'
// Element Plus 图标
import { Search, Check, ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'
// 工具和类型
import request from '@/util/request'
import { type Problem } from '@/types/problem'
import { type Tag, type TagGroup } from '@/types/tag'
import ProblemStatsPie from '@/components/ProblemStatsPie.vue'
import dayjs from 'dayjs' // 确保项目中安装了 dayjs

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
const hoveredProblem = ref<Problem | null>(null)
const token = localStorage.getItem('authToken')
// 添加题目点击处理
// https://element-plus.org/zh-CN/component/loading.html 详细一点
const handleQuestionClick = (questionId: number) => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })
  
  // 使用 setTimeout 模拟短暂延迟，确保加载动画能够显示
  setTimeout(() => {
    window.location.href = `/question?id=${questionId}`
    loading.close()
  }, 500)
}
// 根据通过率返回不同的颜色
const getProgressColor = (rate: number) => {
  if (rate >= 70) return '#67C23A'
  if (rate >= 50) return '#E6A23C'
  return '#F56C6C'
}

// 添加标签搜索关键词
const tagSearchKeyword = ref('')

// 修改计算属性，添加过滤逻辑
const filteredGroupedTags = computed<TagGroup[]>(() => {
  const groups: { [key: string]: Tag[] } = {}

  allTags.value.forEach(tag => {
    // 如果有搜索关键词，进行过滤
    if (tagSearchKeyword.value &&
        !tag.name.toLowerCase().includes(tagSearchKeyword.value.toLowerCase())) {
      return
    }

    if (!groups[tag.superName]) {
      groups[tag.superName] = []
    }
    groups[tag.superName].push(tag)
  })

  // 只返回有标签的分组
  return Object.entries(groups)
    .filter(([_, tags]) => tags.length > 0)
    .map(([superName, tags]) => ({
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
    console.error('获取题目列表失败:', error)
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
      pageSize: 1000000,
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
    console.error('获取题目总数失败:', error)
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
  // 获取当前月份的每日一题
  const currentMonth = dayjs().format('YYYY-MM')
  await getDailyQuestions(currentMonth)
  // 自动选中今天的日期
  const today = getBeijingDate() // 使用之前定义的获取北京时间的方法
  console.log(today)
  handleDateClick(today)

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

// 添加鼠标悬停处理函数
const handleMouseEnter = (row: Problem) => {
  hoveredProblem.value = row
}
// 添加鼠标移开处理函数
const handleMouseLeave = () => {
  hoveredProblem.value = null
}
// 添加每日一题相关的状态
const dailyQuestions = ref<any[]>([])

// 生成指定月份的假数据
// const generateMockData = (monthStr: string) => {
//   const today = dayjs()
//   return [
//     {
//       dailyQuestionId: 1,
//       date: today.subtract(1, 'day').format('YYYY-MM-DD'),
//       questionId: 34,
//       questionTitle: '两数之和',
//       completed: true
//     },
//     {
//       dailyQuestionId: 2,
//       date: today.format('YYYY-MM-DD'),
//       questionId: 35,
//       questionTitle: '反转链表',
//       completed: false
//     },
//     {
//       dailyQuestionId: 3,
//       date: today.add(1, 'day').format('YYYY-MM-DD'),
//       questionId: 36,
//       questionTitle: '***',
//       completed: false
//     }
//   ]
// }

// 修改获取每日一题的方法
const getDailyQuestions = async (monthStr: string) => {
 
  try {
    const response = await request.post('/userDailyQuestion/getDailyQuestion', {
      "date": monthStr
    },{
      headers: {
        'auth-token': `Bearer ${token}`
      }
    }) as any;

    if (response.code === 200) {
      dailyQuestions.value = response.data
       console.log(response.data)
    } else {
       
    }
  } catch (error) { 
    console.error('Error:', error);
  }
  // 模拟异步请求
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     dailyQuestions.value = generateMockData(monthStr)
  //     resolve(null)
  //   }, 100)
  // })
}

// // 处理月份变化
// const handleMonthChange = async (date: Date) => {
//   const monthStr = dayjs(date).format('YYYY-MM')
//   await getDailyQuestions(monthStr)
// }

// 检查是否是未来日期
const isFutureDate = (dateStr: string) => {
  return dayjs(dateStr).isAfter(dayjs(), 'day')
}

// 检查指定日期是否有每日一题
const hasDailyQuestion = (dateStr: string) => {
  const formattedDate = dayjs(dateStr).format('YYYY-MM-DD')
  return dailyQuestions.value.some(q => 
    dayjs(q.date).format('YYYY-MM-DD') === formattedDate
  )
}

// 获取指定日期的每日一题标题
// const getDailyQuestionTitle = (dateStr: string) => {
//   const question = dailyQuestions.value.find(q => q.date === dateStr)
//   return question?.questionTitle || ''
// }

// 检查指定日期的每日一题是否已完成
const isDailyQuestionCompleted = (dateStr: string) => {
  const formattedDate = dayjs(dateStr).format('YYYY-MM-DD')
  const question = dailyQuestions.value.find(q => 
    dayjs(q.date).format('YYYY-MM-DD') === formattedDate
  )
  return question?.completed || false
}
const getBeijingDate  = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取当前日期的每日一题
const selectedDailyQuestion = ref<any>(null)

const handleDateClick = (dateStr: string) => {
  const formattedDate = dayjs(dateStr).format('YYYY-MM-DD')
  
  // 如果是未来日期，不做任何处理
  if (isFutureDate(formattedDate)) {
    return
  }
  
  const question = dailyQuestions.value.find(q => {
    const questionDate = dayjs(q.date).format('YYYY-MM-DD')
    return questionDate === formattedDate
  })

  // 判断是否是今天
  const isToday = dayjs(formattedDate).isSame(dayjs(), 'day')

  // 无论是否找到题目都更新 selectedDailyQuestion
  selectedDailyQuestion.value = question ? {
    ...question,
    date: formattedDate // 确保日期被正确设置
  } : {
    date: formattedDate,
    questionTitle: isToday ? '今日暂无题目' : '当日暂无题目',
    completed: false
  }
}

// 添加新的状态和计算属性
const currentMonthDate = ref(dayjs())
const currentMonth = computed(() => currentMonthDate.value.format('YYYY年MM月'))

const calendarDays = computed(() => {
  const days = []
  const startOfMonth = currentMonthDate.value.startOf('month')
  const daysInMonth = currentMonthDate.value.daysInMonth()
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = startOfMonth.add(i - 1, 'day')
    days.push({
      date: date.format('YYYY-MM-DD'),
      dayOfMonth: i
    })
  }
  return days
})

const isSelectedDate = (dateStr: string) => {
  return selectedDailyQuestion.value?.date === dateStr
}

const changeMonth = (delta: number) => {
  const targetMonth = currentMonthDate.value.add(delta, 'month'); // 计算目标月份
  const currentMonth = dayjs(); // 当前月份（使用 dayjs 获取）

  // 判断目标月份是否超出当前月份
  if (targetMonth.isAfter(currentMonth, 'month')) {
    // 如果目标月份晚于当前月份，则直接返回，不做任何修改
    return;
  }

  // 更新当前月份
  currentMonthDate.value = targetMonth;

  // 调用 getDailyQuestions 方法获取数据
  getDailyQuestions(currentMonthDate.value.format('YYYY-MM'));
};

// 修改回到今日的方法
const backToToday = async () => {
  // 获取北京时间的今天日期
  const today = getBeijingDate()
  // 如果不在当前月，需要重新获取当月数据
  const currentMonthStr = dayjs(today).format('YYYY-MM')
  if (currentMonthDate.value.format('YYYY-MM') !== currentMonthStr) {
    currentMonthDate.value = dayjs(today)
    await getDailyQuestions(currentMonthStr)
  }
  // 选中今天的日期并触发相关操作
  handleDateClick(today)
}

// 添加计算每月第一天是星期几的计算属性
const firstDayOfMonth = computed(() => {
  const firstDay = currentMonthDate.value.startOf('month').day()
  return firstDay // 返回0-6，0表示周日
})
</script>

<style scoped>
/* 可视化的悬浮效果 */
.floating-stats-card {
  /* position: sticky; */
  /* right: 20px; */ 
  position: absolute;
  top: 60%;
  transform: translateY(-50%);
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
  z-index: 3000; /* 确保在日历上层 */
  transition: opacity 0.3s ease;
}
/* 容器样式 */
.problem-list-container {
  padding: 20px;
  max-width: 100%;
  min-height: 100vh;
  height: 100%;
  margin: 0 auto;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.page-layout {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  flex: 1;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.side-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  height: fit-content;
}

.calendar-card {
  border-radius: 20px;
}

.stats-card {
  border-radius: 20px;
  height: 350px;
}

.custom-calendar {
  padding: 0 16px 16px 16px;
}

.calendar-header {
  padding: 8px 0;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.calendar-title span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.today-btn {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.today-btn:hover {
  background-color: var(--el-color-primary-light-9);
}

.today-btn :deep(.el-icon) {
  font-size: 14px;
}

/* 禁用状态的样式 */
.today-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;
}

.calendar-cell:hover:not(.future) {
  background-color: #f5f7fa;
}
/* 已完成日历格子的悬浮效果 */
.calendar-cell.completed:hover {
  background-color: rgba(103, 194, 58, 0.623); /* 使用更深的绿色 */
}
.calendar-cell.selected {
  background-color: #ff4d4f;
  color: white;
}
.calendar-cell.completed {
  background-color: rgba(103, 194, 58, 0.3);
  color: #303133;
}
/* 修改组合样式，使用更深的绿色背景 */
.calendar-cell.completed.selected {
  background-color: rgba(103, 194, 58, 0.623);  /* 更深的绿色 */
  color: white;  /* 文字改为白色以提高对比度 */
}
/* 当单元格被选中时隐藏勾勾图标 */
/* .calendar-cell.selected .check-icon {
  display: none;
} */
.side-card :deep(.el-card__body) {
  padding: 0;
}

.side-card-header {
  font-weight: bold;
  color: #303133;
}

.stats-content {
  min-height: 350px;
  /* display: flex; */
 

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

/* 难度标签样式 */
.difficulty-label {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.difficulty-entry {
  background-color: #abafa8;
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

/* 添加搜索输入框样式 */
.tag-search-input {
  margin-bottom: 16px;
  width: 100%;
}

/* 修改提交次数列样式 */
.submission-count-header {
  float: center;  /* 靠左浮动，使文字靠近题目列 */
  margin-left: 0;  /* 移除左边距 */
}

/* 每日一题头部样式 */
.daily-question-header {
  padding: 16px 16px 0px 16px;
}

.daily-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.daily-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-name {
  font-size: 14px;
  color: #409EFF;
  cursor: pointer;
}

.question-name:hover {
  text-decoration: underline;
}

.no-daily {
  color: #909399;
  font-size: 14px;
}

/* 修改日历单元格样式，简化显示 */
.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.check-icon {
  /* 勾勾 */
  color: #67C23A;
  font-size: 12px;
}

.completed {
  background-color: rgba(103, 194, 58, 0.1);
}

.future {
  background-color: #F5F7FA;
  color: #C0C4CC;
}

/* 添加链接样式 */
.daily-question-link {
  color: #409EFF;
  text-decoration: none;
}

.daily-question-link:hover {
  text-decoration: underline;
}
 
.question-name {
  font-size: 14px;
}

/* 添加日历头部中间区域样式 */
.calendar-header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.calendar-header-center span {
  font-weight: bold;
}

/* 添加星期标题样式 */
.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday-cell {
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding: 8px 0;
  font-weight: 500;
}

/* 更新日历网格样式 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

/* 空白填充单元格样式 */
.calendar-cell.empty {
  background: transparent;
  cursor: default;
}

/* 调整日期单元格的样式以保持一致的大小 */
.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;
}

/* 周末日期的特殊样式（可选） */
.weekday-cell:first-child,
.weekday-cell:last-child {
  color: #ff9898;
}
</style>