import { z } from 'zod'

export const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PROSPECT: 'PROSPECT',
  ARCHIVED: 'ARCHIVED',
} as const

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  industry: z.string().max(100).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'ARCHIVED']).optional(),
})

export const updateCustomerSchema = createCustomerSchema

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
