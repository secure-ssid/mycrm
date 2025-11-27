// Type-safe enum constants for SQLite string fields
// These provide TypeScript type safety while working with SQLite's string storage

export const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PROSPECT: 'PROSPECT',
  ARCHIVED: 'ARCHIVED',
} as const
export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus]

export const PipelineStatus = {
  OPEN: 'OPEN',
  CLOSING_SOON: 'CLOSING_SOON',
  CLOSED_WON: 'CLOSED_WON',
  CLOSED_LOST: 'CLOSED_LOST',
} as const
export type PipelineStatus = (typeof PipelineStatus)[keyof typeof PipelineStatus]

export const OrderStatus = {
  NOT_ORDERED: 'NOT_ORDERED',
  ORDERED: 'ORDERED',
  PARTIAL: 'PARTIAL',
  COMPLETE: 'COMPLETE',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const InstallStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
} as const
export type InstallStatus = (typeof InstallStatus)[keyof typeof InstallStatus]

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const DocumentType = {
  LINK: 'LINK',
  UPLOAD: 'UPLOAD',
  ONENOTE: 'ONENOTE',
} as const
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType]

// Helper type for JSON fields stored as strings
export type PainPoint = {
  title: string
  description: string
}

export type Opportunity = {
  title: string
  description: string
}

export type ActionItem = {
  initiative: string
  tasks: string[]
}

export type NextStep = {
  step: string
  dueDate: string | null
}
