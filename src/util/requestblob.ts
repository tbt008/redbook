import axios from 'axios';
import { ElMessage } from 'element-plus';

const requestBlob = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 60000,
  responseType: 'blob', // 默认 responseType 为 blob
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

// 添加拦截器处理响应
requestBlob.interceptors.response.use(
  (response) => {
    // 检查是否是有效的文件流
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/octet-stream')) {
      ElMessage.error('下载失败，服务器未返回文件流！');
      return Promise.reject(new Error('Invalid file stream'));
    }
    return response; // 返回完整的 response 对象
  },
  (error) => {
    ElMessage.error('文件下载请求失败！');
    return Promise.reject(error);
  }
);

// 添加请求拦截器，动态添加 token
requestBlob.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['auth-token'] = `Bearer ${token}`; // 根据后端需要设置 token
  }
  return config;
});

export default requestBlob;
