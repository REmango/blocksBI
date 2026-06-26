import type { Types } from 'mongoose'

export interface CardLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface BiDashboard {
  _id: Types.ObjectId
  dashboardId: string
  userId: Types.ObjectId
  name: string
  description?: string
  pageNames: string[]
  pageList: CardLayout[][]
  currentPageIndex: number
  canvasWidth: number
  canvasHeight: number
  isTemplate: boolean
  isPublish: boolean
  snapshot?: string
  version: number
  createdAt: Date
  updatedAt: Date
}

export type BiDashboardInsert = Omit<BiDashboard, '_id' | 'createdAt' | 'updatedAt' | 'version'> & {
  version?: number
  createdAt?: Date
  updatedAt?: Date
}

export type BiDashboardUpdate = Partial<Omit<BiDashboard, '_id' | 'userId' | 'createdAt'>>
