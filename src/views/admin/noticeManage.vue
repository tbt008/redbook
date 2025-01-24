<template>
  <div class="system-management-container">
    <div class="system-wrapper">
      <el-button type="primary" @click="showAddNotice = true">发布公告</el-button>
      <el-table :data="noticeList" class="system-table" v-loading="loading">
        <el-table-column prop="title" label="标题" align="center" width="180" />
        <el-table-column prop="content" label="内容" align="center">
          <template #default="{ row }">
            <div class="content-mid">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="创建人" align="center" width="120">
        </el-table-column>
        <el-table-column prop="type" label="类型" align="center" width="120"> </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1">已拉取</el-tag>
            <el-tag type="danger" v-else>未拉取</el-tag>
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
  </div>
  <!-- 新增公告 -->
  <el-dialog v-model="showAddNotice" title="新增公告" width="70%" :close-on-click-modal="false">
    <el-form-item label="公告类型">
      <el-select v-model="type" placeholder="Select" size="large" style="width: 240px">
        <el-option
          v-for="item in noticeType"
          :key="item.id"
          :label="item.noticeType"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="type == 1002" label="比赛选择">
      <el-select v-model="contestId" placeholder="Select" size="large" style="width: 240px">
        <el-option
          v-for="item in constestList"
          :key="item.contestId"
          :label="item.title"
          :value="item.contestId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="公告标题" prop="title">
      <el-input placeholder="请输入标题" v-model="title"></el-input>
    </el-form-item>
    <el-form-item label="公告内容" prop="content">
      <mavon-editor style="height: 500px" ref="mavonEditorRef" v-model="content" :ishljs="true" />
    </el-form-item>
    <el-button type="primary" @click="saveNotice">保存</el-button>
  </el-dialog>
</template>

<script lang="js" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
const showAddNotice = ref(false)
const noticeList = ref([])
const noticeType = ref([])
const type = ref()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const title = ref('')

const content = ref('')
const constestList = ref([])
const contestId = ref(null)
// 获取公告权限列表
const getNoticeList = async () => {
  loading.value = true
  try {
    const response = await request.post('/system/notice/get', {
      pageStart: currentPage.value,
      pageSize: pageSize.value
    })
    if (response.code === 200) {
      noticeList.value = response.data.list
      // 遍历noticeList判断type里在noticeType里对应的name
      noticeList.value.forEach((item) => {
        item.type = noticeType.value.find((type) => type.id === item.type).noticeType
      })
      total.value = response.data.total
      loading.value = false
    } else {
      ElMessage.error(response.msg || '获取公告列表失败')
      loading.value = false
    }
  } catch (error) {
    ElMessage.error('获取公告列表失败')
  }
}
// 获取公告类型
const getNoticeType = async () => {
  loading.value = true
  try {
    const response = await request.get('/system/notice/get/type')
    if (response.code === 200) {
      noticeType.value = response.data
    } else {
      ElMessage.error(response.msg || '获取公告类型失败')
    }
  } catch (error) {
    ElMessage.error('获取公告类型失败')
  }
}
const saveNotice = async () => {
  request
    .post('/system/notice/save', {
      title: title.value,
      content: content.value,
      type: type.value,
      recipientId: contestId.value == null ? 0 : contestId.value
    })
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success('保存成功')
        showAddNotice.value = false
        getNoticeList()
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((error) => {
      ElMessage.error(error)
    })
}
const getContestList = async () => {
  let obj = {
    status: 0,
    pageStart: 1,
    pageSize: 10000
  }
  request
    .post(`/contest/list`, obj)
    .then((res) => {
      if (res.code == 200) {
        constestList.value = res.data.list
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((error) => {
      ElMessage.error(error)
    })
}
// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  await getNoticeList()
}

// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  await getNoticeList()
}
onMounted(() => {
  getNoticeType()
  getNoticeList()
  getContestList()
})
</script>

<style scoped>
.system-management-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.system-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.system-table {
  width: 100%;
}

:deep(.el-table td) {
  border-bottom: 1px solid #e4e7ed;
}
/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.content-mid {
  color: rgb(131, 133, 136);
  overflow: hidden;
  /* 超出省略号表示 */
  text-overflow: ellipsis;
  display: -webkit-box;
  /* 垂直对齐 */
  -webkit-box-orient: vertical;
  /* 最多2行 */
  -webkit-line-clamp: 2;
}
</style>
