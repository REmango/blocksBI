import { BI_AGENT_NAMESPACE, DEFAULT_WS_URL } from './constants'
import { resetBiAgentJoinState } from './join-state'
import { getWsClient } from './ws-client'

let dashboardBindingCount = 0
let networkListenersBound = false

function ensureNetworkListeners(): void {
  if (networkListenersBound || typeof window === 'undefined') return
  networkListenersBound = true

  const client = getWsClient()

  window.addEventListener('online', () => {
    void client.setNetworkOnline(true)
  })

  window.addEventListener('offline', () => {
    void client.setNetworkOnline(false)
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      void client.setNetworkOnline(true)
    }
  })

  window.addEventListener('pagehide', () => {
    if (dashboardBindingCount > 0) {
      void client.releaseDashboard()
      resetBiAgentJoinState()
      dashboardBindingCount = 0
    }
  })
}

async function connectBiAgentIfNeeded(): Promise<void> {
  const client = getWsClient()
  const status = await client.getStatus()
  if (status.connected && status.namespace === BI_AGENT_NAMESPACE) {
    return
  }
  await client.connect({ url: DEFAULT_WS_URL, namespace: BI_AGENT_NAMESPACE })
}

/**
 * Bind WS for dashboard route — drawer open/close does NOT call this.
 * Disconnect when the last dashboard route binding is released (per SharedWorker consumer count).
 */
export function bindDashboardWsLifecycle(): () => void {
  const client = getWsClient()
  client.init()
  ensureNetworkListeners()

  dashboardBindingCount += 1
  if (dashboardBindingCount === 1) {
    void client.acquireDashboard().then(() => connectBiAgentIfNeeded())
    void client.setNetworkOnline(navigator.onLine)
  }

  let released = false

  return () => {
    if (released) return
    released = true

    dashboardBindingCount = Math.max(0, dashboardBindingCount - 1)
    resetBiAgentJoinState()

    if (dashboardBindingCount === 0) {
      void client.releaseDashboard()
    }
  }
}

export { resetBiAgentJoinState } from './join-state'
