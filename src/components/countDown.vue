<template>
  <div class="countDown" :endTime="endTime" :endText="endText">
    <div>
      <span class="time-block">
        <span id="day"></span>
        <span style="font-size: 20px">天</span>
      </span>

      <span class="time-block"
        ><span id="hour"></span>
        <span style="font-size: 20px">小时</span>
      </span>

      <span class="time-block"
        ><span id="min"></span> <span style="font-size: 20px">分钟</span></span
      >

      <span class="time-block">
        <span id="sec"></span> <span style="font-size: 20px">秒</span></span
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      timer: null // 添加一个数据属性来存储计时器ID
    }
  },
  props: {
    //接收父组件的数据
    endTime: { type: String, default: '' },
    endText: { type: String, default: '比赛开始！' }
  },
  watch: {
    // 监听时间的变化
    endTime() {
      this.stopCountdown() // 停止任何现有的计时器
      this.countdowm(this.endTime)
    }
  },
  mounted() {
    this.countdowm(this.endTime)
  },
  beforeUnmount() {
    this.stopCountdown() // 在组件销毁前停止计时器
  },
  methods: {
    countdowm(timestamp) {
      this.timer = setInterval(() => {
        let nowTime = new Date()
        let endTime = new Date(timestamp * 1000)
        let t = endTime.getTime() - nowTime.getTime()
        if (t > 0) {
          let day = Math.floor(t / 86400000)
          let hour = Math.floor((t / 3600000) % 24)
          let min = Math.floor((t / 60000) % 60)
          let sec = Math.floor((t / 1000) % 60)
          day = day < 10 ? '0' + day : day
          hour = hour < 10 ? '0' + hour : hour
          min = min < 10 ? '0' + min : min
          sec = sec < 10 ? '0' + sec : sec

          var day_ele = document.getElementById('day')
          var hour_ele = document.getElementById('hour')
          var min_ele = document.getElementById('min')
          var sec_ele = document.getElementById('sec')
          day_ele.innerHTML = day
          hour_ele.innerHTML = hour
          min_ele.innerHTML = min
          sec_ele.innerHTML = sec
        } else {
          // 这里如果有显示逻辑相关的内容，可以补充完整
          this.stopCountdown()
          this.$emit('selectQuestion')
        }
      }, 1000)
    },
    stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer)
      }
    }
  }
}
</script>
<style>
.time-block {
  user-select: none;
  width: 160px;
  background-color: rgb(198, 198, 198);
  color: rgb(250, 250, 250);
  padding: 20px;
  margin: 20px;
  border-radius: 10px;
}
.countDown {
  width: 100%;
  padding: 30px;
  height: auto;
  margin: auto;
  display: flex;
  font-size: 80px;
}
</style>
