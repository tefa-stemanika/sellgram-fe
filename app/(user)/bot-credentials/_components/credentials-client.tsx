'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, CheckCircle2, Copy, ExternalLink, Eye, EyeOff, KeyRound, MessageSquare, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { copyToClipboard } from '@/lib/utils'
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
    title: 'Token bot customer',
    description:
      'Didapat dari chat @BotFather saat membuat bot customer. Format token biasanya angka panjang, lalu titik dua, lalu secret key.',
    example: '8741169...:AAGKgq-onFo6WudgaZ8gCSjOEAMtbdcI...'
  },
  ADMIN_BOT_TOKEN: {
    title: 'Token bot admin',
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

const CREDENTIAL_META: Record<CredentialKey, { icon: typeof Bot }> = {
  TELEGRAM_BOT_TOKEN: { icon: Bot },
  ADMIN_BOT_TOKEN: { icon: ShieldCheck },
  ADMIN_CHAT_ID: { icon: MessageSquare },
  MIDTRANS_SERVER_KEY_SANDBOX: { icon: KeyRound },
  MIDTRANS_CLIENT_KEY_SANDBOX: { icon: KeyRound },
  MIDTRANS_SERVER_KEY_PRODUCTION: { icon: KeyRound },
  MIDTRANS_CLIENT_KEY_PRODUCTION: { icon: KeyRound },
  MIDTRANS_FINISH_URL: { icon: ExternalLink }
}

const STATUS_TONE_STORED = 'border-success/25 bg-success/12 text-success'
const STATUS_TONE_EMPTY = 'border-border bg-muted text-muted-foreground'

const RING_RADIUS = 15.5
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

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
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
  const webhookUrl = apiBaseUrl
    ? `${apiBaseUrl}/api/webhook/midtrans`
    : 'https://backend-api-domain.com/api/webhook/midtrans'

  useEffect(() => {
    void fetchCredentials()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const ratio = totalCount > 0 ? storedCount / totalCount : 0

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
        await createBotCredential(token, payload)
      }

      toast.success(`${CREDENTIAL_HELPERS[key].title} berhasil disimpan`)
      await fetchCredentials()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan credential')
    } finally {
      setSavingKey(null)
    }
  }

  const handleCopyWebhookUrl = async () => {
    const ok = await copyToClipboard(webhookUrl)
    if (ok) {
      toast.success('Webhook URL berhasil disalin')
    } else {
      toast.error('Gagal menyalin URL. Silakan copy manual.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Pengaturan"
        title="Kredensial bot"
        description="Hubungkan layanan eksternal dengan memasukkan token API dan key yang dibutuhkan bot Anda."
      />

      <Surface className="flex flex-wrap items-center gap-6 p-5">
        <div className="flex items-center gap-3">
          <div className="relative size-14">
            <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r={RING_RADIUS} fill="none" className="stroke-muted" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r={RING_RADIUS}
                fill="none"
                className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
                strokeWidth="3"
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - ratio)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-mono-data tabular">
              {storedCount}/{totalCount}
            </span>
          </div>
          <div>
            <p className="text-body-sm font-semibold">Progress setup</p>
            <p className="text-caption text-muted-foreground">
              {storedCount === 0
                ? 'Belum ada kredensial tersimpan'
                : storedCount === totalCount
                  ? 'Semua kredensial lengkap'
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
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-caption font-medium ${
                  isStored ? STATUS_TONE_STORED : STATUS_TONE_EMPTY
                }`}>
                {isStored ? <CheckCircle2 className="size-3" /> : <span className="size-1.5 rounded-full bg-muted-foreground/40" />}
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
      </Surface>

      <Surface className="p-6">
        <div className="flex items-start gap-3 sm:items-start">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ExternalLink className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-body font-semibold">Panduan Setup Midtrans</h2>
            <ol className="space-y-1 text-body-sm text-muted-foreground">
              <li>1. Buat akun di <a className="font-semibold text-primary hover:underline" href="https://dashboard.midtrans.com" target="_blank" rel="noreferrer">Midtrans Dashboard</a> jika belum punya.</li>
              <li>2. Untuk sandbox, gunakan <a className="font-semibold text-primary hover:underline" href="https://simulator.sandbox.midtrans.com/" target="_blank" rel="noreferrer">simulator.sandbox.midtrans.com</a>.</li>
              <li>3. Isi Payment Notification URL di dashboard Midtrans dengan URL di bawah ini.</li>
              <li>4. Buka <a className="font-semibold text-primary hover:underline" href="https://dashboard.sandbox.midtrans.com/settings/access-keys" target="_blank" rel="noreferrer">Midtrans Access Keys</a> untuk mendapatkan Client Key dan Server Key.</li>
            </ol>
          </div>
        </div>
      </Surface>

      <Surface className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-muted-foreground">
            Payment Notification URL
          </p>
          <code
            className="mt-1 block truncate font-mono text-mono-data tabular text-foreground"
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
      </Surface>

      <div className="grid gap-5 sm:grid-cols-2">
        {isInitialLoading ? (
          Array.from({ length: totalCount }).map((_, i) => (
            <Surface key={i} className="p-5">
              <div className="space-y-4">
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
              </div>
            </Surface>
          ))
        ) : (
          CREDENTIAL_KEYS.map((key) => {
            const row = credentialState[key]
            const isSaving = savingKey === key
            const hasValue = row?.value?.trim().length > 0
            const isStored = keyStatus[key]
            const baseHelper = CREDENTIAL_HELPERS[key]
            const helper = {
              ...baseHelper,
              ...(key === 'MIDTRANS_FINISH_URL' && origin
                ? { example: `${origin}/payment/success` }
                : {})
            }
            const meta = CREDENTIAL_META[key]
            const Icon = meta.icon

            return (
              <Surface key={key} className="animate-fade-in-up p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-body font-semibold">{helper.title}</h3>
                        <p className="mt-0.5 line-clamp-2 text-caption leading-relaxed text-muted-foreground">
                          {helper.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-caption font-medium ${
                        isStored ? STATUS_TONE_STORED : STATUS_TONE_EMPTY
                      }`}>
                      {isStored ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                      {isStored ? 'Aman' : 'Kosong'}
                    </span>
                  </div>

                  {helper.example ? (
                    <div className="overflow-hidden rounded-lg border bg-muted/30 px-3 py-2">
                      <code className="block truncate font-mono text-caption text-muted-foreground">
                        {helper.example}
                      </code>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Input
                        id={`credential-${key}`}
                        type={showValueMap[key] ? 'text' : 'password'}
                        placeholder={
                          key === 'MIDTRANS_FINISH_URL' && helper.example
                            ? helper.example
                            : `Masukkan ${helper.title.toLowerCase()}`
                        }
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
                      className="shrink-0 gap-1.5">
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? 'Simpan...' : 'Simpan'}
                    </Button>
                  </div>
                </div>
              </Surface>
            )
          })
        )}
      </div>
    </div>
  )
}
