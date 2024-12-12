<template>
  <div class="info-tab-1">
    <div class="info-tab-title">运行天数</div>
    <div class="info-tab-data">{{ runTime }}</div>
  </div>
  <div class="info-tab-2">
    <div class="info-tab-title">今日访问</div>
    <div class="info-tab-data">{{}}</div>
  </div>
  <div class="info-tab-3">
    <div class="info-tab-title">总访问量</div>
    <div class="info-tab-data">{{}}</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      runTime: ''
    }
  },
  created() {
    const endDate = new Date('2024-04-30')
    const now = new Date()
    const difference = endDate - now
    const daysDifference = Math.ceil(difference / (1000 * 60 * 60 * 24))
    this.runTime = daysDifference * -1
  }
}
</script>

<style>
.info-tab-data {
  font-size: 30px;
  margin-left: 20px;
  margin-top: 5px;
  color: #f6f6f6;
}
.info-tab-title {
  font-size: 20px;
  margin-left: 20px;
  margin-top: 20px;
  color: #f6f6f6;
}
.info-tab-1 {
  display: block;
  width: 200px;
  height: 100px;
  border-radius: 15px;
  margin: 10px;
  background: linear-gradient(to top right, rgb(240, 201, 164), rgb(239, 99, 160));
}
.info-tab-2 {
  display: block;
  width: 200px;
  height: 100px;
  border-radius: 15px;
  margin: 10px;

  background: linear-gradient(to top right, rgb(254, 97, 111), rgb(254, 186, 113));
}
.info-tab-3 {
  display: block;
  width: 200px;
  height: 100px;
  border-radius: 15px;
  margin: 10px;
  background: linear-gradient(to top right, rgb(167, 191, 233), rgb(106, 149, 232));
}
</style>
