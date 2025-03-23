

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './index.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app.use(createPinia())

const authStore = useAuthStore();
if (router.currentRoute.value.path !== '/') {
  authStore.initAuth();
}

app.config.globalProperties.$apiBaseUrl = import.meta.env.VITE_APP_BASE_URL_API;
app.config.globalProperties.$baseUrl = import.meta.env.VITE_APP_BASE_URL;

app.use(router)

app.use(ElementPlus)
app.mount('#app')
