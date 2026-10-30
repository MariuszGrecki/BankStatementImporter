<script setup lang="ts">
import { onMounted } from 'vue'
import { useBankAccountsStore } from '@/stores/bankAccounts';

const store = useBankAccountsStore()

onMounted(() => {
  store.load()
})
</script>

<template>
  <div v-if="store.isLoading">
    <span>Ładowanie kont</span>
  </div>
  <div v-else-if="store.error">
    <span>{{ store.error }}</span>
  </div>
  <div v-else-if="store.accounts.length === 0">
    NIe masz jeszcze zadnych kont
  </div>
  <div v-else>
    <ul>
      <li v-for="bankAccount in store.accounts"
          :key="bankAccount.id"
      >
        <span>{{ bankAccount.name }}</span>
      </li>
    </ul>
  </div>

</template>
