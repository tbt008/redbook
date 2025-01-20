<template>
    <div class="not-found">
    <!-- TODO: 404图片 -->
      <img src="" alt="404" />
      <h1>404</h1>
      <p>抱歉，页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const goHome = () => {
    router.push('/home')
  }
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  
  h1 {
    font-size: 72px;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 24px;
    margin-bottom: 30px;
  }
  </style>