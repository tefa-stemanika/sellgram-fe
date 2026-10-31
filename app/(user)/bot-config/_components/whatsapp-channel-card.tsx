'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { getWhatsAppStatus, type WhatsAppStatus } from '@/services/whatsapp'

type WhatsAppChannelCardProps = {
  token: string
}

export function WhatsAppChannelCard({ token }: WhatsAppChannelCardProps) {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus(null)
      return
    }

    let cancelled = false
    getWhatsAppStatus(token)
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch(() => {
        if (!cancelled) setStatus(null)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const stateValue = status ? (status.connected ? 'OPEN' : (status.state ?? 'CLOSE')) : null

  return (
    <Surface className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-muted p-2 text-muted-foreground">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-small-header">Koneksi Bot WhatsApp</p>
          <p className="text-caption text-muted-foreground">
            {status?.configured
              ? 'Pantau instance Evolution dan sinkronisasi webhook di halaman WhatsApp.'
              : 'Credential Evolution API belum dikonfigurasi untuk akun ini.'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {status?.configured && <StatusBadge kind="whatsapp-state" value={stateValue} withDot />}
        <Button variant="outline" size="sm" asChild>
          <Link href="/whatsapp">Kelola</Link>
        </Button>
      </div>
    </Surface>
  )
}
