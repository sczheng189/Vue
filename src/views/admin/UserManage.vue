<template>
    <div class="user-manage">
        <el-card>
            <div class="search-box">
                <el-button type="primary" @click="handleAdd" style="float: right">添加用户</el-button>
                <el-button type="danger" @click="handleBatchDelete(multipleSelection)"
                    :disabled="!multipleSelection.length">批量删除</el-button>
            </div>

            <!-- 用户列表 -->
            <el-table :data="tableData" border style="width: 100%; margin-top: 20px"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="ID" width="80"></el-table-column>
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="address" label="地址"></el-table-column>
                <el-table-column prop="money" label="余额"></el-table-column>
                <el-table-column prop="role" label="角色">
                    <template slot-scope="scope">
                        {{ scope.row.role === 1 ? '管理员' : '普通用户' }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="text" style="color: red" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
                :page-sizes="[10, 20, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="total" style="margin-top: 20px">
            </el-pagination>

            <!-- 添加/编辑对话框 -->
            <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
                <el-form :model="form" :rules="rules" ref="form" label-width="100px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="form.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password" v-if="!form.id">
                        <el-input v-model="form.password" type="password"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="form.email"></el-input>
                    </el-form-item>
                    <el-form-item label="地址" prop="address">
                        <el-input v-model="form.address"></el-input>
                    </el-form-item>
                    <el-form-item label="角色" prop="role">
                        <el-select v-model="form.role">
                            <el-option label="普通用户" :value="0"></el-option>
                            <el-option label="管理员" :value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSubmit">确 定</el-button>
                </div>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 搜索表单
            searchForm: {
                username: ''
            },
            // 表格数据
            tableData: [],
            // 分页参数
            page: 1,
            pageSize: 10,
            total: 0,
            // 对话框
            dialogVisible: false,
            dialogTitle: '',
            // 表单数据
            form: {
                id: '',
                username: '',
                password: '',
                email: '',
                address: '',
                role: 0,
                money: 0
            },
            // 表单验证规则
            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
                ],
                address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
                role: [{ required: true, message: '请选择角色', trigger: 'change' }]
            },
            multipleSelection: []  // 存储多选的数据
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        // 获取数据
        async fetchData() {
            try {
                const res = await this.$http.get('/admin/userManage', {
                    params: {
                        page: this.page,
                        pageSize: this.pageSize,
                        username: this.searchForm.username
                    }
                })
                if (res.data.code === 200) {
                    const data = res.data.data
                    this.tableData = data.rows
                    this.total = data.total
                }
            } catch (error) {
                console.error('获取数据失败:', error)
                this.$message.error('获取数据失败')
            }
        },
        // 添加用户
        handleAdd() {
            this.dialogTitle = '添加用户'
            this.form = {
                username: '',
                password: '',
                email: '',
                address: '',
                role: 0,
                money: 0
            }
            this.dialogVisible = true
        },
        // 编辑用户
        async handleEdit(row) {
            try {
                const res = await this.$http.get(`/admin/userManage/${row.id}`)
                if (res.data.code === 200) {
                    this.form = { ...res.data.data }
                    this.dialogTitle = '编辑用户'
                    this.dialogVisible = true
                }
            } catch (error) {
                this.$message.error('获取用户信息失败')
            }
        },
        // 删除用户
        handleDelete(id) {
            this.$confirm('确认删除该用户?', '提示', {
                type: 'warning'
            }).then(async () => {
                try {
                    const res = await this.$http.delete(`/admin/userManage/${[id]}`);
                    if (res.data.code === 200) {
                        this.$message.success('删除成功');
                        this.fetchData();
                    } else {
                        this.$message.error(res.data.msg || '删除失败');
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    this.$message.error('删除失败');
                }
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        // 提交表单
        handleSubmit() {
            this.$refs.form.validate(async valid => {
                if (valid) {
                    try {
                        const method = this.form.id ? 'put' : 'post'
                        const res = await this.$http[method]('/admin/userManage', this.form)
                        if (res.data.code === 200) {
                            this.$message.success(this.form.id ? '更新成功' : '添加成功')
                            this.dialogVisible = false
                            this.fetchData()
                        }
                    } catch (error) {
                        this.$message.error(this.form.id ? '更新失败' : '添加失败')
                    }
                }
            })
        },
        // 分页大小改变
        handleSizeChange(val) {
            this.pageSize = val
            this.fetchData()
        },
        // 页码改变
        handleCurrentChange(val) {
            this.page = val
            this.fetchData()
        },
        // 多选改变事件
        handleSelectionChange(val) {
            this.multipleSelection = val.map(item => item.id);
        },
        // 批量删除
        handleBatchDelete(ids) {
            if (!ids || ids.length === 0) {
                this.$message.warning('请选择要删除的用户');
                return;
            }

            this.$confirm(`确认删除选中的 ${ids.length} 个用户?`, '提示', {
                type: 'warning'
            }).then(async () => {
                try {
                    const res = await this.$http.delete(`/admin/userManage/${ids.join(',')}`);
                    if (res.data.code === 200) {
                        this.$message.success('批量删除成功');
                        this.fetchData();
                    } else {
                        this.$message.error(res.data.msg || '批量删除失败');
                    }
                } catch (error) {
                    console.error('批量删除失败:', error);
                    this.$message.error('批量删除失败');
                }
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        }
    }
}
</script>

<style scoped>
.user-manage {
    padding: 20px;
}

.search-box {
    margin-bottom: 20px;
}

.el-input {
    margin-right: 10px;
}
</style>