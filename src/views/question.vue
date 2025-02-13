<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/util/request'
import { useRouter } from 'vue-router'
const currentTab = ref(0)
const clickToLike = ref(false)
const router = useRouter()
const clickToFavour = ref(false)
const article = ref({})
const codeRecords = ref([])
const props = defineProps({
  rep: {
    type: Object,
    default: null
  },
  contestId: {
    type: Number
  }
})
const loading = ref(true)
const clickTitleTab = (index) => {
  currentTab.value = index

  if (index == 2) {
    getRecord()
  }
}

const scoreJudge = (difficulty) => {
  if (difficulty == 1) return '入门'
  else if (difficulty == 2) return '简单'
  else if (difficulty == 3) return '普及'
  else if (difficulty == 4) return '提高'
  else if (difficulty == 5) return '困难'
}
const judgeColor = (difficulty) => {
  if (difficulty == 1) return 'color: #1CB8B8'
  else if (difficulty == 2) return 'color: rgb(255, 193, 22)'
  else if (difficulty == 3) return 'color: #FFB800'
  else if (difficulty == 4) return 'color: rgb(52, 152, 219)'
  else return 'color: #FF2800'
}
const getRecord = async () => {
  if (props.contestId != null) {
    request.post(`/contest/record/get/submit/list`, {
      contestId: props.contestId,
      questionId: article.value.id
    }).then((res) => {
      if (res.code == 200) {
        codeRecords.value = res.data
      } else {
        ElMessage.error('提交记录获取：' + res.msg)
      }
    })
  } else {
    request.get(`/record/get/list/${article.value.id}`).then((res) => {
      if (res.code == 200) {
        codeRecords.value = res.data
      } else {
        ElMessage.error('提交记录获取：' + res.msg)
      }
    })
  }

}
const initFun = () => {
  if (props.rep !== null) {
    article.value = props.rep
    article.value.example = props.rep.examples
    clickToLike.value = props.rep.isThumb
    clickToFavour.value = props.rep.isFavour
    loading.value = false
  }
}

watch(
  () => props.rep,
  () => initFun()
)
onMounted(() => { })

const goToSubmissionDetail = (row) => {
  if (props.contestId != null) {
    router.push(`/submission/${row.submitId}?contest=${props.contestId}`)
  } else {
    router.push(`/submission/${row.submitId}`)
  }

}
</script>

<template>
  <div class="item">
    <div class="top">
      <!-- //题目描述 -->
      <div @click="clickTitleTab(0)" class="title" :style="currentTab === 0 ? 'color: black' : 'color:gray'">
        题目描述
      </div>
      <!-- //题解-->
      <span style="position: relative; left: 8px; color: #e0e0e0"> | </span>
      <div class="title" @click="clickTitleTab(1)" :style="currentTab === 1 ? 'color: black' : 'color:gray'">
        题解
      </div>
      <!-- //提交记录-->
      <span style="position: relative; left: 8px; color: #e0e0e0"> | </span>
      <div @click="clickTitleTab(2)" class="title" :style="currentTab === 2 ? 'color: black' : 'color:gray'">
        提交记录
      </div>
    </div>
    <div class="content" v-show="currentTab === 0">
      <el-skeleton :loading="loading" animated>
        <template #template>
          <el-skeleton-item variant="text" style="
              width: 40%;
              height: 30px;
              margin-left: 10px;
              margin-top: 50px;
              margin-bottom: 20px;
            " />
          <el-skeleton :rows="5" style="width: 90%; margin-left: 10px" animated />
          <el-skeleton :rows="5" style="width: 90%; margin-left: 10px" animated />
          <div style="
              width: 90%;
              display: flex;
              align-items: center;
              justify-items: space-between;
              margin-top: 16px;
              height: 16px;
            ">
            <el-skeleton-item variant="text" style="margin-right: 16px" />
            <el-skeleton-item variant="text" style="width: 30%" />
          </div>
        </template>
        <template #default>
          <div>
            <div class="topsss">
              <div style="display: flex; justify-content: space-between">
                <div style="position: relative; font-size: 25px; font-weight: bold">
                  {{ rep.id + '. ' + rep.title }}
                </div>
              </div>
              <div style="display: flex; gap: 5px">
                <div style="
                    cursor: pointer;
                    padding: 5px 8px;
                    border-radius: 10px;
                    background-color: #f0f0f0;
                    font-size: 12px;
                  ">
                  <div :style="judgeColor(rep.difficulty)">{{ scoreJudge(rep.difficulty) }}</div>
                </div>
                <el-tag v-for="item in article.tags" :key="item" :type="item.type" effect="dark">
                  {{ item }}
                </el-tag>
              </div>
              <code style="
                  display: block;
                  border-radius: 5px;
                  padding: 3px;
                  font-size: 12px;
                  color: rgb(115, 115, 115);
                  background-color: rgb(247, 247, 248);
                  width: 200px;
                ">
                时间限制：{{ rep.timeLimit }}s 空间限制：{{ rep.memoryLimit }}MB
              </code>
            </div>
            <div style="min-height: 505px">
              <div class="question-content">
                <mavon-editor style="border: #f0f0f0" v-model="article.description" :subfield="false" :boxShadow="false"
                  previewBackground="#ffffff" :defaultOpen="'preview'" :toolbarsFlag="false" :editable="false"
                  :scrollStyle="true" :ishljs="true" />
              </div>
              <div style="padding: 10px" v-for="(item, index) in article.example" :key="index">
                <div style="font: 14px sans-serif; font-weight: bold">示例 {{ index + 1 }}</div>

                <div style="
                    margin: 15px;
                    background-color: rgb(247, 248, 249);
                    border-radius: 10px;
                    padding: 15px;
                  ">
                  <div style="display: flex">
                    <div style="font: 16px sans-serif; font-weight: bold">输入:</div>

                    <div style="white-space: pre-line; margin-left: 10px">{{ item.input }}</div>
                  </div>
                  <div style="display: flex">
                    <div style="font: 16px sans-serif; font-weight: bold">输出:</div>

                    <div style="white-space: pre-line; margin-left: 10px">{{ item.output }}</div>
                  </div>
                  <div style="display: flex">
                    <div style="font: 16px sans-serif; font-weight: bold">解释:</div>

                    <div style="white-space: pre-line; margin-left: 10px">{{ item.explain }}</div>
                  </div>
                </div>
              </div>
              <div style="font: 14px sans-serif; font-weight: bold; padding-left: 20px">提示：</div>
              <div class="question-tip">
                <mavon-editor style="border: #f0f0f0" v-model="article.tip" :subfield="false" :boxShadow="false"
                  previewBackground="#ffffff" :defaultOpen="'preview'" :toolbarsFlag="false" :editable="false"
                  :scrollStyle="true" :ishljs="true" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
    <div class="content" v-show="currentTab === 1">
      <!-- <questionSolve></questionSolve> -->
    </div>
    <div class="content" v-show="currentTab === 2" style="height: 701px">
      <el-table :data="codeRecords" style="width: 100%" @row-click="goToSubmissionDetail">
        <el-table-column label="运行状态" prop="runResult">
          <template #default="{ row }">
            <el-tag v-if="row.runResult == '答案正确'" type="success">答案正确</el-tag>
            <el-tag v-else-if="row.runResult == '部分正确'" type="primary">部分正确</el-tag>
            <el-tag v-else-if="row.runResult == '答案错误'" type="danger">答案错误</el-tag>
            <el-tag v-else-if="row.runResult == '等待判题'" type="danger">等待判题</el-tag>
            <el-tag v-else-if="row.runResult == '编译错误'" type="warning">编译错误</el-tag>
            <el-tag v-else type="danger">{{ row.runResult }}</el-tag>
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
            </div>
          </template>
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
    </div>
  </div>
</template>
<style lang="scss" scoped>
.item {
  // position: relative;
  width: 100%;
  height: 100%;

  border-radius: 10px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;

  .top {
    min-height: 30px;
    max-height: 30px;
    border-radius: 10px 10px 0px 0px;
    background-color: #fafafa;
    align-items: center;
    display: flex;
    gap: 10px;

    .title {
      display: flex;
      position: relative;
      user-select: none;
      left: 10px;
      align-items: center;
      height: 100%;
      gap: 3px;
      cursor: pointer;
      transition: 0.5s;
    }
  }

  .content {
    display: flex;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    flex-direction: column;

    .topsss {
      display: flex;
      flex-direction: column;
      position: relative;
      background-color: #ffffff;
      height: 100px;
      gap: 10px;
      padding: 15px 15px 0px 15px;
    }
  }
}

.question-content,
.question-tip {
  padding: 15px;
  height: auto;

  // 强制把最小高度和高度都设置为自适应
  :deep(.v-note-wrapper) {
    min-height: auto !important;
    height: auto !important;
  }

  :deep(.v-note-panel) {
    height: auto !important;
  }
}
</style>
