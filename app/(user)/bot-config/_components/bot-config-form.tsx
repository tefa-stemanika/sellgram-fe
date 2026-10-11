'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Grid3x3 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { botConfigSchema, type BotConfigFormValues } from '@/schemas/bot-config'

import { ModePreviewDialog } from './mode-preview-dialog'

type BotConfigFormProps = {
  defaultValues?: Partial<BotConfigFormValues>
  onSubmit: (values: BotConfigFormValues) => void
  isLoading?: boolean
}

const MODE_OPTIONS = [
  {
    value: 'AI' as const,
    icon: Bot,
    title: 'AI Mode',
    desc: 'Bot membalas chat pelanggan secara otomatis menggunakan kecerdasan buatan.'
  },
  {
    value: 'BUTTON' as const,
    icon: Grid3x3,
    title: 'Button Mode',
    desc: 'Pelanggan memilih dari opsi yang telah disediakan oleh bot.'
  }
]

export function BotConfigForm({ defaultValues, onSubmit, isLoading = false }: BotConfigFormProps) {
  const form = useForm<BotConfigFormValues>({
    resolver: zodResolver(botConfigSchema),
    defaultValues: {
      mode: 'BUTTON',
      midtransIsProduction: false,
      ...defaultValues
    }
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-small-header">Mode Operasi</FormLabel>
              <FormDescription className="text-caption">
                Pilih cara bot menangani chat dari pelanggan.
              </FormDescription>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {MODE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = field.value === opt.value

                  return (
                    <div
                      key={opt.value}
                      className={cn(
                        'relative cursor-pointer rounded-lg border p-4 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/50'
                      )}
                      onClick={() => field.onChange(opt.value)}>
                      <FormControl>
                        <input
                          type="radio"
                          className="sr-only"
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => field.onChange(opt.value)}
                        />
                      </FormControl>

                      <div
                        className={cn(
                          'mb-3 inline-flex rounded-md p-2.5 transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3 className="text-small-header">{opt.title}</h3>
                      <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
                        {opt.desc}
                      </p>

                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <ModePreviewDialog defaultMode={opt.value}>
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            className="h-7 w-full text-caption font-medium"
                            onClick={(e) => e.stopPropagation()}>
                            Lihat Preview
                          </Button>
                        </ModePreviewDialog>
                      </div>
                    </div>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="midtransIsProduction"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-small-header">Midtrans Production</FormLabel>
                <FormDescription className="text-caption">
                  Nonaktifkan untuk menggunakan environment Sandbox. Aktifkan hanya jika sudah siap production.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </Button>
      </form>
    </Form>
  )
}
