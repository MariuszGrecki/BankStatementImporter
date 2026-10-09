import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows that the API works when the health check succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(HomeView)
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/health$/))
    expect(wrapper.text()).toContain('API: działa')
  })

  it('shows that the API is unavailable when the health check answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const wrapper = mount(HomeView)
    await flushPromises()

    expect(wrapper.text()).toContain('API: niedostępne')
  })

  it('shows that the API is unavailable when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const wrapper = mount(HomeView)
    await flushPromises()

    expect(wrapper.text()).toContain('API: niedostępne')
  })
})
