import { useCallback, useEffect, useRef, memo } from 'react'
import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'

import {
  CANVAS_PARENT_ID,
  LAYOUT_CONTAINER_COMPONENT_NAME,
} from '@/pages/dashboard/constants'
import { LAYOUT_CONTAINER_MIN_HEIGHT } from '@/pages/dashboard/constants/layoutContainer'
import useIconDrag from '@/pages/dashboard/hook/useIconDrag'
import useDashboardStore from '@/store/useDashboardStore'

import CardContainerWrapper from './CardContainerWrapper'
import CardContent from './cardContent'
import LayoutContainerView from './layoutContainerView'
import WidgetContent from './widgetContent'
import { isWidgetComponentName } from '@block-bi/material'

const PcCanvasContainer = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  useIconDrag(canvasRef)
  const setCurrentEditingCardId = useDashboardStore((state) => state.setCurrentEditingCardId)
  const updateCardLayout = useDashboardStore((state) => state.updateCardLayout)
  const canvasWidth = useDashboardStore((state) => state.canvasWidth)
  const canvasHeight = useDashboardStore((state) => state.canvasHeight)
  const pageList = useDashboardStore((state) => state.pageList)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const currentPage = pageList[currentPageIndex]
  const cardMap = useDashboardStore((state) => state.cardMap)
  const hiddenCardIdsByPage = useDashboardStore((state) => state.hiddenCardIdsByPage)
  const hiddenCardIds = hiddenCardIdsByPage[currentPageIndex] ?? []

  const visiblePageCards = currentPage.filter(
    (item) => !hiddenCardIds.includes(item.id) && cardMap[item.id],
  )

  const handleLayoutChange = useCallback(
    (cardId: string, layout: { x: number; y: number; width: number; height: number }) => {
      updateCardLayout(cardId, layout)
    },
    [updateCardLayout],
  )

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
    <div data-pc-drag-canvas className="h-full w-full">
      <DragCanvas
        width={canvasWidth}
        height={canvasHeight}
        canvasParentId={CANVAS_PARENT_ID}
        className="mx-auto"
        canvasRef={canvasRef}
      >
        {visiblePageCards.map((item) => {
          const cardConfig = cardMap[item.id]
          const isLayoutContainer = cardConfig?.componentName === LAYOUT_CONTAINER_COMPONENT_NAME
          const isWidget = isWidgetComponentName(cardConfig?.componentName)

          if (isLayoutContainer) {
            const columns = cardConfig.props?.columns ?? 3
            return (
              <DraggableItem
                key={item.id}
                id={item.id}
                initialPosition={{ x: 0, y: item.y }}
                layout={{ x: 0, y: item.y, width: canvasWidth, height: item.height }}
                minWidth={canvasWidth}
                maxWidth={canvasWidth}
                minHeight={LAYOUT_CONTAINER_MIN_HEIGHT}
                lockX={0}
                enabledHandles={['bm']}
                transparentBackground
                initialSize={{
                  width: canvasWidth,
                  height: item.height,
                }}
                notifyItemLayoutChange={(layout) => handleLayoutChange(item.id, layout)}
              >
                <LayoutContainerView
                  id={item.id}
                  columns={columns}
                  onSelect={setCurrentEditingCardId}
                />
              </DraggableItem>
            )
          }

          if (isWidget) {
            return (
              <DraggableItem
                key={item.id}
                id={item.id}
                initialPosition={{ x: item.x, y: item.y }}
                layout={{ x: item.x, y: item.y, width: item.width, height: item.height }}
                minWidth={80}
                minHeight={32}
                transparentBackground
                initialSize={{
                  width: item.width,
                  height: item.height,
                }}
                notifyItemLayoutChange={(layout) => handleLayoutChange(item.id, layout)}
              >
                <WidgetContent
                  id={item.id}
                  cardConfig={cardConfig}
                  onSelect={setCurrentEditingCardId}
                />
              </DraggableItem>
            )
          }

          return (
            <DraggableItem
              key={item.id}
              id={item.id}
              initialPosition={{ x: item.x, y: item.y }}
              layout={{ x: item.x, y: item.y, width: item.width, height: item.height }}
              minWidth={100}
              minHeight={100}
              initialSize={{
                width: item.width,
                height: item.height,
              }}
              notifyItemLayoutChange={(layout) => handleLayoutChange(item.id, layout)}
            >
              <CardContainerWrapper>
                <CardContent
                  id={item.id}
                  cardConfig={cardConfig}
                  onSelect={setCurrentEditingCardId}
                />
              </CardContainerWrapper>
            </DraggableItem>
          )
        })}
      </DragCanvas>
    </div>
  )
}

export default memo(PcCanvasContainer)
