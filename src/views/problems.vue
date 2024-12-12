<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import { useRouter } from 'vue-router'
import lrSplit from '@/components/lrSplit.vue'
import tbSplit from '@/components/tbSplit.vue'
import acImg from '@/components/acImg.vue'
import question from './question.vue'
import request from '@/util/request'
import codeTest from './codeTest.vue'
import codeRegion from './CodeRegion.vue'
const router = useRouter()
const loading = ref(true)
const awaitContent = ref({})
const language = ref(0)

const code = ref('')
const showACImg = ref(false)
const questionId = ref()
const contestId = ref()
const judgeResult = ref({})
var timer = null
const showACImgfun = () => {
  showACImg.value = true
  setTimeout(() => {
    showACImg.value = false
  }, 3000) // 延迟3 秒
}
provide('submitStatus', judgeResult)
const providerMethod = (result) => {
  judgeResult.value = result.data
}
const codeNow = (value) => {
  code.value = value
}
const changeLanuage = (value) => {
  language.value = value
}
watch(() => codeNow())
const qid = ref()
const rep = ref({})
onMounted(async () => {
  questionId.value = router.currentRoute.value.query.id
  contestId.value = router.currentRoute.value.query.contest
  request.get(`/question/${questionId.value}`).then((res) => {
    rep.value = res.data
    qid.value = rep.value.questionId
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
            <question :loading="loading" :rep="rep"></question>
          </div>
        </template>
        <!-- 右边代码区域 -->
        <template #two>
          <tbSplit>
            <template #one>
              <codeRegion
                :loading="loading"
                :rep="awaitContent"
                @submitCode="codeNow"
                @changeLanuage="changeLanuage"
              ></codeRegion>
            </template>
            <template #two>
              <div class="footer">
                <codeTest
                  @showACImgfun="showACImgfun"
                  :language="language"
                  :code="code"
                  :rep="rep"
                  :question-id="qid"
                  :contest-id="contestId"
                ></codeTest>
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
  height: 100vh;
  width: 100%;
  position: relative;
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
      position: relative;
      max-width: 1520.8px;
      .question-info {
        height: 100%;
        // position: relative;
        display: flex;
      }
    }
    .footer {
      overflow-y: hidden;
      overflow: hidden; /* 隐藏溢出的内容 */
      z-index: 10;
    }
  }
}
</style>
