import { FC, memo, useMemo } from 'react'
import { componentMap, getInitConfig, isWidgetComponentName, resolveWidgetBackgroundColor } from '@block-bi/material'

import { CardItem } from '@/types/dashboard'

interface WidgetContentProps {
  id: string
  width?: number
  height?: number
  cardConfig: CardItem<any>
  onSelect: (id: string) => void
}

const WidgetContent: FC<WidgetContentProps> = ({ id, width, height, cardConfig, onSelect }) => {
  const isFixedSize = width != null && height != null
  const componentName = cardConfig.componentName

  if (!isWidgetComponentName(componentName)) return null

  const CurrentComponent = componentMap[componentName]
  const widgetConfig = useMemo(
    () => getInitConfig(cardConfig.props?.styleConfig ?? []),
    [cardConfig.props?.styleConfig],
  )

  const backgroundColor = resolveWidgetBackgroundColor(widgetConfig)

  return (
    <div
      className={`widget-view flex items-center overflow-hidden${isFixedSize ? '' : ' h-full w-full'}`}
      style={{
        ...(isFixedSize ? { width, height } : {}),
        backgroundColor,
      }}
      onMouseDown={() => onSelect(id)}
    >
      <div className="min-h-0 w-full">
        <CurrentComponent config={widgetConfig} />
      </div>
    </div>
  )
}

export default memo(WidgetContent)
