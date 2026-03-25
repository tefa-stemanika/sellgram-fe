type FetcherOptions = Omit<RequestInit, 'headers'> & {
  token?: string
  headers?: HeadersInit
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'

function normalizeToken(token?: string): string | undefined {
  if (!token) return undefined
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

export async function fetcher<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const { token, headers, ...init } = options
  const authToken = normalizeToken(token)

  const response = await fetch(`${BASE_URL}/api${path}`, {
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
    const message = (data as { message?: string }).message ?? 'Terjadi kesalahan pada server'
    throw new Error(message)
  }

  return data as T
}
