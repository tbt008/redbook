<template>
  <div>
    <div class="contest-info">
      <el-skeleton :loading="loading" animated>
        <template #template> <el-skeleton-item variant="circle" /> </template>
        <template #default>
          <div style="margin: auto; width: 70%; flex-wrap: wrap">
            <div style="margin: auto; display: flex">
              <div
                style="
                  color: rgb(255, 255, 255);
                  padding-top: 50px;
                  font-size: 50px;
                  margin: auto;
                  display: flex;
                  text-align: center;
                "
              >
                <div style="display: flex">{{ constestInfo.title }}</div>
                <div
                  style="
                    padding-left: 30px;
                    display: flex;
                    text-align: center;
                    margin: auto 0;
                    height: 25px;
                  "
                >
                  <div
                    v-if="constestInfo.isInputPassword"
                    :class="['difficulty-label', 'difficulty-entry']"
                  >
                    <el-icon><Lock /></el-icon>密码
                  </div>
                  <div
                    style="margin-left: 10px"
                    v-if="constestInfo.isInvite"
                    :class="['difficulty-label', 'difficulty-easy']"
                  >
                    <el-icon><key /></el-icon>邀请
                  </div>
                  <div
                    style="margin-left: 10px"
                    v-if="constestInfo.contestType == 1"
                    :class="['difficulty-label', 'difficulty-medium']"
                  >
                    IOI
                  </div>
                  <div
                    style="margin-left: 10px"
                    v-if="constestInfo.contestType == 2"
                    :class="['difficulty-label', 'difficulty-medium']"
                  >
                    ACM
                  </div>
                </div>
              </div>
            </div>

            <div
              style="color: rgb(220, 220, 220); width: 100%; font-size: 15px; text-align: center"
            >
              <el-icon><BellFilled /></el-icon>比赛时间 : {{ constestInfo.startTime }} 至
              {{ constestInfo.endTime }}
            </div>
            <div>
              <div
                style="color: rgb(220, 220, 220); width: 100%; font-size: 15px; text-align: center"
              >
                <el-icon><Promotion /></el-icon>
                主办方 : ptuCode.com
              </div>
              <div
                style="color: rgb(220, 220, 220); width: 100%; font-size: 15px; text-align: center"
              >
                <el-icon><UserFilled /></el-icon>参与人数：{{ constestInfo.participationNumber }}
              </div>
              <div
                style="
                  color: rgb(220, 220, 220);
                  width: 100%;
                  font-size: 15px;
                  text-align: center;
                  margin-bottom: 20px;
                "
              >
                语言 :
                {{ constestInfo.language }}
              </div>
              <el-button
                v-if="
                  constestInfo.isJoin == false && constestInfo.isInvite == false && isEnd == false
                "
                type="danger"
                style="margin: 10px"
                @click="joinContest"
                ><el-icon><Sunny /></el-icon> 报名</el-button
              >
            </div>
          </div>
          <progress-bar
            v-if="!isShowCountDown && constestInfo.isJoin == true && isEnd == false"
            :startTime="startTime"
            :endTime="endTime"
          />
        </template>
      </el-skeleton>
    </div>

    <div style="height: 500px; width: 80%; margin: auto">
      <el-tabs v-model="selectTab" class="contest-tabs" @tab-click="updateTab">
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
                v-if="constestInfo.isJoin == false && constestInfo.isInvite == true"
              >
                当前比赛需要邀请，且您未被邀请，无法参加！
              </div>

              <div
                class="passwordInput"
                v-if="constestInfo.needPassword == true && constestInfo.isInputPassword == false"
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
                {{ constestInfo.description }}
              </div>
            </template>
          </el-skeleton>
        </el-tab-pane>
        <div v-if="constestInfo.isJoin == true && isEnd == false">
          <el-tab-pane label="题目" name="second"
            ><el-scrollbar height="600px">
              <el-table :data="questionList" style="width: 100%">
                <el-table-column label="题号" prop="letter"> </el-table-column>
                <el-table-column label="题目" prop="title">
                  <template #default="{ row }">
                    <el-link @click="intoQuestion(row.questionId)">
                      {{ row.title }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column label="通过率" width="100">
                  <template #default="{ row }">
                    <el-link>{{ row.acTimes }}/{{ row.tryTimes }} </el-link></template
                  >
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
            <el-input
              v-model="inputUser"
              style="width: 240px"
              placeholder="输入用户名后回车查询"
              @change="searchUser"
              :suffix-icon="Search"
            />

            <el-table :data="codeRecordList" style="width: 100%">
              <el-table-column label="用户名" prop="uid"> </el-table-column>
              <el-table-column label="题号" prop="displayTitle">
                <template #header>
                  <el-dropdown :hide-on-click="false">
                    <span class="el-dropdown-link">
                      题号
                      <el-icon class="el-icon--right">
                        <arrow-down />
                      </el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-for="(item, index) in displayTitle" :key="index">
                          <el-checkbox
                            @click="handleCommand(index)"
                            v-bind="item.checked"
                            label=""
                            size="large"
                          />
                          {{ item.text }}</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template #default="{ row }">
                  <el-link>{{ row.displayTitle }}</el-link>
                </template>
              </el-table-column>
              <el-table-column label="运行状态" prop="runResult">
                <template #header>
                  <el-dropdown :hide-on-click="false">
                    <span class="el-dropdown-link">
                      运行状态
                      <el-icon class="el-icon--right">
                        <arrow-down />
                      </el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-for="(item, index) in runResult" :key="index">
                          <el-checkbox
                            @click="handleRun(index)"
                            v-bind="item.checked"
                            label=""
                            size="large"
                          />
                          {{ item.text }}</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <template #default="{ row }">
                  <el-tag v-if="row.runResult == '答案正确'" type="success">答案正确</el-tag>
                  <el-tag v-else-if="row.runResult == '部分正确'" type="primary">部分正确</el-tag>
                  <el-tag v-else-if="row.runResult == '答案错误'" type="danger">答案错误</el-tag>
                  <el-tag v-else-if="row.runResult == '编译错误'" type="warning">编译错误</el-tag>
                  <el-tag v-else-if="row.runResult == '正在判题'" type="primary">正在判题</el-tag>
                </template>
              </el-table-column>

              <el-table-column label="时间(ms)" prop="runtime">
                <template #default="{ row }">
                  <div v-if="row.runtime == null">N/A</div>
                  <div v-else>
                    {{ row.runtime }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="内存(kb)" prop="memory">
                <template #default="{ row }">
                  <div v-if="row.memory == null">N/A</div>
                  <div v-else>
                    {{ row.memory }}
                  </div></template
                >
              </el-table-column>
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
            </el-table>
            <!-- elementplus el-pagination: 分页器 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="recordCurrentPage"
                v-model:page-size="recordPageSize"
                :total="recordTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @size-change="recordHandleSizeChange"
                @current-change="recordHandleCurrentChange"
              />
            </div>
          </el-tab-pane>
        </div>

        <el-tab-pane label="排名" name="fourth">
          <el-table :data="rankinglist" style="width: 100%">
            <el-table-column label="名次" prop="rank" width="100"> </el-table-column>
            <el-table-column label="参赛者" prop="nickName" width="100"> </el-table-column>
            <el-table-column label="通过" prop="totalNum" width="100"> </el-table-column>
            <el-table-column label="罚时" width="100">
              <template #default="{ row }">
                <div>{{ penalty(row) }}</div>
              </template>
            </el-table-column>

            <el-table-column
              v-for="(item, index) in displayTitle"
              :key="index"
              :label="item.text"
              align="center"
            >
              <template #default="{ row }">
                <!-- acm -->
                <div v-if="constestInfo.contestType == 2">
                  <div
                    v-if="row.questionInfo[index].score == 100"
                    class="rank-css"
                    style="color: #67c23a"
                  >
                    <div>
                      <div>
                        {{ row.questionInfo[index].score }}

                        (-{{ row.questionInfo[index].count }})
                      </div>

                      <div style="color: rgb(96, 96, 96); font-size: 13px">
                        {{ row.questionInfo[index].acceptedTime }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="row.questionInfo[index].acceptedTime != null"
                    class="rank-css"
                    style="color: red"
                  >
                    <div>
                      <div>
                        {{ row.questionInfo[index].score }}

                        (-{{ row.questionInfo[index].count }})
                      </div>

                      <div style="color: rgb(96, 96, 96); font-size: 13px">
                        {{ row.questionInfo[index].acceptedTime }}
                      </div>
                    </div>
                  </div>

                  <div v-else class="rank-css"></div>
                </div>
                <!-- ioi -->
                <div v-else>
                  <div
                    v-if="row.questionInfo[index].score == 100"
                    class="rank-css"
                    style="color: #67c23a"
                  >
                    <div>
                      <div>
                        {{ row.questionInfo[index].score }}
                      </div>

                      <div style="color: rgb(96, 96, 96); font-size: 13px">
                        {{ row.questionInfo[index].acceptedTime }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="
                      row.questionInfo[index].acceptedTime != null &&
                      row.questionInfo[index].score != 0
                    "
                    class="rank-css"
                    style="color: rgb(230, 162, 60)"
                  >
                    <div>
                      <div>
                        {{ row.questionInfo[index].score }}
                      </div>

                      <div style="color: rgb(96, 96, 96); font-size: 13px">
                        {{ row.questionInfo[index].acceptedTime }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-else-if="
                      row.questionInfo[index].acceptedTime != null &&
                      row.questionInfo[index].score == 0
                    "
                    class="rank-css"
                    style="color: red"
                  >
                    <div>
                      <div>
                        {{ row.questionInfo[index].score }}
                      </div>

                      <div style="color: rgb(96, 96, 96); font-size: 13px">
                        {{ row.questionInfo[index].acceptedTime }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="rank-css"></div>
                </div>
              </template>
            </el-table-column>

            <template #empty>
              <el-empty description="没有数据" />
            </template>
          </el-table>
          <!-- elementplus el-pagination: 分页器 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="rankCurrentPage"
              v-model:page-size="rankPageSize"
              :total="rankTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="rankHandleSizeChange"
              @current-change="rankHandleCurrentChange"
            /></div
        ></el-tab-pane>
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
const inputUser = ref('')
const loading = ref(true)
const checkedQuestionName = ref([])
const selectTab = ref('first')
const endText = ref('比赛开始！')
const rankCurrentPage = ref(1)
const rankPageSize = ref(10)
const rankTotal = ref(0)
const recordCurrentPage = ref(1)
const recordPageSize = ref(10)
const recordTotal = ref(0)
const isEnd = ref(false)
const questionNumber = ref([])
const runStatusList = ref([])
const displayTitle = ref([])
const runResult = ref([
  { text: '答案正确', checked: false },
  { text: '部分正确', checked: false },
  { text: '答案错误', checked: false },
  { text: '编译错误', checked: false },
  { text: '正在判题', checked: false }
])
const handleRun = (index1) => {
  runStatusList.value = []
  runResult.value[index1].checked = !runResult.value[index1].checked
  runResult.value.forEach((item, index) => {
    if (item.checked == true) {
      runStatusList.value.push(item.text)
    }
  })
  selectRecord()
}
// 分页大小改变处理
const recordHandleSizeChange = async (val) => {
  recordPageSize.value = val
  recordCurrentPage.value = 1
  selectRecord()
}

// 当前页改变处理
const recordHandleCurrentChange = async (val) => {
  recordCurrentPage.value = val
  selectRecord()
}
// 分页大小改变处理
const rankHandleSizeChange = async (val) => {
  rankPageSize.value = val
  rankCurrentPage.value = 1
  refreshRank()
}

// 当前页改变处理
const rankHandleCurrentChange = async (val) => {
  rankCurrentPage.value = val
  refreshRank()
}
const timeToSeconds = (timeString) => {
  // 使用冒号分割字符串以获取小时、分钟和秒
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  // 计算总秒数：小时 * 3600 + 分钟 * 60 + 秒
  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  return totalSeconds
}
const penalty = (row) => {
  // acm
  if (constestInfo.value.contestType == 2) {
    var sum_ac_time = 0
    var sum_count = 0
    row.questionInfo.forEach((item, index) => {
      if (item.acceptedTime != null && item.score == 100) {
        sum_ac_time += timeToSeconds(item.acceptedTime)
        sum_count += item.count
      }
    })
    return (sum_ac_time / 60 + sum_count * 20).toFixed(2)
  } else {
    var maxTime = 0
    row.questionInfo.forEach((item, index) => {
      if (item.acceptedTime != null && item.score == 100) {
        maxTime = Math.max(maxTime, timeToSeconds(item.acceptedTime))
      }
    })
    return (maxTime / 60).toFixed(2)
  }
}
const handleCommand = (index1) => {
  // 遍历获取displayTitle
  checkedQuestionName.value = []
  displayTitle.value[index1].checked = !displayTitle.value[index1].checked
  displayTitle.value.forEach((item, index) => {
    if (item.checked == true) {
      checkedQuestionName.value.push(item.text)
    }
  })
  selectRecord()
}
const updateTab = (tab) => {
  if (tab.paneName == 'second') {
    selectQuestion()
  } else if (tab.paneName == 'third') {
    selectRecord()
  } else if (tab.paneName == 'fourth') {
    refreshRank()
  }
}
const joinContest = () => {
  request
    .post(`/contest/join`, {
      contestId: id.value
    })
    .then((res) => {
      if (res.code == 200) {
        ElMessage.success('报名比赛成功！')
        constestInfo.value.isJoin == true
      } else {
        ElMessage.error('报名比赛失败：' + res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('报名比赛失败！')
    })
}
const searchUser = (value) => {
  request
    .post(`/contest/record/get/all`, {
      contestId: id.value,
      uid: value
    })
    .then((res) => {
      if (res.code == 200) {
        codeRecordList.value = res.data.list
        // 遍历
        codeRecordList.value.forEach((item) => {
          if (item.result == 100) {
            item.result = '答案正确'
          } else if (item.result > 0 && item.result < 100) {
            item.result = '部分正确'
          } else if (item.result == 0) {
            item.result = '答案错误'
          } else if (item.result == -2) {
            item.result = '编译错误'
          }
        })
      } else {
        ElMessage.error('获取提交记录失败：' + res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('获取提交记录失败！')
    })
}
const intoQuestion = (id) => {
  // 打开新标签页
  const url = `/question?id=${id}&contest=${constestInfo.value.id}`
  window.open(url, '_blank')
}
const refreshRank = () => {
  request
    .post(`/ranking/get`, {
      contestId: id.value,
      pageStart: rankCurrentPage.value,
      pageSize: rankPageSize.value
    })
    .then((res) => {
      if (res.code == 200) {
        rankinglist.value = res.data.list
        questionNumber.value = []
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

        res.data.list[0].questionInfo.forEach((item, index) => {
          item.letter = letters[index]
          var r = { text: `${letters[index]}`, value: `${letters[index]}` }
          r.checked = false
          questionNumber.value.push(r)
        })
        if (displayTitle.value == []) {
          displayTitle.value = questionNumber.value
        }

        rankTotal.value = res.data.total
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
        isShowCountDown.value = false
        displayTitle.value = []
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        questionList.value.forEach((item, index) => {
          item.letter = letters[index]
          var r = { text: `${letters[index]}`, value: `${letters[index]}` }
          r.checked = false
          displayTitle.value.push(r)
        })
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((err) => {
      ElMessage.error(err)
    })
}
const selectRecord = () => {
  request
    .post(`/contest/record/get/all`, {
      contestId: id.value,
      pageStart: recordCurrentPage.value,
      pageSize: recordPageSize.value,
      questionDisplayNames: checkedQuestionName.value,
      runStatusList: runStatusList.value
    })
    .then((res) => {
      if (res.code == 200) {
        codeRecordList.value = res.data.list
        recordTotal.value = res.data.total
      } else {
        ElMessage.error('获取提交记录失败：' + res.msg)
      }
    })
    .catch(() => {
      ElMessage.error('获取提交记录失败！')
    })
}
onMounted(async () => {
  id.value = router.currentRoute.value.params.id
  request.get(`/contest/racepage/${id.value}`).then((res) => {
    constestInfo.value = res.data
    loading.value = false
    startTime.value = new Date(constestInfo.value.startTime).getTime() / 1000 + ' '
    endTime.value = new Date(constestInfo.value.endTime).getTime() / 1000 + ' '
    isEnd.value =
      new Date(constestInfo.value.endTime).getTime() - new Date().getTime() < 0 ? true : false
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
const filterHandler = (value, row, column) => {
  const property = column['property']
  return row[property] === value
}
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
/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.difficulty-label {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.difficulty-entry {
  background-color: #abafa8;
  color: white;
}

.difficulty-easy {
  background-color: #67c23a;
  color: white;
}

.difficulty-medium {
  background-color: #e6a23c;
  color: white;
}

.difficulty-hard {
  background-color: #409eff;
  color: white;
}

.difficulty-expert {
  background-color: #f56c6c;
  color: white;
}
.rank-css {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  width: 100%;
}
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
