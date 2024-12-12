<script setup>
import request from '@/util/request'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
const currentTab = ref(0)

const currentClick = ref(0)
const judgeQuestionLoading = ref(false)
const props = defineProps({
  rep: {
    type: Object
  },
  code: {
    type: String
  },
  language: {
    type: Number
  },
  questionId: {
    type: Number
  },
  contestId: {
    type: Number
  }
})

const result = ref({})
// testList.value[0].input
const input = ref()
const emit = defineEmits(['showACImgfun'])
const submitStatus = ref('运行中')
const djTime = ref()
const choseTestcase = (type) => {
  let beforeValue = currentClick.value
  document.getElementsByClassName('atag')[beforeValue].style.backgroundColor = '#ffffff'
  currentClick.value = type
  document.getElementsByClassName('atag')[currentClick.value].style.background = '#F2F3F4'

  // input.value = rep.value[type].input
}
const submitCode = async () => {
  submitStatus.value = '运行中'
  judgeQuestionLoading.value = true
  if (!props.contestId) {
    let obj = {
      questionId: props.questionId,
      code: props.code,
      language: props.language,
      type: 1
    }
    // 提交代码
    let codeRecordId = 0
    request
      .post(`/question/judge`, obj)
      .then((res) => {
        if (res.code != 200) {
          ElMessage.error(res.msg)
        } else {
          codeRecordId = res.data
          submitStatus.value = '判题中'
          setTimeout(() => {
            judgeQuestionLoading.value = false
          }, 10000)
          whileGetResult(codeRecordId)
        }
      })
      .catch((error) => {
        ElMessage.error(error)
      })
  } else {
    let obj = {
      questionId: props.questionId,
      code: props.code,
      language: props.language,
      type: 2,
      contestId: props.contestId
    }
    // 提交代码
    let codeRecordId = 0
    request
      .post(`/question/judge`, obj)
      .then((res) => {
        if (res.code != 200) {
          ElMessage.error(res.msg)
        } else {
          codeRecordId = res.data
          submitStatus.value = '判题中'
          setTimeout(() => {
            judgeQuestionLoading.value = false
          }, 10000)
          whileGetResult(codeRecordId)
        }
      })
      .catch((error) => {
        ElMessage.error(error)
      })
  }
}
const runCode = () => {
  const currentTime = new Date().getTime()
  if (undefined != djTime.value && null != djTime.value && currentTime - djTime.value < 4000) {
    ElMessage.error('您运行的太快了,过几秒后试试')
    return false
  }
  djTime.value = currentTime
  console.log(djTime.value)
  submitStatus.value = '运行中'
  judgeQuestionLoading.value = true
  let obj = {
    input: input.value,
    code: props.code,
    language: props.language
  }

  request
    .post(`/question/test`, obj)
    .then((res) => {
      if (res.code != 200) {
        ElMessage.error(res.msg)
        judgeQuestionLoading.value = false
      } else {
        judgeQuestionLoading.value = false
        currentTab.value = 1
        result.value = res.data
      }
    })
    .catch((error) => {
      judgeQuestionLoading.value = false
      ElMessage.error(error)
    })
}
const whileGetResult = async (recordId) => {
  // 获取题目id
  //  维护最多10秒，每秒查询一次结果
  let maxRequests = 10
  let count = 0
  // 创建一个每秒发送一次请求的定时器
  const intervalId = setInterval(() => {
    if (count < maxRequests) {
      if (!props.contestId) {
        request.get(`/record/get/one/${recordId}`).then((res) => {
          // 获取结果  成功后
          if (res.data.status != 1 && res.data.status != 0) {
            clearInterval(intervalId)
            if (res.data.result == 100) {
              emit('showACImgfun')
            }

            judgeQuestionLoading.value = false
          }
        })
      } else {
        request.get(`/contest/record/get/one/${recordId}`).then((res) => {
          // 获取结果  成功后
          if (res.data.status != 1 && res.data.status != 0) {
            clearInterval(intervalId)
            if (res.data.result == 100) {
              emit('showACImgfun')
            }

            judgeQuestionLoading.value = false
          }
        })
      }
      count++
    } else {
      // 取消定时器
      clearInterval(intervalId)
    }
  }, 1000)

  //  recordId
}
const testList = ref([])
const rep = ref({})
onMounted(() => {
  rep.value = props.rep
  // testList.value = rep.value
})
</script>

<template>
  <div class="containerss">
    <div class="item">
      <div class="item-left">
        <div @click="currentTab = 0" class="item-left-item">
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            width="18"
            height="18"
            data-icon="square-check"
            class="svg-inline--fa fa-square-check absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path
              :fill="currentTab === 0 ? '#02B128' : '#98DDA7'"
              d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
            ></path>
          </svg>
          <span :style="currentTab === 0 ? 'color: black' : 'color:gray'"> 测试用例</span>
        </div>
        <div @click="currentTab = 1" class="item-left-item">
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            width="18"
            height="18"
            data-icon="terminal"
            class="svg-inline--fa fa-terminal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path
              :fill="currentTab === 1 ? '#02B128' : '#98DDA7'"
              d="M6.3 72.2c-9-9.8-8.3-24.9 1.4-33.9s24.9-8.3 33.9 1.4l184 200c8.5 9.2 8.5 23.3 0 32.5l-184 200c-9 9.8-24.2 10.4-33.9 1.4s-10.4-24.2-1.4-33.9L175.4 256 6.3 72.2zM248 432H552c13.3 0 24 10.7 24 24s-10.7 24-24 24H248c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
            ></path>
          </svg>
          <span :style="currentTab === 1 ? 'color: black' : 'color:gray'"> 测试结果</span>
        </div>
        <div class="top">
          <div class="runAndTest">
            <div class="runFor">
              <div class="run" @click="runCode()" v-show="!judgeQuestionLoading">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="play"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 384 512"
                >
                  <path
                    fill="gray"
                    d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
                  ></path>
                </svg>
                运行
              </div>
              <div @click="submitCode()" class="submit" v-show="!judgeQuestionLoading">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="far"
                  data-icon="cloud-arrow-up"
                  width="20"
                  height="20"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path
                    fill="currentColor"
                    d="M354.9 121.7c13.8 16 36.5 21.1 55.9 12.5c8.9-3.9 18.7-6.2 29.2-6.2c39.8 0 72 32.2 72 72c0 4-.3 7.9-.9 11.7c-3.5 21.6 8.1 42.9 28.1 51.7C570.4 276.9 592 308 592 344c0 46.8-36.6 85.2-82.8 87.8c-.6 0-1.3 .1-1.9 .2H504 144c-53 0-96-43-96-96c0-41.7 26.6-77.3 64-90.5c19.2-6.8 32-24.9 32-45.3l0-.2v0 0c0-66.3 53.7-120 120-120c36.3 0 68.8 16.1 90.9 41.7zM512 480v-.2c71.4-4.1 128-63.3 128-135.8c0-55.7-33.5-103.7-81.5-124.7c1-6.3 1.5-12.8 1.5-19.3c0-66.3-53.7-120-120-120c-17.4 0-33.8 3.7-48.7 10.3C360.4 54.6 314.9 32 264 32C171.2 32 96 107.2 96 200l0 .2C40.1 220 0 273.3 0 336c0 79.5 64.5 144 144 144H464h40 8zM223 255c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V384c0 13.3 10.7 24 24 24s24-10.7 24-24V249.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                  ></path>
                </svg>
                提交
              </div>
              <div class="running" v-show="judgeQuestionLoading">
                <div style="display: flex; position: relative; top: 3px">
                  <!-- <loader></loader> -->
                </div>
                <div style="color: #8b8b8b">
                  {{ submitStatus }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="item-content" v-show="currentTab === 0">
      <div style="padding: 20px 30px; display: flex">
        <div
          @click="choseTestcase(index)"
          class="atag"
          v-for="(item, index) in rep.example"
          :key="index"
          style="font-size: 13px; font-weight: bold; border-radius: 10px"
          closable
        >
          {{ 'Case ' + index }}
        </div>
      </div>

      <div style="padding: 0px 30px">
        <div style="display: flex; font-size: 15px; color: #8a8a98; font-weight: bold">input=</div>
      </div>
      <div style="padding: 5px 30px">
        <el-input
          v-model="input"
          style="min-width: 240px"
          autosize
          type="textarea"
          placeholder="请输入测试样例"
        />
      </div>

      <div style="padding: 0px 30px">
        <a-input
          disabled
          :style="{ width: '860px' }"
          style="border-radius: 10px; height: 42px"
          default-value="answer is dfafsafdafad"
          placeholder="Please enter something"
          allow-clear
        />
      </div>
    </div>
    <div class="item-content" v-show="currentTab === 1">
      <div v-if="result.error == 0">
        <div style="padding: 30px 0px">
          <div
            style="
              padding: 0px 30px;
              display: flex;
              font-size: 15px;
              color: #8a8a98;
              font-weight: bold;
            "
          >
            output= {{ result.output }}
          </div>
        </div>
      </div>
      <div v-else>
        <h2 style="color: red; font-weight: 400; padding: 15px 25px">执行错误</h2>
        <div style="padding: 0px 25px">
          <a-alert title="error" type="error" style="border-radius: 15px; width: 860px"
            >you answer issue mistake</a-alert
          >
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.containerss {
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  min-height: 40px;
  background-color: rgb(249, 249, 249);
  padding: 0px 1px;
  border-radius: 0px 0px 10px 10px;

  .svg-box {
    border-radius: 5px;
    // width:  130px;
    padding-left: 9px;
    padding-right: 9px;
    position: relative;
    height: 30px;
    display: flex;
    transition: 0.5s;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    // margin: 0px 5px;
  }
  .svg-box:hover {
    background-color: #c7c7c7;
    color: black !important;
  }
  .svg-box:hover .icon-svg {
    color: black !important;
  }
  .icon-svg {
    transition: 0.5s;
  }
}
.item-content {
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  .atag {
    display: flex;
    padding: 15px 10px;
    background-color: white;
    cursor: pointer;
  }
  .atag:hover {
    background-color: #f2f3f4;
  }
}
.item {
  border-radius: 10px 10px 0px 0px;
  position: relative;
  height: 40px;
  min-height: 40px;
  display: flex;
  background-color: rgb(249, 249, 249);
  align-items: center;
  // justify-content: space-between;
  .item-left {
    display: flex;
    height: 100%;
    width: auto;

    // position: relative;
    align-items: center;
    transition: 0.5s;
    .top {
      position: absolute;

      right: 0;
      display: flex;
      width: 210px;
      .top-icon {
        display: flex;
        color: #c7c7c7;
        gap: 3px;
        align-items: center;
      }

      .runAndTest {
        display: flex;
        position: relative;
        justify-content: center;
        width: 210px;
        height: 50px;
        transform: translate(-20%, 0%);
        // background-color: aqua;
        gap: 3px;

        .runFor {
          position: relative;
          height: 100%;
          gap: 1px;
          display: flex;
          align-items: center;
          .running {
            height: 40px;
            width: 210px;
            border-radius: 10px;
            background-color: #e6e6e6;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: 0.2s;
            overflow: hidden;
            justify-content: center;
            animation: expand 0.5s ease forwards;
          }
          @keyframes expand {
            0% {
              width: 240px;
              // transform: translate(-50%, -50);
            }
            100% {
              width: 180px;
              // transform: translate(-50%, -50%) ;
            }
          }

          .run {
            cursor: pointer;
            border-radius: 10px 0px 0px 10px;
            display: flex;
            width: 85px;
            height: 35px;
            background-color: #e6e6e6;
            padding-left: 15px;
            align-items: center;
            // justify-content:
            gap: 25px;
          }
          .submit {
            cursor: pointer;

            display: flex;

            border-radius: 0px 10px 10px 0px;
            width: 85px;
            background-color: #e6e6e6;
            align-items: center;
            gap: 25px;
            padding-left: 15px;
            height: 35px;
            color: #01b328;
          }
          .debug:hover {
            background-color: #e0e0e0 !important;
          }
          .run:hover {
            background-color: #e0e0e0 !important;
          }
          .submit:hover {
            background-color: #e0e0e0 !important;
          }
        }
        .noteFor {
          position: relative;
          width: 90px;
          height: 100%;
          gap: 3px;
          justify-content: center;
          display: flex;
          align-items: center;
          .clock-note {
            width: 40px;
            height: 40px;
            background-color: #e6e6e6;
            border-radius: 10px;
            justify-content: center;
            display: flex;
            align-items: center;
          }
          .bi-note {
            width: 40px;
            height: 40px;
            background-color: #e6e6e6;
            border-radius: 10px;
            justify-content: center;
            display: flex;
            align-items: center;
          }
          .clock-note:hover {
            background-color: #e0e0e0 !important;
          }
          .bi-note:hover {
            background-color: #e0e0e0 !important;
          }
        }
      }
      .item-left-item {
        border-radius: 10px;
        height: 80%;
        padding-left: 10px;
        padding-right: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        white-space: nowrap;
      }
      .item-left-item:hover {
        background-color: #e6e6e6;
      }
    }
    .item-right {
      display: flex;
      height: 100%;
      position: relative;
      align-items: center;
      transition: 0.5s;

      .item-right-item {
        border-radius: 10px;
        height: 80%;
        padding-left: 10px;
        padding-right: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        white-space: nowrap;
      }
      .item-right-item:hover {
        background-color: #e6e6e6;
      }
    }
  }
}
</style>
