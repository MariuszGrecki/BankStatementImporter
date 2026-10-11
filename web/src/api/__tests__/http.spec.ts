import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, configureHttp, http } from '../http'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function setup(response: Response, token: string | null = null) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)

  const onUnauthorized = vi.fn<() => void>()
  configureHttp({ getToken: () => token, onUnauthorized })

  return { fetchMock, onUnauthorized }
}

function sentRequest(fetchMock: ReturnType<typeof setup>['fetchMock']) {
  const [url, init] = fetchMock.mock.calls[0]!
  return {
    url: String(url),
    method: init?.method,
    headers: init?.headers as Record<string, string>,
    body: init?.body,
  }
}

async function catchApiError(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.catch((e: unknown) => e)
  if (!(error instanceof ApiError)) {
    throw new Error(`Expected ApiError, got ${String(error)}`)
  }
  return error
}

describe('http', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    configureHttp({ getToken: () => null, onUnauthorized: () => {} })
  })

  it('sends the token as a bearer authorization header', async () => {
    const { fetchMock } = setup(jsonResponse(200, { data: 1 }), 'abc123')

    await http.get('/user')

    const request = sentRequest(fetchMock)
    expect(request.url).toMatch(/\/api\/user$/)
    expect(request.headers).toMatchObject({
      Accept: 'application/json',
      Authorization: 'Bearer abc123',
    })
  })

  it('does not send an authorization header without a token', async () => {
    const { fetchMock } = setup(jsonResponse(200, {}))

    await http.get('/health')

    expect(sentRequest(fetchMock).headers).not.toHaveProperty('Authorization')
  })

  it('sends the body as JSON', async () => {
    const { fetchMock } = setup(jsonResponse(200, {}))

    await http.post('/login', { email: 'jan@example.com' })

    const request = sentRequest(fetchMock)
    expect(request.method).toBe('POST')
    expect(request.headers['Content-Type']).toBe('application/json')
    expect(request.body).toBe('{"email":"jan@example.com"}')
  })

  it('returns the parsed JSON body', async () => {
    setup(jsonResponse(200, { data: { id: 1 } }))

    await expect(http.get('/user')).resolves.toEqual({ data: { id: 1 } })
  })

  it('returns nothing for 204 No Content', async () => {
    setup(new Response(null, { status: 204 }))

    await expect(http.post('/logout')).resolves.toBeUndefined()
  })

  it('calls the unauthorized handler and throws on 401', async () => {
    const { onUnauthorized } = setup(jsonResponse(401, { message: 'Unauthenticated.' }), 'stary')

    const error = await catchApiError(http.get('/user'))

    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(error.status).toBe(401)
  })

  it('throws validation errors per field on 422 without calling the unauthorized handler', async () => {
    const { onUnauthorized } = setup(
      jsonResponse(422, {
        message: 'The email field is required.',
        errors: { email: ['The email field is required.'] },
      }),
    )

    const error = await catchApiError(http.post('/register', {}))

    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(error.status).toBe(422)
    expect(error.errors).toEqual({ email: ['The email field is required.'] })
  })

  it('throws a readable error when the error body is not JSON', async () => {
    setup(new Response('<html>Bad Gateway</html>', { status: 502, statusText: 'Bad Gateway' }))

    const error = await catchApiError(http.get('/user'))

    expect(error.status).toBe(502)
    expect(error.message).toBe('Bad Gateway')
    expect(error.errors).toEqual({})
  })
})
