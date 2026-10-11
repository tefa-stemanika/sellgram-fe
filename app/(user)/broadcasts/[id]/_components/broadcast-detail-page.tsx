'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Eye,
  History,
  Loader2,
  Pause,
  Play,
  Radio,
  SendHorizonal,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from '@/components/shared/metric-card'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { TelegramChatPreview } from '@/components/shared/telegram-chat-preview'
import { cn, formatDateTime } from '@/lib/utils'
import {
  getBroadcast,
  deleteBroadcast,
  sendBroadcast,
  pauseBroadcast,
  resumeBroadcast,
  cancelBroadcast,
  getRecipients,
  previewRender,
  dryRun,
} from '@/services/broadcast'
import type { BroadcastCampaign, BroadcastRecipient, RecipientStatus } from '@/schemas/broadcast'
import { RECIPIENT_STATUS_LABELS } from '@/schemas/broadcast'

type BroadcastDetailPageProps = {
  broadcastId: string
  token: string
}

const RECIPIENT_TABS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'SENT', label: 'Terkirim' },
  { value: 'FAILED', label: 'Gagal' }
] as const

const RECIPIENT_BADGE: Record<RecipientStatus, string> = {
  PENDING: 'border-warning/25 bg-warning/12 text-warning',
  SENT: 'border-success/25 bg-success/12 text-success',
  FAILED: 'border-error/25 bg-error/12 text-error',
}

export function BroadcastDetailPage({ broadcastId, token }: BroadcastDetailPageProps) {
  const router = useRouter()
  const [broadcast, setBroadcast] = useState<BroadcastCampaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null)
  const [renderPreview, setRenderPreview] = useState<string | null>(null)
  const [renderErrors, setRenderErrors] = useState<string[]>([])
  const [isRenderLoading, setIsRenderLoading] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<{ invalidCount: number; total: number } | null>(null)
  const [isDryRunLoading, setIsDryRunLoading] = useState(false)

  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([])
  const [recipientMeta, setRecipientMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)
  const [recipientTab, setRecipientTab] = useState('ALL')
  const [recipientPage, setRecipientPage] = useState(1)

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    getBroadcast(token, broadcastId)
      .then(setBroadcast)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Gagal memuat detail'))
      .finally(() => setIsLoading(false))
  }, [broadcastId, token])

  const fetchRecipients = useCallback(async () => {
    if (!token) return
    setIsLoadingRecipients(true)
    try {
      const result = await getRecipients(token, broadcastId, {
        page: recipientPage,
        limit: 20,
        status: recipientTab === 'ALL' ? undefined : recipientTab
      })
      setRecipients(result.data)
      setRecipientMeta({
        total: result.meta.total,
        page: result.meta.page,
        totalPages: result.meta.totalPages
      })
    } catch {
      // silent
    } finally {
      setIsLoadingRecipients(false)
    }
  }, [token, broadcastId, recipientTab, recipientPage])

  useEffect(() => {
    if (!token) return
    void fetchRecipients()
  }, [fetchRecipients, token])

  const handleTabChange = (value: string) => {
    setRecipientTab(value)
    setRecipientPage(1)
  }

  const handleAction = async (action: string) => {
    if (!broadcast || !token) return
    setIsLoadingAction(action)
    try {
      const actions: Record<string, () => Promise<any>> = {
        send: () => sendBroadcast(token, broadcast.id),
        pause: () => pauseBroadcast(token, broadcast.id),
        resume: () => resumeBroadcast(token, broadcast.id),
        cancel: () => cancelBroadcast(token, broadcast.id),
        delete: () => deleteBroadcast(token, broadcast.id)
      }

      const labels: Record<string, string> = {
        send: 'Broadcast mulai dikirim',
        pause: 'Broadcast dihentikan sementara',
        resume: 'Broadcast dilanjutkan',
        cancel: 'Broadcast dibatalkan',
        delete: 'Broadcast berhasil dihapus'
      }

      await actions[action]()
      toast.success(labels[action] || 'Berhasil')
      if (action === 'delete') {
        router.push('/broadcasts')
        return
      }
      const updated = await getBroadcast(token, broadcastId)
      setBroadcast(updated)
      void fetchRecipients()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memproses')
    } finally {
      setIsLoadingAction(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!broadcast) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-body text-muted-foreground">Broadcast tidak ditemukan.</p>
        <Button asChild variant="outline">
          <Link href="/broadcasts">Kembali</Link>
        </Button>
      </div>
    )
  }

  const handlePreviewRender = async () => {
    if (!token || !broadcast) return
    setIsRenderLoading(true)
    try {
      const result = await previewRender(token, broadcast.id)
      setRenderPreview(result.rendered)
      setRenderErrors(result.errors)
      toast.success('Preview render berhasil')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal preview render')
    } finally {
      setIsRenderLoading(false)
    }
  }

  const handleDryRun = async () => {
    if (!token || !broadcast) return
    setIsDryRunLoading(true)
    try {
      const result = await dryRun(token, broadcast.id)
      setDryRunResult({ invalidCount: result.invalidCount, total: result.total })
      if (result.invalidCount > 0) {
        toast.warning(`${result.invalidCount} dari ${result.total} customer gagal validasi`)
      } else {
        toast.success(`Semua ${result.total} customer valid`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal dry-run')
    } finally {
      setIsDryRunLoading(false)
    }
  }

  const canSend = broadcast.status === 'DRAFT' || broadcast.status === 'SCHEDULED'
  const canPause = broadcast.status === 'SENDING'
  const canResume = broadcast.status === 'PAUSED'
  const canCancel = broadcast.status === 'SENDING' || broadcast.status === 'SCHEDULED'
  const canEdit = broadcast.status === 'DRAFT' || broadcast.status === 'SCHEDULED'

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Marketing"
        title="Detail broadcast"
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
            <Link href="/broadcasts">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />

      <Surface className="animate-fade-in-up p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-section-header">{broadcast.name}</h2>
          <StatusBadge kind="broadcast" value={broadcast.status} withDot />
        </div>

        <div className="mt-4 flex shrink-0 flex-wrap gap-1.5">
          {canSend && (
            <Button
              variant="default"
              size="sm"
              disabled={isLoadingAction === 'send'}
              onClick={() => void handleAction('send')}>
              {isLoadingAction === 'send' ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <SendHorizonal className="mr-1 h-3.5 w-3.5" />
              )}
              Kirim
            </Button>
          )}
          {canPause && (
            <Button
              variant="outline"
              size="sm"
              disabled={isLoadingAction === 'pause'}
              onClick={() => void handleAction('pause')}>
              {isLoadingAction === 'pause' ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pause className="mr-1 h-3.5 w-3.5" />
              )}
              Pause
            </Button>
          )}
          {canResume && (
            <Button
              variant="outline"
              size="sm"
              disabled={isLoadingAction === 'resume'}
              onClick={() => void handleAction('resume')}>
              {isLoadingAction === 'resume' ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1 h-3.5 w-3.5" />
              )}
              Lanjutkan
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoadingAction === 'cancel'}
              onClick={() => void handleAction('cancel')}>
              {isLoadingAction === 'cancel' ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="mr-1 h-3.5 w-3.5" />
              )}
              Batalkan
            </Button>
          )}
          {canEdit && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoadingAction === 'delete'}
              onClick={() => void handleAction('delete')}>
              {isLoadingAction === 'delete' ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1 h-3.5 w-3.5" />
              )}
              Hapus
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isRenderLoading}
            onClick={() => void handlePreviewRender()}
          >
            {isRenderLoading ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="mr-1 h-3.5 w-3.5" />
            )}
            Preview render
          </Button>
          {(canPause || canSend) && (
            <Button
              variant="outline"
              size="sm"
              disabled={isDryRunLoading}
              onClick={() => void handleDryRun()}
            >
              {isDryRunLoading ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="mr-1 h-3.5 w-3.5" />
              )}
              Dry-run
            </Button>
          )}
        </div>

        {renderPreview && (
          <div className="mt-4 space-y-2">
            <p className="text-small-header text-muted-foreground">Preview render</p>
            <TelegramChatPreview lines={[renderPreview]} title="Preview render" />
            {renderErrors.length > 0 && (
              <div className="space-y-1">
                {renderErrors.map((err, i) => (
                  <p key={i} className="text-caption text-error">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {dryRunResult && (
          <p
            className={cn(
              'mt-3 text-caption',
              dryRunResult.invalidCount > 0 ? 'text-error' : 'text-success'
            )}>
            Dry-run: <span className="font-mono tabular text-mono-data">{dryRunResult.invalidCount}</span> invalid dari{' '}
            <span className="font-mono tabular text-mono-data">{dryRunResult.total}</span> sample
          </p>
        )}

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard icon={Users} label="Total penerima" value={String(broadcast.totalCustomers)} />
          <MetricCard icon={SendHorizonal} label="Terkirim" value={String(broadcast.sentCount ?? 0)} />
          <MetricCard icon={XCircle} label="Gagal" value={String(broadcast.failedCount ?? 0)} />
          <MetricCard
            icon={CalendarClock}
            label="Menunggu"
            value={String(
              broadcast.pendingCount ??
                broadcast.totalCustomers - (broadcast.sentCount ?? 0) - (broadcast.failedCount ?? 0)
            )}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard icon={Radio} label="Channel" value="Telegram" />
          <MetricCard icon={Clock} label="Dibuat" value={formatDateTime(broadcast.createdAt)} />
          {broadcast.scheduledAt && (
            <MetricCard icon={CalendarClock} label="Terjadwal" value={formatDateTime(broadcast.scheduledAt)} />
          )}
          {broadcast.sentAt && (
            <MetricCard icon={SendHorizonal} label="Dikirim" value={formatDateTime(broadcast.sentAt)} />
          )}
          {broadcast.updatedAt && (
            <MetricCard icon={History} label="Diperbarui" value={formatDateTime(broadcast.updatedAt)} />
          )}
        </div>
      </Surface>

      <Surface className="p-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="message" className="border-0">
            <AccordionTrigger className="py-0 hover:no-underline">
              <h2 className="text-section-header">Pesan broadcast</h2>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <TelegramChatPreview lines={[broadcast.message]} title="Pesan broadcast" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Surface>

      <Surface className="p-6">
        <h2 className="mb-4 text-section-header">Daftar penerima</h2>

        <Tabs value={recipientTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            {RECIPIENT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {RECIPIENT_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {isLoadingRecipients ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recipients.length === 0 ? (
                <p className="py-8 text-center text-body-sm text-muted-foreground">
                  Belum ada penerima dengan status{' '}
                  <strong>
                    {RECIPIENT_STATUS_LABELS[tab.value as keyof typeof RECIPIENT_STATUS_LABELS] ?? tab.label.toLowerCase()}
                  </strong>
                  .
                </p>
              ) : (
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-medium">{r.customer.name || r.customer.username || '-'}</p>
                        <p className="truncate text-caption tabular text-muted-foreground">
                          {r.customer.telegramId && `@${r.customer.username ?? r.customer.telegramId}`}
                          {r.sentAt && <> &middot; {formatDateTime(r.sentAt)}</>}
                          {r.error && <span className="text-error"> &middot; {r.error}</span>}
                        </p>
                      </div>
                      <Badge variant="outline" className={RECIPIENT_BADGE[r.status]}>
                        {RECIPIENT_STATUS_LABELS[r.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {recipientMeta.totalPages > 1 && (
                <DataTablePagination
                  className="mt-4 px-0 pt-4"
                  page={recipientMeta.page}
                  totalPages={recipientMeta.totalPages}
                  onPageChange={(p) => setRecipientPage(Math.max(1, p))}
                  total={recipientMeta.total}
                  totalLabel="penerima"
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Surface>
    </div>
  )
}
