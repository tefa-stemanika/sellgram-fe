import { z } from 'zod'

export const botConfigSchema = z.object({
  mode: z.enum(['AI', 'BUTTON']),
  midtransIsProduction: z.boolean()
})

export type BotConfigFormValues = z.infer<typeof botConfigSchema>
