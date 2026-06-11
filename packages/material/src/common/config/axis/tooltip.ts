import { IChartConfig } from '../../../types/chart'
import { COMPONENT_NAME } from '../../../constants'

const AXIS_TOOLTIP_GROUP_NAME = '坐标轴提示框'

const defaultItems: IChartConfig[] = [
  {
    key: 'tooltip.show',
    groupName: AXIS_TOOLTIP_GROUP_NAME,
    label: '是否显示',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'tooltip.order',
    groupName: AXIS_TOOLTIP_GROUP_NAME,
    label: '排序',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'seriesAsc',
    options: [
      { label: '系列升序', value: 'seriesAsc' },
      { label: '系列降序', value: 'seriesDesc' },
      { label: '数据升序', value: 'valueAsc' },
      { label: '数据降序', value: 'valueDesc' },
    ],
  },
]

export default defaultItems
