import { z } from 'zod'

export const createContactSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  name: z.string().min(1, 'Contact name is required').max(255),
  role: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  isChampion: z.boolean().optional(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateContactSchema = createContactSchema

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
