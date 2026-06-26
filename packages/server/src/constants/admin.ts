import { BiUserModel } from '../db/models'

export const ADMIN_USERNAME = 'admin'

let cachedAdminUserId: string | null = null

export async function getAdminUserId(): Promise<string> {
  if (cachedAdminUserId) {
    return cachedAdminUserId
  }

  const user = await BiUserModel.findOne({ username: ADMIN_USERNAME }).select('_id')

  if (!user) {
    throw new Error(`Admin user "${ADMIN_USERNAME}" not found in bi_user collection`)
  }

  cachedAdminUserId = user._id.toString()
  return cachedAdminUserId
}

export function userRoom(userId: string): string {
  return `user:${userId}`
}

export function dashboardRoom(dashboardId: string): string {
  return `dashboard:${dashboardId}`
}

export function sessionRoom(sessionId: string): string {
  return `session:${sessionId}`
}
