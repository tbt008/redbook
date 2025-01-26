<template>
  <div class="homepage" :class="{ 'light-theme': !themeStore.isDark }">
    <div class="content-wrapper">
      <div class="animated-background"></div>
      <div class="theme-toggle">
        <el-icon class="toggle-icon" @click="themeStore.toggleTheme">
          <component :is="themeStore.isDark ? 'Sunny' : 'Moon'" />
        </el-icon>
      </div>
      <div class="title-container">
        <!-- <div class="title-word"> -->
        <!-- <span class="word word1">The</span> -->
        <!-- </div> -->
        <div class="title-word">
          <span class="word word2">CubeCode</span>
        </div>
        <div class="title-word">
          <span class="word word3">判码魔方</span>
        </div>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index">

          <el-icon class="feature-icon" :size="40">
            <component :is="feature.icon" />
          </el-icon>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const features = ref([
  {
    icon: 'Edit',
    title: '在线编程',
    description: '支持多种编程语言的在线编辑和运行'
  },
  {
    icon: 'Trophy',
    title: '竞赛系统',
    description: '丰富的竞赛体系，提升编程能力'
  },
  {
    icon: 'DataAnalysis',
    title: '实时评测',
    description: '快速精确的代码评测系统'
  }
])

onMounted(() => {
  themeStore.initTheme();
});
</script>

<style scoped>
.homepage {
  width: 100%;
  height: calc(94vh);
  position: relative;
  overflow: hidden;
  background: #0f0f1a;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.animated-background {
  position: absolute;
  top: 0px;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, #0f0f1a 0%, #2a1b3d 50%, #1a1b3c 100%);
  z-index: 0;
}

.animated-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  animation: pulse 8s ease-in-out infinite;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5rem;
  gap: 1rem;
}

.title-word {
  overflow: hidden;
  position: relative;
}

.word {
  display: block;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  text-align: center;
  transform: translateY(100%);
  animation: slideUp 0.8s forwards;
}

.word1 {
  font-size: 3rem;
  animation-delay: 0.2s;
}

.word2 {
  font-size: 5rem;
  background: linear-gradient(135deg, #00ffbb 0%, #4d7fff 50%, #ff49e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation-delay: 0.4s;
}

.word3 {
  font-size: 2.5rem;
  animation-delay: 0.6s;
}

.light-theme .word {
  color: #2c3e50;
}

/* 修改第二个字体颜色 */
.light-theme .word2 {
  color: white !important;
  background: none;
  -webkit-text-fill-color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 6rem;
  padding: 1rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  color: #4d7fff;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.5;
}

.theme-toggle {
  position: fixed;
  top: 7vh;
  right: 20px;
  z-index: 100;
  cursor: pointer;
}

.toggle-icon {
  font-size: 24px;
  color: #ffffff;
  padding: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.toggle-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
}

/* 亮色主题样式 */
.light-theme {
  background: #f8f9fa;
}

.light-theme .animated-background {
  background: linear-gradient(135deg, #1a73e8 0%, #289cf5 100%);
}

.light-theme .feature-card {
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
}

.light-theme .feature-card h3 {
  color: #2c3e50;
}

.light-theme .feature-card p {
  color: #666666;
}

.light-theme .feature-icon {
  color: #1a73e8;
}

.light-theme .toggle-icon {
  color: #2c3e50;
  background: rgba(0, 0, 0, 0.1);
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .word1 {
    font-size: 2rem;
  }

  .word2 {
    font-size: 3.5rem;
  }

  .word3 {
    font-size: 1.8rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>
