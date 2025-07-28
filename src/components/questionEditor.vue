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
        <!-- elementplus el-button: 标签选择按钮 -->
        <el-button class="filter-item" @click="showTagDialog = true">
          标签
          <template v-if="selectedTagIds.length"> ({{ selectedTagIds.length }}) </template>
        </el-button>
        <!-- 已选标签显示区域 -->
        <div v-if="selectedTagIds.length" class="selected-tags-bar">
          <!-- elementplus el-tag: 已选标签展示 -->
          <el-tag v-for="tagId in selectedTagIds" :key="tagId" closable type="primary" class="selected-tag"
            @close="handleTagChange(false, tagId)">
            {{ allTags.find((tag) => tag.id === tagId)?.name }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="题目类型">
        <el-radio-group v-model="status">
          <el-radio value="0" size="large">正常</el-radio>
          <el-radio value="1" size="large">比赛</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="题目难度">
        <el-radio-group v-model="difficulty">
          <el-radio value="1" size="large">入门</el-radio>
          <el-radio value="2" size="large">简单</el-radio>
          <el-radio value="3" size="large">普及</el-radio>
          <el-radio value="4" size="large">提高</el-radio>
          <el-radio value="5" size="large">困难</el-radio>
        </el-radio-group>
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
        <el-input v-model="input" style="width: 60%" :rows="1" type="textarea" placeholder="输入数据" />
        <el-input v-model="output" style="width: 60%" :rows="1" type="textarea" placeholder="输出数据" />
        <el-input v-model="explain" style="width: 60%" :rows="1" type="textarea" placeholder="解释" />
        <el-button type="primary" @click="addExample">添加</el-button>
      </el-form-item>
      <el-form-item label="题目提示">
        <el-input v-model="tip" style="width: 100%" :rows="2" type="textarea" placeholder="Please input" />
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
const router = useRouter()
const timeLimit = ref(1)
const memoryLimit = ref(1024)
const status = ref('0')
const difficulty = ref('1')
const exampleList = ref([])
const emit = defineEmits(['cancel', 'primary'])
// 定义接收的 props
const props = defineProps({
  id: {
    type: Object
  }
})

const selectedTagIds = ref([])
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

onMounted(() => {
  getTags()
  if (props.id) {
    selectedTagIds.value = []
    request.get(`/root/question/get/${props.id}`).then((res) => {
      if (res.code == 200) {
        title.value = res.data.title
        tip.value = res.data.tip
        editorType.value = res.data.editorType
        status.value = res.data.status.toString()
        difficulty.value = res.data.difficulty.toString()
        timeLimit.value = res.data.timeLimit
        memoryLimit.value = res.data.memoryLimit
        content.value = res.data.description
        answer.value = res.data.answer
        // jsonjson转成数组
        exampleList.value = JSON.parse(res.data.example) || []
      } else {
        ElMessage.error(res.msg)
      }
    })
  }
})
const answer = ref()
const content = ref()
const allTags = ref([])
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
// 获取所有标签
const getTags = async () => {
  try {
    const response = await request.post('/tag/list', {})
    if (response.code === 200) {
      allTags.value = response.data
      // console.log(allTags.value)
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}
function primary() {
  if (title.value == '') {
    alert('请输入标题')
    return
  }

  if (props.id) {
    const id = props.id

    // 更新
    request
      .put('/root/question/update', {
        id: id,
        title: title.value,
        status: status.value,
        difficulty: difficulty.value,
        timeLimit: timeLimit.value,
        memoryLimit: memoryLimit.value,
        example: JSON.stringify(exampleList.value),
        tip: tip.value,
        description: content.value,
        tagIds: selectedTagIds.value.length > 0 ? selectedTagIds.value : undefined,
        answer: answer.value
      })
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success('更新成功！！！')
          emit('primary')
        } else {
          ElMessage.error(res.msg)
        }
      })
  } else {
    request
      .post('/root/question/add', {
        title: title.value,
        status: status.value,
        difficulty: difficulty.value,
        timeLimit: timeLimit.value,
        memoryLimit: memoryLimit.value,
        example: JSON.stringify(exampleList.value),
        tip: tip.value,
        description: content.value,
        tagIds: selectedTagIds.value,
        answer: answer.value
      })
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success('添加成功！！！')
          emit('primary')
        } else {
          ElMessage.error(res.msg)
        }
      })
  }
}

function cancel() {
  emit('cancel')
}
// 监听props.id
watch(
  () => props.id,
  (newValue, oldValue) => {
    if (newValue) {
      request.get(`/root/question/get/${newValue}`).then((res) => {
        if (res.code == 200) {
          title.value = res.data.title
          tip.value = res.data.tip
          editorType.value = res.data.editorType
          status.value = res.data.status.toString()
          difficulty.value = res.data.difficulty.toString()
          timeLimit.value = res.data.timeLimit
          memoryLimit.value = res.data.memoryLimit
          content.value = res.data.description
          answer.value = res.data.answer
          // jsonjson转成数组
          exampleList.value = JSON.parse(res.data.example) || []
        } else {
          ElMessage.error(res.msg)
        }
      })
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
  width: 80%;
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
