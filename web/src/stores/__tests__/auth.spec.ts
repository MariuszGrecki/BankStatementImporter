import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { ApiError } from '@/api/http'
import { useAuthStore } from '../auth'

const user = { id: 1, name: 'Jan Kowalski', email: 'jan@example.com' }

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function respondWith(...responses: Array<Response | Error>) {
  const fetchMock = vi.fn<typeof fetch>()
  for (const response of responses) {
    if (response instanceof Error) {
      fetchMock.mockRejectedValueOnce(response)
    } else {
      fetchMock.mockResolvedValueOnce(response)
    }
  }
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function simulatePageRefresh() {
  setActivePinia(createPinia())
  return useAuthStore()
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts logged out', () => {
    const auth = useAuthStore()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.token).toBeNull()
  })

  it('logs in and keeps the token in local storage', async () => {
    respondWith(jsonResponse(200, { data: user, token: '1|abc' }))
    const auth = useAuthStore()

    await auth.login({ email: user.email, password: 'sekret123' })

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(user)
    expect(localStorage.getItem('auth_token')).toBe('1|abc')
  })

  it('logs in right after registration', async () => {
    respondWith(jsonResponse(201, { data: user, token: '1|abc' }))
    const auth = useAuthStore()

    await auth.register({
      name: user.name,
      email: user.email,
      password: 'sekret123',
      password_confirmation: 'sekret123',
    })

    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth_token')).toBe('1|abc')
  })

  it('stays logged out when login fails', async () => {
    respondWith(jsonResponse(422, { message: 'Invalid', errors: { email: ['Invalid'] } }))
    const auth = useAuthStore()

    await expect(auth.login({ email: user.email, password: 'zle' })).rejects.toBeInstanceOf(
      ApiError,
    )

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('restores the user after a page refresh', async () => {
    respondWith(
      jsonResponse(200, { data: user, token: '1|abc' }),
      jsonResponse(200, { data: user }),
    )
    await useAuthStore().login({ email: user.email, password: 'sekret123' })

    const auth = simulatePageRefresh()
    expect(auth.isAuthenticated).toBe(false)

    await auth.restore()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(user)
  })

  it('does not ask the API who is logged in when there is no token', async () => {
    const fetchMock = respondWith()

    await useAuthStore().restore()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('forgets a token rejected by the API', async () => {
    localStorage.setItem('auth_token', '1|wygasly')
    respondWith(jsonResponse(401, { message: 'Unauthenticated.' }))
    const auth = useAuthStore()

    await auth.restore()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.token).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('keeps the token when the API is temporarily unreachable', async () => {
    localStorage.setItem('auth_token', '1|abc')
    respondWith(new TypeError('Failed to fetch'))
    const auth = useAuthStore()

    await auth.restore()

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBe('1|abc')
  })

  it('logs out and clears the token', async () => {
    respondWith(
      jsonResponse(200, { data: user, token: '1|abc' }),
      new Response(null, { status: 204 }),
    )
    const auth = useAuthStore()
    await auth.login({ email: user.email, password: 'sekret123' })

    await auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.token).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('logs out locally even when the API request fails', async () => {
    respondWith(jsonResponse(200, { data: user, token: '1|abc' }), new TypeError('Failed to fetch'))
    const auth = useAuthStore()
    await auth.login({ email: user.email, password: 'sekret123' })

    await auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})
