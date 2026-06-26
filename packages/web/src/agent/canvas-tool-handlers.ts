import useDashboardStore from '@/store/useDashboardStore'

import {
  alignLayouts,
  adjustZIndex,
  applyMarginBetween,
  distributeLayouts,
  gridArrangeLayouts,
} from './canvas-layout-utils'
import {
  findComponentPageIndex,
  getChartDataPayload,
  getComponentDetail,
  getDashboardState,
  getSelectedComponents,
  listAllComponents,
  patchPageLayout,
} from './canvas-state'

function ok(data: unknown) {
  return JSON.stringify(data)
}

export async function executeCanvasTool(
  toolName: string,
  input: Record<string, unknown>,
): Promise<string> {
  switch (toolName) {
    case 'bi_get_canvas_meta': {
      const state = getDashboardState()
      return ok({
        dashboardName: state.dashboardName,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        viewMode: state.viewMode,
        currentPageIndex: state.currentPageIndex,
        pageNames: state.pageNames,
        pageCount: state.pageList.length,
        advancedConfig: state.advancedConfig,
        componentCount: state.pageList.reduce((sum, page) => sum + page.length, 0),
      })
    }

    case 'bi_list_all_components':
      return ok(
        listAllComponents({
          pageIndex: input.pageIndex as number | undefined,
          allPages: Boolean(input.allPages),
        }),
      )

    case 'bi_search_component_by_name': {
      const keyword = String(input.keyword ?? '').toLowerCase()
      const componentType = input.componentType ? String(input.componentType).toLowerCase() : undefined
      const limit = Number(input.limit ?? 20)
      const pageIndex = input.pageIndex as number | undefined

      const pool = listAllComponents({
        pageIndex,
        allPages: pageIndex === undefined,
      })

      const matched = pool
        .filter((item) => {
          if (componentType && item.type.toLowerCase() !== componentType) return false
          const haystack = `${item.name} ${item.componentKey} ${item.chartType ?? ''}`.toLowerCase()
          return haystack.includes(keyword)
        })
        .slice(0, limit)

      return ok({ keyword, count: matched.length, components: matched })
    }

    case 'bi_get_single_component_detail':
      return ok(getComponentDetail(String(input.componentId)))

    case 'bi_get_selected_components':
      return ok(
        getSelectedComponents({
          includeDetail: input.includeDetail !== false,
        }),
      )

    case 'bi_get_current_chart_data':
      return ok(
        getChartDataPayload(
          input.componentId ? String(input.componentId) : undefined,
          input.pageIndex as number | undefined,
        ),
      )

    case 'bi_move_components': {
      const items = (input.items as Array<Record<string, unknown>>) ?? []
      console.warn('bi_move_components', items)
      for (const item of items) {
        const componentId = String(item.componentId)
        const pageIndex = findComponentPageIndex(componentId)
        if (pageIndex === null) continue

        patchPageLayout(pageIndex, (page) =>
          page.map((layout) => {
            if (layout.id !== componentId) return layout
            const next = { ...layout }
            if (typeof item.x === 'number') next.x = item.x
            if (typeof item.y === 'number') next.y = item.y
            if (typeof item.offsetX === 'number') next.x += item.offsetX
            if (typeof item.offsetY === 'number') next.y += item.offsetY
            return next
          }),
        )
      }
      return ok({ moved: items.length })
    }

    case 'bi_resize_components': {
      const items = (input.items as Array<Record<string, unknown>>) ?? []
      for (const item of items) {
        const componentId = String(item.componentId)
        const pageIndex = findComponentPageIndex(componentId)
        if (pageIndex === null) continue

        patchPageLayout(pageIndex, (page) =>
          page.map((layout) => {
            if (layout.id !== componentId) return layout
            const next = { ...layout }
            const keepRatio = Boolean(item.keepAspectRatio)
            if (keepRatio && typeof item.width === 'number') {
              const ratio = layout.height / layout.width
              next.width = item.width
              next.height = Math.round(item.width * ratio)
            } else if (keepRatio && typeof item.height === 'number') {
              const ratio = layout.width / layout.height
              next.height = item.height
              next.width = Math.round(item.height * ratio)
            } else {
              if (typeof item.width === 'number') next.width = item.width
              if (typeof item.height === 'number') next.height = item.height
            }
            return next
          }),
        )
      }
      return ok({ resized: items.length })
    }

    case 'bi_align_components':
      alignLayouts(
        (input.componentIds as string[]) ?? [],
        input.alignment as 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle',
        input.referenceComponentId ? String(input.referenceComponentId) : undefined,
      )
      return ok({ aligned: true })

    case 'bi_distribute_components':
      distributeLayouts(
        (input.componentIds as string[]) ?? [],
        input.direction as 'horizontal' | 'vertical',
      )
      return ok({ distributed: true })

    case 'bi_adjust_component_margin':
      applyMarginBetween(
        (input.componentIds as string[]) ?? [],
        Number(input.margin ?? 0),
        (input.direction as 'horizontal' | 'vertical') ?? 'horizontal',
      )
      return ok({ adjusted: true })

    case 'bi_set_component_visible': {
      const items = (input.items as Array<{ componentId: string; visible: boolean }>) ?? []

      for (const item of items) {
        const pageIndex = findComponentPageIndex(item.componentId)
        if (pageIndex === null) continue

        const hidden = new Set(getDashboardState().hiddenCardIdsByPage[pageIndex] ?? [])
        if (item.visible) {
          hidden.delete(item.componentId)
        } else {
          hidden.add(item.componentId)
        }

        useDashboardStore.getState().setPageHiddenCardIds(pageIndex, [...hidden])
      }

      return ok({ updated: items.length })
    }

    case 'bi_adjust_component_z_index': {
      const items = (input.items as Array<{ componentId: string; action: string }>) ?? []
      for (const item of items) {
        adjustZIndex(item.componentId, item.action)
      }
      return ok({ updated: items.length })
    }

    case 'bi_layout_grid_arrange':
      gridArrangeLayouts(
        (input.componentIds as string[]) ?? [],
        Number(input.rows ?? 1),
        Number(input.columns ?? 1),
        Number(input.gapX ?? 16),
        Number(input.gapY ?? 16),
        Number(input.marginX ?? 0),
        Number(input.marginY ?? 0),
        typeof input.startX === 'number' ? input.startX : undefined,
        typeof input.startY === 'number' ? input.startY : undefined,
      )
      return ok({ arranged: true })

    case 'createPage': {
      useDashboardStore.getState().addPage()
      const state = getDashboardState()
      const pageIndex = state.pageList.length - 1
      if (input.name) {
        useDashboardStore.getState().setPageName(pageIndex, String(input.name))
      }
      return ok({ pageIndex, name: state.pageNames[pageIndex] })
    }

    case 'switchPage':
      useDashboardStore.getState().setCurrentPageIndex(Number(input.pageIndex))
      return ok({ currentPageIndex: getDashboardState().currentPageIndex })

    case 'renamePage':
      useDashboardStore.getState().setPageName(Number(input.pageIndex), String(input.name))
      return ok({
        pageIndex: Number(input.pageIndex),
        name: getDashboardState().pageNames[Number(input.pageIndex)],
      })

    default:
      throw new Error(`Unknown canvas tool: ${toolName}`)
  }
}
