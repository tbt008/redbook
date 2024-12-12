<template>
  <div class="constest">
    <div class="constest-main">
      <div>
        <div class="contest-search">
          <el-form-item label="赛制">
            <el-radio-group v-model="searchType">
              <el-radio value="">全部</el-radio>
              <el-radio value="1">IOI</el-radio>
              <el-radio value="2">ACM</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-input v-model="searchKeyword" placeholder="搜索" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <span class="contest-title">进行中</span>
        <div class="contest-item" v-for="(item, index) in constestList" :key="index">
          <img :src="item.cover" alt="" class="contest-item-img" />
          <div style="width: 100%; margin-left: 20px">
            <div class="contest-item-title">
              {{ item.title }}
              <el-tag v-if="item.isPassword" :type="primary" effect="dark"
                ><el-icon><Lock /></el-icon>密码</el-tag
              >
              <el-tag style="margin-left: 10px" v-if="item.isInvite" :type="success" effect="dark"
                ><el-icon><key /></el-icon>邀请</el-tag
              >
              <el-tag style="margin-left: 10px" v-if="item.type == 1" :type="primary" effect="dark"
                >IOI</el-tag
              >
              <el-tag style="margin-left: 10px" v-else :type="primary" effect="dark">ACM</el-tag>
            </div>

            <div class="contest-item-info">
              <el-icon><BellFilled /></el-icon>比赛时间:{{ item.startTime }}至{{ item.endTime }}
            </div>
            <div class="contest-item-info">
              <div>
                <el-icon><Promotion /></el-icon>
                主办方:ptuCode.com
              </div>
              <div>
                <el-icon><UserFilled /></el-icon>参与人数：{{ item.userNumber }}
              </div>
              <div>语言:{{ item.language }}</div>
              <!-- <div>赛制:{{ item.contestType }}</div> -->
            </div>
          </div>
          <div class="apply-button">
            <el-button
              type="success"
              round
              style="width: 100px; height: 50px"
              @click="inputInfo(item.id)"
              >进入</el-button
            >
          </div>
        </div>
        <span class="contest-title">已结束</span>
        <div class="contest-item" v-for="(item, index) in oldConstestList" :key="index">
          <img :src="item.cover" alt="" class="contest-item-img" />
          <div style="width: 100%; margin-left: 20px">
            <div class="contest-item-title">
              {{ item.title }}
              <el-tag v-if="item.isPassword" :type="primary" effect="dark"
                ><el-icon><Lock /></el-icon>密码</el-tag
              >
              <el-tag style="margin-left: 10px" v-if="item.isInvite" :type="success" effect="dark"
                ><el-icon><key /></el-icon>邀请</el-tag
              >
              <el-tag style="margin-left: 10px" v-if="item.type == 1" :type="primary" effect="dark"
                >IOI</el-tag
              >
              <el-tag style="margin-left: 10px" v-else :type="primary" effect="dark">ACM</el-tag>
            </div>

            <div class="contest-item-info">
              <el-icon><BellFilled /></el-icon>比赛时间:{{ item.startTime }}至{{ item.endTime }}
            </div>
            <div class="contest-item-info">
              <div>
                <el-icon><Promotion /></el-icon>
                主办方:ptuCode.com
              </div>
              <div>
                <el-icon><UserFilled /></el-icon>参与人数：{{ item.userNumber }}
              </div>
              <div>语言:{{ item.language }}</div>
              <!-- <div>赛制:{{ item.contestType }}</div> -->
            </div>
          </div>
          <div class="apply-button">
            <el-button
              type="info"
              round
              style="width: 100px; height: 50px"
              @click="inputInfo(item.id)"
              >回顾比赛</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/util/request.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const constestList = ref([])
const oldConstestList = ref([])
const searchType = ref('')
// -1 全部 0ioi 1acm
const searchKeyword = ref('')
const pageStart = 1
const pageSize = 10
const getConstestList = async () => {
  let obj = {
    status: 0,
    title: searchKeyword.value || undefined,
    type: searchType.value || undefined,
    pageStart: pageStart,
    pageSize: pageSize
  }
  request.post(`/contest/list`, obj).then((res) => {
    constestList.value = res.data.list
  })
  let obj1 = {
    status: 1,
    title: searchKeyword.value || undefined,
    type: searchType.value || undefined,
    pageStart: pageStart,
    pageSize: pageSize
  }
  request.post(`/contest/list`, obj1).then((res) => {
    oldConstestList.value = res.data.list
  })
}
onMounted(async () => {
  getConstestList()
})

watch(
  [searchType, searchKeyword],
  async () => {
    getConstestList()
  },
  { deep: true }
)
const inputInfo = (id) => {
  // 进入该比赛详情页
  router.push(`/contest/detail/${id}`)
}
</script>
<style>
.contest-search {
  /* display: flex; */
  background-color: rgb(244, 244, 244);
  padding: 20px;
  margin: 30px;
  width: 300px;
  border-radius: 10px;

  /* border: #002ef9 2px dashed; */
}
.contest-title {
  margin: 30px;
  font-size: 25px;
  border-bottom: #09f291 4px solid;
  background: linear-gradient(135deg, #002ef9 0%, #f700ff 100%);
  -webkit-background-clip: text; /*将设置的背景颜色限制在文字中*/
  -webkit-text-fill-color: transparent; /*给文字设置成透明*/
}
.apply-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: right;
}
.contest-item-title {
  font-size: 24px;
  margin: 10px;
}
.contest-item-info {
  margin: 0 20px 10px 0;
  min-width: 100px;
  width: auto;
  font-size: 14px;
  color: #86909b;
}
.contest-item-img {
  width: 150px;
  border-radius: 10px;
  display: flex;
}
.constest-main {
  width: 70%;
  margin: auto;
}
.contest-item {
  display: flex;
  margin: 30px;
  width: 100%;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgb(104, 240, 63);
}
.constest-main {
}
.constest {
  /* background-color: rgb(240, 245, 250); */
  width: 100%;
  height: 100%;
}
</style>
