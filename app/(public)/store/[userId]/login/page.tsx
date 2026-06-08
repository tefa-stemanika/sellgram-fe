'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, Mail, Lock, Store } from 'lucide-react'
import { usePortalAuth } from '../_components/portal-auth-provider'
import { loginSchema, type LoginInput } from '@/schemas/portal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function LoginPage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const { login } = usePortalAuth()

  const [form, setForm] = useState<LoginInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    setErrors({})

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {}
      result.error.errors.forEach(err => {
        const key = err.path[0] as keyof LoginInput
        if (!fieldErrors[key]) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await login(form.email, form.password)
      toast.success('Berhasil masuk')
      router.push(`/store/${params.userId}/profile`)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-4 py-12">
      <div className="w-full" style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
            <Store className="size-6 text-white" />
          </div>
          <h1 className="text-section-header font-black text-foreground">Masuk</h1>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            Masuk ke akun customer kamu
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {serverError && (
              <div className="rounded-lg bg-error/10 px-4 py-3 text-body-sm font-medium text-error">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-caption font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="budi@example.com"
                  className={cn(
                    'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.email && 'border-error'
                  )}
                />
              </div>
              {errors.email && (
                <span className="text-caption text-error">{errors.email}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-caption font-medium text-foreground">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className={cn(
                    'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.password && 'border-error'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-caption text-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogIn className="size-4" />
              )}
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link
            href={`/store/${params.userId}/register`}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
