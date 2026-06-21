'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, FileText, Loader2, Radio, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBroadcastSchema, type CreateBroadcastFormValues, type BroadcastFilters, type TemplateMapping } from '@/schemas/broadcast'
import type { CampaignTemplate } from '@/schemas/broadcast'
import { createBroadcast, createBroadcastFromTemplate, previewBroadcast } from '@/services/broadcast'
import { getTemplates } from '@/services/template'

type BroadcastCreatePageProps = {
  token: string
}

const SOURCE_TYPE_OPTIONS = [
  { label: 'Field Customer', value: 'CUSTOMER_FIELD' },
  { label: 'Nilai Statis', value: 'STATIC_VALUE' },
  { label: 'Turunan Order', value: 'DERIVED_FIELD' },
]

const CUSTOMER_FIELD_OPTIONS = [
  { label: 'Nama', value: 'name' },
  { label: 'Telepon', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Username', value: 'username' },
]

const DERIVED_FIELD_OPTIONS = [
  { label: 'Total Order', value: 'TOTAL_ORDERS' },
  { label: 'Total Belanja', value: 'TOTAL_SPENT' },
  { label: 'Tanggal Order Terakhir', value: 'LAST_ORDER_DATE' },
  { label: 'Produk Terakhir', value: 'LAST_PRODUCT_NAME' },
]

export function BroadcastCreatePage({ token }: BroadcastCreatePageProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewTotal, setPreviewTotal] = useState<number | null>(null)

  const [useTemplate, setUseTemplate] = useState(false)
  const [templates, setTemplates] = useState<CampaignTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null)
  const [mappings, setMappings] = useState<TemplateMapping[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  const [filterHasTelegram, setFilterHasTelegram] = useState(true)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterTotalSpentMin, setFilterTotalSpentMin] = useState('')

  const form = useForm<CreateBroadcastFormValues>({
    resolver: zodResolver(createBroadcastSchema),
    defaultValues: { name: '', message: '', channel: 'TELEGRAM', scheduledAt: '' },
  })

  useEffect(() => {
    if (useTemplate && !templates.length) {
      setIsLoadingTemplates(true)
      getTemplates(token, { limit: 50 })
        .then((res) => setTemplates(res.data))
        .catch(() => toast.error('Gagal memuat template'))
        .finally(() => setIsLoadingTemplates(false))
    }
  }, [useTemplate, templates.length])

  const handleTemplateSelect = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId) ?? null
    setSelectedTemplate(tpl)
    if (tpl) {
      form.setValue('name', tpl.name)
      form.setValue('message', tpl.content)
      setMappings(
        tpl.variables.map((v) => ({
          variableIndex: v.index,
          sourceType: 'CUSTOMER_FIELD' as const,
          sourceValue: v.index === 1 ? 'name' : '',
        }))
      )
    }
  }

  const updateMapping = (variableIndex: number, field: 'sourceType' | 'sourceValue', value: string) => {
    setMappings((prev) => prev.map((m) => (m.variableIndex === variableIndex ? { ...m, [field]: value } : m)))
  }

  const buildFilters = (): BroadcastFilters => {
    const filters: BroadcastFilters = {}
    if (filterHasTelegram) filters.hasTelegram = 'true'
    if (filterSearch) filters.search = filterSearch
    if (filterTotalSpentMin) filters.totalSpentMin = Number(filterTotalSpentMin)
    return filters
  }

  const handlePreviewCount = async () => {
    setIsPreviewLoading(true)
    try {
      const result = await previewBroadcast(token, buildFilters())
      setPreviewTotal(result.total)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal preview')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const message = form.watch('message')

  const messagePreview = useMemo(() => {
    if (useTemplate && selectedTemplate) {
      let rendered = selectedTemplate.content
      for (const m of mappings) {
        const val = m.sourceType === 'STATIC_VALUE' ? m.sourceValue : `[${m.sourceType}:${m.sourceValue}]`
        rendered = rendered.replace(new RegExp(`\\{\\{${m.variableIndex}\\}\\}`, 'g'), val)
      }
      return rendered
    }
    return message || null
  }, [useTemplate, selectedTemplate, mappings, message])

  const handleSubmit = async (values: CreateBroadcastFormValues) => {
    if (!token) return
    setIsSaving(true)
    try {
      if (useTemplate && selectedTemplate) {
        await createBroadcastFromTemplate(token, {
          name: values.name,
          templateId: selectedTemplate.id,
          mappings,
          filters: buildFilters(),
          scheduledAt: values.scheduledAt || undefined,
        })
      } else {
        await createBroadcast(token, {
          name: values.name,
          message: values.message,
          filters: buildFilters(),
          scheduledAt: values.scheduledAt || undefined,
        })
      }
      toast.success('Broadcast berhasil dibuat')
      router.push('/broadcasts')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat broadcast')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Broadcast</span>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border-0 shadow-sm">
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

          <h1 className="mb-6 text-2xl font-black tracking-tight">Buat Broadcast Baru</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="flex items-center gap-3 rounded-lg border bg-blue-50/50 px-3 py-2 dark:bg-blue-950/20">
                <Checkbox
                  id="useTemplate"
                  checked={useTemplate}
                  onCheckedChange={(c) => {
                    setUseTemplate(c === true)
                    if (!c) setSelectedTemplate(null)
                  }}
                />
                <label htmlFor="useTemplate" className="text-sm font-medium cursor-pointer">
                  Gunakan template yang sudah ada
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Campaign</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Promo Akhir Tahun" {...field} className="bg-white dark:bg-card" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {useTemplate ? (
                    <div className="space-y-3">
                      <FormItem>
                        <FormLabel>Pilih Template</FormLabel>
                        <Select
                          value={selectedTemplate?.id ?? ''}
                          onValueChange={handleTemplateSelect}
                          disabled={isLoadingTemplates}
                        >
                          <SelectTrigger className="bg-white dark:bg-card">
                            <SelectValue placeholder={isLoadingTemplates ? 'Memuat...' : 'Pilih template'} />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((tpl) => (
                              <SelectItem key={tpl.id} value={tpl.id}>
                                {tpl.name} ({tpl.variableCount} var)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>

                      {selectedTemplate && (
                        <div className="space-y-4 rounded-lg border bg-white/50 p-4 dark:bg-card/50">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mapping Variabel
                          </p>
                          <p className="-mt-2 text-xs text-muted-foreground">
                            Atur sumber data untuk setiap variabel template
                          </p>
                          {mappings.map((m) => {
                            const variable = selectedTemplate.variables.find((v) => v.index === m.variableIndex)
                            return (
                              <div key={m.variableIndex} className="overflow-hidden rounded-xl border bg-white dark:bg-card">
                                <div className="flex items-start gap-3 border-b bg-white/50 px-3 py-2.5">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                                    {m.variableIndex}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">{variable?.label ?? `Variabel ${m.variableIndex}`}</p>
                                    {variable?.sample && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        Contoh: <span className="font-mono">{variable.sample}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="px-3 py-2.5">
                                  <div className="flex gap-2">
                                    <Select
                                      value={m.sourceType}
                                      onValueChange={(v) => updateMapping(m.variableIndex, 'sourceType', v)}
                                    >
                                      <SelectTrigger className="flex-1 bg-white dark:bg-card h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {SOURCE_TYPE_OPTIONS.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {m.sourceType === 'CUSTOMER_FIELD' && (
                                      <Select
                                        value={m.sourceValue}
                                        onValueChange={(v) => updateMapping(m.variableIndex, 'sourceValue', v)}
                                      >
                                        <SelectTrigger className="flex-1 bg-white dark:bg-card h-8 text-xs">
                                          <SelectValue placeholder="Pilih field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {CUSTOMER_FIELD_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    {m.sourceType === 'STATIC_VALUE' && (
                                      <Input
                                        placeholder="Nilai statis"
                                        value={m.sourceValue}
                                        onChange={(e) => updateMapping(m.variableIndex, 'sourceValue', e.target.value)}
                                        className="flex-1 bg-white dark:bg-card h-8 text-xs"
                                      />
                                    )}
                                    {m.sourceType === 'DERIVED_FIELD' && (
                                      <Select
                                        value={m.sourceValue}
                                        onValueChange={(v) => updateMapping(m.variableIndex, 'sourceValue', v)}
                                      >
                                        <SelectTrigger className="flex-1 bg-white dark:bg-card h-8 text-xs">
                                          <SelectValue placeholder="Pilih turunan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {DERIVED_FIELD_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan Broadcast</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tulis pesan broadcast di sini... Markdown didukung."
                              rows={6}
                              {...field}
                              className="bg-white dark:bg-card resize-none"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Markdown didukung.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex items-center gap-2 rounded-md border bg-white/50 px-3 py-2 text-sm dark:bg-card/50">
                    <Radio className="h-4 w-4 text-primary" />
                    <span>Telegram</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jadwal Kirim (opsional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} className="bg-white dark:bg-card" />
                        </FormControl>
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
                      <Checkbox id="ht" checked={filterHasTelegram} onCheckedChange={(c) => setFilterHasTelegram(c === true)} />
                      <label htmlFor="ht" className="text-sm">Hanya pelanggan dengan Telegram</label>
                    </div>
                    <Input placeholder="Cari pelanggan" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="bg-white dark:bg-card" />
                    <Input type="number" placeholder="Min. total belanja (Rp)" value={filterTotalSpentMin} onChange={(e) => setFilterTotalSpentMin(e.target.value)} className="bg-white dark:bg-card" />
                    <Button type="button" variant="outline" size="sm" onClick={() => void handlePreviewCount()} disabled={isPreviewLoading} className="w-full">
                      {isPreviewLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghitung...</> : 'Preview Jumlah Penerima'}
                    </Button>
                    {previewTotal !== null && (
                      <p className="text-center text-sm text-muted-foreground">
                        Kurang lebih <strong className="text-foreground">{previewTotal}</strong> penerima
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Buat Broadcast'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {messagePreview && (
                    <Card className="overflow-hidden border shadow-sm sticky top-4">
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          Preview Pesan
                        </div>
                        <div
                          className="rounded-xl p-4 min-h-[200px] flex items-start"
                          style={{
                            backgroundImage: 'url(/images/telegram-chat-background.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 shadow-sm text-gray-900">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{messagePreview}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
