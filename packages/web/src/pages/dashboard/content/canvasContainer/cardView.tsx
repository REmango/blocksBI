import { useRef, FC, memo } from 'react'
import DragCanvas, { DraggableItem } from '@block-bi/drag-canvas'
import { componentMap } from '@block-bi/material'
import { CardItem } from '@/types/dashboard'
import { getInitConfig } from '@block-bi/material'

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

  console.log('cardConfig', cardConfig)
  const initConfig = getInitConfig(cardConfig.props.styleConfig)
  console.log('initConfig', initConfig)

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
    </DraggableItem>
  )
}

export default memo(CardView)
