import { IChartConfig } from '../../types/chart'
import { COMPONENT_NAME } from '../../constants'

import { updateConfig } from '../../utils'

const defaultItems: IChartConfig[] = [
  {
    key: 'title.show',
    label: '显示',
    groupName: '标题',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'title.text',
    label: '标题文本',
    groupName: '标题',
    componentName: COMPONENT_NAME.INPUT,
    col: 24,
    layout: 'vertical',
    defaultValue: '',
  },
  {
    key: 'title.textStyle.fontSize',
    label: '标题字体大小',
    groupName: '标题',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'vertical',
    defaultValue: 14,
  },
  {
    key: 'title.textStyle.color',
    label: '标题字体颜色',
    groupName: '标题',
    componentName: COMPONENT_NAME.COLOR_PICKER,
    col: 12,
    layout: 'vertical',
    defaultValue: '#08090b',
  },
  {
    key: 'title.subtext',
    label: '副标题文本',
    groupName: '标题',
    componentName: COMPONENT_NAME.INPUT,
    col: 24,
    layout: 'vertical',
    defaultValue: '',
  },
]

export function getTitleConfig(config?: Record<string, any>) {
  return updateConfig(defaultItems, config)
}
