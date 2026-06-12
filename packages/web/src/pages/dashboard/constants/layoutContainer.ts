export type LayoutContainerKey = 'three-column' | 'four-column'

export interface LayoutContainerMeta {
  key: LayoutContainerKey
  label: string
  columns: number
  defaultHeight: number
}

export const LAYOUT_CONTAINER_MAP: Record<LayoutContainerKey, LayoutContainerMeta> = {
  'three-column': {
    key: 'three-column',
    label: '三栏布局',
    columns: 3,
    defaultHeight: 240,
  },
  'four-column': {
    key: 'four-column',
    label: '四栏布局',
    columns: 4,
    defaultHeight: 240,
  },
}

export const LAYOUT_CONTAINER_MIN_HEIGHT = 120

export const LAYOUT_CANVAS_DROPPABLE_ID = 'layout-canvas-droppable'
