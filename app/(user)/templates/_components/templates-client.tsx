'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getTemplates, deleteTemplate } from '@/services/template'
import type { CampaignTemplate } from '@/schemas/broadcast'

import { DataTable } from '../../_components/data-table'
import { getTemplateColumns } from './template-columns'
import { TemplateDetailDialog } from './template-detail-dialog'

type TemplatesClientProps = {
  token: string
}

export function TemplatesClient({ token }: TemplatesClientProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<CampaignTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [templateToDelete, setTemplateToDelete] = useState<CampaignTemplate | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const fetchTemplates = useCallback(async () => {
    if (!token) {
      setTemplates([])
      return
    }
    setIsLoading(true)
    try {
      const result = await getTemplates(token, { page, limit: 20 })
      setTemplates(result.data)
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat template')
    } finally {
      setIsLoading(false)
    }
  }, [token, page])

  useEffect(() => {
    void fetchTemplates()
  }, [fetchTemplates])

  const handleDetail = useCallback((tpl: CampaignTemplate) => {
    setSelectedTemplate(tpl)
    setIsDetailOpen(true)
  }, [])

  const handleDeleteClick = useCallback((tpl: CampaignTemplate) => {
    setTemplateToDelete(tpl)
    setIsDeleteOpen(true)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!token || !templateToDelete) return
    setIsSaving(true)
    try {
      await deleteTemplate(token, templateToDelete.id)
      toast.success('Template berhasil dihapus')
      setTemplateToDelete(null)
      setIsDeleteOpen(false)
      void fetchTemplates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus template')
    } finally {
      setIsSaving(false)
    }
  }

  const columns = useMemo(
    () => getTemplateColumns({ onDetail: handleDetail, onDelete: handleDeleteClick }),
    [handleDetail, handleDeleteClick]
  )

  return (
    <div className="space-y-6">
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Template</span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Template{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Broadcast</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kelola template pesan untuk campaign broadcast.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.1s' }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="bg-white p-5 dark:bg-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Template</h2>
                <p className="text-sm text-muted-foreground">{total} template</p>
              </div>
            </div>
            <Button
              className="shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => router.push('/templates/create')}
            >
              <Plus className="h-4 w-4" />
              Buat Template
            </Button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.13s' }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="bg-white p-4 dark:bg-card">
          <DataTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
            onRowClick={(tpl) => handleDetail(tpl)}
            emptyIcon={FileText}
            emptyMessage="Belum ada template."
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TemplateDetailDialog
        template={selectedTemplate}
        token={token}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setSelectedTemplate(null)
        }}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="overflow-hidden border-0 p-0 shadow-2xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
          <div className="bg-white/30 p-6 backdrop-blur-xl dark:bg-white/5">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black tracking-tight">Hapus template?</AlertDialogTitle>
              <AlertDialogDescription>
                Template <strong>{templateToDelete?.name}</strong> akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel disabled={isSaving}>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
                disabled={isSaving}
                onClick={() => void handleDeleteConfirm()}
              >
                {isSaving ? 'Menghapus...' : 'Ya, Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
