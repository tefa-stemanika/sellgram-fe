'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { botConfigSchema, type BotConfigFormValues } from '@/schemas/bot-config'

type BotConfigFormProps = {
  defaultValues?: Partial<BotConfigFormValues>
  onSubmit: (values: BotConfigFormValues) => void
  isLoading?: boolean
}

const GEMINI_MODELS: BotConfigFormValues['geminiModel'][] = [
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-flash-latest'
]

export function BotConfigForm({ defaultValues, onSubmit, isLoading = false }: BotConfigFormProps) {
  const form = useForm<BotConfigFormValues>({
    resolver: zodResolver(botConfigSchema),
    defaultValues: {
      aiEnabled: false,
      geminiModel: 'gemini-2.0-flash',
      midtransIsProduction: false,
      ...defaultValues
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="aiEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border bg-white/20 p-4 backdrop-blur-xl transition-colors hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold">AI Chat</FormLabel>
                <FormDescription className="text-xs">
                  Aktifkan AI untuk membalas chat pelanggan secara otomatis menggunakan Gemini.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('aiEnabled') && (
          <FormField
            control={form.control}
            name="geminiModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Model</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/20 backdrop-blur-xl border border-white/20">
                      <SelectValue placeholder="Pilih model Gemini" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GEMINI_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Pilih model Google Gemini yang akan digunakan untuk AI chat.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="midtransIsProduction"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border bg-white/20 p-4 backdrop-blur-xl transition-colors hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold">Midtrans Production</FormLabel>
                <FormDescription className="text-xs">
                  Nonaktifkan untuk menggunakan environment Sandbox. Aktifkan hanya jika sudah siap production.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full shadow-sm transition-all duration-200 hover:shadow-md">
          {isLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </Button>
      </form>
    </Form>
  )
}
