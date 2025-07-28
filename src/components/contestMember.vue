<template>
  <div>
    <el-radio-group v-model="selectType" size="large">
      <el-radio-button label="已参赛" value="1" />
      <el-radio-button label="未参赛" value="2" />
    </el-radio-group>
    <el-button type="primary" style="position: absolute; top: 40px; right: 40px" v-show="selectType == 2"
      @click="updateMember()">邀请用户</el-button>
    <el-button type="danger" style="position: absolute; top: 40px; right: 40px" v-show="selectType == 1"
      @click="removeMember()">移除用户</el-button>
  </div>
  <el-table v-if="selectType == 1" :data="InviteUser" style="width: 100%">
    <el-table-column width="55">
      <template #default="row">
        <el-checkbox v-model="row.row.checked" size="large" @change="handleCheckChange(row.row)" />
      </template>
    </el-table-column>

    <el-table-column label="姓名" width="120" prop="userName"> </el-table-column>
    <el-table-column label="学号" width="150" prop="uid" />

  </el-table>

  <el-table v-else :data="unInviteUser" style="width: 100%">
    <el-table-column width="55">
      <template #default="row">
        <el-checkbox v-model="row.row.checked" size="large" @change="handleCheckChange(row.row)" />
      </template>
    </el-table-column>
    <el-table-column label="姓名" width="120" prop="userName"> </el-table-column>
    <el-table-column label="学号" width="150" prop="uid" />
  </el-table>
  <!-- elementplus el-pagination: 分页器 -->
  <div class="pagination-container">
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
      :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</template>

<script lang="js" setup>
import { ElTable } from 'element-plus'
import request from '@/util/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, watch, onMounted } from 'vue'
const InviteUser = ref([])
const unInviteUser = ref([])
const props = defineProps({
  id: {
    type: Object
  }
})
const selectType = ref(1)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 全局选中状态管理
const selectedUsers = ref(new Set()) // 存储所有选中用户的uid

const getContestMember = () => {
  request
    .post('/contest/user/get', {
      pageStart: currentPage.value,
      pageSize: pageSize.value,
      contestId: props.id,
      type: selectType.value
    })
    .then((res) => {
      if (res.code == 200) {
        if (selectType.value == 1) {
          InviteUser.value = res.data.list
          // 恢复选中状态
          InviteUser.value.forEach((item) => {
            item.checked = selectedUsers.value.has(item.uid)
          })
        } else {
          unInviteUser.value = res.data.list
          // 恢复选中状态
          unInviteUser.value.forEach((item) => {
            item.checked = selectedUsers.value.has(item.uid)
          })
        }
        total.value = res.data.total
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error(err.msg)
    })
}

// 添加选中状态变化监听
const handleCheckChange = (user) => {
  if (user.checked) {
    selectedUsers.value.add(user.uid)
  } else {
    selectedUsers.value.delete(user.uid)
  }
}

const updateMember = () => {
  ElMessageBox.confirm('确定真的添加？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用全局选中状态
    var addUidList = Array.from(selectedUsers.value)
    request
      .post('/contest/user/importParticipate', {
        contestId: props.id,
        uids: addUidList
      })
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success('添加成功')
          // 清空选中状态
          selectedUsers.value.clear()
        } else {
          ElMessage.error('添加失败: ' + res.msg)
        }
        getContestMember()
      })
      .catch((err) => {
        ElMessage.error('添加失败:' + err)
      })
  })
}

const removeMember = () => {
  ElMessageBox.confirm('确定真的删除？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用全局选中状态
    var rmUidList = Array.from(selectedUsers.value)
    request
      .post('/contest/user/removeParticipate', {
        contestId: props.id,
        uids: rmUidList
      })
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success('移除成功')
          // 清空选中状态
          selectedUsers.value.clear()
        } else {
          ElMessage.error('移除失败: ' + res.msg)
        }
        getContestMember()
      })
      .catch((err) => {
        ElMessage.error('移除失败:' + err)
      })
  })
}
onMounted(() => {
  getContestMember()
})
// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  getContestMember()
}

// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  getContestMember()
}
watch(
  () => props.id,
  (newValue, oldValue) => {
    if (newValue) {
      selectType.value = 1
      InviteUser.value = []
      unInviteUser.value = []
      getContestMember()
    }
  }
)
watch(
  [selectType],
  async () => {
    selectedUsers.value.clear() // 切换类型时清空选中状态
    getContestMember()
  },
  { deep: true }
)
</script>
<style>
/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
