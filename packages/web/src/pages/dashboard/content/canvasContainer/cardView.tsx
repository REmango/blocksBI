import { FC, memo } from 'react'
import { DraggableItem } from '@block-bi/drag-canvas'
import { componentMap } from '@block-bi/material'
import { CardItem } from '@/types/dashboard'

interface CardViewProps {
  id: string
  x: number
  y: number
  width: number
  height: number
  cardConfig: CardItem<any>
}

const CardView: FC<CardViewProps> = (props) => {
  const { id, x, y, width, height, cardConfig } = props

  const componentName = cardConfig.componentName
  const CurrentComponent = componentMap[componentName as keyof typeof componentMap]

  return (
    <DraggableItem
      key={id}
      id={id}
      initialPosition={{ x, y }}
      minWidth={100}
      minHeight={100}
      initialSize={{
        width,
        height,
      }}
    >
      <div className="card-view flex h-full flex-col overflow-hidden rounded-md bg-white shadow-[0_1px_6px_rgba(15,23,42,0.08)]">
        <div className="card-view-header flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <span className="h-3.5 w-1 shrink-0 rounded-full bg-[#ef7541]" />
          <span className="truncate text-[13px] font-medium leading-none text-slate-700">{cardConfig.name}</span>
        </div>
        <div className="card-view-body relative min-h-0 flex-1 p-2">
          <CurrentComponent
            option={{
              xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  data: [150, 230, 224, 218, 135, 147, 260],
                  type: 'line',
                },
              ],
            }}
          />
        </div>
      </div>
    </DraggableItem>
  )
}

export default memo(CardView)
