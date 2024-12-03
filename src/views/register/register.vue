<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="title">用户注册</div>

      <el-form :model="registerForm" :rules="rules" ref="registerForm" label-width="80px" class="register-form">

        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user">
          </el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="el-icon-message">
          </el-input>
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="registerForm.address" placeholder="请输入地址" prefix-icon="el-icon-location">
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock"
            show-password>
          </el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"
            prefix-icon="el-icon-lock" show-password>
          </el-input>
        </el-form-item>


        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading" class="submit-btn">
            注册
          </el-button>
          <div class="login-link">
            已有账号？
            <router-link to="/login">立即登录</router-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'RegisterPage',
  data() {
    // 密码验证规则
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.registerForm.confirmPassword !== '') {
          this.$refs.registerForm.validateField('confirmPassword')
        }
        callback()
      }
    }
    // 确认密码验证规则
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        address: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.registerForm.validate(async valid => {
        if (valid) {
          try {
            // 设置loading状态
            this.loading = true;

            // 构造注册数据对象
            const registerData = {
              username: this.registerForm.username,
              password: this.registerForm.password,
              email: this.registerForm.email,
              address: this.registerForm.address
            };

            console.log('准备提交的注册数据:', registerData);

            // 发送注册请求
            const response = await this.$http.post('/register', registerData);
            console.log('注册响应:', response);

            if (response.data.code === 200) {
              // 注册成功
              this.$message.success('注册成功');
              // 跳转到登录页
              this.$router.push('/login');
            } else {
              // 注册失败
              this.$message.error(response.data.msg || '注册失败');
            }
          } catch (error) {
            console.error('注册请求异常:', error);
            this.$message.error('注册失败: ' + (error.response?.data?.msg || '服务器错误'));
          } finally {
            // 无论成功失败都关闭loading
            this.loading = false;
          }
        } else {
          console.log('表单验证未通过');
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f3f3;
}

.register-card {
  width: 480px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 24px;
  color: #303133;
  margin-bottom: 30px;
}

.register-form {
  .el-input {
    width: 100%;
  }
}

.submit-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #606266;

  a {
    color: #409EFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
