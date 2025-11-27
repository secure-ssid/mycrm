import { z } from 'zod'

export const createGoalSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  type: z.string().min(1, 'Goal type is required').max(255),
  target: z.number().int().min(0, 'Target must be positive'),
  actual: z.number().int().min(0).optional(),
  quarter: z.string().min(1, 'Quarter is required').max(50),
  deadline: z.string().datetime().optional().nullable(),
  reflection: z.string().max(5000).optional().nullable(),
})

export const updateGoalSchema = createGoalSchema

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
