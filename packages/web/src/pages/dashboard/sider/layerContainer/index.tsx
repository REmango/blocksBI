import { useMemo, useState } from 'react'

import useDashboardStore from '@/store/useDashboardStore'
import { CardLayout } from '@/types/dashboard'

import LayerItem from './layerItem'

const moveItem = <T,>(list: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...list]
  const [item] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, item)
  return result
}

const LayerContainer = () => {
  const pageList = useDashboardStore((state) => state.pageList)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const cardMap = useDashboardStore((state) => state.cardMap)
  const currentEditingCardId = useDashboardStore((state) => state.currentEditingCardId)
  const setCurrentPageLayout = useDashboardStore((state) => state.setCurrentPageLayout)
  const setCurrentEditingCardId = useDashboardStore((state) => state.setCurrentEditingCardId)

  // 列表顶部为上层（画布中后渲染、叠放更靠前）
  const layers = useMemo(
    () => [...(pageList[currentPageIndex] ?? [])].reverse(),
    [pageList, currentPageIndex],
  )

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const handleReorder = (activeId: string, overId: string) => {
    if (activeId === overId) return

    const oldIndex = layers.findIndex((item) => item.id === activeId)
    const newIndex = layers.findIndex((item) => item.id === overId)
    if (oldIndex < 0 || newIndex < 0) return

    const newLayers = moveItem(layers, oldIndex, newIndex)
    const newPage: CardLayout[] = [...newLayers].reverse()
    setCurrentPageLayout(newPage)
  }

  const handleDragStart = (id: string) => {
    setDraggingId(id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggingId && draggingId !== id) {
      setOverId(id)
    }
  }

  const handleDrop = (id: string) => {
    if (draggingId) {
      handleReorder(draggingId, id)
    }
    setDraggingId(null)
    setOverId(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setOverId(null)
  }

  if (layers.length === 0) {
    return (
      <div className="layer-container px-3 py-6 text-center text-xs text-slate-500">当前画布暂无图表</div>
    )
  }

  return (
    <div className="layer-container px-2 py-2">
      <div className="mb-2 px-1 text-[10px] text-slate-500">拖拽调整叠放顺序，顶部为上层</div>
      <ul className="flex flex-col gap-1">
        {layers.map((item) => {
          const card = cardMap[item.id]
          if (!card) return null

          return (
            <LayerItem
              key={item.id}
              name={card.name}
              icon={card.props?.siderConfig?.icon}
              isActive={currentEditingCardId === item.id}
              isDragging={draggingId === item.id}
              isOver={overId === item.id}
              onSelect={() => setCurrentEditingCardId(item.id)}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={handleDragEnd}
            />
          )
        })}
      </ul>
    </div>
  )
}

export default LayerContainer
