import { IChartConfig } from '../../../../types/chart'
import { COMPONENT_NAME } from '../../../../constants'

const AXIS_SERIES_GROUP_NAME = '柱体配置'

const defaultItems: IChartConfig[] = [
  {
    key: 'series.barWidth',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '柱宽',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '60%',
  },
  {
    key: 'series.barMaxWidth',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '最大柱宽',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 48,
  },
  {
    key: 'series.label.show',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '是否显示柱体标签',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'series.label.position',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '柱体标签位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 24,
    layout: 'horizontal',
    defaultValue: 'top',
    options: [
      { label: '顶部', value: 'top' },
      { label: '底部', value: 'bottom' },
      { label: '内部', value: 'inside' },
      { label: '内部顶部', value: 'insideTop' },
    ],
  },
]

export default defaultItems
