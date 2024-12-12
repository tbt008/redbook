<template>
  <section class="container">
    <div class="svg-top">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        height="1337"
        width="1337"
      >
        <defs>
          <path
            id="path-1"
            opacity="1"
            fill-rule="evenodd"
            d="M1337,668.5 C1337,1037.455193874239 1037.455193874239,1337 668.5,1337 C523.6725684305388,1337 337,1236 370.50000000000006,1094 C434.03835568300906,824.6732385973953 6.906089672974592e-14,892.6277623047779 0,668.5000000000001 C0,299.5448061257611 299.5448061257609,1.1368683772161603e-13 668.4999999999999,0 C1037.455193874239,0 1337,299.544806125761 1337,668.5Z"
          />
          <linearGradient id="linearGradient-2" x1="0.79" y1="0.62" x2="0.21" y2="0.86">
            <stop offset="0" stop-color="rgb(88,62,213)" stop-opacity="1" />
            <stop offset="1" stop-color="rgb(23,215,250)" stop-opacity="1" />
          </linearGradient>
        </defs>
        <g opacity="1">
          <use xlink:href="#path-1" fill="url(#linearGradient-2)" fill-opacity="1" />
        </g>
      </svg>
    </div>
    <div class="svg-bottom">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        height="896"
        width="967.8852157128662"
      >
        <defs>
          <path
            id="path-2"
            opacity="1"
            fill-rule="evenodd"
            d="M896,448 C1142.6325445712241,465.5747656464056 695.2579309733121,896 448,896 C200.74206902668806,896 5.684341886080802e-14,695.2579309733121 0,448.0000000000001 C0,200.74206902668806 200.74206902668791,5.684341886080802e-14 447.99999999999994,0 C695.2579309733121,0 475,418 896,448Z"
          />
          <linearGradient id="linearGradient-3" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0" stop-color="rgb(40,175,240)" stop-opacity="1" />
            <stop offset="1" stop-color="rgb(18,15,196)" stop-opacity="1" />
          </linearGradient>
        </defs>
        <g opacity="1">
          <use xlink:href="#path-2" fill="url(#linearGradient-3)" fill-opacity="1" />
        </g>
      </svg>
    </div>
    <section class="wrapper">
      <header>
        <div class="logo">
          <span>Logo</span>
        </div>
        <h1>Welcome back!</h1>
        <p>User Login</p>
      </header>
      <section class="main-content">
        <form action="">
          <input v-model="id" type="username" placeholder="用户名" />
          <!-- <div class="line"></div> -->
          <input v-model="password" type="password" placeholder="密码" />

          <input type="button" class="login-button" value="Login" @click="login" />
        </form>
      </section>
      <footer>
        <p><a href="" title="Forgot Password">Forgot Password?</a></p>
        <p><a href="" title="Register">Register</a></p>
      </footer>
    </section>
  </section>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/util/request'
import { useRouter } from 'vue-router'

const router = useRouter()

const id = ref()
const password = ref('')
const login = async () => {
  let obj = {
    uid: id.value,
    password: password.value
  }
  request.post('/user/login', obj).then((res) => {
    if (res.code == 200) {
      //保存jwt
      localStorage.setItem('authToken', res.data)
      ElMessage.success('登录成功！欢迎回来!')
      router.go(-1)
    } else {
      ElMessage.error(res.msg)
    }
  })
}
</script>
<style lang="scss" scoped>
input {
  border-bottom: 1px solid var(--el-border-color);
}
.container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
  margin: 0 0 0 0;
  width: 100%;
  .svg-top {
    position: absolute;
    top: -900px;
    right: -300px;
  }
  .svg-bottom {
    position: absolute;
    bottom: -500px;
    left: -200px;
  }
  .wrapper {
    padding: 40px;
    background-color: #fff;
    border-radius: 20px;
    width: 350px;
    border: 1px solid rgb(36, 184, 242);
    z-index: 1;
    header {
      margin-bottom: 40px;
      .logo {
        width: 70px;
        height: 70px;
        border-radius: 50px;
        background-color: #6065d9;
        display: flex;
        justify-content: center;
        align-items: center;
        span {
          font-size: 18px;
          color: #fff;
        }
      }
      h1 {
        color: #6065d9;
        font-size: 35px;
        font-weight: 500;
        margin-bottom: 0;
        margin-top: 40px;
      }
      p {
        color: #6065d9;
        font-size: 18px;
        font-weight: 300;
        margin: 5px 0 0 0;
      }
    }
    .main-content {
      input {
        border: none;
        display: block;
        width: 100%;
        height: 50px;
        margin: 15px 0;
        font-size: 18px;
        color: #999;
        &::placeholder {
          color: #999;
          font-size: 18px;
          font-weight: 300;
        }
        &:focus {
          outline: none;
        }
      }
      .line {
        width: 100%;
        height: 2px;
        background-color: #99999955;
      }
      .login-button {
        background: linear-gradient(to right, #6065d9, #17d7fa);
        border: none;
        border-radius: 50px;
        font-size: 18px;
        font-weight: 300;
        color: #fff;
        display: block;
        width: 100px;
        height: 40px;
        margin: 0 auto;
        outline: none;
        cursor: pointer;
      }
    }
    footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 60px;
      p {
        margin: 0;
        font-weight: 100;
        a {
          color: #6065d9;
          text-decoration: none;
        }
      }
    }
  }
}

@media (min-width: 320px) and (max-width: 768px) {
  .wrapper {
    margin: 0 10px !important;
    padding: 30px;
    header {
      h1 {
        font-size: 30px;
      }
    }
  }
}
</style>
