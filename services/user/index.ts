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

export async function logout(token: string): Promise<void> {
  await fetcher<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    token
  })
}
