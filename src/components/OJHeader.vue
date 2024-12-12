<template>
  <div class="head-nav">
    <ul id="nav">
      <li ref="links" v-for="(link, index) in links" :key="index" class="navbar">
        <a @click="handleClick(index)">{{ link.text }} </a>
      </li>
    </ul>
    <div class="header-user" @click="handleUser">
      <img v-if="userLogin" class="user-img" :src="userImg" alt="" />
      <el-avatar v-else class="user-img"> 未登录 </el-avatar>
    </div>
  </div>
</template>

<script>
import request from '@/util/request.ts'
export default {
  data() {
    return {
      links: [
        { path: '/', text: '主页' },
        { path: '/problems', text: '题库' },
        { path: '/contest', text: '竞赛' },
        { path: '/circle', text: '讨论' },
        { path: '/about', text: '关于' }
      ],
      controls: false,
      loop: true,
      volume: 1,
      userLogin: false,
      userImg: ''
    }
  },
  mounted() {
    // 判断用户是否已登录
    if (localStorage.getItem('authToken') != null) {
      // 获取用户基本信息
      request.get('/user/get/user').then((res) => {
        if (res.code == 200) {
          this.userImg = res.data.avatar
          this.userLogin = true
        } else {
          ElMessage.error('用户登录过期！')
        }
      })
    }
  },
  methods: {
    handleClick(index) {
      this.$router.push(this.links[index])
    },
    handleUser() {
      if (this.userLogin) {
        // 跳转个人中心
        this.$router.push('/user')
      } else {
        // 跳转登录页
        this.$router.push('/login')
      }
    }
  }
  // created() {
  //   window.onload = function () {
  //     document.onkeydown = function () {
  //       var e = window.event || arguments[0]

  //       if (e.keyCode == 123) {
  //         // alert('禁止F12')
  //         ElMessage.error('禁止F12!!!!! ')
  //         return false
  //       } else if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
  //         // alert('禁止Ctrl+Shift+I')

  //         return false
  //       } else if (e.ctrlKey && e.keyCode == 85) {
  //         // alert('禁止Ctrl+u')

  //         return false
  //       } else if (e.ctrlKey && e.keyCode == 83) {
  //         // alert('禁止Ctrl+s')

  //         return false
  //       }
  //     }

  //     // 屏蔽鼠标右键

  //     document.oncontextmenu = function () {
  //       // alert('禁止右键')

  //       return false
  //     }
  //   }
  // }
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
  height: 50px;
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
  height: 50px;
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
