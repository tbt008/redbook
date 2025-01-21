<!-- <script setup>
import { ref, onMounted } from 'vue'
import request from '@/util/request'
const loading = ref(true)
const data = ref({})
const msg = ref('')
const showInfo = (v) => {
  msg.value = v['count'] ? `${v['date']}共有${v['count']}次提交` : `${v['date']}没有提交`
}
const thresholds = [0, 2, 4, 6]
onMounted(async () => {
  const today = new Date()

  // 获取年份（四位数字）
  const year = today.getFullYear()

  // 获取月份（0-11），所以需要加1来得到1-12的月份，并使用padStart确保是两位数
  const month = String(today.getMonth() + 1).padStart(2, '0')

  // 获取日期（1-31），并使用padStart确保是两位数
  const day = String(today.getDate()).padStart(2, '0')

  // 组合成"YYYY-MM-DD"格式的字符串
  const formattedDate = `${year}-${month}-${day}`
  let obj = await request.post('/summarySubmission/getSummarySubmission', {
    date: formattedDate
  })
  console.log(obj)
  data.value = obj.data
  loading.value = false
})
</script>
<template>
  <el-skeleton :loading="loading" animated>
    <template #template>
      <div style="padding: 15px 20px">
        <el-skeleton :rows="3"></el-skeleton>
        <div style="display: flex; margin-top: 25px; gap: 20px">
          <el-skeleton-item
            v-for="(item, index) in 13"
            :key="index"
            style="width: 40px; height: 15px"
          ></el-skeleton-item>
        </div>
      </div>
    </template>
    <template #default>
      <t-calendar-heatmap
        id="fjaiefjae"
        :mapData="data"
        :thresholds="thresholds"
        @hover="showInfo"
        title="提交图🎉"
        :tipInfo="msg"
        class="mapStylesssss"
      />
    </template>
  </el-skeleton>

</template>

<style lang="scss" scoped>
.mapStylesssss {
  display: flex;
  position: relative;
  justify-content: center;
  top: 10px;
  align-items: center;
}
</style> -->

<template>
  <div class="content">
    <div class="content-title">提交图🎉</div>
    <div class="content-info">
      在这一年中，你在{{ data.totalActiveDays }}天里共提交{{ data.totalSubmission }}次
    </div>
    <submit-picture-main :timeData="timeData" :maxData="maxData"></submit-picture-main>
  </div>
</template>

<script setup lang="js">
import dayjs from 'dayjs'
import request from '@/util/request'
const loading = ref(true)
const data = ref({})
const msg = ref('')
import submitPictureMain from '@/components/submitPicture/submitPictureMain.vue'
import { ref, onMounted } from 'vue'

const maxData = ref(190)
const timeData = ref({})
onMounted(async () => {
  const today = new Date()

  // 获取年份（四位数字）
  const year = today.getFullYear()

  // 获取月份（0-11），所以需要加1来得到1-12的月份，并使用padStart确保是两位数
  const month = String(today.getMonth() + 1).padStart(2, '0')

  // 获取日期（1-31），并使用padStart确保是两位数
  const day = String(today.getDate()).padStart(2, '0')

  // 组合成"YYYY-MM-DD"格式的字符串
  const formattedDate = `${year}-${month}-${day}`
  let obj = await request.post('/summarySubmission/getSummarySubmission', {
    date: formattedDate
  })

  data.value = obj.data
  let tempDate = {}
  // 遍历对象集合 obj.data.submissionData
  obj.data.submissionData.forEach(function (item) {
    tempDate[item.day] = item.submissionCount
  })

  timeData.value = tempDate
  loading.value = false
})
</script>

<style scoped>
.content {
  display: flex;
  width: 100%;
  flex-direction: column;
}
.content-title {
  margin-top: 20px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content-info {
  margin-top: 5px;
  font-size: 13px;
  color: rgba(34, 34, 34);
  display: flex;
  align-items: center;
  justify-content: center;
}
.circle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1989fa;
  color: #fff;
  font-size: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
