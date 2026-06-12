import type { DashboardPersistedState } from '@/types/dashboard'

import { DASHBOARD_SYNC_INTERVAL_MS, saveDashboardState } from './dashboardStorage'
import useDashboardStore from './useDashboardStore'

export { DASHBOARD_SYNC_INTERVAL_MS, getDashboardStorageKey } from './dashboardStorage'

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

export function syncDashboardStoreToLocalStorage(): void {
  saveDashboardState(pickPersistedState(useDashboardStore.getState()))
}

let syncTimer: ReturnType<typeof setInterval> | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let storeUnsubscribe: (() => void) | null = null

const DEBOUNCE_MS = 300

function scheduleDebouncedSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    syncDashboardStoreToLocalStorage()
  }, DEBOUNCE_MS)
}

export function startDashboardPersistenceSync(): void {
  syncDashboardStoreToLocalStorage()

  if (storeUnsubscribe) {
    storeUnsubscribe()
  }

  storeUnsubscribe = useDashboardStore.subscribe(() => {
    scheduleDebouncedSync()
  })

  if (syncTimer) {
    clearInterval(syncTimer)
  }

  syncTimer = setInterval(() => {
    syncDashboardStoreToLocalStorage()
  }, DASHBOARD_SYNC_INTERVAL_MS)

  window.addEventListener('beforeunload', syncDashboardStoreToLocalStorage)
  window.addEventListener('pagehide', syncDashboardStoreToLocalStorage)
}

export function stopDashboardPersistenceSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  if (storeUnsubscribe) {
    storeUnsubscribe()
    storeUnsubscribe = null
  }

  window.removeEventListener('beforeunload', syncDashboardStoreToLocalStorage)
  window.removeEventListener('pagehide', syncDashboardStoreToLocalStorage)
}

export function initDashboardPersistence(): void {
  startDashboardPersistenceSync()
}
