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
import { PageHeader } from '@/components/shared/page-header'
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
      <PageHeader
        kicker="Template"
        title="Template"
        description="Kelola template pesan untuk campaign broadcast."
        actions={
          <Button onClick={() => router.push('/templates/create')}>
            <Plus className="h-4 w-4" />
            Buat template
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={templates}
        isLoading={isLoading}
        onRowClick={(tpl) => handleDetail(tpl)}
        emptyIcon={FileText}
        emptyMessage="Belum ada template."
        pagination={{ page, totalPages, onPageChange: setPage, total, totalLabel: 'template' }}
      />

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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus template?</AlertDialogTitle>
            <AlertDialogDescription>
              Template <strong>{templateToDelete?.name}</strong> akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
              onClick={() => void handleDeleteConfirm()}
            >
              {isSaving ? 'Menghapus...' : 'Ya, hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
