import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
// 配置 Element Plus 使用中文
app.use(ElementPlus, {
  locale: zhCn
})
app.use(mavonEditor)
app.mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
