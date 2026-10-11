'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  createProductSchema,
  type CreateProductFormValues,
  type UpdateProductFormValues,
  updateProductSchema
} from '@/schemas/products'

type ProductFormProps = {
  mode: 'create' | 'update'
  defaultValues?: Partial<UpdateProductFormValues>
  onSubmit: (values: CreateProductFormValues | UpdateProductFormValues) => void
  isLoading?: boolean
}

export function ProductForm({ mode, defaultValues, onSubmit, isLoading = false }: ProductFormProps) {
  const form = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ?? 0,
      emoji: defaultValues?.emoji ?? '',
      isAvailable: defaultValues?.isAvailable ?? true,
      stock: defaultValues?.stock ?? 0,
      stockEnabled: defaultValues?.stockEnabled ?? false,
      allowOversell: defaultValues?.allowOversell ?? false,
      lowStockAlert: defaultValues?.lowStockAlert ?? 5
    }
  })

  const stockEnabled = form.watch('stockEnabled')

  const handleFormSubmit = (values: UpdateProductFormValues) => {
    if (mode === 'create') {
      const parsed = createProductSchema.safeParse(values)
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]
        if (firstError?.path[0]) {
          form.setError(firstError.path[0] as keyof UpdateProductFormValues, {
            message: firstError.message
          })
        }
        return
      }

      onSubmit(parsed.data as CreateProductFormValues)
      return
    }

    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="mt-1 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama produk</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Nasi Goreng" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi produk" {...field} value={field.value ?? ''} className="min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji</FormLabel>
                <FormControl>
                  <Input
                    placeholder="🍳"
                    {...field}
                    value={field.value ?? ''}
                    className="text-center text-subsection-header"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {mode === 'update' && (
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                <FormLabel className="m-0 font-medium">Produk tersedia</FormLabel>
                <FormControl>
                  <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="border-t pt-4">
          <p className="text-small-header mb-3 text-muted-foreground">Manajemen stok</p>

          <FormField
            control={form.control}
            name="stockEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <FormLabel className="m-0 font-medium">Lacak stok</FormLabel>
                  <p className="text-caption text-muted-foreground">Aktifkan untuk mengelola stok produk</p>
                </div>
                <FormControl>
                  <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {stockEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok awal</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} value={field.value ?? 0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockAlert"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batas stok rendah</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} value={field.value ?? 5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allowOversell"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <FormLabel className="m-0 font-medium">Izinkan oversell</FormLabel>
                      <p className="text-caption text-muted-foreground">Izinkan pesanan meskipun stok habis</p>
                    </div>
                    <FormControl>
                      <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Form>
  )
}
