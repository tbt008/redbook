<script setup lang="ts">
import Header from '@/components/OJHeader.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const hideHeaderPaths = ['/ai'] // 在这里添加不需要显示导航栏的路径
</script>

<template>
  <div id="main">
    <Header v-if="!hideHeaderPaths.includes(route.path)"></Header>
    <router-view></router-view>
  </div>
</template>

<style scoped></style>
