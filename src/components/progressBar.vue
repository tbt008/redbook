<template>
  <div class="progress">
    <el-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="progressPercentage"
      status="success"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// 定义接收的 props
const props = defineProps({
  startTime: {
    type: String, // 假设这是时间戳的字符串形式
    default: ''
  },
  endTime: {
    type: String, // 假设这是时间戳的字符串形式
    default: ''
  }
})

// 定义响应式变量
const timer = ref(null)
const progressPercentage = ref(0)

// 倒计时函数
const countdowm = () => {
  progressPercentage.value += 1
  const nowTime = new Date().getTime()
  const endTime1 = new Date(props.endTime).getTime() // 直接使用 props.endTime
  const startTime1 = new Date(props.startTime).getTime() // 直接使用 props.startTime

  if (nowTime > startTime1 && nowTime < endTime1) {
    // 计算进度百分比
    const percentage = ((nowTime - startTime1) / (endTime1 - startTime1)) * 100

    progressPercentage.value = Math.floor(percentage) // 向下取整
  } else {
    // 停止计时器
    clearInterval(timer.value)
    // 可以选择在这里重置 progressPercentage 到某个值，比如 0
    progressPercentage.value = 0
  }
}

// 启动和停止计时器的函数
const startCountdown = () => {
  if (timer.value === null) {
    timer.value = setInterval(() => {
      progressPercentage.value += 1

      const nowTime = new Date().getTime() / 1000
      const endTime1 = props.endTime // 直接使用 props.endTime
      const startTime1 = props.startTime // 直接使用 props.startTime
      if (nowTime > startTime1 && nowTime < endTime1) {
        const percentage = ((nowTime - startTime1) / (endTime1 - startTime1)) * 100
        progressPercentage.value = Math.floor(percentage) // 向下取整
      } else {
        // 停止计时器
        clearInterval(timer.value)
        progressPercentage.value = 0
      }
    }, 1000)
  }
}

const stopCountdown = () => {
  clearInterval(timer.value)
  timer.value = null
}

onMounted(() => {
  startCountdown()
})

// 监听 props 的变化，并在变化时重置计时器
watch(
  () => props.startTime || props.endTime,
  (newVal, oldVal) => {
    stopCountdown()
    startCountdown()
  },
  { immediate: true }
) // immediate: true 表示在监听开始时立即执行一次回调
</script>
<style>
.progress {
  user-select: none;
  width: 70%;
  margin: auto;
}
</style>
