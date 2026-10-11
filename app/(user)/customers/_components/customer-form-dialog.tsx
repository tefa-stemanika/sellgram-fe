'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  createCustomerSchema,
  type CreateCustomerFormValues,
  type UpdateCustomerFormValues,
  updateCustomerSchema
} from '@/schemas/customers'
import type { Customer } from '@/services/customers'

type CustomerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateCustomerFormValues | UpdateCustomerFormValues) => void
  customer?: Customer | null
  isLoading?: boolean
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  customer,
  isLoading = false
}: CustomerFormDialogProps) {
  const isEditMode = Boolean(customer)

  const form = useForm<UpdateCustomerFormValues>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: customer?.name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? ''
      })
    }
  }, [open, customer, form])

  const handleFormSubmit = (values: UpdateCustomerFormValues) => {
    if (!isEditMode) {
      const parsed = createCustomerSchema.safeParse(values)
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]
        if (firstError?.path[0]) {
          form.setError(firstError.path[0] as keyof UpdateCustomerFormValues, {
            message: firstError.message
          })
        }
        return
      }
      onSubmit(parsed.data as CreateCustomerFormValues)
      return
    }
    onSubmit(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          form.reset()
        }
      }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Perbarui informasi pelanggan.' : 'Masukkan data pelanggan baru.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="mt-1 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama pelanggan" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@contoh.com"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+628123456789"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
