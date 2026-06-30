import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import './style.css'

inject()
injectSpeedInsights()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

useAuthStore().init().then(() => {
  const auth = useAuthStore()
  const route = router.currentRoute.value
  if (auth.session && (route.path === '/login' || route.path === '/register')) {
    return router.replace('/dashboard')
  }
  if (route.meta?.requiresAuth && !auth.session && !auth.isGuest) {
    return router.replace('/login')
  }
})
