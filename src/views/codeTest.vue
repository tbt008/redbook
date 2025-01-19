<script setup>
import request from '@/util/request'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import testCase from '@/components/testCase.vue'
const currentTab = ref(0)
import { useRouter } from 'vue-router'
import { tr } from 'element-plus/es/locale/index.mjs'
const router = useRouter()
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

const result = ref(null)

const input = ref()
const emit = defineEmits(['showACImgfun'])
const submitStatus = ref('运行中')
const djTime = ref()
const choseTestcase = (type) => {
  input.value = props.rep.examples[type].input
  document.getElementsByClassName('atag')[beforeValue].style.backgroundColor = '#ffffff'
  document.getElementsByClassName('atag')[currentClick.value].style.background = '#F2F3F4'
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
          judgeQuestionLoading.value = false
        } else {
          codeRecordId = res.data
          submitStatus.value = '判题中'

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
          whileGetResult(codeRecordId)
        }
      })
      .catch((error) => {
        judgeQuestionLoading.value = false
        ElMessage.error(error)
      })
  }
}
const isSubmit = ref(false)
const runCode = () => {
  const currentTime = new Date().getTime()
  if (undefined != djTime.value && null != djTime.value && currentTime - djTime.value < 4000) {
    ElMessage.error('您运行的太快了,过几秒后试试')
    return false
  }
  isSubmit.value = false
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
        // 普通提交
        request
          .get(`/record/get/one/${recordId}`)
          .then((res) => {
            // 获取结果  成功后
            if (res.data.status != 1 && res.data.status != 0) {
              clearInterval(intervalId)
              if (res.data.result == 100) {
                emit('showACImgfun')

                if (router.currentRoute.value.query.daily) {
                  request
                    .post('/userDailyQuestion/updateDailyQuestion', {
                      dailyQuestionId: router.currentRoute.value.query.daily
                    })
                    .then((res) => {
                      if (res.data.result == 200) {
                        console.log('每日一题更新成功')
                      } else {
                        console.log('每日一题更新错误')
                      }
                    })
                }
              }
              result.value = res.data.test
              isSubmit.value = true
              currentTab.value = 1
              judgeQuestionLoading.value = false
            }
          })
          .catch((error) => {
            judgeQuestionLoading.value = false
            ElMessage.error(error)
          })
      } else {
        request
          .get(`/contest/record/get/one/${recordId}`)
          .then((res) => {
            // 获取结果  成功后
            if (res.data.status != 1 && res.data.status != 0) {
              clearInterval(intervalId)
              if (res.data.result == 100) {
                emit('showACImgfun')
              }
              result.value = res.data.test
              isSubmit.value = true
              currentTab.value = 1
              judgeQuestionLoading.value = false
            }
          })
          .catch((error) => {
            judgeQuestionLoading.value = false
            ElMessage.error(error)
          })
      }
      count++
    } else {
      // 取消定时器
      clearInterval(intervalId)
    }
  }, 1000)

  if (judgeQuestionLoading.value == true) {
    ElMessage.success('判题超时，请到提交记录查看结果')
    judgeQuestionLoading.value == false
  }
}

const testList = ref([])
const questionInfo = ref({})
onMounted(() => {
  questionInfo.value = props.rep
})
</script>

<template>
  <div class="containerss">
    <div class="item">
      <div class="item-left">
        <div @click="currentTab = 0" class="item-left-item">
          <div :style="currentTab === 0 ? 'color: black' : 'color:gray'">
            <div style="display: flex; align-items: center; margin-left: 10px">
              <svg
                t="1736855777789"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="4367"
                width="20"
                height="20"
              >
                <path
                  d="M832 960H192c-38.4 0-64-25.6-64-64V128c0-38.4 25.6-64 64-64h640c38.4 0 64 25.6 64 64v768c0 38.4-25.6 64-64 64zM192 128v768h640V128H192z"
                  fill="#52c41b"
                  p-id="4368"
                ></path>
                <path
                  d="M723.2 646.4H300.8c-19.2 0-28.8-12.8-28.8-28.8s12.8-28.8 28.8-28.8h419.2c19.2 0 28.8 12.8 28.8 28.8s-9.6 28.8-25.6 28.8zM723.2 796.8H300.8c-19.2 0-28.8-12.8-28.8-28.8s12.8-32 28.8-32h419.2c19.2 0 28.8 12.8 28.8 28.8s-9.6 32-25.6 32zM361.6 467.2c-9.6 0-16-3.2-22.4-9.6l-89.6-89.6c-12.8-12.8-12.8-28.8 0-41.6l89.6-89.6c12.8-12.8 32-12.8 44.8 0s12.8 28.8 0 41.6l-70.4 70.4L384 416c12.8 12.8 12.8 28.8 0 41.6-6.4 9.6-12.8 9.6-22.4 9.6zM662.4 467.2c-9.6 0-16-3.2-22.4-9.6-12.8-12.8-12.8-28.8 0-41.6l70.4-70.4L640 278.4c-12.8-12.8-12.8-28.8 0-41.6s28.8-12.8 41.6 0l89.6 89.6c12.8 12.8 12.8 28.8 0 41.6l-89.6 89.6c-3.2 9.6-9.6 9.6-19.2 9.6zM460.8 467.2c-6.4 0-9.6 0-16-3.2-16-9.6-19.2-25.6-12.8-41.6l102.4-179.2c9.6-16 28.8-19.2 44.8-12.8 16 9.6 19.2 25.6 12.8 41.6l-102.4 179.2c-6.4 12.8-19.2 16-28.8 16z"
                  fill="#52c41b"
                  p-id="4369"
                ></path></svg
              >测试用例
            </div>
          </div>
        </div>
        <div @click="currentTab = 1" class="item-left-item">
          <div :style="currentTab === 1 ? 'color: black' : 'color:gray'">
            <div style="display: flex; align-items: center; margin-left: 10px">
              <svg
                t="1736855887810"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="6363"
                width="18"
                height="18"
              >
                <path
                  d="M284.672 227.328v56.832H739.84V227.328H284.672z m0 171.008v56.832H512v-56.832h-227.328z m568.832 227.328h56.832v-56.832h-56.832v56.832zM113.664 910.336c0 31.232 25.6 56.832 56.832 56.832h398.336v-56.832H170.496V113.664h683.008v398.848h56.32V113.664c0-31.232-25.6-56.832-56.832-56.832H170.496c-31.232 0-56.832 25.6-56.832 56.832v796.672z"
                  fill="#5661D7"
                  p-id="6364"
                ></path>
                <path
                  d="M863.744 880.128l-98.816-98.816a170.8032 170.8032 0 0 0 0-197.632c-54.784-76.8-161.28-94.72-238.08-40.448-76.8 54.784-94.72 161.28-40.448 238.08 54.784 76.8 161.28 94.72 238.08 40.448l98.816 98.816 0.512 0.512c11.264 10.752 29.184 10.752 40.448-0.512 11.264-11.264 10.752-29.184-0.512-40.448z m-238.08-83.456A113.408 113.408 0 0 1 512 683.008a113.408 113.408 0 0 1 113.664-113.664c62.976 0 113.664 51.2 113.664 113.664 0 62.464-50.688 113.664-113.664 113.664z"
                  fill="#FAC858"
                  p-id="6365"
                ></path></svg
              >测试结果
            </div>
          </div>
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
          v-for="(item, index) in props.rep.examples"
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
    </div>
    <div class="item-content" v-show="currentTab === 1">
      <div v-if="!isSubmit">
        <div v-if="result == null">
          <h2 style="color: #8a8a98; font-weight: 400; padding: 15px 25px">您还未提交</h2>
        </div>
        <div v-else-if="result.error == 0">
          <div style="margin-top: 30px; padding: 0px 30px">
            <div style="display: flex; font-size: 15px; color: #8a8a98; font-weight: bold">
              output=
            </div>
          </div>
          <div style="padding: 5px 30px">
            <el-input
              v-model="result.output"
              style="min-width: 240px"
              autosize
              type="textarea"
              placeholder="请输入测试样例"
            />
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
      <div v-else>
        <testCase :test="result"></testCase>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.containerss {
  height: 100%;
  z-index: 100;
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
