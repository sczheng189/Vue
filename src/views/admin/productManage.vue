<template>
  <div class="product-manage">
    <el-card>
      <!-- 搜索栏 -->
      <div class="search-box">
        <el-input v-model="searchForm.name" placeholder="请输入商品名称" style="width: 200px" clearable @clear="handleSearch">
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="handleAdd" style="float: right">添加商品</el-button>
        <el-button type="danger" @click="handleBatchDelete(multipleSelection)"
          :disabled="!multipleSelection.length">批量删除</el-button>
      </div>

      <!-- 商品列表 -->
      <el-table :data="tableData" border style="width: 100%; margin-top: 20px"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="description" label="商品描述"></el-table-column>
        <el-table-column prop="price" label="价格">
          <template slot-scope="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="imageUrl" label="商品图片">
          <template slot-scope="scope">
            <el-image 
              style="width: 50px; height: 50px" 
              :src="baseImageUrl + scope.row.imageUrl"
              :preview-src-list="[baseImageUrl + scope.row.imageUrl]">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="stockQuantity" label="库存"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" style="color: red" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
        :page-sizes="[10, 20, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"
        style="margin-top: 20px">
      </el-pagination>

      <!-- 添加/编辑对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
        <el-form :model="form" :rules="rules" ref="form" label-width="100px">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="商品描述" prop="description">
            <el-input type="textarea" v-model="form.description"></el-input>
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="商品图片" prop="imageUrl">
            <el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false" :on-success="handleImageSuccess"
              :on-error="handleUploadError" :before-upload="beforeImageUpload" :on-change="handleImageChange"
              :headers="uploadHeaders" name="file">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <div class="upload-tip" v-if="!imageUrl">建议尺寸: 800x800px, 支持jpg、png格式</div>
          </el-form-item>
          <el-form-item label="库存" prop="stockQuantity">
            <el-input-number v-model="form.stockQuantity" :min="0" :step="1"></el-input-number>
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
        name: ''
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
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        stockQuantity: 0
      },
      // 表单验证规则
      rules: {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
        stockQuantity: [{ required: true, message: '请输入库存数量', trigger: 'blur' }]
      },
      multipleSelection: [],  // 存储多选的数据
      uploadHeaders: {
        // 如果需要token认证
        'Authorization': localStorage.getItem('token')
      },
      uploadUrl: window.globalConfig.baseAPI + '/upload', // 使用全局配置的baseAPI
      baseImageUrl: window.globalConfig.baseAPI, // 添加基础图片URL
      imageUrl: '', // 用于预览的临时图片URL
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    async fetchData() {
      try {
        const res = await this.$http.get('/admin/productManage/list', {
          params: {
            page: this.page,
            pageSize: this.pageSize,
            name: this.searchForm.name
          }
        })
        if (res.data.code === 200) {
          const data = res.data.data
          this.tableData = data.rows
          this.total = data.total

          // 添加日志输出
          console.log('获取到的数据:', data.rows);
          // 如果有数据，打印第一条记录的图片路径
          if (data.rows.length > 0) {
            console.log('第一条记录的图片路径:', data.rows[0].imageUrl);
          }
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      }
    },
    // 搜索
    handleSearch() {
      this.page = 1
      this.fetchData()
    },
    // 添加商品
    handleAdd() {
      this.dialogTitle = '添加商品'
      this.form = {
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        stockQuantity: 0
      }
      this.imageUrl = ''
      this.dialogVisible = true
    },
    // 编辑商品
    async handleEdit(row) {
      try {
        const res = await this.$http.get(`/admin/productManage/${row.id}`)
        if (res.data.code === 200) {
          this.form = { ...res.data.data }
          this.dialogTitle = '编辑商品'
          this.dialogVisible = true
          // 设置预览图片的完整路径
          this.imageUrl = row.imageUrl ? (this.baseImageUrl + row.imageUrl) : ''
        }
      } catch (error) {
        this.$message.error('获取商品信息失败')
      }
    },
    // 删除商品
    handleDelete(id) {
      this.$confirm('确认删除该商品?', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$http.delete(`/admin/productManage/${[id]}`);
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
          // 手动验证图片是否上传
          if (!this.form.imageUrl) {
            this.$message.error('请上传商品图片');
            return;
          }

          try {
            const method = this.form.id ? 'put' : 'post';
            const res = await this.$http[method]('/admin/productManage', this.form);
            if (res.data.code === 200) {
              this.$message.success(this.form.id ? '更新成功' : '添加成功');
              this.dialogVisible = false;
              this.fetchData();
            }
          } catch (error) {
            this.$message.error(this.form.id ? '更新失败' : '添加失败');
          }
        }
      });
    },
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.page = 1  // 重置到第一页
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
        this.$message.warning('请选择要删除的商品');
        return;
      }

      this.$confirm(`确认删除选中的 ${ids.length} 个商品?`, '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await this.$http.delete(`/admin/productManage/${ids.join(',')}`);
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
    },
    // 图片上传成功回调
    handleImageSuccess(res) {
      console.log('上传响应:', res);
      if (res.code === 200) {
        this.form.imageUrl = res.data; // 保存相对路径
        this.imageUrl = this.baseImageUrl + res.data; // 显示完整路径
        this.$message.success('上传成功');
      } else {
        this.imageUrl = '';
        this.$message.error(res.msg || '上传失败');
      }
    },
    // 图片上传前的验证
    beforeImageUpload(file) {
      console.log('准备上传文件:', file.name);
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPGOrPNG) {
        this.$message.error('只能上传 JPG 或 PNG 格式的图片!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },
    // 图片改变时的钩子（用于预览）
    handleImageChange(file) {
      // 创建本地预览URL
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    // 添加上传错误处理
    handleUploadError(err) {
      console.error('上传失败:', err);
      this.$message.error('图片上传失败');
      this.imageUrl = '';
    },
  }
}
</script>

<style scoped>
.product-manage {
  padding: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.el-input {
  margin-right: 10px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
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

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>