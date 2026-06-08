import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter')
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi'),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi kata sandi wajib diisi')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok',
  path: ['confirmPassword']
})

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  phone: z.string().optional()
})

export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, 'Kata sandi lama wajib diisi'),
  newPassword: z
    .string()
    .min(6, 'Kata sandi baru minimal 6 karakter'),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi kata sandi wajib diisi')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok',
  path: ['confirmPassword']
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
