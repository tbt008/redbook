<template>
  <el-steps style="max-width: 600px; margin: auto; padding: 50px" :active="active" finish-status="success">
    <el-step title="新建比赛" />
    <el-step title="添加题目" />
    <el-step title="题目设置" />
  </el-steps>
  <div class="manage-editor">
    <div v-if="active == 0">
      <el-form ref="formRef" label-width="100px">
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
          </el-radio-group></el-form-item>
        <el-form-item v-if="isPassword == '1'" label="密码">
          <el-radio-group>
            <el-input v-model="password" style="width: 240px" placeholder="请输入密码" /> </el-radio-group></el-form-item>
        <el-form-item label="是否要邀请"><el-radio-group v-model="isInvite">
            <el-radio value="true" size="large">是</el-radio>
            <el-radio value="false" size="large">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="比赛时间">
          <el-date-picker v-model="startTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime" placeholder="比赛开始时间" />至
          <el-date-picker v-model="endTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime" placeholder="比赛结束时间" />
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

        <el-form-item>
          <el-button @click="primary" type="primary">创建</el-button>
          <el-button v-if="props.id !== undefined" @click="() => {
              active++
            }
            " type="cancel">跳过</el-button>
          <el-button @click="cancel" type="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="active == 1">
      <QuestionSelect @selectedQuestion="selectedQuestion" :contestId="contestId"></QuestionSelect>
      <el-button @click="() => {
          active--
        }
        " type="primary">上一步</el-button>
      <el-button @click="saveQuestion" type="cancel">保存</el-button>
      <el-button @click="() => {
          active++
          getSelectedQuestion()
        }
        " type="cancel">跳过</el-button>
    </div>
    <div v-if="active == 2">
      <el-table :data="questionListInfo" style="width: 100%">
        <el-table-column label="顺序" type="index" width="100" />
        <el-table-column prop="id" label="id" width="150" />
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
      <el-button @click="() => {
          active--
        }
        " type="primary">上一步</el-button>
      <el-button @click="saveOrder" type="cancel">保存</el-button>
      <el-button @click="next" type="cancel">完成</el-button>
    </div>
    <div v-if="active == 3">
      <el-button @click="() => {
          active--
        }
        " type="primary">上一步</el-button>
      <el-button @click="next" type="cancel">完成</el-button>
    </div>
  </div>
</template>
<script lang="js" setup>
import { ref, watch } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { onMounted } from 'vue'
import QuestionSelect from '@/components/questionSelect.vue'
const title = ref('')
const startTime = ref('')
const endTime = ref('')
const description = ref('')
const password = ref('')
const isPassword = ref('1')
const isInvite = ref('false')
const cover = ref()
const language = ref([])
const contestType = ref('1')
const mavonEditorRef = ref()
const active = ref(0)
const questionListInfo = ref([])
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
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }

  return true
}
const getContest = () => {
  request.get(`/root/contest/get/${contestId.value}`).then((res) => {
    if (res.code == 200) {
      title.value = res.data.title
      startTime.value = res.data.startTime
      endTime.value = res.data.endTime
      description.value = res.data.description
      cover.value = res.data.cover
      language.value = unConvert(res.data.language)

      contestType.value = res.data.type == 1 ? '1' : '2'
      if (res.data.password != null) {
        isPassword.value = '1'
        password.value = res.data.password
      }
      isInvite.value = String(res.data.isInvite)
    }
  })
}
onMounted(() => {
  if (props.id) {
    contestId.value = props.id
    getContest()
  }
})
const Down = (row) => {
  // 首先找到匹配元素的索引
  const index = questionListInfo.value.findIndex((item) => item.id === row.id)

  if (index !== -1) {
    // 如果找到了匹配的元素
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
  // 首先找到匹配元素的索引
  const index = questionListInfo.value.findIndex((item) => item.id === row.id)

  if (index !== -1) {
    // 如果找到了匹配的元素
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
const saveOrder = async () => {
  // 把questionListInfo里的id数组
  var questionIds = questionListInfo.value.map((item) => item.id)
  request
    .post('/root/contest/edit/problem', {
      contestId: contestId.value,
      questionIds: questionIds
    })
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success('保存成功')
        active.value++
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('保存失败')
    })
}
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
const getSelectedQuestion = async () => {
  try {
    const response = await request.get(`/root/contest/problem/${props.id}`)
    if (response.code === 200) {
      selectedQuestion.value = response.data
      getQuestionByIds()
    }
  } catch (error) {
    console.error('获取已选题目失败:', error)
  }
}
const contestId = ref()
const questionIds = ref([])
const props = defineProps({
  id: {
    type: Object
  }
})
function primary() {
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
  if (cover.value == '') {
    ElMessage.error('请选择比赛类型')
    return false
  }
  if (isPassword.value == 1 && password.value == '') {
    ElMessage.error('比赛密码不能为空')
    return false
  }
  if (props.id == contestId.value && props.id !== undefined) {
    request
      .post('/root/contest/edit', {
        id: contestId.value,
        title: title.value,
        startTime: startTime.value,
        endTime: endTime.value,
        description: description.value,
        password: isPassword.value == 1 ? password.value : null,
        isInvite: isInvite.value,
        cover: cover.value,
        language: convert(),
        contestType: contestType.value
      })
      .then((res) => {
        if (res.code == 200) {
          contestId.value = res.data
          ElMessage.success('更新成功')
          active.value++
        } else {
          ElMessage.error(res.msg)
        }
      })
  } else {
    request
      .post('/root/contest/create', {
        title: title.value,
        startTime: startTime.value,
        endTime: endTime.value,
        description: description.value,
        password: isPassword.value == 1 ? password.value : null,
        isInvite: isInvite.value,
        cover: cover.value,
        language: convert(),
        contestType: contestType.value
      })
      .then((res) => {
        if (res.code == 200) {
          contestId.value = res.data
          ElMessage.success('创建成功')
          active.value++
        } else {
          ElMessage.error(res.msg)
        }
      })
  }
}
function cancel() {
  emit('cancel')
}
function next() {
  emit('cancel')
}
const convert = () => {
  const languageList = language.value
  let s = 0
  for (let i = 0; i < languageList.length; i++) {
    if (languageList[i] == -1) {
      s = -1
      break
    } else {
      s += 1 << languageList[i]
    }
  }
  return s
}
const unConvert = (lang) => {
  if (lang == -1) {
    language.value.push('-1')
    return language.value
  } else {
    if (((1 << 1) & lang) != 0) {
      language.value.push('1')
    }
    if (((1 << 2) & lang) != 0) {
      language.value.push('2')
    }
    if (((1 << 3) & lang) != 0) {
      language.value.push('3')
    }
    if (((1 << 4) & lang) != 0) {
      language.value.push('4')
    }
  }

  return language.value
}

const selectedQuestion = (value) => {
  questionIds.value = value
}
const emit = defineEmits(['cancel'])
const saveQuestion = () => {
  request
    .post('/root/contest/edit/problem', {
      contestId: contestId.value,
      questionIds: questionIds.value
    })
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success('保存成功')
        active.value++
        getSelectedQuestion()
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('保存失败')
    })
}
watch(
  () => props.id,
  (newValue, oldValue) => {
    if (newValue) {
      contestId.value = props.id
      getContest()
    }
  }
)
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.editor {
  width: 100%;
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
