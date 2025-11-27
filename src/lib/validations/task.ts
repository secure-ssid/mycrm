import { z } from 'zod'

export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

export const createTaskSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  siteId: z.string().uuid('Invalid site ID').optional().nullable(),
  description: z.string().min(1, 'Description is required').max(1000),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
})

export const updateTaskSchema = createTaskSchema

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
