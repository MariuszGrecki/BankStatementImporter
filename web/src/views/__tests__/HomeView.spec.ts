import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../HomeView.vue'
import { routes } from '@/router'
import { useAuthStore } from '@/stores/auth'

let pinia: Pinia

function mountHome() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  return mount(HomeView, { global: { plugins: [pinia, router] } })
}

describe('HomeView', () => {
  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows that the API works when the health check succeeds', async () => {
    const fetchMock = vi
      .fn<(url: string) => Promise<{ ok: boolean }>>()
      .mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mountHome()
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/health$/))
    expect(wrapper.text()).toContain('API: działa')
  })

  it('shows that the API is unavailable when the health check answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const wrapper = mountHome()
    await flushPromises()

    expect(wrapper.text()).toContain('API: niedostępne')
  })

  it('shows that the API is unavailable when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const wrapper = mountHome()
    await flushPromises()

    expect(wrapper.text()).toContain('API: niedostępne')
  })

  it('offers login and registration to a guest', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    const wrapper = mountHome()
    await flushPromises()

    expect(wrapper.text()).toContain('Zaloguj się')
    expect(wrapper.text()).toContain('Zarejestruj się')
    expect(wrapper.text()).not.toContain('Przejdź do panelu')
  })

  it('offers the dashboard to a logged in user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    useAuthStore().user = { id: 1, name: 'Jan Kowalski', email: 'jan@example.com' }

    const wrapper = mountHome()
    await flushPromises()

    expect(wrapper.text()).toContain('Przejdź do panelu')
    expect(wrapper.text()).not.toContain('Zaloguj się')
  })
})
