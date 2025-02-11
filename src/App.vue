<script setup lang="ts">
import Header from '@/components/OJHeader.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import request from './util/request'
const router = useRouter()
const route = useRoute()
const hideHeaderPaths = ['/ai', '/login', '/systemUpdate'] // 在这里添加不需要显示导航栏的路径

onMounted(async () => {
  let st = true;
  try {
    const res = await request.get('/system/healthy') as any;
    // console.log('请求响应:', res);

    if (res.code === 200) {
      if (res.data) {
        st = false;
      }
    }
  } catch (error) {
    console.error('请求出错:', error);
  }
  if (st) {
    router.push('/systemUpdate');
  }
})
</script>

<template>
  <div id="main">
    <Header v-if="!hideHeaderPaths.includes(route.path)"></Header>
    <router-view></router-view>
  </div>
</template>

<style scoped></style>
