import { useEffect, useRef, memo } from 'react'
import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'

import { CANVAS_PARENT_ID } from '@/pages/dashboard/constants'
import useIconDrag from '@/pages/dashboard/hook/useIconDrag'
import useDashboardStore from '@/store/useDashboardStore'

import CardContent from './cardContent'

const PcCanvasContainer = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  useIconDrag(canvasRef)
  const setCurrentEditingCardId = useDashboardStore((state) => state.setCurrentEditingCardId)
  const canvasWidth = useDashboardStore((state) => state.canvasWidth)
  const canvasHeight = useDashboardStore((state) => state.canvasHeight)
  const pageList = useDashboardStore((state) => state.pageList)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const currentPage = pageList[currentPageIndex]
  const cardMap = useDashboardStore((state) => state.cardMap)
  const hiddenCardIdsByPage = useDashboardStore((state) => state.hiddenCardIdsByPage)
  const hiddenCardIds = hiddenCardIdsByPage[currentPageIndex] ?? []

  const visiblePageCards = currentPage.filter((item) => !hiddenCardIds.includes(item.id))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleCanvasMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('drag-canvas-selection')) {
        setCurrentEditingCardId('')
      }
    }

    canvas.addEventListener('mousedown', handleCanvasMouseDown, true)
    return () => canvas.removeEventListener('mousedown', handleCanvasMouseDown, true)
  }, [setCurrentEditingCardId])

  return (
    <DragCanvas
      width={canvasWidth}
      height={canvasHeight}
      canvasParentId={CANVAS_PARENT_ID}
      className="mx-auto"
      canvasRef={canvasRef}
    >
      {visiblePageCards.map((item) => (
        <DraggableItem
          key={item.id}
          id={item.id}
          initialPosition={{ x: item.x, y: item.y }}
          minWidth={100}
          minHeight={100}
          initialSize={{
            width: item.width,
            height: item.height,
          }}
        >
          <CardContent
            id={item.id}
            width={item.width}
            height={item.height}
            cardConfig={cardMap[item.id]}
            onSelect={setCurrentEditingCardId}
          />
        </DraggableItem>
      ))}
    </DragCanvas>
  )
}

export default memo(PcCanvasContainer)
