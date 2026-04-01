type FetcherOptions = Omit<RequestInit, 'headers'> & {
  token?: string
  headers?: HeadersInit
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
      const message = (data as { message?: string }).message ?? 'Terjadi kesalahan pada server'
      throw new Error(message)
    }

    return data as T
  } catch (error) {
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error('Gagal terhubung ke server: Pastikan API server sedang berjalan')
    }
    throw error
  }
}
