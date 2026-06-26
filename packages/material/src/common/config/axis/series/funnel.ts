import { IChartConfig } from '../../../../types/chart'
import { COMPONENT_NAME } from '../../../../constants'

const FUNNEL_SERIES_GROUP_NAME = '漏斗配置'

const defaultItems: IChartConfig[] = [
  {
    key: 'series.sort',
    groupName: FUNNEL_SERIES_GROUP_NAME,
    label: '排序方式',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'descending',
    options: [
      { label: '降序', value: 'descending' },
      { label: '升序', value: 'ascending' },
      { label: '不排序', value: 'none' },
    ],
  },
  {
    key: 'series.gap',
    groupName: FUNNEL_SERIES_GROUP_NAME,
    label: '层间距',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 2,
  },
  {
    key: 'series.minSize',
    groupName: FUNNEL_SERIES_GROUP_NAME,
    label: '最小宽度',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '0%',
  },
  {
    key: 'series.maxSize',
    groupName: FUNNEL_SERIES_GROUP_NAME,
    label: '最大宽度',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '100%',
  },
  {
    key: 'series.label.show',
    groupName: FUNNEL_SERIES_GROUP_NAME,
    label: '显示标签',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'series.label.position',
    groupName: FUNNEL_SERIES_GROUP_NAME,
    label: '标签位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 24,
    layout: 'horizontal',
    defaultValue: 'inside',
    options: [
      { label: '内部', value: 'inside' },
      { label: '左侧', value: 'left' },
      { label: '右侧', value: 'right' },
      { label: '外部', value: 'outside' },
    ],
  },
]

export default defaultItems
