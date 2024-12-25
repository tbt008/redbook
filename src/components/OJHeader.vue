<template>
  <div class="head-nav">
    <ul id="nav">
      <li v-for="(link, index) in links" :key="index" class="navbar">
        <a @click="handleClick(index)">{{ link.text }} </a>
      </li>
    </ul>
    <div class="header-user" @click="handleUser">
      <img v-if="userLogin" class="user-img" :src="userImg" alt="" />
      <el-avatar v-else class="user-img"> 未登录 </el-avatar>
    </div>
  </div>
</template>

<script lang="js" setup>
import request from '@/util/request'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const links = ref([
  { path: '/', text: '主页' },
  { path: '/problems', text: '题库' },
  { path: '/contest', text: '竞赛' },
  { path: '/discuss', text: '讨论' },
  { path: '/about', text: '关于' }
])
const userImg = ref(null)

const userLogin = () => {
  // 判断用户是否已登录
  if (localStorage.getItem('authToken') != null) {
    // 获取用户基本信息
    request.get('/user/get/user').then((res) => {
      if (res.code == 200) {
        userImg.value = res.data.avatar
        return true
      } else {
        ElMessage.error('用户登录过期！')
        return false
      }
    })
  } else {
    return false
  }
}
onMounted(() => {
  userLogin()
})
const handleClick = (index) => {
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
</script>

<style scoped>
.user-img {
  width: 40px;
  height: 40px;
  margin-right: 40px;
  margin-top: 7px;
  border-radius: 50%;
  display: flex;
}
.header-user {
  user-select: none;
  transition: all 0.6s;
}
.header-user :hover {
  transform: scale(1.1);
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
  color: rgb(122, 119, 119);
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
</style>
