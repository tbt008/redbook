<template>
  <div class="constest">
    <div class="constest-main">
      <div class="contest-layout">
        <!-- 左侧比赛列表 -->
        <div class="contest-content">
          <!-- 进行中的比赛容器 -->
          <div class="contest-container" v-if="constestList.length">
            <div class="contest-list">
              <div class="contest-section">
                <span class="contest-title">进行中</span>
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
                      <el-tag style="margin-left: 10px"
                        :type="new Date(item.startTime) > new Date() ? 'warning' : 'success'" effect="dark">
                        {{ new Date(item.startTime) > new Date() ? '待开始' : '进行中' }}
                      </el-tag>
                    </div>

                    <div class="contest-item-info">
                      <el-icon>
                        <BellFilled />
                      </el-icon>比赛时间 : {{ item.startTime }} 至 {{ item.endTime }}
                    </div>
                    <div class="contest-item-info" style="display: flex; justify-content: flex-start; gap: 40px;">
                      <div>
                        <el-icon>
                          <Promotion />
                        </el-icon> 主办方 : cubecode.cn

                      </div>
                      <div>
                        <el-icon>
                          <UserFilled />
                        </el-icon> 参与人数 ：{{ item.participationNumber }}
                      </div>
                    </div>
                    <div class="contest-item-info">
                      语言 : {{ item.language }}
                    </div>
                  </div>
                  <div class="apply-button">
                    <el-button type="success" round style="width: 100px; height: 50px"
                      @click="inputInfo(item.contestId)">进入</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 已结束的比赛容器 -->
          <div class="contest-container" v-if="oldConstestList.length">
            <div class="contest-list">
              <div class="contest-section">
                <span class="contest-title">已结束</span>
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
                      </el-icon>
                      <span>比赛时间: {{ item.startTime }} 至 {{ item.endTime }}</span>
                    </div>
                    <div class="contest-item-info" style="display: flex; justify-content: flex-start; gap: 40px;">
                      <div>
                        <el-icon>
                          <Promotion />
                        </el-icon>
                        主办方:CubeCode.cn
                      </div>
                      <div>
                        <el-icon>
                          <UserFilled />
                        </el-icon>参与人数：{{ item.participationNumber }}
                      </div>
                    </div>
                    <div class="contest-item-info">
                      语言:{{ item.language }}
                    </div>
                  </div>
                  <div class="apply-button">
                    <el-button type="info" round style="width: 100px; height: 50px"
                      @click="inputInfo(item.contestId)">回顾比赛</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页器 -->
            <div class="pagination-container">
              <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
            </div>
          </div>
        </div>

        <!-- 右侧区域 -->
        <div class="contest-sidebar">
          <!-- 进行中的比赛列表 -->
          <div class="ongoing-contests">
            <h3 class="sidebar-title">进行中的比赛</h3>
            <div class="contest-links">
              <div v-for="(item, index) in constestList" :key="index" class="contest-link"
                @click="inputInfo(item.contestId)">
                <span class="contest-name">{{ item.title }}</span>
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
              <div v-if="!constestList.length" class="no-contests">
                暂无进行中的比赛
              </div>
            </div>
          </div>

          <!-- 筛选区域 -->
          <div class="filter-card">
            <h3>筛选比赛</h3>
            <div class="filter-section">
              <div class="filter-item">
                <label>赛制</label>
                <el-radio-group v-model="searchType">
                  <el-radio value="">全部</el-radio>
                  <el-radio value="1">IOI</el-radio>
                  <el-radio value="2">ACM</el-radio>
                </el-radio-group>
              </div>
              <div class="filter-item">
                <label>搜索</label>
                <el-input v-model="searchKeyword" placeholder="搜索比赛" clearable>
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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

.contest-layout {
  display: flex;
  gap: 24px;
}

.contest-content {
  flex: 1;
}

.contest-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}



.filter-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.filter-section {
  margin-top: 16px;
}

.filter-item {
  margin-bottom: 16px;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1f2937;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

.no-contest {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
}

.contest-title {
  display: inline-block;
  margin: 0px 0 30px 0;
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
  padding: 20px 24px;
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
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: #64748b;
}

.contest-item-info .el-icon {
  margin-right: 4px;
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
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 左侧容器样式 */
.contest-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.contest-section {
  margin-bottom: 0;
}

/* 右侧比赛列表样式 */
.ongoing-contests {
  background-color: #fff;
  border-radius: 12px;
  padding: 10px 20px 10px 20px;
  margin-bottom: 0px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.contest-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contest-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contest-link:hover {
  background-color: #f3f4f6;
}

.contest-name {
  flex: 1;
  font-size: 14px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-contests {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .contest-layout {
    flex-direction: column;
  }

  .contest-sidebar {
    width: 100%;
    order: -1;
  }

  .contest-container {
    margin-bottom: 24px;
  }
}
</style>

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
const nextContest = ref(null)

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
  await Promise.all([getConstestList()])
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
