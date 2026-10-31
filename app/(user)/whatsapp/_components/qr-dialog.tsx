'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Copy, RefreshCw, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { copyToClipboard } from '@/lib/utils'
import { getWhatsAppConnect, getWhatsAppStatus, type WhatsAppQr } from '@/services/whatsapp'

type QrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  initialQr?: WhatsAppQr | null
  number?: string
  onConnected: () => void
}

const POLL_INTERVAL_MS = 4000

export function QrDialog({ open, onOpenChange, token, initialQr, number, onConnected }: QrDialogProps) {
  const [qr, setQr] = useState<WhatsAppQr | null>(initialQr ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const connectedRef = useRef(false)

  useEffect(() => {
    if (open) setQr(initialQr ?? null)
  }, [open, initialQr])

  const refreshQr = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await getWhatsAppConnect(token, number)
      if (res.connected) {
        connectedRef.current = true
        onConnected()
        return
      }
      setQr({ base64: res.base64, code: res.code, pairingCode: res.pairingCode, count: res.count })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat QR')
    } finally {
      setIsLoading(false)
    }
  }, [token, number, onConnected])

  useEffect(() => {
    if (!open) {
      connectedRef.current = false
      return
    }
    if (!qr?.base64 && !qr?.code && !qr?.pairingCode) void refreshQr()

    const interval = setInterval(async () => {
      try {
        const status = await getWhatsAppStatus(token)
        if (status.connected && !connectedRef.current) {
          connectedRef.current = true
          toast.success('WhatsApp berhasil terhubung')
          onConnected()
        }
      } catch {
        // polling diam — status berikutnya akan mencoba lagi
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token, refreshQr])

  const handleCopyCode = async (value: string) => {
    const ok = await copyToClipboard(value)
    if (ok) toast.success('Kode pairing disalin')
    else toast.error('Gagal menyalin kode. Silakan copy manual.')
  }

  const hasQr = Boolean(qr?.base64 || qr?.code || qr?.pairingCode)
  // QR dikirim runtime sebagai data URL — next/image tidak mendukung src data:
  const qrSrc = qr?.base64 || (qr?.code ? `data:image/png;base64,${qr.code}` : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hubungkan WhatsApp</DialogTitle>
          <DialogDescription>
            Buka WhatsApp di ponsel Anda, pilih Perangkat Tertaut, lalu pindai QR ini. QR berlaku singkat &mdash; muat ulang
            bila kedaluwarsa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {isLoading && !hasQr ? (
            <Skeleton className="h-56 w-56 rounded-lg" />
          ) : qrSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element -- data URL QR */
            <img src={qrSrc} alt="QR code untuk menghubungkan WhatsApp" className="h-56 w-56 rounded-lg bg-white p-2" />
          ) : hasQr ? null : (
            <p className="text-body-sm text-muted-foreground">QR tidak tersedia. Coba muat ulang.</p>
          )}

          {qr?.pairingCode && (
            <div className="w-full rounded-lg border border-border bg-muted/50 p-3 text-center">
              <p className="text-caption text-muted-foreground">Atau gunakan kode pairing ini</p>
              <p className="text-mono-data mt-1 break-all">{qr.pairingCode}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 gap-1.5"
                onClick={() => void handleCopyCode(qr.pairingCode as string)}
              >
                <Copy className="h-3.5 w-3.5" />
                Salin kode
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
              onClick={() => void refreshQr()}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Muat ulang QR
            </Button>
            <span className="text-caption text-muted-foreground">
              <Smartphone className="mr-1 inline h-3.5 w-3.5" />
              {qr?.count ? ` percobaan ke-${qr.count}` : 'Menunggu pemindaian'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
