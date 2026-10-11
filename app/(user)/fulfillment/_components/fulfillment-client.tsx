'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clock, ListFilter, RotateCcw, SearchX } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import InputSearch from '@/components/core/input-search'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { listFulfillmentLogs, retryFulfillment } from '@/services/fulfillment'
import type { FulfillmentLog, FulfillmentStatus, FulfillmentType } from '@/schemas/fulfillment'
import { FULFILLMENT_STATUSES, getFulfillmentStatusLabel, FULFILLMENT_TYPES, getFulfillmentTypeLabel } from '@/schemas/fulfillment'
import { formatDate } from '@/lib/utils'

type FulfillmentClientProps = {
  token: string
}

export function FulfillmentClient({ token }: FulfillmentClientProps) {
  const [logs, setLogs] = useState<FulfillmentLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [retryingId, setRetryingId] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const result = await listFulfillmentLogs(
        {
          page,
          limit: 20,
          search: search || undefined,
          status: statusFilter === 'ALL' ? undefined : (statusFilter as FulfillmentStatus),
          type: typeFilter === 'ALL' ? undefined : (typeFilter as FulfillmentType),
        },
        token,
      )
      setLogs(result.data)
      setTotal(result.metadata.total)
      setTotalPages(result.metadata.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat log fulfillment')
    } finally {
      setIsLoading(false)
    }
  }, [token, page, search, statusFilter, typeFilter])

  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  const handleRetry = useCallback(
    async (logId: string) => {
      if (!token) return
      setRetryingId(logId)
      try {
        await retryFulfillment(logId, token)
        toast.success('Fulfillment sedang diproses ulang')
        void fetchLogs()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memproses ulang fulfillment')
      } finally {
        setRetryingId(null)
      }
    },
    [token, fetchLogs],
  )

  const filteredLogs = useMemo(() => logs, [logs])

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Clock className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-body-sm text-muted-foreground">Silakan login untuk melihat log fulfillment</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader kicker="Operasional" title="Fulfillment" description="Riwayat pengiriman dan pemenuhan pesanan" />

      <div className="flex flex-wrap items-center gap-3">
        <InputSearch
          placeholder="Cari order ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              {FULFILLMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {getFulfillmentStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v)
              setPage(1)
            }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              {FULFILLMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {getFulfillmentTypeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Surface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Percobaan</TableHead>
              <TableHead>Terakhir Gagal</TableHead>
              <TableHead>Dikirim</TableHead>
              <TableHead className="w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[100px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filteredLogs.length
                ? filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-mono-data tabular">{log.orderId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-caption">
                          {getFulfillmentTypeLabel(log.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge kind="fulfillment" value={log.status} withDot />
                      </TableCell>
                      <TableCell className="font-mono text-mono-data tabular text-muted-foreground">
                        {log.attempts}/{log.maxAttempts}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-body-sm text-muted-foreground">
                        {log.lastError ? (
                          <span title={log.lastError} className="cursor-help">
                            {log.lastError}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-mono-data tabular text-muted-foreground">
                        {log.deliveredAt ? formatDate(log.deliveredAt) : <span className="text-muted-foreground/50">&mdash;</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {log.status === 'FAILED' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={retryingId === log.id}
                              onClick={() => handleRetry(log.id)}>
                              <RotateCcw className={`mr-1 h-3.5 w-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                              Ulang
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              : !isLoading && (
                  <TableRow>
                    <TableCell className="h-48 text-center text-muted-foreground" colSpan={7}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <SearchX className="h-10 w-10 text-muted-foreground/40" />
                        <p>Tidak ada log fulfillment</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))} total={total} totalLabel="log" />
      </Surface>
    </div>
  )
}
