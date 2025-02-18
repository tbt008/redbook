<template>
  <div class="head-nav">
    <ul id="nav">
      <li v-for="(link, index) in links" :class="{ active: link.active }" :key="index" class="navbar">
        <div>
          <a @click="handleClick(index)">{{ link.text }} </a>
        </div>
      </li>
    </ul>
    <div class="header-user">
      <div v-if="loading && userImg" class="user-menu-wrapper">
        <div class="user-actions">
          <div class="message-entry" @click="handleMessage">
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
              <el-icon :size="20">
                <Bell />
              </el-icon>
            </el-badge>
          </div>
          <img class="user-img" :src="userImg" alt="" @click="showMenu = !showMenu" />
        </div>
        <el-menu v-show="showMenu" class="user-menu" :class="{ show: showMenu }">
          <el-menu-item @click="handleCommand('space')">我的空间</el-menu-item>
          <!-- 是否是管理员 -->
          <el-menu-item v-if="isAdmin" @click="handleCommand('admin')">管理页面</el-menu-item>
          <el-menu-item @click="handleCommand('password')">修改密码</el-menu-item>
          <el-menu-item @click="handleCommand('logout')">退出登录</el-menu-item>
        </el-menu>
      </div>
      <div v-else @click="handleUser">
        <el-avatar class="user-img"> 未登录 </el-avatar>
      </div>
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="修改密码" width="400px" :close-on-click-modal="false">
    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleModifyPassword(passwordFormRef)">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="js" setup>
import request from '@/util/request'
import { onMounted, ref, watch, onUnmounted } from 'vue'
// import store from '@/views/var.js'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification, ElLoading } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
const router = useRouter()
const links = ref([
  { path: '/home', text: '主页', active: false },
  { path: '/problems', text: '题库', active: false },
  { path: '/contest', text: '竞赛', active: false },
  { path: '/discuss', text: '讨论', active: false },
  { path: '/about', text: '关于', active: false }
])
const passwordFormRef = ref(null)
// const props = defineProps({
//   loginUpdate: {
//     type: Boolean,
//     default: false
//   }
// })
const userImg = ref(null)
const loading = ref(false)
const showMenu = ref(false)
const dialogVisible = ref(false)
const isAdmin = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback() //回调函数 验证通过
        }
      },
      trigger: 'blur'
    }
  ]
}
const userLogin = () => {
  // 判断用户是否已登录
  if (localStorage.getItem('authToken') != null) {
    // 获取用户基本信息
    request.get('/user/get/user').then((res) => {
      if (res.code == 200) {
        //把头像存下来
        localStorage.setItem('avatar', res.data.avatar)
        // localStorage.setItem('uid', res.data.uid)
        // console.log(res.data.permissionList)
        // 判断是否为管理员 - 检查权限列表是否包含管理员权限码
        isAdmin.value = res.data.permissionList &&
          (res.data.permissionList.includes(5006) || res.data.permissionList.includes(5007))
        userImg.value = res.data.avatar
        loading.value = true
        return true
      } else {
        ElMessage.error('用户登录过期！')
        loading.value = true
        return false
      }
    })
  } else {
    loading.value = true
    return false
  }
}
const skip = (index) => {
  if (index != -1) {
    for (let i = 0; i < links.value.length; i++) {
      //前缀是否匹配
      if (i == index) {
        links.value[i].active = true
      } else {
        links.value[i].active = false
      }
    }
  } else {
    //导航栏高亮
    const path = router.currentRoute.value.path

    for (let i = 0; i < links.value.length; i++) {
      //前缀是否匹配
      if (path.startsWith(links.value[i].path)) {
        links.value[i].active = true
      } else {
        links.value[i].active = false
      }
    }
  }
}
onMounted(() => {
  userLogin()
  loading.value = true
  if (localStorage.getItem('authToken')) {
    startPolling()
    // 添加事件监听
    window.addEventListener('updateUnreadCount', getUnreadCount)
  }
})
// 监听路由变化
router.afterEach(() => {
  skip(-1)
  document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu-wrapper')
    if (userMenu && !userMenu.contains(e.target)) {
      showMenu.value = false
    }
  })
})
// loading服务
const showLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '页面加载中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })
  return loading
}
const handleClick = (index) => {
  const loading = showLoading()
  skip(index)
  router.push(links.value[index].path).finally(() => {
    loading.close()
  })
}
const handleUser = () => {
  const loading = showLoading()
  if (userImg.value != null) {
    router.push('/user').finally(() => {
      loading.close()
    })
  } else {
    router.push('/login').finally(() => {
      loading.close()
    })
  }
}
//监听loginUpdate
// watch(
//   () => props.loginUpdate,
//   (newValue) => {
//     if (newValue) {
//       userLogin()
//     }
//   }
// )
const handleModifyPassword = async (formEl) => {
  if (!formEl) return

  try {
    const valid = await formEl.validate()
    if (valid) {
      const res = await request.post('/user/modify/password', {
        uid: localStorage.getItem('uid'),
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      })

      if (res.code === 200) {
        ElMessage.success('密码修改成功，请重新登录')
        dialogVisible.value = false
        // 清空表单
        passwordForm.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        // 退出登录
        localStorage.removeItem('authToken')
        localStorage.removeItem('avatar')
        userImg.value = null
        router.push('/login')
      } else {
        ElMessage.error(res.msg || '修改失败')
      }
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  }
}
const handleCommand = (command) => {
  showMenu.value = false
  const loading = showLoading()

  if (command === 'space') {
    const id = localStorage.getItem('uid')
    router.push(`/user/${id}`).finally(() => {
      loading.close()
    })
  } else if (command === 'logout') {
    request.post('/user/logout').then((res) => {
      if (res.code === 200) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('avatar')
        userImg.value = null
        ElMessage.success('退出成功')
        router.push('/login').finally(() => {
          loading.close()
        })
      }
    }).catch(() => {
      loading.close()
    })
  } else if (command === 'password') {
    dialogVisible.value = true
    loading.close()
  } else if (command === 'admin') {
    router.push('/admin/problem').finally(() => {
      loading.close()
    })
  }
}

// 添加未读消息计数
const unreadCount = ref(0)
let pollTimer = null

// 添加新的响应式变量
const lastNotificationTime = ref(0)

const getUnreadCount = async () => {
  try {
    const res = await request.get('/user/Notice/unRead')
    if (res.code === 200) {
      unreadCount.value = res.data
      // 如果有未读消息，检查是否需要显示弹窗
      if (res.data > 0) {
        const now = Date.now()
        // 检查是否超过10分钟
        if (now - lastNotificationTime.value > 600000) {
          const messageRes = await request.get('/user/Notice/message/first')
          if (messageRes.code === 200) {
            ElNotification({
              title: messageRes.data.title,
              message: messageRes.data.content,
              type: 'info',
              duration: 5000
            })
            lastNotificationTime.value = now
          }
        }
      }
    }
  } catch (error) {
    console.error('获取未读消息失败:', error)
  }
}

// 处理消息点击
const handleMessage = () => {
  const loading = showLoading()
  router.push('/message').finally(() => {
    loading.close()
  })
}

// 开始轮询
const startPolling = () => {
  getUnreadCount() // 立即执行一次
  pollTimer = setInterval(getUnreadCount, 120000) // 每2分钟执行一次
}



onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
  // 移除事件监听
  window.removeEventListener('updateUnreadCount', getUnreadCount)
})
</script>

<style scoped>
.active {
  color: #0b66ef;
  /* border-bottom: rgb(42, 120, 234) 4px solid; */
}

.user-img {
  width: 30px;
  height: 30px;
  margin-right: 40px;
  margin-top: 5px;
  border-radius: 50%;
  display: flex;
  cursor: pointer;
}

.header-user {
  user-select: none;
  display: flex;
  align-items: center;
  height: 100%;
}

.head-ion {
  height: 100%;
  width: 30px;
  justify-content: center;
  align-items: center;
}

.head-nav {
  height: 6vh;
  /* 优先级 */
  border-bottom: 1px solid var(--el-border-color);
  z-index: 99;
  display: flex;
}

#nav {
  width: auto;
  margin: auto;
  z-index: 98;
  position: relative;
  border: none;
  border-radius: 10em;
  display: flex;
  list-style: none;

  /* padding: 10px; */
}

#nav li a {
  user-select: none;
  position: relative;
  padding: 1rem 3rem;
  font: 500 18px '优设标题黑';
  border: none;
  outline: none;
  /* color: rgb(70, 100, 180); */
  /* color: rgb(122, 119, 119); */
  display: inline-block;
  text-decoration: none;
  z-index: 3;
  /* 鼠标悬浮样式 */
  cursor: pointer;
}

.slide1,
.slide2 {
  position: absolute;
  display: inline-block;
  height: 6vh;
  /* border-radius: 5em; */
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1.05);
}

.slide1 {
  background-color: rgb(170, 190, 255);
  z-index: 2;
}

.slide2 {
  opacity: 0;
  background-color: rgba(170, 190, 255, 0.5);
  z-index: 1;
  box-shadow: 0 0 20px #ffffffaa inset;
}

.squeeze {
  transform: scale(0.9);
}

.user-menu-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.message-entry {
  margin: 11px 0px 0 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s;
}

.message-entry:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}



/* 下拉框样式 */
.user-menu {
  position: absolute;
  top: 40px;
  right: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background-color: white;
  min-width: 140px;
  padding: 8px 0;
  z-index: 2000;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu.show {
  opacity: 1;
  transform: translateY(0);
}

:deep(.el-menu) {
  border: none !important;
  border-radius: 8px;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  margin: 0 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
  color: var(--el-color-primary);
}
</style>
