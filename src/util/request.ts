import axios from 'axios'
import router from '@/router/index' // 修改这里
import { ElMessage } from 'element-plus'
import { debounce } from '@/utils/optimizeUtils'
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 60000,
  withCredentials: true, // 允许跨域请求携带cookies和认证信息
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})
// 定义 API 返回的数据结构

declare module 'axios' {
  interface ApiResponse<T> {
    code: number
    msg: string
    data: T
  }
}
const errInfo = debounce(() => {
  ElMessage.error('登录状态已过期，请重新登录！')
}, 3000)
request.interceptors.response.use(
  (response) => {
    if (response.data) {
      return response.data
    }
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 返回 401 清除token信息并跳转到登录页面
      localStorage.removeItem('auth-token')

      errInfo()
      // router.push('/login')
    }

    return Promise.reject(error)
  }
)
request.interceptors.request.use((config) => {
  // 动态设置授权头（示例）
  const token = getAuthToken() // 你需要实现这个函数来获取 token
  if (token) {
    config.headers['auth-Token'] = `Bearer ${token}`
  }
  else {
    // 移除 auth-Token 字段
    if (config.headers.hasOwnProperty('auth-token')) {
      // console.log('删除');
      delete config.headers['auth-token'];
    }
  }
  // 打印请求URL，验证参数是否正确添加到URL中
  if (config.url && config.url.includes('/contest/record/get/all')) {
    console.log('Request URL:', config.baseURL + config.url);
    console.log('Request params:', config.params);
  }
  return config
})
function getAuthToken() {
  const token = localStorage.getItem('authToken')
  if (token) {
    return token
  }
  return null
}

export { getAuthToken }
export default request
