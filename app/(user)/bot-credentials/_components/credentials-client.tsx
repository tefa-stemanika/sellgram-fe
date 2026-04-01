'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleDashed, Copy, ExternalLink, Eye, EyeOff, Info, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
}

const CREDENTIAL_HELPERS: Record<CredentialKey, { title: string; description: string; example?: string }> = {
  TELEGRAM_BOT_TOKEN: {
    title: 'Token bot customer',
    description:
      'Didapat dari chat @BotFather saat membuat bot customer. Format token biasanya angka panjang, lalu titik dua, lalu secret key.',
    example: 'Contoh format: 8741169...:AAGKgq-onFo6WudgaZ8gCSjOEAMtbdcI...'
  },
  ADMIN_BOT_TOKEN: {
    title: 'Token bot admin',
    description:
      'Didapat dari @BotFather untuk bot khusus admin/operasional. Jika Anda pakai bot yang sama dengan customer, isi dengan token yang sama.',
    example: 'Contoh format: 1234567...:AAHxxxx...'
  },
  ADMIN_CHAT_ID: {
    title: 'Telegram chat ID admin',
    description:
      'Dipakai untuk menerima notifikasi order masuk/berhasil. Ambil dari Telegram Web > Saved Messages, lalu lihat angka chat ID di URL.',
    example: 'Contoh: 7217964120'
  },
  // GEMINI_API_KEY: {
  //   title: 'Kunci API Gemini',
  //   description:
  //     'Digunakan jika AI mode diaktifkan. Ambil key dari Google AI Studio, lalu tempelkan key lengkap tanpa spasi tambahan.'
  // },
  MIDTRANS_SERVER_KEY: {
    title: 'Midtrans Server Key',
    description: 'Wajib untuk membuat transaksi dari backend. Ambil dari Midtrans Dashboard > Settings > Access Keys.'
  },
  MIDTRANS_CLIENT_KEY: {
    title: 'Midtrans Client Key',
    description:
      'Digunakan untuk proses pembayaran dari sisi frontend/client. Ambil dari halaman Access Keys yang sama dengan Server Key.'
  }
}

const buildInitialState = (credentials: BotCredential[]): Record<CredentialKey, CredentialRowState> => {
  const existingByKey = new Map(credentials.map((credential) => [credential.key, credential]))

  return CREDENTIAL_KEYS.reduce(
    (acc, key) => {
      const existing = existingByKey.get(key)
      acc[key] = {
        id: existing?.id,
        value: ''
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

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
  const webhookUrl = apiBaseUrl
    ? `${apiBaseUrl}/api/webhook/midtrans`
    : 'https://backend-api-domain.com/api/webhook/midtrans'

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!token) {
        setCredentialState(buildInitialState([]))
        return
      }

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
      }
    }

    void fetchCredentials()
  }, [token])

  const keyStatus = useMemo(() => {
    return CREDENTIAL_KEYS.reduce(
      (acc, key) => {
        acc[key] = Boolean(credentialState[key]?.id)
        return acc
      },
      {} as Record<CredentialKey, boolean>
    )
  }, [credentialState])

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
            value
          }
        }))
      }

      toast.success(`Credential ${key} berhasil disimpan`)
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
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl p-5 transition-all duration-300">
        <h1 className="text-2xl font-semibold">Bot Credentials</h1>
        <p className="text-sm text-muted-foreground">
          Semua credential key ditampilkan langsung di halaman ini dan dapat diedit per item.
        </p>
      </div>

      <div className="rounded-2xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl p-5 transition-all duration-300">
        <div className="mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Info className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Panduan Setup Wajib</h2>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Jika belum punya akun Midtrans, buat akun terlebih dahulu di Midtrans Dashboard sebelum mengisi key pembayaran.
          </p>

          <ol className="space-y-2 pl-4">
            <li>
              1. Untuk sandbox, gunakan simulator pembayaran Midtrans:{' '}
              <a
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline transition-colors duration-200"
                href="https://simulator.sandbox.midtrans.com/"
                target="_blank"
                rel="noreferrer">
                simulator.sandbox.midtrans.com
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              2. Isi Payment Notification URL di Midtrans Dashboard dengan URL berikut (klik URL atau tombol untuk copy):
              <div className="mt-2 flex flex-col gap-2 rounded-lg bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg p-2.5 sm:flex-row sm:items-center sm:justify-between transition-all duration-200">
                <button
                  type="button"
                  onClick={() => void handleCopyWebhookUrl()}
                  className="truncate text-left font-mono text-xs font-medium text-foreground underline decoration-dotted underline-offset-4 hover:text-primary transition-colors duration-200"
                  title="Klik untuk copy URL">
                  {webhookUrl}
                </button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleCopyWebhookUrl()}
                  className="w-full shrink-0 sm:w-auto transition-all duration-200 hover:shadow-l1">
                  <Copy className="h-3.5 w-3.5" />
                  Copy URL
                </Button>
              </div>
            </li>
            <li>
              3. Buka halaman Midtrans Access Keys untuk copy Client Key dan Server Key:{' '}
              <a
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline transition-colors duration-200"
                href="https://dashboard.sandbox.midtrans.com/settings/access-keys"
                target="_blank"
                rel="noreferrer">
                Midtrans Access Keys
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>4. Untuk production, pastikan ganti semua endpoint/key ke environment production Midtrans.</li>
          </ol>
        </div>
      </div>

      <div className="space-y-3">
        {CREDENTIAL_KEYS.map((key) => {
          const row = credentialState[key]
          const isSaving = savingKey === key
          const hasValue = row?.value?.trim().length > 0
          const isStored = keyStatus[key]
          const helper = CREDENTIAL_HELPERS[key]

          return (
            <div
              key={key}
              className={[
                'rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg p-4 transition-all duration-300',
                isStored
                  ? 'bg-green-500/30 dark:bg-green-900/40 border-green-300/40 dark:border-green-800/40'
                  : 'bg-amber-500/30 dark:bg-amber-900/40 border-amber-300/40 dark:border-amber-800/40'
              ].join(' ')}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor={`credential-${key}`} className="font-semibold">
                    {key}
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{helper.title}</p>
                </div>
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200',
                    isStored
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                  ].join(' ')}>
                  {isStored ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
                  {isStored ? 'Tersimpan' : 'Belum tersimpan'}
                </span>
              </div>

              <div className="mb-2 rounded-lg bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg p-2.5 text-xs text-muted-foreground transition-all duration-200">
                <p>{helper.description}</p>
                {helper.example ? <p className="mt-1 font-medium text-foreground">{helper.example}</p> : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    id={`credential-${key}`}
                    type={showValueMap[key] ? 'text' : 'password'}
                    placeholder="Masukkan value credential"
                    value={row.value}
                    onChange={(event) => handleChangeValue(key, event.target.value)}
                    className={[
                      'transition-all duration-200',
                      isStored
                        ? 'border-emerald-300 bg-white/90 dark:border-emerald-800 dark:bg-background'
                        : 'border-amber-300 bg-white/90 dark:border-amber-800 dark:bg-background'
                    ].join(' ')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 transition-all duration-200 hover:bg-primary/10"
                    onClick={() => toggleShowValue(key)}>
                    {showValueMap[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={() => void handleSave(key)}
                  disabled={isSaving || !hasValue}
                  className="transition-all duration-200 hover:shadow-l1">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
