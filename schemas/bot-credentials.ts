import { z } from 'zod'

export const CREDENTIAL_KEYS = [
  'TELEGRAM_BOT_TOKEN',
  'ADMIN_BOT_TOKEN',
  'ADMIN_CHAT_ID',
  // 'GEMINI_API_KEY',
  'MIDTRANS_SERVER_KEY_SANDBOX',
  'MIDTRANS_CLIENT_KEY_SANDBOX',
  'MIDTRANS_SERVER_KEY_PRODUCTION',
  'MIDTRANS_CLIENT_KEY_PRODUCTION',
  'MIDTRANS_FINISH_URL'
] as const

export type CredentialKey = (typeof CREDENTIAL_KEYS)[number]

export const createCredentialSchema = z.object({
  key: z.enum(CREDENTIAL_KEYS, {
    errorMap: () => ({ message: 'Pilih credential key yang valid' })
  }),
  value: z.string().min(1, 'Nilai credential wajib diisi')
})

export const updateCredentialSchema = z.object({
  value: z.string().min(1, 'Nilai credential wajib diisi')
})

export type CreateCredentialFormValues = z.infer<typeof createCredentialSchema>
export type UpdateCredentialFormValues = z.infer<typeof updateCredentialSchema>
