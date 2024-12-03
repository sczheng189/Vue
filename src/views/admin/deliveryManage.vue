<template>
    <div class="delivery-manage">
        <el-card>
            <div slot="header">
                <span>订单管理</span>
            </div>

            <el-table :data="orderData" border v-loading="loading">
                <el-table-column prop="id" label="订单ID" width="100"></el-table-column>
                <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
                <el-table-column label="商品信息" min-width="300">
                    <template slot-scope="scope">
                        <div v-if="scope.row.productInfo" class="product-info">
                            <el-image :src="baseImageUrl + scope.row.productInfo.imageUrl"
                                :preview-src-list="[baseImageUrl + scope.row.productInfo.imageUrl]" fit="cover"
                                class="product-image">
                            </el-image>
                            <div class="product-details">
                                <div class="product-name">{{ scope.row.productInfo.name }}</div>
                                <div class="product-price">¥{{ scope.row.totalAmount.toFixed(2) }}</div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="orderDate" label="下单时间" width="180"></el-table-column>
                <el-table-column label="订单状态" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.finish === 0 ? 'warning' : 'success'">
                            {{ scope.row.finish === 0 ? '待发货' : '已发货' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.finish === 0" type="primary" size="small"
                            @click="handleDelivery(scope.row)">
                            发货
                        </el-button>
                        <el-tag v-else type="success">已发货</el-tag>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
                :page-sizes="[10, 20, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="total" style="margin-top: 20px">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'DeliveryManage',
    data() {
        return {
            baseImageUrl: window.globalConfig.baseAPI,
            orderData: [],
            loading: false,
            page: 1,
            pageSize: 10,
            total: 0
        }
    },
    created() {
        this.fetchOrders()
    },
    methods: {
        async fetchOrders() {
            try {
                this.loading = true
                const res = await this.$http.get('/myOrder', {
                    params: {
                        page: this.page,
                        pageSize: this.pageSize
                    }
                })
                if (res.data.code === 200) {
                    this.orderData = res.data.data.rows
                    this.total = res.data.data.total

                    // 获取商品信息
                    await Promise.all(this.orderData.map(async (order) => {
                        try {
                            const productRes = await this.$http.get(`/admin/productManage/${order.productId}`)
                            if (productRes.data.code === 200) {
                                this.$set(order, 'productInfo', productRes.data.data)
                            }
                        } catch (error) {
                            console.error('获取商品信息失败:', error)
                        }
                    }))
                }
            } catch (error) {
                console.error('获取订单列表失败:', error)
                this.$message.error('获取订单列表失败')
            } finally {
                this.loading = false
            }
        },

        async handleDelivery(order) {
            try {
                await this.$confirm('确认发货？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                const res = await this.$http.put('/myOrder/updateFinish', {
                    id: order.id,
                    userId: order.userId,
                    productId: order.productId,
                    totalAmount: order.totalAmount,
                    finish: 1
                })

                if (res.data.code === 200) {
                    this.$message.success('发货成功')
                    // 更新本地数据
                    order.finish = 1
                } else {
                    this.$message.error('发货失败')
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('发货失败:', error)
                    this.$message.error('发货失败')
                }
            }
        },

        handleSizeChange(val) {
            this.pageSize = val
            this.page = 1
            this.fetchOrders()
        },

        handleCurrentChange(val) {
            this.page = val
            this.fetchOrders()
        }
    }
}
</script>

<style scoped>
.delivery-manage {
    padding: 20px;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
}

.product-details {
    flex: 1;
}

.product-name {
    font-weight: bold;
    margin-bottom: 8px;
}

.product-price {
    color: #f56c6c;
}
</style>