import { describeApiError } from '@/lib/api-error'

type FetcherOptions = Omit<RequestInit, 'headers'> & {
  token?: string
  headers?: HeadersInit
}

export class ApiError extends Error {
  readonly code?: string
  readonly status?: number

  constructor(message: string, options: { code?: string; status?: number } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code
    this.status = options.status
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5505'

function normalizeToken(token?: string): string | undefined {
  if (!token) return undefined
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

function getApiUrl(path: string): string {
  const baseUrl = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`
  return `${baseUrl}${path}`
}

export async function fetcher<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const { token, headers, ...init } = options
  const authToken = normalizeToken(token)

  console.log("getApiUrl(path)", getApiUrl(path))

  try {
    const response = await fetch(getApiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: authToken } : {}),
        ...headers
      },
      cache: init.cache ?? 'no-store'
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const body = data as { message?: string; code?: string }
      const info = describeApiError({ message: body.message, code: body.code, status: response.status })
      throw new ApiError(info.message, { code: body.code, status: response.status })
    }

    return data as T
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error('Gagal terhubung ke server: Pastikan API server sedang berjalan')
    }
    throw error
  }
}
