import { IChartConfig } from '../../../../types/chart'
import { COMPONENT_NAME } from '../../../../constants'

const SCATTER_SERIES_GROUP_NAME = '散点配置'

const defaultItems: IChartConfig[] = [
  {
    key: 'series.symbol',
    groupName: SCATTER_SERIES_GROUP_NAME,
    label: '散点形状',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'circle',
    options: [
      { label: '圆形', value: 'circle' },
      { label: '矩形', value: 'rect' },
      { label: '菱形', value: 'diamond' },
      { label: '三角形', value: 'triangle' },
    ],
  },
  {
    key: 'series.symbolSize',
    groupName: SCATTER_SERIES_GROUP_NAME,
    label: '散点大小',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 12,
  },
  {
    key: 'series.label.show',
    groupName: SCATTER_SERIES_GROUP_NAME,
    label: '是否显示标签',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: false,
  },
]

export default defaultItems
