'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, CheckCircle2, Copy, ExternalLink, Eye, EyeOff, KeyRound, MessageSquare, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CREDENTIAL_KEYS, type CredentialKey } from '@/schemas/bot-credentials'
import {
  createBotCredential,
  getBotCredentials,
  updateBotCredential,
  type BotCredential,
  type CreateCredentialPayload
} from '@/services/bot-credentials'

type CredentialsClientProps = {
  token: string
}

type CredentialRowState = {
  id?: number
  value: string
  stored: boolean
}

const CREDENTIAL_HELPERS: Record<CredentialKey, { title: string; description: string; example?: string }> = {
  TELEGRAM_BOT_TOKEN: {
    title: 'Token Bot Customer',
    description:
      'Didapat dari chat @BotFather saat membuat bot customer. Format token biasanya angka panjang, lalu titik dua, lalu secret key.',
    example: '8741169...:AAGKgq-onFo6WudgaZ8gCSjOEAMtbdcI...'
  },
  ADMIN_BOT_TOKEN: {
    title: 'Token Bot Admin',
    description:
      'Didapat dari @BotFather untuk bot khusus admin/operasional. Jika Anda pakai bot yang sama dengan customer, isi dengan token yang sama.',
    example: '1234567...:AAHxxxx...'
  },
  ADMIN_CHAT_ID: {
    title: 'Chat ID Admin',
    description:
      'Dipakai untuk menerima notifikasi order masuk/berhasil. Ambil dari Telegram Web > Saved Messages, lalu lihat angka chat ID di URL.',
    example: '7217964120'
  },
  MIDTRANS_SERVER_KEY_SANDBOX: {
    title: 'Midtrans Server Key (Sandbox)',
    description:
      'Server Key untuk environment sandbox. Ambil dari Midtrans Dashboard > Settings > Access Keys > Sandbox.'
  },
  MIDTRANS_CLIENT_KEY_SANDBOX: {
    title: 'Midtrans Client Key (Sandbox)',
    description:
      'Client Key untuk environment sandbox. Digunakan dari sisi frontend saat mode pengembangan. Ambil dari halaman Access Keys > Sandbox.'
  },
  MIDTRANS_SERVER_KEY_PRODUCTION: {
    title: 'Midtrans Server Key (Production)',
    description:
      'Server Key untuk environment production. Wajib untuk membuat transaksi nyata. Ambil dari Midtrans Dashboard > Settings > Access Keys > Production.'
  },
  MIDTRANS_CLIENT_KEY_PRODUCTION: {
    title: 'Midtrans Client Key (Production)',
    description:
      'Client Key untuk environment production. Digunakan dari sisi frontend untuk pembayaran sungguhan. Ambil dari halaman Access Keys > Production.'
  },
  MIDTRANS_FINISH_URL: {
    title: 'Midtrans Finish URL',
    description:
      'URL redirect setelah pembayaran selesai (sukses/gagal). Isi dengan URL halaman sukses aplikasi Anda.',
    example: 'https://domain-anda.com/payment/success'
  }
}

const CREDENTIAL_META: Record<CredentialKey, { icon: typeof Bot; gradient: string; iconBg: string }> = {
  TELEGRAM_BOT_TOKEN: {
    icon: Bot,
    gradient: 'from-sky-500 to-cyan-400',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
  },
  ADMIN_BOT_TOKEN: {
    icon: ShieldCheck,
    gradient: 'from-indigo-500 to-violet-400',
    iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
  },
  ADMIN_CHAT_ID: {
    icon: MessageSquare,
    gradient: 'from-teal-500 to-emerald-400',
    iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-300'
  },
  MIDTRANS_SERVER_KEY_SANDBOX: {
    icon: KeyRound,
    gradient: 'from-amber-400 to-yellow-300',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
  },
  MIDTRANS_CLIENT_KEY_SANDBOX: {
    icon: KeyRound,
    gradient: 'from-yellow-400 to-orange-300',
    iconBg: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300'
  },
  MIDTRANS_SERVER_KEY_PRODUCTION: {
    icon: KeyRound,
    gradient: 'from-primary to-amber-500',
    iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300'
  },
  MIDTRANS_CLIENT_KEY_PRODUCTION: {
    icon: KeyRound,
    gradient: 'from-rose-500 to-pink-400',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
  },
  MIDTRANS_FINISH_URL: {
    icon: ExternalLink,
    gradient: 'from-slate-500 to-gray-400',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300'
  }
}

const buildInitialState = (credentials: BotCredential[]): Record<CredentialKey, CredentialRowState> => {
  const existingByKey = new Map(credentials.map((credential) => [credential.key, credential]))

  return CREDENTIAL_KEYS.reduce(
    (acc, key) => {
      const existing = existingByKey.get(key)
      acc[key] = {
        id: existing?.id,
        value: '',
        stored: Boolean(existing?.value)
      }
      return acc
    },
    {} as Record<CredentialKey, CredentialRowState>
  )
}

export function CredentialsClient({ token }: CredentialsClientProps) {
  const [credentialState, setCredentialState] = useState<Record<CredentialKey, CredentialRowState>>(buildInitialState([]))
  const [showValueMap, setShowValueMap] = useState<Record<CredentialKey, boolean>>({} as Record<CredentialKey, boolean>)
  const [savingKey, setSavingKey] = useState<CredentialKey | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
  const webhookUrl = apiBaseUrl
    ? `${apiBaseUrl}/api/webhook/midtrans`
    : 'https://backend-api-domain.com/api/webhook/midtrans'

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!token) {
        setCredentialState(buildInitialState([]))
        setIsInitialLoading(false)
        return
      }

      setIsInitialLoading(true)
      try {
        const credentials = await getBotCredentials(token)
        setCredentialState((prev) => {
          const next = buildInitialState(credentials)

          CREDENTIAL_KEYS.forEach((key) => {
            if (prev[key]?.value) {
              next[key].value = prev[key].value
            }
          })

          return next
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat credential')
      } finally {
        setIsInitialLoading(false)
      }
    }

    void fetchCredentials()
  }, [token])

  const keyStatus = useMemo(() => {
    return CREDENTIAL_KEYS.reduce(
      (acc, key) => {
        acc[key] = credentialState[key]?.stored ?? false
        return acc
      },
      {} as Record<CredentialKey, boolean>
    )
  }, [credentialState])

  const storedCount = useMemo(() => Object.values(keyStatus).filter(Boolean).length, [keyStatus])
  const totalCount = CREDENTIAL_KEYS.length
  const progressPercent = Math.round((storedCount / totalCount) * 100)

  const toggleShowValue = (key: CredentialKey) => {
    setShowValueMap((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleChangeValue = (key: CredentialKey, value: string) => {
    setCredentialState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }))
  }

  const handleSave = async (key: CredentialKey) => {
    if (!token) {
      toast.error('Sesi login tidak ditemukan')
      return
    }

    const value = credentialState[key]?.value?.trim() ?? ''
    if (!value) {
      toast.error(`Value untuk ${key} wajib diisi`)
      return
    }

    setSavingKey(key)
    try {
      const existingId = credentialState[key]?.id

      if (existingId) {
        await updateBotCredential(token, existingId, { value })
      } else {
        const payload: CreateCredentialPayload = { key, value }
        const created = await createBotCredential(token, payload)
        setCredentialState((prev) => ({
          ...prev,
          [key]: {
            id: created.id,
            value,
            stored: true
          }
        }))
      }

      toast.success(`${CREDENTIAL_HELPERS[key].title} berhasil disimpan`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan credential')
    } finally {
      setSavingKey(null)
    }
  }

  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      toast.success('Webhook URL berhasil disalin')
    } catch {
      toast.error('Gagal menyalin URL. Silakan copy manual.')
    }
  }

  return (
    <div className="space-y-10">
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Credentials
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Kredensial Bot
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Hubungkan layanan eksternal dengan memasukkan token API dan key yang dibutuhkan bot Anda.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent * 0.973} 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {storedCount}/{totalCount}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold">Progress Setup</p>
              <p className="text-xs text-muted-foreground">
                {storedCount === 0
                  ? 'Belum ada kredensial tersimpan'
                  : storedCount === totalCount
                    ? 'Semua kredensial lengkap!'
                    : `${storedCount} dari ${totalCount} tersimpan`}
              </p>
            </div>
          </div>

          <div className="hidden h-10 w-px bg-border sm:block" />

          <div className="flex flex-wrap gap-3">
            {CREDENTIAL_KEYS.map((key) => {
              const isStored = keyStatus[key]
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                    isStored
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {isStored ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
                  {key === 'TELEGRAM_BOT_TOKEN'
                    ? 'Bot Customer'
                    : key === 'ADMIN_BOT_TOKEN'
                      ? 'Bot Admin'
                      : key === 'ADMIN_CHAT_ID'
                        ? 'Chat ID'
                        : key === 'MIDTRANS_SERVER_KEY_SANDBOX'
                          ? 'Srv Sbx'
                          : key === 'MIDTRANS_CLIENT_KEY_SANDBOX'
                            ? 'Clt Sbx'
                            : key === 'MIDTRANS_SERVER_KEY_PRODUCTION'
                              ? 'Srv Prd'
                              : key === 'MIDTRANS_CLIENT_KEY_PRODUCTION'
                                ? 'Clt Prd'
                                : 'Finish URL'}
                </span>
              )
            })}
          </div>
        </div>
      </header>

      <div
        className="overflow-hidden rounded-xl border-l-4 border-l-primary bg-gradient-to-r from-orange-50 to-amber-50 p-6 dark:from-orange-950/30 dark:to-amber-950/20"
        style={{ animation: 'none' }}>
        <div className="flex items-start gap-3 sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-widest">Panduan Setup Midtrans</h2>
            <ol className="space-y-1 text-sm text-muted-foreground">
              <li>1. Buat akun di <a className="font-semibold text-primary hover:underline" href="https://dashboard.midtrans.com" target="_blank" rel="noreferrer">Midtrans Dashboard</a> jika belum punya.</li>
              <li>2. Untuk sandbox, gunakan <a className="font-semibold text-primary hover:underline" href="https://simulator.sandbox.midtrans.com/" target="_blank" rel="noreferrer">simulator.sandbox.midtrans.com</a>.</li>
              <li>3. Isi Payment Notification URL di dashboard Midtrans dengan URL di bawah ini.</li>
              <li>4. Buka <a className="font-semibold text-primary hover:underline" href="https://dashboard.sandbox.midtrans.com/settings/access-keys" target="_blank" rel="noreferrer">Midtrans Access Keys</a> untuk mendapatkan Client Key dan Server Key.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-card px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Payment Notification URL
            </p>
            <code
              className="mt-1 block truncate font-mono text-sm font-medium text-foreground"
              title={webhookUrl}>
              {webhookUrl}
            </code>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleCopyWebhookUrl()}
            className="shrink-0 gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Salin
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {isInitialLoading ? (
          Array.from({ length: totalCount }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-300" />
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded-lg" />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-24 shrink-0 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          CREDENTIAL_KEYS.map((key, i) => {
            const row = credentialState[key]
            const isSaving = savingKey === key
            const hasValue = row?.value?.trim().length > 0
            const isStored = keyStatus[key]
            const helper = CREDENTIAL_HELPERS[key]
            const meta = CREDENTIAL_META[key]
            const Icon = meta.icon

            return (
              <Card
                key={key}
                className="group/card overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  animation: 'fadeInUp 0.4s ease both',
                  animationDelay: `${i * 80}ms`
                }}>
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold">{helper.title}</h3>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {helper.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                        isStored
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                      {isStored ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                      {isStored ? 'Aman' : 'Kosong'}
                    </span>
                  </div>

                  {helper.example ? (
                    <div className="overflow-hidden rounded-lg border bg-muted/30 px-3 py-2">
                      <code className="block truncate font-mono text-xs text-muted-foreground">
                        {helper.example}
                      </code>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Input
                        id={`credential-${key}`}
                        type={showValueMap[key] ? 'text' : 'password'}
                        placeholder={`Masukkan ${helper.title.toLowerCase()}`}
                        value={row.value}
                        onChange={(event) => handleChangeValue(key, event.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleShowValue(key)}>
                        {showValueMap[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      onClick={() => void handleSave(key)}
                      disabled={isSaving || !hasValue}
                      className="shrink-0 gap-1.5 transition-all duration-200 active:scale-[0.97]">
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? 'Simpan...' : 'Simpan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
