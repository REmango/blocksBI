import { IChartConfig } from '../../../types/chart'
import { COMPONENT_NAME } from '../../../constants'

const AXIS_LEGEND_GROUP_NAME = '坐标轴图例'

const defaultItems: IChartConfig[] = [
  {
    key: 'legend.show',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '是否显示图例',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'legend.orient',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'horizontal',
    options: [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ],
  },
  {
    key: 'legend.itemWidth',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '宽度',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 25,
  },
  {
    key: 'legend.itemHeight',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '图例项高度',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 10,
  },
  {
    key: 'legend.left',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '左侧距离',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'auto',
  },
  {
    key: 'legend.top',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '顶部距离',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'auto',
  },
  {
    key: 'legend.right',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '右侧距离',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'auto',
  },
  {
    key: 'legend.bottom',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '底部距离',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'auto',
  },
  {
    key: 'legend.itemGap',
    groupName: AXIS_LEGEND_GROUP_NAME,
    label: '间距',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 12,
    layout: 'horizontal',
    defaultValue: 10,
  },
]

export default defaultItems
