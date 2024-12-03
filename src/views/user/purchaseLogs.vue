<template>
    <div class="my-order">
        <el-card>
            <div slot="header">
                <span>我的订单</span>
            </div>

            <el-table :data="orderData" border v-loading="loading">
                <el-table-column prop="id" label="订单ID" width="100"></el-table-column>
                <el-table-column label="商品图片" width="120">
                    <template slot-scope="scope">
                        <el-image v-if="scope.row.productInfo" :src="baseImageUrl + scope.row.productInfo.imageUrl"
                            :preview-src-list="[baseImageUrl + scope.row.productInfo.imageUrl]" fit="cover"
                            class="product-image">
                        </el-image>
                    </template>
                </el-table-column>
                <el-table-column label="商品名称" min-width="150">
                    <template slot-scope="scope">
                        <span v-if="scope.row.productInfo">
                            {{ scope.row.productInfo.name }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="totalAmount" label="订单金额" width="120">
                    <template slot-scope="scope">
                        ¥{{ scope.row.totalAmount.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="orderDate" label="下单时间" width="180"></el-table-column>
                <el-table-column prop="finish" label="订单状态" width="120">
                    <template slot-scope="scope">
                        {{ scope.row.finish === 1 ? '已完成' : '处理中' }}
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'MyOrder',
    data() {
        return {
            baseImageUrl: window.globalConfig.baseAPI,
            orderData: [],
            loading: false,
            userId: null
        }
    },
    methods: {
        async getUserInfoAndOrders() {
            try {
                this.loading = true
                // 先获取用户信息
                const userRes = await this.$http.get('/user/info')
                if (userRes.data.code === 200) {
                    this.userId = userRes.data.data.id
                    // 获取订单信息
                    const orderRes = await this.$http.get(`/myOrder/${this.userId}`)
                    if (orderRes.data.code === 200) {
                        this.orderData = orderRes.data.data

                        // 获取每个订单对应的商品信息
                        const batchSize = 3;
                        for (let i = 0; i < this.orderData.length; i += batchSize) {
                            const batch = this.orderData.slice(i, i + batchSize);
                            await Promise.all(batch.map(async (order) => {
                                try {
                                    const productRes = await this.$http.get(`/admin/productManage/${order.productId}`, {
                                        timeout: 10000
                                    })
                                    if (productRes.data.code === 200) {
                                        this.$set(order, 'productInfo', productRes.data.data)
                                    }
                                } catch (error) {
                                    console.error(`获取商品 ${order.productId} 信息失败:`, error)
                                    this.$set(order, 'productInfo', {
                                        name: '获取失败',
                                        imageUrl: '',
                                    })
                                }
                            }))
                        }
                    }
                }
            } catch (error) {
                console.error('获取订单信息失败:', error)
                this.$message.error('获取订单信息失败')
            } finally {
                this.loading = false
            }
        }
    },
    created() {
        this.getUserInfoAndOrders()
    }
}
</script>

<style scoped>
.my-order {
    padding: 20px;
}

.el-table {
    margin-top: 20px;
}

.product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
}
</style>