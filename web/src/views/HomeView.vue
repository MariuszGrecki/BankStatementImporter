<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const apiStatus = ref<'loading' | 'ok' | 'error'>('loading')

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health`)
    apiStatus.value = response.ok ? 'ok' : 'error'
  } catch {
    apiStatus.value = 'error'
  }
})
</script>

<template>
  <main>
    <h1>Bank Statement Importer</h1>
    <p>Importer i kategoryzator wyciągów bankowych.</p>

    <p v-if="auth.isAuthenticated">
      <RouterLink :to="{ name: 'dashboard' }">Przejdź do panelu</RouterLink>
    </p>
    <p v-else>
      <RouterLink :to="{ name: 'login' }">Zaloguj się</RouterLink>
      lub
      <RouterLink :to="{ name: 'register' }">Zarejestruj się</RouterLink>
    </p>
    <p v-if="apiStatus === 'loading'">API: sprawdzam...</p>
    <p v-else-if="apiStatus === 'ok'">API: działa</p>
    <p v-else>API: niedostępne</p>
  </main>
</template>
