import type {
  BiComponentSummary,
  BiDashboardContext,
  BiPageSummary,
} from '@block-bi/ai'

import type { BiComponentDocument } from '../db/models/bi-component.model'
import type { BiDashboardDocument } from '../db/models/bi-dashboard.model'

function readCardMeta(
  component: BiComponentDocument | undefined,
): { name: string; type: string } {
  const chartConfig = component?.chartConfig as { card?: Record<string, unknown> } | undefined
  const card = chartConfig?.card
  const type = typeof card?.componentName === 'string' ? card.componentName : 'unknown'
  const name =
    (typeof card?.name === 'string' && card.name) ||
    (typeof card?.componentName === 'string' && card.componentName) ||
    component?.componentKey ||
    'unknown'
  return { name, type }
}

export function buildDashboardContext(params: {
  sessionId: string
  userId: string
  dashboard: BiDashboardDocument
  components: BiComponentDocument[]
}): BiDashboardContext {
  const { sessionId, userId, dashboard, components } = params
  const componentMap = new Map(components.map((item) => [item.componentKey, item]))

  const pageList = dashboard.pageList ?? []
  const pageNames = dashboard.pageNames ?? []

  const pages: BiPageSummary[] = pageNames.map((name, index) => ({
    index,
    name,
    componentCount: pageList[index]?.length ?? 0,
  }))

  const summaries: BiComponentSummary[] = []
  pageList.forEach((page, pageIndex) => {
    page.forEach((layout, zIndex) => {
      const component = componentMap.get(layout.id)
      const { name, type } = readCardMeta(component)
      summaries.push({
        componentId: layout.id,
        componentKey: layout.id,
        name,
        type,
        pageIndex,
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        zIndex,
        visible: !component?.isHide,
      })
    })
  })

  return {
    dashboardId: dashboard.dashboardId,
    dashboardName: dashboard.name,
    sessionId,
    userId,
    canvasWidth: dashboard.canvasWidth,
    canvasHeight: dashboard.canvasHeight,
    currentPageIndex: dashboard.currentPageIndex ?? 0,
    pages,
    components: summaries,
  }
}
