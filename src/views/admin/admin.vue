<template>
  <el-row class="tac">
    <el-col :span="4">
      <h5 class="mb-2">后台管理</h5>
      <el-menu
        :router="true"
        default-active="1"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-menu-item index="/admin/problem">
          <template #title>
            <el-icon><location /></el-icon>
            <span>题库管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/admin/contest">
          <el-icon><location /></el-icon>
          <span>竞赛管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <el-icon><document /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/discussion">
          <el-icon><setting /></el-icon>
          <span>讨论管理</span>
        </el-menu-item>
      </el-menu>
    </el-col>

    <el-col :span="20"> <router-view ref="child"></router-view> </el-col>
  </el-row>
</template>

<script lang="js" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const handleOpen = (key, keyPath) => {}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>
