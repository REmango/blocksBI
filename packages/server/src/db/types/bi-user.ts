import type { Types } from 'mongoose'

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface BiUser {
  _id: Types.ObjectId
  username: string
  email: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type BiUserInsert = Omit<BiUser, '_id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date
  updatedAt?: Date
}

export type BiUserUpdate = Partial<Omit<BiUser, '_id' | 'createdAt'>>
