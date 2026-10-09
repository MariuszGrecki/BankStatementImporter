<script setup lang="ts">
import { onMounted, ref } from 'vue'

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
    <p v-if="apiStatus === 'loading'">API: sprawdzam...</p>
    <p v-else-if="apiStatus === 'ok'">API: działa</p>
    <p v-else>API: niedostępne</p>
  </main>
</template>
