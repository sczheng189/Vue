<template>
  <el-container>
    <el-aside width="200px">
      <el-menu router>
        <el-menu-item index="/index">
          <i class="el-icon-question"></i>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/user/shopCart">
          <i class="el-icon-shopping-cart-full"></i>
          <span>购物车</span>
        </el-menu-item>
        <el-menu-item index="/user/logs">
          <i class="el-icon-view"></i>
          <span>浏览记录</span>
        </el-menu-item>
        <el-menu-item index="/user/purchaseLogs">
          <i class="el-icon-view"></i>
          <span>购买记录</span>
        </el-menu-item>
        <el-menu-item index="/user/my">
          <i class="el-icon-user"></i>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'UserHome',
  // ...
}
</script>