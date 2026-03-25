import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  price: z.coerce
    .number({ invalid_type_error: 'Harga harus berupa angka' })
    .min(1, 'Harga minimal Rp 1')
    .max(99_999_999, 'Harga terlalu besar'),
  emoji: z.string().min(1, 'Emoji wajib diisi').max(10, 'Emoji terlalu panjang'),
  isAvailable: z.boolean().default(true)
})

export const createProductSchema = productSchema.omit({ isAvailable: true })
export const updateProductSchema = productSchema.partial()

export type ProductFormValues = z.infer<typeof productSchema>
export type CreateProductFormValues = z.infer<typeof createProductSchema>
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>
