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

        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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

          <el-form-item label="封面图片" prop="coverImage">
            <el-upload
              class="cover-uploader"
              action="/api/file/upload?directory=content"
              :show-file-list="false"
              :on-success="handleCoverSuccess"
            >
              <el-image v-if="form.coverImage" :src="form.coverImage" fit="cover" style="width: 200px; height: 150px" />
              <el-icon v-else class="uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="内容图片">
            <el-upload
              class="images-uploader"
              action="/api/file/upload?directory=content"
              list-type="picture-card"
              :file-list="imageList"
              :on-success="handleImagesSuccess"
              :on-remove="handleImageRemove"
              multiple
            >
              <el-icon class="uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">上传后可在正文中直接插入，或复制图片链接用于 Markdown 语法。</div>
          </el-form-item>

          <el-form-item label="正文内容" prop="content">
            <div class="editor-wrapper">
              <mavon-editor
                ref="mavonEditorRef"
                v-model="form.content"
                class="markdown-editor"
                :ishljs="true"
                :toolbars="toolbars"
                @imgAdd="handleEditorImageAdd"
              />
            </div>
          </el-form-item>

          <el-form-item label="标签">
            <el-select
              v-model="form.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="输入标签后按回车添加，也可以选择已有标签"
              class="tag-select"
            >
              <el-option v-for="tag in tagList" :key="tag.id" :label="tag.tagName" :value="tag.tagName" />
            </el-select>
          </el-form-item>

          <el-form-item label="关联类型">
            <el-radio-group v-model="form.relatedType" class="related-type-group">
              <el-radio-button v-for="option in relatedTypeOptions" :key="option.value" :label="option.value">
                {{ option.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="`关联${currentRelatedType.label}`">
            <el-select
              v-model="form.relatedId"
              :placeholder="`选择关联${currentRelatedType.label}`"
              clearable
              filterable
              :loading="relatedLoading"
              style="width: 100%"
            >
              <el-option
                v-for="item in currentRelatedList"
                :key="item.id"
                :label="getRelatedLabel(item)"
                :value="item.id"
              />
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()

const publishing = ref(false)
const tagList = ref<any[]>([])
const attractionList = ref<any[]>([])
const foodList = ref<any[]>([])
const hotelList = ref<any[]>([])
const relatedLoading = ref(false)
const imageList = ref<any[]>([])
const formRef = ref<FormInstance>()
const mavonEditorRef = ref<any>()

type RelatedType = 'attraction' | 'food' | 'hotel'

const relatedTypeOptions: Array<{
  value: RelatedType
  label: string
  endpoint: string
}> = [
  { value: 'attraction', label: '景点', endpoint: '/attraction/list' },
  { value: 'food', label: '美食', endpoint: '/food/list' },
  { value: 'hotel', label: '酒店', endpoint: '/hotel/list' }
]

const toolbars = {
  bold: true,
  italic: true,
  header: true,
  underline: true,
  strikethrough: true,
  mark: true,
  superscript: true,
  subscript: true,
  quote: true,
  ol: true,
  ul: true,
  link: true,
  imagelink: true,
  code: true,
  table: true,
  fullscreen: true,
  readmodel: true,
  htmlcode: true,
  undo: true,
  redo: true,
  trash: true,
  navigation: true,
  alignleft: true,
  aligncenter: true,
  alignright: true,
  subfield: true,
  preview: true
}

const form = reactive({
  type: 1,
  title: '',
  description: '',
  coverImage: '',
  images: [] as string[],
  content: '',
  tags: [] as string[],
  relatedType: 'attraction' as RelatedType,
  relatedId: null as number | null
})

const currentRelatedType = computed(() => {
  return relatedTypeOptions.find(option => option.value === form.relatedType) || relatedTypeOptions[0]
})

const currentRelatedList = computed(() => {
  if (form.relatedType === 'food') return foodList.value
  if (form.relatedType === 'hotel') return hotelList.value
  return attractionList.value
})

const selectedRelatedItem = computed(() => {
  return currentRelatedList.value.find(item => item.id === form.relatedId)
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  coverImage: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }]
}

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

const getListData = (data: any) => {
  if (Array.isArray(data)) return data
  return data?.list || data?.records || []
}

const setRelatedList = (type: RelatedType, list: any[]) => {
  if (type === 'food') {
    foodList.value = list
    return
  }

  if (type === 'hotel') {
    hotelList.value = list
    return
  }

  attractionList.value = list
}

const loadRelatedList = async (type: RelatedType = form.relatedType) => {
  const option = relatedTypeOptions.find(item => item.value === type)
  if (!option) return

  const cachedList = type === 'food' ? foodList.value : type === 'hotel' ? hotelList.value : attractionList.value
  if (cachedList.length > 0) return

  relatedLoading.value = true
  try {
    const res: any = await request.get(option.endpoint, {
      params: { pageNum: 1, pageSize: 100 }
    })
    if (res.code === 200) {
      setRelatedList(type, getListData(res.data))
    }
  } catch (error) {
    console.error(`加载${option.label}失败`, error)
  } finally {
    relatedLoading.value = false
  }
}

const getRelatedLabel = (item: any) => {
  const parts = [item.name]
  if (item.region) parts.push(item.region)
  if (item.address) parts.push(item.address)
  return parts.filter(Boolean).join(' - ')
}

const handleCoverSuccess: UploadProps['onSuccess'] = response => {
  if (response.code === 200) {
    form.coverImage = response.data.url
    ElMessage.success('上传成功')
  }
}

const handleImagesSuccess: UploadProps['onSuccess'] = (response: any, file: any) => {
  if (response.code === 200) {
    form.images.push(response.data.url)
    imageList.value.push({ url: response.data.url, name: file.name })
    ElMessage.success('图片上传成功')
  }
}

const handleImageRemove: UploadProps['onRemove'] = (file: any) => {
  const index = form.images.indexOf(file.url)
  if (index > -1) {
    form.images.splice(index, 1)
  }
}

const handleEditorImageAdd = async (pos: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res: any = await request.post('/file/upload?directory=content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res.code === 200) {
      const imageUrl = res.data.url
      form.images.push(imageUrl)
      imageList.value.push({ url: imageUrl, name: file.name })
      mavonEditorRef.value?.$img2Url(pos, imageUrl)
      ElMessage.success('图片上传成功')
      return
    }

    ElMessage.error(res.msg || '图片上传失败')
  } catch (error) {
    console.error('图片上传失败', error)
    ElMessage.error('图片上传失败')
  }
}

const handlePublish = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const normalizedTags = [...new Set(form.tags.map(tag => tag.trim()).filter(Boolean))]
  form.tags = normalizedTags

  publishing.value = true
  try {
    const data = {
      title: form.title,
      summary: form.description,
      description: form.description,
      content: form.content,
      contentType: form.images.length > 0 ? 2 : 1,
      type: form.images.length > 0 ? 2 : 1,
      coverImage: form.coverImage,
      images: JSON.stringify(form.images),
      tags: JSON.stringify(normalizedTags),
      location: selectedRelatedItem.value?.name || undefined,
      region: selectedRelatedItem.value?.region || undefined,
      theme: selectedRelatedItem.value ? currentRelatedType.value.label : undefined,
      attractionId: form.relatedType === 'attraction' ? form.relatedId : null,
      foodId: form.relatedType === 'food' ? form.relatedId : null,
      hotelId: form.relatedType === 'hotel' ? form.relatedId : null
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

const goHome = () => router.push('/')
const goBack = () => router.back()

onMounted(() => {
  loadTags()
  loadRelatedList()
})

watch(
  () => form.relatedType,
  type => {
    form.relatedId = null
    loadRelatedList(type)
  }
)
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
  max-width: 1100px;
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

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.tag-select {
  width: 100%;
}

.related-type-group {
  :deep(.el-radio-button__inner) {
    min-width: 92px;
  }
}

.editor-wrapper {
  width: 100%;
}

.markdown-editor {
  min-height: 520px;
}

.markdown-editor :deep(.v-note-wrapper) {
  min-height: 520px;
  z-index: 1;
}
</style>
