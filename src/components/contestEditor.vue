<template>
  <div class="manage-editor">
    <el-form ref="formRef" label-width="100px">
      <!-- 基本信息部分 -->
      <div class="section-title">
        <h3>基本信息</h3>
      </div>
      
      <el-form-item label="比赛名称" prop="title">
        <el-input placeholder="请输入比赛名称" v-model="title"></el-input>
      </el-form-item>

      <el-form-item label="使用赛制">
        <el-radio-group v-model="contestType">
          <el-radio value="1" size="large">IOI赛制</el-radio>
          <el-radio value="2" size="large">ACM赛制</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="语言限制">
        <el-checkbox-group v-model="language">
          <el-checkbox label="不限制" value="-1" />
          <el-checkbox label="C" value="1" />
          <el-checkbox label="C++" value="2" />
          <el-checkbox label="Java" value="3" />
          <el-checkbox label="Python" value="4" />
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="是否要密码">
        <el-radio-group v-model="isPassword">
          <el-radio value="1" size="large">是</el-radio>
          <el-radio value="2" size="large">否</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="isPassword == '1'" label="密码">
        <el-input v-model="password" style="width: 240px" placeholder="请输入密码" />
      </el-form-item>
      
      <el-form-item label="是否要邀请">
        <el-radio-group v-model="isInvite">
          <el-radio value="true" size="large">是</el-radio>
          <el-radio value="false" size="large">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="比赛时间">
        <el-date-picker v-model="startTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          type="datetime" placeholder="比赛开始时间" style="width: 240px; margin-right: 10px" />
        <span style="margin: 0 10px">至</span>
        <el-date-picker v-model="endTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          type="datetime" placeholder="比赛结束时间" style="width: 240px" />
      </el-form-item>
      
      <el-form-item label="比赛封面">
        <el-upload class="avatar-uploader" :action="null" :show-file-list="false" :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload" :on-change="handleAvatarUpload">
          <img v-if="cover" :src="cover" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="比赛说明" prop="content">
        <mavon-editor style="height: 500px" ref="mavonEditorRef" v-model="description" :ishljs="true" />
      </el-form-item>

      <!-- 添加题目部分 -->
      <div class="section-title">
        <h3>添加题目</h3>
      </div>
      
      <div class="question-section">
        <QuestionSelect @selectedQuestion="selectedQuestion" :contestId="contestId"></QuestionSelect>
        <el-button :disabled="!contestId" @click="saveQuestion" type="primary" style="margin-top: 10px">
          {{ contestId ? '保存题目选择' : '保存题目选择（创建后自动保存）' }}
        </el-button>
      </div>

      <!-- 题目设置部分 -->
      <div v-if="questionListInfo.length > 0" class="section-title">
        <h3>题目顺序设置</h3>
      </div>
      
      <div v-if="questionListInfo.length > 0" class="question-section">
        <el-table :data="questionListInfo" style="width: 100%">
          <el-table-column label="顺序" type="index" width="100" />
          <el-table-column prop="id" label="ID" width="150" />
          <el-table-column prop="title" label="标题" min-width="150" />
          <el-table-column prop="uid" label="作者" width="150" />

          <el-table-column fixed="right" label="操作" min-width="120">
            <template #default="{ row }">
              <el-button :icon="ArrowUp" circle plain type="primary" @click="Up(row)"> </el-button>
              <el-button :icon="ArrowDown" circle plain type="primary" @click="Down(row)">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button :disabled="!contestId" @click="saveOrder" type="primary" style="margin-top: 10px">
          {{ contestId ? '保存题目顺序' : '保存题目顺序（创建后可保存）' }}
        </el-button>
      </div>

      <el-form-item style="margin-top: 30px">
        <el-button @click="handleSubmit" type="primary">保存</el-button>
        <el-button @click="cancel" type="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="js" setup>
import { ref, watch } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { onMounted } from 'vue'
import QuestionSelect from '@/components/questionSelect.vue'

// 表单数据
const title = ref('')
const startTime = ref('')
const endTime = ref('')
const description = ref('')
const password = ref('')
const isPassword = ref('1')
const isInvite = ref('false')
// 设置默认封面链接
const cover = ref('https://ts1.tc.mm.bing.net/th/id/OIP-C.GH6JWG7fkQVqX2qhtkTjygHaHa?w=186&h=186&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2')
const language = ref([])
const contestType = ref('1')
const mavonEditorRef = ref()
const formRef = ref()

// 题目相关数据
const questionListInfo = ref([])
const contestId = ref()
const questionIds = ref([])
// 封面上传相关
const handleAvatarSuccess = (response, uploadFile) => {
  cover.value = uploadFile.url
}

const handleAvatarUpload = (file) => {
  const data = new FormData()
  data.append('file', file.raw)
  request
    .post('/oss/upload/user/avatar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      if (res.code == 200) {
        cover.value = res.data.url
      } else {
        ElMessage.error(res.msg)
      }
    })
}

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('封面图片大小不能超过2MB!')
    return false
  }
  return true
}
// 获取竞赛信息
const getContest = () => {
  request.get(`/root/contest/get/${contestId.value}`).then((res) => {
    if (res.code == 200) {
      title.value = res.data.title
      startTime.value = res.data.startTime
      endTime.value = res.data.endTime
      description.value = res.data.description
      // 只有当服务器返回的封面不为空时才覆盖默认封面
      if (res.data.cover) {
        cover.value = res.data.cover
      }
      // 否则保留默认封面
      language.value = unConvert(res.data.language)

      contestType.value = res.data.type == 1 ? '1' : '2'
      
      // 根据原竞赛的密码设置来决定是否需要密码
      if (res.data.password != null) {
        isPassword.value = '1' // 有密码时选择"是"
        password.value = res.data.password // 读取并保留原有密码
      } else {
        isPassword.value = '2' // 没有密码时选择"否"
        password.value = ''
      }
      
      isInvite.value = String(res.data.isInvite)
      
      // 获取已选题目
      getSelectedQuestion()
    }
  })
}

// 组件挂载时初始化数据
onMounted(() => {
  if (props.id) {
    contestId.value = props.id
    getContest()
  }
})
// 题目排序相关
const Down = (row) => {
  const index = questionListInfo.value.findIndex((item) => item.id === row.id)
  if (index !== -1) {
    if (index === questionListInfo.value.length - 1) {
      ElMessage.warning('已经是最后一个了')
    } else {
      // 交换元素
      const temp = questionListInfo.value[index]
      questionListInfo.value[index] = questionListInfo.value[index + 1]
      questionListInfo.value[index + 1] = temp
    }
  }
}

const Up = (row) => {
  const index = questionListInfo.value.findIndex((item) => item.id === row.id)
  if (index !== -1) {
    if (index === 0) {
      ElMessage.warning('已经是第一个了')
    } else {
      // 交换元素
      const temp = questionListInfo.value[index]
      questionListInfo.value[index] = questionListInfo.value[index - 1]
      questionListInfo.value[index - 1] = temp
    }
  }
}

// 保存题目顺序
const saveOrder = async () => {
  const questionIds = questionListInfo.value.map((item) => item.id)
  request
    .post('/root/contest/edit/problem', {
      contestId: contestId.value,
      questionIds: questionIds
    })
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success('题目顺序保存成功')
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('保存失败')
    })
}

// 根据ID获取题目信息
const getQuestionByIds = async () => {
  try {
    const response = await request.post(`/root/problem/get/ids`, {
      pageStart: 1,
      pageSize: 10000,
      questionIds: questionIds.value
    })
    if (response.code === 200) {
      questionListInfo.value = response.data.list
    }
  } catch (error) {
    console.error('获取已选题目失败:', error)
  }
}

// 获取竞赛已选题目
const getSelectedQuestion = async () => {
  try {
    const response = await request.get(`/root/contest/problem/${contestId.value}`)
    if (response.code === 200) {
      questionIds.value = response.data
      getQuestionByIds()
    }
  } catch (error) {
    console.error('获取已选题目失败:', error)
  }
}
// 定义属性
const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
})

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (startTime.value == '' || endTime.value == '') {
    ElMessage.error('请输入比赛开始时间和结束时间')
    return false
  }
  if (description.value == '') {
    ElMessage.error('请输入比赛描述')
    return false
  }
  if (title.value == '') {
    ElMessage.error('请输入比赛名称')
    return false
  }
  if (contestType.value == '') {
    ElMessage.error('请选择比赛类型')
    return false
  }
  // 封面已有默认值，不再强制要求上传
  if (!cover.value) {
    ElMessage.error('封面加载失败')
    return false
  }
  if (isPassword.value == '1' && password.value == '') {
    ElMessage.error('比赛密码不能为空')
    return false
  }
  
  try {
    if (contestId.value) {
      // 编辑现有竞赛
      const res = await request.post('/root/contest/edit', {
        id: contestId.value,
        title: title.value,
        startTime: startTime.value,
        endTime: endTime.value,
        description: description.value,
        password: isPassword.value == '1' ? password.value : null,
        isInvite: isInvite.value,
        cover: cover.value,
        language: convert(),
        contestType: contestType.value
      })
      
      if (res.code == 200) {
        ElMessage.success('更新成功')
        // 如果已经有题目，更新题目顺序
        if (questionListInfo.value.length > 0) {
          await saveOrder()
        }
        emit('next')
      } else {
        ElMessage.error(res.msg)
      }
    } else {
      // 创建新竞赛
      const res = await request.post('/root/contest/create', {
        title: title.value,
        startTime: startTime.value,
        endTime: endTime.value,
        description: description.value,
        password: isPassword.value == '1' ? password.value : null,
        isInvite: isInvite.value,
        cover: cover.value,
        language: convert(),
        contestType: contestType.value
      })
      
      if (res.code == 200) {
        contestId.value = res.data
        ElMessage.success('创建成功')
        // 保存题目（如果有选择）
        if (questionIds.value.length > 0) {
          await saveQuestion()
          // 若已有排序，紧接着保存顺序
          if (questionListInfo.value.length > 0) {
            await saveOrder()
          }
        }
      } else {
        ElMessage.error(res.msg)
      }
    }
  } catch (error) {
    ElMessage.error('操作失败：' + error)
  }
}
// 取消操作
function cancel() {
  emit('cancel')
}
// 语言处理函数
const convert = () => {
  const languageList = language.value
  let s = 0
  for (let i = 0; i < languageList.length; i++) {
    if (languageList[i] == '-1') {
      s = -1
      break
    } else {
      s += 1 << parseInt(languageList[i])
    }
  }
  return s
}

const unConvert = (lang) => {
  const result = []
  if (lang == -1) {
    result.push('-1')
    return result
  } else {
    if (((1 << 1) & lang) != 0) {
      result.push('1')
    }
    if (((1 << 2) & lang) != 0) {
      result.push('2')
    }
    if (((1 << 3) & lang) != 0) {
      result.push('3')
    }
    if (((1 << 4) & lang) != 0) {
      result.push('4')
    }
  }
  return result
}

// 接收题目选择结果
const selectedQuestion = (value) => {
  questionIds.value = value
  // 预览并允许排序（未创建竞赛时也可本地排序）
  if (questionIds.value && questionIds.value.length > 0) {
    getQuestionByIds()
  } else {
    questionListInfo.value = []
  }
}

// 定义事件
const emit = defineEmits(['cancel', 'next'])

// 保存题目选择
const saveQuestion = async () => {
  if (!contestId.value) {
    ElMessage.error('请先保存竞赛基本信息')
    return
  }
  
  request
    .post('/root/contest/edit/problem', {
      contestId: contestId.value,
      questionIds: (questionListInfo.value.length > 0
        ? questionListInfo.value.map((i) => i.id)
        : questionIds.value)
    })
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success('题目保存成功')
        getSelectedQuestion()
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('保存失败')
    })
}
// 监听ID变化
watch(
  () => props.id,
  (newValue) => {
    if (newValue) {
      contestId.value = newValue
      getContest()
    }
  }
)
</script>

<style scoped>
.manage-editor {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

/* 部分标题样式 */
.section-title {
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;
}

.section-title h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

/* 题目部分样式 */
.question-section {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

/* 头像上传样式 */
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
}

/* 表单元素样式优化 */
.el-form-item {
  margin-bottom: 25px;
}

/* 表格样式优化 */
.question-section .el-table {
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 按钮组样式 */
.el-form-item:last-child {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
}

.el-form-item:last-child .el-button {
  margin: 0 10px;
  min-width: 100px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .manage-editor {
    padding: 10px;
  }
  
  .el-date-picker {
    margin-bottom: 10px;
  }
  
  .avatar-uploader-icon,
  .avatar {
    width: 150px;
    height: 150px;
  }
}
</style>

<style>
.example-item {
  background-color: rgb(154, 227, 202);
  min-width: 200px;
  border-radius: 15px;
  padding: 20px;
  margin: 10px;
}

.editorType {
  margin: 20px;
}

.ql-editor {
  height: 300px;
}

.manage-editor {
  background-color: aliceblue;
  margin: auto;
  width: 70%;
  border-radius: 15px;
  padding: 50px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
