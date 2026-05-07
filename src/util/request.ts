import axios from 'axios'

  
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 60000  // 增加到60秒，给AI足够的处理时间
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers['auth-token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    const errorMessage = res?.msg || res?.message || '请求失败'
    
    // 如果返回的状态码不是 200，则认为是错误
    if (res.code !== 200) {
      ElMessage.error(errorMessage)
      
      // 401: 未登录或 token 过期
      if (res.code === 401) {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
      }
      
      const handledError = new Error(errorMessage) as Error & { messageShown?: boolean }
      handledError.messageShown = true
      return Promise.reject(handledError)
    }
    
    return res
  },
  (error) => {
    console.error('请求错误：', error)
    
    if (error.response) {
      const serverMessage = error.response.data?.msg || error.response.data?.message
      const handledError = new Error(serverMessage || error.message || '请求失败') as Error & { messageShown?: boolean }
      handledError.messageShown = true
      switch (error.response.status) {
        case 401:
          ElMessage.error(serverMessage || '未登录或登录已过期，请重新登录')
          localStorage.removeItem('auth-token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error(serverMessage || '没有权限访问')
          break
        case 404:
          ElMessage.error(serverMessage || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(serverMessage || '服务器错误')
          break
        default:
          ElMessage.error(serverMessage || '请求失败')
      }
      return Promise.reject(handledError)
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default request
