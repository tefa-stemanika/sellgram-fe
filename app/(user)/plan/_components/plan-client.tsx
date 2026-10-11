'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, CreditCard, ExternalLink, FileText, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/page-header'
import { Surface } from '@/components/shared/surface'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import { getSubscription, upgradePlan, getInvoices } from '@/services/subscription'
import {
  getPlanLabel,
  PLAN_MATRIX,
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
    <Surface className="p-5">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="mt-2 h-8 w-24" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </Surface>
  )
}

type PlanCardProps = {
  plan: Plan
  currentPlan: Plan
  interval: 'MONTHLY' | 'YEARLY'
  isPopular?: boolean
  hasActiveSub: boolean
  onUpgrade: (plan: Plan) => void
  upgrading: Plan | null
}

function PlanCard({ plan, currentPlan, interval, isPopular, hasActiveSub, onUpgrade, upgrading }: PlanCardProps) {
  const info = PLAN_MATRIX.find((p) => p.name === plan)!
  const isCurrent = currentPlan === plan
  const isDowngrade = !isCurrent && PLAN_MATRIX.findIndex((p) => p.name === plan) < PLAN_MATRIX.findIndex((p) => p.name === currentPlan)

  let buttonLabel = 'Pilih paket'
  if (isCurrent && !hasActiveSub) buttonLabel = 'Aktif'
  else if (isCurrent) buttonLabel = 'Paket saat ini'
  else if (isDowngrade) buttonLabel = 'Downgrade'

  return (
    <Surface className={`flex flex-col gap-4 p-5 ${isPopular ? 'ring-1 ring-primary/40' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-card-title">{getPlanLabel(plan)}</h3>
        <div className="flex items-center gap-2">
          {isPopular && (
            <span className="rounded-md bg-primary/12 px-2 py-0.5 text-caption font-medium text-primary">Terpopuler</span>
          )}
          {isCurrent && (
            <Badge variant="outline" className="text-caption">
              {hasActiveSub ? 'Aktif' : 'Free'}
            </Badge>
          )}
        </div>
      </div>

      <div>
        <span className="text-subsection-header font-mono tabular">
          {interval === 'YEARLY' ? formatIDRCurrency(info.yearlyPrice) : formatIDRCurrency(info.monthlyPrice)}
        </span>
        <span className="text-body-sm text-muted-foreground">/{interval === 'YEARLY' ? 'thn' : 'bln'}</span>

        {info.yearlyPrice > 0 && (
          <p className="mt-1 text-caption text-muted-foreground">
            {interval === 'YEARLY' ? (
              <>hemat {formatIDRCurrency(info.monthlyPrice * 12 - info.yearlyPrice)}/thn</>
            ) : (
              <>atau {formatIDRCurrency(info.yearlyPrice)}/thn (hemat 2 bulan)</>
            )}
          </p>
        )}
      </div>

      <ul className="space-y-2.5">
        <li className="flex items-center gap-2 text-body-sm">
          {info.canUseFulfillment ? <Check className="h-4 w-4 shrink-0 text-success" /> : <X className="h-4 w-4 shrink-0 text-error" />}
          <span>
            Fulfillment: <strong className="font-medium text-foreground">{info.canUseFulfillment ? 'Ya' : 'Tidak'}</strong>
          </span>
        </li>
        <li className="flex items-center gap-2 text-body-sm">
          <Check className="h-4 w-4 shrink-0 text-success" />
          <span>
            Produk: <strong className="font-medium text-foreground">{info.products}</strong>
          </span>
        </li>
        <li className="flex items-center gap-2 text-body-sm">
          <Check className="h-4 w-4 shrink-0 text-success" />
          <span>
            Broadcast Template: <strong className="font-medium text-foreground">{info.templates}</strong>
          </span>
        </li>
        <li className="flex items-center gap-2 text-body-sm">
          {typeof info.maxBroadcasts === 'number' && info.maxBroadcasts === 0 ? (
            <X className="h-4 w-4 shrink-0 text-error" />
          ) : (
            <Check className="h-4 w-4 shrink-0 text-success" />
          )}
          <span>
            Broadcast/bln: <strong className="font-medium text-foreground">{info.maxBroadcasts}</strong>
          </span>
        </li>
        <li className="flex items-center gap-2 text-body-sm">
          <Check className="h-4 w-4 shrink-0 text-success" />
          <span>
            Max Order/bln: <strong className="font-medium text-foreground">{info.maxOrders}</strong>
          </span>
        </li>
      </ul>

      <div className="mt-auto pt-1">
        {plan === 'FREE' ? (
          <Button asChild className="w-full">
            <Link href="/register">Mulai gratis</Link>
          </Button>
        ) : (
          <Button
            className="w-full"
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
      </div>
    </Surface>
  )
}

function InvoiceRow({ invoice }: { invoice: InvoiceType }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
      <TableCell>{getPlanLabel(invoice.plan)}</TableCell>
      <TableCell className="font-mono text-mono-data tabular">{formatIDRCurrency(invoice.amount)}</TableCell>
      <TableCell>
        <StatusBadge kind="invoice" value={invoice.status} withDot />
      </TableCell>
      <TableCell className="text-body-sm text-muted-foreground">{formatDate(invoice.createdAt)}</TableCell>
      <TableCell>
        {invoice.status === 'PENDING' && invoice.paymentUrl ? (
          <Button size="sm" asChild>
            <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer">
              Bayar
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <span className="text-body-sm text-muted-foreground">&mdash;</span>
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
        toast.success('Tagihan berhasil dibuat. Silakan lakukan pembayaran.')
        window.open(data.paymentUrl, '_blank')
      } else {
        toast.success('Paket berhasil diubah.')
      }

      await Promise.all([fetchSubscription(), fetchInvoices()])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah paket')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="Berlangganan" title="Paket langganan" description="Kelola paket langganan dan lihat riwayat tagihan Anda" />

      <section>
        <h2 className="mb-2 text-section-header">Paket saat ini</h2>
        {isLoading ? (
          <Surface className="p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-48" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
          </Surface>
        ) : !token ? (
          <Surface className="p-5">
            <EmptyState
              icon={CreditCard}
              title="Silakan login untuk melihat langganan"
              action={
                <Button asChild>
                  <Link href="/login">Masuk</Link>
                </Button>
              }
            />
          </Surface>
        ) : (
          <Surface className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-card-title">{getPlanLabel(currentPlan)}</h3>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {subscription
                    ? `Berlaku hingga ${formatDate(subscription.currentPeriodEnd)}`
                    : 'Paket gratis — tidak ada masa berlaku'}
                </p>
              </div>
              {subscription && (
                <span
                  className={
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-caption font-medium ' +
                    (subscription.status === 'ACTIVE'
                      ? 'border-success/25 bg-success/12 text-success'
                      : 'border-warning/25 bg-warning/12 text-warning')
                  }
                >
                  {subscription.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              )}
            </div>

            {limits && (
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Broadcast Template</p>
                  <p className="text-body-sm font-medium">{limits.templates}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Produk</p>
                  <p className="text-body-sm font-medium">{limits.products}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Broadcast/bln</p>
                  <p className="text-body-sm font-medium">{limits.maxBroadcasts === 0 ? 'Tidak ada' : limits.maxBroadcasts}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Max Order/bln</p>
                  <p className="text-body-sm font-medium">{limits.maxOrders}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-muted-foreground">Fulfillment</p>
                  <p className="text-body-sm font-medium">{limits.canUseFulfillment ? 'Ya' : 'Tidak'}</p>
                </div>
              </div>
            )}
          </Surface>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-section-header">Bandingkan paket</h2>

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
          <div className="grid gap-4 md:grid-cols-3">
            <PlanCardSkeleton />
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </div>
        ) : (
          <div className="grid animate-fade-in-up gap-4 md:grid-cols-3">
            {PLAN_MATRIX.map((info) => (
              <PlanCard
                key={info.name}
                plan={info.name as Plan}
                currentPlan={currentPlan}
                interval={interval}
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
        <h2 className="mb-4 text-section-header">Riwayat tagihan</h2>

        {isLoadingInvoices ? (
          <Surface className="p-5">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Surface>
        ) : !token ? (
          <Surface className="p-5">
            <EmptyState icon={FileText} title="Masuk untuk melihat riwayat tagihan" />
          </Surface>
        ) : invoices.length === 0 ? (
          <Surface className="p-5">
            <EmptyState icon={FileText} title="Belum ada tagihan" />
          </Surface>
        ) : (
          <Surface className="overflow-hidden">
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
            <DataTablePagination
              page={invoicePage}
              totalPages={invoiceTotalPages}
              onPageChange={setInvoicePage}
              total={invoiceTotal}
              totalLabel="tagihan"
            />
          </Surface>
        )}
      </section>
    </div>
  )
}
