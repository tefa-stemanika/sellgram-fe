'use server'

import { cookies } from 'next/headers'

export const setToken = async (token: string, remember?: boolean) => {
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
    path: '/'
  })
}

// Backward compatibility for existing imports.
export const saveToken = setToken

export const removeToken = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

export const getToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value
}
