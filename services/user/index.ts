import { fetcher } from '../fetcher'

export type User = {
  id: number
  email: string
  name: string
  plan: 'FREE' | 'STARTER' | 'PRO'
  isActive: boolean
}

export type AuthResponse = {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return fetcher<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return fetcher<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  })
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetcher<{ success: boolean; data: User }>('/auth/me', { token })
  return response.data
}

export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const w = await fetcher<{ success: boolean; data: User }>('/auth/me', { token })
    console.log('w', w)
    return false // Token is valid
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    console.log('message', message)
    
    // Jika error adalah connection refused atau server down
    if (message.includes('Gagal terhubung')) {
      // Untuk development, assume token is valid jika server down
      // Ini memungkinkan development tanpa API server running
      console.warn('⚠️  API server not running - skipping token validation')
      return false // Assume token is valid
    }
    
    // Jika error adalah 401 Unauthorized, token expired
    if (
      (error as { status?: number }).status === 401 ||
      message.includes('401') ||
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('expired')
    ) {
      return true // Token is expired
    }
    
    throw error // Re-throw other errors
  }
}

export async function logout(token: string): Promise<void> {
  await fetcher<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    token
  })
}
