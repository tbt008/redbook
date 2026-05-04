<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import request from '@/util/request'

const loading = ref(true)
const userInfo = ref<Record<string, any>>({})

const loadUserInfo = async () => {
  try {
    const res: any = await request.get('/user/info')
    userInfo.value = res.data || {}
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="profile-layout">
    <div class="profile-shell">
      <div class="profile-header">
        <div>
          <h1 class="profile-title">个人中心</h1>
          <p class="profile-subtitle">统一整理个人资料、收藏与学习记录</p>
        </div>
      </div>

      <div v-if="loading" class="profile-loading">
        正在加载用户信息...
      </div>

      <div v-else class="profile-body">
        <aside class="profile-sidebar">
          <div class="profile-card">
            <img
              :src="userInfo.avatar || 'https://via.placeholder.com/80x80?text=U'"
              class="profile-avatar"
              alt="avatar"
            />
            <div class="profile-name">{{ userInfo.nickName || userInfo.userName || '未登录用户' }}</div>
          </div>

          <nav class="profile-nav">
            <RouterLink class="profile-link" to="/profile/favour">收藏夹</RouterLink>
            <RouterLink class="profile-link" to="/profile/notes">个人笔记</RouterLink>
            <RouterLink class="profile-link" to="/profile/article">我的题解</RouterLink>
            <RouterLink class="profile-link" to="/profile/rewards">创作激励</RouterLink>
            <RouterLink class="profile-link" to="/profile/progress">做题分析</RouterLink>
            <RouterLink class="profile-link" to="/profile/session">进度管理</RouterLink>
            <RouterLink class="profile-link" to="/profile/info">个人资料</RouterLink>
          </nav>
        </aside>

        <section class="profile-content">
          <RouterView :userInfo="userInfo" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7f3 0%, #eef2ed 100%);
  padding: 32px 0 48px;
}

.profile-shell {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-title {
  margin: 0;
  font-size: 32px;
  color: #16342c;
}

.profile-subtitle {
  margin: 8px 0 0;
  color: #667085;
}

.profile-loading {
  padding: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 36px rgba(31, 41, 51, 0.08);
  text-align: center;
  color: #667085;
}

.profile-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  align-items: start;
}

.profile-sidebar,
.profile-content {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(31, 41, 51, 0.08);
}

.profile-sidebar {
  padding: 20px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  object-fit: cover;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: #16342c;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.profile-link {
  padding: 12px 14px;
  border-radius: 14px;
  color: #4b5563;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.profile-link:hover {
  background: #eef5f2;
  color: #1f6f5f;
}

.profile-link.router-link-active {
  background: #e6f3ef;
  color: #1f6f5f;
  font-weight: 600;
}

.profile-content {
  min-height: 720px;
  padding: 24px;
}

@media (max-width: 900px) {
  .profile-body {
    grid-template-columns: 1fr;
  }

  .profile-content {
    min-height: 0;
  }
}
</style>
