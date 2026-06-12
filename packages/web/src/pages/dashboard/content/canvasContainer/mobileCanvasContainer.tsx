import { memo, useMemo } from 'react'

import {
  CHART_COMPONENT_NAME,
  MOBILE_CANVAS_PADDING_X,
  MOBILE_CANVAS_PADDING_Y,
  MOBILE_CARD_GAP,
} from '@/pages/dashboard/constants'
import useDashboardStore from '@/store/useDashboardStore'

import CardContent from './cardContent'

const isChartCard = (componentName?: string) => componentName === CHART_COMPONENT_NAME

const MobileCanvasContainer = () => {
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
  const contentWidth = canvasWidth - MOBILE_CANVAS_PADDING_X * 2

  const contentHeight = useMemo(() => {
    if (visiblePageCards.length === 0) return 0
    const cardsHeight = visiblePageCards.reduce((sum, item) => sum + item.height, 0)
    const gaps = (visiblePageCards.length - 1) * MOBILE_CARD_GAP
    return cardsHeight + gaps
  }, [visiblePageCards])

  const containerMinHeight = Math.max(
    canvasHeight,
    contentHeight + MOBILE_CANVAS_PADDING_Y * 2,
  )

  const handleCanvasMouseDown = () => {
    setCurrentEditingCardId('')
  }

  return (
    <div
      className="mobile-canvas-container mx-auto box-border bg-slate-100"
      style={{
        width: canvasWidth,
        minHeight: containerMinHeight,
        paddingTop: MOBILE_CANVAS_PADDING_Y,
        paddingBottom: MOBILE_CANVAS_PADDING_Y,
        paddingLeft: MOBILE_CANVAS_PADDING_X,
        paddingRight: MOBILE_CANVAS_PADDING_X,
      }}
      onMouseDown={handleCanvasMouseDown}
    >
      <div className="mobile-canvas flex flex-col" style={{ gap: MOBILE_CARD_GAP }}>
        {visiblePageCards.map((item) => {
          const cardConfig = cardMap[item.id]
          const isChart = isChartCard(cardConfig?.componentName)
          const cardWidth = isChart ? contentWidth : item.width

          return (
            <div
              key={item.id}
              className={isChart ? 'w-full' : 'flex justify-center'}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <CardContent
                id={item.id}
                width={cardWidth}
                height={item.height}
                cardConfig={cardConfig}
                onSelect={setCurrentEditingCardId}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(MobileCanvasContainer)
