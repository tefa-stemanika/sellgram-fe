'use client'

import { useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createTemplateSchema, type CreateTemplateFormValues } from '@/schemas/broadcast'
import { createTemplate } from '@/services/template'

type TemplateCreatePageProps = {
  token: string
}

export function TemplateCreatePage({ token }: TemplateCreatePageProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [variables, setVariables] = useState<{ index: number; label: string; sample: string }[]>([])

  const form = useForm<CreateTemplateFormValues>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: { name: '', content: '', channel: 'TELEGRAM' },
  })

  const detectVariables = (text: string): number[] => {
    const matches = text.match(/\{\{(\d+)\}\}/g)
    if (!matches) return []
    const indices = matches.map((m) => parseInt(m.slice(2, -2), 10))
    return [...new Set(indices)].sort((a, b) => a - b)
  }

  const handleContentChange = (content: string) => {
    form.setValue('content', content)
    const found = detectVariables(content)
    setVariables(
      found.map((idx) => {
        const existing = variables.find((v) => v.index === idx)
        return existing ?? { index: idx, label: '', sample: '' }
      })
    )
  }

  const updateVariable = (index: number, field: 'label' | 'sample', value: string) => {
    setVariables((prev) => prev.map((v) => (v.index === index ? { ...v, [field]: value } : v)))
  }

  const addVariable = () => {
    const nextIndex = variables.length ? Math.max(...variables.map((v) => v.index)) + 1 : 1
    const placeholder = `{{${nextIndex}}}`
    const textarea = contentRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const content = form.getValues('content')
      const newContent = content.slice(0, start) + placeholder + content.slice(end)
      form.setValue('content', newContent)
      handleContentChange(newContent)
      requestAnimationFrame(() => {
        textarea.focus()
        const pos = start + placeholder.length
        textarea.setSelectionRange(pos, pos)
      })
    } else {
      const content = form.getValues('content')
      form.setValue('content', content + placeholder)
      handleContentChange(content + placeholder)
    }
    setVariables((prev) => {
      if (prev.some((v) => v.index === nextIndex)) return prev
      return [...prev, { index: nextIndex, label: '', sample: '' }]
    })
  }

  const watchedContent = form.watch('content')

  const preview = useMemo(() => {
    if (!watchedContent) return null
    let rendered = watchedContent
    for (const v of variables.filter((v) => v.sample)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${v.index}\\}\\}`, 'g'), v.sample)
    }
    return rendered
  }, [watchedContent, variables])

  const handleSubmit = async (values: CreateTemplateFormValues) => {
    if (!token) return
    const vars = variables
      .filter((v) => v.label.trim())
      .map((v) => ({
        index: v.index,
        label: v.label,
        ...(v.sample ? { sample: v.sample } : {}),
      }))
    if (!vars.length) {
      toast.error('Minimal 1 variabel dengan label')
      return
    }
    setIsSaving(true)
    try {
      await createTemplate(token, { ...values, variables: vars })
      toast.success('Template berhasil dibuat')
      router.push('/templates')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat template')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Template</span>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="bg-white p-6 dark:bg-card">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Link href="/templates">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>

          <h1 className="mb-6 text-2xl font-black tracking-tight">Buat Template Baru</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Template</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Promo Umum" {...field} className="bg-white dark:bg-card" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konten Template</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tulis pesan template di sini..."
                            rows={6}
                            className="bg-white dark:bg-card resize-none font-mono text-sm"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleContentChange(e.target.value)
                            }}
                            ref={(e) => {
                              field.ref(e)
                              ;(contentRef as any).current = e
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="button" variant="outline" size="sm" onClick={addVariable} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Tambah Variabel
                  </Button>

                  {variables.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Variabel</span>
                        <span className="text-xs text-muted-foreground">{variables.length} variabel</span>
                      </div>
                      {variables.map((v) => (
                        <div key={v.index} className="flex items-start gap-2 rounded-lg border bg-white/50 p-3 dark:bg-card/50">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                            {v.index}
                          </div>
                          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                            <Input
                              placeholder="Label"
                              value={v.label}
                              onChange={(e) => updateVariable(v.index, 'label', e.target.value)}
                              className="flex-1 bg-white dark:bg-card"
                            />
                            <Input
                              placeholder="Sample"
                              value={v.sample}
                              onChange={(e) => updateVariable(v.index, 'sample', e.target.value)}
                              className="flex-1 bg-white dark:bg-card"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {preview && (
                    <Card className="overflow-hidden border shadow-sm sticky top-4">
                      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          Preview
                        </div>
                        <div
                          className="rounded-xl p-4 min-h-[200px] flex items-start"
                          style={{
                            backgroundImage: 'url(/images/telegram-chat-background.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 shadow-sm text-gray-900">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{preview}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Buat Template'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
