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
import { formatDateTime } from '@/lib/utils'
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
import type { BroadcastCampaign, BroadcastRecipient, BroadcastStatus } from '@/schemas/broadcast'
import { getBroadcastStatusLabel, RECIPIENT_STATUS_LABELS } from '@/schemas/broadcast'

const STATUS_BADGE: Record<BroadcastStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  SENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  SENT: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  PAUSED: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300',
  FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300'
}

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
        <p className="text-muted-foreground">Broadcast tidak ditemukan.</p>
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
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Broadcast</span>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="bg-white p-6 dark:bg-card">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Link href="/broadcasts">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{broadcast.name}</h1>
                <Badge variant="outline" className={`${STATUS_BADGE[broadcast.status] || ''}`}>
                  {getBroadcastStatusLabel(broadcast.status)}
                </Badge>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-1.5">
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
                  onClick={() => void handleAction('cancel')}
                  className="text-white">
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
                  onClick={() => void handleAction('delete')}
                  className="text-white">
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
                Preview Render
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
                  Dry-Run
                </Button>
              )}
            </div>
          </div>

          {renderPreview && (
            <div className="mt-4 overflow-hidden rounded-xl">
              <div className="border-b bg-white/10 px-4 py-2 text-xs font-medium text-muted-foreground bg-white">Preview Render</div>
              <div
                className="p-4 min-h-[100px] flex items-start"
                style={{
                  backgroundImage: 'url(/images/telegram-chat-background.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 shadow-sm text-gray-900">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{renderPreview}</p>
                  {renderErrors.length > 0 && (
                    <div className="mt-2 space-y-1 border-t pt-2">
                      {renderErrors.map((err, i) => (
                        <p key={i} className="text-xs text-red-500">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {dryRunResult && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className={dryRunResult.invalidCount > 0 ? 'text-red-500' : 'text-emerald-600'}>
                Dry-run: {dryRunResult.invalidCount} invalid dari {dryRunResult.total} sample
              </span>
            </div>
          )}

          <Separator className="my-5" />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Penerima"
              value={String(broadcast.totalCustomers)}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={SendHorizonal}
              label="Terkirim"
              value={String(broadcast.sentCount ?? 0)}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={XCircle}
              label="Gagal"
              value={String(broadcast.failedCount ?? 0)}
              gradient="from-red-500 to-rose-600"
            />
            <StatCard
              icon={CalendarClock}
              label="Menunggu"
              value={String(
                broadcast.pendingCount ??
                  broadcast.totalCustomers - (broadcast.sentCount ?? 0) - (broadcast.failedCount ?? 0)
              )}
              gradient="from-amber-500 to-orange-600"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Radio} label="Channel" value="Telegram" gradient="from-blue-500 to-cyan-600" />
            <StatCard
              icon={Clock}
              label="Dibuat"
              value={formatDateTime(broadcast.createdAt)}
              gradient="from-primary to-purple-600"
            />
            {broadcast.scheduledAt && (
              <StatCard
                icon={CalendarClock}
                label="Terjadwal"
                value={formatDateTime(broadcast.scheduledAt)}
                gradient="from-amber-500 to-orange-600"
              />
            )}
            {broadcast.sentAt && (
              <StatCard
                icon={SendHorizonal}
                label="Dikirim"
                value={formatDateTime(broadcast.sentAt)}
                gradient="from-emerald-500 to-teal-600"
              />
            )}
            {broadcast.updatedAt && (
              <StatCard
                icon={History}
                label="Diperbarui"
                value={formatDateTime(broadcast.updatedAt)}
                gradient="from-violet-500 to-purple-600"
              />
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="bg-white p-6 dark:bg-card">
          <Accordion type="single" collapsible>
            <AccordionItem value="message" className="border-0">
              <AccordionTrigger className="py-0 hover:no-underline">
                <h2 className="text-section-header font-semibold">Pesan Broadcast</h2>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div
                  className="rounded-xl p-4 min-h-[100px] flex items-start"
                  style={{
                    backgroundImage: 'url(/images/telegram-chat-background.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 shadow-sm text-gray-900">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{broadcast.message}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-600" />
        <div className="bg-white p-6 dark:bg-card">
          <h2 className="mb-4 text-section-header font-semibold">Daftar Penerima</h2>

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
                  <p className="py-8 text-center text-sm text-muted-foreground">
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
                        className="flex items-center justify-between rounded-lg border bg-white/50 px-4 py-3 dark:bg-card/50">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.customer.name || r.customer.username || '-'}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.customer.telegramId && `@${r.customer.username ?? r.customer.telegramId}`}
                            {r.sentAt && <> &middot; {formatDateTime(r.sentAt)}</>}
                            {r.error && <span className="text-red-500"> &middot; {r.error}</span>}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            r.status === 'SENT'
                              ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                              : r.status === 'FAILED'
                                ? 'border-red-200 bg-red-100 text-red-700'
                                : 'border-amber-200 bg-amber-100 text-amber-700'
                          }>
                          {RECIPIENT_STATUS_LABELS[r.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {recipientMeta.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                      Halaman {recipientMeta.page} dari {recipientMeta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={recipientPage <= 1}
                        onClick={() => setRecipientPage((p) => Math.max(1, p - 1))}>
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={recipientPage >= recipientMeta.totalPages}
                        onClick={() => setRecipientPage((p) => p + 1)}>
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  gradient: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white/50 backdrop-blur-xl dark:bg-card/50">
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </div>
        <p className="mt-1 text-lg font-bold">{value}</p>
      </div>
    </div>
  )
}
