<template>
  <div class="manage-editor">
    <!-- 发表题目表单 -->
    <el-form ref="formRef" label-width="100px">
      <el-radio-group class="editorType" v-model="editorType" label="size control">
        <el-radio-button value="1">题目</el-radio-button>

        <el-radio-button value="3">待扩展</el-radio-button>
      </el-radio-group>

      <el-form-item label="题目标题" prop="title">
        <el-input placeholder="请输入标题" v-model="title"></el-input>
      </el-form-item>

      <el-form-item label="题目标签">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          class="w-20"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showInput">
          + New Tag
        </el-button>
      </el-form-item>
      <el-form-item label="题目类型">
        <el-radio-group v-model="status">
          <el-radio value="0" size="large">正常</el-radio>
          <el-radio value="1" size="large">比赛</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="题目难度" prop="score">
        <el-input-number v-model="score" :min="1" :max="1000000" />
      </el-form-item>
      <el-form-item label="时间限制" prop="timeLimit">
        <el-input-number v-model="timeLimit" :min="1" :max="1000000" />S
      </el-form-item>
      <el-form-item label="空间限制" prop="memoryLimit">
        <el-input-number v-model="memoryLimit" :min="1" :max="1000000" />MB
      </el-form-item>
      <div style="display: block" v-for="(item, index) in exampleList" :key="index">
        <div style="display: block">
          <div class="example-item">
            <div>输入：{{ item.input }}</div>
            <div>输出：{{ item.output }}</div>
            <div>解释：{{ item.explain }}</div>
          </div>
          <el-button type="primary" @click="delExample(index)">删除</el-button>
        </div>
      </div>
      <el-form-item label="题目样例">
        <el-input
          v-model="input"
          style="width: 60%"
          :rows="1"
          type="textarea"
          placeholder="输入数据"
        />
        <el-input
          v-model="output"
          style="width: 60%"
          :rows="1"
          type="textarea"
          placeholder="输出数据"
        />
        <el-input
          v-model="explain"
          style="width: 60%"
          :rows="1"
          type="textarea"
          placeholder="解释"
        />
        <el-button type="primary" @click="addExample">添加</el-button>
      </el-form-item>
      <el-form-item label="题目提示">
        <el-input
          v-model="tip"
          style="width: 100%"
          :rows="2"
          type="textarea"
          placeholder="Please input"
        />
      </el-form-item>
      <el-form-item label="题目内容" prop="content">
        <mavon-editor style="height: 500px" ref="mavonEditorRef" v-model="content" :ishljs="true" />
      </el-form-item>
      <el-form-item label="题目答案" prop="answer">
        <mavon-editor style="height: 500px" ref="mavonEditorRef" v-model="answer" :ishljs="true" />
      </el-form-item>
      <el-form-item>
        <el-button @click="primary" type="primary">发布</el-button>
        <el-button @click="cancel" type="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="js" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
const router = useRouter()
const type = ref(0)
const timeLimit = ref(1)
const memoryLimit = ref(1024)
const status = ref(0)
const score = ref(0)
const exampleList = ref([])
const tip = ref('')
const editorType = ref('1')
const title = ref('')
const input = ref('')
const output = ref('')
const explain = ref('')
const mavonEditorRef = ref()

const delExample = (index) => {
  exampleList.value.splice(index, 1)
}
const addExample = () => {
  const obj = {
    input: input.value,
    output: output.value,
    explain: explain.value
  }
  exampleList.value.push(obj)
}

onMounted(() => {})
const answer = ref()
const content = ref()

function primary() {
  if (editorType.value == '1') {
    if (title.value == '') {
      alert('请输入标题')
      return
    }
    const data = new FormData()
    data.append('titleName', title.value)
    data.append('status', status.value)
    data.append('score', score.value)
    data.append('timeLimit', timeLimit.value)
    data.append('memoryLimit', memoryLimit.value)
    data.append('example', JSON.stringify(exampleList.value))
    data.append('tip', tip.value)
    data.append('content', content.value)
    data.append('answer', answer.value)

    if (router.currentRoute.value.query.id) {
      const id = router.currentRoute.value.query.id
      data.append('id', id)
      // 更新
      request.post('/question/update', data).then((res) => {
        ElMessage.success('更新成功！！！')
      })
    } else {
      request.post('/question/add', data).then((res) => {
        console.log(res)
        ElMessage.success('发布成功！！！')
      })
    }
  }
}
function cancel() {
  router.push({ path: '/manage' })
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
