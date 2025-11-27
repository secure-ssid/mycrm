import { z } from 'zod'

export const createTouchBaseSchema = z.object({
  contactId: z.string().uuid('Invalid contact ID'),
  whereMet: z.string().max(255).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  conversationNotes: z.string().max(5000).optional().nullable(),
  followUpDate: z.string().datetime().optional().nullable(),
  done: z.boolean().optional(),
})

export const updateTouchBaseSchema = createTouchBaseSchema

export type CreateTouchBaseInput = z.infer<typeof createTouchBaseSchema>
export type UpdateTouchBaseInput = z.infer<typeof updateTouchBaseSchema>
