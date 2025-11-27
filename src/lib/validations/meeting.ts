import { z } from 'zod'

export const createMeetingSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  siteId: z.string().uuid('Invalid site ID').optional().nullable(),
  date: z.string().datetime('Invalid date format'),
  attendees: z.string().max(1000).optional().nullable(),
  agenda: z.string().max(5000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  outcomes: z.string().max(5000).optional().nullable(),
})

export const updateMeetingSchema = createMeetingSchema

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>
