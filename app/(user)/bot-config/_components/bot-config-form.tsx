'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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
      botMode: 'webhook',
      aiEnabled: false,
      geminiModel: 'gemini-2.0-flash',
      midtransIsProduction: false,
      ...defaultValues
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="midtransIsProduction"
          render={({ field }) => (
            <FormItem className="rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Environment Midtrans</FormLabel>
                  <p className="text-xs text-muted-foreground">Nonaktif berarti Sandbox, aktif berarti Production.</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </Button>
      </form>
    </Form>
  )
}
