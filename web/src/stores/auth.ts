import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { ApiError, http } from '@/api/http'

export interface User {
  id: number
  name: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface AuthResponse {
  data: User
  token: string
}

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  function startSession(response: AuthResponse): void {
    token.value = response.token
    user.value = response.data
    localStorage.setItem(TOKEN_KEY, response.token)
  }

  function clear(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function register(payload: RegisterPayload): Promise<void> {
    startSession(await http.post<AuthResponse>('/register', payload))
  }

  async function login(payload: LoginPayload): Promise<void> {
    startSession(await http.post<AuthResponse>('/login', payload))
  }

  async function logout(): Promise<void> {
    await http.post('/logout').catch(() => undefined)
    clear()
  }

  async function restore(): Promise<void> {
    if (!token.value) {
      return
    }

    try {
      user.value = (await http.get<{ data: User }>('/user')).data
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clear()
      }
    }
  }

  return { token, user, isAuthenticated, register, login, logout, restore, clear }
})
