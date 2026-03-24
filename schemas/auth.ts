import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid' }),
  password: z.string().min(6, { message: 'Kata sandi harus terdiri dari minimal 6 karakter' }),
  remember: z.boolean().default(false).optional()
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(1, { message: 'Nama harus terdiri dari minimal 1 karakter' }),
  email: z.string().email({ message: 'Alamat email tidak valid' }),
  password: z.string().min(6, { message: 'Kata sandi harus terdiri dari minimal 6 karakter' }),
  confirmPassword: z.string().min(6, { message: 'Kata sandi harus terdiri dari minimal 6 karakter' })
})
