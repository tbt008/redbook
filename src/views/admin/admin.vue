<template>
  <el-row class="tac">
    <el-col :span="4">
      <h5 class="mb-2">后台管理</h5>
      <el-menu :router="true" default-active="1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
        <el-menu-item index="/admin/problem">
          <template #title>
            <el-icon>
              <Collection />
            </el-icon>
            <span>题库管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/admin/contest">
          <el-icon>
            <Trophy />
          </el-icon>
          <span>竞赛管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <el-icon>
            <User />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/discussion">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <span>讨论管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/excel">
          <el-icon>
            <DocumentCopy />
          </el-icon>
          <span>Excel管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/class">
          <el-icon>
            <School />
          </el-icon>
          <span>班级管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/role">
          <el-icon>
            <UserFilled />
          </el-icon>
          <span>角色管理</span>
        </el-menu-item>
      </el-menu>
    </el-col>

    <el-col :span="20"> <router-view ref="child"></router-view> </el-col>
  </el-row>
</template>

<script lang="js" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const handleOpen = (key, keyPath) => { }
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>
