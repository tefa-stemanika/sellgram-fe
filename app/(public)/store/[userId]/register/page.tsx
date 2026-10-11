'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Phone, Store } from 'lucide-react'
import { usePortalAuth } from '../_components/portal-auth-provider'
import { registerSchema, type RegisterInput } from '@/schemas/portal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Surface } from '@/components/shared/surface'

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
      <div className="w-full animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg bg-primary shadow-l1">
            <Store className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-section-header font-semibold text-foreground">Daftar</h1>
          <p className="mt-1.5 text-body-sm text-muted-foreground">
            Buat akun customer baru
          </p>
        </div>

        <Surface className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {serverError && (
              <div className="rounded-lg border border-error/25 bg-error/10 px-4 py-3 text-body-sm font-medium text-error">
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
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Budi Santoso"
                  className={cn('pl-9', errors.name && 'border-error')}
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
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="budi@example.com"
                  className={cn('pl-9', errors.email && 'border-error')}
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
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className={cn('pl-9', errors.phone && 'border-error')}
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
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className={cn('pr-9 pl-9', errors.password && 'border-error')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {errors.password && (
                <span className="text-caption text-error">{errors.password}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-caption font-medium text-foreground">
                Konfirmasi kata sandi
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Ulangi kata sandi"
                  className={cn('pr-9 pl-9', errors.confirmPassword && 'border-error')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <span className="text-caption text-error">{errors.confirmPassword}</span>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="mt-2 w-full">
              {submitting ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {submitting ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>
        </Surface>

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
    </div>
  )
}
