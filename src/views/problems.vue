<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import lrSplit from '@/components/lrSplit.vue'
import tbSplit from '@/components/tbSplit.vue'
import acImg from '@/components/acImg.vue'
import question from './question.vue'
import request from '@/util/request'
import codeTest from './codeTest.vue'
import codeRegion from './CodeRegion.vue'

const router = useRouter()
const awaitContent = ref({})
const language = ref(0)
const code = ref('')
const showACImg = ref(false)
const questionId = ref(0) // 设置默认值防止undefined
const contestId = ref()
const showACImgfun = () => {
  showACImg.value = true
  setTimeout(() => {
    showACImg.value = false
  }, 3000) // 延迟3 秒
}

const codeNow = (value) => {
  code.value = value
}
const changeLanuage = (value) => {
  language.value = value
}
// 移除不必要的watch，或者使用正确的watchEffect
// 如果需要监听code变化，可以使用：
// watch(code, (newCode) => {
//   // 处理code变化
// })

const rep = ref({})
onMounted(async () => {
  questionId.value = router.currentRoute.value.query.id
  contestId.value = router.currentRoute.value.query.contest
  request.post(`/question/info`, {
    questionId: questionId.value,
    contestId: contestId.value
  }).then((res) => {
    rep.value = res.data
  })
})
</script>
<template>
  <div class="containersss">
    <acImg v-if="showACImg"></acImg>
    <div class="bottom-wrap">
      <lrSplit class="bottom" default-size="580" min="330" max="1150">
        <!-- 左边题目描述 -->
        <template #one>
          <div class="question-info">
            <question :rep="rep" :contest-id="contestId"></question>
          </div>
        </template>
        <!-- 右边代码区域 -->
        <template #two>
          <tbSplit class="right">
            <template #one>
              <codeRegion :rep="awaitContent" @submitCode="codeNow" @changeLanuage="changeLanuage"></codeRegion>
            </template>
            <template #two>
              <div class="footer">
                <codeTest @showACImgfun="showACImgfun" :language="language" :code="code" :rep="rep"
                  :question-id="questionId" :contest-id="contestId"></codeTest>
              </div>
            </template>
          </tbSplit>
        </template>
      </lrSplit>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.containersss {
  width: 100%;
  height: 94vh;
  display: flex;
  background-color: #f0f0f0;
  flex-direction: column;

  .bottom-wrap {
    display: flex;
    flex-direction: column;
    position: relative;

    .bottom {
      width: 100%;
      display: flex;

      .question-info {
        height: 94vh;
        display: flex;
      }
    }

    .right {
      height: 94vh;
    }

    .footer {
      overflow-y: hidden;
      overflow: hidden;
      /* 隐藏溢出的内容 */
      z-index: 10;
    }
  }
}
</style>
