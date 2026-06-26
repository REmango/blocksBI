/** BI dashboard working context injected into the agent loop. */
export interface BiComponentSummary {
  componentId: string
  componentKey: string
  name: string
  type: string
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  visible: boolean
  groupId?: string
}

export interface BiPageSummary {
  index: number
  name: string
  componentCount: number
}

export interface BiDashboardContext {
  dashboardId: string
  dashboardName: string
  sessionId: string
  userId: string
  canvasWidth: number
  canvasHeight: number
  currentPageIndex: number
  pages: BiPageSummary[]
  components: BiComponentSummary[]
}
