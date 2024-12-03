<template>
    <div class="log-history">
        <el-card class="log-card">
            <div slot="header">
                <span>浏览记录</span>
            </div>

            <el-table :data="logData" style="width: 100%" v-loading="loading">
                <el-table-column prop="productId" label="商品ID" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.productId }}
                    </template>
                </el-table-column>

                <el-table-column label="商品信息" min-width="300">
                    <template slot-scope="scope">
                        <div v-if="scope.row.productInfo">
                            <div class="product-info">
                                <strong>{{ scope.row.productInfo.name }}</strong>
                                <div class="image">
                                    <img :src="baseImageUrl + scope.row.productInfo.imageUrl" alt="商品图片">
                                </div>
                                <span class="price">¥{{ scope.row.productInfo.price }}</span>
                            </div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="actionType" label="行为类型" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.actionType === 0 ? 'info' : 'success'">
                            {{ scope.row.actionType === 0 ? '浏览' : '购买' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="timestamp" label="时间" width="180">
                    <template slot-scope="scope">
                        {{ formatTime(scope.row.timestamp) }}
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'MyLog',
    data() {
        return {
            baseImageUrl: window.globalConfig.baseAPI,
            logData: [],
            loading: false
        }
    },
    methods: {
        async getUserInfoAndLogs() {
            try {
                this.loading = true
                const userRes = await this.$http.get('/user/info')
                if (userRes.data.code === 200) {
                    const logRes = await this.$http.get(`/log/${userRes.data.data.id}`)
                    if (logRes.data.code === 200) {
                        this.logData = Array.isArray(logRes.data.data) ? 
                            logRes.data.data.filter(log => log.actionType === 0) : 
                            [logRes.data.data].filter(log => log.actionType === 0)
                        
                        // 分批处理商品信息请求
                        const batchSize = 3;
                        for (let i = 0; i < this.logData.length; i += batchSize) {
                            const batch = this.logData.slice(i, i + batchSize);
                            await Promise.all(batch.map(async (log) => {
                                try {
                                    const productRes = await this.$http.get(`/admin/productManage/${log.productId}`, {
                                        timeout: 10000
                                    })
                                    if (productRes.data.code === 200) {
                                        this.$set(log, 'productInfo', productRes.data.data)
                                    }
                                } catch (error) {
                                    console.error(`获取商品 ${log.productId} 信息失败:`, error)
                                    // 设置一个错误状态
                                    this.$set(log, 'productInfo', {
                                        name: '获取失败',
                                        description: '商品信息加载失败',
                                        price: '--',
                                        stockQuantity: '--'
                                    })
                                }
                            }))
                        }
                    } else {
                        this.$message.error(logRes.data.msg || '获取日志记录失败')
                    }
                } else {
                    this.$message.error('获取用户信息失败')
                }
            } catch (error) {
                console.error('获取数据失败:', error)
                this.$message.error('获取数据失败')
            } finally {
                this.loading = false
            }
        },

        formatTime(timestamp) {
            if (!timestamp) return ''
            const date = new Date(timestamp)
            return date.toLocaleString()
        }
    },
    created() {
        this.getUserInfoAndLogs()
    }
}
</script>

<style scoped>
.log-history {
    padding: 20px;
}

.log-card {
    margin: 0 auto;
    max-width: 1200px;
}

.el-tag {
    min-width: 60px;
    text-align: center;
}

.product-info {
    padding: 8px 0;
}

.product-info .description {
    color: #666;
    font-size: 14px;
    margin: 8px 0;
}

.product-info .details {
    display: flex;
    gap: 20px;
    align-items: center;
}

.product-info .price {
    color: #f56c6c;
    font-weight: bold;
}

.product-info .stock {
    color: #409EFF;
}
</style>
