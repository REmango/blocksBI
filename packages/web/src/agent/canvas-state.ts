import type { CardLayout, ChartCardItem, DashboardCardItem } from '@/types/dashboard'
import useDashboardStore from '@/store/useDashboardStore'

export interface ComponentSummary {
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
  chartType?: string
  dataBindingSummary?: string
  groupId?: string
}

export function getDashboardState() {
  return useDashboardStore.getState()
}

export function findComponentPageIndex(componentId: string): number | null {
  const { pageList } = getDashboardState()
  for (let pageIndex = 0; pageIndex < pageList.length; pageIndex++) {
    if (pageList[pageIndex]?.some((item) => item.id === componentId)) {
      return pageIndex
    }
  }
  return null
}

function summarizeDataBinding(card: ChartCardItem): string {
  const data = card.props.dataConfig
  if (!data) return 'none'
  const parts: string[] = []
  if (data.dimList?.length) parts.push(`dims:${data.dimList.length}`)
  if (data.metricList?.length) parts.push(`metrics:${data.metricList.length}`)
  if (data.data?.length) parts.push(`rows:${data.data.length}`)
  return parts.join(', ') || 'configured'
}

export function buildComponentSummary(
  layout: CardLayout,
  pageIndex: number,
  zIndex: number,
  hidden: Set<string>,
): ComponentSummary | null {
  const card = getDashboardState().cardMap[layout.id] as DashboardCardItem | undefined
  if (!card) return null

  const summary: ComponentSummary = {
    componentId: layout.id,
    componentKey: card.key,
    name: card.name,
    type: card.componentName,
    pageIndex,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    zIndex,
    visible: !hidden.has(layout.id),
  }

  if (card.componentName === 'chart') {
    summary.chartType = card.props.siderConfig.componentName
    summary.dataBindingSummary = summarizeDataBinding(card)
  }

  return summary
}

export function listComponentsForPage(pageIndex: number): ComponentSummary[] {
  const state = getDashboardState()
  const page = state.pageList[pageIndex] ?? []
  const hidden = new Set(state.hiddenCardIdsByPage[pageIndex] ?? [])

  return page
    .map((layout, zIndex) => buildComponentSummary(layout, pageIndex, zIndex, hidden))
    .filter((item): item is ComponentSummary => item !== null)
}

export function listAllComponents(options?: { pageIndex?: number; allPages?: boolean }): ComponentSummary[] {
  const state = getDashboardState()

  if (options?.allPages) {
    return state.pageList.flatMap((_, pageIndex) => listComponentsForPage(pageIndex))
  }

  const pageIndex = options?.pageIndex ?? state.currentPageIndex
  return listComponentsForPage(pageIndex)
}

export function getLayoutOnPage(pageIndex: number, componentId: string): CardLayout | undefined {
  return getDashboardState().pageList[pageIndex]?.find((item) => item.id === componentId)
}

export function patchPageLayout(
  pageIndex: number,
  updater: (layout: CardLayout[]) => CardLayout[],
): void {
  useDashboardStore.setState((state) => ({
    pageList: state.pageList.map((page, index) =>
      index === pageIndex ? updater([...page]) : page,
    ),
  }))
}

export function patchMultiplePages(
  updates: Array<{ pageIndex: number; layout: CardLayout[] }>,
): void {
  useDashboardStore.setState((state) => {
    const next = [...state.pageList]
    for (const { pageIndex, layout } of updates) {
      next[pageIndex] = layout
    }
    return { pageList: next }
  })
}

export function getComponentDetail(componentId: string) {
  const pageIndex = findComponentPageIndex(componentId)
  if (pageIndex === null) {
    throw new Error(`Component not found: ${componentId}`)
  }

  const state = getDashboardState()
  const layout = getLayoutOnPage(pageIndex, componentId)
  const card = state.cardMap[componentId]
  if (!layout || !card) {
    throw new Error(`Component not found: ${componentId}`)
  }

  const hidden = new Set(state.hiddenCardIdsByPage[pageIndex] ?? [])
  const zIndex = state.pageList[pageIndex]?.findIndex((item) => item.id === componentId) ?? -1

  return {
    ...buildComponentSummary(layout, pageIndex, zIndex, hidden),
    showCardTitle: card.showCardTitle ?? true,
    props:
      card.componentName === 'chart'
        ? {
            siderConfig: card.props.siderConfig,
            styleConfig: card.props.styleConfig,
            dataConfig: summarizeChartDataConfig(card.props.dataConfig),
            eventConfig: card.props.eventConfig,
          }
        : card.props,
  }
}

function summarizeChartDataConfig(dataConfig: ChartCardItem['props']['dataConfig']) {
  const rows = dataConfig?.data
  return {
    dimList: dataConfig?.dimList,
    metricList: dataConfig?.metricList,
    rowCount: Array.isArray(rows) ? rows.length : 0,
    sampleRows: Array.isArray(rows) ? rows.slice(0, 5) : [],
  }
}

export function getChartDataPayload(componentId?: string, pageIndex?: number) {
  const state = getDashboardState()
  const idx = pageIndex ?? state.currentPageIndex
  const targets = componentId
    ? [componentId]
    : (state.pageList[idx] ?? [])
        .map((item) => item.id)
        .filter((id) => state.cardMap[id]?.componentName === 'chart')

  const charts = targets
    .map((id) => {
      const card = state.cardMap[id]
      if (!card || card.componentName !== 'chart') return null
      const layout = getLayoutOnPage(idx, id)
      return {
        componentId: id,
        name: card.name,
        chartType: card.props.siderConfig.componentName,
        pageIndex: idx,
        layout,
        dataConfig: summarizeChartDataConfig(card.props.dataConfig),
        styleConfig: card.props.styleConfig,
      }
    })
    .filter(Boolean)

  return { pageIndex: idx, charts }
}

export function getSelectedComponents(options?: { includeDetail?: boolean }) {
  const includeDetail = options?.includeDetail ?? true
  const state = getDashboardState()
  const componentId = state.currentEditingCardId

  if (!componentId) {
    return {
      count: 0,
      componentIds: [] as string[],
      components: [] as Array<ComponentSummary | ReturnType<typeof getComponentDetail>>,
    }
  }

  const pageIndex = findComponentPageIndex(componentId)
  if (pageIndex === null) {
    return { count: 0, componentIds: [], components: [] }
  }

  if (includeDetail) {
    try {
      return {
        count: 1,
        componentIds: [componentId],
        components: [getComponentDetail(componentId)],
      }
    } catch {
      return { count: 0, componentIds: [], components: [] }
    }
  }

  const page = state.pageList[pageIndex] ?? []
  const zIndex = page.findIndex((item) => item.id === componentId)
  const layout = page[zIndex]
  const hidden = new Set(state.hiddenCardIdsByPage[pageIndex] ?? [])
  const summary = layout ? buildComponentSummary(layout, pageIndex, zIndex, hidden) : null

  return {
    count: summary ? 1 : 0,
    componentIds: summary ? [componentId] : [],
    components: summary ? [summary] : [],
  }
}
