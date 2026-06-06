import { z } from 'zod'

export const botConfigSchema = z.object({
  aiEnabled: z.boolean(),
  geminiModel: z.enum(['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-flash-latest'], {
    errorMap: () => ({ message: 'Pilih model Gemini yang valid' })
  }),
  midtransIsProduction: z.boolean()
})

export type BotConfigFormValues = z.infer<typeof botConfigSchema>
