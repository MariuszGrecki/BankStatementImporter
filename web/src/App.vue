<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Start</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
