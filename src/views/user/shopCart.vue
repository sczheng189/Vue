<template>
    <div class="shop-cart">
        <el-card>
            <div slot="header">
                <span>我的购物车</span>
            </div>

            <el-table :data="cartData" border v-loading="loading">
                <el-table-column prop="id" label="购物车ID" width="100"></el-table-column>
                <el-table-column prop="productId" label="商品ID" width="120">
                    <template slot-scope="scope">
                        <el-link type="primary" :href="`/product/${scope.row.productId}`" target="_blank">
                            {{ scope.row.productId }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="num" label="数量" width="120"></el-table-column>
                <el-table-column label="总价" width="120">
                    <template slot-scope="scope">
                        ¥{{ scope.row.totalPrice.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="cart-footer" v-if="cartData.length > 0">
                <div class="total-price">
                    总计：¥{{ cartTotalPrice.toFixed(2) }}
                </div>
                <el-button type="primary" @click="handleCheckout">结算</el-button>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'ShopCart',
    data() {
        return {
            cartData: [],
            loading: false,
            userId: null
        }
    },
    computed: {
        cartTotalPrice() {
            return this.cartData.reduce((total, item) => {
                return total + item.totalPrice
            }, 0)
        }
    },
    created() {
        this.getUserInfoAndCart()
    },
    methods: {
        async getUserInfoAndCart() {
            try {
                this.loading = true
                // 先获取用户信息
                const userRes = await this.$http.get('/user/info')
                if (userRes.data.code === 200) {
                    this.userId = userRes.data.data.id
                    // 获取购物车信息
                    const cartRes = await this.$http.get(`/user/shoppingCart/${this.userId}`)
                    if (cartRes.data.code === 200) {
                        this.cartData = cartRes.data.data
                        console.log('购物车数据:', this.cartData)
                    }
                }
            } catch (error) {
                console.error('获取购物车信息失败:', error)
                this.$message.error('获取购物车信息失败')
            } finally {
                this.loading = false
            }
        },

        handleDelete(item) {
            this.$confirm('确认从购物车中删除该商品?', '提示', {
                type: 'warning'
            }).then(async () => {
                try {
                    await this.$http.delete(`/user/shoppingCart/${item.id}`)
                    this.$message.success('删除成功')
                    await this.getUserInfoAndCart()
                } catch (error) {
                    console.error('删除失败:', error)
                    this.$message.error('删除失败')
                }
            })
        },

        async handleCheckout() {
            try {
                // 先获取用户最新信息（包含余额）
                const userRes = await this.$http.get('/user/info')
                if (userRes.data.code !== 200) {
                    this.$message.error('获取用户信息失败')
                    return
                }

                const userMoney = userRes.data.data.money
                if (userMoney < this.cartTotalPrice) {
                    this.$message.error(`余额不足，当前余额：¥${userMoney.toFixed(2)}`)
                    return
                }

                // 发送结算请求，更新用户余额
                const checkoutRes = await this.$http.put('/admin/userManage', {
                    id: this.userId,
                    money: userMoney - this.cartTotalPrice
                })

                if (checkoutRes.data.code === 200) {
                    // 更新商品库存
                    await Promise.all(this.cartData.map(item =>
                        this.$http.put(`/admin/productManage/updateStock/${item.productId}?decrementValue=${item.num}`)
                    ));

                    // 为每个商品创建订单记录
                    await Promise.all(this.cartData.map(item =>
                        this.$http.post('/myOrder', {
                            userId: this.userId,
                            productId: item.productId,
                            totalAmount: item.totalPrice,
                            orderDate: new Date().toJSON().slice(0, 19),
                            finish: 1  // 假设1表示已完成
                        })
                    ));

                    // 创建日志记录
                    await Promise.all(this.cartData.map(item =>
                        this.$http.post('/log', {
                            userId: this.userId,
                            productId: item.productId,
                            actionType: 1,  // 1表示购买
                            timestamp: new Date().toJSON().slice(0, 19)
                        })
                    ));

                    // 清空购物车
                    await Promise.all(this.cartData.map(item =>
                        this.$http.delete(`/user/shoppingCart/${item.id}`)
                    ));

                    this.$message.success('结算成功')
                    this.cartData = []
                } else {
                    this.$message.error('结算失败')
                }
            } catch (error) {
                console.error('结算失败:', error)
                this.$message.error('结算失败')
            }
        }
    }
}
</script>

<style scoped>
.shop-cart {
    padding: 20px;
}

.cart-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
}

.total-price {
    font-size: 18px;
    color: #f56c6c;
    font-weight: bold;
}
</style>
