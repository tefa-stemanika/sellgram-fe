'use client'

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import { getSubscription, upgradePlan, getInvoices } from '@/services/subscription'
import {
  getPlanLabel,
  getInvoiceStatusLabel,
  PLAN_MATRIX,
  PLAN_PRICES,
  type Plan,
  type Subscription,
  type PlanLimits,
  type Invoice as InvoiceType,
} from '@/schemas/subscription'

type PlanClientProps = {
  token: string
}

function PlanCardSkeleton() {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-8 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

type PlanCardProps = {
  plan: Plan
  currentPlan: Plan
  isPopular?: boolean
  hasActiveSub: boolean
  onUpgrade: (plan: Plan) => void
  upgrading: Plan | null
}

function PlanCard({ plan, currentPlan, isPopular, hasActiveSub, onUpgrade, upgrading }: PlanCardProps) {
  const info = PLAN_MATRIX.find((p) => p.name === plan)!
  const isCurrent = currentPlan === plan
  const isDowngrade = !isCurrent && PLAN_MATRIX.findIndex((p) => p.name === plan) < PLAN_MATRIX.findIndex((p) => p.name === currentPlan)

  let buttonLabel = 'Pilih Paket'
  if (isCurrent && !hasActiveSub) buttonLabel = 'Aktif'
  else if (isCurrent) buttonLabel = 'Paket Saat Ini'
  else if (isDowngrade) buttonLabel = 'Downgrade'

  return (
    <Card
      className={`relative border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md
        ${isPopular ? 'ring-2 ring-primary' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-white px-4 py-1 text-xs font-semibold shadow-lg">
            Terpopuler
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getPlanLabel(plan)}</CardTitle>
          {isCurrent && (
            <Badge variant="outline" className="text-xs">
              {hasActiveSub ? 'Aktif' : 'Free'}
            </Badge>
          )}
        </div>

        <div className="mt-2">
          <span className="text-3xl font-bold">{formatIDRCurrency(info.monthlyPrice)}</span>
          <span className="text-sm text-muted-foreground">/bln</span>
        </div>

        {info.yearlyPrice > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            atau {formatIDRCurrency(info.yearlyPrice)}/thn (hemat 2 bulan)
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {info.canUseFulfillment ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <X className="h-4 w-4 text-red-400" />
          )}
          <span>
            Fulfillment: <strong>{info.canUseFulfillment ? 'Ya' : 'Tidak'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>
            Bot Config: <strong>{info.botConfigs}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>
            Produk: <strong>{info.products}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {typeof info.maxBroadcasts === 'number' && info.maxBroadcasts === 0 ? (
            <X className="h-4 w-4 text-red-400" />
          ) : (
            <Check className="h-4 w-4 text-emerald-500" />
          )}
          <span>
            Broadcast/bln: <strong>{info.maxBroadcasts}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>
            Max Order/bln: <strong>{info.maxOrders}</strong>
          </span>
        </div>

        {plan === 'FREE' ? (
          <Button asChild className="mt-4 w-full">
            <Link href="/register">Mulai Gratis</Link>
          </Button>
        ) : (
          <Button
            className="mt-4 w-full"
            variant={isCurrent ? 'outline' : 'default'}
            disabled={isCurrent || isDowngrade || upgrading === plan}
            onClick={() => onUpgrade(plan)}
          >
            {upgrading === plan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function InvoiceRow({ invoice }: { invoice: InvoiceType }) {
  const statusBadge: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
    PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
    EXPIRED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
      <TableCell>{getPlanLabel(invoice.plan)}</TableCell>
      <TableCell>{formatIDRCurrency(invoice.amount)}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[invoice.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          {getInvoiceStatusLabel(invoice.status)}
        </span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</TableCell>
      <TableCell>
        {invoice.status === 'PENDING' && invoice.paymentUrl ? (
          <Button size="sm" asChild>
            <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer">
              Bayar
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">&mdash;</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export function PlanClient({ token }: PlanClientProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [currentPlan, setCurrentPlan] = useState<Plan>('FREE')
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [invoices, setInvoices] = useState<InvoiceType[]>([])
  const [invoiceTotal, setInvoiceTotal] = useState(0)
  const [invoicePage, setInvoicePage] = useState(1)
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [upgrading, setUpgrading] = useState<Plan | null>(null)
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')

  const fetchSubscription = async () => {
    if (!token) return
    try {
      const data = await getSubscription(token)
      setCurrentPlan(data.plan)
      setSubscription(data.subscription)
      setLimits(data.limits)
    } catch {
      // silent
    }
  }

  const fetchInvoices = async (page = invoicePage) => {
    if (!token) return
    try {
      const res = await getInvoices(token, page)
      setInvoices(res.data)
      setInvoiceTotal(res.metadata.total)
      setInvoiceTotalPages(res.metadata.totalPages)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setIsLoadingInvoices(false)
      return
    }

    setIsLoading(true)
    setIsLoadingInvoices(true)

    const init = async () => {
      await Promise.all([fetchSubscription(), fetchInvoices()])
      setIsLoading(false)
      setIsLoadingInvoices(false)
    }

    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!token) return
    void fetchInvoices(invoicePage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicePage])

  const handleUpgrade = async (plan: Plan) => {
    if (!token) return

    setUpgrading(plan)
    try {
      const data = await upgradePlan(token, { plan, interval })

      if (data.paymentUrl) {
        toast.success('Tagihan berhasil dibuat! Silakan lakukan pembayaran.')
        window.open(data.paymentUrl, '_blank')
      } else {
        toast.success('Paket berhasil diubah!')
      }

      await Promise.all([fetchSubscription(), fetchInvoices()])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah paket')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="space-y-8">
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Berlangganan
          </span>
        </div>
        <h1 className="mt-3 text-[32px] font-black leading-tight tracking-tight">Paket & Tagihan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola paket langganan dan lihat riwayat tagihan Anda
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-section-header font-semibold">Paket Saat Ini</h2>
        {isLoading ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ) : !token ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10">
              <CreditCard className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Silakan login untuk melihat langganan</p>
              <Button asChild>
                <Link href="/login">Masuk</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getPlanLabel(currentPlan)}</CardTitle>
                  <CardDescription>
                    {subscription
                      ? `Berlaku hingga ${formatDate(subscription.currentPeriodEnd)}`
                      : 'Paket gratis — tidak ada masa berlaku'}
                  </CardDescription>
                </div>
                {subscription && (
                  <Badge
                    className={
                      subscription.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {subscription.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {limits && (
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    Bot Config: <strong>{limits.botConfigs}</strong>
                  </div>
                  <div>
                    Produk: <strong>{limits.products}</strong>
                  </div>
                  <div>
                    Broadcast/bln: <strong>{limits.maxBroadcasts === 0 ? 'Tidak ada' : limits.maxBroadcasts}</strong>
                  </div>
                  <div>
                    Max Order/bln: <strong>{limits.maxOrders}</strong>
                  </div>
                  <div>
                    Fulfillment: <strong>{limits.canUseFulfillment ? 'Ya' : 'Tidak'}</strong>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-section-header font-semibold">Bandingkan Paket</h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {interval === 'MONTHLY' ? 'Bulanan' : 'Tahunan'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setInterval('MONTHLY')}>Bulanan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setInterval('YEARLY')}>Tahunan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            <PlanCardSkeleton />
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {PLAN_MATRIX.map((info) => (
              <PlanCard
                key={info.name}
                plan={info.name as Plan}
                currentPlan={currentPlan}
                isPopular={info.popular}
                hasActiveSub={subscription?.status === 'ACTIVE'}
                onUpgrade={handleUpgrade}
                upgrading={upgrading}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-section-header font-semibold">Riwayat Tagihan</h2>

        {isLoadingInvoices ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="py-10">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : !token ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Login untuk melihat riwayat tagihan</p>
            </CardContent>
          </Card>
        ) : invoices.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Belum ada tagihan</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {invoiceTotalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Total {invoiceTotal} tagihan &mdash; Halaman {invoicePage} dari {invoiceTotalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={invoicePage <= 1}
                    onClick={() => setInvoicePage((p) => p - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={invoicePage >= invoiceTotalPages}
                    onClick={() => setInvoicePage((p) => p + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </section>
    </div>
  )
}
