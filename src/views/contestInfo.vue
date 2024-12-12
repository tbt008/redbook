<template>
  <div>
    <div class="contest-info">
      <el-skeleton :loading="loading" animated>
        <template #template> <el-skeleton-item variant="circle" /> </template>
        <template #default>
          <div style="margin: auto; width: 70%; flex-wrap: wrap">
            <div
              style="
                color: rgb(255, 255, 255);
                padding-top: 50px;
                font-size: 50px;
                text-align: center;
              "
            >
              {{ constestInfo.title }}
            </div>
            <el-tag v-if="constestInfo.isInputPassword" :type="primary" effect="dark"
              ><el-icon><Lock /></el-icon>密码</el-tag
            >
            <el-tag
              style="margin-left: 10px"
              v-if="constestInfo.isInvite"
              :type="success"
              effect="dark"
              ><el-icon><key /></el-icon>邀请</el-tag
            >
            <el-tag
              style="margin-left: 10px"
              v-if="constestInfo.contestType == 1"
              :type="primary"
              effect="dark"
              >IOI</el-tag
            >
            <el-tag style="margin-left: 10px" v-else :type="primary" effect="dark">ACM</el-tag>
            <div
              style="color: rgb(220, 220, 220); width: 100%; font-size: 20px; text-align: center"
            >
              <el-icon><BellFilled /></el-icon>比赛时间:{{ constestInfo.startTime }}至{{
                constestInfo.endTime
              }}
            </div>
            <div>
              <div
                style="color: rgb(220, 220, 220); width: 100%; font-size: 20px; text-align: center"
              >
                <el-icon><Promotion /></el-icon>
                主办方:ptuCode.com
              </div>
              <div
                style="color: rgb(220, 220, 220); width: 100%; font-size: 20px; text-align: center"
              >
                <el-icon><UserFilled /></el-icon>参与人数：{{ constestInfo.userNumber }}
              </div>
              <div
                style="
                  color: rgb(220, 220, 220);
                  width: 100%;
                  font-size: 20px;
                  text-align: center;
                  margin-bottom: 20px;
                "
              >
                语言:
                <span v-if="constestInfo.language == 0">不限</span>
                <span v-if="constestInfo.language == 1">C</span>
                <span v-if="constestInfo.language == 2">C++</span>
                <span v-if="constestInfo.language == 3">Java</span>
                <span v-if="constestInfo.language == 4">Python</span>
              </div>
            </div>
          </div>
          <progress-bar :startTime="startTime" :endTime="endTime" />
        </template>
      </el-skeleton>
    </div>

    <div style="height: 500px; width: 70%; margin: auto">
      <el-tabs v-model="activeName" class="contest-tabs" @tab-click="handleClick">
        <el-tab-pane label="比赛说明" name="first" style="display: flex; flex-wrap: wrap">
          <el-skeleton :loading="loading" animated>
            <template #template>
              <el-skeleton :rows="5" animated />
            </template>
            <template #default>
              <div v-if="isShowCountDown" style="margin: auto">
                <count-down
                  @selectQuestion="selectQuestion"
                  :endTime="startTime"
                  :endText="endText"
                />
              </div>
              <div
                class="warning"
                v-if="constestInfo.isBeInvited == 0 && constestInfo.isInvite == true"
              >
                当前比赛需要邀请，且您未被邀请，无法参加！
              </div>

              <div
                class="passwordInput"
                v-if="constestInfo.isInputPassword != 1 && constestInfo.isInputPassword != null"
              >
                <el-input
                  v-model="inputPassword"
                  style="width: 240px"
                  placeholder="请输入比赛密码"
                />
                <el-button type="primary" @click="submitPassword()">提交</el-button>
              </div>
              <div
                style="
                  background-color: beige;
                  min-height: 300px;
                  height: auto;
                  width: 80%;
                  margin: auto;
                  padding: 30px;
                "
              >
                {{ constestInfo.announcement }}
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>
        <div>
          <el-tab-pane label="题目" name="second"
            ><el-scrollbar height="600px">
              <el-table :data="questionList" style="width: 100%">
                <el-table-column label="题号" prop="letter"> </el-table-column>
                <el-table-column label="题目" prop="title">
                  <template #default="{ row }">
                    <el-link @click="intoQuestion(row.questionId)">{{ row.title }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="状态" prop="isPass">
                  <template #default="{ row }">
                    <el-tag v-if="row.isPass == 1" type="primary">通过</el-tag>

                    <el-tag v-if="row.isPass == -1" type="info">未提交</el-tag>

                    <el-tag v-if="row.isPass == 0" type="danger">失败</el-tag>
                  </template>
                </el-table-column>

                <template #empty>
                  <el-empty description="没有数据" />
                </template>
              </el-table> </el-scrollbar
          ></el-tab-pane>
          <el-tab-pane label="提交" name="third">
            <el-scrollbar height="600px">
              <el-table :data="codeRecordList" style="width: 100%">
                <!-- <el-table-column label="id" prop="id"> </el-table-column> -->
                <el-table-column label="用户名" prop="userId"> </el-table-column>
                <el-table-column label="题号" prop="">
                  <template #default="{ row }">
                    <el-link>{{ hashmap.get(row.questionId) }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="运行状态" prop="result">
                  <template #default="{ row }">
                    <el-tag v-if="row.result == 100" type="success">答案正确</el-tag>
                    <el-tag v-else-if="row.result < 100 && row.result > 0" type="primary"
                      >部分正确</el-tag
                    >
                    <el-tag v-if="row.result == 0" type="danger">答案错误</el-tag>
                    <el-tag v-if="row.result == -2" type="warning">编译错误</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="时间(ms)" prop="runtime"> </el-table-column>
                <el-table-column label="内存(kb)" prop="memory"> </el-table-column>
                <el-table-column label="语言" prop="language">
                  <template #default="{ row }">
                    <div v-if="row.language == 1">C</div>
                    <div v-if="row.language == 2">C++</div>
                    <div v-if="row.language == 3">Java</div>
                    <div v-if="row.language == 4">Python</div>
                  </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="createTime"> </el-table-column>
                <template #empty>
                  <el-empty description="没有数据" />
                </template>
              </el-table> </el-scrollbar
          ></el-tab-pane>
          <el-tab-pane label="排名" name="fourth">
            <el-scrollbar height="600px">
              <el-table :data="rankinglist" style="width: 100%">
                <el-table-column label="名次" prop="count"> </el-table-column>
                <el-table-column label="参赛者" prop="uickName"> </el-table-column>
                <el-table-column label="通过" prop="totalNum"> </el-table-column>

                <el-table-column
                  v-for="(item, index) in questionList"
                  :key="index"
                  :label="item.letter"
                >
                  <template #default="{ row }">
                    <el-link>{{ row.questionInfo[index].score }}</el-link>
                  </template>
                </el-table-column>

                <template #empty>
                  <el-empty description="没有数据" />
                </template>
              </el-table> </el-scrollbar
          ></el-tab-pane>
        </div>
      </el-tabs>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import request from '@/util/request.ts'
import countDown from '@/components/countDown.vue'
import progressBar from '@/components/progressBar.vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const activeName = ref('first')
const router = useRouter()
const id = ref()
const inputPassword = ref('')
const endTime = ref()
const startTime = ref()
const isShowCountDown = ref(false)
const questionList = ref([])
const constestInfo = ref({})
const codeRecordList = ref([])
const rankinglist = ref([])
const loading = ref(true)
const map = ref({})
const endText = ref('比赛开始！')
var hashmap = new Map()
const intoQuestion = (id) => {
  router.push(`/question?id=${id}&contest=${constestInfo.value.id}`)
}
const refreshRank = () => {
  request.get(`/ranking/${id.value}`).then((res) => {
    if (res.code == 200) {
      rankinglist.value = res.data
    } else {
      ElMessage.error(res.msg)
      console.log(res)
    }
  })
}
const selectQuestion = () => {
  request
    .get(`/contest/racepage/${id.value}/question`)
    .then((res) => {
      if (res.code == 200) {
        questionList.value = res.data
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        questionList.value.forEach((item, index) => {
          // 确保索引在字母数组范围内内，这里简单处理只取前26个
          if (index < letters.length) {
            item.letter = letters[index]
            let t = item.questionId
            hashmap.set(t, letters[index])
          } else {
            item.letter = '超出了字母范围'
          }
        })
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error(err)
    })
  isShowCountDown.value = false
}
const selectRecord = () => {
  request.get(`/contest/record/get/all/${id.value}`).then((res) => {
    codeRecordList.value = res.data
  })
}
onMounted(async () => {
  id.value = router.currentRoute.value.params.id
  request.get(`/contest/racepage/${id.value}`).then((res) => {
    constestInfo.value = res.data
    loading.value = false
    startTime.value = new Date(constestInfo.value.startTime).getTime() / 1000 + ' '
    endTime.value = new Date(constestInfo.value.endTime).getTime() / 1000 + ' '

    isShowCountDown.value =
      new Date(constestInfo.value.startTime).getTime() - new Date().getTime() > 0 ? true : false
    // 比赛开始，查询题目
    if (isShowCountDown.value == false) {
      selectQuestion()
      selectRecord()
      refreshRank()
    }
  })
})
const submitPassword = () => {
  let obj = {
    contestId: id.value,
    password: inputPassword.value
  }
  request.post('/contest/submit/password', obj).then((res) => {
    if (res.data == true) {
      constestInfo.value.isInputPassword = true
      ElMessage.success('密码输入正确！')
    } else {
      ElMessage.success('密码输入错误！')
    }
  })
}
</script>
<style>
.contest-info {
  background:
    url(@/views/imgs/contest.png) no-repeat,
    linear-gradient(
      303deg,
      #186ee8 0%,
      #1b6fe8 9%,
      #2274e9 19%,
      #2b79ea 28%,
      #3481eb 38%,
      #3d89ec 48%,
      #4591ed 57%,
      #4d99ef 66%,
      #54a0f0 74%,
      #5aa7f1 81%,
      #60aef2 88%,
      #64b3f4 93%,
      #67b7f4 97%,
      #69b9f5 99%,
      #6abaf5 100%
    );
  background-size: cover;
  object-fit: cover;
  background-position: center center;
  padding: 0%;
  height: 300px;
}
.warning {
  color: rgb(245, 49, 49);
  font-size: 20px;
  padding: 30px;
  margin: auto;
}
.passwordInput {
  margin: auto;
  width: 100%;
  padding: 30px;
}
.contest-tabs {
  /* padding: 25px; */
  /* margin: 30px; */
  /* color: #6b778c; */
  /* height: 70px; */
  /* font-size: 32px; */
  /* font-weight: 600; */
}
</style>
