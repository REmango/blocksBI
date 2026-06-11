import { IChartConfig } from '../../../types/chart'
import { COMPONENT_NAME } from '../../../constants'

const AXIS_STYLE_GROUP_NAME = '坐标轴样式'

const defaultItems: IChartConfig[] = [
  {
    key: 'xAxis.axisLabel.show',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: '显示X轴坐标',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'xAxis.splitLine.show',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: '显示X轴刻度',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'xAxis.nameLocation',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: 'X轴名称位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'start',
    options: [
      { label: '开始', value: 'start' },
      { label: '中间', value: 'center' },
      { label: '结束', value: 'end' },
    ],
  },
  {
    key: 'xAxis.nameRotate',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: 'X轴旋转角度',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 24,
    layout: 'horizontal',
    defaultValue: 0,
  },

  // y 轴样式
  {
    key: 'yAxis.axisLabel.show',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: '显示Y轴坐标',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'yAxis.splitLine.show',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: '显示Y轴刻度',
    componentName: COMPONENT_NAME.SWITCH,
    col: 12,
    layout: 'horizontal',
    defaultValue: true,
  },
  {
    key: 'yAxis.nameLocation',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: 'Y轴名称位置',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'start',
    options: [
      { label: '开始', value: 'start' },
      { label: '中间', value: 'center' },
      { label: '结束', value: 'end' },
    ],
  },
  {
    key: 'yAxis.nameRotate',
    groupName: AXIS_STYLE_GROUP_NAME,
    label: 'Y轴旋转角度',
    componentName: COMPONENT_NAME.INPUT_NUMBER,
    col: 24,
    layout: 'horizontal',
    defaultValue: 0,
  },
]

export default defaultItems
