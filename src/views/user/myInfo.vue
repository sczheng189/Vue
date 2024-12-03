<template>
    <div class="user-profile">
        <el-card class="profile-card">
            <div slot="header">
                <span>个人信息</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="handleEdit">
                    {{ isEditing ? '保存' : '编辑' }}
                </el-button>
            </div>

            <el-form :model="userForm" :disabled="!isEditing" ref="userForm" :rules="formRules" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="userForm.username" disabled></el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email"></el-input>
                </el-form-item>

                <el-form-item label="地址" prop="address">
                    <el-input v-model="userForm.address"></el-input>
                </el-form-item>

                <el-form-item label="余额">
                    <el-input v-model="userForm.money" disabled>
                        <template slot="append">
                            <el-button type="text" @click="handleRecharge">充值</el-button>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
        </el-card>

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
    </div>
</template>

<script>

export default {
    data() {
        return {

            isEditing: false,
            userForm: {
                username: '',
                email: '',
                address: '',
                money: 0,
                role: 0
            },
            formRules: {
                email: [
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
                ],
                address: [
                    { required: true, message: '请输入地址', trigger: 'blur' }
                ]
            },
            rechargeDialogVisible: false,
            rechargeLoading: false,
            rechargeForm: {
                amount: 100
            },
            rechargeRules: {
                amount: [
                    { required: true, message: '请输入充值金额' },
                    { type: 'number', min: 1, max: 10000, message: '充值金额必须在1-10000元之间' }
                ]
            }
        }
    },
    created() {
        this.initUserInfo()
    },
    methods: {
        // 初始化用户信息
        async initUserInfo() {
            try {
                // 从token获取基本信息
                const token = localStorage.getItem('token')
                if (token) {
                    // 获取详细信息
                    const res = await this.$http.get('/user/info')
                    if (res.data.code === 200) {
                        const { username, email, address, money, role } = res.data.data
                        Object.assign(this.userForm, { username, email, address, money, role })
                    }
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                this.$message.error('获取用户信息失败')
            }
        },

        // 处理编辑/保存
        async handleEdit() {
            if (this.isEditing) {
                // 保存修改
                try {
                    await this.$refs.userForm.validate()
                    const res = await this.$http.put('/user/update', {
                        email: this.userForm.email,
                        address: this.userForm.address
                    })
                    console.log("要修改的res", res)

                    if (res.data.code === 200) {
                        this.$message.success('保存成功')
                        this.isEditing = false
                    } else {
                        this.$message.error(res.data.msg || '保存失败')
                    }
                } catch (error) {
                    console.error('保存失败:', error)
                    this.$message.error('保存失败')
                }
            } else {
                // 进入编辑模式
                this.isEditing = true
            }
        },

        // 充值相关方法
        handleRecharge() {
            this.rechargeDialogVisible = true
            this.rechargeForm.amount = 100
            if (this.$refs.rechargeForm) {
                this.$refs.rechargeForm.resetFields()
            }
        },

        cancelRecharge() {
            this.rechargeDialogVisible = false
            this.rechargeForm.amount = 100
        },

        async confirmRecharge() {
            try {
                await this.$refs.rechargeForm.validate()
                this.rechargeLoading = true

                const res = await this.$http.put('/user/update', {
                    money: this.rechargeForm.amount + this.userForm.money
                })

                if (res.data.code === 200) {
                    this.userForm.money = res.data.data.money
                    this.$message.success('充值成功')
                    this.rechargeDialogVisible = false
                } else {
                    this.$message.error(res.data.msg || '充值失败')
                }
            } catch (error) {
                console.error('充值失败:', error)
                this.$message.error('充值失败，请重试')
            } finally {
                this.rechargeLoading = false
            }
        }
    }
}
</script>

<style scoped>
.user-profile {
    padding: 20px;
}

.profile-card {
    max-width: 600px;
    margin: 0 auto;
}

.amount-tips {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

.el-input-number {
    width: 200px;
}
</style>