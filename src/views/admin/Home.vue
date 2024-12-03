<template>
  <el-container>
    <el-aside width="200px">
      <el-menu router>
        <el-menu-item index="/index">
          <i class="el-icon-s-home"></i>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/admin/adminLayout">
          <i class="el-icon-data-analysis"></i>
          <span>数据总览</span>
        </el-menu-item>
        <el-menu-item index="/admin/userManage">
          <i class="el-icon-user-solid"></i>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/productManage">
          <i class="el-icon-edit-outline"></i>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/logManage">
          <i class="el-icon-share"></i>
          <span>日志管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/deliveryManage">
          <i class="el-icon-s-goods"></i>
          <span>发货管理</span>
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
  name: 'AdminHome',
  data() {
    return {}
  }
}
</script>