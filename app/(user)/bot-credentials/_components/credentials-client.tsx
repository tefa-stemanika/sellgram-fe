'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleDashed, Eye, EyeOff, Save } from 'lucide-react'
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
  const [credentialState, setCredentialState] = useState<Record<CredentialKey, CredentialRowState>>(
    buildInitialState([])
  )
  const [showValueMap, setShowValueMap] = useState<Record<CredentialKey, boolean>>({} as Record<CredentialKey, boolean>)
  const [savingKey, setSavingKey] = useState<CredentialKey | null>(null)

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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Bot Credentials</h1>
        <p className="text-sm text-muted-foreground">
          Semua credential key ditampilkan langsung di halaman ini dan dapat diedit per item.
        </p>
      </div>

      <div className="space-y-3">
        {CREDENTIAL_KEYS.map((key) => {
          const row = credentialState[key]
          const isSaving = savingKey === key
          const hasValue = row?.value?.trim().length > 0
          const isStored = keyStatus[key]

          return (
            <div
              key={key}
              className={[
                'rounded-xl border p-4 shadow-sm transition-colors',
                isStored
                  ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/20'
                  : 'border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/20'
              ].join(' ')}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label htmlFor={`credential-${key}`} className="font-semibold">
                  {key}
                </Label>
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                    isStored
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                  ].join(' ')}>
                  {isStored ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
                  {isStored ? 'Tersimpan' : 'Belum tersimpan'}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    id={`credential-${key}`}
                    type={showValueMap[key] ? 'text' : 'password'}
                    placeholder="Masukkan value credential"
                    value={row.value}
                    onChange={(event) => handleChangeValue(key, event.target.value)}
                    className={
                      isStored
                        ? 'border-emerald-300 bg-white/90 dark:border-emerald-800 dark:bg-background'
                        : 'border-amber-300 bg-white/90 dark:border-amber-800 dark:bg-background'
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={() => toggleShowValue(key)}>
                    {showValueMap[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <Button type="button" onClick={() => void handleSave(key)} disabled={isSaving || !hasValue}>
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
