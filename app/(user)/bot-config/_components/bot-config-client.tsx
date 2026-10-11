'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, Globe, Grid3x3, RefreshCw, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createBotConfig, getBotConfig, updateBotConfig, reconnectBot, type BotConfig, type BotConfigPayload } from '@/services/bot-config'

import { BotConfigForm } from './bot-config-form'

type BotConfigClientProps = {
  token: string
}

const NEUTRAL_CHIP = 'inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-caption font-medium text-muted-foreground'

export function BotConfigClient({ token }: BotConfigClientProps) {
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

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
      const payload: BotConfigPayload = { mode: values.mode, midtransIsProduction: values.midtransIsProduction }

      if (!config) {
        const created = await createBotConfig(token, payload)
        setConfig(created)
        toast.success('Konfigurasi bot berhasil dibuat')
      } else {
        const updated = await updateBotConfig(token, config.id, payload)
        setConfig(updated)
        toast.success('Konfigurasi bot berhasil diperbarui')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan konfigurasi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReconnect = async () => {
    if (!token) return
    setIsReconnecting(true)
    try {
      const data = await reconnectBot(token)
      toast.success('Bot berhasil direconnect', {
        description: `Webhook: ${data.webhookUrl}`,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal reconnect bot')
    } finally {
      setIsReconnecting(false)
    }
  }

  const overviewCards = config
    ? [
        {
          label: 'Mode Operasi',
          value: config.mode === 'AI' ? 'AI' : 'Button',
          icon: config.mode === 'AI' ? Bot : Grid3x3,
          hint: config.mode === 'AI' ? 'AI membalas chat otomatis' : 'Pelanggan pilih dari opsi'
        },
        {
          label: 'Midtrans',
          value: config.midtransIsProduction ? 'Production' : 'Sandbox',
          icon: Globe,
          hint: config.midtransIsProduction ? 'Pembayaran production' : 'Mode pengembangan'
        }
      ]
    : []

  const defaultValues = useMemo(() => {
    if (!config) return undefined
    return {
      mode: config.mode,
      midtransIsProduction: config.midtransIsProduction,
    }
  }, [config])

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Pengaturan"
        title="Konfigurasi bot"
        description="Atur mode operasi dan environment pembayaran bot Anda."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading && !config
          ? Array.from({ length: 2 }).map((_, i) => (
              <Surface key={i} className="p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="mt-3 h-6 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </Surface>
            ))
          : config
            ? overviewCards.map((metric) => {
                const Icon = metric.icon

                return (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    icon={Icon}
                    hint={metric.hint}
                    value={<span className={NEUTRAL_CHIP}>{metric.value}</span>}
                  />
                )
              })
            : (
              <Surface className="flex items-center gap-3 p-5 sm:col-span-2">
                <div className="rounded-md bg-muted p-2 text-muted-foreground">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-small-header">Belum ada konfigurasi</p>
                  <p className="text-caption text-muted-foreground">Isi form di bawah untuk memulai.</p>
                </div>
              </Surface>
            )}
      </div>

      {config && (
        <Surface className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-muted p-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-small-header">Koneksi Bot Telegram</p>
              <p className="text-caption text-muted-foreground">
                Reconnect jika bot tidak merespon atau terjadi masalah webhook.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            disabled={isReconnecting}
            onClick={() => void handleReconnect()}
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
            {isReconnecting ? 'Mereconnect...' : 'Reconnect Bot'}
          </Button>
        </Surface>
      )}

      <Surface className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-subsection-header">{config ? 'Perbarui Konfigurasi' : 'Buat Konfigurasi'}</h2>
            <p className="text-body-sm text-muted-foreground">
              {config
                ? 'Ubah pengaturan bot Anda. Perubahan akan diterapkan setelah disimpan.'
                : 'Isi detail di bawah untuk mengaktifkan bot Anda.'}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <BotConfigForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </Surface>
    </div>
  )
}
