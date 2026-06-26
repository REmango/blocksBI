import { getWidgetBackgroundConfig } from '../common/config'
import { CARD_KEYS, COMPONENT_NAME } from '../constants'

const config = {
  siderConfig: {
    key: CARD_KEYS.TAG,
    name: '标签',
    groupName: '常用组件',
    icon: 'icon-biaoge',
    description: '标签',
    componentName: 'tag',
  },

  styleConfig: [
    ...getWidgetBackgroundConfig(),
    {
      key: 'text',
      label: '标签文本',
      groupName: '标签',
      componentName: COMPONENT_NAME.INPUT,
      col: 24,
      layout: 'vertical',
      defaultValue: '标签',
    },
    {
      key: 'color',
      label: '标签颜色',
      groupName: '标签',
      componentName: COMPONENT_NAME.COLOR_PICKER,
      col: 12,
      layout: 'vertical',
      defaultValue: '#1677ff',
    },
    {
      key: 'bordered',
      label: '显示边框',
      groupName: '标签',
      componentName: COMPONENT_NAME.SWITCH,
      col: 12,
      layout: 'horizontal',
      defaultValue: true,
    },
    {
      key: 'closable',
      label: '可关闭',
      groupName: '标签',
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
