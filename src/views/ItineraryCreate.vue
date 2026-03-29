<template>
  <div class="itinerary-create-page">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <div class="create-container">
      <div class="create-card">
        <div class="card-header">
          <h2>📝 创建我的行程</h2>
          <p>让AI帮你规划，或者自己动手设计专属旅程</p>
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="create-form">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3>📋 基本信息</h3>
            
            <el-form-item label="行程标题" prop="title">
              <el-input 
                v-model="form.title" 
                placeholder="给你的行程起个名字，如：莆田3日游"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="旅行时间" prop="dateRange">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="出行人数" prop="peopleCount">
              <el-input-number 
                v-model="form.peopleCount" 
                :min="1" 
                :max="20"
                controls-position="right"
              />
              <span class="tip">人</span>
            </el-form-item>

            <el-form-item label="总预算" prop="budget">
              <el-input-number 
                v-model="form.budget" 
                :min="0" 
                :step="100"
                controls-position="right"
              />
              <span class="tip">元</span>
            </el-form-item>
          </div>

          <!-- 偏好设置 -->
          <div class="form-section">
            <h3>🎯 偏好设置</h3>
            
            <el-form-item label="兴趣标签" prop="interests">
              <el-checkbox-group v-model="form.interests" class="interest-tags">
                <el-checkbox-button 
                  v-for="tag in interestTags" 
                  :key="tag.value" 
                  :label="tag.value"
                >
                  {{ tag.icon }} {{ tag.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="旅行风格" prop="style">
              <el-radio-group v-model="form.style" class="style-radios">
                <el-radio-button label="relaxed">
                  <div class="radio-content">
                    <div class="icon">🌴</div>
                    <div class="text">
                      <div class="title">休闲游</div>
                      <div class="desc">慢节奏，享受旅程</div>
                    </div>
                  </div>
                </el-radio-button>
                <el-radio-button label="normal">
                  <div class="radio-content">
                    <div class="icon">🚶</div>
                    <div class="text">
                      <div class="title">常规游</div>
                      <div class="desc">张弛有度，不紧不慢</div>
                    </div>
                  </div>
                </el-radio-button>
                <el-radio-button label="intensive">
                  <div class="radio-content">
                    <div class="icon">🏃</div>
                    <div class="text">
                      <div class="title">深度游</div>
                      <div class="desc">充实紧凑，多看多玩</div>
                    </div>
                  </div>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="区域偏好" prop="areas">
              <el-checkbox-group v-model="form.areas" class="area-tags">
                <el-checkbox-button 
                  v-for="area in areaOptions" 
                  :key="area.value" 
                  :label="area.value"
                >
                  {{ area.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="特殊需求">
              <el-input
                v-model="form.specialRequirements"
                type="textarea"
                :rows="3"
                placeholder="有什么特殊要求吗？比如：需要无障碍设施、素食餐厅、亲子友好等"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </div>
        </el-form>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button 
            type="primary" 
            size="large" 
            :loading="aiGenerating"
            @click="handleAIGenerate"
            class="ai-btn"
          >
            <span class="btn-icon">✨</span>
            AI智能生成
          </el-button>
          <el-button 
            size="large" 
            @click="handleManualCreate"
            class="manual-btn"
          >
            <span class="btn-icon">✏️</span>
            手动创建
          </el-button>
        </div>
      </div>

      <!-- 示例行程卡片 -->
      <div class="example-section">
        <h3>💡 热门行程模板</h3>
        <div class="example-grid">
          <div 
            v-for="example in exampleItineraries" 
            :key="example.id"
            class="example-card"
            @click="useTemplate(example)"
          >
            <div class="example-cover">
              <img :src="example.cover" :alt="example.title" />
              <div class="example-tag">{{ example.days }}天{{ example.days - 1 }}晚</div>
            </div>
            <div class="example-info">
              <h4>{{ example.title }}</h4>
              <div class="example-meta">
                <span>💰 ¥{{ example.budget }}</span>
                <span>👥 {{ example.suitable }}</span>
              </div>
              <div class="example-tags">
                <el-tag 
                  v-for="tag in example.tags" 
                  :key="tag" 
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const aiGenerating = ref(false)

// 表单数据
const form = reactive({
  title: '',
  dateRange: [] as Date[],
  peopleCount: 2,
  budget: 1500,
  interests: [] as string[],
  style: 'normal',
  areas: [] as string[],
  specialRequirements: ''
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入行程标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dateRange: [
    { required: true, message: '请选择旅行时间', trigger: 'change' }
  ],
  peopleCount: [
    { required: true, message: '请输入出行人数', trigger: 'blur' }
  ],
  budget: [
    { required: true, message: '请输入预算', trigger: 'blur' }
  ],
  interests: [
    { type: 'array', min: 1, message: '请至少选择一个兴趣标签', trigger: 'change' }
  ]
}

// 兴趣标签
const interestTags = [
  { label: '自然风光', value: 'nature', icon: '🏞️' },
  { label: '历史文化', value: 'culture', icon: '🏛️' },
  { label: '美食探店', value: 'food', icon: '🍜' },
  { label: '宗教朝圣', value: 'religion', icon: '🙏' },
  { label: '海滨度假', value: 'beach', icon: '🏖️' },
  { label: '亲子游玩', value: 'family', icon: '👨‍👩‍👧' },
  { label: '摄影打卡', value: 'photo', icon: '📷' },
  { label: '户外运动', value: 'outdoor', icon: '🚴' }
]

// 区域选项
const areaOptions = [
  { label: '城厢区', value: 'chengxiang' },
  { label: '涵江区', value: 'hanjiang' },
  { label: '荔城区', value: 'licheng' },
  { label: '秀屿区', value: 'xiuyu' },
  { label: '湄洲岛', value: 'meizhou' },
  { label: '仙游县', value: 'xianyou' }
]

// 示例行程
const exampleItineraries = [
  {
    id: 1,
    title: '湄洲岛朝圣之旅',
    days: 2,
    budget: 800,
    suitable: '情侣/家庭',
    tags: ['宗教', '海滨', '文化'],
    cover: '/src/views/imgs/1.jpg'
  },
  {
    id: 2,
    title: '莆田美食探索',
    days: 3,
    budget: 1200,
    suitable: '美食爱好者',
    tags: ['美食', '文化', '休闲'],
    cover: '/src/views/imgs/2.jpg'
  },
  {
    id: 3,
    title: '仙游山水游',
    days: 2,
    budget: 1000,
    suitable: '户外爱好者',
    tags: ['自然', '户外', '摄影'],
    cover: '/src/views/imgs/3.jpg'
  },
  {
    id: 4,
    title: '莆田文化深度游',
    days: 4,
    budget: 2000,
    suitable: '文化爱好者',
    tags: ['历史', '文化', '深度'],
    cover: '/src/views/imgs/4.jpg'
  }
]

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// AI智能生成
const handleAIGenerate = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      aiGenerating.value = true
      
      try {
        // 计算天数
        const days = Math.ceil(
          (form.dateRange[1].getTime() - form.dateRange[0].getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

        // 构建AI提示词
        const prompt = buildAIPrompt(days)
        
        // 调用AI生成接口
        const response = await fetch('/api/itinerary/generate-itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token') || ''
          },
          body: JSON.stringify({
            title: form.title,
            startDate: form.dateRange[0],
            endDate: form.dateRange[1],
            days: days,
            peopleCount: form.peopleCount,
            budget: form.budget,
            interests: form.interests,
            style: form.style,
            areas: form.areas,
            specialRequirements: form.specialRequirements,
            prompt: prompt
          })
        })

        if (response.ok) {
          const result = await response.json()
          ElMessage.success('AI行程生成成功！')
          
          // 跳转到编辑器页面
          router.push({
            path: '/itinerary/editor',
            query: { id: result.data.id }
          })
        } else {
          throw new Error('生成失败')
        }
      } catch (error) {
        console.error('AI生成失败:', error)
        ElMessage.error('AI生成失败，请稍后重试')
      } finally {
        aiGenerating.value = false
      }
    }
  })
}

// 构建AI提示词
const buildAIPrompt = (days: number) => {
  const interestLabels = form.interests.map(v => 
    interestTags.find(t => t.value === v)?.label
  ).join('、')
  
  const styleMap = {
    relaxed: '休闲放松，每天安排2-3个景点',
    normal: '常规节奏，每天安排3-4个景点',
    intensive: '紧凑充实，每天安排4-5个景点'
  }
  
  return `请为我规划一个${days}天的莆田旅游行程。
我的兴趣是：${interestLabels}。
旅行风格：${styleMap[form.style as keyof typeof styleMap]}。
预算：${form.budget}元（${form.peopleCount}人）。
${form.specialRequirements ? `特殊需求：${form.specialRequirements}` : ''}
请包含景点、美食、住宿推荐，并给出每日详细安排。`
}

// 手动创建
const handleManualCreate = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 计算天数
        const days = Math.ceil(
          (form.dateRange[1].getTime() - form.dateRange[0].getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

        // 创建空白行程
        const response = await fetch('/api/itinerary/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token') || ''
          },
          body: JSON.stringify({
            title: form.title,
            startDate: form.dateRange[0],
            endDate: form.dateRange[1],
            days: days,
            peopleCount: form.peopleCount,
            budget: form.budget,
            interests: form.interests.join(','),
            style: form.style,
            areas: form.areas.join(','),
            specialRequirements: form.specialRequirements
          })
        })

        if (response.ok) {
          const result = await response.json()
          ElMessage.success('行程创建成功！')
          
          // 跳转到编辑器页面
          router.push({
            path: '/itinerary/editor',
            query: { id: result.data.id }
          })
        } else {
          throw new Error('创建失败')
        }
      } catch (error) {
        console.error('创建失败:', error)
        ElMessage.error('创建失败，请稍后重试')
      }
    }
  })
}

// 使用模板
const useTemplate = (template: any) => {
  ElMessageBox.confirm(
    `使用"${template.title}"模板？将自动填充相关信息。`,
    '使用模板',
    {
      confirmButtonText: '使用',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    form.title = template.title
    form.budget = template.budget
    // 根据模板标签设置兴趣
    const tagMap: Record<string, string> = {
      '宗教': 'religion',
      '海滨': 'beach',
      '文化': 'culture',
      '美食': 'food',
      '自然': 'nature',
      '户外': 'outdoor',
      '摄影': 'photo'
    }
    form.interests = template.tags.map((t: string) => tagMap[t]).filter(Boolean)
    
    ElMessage.success('模板已应用，请继续完善信息')
  }).catch(() => {})
}

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.itinerary-create-page {
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
  
  .create-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    
    .create-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin-bottom: 40px;
      
      .card-header {
        text-align: center;
        margin-bottom: 40px;
        
        h2 {
          font-size: 32px;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        p {
          color: #666;
          font-size: 16px;
          margin: 0;
        }
      }
      
      .create-form {
        .form-section {
          margin-bottom: 40px;
          padding: 30px;
          background: #f8f9fa;
          border-radius: 12px;
          
          h3 {
            font-size: 20px;
            margin: 0 0 24px 0;
            color: #333;
          }
          
          .tip {
            margin-left: 10px;
            color: #666;
          }
          
          .interest-tags,
          .area-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .style-radios {
            display: flex;
            gap: 16px;
            
            :deep(.el-radio-button) {
              flex: 1;
              
              .el-radio-button__inner {
                width: 100%;
                height: auto;
                padding: 20px;
                border-radius: 12px;
              }
            }
            
            .radio-content {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .icon {
                font-size: 32px;
              }
              
              .text {
                text-align: left;
                
                .title {
                  font-size: 16px;
                  font-weight: 600;
                  margin-bottom: 4px;
                }
                
                .desc {
                  font-size: 12px;
                  color: #999;
                }
              }
            }
          }
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 40px;
        
        .el-button {
          padding: 20px 60px;
          font-size: 18px;
          border-radius: 12px;
          
          .btn-icon {
            margin-right: 8px;
            font-size: 20px;
          }
        }
        
        .ai-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          }
        }
        
        .manual-btn {
          &:hover {
            transform: translateY(-2px);
          }
        }
      }
    }
    
    .example-section {
      h3 {
        color: white;
        font-size: 24px;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .example-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        
        .example-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          }
          
          .example-cover {
            position: relative;
            height: 180px;
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
            
            .example-tag {
              position: absolute;
              top: 12px;
              right: 12px;
              background: rgba(255, 255, 255, 0.95);
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              color: #667eea;
            }
          }
          
          .example-info {
            padding: 16px;
            
            h4 {
              margin: 0 0 12px 0;
              font-size: 18px;
              color: #333;
            }
            
            .example-meta {
              display: flex;
              gap: 16px;
              margin-bottom: 12px;
              font-size: 14px;
              color: #666;
            }
            
            .example-tags {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
          }
        }
      }
    }
  }
}
</style>

