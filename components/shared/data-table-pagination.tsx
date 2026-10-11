import { Button } from '@/components/ui/button'

type DataTablePaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total?: number
  totalLabel?: string
  className?: string
}

export function DataTablePagination({ page, totalPages, onPageChange, total, totalLabel = 'data', className }: DataTablePaginationProps) {
  if (totalPages <= 1 && total === undefined) return null

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 ${className ?? ''}`}>
      <p className="text-caption text-muted-foreground">
        {total !== undefined ? (
          <>
            Total <span className="text-mono-data font-mono tabular text-foreground">{total}</span> {totalLabel} &mdash;{' '}
          </>
        ) : null}
        Halaman <span className="text-mono-data font-mono tabular text-foreground">{page}</span> dari{' '}
        <span className="text-mono-data font-mono tabular text-foreground">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Selanjutnya
        </Button>
      </div>
    </div>
  )
}
