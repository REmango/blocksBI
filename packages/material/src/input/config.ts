import { getWidgetBackgroundConfig } from '../common/config'
import { CARD_KEYS, COMPONENT_NAME } from '../constants'

const config = {
  siderConfig: {
    key: CARD_KEYS.INPUT,
    name: '输入框',
    groupName: '常用组件',
    icon: 'icon-biaoge',
    description: '输入框',
    componentName: 'input',
  },

  styleConfig: [
    ...getWidgetBackgroundConfig(),
    {
      key: 'placeholder',
      label: '占位文本',
      groupName: '输入框',
      componentName: COMPONENT_NAME.INPUT,
      col: 24,
      layout: 'vertical',
      defaultValue: '请输入',
    },
    {
      key: 'defaultValue',
      label: '默认值',
      groupName: '输入框',
      componentName: COMPONENT_NAME.INPUT,
      col: 24,
      layout: 'vertical',
      defaultValue: '',
    },
    {
      key: 'size',
      label: '尺寸',
      groupName: '输入框',
      componentName: COMPONENT_NAME.SELECT,
      col: 24,
      layout: 'vertical',
      defaultValue: 'middle',
      options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ],
    },
    {
      key: 'disabled',
      label: '禁用',
      groupName: '输入框',
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
