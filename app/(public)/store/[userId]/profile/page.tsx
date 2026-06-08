'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Mail, Phone, Clock, Save, Lock } from 'lucide-react'
import { usePortalAuth } from '../_components/portal-auth-provider'
import { updateProfile, changePassword } from '@/services/portal'
import { updateProfileSchema, changePasswordSchema } from '@/schemas/portal'
import { formatDate, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ProfilePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const { customer, token, refreshProfile } = usePortalAuth()

  const [updating, setUpdating] = useState(false)
  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')

  const [changingPassword, setChangingPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwErrors, setPwErrors] = useState<Partial<Record<string, string>>>({})

  useEffect(() => {
    if (customer) {
      setName(customer.name ?? '')
      setPhone(customer.phone ?? '')
    }
  }, [customer])

  if (!customer || !token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-section-header font-black text-foreground">Belum Masuk</div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Silakan masuk terlebih dahulu untuk melihat profil.
        </p>
        <Button
          className="mt-6"
          onClick={() => router.push(`/store/${params.userId}/login`)}
        >
          Masuk
        </Button>
      </div>
    )
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setUpdating(true)
    try {
      const result = await updateProfile(params.userId, token!, { name, phone: phone || undefined })
      await refreshProfile()
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui profil')
    } finally {
      setUpdating(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErrors({})

    const result = changePasswordSchema.safeParse({ oldPassword, newPassword, confirmPassword })
    if (!result.success) {
      const fieldErrors: Partial<Record<string, string>> = {}
      result.error.errors.forEach(err => {
        const key = err.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = err.message
      })
      setPwErrors(fieldErrors)
      return
    }

    setChangingPassword(true)
    try {
      await changePassword(params.userId, token!, { oldPassword, newPassword })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Kata sandi berhasil diubah')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah kata sandi')
    } finally {
      setChangingPassword(false)
    }
  }

  function getCustomerInitials(name: string): string {
    return name
      .replace(/\p{Emoji}/gu, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div style={{ animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-lg">
            {getCustomerInitials(customer.name)}
          </div>
          <h1 className="text-section-header font-black text-foreground">Profil Saya</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Kelola informasi akun customer kamu
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-card-title font-bold text-foreground">
            <User className="size-5 text-primary" />
            Informasi Akun
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <Mail className="size-4" />
                Email
              </div>
              <span className="text-body-sm font-medium text-foreground">{customer.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <Phone className="size-4" />
                Telepon
              </div>
              <span className="text-body-sm font-medium text-foreground">{customer.phone ?? '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <Clock className="size-4" />
                Terdaftar
              </div>
              <span className="text-body-sm font-medium text-foreground">
                {customer.createdAt ? formatDate(customer.createdAt) : '-'}
              </span>
            </div>

          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-card-title font-bold text-foreground">
            <Save className="size-5 text-primary" />
            Update Profil
          </h2>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-caption font-medium text-foreground">
                Nama
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-caption font-medium text-foreground">
                Telepon
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="628123456789"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-body-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="size-4" />
              )}
              {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-card-title font-bold text-foreground">
            <Lock className="size-5 text-primary" />
            Ubah Kata Sandi
          </h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="oldPassword" className="text-caption font-medium text-foreground">
                Kata Sandi Lama
              </label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border border-input bg-background px-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                  pwErrors.oldPassword && 'border-error'
                )}
              />
              {pwErrors.oldPassword && (
                <span className="text-caption text-error">{pwErrors.oldPassword}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-caption font-medium text-foreground">
                Kata Sandi Baru
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className={cn(
                  'h-10 w-full rounded-lg border border-input bg-background px-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                  pwErrors.newPassword && 'border-error'
                )}
              />
              {pwErrors.newPassword && (
                <span className="text-caption text-error">{pwErrors.newPassword}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-caption font-medium text-foreground">
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border border-input bg-background px-3 text-body-sm text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                  pwErrors.confirmPassword && 'border-error'
                )}
              />
              {pwErrors.confirmPassword && (
                <span className="text-caption text-error">{pwErrors.confirmPassword}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-body-sm font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? (
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Lock className="size-4" />
              )}
              {changingPassword ? 'Mengubah...' : 'Ubah Kata Sandi'}
            </button>
          </form>
        </div>
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
