<template>
  <div class="create-notice">
    <el-card>
      <div slot="header">
        <span>{{ isEdit ? '编辑公告' : '创建公告' }}</span>
      </div>
      
      <el-form 
        :model="noticeForm" 
        :rules="rules" 
        ref="noticeForm" 
        label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题"></el-input>
        </el-form-item>
        
        <el-form-item label="公告内容" prop="content">
          <el-input 
            type="textarea" 
            v-model="noticeForm.content" 
            :rows="6"
            placeholder="请输入公告内容">
          </el-input>
        </el-form-item>
        
        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="noticeForm.status">
            <el-radio :label="1">立即发布</el-radio>
            <el-radio :label="0">保存草稿</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEdit ? '保存修改' : '创建公告' }}
          </el-button>
          <el-button @click="$router.push('/noticeManage')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CreateNotice',
  data() {
    return {
      isEdit: false,
      submitting: false,
      noticeForm: {
        title: '',
        content: '',
        status: 1
      },
      rules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入公告内容', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择发布状态', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        await this.$refs.noticeForm.validate()
        this.submitting = true
        
        if (this.isEdit) {
          // TODO: 调用更新公告API
          // await updateNotice(this.noticeId, this.noticeForm)
        } else {
          // TODO: 调用创建公告API
          // await createNotice(this.noticeForm)
        }
        
        this.$message.success(this.isEdit ? '更新成功' : '创建成功')
        this.$router.push('/noticeManage')
      } catch (error) {
        if (error !== false) {
          this.$message.error(this.isEdit ? '更新失败' : '创建失败')
        }
      } finally {
        this.submitting = false
      }
    },
    async fetchNoticeDetail(id) {
        console.log('获取公告详情:', id)
      try {
        // TODO: 调用获取公告详情API
        // const res = await getNoticeDetail(id)
        // this.noticeForm = res.data
      } catch (error) {
        this.$message.error('获取公告详情失败')
      }
    }
  },
  created() {
    const noticeId = this.$route.query.id
    if (noticeId) {
      this.isEdit = true
      this.fetchNoticeDetail(noticeId)
    }
  }
}
</script>

