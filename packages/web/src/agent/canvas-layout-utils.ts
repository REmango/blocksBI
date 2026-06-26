import type { CardLayout } from '@/types/dashboard'

import {
  findComponentPageIndex,
  getDashboardState,
  getLayoutOnPage,
  patchMultiplePages,
  patchPageLayout,
} from './canvas-state'

type Alignment = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle'

function cloneLayoutMap(componentIds: string[]): Map<string, { pageIndex: number; layout: CardLayout }> {
  const map = new Map<string, { pageIndex: number; layout: CardLayout }>()
  for (const id of componentIds) {
    const pageIndex = findComponentPageIndex(id)
    if (pageIndex === null) continue
    const layout = getLayoutOnPage(pageIndex, id)
    if (!layout) continue
    map.set(id, { pageIndex, layout: { ...layout } })
  }
  return map
}

function applyLayoutMap(map: Map<string, { pageIndex: number; layout: CardLayout }>): void {
  const byPage = new Map<number, Map<string, CardLayout>>()
  for (const [, entry] of map) {
    if (!byPage.has(entry.pageIndex)) byPage.set(entry.pageIndex, new Map())
    byPage.get(entry.pageIndex)!.set(entry.layout.id, entry.layout)
  }

  const updates = [...byPage.entries()].map(([pageIndex, idMap]) => {
    const page = getDashboardState().pageList[pageIndex] ?? []
    return {
      pageIndex,
      layout: page.map((item) => idMap.get(item.id) ?? item),
    }
  })

  patchMultiplePages(updates)
}

export function alignLayouts(
  componentIds: string[],
  alignment: Alignment,
  referenceComponentId?: string,
): void {
  const map = cloneLayoutMap(componentIds)
  if (map.size < 2) return

  const refEntry =
    (referenceComponentId ? map.get(referenceComponentId) : undefined) || [...map.values()][0]
  if (!refEntry) return

  for (const [id, entry] of map) {
    if (referenceComponentId && id === referenceComponentId) continue

    switch (alignment) {
      case 'left':
        entry.layout.x = refEntry.layout.x
        break
      case 'right':
        entry.layout.x = refEntry.layout.x + refEntry.layout.width - entry.layout.width
        break
      case 'top':
        entry.layout.y = refEntry.layout.y
        break
      case 'bottom':
        entry.layout.y = refEntry.layout.y + refEntry.layout.height - entry.layout.height
        break
      case 'center': {
        const refCenterX = refEntry.layout.x + refEntry.layout.width / 2
        entry.layout.x = Math.round(refCenterX - entry.layout.width / 2)
        break
      }
      case 'middle': {
        const refCenterY = refEntry.layout.y + refEntry.layout.height / 2
        entry.layout.y = Math.round(refCenterY - entry.layout.height / 2)
        break
      }
    }
  }

  applyLayoutMap(map)
}

export function distributeLayouts(componentIds: string[], direction: 'horizontal' | 'vertical'): void {
  const map = cloneLayoutMap(componentIds)
  const entries = [...map.values()].sort((a, b) =>
    direction === 'horizontal' ? a.layout.x - b.layout.x : a.layout.y - b.layout.y,
  )
  if (entries.length < 3) return

  const first = entries[0].layout
  const last = entries[entries.length - 1].layout

  if (direction === 'horizontal') {
    const totalWidth = entries.reduce((sum, e) => sum + e.layout.width, 0)
    const span = last.x + last.width - first.x - totalWidth
    const gap = span / (entries.length - 1)
    let cursor = first.x
    for (const entry of entries) {
      entry.layout.x = Math.round(cursor)
      cursor += entry.layout.width + gap
    }
  } else {
    const totalHeight = entries.reduce((sum, e) => sum + e.layout.height, 0)
    const span = last.y + last.height - first.y - totalHeight
    const gap = span / (entries.length - 1)
    let cursor = first.y
    for (const entry of entries) {
      entry.layout.y = Math.round(cursor)
      cursor += entry.layout.height + gap
    }
  }

  applyLayoutMap(map)
}

export function applyMarginBetween(
  componentIds: string[],
  margin: number,
  direction: 'horizontal' | 'vertical',
): void {
  const map = cloneLayoutMap(componentIds)
  const entries = [...map.entries()].sort(([, a], [, b]) =>
    direction === 'horizontal' ? a.layout.x - b.layout.x : a.layout.y - b.layout.y,
  )

  for (let i = 1; i < entries.length; i++) {
    const [, prev] = entries[i - 1]
    const [, curr] = entries[i]
    if (direction === 'horizontal') {
      const minX = prev.layout.x + prev.layout.width + margin
      if (curr.layout.x < minX) curr.layout.x = minX
    } else {
      const minY = prev.layout.y + prev.layout.height + margin
      if (curr.layout.y < minY) curr.layout.y = minY
    }
  }

  applyLayoutMap(map)
}

export function gridArrangeLayouts(
  componentIds: string[],
  rows: number,
  columns: number,
  gapX: number,
  gapY: number,
  marginX: number,
  marginY: number,
  startX?: number,
  startY?: number,
): void {
  void rows
  const map = cloneLayoutMap(componentIds)
  const ids = componentIds.filter((id) => map.has(id))
  if (ids.length === 0) return

  const cellWidth = Math.max(...ids.map((id) => map.get(id)!.layout.width))
  const cellHeight = Math.max(...ids.map((id) => map.get(id)!.layout.height))
  const originX = startX ?? marginX
  const originY = startY ?? marginY

  ids.forEach((id, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    const entry = map.get(id)!
    entry.layout.x = originX + col * (cellWidth + gapX)
    entry.layout.y = originY + row * (cellHeight + gapY)
  })

  applyLayoutMap(map)
}

export function adjustZIndex(componentId: string, action: string): void {
  const pageIndex = findComponentPageIndex(componentId)
  if (pageIndex === null) return

  patchPageLayout(pageIndex, (page) => {
    const index = page.findIndex((item) => item.id === componentId)
    if (index < 0) return page

    const next = [...page]

    switch (action) {
      case 'bringToFront':
        next.push(...next.splice(index, 1))
        break
      case 'sendToBack':
        next.unshift(...next.splice(index, 1))
        break
      case 'bringForward':
        if (index < next.length - 1) {
          ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
        }
        break
      case 'sendBackward':
        if (index > 0) {
          ;[next[index], next[index - 1]] = [next[index - 1], next[index]]
        }
        break
      default:
        break
    }

    return next
  })
}
