<template>
  <div class="user-log-manage">
    <el-card>
      <!-- 搜索栏 -->
      <div class="search-box">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="日志类型">
            <el-select v-model="searchForm.logType" placeholder="请选择日志类型" clearable>
              <el-option label="浏览记录" value="0"></el-option>
              <el-option label="购买记录" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 日志列表 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="浏览记录" name="0">
          <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
            <el-table-column label="用户名" width="120">
              <template slot-scope="scope">
                {{ getUserName(scope.row.userId) }}
              </template>
            </el-table-column>
            <el-table-column prop="productId" label="商品ID" width="120">
              <template slot-scope="scope">
                <el-link type="primary" :href="`/product/${scope.row.productId}`" target="_blank">{{ scope.row.productId
                  }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="timestamp" label="浏览时间" width="180">
              <template slot-scope="scope">
                {{ formatTime(scope.row.timestamp) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="购买记录" name="1">
          <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
            <el-table-column label="用户名" width="120">
              <template slot-scope="scope">
                {{ getUserName(scope.row.userId) }}
              </template>
            </el-table-column>
            <el-table-column prop="productId" label="商品ID" width="120">
              <template slot-scope="scope">
                <el-link type="primary" :href="`/product/${scope.row.productId}`" target="_blank">{{ scope.row.productId
                  }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="timestamp" label="购买时间" width="180">
              <template slot-scope="scope">
                {{ formatTime(scope.row.timestamp) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
        :page-sizes="[10, 20, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"
        style="margin-top: 20px">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: '0',
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,
      searchForm: {
        username: '',
        logType: ''
      },
      userMap: {}  // 用于存储用户ID和用户名的映射
    }
  },
  methods: {
    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.pageSize = val
      this.page = 1  // 重置到第一页
      this.fetchData()  // 重新获取数据
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.page = val
      this.fetchData()  // 重新获取数据
    },

    // 获取数据
    async fetchData() {
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          actionType: parseInt(this.activeTab),
          username: this.searchForm.username,  // 如果有搜索条件
          logType: this.searchForm.logType     // 如果有搜索条件
        }
        console.log('发送请求参数:', params)

        const res = await this.$http.get('/log', { params })
        if (res.data.code === 200) {
          this.tableData = res.data.data.rows
          this.total = res.data.data.total
          await this.fetchUserInfo()
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const userIds = [...new Set(this.tableData.map(item => item.userId))]
        for (const id of userIds) {
          if (!this.userMap[id]) {
            const res = await this.$http.get(`/admin/userManage/${id}`)
            if (res.data.code === 200) {
              this.$set(this.userMap, id, res.data.data.username)
            }
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    // 获取用户名
    getUserName(userId) {
      return this.userMap[userId] || userId
    },

    // 标签页切换处理
    handleTabChange(tab) {
      console.log('切换到标签页:', tab.name)
      this.page = 1
      this.fetchData()
    },

    // 格式化时间戳
    formatTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString()
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style scoped>
.user-log-manage {
  padding: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 0;
}
</style>
