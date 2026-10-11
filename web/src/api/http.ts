export type ValidationErrors = Record<string, string[]>

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: ValidationErrors = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface HttpConfig {
  getToken: () => string | null
  onUnauthorized: () => void
}

let config: HttpConfig = {
  getToken: () => null,
  onUnauthorized: () => {},
}

export function configureHttp(newConfig: HttpConfig): void {
  config = newConfig
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = config.getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401) {
    config.onUnauthorized()
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(response.status, data.message ?? response.statusText, data.errors ?? {})
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
}
