import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import App from '@/App.vue'
import { routes } from '@/router'

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  return mount(App, { global: { plugins: [router] } })
}

describe('router', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the home page on /', async () => {
    const wrapper = await mountAt('/')
    expect(wrapper.text()).toContain('Bank Statement Importer')
  })

  it.each(['/nie-ma-takiej-strony', '/a/b/c'])('shows the application 404 page on %s', async (path) => {
    const wrapper = await mountAt(path)
    expect(wrapper.text()).toContain('404')
    expect(wrapper.text()).toContain('Nie ma takiej strony')
  })
})
