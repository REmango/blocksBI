import { DEFAULT_ADVANCED_CONFIG } from '@/pages/dashboard/constants/advancedConfig'
import { DEFAULT_IPHONE_MODEL_ID } from '@/pages/dashboard/constants/iphoneModels'
import { DEFAULT_PUSH_CONFIG } from '@/pages/dashboard/constants/pushConfig'
import { DEFAULT_API_URL } from '@/ws/constants'

import type { DashboardCardMap, DashboardPersistedState } from '@/types/dashboard'

interface ApiResponse<T> {
  ok: boolean
  data?: T
  message?: string
}

export interface SaveDashboardResult {
  dashboardId: string
  version: number
  componentCount: number
}

export interface CreateDashboardResult {
  dashboardId: string
}

export interface DashboardListItem {
  dashboardId: string
  name: string
  pageCount: number
  componentCount: number
  canvasWidth: number
  canvasHeight: number
  version: number
  updatedAt: string
  createdAt: string
}

interface DashboardApiRecord {
  dashboardId: string
  name: string
  pageNames: string[]
  pageList: DashboardPersistedState['pageList']
  currentPageIndex: number
  canvasWidth: number
  canvasHeight: number
  extraConfig?: Record<string, unknown>
}

interface DashboardComponentRecord {
  componentKey: string
  chartConfig?: { card?: unknown }
  isHide?: boolean
}

interface FetchDashboardResponse {
  dashboard: DashboardApiRecord
  components: DashboardComponentRecord[]
}

/** Fixed UUID for local manual testing — matches server TEST_DASHBOARD_ID */
export const TEST_DASHBOARD_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidDashboardId(dashboardId: string): boolean {
  return UUID_V4_REGEX.test(dashboardId.trim())
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${DEFAULT_API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const body = (await response.json()) as ApiResponse<T>

  if (!response.ok || !body.ok || body.data === undefined) {
    throw new Error(body.message ?? `Request failed: ${path}`)
  }

  return body.data
}

function mapComponentsToCardMap(
  components: DashboardComponentRecord[],
): DashboardCardMap {
  const cardMap: DashboardCardMap = {}

  for (const component of components) {
    const card = component.chartConfig?.card
    if (card && typeof card === 'object') {
      cardMap[component.componentKey] = card as DashboardCardMap[string]
    }
  }

  return cardMap
}

function mapExtraConfigToPersistedFields(extraConfig: Record<string, unknown> = {}) {
  return {
    viewMode: (extraConfig.viewMode as DashboardPersistedState['viewMode']) ?? 'pc',
    mobileDeviceId: (extraConfig.mobileDeviceId as string) ?? DEFAULT_IPHONE_MODEL_ID,
    savedPcCanvasWidth: (extraConfig.savedPcCanvasWidth as number) ?? 1000,
    savedPcCanvasHeight: (extraConfig.savedPcCanvasHeight as number) ?? 1400,
    pushConfig:
      (extraConfig.pushConfig as DashboardPersistedState['pushConfig']) ?? DEFAULT_PUSH_CONFIG,
    advancedConfig:
      (extraConfig.advancedConfig as DashboardPersistedState['advancedConfig']) ??
      DEFAULT_ADVANCED_CONFIG,
    hiddenCardIdsByPage:
      (extraConfig.hiddenCardIdsByPage as DashboardPersistedState['hiddenCardIdsByPage']) ?? {},
  }
}

function mapApiToPersistedState(data: FetchDashboardResponse): DashboardPersistedState {
  const { dashboard, components } = data
  const extra = mapExtraConfigToPersistedFields(dashboard.extraConfig)

  return {
    dashboardName: dashboard.name,
    currentPageIndex: dashboard.currentPageIndex,
    pageNames: dashboard.pageNames,
    pageList: dashboard.pageList,
    canvasWidth: dashboard.canvasWidth,
    canvasHeight: dashboard.canvasHeight,
    cardMap: mapComponentsToCardMap(components),
    ...extra,
  }
}

export type SaveDashboardPayload = DashboardPersistedState

export async function fetchDashboard(
  dashboardId: string,
): Promise<DashboardPersistedState | null> {
  if (!isValidDashboardId(dashboardId)) {
    return null
  }

  const response = await fetch(`${DEFAULT_API_URL}/api/dashboards/${dashboardId}`, {
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status === 404) {
    return null
  }

  const body = (await response.json()) as ApiResponse<FetchDashboardResponse>

  if (!response.ok || !body.ok || !body.data) {
    throw new Error(body.message ?? 'Failed to fetch dashboard')
  }

  return mapApiToPersistedState(body.data)
}

export async function fetchDashboardList(): Promise<DashboardListItem[]> {
  return request<DashboardListItem[]>('/api/dashboards/list')
}

export async function createDashboard(name?: string): Promise<CreateDashboardResult> {
  return request<CreateDashboardResult>('/api/dashboards', {
    method: 'POST',
    body: JSON.stringify(name ? { name } : {}),
  })
}

export async function saveDashboard(
  dashboardId: string,
  payload: SaveDashboardPayload,
): Promise<SaveDashboardResult> {
  if (!isValidDashboardId(dashboardId)) {
    throw new Error('dashboardId 必须是 UUID v4 格式')
  }

  return request<SaveDashboardResult>(`/api/dashboards/${dashboardId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
