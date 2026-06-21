'use client'

import { useEffect, useState } from 'react'
import { FileText, PenTool, Variable } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
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
      <DialogContent className="max-w-xl overflow-hidden border-0 p-0 shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="max-h-[75vh] overflow-y-auto bg-white/30 p-6 backdrop-blur-xl dark:bg-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Detail Template</DialogTitle>
            <DialogDescription>Informasi dan preview template broadcast.</DialogDescription>
          </DialogHeader>

          {!displayTemplate ? null : (
            <div className="mt-5 space-y-5 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-base font-bold">{displayTemplate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {displayTemplate.variableCount} variabel &middot; Dibuat {formatDateTime(displayTemplate.createdAt)}
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

              {displayTemplate.preview && (
                <div className="overflow-hidden rounded-xl">
                  <div
                    className="min-h-[120px] flex items-start p-4"
                    style={{
                      backgroundImage: 'url(/images/telegram-chat-background.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 shadow-sm text-gray-900">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayTemplate.preview}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border bg-white/20 p-4 backdrop-blur-xl dark:bg-white/5">
                <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {displayTemplate.content}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <Variable className="h-4 w-4" />
                  Variabel ({displayTemplate.variables.length})
                </h4>
                {displayTemplate.variables.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Tidak ada variabel.</p>
                ) : (
                  <div className="space-y-2">
                    {displayTemplate.variables.map((v) => (
                      <div
                        key={v.index}
                        className="flex items-center gap-3 rounded-lg border bg-white/10 px-3 py-2.5"
                      >
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {'{{'}{v.index}{'}}'}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{v.label}</p>
                          {v.sample && (
                            <p className="text-xs text-muted-foreground">Sample: {v.sample}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
