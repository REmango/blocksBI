import type { DashboardPersistedState } from '@/types/dashboard'

export const DASHBOARD_SYNC_INTERVAL_MS = 10_000

export const PERSISTED_STATE_KEYS: (keyof DashboardPersistedState)[] = [
  'dashboardName',
  'currentPageIndex',
  'pageList',
  'pageNames',
  'cardMap',
  'canvasWidth',
  'canvasHeight',
  'viewMode',
  'mobileDeviceId',
  'savedPcCanvasWidth',
  'savedPcCanvasHeight',
  'pushConfig',
  'advancedConfig',
  'hiddenCardIdsByPage',
]

/** localStorage key：当前页面地址（不含 query） */
export function getDashboardStorageKey(): string {
  return `${window.location.origin}${window.location.pathname}`
}

export function normalizePersistedState(
  data: Partial<DashboardPersistedState>,
): Partial<DashboardPersistedState> {
  const pageList = Array.isArray(data.pageList) ? data.pageList : undefined
  if (!pageList) return data

  const pageNames = Array.isArray(data.pageNames) ? [...data.pageNames] : []
  while (pageNames.length < pageList.length) {
    pageNames.push(`画布${pageNames.length + 1}`)
  }
  if (pageNames.length > pageList.length) {
    pageNames.length = pageList.length
  }

  let currentPageIndex = data.currentPageIndex ?? 0
  if (currentPageIndex < 0 || currentPageIndex >= pageList.length) {
    currentPageIndex = 0
  }

  const cardMap =
    data.cardMap && typeof data.cardMap === 'object' ? data.cardMap : undefined

  return {
    ...data,
    pageList,
    pageNames,
    currentPageIndex,
    cardMap,
  }
}

export function loadDashboardState(): Partial<DashboardPersistedState> | null {
  try {
    const raw = localStorage.getItem(getDashboardStorageKey())
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<DashboardPersistedState>
    if (!parsed || typeof parsed !== 'object') return null

    const state: Partial<DashboardPersistedState> = {}
    PERSISTED_STATE_KEYS.forEach((key) => {
      if (parsed[key] !== undefined) {
        state[key] = parsed[key] as DashboardPersistedState[typeof key]
      }
    })

    if (!state.pageList && !state.cardMap) return null

    return normalizePersistedState(state)
  } catch {
    return null
  }
}

export function saveDashboardState(state: DashboardPersistedState): void {
  try {
    localStorage.setItem(getDashboardStorageKey(), JSON.stringify(state))
  } catch (error) {
    console.error('[dashboardStorage] save failed', error)
  }
}
