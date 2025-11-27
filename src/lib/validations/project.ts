import { z } from 'zod'

export const OrderStatus = {
  NOT_ORDERED: 'NOT_ORDERED',
  ORDERED: 'ORDERED',
  PARTIAL: 'PARTIAL',
  COMPLETE: 'COMPLETE',
} as const

export const InstallStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
} as const

export const createProjectSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  pipelineId: z.string().uuid('Invalid pipeline ID').optional().nullable(),
  partner: z.string().max(255).optional().nullable(),
  solutionType: z.string().max(255).optional().nullable(),
  orderStatus: z.enum(['NOT_ORDERED', 'ORDERED', 'PARTIAL', 'COMPLETE']).optional(),
  installStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETE']).optional(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateProjectSchema = createProjectSchema

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
