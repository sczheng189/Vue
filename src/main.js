import Vue from 'vue'
import App from './App.vue'
import request from './utils/request'
import router from './router'

// 创建 Vue 实例
const app = new Vue({
    router,
    render: h => h(App)
})

// 直接将请求对象挂载到 Vue 原型上
Vue.prototype.$http = request


// 添加全局错误处理
Vue.config.errorHandler = function (err, vm, info) {
    console.error('Vue error:', err)
    console.error('Error info:', info)
}

// 挂载应用
app.$mount('#app')