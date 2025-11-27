import { z } from 'zod'

export const PipelineStatus = {
  OPEN: 'OPEN',
  CLOSING_SOON: 'CLOSING_SOON',
  CLOSED_WON: 'CLOSED_WON',
  CLOSED_LOST: 'CLOSED_LOST',
} as const

export const createPipelineSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  description: z.string().min(1, 'Description is required').max(1000),
  value: z.number().min(0).optional(),
  status: z.enum(['OPEN', 'CLOSING_SOON', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  expectedClose: z.string().max(50).optional().nullable(),
})

export const updatePipelineSchema = createPipelineSchema

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>
