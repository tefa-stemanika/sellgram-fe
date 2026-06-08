'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { getProfile, register as apiRegister, login as apiLogin, type Customer } from '@/services/portal'
import { toast } from 'sonner'

const TOKEN_KEY = 'customer_token'
const USER_ID_KEY = 'customer_userId'

type PortalAuthContext = {
  customer: Customer | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const PortalAuthContext = createContext<PortalAuthContext | null>(null)

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider')
  }
  return ctx
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
}

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ userId: string }>()
  const userId = params.userId

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (t: string) => {
    try {
      const data = await getProfile(userId, t)
      setCustomer(data)
    } catch {
      setCustomer(null)
      clearStoredToken()
      setToken(null)
    }
  }, [userId])

  useEffect(() => {
    const stored = getStoredToken()
    if (stored) {
      setToken(stored)
      fetchProfile(stored).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchProfile])

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(userId, { email, password })
    setStoredToken(result.token)
    localStorage.setItem(USER_ID_KEY, result.customer.userId)
    setToken(result.token)
    setCustomer(result.customer)
  }, [userId])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const result = await apiRegister(userId, { name, email, password, phone })
    setStoredToken(result.token)
    localStorage.setItem(USER_ID_KEY, result.customer.userId)
    setToken(result.token)
    setCustomer(result.customer)
  }, [userId])

  const logout = useCallback(() => {
    setCustomer(null)
    setToken(null)
    clearStoredToken()
    toast.success('Berhasil keluar')
  }, [])

  const refreshProfile = useCallback(async () => {
    if (token) {
      await fetchProfile(token)
    }
  }, [token, fetchProfile])

  return (
    <PortalAuthContext.Provider value={{ customer, token, isLoading, login, register, logout, refreshProfile }}>
      {children}
    </PortalAuthContext.Provider>
  )
}
