<template>
  <el-row style="background-color: #FFFFFF; padding: 20px; border-radius: 5px;">
    <el-row style="padding: 10px; margin: 0 10px;">
      <span class="top-bar">分类名</span>
      <el-input size="small" style="width: 188px; margin-right: 10px;" v-model="filterText"
        @clear="handleFilterClear"></el-input>
      <el-button size="small" class="customer" style="background-color: rgb(235, 237, 245);" type="primary"
        @click="handleFilter">立刻查询</el-button>
      <el-button size="small" class="customer" style="background-color: rgb(235, 237, 245);" type="info"
        @click="add()">新增用户</el-button>
      <el-button size="small" class="customer"
        style="margin-left: 10px; background-color: #f1f1f1; border: none; color: #909399; border: 1px solid #dcdfe6;"
        @click="resetQueryCondition">条件重置</el-button>
      <el-button size="small" class="customer" type="danger" @click="batchDelete()">批量删除</el-button>
    </el-row>
  </el-row>

  <el-row style="margin: 10px 20px;">
    <el-table row-key="id" @selection-change="handleSelectionChange" :data="tableData">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" width="148" label="类别名称"></el-table-column>
      <el-table-column prop="isLogin" width="200" label="操作">
        <template slot-scope="scope">
          <span class="text-button" @click="handleEdit(scope.row)">编辑</span>
          <span class="text-button" @click="handleDelete(scope.row)">删除</span>
        </template>
      </el-table-column>
      <el-table-column prop="isLogin" width="108" label="状态">
        <template slot-scope="scope">
          <el-switch @change="handleSwitchChange(scope.row.id, scope.row.isLogin)" style="user-select: none;"
            v-model="scope.row.isLogin" active-color="#13ce66" inactive-color="rgb(226, 226, 226)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column sortable="true" prop="createTime" width="168" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span class="text-button" @click="handleEdit(scope.row)">编辑</span>
          <span class="text-button" @click="handleDelete(scope.row)">删除</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination style="margin: 20px 0; float: right;" @current-change="handleCurrentChange"
      :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
      layout="total, sizes, prev, pager, next, jumper" :total="totalItems"></el-pagination>
  </el-row>

  <div style="padding: 0 20px;">
    <el-row>
      <el-upload class="avatar-uploader" action="/api/book-manage-sys-api/v1.0/" :show-file-list="false"
        :on-success="handleAvatarSuccess">
        <img v-if="data.userAvatar" :src="data.userAvatar" class="dialog-avatar" />
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-row>

    <el-row>
      <span class="dialog-hover">用户名</span>
      <input class="dialog-input" v-model="data.userName" placeholder="请输入用户名" />

      <span class="dialog-hover">类别</span>
      <input class="dialog-input" v-model="data.userAccount" placeholder="账号" />

      <span class="dialog-hover">邮箱</span>
      <input class="dialog-input" v-model="data.userEmail" placeholder="请输入邮箱" />

      <span class="dialog-hover">密码</span>
      <input class="dialog-input" v-model="userPwd" type="password" placeholder="请输入密码" />
    </el-row>
  </div>

  <el-row>
    <el-dialog :visible.sync="dialogUserOperation" title="用户操作">
      <span slot="footer" class="dialog-footer">
        <el-button size="small" v-if="isOperation" style="background-color: rgb(43, 121, 203);" class="customer"
          type="info" @click="addOperation">
          新增
        </el-button>
        <el-button size="small" v-else style="background-color: rgb(43, 121, 203);" class="customer" type="info"
          @click="updateOperation">
          修改
        </el-button>
        <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);"
          @click="dialogUserOperation = false">
          取消
        </el-button>
      </span>
    </el-dialog>
  </el-row>
  <!-- <el-row style="background-color: #FFFFFF; padding: 20px;">
    <el-row style="padding: 10px;">
      <span>类别名：</span>
      <el-input size="small" style="width: 188px; margin-right: 10px;" v-model="categoryQueryDto.name"
        @clear="handleFilterClear" clearable />

      <el-button size="small" type="primary" @click="handleFilter">查询</el-button>
      <el-button size="small" type="primary" @click="add">新增</el-button>
      <el-button size="small" type="danger" @click="batchDelete()" :disabled="!selectedRows.length">批量删除</el-button>
      <el-button size="small" @click="resetQueryCondition">重置</el-button>
    </el-row>
  </el-row>

  <!-- 分类列表 -->
  <!-- <el-card style="margin-top: 20px;">
    <el-table row-key="id" @selection-change="handleSelectionChange" :data="tableData" v-loading="loading">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="分类名称"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
</el-table-column>
</el-table> -->

  <!-- 分页 -->
  <!-- <el-pagination style="margin-top: 20px; text-align: right;" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize" layout="total, sizes, prev, next, jumper" :total="totalItems">
    </el-pagination>
  </el-card> -->

  <!-- 添加/编辑对话框 -->
  <!-- <el-dialog :visible.sync="isOperation" width="25%" :title="dialogType === 'add' ? '新增分类' : '修改分类'">
    <el-form ref="categoryForm" :model="categoryForm" :rules="rules" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="categoryForm.name"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="isOperation = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </div>
  </el-dialog> -->

</template>

<script>
export default {
  name: 'CategoryManage',
  data() {
    return {
      data: {},
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      dialogOperation: false,
      isOperation: false,
      loading: false,
      tableData: [],
      selectedRows: [],
      // 查询条件
      categoryQueryDto: {},
    };
  },

  created() {
    this.fetchFreshData()
  },
  methods: {
    // messagePushoperation() {
    //   const messages = [];
    //   const message = {
    //     receiverId: this.data.id,
    //     content: this.data.content
    //   };
    //   messages.push(message);
    //   this.$axios.post('/message/systemInfoSave', messages).then(response => {
    //     const { data } = response;
    //     if (data.code === 200) {
    //       this.$swal.fire({
    //         title: '消息推送',
    //         text: '推送成功',
    //         icon: 'success',
    //         showConfirmButton: false,
    //         timer: 1000,
    //       });
    //     }
    //     this.data = {};
    //   });
    // }



    // handleAvatarSuccess(res, file) {
    //   if (res.code !== 200) {
    //     this.$message.error(`头像分类头像上传异常`);
    //     return;
    //   }
    //   this.$message.success(`头像分类头像上传成功`);
    //   this.data.userAvatar = res.data;
    //   console.log(this.data);
    // },

    // switchChange() {
    //   this.fetchFreshData();
    // },

    // async handleSwitchchange(id, status, operation) {
    //   try {
    //     let param = { id: id }; // 登录状态
    //     if (operation) {
    //       param.isLogin = status;
    //     } else { // 评论状态
    //       param.isWord = status;
    //     }
    //     const response = await this.$axios.put(`/category/backUpdate`, param);
    //     if (response.data.code === 200) {
    //       this.$swal.fire({
    //         title: operation ? '登录状态' : '评论状态',
    //         text: operation ? '登录状态操作成功' : '评论状态操作成功',
    //         icon: 'success',
    //         showConfirmButton: false,
    //         timer: 1000,
    //       });
    //     }
    //   } catch (e) {
    //     console.error(`更新时发生异常: ${e}`);
    //   }
    // },
    // 多选框改变时的处理
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // 获取分类列表
    async fetchFreshData() {
      this.loading = true;
      try {
        this.tableData = [];
        let startTime = null;
        let endTime = null;
        const params = {
          current: this.currentPage,
          size: this.pageSize,
          startTime: startTime,
          endTime: endTime,
          ...this.categoryQueryDto
        }
        const response = await this.$axios.post('/category/list', params);
        const data = response;
        this.tableData = data.data;
        this.totalItems = data.total;
      } catch (error) {
        this.$message.error('获取分类列表失败：' + error.message);
        console.error('获取分类列表失败：' + error.message);
      }
    },
    clearFormData() {
      this.data = {};
    },


    resetQueryCondition() {
      this.categoryQueryDto = {};
      this.searchTime = [];
      this.fetchFreshData();
    },

    //更新操作
    async updateOperation() {
      if (this.userPwd !== '') {
        const pwd = this.$md5(this.$md5(this.userPwd));
        this.data.userPwd = pwd;
      } else {
        this.data.userPwd = null;
      }

      try {
        const response = await this.$axios.put('/category/update', this.data);
        this.$swal.fire({
          title: '书籍类别信息修改',
          text: response.data.msg,
          icon: response.data.code === 200 ? 'success' : 'error',
          showConfirmButton: false,
          timer: 1000,
        });
        if (response.data.code === 200) {
          this.closeDialog();
          this.fetchFreshData();
          this.clearFormData();
        }
      } catch (error) {
        console.error('提交表单时出错：', error);
        this.$message.error('提交失败，请稍后再试！');
      }


    },


    //添加操作
    async addOperation() {

      try {
        const response = await this.$axios.post('/category/save', this.data);
        this.$message[response.code === 200 ? 'success' : 'error'](response.data.msg);
        if (response.code === 200) {
          this.closeDialog();
          this.fetchFreshData();
          this.clearFormData();
        }
      } catch (error) {
        console.error('添加分类失败：' + error.message);
        this.$message.error('添加分类失败：' + error.message);
      }

    },

    // 批量删除
    async batchDelete() {

      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的记录');
        return;
      }
      const confirmed = await this.$swalConfirm.fire({
        title: '确认删除该分类?',
        text: '删除后将无法恢复',
        icon: 'warning',
      });
      if (confirmed) {
        try {
          let ids = this.selectedRows.map(entity => row.id);
          const response = await this.$http.post('/category/batchDelete', ids);
          if (response.data.code === 200) {
            this.$swal.fire({
              title: '删除成功',
              text: response.data.msg,
              icon: 'success',
              showConfirmButton: false,
              timer: 2000,
            });
            this.fetchFreshData();
          }
        } catch (error) {
          this.$message.error('批量删除失败：' + error.message);
        }
      }
    },
    // 图片上传相关方法
    handleAvatarSuccess(res) {
      if (res.code === 200) {
        this.categoryForm.avatar = res.data
        this.$message.success('上传成功')
      } else {
        this.$message.error('上传失败：' + res.msg)
      }
    },
    add() {
      this.dialogOperation = true;
    },

    handleFilter() {
      this.currentPage = 1;
      this.fetchFreshData();
    },

    handleFilterClear() {
      this.filterText = ''; // 清空过滤文本
      this.handleFilter(); // 重新调用过滤方法
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchFreshData();
    },
    resetQueryCondition() {
      this.categoryQueryDto.name = ''
      this.currentPage = 1
      this.fetchFreshData()
    },
    // 分页处理
    handleCurrentChange(page) {
      this.currentPage = page
      this.fetchFreshData()
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    messagePushoperation(row) {
      this.data = { ...row }
    },
    // 编辑分类
    handleEdit(row) {
      this.dialogType = 'edit'
      this.categoryForm = { ...row }
      this.isOperation = true
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchFreshData()
    },
    closeDialog() {
      this.dialogOperation = false
    },
    handleDelete(row) {
      this.selectedRows.push(row);
      this.batchDelete();
    }
  }
}
</script>

<style scoped>
.category-manage {
  padding: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  margin: 0 auto 20px;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.dialog-avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

.el-dialog__body {
  padding: 20px 40px;
}

.text-button {
  color: #409EFF;
  margin-right: 10px;
  cursor: pointer;
}

.text-button:hover {
  color: #66b1ff;
}
</style>