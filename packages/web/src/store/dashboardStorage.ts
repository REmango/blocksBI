import type { DashboardPersistedState } from '@/types/dashboard'

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
