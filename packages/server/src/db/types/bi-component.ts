import type { Types } from 'mongoose'

export interface BiComponent {
  _id: Types.ObjectId
  dashboardId: string
  userId: Types.ObjectId
  componentKey: string
  chartConfig: Record<string, unknown>
  isLock: boolean
  isHide: boolean
  createdAt: Date
  updatedAt: Date
}

export type BiComponentInsert = Omit<BiComponent, '_id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date
  updatedAt?: Date
}

export type BiComponentUpdate = Partial<Omit<BiComponent, '_id' | 'dashboardId' | 'userId' | 'createdAt'>>
