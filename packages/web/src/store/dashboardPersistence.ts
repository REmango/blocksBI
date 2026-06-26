import type { DashboardPersistedState } from '@/types/dashboard'

import { fetchDashboard, isValidDashboardId } from '@/api/dashboard'
import { normalizePersistedState } from './dashboardStorage'
import useDashboardStore, { defaultDashboardState } from './useDashboardStore'

export { normalizePersistedState, PERSISTED_STATE_KEYS } from './dashboardStorage'

export function pickPersistedState(
  state: ReturnType<typeof useDashboardStore.getState>,
): DashboardPersistedState {
  return {
    dashboardName: state.dashboardName,
    currentPageIndex: state.currentPageIndex,
    pageList: state.pageList,
    pageNames: state.pageNames,
    cardMap: state.cardMap,
    canvasWidth: state.canvasWidth,
    canvasHeight: state.canvasHeight,
    viewMode: state.viewMode,
    mobileDeviceId: state.mobileDeviceId,
    savedPcCanvasWidth: state.savedPcCanvasWidth,
    savedPcCanvasHeight: state.savedPcCanvasHeight,
    pushConfig: state.pushConfig,
    advancedConfig: state.advancedConfig,
    hiddenCardIdsByPage: state.hiddenCardIdsByPage,
  }
}

export function applyPersistedState(partial: Partial<DashboardPersistedState>): void {
  const normalized = normalizePersistedState(partial)
  useDashboardStore.setState({
    ...defaultDashboardState,
    ...normalized,
  })
}

export async function loadDashboardFromApi(dashboardId: string): Promise<boolean> {
  if (!isValidDashboardId(dashboardId)) {
    return false
  }

  const state = await fetchDashboard(dashboardId)
  if (!state) {
    return false
  }

  applyPersistedState(state)
  return true
}

let loadSeq = 0

export async function initDashboardPersistence(dashboardId?: string): Promise<void> {
  if (!dashboardId || !isValidDashboardId(dashboardId)) {
    useDashboardStore.setState(defaultDashboardState)
    return
  }

  const seq = ++loadSeq
  useDashboardStore.setState(defaultDashboardState)

  try {
    const state = await fetchDashboard(dashboardId)
    if (seq !== loadSeq) {
      return
    }

    if (state) {
      applyPersistedState(state)
    } else {
      useDashboardStore.setState(defaultDashboardState)
    }
  } catch (error) {
    if (seq !== loadSeq) {
      return
    }
    console.error('[dashboard] failed to load dashboard:', error)
    useDashboardStore.setState(defaultDashboardState)
  }
}
