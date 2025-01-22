<template>
  <div class="problem-list-container">
    <div class="content-wrapper">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div style="font-size: 12px; line-height: 32px; width: 60px; margin-left: 10px">
          筛选条件
        </div>
        <el-form-item label="赛制">
          <el-radio-group v-model="searchType">
            <el-radio value="">全部</el-radio>
            <el-radio value="1">IOI</el-radio>
            <el-radio value="2">ACM</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-switch v-model="isSelf" inactive-text="只显示自己" />

        <el-select v-model="status" placeholder="Select" style="width: 140px">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="inputContestName"
          style="width: 240px; height: 33px"
          placeholder="输入比赛名后回车查询"
          @change="searchContestName"
          :suffix-icon="Search"
        />
        <el-button type="primary" @click="showAddContest = true">新增比赛</el-button>
      </div>

      <el-table :data="contestList" style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="80">
          <template #default="{ row }">
            {{ row.id }}
          </template>
        </el-table-column>
        <el-table-column label="比赛名" min-width="100">
          <template #default="{ row }">
            <router-link :to="`/contest/detail/${id}`" class="problem-title">
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>

        <el-table-column label="作者" width="200">
          <template #default="{ row }">
            {{ row.uid }}
          </template>
        </el-table-column>

        <el-table-column label="人数" width="100">
          <template #default="{ row }">
            {{ row.participationNumber }}
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ row.type == 1 ? 'IOI' : 'ACM' }}
          </template>
        </el-table-column>
        <el-table-column label="邀请" width="100">
          <template #default="{ row }">
            {{ row.isInvite == 1 ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="成员名单" width="100">
          <template #default="{ row }">
            <el-button
              :icon="Plus"
              circle
              plain
              type="primary"
              @click="updateMember(row)"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button :icon="Edit" circle plain type="primary" @click="onEdit(row)"> </el-button>
            <el-button :icon="Download" circle plain type="primary" @click="onDownload(row)">
            </el-button>
            <el-button :icon="Delete" circle plain type="danger" @click="onDelete(row)"></el-button>
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
  <!-- 新增比赛 -->
  <el-dialog v-model="showAddContest" title="新增比赛" width="70%" :close-on-click-modal="false">
    <ContestEditor @cancel="cancel" @primary="cancel"></ContestEditor>
  </el-dialog>
  <!-- 修改比赛 -->
  <el-dialog v-model="showUpdateContest" title="修改比赛" width="70%" :close-on-click-modal="false">
    <ContestEditor @cancel="cancel" @primary="cancel" :id="contestId"></ContestEditor>
  </el-dialog>
  <!-- 成员名单 -->
  <el-dialog v-model="showUpdateMember" title="成员名单" width="50%" :close-on-click-modal="false">
    <ContestMember @cancel="cancel" @primary="cancel" :id="contestId"></ContestMember>
  </el-dialog>
</template>

<script lang="js" setup>
import ContestEditor from '@/components/contestEditor.vue'
import ContestMember from '@/components/contestMember.vue'
import { Delete, Edit, Plus, Download } from '@element-plus/icons-vue'
// Vue 相关
import { ref, computed, onMounted, watch } from 'vue'
// 工具和类型
import request from '@/util/request'
import { ElMessage } from 'element-plus'
const showUpdateContest = ref(false)
const contestList = ref([])
const showUpdateMember = ref(false)
const contestId = ref(0)
const searchType = ref('')
const loading = ref(true)
const inputContestName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isSelf = ref(false)
const statusList = ref([
  { label: '全部', value: 2 },
  { label: '已结束', value: 1 },
  { label: '进行中', value: 0 },
  { label: '未开始', value: -1 }
])
const status = ref(2)
const onEdit = (row) => {
  contestId.value = row.id
  showUpdateContest.value = true
}
const searchContestName = (value) => {
  getContestList()
}
const cancel = () => {
  showAddContest.value = false
  showUpdateContest.value = false
}
const onDownload = (row) => {
  request
    .post(`/ranking/contest/excel`, {
      contestId: row.id
    })
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('导出成功')
      } else {
        ElMessage.error('导出失败: ' + res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error('导出失败：' + err)
    })
}
const onDelete = (row) => {
  request
    .delete(`/root/contest/delete/${row.id}`)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('删除成功')
      } else {
        ElMessage.error('删除失败: ' + res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error('删除失败：' + err)
    })
}
const updateMember = (row) => {
  contestId.value = row.id
  showUpdateMember.value = true
}
const getContestList = async () => {
  request
    .post(`/root/contest/get/all`, {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
      status: status.value,
      isSelf: isSelf.value == true ? 1 : 0,
      type: searchType.value,
      title: inputContestName.value
    })
    .then((res) => {
      if (res.code == 200) {
        contestList.value = res.data.list
        total.value = res.data.total
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error(err)
    })
}

// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  getContestList()
}

// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  getContestList()
}

// 监听筛选条件变化
watch(
  [isSelf, status, searchType],
  async () => {
    currentPage.value = 1
    getContestList()
  },
  { deep: true }
)

// 组件挂载时初始化数据
onMounted(async () => {
  getContestList()
  loading.value = false
})

const showAddContest = ref(false)
</script>

<style scoped>
/* 容器样式 */
.problem-list-container {
  padding: 20px;
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(135deg, #f6f8fc 0%, #f0f4f8 100%);
}

.content-wrapper {
  background: white;
  min-height: calc(100vh - 200px);
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 筛选区域样式 */
.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
}

.filter-item {
  width: 200px;
}

/* 题目标题样式 */
.problem-title {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.problem-title:hover {
  text-decoration: underline;
}

/* 标签样式 */
.problem-tags {
  margin-top: 8px;
}

.tag-item {
  margin-right: 8px;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 状态图标样式 */
.status-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-left: 5px;
}

.status-icon.success {
  background-color: #00b8a3;
  color: white;
}

.status-icon.fail {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.status-icon.pending {
  background-color: #ffd591;
  position: relative;
}

.status-icon.pending .dash {
  width: 10px;
  height: 2px;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 标签对话框样式 */
.tag-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

.tag-group {
  margin-bottom: 20px;
}

.tag-group-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.tag-group-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  margin: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* element-plus组件样式覆盖 */
.el-check-tag {
  margin: 4px;
  padding: 0 8px;
  height: 28px;
  line-height: 26px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  background-color: #fff;
  color: #606266;
}

.el-check-tag.is-checked {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

/* 已选标签区域样式 */
.selected-tags-bar {
  margin: 0 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  margin: 0;
}

.selected-tags-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 12px;
}

.no-tags-selected {
  color: #909399;
  font-size: 14px;
}

/* 添加搜索输入框样式 */
.tag-search-input {
  margin-bottom: 16px;
  width: 100%;
}
</style>
