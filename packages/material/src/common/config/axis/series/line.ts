import { IChartConfig } from '../../../../types/chart'
import { COMPONENT_NAME } from '../../../../constants'

const AXIS_SERIES_GROUP_NAME = '节点配置'

const defaultItems: IChartConfig[] = [
  {
    key: 'series.smooth ',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '是否平滑',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'series.symbol',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '节点形状',
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
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '节点大小',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 10,
  },

  {
    key: 'series.label.show',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '是否显示节点标签',
    componentName: COMPONENT_NAME.SWITCH,
    col: 24,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'series.label.position',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '节点标签位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 24,
    layout: 'horizontal',
    defaultValue: 'top',
    options: [
      { label: '顶部', value: 'top' },
      { label: '底部', value: 'bottom' },
      { label: '左侧', value: 'left' },
      { label: '右侧', value: 'right' },
    ],
  },
  {
    key: 'series.label.distance',
    groupName: AXIS_SERIES_GROUP_NAME,
    label: '节点标签距离',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 24,
    layout: 'horizontal',
    defaultValue: 10,
  },
]

export default defaultItems
