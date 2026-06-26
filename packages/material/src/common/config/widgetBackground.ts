import { IChartConfig } from '../../types/chart'
import { COMPONENT_NAME } from '../../constants'

import { updateConfig } from '../../utils'
import { cloneWidgetBackgroundConfigItems } from '../../utils/widgetBackground'

const defaultItems: IChartConfig[] = [
  {
    key: 'backgroundTransparent',
    label: '背景透明',
    groupName: '背景',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'backgroundColor',
    label: '背景颜色',
    groupName: '背景',
    componentName: COMPONENT_NAME.COLOR_PICKER,
    col: 24,
    layout: 'vertical',
    defaultValue: '#ffffff',
  },
]

export function getWidgetBackgroundConfig(config?: Record<string, any>) {
  return updateConfig(cloneWidgetBackgroundConfigItems(defaultItems), config)
}
