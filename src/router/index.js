import Vue from 'vue';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(VueRouter);
Vue.use(ElementUI);

const routes = [
  // 基础路由
  {
    path: '/',
    redirect: '/index'  // 默认重定向到登录页
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/register/register.vue')
  },
     //首页
  {
        path: '/index',  
        name: '首页',
        component: () => import('../views/user/index.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/Home.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },

    children: [
      {
        path: 'adminLayout',  // 相对路径，最终路径为 /admin/layout
        name: '数据总览',
        icon: 'el-icon-data-analysis',
        component: () => import('../views/admin/MainData.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'userManage',  // 相对路径，最终路径为 /admin/users
        name: '用户管理',
        icon: 'el-icon-user-solid',
        component: () => import('../views/admin/UserManage.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'productManage',  // 相对路径，最终路径为 /admin/productManage
        name: '公告管理',
        icon: 'el-icon-edit-outline',
        component: () => import('../views/admin/productManage.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'logManage',  // 相对路径，最终路径为 /admin/categories
        name: '日志管理',
        icon: 'el-icon-user',
        component: () => import('../views/admin/LogManage.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'deliveryManage',  // 相对路径，最终路径为 /admin/deliveryManage
        name: '发货管理',
        icon: 'el-icon-s-goods',
        component: () => import('../views/admin/deliveryManage.vue'),
        meta: {
          requiresAuth: true,
        }
      }
    ]
  },
 

  // user路由组
  {
    path: '/user',
    component: () => import('../views/user/Home.vue'),
    meta: {
      requiresAuth: true,
      role: 'user'
    },
    children: [
    
      {
        path: 'my',  // 相对路径，最终路径为 /user/my
        name: '个人中心',
        component: () => import('../views/user/myInfo.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'logs',  // 相对路径，最终路径为 /user/logs
        name: '我的问卷',
        icon: 'el-icon-edit-user',
        component: () => import('../views/user/myLog.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'purchaseLogs',  // 相对路径，最终路径为 /user/purchaseLogs
        name: '购买记录',
        icon: 'el-icon-view',
        component: () => import('../views/user/purchaseLogs.vue'),
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'shopCart',  // 相对路径，最终路径为 /user/shopCart
        name: '购物车',
        icon: 'el-icon-shopping-cart-full',
        component: () => import('../views/user/shopCart.vue'),
        meta: {
          requiresAuth: true,
        }
      }
    ]
  }
];

const router = new VueRouter({
  routes,
  // mode: 'history'
});

// 路由守卫
router.beforeEach((to, from, next) => {
    // 获取token和用户角色
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')  // 在登录时保存用户角色
    
    // 判断是否需要登录权限
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            // 没有token，跳转到登录页
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            // 判断用户角色
            if (to.meta.requiresAdmin && Number(userRole) !== 1) {
                next({ path: '/index' })  // 无权限页面
            } else {
                next()
            }
        }
    } else {
        next()
    }
})

export default router;