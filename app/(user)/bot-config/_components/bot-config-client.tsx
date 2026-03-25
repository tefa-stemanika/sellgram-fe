'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { createBotConfig, updateBotConfig, type BotConfig, type BotConfigPayload } from '@/services/bot-config'

import { BotConfigForm } from './bot-config-form'

type BotConfigClientProps = {
  token: string
  initialConfig: BotConfig | null
}

export function BotConfigClient({ token, initialConfig }: BotConfigClientProps) {
  const [config, setConfig] = useState<BotConfig | null>(initialConfig)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (values: BotConfigPayload) => {
    if (!token) return

    setIsLoading(true)
    try {
      if (!config) {
        const created = await createBotConfig(token, values)
        setConfig(created)
        toast.success('Konfigurasi bot berhasil dibuat')
      } else {
        const updated = await updateBotConfig(token, config.id, values)
        setConfig(updated)
        toast.success('Konfigurasi bot berhasil diperbarui')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan konfigurasi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Bot Config</h1>
        <p className="text-sm text-muted-foreground">Atur mode bot, AI, dan pengaturan pembayaran.</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <BotConfigForm defaultValues={config ?? undefined} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
