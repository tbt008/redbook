<template>
  <el-steps
      style="max-width: 600px; margin: auto; padding: 50px"
      :active="active"
      finish-status="success"
  >
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
            <el-radio value="1" size="large">ACM赛制</el-radio>
            <el-radio value="2" size="large">IOI赛制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否要密码">
          <el-radio-group v-model="isPassword">
            <el-radio value="1" size="large">是</el-radio>
            <el-radio value="2" size="large">否</el-radio>
          </el-radio-group></el-form-item
        >
        <el-form-item v-if="isPassword == '1'" label="密码">
          <el-radio-group>
            <el-input
                v-model="password"
                style="width: 240px"
                placeholder="请输入密码"
            /> </el-radio-group
          ></el-form-item>
        <el-form-item label="是否要邀请"
        ><el-radio-group v-model="isInvite">
          <el-radio value="1" size="large">是</el-radio>
          <el-radio value="2" size="large">否</el-radio>
        </el-radio-group>
        </el-form-item>

        <el-form-item label="比赛时间">
          <el-date-picker v-model="startTime" type="datetime" placeholder="比赛开始时间" />至
          <el-date-picker v-model="endTime" type="datetime" placeholder="比赛结束时间" />
        </el-form-item>
        <el-form-item label="比赛封面">
          <el-upload
              class="avatar-uploader"
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <img v-if="cover" :src="cover" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="比赛说明" prop="content">
          <mavon-editor
              style="height: 500px"
              ref="mavonEditorRef"
              v-model="description"
              :ishljs="true"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="primary" type="primary">创建</el-button>
          <el-button @click="cancel" type="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="active == 1">
      <QuestionSelect></QuestionSelect>
      <el-button
          @click="
          () => {
            active--
          }
        "
          type="primary"
      >上一步</el-button
      >
      <el-button @click="saveQuestion" type="cancel">保存</el-button>
      <el-button
          @click="
          () => {
            active++
          }
        "
          type="cancel"
      >跳过</el-button
      >
    </div>
    <div v-if="active == 2">
      <el-button
          @click="
          () => {
            active--
          }
        "
          type="primary"
      >上一步</el-button
      >
      <el-button @click="next" type="cancel">完成</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import type { UploadProps } from 'element-plus'
import QuestionSelect from '@/components/questionSelect.vue'
const router = useRouter()

const title = ref('')
const startTime = ref()
const endTime = ref()
const description = ref()
const password = ref()
const isPassword = ref('1')
const isInvite = ref()
const cover = ref()
const language = ref()
const contestType = ref('1')
const mavonEditorRef = ref()
const active = ref(0)
onMounted(() => {})
const contestId = ref()
const questionIds = ref([])
function primary() {
  active.value++
}
function cancel() {
  router.push({ path: '/manage' })
}
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  cover.value = URL.createObjectURL(uploadFile.raw!)
}
// DOTO
const next=()=>{
  //不清楚干啥的，但是dvdv没写
}
const saveQuestion = () => {
  request
      .post('/root/contest/edit/problem', {
        contestId: contestId.value,
        questionIds: questionIds.value
      })
      .then((res) => {
        ElMessage.success('保存成功')
        active.value++
      })
      .catch(() => {
        ElMessage.error('保存失败')
      })
}
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
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
