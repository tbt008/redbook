<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>注册莆田文旅账号</h2>
        <p>开启你的莆田之旅</p>
      </div>

      <el-tabs v-model="registerType" class="register-tabs">
        <el-tab-pane label="邮箱注册" name="email">
          <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" class="register-form">
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-input">
                <el-input
                  v-model="emailForm.code"
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
            <el-form-item prop="userName">
              <el-input
                v-model="emailForm.userName"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="emailForm.password"
                type="password"
                placeholder="请输入密码（6位以上）"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="emailForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="agree">
                我已阅读并同意<el-link type="primary">《用户协议》</el-link>和<el-link type="primary">《隐私政策》</el-link>
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleEmailRegister">
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="密码注册" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" class="register-form">
            <el-form-item prop="email">
              <el-input
                v-model="passwordForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="userName">
              <el-input
                v-model="passwordForm.userName"
                placeholder="请输入用户名"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码（6位以上）"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                :prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="agree">
                我已阅读并同意<el-link type="primary">《用户协议》</el-link>和<el-link type="primary">《隐私政策》</el-link>
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handlePasswordRegister">
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="login-link">
        已有账号？<el-link type="primary" @click="goLogin">立即登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, Key, User } from '@element-plus/icons-vue'
import request from '@/util/request'

const router = useRouter()

// 状态
const registerType = ref('email')
const loading = ref(false)
const agree = ref(false)
const countdown = ref(0)

// 表单
const emailForm = reactive({
  email: '',
  code: '',
  userName: '',
  password: '',
  confirmPassword: ''
})

const passwordForm = reactive({
  email: '',
  userName: '',
  password: '',
  confirmPassword: ''
})

// 表单引用
const emailFormRef = ref()
const passwordFormRef = ref()

// 验证规则
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== emailForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 发送验证码
const sendCode = async () => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  try {
    const res: any = await request.post('/user/send-code', null, {
      params: {
        email: emailForm.email,
        type: 'register'
      }
    })
    ElMessage.success('验证码已发送到您的邮箱')
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

// 邮箱验证码注册
const handleEmailRegister = async () => {
  if (!agree.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  await emailFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await request.post('/user/register/email', {
          email: emailForm.email,
          code: emailForm.code,
          nickname: emailForm.userName,
          password: emailForm.password
        })
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error: any) {
        console.error('注册错误：', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 密码注册
const handlePasswordRegister = async () => {
  if (!agree.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await request.post('/user/register/password', {
          email: passwordForm.email,
          nickname: passwordForm.userName,
          password: passwordForm.password
        })
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error: any) {
        console.error('注册错误：', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 跳转登录
const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-header {
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

.register-tabs {
  margin-bottom: 24px;
}

.register-form {
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

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
