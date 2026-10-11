'use client'

import { useEffect, useState } from 'react'
import { FileText, PenTool, Variable } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { TelegramChatPreview } from '@/components/shared/telegram-chat-preview'
import { getTemplate } from '@/services/template'
import { formatDateTime } from '@/lib/utils'
import type { CampaignTemplate } from '@/schemas/broadcast'

type TemplateDetailDialogProps = {
  template: CampaignTemplate | null
  token: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDetailDialog({
  template,
  token,
  open,
  onOpenChange,
}: TemplateDetailDialogProps) {
  const router = useRouter()
  const [detail, setDetail] = useState<CampaignTemplate | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  useEffect(() => {
    if (!open || !template || !token) {
      setDetail(null)
      return
    }
    const fetchDetail = async () => {
      setIsLoadingDetail(true)
      try {
        const data = await getTemplate(token, template.id)
        setDetail(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat detail template')
      } finally {
        setIsLoadingDetail(false)
      }
    }
    void fetchDetail()
  }, [open, template, token])

  const displayTemplate = detail ?? template

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail template</DialogTitle>
          <DialogDescription>Informasi dan preview template broadcast.</DialogDescription>
        </DialogHeader>

        {!displayTemplate ? null : (
          <div className="space-y-5 text-body-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-body font-semibold">{displayTemplate.name}</p>
                  <p className="text-caption text-muted-foreground">
                    <span className="font-mono text-mono-data tabular">{displayTemplate.variableCount}</span> variabel
                    &middot; Dibuat {formatDateTime(displayTemplate.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(`/templates/${displayTemplate.id}/edit`)
                    onOpenChange(false)
                  }}
                >
                  <PenTool className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>

            {displayTemplate.preview && <TelegramChatPreview lines={[displayTemplate.preview]} />}

            <div className="rounded-md bg-muted p-4">
              <p className="whitespace-pre-wrap font-mono text-mono-data leading-relaxed">
                {displayTemplate.content}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-small-header mb-3 flex items-center gap-2 font-semibold">
                <Variable className="h-4 w-4" />
                Variabel (<span className="font-mono text-mono-data tabular">{displayTemplate.variables.length}</span>)
              </h4>
              {displayTemplate.variables.length === 0 ? (
                <p className="text-caption text-muted-foreground">Tidak ada variabel.</p>
              ) : (
                <div className="space-y-2">
                  {displayTemplate.variables.map((v) => (
                    <div
                      key={v.index}
                      className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2.5"
                    >
                      <span className="shrink-0 rounded bg-primary/12 px-1 font-mono text-mono-data text-primary">
                        {'{{'}{v.index}{'}}'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-medium">{v.label}</p>
                        {v.sample && (
                          <p className="text-caption text-muted-foreground">Sample: {v.sample}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
