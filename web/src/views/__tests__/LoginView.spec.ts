import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import LoginView from '../LoginView.vue'
import { routes } from '@/router'

let pinia: Pinia

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function submitLoginAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()

  const wrapper = mount(LoginView, { global: { plugins: [pinia, router] } })
  await wrapper.find('input[type="email"]').setValue('jan@example.com')
  await wrapper.find('input[type="password"]').setValue('sekret123')
  await wrapper.find('form').trigger('submit')
  await flushPromises()

  return { wrapper, router }
}

function loginSucceeds() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      jsonResponse(200, {
        data: { id: 1, name: 'Jan', email: 'jan@example.com' },
        token: '1|abc',
      }),
    ),
  )
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('goes back to the page the user wanted to visit', async () => {
    loginSucceeds()

    const { router } = await submitLoginAt('/login?redirect=/panel?tab=konta')

    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/panel?tab=konta'))
  })

  it('goes to the dashboard when there is nowhere to go back to', async () => {
    loginSucceeds()

    const { router } = await submitLoginAt('/login')

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('dashboard'))
  })

  it('ignores a redirect to another site', async () => {
    loginSucceeds()

    const { router } = await submitLoginAt('/login?redirect=//zla-strona.pl')

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('dashboard'))
  })

  it('shows the validation error under the field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(422, {
          message: 'These credentials do not match our records.',
          errors: { email: ['These credentials do not match our records.'] },
        }),
      ),
    )

    const { wrapper, router } = await submitLoginAt('/login')

    expect(wrapper.find('.field-error').text()).toBe('These credentials do not match our records.')
    expect(router.currentRoute.value.name).toBe('login')
  })
})
