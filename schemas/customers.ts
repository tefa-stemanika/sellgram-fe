import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal(''))
})

export const createCustomerSchema = customerSchema
export const updateCustomerSchema = customerSchema.partial()

export type CustomerFormValues = z.infer<typeof customerSchema>
export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>
export type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>
