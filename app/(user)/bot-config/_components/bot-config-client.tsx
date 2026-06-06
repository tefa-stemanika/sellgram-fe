'use client'

import { useEffect, useState } from 'react'
import { Bot, Cpu, Globe, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
      const payload: BotConfigPayload = { ...values, botMode: 'webhook' }

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

  const overviewCards = config
    ? [
        {
          title: 'AI Status',
          value: config.aiEnabled ? 'Aktif' : 'Nonaktif',
          icon: Cpu,
          gradient: config.aiEnabled ? 'from-emerald-500 to-emerald-600' : 'from-slate-400 to-slate-500',
          iconBg: config.aiEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          desc: config.aiEnabled ? `Model: ${config.geminiModel}` : 'AI tidak digunakan'
        },
        {
          title: 'AI Model',
          value: config.geminiModel,
          icon: Bot,
          gradient: 'from-violet-500 to-violet-600',
          iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
          desc: 'Google Gemini model untuk AI'
        },
        {
          title: 'Midtrans',
          value: config.midtransIsProduction ? 'Production' : 'Sandbox',
          icon: Globe,
          gradient: config.midtransIsProduction ? 'from-amber-500 to-amber-600' : 'from-sky-500 to-sky-600',
          iconBg: config.midtransIsProduction ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
          desc: config.midtransIsProduction ? 'Pembayaran production' : 'Mode pengembangan'
        }
      ]
    : []

  return (
    <div className="space-y-8">
      <header
        className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Konfigurasi
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Konfigurasi{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Bot
          </span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Atur mode operasi, kecerdasan buatan, dan environment pembayaran bot Anda.
        </p>
      </header>

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.1s' }}>
        {isLoading && !config
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm">
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-300" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="mt-3 h-6 w-32" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : config
            ? overviewCards.map((metric, i) => {
                const Icon = metric.icon

                return (
                  <Card
                    key={metric.title}
                    className="group/card overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      animation: 'fadeInUp 0.4s ease both',
                      animationDelay: `${0.15 + i * 0.08}s`
                    }}>
                    <div className={`h-1.5 w-full bg-gradient-to-r ${metric.gradient}`} />
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
                        <div className={`rounded-lg ${metric.iconBg} p-2 transition-all duration-300 group-hover/card:scale-110`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-3 text-xl font-bold tracking-tight">{metric.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{metric.desc}</p>
                    </CardContent>
                  </Card>
                )
              })
            : (
              <Card
                className="col-span-full overflow-hidden border-0 shadow-sm"
                style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.15s' }}>
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-600" />
                <CardContent className="flex items-center gap-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 p-5 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Belum ada konfigurasi</p>
                    <p className="text-xs text-muted-foreground">Isi form di bawah untuk memulai.</p>
                  </div>
                </CardContent>
              </Card>
            )}
      </div>

      <Card
        className="overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.2s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-600" />
        <CardContent className="bg-white/30 p-6 backdrop-blur-xl dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{config ? 'Perbarui Konfigurasi' : 'Buat Konfigurasi'}</h2>
              <p className="text-sm text-muted-foreground">
                {config
                  ? 'Ubah pengaturan bot Anda. Perubahan akan diterapkan setelah disimpan.'
                  : 'Isi detail di bawah untuk mengaktifkan bot Anda.'}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <BotConfigForm
              defaultValues={
                config
                  ? {
                      aiEnabled: config.aiEnabled,
                      geminiModel: config.geminiModel,
                      midtransIsProduction: config.midtransIsProduction
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

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
