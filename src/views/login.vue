<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>欢迎来到莆田文旅</h2>
        <p>发现莆田之美，分享旅行故事</p>
      </div>

      <el-tabs v-model="loginType" class="login-tabs">
        <el-tab-pane label="密码登录" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" class="login-form">
            <el-form-item prop="email">
              <el-input
                v-model="passwordForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <div class="form-footer">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" @click="showForgotPassword">忘记密码？</el-link>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handlePasswordLogin">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="codeForm" :rules="codeRules" ref="codeFormRef" class="login-form">
            <el-form-item prop="email">
              <el-input
                v-model="codeForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-input">
                <el-input
                  v-model="codeForm.code"
                  placeholder="请输入验证码"
                  :prefix-icon="Key"
                  size="large"
                  maxlength="6"
                />
                <el-button
                  :disabled="countdown > 0"
                  @click="sendCode"
                  size="large"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleCodeLogin">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="register-link">
        还没有账号？<el-link type="primary" @click="goRegister">立即注册</el-link>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog v-model="forgotPasswordVisible" title="重置密码" width="400px">
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef">
        <el-form-item prop="email">
          <el-input v-model="forgotForm.email" placeholder="请输入邮箱" :prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-input">
            <el-input v-model="forgotForm.code" placeholder="验证码" :prefix-icon="Key" maxlength="6" />
            <el-button :disabled="forgotCountdown > 0" @click="sendForgotCode">
              {{ forgotCountdown > 0 ? `${forgotCountdown}秒` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            v-model="forgotForm.newPassword"
            type="password"
            placeholder="新密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="forgotForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgotPasswordVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()

// 状态
const loginType = ref('password')
const loading = ref(false)
const rememberMe = ref(false)
const countdown = ref(0)
const forgotCountdown = ref(0)
const forgotPasswordVisible = ref(false)

// 表单
const passwordForm = reactive({
  email: '',
  password: ''
})

const codeForm = reactive({
  email: '',
  code: ''
})

const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单引用
const passwordFormRef = ref()
const codeFormRef = ref()
const forgotFormRef = ref()

// 验证规则
const passwordRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const codeRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== forgotForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 密码登录
const handlePasswordLogin = async () => {
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await request.post('/user/login/password', {
          email: passwordForm.email,
          password: passwordForm.password
        })
        localStorage.setItem('auth-token', res.data)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error: any) {
        console.error('登录错误：', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 验证码登录
const handleCodeLogin = async () => {
  await codeFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await request.post('/user/login/email', {
          email: codeForm.email,
          code: codeForm.code
        })
        localStorage.setItem('auth-token', res.data)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error: any) {
        console.error('登录错误：', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 发送验证码
const sendCode = async () => {
  if (!codeForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    const res: any = await request.post('/user/send-code', null, {
      params: {
        email: codeForm.email,
        type: 'login'
      }
    })
    ElMessage.success('验证码已发送到邮箱')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('发送验证码错误：', error)
  }
}

// 显示忘记密码对话框
const showForgotPassword = () => {
  forgotPasswordVisible.value = true
}

// 发送重置密码验证码
const sendForgotCode = async () => {
  if (!forgotForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    const res: any = await request.post('/user/send-code', null, {
      params: {
        email: forgotForm.email,
        type: 'reset'
      }
    })
    ElMessage.success('验证码已发送到邮箱')
    forgotCountdown.value = 60
    const timer = setInterval(() => {
      forgotCountdown.value--
      if (forgotCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('发送验证码错误：', error)
  }
}

// 重置密码
const handleResetPassword = async () => {
  await forgotFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await request.post('/user/forgot-password/reset', null, {
          params: {
            email: forgotForm.email,
            code: forgotForm.code,
            newPassword: forgotForm.newPassword
          }
        })
        ElMessage.success('密码重置成功，请使用新密码登录')
        forgotPasswordVisible.value = false
        // 清空表单
        forgotForm.email = ''
        forgotForm.code = ''
        forgotForm.newPassword = ''
        forgotForm.confirmPassword = ''
      } catch (error: any) {
        console.error('重置密码错误：', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转注册
const goRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: bold;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #999;
  }
}

.login-tabs {
  margin-bottom: 24px;
}

.login-form {
  .form-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .code-input {
    display: flex;
    gap: 8px;

    .el-input {
      flex: 1;
    }

    .el-button {
      white-space: nowrap;
    }
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
