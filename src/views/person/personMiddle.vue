<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/util/request'
import userSolveProcess from '@/components/userSolveProcess.vue'
import medalShow from '@/components/medalShow.vue'
const route = useRoute()
const loading = ref(true)
const userStats = ref({
  articles: 0,
  totalReads: 0,
  totalLikes: 0,
  totalFavorites: 0
})

// 获取用户文章统计数据
const getUserStats = async () => {
  try {


    const uid = route.params.id


    const response = await request.get(`/article/user/list/${uid}`)

    if (response.code === 200) {
      const articles = response.data

      // 文章总数
      userStats.value.articles = articles.length

      // 总阅读、点赞和收藏数
      userStats.value.totalReads = articles.reduce((sum, article) => sum + (article.articleReads || 0), 0)
      userStats.value.totalLikes = articles.reduce((sum, article) => sum + (article.likeNum || 0), 0)
      userStats.value.totalFavorites = articles.reduce((sum, article) => sum + (article.favourNum || 0), 0)
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getUserStats()
})
</script>

<template>
  <div class="item-2-middle">
    <div class="item-item2">
      <userSolveProcess></userSolveProcess>
    </div>
    <div class="item-item3">

      <div class="left-bottommore">
        <el-skeleton :loading="loading" animated>
          <!-- <template #template>
            <el-skeleton :rows="7"></el-skeleton>
          </template> -->

          <template #default>
            <div style="margin-top: 10px; display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#5AC8FA"
                class="text-teal dark:text-dark-teal">
                <path fill-rule="evenodd"
                  d="M5.438 4.417A1 1 0 016.251 4h11.498a1 1 0 01.813.417l3.952 5.512a1 1 0 01-.093 1.277l-8.982 9.304a2 2 0 01-2.878 0L1.58 11.206a1 1 0 01-.093-1.277l3.952-5.512zm2.27 4.876a1 1 0 00-1.415 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L12 13.586 7.707 9.293z"
                  clip-rule="evenodd"></path>
              </svg>
              <div class="inner-style">
                文章总数
                <span class="stat-number">{{ userStats.articles }}</span>
              </div>
            </div>
            <div style="margin-top: 18px; display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#007AFF"
                class="text-blue-s dark:text-dark-blue-s">
                <path fill-rule="evenodd"
                  d="M1.104 12.444a1 1 0 010-.888c.13-.26.37-.693.722-1.241A18.85 18.85 0 013.88 7.652C6.184 5.176 8.896 3.667 12 3.667s5.816 1.509 8.119 3.985c.79.85 1.475 1.756 2.055 2.663.352.548.593.98.722 1.24a1 1 0 010 .89c-.13.26-.37.692-.722 1.24a18.848 18.848 0 01-2.055 2.663c-2.303 2.476-5.015 3.985-8.119 3.985s-5.816-1.509-8.119-3.985a18.846 18.846 0 01-2.055-2.663c-.352-.548-.593-.98-.722-1.24zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"></path>
              </svg>
              <div class="inner-style">
                获得阅读
                <span class="stat-number">{{ userStats.totalReads }}</span>
              </div>
            </div>
            <div style="margin-top: 18px; display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#00AF9B"
                class="text-olive dark:text-dark-olive">
                <path fill-rule="evenodd"
                  d="M7.04 9.11l3.297-7.419a1 1 0 01.914-.594 3.67 3.67 0 013.67 3.671V7.33h4.028a2.78 2.78 0 012.78 3.2l-1.228 8.01a2.778 2.778 0 01-2.769 2.363H5.019a2.78 2.78 0 01-2.78-2.78V11.89a2.78 2.78 0 012.78-2.78H7.04zm-2.02 2a.78.78 0 00-.781.78v6.232c0 .431.35.78.78.78H6.69V11.11H5.02z"
                  clip-rule="evenodd"></path>
              </svg>
              <div class="inner-style">
                获得点赞
                <span class="stat-number">{{ userStats.totalLikes }}</span>
              </div>
            </div>
            <div style="margin-top: 18px; display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#FFA116"
                class="text-brand-orange dark:text-dark-brand-orange">
                <path fill-rule="evenodd"
                  d="M11.394 2.074a2.5 2.5 0 011.212 0c.723.181 1.185.735 1.526 1.262.342.528.703 1.259 1.131 2.127l.392.795c.302.61.348.667.386.7a.498.498 0 00.086.063c.043.025.11.052.786.15l.877.128c.958.139 1.764.256 2.372.418.606.162 1.276.43 1.671 1.062a2.5 2.5 0 01.375 1.152c.052.744-.333 1.354-.728 1.841-.397.489-.98 1.058-1.674 1.733l-.634.619c-.489.476-.527.537-.548.583a.5.5 0 00-.033.101c-.01.05-.015.122.1.794l.15.873c.164.954.302 1.758.335 2.386.034.627-.014 1.346-.493 1.918-.263.314-.6.558-.98.712-.692.279-1.39.102-1.976-.124-.588-.226-1.309-.605-2.165-1.056l-.785-.412c-.603-.317-.674-.335-.724-.34a.497.497 0 00-.106 0c-.05.005-.12.023-.724.34l-.785.412c-.856.45-1.577.83-2.165 1.056-.585.226-1.284.403-1.976.124a2.5 2.5 0 01-.98-.712c-.48-.572-.527-1.291-.493-1.918.033-.628.171-1.431.335-2.386l.15-.873c.115-.672.11-.745.1-.794a.5.5 0 00-.033-.101c-.02-.046-.06-.107-.548-.583l-.634-.619c-.694-.675-1.277-1.244-1.674-1.733-.395-.487-.78-1.097-.728-1.841a2.5 2.5 0 01.375-1.152c.395-.633 1.065-.9 1.67-1.062.61-.162 1.415-.28 2.373-.418l.877-.128c.675-.098.743-.125.786-.15a.5.5 0 00.086-.062c.038-.034.084-.09.386-.701l.392-.795c.428-.868.789-1.599 1.131-2.127.341-.527.803-1.08 1.526-1.262z"
                  clip-rule="evenodd"></path>
              </svg>
              <div class="inner-style">
                获得收藏
                <span class="stat-number">{{ userStats.totalFavorites }}</span>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <!-- <el-skeleton :loading="loading" animated> -->
      <!-- <template #template>
          <div style="display: flex; flex-direction: column; gap: 10px; padding: 16px 20px">
            <el-skeleton-item variant="text" style="height: 15px; width: 60px"></el-skeleton-item>
            <el-skeleton-item variant="text" style="height: 15px; width: 60px"></el-skeleton-item>
            <div style="display: flex; gap: 15px; position: relative; left: 60px; align-items: center">
              <el-skeleton-item variant="image"
                style="height: 60px; width: 60px; border-radius: 1000px"></el-skeleton-item>
              <el-skeleton-item variant="image"
                style="height: 80px; width: 80px; border-radius: 1000px"></el-skeleton-item>
              <el-skeleton-item variant="image"
                style="height: 60px; width: 60px; border-radius: 1000px"></el-skeleton-item>
            </div>
            <el-skeleton-item variant="text"
              style="top: -10px; position: relative; height: 15px; width: 60px"></el-skeleton-item>
            <el-skeleton-item variant="text"
              style="top: -10px; position: relative; height: 15px; width: 160px"></el-skeleton-item>
          </div>
        </template>
<template #default>
          <medalShow></medalShow>
        </template> -->
      <!-- </el-skeleton> -->
    </div>

  </div>
</template>

<style lang="scss" scoped>
.left-bottommore {
  padding: 10px 10px;
  position: relative;
  display: flex;
  gap: 5px;
  flex-direction: column;
  padding-bottom: 2px;

  .inner-style {
    display: flex;
    flex-direction: row;
    gap: 5px;
    color: black;

    .stat-number {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
      margin-left: 8px;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 12px;
      min-width: 30px;
      text-align: center;
    }
  }

  // border-bottom: 2px solid gainsboro;
}

.item-2-middle {
  width: 800px;
  height: 200px;
  // background-color: white;
  border-radius: 15px;
  gap: 20px;
  display: flex;
  position: relative;

  .item-item2 {
    // back
    display: flex;
    width: 500px;
    box-shadow: 0px 0px 5px 0px #e6e6e6;
    background-color: white;
    border-radius: 10px;
  }

  .item-item3 {
    // back
    display: flex;
    width: 280px;
    box-shadow: 0px 0px 5px 0px #e6e6e6;
    background-color: white;
    border-radius: 10px;
  }
}
</style>
