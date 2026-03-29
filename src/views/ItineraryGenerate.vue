<template>
  <div class="itinerary-generate">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="generate-container">
        <div class="title-section">
          <h1>🤖 AI智能行程规划</h1>
          <p>告诉我你的需求，让AI为你定制专属旅行计划</p>
        </div>

        <el-card class="form-card">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="旅行时间" prop="dateRange">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled-date="disabledDate"
                style="width: 100%"
                @change="handleDateChange"
              />
            </el-form-item>

            <el-form-item label="旅行天数" prop="days">
              <el-input-number v-model="form.days" :min="1" :max="7" />
              <span class="tip">建议1-7天</span>
            </el-form-item>

            <el-form-item label="总预算" prop="budget">
              <el-input v-model="form.budget" placeholder="请输入预算">
                <template #prepend>¥</template>
                <template #append>元</template>
              </el-input>
              <div class="budget-tips">
                <el-tag size="small" @click="setBudget(500)">经济型 ¥500/天</el-tag>
                <el-tag size="small" type="success" @click="setBudget(800)">舒适型 ¥800/天</el-tag>
                <el-tag size="small" type="warning" @click="setBudget(1500)">豪华型 ¥1500/天</el-tag>
              </div>
            </el-form-item>

            <el-form-item label="出行人数" prop="peopleCount">
              <el-input-number v-model="form.peopleCount" :min="1" :max="20" />
              <span class="tip">人</span>
            </el-form-item>

            <el-form-item label="兴趣偏好" prop="interestTags">
              <el-checkbox-group v-model="form.interestTags">
                <el-checkbox label="文化古迹">文化古迹</el-checkbox>
                <el-checkbox label="自然风光">自然风光</el-checkbox>
                <el-checkbox label="美食体验">美食体验</el-checkbox>
                <el-checkbox label="宗教朝圣">宗教朝圣</el-checkbox>
                <el-checkbox label="休闲放松">休闲放松</el-checkbox>
                <el-checkbox label="亲子游玩">亲子游玩</el-checkbox>
                <el-checkbox label="摄影打卡">摄影打卡</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="旅行风格" prop="travelStyle">
              <el-radio-group v-model="form.travelStyle">
                <el-radio label="休闲">休闲游（节奏慢，深度体验）</el-radio>
                <el-radio label="紧凑">紧凑游（景点多，时间充实）</el-radio>
                <el-radio label="深度游">深度游（专注某个主题）</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="区域偏好">
              <el-select v-model="form.region" placeholder="选择区域" clearable>
                <el-option label="不限" value="" />
                <el-option label="城厢区" value="城厢区" />
                <el-option label="荔城区" value="荔城区" />
                <el-option label="秀屿区" value="秀屿区" />
                <el-option label="涵江区" value="涵江区" />
                <el-option label="仙游县" value="仙游县" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" @click="generateItinerary" :loading="generating">
                <el-icon><MagicStick /></el-icon>
                AI生成行程
              </el-button>
              <el-button size="large" @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 生成结果 -->
        <el-card v-if="itinerary" class="result-card">
          <template #header>
            <div class="card-header">
              <span>🎉 为您生成的行程</span>
              <div>
                <el-button type="primary" @click="saveItinerary" :loading="saving">保存行程</el-button>
                <el-button @click="editItinerary">编辑行程</el-button>
              </div>
            </div>
          </template>

          <div class="itinerary-preview">
            <div class="summary">
              <h2>{{ itinerary.title }}</h2>
              <div class="meta">
                <el-tag>{{ itinerary.days }}天</el-tag>
                <el-tag type="success">预算 ¥{{ itinerary.totalBudget }}</el-tag>
                <el-tag type="warning">{{ itinerary.interestTags.join('、') }}</el-tag>
              </div>
            </div>

            <el-timeline class="timeline">
              <el-timeline-item
                v-for="(day, index) in itinerary.dayList"
                :key="index"
                :timestamp="formatDate(day.date)"
                placement="top"
              >
                <el-card>
                  <div class="day-header">
                    <h3>第{{ day.dayNumber }}天 {{ day.theme || '' }}</h3>
                    <span class="budget">预算: ¥{{ day.budget }}</span>
                  </div>
                  <div class="day-items">
                    <div v-for="item in day.items" :key="item.sortOrder" class="item">
                      <div class="item-time">
                        <el-icon><Clock /></el-icon>
                        {{ item.startTime }} - {{ item.endTime }}
                      </div>
                      <div class="item-content">
                        <div class="item-header">
                          <el-tag :type="getItemTypeTag(item.itemType)" size="small">
                            {{ getItemTypeName(item.itemType) }}
                          </el-tag>
                          <span class="item-name">{{ item.itemName }}</span>
                        </div>
                        <div v-if="item.address" class="item-address">
                          <el-icon><Location /></el-icon>
                          {{ item.address }}
                        </div>
                        <div class="item-footer">
                          <span class="duration">停留 {{ item.duration }}分钟</span>
                          <span class="cost">¥{{ item.cost }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <div class="cost-summary">
              <h3>费用统计</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="景点门票">
                  ¥{{ calculateCostByType(1) }}
                </el-descriptions-item>
                <el-descriptions-item label="餐饮费用">
                  ¥{{ calculateCostByType(2) }}
                </el-descriptions-item>
                <el-descriptions-item label="住宿费用">
                  ¥{{ calculateCostByType(3) }}
                </el-descriptions-item>
                <el-descriptions-item label="总计">
                  <span style="color: #ff6b6b; font-weight: bold; font-size: 18px">
                    ¥{{ itinerary.totalBudget }}
                  </span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, Clock, Location } from '@element-plus/icons-vue'
import request from '@/util/request'
import dayjs from 'dayjs'

const router = useRouter()

const formRef = ref()
const generating = ref(false)
const saving = ref(false)
const itinerary = ref<any>(null)

const form = reactive({
  dateRange: [],
  days: 2,
  budget: 1000,
  peopleCount: 2,
  interestTags: ['文化古迹', '美食体验'],
  travelStyle: '休闲',
  region: ''
})

const rules = {
  dateRange: [{ required: true, message: '请选择旅行时间', trigger: 'change' }],
  days: [{ required: true, message: '请输入旅行天数', trigger: 'blur' }],
  budget: [{ required: true, message: '请输入预算', trigger: 'blur' }],
  peopleCount: [{ required: true, message: '请输入出行人数', trigger: 'blur' }],
  interestTags: [{ required: true, message: '请选择至少一个兴趣偏好', trigger: 'change' }],
  travelStyle: [{ required: true, message: '请选择旅行风格', trigger: 'change' }]
}

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 日期变化时自动计算天数
const handleDateChange = (dates: any) => {
  if (dates && dates.length === 2) {
    const start = dayjs(dates[0])
    const end = dayjs(dates[1])
    form.days = end.diff(start, 'day') + 1
  }
}

// 快速设置预算
const setBudget = (dailyBudget: number) => {
  form.budget = dailyBudget * form.days
}

// 生成行程
const generateItinerary = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    generating.value = true
    try {
      const res: any = await request.post('/itinerary/generate', {
        startDate: dayjs(form.dateRange[0]).format('YYYY-MM-DD'),
        endDate: dayjs(form.dateRange[1]).format('YYYY-MM-DD'),
        days: form.days,
        budget: form.budget,
        interestTags: form.interestTags,
        travelStyle: form.travelStyle,
        peopleCount: form.peopleCount,
        region: form.region
      })

      if (res && res.data) {
        itinerary.value = res.data
        ElMessage.success('行程生成成功！')
        // 滚动到结果区域
        setTimeout(() => {
          document.querySelector('.result-card')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '生成失败，请重试')
    } finally {
      generating.value = false
    }
  })
}

// 保存行程
const saveItinerary = async () => {
  saving.value = true
  try {
    const res: any = await request.post('/itinerary/save', itinerary.value)
    if (res && res.data) {
      ElMessage.success('行程保存成功！')
      router.push(`/itinerary/${res.data}`)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 编辑行程
const editItinerary = () => {
  // 跳转到编辑页面
  router.push({
    path: '/itinerary/edit',
    query: { data: JSON.stringify(itinerary.value) }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  itinerary.value = null
}

// 获取项目类型名称
const getItemTypeName = (type: number) => {
  const names: any = {
    1: '景点',
    2: '餐饮',
    3: '住宿',
    4: '交通',
    5: '其他'
  }
  return names[type] || '未知'
}

// 获取项目类型标签颜色
const getItemTypeTag = (type: number) => {
  const tags: any = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'info',
    5: ''
  }
  return tags[type] || ''
}

// 计算某类型的总费用
const calculateCostByType = (type: number) => {
  if (!itinerary.value) return 0
  let total = 0
  itinerary.value.dayList.forEach((day: any) => {
    day.items.forEach((item: any) => {
      if (item.itemType === type) {
        total += parseFloat(item.cost || 0)
      }
    })
  })
  return total.toFixed(2)
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日 dddd')
}

const goHome = () => router.push('/')
const goBack = () => router.back()
</script>

<style scoped lang="scss">
.itinerary-generate {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
  line-height: 60px;

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .logo h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      cursor: pointer;
    }
  }
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.title-section {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;

  h1 {
    font-size: 42px;
    margin: 0 0 16px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 18px;
    opacity: 0.9;
  }
}

.form-card {
  margin-bottom: 30px;

  .tip {
    margin-left: 12px;
    color: #999;
    font-size: 14px;
  }

  .budget-tips {
    margin-top: 8px;
    display: flex;
    gap: 8px;

    .el-tag {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.result-card {
  animation: slideUp 0.5s ease-out;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
  }
}

.itinerary-preview {
  .summary {
    margin-bottom: 32px;

    h2 {
      margin: 0 0 16px 0;
      font-size: 28px;
      color: #333;
    }

    .meta {
      display: flex;
      gap: 12px;
    }
  }

  .timeline {
    margin-bottom: 32px;
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: 20px;
      color: #667eea;
    }

    .budget {
      color: #ff6b6b;
      font-weight: bold;
    }
  }

  .day-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .item {
    display: flex;
    gap: 16px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background: #f0f0f0;
      transform: translateX(4px);
    }

    .item-time {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 120px;
      color: #666;
      font-size: 14px;
    }

    .item-content {
      flex: 1;

      .item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .item-name {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .item-address {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #999;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        font-size: 14px;

        .duration {
          color: #666;
        }

        .cost {
          color: #ff6b6b;
          font-weight: bold;
        }
      }
    }
  }

  .cost-summary {
    margin-top: 32px;
    padding: 24px;
    background: #f9f9f9;
    border-radius: 8px;

    h3 {
      margin: 0 0 16px 0;
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

