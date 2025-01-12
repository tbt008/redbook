<template>
  <div class="head-nav">
    <ul id="nav">
      <li
        v-for="(link, index) in links"
        :class="{ active: link.active }"
        :key="index"
        class="navbar"
      >
        <div>
          <a @click="handleClick(index)">{{ link.text }} </a>
        </div>
      </li>
    </ul>
    <div class="header-user">
      <div v-if="loading && userImg" class="user-menu-wrapper">
        <img class="user-img" :src="userImg" alt="" @click="showMenu = !showMenu" />
        <el-menu v-show="showMenu" class="user-menu" :class="{ show: showMenu }">
          <el-menu-item @click="handleCommand('space')">我的空间</el-menu-item>
          <el-menu-item @click="handleCommand('logout')">退出登录</el-menu-item>
        </el-menu>
      </div>
      <div v-else @click="handleUser">
        <el-avatar class="user-img"> 未登录 </el-avatar>
      </div>
    </div>
  </div>
</template>

<script lang="js" setup>
import request from '@/util/request'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const links = ref([
  { path: '/', text: '主页', active: false },
  { path: '/problems', text: '题库', active: false },
  { path: '/contest', text: '竞赛', active: false },
  { path: '/discuss', text: '讨论', active: false },
  { path: '/about', text: '关于', active: false }
])
const userImg = ref(null)
const loading = ref(false)
const showMenu = ref(false)
const userLogin = () => {
  // 判断用户是否已登录
  if (localStorage.getItem('authToken') != null) {
    // 获取用户基本信息
    request.get('/user/get/user').then((res) => {
      if (res.code == 200) {
        //把头像存下来
        localStorage.setItem('avatar', res.data.avatar)
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
    // alert(path)
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
  skip(-1)
  document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu-wrapper')
    if (userMenu && !userMenu.contains(e.target)) {
      showMenu.value = false
    }
  })
})
const handleClick = (index) => {
  skip(index)
  router.push(links.value[index])

  // this.$router.push(links.value[index])
}
const handleUser = () => {
  if (userImg.value != null) {
    // 跳转个人中心
    router.push('/user')
    // this.$router.push('/user')
  } else {
    // 跳转登录页
    router.push('/login')
    // this.$router.push('/login')
  }
}
const handleCommand = (command) => {
  showMenu.value = false
  if (command === 'space') {
    router.push('/user')
  } else if (command === 'logout') {
    request.post('/user/logout').then((res) => {
      if (res.code === 200) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('avatar')
        userImg.value = null
        ElMessage.success('退出成功')
        router.push('/login')
      }
    })
  }
}
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
  margin-top: 10px;
  border-radius: 50%;
  display: flex;
}
.header-user {
  user-select: none;
  /* transition: all 0.6s; */
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
