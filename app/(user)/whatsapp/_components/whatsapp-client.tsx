'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Link2, MessageCircle, QrCode, RefreshCw, Server, Unplug, Webhook } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getWhatsAppConnect,
  getWhatsAppStatus,
  restartWhatsApp,
  createWhatsAppInstance,
  type WhatsAppQr,
  type WhatsAppStatus
} from '@/services/whatsapp'

import { CreateInstanceDialog } from './create-instance-dialog'
import { QrDialog } from './qr-dialog'

const ERROR_LABELS: Record<string, string> = {
  instance_missing: 'Instance belum dibuat. Buat instance terlebih dahulu.',
  invalid_number: 'Format nomor tidak valid. Gunakan angka saja, contoh 6281234567890.',
  instance_limit_reached: 'Batas 1 instance per akun tercapai. Putuskan instance lama sebelum menghubungkan nomor lain.',
  webhook_secret_missing: 'Secret webhook belum dikonfigurasi di sisi server.',
  server_unreachable: 'Server Evolution tidak dapat dihubungi, coba lagi.',
  create_failed: 'Server Evolution tidak dapat dihubungi, coba lagi.',
  connect_failed: 'Server Evolution tidak dapat dihubungi, coba lagi.'
}

type WhatsAppClientProps = {
  token: string
}

function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    for (const [code, label] of Object.entries(ERROR_LABELS)) {
      if (error.message.toLowerCase().includes(code)) return `${label}. ${error.message}`
    }
    return error.message
  }
  return fallback
}

export function WhatsAppClient({ token }: WhatsAppClientProps) {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrData, setQrData] = useState<WhatsAppQr | null>(null)
  const [qrNumber, setQrNumber] = useState<string | undefined>(undefined)

  const refresh = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await getWhatsAppStatus(token)
      setStatus(data)
      setLoadError(null)
    } catch (error) {
      setLoadError(errorText(error, 'Gagal memuat status WhatsApp'))
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setStatus(null)
      return
    }
    void refresh()
  }, [token, refresh])

  const openQr = (qr?: WhatsAppQr | null, number?: string) => {
    setQrData(qr ?? null)
    setQrNumber(number)
    setQrOpen(true)
  }

  const handleCreate = async (number?: string) => {
    if (!token) return
    setIsCreating(true)
    try {
      const res = await createWhatsAppInstance(token, number)
      setIsCreateOpen(false)
      toast.success(res.created ? 'Instance WhatsApp berhasil dibuat' : 'Instance sudah tersedia')
      if (res.qr?.base64 || res.qr?.code || res.qr?.pairingCode) {
        openQr(res.qr, number)
      } else {
        void refresh()
      }
    } catch (error) {
      toast.error(errorText(error, 'Gagal membuat instance'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleConnect = async () => {
    if (!token) return
    setIsConnecting(true)
    try {
      const res = await getWhatsAppConnect(token)
      if (res.connected) {
        toast.success('WhatsApp sudah terhubung')
        void refresh()
        return
      }
      openQr({ base64: res.base64, code: res.code, pairingCode: res.pairingCode, count: res.count })
    } catch (error) {
      toast.error(errorText(error, 'Gagal mengambil QR'))
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRestart = async () => {
    if (!token) return
    setIsRestarting(true)
    try {
      const res = await restartWhatsApp(token)
      setStatus(res.status)
      setLoadError(null)
      if (res.restarted) {
        toast.success('Instance direstart dan webhook disinkronkan')
      } else {
        toast.warning(res.restartError ?? 'Webhook disinkronkan, tetapi instance gagal direstart')
      }
    } catch (error) {
      toast.error(errorText(error, 'Gagal merestart instance'))
    } finally {
      setIsRestarting(false)
    }
  }

  const stateBadge = status?.state ?? (status ? 'close' : '')
  const webhookUnsynced = status?.webhook?.synced === false
  const needsCreate = !status?.configured || status.needsCreate || !status.instanceExists

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Pengaturan"
        title="Bot WhatsApp"
        description="Hubungkan nomor WhatsApp bisnis Anda lewat Evolution API dan pantau status instance."
      />

      {isLoading && !status ? (
        <Surface className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </Surface>
      ) : status ? (
        <Surface className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-muted p-2 text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-small-header">Instance WhatsApp</h2>
                  {status.configured && status.instanceExists && (
                    <StatusBadge kind="whatsapp-state" value={stateBadge} withDot />
                  )}
                  {webhookUnsynced && status.instanceExists && <StatusBadge kind="bot-health" value="DEGRADED" />}
                </div>
                <p className="text-caption mt-0.5 text-muted-foreground">
                  {status.configured
                    ? status.instanceExists
                      ? `Instance ${status.instance ?? '-'}${status.instanceSource === 'env' ? ' (fallback env)' : ''} · batas ${status.instanceLimit ?? 1} instance per akun`
                      : `Instance belum dibuat. Batas ${status.instanceLimit ?? 1} instance per akun.`
                    : 'Credential Evolution API belum dikonfigurasi.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" disabled={isLoading} onClick={() => void refresh()}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Muat status
              </Button>
            </div>
          </div>

          {status.configured ? (
            <>
              <ul className="mt-4 divide-y divide-border">
                <li className="flex items-center gap-3 py-2.5 first:pt-0">
                  <Server className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="w-36 shrink-0 text-body-sm">Server Evolution</span>
                  <span className="min-w-0 flex-1 truncate text-body-sm text-muted-foreground" title={status.apiUrl ?? '-'}>
                    {status.apiUrl ?? '-'}
                  </span>
                </li>
                <li className="flex items-center gap-3 py-2.5">
                  <Webhook className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="w-36 shrink-0 text-body-sm">Webhook</span>
                  <span
                    className="min-w-0 flex-1 truncate text-body-sm text-muted-foreground"
                    title={status.webhook?.url ?? '-'}
                  >
                    {!status.instanceExists
                      ? 'Terpasang otomatis saat instance dibuat'
                      : status.webhook?.enabled
                        ? (status.webhook.url ?? '-')
                        : 'Tidak aktif'}
                    {status.instanceExists && webhookUnsynced && ' — belum sinkron'}
                  </span>
                </li>
                {status.instanceExists && (
                  <li className="flex items-center gap-3 py-2.5 last:pb-0">
                    <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="w-36 shrink-0 text-body-sm">Kepemilikan</span>
                    <span className="min-w-0 flex-1 text-body-sm text-muted-foreground">
                      {status.ownInstance ? 'Instance milik akun ini' : 'Instance dipakai konfigurasi lain'}
                    </span>
                  </li>
                )}
              </ul>

              {status.errors?.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {status.errors.map((code) => (
                    <li key={code} className="flex items-center gap-2 text-caption">
                      <span className="size-1.5 shrink-0 rounded-full bg-error" aria-hidden />
                      <span className="font-medium text-error">{ERROR_LABELS[code] ?? code}</span>
                    </li>
                  ))}
                </ul>
              )}

              {status.instanceExists && webhookUnsynced && (
                <p className="mt-3 flex items-start gap-2 rounded-md border border-warning/25 bg-warning/12 p-3 text-body-sm text-warning">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Webhook belum sinkron dengan Evolution. Pesan masuk mungkin tidak diproses sampai webhook disinkronkan.
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 text-body-sm text-muted-foreground">
              Hubungi penyedia layanan untuk mengisi <span className="text-mono-data">EVOLUTION_API_URL</span> dan{' '}
              <span className="text-mono-data">EVOLUTION_API_KEY</span>, lalu muat status ulang.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {needsCreate ? (
              <Button size="sm" className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <MessageCircle className="h-4 w-4" />
                Hubungkan WhatsApp
              </Button>
            ) : (
              <Button size="sm" className="gap-2" disabled={isConnecting} onClick={() => void handleConnect()}>
                <QrCode className="h-4 w-4" />
                {isConnecting ? 'Mengambil QR...' : status.connected ? 'Perbarui QR' : 'Hubungkan WhatsApp'}
              </Button>
            )}
            {status.instanceExists && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isRestarting}
                onClick={() => void handleRestart()}
              >
                <Unplug className={`h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
                {isRestarting ? 'Memproses...' : webhookUnsynced ? 'Sinkronkan webhook' : 'Restart instance'}
              </Button>
            )}
          </div>
        </Surface>
      ) : (
        <Surface className="p-5">
          <p className="text-body-sm text-muted-foreground">{loadError ?? 'Status WhatsApp tidak tersedia.'}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4" />
            Coba lagi
          </Button>
        </Surface>
      )}

      <CreateInstanceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isSubmitting={isCreating}
        onSubmit={handleCreate}
      />
      <QrDialog
        open={qrOpen}
        onOpenChange={(next) => {
          setQrOpen(next)
          if (!next) void refresh()
        }}
        token={token}
        initialQr={qrData}
        number={qrNumber}
        onConnected={() => {
          setQrOpen(false)
          void refresh()
        }}
      />
    </div>
  )
}
