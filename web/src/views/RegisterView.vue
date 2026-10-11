<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { ApiError, type ValidationErrors } from '@/api/http'
import { useAuthStore, type RegisterPayload } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const errors = ref<ValidationErrors>({})
const generalError = ref<string | null>(null)
const submitting = ref(false)

async function submit() {
  submitting.value = true
  errors.value = {}
  generalError.value = null

  try {
    await auth.register(form)
    await router.push({ name: 'dashboard' })
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      errors.value = error.errors
    } else if (error instanceof ApiError && error.status === 429) {
      generalError.value = 'Za dużo prób. Spróbuj ponownie za minutę.'
    } else {
      generalError.value = 'Nie udało się zarejestrować. Spróbuj ponownie.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main>
    <h1>Rejestracja</h1>

    <form class="auth-form" @submit.prevent="submit">
      <p v-if="generalError" class="form-error" role="alert">{{ generalError }}</p>

      <label>
        Imię
        <input v-model="form.name" type="text" autocomplete="name" required />
      </label>
      <p v-if="errors.name" class="field-error">{{ errors.name[0] }}</p>

      <label>
        E-mail
        <input v-model="form.email" type="email" autocomplete="email" required />
      </label>
      <p v-if="errors.email" class="field-error">{{ errors.email[0] }}</p>

      <label>
        Hasło (min. 8 znaków)
        <input v-model="form.password" type="password" autocomplete="new-password" required />
      </label>
      <p v-if="errors.password" class="field-error">{{ errors.password[0] }}</p>

      <label>
        Powtórz hasło
        <input
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          required
        />
      </label>

      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Rejestracja...' : 'Załóż konto' }}
      </button>
    </form>

    <p>Masz już konto? <RouterLink :to="{ name: 'login' }">Zaloguj się</RouterLink></p>
  </main>
</template>
