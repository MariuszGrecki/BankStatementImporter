import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import App from '@/App.vue'
import { authGuard, routes } from '@/router'
import { useAuthStore } from '@/stores/auth'

let pinia: Pinia

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.beforeEach(authGuard)
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

function logIn() {
  useAuthStore().user = { id: 1, name: 'Jan Kowalski', email: 'jan@example.com' }
}

describe('router', () => {
  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the public home page with login and register links to a guest', async () => {
    const { wrapper } = await mountAt('/')

    expect(wrapper.text()).toContain('Bank Statement Importer')
    expect(wrapper.find('main a[href="/login"]').exists()).toBe(true)
    expect(wrapper.find('main a[href="/register"]').exists()).toBe(true)
  })

  it.each(['/nie-ma-takiej-strony', '/a/b/c'])(
    'shows the application 404 page on %s',
    async (path) => {
      const { wrapper } = await mountAt(path)

      expect(wrapper.text()).toContain('404')
      expect(wrapper.text()).toContain('Nie ma takiej strony')
    },
  )

  it('sends a guest from a protected page to login and remembers where they wanted to go', async () => {
    const { router } = await mountAt('/panel?tab=konta')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/panel?tab=konta')
  })

  it('lets a logged in user into the dashboard and shows them in the header', async () => {
    logIn()

    const { wrapper, router } = await mountAt('/panel')

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(wrapper.find('header').text()).toContain('Jan Kowalski')
    expect(wrapper.find('header').text()).toContain('Wyloguj')
  })

  it('sends a logged in user away from the login page to the dashboard', async () => {
    logIn()

    const { router } = await mountAt('/login')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
