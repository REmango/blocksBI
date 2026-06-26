import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

import { CANVAS_PARENT_ID } from '../constants'
import {
  LAYOUT_CANVAS_DROPPABLE_ID,
  LAYOUT_CONTAINER_MAP,
  LayoutContainerKey,
} from '../constants/layoutContainer'
import useDashboardStore from '@/store/useDashboardStore'

import LayoutIcon from '../sider/layoutContainer/LayoutIcon'

interface LayoutDragProviderProps {
  children: React.ReactNode
}

const LayoutDragProvider = ({ children }: LayoutDragProviderProps) => {
  const addLayoutContainer = useDashboardStore((state) => state.addLayoutContainer)
  const [activeLayoutKey, setActiveLayoutKey] = useState<LayoutContainerKey | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const layoutKey = event.active.data.current?.layoutKey as LayoutContainerKey | undefined
    if (layoutKey) {
      setActiveLayoutKey(layoutKey)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLayoutKey(null)

    const { active, over } = event
    if (over?.id !== LAYOUT_CANVAS_DROPPABLE_ID) return

    const layoutKey = active.data.current?.layoutKey as LayoutContainerKey | undefined
    if (!layoutKey) return

    const canvasEl = document.querySelector('[data-pc-drag-canvas]') as HTMLElement | null
    const scrollEl = document.getElementById(CANVAS_PARENT_ID)
    if (!canvasEl || !scrollEl) return

    const canvasRect = canvasEl.getBoundingClientRect()
    const scrollTop = scrollEl.scrollTop
    const translated = active.rect.current.translated
    if (!translated) return

    const y = Math.round(translated.top - canvasRect.top + scrollTop)
    addLayoutContainer(layoutKey, { x: 0, y })
  }

  const activeMeta = activeLayoutKey ? LAYOUT_CONTAINER_MAP[activeLayoutKey] : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeMeta ? (
          <div className="rounded border border-dashed border-orange-400 bg-[#181a1b] px-3 py-2 text-orange-400 shadow-lg">
            <div className="mb-2 text-[10px]">{activeMeta.label}</div>
            <LayoutIcon columns={activeMeta.columns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default LayoutDragProvider
