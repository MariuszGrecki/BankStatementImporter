<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  await router.push({ name: 'home' })
}
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Start</RouterLink>

      <template v-if="auth.isAuthenticated">
        <RouterLink :to="{ name: 'dashboard' }">Panel</RouterLink>
        <RouterLink :to="{ name: 'bank-accounts'}">Konta</RouterLink>
        <span class="nav-user">{{ auth.user?.name }}</span>
        <button type="button" @click="logout">Wyloguj</button>
      </template>

      <template v-else>
        <RouterLink :to="{ name: 'login' }">Zaloguj się</RouterLink>
        <RouterLink :to="{ name: 'register' }">Zarejestruj się</RouterLink>
      </template>
    </nav>
  </header>

  <RouterView />
</template>
