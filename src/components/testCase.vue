<template>
  <div class="test-container">
    <div v-if="testInfo.err == null">
      <h2>测试点信息：</h2>
      <div class="right-info">
        <div
            class="test-item"
            :style="{ backgroundColor: bgColor(item.result) }"
            v-for="(item, index) in testInfo.testCase"
            :key="index"
        >
          <div class="test-info">#{{ index + 1 }}</div>
          <div class="test-title">{{ judgeResult(item.result) }}</div>
          <div class="test-info">{{ item.real_time }}ms/{{ judgeMemory(item.memory) }}MB</div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="error-info">{{ testInfo.err }}</div>
      <div>{{ testInfo.data }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/util/request'
// 定义接收的 props
const props = defineProps({
  test: {
    type: Object
  }
})
watch(
    () => props.test,
    (value) => {
      testInfo.value = value
    }
)
const bgColor = (index) => {
  if (index == 0) {
    return 'rgb(82, 196, 26)'
  } else if (index == -1) {
    return 'rgb(242, 11, 11)'
  } else if (index == 1 || index == 2) {
    return 'rgb(248, 131, 5)'
  } else if (index == 3) {
    return 'rgb(5, 135, 249)'
  } else if (index == 4) {
    return 'rgb(136, 7, 248)'
  } else {
    return 'rgb(13, 2, 23)'
  }
}
const judgeMemory = (memory) => {
  let m = memory / 1000000
  return m.toFixed(2)
}
const judgeResult = (result) => {
  if (result == 0) {
    return 'AC'
  } else if (result == -1) {
    return 'WA'
  } else if (result == 1 || result == 2) {
    return 'TLE'
  } else if (result == 3) {
    return 'MLE'
  } else if (result == 4) {
    return 'RE'
  } else {
    return 'SE'
  }
}
const testInfo = ref({})
onMounted(() => {
  testInfo.value = props.test
  // request.get(`/record/get/one/1729`).then((res) => {
  //   testInfo.value = res.data.test
  //   console.log(res)
  // })
})
</script>
<style>
.test-container {
  margin: 20px;
}
.error-info {
  color: #ff0000;
  font-size: 30px;
}
.right-info {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}
.test-info {
  color: #ffffff;
  display: flex;
  margin: auto;
  font-size: 12px;
}
.test-title {
  color: #ffffff;
  font-size: 25px;
  display: flex;
  margin: auto;
}
.test-item {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  margin: 10px;
}
</style>
