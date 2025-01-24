<template>
  <div class="constest">
    <div class="constest-main">
      <div>
        <div class="contest-search">
          <el-form :inline="true">
            <el-form-item label="赛制" class="contest-search-type">
              <el-radio-group v-model="searchType">
                <el-radio value="">全部</el-radio>
                <el-radio value="1">IOI</el-radio>
                <el-radio value="2">ACM</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item class="contest-search-input">
              <el-input v-model="searchKeyword" placeholder="搜索比赛" clearable>
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>

        <span v-if="constestList.length" class="contest-title">进行中</span>
        <div class="contest-item" v-for="(item, index) in constestList" :key="index">
          <img :src="item.cover" alt="" class="contest-item-img" />
          <div style="width: 100%; margin-left: 20px">
            <div class="contest-item-title">
              {{ item.title }}
              <el-tag v-if="item.isPassword" :type="primary" effect="dark"><el-icon>
                  <Lock />
                </el-icon>密码</el-tag>
              <el-tag style="margin-left: 10px" v-if="item.isInvite" :type="success" effect="dark"><el-icon>
                  <key />
                </el-icon>邀请</el-tag>
              <el-tag style="margin-left: 10px" v-if="item.type == 1" :type="primary" effect="dark">IOI</el-tag>
              <el-tag style="margin-left: 10px" v-else :type="primary" effect="dark">ACM</el-tag>
              <el-tag style="margin-left: 10px" type="success" effect="dark">进行中</el-tag>
            </div>

            <div class="contest-item-info">
              <el-icon>
                <BellFilled />
              </el-icon>比赛时间:{{ item.startTime }}至{{ item.endTime }}
            </div>
            <div class="contest-item-info">
              <div>
                <el-icon>
                  <Promotion />
                </el-icon>
                主办方:ptuCode.com
              </div>
              <div>
                <el-icon>
                  <UserFilled />
                </el-icon>参与人数：{{ item.participationNumber }}
              </div>
              <div>语言:{{ item.language }}</div>
              <!-- <div>赛制:{{ item.contestType }}</div> -->
            </div>
          </div>
          <div class="apply-button">
            <el-button type="success" round style="width: 100px; height: 50px"
              @click="inputInfo(item.contestId)">进入</el-button>
          </div>
        </div>
        <span v-if="oldConstestList.length" class="contest-title">已结束</span>
        <div class="contest-item" v-for="(item, index) in oldConstestList" :key="index">
          <img :src="item.cover" alt="" class="contest-item-img" />
          <div style="width: 100%; margin-left: 20px">
            <div class="contest-item-title">
              {{ item.title }}
              <el-tag v-if="item.isPassword" :type="primary" effect="dark"><el-icon>
                  <Lock />
                </el-icon>密码</el-tag>
              <el-tag style="margin-left: 10px" v-if="item.isInvite" :type="success" effect="dark"><el-icon>
                  <key />
                </el-icon>邀请</el-tag>
              <el-tag style="margin-left: 10px" v-if="item.type == 1" :type="primary" effect="dark">IOI</el-tag>
              <el-tag style="margin-left: 10px" v-else :type="primary" effect="dark">ACM</el-tag>
              <el-tag style="margin-left: 10px" type="info" effect="dark">已结束</el-tag>
            </div>

            <div class="contest-item-info">
              <el-icon>
                <BellFilled />
              </el-icon>比赛时间:{{ item.startTime }}至{{ item.endTime }}
            </div>
            <div class="contest-item-info">
              <div>
                <el-icon>
                  <Promotion />
                </el-icon>
                主办方:ptuCode.com
              </div>
              <div>
                <el-icon>
                  <UserFilled />
                </el-icon>参与人数：{{ item.participationNumber }}
              </div>
              <div>语言:{{ item.language }}</div>
            </div>
          </div>
          <div class="apply-button">
            <el-button type="info" round style="width: 100px; height: 50px"
              @click="inputInfo(item.contestId)">回顾比赛</el-button>
          </div>
        </div>
        <!-- elementplus el-pagination: 分页器 -->
        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
            :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
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
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const getConstestList = async () => {
  let obj = {
    status: 0,
    title: searchKeyword.value || undefined,
    type: searchType.value || undefined,
    pageStart: 1,
    pageSize: 10000
  }
  request
    .post(`/contest/list`, obj)
    .then((res) => {
      if (res.code == 200) {
        constestList.value = res.data.list
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((error) => {
      ElMessage.error(error)
    })
  let obj1 = {
    status: 1,
    title: searchKeyword.value || undefined,
    type: searchType.value || undefined,
    pageStart: currentPage.value,
    pageSize: pageSize.value
  }
  request
    .post(`/contest/list`, obj1)
    .then((res) => {
      if (res.code == 200) {
        oldConstestList.value = res.data.list
        total.value = res.data.total
      } else {
        ElMessage.error(res.msg)
      }
    })
    .catch((error) => {
      ElMessage.error(error)
    })
}
onMounted(async () => {
  getConstestList()
})
// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  await getConstestList()
}

// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  await getConstestList()
}

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
.constest {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.constest-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.contest-search {
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  width: 100%;
}

.contest-search .el-form {
  display: flex;
  align-items: center;
  gap: 20px;
}

.contest-search-type .el-form-item__label {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.contest-search-input {
  flex: 1;
  margin-right: 0;
}

.contest-search-input .el-input {
  width: 100%;
}

.contest-title {
  display: inline-block;
  margin: 30px 0;
  font-size: 28px;
  font-weight: 600;
  position: relative;
  background: linear-gradient(135deg, #1a73e8 0%, #8c54ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-bottom: 8px;
}

.contest-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(135deg, #1a73e8 0%, #8c54ff 100%);
  border-radius: 2px;
}

.contest-item {
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
  border: 1px solid #e6e8eb;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.contest-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.contest-item-img {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
}

.contest-item-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.4;
}

.contest-item-info {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  color: #64748b;
}

.contest-item-info div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.apply-button {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.apply-button .el-button {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  height: auto;
}

.pagination-container {
  margin-top: 40px;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .contest-item {
    flex-direction: column;
  }

  .contest-item-img {
    width: 100%;
    height: 200px;
  }

  .apply-button {
    margin-top: 20px;
    justify-content: center;
  }

  .contest-item-info {
    flex-direction: column;
    gap: 12px;
  }

  .contest-search .el-form {
    flex-direction: column;
    align-items: stretch;
  }

  .contest-search-type,
  .contest-search-input {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
