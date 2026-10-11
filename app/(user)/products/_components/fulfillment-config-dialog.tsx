'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { LoadingButton } from '@/components/ui/loading-button'
import {
  getFulfillmentConfig, upsertFulfillmentConfig,
  listStockItems, createStockItems, deleteStockItem, getStockItemsCount,
  listSlotAccounts, createSlotAccount, updateSlotAccount, deleteSlotAccount,
  listSlots, createSlots, deleteSlot, releaseSlot,
} from '@/services/fulfillment'
import type { FulfillmentType, StockItem, SlotAccount, Slot, StockItemOrderInfo } from '@/schemas/fulfillment'
import { FULFILLMENT_TYPES, getFulfillmentTypeLabel } from '@/schemas/fulfillment'

const SUPPORTED_VARS = ['order_id', 'product_name', 'result', 'customer_name'] as const

const configSchema = z.object({
  type: z.enum(FULFILLMENT_TYPES),
  isActive: z.boolean().default(true),
  deliveryMessage: z.string().optional(),
  manualNote: z.string().optional(),
  apiUrl: z.string().optional(),
  apiMethod: z.string().optional(),
  apiHeaders: z.string().optional(),
  apiPayloadTemplate: z.string().optional(),
  apiCredentials: z.string().optional(),
  apiSuccessPath: z.string().optional(),
  apiSuccessValue: z.string().optional(),
  apiResultPath: z.string().optional(),
})

type ConfigFormValues = z.infer<typeof configSchema>

interface FulfillmentConfigDialogProps {
  productId: number
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'AVAILABLE': return 'secondary'
    case 'ACTIVE': return 'default'
    case 'USED': return 'destructive'
    case 'RESERVED': return 'secondary'
    case 'EXPIRED': return 'outline'
    case 'SUCCESS': return 'default'
    case 'FAILED': return 'destructive'
    case 'PENDING': return 'secondary'
    default: return 'outline'
  }
}

function OrderInfoCard({ order, usedAt }: { order: StockItemOrderInfo | null | undefined; usedAt?: string | null }) {
  if (!order) return null
  return (
    <div className="mt-2 space-y-1 border-t pt-2 text-caption text-muted-foreground">
      {order.firstName && <p>Nama: {order.firstName}</p>}
      {order.username && <p>Username: {order.username}</p>}
      {order.telegramId && <p>Telegram ID: {order.telegramId}</p>}
      {order.customerName && <p>Pelanggan: {order.customerName}</p>}
      {order.customerPhone && <p>No. HP: {order.customerPhone}</p>}
      {order.customer?.name && !order.firstName && <p>Nama: {order.customer.name}</p>}
      {order.customer?.phone && !order.customerPhone && <p>No. HP: {order.customer.phone}</p>}
      {usedAt && <p>Dipakai: {new Date(usedAt).toLocaleDateString('id-ID')}</p>}
    </div>
  )
}

export function FulfillmentConfigDialog({ productId, productName, open, onOpenChange, token }: FulfillmentConfigDialogProps) {
  const [activeTab, setActiveTab] = useState('config')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [configType, setConfigType] = useState<FulfillmentType | null>(null)
  const [hasConfig, setHasConfig] = useState(false)

  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stockItemsLoading, setStockItemsLoading] = useState(false)
  const [stockItemCount, setStockItemCount] = useState<number | null>(null)
  const [newStockItem, setNewStockItem] = useState('')
  const [addingStock, setAddingStock] = useState(false)

  const [slotAccounts, setSlotAccounts] = useState<SlotAccount[]>([])
  const [slotAccountsLoading, setSlotAccountsLoading] = useState(false)
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null)
  const [accountSlots, setAccountSlots] = useState<Record<string, Slot[]>>({})
  const [accountSlotsLoading, setAccountSlotsLoading] = useState<Record<string, boolean>>({})

  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<SlotAccount | null>(null)
  const [accountLabel, setAccountLabel] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [accountTotalSlots, setAccountTotalSlots] = useState(1)
  const [accountFormSaving, setAccountFormSaving] = useState(false)

  const [showSlotForm, setShowSlotForm] = useState(false)
  const [newSlotIdentifier, setNewSlotIdentifier] = useState('')
  const [newSlotAdditionalInfo, setNewSlotAdditionalInfo] = useState('')
  const [slotFormSaving, setSlotFormSaving] = useState(false)
  const [slotFormAccountId, setSlotFormAccountId] = useState<string | null>(null)

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      type: 'MANUAL',
      isActive: true,
      deliveryMessage: '',
      manualNote: '',
      apiUrl: '',
      apiMethod: 'POST',
      apiHeaders: '',
      apiPayloadTemplate: '',
      apiCredentials: '',
      apiSuccessPath: '',
      apiSuccessValue: '',
      apiResultPath: '',
    },
  })

  const watchedType = form.watch('type')

  const resetState = useCallback(() => {
    form.reset()
    setConfigType(null)
    setHasConfig(false)
    setActiveTab('config')
    setStockItems([])
    setStockItemCount(null)
    setNewStockItem('')
    setSlotAccounts([])
    setExpandedAccount(null)
    setAccountSlots({})
    setShowAccountForm(false)
    setEditingAccount(null)
    setShowSlotForm(false)
    setSlotFormAccountId(null)
  }, [form])

  useEffect(() => {
    if (open && productId) {
      loadConfig()
    } else if (!open) {
      resetState()
    }
  }, [open, productId, resetState])

  useEffect(() => {
    if (activeTab === 'stock' && hasConfig && configType === 'STOCK_POOL') {
      loadStockItems()
      loadStockCount()
    }
    if (activeTab === 'slots' && hasConfig && configType === 'SLOT_ASSIGN') {
      loadSlotAccounts()
    }
  }, [activeTab, hasConfig, configType])

  async function loadConfig() {
    setLoading(true)
    try {
      const res = await getFulfillmentConfig(productId, token)
      if (res.success && res.data) {
        setHasConfig(true)
        const cfg = res.data
        setConfigType(cfg.type as FulfillmentType)
        form.reset({
          type: cfg.type as FulfillmentType,
          isActive: cfg.isActive,
          deliveryMessage: cfg.deliveryMessage || '',
          manualNote: cfg.manualNote || '',
          apiUrl: cfg.apiUrl || '',
          apiMethod: cfg.apiMethod || 'POST',
          apiHeaders: cfg.apiHeaders ? JSON.stringify(cfg.apiHeaders, null, 2) : '',
          apiPayloadTemplate: cfg.apiPayloadTemplate || '',
          apiCredentials: cfg.apiCredentials || '',
          apiSuccessPath: cfg.apiSuccessPath || '',
          apiSuccessValue: cfg.apiSuccessValue || '',
          apiResultPath: cfg.apiResultPath || '',
        })
      } else {
        setHasConfig(false)
        setConfigType(null)
        form.reset({ type: 'MANUAL', isActive: true })
      }
    } catch {
      toast.error('Gagal memuat konfigurasi fulfillment')
    } finally {
      setLoading(false)
    }
  }

  async function loadStockItems() {
    setStockItemsLoading(true)
    try {
      const res = await listStockItems(productId, { page: 1, limit: 200 }, token)
      if (res.success) setStockItems(res.data)
    } catch {
      toast.error('Gagal memuat item stok')
    } finally {
      setStockItemsLoading(false)
    }
  }

  async function loadStockCount() {
    try {
      const res = await getStockItemsCount(productId, token)
      if (res.success) setStockItemCount(res.data.available)
    } catch {
      // silent
    }
  }

  async function loadSlotAccounts() {
    setSlotAccountsLoading(true)
    try {
      const res = await listSlotAccounts(productId, token)
      if (res.success) setSlotAccounts(res.data)
    } catch {
      toast.error('Gagal memuat akun slot')
    } finally {
      setSlotAccountsLoading(false)
    }
  }

  async function loadSlots(accountId: string) {
    setAccountSlotsLoading(prev => ({ ...prev, [accountId]: true }))
    try {
      const res = await listSlots(productId, accountId, token)
      if (res.success) setAccountSlots(prev => ({ ...prev, [accountId]: res.data }))
    } catch {
      toast.error('Gagal memuat slot')
    } finally {
      setAccountSlotsLoading(prev => ({ ...prev, [accountId]: false }))
    }
  }

  async function handleSave(values: ConfigFormValues) {
    setSaving(true)
    try {
      let apiHeaders: Record<string, string> | null = null
      if (values.apiHeaders && values.apiHeaders.trim()) {
        try {
          apiHeaders = JSON.parse(values.apiHeaders)
        } catch {
          toast.error('Format JSON header tidak valid')
          setSaving(false)
          return
        }
      }

      const payload = {
        type: values.type,
        isActive: values.isActive,
        deliveryMessage: values.deliveryMessage || null,
        manualNote: values.type === 'MANUAL' ? values.manualNote || null : null,
        apiUrl: values.type === 'API_EXTERNAL' ? values.apiUrl || null : null,
        apiMethod: values.type === 'API_EXTERNAL' ? values.apiMethod || null : null,
        apiHeaders: values.type === 'API_EXTERNAL' ? apiHeaders : null,
        apiPayloadTemplate: values.type === 'API_EXTERNAL' ? values.apiPayloadTemplate || null : null,
        apiCredentials: values.type === 'API_EXTERNAL' ? values.apiCredentials || null : null,
        apiSuccessPath: values.type === 'API_EXTERNAL' ? values.apiSuccessPath || null : null,
        apiSuccessValue: values.type === 'API_EXTERNAL' ? values.apiSuccessValue || null : null,
        apiResultPath: values.type === 'API_EXTERNAL' ? values.apiResultPath || null : null,
      }

      const res = await upsertFulfillmentConfig(productId, payload, token)
      if (res.success) {
        toast.success('Konfigurasi fulfillment berhasil disimpan')
        setConfigType(res.data.type as FulfillmentType)
        setHasConfig(true)
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi')
      }
    } catch {
      toast.error('Gagal menyimpan konfigurasi fulfillment')
    } finally {
      setSaving(false)
    }
  }

  const deliveryRef = useRef<HTMLTextAreaElement>(null)
  const deliveryValue = form.watch('deliveryMessage')

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  useEffect(() => {
    if (deliveryRef.current) autoResize(deliveryRef.current)
  }, [deliveryValue])

  function insertVar(name: string) {
    const ta = deliveryRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = form.getValues('deliveryMessage') || ''
    const varStr = `{{${name}}}`
    const after = before.slice(0, start) + varStr + before.slice(end)
    form.setValue('deliveryMessage', after, { shouldDirty: true })
    requestAnimationFrame(() => {
      const pos = start + varStr.length
      ta.setSelectionRange(pos, pos)
      ta.focus()
    })
  }

  async function handleAddStock() {
    const item = newStockItem.trim()
    if (!item) return
    setAddingStock(true)
    try {
      const res = await createStockItems(productId, { items: [item] }, token)
      if (res.success) {
        toast.success('Item stok ditambahkan')
        setNewStockItem('')
        loadStockItems()
        loadStockCount()
      } else {
        toast.error(res.message || 'Gagal menambah stok')
      }
    } catch {
      toast.error('Gagal menambah stok')
    } finally {
      setAddingStock(false)
    }
  }

  async function handleDeleteStockItem(itemId: string) {
    if (!confirm('Hapus item stok ini?')) return
    try {
      const res = await deleteStockItem(productId, itemId, token)
      if (res.success) {
        toast.success('Item stok dihapus')
        setStockItems(prev => prev.filter(i => i.id !== itemId))
        loadStockCount()
      } else {
        toast.error(res.message || 'Gagal menghapus item stok')
      }
    } catch {
      toast.error('Gagal menghapus item stok')
    }
  }

  function resetAccountForm() {
    setShowAccountForm(false)
    setEditingAccount(null)
    setAccountLabel('')
    setAccountEmail('')
    setAccountPassword('')
    setAccountTotalSlots(1)
  }

  function openEditAccount(account: SlotAccount) {
    setEditingAccount(account)
    setAccountLabel(account.label)
    setAccountTotalSlots(account.totalSlots)
    setShowAccountForm(true)
  }

  async function handleSaveSlotAccount() {
    if (!accountLabel.trim()) {
      toast.error('Label akun wajib diisi')
      return
    }

    if (!editingAccount && (!accountEmail.trim() || !accountPassword.trim())) {
      toast.error('Email dan password wajib diisi')
      return
    }

    setAccountFormSaving(true)
    try {
      if (editingAccount) {
        const res = await updateSlotAccount(productId, editingAccount.id, {
          label: accountLabel.trim(),
          totalSlots: accountTotalSlots,
        }, token)
        if (res.success) {
          toast.success('Akun slot diperbarui')
        } else {
          toast.error(res.message || 'Gagal memperbarui akun')
        }
      } else {
        const res = await createSlotAccount(productId, {
          label: accountLabel.trim(),
          credentials: { email: accountEmail.trim(), password: accountPassword.trim() },
          totalSlots: accountTotalSlots,
        }, token)
        if (res.success) {
          toast.success('Akun slot dibuat')
        } else {
          toast.error(res.message || 'Gagal membuat akun')
        }
      }
      resetAccountForm()
      loadSlotAccounts()
    } catch {
      toast.error('Gagal menyimpan akun slot')
    } finally {
      setAccountFormSaving(false)
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Hapus akun slot ini? Semua slot terkait akan ikut terhapus.')) return
    try {
      const res = await deleteSlotAccount(productId, accountId, token)
      if (res.success) {
        toast.success('Akun slot dihapus')
        setSlotAccounts(prev => prev.filter(a => a.id !== accountId))
        setExpandedAccount(prev => (prev === accountId ? null : prev))
      } else {
        toast.error(res.message || 'Gagal menghapus akun slot')
      }
    } catch {
      toast.error('Gagal menghapus akun slot')
    }
  }

  function handleToggleAccount(accountId: string) {
    if (expandedAccount === accountId) {
      setExpandedAccount(null)
    } else {
      setExpandedAccount(accountId)
      if (!accountSlots[accountId]) loadSlots(accountId)
    }
  }

  async function handleCreateSlots(accountId: string) {
    if (!newSlotIdentifier.trim()) return
    setSlotFormSaving(true)
    try {
      const res = await createSlots(productId, accountId, {
        slots: [{ slotIdentifier: newSlotIdentifier.trim(), additionalInfo: newSlotAdditionalInfo.trim() || null }],
      }, token)
      if (res.success) {
        toast.success('Slot ditambahkan')
        setNewSlotIdentifier('')
        setNewSlotAdditionalInfo('')
        loadSlots(accountId)
        loadSlotAccounts()
      } else {
        toast.error(res.message || 'Gagal menambah slot')
      }
    } catch {
      toast.error('Gagal menambah slot')
    } finally {
      setSlotFormSaving(false)
    }
  }

  async function handleDeleteSlot(slotId: string, accountId: string, status: string) {
    if (status !== 'AVAILABLE') {
      toast.error('Hanya slot dengan status AVAILABLE yang bisa dihapus')
      return
    }
    if (!confirm('Hapus slot ini?')) return
    try {
      const res = await deleteSlot(productId, accountId, slotId, token)
      if (res.success) {
        toast.success('Slot dihapus')
        setAccountSlots(prev => ({
          ...prev,
          [accountId]: (prev[accountId] || []).filter(s => s.id !== slotId),
        }))
        loadSlotAccounts()
      } else {
        toast.error(res.message || 'Gagal menghapus slot')
      }
    } catch {
      toast.error('Gagal menghapus slot')
    }
  }

  async function handleReleaseSlot(slotId: string, accountId: string) {
    try {
      const res = await releaseSlot(productId, accountId, slotId, token)
      if (res.success) {
        toast.success('Slot dilepaskan')
        setAccountSlots(prev => ({
          ...prev,
          [accountId]: (prev[accountId] || []).map(s =>
            s.id === slotId ? { ...s, status: 'AVAILABLE' as const, orderId: null, assignedAt: null } : s,
          ),
        }))
        loadSlotAccounts()
      } else {
        toast.error(res.message || 'Gagal melepas slot')
      }
    } catch {
      toast.error('Gagal melepas slot')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fulfillment: {productName}</DialogTitle>
          <DialogDescription>
            Atur metode fulfillment untuk produk ini
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memuat konfigurasi...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Konfigurasi</TabsTrigger>
              <TabsTrigger value="stock" disabled={!hasConfig || configType !== 'STOCK_POOL'}>
                Item Stok
              </TabsTrigger>
              <TabsTrigger value="slots" disabled={!hasConfig || configType !== 'SLOT_ASSIGN'}>
                Akun Slot
              </TabsTrigger>
            </TabsList>

            {/* Config Tab */}
            <TabsContent value="config" className="space-y-4 pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe Fulfillment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe fulfillment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FULFILLMENT_TYPES.map(t => (
                              <SelectItem key={t} value={t}>
                                {getFulfillmentTypeLabel(t)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pesan Pengiriman</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            ref={deliveryRef}
                            placeholder="Template: {{order_id}}, {{product_name}}, {{result}}"
                            className="min-h-[80px] max-h-[240px] overflow-y-auto resize-none"
                            onInput={e => autoResize(e.currentTarget)}
                          />
                        </FormControl>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {SUPPORTED_VARS.map(v => (
                            <Badge
                              key={v}
                              variant="outline"
                              className="cursor-pointer text-caption font-normal hover:bg-primary hover:text-primary-foreground"
                              onClick={() => insertVar(v)}
                            >
                              {'{{'}{v}{'}}'}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Aktif</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedType === 'MANUAL' && (
                    <FormField
                      control={form.control}
                      name="manualNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catatan Manual</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Instruksi untuk fulfillment manual" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedType === 'API_EXTERNAL' && (
                    <>
                      <FormField
                        control={form.control}
                        name="apiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/api/order" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTTP Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {['POST', 'GET', 'PUT'].map(m => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiHeaders"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Headers (JSON)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder='{"Authorization": "Bearer ..."}' rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiPayloadTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Payload</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='{"order_id": "{{order_id}}", "product": "{{product_name}}"}'
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiCredentials"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kredensial (JSON)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder='{"api_key": "..."}' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="apiSuccessPath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Success Path</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="data.status" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="apiSuccessValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Success Value</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="success" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="apiResultPath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Result Path</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="data.result" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <LoadingButton type="submit" loading={saving}>
                      Simpan konfigurasi
                    </LoadingButton>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Stock Items Tab */}
            <TabsContent value="stock" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Item Stok</h3>
                  {stockItemCount !== null && (
                    <Badge variant="secondary">{stockItemCount} tersedia</Badge>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => { loadStockItems(); loadStockCount() }}>
                  Segarkan
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newStockItem}
                  onChange={e => setNewStockItem(e.target.value)}
                  placeholder="Isi item stok"
                  className="flex-1"
                  onKeyDown={e => { if (e.key === 'Enter' && newStockItem.trim()) handleAddStock() }}
                />
                <LoadingButton
                  size="sm"
                  loading={addingStock}
                  onClick={handleAddStock}
                  disabled={!newStockItem.trim()}
                >
                  Tambah item
                </LoadingButton>
              </div>

              <Separator />

              {stockItemsLoading && stockItems.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : stockItems.length === 0 && !stockItemsLoading ? (
                <p className="text-body-sm text-muted-foreground">Belum ada item stok</p>
              ) : (
                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                  {stockItems.map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <code className="text-body-sm font-mono tabular">{item.content}</code>
                            <Badge variant={statusBadgeVariant(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStockItem(item.id)}
                            disabled={item.status === 'USED'}
                          >
                            Hapus
                          </Button>
                        </div>
                        {item.status === 'USED' && item.order && (
                          <OrderInfoCard order={item.order} usedAt={item.usedAt} />
                        )}
                        {item.status === 'USED' && !item.order && item.usedAt && (
                          <div className="mt-1 text-caption text-muted-foreground">
                            <p>Dipakai: {new Date(item.usedAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Slot Accounts Tab */}
            <TabsContent value="slots" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Akun Slot</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    resetAccountForm()
                    setShowAccountForm(true)
                  }}
                >
                  Tambah akun
                </Button>
              </div>

              {showAccountForm && (
                <Card>
                  <CardContent className="space-y-3 pt-4">
                    <Input
                      placeholder="Label akun"
                      value={accountLabel}
                      onChange={e => setAccountLabel(e.target.value)}
                    />
                    {!editingAccount && (
                      <>
                        <Input
                          placeholder="Email"
                          value={accountEmail}
                          onChange={e => setAccountEmail(e.target.value)}
                        />
                        <Input
                          placeholder="Password"
                          type="password"
                          value={accountPassword}
                          onChange={e => setAccountPassword(e.target.value)}
                        />
                      </>
                    )}
                    <Input
                      placeholder="Total slot"
                      type="number"
                      min={1}
                      value={accountTotalSlots}
                      onChange={e => setAccountTotalSlots(Number(e.target.value))}
                    />
                    <div className="flex gap-2">
                      <LoadingButton size="sm" loading={accountFormSaving} onClick={handleSaveSlotAccount}>
                        {editingAccount ? 'Simpan' : 'Buat'}
                      </LoadingButton>
                      <Button size="sm" variant="outline" onClick={resetAccountForm}>
                        Batal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {slotAccountsLoading && slotAccounts.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <Card key={i}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : slotAccounts.length === 0 && !slotAccountsLoading ? (
                <p className="text-body-sm text-muted-foreground">Belum ada akun slot</p>
              ) : (
                <div className="space-y-3">
                  {slotAccounts.map(account => (
                    <Card key={account.id}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{account.label}</span>
                          <Badge variant={account.isActive ? 'default' : 'secondary'}>
                            {account.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                          <span className="text-body-sm text-muted-foreground">
                            {account.usedSlots}/{account.totalSlots} slot terpakai
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditAccount(account)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                            Hapus
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleAccount(account.id)}>
                            {expandedAccount === account.id ? 'Tutup' : 'Slot'}
                          </Button>
                        </div>
                      </div>

                      {expandedAccount === account.id && (
                        <CardContent className="space-y-3 border-t pt-3">
                          {accountSlotsLoading[account.id] && (!accountSlots[account.id] || accountSlots[account.id].length === 0) ? (
                            <div className="space-y-2">
                              {[1, 2].map(i => (
                                <Card key={i}>
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <Skeleton className="h-5 w-48" />
                                      <Skeleton className="h-5 w-20" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : !accountSlots[account.id] || accountSlots[account.id].length === 0 ? (
                            <p className="text-body-sm text-muted-foreground">Belum ada slot</p>
                          ) : (
                            <div className="max-h-[250px] space-y-2 overflow-y-auto">
                              {accountSlots[account.id].map(slot => (
                                <Card key={slot.id}>
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <code className="text-body-sm font-mono tabular">{slot.slotIdentifier}</code>
                                        {slot.additionalInfo && (
                                          <span className="text-caption text-muted-foreground">{slot.additionalInfo}</span>
                                        )}
                                        <Badge variant={statusBadgeVariant(slot.status)}>{slot.status}</Badge>
                                        {slot.status === 'ACTIVE' && (
                                          <span className="text-caption text-muted-foreground">
                                            {slot.assignedAt
                                              ? `Digunakan: ${new Date(slot.assignedAt).toLocaleDateString('id-ID')}`
                                              : ''}
                                          </span>
                                        )}
                                        {slot.expiresAt && (
                                          <span className="text-caption text-muted-foreground">
                                            Kadaluwarsa: {new Date(slot.expiresAt).toLocaleDateString('id-ID')}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        {slot.status === 'ACTIVE' && (
                                          <Button variant="ghost" size="sm" onClick={() => handleReleaseSlot(slot.id, account.id)}>
                                            Lepaskan
                                          </Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSlot(slot.id, account.id, slot.status)}>
                                          Hapus
                                        </Button>
                                      </div>
                                    </div>
                                    <OrderInfoCard order={slot.order} />
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}

                          {showSlotForm && slotFormAccountId === account.id ? (
                            <div className="space-y-2">
                              <Input
                                value={newSlotIdentifier}
                                onChange={e => setNewSlotIdentifier(e.target.value)}
                                placeholder="Identifier slot"
                              />
                              <Input
                                value={newSlotAdditionalInfo}
                                onChange={e => setNewSlotAdditionalInfo(e.target.value)}
                                placeholder="Informasi tambahan (opsional)"
                              />
                              <div className="flex gap-2">
                                <LoadingButton size="sm" loading={slotFormSaving} onClick={() => handleCreateSlots(account.id)} disabled={!newSlotIdentifier.trim()}>
                                  Tambah
                                </LoadingButton>
                                <Button size="sm" variant="outline" onClick={() => { setShowSlotForm(false); setSlotFormAccountId(null); setNewSlotIdentifier(''); setNewSlotAdditionalInfo('') }}>
                                  Batal
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setShowSlotForm(true); setSlotFormAccountId(account.id); setNewSlotIdentifier(''); setNewSlotAdditionalInfo('') }}
                            >
                              + Tambah slot
                            </Button>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
