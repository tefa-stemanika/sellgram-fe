'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MessageSquare, Activity, Send, Loader2, User, Clock, Plus, X, Check } from 'lucide-react'

import { cn, formatDate } from '@/lib/utils'
import {
  getTicketDetail,
  addComment,
  updateTicketStatus,
  updateTicketPriority,
  attachLabel,
  detachLabel,
  createLabel,
  type TicketDetail,
  type TicketStatus,
  type TicketPriority,
  type Label
} from '@/services/tickets'

const PRESET_COLORS = [
  '#f97316', '#2563eb', '#16a34a', '#dc2626', '#d97706',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e'
]

const INITIAL_LABEL_LIMIT = 10
const LABEL_INCREMENT = 5

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  WAITING_CUSTOMER: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  RESOLVED: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300'
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300'
}

type TicketDetailDialogProps = {
  token: string
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketUpdated: (ticket: TicketDetail) => void
  allLabels: Label[]
  onLabelCreated?: (label: Label) => void
}

export function TicketDetailDialog({ token, ticketId, open, onOpenChange, onTicketUpdated, allLabels, onLabelCreated }: TicketDetailDialogProps) {
  const [detail, setDetail] = useState<TicketDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0])
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const [labelLimit, setLabelLimit] = useState(INITIAL_LABEL_LIMIT)
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false)
  const labelScrollRef = useRef<HTMLDivElement>(null)

  const attachedLabelIds = new Set(detail?.labels.map((tl) => tl.labelId) ?? [])
  const availableLabels = allLabels.filter((l) => !attachedLabelIds.has(l.id))
  const visibleLabels = availableLabels.slice(0, labelLimit)
  const hasMore = visibleLabels.length < availableLabels.length

  useEffect(() => {
    const el = labelScrollRef.current
    if (!el) return
    const onScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
        setLabelLimit((prev) => prev + LABEL_INCREMENT)
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) setLabelLimit(INITIAL_LABEL_LIMIT)
  }, [open])

  useEffect(() => {
    if (!open || !ticketId || !token) {
      setDetail(null)
      return
    }

    const fetchDetail = async () => {
      setIsLoading(true)
      try {
        const data = await getTicketDetail(token, ticketId)
        setDetail(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat detail tiket')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDetail()
  }, [open, ticketId, token])

  const handleStatusChange = useCallback(
    async (newStatus: TicketStatus) => {
      if (!detail) return
      const previous = detail
      setDetail({ ...detail, status: newStatus })
      try {
        await updateTicketStatus(token, detail.id, newStatus)
        onTicketUpdated({ ...detail, status: newStatus })
      } catch (error) {
        setDetail(previous)
        toast.error(error instanceof Error ? error.message : 'Gagal mengubah status')
      }
    },
    [detail, token, onTicketUpdated]
  )

  const handlePriorityChange = useCallback(
    async (newPriority: TicketPriority) => {
      if (!detail) return
      const previous = detail
      setDetail({ ...detail, priority: newPriority })
      try {
        await updateTicketPriority(token, detail.id, newPriority)
        onTicketUpdated({ ...detail, priority: newPriority })
      } catch (error) {
        setDetail(previous)
        toast.error(error instanceof Error ? error.message : 'Gagal mengubah prioritas')
      }
    },
    [detail, token, onTicketUpdated]
  )

  const handleAttachLabel = useCallback(
    async (labelId: string) => {
      if (!detail) return
      const previous = detail
      const attachedLabel = allLabels.find((l) => l.id === labelId)
      if (!attachedLabel) return
      const optimistic: TicketDetail['labels'][0] = {
        ticketId: detail.id,
        labelId,
        label: attachedLabel
      }
      setDetail({ ...detail, labels: [...detail.labels, optimistic] })
      try {
        await attachLabel(token, detail.id, labelId)
        onTicketUpdated({ ...detail, labels: [...detail.labels, optimistic] })
      } catch (error) {
        setDetail(previous)
        toast.error(error instanceof Error ? error.message : 'Gagal menambahkan label')
      }
    },
    [detail, token, onTicketUpdated, allLabels]
  )

  const handleDetachLabel = useCallback(
    async (labelId: string) => {
      if (!detail) return
      const previous = detail
      setDetail({ ...detail, labels: detail.labels.filter((tl) => tl.labelId !== labelId) })
      try {
        await detachLabel(token, detail.id, labelId)
        onTicketUpdated({
          ...detail,
          labels: detail.labels.filter((tl) => tl.labelId !== labelId)
        })
      } catch (error) {
        setDetail(previous)
        toast.error(error instanceof Error ? error.message : 'Gagal menghapus label')
      }
    },
    [detail, token, onTicketUpdated]
  )

  const handleCreateLabel = useCallback(async () => {
    if (!newLabelName.trim() || isCreatingLabel) return
    setIsCreatingLabel(true)
    try {
      const label = await createLabel(token, newLabelName.trim(), newLabelColor)
      toast.success(`Label "${label.name}" berhasil dibuat`)
      setNewLabelName('')
      setShowCreateLabelDialog(false)
      onLabelCreated?.(label)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat label')
    } finally {
      setIsCreatingLabel(false)
    }
  }, [token, newLabelName, newLabelColor, isCreatingLabel, onLabelCreated])

  const handleSendComment = useCallback(async () => {
    if (!detail || !commentText.trim() || isSending) return
    setIsSending(true)
    try {
      const comment = await addComment(token, detail.id, commentText.trim())
      setDetail({
        ...detail,
        comments: [...detail.comments, comment]
      })
      setCommentText('')
      onTicketUpdated(detail)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim komentar')
    } finally {
      setIsSending(false)
    }
  }, [detail, commentText, isSending, token, onTicketUpdated])

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-0 p-0 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-600 shrink-0" />
        <div className="bg-white/30 backdrop-blur-xl dark:bg-white/5 flex flex-col flex-1 min-h-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-black tracking-tight">Detail Tiket</DialogTitle>
            <DialogDescription>Informasi lengkap dan aktivitas tiket.</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !detail ? null : (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="p-6 pb-0 space-y-4">
                <h2 className="text-lg font-bold leading-snug">{detail.title}</h2>

                {detail.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Select value={detail.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                    <SelectTrigger
                      className={cn('h-7 w-auto gap-1.5 border text-xs font-medium px-2', STATUS_COLORS[detail.status])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'] as TicketStatus[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={detail.priority} onValueChange={(v) => handlePriorityChange(v as TicketPriority)}>
                    <SelectTrigger
                      className={cn('h-7 w-auto gap-1.5 border text-xs font-medium px-2', PRIORITY_COLORS[detail.priority])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TicketPriority[]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {detail.labels.map((tl) => (
                    <span
                      key={tl.labelId}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium group cursor-pointer"
                      style={{
                        backgroundColor: `${tl.label.color}20`,
                        color: tl.label.color
                      }}
                      onClick={() => handleDetachLabel(tl.labelId)}>
                      {tl.label.name}
                      <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full border-dashed shrink-0"
                        title="Tambah label">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="start" sideOffset={8}>
                      <div className="px-2 pb-1.5 text-xs font-semibold text-muted-foreground">Pilih label</div>
                      <div ref={labelScrollRef} className="max-h-40 overflow-y-auto">
                        {availableLabels.length === 0 ? (
                          <p className="px-2 py-3 text-xs text-muted-foreground text-center">Semua label sudah terpasang</p>
                        ) : (
                          visibleLabels.map((l) => (
                            <DropdownMenuItem
                              key={l.id}
                              onSelect={(e) => {
                                e.preventDefault()
                                handleAttachLabel(l.id)
                              }}
                              className="gap-2 text-xs cursor-pointer">
                              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                              {l.name}
                            </DropdownMenuItem>
                          ))
                        )}
                        {hasMore && (
                          <p className="px-2 py-2 text-xs text-muted-foreground text-center">Memuat label lainnya...</p>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setShowCreateLabelDialog(true)
                        }}
                        className="gap-2 text-xs cursor-pointer">
                        <Plus className="h-3 w-3" />
                        Buat label baru
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {detail.customerName && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {detail.customerName}
                    </span>
                    {detail.customerContact && <span>{detail.customerContact}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(detail.createdAt)}
                    </span>
                  </div>
                )}

                {detail.order && (
                  <div className="rounded-xl border bg-white/20 p-3 backdrop-blur-xl dark:bg-white/5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Order #{detail.order.id}</span>
                      <Badge variant="outline">{detail.order.status}</Badge>
                    </div>
                  </div>
                )}
              </div>

              <Tabs defaultValue="comments" className="flex flex-col flex-1 min-h-0 mt-4">
                <div className="px-6">
                  <TabsList>
                    <TabsTrigger value="comments" className="gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      Komentar ({detail.comments.length})
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-1.5">
                      <Activity className="h-4 w-4" />
                      Aktivitas ({detail.activities.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4 min-h-0">
                  <TabsContent value="comments" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      {detail.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Belum ada komentar.</p>
                      ) : (
                        detail.comments.map((c) => (
                          <div key={c.id} className="rounded-xl border bg-white/20 p-3 backdrop-blur-xl dark:bg-white/5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-semibold">{c.user.name}</span>
                              <span className="text-[11px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                            {c.isInternal && (
                              <Badge variant="outline" className="mt-1.5 text-[10px]">
                                Internal
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Textarea
                        placeholder="Tulis komentar..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[60px] text-sm resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            void handleSendComment()
                          }
                        }}
                      />
                      <Button size="icon" onClick={handleSendComment} disabled={!commentText.trim() || isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-2 mt-0">
                    {detail.activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Belum ada aktivitas.</p>
                    ) : (
                      detail.activities.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-start gap-3 rounded-xl border bg-white/20 p-3 backdrop-blur-xl dark:bg-white/5">
                          <Activity className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-sm">{a.action}</p>
                            {a.metadata && (
                              <p className="text-xs text-muted-foreground mt-0.5">{JSON.stringify(a.metadata)}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(a.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

      <Dialog open={showCreateLabelDialog} onOpenChange={setShowCreateLabelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat label baru</DialogTitle>
            <DialogDescription>Buat label baru untuk tiket ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nama label"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleCreateLabel()
                }
              }}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className="h-6 w-6 rounded-full border border-white/30 shrink-0 transition-all hover:scale-110"
                  style={{ backgroundColor: c }}
                  onClick={() => setNewLabelColor(c)}>
                  {newLabelColor === c && <Check className="h-4 w-4 mx-auto text-white drop-shadow" />}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowCreateLabelDialog(false)}>
                Batal
              </Button>
              <Button
                size="sm"
                disabled={!newLabelName.trim() || isCreatingLabel}
                onClick={() => void handleCreateLabel()}>
                {isCreatingLabel ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Buat'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
