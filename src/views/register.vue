<template>
  <div class="register-container app-auth-page">
    <section class="auth-side app-auth-aside">
      <div class="app-auth-badge">莆田文旅平台</div>
      <h1 class="app-auth-title">
        创建你的旅行账号
        <strong>进入统一体验</strong>
      </h1>
      <p class="app-auth-subtitle">
        注册后可以收藏内容、发布笔记、管理订单，并继续使用平台内的智能规划能力。
      </p>
      <div class="app-auth-points">
        <div class="app-auth-point">
          <span class="app-auth-point__icon">游</span>
          <div>
            <p class="app-auth-point__title">路线与内容同步</p>
            <p class="app-auth-point__desc">把行程规划、攻略浏览和内容互动放到同一个账户里。</p>
          </div>
        </div>
        <div class="app-auth-point">
          <span class="app-auth-point__icon">管</span>
          <div>
            <p class="app-auth-point__title">前台后台一致</p>
            <p class="app-auth-point__desc">用户端与商家后台延续同一套色彩、圆角和表单节奏。</p>
          </div>
        </div>
      </div>
    </section>

    <div class="register-box app-auth-card">
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
                  native-type="button"
                  :disabled="countdown > 0 || sendingCode"
                  :loading="sendingCode"
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
const sendingCode = ref(false)
const agree = ref(false)
const countdown = ref(0)
let codeTimer: ReturnType<typeof setInterval> | null = null

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
  if (countdown.value > 0 || sendingCode.value) {
    return
  }

  try {
    await emailFormRef.value?.validateField('email')
  } catch {
    return
  }

  sendingCode.value = true
  try {
    const res: any = await request.post('/user/send-code', null, {
      params: {
        email: emailForm.email,
        type: 'register'
      }
    })

    if (res?.code === 200 && res?.data !== false) {
      ElMessage.success('验证码已发送到您的邮箱')
    } else {
      ElMessage.error(res?.msg || '验证码发送失败，请稍后重试')
      return
    }

    countdown.value = 60
    if (codeTimer) {
      clearInterval(codeTimer)
    }
    codeTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (codeTimer) {
          clearInterval(codeTimer)
          codeTimer = null
        }
      }
    }, 1000)
  } catch (error: any) {
    console.error('发送验证码错误：', error)
    ElMessage.error(error?.message || '验证码发送失败，请稍后重试')
  } finally {
    sendingCode.value = false
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
}

.register-box {
  width: 100%;
  max-width: 460px;
  padding: 36px 34px 30px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;

  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--app-primary-strong);
    letter-spacing: 1px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--app-text-muted);
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

.auth-side {
  max-width: 440px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: var(--app-text-muted);
}

:deep(.register-tabs .el-tabs__header) {
  margin-bottom: 22px;
}

:deep(.register-tabs .el-tabs__nav-wrap::after) {
  background-color: rgba(31, 111, 95, 0.08);
}

:deep(.register-tabs .el-tabs__item) {
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-muted);
}

:deep(.register-tabs .el-tabs__item.is-active) {
  color: var(--app-primary);
}

:deep(.register-form .el-form-item) {
  margin-bottom: 20px;
}

:deep(.register-form .el-input__wrapper) {
  min-height: 48px;
  border-radius: 14px;
  background: #f6faf8;
  box-shadow: 0 0 0 1px rgba(31, 111, 95, 0.08) inset;
}

:deep(.register-form .el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(31, 111, 95, 0.2) inset,
    0 0 0 4px rgba(31, 111, 95, 0.08);
}

:deep(.register-form .el-button--primary) {
  min-height: 48px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--app-primary) 0%, #2f8a72 100%);
  box-shadow: 0 14px 30px rgba(31, 111, 95, 0.2);
}

:deep(.register-form .el-button--primary:hover) {
  opacity: 0.95;
  transform: translateY(-1px);
}

:deep(.register-form .el-checkbox) {
  color: var(--app-text-muted);
  line-height: 1.7;
  white-space: normal;
}

:deep(.login-link .el-link) {
  font-weight: 600;
}

:deep(.code-input) {
  width: 100%;
}

:deep(.code-input .el-button) {
  min-height: 48px;
  border-radius: 14px;
}

@media (max-width: 980px) {
  .auth-side {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .register-box {
    padding: 28px 20px 24px;
  }

  :deep(.code-input) {
    flex-direction: column;
  }
}
</style>
