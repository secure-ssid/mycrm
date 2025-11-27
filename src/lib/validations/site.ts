import { z } from 'zod'

export const createSiteSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  name: z.string().min(1, 'Site name is required').max(255),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  competitors: z.string().max(1000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateSiteSchema = createSiteSchema

export type CreateSiteInput = z.infer<typeof createSiteSchema>
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>
