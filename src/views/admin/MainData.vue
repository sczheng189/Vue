<template>
  <div class="dashboard">
    <el-card>
      <div slot="header">
        <span>商品销售统计</span>
      </div>

      <div class="charts-container">
        <!-- 商品销量扇形图 -->
        <div class="chart-item">
          <div ref="salesPieChart" style="height: 400px; width: 100%"></div>
        </div>

        <!-- 订单状态统计 -->
        <div class="chart-item">
          <div class="status-summary">
            <div class="status-item">
              <div class="status-title">总订单数</div>
              <div class="status-number">{{ totalOrders }}</div>
            </div>
            <div class="status-item">
              <div class="status-title">待发货</div>
              <div class="status-number pending">{{ pendingOrders }}</div>
            </div>
            <div class="status-item">
              <div class="status-title">已发货</div>
              <div class="status-number shipped">{{ shippedOrders }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DataDashboard',
  data() {
    return {
      orders: [],
      products: [],
      salesChart: null,
      loading: false
    }
  },
  computed: {
    // 订单统计
    totalOrders() {
      return this.orders.length
    },
    pendingOrders() {
      return this.orders.filter(order => order.finish === 0).length
    },
    shippedOrders() {
      return this.orders.filter(order => order.finish === 1).length
    },

    // 商品销量数据
    salesData() {
      const salesMap = new Map()

      // 统计每个商品的销量
      this.orders.forEach(order => {
        const product = this.products.find(p => p.id === order.productId)
        if (product) {
          const key = product.name
          // 使用订单中的商品数量而不是简单计数
          salesMap.set(key, (salesMap.get(key) || 0) + order.totalAmount / product.price)
        }
      })

      // 转换为图表数据格式
      return Array.from(salesMap.entries()).map(([name, value]) => ({
        name,
        value
      }))
    }
  },
  async created() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true

        // 获取所有订单
        const orderRes = await this.$http.get('/myOrder')
        if (orderRes.data.code === 200) {
          this.orders = orderRes.data.data.rows
        }

        // 获取所有商品
        const productRes = await this.$http.get('/admin/productManage/list')
        if (productRes.data.code === 200) {
          this.products = productRes.data.data.rows
        }

        // 初始化图表
        this.initChart()
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    initChart() {
      // 初始化扇形图
      if (this.salesChart) {
        this.salesChart.dispose()
      }

      this.salesChart = echarts.init(this.$refs.salesPieChart)

      const option = {
        title: {
          text: '商品销量分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.salesData.map(item => item.name)
        },
        series: [
          {
            name: '销量',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}件'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            data: this.salesData
          }
        ]
      }

      this.salesChart.setOption(option)
    }
  },
  mounted() {
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      if (this.salesChart) {
        this.salesChart.resize()
      }
    })
  },
  beforeDestroy() {
    // 清理图表实例
    if (this.salesChart) {
      this.salesChart.dispose()
    }
    window.removeEventListener('resize', this.salesChart.resize)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-item {
  flex: 1;
  min-width: 300px;
}

.status-summary {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.status-item {
  text-align: center;
}

.status-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.status-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.status-number.pending {
  color: #E6A23C;
}

.status-number.shipped {
  color: #67C23A;
}
</style>