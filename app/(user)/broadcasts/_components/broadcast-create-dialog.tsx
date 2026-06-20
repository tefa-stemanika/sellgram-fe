'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Radio, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createBroadcastSchema, type BroadcastFilters, type CreateBroadcastFormValues } from '@/schemas/broadcast'
import type { BroadcastCampaign } from '@/schemas/broadcast'

type BroadcastCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateBroadcastFormValues & { filters?: BroadcastFilters }) => void
  onPreview: (filters: BroadcastFilters) => Promise<{ total: number } | null>
  broadcast?: BroadcastCampaign | null
  isLoading?: boolean
  isPreviewLoading?: boolean
  previewTotal?: number | null
}

export function BroadcastCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  onPreview,
  broadcast,
  isLoading = false,
  isPreviewLoading = false,
  previewTotal,
}: BroadcastCreateDialogProps) {
  const isEditMode = Boolean(broadcast)

  const form = useForm<CreateBroadcastFormValues>({
    resolver: zodResolver(createBroadcastSchema),
    defaultValues: {
      name: '',
      message: '',
      channel: 'TELEGRAM',
      scheduledAt: '',
    },
  })

  const [filterHasTelegram, setFilterHasTelegram] = useState(true)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterTotalSpentMin, setFilterTotalSpentMin] = useState('')

  useEffect(() => {
    if (open) {
      form.reset({
        name: broadcast?.name ?? '',
        message: broadcast?.message ?? '',
        channel: broadcast?.channel ?? 'TELEGRAM',
        scheduledAt: broadcast?.scheduledAt
          ? broadcast.scheduledAt.slice(0, 16)
          : '',
      })
      if (!broadcast) {
        setFilterHasTelegram(true)
        setFilterSearch('')
        setFilterTotalSpentMin('')
      }
    }
  }, [open, broadcast, form])

  const buildFilters = (): BroadcastFilters => {
    const filters: BroadcastFilters = {}
    if (filterHasTelegram) filters.hasTelegram = 'true'
    if (filterSearch) filters.search = filterSearch
    if (filterTotalSpentMin) filters.totalSpentMin = Number(filterTotalSpentMin)
    return filters
  }

  const handlePreview = async () => {
    await onPreview(buildFilters())
  }

  const handleFormSubmit = (values: CreateBroadcastFormValues) => {
    onSubmit({
      ...values,
      filters: buildFilters(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) form.reset()
      }}
    >
      <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="bg-white p-6 dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">
              {isEditMode ? 'Edit Broadcast' : 'Buat Broadcast Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Perbarui campaign broadcast yang sudah ada.'
                : 'Buat campaign broadcast untuk mengirim pesan ke pelanggan.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="mt-5 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Campaign</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Promo Akhir Tahun"
                        {...field}
                        className="bg-white dark:bg-card"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesan Broadcast</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tulis pesan broadcast di sini... Markdown didukung."
                        rows={5}
                        {...field}
                        className="bg-white dark:bg-card resize-none"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Markdown didukung. Pesan akan dikirim via Telegram bot.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2 rounded-md border bg-white/50 px-3 py-2 text-sm dark:bg-card/50">
                        <Radio className="h-4 w-4 text-primary" />
                        <span>Telegram</span>
                        <input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jadwal Kirim (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="bg-white dark:bg-card"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Kosongkan jika ingin dikirim sekarang.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter Penerima</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasTelegram"
                    checked={filterHasTelegram}
                    onCheckedChange={(c) => setFilterHasTelegram(c === true)}
                  />
                  <label htmlFor="hasTelegram" className="text-sm">
                    Hanya pelanggan dengan Telegram
                  </label>
                </div>

                <Input
                  placeholder="Cari pelanggan (nama/username/email)"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="bg-white dark:bg-card"
                />

                <Input
                  type="number"
                  placeholder="Min. total belanja (Rp)"
                  value={filterTotalSpentMin}
                  onChange={(e) => setFilterTotalSpentMin(e.target.value)}
                  className="bg-white dark:bg-card"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handlePreview()}
                  disabled={isPreviewLoading}
                  className="w-full"
                >
                  {isPreviewLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghitung...
                    </>
                  ) : (
                    'Preview Jumlah Penerima'
                  )}
                </Button>

                {previewTotal !== null && previewTotal !== undefined && (
                  <p className="text-center text-sm text-muted-foreground">
                    Kurang lebih{' '}
                    <strong className="text-foreground">{previewTotal}</strong> penerima
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : isEditMode ? (
                  'Simpan Perubahan'
                ) : (
                  'Buat Broadcast'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
