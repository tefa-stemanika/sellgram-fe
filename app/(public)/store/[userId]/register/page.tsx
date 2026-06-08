'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Phone, Store } from 'lucide-react'
import { usePortalAuth } from '../_components/portal-auth-provider'
import { registerSchema, type RegisterInput } from '@/schemas/portal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function RegisterPage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const { register } = usePortalAuth()

  const [form, setForm] = useState<RegisterInput>({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    setErrors({})

    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {}
      result.error.errors.forEach(err => {
        const key = err.path[0] as keyof RegisterInput
        if (!fieldErrors[key]) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Pendaftaran berhasil')
      router.push(`/store/${params.userId}/profile`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
      if (message.toLowerCase().includes('sudah terdaftar') || message.toLowerCase().includes('already')) {
        setServerError(`${message}. `)
      } else {
        setServerError(message)
      }
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
          <h1 className="text-section-header font-black text-foreground">Daftar</h1>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            Buat akun customer baru
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {serverError && (
              <div className="rounded-lg bg-error/10 px-4 py-3 text-body-sm font-medium text-error">
                {serverError}
                {serverError.endsWith('. ') && (
                  <Link
                    href={`/store/${params.userId}/login`}
                    className="font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    Masuk di sini
                  </Link>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-caption font-medium text-foreground">
                Nama
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Budi Santoso"
                  className={cn(
                    'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.name && 'border-error'
                  )}
                />
              </div>
              {errors.name && (
                <span className="text-caption text-error">{errors.name}</span>
              )}
            </div>

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
              <label htmlFor="phone" className="text-caption font-medium text-foreground">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className={cn(
                    'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.phone && 'border-error'
                  )}
                />
              </div>
              {errors.phone && (
                <span className="text-caption text-error">{errors.phone}</span>
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-caption font-medium text-foreground">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Ulangi kata sandi"
                  className={cn(
                    'h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.confirmPassword && 'border-error'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-caption text-error">{errors.confirmPassword}</span>
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
                <UserPlus className="size-4" />
              )}
              {submitting ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link
            href={`/store/${params.userId}/login`}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Masuk di sini
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
