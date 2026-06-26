import mongoose from 'mongoose'

import { DB_NAME } from './constants'

const DEFAULT_URL = `mongodb://admin:123456@localhost:27017/${DB_NAME}?authSource=admin`

export function getMongoUrl(): string {
  return process.env.MONGODB_URL ?? DEFAULT_URL
}

export async function connectMongo(url = getMongoUrl()): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true)

  await mongoose.connect(url, { dbName: DB_NAME })

  return mongoose
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect()
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1
}
