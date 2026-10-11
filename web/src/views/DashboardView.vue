<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <main>
    <h1>Panel</h1>
    <p>Zalogowany jako {{ auth.user?.name }} ({{ auth.user?.email }}).</p>
  </main>
</template>
