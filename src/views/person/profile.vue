<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import request from '@/util/request'
import personMiddle from './personMiddle.vue'
import userProfileSubmitRecord from './userProfileSubmitRecord.vue'
const bgStyle = ref('#F7F8FA')
const userInfo = ref({})
const router = useRouter()
const loading = ref(true)
const nowTheme = ref(false)
const editInfo = ref(false)
const uid = ref(null)
const userId = localStorage.getItem('uid')
import { Plus } from '@element-plus/icons-vue'
const route = useRoute()
const onSubmit = () => {
  request
    .post('/user/update', {
      nickName: form.nickName,
      description: form.description,
      email: form.email,
      phoneNumber: form.phoneNumber,
      sex: form.sex
    })
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('更新成功')
        getUserInfo()
      } else {
        ElMessage.warning(res.msg)
      }
    })
    .catch((err) => {
      ElMessage.warning(err)
    })
}
const handleAvatarSuccess = (response, uploadFile) => {
  form.cover = uploadFile.url
}
const handleAvatarUpload = (file) => {
  const data = new FormData()
  var url = ''
  data.append('file', file)
  request
    .post('/api/file/upload?directory=avatar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      if (res.code == 200) {
        form.cover = res.data.url
        url = res.data.url

        request
          .post('/user/update/avatar', {
            cover: url
          })
          .then((res1) => {
            if (res1.code == 200) {
              ElMessage.success('更新成功')
            } else {
              ElMessage.error(res1.msg)
            }
          })
          .catch(() => {
            ElMessage.error('更新失败')
          })
      } else {
        ElMessage.error(res.msg)
      }
    })
}
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 4) {
    ElMessage.error('Avatar picture size can not exceed 4MB!')
    return false
  }
  handleAvatarUpload(rawFile)
  return true
}
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'

const form = reactive({
  nickName: '',
  description: '',
  email: '',
  phoneNumber: '',
  cover: '',
  sex: '0'
})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const getCodeRecord = () => {
  // 判断是否为当前登录用户
  const loginUserId = localStorage.getItem('uid')
  if (loginUserId !== uid.value) {
    return
  }

  request
    .post('/record/get/all', {
      pageStart: currentPage.value,
      pageSize: pageSize.value
    })
    .then((res) => {
      if (res.code == 200) {
        codeRecord.value = res.data.list
        total.value = res.data.total
      } else {
        ElMessage.error('用户提交记录异常！')
      }
    })
}
const getUserInfo = () => {
  request.get(`/user/get/${uid.value}`).then((res) => {
    if (res.code == 200) {
      userInfo.value = res.data
      form.nickName = res.data.nickName
      form.email = res.data.email
      form.description = res.data.description
      form.phoneNumber = res.data.phoneNumber
      form.cover = res.data.avatar
      if (res.data.sex == '男') {
        form.sex = 0
      } else if (res.data.sex == '女') {
        form.sex = 1
      } else {
        form.sex = 3
      }

      loading.value = false
    } else {
      ElMessage.error('用户登录异常！')
    }
  })
}
const starArticles = ref([])
const browseHistory = ref([])

const getStarArticles = () => {
  // 判断是否为当前登录用户
  const loginUserId = localStorage.getItem('uid')
  if (loginUserId !== uid.value) {
    return
  }

  // 检查是否登录
  const token = localStorage.getItem('auth-token')
  if (!token) {
    console.log('未登录，跳过获取收藏')
    return
  }

  // 使用UserCenterController的API
  request({
    method: 'get',
    url: '/userCenter/collections',
    params: {
      pageNum: 1,
      pageSize: 100
    }
  }).then((res) => {
    if (res.code === 200) {
      starArticles.value = res.data.list || []
    } else {
      ElMessage.error('获取收藏失败: ' + res.message)
    }
  }).catch((err) => {
    console.error('获取收藏失败', err)
  })
}

const getBrowseHistory = () => {
  // 判断是否为当前登录用户
  const loginUserId = localStorage.getItem('uid')
  if (loginUserId !== uid.value) {
    return
  }

  // 检查是否登录
  const token = localStorage.getItem('auth-token')
  if (!token) {
    console.log('未登录，跳过获取浏览历史')
    return
  }

  // 使用UserCenterController的API
  request({
    method: 'get',
    url: '/userCenter/browseHistory',
    params: {
      pageNum: 1,
      pageSize: 100
    }
  }).then((res) => {
    if (res.code === 200) {
      browseHistory.value = res.data.list || []
    } else {
      ElMessage.error('获取浏览历史失败: ' + res.message)
    }
  }).catch((err) => {
    console.error('获取浏览历史失败', err)
  })
}

// 内容类型标签颜色映射
const getContentTypeTag = (item) => {
  // 判断是景点、美食还是酒店
  if (item.address && item.rating) {
    if (item.price && item.price > 100) {
      return 'danger' // 酒店
    } else if (item.cuisine) {
      return 'warning' // 美食
    } else {
      return 'success' // 景点
    }
  }
  return 'info' // 内容
}

// 内容类型名称映射
const getContentTypeName = (item) => {
  if (item.address && item.rating) {
    if (item.price && item.price > 100) {
      return '酒店'
    } else if (item.cuisine) {
      return '美食'
    } else {
      return '景点'
    }
  }
  return '内容'
}

// 处理浏览历史项点击
const handleBrowseItemClick = (item) => {
  // 根据类型跳转到不同页面
  if (item.address && item.rating) {
    if (item.price && item.price > 100) {
      router.push(`/hotel/${item.id}`)
    } else if (item.cuisine) {
      router.push(`/food/${item.id}`)
    } else {
      router.push(`/attraction/${item.id}`)
    }
  } else {
    router.push(`/content/${item.id}`)
  }
}

// 处理收藏项点击
const handleCollectionItemClick = (item) => {
  // 根据类型跳转到不同页面
  if (item.address && item.rating) {
    if (item.price && item.price > 100) {
      router.push(`/hotel/${item.id}`)
    } else if (item.cuisine) {
      router.push(`/food/${item.id}`)
    } else {
      router.push(`/attraction/${item.id}`)
    }
  } else {
    router.push(`/content/${item.id}`)
  }
}
//添加路由参数变化的监听
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      uid.value = newId
      // 重新获取数据
      getUserInfo()
      getCodeRecord()
      getStarArticles()
      getBrowseHistory()
    }
  }
)
onMounted(async () => {

  if (route.params.id) {
    uid.value = route.params.id
  }
  // console.log(uid.value)
  getUserInfo()
  getCodeRecord()
  getStarArticles()
  getBrowseHistory()
})
const codeRecord = ref([])
// 分页大小改变处理
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  getCodeRecord()
}
const token = localStorage.getItem('authToken')
// 当前页改变处理
const handleCurrentChange = async (val) => {
  currentPage.value = val
  getCodeRecord()
}
const goToSubmissionDetail = (row) => {
  router.push(`/submission/${row.submitId}`)
}

// 文章类型标签颜色映射函数
const getArticleTypeTag = (type) => {
  const types = {
    0: 'success',   // 算法文章
    1: 'warning',   // 题解文章
    2: 'info',      // 经验分享
    3: 'default',   // 杂谈
    4: 'danger',    // 竞赛
    5: 'primary'    // 算法模板
  }
  return types[type] || 'default'
}

// 文章类型名称映射函数
const getArticleTypeName = (type) => {
  const types = {
    0: '算法文章',
    1: '题解文章',
    2: '经验分享',
    3: '杂谈',
    4: '竞赛',
    5: '算法模板'
  }
  return types[type] || '未知类型'
}
const formatDate = (dateArray) => {
  if (!dateArray) return 'error'
  const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2])
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="containersss">
    <div class="itemss">
      <div class="top">
        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item variant="image"
              style="width: 120px; height: 120px; border-radius: 10px"></el-skeleton-item>
          </template>
          <template #default>
            <el-avatar :size="120" style="border-radius: 10px" :src="userInfo.avatar"></el-avatar>
            <div style="
                display: flex;
                position: relative;
                flex-direction: column;
                left: 20px;
                gap: 10px;
              " :style="nowTheme === true ? 'filter: invert(100%);' : 'filter: none;'">
              <span style="font-size: xx-large">{{ userInfo.nickName }}</span>
              <span style="font-size: small; color: gray">{{ userInfo.userName }}</span>
              <span style="font-size: small; color: black">学号：
                <span>{{ userInfo.uid }}</span>
              </span>
              <span style="font-size: small; color: black">班级：
                <span>{{ userInfo.className }}</span>
              </span>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div class="bottom" :style="nowTheme === true ? 'filter: invert(100%);' : 'filter: none;'">
        <div class="bottom-left">
          <div class="bottom-left-middle">
            <el-skeleton :loading="loading" animated>
              <template #template>
                <el-skeleton :rows="7"></el-skeleton>
              </template>
              <template #default>
                <div v-if="userInfo.description" style="font-size: 13px">个人简介:</div>

                <span>{{ userInfo.description }}</span>
                <div style="display: flex; position: relative; gap: 20px; align-items: center">
                  <svg t="1737706676789" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="4413" width="1em" height="1em">
                    <path
                      d="M815.25 80.23h-606.9c-111.86 0-202.87 91-202.87 202.88v470C5.48 865 96.5 956 208.35 956h606.89c111.87 0 202.88-91 202.88-202.88v-470c0.01-111.89-91-202.89-202.87-202.89zM706.43 449.74l213.14-229.11c11.03 18.34 17.76 39.56 17.76 62.49v379.13l-230.9-212.51z m108.82-288.71c14.84 0 28.89 3.05 42.06 7.92L511.79 540.34 166.3 168.95c13.17-4.87 27.22-7.92 42.05-7.92h606.9z m-711.21 59.6l213.13 229.11L86.28 662.25V283.12c0-22.92 6.73-44.15 17.76-62.49zM815.25 875.2h-606.9c-61.39 0-111.83-45.69-120.33-104.78l284.16-261.54 139.6 150.07L651.4 508.88l284.18 261.54c-8.5 59.09-58.95 104.78-120.33 104.78z"
                      fill="#333333" p-id="4414"></path>
                  </svg>
                  <span>{{ userInfo.email }}</span>
                </div>
                <div style="display: flex; position: relative; gap: 20px">
                  <svg t="1739430945673" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="1523" width="1em" height="1em">
                    <path
                      d="M217.856 94.677333c-36.608 14.762667-60.928 38.485333-96.597333 83.2-88.618667 111.232-9.386667 332.8 194.730666 535.210667l10.581334 10.368c192 184.576 434.986667 264.533333 527.701333 184.064l3.029333-2.816-1.450666 1.194667a249.301333 249.301333 0 0 0 64.042666-77.994667c33.152-64 24.149333-130.858667-41.173333-182.954667-94.037333-75.008-157.184-77.568-219.434667-20.48l-6.997333 6.570667-18.005333 17.834667c-7.808-1.621333-19.882667-7.338667-34.730667-16.896-29.610667-19.114667-66.517333-50.901333-108.586667-92.586667-41.941333-41.642667-74.069333-78.208-93.312-107.605333l-3.882666-6.101334a120.448 120.448 0 0 1-12.245334-24.832l-0.938666-3.413333 18.133333-17.92 6.613333-6.954667c57.472-61.738667 54.912-124.373333-20.650666-217.642666-51.328-63.36-109.653333-83.328-166.826667-60.245334z m99.925333 113.493334l11.221334 14.08c37.546667 48.682667 37.888 64.853333 16.384 89.258666l-8.32 8.874667-21.12 20.821333c-45.482667 45.056-25.258667 102.314667 41.856 181.205334l14.08 16.085333 15.232 16.682667 8.106666 8.533333 16.981334 17.621333 18.176 18.261334 9.258666 9.130666 18.090667 17.450667 17.408 16.298667c5.717333 5.205333 11.306667 10.24 16.810667 15.104l16.213333 13.909333c79.616 66.56 137.216 86.570667 182.698667 41.685333l21.034666-20.992 5.546667-5.248c24.277333-22.186667 39.296-25.301333 80.725333 3.968l12.586667 9.258667 14.250667 11.093333c31.232 24.917333 34.261333 47.573333 18.602666 77.781334a165.845333 165.845333 0 0 1-26.88 36.608l-7.253333 7.338666-5.546667 5.12-5.333333 4.650667c-14.421333 14.293333-69.888 15.658667-141.184-7.722667-90.709333-29.781333-189.994667-92.074667-280.746667-182.101333-177.109333-175.658667-241.408-355.413333-188.16-422.272 26.453333-33.194667 43.648-49.92 61.653334-57.173333 19.285333-7.808 38.570667-1.194667 67.626666 34.688z"
                      fill="#000000" p-id="1524"></path>
                  </svg>
                  <span>{{ userInfo.phoneNumber }}</span>
                </div>
                <div style="display: flex; position: relative; gap: 20px">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em"
                    fill="currentColor" class="w-full h-full text-label-2 dark:text-dark-label-2">
                    <path fill-rule="evenodd"
                      d="M16.008 12.124A1.017 1.017 0 0116 12V7.586l-1.121 1.121a1 1 0 11-1.415-1.414l2.829-2.829a1 1 0 011.414 0l2.828 2.829a1 1 0 11-1.414 1.414L18 7.586V12c0 .042-.003.083-.008.124A4.002 4.002 0 0117 20a4 4 0 01-.992-7.876zm-8.016-.248c.005.04.008.082.008.124v1h2a1 1 0 110 2H8v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h2v-1c0-.042.003-.083.008-.124A4.002 4.002 0 017 4a4 4 0 01.992 7.876zM7 10a2 2 0 100-4 2 2 0 000 4zm10 4a2 2 0 100 4 2 2 0 000-4z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <span>{{ userInfo.sex }}</span>
                </div>
                <div style="display: flex; position: relative; gap: 20px">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em"
                    fill="currentColor" class="w-full h-full text-label-2 dark:text-dark-label-2">
                    <path
                      d="M13.465 3.862a3 3 0 00-2.957-.048L2.61 8.122a1 1 0 000 1.756L5 11.18v6.27c0 .59.26 1.15.74 1.491 1.216.86 3.75 2.409 6.26 2.409s5.044-1.548 6.26-2.409c.48-.34.74-.901.74-1.491v-6.27l1.4-.98v4.7a.9.9 0 101.8 0V9.572a1 1 0 00-.493-.862l-8.242-4.848zM18.82 9l-5.862 3.198a2 2 0 01-1.916 0L5.18 9l5.862-3.198a2 2 0 011.916 0L18.82 9zM17 16.687a.937.937 0 01-.413.788c-.855.565-2.882 1.774-4.587 1.774-1.705 0-3.732-1.209-4.587-1.774A.936.936 0 017 16.687V12.27l3.562 1.945a3 3 0 002.876 0L17 12.27v4.417z">
                    </path>
                  </svg>
                  <span>{{ '莆田学院🏟️' }}</span>
                </div>
                <el-button type="primary" @click="editInfo = !editInfo" plain v-if="userId === uid">编辑信息</el-button>
              </template>
            </el-skeleton>
          </div>
          <!-- <div class="left-bottommore"> -->
          <!-- <el-skeleton :loading="loading" animated>
              <template #template>
                <el-skeleton :rows="7"></el-skeleton>
              </template> -->
          <!-- <template #default>
                <div style="display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#5AC8FA"
                    class="text-teal dark:text-dark-teal">
                    <path fill-rule="evenodd"
                      d="M5.438 4.417A1 1 0 016.251 4h11.498a1 1 0 01.813.417l3.952 5.512a1 1 0 01-.093 1.277l-8.982 9.304a2 2 0 01-2.878 0L1.58 11.206a1 1 0 01-.093-1.277l3.952-5.512zm2.27 4.876a1 1 0 00-1.415 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L12 13.586 7.707 9.293z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <div class="inner-style">
                    声望等级
                    <span style="color: gray; font-size: small">1</span>
                  </div>
                </div>
                <div style="display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#007AFF"
                    class="text-blue-s dark:text-dark-blue-s">
                    <path fill-rule="evenodd"
                      d="M1.104 12.444a1 1 0 010-.888c.13-.26.37-.693.722-1.241A18.85 18.85 0 013.88 7.652C6.184 5.176 8.896 3.667 12 3.667s5.816 1.509 8.119 3.985c.79.85 1.475 1.756 2.055 2.663.352.548.593.98.722 1.24a1 1 0 010 .89c-.13.26-.37.692-.722 1.24a18.848 18.848 0 01-2.055 2.663c-2.303 2.476-5.015 3.985-8.119 3.985s-5.816-1.509-8.119-3.985a18.846 18.846 0 01-2.055-2.663c-.352-.548-.593-.98-.722-1.24zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <div class="inner-style">
                    阅读总数
                    <span style="color: gray; font-size: small">0</span>
                  </div>
                </div>
                <div style="display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#00AF9B"
                    class="text-olive dark:text-dark-olive">
                    <path fill-rule="evenodd"
                      d="M7.04 9.11l3.297-7.419a1 1 0 01.914-.594 3.67 3.67 0 013.67 3.671V7.33h4.028a2.78 2.78 0 012.78 3.2l-1.228 8.01a2.778 2.778 0 01-2.769 2.363H5.019a2.78 2.78 0 01-2.78-2.78V11.89a2.78 2.78 0 012.78-2.78H7.04zm-2.02 2a.78.78 0 00-.781.78v6.232c0 .431.35.78.78.78H6.69V11.11H5.02z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <div class="inner-style">
                    获得点赞
                    <span style="color: gray; font-size: small">{{ userInfo.thumbNum }}</span>
                  </div>
                </div>
                <div style="display: flex; position: relative; gap: 20px; size: 24px; color: aqua">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="20" fill="#FFA116"
                    class="text-brand-orange dark:text-dark-brand-orange">
                    <path fill-rule="evenodd"
                      d="M11.394 2.074a2.5 2.5 0 011.212 0c.723.181 1.185.735 1.526 1.262.342.528.703 1.259 1.131 2.127l.392.795c.302.61.348.667.386.7a.498.498 0 00.086.063c.043.025.11.052.786.15l.877.128c.958.139 1.764.256 2.372.418.606.162 1.276.43 1.671 1.062a2.5 2.5 0 01.375 1.152c.052.744-.333 1.354-.728 1.841-.397.489-.98 1.058-1.674 1.733l-.634.619c-.489.476-.527.537-.548.583a.5.5 0 00-.033.101c-.01.05-.015.122.1.794l.15.873c.164.954.302 1.758.335 2.386.034.627-.014 1.346-.493 1.918-.263.314-.6.558-.98.712-.692.279-1.39.102-1.976-.124-.588-.226-1.309-.605-2.165-1.056l-.785-.412c-.603-.317-.674-.335-.724-.34a.497.497 0 00-.106 0c-.05.005-.12.023-.724.34l-.785.412c-.856.45-1.577.83-2.165 1.056-.585.226-1.284.403-1.976.124a2.5 2.5 0 01-.98-.712c-.48-.572-.527-1.291-.493-1.918.033-.628.171-1.431.335-2.386l.15-.873c.115-.672.11-.745.1-.794a.5.5 0 00-.033-.101c-.02-.046-.06-.107-.548-.583l-.634-.619c-.694-.675-1.277-1.244-1.674-1.733-.395-.487-.78-1.097-.728-1.841a2.5 2.5 0 01.375-1.152c.395-.633 1.065-.9 1.67-1.062.61-.162 1.415-.28 2.373-.418l.877-.128c.675-.098.743-.125.786-.15a.5.5 0 00.086-.062c.038-.034.084-.09.386-.701l.392-.795c.428-.868.789-1.599 1.131-2.127.341-.527.803-1.08 1.526-1.262z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <div class="inner-style">
                    获得收藏
                    <span style="color: gray; font-size: small">{{ userInfo.favourNum }}</span>
                  </div>
                </div>
              </template> -->
          <!-- </el-skeleton> -->
          <!-- </div> -->
          <!-- <div class="leidaChart"> -->
          <!-- <radarChart></radarChart> -->
          <!-- </div> -->
          <div style="font-weight: bold; margin-left: 15px ; margin-bottom:-15px">浏览历史</div>
          <div class="languageset">
            <div style="padding: 20px">
              <el-empty v-if="userId !== uid" description="无权查看" />
              <el-empty v-else-if="browseHistory.length === 0" description="暂无浏览记录" />
              <div v-else class="article-list-container">
                <div v-for="item in browseHistory" :key="item.id" class="article-item"
                  @click="handleBrowseItemClick(item)">
                  <div class="article-header">
                    <el-tag :type="getContentTypeTag(item)" class="article-type-tag" effect="light">
                      {{ getContentTypeName(item) }}
                    </el-tag>
                    <div class="article-title">{{ item.title || item.name }}</div>
                  </div>
                  <div class="article-info">
                    <span class="time">浏览于<br />{{ formatDate(item.createTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="font-weight: bold; margin-left: 15px ; margin-bottom:-15px; margin-top: 20px">收藏的内容</div>
          <div class="languageset">
            <div style="padding: 20px">
              <el-empty v-if="userId !== uid" description="无权查看" />
              <el-empty v-else-if="starArticles.length === 0" description="暂无收藏内容" />
              <div v-else class="article-list-container">
                <div v-for="item in starArticles" :key="item.id" class="article-item"
                  @click="handleCollectionItemClick(item)">
                  <div class="article-header">
                    <el-tag :type="getContentTypeTag(item)" class="article-type-tag" effect="light">
                      {{ getContentTypeName(item) }}
                    </el-tag>
                    <div class="article-title">{{ item.title || item.name }}</div>
                  </div>
                  <div class="article-info">
                    <span class="time">收藏于<br />{{ formatDate(item.createTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="editInfo" style="padding: 30px" class="updateInfo bottom-right">
          <el-form :model="form" label-width="auto" style="max-width: 600px">
            <el-form-item label="头像">
              <el-upload class="avatar-uploader" :show-file-list="false" :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload">
                <img v-if="form.cover" :src="form.cover" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="form.nickName" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phoneNumber" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.sex">
                <el-radio :value="0">男</el-radio>
                <el-radio :value="1">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="form.description" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">保存</el-button>
              <el-button @click="editInfo = !editInfo">关闭</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="bottom-right">
          <personTop></personTop>
          <div class="t2">
            <personMiddle></personMiddle>
          </div>
          <div class="t3" v-if="userId == uid">

            <userProfileSubmitRecord></userProfileSubmitRecord>
          </div>

          <div class="t4">
            <el-empty v-if="userId !== uid" description="无权查看" />
            <template v-else>
              <el-table :data="codeRecord" style="width: 100%" @row-click="goToSubmissionDetail" class="el-codeRecord">
                <el-table-column label="序号" prop="submitId"> </el-table-column>
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
                <el-table-column label="题目" prop="questionName">
                  <!-- <template #default="{ row }">
                  <a :href="`/question?id=${row.questionId}`" class="problem-title">
                    {{ row.questionName }}
                  </a>
                </template> -->
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
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                  :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                  @current-change="handleCurrentChange" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
<style lang="scss" scoped>
.updateInfo {
  padding: 30px;
  width: 300px;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: white;
  box-shadow: 0px 0px 5px 0px #e6e6e6;
  border-radius: 15px;
  height: 500px;
}

/* 题目标题样式 */
.problem-title {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.containersss {
  // width: 100vw;
  display: flex;
  align-items: center;
  flex-direction: column;
  // background-color: ;
  background-color: v-bind(bgStyle);
  // background-color: #0a84ff;
  // height: 1800px;

  // background-color: ;
  // background-image: linear-gradient(to right, #C9D6FF, #E2E2E2);
  // background-image: url('https://cdn.jsdelivr.net/gh/Alanyaeer/ImgSummary@master/img/202401072101651.webp');
  .top-tab {
    height: 50px;
    width: calc(100vw - 15px);
    // background-color: aquamarine;
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    position: fixed;
    z-index: 1;
    // position: relative;
    display: flex;
    // justify-content: space-between;
    align-items: center;

    .top-icon {
      color: gray;
      border-radius: 10px;
      padding: 5px 50px;
      cursor: pointer;
      transition: 0.5s;
      position: relative;
      left: 700px;
    }

    .top-icon:hover {
      color: rgb(67, 197, 91) !important;
      background-color: #d7d7d7;
    }
  }

  .itemss {
    position: relative;

    top: 50px;
    height: 1400px;
    width: 1200px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding: 0px 50px;
    margin-bottom: 100px;

    .sonstyle {
      padding: 14px 18px;
      border-radius: 5px;
      font-size: 16px;
      color: #8c8c8c;
      display: flex;
      width: 204px;
      height: 20px;
      text-decoration: none;
      gap: 8px;
    }

    .innerRouter {
      width: 768px;
      padding: 24px;
      height: 1071px;
      border-radius: 10px;
      background-color: white;
    }

    .sonstyle:hover {
      // color: ;
      background-color: #edeef0;
    }

    .sonstyle:active {
      color: #0a84ff;
    }

    .top {
      left: 15px;

      height: 100px;
      display: flex;
      position: relative;
      // background-color: aqua;
    }

    .bottom {
      display: flex;
      position: relative;
      width: 100%;
      left: 15px;
      height: 900px;
      gap: 15px;

      .bottom-left {
        background-color: #0a84ff;
        width: 300px;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 0px 10px;
        background-color: white;
        box-shadow: 0px 0px 5px 0px #e6e6e6;
        border-radius: 15px;
        gap: 20px;
        height: 1150px;

        // padding-bottom: 20px;
        .bottom-left-top {
          width: 300px;
          display: flex;
          padding: 25px 0px;
          position: relative;
          // justify-content: center;
          justify-content: space-around;

          .bot-top-item {
            display: flex;
            position: relative;
            height: 50px;
            padding-right: 40px;
            // justify-content: center;
            align-items: center;
            gap: 10px;
            flex-direction: column;
          }
        }

        .bottom-left-middle {
          padding: 30px 10px;
          position: relative;
          display: flex;
          gap: 20px;
          flex-direction: column;
          padding-bottom: 20px;
          border-bottom: 2px solid gainsboro;

          .button {
            width: 280px;
            height: 40px;
            display: flex;
            border-radius: 10px;
            position: relative;
            align-items: center;
            cursor: pointer;
            transition: 0.1s;
            justify-content: center;
          }

          .button:hover {
            scale: 1.02;
          }
        }

        .left-bottommore {
          padding: 0px 10px;
          position: relative;
          display: flex;
          gap: 20px;
          flex-direction: column;
          padding-bottom: 20px;

          .inner-style {
            display: flex;
            flex-direction: column;
            gap: 5px;
            color: black;
          }

          border-bottom: 2px solid gainsboro;
        }

        .languageset {
          // padding: 0px 10px;
          position: relative;
          display: flex;
          gap: 15px;
          flex-direction: column;

          max-height: 400px;
          overflow-y: auto;

          //最大高度和滚动
          // .article-list-container {
          //max-height: 800px; // 设置最大高度
          //overflow-y: auto; // 添加垂直滚动
          //padding-right: 5px; // 为滚动条预留空间
          // background-color: #0a84ff;

          // 滚动条样式
          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }

          &::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }

          &::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          // }
        }

        .leidaChart {
          position: relative;
          display: flex;
          justify-content: center;
          border-bottom: 2px solid gainsboro;

          // background-color: antiquewhite;
        }
      }

      .bottom-right {
        width: 800px;
        border-radius: 15px;
        padding: 0px 10px;
        margin-bottom: 20px;
        display: flex;
        position: relative;
        flex-direction: column;
        gap: 20px;

        // background-color: white;
        .t1 {
          box-shadow: 0px 0px 5px 0px #e6e6e6;
          width: 800px;
          height: 225px;
          min-height: 225px;
          border-radius: 15px;
          background-color: white;
        }

        .t2 {
          width: 800px;
          height: 200px;
          // min-height: 200px;
          // background-color: white;
          border-radius: 15px;
          gap: 20px;
          display: flex;
          position: relative;
        }

        .t3 {
          box-shadow: 0px 0px 5px 0px #e6e6e6;
          width: 800px;
          height: 200px;
          min-height: 200px;
          border-radius: 15px;
          gap: 10px;
          background-color: white;
        }

        .t4 {
          box-shadow: 0px 0px 5px 0px #e6e6e6;
          width: 800px;
          // top: 20px;
          justify-content: center;
          // max-height: 125px;
          position: relative;
          padding-top: 20px;
          padding-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          // height: 225px;
          border-radius: 15px;
          background-color: white;

          .el-codeRecord {
            width: 100%;
            max-height: 668px;
            overflow-y: auto;
          }
        }
      }
    }
  }
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.article-item {
  padding: 12px 0px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  .article-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .article-type-tag {
    font-size: 12px;
    padding: 2px 6px;
  }

  .article-title {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .article-info {
    font-size: 12px;
    color: #999;
    display: flex;
    gap: 15px;

    .author,
    .time {
      color: #666;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .time {
      margin-left: 20px;
      color: #999;
    }
  }
}
</style>
