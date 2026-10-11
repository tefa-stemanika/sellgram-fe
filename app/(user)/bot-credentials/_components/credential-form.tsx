'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CREDENTIAL_KEYS,
  createCredentialSchema,
  updateCredentialSchema,
  type CreateCredentialFormValues,
  type UpdateCredentialFormValues
} from '@/schemas/bot-credentials'

type CredentialFormProps = {
  mode: 'create' | 'update'
  credentialKey?: string
  onSubmit: (values: CreateCredentialFormValues | UpdateCredentialFormValues) => void
  isLoading?: boolean
}

export function CredentialForm({ mode, credentialKey, onSubmit, isLoading = false }: CredentialFormProps) {
  const [showValue, setShowValue] = useState(false)

  const form = useForm<CreateCredentialFormValues | UpdateCredentialFormValues>({
    resolver: zodResolver(mode === 'create' ? createCredentialSchema : updateCredentialSchema),
    defaultValues:
      mode === 'create'
        ? {
            key: CREDENTIAL_KEYS[0],
            value: ''
          }
        : {
            value: ''
          }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === 'create' ? (
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credential Key</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih credential key" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CREDENTIAL_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="rounded-md border p-3 text-sm">
            <p className="text-caption text-muted-foreground">Key</p>
            <p className="font-mono text-mono-data">{credentialKey}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showValue ? 'text' : 'password'} placeholder="Masukkan credential value" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={() => setShowValue((prev) => !prev)}>
                    {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Form>
  )
}
