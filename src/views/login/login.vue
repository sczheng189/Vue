<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginForm">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
        <div class="register-link">
          还没有账号？
          <el-button type="text" @click="goToRegister">立即注册</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          try {
            const response = await this.$http.post('/login', this.loginForm);
            console.log('登录响应数据:', response);

            if (response.data.code === 200) {
              // 获取token和role
              const { token, role } = response.data.data;
              console.log('用户角色:', role);
              console.log('Token:', token);

              // 保存token
              localStorage.setItem('token', token);
              // 保存role（可选）
              localStorage.setItem('userRole', role);

              this.$message.success('登录成功');

              // 根据角色跳转到不同页面
              if (role === 1) {
                console.log('管理员登录，跳转到管理页面');
                this.$router.push('/admin');
              } else {
                console.log('普通用户登录，跳转到用户页面');
                this.$router.push('/user');
              }
            } else {
              this.$message.error(response.data.msg || '登录失败');
            }
          } catch (error) {
            console.error('登录请求异常:', error);
            this.$message.error('登录失败，请稍后重试');
          }
        }
      })
    },
    goToRegister() {
      this.$router.push('/register');
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.el-button {
  width: 100%;
  margin-top: 20px;
}

.register-link {
  text-align: center;
  margin-top: 15px;
  color: #606266;
}

.register-link .el-button {
  width: auto;
  margin: 0;
  padding: 0;
  margin-left: 5px;
}

.register-link .el-button:hover {
  color: #409EFF;
}
</style>