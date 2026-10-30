import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getBankAccounts } from '@/api/bankAccounts';
import type { BankAccount } from '@/types/bankAccounts';

export const useBankAccountsStore = defineStore('bankAccounts', () => {
  const accounts = ref<BankAccount[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function load() : Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      accounts.value = await getBankAccounts()
    } catch (caughtError) {
      console.error(caughtError);
      error.value = "Nie udało się pobrać kont bankowych"
    }

    finally {
      isLoading.value = false
    }
  }

  return {
    accounts,
    isLoading,
    error,
    load,
  }
})
