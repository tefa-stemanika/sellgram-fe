'use client'

import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type DataTablePaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total?: number
  totalLabel?: string
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  isLoading?: boolean
  emptyIcon?: LucideIcon
  emptyMessage?: string
  emptyDescription?: string
  pagination?: DataTablePaginationProps
  stickyHeader?: boolean
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyIcon: EmptyIcon,
  emptyMessage,
  emptyDescription,
  pagination,
  stickyHeader,
  className
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-l1', className)}>
      <div className={cn('overflow-x-auto', stickyHeader && 'max-h-[min(70vh,640px)] overflow-y-auto')}>
        <Table>
          <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-card' : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {table.getAllColumns().map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                  onClick={() => onRowClick?.(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    icon={EmptyIcon ?? Inbox}
                    title={emptyMessage ?? 'Tidak ada data'}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination ? <DataTablePagination {...pagination} /> : null}
    </div>
  )
}
