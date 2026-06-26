import { IChartConfig } from '../../../types/chart'
import { COMPONENT_NAME } from '../../../constants'

const AXIS_NAME_GROUP_NAME = '坐标轴名称'

const FONT_WEIGHT_OPTIONS = [
  { label: '正常', value: 'normal' },
  { label: '加粗', value: 'bold' },
  { label: '细体', value: 'lighter' },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '600', value: 600 },
  { label: '700', value: 700 },
  { label: '800', value: 800 },
  { label: '900', value: 900 },
]
const FONT_SIZE_OPTIONS = [
  { label: '12', value: 12 },
  { label: '14', value: 14 },
  { label: '16', value: 16 },
  { label: '18', value: 18 },
  { label: '20', value: 20 },
  { label: '22', value: 22 },
  { label: '24', value: 24 },
]

const defaultItems: IChartConfig[] = [
  {
    key: 'xAxis.name',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'X轴名称',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '',
  },

  {
    key: 'xAxis.nameTextStyle.color',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'X轴名称颜色',
    componentName: COMPONENT_NAME.COLOR_PICKER,
    col: 12,
    layout: 'horizontal',
    defaultValue: '#000',
  },

  {
    key: 'xAxis.nameTextStyle.fontSize',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'X轴字体大小',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 12,
    options: FONT_SIZE_OPTIONS,
  },

  {
    key: 'xAxis.nameTextStyle.fontWeight',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'X轴字体粗细',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'normal',
    options: FONT_WEIGHT_OPTIONS,
  },

  // Y轴
  {
    key: 'yAxis.name',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'Y轴名称',
    componentName: COMPONENT_NAME.INPUT,
    col: 12,
    layout: 'horizontal',
    defaultValue: '',
  },

  {
    key: 'yAxis.nameTextStyle.color',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'Y轴名称颜色',
    componentName: COMPONENT_NAME.COLOR_PICKER,
    col: 12,
    layout: 'horizontal',
    defaultValue: '#000',
  },

  {
    key: 'yAxis.nameTextStyle.fontSize',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'Y轴字体大小',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 12,
    options: FONT_SIZE_OPTIONS,
  },

  {
    key: 'yAxis.nameTextStyle.fontWeight',
    groupName: AXIS_NAME_GROUP_NAME,
    label: 'Y轴字体粗细',
    componentName: COMPONENT_NAME.SELECT,
    col: 12,
    layout: 'horizontal',
    defaultValue: 'normal',
    options: FONT_WEIGHT_OPTIONS,
  },
]

export default defaultItems
