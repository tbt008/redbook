import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      // 保存到本地存储，以便刷新页面后保持主题
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    initTheme() {
      // 从本地存储获取主题设置
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDark = savedTheme === 'dark'
      }
    }
  }
})
