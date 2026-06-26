import { validate as validateUuid, v4 as uuidv4 } from 'uuid'

export function createDashboardId(): string {
  return uuidv4()
}

export function assertDashboardId(dashboardId: string, field = 'dashboardId'): string {
  if (!validateUuid(dashboardId)) {
    throw new Error(`Invalid ${field}, expected UUID v4`)
  }
  return dashboardId
}

/** Fixed UUID for local manual testing */
export const TEST_DASHBOARD_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

/** Fastify param regex — keeps static paths like /list from matching :dashboardId */
export const DASHBOARD_ID_ROUTE_PARAM =
  ':dashboardId([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})'
