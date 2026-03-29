<template>
  <div class="publish-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <h1>莆田文旅</h1>
        </div>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-header>

    <el-main class="main-content">
      <el-card class="publish-card">
        <template #header>
          <div class="card-header">
            <h2>发布内容</h2>
          </div>
        </template>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="内容类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio :label="1">攻略</el-radio>
              <el-radio :label="2">笔记</el-radio>
              <el-radio :label="3">视频</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item v-if="form.type !== 3" label="封面图片" prop="coverImage">
            <el-upload
              class="cover-uploader"
              action="/file/upload?directory=content"
              :show-file-list="false"
              :on-success="handleCoverSuccess"
            >
              <el-image v-if="form.coverImage" :src="form.coverImage" fit="cover" style="width: 200px; height: 150px" />
              <el-icon v-else class="uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item v-if="form.type !== 3" label="内容图片">
            <el-upload
              class="images-uploader"
              action="/file/upload?directory=content"
              list-type="picture-card"
              :file-list="imageList"
              :on-success="handleImagesSuccess"
              :on-remove="handleImageRemove"
              multiple
            >
              <el-icon class="uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item v-if="form.type === 3" label="视频" prop="videoUrl">
            <el-upload
              class="video-uploader"
              action="/file/upload?directory=video"
              :show-file-list="false"
              :on-success="handleVideoSuccess"
              accept="video/*"
            >
              <video v-if="form.videoUrl" :src="form.videoUrl" controls style="width: 400px; max-height: 300px"></video>
              <el-button v-else type="primary">上传视频</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="正文内容" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="请输入正文内容"
            />
          </el-form-item>

          <el-form-item label="标签">
            <el-select v-model="form.tags" multiple placeholder="选择标签" style="width: 100%">
              <el-option v-for="tag in tagList" :key="tag.id" :label="tag.tagName" :value="tag.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="关联景点">
            <el-select v-model="form.attractionId" placeholder="选择关联景点" clearable filterable>
              <el-option v-for="item in attractionList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handlePublish" :loading="publishing">发布</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()

const publishing = ref(false)
const tagList = ref<any[]>([])
const attractionList = ref<any[]>([])
const imageList = ref<any[]>([])

const form = reactive({
  type: 1,
  title: '',
  description: '',
  coverImage: '',
  images: [] as string[],
  videoUrl: '',
  content: '',
  tags: [] as number[],
  attractionId: null as number | null
})

const formRef = ref()

const rules = {
  type: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }]
}

// 加载标签列表
const loadTags = async () => {
  try {
    const res: any = await request.get('/interest-tag/list')
    if (res.code === 200) {
      tagList.value = res.data || []
    }
  } catch (error) {
    console.error('加载标签失败', error)
  }
}

// 加载景点列表
const loadAttractions = async () => {
  try {
    const res: any = await request.get('/attraction/list', {
      params: { pageNum: 1, pageSize: 100 }
    })
    if (res.code === 200) {
      attractionList.value = res.data?.list || []
    }
  } catch (error) {
    console.error('加载景点失败', error)
  }
}

// 封面上传成功
const handleCoverSuccess = (response: any) => {
  if (response.code === 200) {
    form.coverImage = response.data.url
    ElMessage.success('上传成功')
  }
}

// 图片上传成功
const handleImagesSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    form.images.push(response.data.url)
    imageList.value.push({ url: response.data.url, name: file.name })
  }
}

// 删除图片
const handleImageRemove = (file: any) => {
  const index = form.images.indexOf(file.url)
  if (index > -1) {
    form.images.splice(index, 1)
  }
}

// 视频上传成功
const handleVideoSuccess = (response: any) => {
  if (response.code === 200) {
    form.videoUrl = response.data.url
    form.coverImage = response.data.coverUrl || ''
    ElMessage.success('上传成功')
  }
}

// 发布
const handlePublish = async () => {
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      publishing.value = true
      try {
        const data = {
          ...form,
          images: JSON.stringify(form.images),
          tags: JSON.stringify(form.tags)
        }
        const res: any = await request.post('/content/add', data)
        if (res.code === 200) {
          ElMessage.success('发布成功')
          router.push('/')
        }
      } catch (error: any) {
        ElMessage.error(error.message || '发布失败')
      } finally {
        publishing.value = false
      }
    }
  })
}

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadTags()
  loadAttractions()
})
</script>

<style scoped lang="scss">
.publish-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
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
      color: #ff6b6b;
      cursor: pointer;
    }
  }
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.publish-card {
  .card-header {
    h2 {
      margin: 0;
      font-size: 20px;
    }
  }
}

.cover-uploader {
  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 200px;
    height: 150px;
    line-height: 150px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
    }
  }
}

.images-uploader {
  :deep(.el-upload-list__item) {
    width: 148px;
    height: 148px;
  }

  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
  }
}
</style>

