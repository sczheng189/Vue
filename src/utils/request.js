console.log('request.js is loaded!')  // 如果这行输出了，说明文件被加载

import axios from 'axios'

// 创建axios实例
const service = axios.create({
  timeout: 30000,
  baseURL: window.globalConfig?.baseAPI || process.env.VUE_APP_BASE_API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 创建增强版service
const enhancedService = {
  ...service,
  testConnection: async function() {
    try {
      console.log('开始测试连接...')
      // 使用实际存在的接口进行测试，比如用户信息接口
      const response = await service.get('/user/info')
      console.log('测试连接成功:', response)
      return response
    } catch (error) {
      console.error('测试连接失败:', error)
      throw error
    }
  }
}

// 请求拦截器
enhancedService.interceptors = service.interceptors
enhancedService.interceptors.request.use(
  config => {
    console.log('Request URL:', config.baseURL + config.url)
    console.log('Request Headers:', config.headers)
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('添加token到请求头:', token)
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
enhancedService.interceptors.response.use(
  response => {
    // console.log('响应拦截器被触发！')
    console.log('响应数据:', response)
    return response
  },
  error => {
    console.error('响应错误:', error)
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
      console.error('错误头信息:', error.response.headers)
      switch (error.response.status) {
        case 403:
          console.error('无权限访问')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 401:
          console.error('未授权访问')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        default:
          console.error('服务器错误:', error.response.status)
      }
    }
    return Promise.reject(error)
  }
)

export default enhancedService
