'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { createBotConfig, getBotConfig, updateBotConfig, type BotConfig, type BotConfigPayload } from '@/services/bot-config'

import { BotConfigForm } from './bot-config-form'

type BotConfigClientProps = {
  token: string
}

export function BotConfigClient({ token }: BotConfigClientProps) {
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      if (!token) {
        setConfig(null)
        return
      }

      setIsLoading(true)
      try {
        const initialConfig = await getBotConfig(token)
        setConfig(initialConfig)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat konfigurasi bot')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchConfig()
  }, [token])

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
      <div className="rounded-2xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl p-5 transition-all duration-300">
        <BotConfigForm defaultValues={config ?? undefined} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
