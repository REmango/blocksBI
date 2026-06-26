import { getWidgetBackgroundConfig } from '../common/config'
import { CARD_KEYS, COMPONENT_NAME } from '../constants'

const config = {
  siderConfig: {
    key: CARD_KEYS.PROGRESS,
    name: '进度条',
    groupName: '常用组件',
    icon: 'icon-biaoge',
    description: '进度条',
    componentName: 'progress',
  },

  styleConfig: [
    ...getWidgetBackgroundConfig(),
    {
      key: 'percent',
      label: '进度百分比',
      groupName: '进度条',
      componentName: COMPONENT_NAME.INPUT_NUMBER,
      col: 12,
      layout: 'vertical',
      defaultValue: 60,
    },
    {
      key: 'type',
      label: '类型',
      groupName: '进度条',
      componentName: COMPONENT_NAME.SELECT,
      col: 12,
      layout: 'vertical',
      defaultValue: 'line',
      options: [
        { label: '线形', value: 'line' },
        { label: '圆形', value: 'circle' },
        { label: '仪表盘', value: 'dashboard' },
      ],
    },
    {
      key: 'status',
      label: '状态',
      groupName: '进度条',
      componentName: COMPONENT_NAME.SELECT,
      col: 12,
      layout: 'vertical',
      defaultValue: 'normal',
      options: [
        { label: '正常', value: 'normal' },
        { label: '进行中', value: 'active' },
        { label: '成功', value: 'success' },
        { label: '异常', value: 'exception' },
      ],
    },
    {
      key: 'strokeColor',
      label: '进度条颜色',
      groupName: '进度条',
      componentName: COMPONENT_NAME.COLOR_PICKER,
      col: 12,
      layout: 'vertical',
      defaultValue: '#1677ff',
    },
    {
      key: 'showInfo',
      label: '显示进度数值',
      groupName: '进度条',
      componentName: COMPONENT_NAME.SWITCH,
      col: 12,
      layout: 'horizontal',
      defaultValue: true,
    },
  ],

  dataConfig: {},

  eventConfig: {},
}

export default config
