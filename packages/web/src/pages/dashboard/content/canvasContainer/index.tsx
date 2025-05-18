import { useRef, memo } from 'react'
import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'
import { CANVAS_PARENT_ID } from '@/pages/dashboard/constants'
import useIconDrag from '@/pages/dashboard/hook/useIconDrag'

import useDashboardStore from '@/store/useDashboardStore'

import CardView from './cardView'

// dndKit

const Content = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  useIconDrag(canvasRef)
  const canvasWidth = useDashboardStore((state) => state.canvasWidth)
  const canvasHeight = useDashboardStore((state) => state.canvasHeight)
  const pageList = useDashboardStore((state) => state.pageList)
  const currentPageIndex = useDashboardStore((state) => state.currentPageIndex)
  const currentPage = pageList[currentPageIndex]
  const cardMap = useDashboardStore((state) => state.cardMap)

  return (
    <DragCanvas
      width={canvasWidth}
      height={canvasHeight}
      canvasParentId={CANVAS_PARENT_ID}
      className="mx-auto"
      canvasRef={canvasRef}
    >
      {currentPage.map((item) => (
        <CardView
          key={item.id}
          id={item.id}
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
          cardConfig={cardMap[item.id]}
        />
      ))}
    </DragCanvas>
  )
}

export default memo(Content)
