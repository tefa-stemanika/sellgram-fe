import { z } from 'zod'

export const cashflowSchema = z.object({
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  date: z.date(),
  note: z.string()
})
