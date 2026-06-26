import { IChartConfig } from '../../../../types/chart'
import { COMPONENT_NAME } from '../../../../constants'

const PIE_SERIES_GROUP_NAME = '扇区配置'

const defaultItems: IChartConfig[] = [
  {
    key: 'series.radius',
    groupName: PIE_SERIES_GROUP_NAME,
    label: '饼图半径',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '70%',
  },
  {
    key: 'series.roseType',
    groupName: PIE_SERIES_GROUP_NAME,
    label: '南丁格尔图',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '',
    options: [
      { label: '默认', value: '' },
      { label: '面积', value: 'area' },
      { label: '半径', value: 'radius' },
    ],
  },
  {
    key: 'series.label.show',
    groupName: PIE_SERIES_GROUP_NAME,
    label: '是否显示标签',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'series.label.position',
    groupName: PIE_SERIES_GROUP_NAME,
    label: '标签位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 24,
    layout: 'horizontal',
    defaultValue: 'outside',
    options: [
      { label: '外侧', value: 'outside' },
      { label: '内部', value: 'inside' },
      { label: '中心', value: 'center' },
    ],
  },
]

export default defaultItems
