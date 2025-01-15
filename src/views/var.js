import { reactive } from 'vue'

// 创建一个响应式状态对象
const state = reactive({
  islogin: false
})

// 创建一个改变登录状态的函数
const changeLoginStatus = (value) => {
  state.islogin = value
}

// 导出 store 对象，包含状态和方法
const store = {
  state, // 导出状态对象
  changeLoginStatus // 导出改变状态的函数
}

export default store
