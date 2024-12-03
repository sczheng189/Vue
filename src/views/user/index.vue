<template>
    <div class="mall-home">
        <!-- 顶部导航栏 -->
        <el-header class="header">
            <div class="logo">商城首页</div>
            <div class="search-box">
                <el-input v-model="searchKeyword" placeholder="搜索商品" class="search-input" clearable
                    @keyup.enter.native="handleSearch">
                    <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                </el-input>
            </div>
            <div class="user-info">
                <template v-if="isLogin">
                    <el-dropdown trigger="click">
                        <span class="user-dropdown-link">
                            <i class="el-icon-user"></i>
                            {{ username }}
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <!-- 前往个人中心的按钮链接 -->
                            <router-link v-if="userInfo.role === 1" to="/admin">
                                <el-dropdown-item>
                                    <i class="el-icon-s-tools"></i>
                                    管理员中心
                                </el-dropdown-item>
                            </router-link>
                            <router-link to="/user">
                                <el-dropdown-item>
                                    <i class="el-icon-user"></i>
                                    个人中心
                                </el-dropdown-item>
                            </router-link>
                            <el-dropdown-item>
                                <i class="el-icon-location"></i>
                                地址：{{ userInfo.address }}
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <i class="el-icon-message"></i>
                                邮箱：{{ userInfo.email }}
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <i class="el-icon-money"></i>
                                余额：¥{{ userInfo.money.toFixed(2) }}
                                <el-button type="text" @click="handleRecharge">充值</el-button>
                            </el-dropdown-item>
                            <el-dropdown-item divided>
                                <el-button type="text" @click="handleLogout">退出登录</el-button>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
                <template v-else>
                    <router-link to="/login">
                        <el-button type="text">登录</el-button>
                    </router-link>
                    <router-link to="/register">
                        <el-button type="text">注册</el-button>
                    </router-link>
                </template>
            </div>
        </el-header>

        <!-- 商品展示区 -->
        <el-main v-loading="loading">
            <!-- 商品列表 -->
            <el-row :gutter="20" class="product-list">
                <el-col v-for="product in products" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
                    <el-card :body-style="{ padding: '0px' }" class="product-card">
                        <img :src="baseImageUrl + product.imageUrl" class="product-image">
                        <div class="product-info">
                            <h3 class="product-name">{{ product.name }}</h3>
                            <p class="product-description">{{ product.description }}</p>
                            <p class="product-stock">库存：{{ product.stockQuantity }}</p>
                            <div class="product-price-box">
                                <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
                                <el-button type="primary" size="small" :disabled="!product.stockQuantity"
                                    @click="showAddToCartDialog(product)">
                                    {{ product.stockQuantity ? '加入购物车' : '已售罄' }}
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
                :page-sizes="[12, 24, 36]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="total" class="pagination">
            </el-pagination>
        </el-main>

        <!-- 充值对话框 -->
        <el-dialog title="充值" :visible.sync="rechargeDialogVisible" width="400px">
            <el-form :model="rechargeForm" :rules="rechargeRules" ref="rechargeForm" label-width="80px">
                <el-form-item label="充值金额" prop="amount">
                    <el-input-number v-model="rechargeForm.amount" :min="1" :max="10000" :precision="2" :step="100"
                        controls-position="right">
                        <template slot="prepend">¥</template>
                    </el-input-number>
                    <div class="amount-tips">请输入充值金额（1-10000元）</div>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="cancelRecharge">取消</el-button>
                <el-button type="primary" @click="confirmRecharge" :loading="rechargeLoading">确认充值</el-button>
            </div>
        </el-dialog>

        <!-- 加入购物车对话框 -->
        <el-dialog title="加入购物车" :visible.sync="cartDialogVisible" width="30%">
            <div v-if="selectedProduct" class="cart-dialog-content">
                <p>商品：{{ selectedProduct.name }}</p>
                <p>单价：¥{{ selectedProduct.price.toFixed(2) }}</p>
                <div class="quantity-selector">
                    <span>数量：</span>
                    <el-input-number v-model="selectedQuantity" :min="1" :max="selectedProduct.stockQuantity"
                        size="small" @change="handleQuantityChange">
                    </el-input-number>
                </div>
                <p class="total-price">总价：¥{{ (selectedProduct.price * selectedQuantity).toFixed(2) }}</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cartDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAddToCart">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'UserIndex',
    data() {
        return {
            baseImageUrl: window.globalConfig.baseAPI, // 添加基础图片URL
            searchKeyword: '',
            isLogin: false,
            username: '',
            userInfo: {
                address: '',
                email: '',
                money: 0,
                role: 0
            },
            rechargeAmount: 100,
            page: 1,
            pageSize: 12,
            total: 0,
            products: [],
            rechargeDialogVisible: false,
            rechargeLoading: false,
            rechargeForm: {
                amount: 100
            },
            rechargeRules: {
                amount: [
                    { required: true, message: '请输入充值金额', trigger: 'blur' },
                    { type: 'number', min: 1, max: 10000, message: '充值金额应在1-10000元之间', trigger: 'blur' }
                ]
            },
            cartDialogVisible: false,
            selectedProduct: null,
            selectedQuantity: 1,
            hasSearched: false,
            loading: false
        }
    },
    computed: {
        filteredProducts() {
            if (!this.hasSearched) return []
            return this.products.filter(product => {
                return !this.searchKeyword ||
                    product.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    product.description.toLowerCase().includes(this.searchKeyword.toLowerCase());
            });
        }
    },
    created() {
        this.checkLogin();
        this.fetchAllProducts();
    },
    methods: {
        async checkLogin() {
            const token = localStorage.getItem('token')
            console.log('当前token:', token)

            if (!token) {
                this.isLogin = false
                return
            }

            try {
                console.log('开始请求用户信息')
                const res = await this.$http.get('/user/info')
                console.log('用户信息响应:', res)

                if (res.data.code === 200) {
                    this.isLogin = true
                    this.username = res.data.data.username
                    this.userInfo = res.data.data
                    console.log('用户信息获取成功:', this.userInfo)
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                console.error('错误详情:', error.response)
                this.isLogin = false
            }
        },
        async fetchAllProducts() {
            try {
                this.loading = true;
                const res = await this.$http.get('/admin/productManage/list');
                if (res.data.code === 200) {
                    this.products = res.data.data.rows;
                    this.total = res.data.data.total;
                }
            } catch (error) {
                console.error('获取商品列表失败:', error);
                this.$message.error('获取商品列表失败');
            } finally {
                this.loading = false;
            }
        },
        async handleSearch() {
            try {
                this.loading = true;
                this.page = 1;
                const res = await this.$http.get('/admin/productManage/search', {
                    params: {
                        page: this.page,
                        pageSize: this.pageSize,
                        name: this.searchKeyword
                    }
                });
                if (res.data.code === 200) {
                    this.products = res.data.data.rows;
                    this.total = res.data.data.total;
                }
            } catch (error) {
                this.$message.error('搜索商品失败');
            } finally {
                this.loading = false;
            }
        },
        handleLogout() {
            this.$confirm('确认退出登录?', '提示', {
                type: 'warning'
            }).then(() => {
                // 清除 token 和用户信息
                localStorage.removeItem('token')
                localStorage.removeItem('userRole')

                // 重置用户状态
                this.isLogin = false
                this.username = ''
                this.userInfo = {
                    address: '',
                    email: '',
                    money: 0,
                    role: 0
                }

                this.$message.success('退出成功')
            })
        },
        handleRecharge() {
            this.rechargeDialogVisible = true
        },
        async confirmRecharge() {
            try {
                const res = await this.$http.put('/admin/userManage', {
                    id: this.userInfo.id,
                    money: this.rechargeAmount + this.userInfo.money
                })
                if (res.data.code === 200) {
                    this.userInfo.money  += this.rechargeForm.amount
                    this.$message.success('充值成功')
                    this.rechargeDialogVisible = false
                }
            } catch (error) {
                this.$message.error('充值失败')
            }
        },
        async handleAddToCart() {
            try {
                // 记录用户浏览行为
                await this.$http.post('/log', {
                    userId: this.userInfo.id,
                    actionType: 0,
                    productId: this.selectedProduct.id,
                    timestamp: new Date().toJSON().slice(0, 19)  // 转换为ISO格式并指定北京时区
                })

                // 将商品添加到购物车
                await this.$http.post('/user/shoppingCart', {
                    userId: this.userInfo.id,
                    productId: this.selectedProduct.id,
                    num: this.selectedQuantity,
                    totalPrice: this.selectedProduct.price * this.selectedQuantity
                })

                this.$message.success('已添加到购物车')
                this.cartDialogVisible = false
            } catch (error) {
                console.error('添加购物车失败:', error)
                this.$message.error('添加购物车失败')
            }
        },

        handleSizeChange(val) {
            this.pageSize = val;
            if (this.searchKeyword) {
                this.handleSearch();
            } else {
                this.fetchAllProducts();
            }
        },
        handleCurrentChange(val) {
            this.page = val;
            if (this.searchKeyword) {
                this.handleSearch();
            } else {
                this.fetchAllProducts();
            }
        },
        handleQuantityChange(value) {
            if (value > this.selectedProduct.stockQuantity) {
                this.selectedQuantity = this.selectedProduct.stockQuantity
                this.$message.warning('已达到最大库存数量')
            }
        },
        showAddToCartDialog(product) {
            if (!this.isLogin) {
                this.$message.warning('请先登录')
                return
            }
            this.selectedProduct = product
            this.selectedQuantity = 1
            this.cartDialogVisible = true
        },
    }
}
</script>

<style scoped>
.mall-home {
    min-height: 100vh;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
    font-size: 20px;
    font-weight: bold;
}

.search-box {
    width: 400px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.product-list {
    margin-bottom: 20px;
}

.product-card {
    margin-bottom: 20px;
    transition: transform 0.3s;
}

.product-card:hover {
    transform: translateY(-5px);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 14px;
}

.product-name {
    margin: 0;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-description {
    font-size: 14px;
    color: #666;
    margin: 8px 0;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    /* -webkit-line-clamp: 2; */
    -webkit-box-orient: vertical;
}

.product-price-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
}

.balance-popover {
    text-align: center;
}

.balance-popover .el-input-number {
    margin: 10px 0;
}

.pagination {
    margin-top: 20px;
    text-align: center;
}

.user-dropdown-link {
    cursor: pointer;
    color: #409EFF;
}

.user-dropdown-link:hover {
    color: #66b1ff;
}

.el-dropdown-menu {
    padding: 10px;
}

.el-dropdown-menu__item i {
    margin-right: 5px;
}

.cart-dialog-content {
    padding: 20px;
}

.quantity-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 15px 0;
}

.total-price {
    color: #f56c6c;
    font-weight: bold;
    margin-top: 15px;
}

.search-tip {
    margin-bottom: 20px;
}
</style>