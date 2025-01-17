<template>
  <div>
    <el-radio-group v-model="selectType" size="large">
      <el-radio-button label="已邀请" value="1" />
      <el-radio-button label="未邀请" value="2" />
    </el-radio-group>
    <el-button
      type="primary"
      style="position: absolute; top: 40px; right: 40px"
      v-show="selectType == 2"
      @click="updateMember()"
      >邀请用户</el-button
    >
    <el-button
      type="danger"
      style="position: absolute; top: 40px; right: 40px"
      v-show="selectType == 1"
      @click="removeMember()"
      >移除用户</el-button
    >
  </div>
  <el-table v-if="selectType == 1" :data="InviteUser" style="width: 100%">
    <el-table-column width="55">
      <template #default="row">
        <el-checkbox v-model="row.row.checked" size="large" />
      </template>
    </el-table-column>

    <el-table-column label="姓名" width="120" prop="userName"> </el-table-column>
    <el-table-column label="学号" width="150" prop="uid" />
  </el-table>
  <el-table v-else :data="unInviteUser" style="width: 100%">
    <el-table-column width="55">
      <template #default="row">
        <el-checkbox v-model="row.row.checked" size="large" />
      </template>
    </el-table-column>
    <el-table-column label="姓名" width="120" prop="userName"> </el-table-column>
    <el-table-column label="学号" width="150" prop="uid" />
  </el-table>
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

const getContestMember = () => {
  request
    .post('/contest/user/get', {
      contestId: props.id,
      type: selectType.value
    })
    .then((res) => {
      if (res.code == 200) {
        if (selectType.value == 1) {
          InviteUser.value = res.data.list
          InviteUser.value.forEach((item) => {
            item.checked = false
          })
        } else {
          unInviteUser.value = res.data.list
          unInviteUser.value.forEach((item) => {
            item.checked = false
          })
        }
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error(err.msg)
    })
}
const updateMember = () => {
  ElMessageBox.confirm('确定真的添加？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    var addUidList = []
    unInviteUser.value.forEach((item) => {
      if (item.checked == true) {
        addUidList.push(item.uid)
      }
    })
    request
      .post('/contest/user/importParticipate', {
        contestId: props.id,
        uids: addUidList
      })
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success('添加成功')
        } else {
          ElMessage.error('添加失败: ' + res.msg)
        }
        getContestMember
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
    var rmUidList = []
    InviteUser.value.forEach((item) => {
      if (item.checked == true) {
        rmUidList.push(item.uid)
      }
    })
    request
      .post('/contest/user/removeParticipate', {
        contestId: props.id,
        uids: rmUidList
      })
      .then((res) => {
        if (res.code == 200) {
          ElMessage.success('移除成功')
        } else {
          ElMessage.error('移除失败: ' + res.msg)
        }
        getContestMember
      })
      .catch((err) => {
        ElMessage.error('移除失败:' + err)
      })
  })
}
onMounted(() => {
  getContestMember()
})
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
    getContestMember()
  },
  { deep: true }
)
</script>
