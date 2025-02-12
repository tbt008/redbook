<script setup>
// 计算公式还没有搞明白
import { ref, onMounted } from 'vue'
import request from '@/util/request'
const loading = ref(false)
const acInfo = ref({
  submitNumberTotal: 0,
  acNumberTotal: 0,
  base: 0,
  allBase: 0,
  easy: 0,
  allEasy: 0,
  popular: 0,
  allPopular: 0,
  increase: 0,
  allIncrease: 0,
  hard: 0,
  allHard: 0,
  rating: 0,
  passRate: 0
})
const format = (percentage) => (percentage === 100 ? '' : ``)
onMounted(async () => {
  request.get('/user/ac/info').then((res) => {
    if (res.code == 200) {
      acInfo.value = res.data
    } else {
      ElMessage.error('用户做题信息异常！')
    }
  })
})
</script>

<template>
  <div class="item">
    <!-- 左边 -->
    <div class="item-processor">
      <el-skeleton :loading="loading" animated>
        <template #template>
          <el-skeleton-item variant="image" style="width: 120px; height: 120px; border-radius: 1000px" />
        </template>
        <template #default>
          <div style="
              width: 100%;
              display: flex;
              font-size: 30px;
              color: black;
              center-align: center;
              justify-content: center;
            ">
            {{ acInfo.acNumberTotal }}

            {{ '/' + acInfo.submitNumberTotal }}
          </div>
          <el-progress type="dashboard" :percentage="Math.floor((acInfo.acNumberTotal / acInfo.submitNumberTotal) * 100 * 100) / 100
            ">
            <template #default="{ percentage }">
              <span class="percentage-value">{{ percentage }}%</span>
              <span class="percentage-label">通过率</span>
            </template>
          </el-progress>
        </template>
      </el-skeleton>
    </div>
    <div class="item-digest-wrapper">
      <el-skeleton :loading="loading" animated>
        <template #template>
          <el-skeleton-item variant="text" style="position: relative; top: 15px; width: 121.75px; height: 25px" />
          <el-skeleton-item variant="text" style="position: relative; top: 30px; width: 121.75px; height: 50px" />
        </template>
        <template #default>
          <div class="font-item">
            <div style="display: flex; font-size: medium; color: black">
              <div style="font-size: 14px; margin-right: 20px; color: rgb(171, 175, 168)">入门</div>
              {{ acInfo.base }}
              <div style="font-size: small; color: rgb(204, 204, 204)">
                {{ '/' + acInfo.allBase }}
              </div>
            </div>
            <el-progress :percentage="(acInfo.base / acInfo.allBase) * 100" :format="format" :color="`#909399`" />
          </div>
          <div class="font-item">
            <div style="display: flex; font-size: medium; color: black">
              <div style="font-size: 14px; margin-right: 20px; color: rgb(103, 194, 58)">简单</div>
              {{ acInfo.easy }}
              <div style="font-size: small; color: rgb(204, 204, 204)">
                {{ '/' + acInfo.allEasy }}
              </div>
            </div>
            <el-progress :percentage="(acInfo.easy / acInfo.allEasy) * 100" :color="`#67c23a`" :format="format" />
          </div>
          <div class="font-item">
            <div style="display: flex; font-size: medium; color: black">
              <div style="font-size: 14px; margin-right: 20px; color: rgb(230, 162, 60)">普及</div>
              {{ acInfo.popular }}
              <div style="font-size: small; color: rgb(204, 204, 204)">
                {{ '/' + acInfo.allPopular }}
              </div>
            </div>
            <el-progress :percentage="(acInfo.popular / acInfo.allPopular) * 100" :color="`#e6a23c`" :format="format" />
          </div>
          <div class="font-item">
            <div style="display: flex; font-size: medium; color: black">
              <div style="font-size: 14px; margin-right: 20px; color: rgb(64, 158, 255)">提高</div>
              {{ acInfo.increase }}
              <div style="font-size: small; color: rgb(204, 204, 204)">
                {{ '/' + acInfo.allIncrease }}
              </div>
            </div>
            <el-progress :percentage="(acInfo.increase / acInfo.allIncrease) * 100" :format="format"
              :color="`#1989fa`" />
          </div>
          <div class="font-item">
            <div style="display: flex; font-size: medium; color: black">
              <div style="font-size: 14px; margin-right: 20px; color: rgb(245, 108, 108)">困难</div>
              {{ acInfo.hard }}
              <div style="font-size: small; color: rgb(204, 204, 204)">
                {{ '/' + acInfo.allHard }}
              </div>
            </div>
            <el-progress :percentage="acInfo.allHard == 0 ? 0 : (acInfo.hard / acInfo.allHard) * 100" :format="format"
              :color="`#f56c6c`" />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style scoped>
.item-digest-wrapper {
  width: 50%;
}

.item-processor {
  display: flex;
  center-align: center;
  justify-content: center;
  width: 50%;
  flex-wrap: wrap;
  margin-top: 20px;
}

.font-item {
  margin-top: 10px;
  margin-left: 10px;
  display: block;
}

.item {
  display: flex;
  width: 100%;
}

.percentage-value {
  display: block;

  font-size: 28px;
}

.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
}
</style>
