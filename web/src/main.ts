import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { configureHttp } from './api/http'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore(pinia)

configureHttp({
  getToken: () => auth.token,
  onUnauthorized: () => {
    auth.clear()

    const current = router.currentRoute.value
    if (current.meta.requiresAuth) {
      router.push({ name: 'login', query: { redirect: current.fullPath } })
    }
  },
})

await auth.restore()

app.use(router)

app.mount('#app')
