import { FC, memo, useMemo } from 'react'
import { buildChartOption, componentMap } from '@block-bi/material'

import { CardItem } from '@/types/dashboard'

interface CardContentProps {
  id: string
  width: number
  height: number
  cardConfig: CardItem<any>
  onSelect: (id: string) => void
}

const CardContent: FC<CardContentProps> = ({ id, width, height, cardConfig, onSelect }) => {
  const componentName = cardConfig.componentName
  const CurrentComponent = componentMap[componentName as keyof typeof componentMap]

  const chartOption = useMemo(
    () => buildChartOption(cardConfig.key, cardConfig.props?.styleConfig, cardConfig.props?.dataConfig),
    [cardConfig.key, cardConfig.props?.styleConfig, cardConfig.props?.dataConfig],
  )

  return (
    <div
      className="card-view flex flex-col overflow-hidden rounded-md bg-white shadow-[0_1px_6px_rgba(15,23,42,0.08)]"
      style={{ width, height }}
      onMouseDown={() => onSelect(id)}
    >
      {(cardConfig.showCardTitle ?? true) && (
        <div className="card-view-header flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <span className="h-3.5 w-1 shrink-0 rounded-full bg-[#ef7541]" />
          <span className="truncate text-[13px] font-medium leading-none text-slate-700">{cardConfig.name}</span>
        </div>
      )}
      <div className="card-view-body relative min-h-0 flex-1 p-2">
        <CurrentComponent option={chartOption} />
      </div>
    </div>
  )
}

export default memo(CardContent)
