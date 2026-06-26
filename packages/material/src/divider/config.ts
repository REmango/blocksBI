import { getWidgetBackgroundConfig } from '../common/config'
import { CARD_KEYS, COMPONENT_NAME } from '../constants'

const config = {
  siderConfig: {
    key: CARD_KEYS.DIVIDER,
    name: '标题',
    groupName: '常用组件',
    icon: 'icon-biaoge',
    description: '标题分割线',
    componentName: 'divider',
  },

  styleConfig: [
    ...getWidgetBackgroundConfig(),
    {
      key: 'children',
      label: '标题文本',
      groupName: '标题',
      componentName: COMPONENT_NAME.INPUT,
      col: 24,
      layout: 'vertical',
      defaultValue: '标题',
    },
    {
      key: 'titleColor',
      label: '标题颜色',
      groupName: '标题',
      componentName: COMPONENT_NAME.COLOR_PICKER,
      col: 12,
      layout: 'vertical',
      defaultValue: '#1677ff',
    },
    {
      key: 'lineColor',
      label: '分割线颜色',
      groupName: '标题',
      componentName: COMPONENT_NAME.COLOR_PICKER,
      col: 12,
      layout: 'vertical',
      defaultValue: '#1677ff',
    },
    {
      key: 'titlePlacement',
      label: '标题位置',
      groupName: '标题',
      componentName: COMPONENT_NAME.SELECT,
      col: 24,
      layout: 'vertical',
      defaultValue: 'start',
      options: [
        { label: '起始', value: 'start' },
        { label: '居中', value: 'center' },
        { label: '末尾', value: 'end' },
      ],
    },
    {
      key: 'dashed',
      label: '虚线',
      groupName: '标题',
      componentName: COMPONENT_NAME.SWITCH,
      col: 12,
      layout: 'horizontal',
      defaultValue: false,
    },
    {
      key: 'plain',
      label: '正文样式',
      groupName: '标题',
      componentName: COMPONENT_NAME.SWITCH,
      col: 12,
      layout: 'horizontal',
      defaultValue: false,
    },
  ],

  dataConfig: {},

  eventConfig: {},
}

export default config
