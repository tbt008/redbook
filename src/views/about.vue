<template>
  <div class="about-page">
    <!-- 顶部横幅 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="title">PTU Online Judge</h1>
        <p class="subtitle">追求卓越的编程体验</p>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">{{ stats.questionCount }}</div>
          <div class="stat-label">题目数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.userCount }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.codeRecordCount }}</div>
          <div class="stat-label">提交次数</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="content-section">
      <!-- 平台特色 -->
      <div class="features">
        <h2 class="section-title">平台特色</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <el-icon class="feature-icon" :size="40">
              <component :is="feature.icon" />
            </el-icon>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- 开发团队 -->
      <!-- <div class="team-section">
              <h2 class="section-title">开发团队</h2>
              <div class="team-grid">
                  <div class="team-card" v-for="member in team" :key="member.name">
                      <div class="member-avatar">
                          <img :src="member.avatar" :alt="member.name">
                      </div>
                      <h3>{{ member.name }}</h3>
                      <p class="member-role">{{ member.role }}</p>
                      <p class="member-description">{{ member.description }}</p>
                  </div>
              </div>
          </div> -->
      <div class="team-section">
        <h2 class="section-title">开发团队</h2>
        <div class="profile">

          <div class="about-member">
            <div class="about-img">
              <img src="@/views/imgs/about1.jpg" alt="" class="about-img-1" />
            </div>

            <div class="about-info">
              <span class="about-name">谭冰涛</span>
            </div>
          </div>

          <div class="about-member">
            <div class="about-img">
              <img src="@/views/imgs/about2.jpg" alt="" class="about-img-1" />
            </div>
            <div class="about-info">
              <span class="about-name">黄佳威</span>
            </div>
          </div>
          <div class="about-member">
            <div class="about-img">
              <img src="@/views/imgs/about3.jpg" alt="" class="about-img-1" />
            </div>
            <div class="about-info">
              <span class="about-name">王其彬</span>
            </div>
          </div>
          <div class="about-member">
            <div class="about-img">
              <img src="@/views/imgs/about4.jpg" alt="" class="about-img-1" />
            </div>
            <div class="about-info">
              <span class="about-name">张俊艺</span>
            </div>
          </div>
          <div class="about-member">
            <div class="about-img">
              <img src="@/views/imgs/about5.jpg" alt="" class="about-img-1" />
            </div>
            <div class="about-info">
              <span class="about-name">钟宇杰</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 技术栈 -->
      <div class="tech-stack">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-grid">
          <div class="tech-item" v-for="tech in techStack" :key="tech.name" @click="openUrl(tech.url)"
            style="cursor: pointer;">
            <img :src="tech.icon" :alt="tech.name">
            <span>{{ tech.name }}</span>
          </div>

        </div>
      </div>
    </div>

    <!-- 底部联系方式 -->
    <div class="contact-section">
      <h2 class="section-title">联系我们</h2>
      <div class="contact-info">
        <!-- <div class="contact-item">
          <el-icon>
            <Message />
          </el-icon>
          <span>{{ contact.email }}</span>
        </div> -->
        <div class="contact-item">
          <el-icon>
            <ChatDotRound /> <!-- 更换图标为用户群组相关图标 -->
          </el-icon>
          <span>{{ contact.qqGroup }}</span> <!-- 显示 QQ 群号 -->
        </div>
        <div class="contact-item">
          <el-icon>
            <Location />
          </el-icon>
          <span>{{ contact.address }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChatDotRound, Location } from '@element-plus/icons-vue'
import request from '@/util/request';
import { ElMessage } from 'element-plus'
interface Stats {
  questionCount: string
  userCount: string
  codeRecordCount: string
}
// 统计数据
const stats = ref<Stats>({
  questionCount: '',
  userCount: '',
  codeRecordCount: ''
})
//打开链接
const openUrl = (url: string) => {
  // 在新页面打开
  window.open(url, '_blank');
};
// 平台特色
const features = ref([
  {
    icon: 'Monitor',
    title: '实时判题',
    description: '强大的判题系统，支持多种编程语言，实时反馈结果'
  },
  {
    icon: 'Lock',
    title: '安全可靠',
    description: '采用先进的安全机制，保护用户代码和数据安全'
  },
  {
    icon: 'Share',
    title: '在线讨论',
    description: '支持题目讨论和代码分享，促进学习交流'
  },
  {
    icon: 'DataLine',
    title: '数据分析',
    description: '详细的提交统计和进度追踪，助力编程能力提升'
  }
])

// 图片从下面获取
// https://simpleicons.org/

// 技术栈
const techStack = ref([
  { name: 'Vue 3', icon: 'https://cdn.jsdelivr.net/npm/simple-icons/icons/vuedotjs.svg', url: 'https://vuejs.org/' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/npm/simple-icons/icons/typescript.svg', url: 'https://www.typescriptlang.org/' },
  { name: 'Element Plus', icon: 'https://cdn.jsdelivr.net/npm/simple-icons/icons/element.svg', url: 'https://element-plus.org/' },
  { name: 'Spring Boot', icon: 'https://cdn.jsdelivr.net/npm/simple-icons/icons/springboot.svg', url: 'https://spring.io/projects/spring-boot' }
]);

// 联系方式
const contact = ref({
  qqGroup: 'xxxxxxxxx',
  email: 'xxxxx@ptuoj.com',
  address: '莆田学院'
})
onMounted(() => {
  getStats()
})
const getStats = async () => {
  try {
    const res = await request.get('/system/firthPage/get') as any
    if (res.code === 200) {
      // 处理返回的数据，添加 isRead 字段
      stats.value = res.data;
    }
    else {

      stats.value = {
        questionCount: 'null',
        userCount: 'null',
        codeRecordCount: 'null'
      }
    }
  } catch (error) {
    console.error('获取系统数据失败:', error)
    ElMessage.error('获取系统数据失败')
  } finally {

  }
}

</script>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.hero-section {
  background: linear-gradient(135deg, #1a73e8 0%, #289cf5 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/path/to/pattern.svg');
    opacity: 0.1;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    .title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      animation: fadeInUp 0.8s ease;
    }

    .subtitle {
      font-size: 1.5rem;
      opacity: 0.9;
      animation: fadeInUp 0.8s ease 0.2s both;
    }
  }
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 60px;
  animation: fadeInUp 0.8s ease 0.4s both;

  .stat-item {
    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      opacity: 0.9;
    }
  }
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  font-size: 2rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    color: #1a73e8;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #2c3e50;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
}

.team-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;

  .member-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h3 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 10px;
  }

  .member-role {
    color: #1a73e8;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .member-description {
    color: #666;
    line-height: 1.6;
  }
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
}

.tech-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
  }

  span {
    display: block;
    color: #2c3e50;
    font-weight: 500;
  }
}

.contact-section {
  background: #2c3e50;
  color: white;
  padding: 60px 20px;
  text-align: center;

  .section-title {
    color: white;
  }

  .contact-info {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-icon {
      font-size: 24px;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px;

    .title {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1.2rem;
    }
  }

  .hero-stats {
    flex-direction: column;
    gap: 30px;
  }

  .features-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }
}





.about-info {
  margin: auto;
  text-align: center;
  display: block;
}

.about-name {
  margin: 10px;
  font-size: 20px;
  color: #0b0b0b;
}


.profile {
  margin: auto;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 5px;
}

.about-img {
  user-select: none;
  display: flex;
  border-radius: 50%;
  width: 150px;
  height: 150px;

  justify-content: center;
  align-items: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}

.about-img-1 {
  width: 100px;
  height: 100px;
  user-select: none;
  z-index: 99;
  border-radius: 100%;
  transition: all 0.6s;
  display: block;
  margin: auto;
}

.about-img-1:hover {
  transform: rotate(360deg);
}

.about-img::before {
  animation: rotate 4s linear infinite;
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 100%;
  overflow: hidden;
  content: '';
  /* box-shadow: 0 0 15px 10px #fff; */
  background: linear-gradient(#14aaf0, #d500f9);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>