'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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
      botMode: 'polling',
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
          name="botMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode Bot</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="polling">Polling</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Polling cocok untuk development, webhook cocok untuk production.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aiEnabled"
          render={({ field }) => (
            <FormItem className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>AI Mode</FormLabel>
                  <p className="text-xs text-muted-foreground">Aktifkan agar bot memakai model Gemini untuk respons AI.</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="geminiModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Gemini</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih model" />
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
              <p className="text-xs text-muted-foreground">Pilih model AI yang digunakan untuk respons bot.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="midtransIsProduction"
          render={({ field }) => (
            <FormItem className="rounded-md border p-3">
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
